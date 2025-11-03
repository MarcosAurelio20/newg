import { eq, and, desc } from "drizzle-orm";
import { getDb } from "./db";
import { 
  playerLives, 
  playerProgress, 
  gameMatches, 
  dailyRanking,
  prizePool,
  surpriseBoxHistory,
  gameConfig,
  userCredits,
  InsertGameMatch,
  InsertSurpriseBoxHistory
} from "../drizzle/schema";

// Obter dados do jogador
export async function getPlayerData(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Buscar vidas
  let lives = await db.select().from(playerLives).where(eq(playerLives.userId, userId)).limit(1);
  if (lives.length === 0) {
    await db.insert(playerLives).values({ userId, lives: 3 });
    lives = [{ id: 0, userId, lives: 3, updatedAt: new Date() }];
  }

  // Buscar progresso
  let progress = await db.select().from(playerProgress).where(eq(playerProgress.userId, userId)).limit(1);
  if (progress.length === 0) {
    await db.insert(playerProgress).values({ userId, currentPhase: 1, cyclesCompleted: 0, totalScore: 0 });
    progress = [{ id: 0, userId, currentPhase: 1, cyclesCompleted: 0, totalScore: 0, updatedAt: new Date() }];
  }

  // Buscar créditos
  let credits = await db.select().from(userCredits).where(eq(userCredits.userId, userId)).limit(1);
  if (credits.length === 0) {
    await db.insert(userCredits).values({ userId, balance: 0 });
    credits = [{ id: 0, userId, balance: 0, updatedAt: new Date() }];
  }

  return {
    lives: lives[0].lives,
    credits: credits[0].balance,
    currentPhase: progress[0].currentPhase,
    cyclesCompleted: progress[0].cyclesCompleted,
    totalScore: progress[0].totalScore,
  };
}

// Comprar vidas com créditos
export async function buyLives(userId: number, amount: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Verificar créditos
  const credits = await db.select().from(userCredits).where(eq(userCredits.userId, userId)).limit(1);
  if (credits.length === 0 || credits[0].balance < amount) {
    throw new Error("Insufficient credits");
  }

  // Deduzir créditos
  await db.update(userCredits)
    .set({ balance: credits[0].balance - amount })
    .where(eq(userCredits.userId, userId));

  // Adicionar vidas
  const lives = await db.select().from(playerLives).where(eq(playerLives.userId, userId)).limit(1);
  if (lives.length > 0) {
    await db.update(playerLives)
      .set({ lives: lives[0].lives + amount })
      .where(eq(playerLives.userId, userId));
  } else {
    await db.insert(playerLives).values({ userId, lives: amount });
  }

  return { success: true };
}

// Salvar partida
export async function saveMatch(userId: number, matchData: Omit<InsertGameMatch, 'userId' | 'createdAt'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Salvar partida
  await db.insert(gameMatches).values({
    userId,
    ...matchData,
  });

  // Atualizar progresso se completou
  if (matchData.completed === 1) {
    const progress = await db.select().from(playerProgress).where(eq(playerProgress.userId, userId)).limit(1);
    if (progress.length > 0) {
      const newPhase = progress[0].currentPhase + 1;
      const newCycles = newPhase > 10 ? progress[0].cyclesCompleted + 1 : progress[0].cyclesCompleted;
      const actualPhase = newPhase > 10 ? 1 : newPhase;

      await db.update(playerProgress)
        .set({ 
          currentPhase: actualPhase,
          cyclesCompleted: newCycles,
          totalScore: progress[0].totalScore + (matchData.score || 0) 
        })
        .where(eq(playerProgress.userId, userId));
    }

    // Atualizar ranking diário
    await updateDailyRanking(userId, matchData.score || 0, matchData.difficulty);
  }

  return { success: true };
}

// Atualizar ranking diário
async function updateDailyRanking(userId: number, score: number, difficulty: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const today = new Date().toISOString().split('T')[0];

  const existing = await db.select().from(dailyRanking)
    .where(and(eq(dailyRanking.userId, userId), eq(dailyRanking.date, today)))
    .limit(1);

  if (existing.length > 0) {
    await db.update(dailyRanking)
      .set({
        totalScore: existing[0].totalScore + score,
        matchesPlayed: existing[0].matchesPlayed + 1,
        highestDifficulty: difficulty === 'hard' ? 'hard' : existing[0].highestDifficulty === 'hard' ? 'hard' : difficulty === 'medium' ? 'medium' : existing[0].highestDifficulty,
      })
      .where(eq(dailyRanking.id, existing[0].id));
  } else {
    await db.insert(dailyRanking).values({
      userId,
      date: today,
      totalScore: score,
      matchesPlayed: 1,
      highestDifficulty: difficulty,
    });
  }
}

