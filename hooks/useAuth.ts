import { useState, useEffect } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '@/lib/firebase';
import { User } from '@/types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser({ id: firebaseUser.uid, ...userDoc.data() } as User);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, userData: Partial<User> & { photoFile?: File }) => {
    const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);

    let photoURL = '';
    if (userData.photoFile) {
      const photoRef = ref(storage, `profile_photos/${firebaseUser.uid}`);
      await uploadBytes(photoRef, userData.photoFile);
      photoURL = await getDownloadURL(photoRef);
    }

    await updateProfile(firebaseUser, {
      displayName: userData.displayName,
      photoURL: photoURL || undefined
    });

    const newUser: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: userData.displayName!,
      photoURL: photoURL || '',
      age: userData.age!,
      bio: userData.bio!,
      fightStyle: userData.fightStyle!,
      experience: userData.experience!,
      weight: userData.weight!,
      height: userData.height!,
      location: userData.location!,
      wins: 0,
      losses: 0,
      createdAt: new Date(),
      lastActive: new Date()
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
    setUser(newUser);
    return firebaseUser;
  };

  const logout = () => signOut(auth);

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    
    await updateDoc(doc(db, 'users', user.id), {
      ...updates,
      lastActive: new Date()
    });
    
    setUser({ ...user, ...updates });
  };

  return {
    user,
    firebaseUser,
    loading,
    signIn,
    signUp,
    logout,
    updateUser
  };
};