"use client";

import { useEffect, useState } from "react";
import { SaleForm } from "@/components/SaleForm";
import { HistoryView } from "@/components/HistoryView";
import { Toast } from "@/components/Toast";
import { PawPrint, Wallet, TrendingUp, Users, Pencil, Trash2 } from "lucide-react";
import { getSalesByDay, getDaySummary, deleteSale } from "@/lib/db/salesRepo";
import { toDayReference } from "@/lib/timezone";
import type { Sale } from "@/lib/db/schema";

export default function Home() {
  const [tab, setTab] = useState<"registrar" | "historico">("registrar");
  const [day, setDay] = useState(toDayReference());
  const [sales, setSales] = useState<Sale[]>([]);
  const [summary, setSummary] = useState({ total: 0, count: 0, avg: 0 });
  const [editing, setEditing] = useState<Sale | null>(null);
  const [refresh, setRefresh] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const [list, sum] = await Promise.all([getSalesByDay(day), getDaySummary(day)]);
      if (!active) return;
      setSales(list);
      setSummary(sum);
    })();
    return () => {
      active = false;
    };
  }, [day, refresh]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  async function handleSaved() {
    setEditing(null);
    setRefresh((v) => v + 1);
    setToast("Venda registrada");
  }

  async function handleDelete(id: string) {
    await deleteSale(id);
    setRefresh((v) => v + 1);
    setToast("Venda excluida");
  }

  return (
    <main className="mx-auto max-w-md bg-[#081318]">
      <header className="sticky top-0 z-10 border-b border-teal-800/40 bg-[#0e222b]/90 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="flex items-center gap-2 text-lg font-extrabold text-white">
            <PawPrint className="h-5 w-5 text-yellow-400" />
            PetCaixa
          </h1>
          <div className="flex items-center gap-1 text-xs text-teal-300/70">
            <span className="h-2 w-2 animate-pulse rounded-full bg-yellow-400" />
            Recife (UTC-3)
          </div>
        </div>
      </header>

      <div className="p-4">
        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setTab("registrar")}
            className={`flex-1 rounded-xl py-2 text-sm font-semibold ${
              tab === "registrar"
                ? "bg-yellow-400 text-slate-950 font-black shadow shadow-yellow-400/25"
                : "bg-[#0e222b]/90 text-teal-200/70 border border-teal-800/40"
            }`}
          >
            Registrar
          </button>
          <button
            onClick={() => setTab("historico")}
            className={`flex-1 rounded-xl py-2 text-sm font-semibold ${
              tab === "historico"
                ? "bg-yellow-400 text-slate-950 font-black shadow shadow-yellow-400/25"
                : "bg-[#0e222b]/90 text-teal-200/70 border border-teal-800/40"
            }`}
          >
            Histórico
          </button>
        </div>

        {tab === "registrar" ? (
          <div className="space-y-4">
            <div className="rounded-3xl border border-teal-800/40 bg-[#0e222b]/90 p-4 shadow-blue-950/50">
              <SaleForm
                key={editing?.id ?? "new"}
                editing={editing}
                onSaved={handleSaved}
                onCancelEdit={() => setEditing(null)}
              />
            </div>
            <div className="rounded-3xl border border-teal-800/40 bg-[#0e222b]/90 p-4 shadow-blue-950/50">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-medium text-teal-200/70">Dia</span>
                <input
                  type="date"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="rounded-lg border border-teal-800/40 bg-[#060e12] px-2 py-1 text-white"
                />
              </div>
              <div className="mb-3 grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-[#060e12] p-2 text-center">
                  <div className="text-lg font-extrabold text-white">{summary.count}</div>
                  <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase text-teal-300/70">
                    <Users className="h-3 w-3" /> Qtd Vendas
                  </div>
                </div>
                <div className="rounded-lg bg-[#060e12] p-2 text-center">
                  <div className="text-lg font-extrabold text-white">{Math.min(Number(summary.total), 9999999.99).toFixed(2).replace(".", ",")}</div>
                  <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase text-teal-300/70">
                    <Wallet className="h-3 w-3" /> Total do Dia
                  </div>
                </div>
                <div className="rounded-lg bg-[#060e12] p-2 text-center">
                  <div className="text-lg font-extrabold text-teal-400">{Number(summary.avg).toFixed(2).replace(".", ",")}</div>
                  <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase text-teal-300/70">
                    <TrendingUp className="h-3 w-3" /> Ticket Médio
                  </div>
                </div>
              </div>
              <ul className="divide-y divide-blue-900/30">
                {sales.map((s) => (
                  <li key={s.id} className="flex items-center justify-between py-3">
                    <div>
                      <div className="font-semibold text-white">{Number(s.amount).toFixed(2).replace(".", ",")}</div>
                      <div className="text-xs text-teal-300/70">{s.note}</div>
                      <span className="mt-1 inline-block rounded border border-yellow-400/20 bg-yellow-400/10 px-1.5 py-0.5 font-mono text-[11px] text-blue-200/90">
                        {s.rawExpression}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setEditing(s)}
                        className="text-teal-400"
                        aria-label="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="text-red-400"
                        aria-label="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <HistoryView />
        )}
      </div>
      <Toast message={toast} />
    </main>
  );
}
