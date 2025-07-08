import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, or } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Match } from '@/types';
import { toast } from 'react-hot-toast';
import { Calendar, MapPin, Trophy, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function MatchesList() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [fightDate, setFightDate] = useState('');
  const [fightLocation, setFightLocation] = useState('');

  useEffect(() => {
    if (user) {
      loadMatches();
    }
  }, [user]);

  const loadMatches = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const matchesQuery = query(
        collection(db, 'matches'),
        or(
          where('user1Id', '==', user.id),
          where('user2Id', '==', user.id)
        )
      );
      
      const matchesSnapshot = await getDocs(matchesQuery);
      const matchesData = matchesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        fightDate: doc.data().fightDate?.toDate()
      })) as Match[];

      setMatches(matchesData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
    } catch (error) {
      console.error('Error loading matches:', error);
      toast.error('Eşleşmeler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getOpponent = (match: Match) => {
    return match.user1Id === user?.id ? match.user2 : match.user1;
  };

  const scheduleMatch = async (matchId: string) => {
    if (!fightDate || !fightLocation) {
      toast.error('Tarih ve lokasyon seçiniz');
      return;
    }

    try {
      await updateDoc(doc(db, 'matches', matchId), {
        fightDate: new Date(fightDate),
        location: fightLocation,
        status: 'scheduled'
      });

      toast.success('Dövüş randevusu oluşturuldu!');
      setSelectedMatch(null);
      setFightDate('');
      setFightLocation('');
      loadMatches();
    } catch (error) {
      console.error('Error scheduling match:', error);
      toast.error('Randevu oluşturulurken hata oluştu');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'scheduled':
        return <Calendar className="w-5 h-5 text-blue-400" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      default:
        return <XCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Beklemede';
      case 'scheduled':
        return 'Planlandı';
      case 'completed':
        return 'Tamamlandı';
      default:
        return 'Bilinmiyor';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-black">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p>Eşleşmeler yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-black p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Eşleşmelerim</h1>
          <p className="text-gray-300">Dövüş partnerlerinle randevu al</p>
        </div>

        {matches.length === 0 ? (
          <div className="text-center text-white">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Henüz eşleşmen yok</h3>
            <p className="text-gray-400">Rakip bul sayfasından dövüş partneri ara!</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {matches.map((match) => {
              const opponent = getOpponent(match);
              return (
                <div key={match.id} className="bg-black/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {opponent.displayName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{opponent.displayName}</h3>
                        <div className="flex items-center text-gray-400 text-sm">
                          <MapPin className="w-4 h-4 mr-1" />
                          {opponent.location}
                        </div>
                        <div className="text-sm text-gray-400">
                          {opponent.fightStyle} • {opponent.experience}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(match.status)}
                      <span className="text-sm text-gray-300">{getStatusText(match.status)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <div className="text-sm text-gray-400 mb-1">Rakip İstatistikleri</div>
                      <div className="flex space-x-4">
                        <span className="text-green-400 font-semibold">{opponent.wins}G</span>
                        <span className="text-red-400 font-semibold">{opponent.losses}M</span>
                      </div>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <div className="text-sm text-gray-400 mb-1">Fiziksel</div>
                      <div className="text-white text-sm">
                        {opponent.weight}kg • {opponent.height}cm
                      </div>
                    </div>
                  </div>

                  {match.status === 'scheduled' && match.fightDate && (
                    <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 mb-4">
                      <div className="flex items-center mb-2">
                        <Calendar className="w-5 h-5 text-blue-400 mr-2" />
                        <span className="text-blue-400 font-semibold">Planlanmış Dövüş</span>
                      </div>
                      <div className="text-white">
                        <div>📅 {match.fightDate.toLocaleDateString('tr-TR')}</div>
                        <div>📍 {match.location}</div>
                      </div>
                    </div>
                  )}

                  {match.status === 'pending' && (
                    <button
                      onClick={() => setSelectedMatch(match)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                    >
                      Randevu Al
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Schedule Match Modal */}
        {selectedMatch && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">
                {getOpponent(selectedMatch).displayName} ile Dövüş Randevusu
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tarih ve Saat
                  </label>
                  <input
                    type="datetime-local"
                    value={fightDate}
                    onChange={(e) => setFightDate(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Lokasyon
                  </label>
                  <input
                    type="text"
                    value={fightLocation}
                    onChange={(e) => setFightLocation(e.target.value)}
                    placeholder="Dövüş lokasyonu"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={() => setSelectedMatch(null)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={() => scheduleMatch(selectedMatch.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Randevu Oluştur
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}