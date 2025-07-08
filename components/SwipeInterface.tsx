import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { User, Swipe } from '@/types';
import SwipeCard from './SwipeCard';
import { toast } from 'react-hot-toast';
import { Heart, X, RotateCcw } from 'lucide-react';

export default function SwipeInterface() {
  const { user } = useAuth();
  const [potentialMatches, setPotentialMatches] = useState<User[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swipedUsers, setSwipedUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      loadPotentialMatches();
      loadSwipedUsers();
    }
  }, [user]);

  const loadSwipedUsers = async () => {
    if (!user) return;

    try {
      const swipesQuery = query(
        collection(db, 'swipes'),
        where('swiperId', '==', user.id)
      );
      const swipesSnapshot = await getDocs(swipesQuery);
      const swipedUserIds = new Set(swipesSnapshot.docs.map(doc => doc.data().swipedUserId));
      setSwipedUsers(swipedUserIds);
    } catch (error) {
      console.error('Error loading swiped users:', error);
    }
  };

  const loadPotentialMatches = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const usersQuery = query(
        collection(db, 'users'),
        where('id', '!=', user.id)
      );
      
      const usersSnapshot = await getDocs(usersQuery);
      const users = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];

      // Filter out already swiped users
      const filteredUsers = users.filter(u => !swipedUsers.has(u.id));
      setPotentialMatches(filteredUsers);
    } catch (error) {
      console.error('Error loading potential matches:', error);
      toast.error('Kullanıcılar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = async (liked: boolean) => {
    if (!user || currentIndex >= potentialMatches.length) return;

    const swipedUser = potentialMatches[currentIndex];

    try {
      // Save swipe to database
      await addDoc(collection(db, 'swipes'), {
        swiperId: user.id,
        swipedUserId: swipedUser.id,
        liked,
        createdAt: new Date()
      });

      // Check if it's a match (both users liked each other)
      if (liked) {
        const reverseSwipeQuery = query(
          collection(db, 'swipes'),
          where('swiperId', '==', swipedUser.id),
          where('swipedUserId', '==', user.id),
          where('liked', '==', true)
        );
        
        const reverseSwipeSnapshot = await getDocs(reverseSwipeQuery);
        
        if (!reverseSwipeSnapshot.empty) {
          // It's a match! Create match document
          await addDoc(collection(db, 'matches'), {
            user1Id: user.id,
            user2Id: swipedUser.id,
            user1: user,
            user2: swipedUser,
            createdAt: new Date(),
            status: 'pending'
          });
          
          toast.success(`🔥 ${swipedUser.displayName} ile eşleştiniz! Dövüş zamanı!`);
        }
      }

      // Update swiped users set
      setSwipedUsers(prev => new Set([...prev, swipedUser.id]));
      
      // Move to next card
      setCurrentIndex(prev => prev + 1);
    } catch (error) {
      console.error('Error handling swipe:', error);
      toast.error('Bir hata oluştu');
    }
  };

  const handleButtonSwipe = (liked: boolean) => {
    handleSwipe(liked);
  };

  const resetSwipes = () => {
    setCurrentIndex(0);
    loadPotentialMatches();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-black">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p>Rakipler yükleniyor...</p>
        </div>
      </div>
    );
  }

  const currentUser = potentialMatches[currentIndex];
  const hasMoreCards = currentIndex < potentialMatches.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-black p-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Rakip Bul</h1>
          <p className="text-gray-300">Kaydır ve dövüş partneri bul!</p>
        </div>

        <div className="relative h-[600px] mb-6">
          {hasMoreCards ? (
            <SwipeCard
              key={currentUser.id}
              user={currentUser}
              onSwipe={handleSwipe}
            />
          ) : (
            <div className="absolute inset-0 bg-gray-900 rounded-2xl flex items-center justify-center text-white text-center p-8">
              <div>
                <h3 className="text-2xl font-bold mb-4">Tüm rakipleri gördün!</h3>
                <p className="text-gray-400 mb-6">Yeni rakipler için daha sonra tekrar gel</p>
                <button
                  onClick={resetSwipes}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center mx-auto"
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Yeniden Başla
                </button>
              </div>
            </div>
          )}
        </div>

        {hasMoreCards && (
          <div className="flex justify-center space-x-6">
            <button
              onClick={() => handleButtonSwipe(false)}
              className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <button
              onClick={() => handleButtonSwipe(true)}
              className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition-colors"
            >
              <Heart className="w-8 h-8" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}