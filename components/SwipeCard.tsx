import { useState } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { User } from '@/types';
import { Heart, X, MapPin, Trophy, Target, Ruler, Weight } from 'lucide-react';

interface SwipeCardProps {
  user: User;
  onSwipe: (liked: boolean) => void;
}

export default function SwipeCard({ user, onSwipe }: SwipeCardProps) {
  const [exitX, setExitX] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      setExitX(200);
      onSwipe(true);
    } else if (info.offset.x < -100) {
      setExitX(-200);
      onSwipe(false);
    }
  };

  const getExperienceColor = (experience: string) => {
    switch (experience) {
      case 'Beginner': return 'text-green-400';
      case 'Intermediate': return 'text-yellow-400';
      case 'Advanced': return 'text-orange-400';
      case 'Professional': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getExperienceText = (experience: string) => {
    switch (experience) {
      case 'Beginner': return 'Başlangıç';
      case 'Intermediate': return 'Orta';
      case 'Advanced': return 'İleri';
      case 'Professional': return 'Profesyonel';
      default: return experience;
    }
  };

  return (
    <motion.div
      className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing shadow-2xl border border-gray-800"
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={exitX !== 0 ? { x: exitX } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Background Image */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
      
      {/* Like/Nope Indicators */}
      <motion.div
        className="absolute top-8 right-8 bg-green-500 text-white px-4 py-2 rounded-full font-bold text-lg transform rotate-12"
        style={{ opacity: useTransform(x, [50, 150], [0, 1]) }}
      >
        <Heart className="w-6 h-6" />
      </motion.div>
      
      <motion.div
        className="absolute top-8 left-8 bg-red-500 text-white px-4 py-2 rounded-full font-bold text-lg transform -rotate-12"
        style={{ opacity: useTransform(x, [-150, -50], [1, 0]) }}
      >
        <X className="w-6 h-6" />
      </motion.div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <div className="mb-4">
          <h2 className="text-3xl font-bold mb-2">{user.displayName}, {user.age}</h2>
          <div className="flex items-center text-gray-300 mb-2">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{user.location}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-black/50 rounded-lg p-3">
            <div className="flex items-center mb-1">
              <Target className="w-4 h-4 mr-2 text-red-400" />
              <span className="text-sm text-gray-300">Stil</span>
            </div>
            <p className="font-semibold">{user.fightStyle}</p>
          </div>
          
          <div className="bg-black/50 rounded-lg p-3">
            <div className="flex items-center mb-1">
              <Trophy className="w-4 h-4 mr-2 text-yellow-400" />
              <span className="text-sm text-gray-300">Deneyim</span>
            </div>
            <p className={`font-semibold ${getExperienceColor(user.experience)}`}>
              {getExperienceText(user.experience)}
            </p>
          </div>
          
          <div className="bg-black/50 rounded-lg p-3">
            <div className="flex items-center mb-1">
              <Weight className="w-4 h-4 mr-2 text-blue-400" />
              <span className="text-sm text-gray-300">Kilo</span>
            </div>
            <p className="font-semibold">{user.weight} kg</p>
          </div>
          
          <div className="bg-black/50 rounded-lg p-3">
            <div className="flex items-center mb-1">
              <Ruler className="w-4 h-4 mr-2 text-green-400" />
              <span className="text-sm text-gray-300">Boy</span>
            </div>
            <p className="font-semibold">{user.height} cm</p>
          </div>
        </div>

        <div className="bg-black/50 rounded-lg p-3 mb-4">
          <h3 className="font-semibold mb-2">Hakkında</h3>
          <p className="text-gray-300 text-sm">{user.bio}</p>
        </div>

        <div className="flex items-center justify-center space-x-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{user.wins}</div>
            <div className="text-xs text-gray-400">Galibiyet</div>
          </div>
          <div className="w-px h-8 bg-gray-600" />
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{user.losses}</div>
            <div className="text-xs text-gray-400">Mağlubiyet</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}