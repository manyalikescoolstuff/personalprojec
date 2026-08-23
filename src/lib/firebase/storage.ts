import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, isFirebaseConfigured } from './config';

export interface UploadResult {
  url: string;
  storagePath: string;
}

export const uploadScreenshotAttachment = async (
  userId: string,
  file: File | Blob,
  fileName?: string
): Promise<UploadResult | null> => {
  if (!isFirebaseConfigured() || !storage || !userId) {
    return null;
  }

  const cleanName = fileName || `attachment-${Date.now()}.png`;
  const storagePath = `users/${userId}/screenshots/${Date.now()}_${cleanName}`;
  const storageRef = ref(storage, storagePath);

  const snapshot = await uploadBytes(storageRef, file, {
    contentType: file.type || 'image/png',
  });

  const url = await getDownloadURL(snapshot.ref);
  return { url, storagePath };
};

export const deleteScreenshotAttachment = async (storagePath: string): Promise<void> => {
  if (!storage || !storagePath) return;
  try {
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
  } catch (error) {
    console.warn('Failed to delete storage object:', error);
  }
};
