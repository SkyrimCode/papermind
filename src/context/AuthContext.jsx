import { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithPopup,
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

  useEffect(() => {
    let mounted = true;
    
    const unsubscribe = onAuthStateChanged(
      auth, 
      async (currentUser) => {
        if (!mounted) return;
        
        setUser(currentUser);
        
        if (currentUser) {
          try {
            const userDocRef = doc(db, 'users', currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
              setUserRole(userDoc.data().role);
            } else {
              const role = currentUser.email === ADMIN_EMAIL ? 'admin' : 'user';
              await setDoc(userDocRef, {
                uid: currentUser.uid,
                email: currentUser.email,
                displayName: currentUser.displayName,
                photoURL: currentUser.photoURL,
                role,
                createdAt: new Date().toISOString(),
              });
              setUserRole(role);
            }
          } catch {
            setUserRole(currentUser.email === ADMIN_EMAIL ? 'admin' : 'user');
          }
        } else {
          setUserRole(null);
        }
        
        setLoading(false);
      },
      () => {
        if (mounted) setLoading(false);
      }
    );

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [ADMIN_EMAIL]);

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    return result;
  };

  const logout = async () => {
    await signOut(auth);
  };

  const isAdmin = () => userRole === 'admin';

  const value = {
    user,
    userRole,
    loading,
    signInWithGoogle,
    logout,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
