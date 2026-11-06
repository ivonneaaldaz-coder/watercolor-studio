import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";

const ADMIN_GITHUB_ID = "263467715";

async function isAdmin(ctx: any): Promise<boolean> {
  const userId = await getAuthUserId(ctx);
  if (!userId) return false;
  const accounts = await ctx.db.query("authAccounts")
    .withIndex("userIdAndProvider", (q: any) => q.eq("userId", userId).eq("provider", "github"))
    .collect();
  return accounts.some((account: any) => account.providerAccountId === ADMIN_GITHUB_ID);
}

export const status = query({
  args: {},
  handler: async (ctx) => ({ authorized: await isAdmin(ctx) }),
});

export const remove = mutation({
  args: { id: v.id("paintings") },
  handler: async (ctx, { id }) => {
    if (!(await isAdmin(ctx))) throw new Error("Not authorized");
    const painting = await ctx.db.get(id);
    if (!painting) return;
    await ctx.storage.delete(painting.storageId);
    await ctx.db.delete(id);
  },
});
