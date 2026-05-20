import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  onSnapshot,
  getDocs,
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: 'reminder' | 'motivation' | 'congratulations' | 'streak';
  isRead: boolean;
  createdAt: any; // Timestamp or ISO string
  userId: string;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error in notifications: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const NOTIFICATIONS_COLLECTION = (userId: string) => `users/${userId}/notifications`;

// Mock static database of motivations/reminders for the automation generator
const MOTIVATIONAL_QUOTES = [
  "In 1 year, you'll be glad you started today. Keep building!",
  "Your future self is cheering for you right now.",
  "Consistency is the secret power of super-achievers.",
  "You don't need to be perfect to make progress. Keep showing up!",
  "Great things are done by a series of small things brought together.",
  "The only bad workout or routine is the one that didn't happen.",
  "Small daily improvements over time lead to stunning results."
];

const HABIT_REMINDERS = [
  "Time of the day! Your habit targets are waiting for you.",
  "Don't lose that hard-earned streak! Spend 2 minutes to complete your habit.",
  "Ready to upgrade yourself? Check in and record your progress.",
  "Stay focused and stay consistent. You're doing incredible work."
];

export const notificationService = {
  /**
   * Request standard browser permission for push notifications.
   */
  async requestPushPermission(): Promise<'granted' | 'denied' | 'default' | 'unsupported'> {
    if (!('Notification' in window)) {
      console.warn('Push alerts are unsupported by this browser.');
      return 'unsupported';
    }
    const permission = await Notification.requestPermission();
    return permission;
  },

  /**
   * Check current push privilege status.
   */
  getPushPermissionStatus(): 'granted' | 'denied' | 'default' | 'unsupported' {
    if (!('Notification' in window)) return 'unsupported';
    return Notification.permission;
  },

  /**
   * Helper that shoots a direct system browser push notification banner.
   */
  triggerSystemPush(title: string, body: string) {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: 'https://cdn-icons-png.flaticon.com/512/3119/3119338.png'
        });
      } catch (err) {
        console.warn('Refused basic Notification constructor, triggering silent fallback:', err);
      }
    }
  },

  /**
   * Syncs real-time list of notifications from Firestore if authenticated,
   * otherwise triggers local storage stream.
   */
  subscribeToNotifications(userId: string | null, callback: (items: NotificationItem[]) => void) {
    if (!userId) {
      // Guest local storage mode client listener
      const loadLocal = () => {
        const raw = localStorage.getItem('local_notifications');
        if (raw) {
          try {
            const parsed = JSON.parse(raw) as NotificationItem[];
            // Sort by timestamp desc
            parsed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            callback(parsed);
          } catch (e) {
            callback([]);
          }
        } else {
          callback([]);
        }
      };

      // Poll or react on local actions via custom event
      window.addEventListener('local_notif_changed', loadLocal);
      loadLocal();

      return () => {
        window.removeEventListener('local_notif_changed', loadLocal);
      };
    }

    const path = NOTIFICATIONS_COLLECTION(userId);
    const q = query(collection(db, path)); // Standard get, we can sort inside our client code to prevent composite indexes requirements.
    
    return onSnapshot(q, (snapshot) => {
      const notices = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as NotificationItem[];
      
      // Sort desc by createdAt
      notices.sort((a, b) => {
        const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : new Date(a.createdAt).getTime();
        const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : new Date(b.createdAt).getTime();
        return timeB - timeA;
      });

      callback(notices);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  /**
   * High-level helper to append a notification (handling push + DB + guest mode).
   */
  async addNotification(
    userId: string | null, 
    notification: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead' | 'userId'>
  ) {
    const title = notification.title;
    const body = notification.body;

    // Trigger local OS push
    this.triggerSystemPush(title, body);

    if (userId) {
      const path = NOTIFICATIONS_COLLECTION(userId);
      try {
        await addDoc(collection(db, path), {
          ...notification,
          isRead: false,
          userId,
          createdAt: new Date().toISOString() // Using ISO string for beautiful date compatibility in simple lists
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, path);
      }
    } else {
      // Local Guest storage write
      const raw = localStorage.getItem('local_notifications');
      let arr: NotificationItem[] = [];
      if (raw) {
        try { arr = JSON.parse(raw); } catch (e) {}
      }
      const newItem: NotificationItem = {
        id: `local_not_` + Date.now() + Math.random().toString(36).substr(2, 4),
        title,
        body,
        type: notification.type,
        isRead: false,
        createdAt: new Date().toISOString(),
        userId: 'guest'
      };
      arr.unshift(newItem);
      localStorage.setItem('local_notifications', JSON.stringify(arr));
      window.dispatchEvent(new Event('local_notif_changed'));
    }
  },

  /**
   * Toggle viewed state.
   */
  async markAsRead(userId: string | null, notId: string) {
    if (userId && !notId.startsWith('local_not_')) {
      const path = `${NOTIFICATIONS_COLLECTION(userId)}/${notId}`;
      try {
        await updateDoc(doc(db, path), { isRead: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, path);
      }
    } else {
      const raw = localStorage.getItem('local_notifications');
      if (raw) {
        try {
          const arr = JSON.parse(raw) as NotificationItem[];
          const updated = arr.map(n => n.id === notId ? { ...n, isRead: true } : n);
          localStorage.setItem('local_notifications', JSON.stringify(updated));
          window.dispatchEvent(new Event('local_notif_changed'));
        } catch (e) {}
      }
    }
  },

  /**
   * Clear single alert card.
   */
  async deleteNotification(userId: string | null, notId: string) {
    if (userId && !notId.startsWith('local_not_')) {
      const path = `${NOTIFICATIONS_COLLECTION(userId)}/${notId}`;
      try {
        await deleteDoc(doc(db, path));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, path);
      }
    } else {
      const raw = localStorage.getItem('local_notifications');
      if (raw) {
        try {
          const arr = JSON.parse(raw) as NotificationItem[];
          const updated = arr.filter(n => n.id !== notId);
          localStorage.setItem('local_notifications', JSON.stringify(updated));
          window.dispatchEvent(new Event('local_notif_changed'));
        } catch (e) {}
      }
    }
  },

  /**
   * Mark all alerts read.
   */
  async markAllAsRead(userId: string | null, currentList: NotificationItem[]) {
    if (userId) {
      try {
        const unread = currentList.filter(n => !n.isRead && !n.id.startsWith('local_not_'));
        for (const not of unread) {
          const path = `${NOTIFICATIONS_COLLECTION(userId)}/${not.id}`;
          await updateDoc(doc(db, path), { isRead: true });
        }
      } catch (error) {
        console.error('Failed to mark all as read:', error);
      }
    } else {
      const raw = localStorage.getItem('local_notifications');
      if (raw) {
        try {
          const arr = JSON.parse(raw) as NotificationItem[];
          const updated = arr.map(n => ({ ...n, isRead: true }));
          localStorage.setItem('local_notifications', JSON.stringify(updated));
          window.dispatchEvent(new Event('local_notif_changed'));
        } catch (e) {}
      }
    }
  },

  /**
   * Clear entire history feed.
   */
  async clearAll(userId: string | null, currentList: NotificationItem[]) {
    if (userId) {
      try {
        const elements = currentList.filter(n => !n.id.startsWith('local_not_'));
        for (const not of elements) {
          const path = `${NOTIFICATIONS_COLLECTION(userId)}/${not.id}`;
          await deleteDoc(doc(db, path));
        }
      } catch (error) {
        console.error('Failed to clear notifications:', error);
      }
    } else {
      localStorage.setItem('local_notifications', JSON.stringify([]));
      window.dispatchEvent(new Event('local_notif_changed'));
    }
  },

  /**
   * Generates a random daily motivator context notification.
   */
  async generateMotivationalAlert(userId: string | null) {
    const idx = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    const quote = MOTIVATIONAL_QUOTES[idx];
    await this.addNotification(userId, {
      title: "Daily Motivation Dose",
      body: quote,
      type: 'motivation'
    });
  },

  /**
   * Generates a random standard reminder notification.
   */
  async generateReminderAlert(userId: string | null) {
    const idx = Math.floor(Math.random() * HABIT_REMINDERS.length);
    const msg = HABIT_REMINDERS[idx];
    await this.addNotification(userId, {
      title: "Habit Target Alert",
      body: msg,
      type: 'reminder'
    });
  }
};
