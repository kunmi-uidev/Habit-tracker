import { 
  Footprints, 
  Droplets,
  Dumbbell,
  Coffee,
  BookOpen,
  Code,
  Brain,
  Bed,
  Apple,
  PenTool,
  Flame,
  Smile,
  Sparkles,
  Heart,
  DollarSign,
  Bike,
  Music,
  Activity,
  LucideIcon
} from 'lucide-react';

export const ICON_MAP: Record<string, LucideIcon> = {
  run: Footprints,
  water: Droplets,
  gym: Dumbbell,
  coffee: Coffee,
  read: BookOpen,
  code: Code,
  meditate: Brain,
  sleep: Bed,
  eat: Apple,
  journal: PenTool,
  stretch: Flame,
  smile: Smile,
  clean: Sparkles,
  heart: Heart,
  money: DollarSign,
  bike: Bike,
  music: Music,
  activity: Activity,
};

// Friendly visual labels for each icon ID
export const ICON_LABELS: Record<string, string> = {
  run: 'Run / Walk',
  water: 'Water',
  gym: 'Workout',
  coffee: 'Morning Coffee',
  read: 'Reading',
  code: 'Coding',
  meditate: 'Mindfulness',
  sleep: 'Sleep / Nap',
  eat: 'Nutrition',
  journal: 'Writing',
  stretch: 'Yoga / Stretch',
  smile: 'Gratitude',
  clean: 'Self-care',
  heart: 'Health',
  money: 'Finance',
  bike: 'Cycling',
  music: 'Music / Play',
  activity: 'Activity',
};

// Keyword registry for smart automated auto-suggestions
export const ICON_KEYWORDS: { id: string; keywords: string[] }[] = [
  {
    id: 'run',
    keywords: ['run', 'walk', 'jog', 'steps', 'cardio', 'treadmill', 'outside', 'outdoor', 'hike', 'hiking', 'gait', 'marathon', 'morning walk', 'evening walk', 'park'],
  },
  {
    id: 'water',
    keywords: ['water', 'drink', 'hydrate', 'hydration', 'fluid', 'glass', 'beverage', 'cup', 'liquid'],
  },
  {
    id: 'gym',
    keywords: ['gym', 'workout', 'lift', 'exercise', 'weight', 'dumbbell', 'fitness', 'training', 'reps', 'pushup', 'pushups', 'squat', 'squats', 'plank', 'abs', 'chest', 'legs'],
  },
  {
    id: 'coffee',
    keywords: ['coffee', 'tea', 'matcha', 'caffeine', 'cafe', 'espresso', 'brew', 'morning routine'],
  },
  {
    id: 'read',
    keywords: ['read', 'book', 'bible', 'novel', 'study', 'learn', 'course', 'exam', 'reading', 'vocab', 'pages', 'chapter', 'chapters', 'kindle', 'article', 'newsletter'],
  },
  {
    id: 'code',
    keywords: ['code', 'coding', 'program', 'developer', 'software', 'app', 'github', 'build', 'project', 'programming', 'hack', 'leet', 'javascript', 'python', 'rust', 'react'],
  },
  {
    id: 'meditate',
    keywords: ['meditate', 'meditation', 'breathe', 'breathing', 'mindful', 'mindfulness', 'zen', 'peace', 'calm', 'reflect', 'reflection', 'stillness', 'prayer', 'pray', 'silence', 'headspace'],
  },
  {
    id: 'sleep',
    keywords: ['sleep', 'nap', 'bed', 'rest', 'night', 'asleep', 'bedtime', 'insomnia', 'slumber', 'early rise'],
  },
  {
    id: 'eat',
    keywords: ['eat', 'food', 'diet', 'healthy', 'apple', 'fruit', 'lunch', 'dinner', 'breakfast', 'meal', 'calories', 'veg', 'vegetables', 'salad', 'snack', 'fasting', 'keto'],
  },
  {
    id: 'journal',
    keywords: ['write', 'journal', 'diary', 'draw', 'sketch', 'pen', 'notes', 'type', 'story', 'creative', 'paint', 'painting', 'sketching'],
  },
  {
    id: 'stretch',
    keywords: ['stretch', 'stretching', 'yoga', 'pose', 'flexibility', 'warmup', 'pilates', 'mobility', 'stiff'],
  },
  {
    id: 'smile',
    keywords: ['smile', 'gratitude', 'happy', 'mood', 'mental', 'positivity', 'kindness', 'manifest', 'affirmation', 'therapy'],
  },
  {
    id: 'clean',
    keywords: ['clean', 'brush', 'shower', 'teeth', 'floss', 'tidy', 'organize', 'vacuum', 'dust', 'sweep', 'chores', 'shower', 'skincare', 'wash', 'face', 'groom'],
  },
  {
    id: 'heart',
    keywords: ['heart', 'love', 'health', 'pulse', 'bpm', 'cardio', 'vitals', 'doctor', 'blood', 'pill', 'supplement', 'vitamin', 'vitamins'],
  },
  {
    id: 'money',
    keywords: ['save', 'spending', 'budget', 'money', 'finance', 'invest', 'dollar', 'crypto', 'stocks', 'expense', 'pay', 'cash', 'bank', 'earnings'],
  },
  {
    id: 'bike',
    keywords: ['bike', 'bicycle', 'cycle', 'cycling', 'wheel', 'ride'],
  },
  {
    id: 'music',
    keywords: ['music', 'guitar', 'piano', 'play', 'instrument', 'practice', 'sing', 'song', 'vocals', 'drums', 'audio', 'podcast', 'tune'],
  },
  {
    id: 'activity',
    keywords: ['activity', 'habit', 'task', 'todo', 'routine', 'daily', 'goal', 'review', 'check', 'make', 'do'],
  },
];

/**
 * Automatically suggests a Lucide icon ID based on matching keywords in raw user input text.
 * Performs a broad case-insensitive keyword match.
 */
export function suggestIcon(title: string): string {
  const text = title.toLowerCase().trim();
  if (!text) return 'activity';

  // Check direct full word match first
  const words = text.split(/\s+/);
  
  for (const word of words) {
    // Exact word or stem match
    const found = ICON_KEYWORDS.find(item => 
      item.keywords.some(keyword => word === keyword || word.startsWith(keyword) && keyword.length > 3)
    );
    if (found) {
      return found.id;
    }
  }

  // Fallback to substring match
  const foundSubstring = ICON_KEYWORDS.find(item => 
    item.keywords.some(keyword => text.includes(keyword))
  );

  if (foundSubstring) {
    return foundSubstring.id;
  }

  // Default fallback
  return 'activity';
}
