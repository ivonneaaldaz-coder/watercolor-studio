import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  paintings: defineTable({
    title: v.string(),
    artist: v.optional(v.string()),
    storageId: v.id("_storage"),
    createdAt: v.number(),
  }).index("by_created", ["createdAt"]),
});
