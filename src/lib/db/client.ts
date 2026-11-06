import { Capacitor } from "@capacitor/core";
import { CapacitorSQLite, SQLiteConnection } from "@capacitor-community/sqlite";
import type { ISQLiteDBConnection } from "@capacitor-community/sqlite";
import { drizzle } from "drizzle-orm/sqlite-proxy";
import * as schema from "./schema";

const DB_NAME = "vendas";

let connection: ISQLiteDBConnection | null = null;
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

export async function initDb() {
  const sqlite = new SQLiteConnection(CapacitorSQLite);

  if (Capacitor.getPlatform() === "web") {
    await import("jeep-sqlite");
    const jeep = document.createElement("jeep-sqlite");
    document.body.appendChild(jeep);
    await customElements.whenDefined("jeep-sqlite");
    await sqlite.initWebStore();
  }

  connection = await sqlite.createConnection(DB_NAME, false, "no-encryption", 1, false);
  await connection.open();

  await connection.execute(
    `CREATE TABLE IF NOT EXISTS sales (
      id TEXT PRIMARY KEY,
      amount REAL NOT NULL,
      raw_expression TEXT NOT NULL,
      note TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      day_reference TEXT NOT NULL
    );`,
    true
  );

  const callback = async (sql: string, params: unknown[], method: string) => {
    if (method === "run") {
      await connection!.run(sql, params ?? [], false);
      return { rows: [] };
    }
    const res = await connection!.query(sql, params ?? []);
    const rows = res.values ?? [];
    if (method === "get") {
      return { rows: rows[0] ? Object.values(rows[0] as Record<string, unknown>) : [] };
    }
    return { rows: rows.map((r) => Object.values(r as Record<string, unknown>)) };
  };

  dbInstance = drizzle(callback, { schema });
  return dbInstance;
}

export function getDb() {
  if (!dbInstance) throw new Error("DB not initialized");
  return dbInstance;
}

export async function persistDb() {
  if (Capacitor.getPlatform() === "web") {
    try {
      const sqlite = new SQLiteConnection(CapacitorSQLite);
      await sqlite.saveToStore(DB_NAME);
    } catch {
      // ignore
    }
  }
}

export function getConnection() {
  return connection;
}
