import { useAuth } from '@/hooks/useAuth';
import { Home, Users, MessageCircle, User, LogOut } from 'lucide-react';

interface NavigationProps {
  currentPage: 'swipe' | 'matches' | 'profile';
  onPageChange: (page: 'swipe' | 'matches' | 'profile') => void;
}

export default function Navigation({ currentPage, onPageChange }: NavigationProps) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems = [
    { id: 'swipe' as const, icon: Home, label: 'Keşfet' },
    { id: 'matches' as const, icon: Users, label: 'Eşleşmeler' },
    { id: 'profile' as const, icon: User, label: 'Profil' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-gray-800">
      <div className="max-w-md mx-auto px-4 py-2">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
                  isActive 
                    ? 'text-red-400 bg-red-400/10' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
          
          <button
            onClick={handleLogout}
            className="flex flex-col items-center py-2 px-4 rounded-lg transition-colors text-gray-400 hover:text-red-400"
          >
            <LogOut className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Çıkış</span>
          </button>
        </div>
      </div>
    </div>
  );
}