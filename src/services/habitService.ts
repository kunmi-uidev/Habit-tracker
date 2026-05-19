import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Habit } from '../types';

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
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const HABITS_COLLECTION = (userId: string) => `users/${userId}/habits`;

export const habitService = {
  subscribeToHabits(userId: string, callback: (habits: Habit[]) => void) {
    const path = HABITS_COLLECTION(userId);
    const q = query(collection(db, path));
    
    return onSnapshot(q, (snapshot) => {
      const habits = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Habit[];
      callback(habits);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  async addHabit(userId: string, habit: Omit<Habit, 'id'>) {
    const path = HABITS_COLLECTION(userId);
    try {
      const docRef = await addDoc(collection(db, path), {
        ...habit,
        userId,
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  async updateHabit(userId: string, habitId: string, updates: Partial<Habit>) {
    const path = `${HABITS_COLLECTION(userId)}/${habitId}`;
    try {
      await updateDoc(doc(db, path), {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deleteHabit(userId: string, habitId: string) {
    const path = `${HABITS_COLLECTION(userId)}/${habitId}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }
};
