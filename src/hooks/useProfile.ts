import { useState } from 'react';
import { db } from '../firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { UserProfile } from '../types';
import { handleFirestoreError, OperationType } from '../utils/firebaseError';

export const useProfileUpdate = () => {
  const { user, refreshProfile } = useAuth();
  const [updating, setUpdating] = useState(false);

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    setUpdating(true);
    const path = `user_profiles/${user.uid}`;
    try {
      const docRef = doc(db, 'user_profiles', user.uid);
      await setDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      await refreshProfile();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    } finally {
      setUpdating(false);
    }
  };

  return { updateProfile, updating };
};
