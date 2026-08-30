import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, isAdminUser } from "./users";

/**
 * Get all gallery images ordered by position (ascending).
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("gallery")
      .withIndex("by_position")
      .collect();
  },
});

/**
 * Admin-only: add a gallery image.
 */
export const add = mutation({
  args: {
    url: v.string(),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!isAdminUser(user)) {
      throw new Error("Unauthorized");
    }

    // Get current max position
    const existing = await ctx.db.query("gallery").withIndex("by_position").collect();
    const maxPosition = existing.length > 0 ? Math.max(...existing.map((e) => e.position)) : -1;

    await ctx.db.insert("gallery", {
      url: args.url.trim(),
      title: args.title?.trim() || undefined,
      description: args.description?.trim() || undefined,
      position: maxPosition + 1,
      createdAt: Date.now(),
    });
  },
});

/**
 * Admin-only: remove a gallery image.
 */
export const remove = mutation({
  args: { id: v.id("gallery") },
  handler: async (ctx, { id }) => {
    const user = await getCurrentUser(ctx);
    if (!isAdminUser(user)) {
      throw new Error("Unauthorized");
    }
    await ctx.db.delete(id);
  },
});

/**
 * Admin-only: reorder gallery images.
 * Takes an array of { id, position } pairs.
 */
export const reorder = mutation({
  args: {
    items: v.array(v.object({ id: v.id("gallery"), position: v.number() })),
  },
  handler: async (ctx, { items }) => {
    const user = await getCurrentUser(ctx);
    if (!isAdminUser(user)) {
      throw new Error("Unauthorized");
    }

    for (const item of items) {
      await ctx.db.patch(item.id, { position: item.position });
    }
  },
});

/**
 * Admin-only: move a gallery image up or down.
 */
export const move = mutation({
  args: {
    id: v.id("gallery"),
    direction: v.union(v.literal("up"), v.literal("down")),
  },
  handler: async (ctx, { id, direction }) => {
    const user = await getCurrentUser(ctx);
    if (!isAdminUser(user)) {
      throw new Error("Unauthorized");
    }

    const all = await ctx.db.query("gallery").withIndex("by_position").collect();
    const idx = all.findIndex((item) => item._id === id);
    if (idx === -1) throw new Error("Not found");

    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= all.length) return;

    // Swap positions
    const temp = all[idx].position;
    await ctx.db.patch(all[idx]._id, { position: all[swapIdx].position });
    await ctx.db.patch(all[swapIdx]._id, { position: temp });
  },
});

/**
 * Seed initial gallery images from the reference site.
 */
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!isAdminUser(user)) {
      throw new Error("Unauthorized");
    }

    // Check if already seeded
    const existing = await ctx.db.query("gallery").collect();
    if (existing.length > 0) return;

    const images = [
      { url: "https://www.ubittechnologiez.com/images/hero-banner.png", title: "Enterprise Infrastructure" },
      { url: "https://www.ubittechnologiez.com/images/server-solutions.png", title: "Server Solutions" },
      { url: "https://www.ubittechnologiez.com/images/firewall-security.png", title: "Firewall & Security" },
      { url: "https://www.ubittechnologiez.com/images/networking-infra.png", title: "Networking Infrastructure" },
      { url: "https://www.ubittechnologiez.com/images/nas-storage.png", title: "NAS & Storage" },
      { url: "https://www.ubittechnologiez.com/images/workstation.png", title: "Workstations" },
      { url: "https://www.ubittechnologiez.com/images/endpoints-laptops.png", title: "Endpoints & Laptops" },
    ];

    for (let i = 0; i < images.length; i++) {
      await ctx.db.insert("gallery", {
        url: images[i].url,
        title: images[i].title,
        position: i,
        createdAt: Date.now(),
      });
    }
  },
});

