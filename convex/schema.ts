import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  paintings: defineTable({
    title: v.string(),
    artist: v.optional(v.string()),
    storageId: v.id("_storage"),
    createdAt: v.number(),
  }).index("by_created", ["createdAt"]),
});
