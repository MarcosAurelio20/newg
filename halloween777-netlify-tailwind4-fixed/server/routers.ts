import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createCustomUser, getCustomUserByPhone, verifyCustomUserPassword, createSmsVerification, getSmsVerification, markSmsVerificationAsUsed, getDb, isAdmin, addAdmin, removeAdmin, getAllAdmins, wasVerifiedIn24Hours, updateLastVerified, updateCustomUser, isTester, getUsersVerifiedToday, getUserCredits, updateUserCredits, createTransaction, getTransactionByPaymentId, updateTransactionStatus, getUserTransactions, getAllTransactions } from "./db";
import { getPlayerData, buyLives, saveMatch, openSurpriseBox, getDailyRanking, getGameConfig, updateGameConfig, getDailyPrizePool, updatePrizePoolWithDeposit } from "./match3Db";
import { customUsers, smsVerifications } from "../drizzle/schema";
import { sendSMS, generateVerificationCode, getExpirationTime } from "./twilioService";
import { createPaymentPreference, getPaymentStatus } from './mercadopagoService';
import { TRPCError } from "@trpc/server";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  customAuth: router({
    register: publicProcedure
      .input(
        z.object({
          phone: z.string().min(10, "Telefone inválido"),
          password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
          confirmPassword: z.string(),
          inviteCode: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        // Validate passwords match
        if (input.password !== input.confirmPassword) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "As senhas não coincidem",
          });
        }

        // Check if user already exists
        const existingUser = await getCustomUserByPhone(input.phone);
        if (existingUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Este telefone já está cadastrado",
          });
        }

        // Create user
        await createCustomUser({
          phone: input.phone,
          password: input.password,
          inviteCode: input.inviteCode,
        });

        return {
          success: true,
          message: "Registro realizado com sucesso",
        };
      }),

    login: publicProcedure
      .input(
        z.object({
          phone: z.string(),
          password: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        // Verify credentials
        const isValid = await verifyCustomUserPassword(input.phone, input.password);
        
        if (!isValid) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Telefone ou senha incorretos",
          });
        }

        // Get user data
        const user = await getCustomUserByPhone(input.phone);
        
        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Usuário não encontrado",
          });
        }

        // Check if user is admin
        const userIsAdmin = await isAdmin(input.phone);

        // Check if user is tester (bypass SMS)
        const userIsTester = await isTester(input.phone);

        // Check if user was verified in last 24 hours
        const verified24h = await wasVerifiedIn24Hours(input.phone);

        return {
          success: true,
          isAdmin: userIsAdmin,
          isTester: userIsTester,
          needsVerification: !userIsAdmin && !userIsTester && !verified24h,
          user: {
            id: user.id,
            phone: user.phone,
          },
        };
      }),
  }),

  smsAuth: router({
    sendVerificationCode: publicProcedure
      .input(
        z.object({
          phone: z.string().min(10, "Telefone inválido"),
        })
      )
      .mutation(async ({ input }) => {
        // Generate 6-digit code
        const code = generateVerificationCode();
        const expiresAt = getExpirationTime();

        // Save to database
        await createSmsVerification({
          phone: input.phone,
          code,
          verified: 0,
          expiresAt,
        });

        // Send SMS
        const sent = await sendSMS(input.phone, code);

        if (!sent) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Falha ao enviar SMS. Tente novamente.",
          });
        }

        return {
          success: true,
          message: "Código de verificação enviado por SMS",
        };
      }),

    verifyCode: publicProcedure
      .input(
        z.object({
          phone: z.string(),
          code: z.string().length(6, "Código deve ter 6 dígitos"),
        })
      )
      .mutation(async ({ input }) => {
        // Get verification from database
        const verification = await getSmsVerification(input.phone, input.code);

        if (!verification) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Código de verificação não encontrado",
          });
        }

        // Check if already used
        if (verification.verified === 1) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Código já foi utilizado",
          });
        }

        // Check if expired
        if (new Date() > verification.expiresAt) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Código expirado. Solicite um novo código.",
          });
        }

        // Check if code matches
        if (verification.code !== input.code) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Código incorreto",
          });
        }

        // Mark as verified
        await markSmsVerificationAsUsed(verification.id);

        // Update last verified timestamp
        await updateLastVerified(input.phone);

        return {
          success: true,
          message: "Código verificado com sucesso",
        };
      }),
  }),

  admin: router({
    getAllUsers: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const users = await db.select().from(customUsers);
      
      // Remove passwords from response
      return users.map(({ password, ...user }) => user);
    }),

    getAllVerifications: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const verifications = await db.select().from(smsVerifications);
      return verifications;
    }),

    getStats: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      const users = await db.select().from(customUsers);
      const verifications = await db.select().from(smsVerifications);

      return {
        totalUsers: users.length,
        totalVerifications: verifications.length,
        verifiedCount: verifications.filter(v => v.verified === 1).length,
        pendingCount: verifications.filter(v => v.verified === 0).length,
      };
    }),

    getAllAdmins: publicProcedure.query(async () => {
      return await getAllAdmins();
    }),

    addAdmin: publicProcedure
      .input(z.object({ phone: z.string() }))
      .mutation(async ({ input }) => {
        await addAdmin(input.phone);
        return { success: true, message: "Admin adicionado com sucesso" };
      }),

    removeAdmin: publicProcedure
      .input(z.object({ phone: z.string() }))
      .mutation(async ({ input }) => {
        await removeAdmin(input.phone);
        return { success: true, message: "Admin removido com sucesso" };
      }),

    updateUser: publicProcedure
      .input(z.object({
        phone: z.string(),
        password: z.string().optional(),
        inviteCode: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { phone, ...data } = input;
        await updateCustomUser(phone, data);
        return { success: true, message: "Usuário atualizado com sucesso" };
      }),

    getUsersVerifiedToday: publicProcedure.query(async () => {
      const users = await getUsersVerifiedToday();
      // Remove passwords from response
      return users.map(({ password, ...user }) => user);
    }),
  }),

  match3: router({
    getPlayerData: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return await getPlayerData(input.userId);
      }),

    buyLives: publicProcedure
      .input(z.object({ userId: z.number(), amount: z.number() }))
      .mutation(async ({ input }) => {
        return await buyLives(input.userId, input.amount);
      }),

    saveMatch: publicProcedure
      .input(z.object({
        userId: z.number(),
        phase: z.number(),
        difficulty: z.string(),
        score: z.number(),
        objective: z.string(),
        objectiveValue: z.number(),
        completed: z.number(),
        timeSpent: z.number(),
        consecutiveErrors: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        const { userId, ...matchData } = input;
        return await saveMatch(userId, matchData);
      }),

    openSurpriseBox: publicProcedure
      .input(z.object({ userId: z.number(), cycleNumber: z.number() }))
      .mutation(async ({ input }) => {
        return await openSurpriseBox(input.userId, input.cycleNumber);
      }),

    getDailyRanking: publicProcedure.query(async () => {
      return await getDailyRanking();
    }),

    getGameConfig: publicProcedure.query(async () => {
      return await getGameConfig();
    }),

    updateGameConfig: publicProcedure
      .input(z.object({ key: z.string(), value: z.any(), description: z.string().optional() }))
      .mutation(async ({ input }) => {
        return await updateGameConfig(input.key, input.value, input.description);
      }),

    getDailyPrizePool: publicProcedure.query(async () => {
      return await getDailyPrizePool();
    }),
  }),

  payment: router({
    createPixPayment: publicProcedure
      .input(z.object({
        userId: z.number(),
        amount: z.number().min(1),
        userPhone: z.string(),
      }))
      .mutation(async ({ input }) => {
        try {
          // Create payment preference with Mercado Pago Checkout Pro
          const preference = await createPaymentPreference(input.amount, input.userPhone, input.userId);

          // Create transaction record
          await createTransaction({
            userId: input.userId,
            amount: input.amount,
            type: 'deposit',
            status: 'pending',
            paymentId: preference.id,
            paymentMethod: 'mercadopago',
            description: `Recarga de ${input.amount} créditos via Mercado Pago`,
          });

          return {
            success: true,
            preferenceId: preference.id,
            initPoint: preference.initPoint,
          };
        } catch (error: any) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message || 'Erro ao criar pagamento',
          });
        }
      }),

    checkPaymentStatus: publicProcedure
      .input(z.object({ paymentId: z.string() }))
      .query(async ({ input }) => {
        try {
          const status = await getPaymentStatus(input.paymentId);
          const transaction = await getTransactionByPaymentId(input.paymentId);

          // If payment is approved and transaction is still pending, update it
          if (status.status === 'approved' && transaction && transaction.status === 'pending') {
            await updateTransactionStatus(input.paymentId, 'completed');
            await updateUserCredits(transaction.userId, transaction.amount);
          }

          return {
            status: status.status,
            statusDetail: status.statusDetail,
          };
        } catch (error: any) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error.message || 'Erro ao verificar status do pagamento',
          });
        }
      }),

    getUserCredits: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const balance = await getUserCredits(input.userId);
        return { balance };
      }),

    getUserTransactions: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const transactions = await getUserTransactions(input.userId);
        return transactions;
      }),

    getAllTransactions: publicProcedure.query(async () => {
      const transactions = await getAllTransactions();
      return transactions;
    }),
  }),
});

export type AppRouter = typeof appRouter;
