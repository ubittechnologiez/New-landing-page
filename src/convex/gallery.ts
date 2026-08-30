import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, isAdminUser } from "./users";

/**
 * Get all gallery images ordered by position (ascending).
 * Also resolves storage URLs for direct uploads.
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db
      .query("gallery")
      .withIndex("by_position")
      .collect();

    return await Promise.all(
      items.map(async (item) => {
        let displayUrl = item.url;
        if (item.storageId) {
          const storageUrl = await ctx.storage.getUrl(item.storageId);
          if (storageUrl) {
            displayUrl = storageUrl;
          }
        }
        return {
          ...item,
          url: displayUrl,
        };
      }),
    );
  },
});

/**
 * Admin-only: generate an upload URL for file storage.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Admin-only: add a gallery image.
 */
export const add = mutation({
  args: {
    url: v.string(),
    storageId: v.optional(v.id("_storage")),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    client: v.optional(v.string()),
    altText: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    position: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Get current max position
    const existing = await ctx.db.query("gallery").withIndex("by_position").collect();
    const maxPosition = existing.length > 0 ? Math.max(...existing.map((e) => e.position)) : -1;
    const targetPosition = args.position !== undefined ? args.position : maxPosition + 1;

    const id = await ctx.db.insert("gallery", {
      url: args.url.trim(),
      storageId: args.storageId,
      title: args.title?.trim() || undefined,
      description: args.description?.trim() || undefined,
      category: args.category?.trim() || "Enterprise IT",
      client: args.client?.trim() || undefined,
      altText: args.altText?.trim() || args.title?.trim() || "UBIT Project Gallery",
      featured: args.featured ?? false,
      position: targetPosition,
      createdAt: Date.now(),
    });

    return id;
  },
});

/**
 * Admin-only: update a gallery image's content & metadata.
 */
export const update = mutation({
  args: {
    id: v.id("gallery"),
    url: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    client: v.optional(v.string()),
    altText: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    position: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const current = await ctx.db.get(args.id);
    if (!current) throw new Error("Gallery item not found");

    // If changing storageId and old one exists, optionally clean up old file
    if (args.storageId && current.storageId && args.storageId !== current.storageId) {
      try {
        await ctx.storage.delete(current.storageId);
      } catch (e) {
        console.error("Failed to delete old storage file:", e);
      }
    }

    await ctx.db.patch(args.id, {
      ...(args.url !== undefined ? { url: args.url.trim() } : {}),
      ...(args.storageId !== undefined ? { storageId: args.storageId } : {}),
      ...(args.title !== undefined ? { title: args.title.trim() || undefined } : {}),
      ...(args.description !== undefined ? { description: args.description.trim() || undefined } : {}),
      ...(args.category !== undefined ? { category: args.category.trim() || undefined } : {}),
      ...(args.client !== undefined ? { client: args.client.trim() || undefined } : {}),
      ...(args.altText !== undefined ? { altText: args.altText.trim() || undefined } : {}),
      ...(args.featured !== undefined ? { featured: args.featured } : {}),
      ...(args.position !== undefined ? { position: args.position } : {}),
    });
  },
});

/**
 * Admin-only: remove a gallery image.
 */
export const remove = mutation({
  args: { id: v.id("gallery") },
  handler: async (ctx, { id }) => {
    const item = await ctx.db.get(id);
    if (item?.storageId) {
      try {
        await ctx.storage.delete(item.storageId);
      } catch (e) {
        console.error("Storage delete warning:", e);
      }
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
      {
        url: "https://www.ubittechnologiez.com/images/hero-banner.png",
        title: "Enterprise Server Infrastructure",
        category: "Server Solutions",
        description: "High-density rackmount computing clusters and SAN storage deployed for high-availability workloads.",
        client: "FinTech Data Center",
        altText: "Enterprise server racks in a secure tier-3 data center",
        featured: true,
      },
      {
        url: "https://www.ubittechnologiez.com/images/server-solutions.png",
        title: "High-Density Blade Servers",
        category: "Server Solutions",
        description: "Custom thermal-optimized compute nodes for intensive virtualization and database clusters.",
        client: "Healthcare Cloud Node",
        altText: "High density enterprise blade servers",
        featured: true,
      },
      {
        url: "https://www.ubittechnologiez.com/images/firewall-security.png",
        title: "Next-Gen Fortinet & Cisco Security",
        category: "Cybersecurity",
        description: "Multi-gigabit hardware firewalls, unified threat management, and automated zero-trust perimeter defenses.",
        client: "Regional Banking Group",
        altText: "Enterprise hardware firewalls with active security monitoring",
        featured: true,
      },
      {
        url: "https://www.ubittechnologiez.com/images/networking-infra.png",
        title: "100GbE Core Optical Switching",
        category: "Networking",
        description: "Redundant spine-and-leaf network fabrics ensuring microsecond latency and zero packet loss.",
        client: "Telecommunications Hub",
        altText: "Fiber optic patch cables and high speed switches",
        featured: false,
      },
      {
        url: "https://www.ubittechnologiez.com/images/nas-storage.png",
        title: "Enterprise All-Flash & Hybrid NAS",
        category: "Storage",
        description: "Scalable petabyte-scale network attached storage arrays with automated snapshots and off-site backup.",
        client: "Media & Broadcast Studio",
        altText: "All-flash enterprise NAS rack unit",
        featured: false,
      },
      {
        url: "https://www.ubittechnologiez.com/images/workstation.png",
        title: "Mission-Critical AI Workstations",
        category: "Workstations",
        description: "GPU-accelerated desktop towers for engineering simulation, 3D CAD modeling, and deep learning.",
        client: "Engineering Design Firm",
        altText: "High performance workstation with dual GPU cooling",
        featured: false,
      },
      {
        url: "https://www.ubittechnologiez.com/images/endpoints-laptops.png",
        title: "Enterprise Fleet Deployment",
        category: "Endpoints",
        description: "Zero-touch configured corporate mobile laptops equipped with endpoint detection and BitLocker encryption.",
        client: "Logistics Enterprise",
        altText: "Corporate laptop fleet rollout",
        featured: false,
      },
    ];

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      await ctx.db.insert("gallery", {
        url: img.url,
        title: img.title,
        category: img.category,
        description: img.description,
        client: img.client,
        altText: img.altText,
        featured: img.featured,
        position: i,
        createdAt: Date.now(),
      });
    }
  },
});


