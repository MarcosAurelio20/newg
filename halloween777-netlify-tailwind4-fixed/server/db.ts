import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, customUsers, InsertCustomUser, smsVerifications, InsertSmsVerification, adminUsers, InsertAdminUser } from "../drizzle/schema";
import bcrypt from "bcryptjs";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Custom user authentication functions
 */
export async function createCustomUser(data: InsertCustomUser) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Hash password before storing
  const hashedPassword = await bcrypt.hash(data.password, 10);

  const [user] = await db.insert(customUsers).values({
    ...data,
    password: hashedPassword,
  });

  return user;
}

export async function getCustomUserByPhone(phone: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .select()
    .from(customUsers)
    .where(eq(customUsers.phone, phone))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function verifyCustomUserPassword(
  phone: string,
  password: string
): Promise<boolean> {
  const user = await getCustomUserByPhone(phone);
  if (!user) {
    return false;
  }

  return bcrypt.compare(password, user.password);
}

/**
 * SMS Verification functions
 */
export async function createSmsVerification(data: InsertSmsVerification) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.insert(smsVerifications).values(data);
}

export async function getSmsVerification(phone: string, code: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .select()
    .from(smsVerifications)
    .where(eq(smsVerifications.phone, phone))
    .orderBy(smsVerifications.createdAt)
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function markSmsVerificationAsUsed(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .update(smsVerifications)
    .set({ verified: 1 })
    .where(eq(smsVerifications.id, id));
}

/**
 * Admin functions
 */
export async function isAdmin(phone: string): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    return false;
  }

  const result = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.phone, phone))
    .limit(1);

  return result.length > 0;
}

export async function addAdmin(phone: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.insert(adminUsers).values({ phone });
}

export async function removeAdmin(phone: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.delete(adminUsers).where(eq(adminUsers.phone, phone));
}

export async function getAllAdmins() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return await db.select().from(adminUsers);
}

/**
 * Check if user was verified in the last 24 hours
 */
export async function wasVerifiedIn24Hours(phone: string): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    return false;
  }

  const user = await getCustomUserByPhone(phone);
  if (!user || !user.lastVerified) {
    return false;
  }

  const now = new Date();
  const lastVerified = new Date(user.lastVerified);
  const hoursDiff = (now.getTime() - lastVerified.getTime()) / (1000 * 60 * 60);

  return hoursDiff < 24;
}

/**
 * Update last verified timestamp for user
 */
export async function updateLastVerified(phone: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db
    .update(customUsers)
    .set({ lastVerified: new Date() })
    .where(eq(customUsers.phone, phone));
}

/**
 * Update user information
 */
export async function updateCustomUser(phone: string, data: Partial<InsertCustomUser>) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // If password is being updated, hash it
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }

  await db
    .update(customUsers)
    .set(data)
    .where(eq(customUsers.phone, phone));
}

/**
 * Check if user is tester (bypass SMS verification)
 */
export async function isTester(phone: string): Promise<boolean> {
  return phone === "94981135236";
}

/**
 * Get users verified today
 */
export async function getUsersVerifiedToday() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const users = await db.select().from(customUsers);
  
  return users.filter(user => {
    if (!user.lastVerified) return false;
    const lastVerified = new Date(user.lastVerified);
    return lastVerified >= today;
  });
}

/**
 * Get or create user credits
 */
export async function getUserCredits(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const { userCredits } = await import("../drizzle/schema");
  
  const result = await db
    .select()
    .from(userCredits)
    .where(eq(userCredits.userId, userId))
    .limit(1);

  if (result.length === 0) {
    // Create initial credits record
    await db.insert(userCredits).values({
      userId,
      balance: 0,
    });
    return 0;
  }

  return result[0].balance;
}

/**
 * Update user credits balance
 */
export async function updateUserCredits(userId: number, amount: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const { userCredits } = await import("../drizzle/schema");
  
  const currentBalance = await getUserCredits(userId);
  const newBalance = currentBalance + amount;

  if (newBalance < 0) {
    throw new Error("Insufficient credits");
  }

  await db
    .update(userCredits)
    .set({ balance: newBalance })
    .where(eq(userCredits.userId, userId));

  return newBalance;
}

/**
 * Create a transaction record
 */
export async function createTransaction(data: {
  userId: number;
  amount: number;
  type: string;
  status?: string;
  paymentId?: string;
  paymentMethod?: string;
  pixQrCode?: string;
  pixQrCodeBase64?: string;
  description?: string;
}) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const { transactions } = await import("../drizzle/schema");
  
  const [transaction] = await db.insert(transactions).values({
    ...data,
    status: data.status || 'pending',
  });

  return transaction;
}

/**
 * Get transaction by payment ID
 */
export async function getTransactionByPaymentId(paymentId: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const { transactions } = await import("../drizzle/schema");
  
  const result = await db
    .select()
    .from(transactions)
    .where(eq(transactions.paymentId, paymentId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Update transaction status
 */
export async function updateTransactionStatus(paymentId: string, status: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const { transactions } = await import("../drizzle/schema");
  
  await db
    .update(transactions)
    .set({ status })
    .where(eq(transactions.paymentId, paymentId));
}

/**
 * Get user transactions
 */
export async function getUserTransactions(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const { transactions } = await import("../drizzle/schema");
  
  const result = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(transactions.createdAt);

  return result;
}

/**
 * Get all transactions (admin)
 */
export async function getAllTransactions() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const { transactions } = await import("../drizzle/schema");
  
  const result = await db
    .select()
    .from(transactions)
    .orderBy(transactions.createdAt);

  return result;
}
