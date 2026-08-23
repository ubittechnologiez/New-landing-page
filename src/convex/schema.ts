import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // Quote requests — public submissions from customers.
    quotes: defineTable({
      userId: v.optional(v.id("users")), // optional: owner if logged in
      clientName: v.string(), // contact person name
      company: v.string(), // client company
      email: v.string(), // customer email
      phone: v.optional(v.string()), // customer phone
      category: v.string(), // e.g. "Server Solutions"
      status: v.string(), // e.g. "New enquiry", "Won", "Closed"
      notes: v.optional(v.string()), // requirements / follow-up notes
      createdAt: v.number(), // ms timestamp
    })
      .index("by_user", ["userId"])
      .index("by_createdAt", ["createdAt"]),

    // Gallery images
    gallery: defineTable({
      url: v.string(), // image URL
      title: v.optional(v.string()), // optional caption
      description: v.optional(v.string()), // optional description
      position: v.number(), // sort order
      createdAt: v.number(),
    }).index("by_position", ["position"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
