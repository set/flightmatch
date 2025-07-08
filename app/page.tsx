'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AuthForm from '@/components/AuthForm';
import SwipeInterface from '@/components/SwipeInterface';
import MatchesList from '@/components/MatchesList';
import Profile from '@/components/Profile';
import Navigation from '@/components/Navigation';
import { Toaster } from 'react-hot-toast';

export default function Home() {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [currentPage, setCurrentPage] = useState<'swipe' | 'matches' | 'profile'>('swipe');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-black">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <AuthForm 
          mode={authMode} 
          onToggleMode={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')} 
        />
        <Toaster position="top-center" />
      </>
    );
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'swipe':
        return <SwipeInterface />;
      case 'matches':
        return <MatchesList />;
      case 'profile':
        return <Profile />;
      default:
        return <SwipeInterface />;
    }
  };

  return (
    <>
      <div className="pb-20">
        {renderCurrentPage()}
      </div>
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      <Toaster position="top-center" />
    </>
  );
}