import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
  DocumentData,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';
import { Task, ScheduleBlock, BrainDumpItem, UserProfile } from '@/types';

// Helper to remove undefined fields which Firestore rejects
function cleanData<T extends DocumentData>(obj: T): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = cleanData(value as DocumentData);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Tasks Service
// ---------------------------------------------------------------------------

export const subscribeToTasks = (
  userId: string,
  onUpdate: (tasks: Task[]) => void,
  onError?: (err: Error) => void
): (() => void) => {
  if (!isFirebaseConfigured() || !db || !userId) {
    return () => {};
  }

  const tasksRef = collection(db, 'users', userId, 'tasks');
  const q = query(tasksRef);

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Task[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          ...(data as Task),
          id: docSnap.id,
        });
      });
      onUpdate(items);
    },
    (err) => {
      console.warn('Firestore tasks subscription error:', err);
      if (onError) onError(err);
    }
  );
};

export const createTaskDoc = async (userId: string, task: Task): Promise<void> => {
  if (!db || !userId) return;
  const taskRef = doc(db, 'users', userId, 'tasks', task.id);
  await setDoc(taskRef, cleanData(task));
};

export const updateTaskDoc = async (
  userId: string,
  taskId: string,
  updates: Partial<Task>
): Promise<void> => {
  if (!db || !userId) return;
  const taskRef = doc(db, 'users', userId, 'tasks', taskId);
  await updateDoc(taskRef, cleanData(updates));
};

export const deleteTaskDoc = async (userId: string, taskId: string): Promise<void> => {
  if (!db || !userId) return;
  const taskRef = doc(db, 'users', userId, 'tasks', taskId);
  await deleteDoc(taskRef);
};

export const batchSetTasks = async (userId: string, tasks: Task[]): Promise<void> => {
  if (!db || !userId || tasks.length === 0) return;
  const batch = writeBatch(db);
  tasks.forEach((task) => {
    const taskRef = doc(db!, 'users', userId, 'tasks', task.id);
    batch.set(taskRef, cleanData(task));
  });
  await batch.commit();
};

// ---------------------------------------------------------------------------
// Schedule Service
// ---------------------------------------------------------------------------

export const subscribeToSchedule = (
  userId: string,
  onUpdate: (schedule: ScheduleBlock[]) => void,
  onError?: (err: Error) => void
): (() => void) => {
  if (!isFirebaseConfigured() || !db || !userId) {
    return () => {};
  }

  const scheduleRef = collection(db, 'users', userId, 'schedule');
  const q = query(scheduleRef, orderBy('startTime', 'asc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: ScheduleBlock[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          ...(data as ScheduleBlock),
          id: docSnap.id,
        });
      });
      onUpdate(items);
    },
    (err) => {
      console.warn('Firestore schedule subscription error:', err);
      if (onError) onError(err);
    }
  );
};

export const saveScheduleBlockDoc = async (
  userId: string,
  block: ScheduleBlock
): Promise<void> => {
  if (!db || !userId) return;
  const blockRef = doc(db, 'users', userId, 'schedule', block.id);
  await setDoc(blockRef, cleanData(block));
};

export const updateScheduleBlockDoc = async (
  userId: string,
  id: string,
  updates: Partial<ScheduleBlock>
): Promise<void> => {
  if (!db || !userId) return;
  const blockRef = doc(db, 'users', userId, 'schedule', id);
  await updateDoc(blockRef, cleanData(updates));
};

export const deleteScheduleBlockDoc = async (userId: string, id: string): Promise<void> => {
  if (!db || !userId) return;
  const blockRef = doc(db, 'users', userId, 'schedule', id);
  await deleteDoc(blockRef);
};

export const batchSetSchedule = async (
  userId: string,
  schedule: ScheduleBlock[]
): Promise<void> => {
  if (!db || !userId || schedule.length === 0) return;
  const batch = writeBatch(db);
  schedule.forEach((block) => {
    const blockRef = doc(db!, 'users', userId, 'schedule', block.id);
    batch.set(blockRef, cleanData(block));
  });
  await batch.commit();
};

// ---------------------------------------------------------------------------
// Brain Dump Service
// ---------------------------------------------------------------------------

export const subscribeToBrainDumps = (
  userId: string,
  onUpdate: (dumps: BrainDumpItem[]) => void,
  onError?: (err: Error) => void
): (() => void) => {
  if (!isFirebaseConfigured() || !db || !userId) {
    return () => {};
  }

  const dumpRef = collection(db, 'users', userId, 'braindumps');
  const q = query(dumpRef);

  return onSnapshot(
    q,
    (snapshot) => {
      const items: BrainDumpItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          ...(data as BrainDumpItem),
          id: docSnap.id,
        });
      });
      onUpdate(items);
    },
    (err) => {
      console.warn('Firestore braindumps subscription error:', err);
      if (onError) onError(err);
    }
  );
};

export const saveBrainDumpDoc = async (
  userId: string,
  dump: BrainDumpItem
): Promise<void> => {
  if (!db || !userId) return;
  const dumpRef = doc(db, 'users', userId, 'braindumps', dump.id);
  await setDoc(dumpRef, cleanData(dump));
};

export const updateBrainDumpDoc = async (
  userId: string,
  id: string,
  updates: Partial<BrainDumpItem>
): Promise<void> => {
  if (!db || !userId) return;
  const dumpRef = doc(db, 'users', userId, 'braindumps', id);
  await updateDoc(dumpRef, cleanData(updates));
};

export const deleteBrainDumpDoc = async (userId: string, id: string): Promise<void> => {
  if (!db || !userId) return;
  const dumpRef = doc(db, 'users', userId, 'braindumps', id);
  await deleteDoc(dumpRef);
};

export const batchSetBrainDumps = async (
  userId: string,
  dumps: BrainDumpItem[]
): Promise<void> => {
  if (!db || !userId || dumps.length === 0) return;
  const batch = writeBatch(db);
  dumps.forEach((dump) => {
    const dumpRef = doc(db!, 'users', userId, 'braindumps', dump.id);
    batch.set(dumpRef, cleanData(dump));
  });
  await batch.commit();
};

// ---------------------------------------------------------------------------
// User Profile Service
// ---------------------------------------------------------------------------

export const subscribeToProfile = (
  userId: string,
  onUpdate: (profile: UserProfile) => void,
  onError?: (err: Error) => void
): (() => void) => {
  if (!isFirebaseConfigured() || !db || !userId) {
    return () => {};
  }

  const profileRef = doc(db, 'users', userId, 'profile', 'preferences');

  return onSnapshot(
    profileRef,
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data() as UserProfile);
      }
    },
    (err) => {
      console.warn('Firestore profile subscription error:', err);
      if (onError) onError(err);
    }
  );
};

export const saveUserProfileDoc = async (
  userId: string,
  profile: Partial<UserProfile>
): Promise<void> => {
  if (!db || !userId) return;
  const profileRef = doc(db, 'users', userId, 'profile', 'preferences');
  await setDoc(profileRef, cleanData(profile), { merge: true });
};
