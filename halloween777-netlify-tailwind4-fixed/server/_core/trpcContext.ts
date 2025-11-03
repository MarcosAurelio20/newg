import { inferAsyncReturnType } from "@trpc/server";

export async function createContext({ req, res }: any) {
  return { req, res };
}

export type Context = inferAsyncReturnType<typeof createContext>;
