import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, Trophy, Coins, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Tipos de peças do jogo (tema Halloween)
const PIECE_TYPES = ['🎃', '👻', '🦇', '🍬', '🕷️', '💀'] as const;
type PieceType = typeof PIECE_TYPES[number];

interface Piece {
  id: string;
  type: PieceType;
  row: number;
  col: number;
  matched: boolean;
}

interface GameState {
  grid: Piece[][];
  score: number;
  moves: number;
  selectedPiece: { row: number; col: number } | null;
  consecutiveErrors: number;
  isProcessing: boolean;
}

interface Match3GameProps {
  difficulty: 'easy' | 'medium' | 'hard';
  phase: number;
  lives: number;
  credits: number;
  onGameEnd: (won: boolean, score: number) => void;
  onLifeLost: () => void;
  onBuyLife: () => void;
}

const GRID_SIZE = 8;
const DIFFICULTY_CONFIG = {
  easy: { time: 180, objective: 1000, moves: 30 },
  medium: { time: 120, objective: 1500, moves: 25 },
  hard: { time: 90, objective: 2000, moves: 20 },
};

export default function Match3Game({ 
  difficulty, 
  phase, 
  lives, 
  credits,
  onGameEnd, 
  onLifeLost,
  onBuyLife
}: Match3GameProps) {
  const [gameState, setGameState] = useState<GameState>({
    grid: [],
    score: 0,
    moves: 0,
    selectedPiece: null,
    consecutiveErrors: 0,
    isProcessing: false,
  });

  const [timeLeft, setTimeLeft] = useState(DIFFICULTY_CONFIG[difficulty].time);
  const config = DIFFICULTY_CONFIG[difficulty];

  // Gerar ID único para cada peça
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Criar uma peça aleatória
  const createRandomPiece = (row: number, col: number): Piece => ({
    id: generateId(),
    type: PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)],
    row,
    col,
    matched: false,
  });

  // Inicializar grid
  const initializeGrid = useCallback((): Piece[][] => {
    const grid: Piece[][] = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      grid[row] = [];
      for (let col = 0; col < GRID_SIZE; col++) {
        grid[row][col] = createRandomPiece(row, col);
      }
    }
    return grid;
  }, []);

  // Verificar matches na inicialização
  const hasInitialMatches = (grid: Piece[][]): boolean => {
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (col < GRID_SIZE - 2) {
          if (grid[row][col].type === grid[row][col + 1].type && 
              grid[row][col].type === grid[row][col + 2].type) {
            return true;
          }
        }
        if (row < GRID_SIZE - 2) {
          if (grid[row][col].type === grid[row + 1][col].type && 
              grid[row][col].type === grid[row + 2][col].type) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // Inicializar jogo
  useEffect(() => {
    let grid = initializeGrid();
    while (hasInitialMatches(grid)) {
      grid = initializeGrid();
    }
    setGameState(prev => ({ ...prev, grid }));
  }, [initializeGrid]);

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      onLifeLost();
      onGameEnd(false, gameState.score);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, gameState.score, onGameEnd, onLifeLost]);

  // Verificar se há matches
  const findMatches = (grid: Piece[][]): Piece[] => {
    const matches: Piece[] = [];
    const matched = new Set<string>();

    // Verificar linhas horizontais
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE - 2; col++) {
        const type = grid[row][col].type;
        if (type === grid[row][col + 1].type && type === grid[row][col + 2].type) {
          matched.add(grid[row][col].id);
          matched.add(grid[row][col + 1].id);
          matched.add(grid[row][col + 2].id);
        }
      }
    }

    // Verificar colunas verticais
    for (let col = 0; col < GRID_SIZE; col++) {
      for (let row = 0; row < GRID_SIZE - 2; row++) {
        const type = grid[row][col].type;
        if (type === grid[row + 1][col].type && type === grid[row + 2][col].type) {
          matched.add(grid[row][col].id);
          matched.add(grid[row + 1][col].id);
          matched.add(grid[row + 2][col].id);
        }
      }
    }

    // Converter Set para array de peças
    grid.forEach(row => {
      row.forEach(piece => {
        if (matched.has(piece.id)) {
          matches.push(piece);
        }
      });
    });

    return matches;
  };

  // Remover matches e fazer peças caírem
  const processMatches = async (grid: Piece[][]): Promise<Piece[][]> => {
    const matches = findMatches(grid);
    if (matches.length === 0) return grid;

    // Calcular pontuação ANTES de modificar o grid
    const points = matches.length * 10;
    setGameState(prev => ({ ...prev, score: prev.score + points }));

    // Criar novo grid sem modificar o original
    const newGrid: Piece[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null));
    
    // Processar cada coluna separadamente
    for (let col = 0; col < GRID_SIZE; col++) {
      const column: Piece[] = [];
      
      // Coletar peças que NÃO foram matched (de baixo para cima)
      for (let row = GRID_SIZE - 1; row >= 0; row--) {
        const piece = grid[row][col];
        const isMatched = matches.some(m => m.id === piece.id);
        if (!isMatched) {
          column.unshift(piece);
        }
      }
      
      // Calcular quantas peças novas precisamos
      const newPiecesCount = GRID_SIZE - column.length;
      
      // Adicionar novas peças no topo
      for (let i = 0; i < newPiecesCount; i++) {
        column.unshift(createRandomPiece(i, col));
      }
      
      // Colocar peças na nova grid com posições corretas
      for (let row = 0; row < GRID_SIZE; row++) {
        newGrid[row][col] = { ...column[row], row, col };
      }
    }

    // Aguardar animação
    await new Promise(resolve => setTimeout(resolve, 400));

    // Verificar se há mais matches (cascata)
    const hasMoreMatches = findMatches(newGrid).length > 0;
    if (hasMoreMatches) {
      return processMatches(newGrid);
    }
    
    return newGrid;
  };

  // Verificar se a troca é válida
  const isValidSwap = (grid: Piece[][], row1: number, col1: number, row2: number, col2: number): boolean => {
    const tempGrid = grid.map(row => [...row]);
    const temp = tempGrid[row1][col1];
    tempGrid[row1][col1] = tempGrid[row2][col2];
    tempGrid[row2][col2] = temp;
    
    return findMatches(tempGrid).length > 0;
  };

  // Trocar peças
  const swapPieces = async (row1: number, col1: number, row2: number, col2: number) => {
    if (gameState.isProcessing) return;

    setGameState(prev => ({ ...prev, isProcessing: true }));

    const newGrid = gameState.grid.map(row => [...row]);
    
    if (!isValidSwap(newGrid, row1, col1, row2, col2)) {
      // Jogada inválida
      const newErrors = gameState.consecutiveErrors + 1;
      setGameState(prev => ({ 
        ...prev, 
        consecutiveErrors: newErrors,
        isProcessing: false 
      }));

      if (newErrors >= 2) {
        onLifeLost();
        setGameState(prev => ({ ...prev, consecutiveErrors: 0 }));
      }
      return;
    }

    // Trocar peças
    const temp = newGrid[row1][col1];
    newGrid[row1][col1] = newGrid[row2][col2];
    newGrid[row2][col2] = temp;

    // Processar matches
    const finalGrid = await processMatches(newGrid);
    
    setGameState(prev => ({
      ...prev,
      grid: finalGrid,
      moves: prev.moves + 1,
      consecutiveErrors: 0,
      isProcessing: false,
    }));

    // Verificar condição de vitória (atingiu objetivo)
    if (gameState.score + (await new Promise<number>(r => setTimeout(() => r(gameState.score), 100))) >= config.objective) {
      onGameEnd(true, gameState.score);
      return;
    }

    // Verificar condição de derrota (sem jogadas)
    if (gameState.moves + 1 >= config.moves) {
      onLifeLost();
      onGameEnd(false, gameState.score);
    }
  };

  // Selecionar peça
  const handlePieceClick = (row: number, col: number) => {
    if (gameState.isProcessing) return;

    if (!gameState.selectedPiece) {
      setGameState(prev => ({ ...prev, selectedPiece: { row, col } }));
    } else {
      const { row: row1, col: col1 } = gameState.selectedPiece;
      const isAdjacent = 
        (Math.abs(row1 - row) === 1 && col1 === col) ||
        (Math.abs(col1 - col) === 1 && row1 === row);

      if (isAdjacent) {
        swapPieces(row1, col1, row, col);
      }
      setGameState(prev => ({ ...prev, selectedPiece: null }));
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#891523] to-[#5a0e17] p-4">
      {/* Header com informações */}
      <div className="max-w-md mx-auto mb-4">
        <Card className="bg-black/40 border-[#FFD700] p-4">
          <div className="grid grid-cols-2 gap-4 text-white">
            <div className="flex items-center gap-2">
              <Heart className="text-red-500" size={20} />
              <span className="font-bold">{lives} Vidas</span>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="text-[#FFD700]" size={20} />
              <span className="font-bold">{credits} Créditos</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="text-blue-400" size={20} />
              <span className="font-bold">{formatTime(timeLeft)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="text-[#FFD700]" size={20} />
              <span className="font-bold">{gameState.score}/{config.objective}</span>
            </div>
          </div>
          <div className="mt-2 text-center text-white text-sm">
            Fase {phase} - {difficulty === 'easy' ? 'Fácil' : difficulty === 'medium' ? 'Médio' : 'Difícil'} - Jogadas: {gameState.moves}/{config.moves}
          </div>
        </Card>
      </div>

      {/* Grid do jogo */}
      <div className="max-w-md mx-auto">
        <div 
          className="grid gap-1 bg-black/60 p-2 rounded-lg"
          style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
        >
          <AnimatePresence>
            {gameState.grid.map((row, rowIndex) =>
              row.map((piece, colIndex) => (
                <motion.button
                  key={piece.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: piece.matched ? 0 : 1, 
                    opacity: piece.matched ? 0 : 1 
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => handlePieceClick(rowIndex, colIndex)}
                  disabled={gameState.isProcessing}
                  className={`
                    aspect-square bg-gradient-to-br from-orange-600 to-orange-800 
                    rounded-lg text-3xl flex items-center justify-center
                    hover:scale-110 transition-transform active:scale-95
                    ${gameState.selectedPiece?.row === rowIndex && gameState.selectedPiece?.col === colIndex 
                      ? 'ring-4 ring-[#FFD700] scale-110' 
                      : ''}
                  `}
                >
                  {piece.type}
                </motion.button>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Indicador de erros consecutivos */}
        {gameState.consecutiveErrors > 0 && (
          <div className="mt-4 text-center">
            <Card className="bg-red-500/20 border-red-500 p-3">
              <p className="text-white font-bold">
                ⚠️ Erro {gameState.consecutiveErrors}/2 - Cuidado! Mais um erro e você perde uma vida!
              </p>
            </Card>
          </div>
        )}

        {/* Botão de compra de vida */}
        {lives === 0 && credits > 0 && (
          <div className="mt-4">
            <Button
              onClick={onBuyLife}
              className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-bold py-6 text-lg"
            >
              <Heart className="mr-2" size={24} />
              Comprar 1 Vida (1 Crédito)
            </Button>
          </div>
        )}

        {lives === 0 && credits === 0 && (
          <div className="mt-4 text-center">
            <Card className="bg-red-500/20 border-red-500 p-4">
              <p className="text-white font-bold mb-3">
                🚫 Sem vidas e sem créditos!
              </p>
              <p className="text-white/75 text-sm">
                Adicione créditos para continuar jogando
              </p>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
