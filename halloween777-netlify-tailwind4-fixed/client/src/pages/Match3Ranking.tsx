import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Trophy, Medal, Award, Coins } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export default function Match3Ranking() {
  const [, navigate] = useLocation();

  const { data: ranking, isLoading } = trpc.match3.getDailyRanking.useQuery();
  const { data: prizePool } = trpc.match3.getDailyPrizePool.useQuery();

  const getMedalIcon = (position: number) => {
    if (position === 1) return <Trophy className="text-[#FFD700]" size={32} />;
    if (position === 2) return <Medal className="text-gray-400" size={32} />;
    if (position === 3) return <Award className="text-orange-600" size={32} />;
    return <span className="text-white font-bold text-xl">{position}º</span>;
  };

  const getPrizeAmount = (position: number): number => {
    if (!prizePool) return 0;
    
    const basePrizes = [2, 5, 10, 15, 20];
    const baseAmount = basePrizes[position - 1] || 0;
    
    // Calcular prêmio proporcional do pool
    const totalBase = 54; // 2+5+10+15+20
    const proportion = baseAmount / totalBase;
    const totalPrize = prizePool.totalPrize || 54;
    
    return Math.floor(totalPrize * proportion);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#891523] to-[#5a0e17] p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/match3')}
            className="bg-black/40 border-[#FFD700] text-white hover:bg-black/60"
          >
            <ArrowLeft size={16} className="mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-[#FFD700]">🏆 Ranking Diário</h1>
        </div>

        {/* Prize Pool */}
        {prizePool && (
          <Card className="bg-gradient-to-r from-purple-900 to-purple-950 border-[#FFD700] p-6 mb-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-[#FFD700] mb-2">
                💰 Pool de Prêmios de Hoje
              </h2>
              <div className="text-4xl font-bold text-white mb-2">
                R$ {(prizePool.totalPrize / 100).toFixed(2)}
              </div>
              <p className="text-white/75 text-sm">
                Base: R$ {(prizePool.baseAmount / 100).toFixed(2)} + 
                {prizePool.prizePercentage}% de R$ {(prizePool.depositedAmount / 100).toFixed(2)} depositados
              </p>
            </div>
          </Card>
        )}

        {/* Top 5 Prizes */}
        <Card className="bg-black/60 border-[#FFD700] p-4 mb-6">
          <h3 className="text-lg font-bold text-[#FFD700] mb-3 text-center">
            Prêmios do Top 5
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map(pos => (
              <div key={pos} className="text-center">
                <div className="text-2xl mb-1">
                  {pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : `${pos}º`}
                </div>
                <div className="text-white font-bold text-sm">
                  R$ {(getPrizeAmount(pos) / 100).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Ranking List */}
        <Card className="bg-black/40 border-[#FFD700] p-4">
          <h3 className="text-lg font-bold text-[#FFD700] mb-4">
            Classificação
          </h3>

          {isLoading ? (
            <div className="text-center text-white py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD700] mx-auto"></div>
              <p className="mt-4">Carregando ranking...</p>
            </div>
          ) : !ranking || ranking.length === 0 ? (
            <div className="text-center text-white/75 py-8">
              <Trophy size={48} className="mx-auto mb-4 opacity-50" />
              <p>Nenhum jogador no ranking hoje.</p>
              <p className="text-sm mt-2">Seja o primeiro a jogar!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {ranking.map((player, index) => {
                const position = index + 1;
                const isTop5 = position <= 5;
                const prizeAmount = isTop5 ? getPrizeAmount(position) : 0;

                return (
                  <div
                    key={player.userId}
                    className={`
                      flex items-center gap-4 p-4 rounded-lg
                      ${isTop5 
                        ? 'bg-gradient-to-r from-[#FFD700]/20 to-orange-600/20 border-2 border-[#FFD700]' 
                        : 'bg-black/40 border border-white/20'}
                    `}
                  >
                    {/* Position */}
                    <div className="flex-shrink-0 w-12 flex justify-center">
                      {getMedalIcon(position)}
                    </div>

                    {/* Player Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">
                          Jogador #{player.userId}
                        </span>
                        <span className={`
                          text-xs px-2 py-1 rounded
                          ${player.highestDifficulty === 'hard' 
                            ? 'bg-red-500/20 text-red-300' 
                            : player.highestDifficulty === 'medium'
                            ? 'bg-yellow-500/20 text-yellow-300'
                            : 'bg-green-500/20 text-green-300'}
                        `}>
                          {player.highestDifficulty === 'hard' ? 'Difícil' : 
                           player.highestDifficulty === 'medium' ? 'Médio' : 'Fácil'}
                        </span>
                      </div>
                      <div className="text-white/75 text-sm">
                        {player.matchesPlayed} {player.matchesPlayed === 1 ? 'partida' : 'partidas'}
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <div className="text-[#FFD700] font-bold text-lg">
                        {player.totalScore.toLocaleString()} pts
                      </div>
                      {isTop5 && (
                        <div className="flex items-center gap-1 text-green-400 text-sm">
                          <Coins size={14} />
                          <span>R$ {(prizeAmount / 100).toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Info */}
        <Card className="bg-black/40 border-[#FFD700] p-4 mt-6">
          <h3 className="text-lg font-bold text-[#FFD700] mb-2">
            ℹ️ Como Funciona
          </h3>
          <ul className="text-white/75 text-sm space-y-2">
            <li>• O ranking zera todo dia às 23:59 (horário de Brasília)</li>
            <li>• Apenas partidas completas contam para o ranking</li>
            <li>• Os 5 primeiros colocados ganham prêmios em créditos</li>
            <li>• Quanto mais jogadores depositarem, maior o prêmio!</li>
            <li>• O prêmio entra como crédito e pode ser usado no jogo</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