// Abrir caixa surpresa
export async function openSurpriseBox(userId: number, cycleNumber: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Buscar configurações da caixa
  const config = await getGameConfig();
  const chance = config.surpriseBoxChance || 5;
  const prizeType = config.surpriseBoxPrizeType || 'lives';
  const prizeAmount = config.surpriseBoxPrizeAmount || 1;
  const enabled = config.surpriseBoxEnabled !== false;

  if (!enabled) {
    return { won: false };
  }

  // Sortear
  const won = Math.random() * 100 < chance;

  // Salvar histórico
  await db.insert(surpriseBoxHistory).values({
    userId,
    cycleNumber,
    won: won ? 1 : 0,
    prizeType: won ? prizeType : null,
    prizeAmount: won ? prizeAmount : null,
  });

  // Se ganhou, adicionar prêmio
  if (won) {
    if (prizeType === 'lives') {
      const lives = await db.select().from(playerLives).where(eq(playerLives.userId, userId)).limit(1);
      if (lives.length > 0) {
        await db.update(playerLives)
          .set({ lives: lives[0].lives + prizeAmount })
          .where(eq(playerLives.userId, userId));
      }
    } else if (prizeType === 'credits') {
      const credits = await db.select().from(userCredits).where(eq(userCredits.userId, userId)).limit(1);
      if (credits.length > 0) {
        await db.update(userCredits)
          .set({ balance: credits[0].balance + prizeAmount })
          .where(eq(userCredits.userId, userId));
      }
    }
  }

  return { 
    won, 
    prize: won ? { type: prizeType, amount: prizeAmount } : undefined 
  };
}

// Obter ranking diário
export async function getDailyRanking() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const today = new Date().toISOString().split('T')[0];

  const ranking = await db.select({
    userId: dailyRanking.userId,
    totalScore: dailyRanking.totalScore,
    matchesPlayed: dailyRanking.matchesPlayed,
    highestDifficulty: dailyRanking.highestDifficulty,
    position: dailyRanking.position,
    prizeAmount: dailyRanking.prizeAmount,
  })
  .from(dailyRanking)
  .where(eq(dailyRanking.date, today))
  .orderBy(desc(dailyRanking.totalScore))
  .limit(100);

  return ranking;
}

// Obter configurações do jogo
export async function getGameConfig() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const configs = await db.select().from(gameConfig);
  
  const configObj: Record<string, any> = {};
  configs.forEach(c => {
    try {
      configObj[c.key] = JSON.parse(c.value);
    } catch {
      configObj[c.key] = c.value;
    }
  });

  return configObj;
}

// Atualizar configuração do jogo
export async function updateGameConfig(key: string, value: any, description?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(gameConfig).where(eq(gameConfig.key, key)).limit(1);

  const valueStr = typeof value === 'string' ? value : JSON.stringify(value);

  if (existing.length > 0) {
    await db.update(gameConfig)
      .set({ value: valueStr, description })
      .where(eq(gameConfig.key, key));
  } else {
    await db.insert(gameConfig).values({ key, value: valueStr, description });
  }

  return { success: true };
}

// Obter pool de prêmios do dia
export async function getDailyPrizePool() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const today = new Date().toISOString().split('T')[0];

  let pool = await db.select().from(prizePool).where(eq(prizePool.date, today)).limit(1);
  
  if (pool.length === 0) {
    await db.insert(prizePool).values({
      date: today,
      baseAmount: 54, // 2+5+10+15+20
      depositedAmount: 0,
      prizePercentage: 10,
      totalPrize: 54,
      distributed: 0,
    });
    pool = await db.select().from(prizePool).where(eq(prizePool.date, today)).limit(1);
  }

  return pool[0];
}

// Atualizar pool de prêmios com depósito
export async function updatePrizePoolWithDeposit(amount: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const today = new Date().toISOString().split('T')[0];
  const pool = await getDailyPrizePool();

  const newDepositedAmount = pool.depositedAmount + amount;
  const prizeFromDeposits = Math.floor(newDepositedAmount * pool.prizePercentage / 100);
  const newTotalPrize = pool.baseAmount + prizeFromDeposits;

  await db.update(prizePool)
    .set({
      depositedAmount: newDepositedAmount,
      totalPrize: newTotalPrize,
    })
    .where(eq(prizePool.date, today));

  return { success: true };
}
