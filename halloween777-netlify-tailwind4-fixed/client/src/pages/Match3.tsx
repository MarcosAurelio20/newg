import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import Match3Game from '@/components/Match3Game';
import { Heart, Coins, Trophy, ArrowLeft, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { trpc } from '@/lib/trpc';

// Ciclo de dificuldade (10 fases que se repetem)
const DIFFICULTY_CYCLE = [
  'easy', 'easy', 'easy',      // 3 fáceis
  'medium', 'medium',           // 2 médias
  'hard',                       // 1 difícil
  'medium',                     // 1 média
  'hard',                       // 1 difícil
  'medium',                     // 1 média
] as const;

type Difficulty = typeof DIFFICULTY_CYCLE[number];

export default function Match3() {
  const [, navigate] = useLocation();
  const [currentPhase, setCurrentPhase] = useState(1);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [lives, setLives] = useState(3);
  const [credits, setCredits] = useState(0);
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [showSurpriseBox, setShowSurpriseBox] = useState(false);
  const [surpriseBoxResult, setSurpriseBoxResult] = useState<{won: boolean; prize?: {type: string; amount: number}} | null>(null);
  const [showGameOver, setShowGameOver] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [showBuyLives, setShowBuyLives] = useState(false);

  // TODO: Get userId from auth context
  const userId = 1; // Placeholder

  // Carregar dados do jogador
  const { data: playerData } = trpc.match3.getPlayerData.useQuery({ userId });
  const buyLivesMutation = trpc.match3.buyLives.useMutation();
  const saveMatchMutation = trpc.match3.saveMatch.useMutation();
  const openSurpriseBoxMutation = trpc.match3.openSurpriseBox.useMutation();

  useEffect(() => {
    if (playerData) {
      setLives(playerData.lives);
      setCredits(playerData.credits);
      setCurrentPhase(playerData.currentPhase);
      setCyclesCompleted(playerData.cyclesCompleted);
      setScore(playerData.totalScore);
    }
  }, [playerData]);

  const currentDifficulty: Difficulty = DIFFICULTY_CYCLE[(currentPhase - 1) % 10];
  const isEndOfCycle = currentPhase % 10 === 0;

  const handleGameEnd = async (won: boolean, finalScore: number) => {
    setGameActive(false);

    // Salvar partida
    await saveMatchMutation.mutateAsync({
      userId,
      phase: currentPhase,
      difficulty: currentDifficulty,
      score: finalScore,
      objective: 'points',
      objectiveValue: currentDifficulty === 'easy' ? 1000 : currentDifficulty === 'medium' ? 1500 : 2000,
      completed: won ? 1 : 0,
      timeSpent: currentDifficulty === 'easy' ? 180 : currentDifficulty === 'medium' ? 120 : 90,
      consecutiveErrors: 0,
    });

    if (won) {
      setScore(prev => prev + finalScore);
      
      // Verificar se completou o ciclo
      if (isEndOfCycle) {
        setShowSurpriseBox(true);
      } else {
        setCurrentPhase(prev => prev + 1);
        setShowVictory(true);
      }
    } else {
      setShowGameOver(true);
    }
  };

  const handleLifeLost = () => {
    setLives(prev => Math.max(0, prev - 1));
  };

  const handleBuyLives = async (amount: number) => {
    if (credits >= amount) {
      try {
        await buyLivesMutation.mutateAsync({ userId, amount });
        setLives(prev => prev + amount);
        setCredits(prev => prev - amount);
        setShowBuyLives(false);
        setShowGameOver(false);
      } catch (error) {
        console.error('Erro ao comprar vidas:', error);
      }
    }
  };

  const handleBuyLifeInGame = async () => {
    if (credits >= 1) {
      try {
        await buyLivesMutation.mutateAsync({ userId, amount: 1 });
        setLives(prev => prev + 1);
        setCredits(prev => prev - 1);
      } catch (error) {
        console.error('Erro ao comprar vida:', error);
      }
    }
  };

  const handleOpenSurpriseBox = async () => {
    try {
      const result = await openSurpriseBoxMutation.mutateAsync({
        userId,
        cycleNumber: cyclesCompleted + 1,
      });
      
      setSurpriseBoxResult(result);
      
      if (result.won && result.prize) {
        if (result.prize.type === 'lives') {
          setLives(prev => prev + (result.prize?.amount || 0));
        } else if (result.prize.type === 'credits') {
          setCredits(prev => prev + (result.prize?.amount || 0));
        }
      }
      
      // Avançar para próximo ciclo
      setTimeout(() => {
        setShowSurpriseBox(false);
        setSurpriseBoxResult(null);
        setCyclesCompleted(prev => prev + 1);
        setCurrentPhase(1);
      }, 3000);
    } catch (error) {
      console.error('Erro ao abrir caixa surpresa:', error);
    }
  };

  const startGame = () => {
    if (lives > 0) {
      setGameActive(true);
    } else {
      setShowBuyLives(true);
    }
  };

  if (gameActive) {
    return (
      <Match3Game
        difficulty={currentDifficulty}
        phase={currentPhase}
        lives={lives}
        credits={credits}
        onGameEnd={handleGameEnd}
        onLifeLost={handleLifeLost}
        onBuyLife={handleBuyLifeInGame}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#891523] to-[#5a0e17] p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/game')}
            className="bg-black/40 border-[#FFD700] text-white hover:bg-black/60"
          >
            <ArrowLeft size={16} className="mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-[#FFD700]">Match-3 Halloween</h1>
        </div>

        {/* Status do jogador */}
        <Card className="bg-black/60 border-[#FFD700] p-6 mb-6">
          <div className="grid grid-cols-2 gap-4 text-white">
            <div className="flex items-center gap-2">
              <Heart className="text-red-500" size={24} />
              <div>
                <p className="text-sm opacity-75">Vidas</p>
                <p className="text-2xl font-bold">{lives}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="text-[#FFD700]" size={24} />
              <div>
                <p className="text-sm opacity-75">Créditos</p>
                <p className="text-2xl font-bold">{credits}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="text-[#FFD700]" size={24} />
              <div>
                <p className="text-sm opacity-75">Pontuação</p>
                <p className="text-2xl font-bold">{score}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Gift className="text-purple-400" size={24} />
              <div>
                <p className="text-sm opacity-75">Ciclos</p>
                <p className="text-2xl font-bold">{cyclesCompleted}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Informações da fase */}
        <Card className="bg-black/40 border-[#FFD700] p-4 mb-6">
          <h2 className="text-xl font-bold text-[#FFD700] mb-2">
            Fase {currentPhase} - {currentDifficulty === 'easy' ? 'Fácil' : currentDifficulty === 'medium' ? 'Médio' : 'Difícil'}
          </h2>
          <p className="text-white text-sm">
            {isEndOfCycle 
              ? '🎁 Última fase do ciclo! Complete para ganhar uma caixa surpresa!'
              : `Fase ${currentPhase} de 10 no ciclo atual`}
          </p>
        </Card>

        {/* Botões */}
        <div className="space-y-3">
          <Button
            onClick={startGame}
            disabled={lives === 0}
            className="w-full bg-gradient-to-r from-orange-600 to-orange-800 hover:from-orange-700 hover:to-orange-900 text-white font-bold text-lg py-6"
          >
            {lives === 0 ? 'Sem vidas! Compre mais para jogar' : 'Jogar Agora'}
          </Button>

          <Button
            onClick={() => navigate('/match3/ranking')}
            variant="outline"
            className="w-full bg-black/40 border-[#FFD700] text-white hover:bg-black/60"
          >
            <Trophy className="mr-2" size={20} />
            Ver Ranking
          </Button>

          <Button
            onClick={() => navigate('/recharge')}
            variant="outline"
            className="w-full bg-black/40 border-[#FFD700] text-white hover:bg-black/60"
          >
            <Coins className="mr-2" size={20} />
            Adicionar Créditos
          </Button>

          {lives === 0 && (
            <Button
              onClick={() => setShowBuyLives(true)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              <Heart className="mr-2" size={20} />
              Comprar Vidas
            </Button>
          )}
        </div>
      </div>

      {/* Dialog: Caixa Surpresa */}
      <Dialog open={showSurpriseBox} onOpenChange={setShowSurpriseBox}>
        <DialogContent className="bg-gradient-to-b from-purple-900 to-purple-950 border-[#FFD700]">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#FFD700] text-center">
              🎁 Caixa Surpresa! 🎁
            </DialogTitle>
            <DialogDescription className="text-white text-center">
              Você completou um ciclo! Abra a caixa para ver se ganhou um prêmio!
            </DialogDescription>
          </DialogHeader>

          {!surpriseBoxResult ? (
            <div className="flex flex-col items-center gap-6 py-6">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 1,
                  repeat: Infinity
                }}
                className="text-8xl"
              >
                🎁
              </motion.div>
              <Button
                onClick={handleOpenSurpriseBox}
                className="bg-gradient-to-r from-[#FFD700] to-yellow-600 hover:from-yellow-600 hover:to-[#FFD700] text-black font-bold text-lg px-8 py-6"
              >
                Abrir Caixa!
              </Button>
            </div>
          ) : (
            <AnimatePresence>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center gap-4 py-6"
              >
                {surpriseBoxResult.won ? (
                  <>
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 360]
                      }}
                      transition={{ duration: 0.5 }}
                      className="text-8xl"
                    >
                      🎉
                    </motion.div>
                    <h3 className="text-2xl font-bold text-[#FFD700]">
                      Parabéns! Você ganhou!
                    </h3>
                    <p className="text-white text-lg">
                      +{surpriseBoxResult.prize?.amount} {surpriseBoxResult.prize?.type === 'lives' ? 'Vidas' : 'Créditos'}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-8xl">😢</div>
                    <h3 className="text-xl font-bold text-white">
                      Não foi dessa vez!
                    </h3>
                    <p className="text-white/75">
                      Tente novamente no próximo ciclo!
                    </p>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog: Vitória */}
      <Dialog open={showVictory} onOpenChange={setShowVictory}>
        <DialogContent className="bg-gradient-to-b from-green-900 to-green-950 border-[#FFD700]">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#FFD700] text-center">
              🎉 Fase Completa! 🎉
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="text-8xl">🏆</div>
            <p className="text-white text-lg text-center">
              Parabéns! Você completou a fase {currentPhase - 1}!
            </p>
            <Button
              onClick={() => {
                setShowVictory(false);
                startGame();
              }}
              className="bg-gradient-to-r from-[#FFD700] to-yellow-600 hover:from-yellow-600 hover:to-[#FFD700] text-black font-bold px-8"
            >
              Próxima Fase
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Game Over */}
      <Dialog open={showGameOver} onOpenChange={setShowGameOver}>
        <DialogContent className="bg-gradient-to-b from-red-900 to-red-950 border-[#FFD700]">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#FFD700] text-center">
              😢 Fase Falhada
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="text-8xl">💀</div>
            <p className="text-white text-lg text-center">
              Você perdeu uma vida! {lives > 0 ? 'Tente novamente!' : 'Compre mais vidas para continuar!'}
            </p>
            <div className="flex gap-3 w-full">
              {lives > 0 ? (
                <Button
                  onClick={() => {
                    setShowGameOver(false);
                    startGame();
                  }}
                  className="flex-1 bg-gradient-to-r from-[#FFD700] to-yellow-600 hover:from-yellow-600 hover:to-[#FFD700] text-black font-bold"
                >
                  Tentar Novamente
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    setShowGameOver(false);
                    setShowBuyLives(true);
                  }}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-bold"
                >
                  Comprar Vidas
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Comprar Vidas */}
      <Dialog open={showBuyLives} onOpenChange={setShowBuyLives}>
        <DialogContent className="bg-gradient-to-b from-[#891523] to-[#5a0e17] border-[#FFD700]">
          <DialogHeader>
            <DialogTitle className="text-2xl text-[#FFD700] text-center">
              ❤️ Comprar Vidas
            </DialogTitle>
            <DialogDescription className="text-white text-center">
              Use seus créditos para comprar vidas (1 crédito = 1 vida)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <p className="text-white text-center">
              Você tem <span className="font-bold text-[#FFD700]">{credits}</span> créditos
            </p>
            {[1, 3, 5, 10].map(amount => (
              <Button
                key={amount}
                onClick={() => handleBuyLives(amount)}
                disabled={credits < amount}
                className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-bold disabled:opacity-50"
              >
                Comprar {amount} {amount === 1 ? 'Vida' : 'Vidas'} - {amount} {amount === 1 ? 'Crédito' : 'Créditos'}
              </Button>
            ))}
            <Button
              onClick={() => navigate('/recharge')}
              variant="outline"
              className="w-full bg-black/40 border-[#FFD700] text-white hover:bg-black/60"
            >
              Adicionar Mais Créditos
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
