"use client";

import { createContext, useEffect, useState } from "react";
import { initDb } from "@/lib/db/client";

export const DbReadyContext = createContext(false);

export function DbProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      if (!cancelled) setError("Tempo esgotado ao inicializar o banco");
    }, 15000);
    initDb()
      .then(() => {
        if (!cancelled) {
          clearTimeout(timer);
          setReady(true);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          clearTimeout(timer);
          setError(e instanceof Error ? e.message : String(e));
        }
      });
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
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
