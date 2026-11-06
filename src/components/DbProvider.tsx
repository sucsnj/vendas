"use client";

import { createContext, useEffect, useState } from "react";
import { initDb } from "@/lib/db/client";

export const DbReadyContext = createContext(false);

export function DbProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initDb()
      .then(() => setReady(true))
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 text-red-600">
        Erro ao inicializar banco: {error}
      </div>
    );
  }
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        Carregando...
      </div>
    );
  }
  return <>{children}</>;
}
