import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Home, Gift, TrendingUp, CreditCard, UserCircle, LogOut, Coins, Gamepad2 } from "lucide-react";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("halloween_user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const { data: credits } = trpc.payment.getUserCredits.useQuery(
    { userId: user?.id || 0 },
    { enabled: !!user }
  );

  useEffect(() => {
    if (!user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const handleLogout = () => {
    localStorage.removeItem("halloween_user");
    setLocation("/");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-halloween-red flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-halloween-dark">
        <div className="text-white text-2xl font-bold">HALLOWEEN777</div>
        <Button
          variant="outline"
          className="bg-transparent text-white border-white/30 hover:bg-white/10"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
            <h1 className="text-3xl font-bold text-halloween-red mb-2">
              Bem-vindo ao Halloween777!
            </h1>
            <p className="text-gray-600 mb-4">
              Telefone: <span className="font-semibold">{user?.phone}</span>
            </p>
            
            {/* Credits Display */}
            <div className="bg-gradient-to-r from-halloween-gold to-orange-500 rounded-xl p-6 flex items-center justify-between">
              <div>
                <p className="text-white/90 text-sm mb-1">Seus Créditos</p>
                <div className="flex items-center gap-2">
                  <Coins className="w-8 h-8 text-white" />
                  <span className="text-4xl font-bold text-white">
                    {credits?.balance || 0}
                  </span>
                </div>
                <p className="text-white/80 text-xs mt-1">1 Real = 1 Crédito</p>
              </div>
              <Button
                onClick={() => setLocation("/recharge")}
                className="bg-white text-halloween-red font-bold hover:bg-white/90"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Recarregar
              </Button>
            </div>
            <p className="text-gray-700">
              Você está logado com sucesso na plataforma Halloween777. Explore as opções abaixo para começar a jogar e aproveitar nossas promoções exclusivas.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-orange-100 p-3 rounded-full">
                  <Gift className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Promoções</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Confira nossas promoções exclusivas e bônus especiais para novos jogadores.
              </p>
              <Button className="w-full bg-halloween-gold text-white hover:opacity-90">
                Ver Promoções
              </Button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <CreditCard className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Recarregar</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Adicione créditos à sua conta e comece a jogar agora mesmo.
              </p>
              <Button 
                onClick={() => setLocation("/recharge")}
                className="w-full bg-halloween-gold text-white hover:opacity-90"
              >
                Recarregar Conta
              </Button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Programa de Agentes</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Torne-se um agente e ganhe comissões indicando novos jogadores.
              </p>
              <Button className="w-full bg-halloween-gold text-white hover:opacity-90">
                Saiba Mais
              </Button>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <UserCircle className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Meu Perfil</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Gerencie suas informações pessoais e configurações de conta.
              </p>
              <Button className="w-full bg-halloween-gold text-white hover:opacity-90">
                Editar Perfil
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-halloween-dark border-t border-white/10">
        <div className="flex justify-around items-center py-3">
          <button 
            onClick={() => setLocation("/game")}
            className="flex flex-col items-center gap-1 text-white transition-colors"
          >
            <Gamepad2 className="w-6 h-6" />
            <span className="text-xs">Jogar</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors">
            <Gift className="w-6 h-6" />
            <span className="text-xs">Promoção</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors">
            <TrendingUp className="w-6 h-6" />
            <span className="text-xs">Agente</span>
          </button>
          <button 
            onClick={() => setLocation("/recharge")}
            className="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors"
          >
            <CreditCard className="w-6 h-6" />
            <span className="text-xs">Recarregar</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-white/70 hover:text-white transition-colors">
            <UserCircle className="w-6 h-6" />
            <span className="text-xs">Perfil</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
