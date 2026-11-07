import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";
import { CapacitorSQLite, SQLiteConnection } from "@capacitor-community/sqlite";
import { getConnection } from "./db/client";

const DB_NAME = "vendas";

export async function exportLocalBackup() {
  const conn = getConnection();
  if (!conn) throw new Error("DB not initialized");
  const exported = await conn.exportToJson("full");
  const data = JSON.stringify(exported);
  const date = new Date().toISOString().slice(0, 10);
  const dir = "PetCaixa_Backups";
  try {
    await Filesystem.mkdir({ path: dir, directory: Directory.Documents, recursive: true });
  } catch {
    // ignore if exists
  }
  await Filesystem.writeFile({
    path: `${dir}/backup_${date}.json`,
    data,
    directory: Directory.Documents,
    encoding: Encoding.UTF8,
  });
}

export async function importLocalBackup(file: File) {
  const text = await file.text();
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
