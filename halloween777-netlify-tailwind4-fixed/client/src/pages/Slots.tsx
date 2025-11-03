import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Crown, ArrowLeft, Coins, Trophy, Zap } from "lucide-react";
import { toast } from "sonner";

export default function Slots() {
  const [, navigate] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [wins, setWins] = useState(0);

  const { data: credits, refetch: refetchCredits } = trpc.payment.getUserCredits.useQuery(
    { userId: user?.id || 0 },
    { enabled: !!user && !isAdmin }
  );

  const balance = isAdmin ? 1000000 : (credits?.balance || 0);

  useEffect(() => {
    const storedUser = localStorage.getItem("halloween_user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      
      // Check if user is admin (you can enhance this with an API call)
      const adminCheck = userData.phone === "94992795181";
      setIsAdmin(adminCheck);
    }
  }, []);

  const handleBack = () => {
    navigate("/game");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-halloween-dark via-halloween-red to-halloween-dark">
      {/* Header */}
      <header className="bg-black/30 backdrop-blur-sm border-b border-halloween-gold/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </Button>
            
            <h1 className="text-2xl font-bold text-halloween-gold flex items-center gap-2">
              {isAdmin && <Crown className="w-6 h-6 text-yellow-400" />}
              HALLOWEEN777
              {isAdmin && <Crown className="w-6 h-6 text-yellow-400" />}
            </h1>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full">
                <Coins className="w-5 h-5 text-halloween-gold" />
                <span className="text-white font-bold">
                  {balance.toLocaleString("pt-BR")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Admin Badge */}
        {isAdmin && (
          <div className="mb-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-6 text-center shadow-2xl">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Crown className="w-8 h-8 text-white" />
              <h2 className="text-3xl font-bold text-white">MODO PRIVILEGIADO</h2>
              <Crown className="w-8 h-8 text-white" />
            </div>
            <p className="text-white/90 text-lg">
              Você está jogando com privilégios de administrador
            </p>
            <div className="mt-4 flex justify-center gap-4">
              <div className="bg-white/20 px-6 py-3 rounded-lg">
                <Zap className="w-6 h-6 text-white mx-auto mb-1" />
                <p className="text-white font-semibold">Saldo Infinito</p>
              </div>
              <div className="bg-white/20 px-6 py-3 rounded-lg">
                <Trophy className="w-6 h-6 text-white mx-auto mb-1" />
                <p className="text-white font-semibold">Sem Limites</p>
              </div>
            </div>
          </div>
        )}

        {/* Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Slot Machine Placeholder */}
          <div className="lg:col-span-2 bg-black/40 backdrop-blur-sm rounded-xl p-8 border-2 border-halloween-gold/30">
            <div className="text-center mb-6">
              <h3 className="text-3xl font-bold text-halloween-gold mb-2">
                🎰 HALLOWEEN SLOTS 🎰
              </h3>
              <p className="text-white/70">
                {isAdmin ? "Modo Admin: Todas as apostas são gratuitas" : "Boa sorte!"}
              </p>
            </div>

            {/* Slot Display */}
            <div className="bg-gradient-to-b from-halloween-red/20 to-black/50 rounded-xl p-8 mb-6 border-2 border-halloween-gold/50">
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="aspect-square bg-black/60 rounded-lg flex items-center justify-center text-6xl border-2 border-halloween-gold/30"
                  >
                    🎃
                  </div>
                ))}
              </div>
            </div>

            {/* Betting Controls */}
            <div className="space-y-4">
              <div className="flex gap-3">
                <Button className="flex-1 bg-halloween-gold text-black font-bold text-lg py-6 hover:opacity-90">
                  Girar (100)
                </Button>
                <Button className="flex-1 bg-halloween-red text-white font-bold text-lg py-6 hover:opacity-90">
                  Girar (500)
                </Button>
                <Button className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-lg py-6 hover:opacity-90">
                  Girar (1000)
                </Button>
              </div>
              
              {isAdmin && (
                <Button className="w-full bg-purple-600 text-white font-bold text-lg py-6 hover:bg-purple-700">
                  <Zap className="w-5 h-5 mr-2" />
                  Girar Grátis (Admin)
                </Button>
              )}
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-4">
            {/* Player Stats */}
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border-2 border-halloween-gold/30">
              <h4 className="text-xl font-bold text-halloween-gold mb-4">Estatísticas</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Vitórias:</span>
                  <span className="text-white font-bold">{wins}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Saldo:</span>
                  <span className="text-halloween-gold font-bold">
                    {balance.toLocaleString("pt-BR")}
                  </span>
                </div>
                {isAdmin && (
                  <div className="flex justify-between items-center pt-3 border-t border-halloween-gold/30">
                    <span className="text-yellow-400">Status:</span>
                    <span className="text-yellow-400 font-bold flex items-center gap-1">
                      <Crown className="w-4 h-4" />
                      ADMIN
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Wins */}
            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border-2 border-halloween-gold/30">
              <h4 className="text-xl font-bold text-halloween-gold mb-4">Últimas Vitórias</h4>
              <div className="space-y-2 text-sm">
                <div className="text-white/50 text-center py-8">
                  Nenhuma vitória ainda
                </div>
              </div>
            </div>

            {/* Jackpot */}
            <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl p-6 text-center">
              <Trophy className="w-12 h-12 text-white mx-auto mb-2" />
              <h4 className="text-lg font-bold text-white mb-1">JACKPOT</h4>
              <p className="text-3xl font-bold text-white">
                R$ 777.777
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
