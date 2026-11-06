import { sqliteTable, text, real } from "drizzle-orm/sqlite-core";

export const sales = sqliteTable("sales", {
  id: text("id").primaryKey(),
  amount: real("amount").notNull(),
  rawExpression: text("raw_expression").notNull(),
  note: text("note"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  dayReference: text("day_reference").notNull(),
});

export type Sale = typeof sales.$inferSelect;
export type NewSale = typeof sales.$inferInsert;
