export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  age: number;
  bio: string;
  fightStyle: string;
  experience: 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional';
  weight: number;
  height: number;
  location: string;
  wins: number;
  losses: number;
  createdAt: Date;
  lastActive: Date;
}

export interface Match {
  id: string;
  user1Id: string;
  user2Id: string;
  user1: User;
  user2: User;
  createdAt: Date;
  status: 'pending' | 'accepted' | 'scheduled' | 'completed';
  fightDate?: Date;
  location?: string;
  result?: {
    winnerId: string;
    method: string;
    round?: number;
  };
}

export interface Swipe {
  id: string;
  swiperId: string;
  swipedUserId: string;
  liked: boolean;
  createdAt: Date;
}