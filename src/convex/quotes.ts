import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

const ADMIN_EMAIL = "MD@ubittechnologiez.com";

/**
 * Public mutation: submit a quote request (no login required).
 */
export const submitPublic = mutation({
  args: {
    clientName: v.string(),
    company: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    category: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Store with status "New enquiry"
    await ctx.db.insert("quotes", {
      clientName: args.clientName.trim(),
      company: args.company.trim(),
      email: args.email.trim(),
      phone: args.phone?.trim() || undefined,
      category: args.category,
      status: "New enquiry",
      notes: args.notes?.trim() || undefined,
      createdAt: Date.now(),
    });
  },
});

/**
 * Admin-only: list ALL quote requests, newest first.
 */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    
    // Only admin can view all quotes
    if (user === null || user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return [];
    }

    return await ctx.db
      .query("quotes")
      .withIndex("by_createdAt")
      .order("desc")
      .collect();
  },
});

/**
 * Admin-only: update quote status.
 */
export const updateStatus = mutation({
  args: {
    id: v.id("quotes"),
    status: v.string(),
  },
  handler: async (ctx, { id, status }) => {
    const user = await getCurrentUser(ctx);
    
    // Only admin can update status
    if (user === null || user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      throw new Error("Unauthorized: Only admin can update quote status.");
    }

    const quote = await ctx.db.get(id);
    if (quote === null) {
      throw new Error("Quote request not found.");
    }

    await ctx.db.patch(id, { status });
  },
});

/**
 * Admin-only: delete a quote request.
 */
export const remove = mutation({
  args: { id: v.id("quotes") },
  handler: async (ctx, { id }) => {
    const user = await getCurrentUser(ctx);
    
    // Only admin can delete
    if (user === null || user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      throw new Error("Unauthorized: Only admin can delete quotes.");
    }

    const quote = await ctx.db.get(id);
    if (quote === null) {
      throw new Error("Quote request not found.");
    }

    await ctx.db.delete(id);
  },
});

/**
 * Get stats for admin dashboard.
 */
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    
    // Only admin can view stats
    if (user === null || user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return { total: 0, sent: 0, won: 0, newEnquiries: 0 };
    }

    const quotes = await ctx.db.query("quotes").collect();
    
    return {
      total: quotes.length,
      sent: quotes.filter((q) => q.status === "Quotation sent").length,
      won: quotes.filter((q) => q.status === "Won").length,
      newEnquiries: quotes.filter((q) => q.status === "New enquiry").length,
    };
  },
});
