import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";
import * as XLSX from "xlsx";
import { getConnection, getDb } from "./db/client";
import { sales } from "./db/schema";

const DB_NAME = "vendas";

function downloadBlob(data: BlobPart, filename: string, mime: string) {
  if (typeof document === "undefined") return;
  const blob = new Blob([data], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function ensureDir() {
  try {
    await Filesystem.mkdir({ path: "PetCaixa_Backups", directory: Directory.Documents, recursive: true });
  } catch {
    // ignore
  }
}

export async function exportLocalBackup(format: "json" | "xlsx" = "json", silent = false) {
  const isWeb = Capacitor.getPlatform() === "web";
  const date = new Date().toISOString().slice(0, 10);

  if (format === "json") {
    const conn = getConnection();
    if (!conn) throw new Error("DB not initialized");
    const exported = await conn.exportToJson("full");
    const payload = (exported as { export?: unknown }).export ?? exported;
    const data = JSON.stringify(payload, null, 2);
    const filename = `backup_${date}.json`;

    if (isWeb && !silent) {
      downloadBlob(data, filename, "application/json");
      return;
    }
    if (isWeb && silent) return;

    await ensureDir();
    await Filesystem.writeFile({
      path: `PetCaixa_Backups/${filename}`,
      data,
      directory: Directory.Documents,
      encoding: Encoding.UTF8,
    });
    return;
  }

  // XLSX
  const db = getDb();
  const rows = await db.select().from(sales);
  const ws = XLSX.utils.json_to_sheet(
    rows.map((r) => ({
      id: r.id,
      amount: r.amount,
      raw_expression: r.rawExpression,
      note: r.note ?? "",
      created_at: r.createdAt,
      updated_at: r.updatedAt,
      day_reference: r.dayReference,
    }))
  );
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "sales");
  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const filename = `backup_${date}.xlsx`;

  if (isWeb && !silent) {
    downloadBlob(buffer, filename, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    return;
  }
  if (isWeb && silent) return;

  await ensureDir();
  await Filesystem.writeFile({
    path: `PetCaixa_Backups/${filename}`,
    data: btoa(String.fromCharCode(...new Uint8Array(buffer))),
    directory: Directory.Documents,
    encoding: "base64" as unknown as Encoding,
  });
}

export async function importLocalBackup(file: File) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);
    const db = getDb();
    for (const r of rows) {
      await db.insert(sales).values({
        id: String(r.id),
        amount: Number(r.amount),
        rawExpression: String(r.raw_expression ?? r.rawExpression ?? ""),
        note: r.note ? String(r.note) : null,
        createdAt: String(r.created_at ?? r.createdAt),
        updatedAt: String(r.updated_at ?? r.updatedAt),
        dayReference: String(r.day_reference ?? r.dayReference),
      }).onConflictDoUpdate({
        target: sales.id,
        set: {
          amount: Number(r.amount),
          rawExpression: String(r.raw_expression ?? r.rawExpression ?? ""),
          note: r.note ? String(r.note) : null,
          updatedAt: String(r.updated_at ?? r.updatedAt),
          dayReference: String(r.day_reference ?? r.dayReference),
        },
      });
    }
    return;
  }

  // JSON
  const text = await file.text();
  const conn = getConnection();
  try {
    if (conn) await conn.close();
  } catch {
    // ignore
  }
  const { CapacitorSQLite, SQLiteConnection } = await import("@capacitor-community/sqlite");
  const sqlite = new SQLiteConnection(CapacitorSQLite);
  await sqlite.importFromJson(text);
  if (Capacitor.getPlatform() === "web") {
    try {
      await sqlite.saveToStore(DB_NAME);
    } catch {
      // ignore
    }
  }
  window.location.reload();
}
