import { eq, like, sql, desc } from "drizzle-orm";
import { getDb } from "./client";
import { sales } from "./schema";
import { persistDb } from "./client";
import type { Sale, NewSale } from "./schema";

export async function insertSale(data: NewSale) {
  const db = getDb();
  await db.insert(sales).values(data);
  await persistDb();
}

export async function updateSale(id: string, data: Partial<NewSale>) {
  const db = getDb();
  await db.update(sales).set(data).where(eq(sales.id, id));
  await persistDb();
}

export async function deleteSale(id: string) {
  const db = getDb();
  await db.delete(sales).where(eq(sales.id, id));
  await persistDb();
}

export async function getSalesByDay(day: string): Promise<Sale[]> {
  const db = getDb();
  return db.select().from(sales).where(eq(sales.dayReference, day)).orderBy(desc(sales.createdAt));
}

export async function getDaySummary(day: string) {
  const db = getDb();
  const rows = await db
    .select({
      total: sql<number>`COALESCE(SUM(${sales.amount}),0)`,
      count: sql<number>`COUNT(*)`,
      avg: sql<number>`COALESCE(AVG(${sales.amount}),0)`,
    })
    .from(sales)
    .where(eq(sales.dayReference, day));
  return rows[0] ?? { total: 0, count: 0, avg: 0 };
}

export async function getDaysInMonth(month: string) {
  const db = getDb();
  return db
    .select({
      day: sales.dayReference,
      total: sql<number>`COALESCE(SUM(${sales.amount}),0)`,
      count: sql<number>`COUNT(*)`,
      avg: sql<number>`COALESCE(AVG(${sales.amount}),0)`,
    })
    .from(sales)
    .where(like(sales.dayReference, `${month}%`))
    .groupBy(sales.dayReference)
    .orderBy(sales.dayReference);
}

export async function getMonthSummary(month: string) {
  const db = getDb();
  const rows = await db
    .select({
      total: sql<number>`COALESCE(SUM(${sales.amount}),0)`,
      count: sql<number>`COUNT(*)`,
      avg: sql<number>`COALESCE(AVG(${sales.amount}),0)`,
    })
    .from(sales)
    .where(like(sales.dayReference, `${month}%`));
  return rows[0] ?? { total: 0, count: 0, avg: 0 };
}

export async function getMonthsSummary() {
  const db = getDb();
  return db
    .select({
      month: sql<string>`substr(${sales.dayReference},1,7)`,
      total: sql<number>`COALESCE(SUM(${sales.amount}),0)`,
      count: sql<number>`COUNT(*)`,
      avg: sql<number>`COALESCE(AVG(${sales.amount}),0)`,
    })
    .from(sales)
    .groupBy(sql`substr(${sales.dayReference},1,7)`)
    .orderBy(sql`substr(${sales.dayReference},1,7)`);
}
