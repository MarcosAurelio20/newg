import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Crown, ArrowLeft, Coins, Gamepad2, CreditCard } from "lucide-react";

export default function GameLobby() {
  const [, navigate] = useLocation();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const { data: credits } = trpc.payment.getUserCredits.useQuery(
    { userId: user?.id || 0 },
    { enabled: !!user }
  );

  useEffect(() => {
    const storedUser = localStorage.getItem("halloween_user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      
      const adminCheck = userData.phone === "94992795181";
      setIsAdmin(adminCheck);
    }
  }, []);

  const handleBack = () => {
    if (isAdmin) {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  };

  const games = [
    {
      id: "match3",
      title: "Match-3 Halloween",
      icon: "🎃",
      description: "Combine peças e suba no ranking diário!",
      route: "/match3",
      available: true,
    },
    {
      id: "halloween-slots",
      title: "Halloween Slots",
      icon: "🎰",
      description: "Gire os rolos e ganhe prêmios incríveis!",
      route: "/game/slots",
      available: true,
    },
    {
      id: "fortune-wheel",
      title: "Roda da Fortuna",
      icon: "🎡",
      description: "Gire a roda e teste sua sorte!",
      route: "/game/wheel",
      available: false,
    },
    {
      id: "blackjack",
      title: "Blackjack",
      icon: "🃏",
      description: "Desafie o dealer no 21!",
      route: "/game/blackjack",
      available: false,
    },
    {
      id: "dice",
      title: "Dados",
      icon: "🎲",
      description: "Aposte e role os dados!",
      route: "/game/dice",
      available: false,
    },
    {
      id: "bingo",
      title: "Bingo",
      icon: "🎱",
      description: "Complete sua cartela e ganhe!",
      route: "/game/bingo",
      available: false,
    },
    {
      id: "poker",
      title: "Poker",
      icon: "♠️",
      description: "Mostre suas habilidades no poker!",
      route: "/game/poker",
      available: false,
    },
  ];

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

            <div className="flex items-center gap-3">
              <div className="bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 border-2 border-halloween-gold/50">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-halloween-gold" />
                  <div>
                    <p className="text-white/70 text-xs leading-none">Créditos</p>
                    <p className="text-halloween-gold font-bold text-sm">
                      {isAdmin ? "∞" : (credits?.balance || 0)}
                    </p>
                  </div>
                </div>
              </div>

              {!isAdmin && (
                <Button
                  onClick={() => navigate("/recharge")}
                  size="sm"
                  className="bg-halloween-gold text-black font-bold hover:opacity-90"
                >
                  <CreditCard className="w-4 h-4 mr-1" />
                  Recarregar
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Admin Badge */}
        {isAdmin && (
          <div className="mb-6 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-4 text-center shadow-2xl">
            <div className="flex items-center justify-center gap-2">
              <Crown className="w-6 h-6 text-white" />
              <h2 className="text-xl font-bold text-white">MODO PRIVILEGIADO ATIVO</h2>
              <Crown className="w-6 h-6 text-white" />
            </div>
          </div>
        )}

        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-halloween-gold mb-2">
            🎮 Escolha seu Jogo 🎮
          </h2>
          <p className="text-white/80 text-lg">
            Selecione um dos jogos disponíveis e divirta-se!
          </p>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {games.map((game) => (
            <div
              key={game.id}
              className={`relative bg-black/40 backdrop-blur-sm rounded-xl border-2 overflow-hidden transition-all duration-300 ${
                game.available
                  ? "border-halloween-gold/50 hover:border-halloween-gold hover:scale-105 cursor-pointer"
                  : "border-gray-600/30 opacity-60"
              }`}
              onClick={() => game.available && navigate(game.route)}
            >
              <div className="p-6">
                {/* Game Icon */}
                <div className="text-center mb-4">
                  <div className="text-7xl mb-2">{game.icon}</div>
                  <h3 className="text-2xl font-bold text-halloween-gold mb-2">
                    {game.title}
                  </h3>
                  <p className="text-white/70 text-sm mb-4">
                    {game.description}
                  </p>
                </div>

                {/* Status */}
                {game.available ? (
                  <Button className="w-full bg-halloween-gold text-black font-bold hover:opacity-90">
                    <Gamepad2 className="w-5 h-5 mr-2" />
                    Jogar Agora
                  </Button>
                ) : (
                  <div className="w-full bg-gray-600/50 text-white/50 font-bold py-2 px-4 rounded-lg text-center">
                    Em Breve
                  </div>
                )}
              </div>

              {/* Coming Soon Overlay */}
              {!game.available && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="bg-halloween-red text-white px-6 py-3 rounded-full font-bold text-lg transform -rotate-12">
                    EM BREVE
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-12 max-w-2xl mx-auto bg-black/40 backdrop-blur-sm rounded-xl p-6 border-2 border-halloween-gold/30">
          <h3 className="text-xl font-bold text-halloween-gold mb-3 text-center">
            📢 Novidades em Breve!
          </h3>
          <p className="text-white/80 text-center">
            Estamos trabalhando para trazer mais jogos emocionantes para você. 
            Fique ligado para novidades e atualizações!
          </p>
        </div>
      </main>
    </div>
  );
}
