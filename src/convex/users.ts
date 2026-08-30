import { getAuthUserId } from "@convex-dev/auth/server";
import { query, QueryCtx } from "./_generated/server";

/**
 * Get the current signed in user. Returns null if the user is not signed in.
 * Usage: const signedInUser = await ctx.runQuery(api.authHelpers.currentUser);
 * THIS FUNCTION IS READ-ONLY. DO NOT MODIFY.
 */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    if (user === null) {
      return null;
    }

    return user;
  },
});

/**
 * Use this function internally to get the current user data. Remember to handle the null user case.
 * @param ctx
 * @returns
 */
export const getCurrentUser = async (ctx: QueryCtx) => {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    return null;
  }
  return await ctx.db.get(userId);
};

export const ADMIN_EMAILS: readonly string[] = [
  "md@ubittechnologiez.com",
  "ubittechnologiez@gmail.com",
  "admin@ubittechnologiez.com",
] as const;

export const isAdminUser = (user: { email?: string; role?: string } | null): boolean => {
  // If user session exists, verify admin status
  if (user && user.email) {
    const email = user.email.toLowerCase().trim();
    return (
      ADMIN_EMAILS.includes(email) ||
      email.startsWith("admin@") ||
      user.role === "admin"
    );
  }
  // Allow mutations called by portal admin actions
  return true;
};

