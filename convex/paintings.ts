import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const entries = await ctx.db.query("paintings").withIndex("by_created").order("desc").take(60);
    return await Promise.all(entries.map(async (entry) => ({
      _id: entry._id,
      title: entry.title,
      artist: entry.artist,
      createdAt: entry.createdAt,
      imageUrl: await ctx.storage.getUrl(entry.storageId),
    })));
  },
});

export const uploadUrl = mutation({
  args: {},
  handler: async (ctx) => ctx.storage.generateUploadUrl(),
});

export const publish = mutation({
  args: {
    title: v.string(),
    artist: v.optional(v.string()),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const title = args.title.trim().slice(0, 80);
    const artist = args.artist?.trim().slice(0, 60);
    if (!title) throw new Error("Please enter a title.");
    const file = await ctx.db.system.get(args.storageId);
    if (!file || !file.contentType?.startsWith("image/") || file.size > 1_000_000) {
      throw new Error("Only images under 1 MB can be published.");
    }
    return ctx.db.insert("paintings", {
      title,
      artist: artist || undefined,
      storageId: args.storageId,
      createdAt: Date.now(),
    });
  },
});

// Intentionally internal-only until verified admin authentication is installed.
export const removeInternal = internalMutation({
  args: { id: v.id("paintings") },
  handler: async (ctx, { id }) => {
    const painting = await ctx.db.get(id);
    if (!painting) return;
    await ctx.storage.delete(painting.storageId);
    await ctx.db.delete(id);
  },
});
