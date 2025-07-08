import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import { User, MapPin, Trophy, Target, Ruler, Weight, Edit3, Save, X } from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    fightStyle: user?.fightStyle || '',
    experience: user?.experience || 'Beginner',
    weight: user?.weight?.toString() || '',
    height: user?.height?.toString() || '',
    location: user?.location || ''
  });

  if (!user) return null;

  const handleSave = async () => {
    try {
      await updateUser({
        displayName: formData.displayName,
        bio: formData.bio,
        fightStyle: formData.fightStyle,
        experience: formData.experience as any,
        weight: parseInt(formData.weight),
        height: parseInt(formData.height),
        location: formData.location
      });
      
      setIsEditing(false);
      toast.success('Profil güncellendi!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Profil güncellenirken hata oluştu');
    }
  };

  const handleCancel = () => {
    setFormData({
      displayName: user.displayName,
      bio: user.bio,
      fightStyle: user.fightStyle,
      experience: user.experience,
      weight: user.weight.toString(),
      height: user.height.toString(),
      location: user.location
    });
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
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
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-black p-4 pb-20">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Profilim</h1>
          <p className="text-gray-300">Bilgilerini düzenle</p>
        </div>

        <div className="bg-black/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
          {/* Profile Header */}
          <div className="text-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-white font-bold text-3xl mx-auto mb-4">
              {user.displayName.charAt(0)}
            </div>
            
            {isEditing ? (
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                className="text-2xl font-bold text-white bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-center"
              />
            ) : (
              <h2 className="text-2xl font-bold text-white">{user.displayName}</h2>
            )}
            
            <p className="text-gray-400">{user.age} yaşında</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-900/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{user.wins}</div>
              <div className="text-sm text-gray-400">Galibiyet</div>
            </div>
            <div className="bg-gray-900/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-400">{user.losses}</div>
              <div className="text-sm text-gray-400">Mağlubiyet</div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="space-y-4 mb-6">
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <MapPin className="w-5 h-5 mr-2 text-blue-400" />
                <span className="text-sm text-gray-300">Lokasyon</span>
              </div>
              {isEditing ? (
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                />
              ) : (
                <p className="text-white font-semibold">{user.location}</p>
              )}
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Target className="w-5 h-5 mr-2 text-red-400" />
                <span className="text-sm text-gray-300">Dövüş Stili</span>
              </div>
              {isEditing ? (
                <input
                  type="text"
                  name="fightStyle"
                  value={formData.fightStyle}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                />
              ) : (
                <p className="text-white font-semibold">{user.fightStyle}</p>
              )}
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                <span className="text-sm text-gray-300">Deneyim</span>
              </div>
              {isEditing ? (
                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                >
                  <option value="Beginner">Başlangıç</option>
                  <option value="Intermediate">Orta</option>
                  <option value="Advanced">İleri</option>
                  <option value="Professional">Profesyonel</option>
                </select>
              ) : (
                <p className={`font-semibold ${getExperienceColor(user.experience)}`}>
                  {getExperienceText(user.experience)}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Weight className="w-5 h-5 mr-2 text-blue-400" />
                  <span className="text-sm text-gray-300">Kilo</span>
                </div>
                {isEditing ? (
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  />
                ) : (
                  <p className="text-white font-semibold">{user.weight} kg</p>
                )}
              </div>
              
              <div className="bg-gray-900/50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Ruler className="w-5 h-5 mr-2 text-green-400" />
                  <span className="text-sm text-gray-300">Boy</span>
                </div>
                {isEditing ? (
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                    className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white"
                  />
                ) : (
                  <p className="text-white font-semibold">{user.height} cm</p>
                )}
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <User className="w-5 h-5 mr-2 text-purple-400" />
                <span className="text-sm text-gray-300">Hakkımda</span>
              </div>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white resize-none"
                />
              ) : (
                <p className="text-white">{user.bio}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  <X className="w-5 h-5 mr-2" />
                  İptal
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Kaydet
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
              >
                <Edit3 className="w-5 h-5 mr-2" />
                Düzenle
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}