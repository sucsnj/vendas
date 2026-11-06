"use client";

import { useEffect, useState } from "react";
import { SaleForm } from "@/components/SaleForm";
import { HistoryView } from "@/components/HistoryView";
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

  async function handleSaved() {
    setEditing(null);
    setRefresh((v) => v + 1);
  }

  async function handleDelete(id: string) {
    await deleteSale(id);
    setRefresh((v) => v + 1);
  }

  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="mb-4 text-2xl font-bold">Vendas</h1>
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setTab("registrar")}
          className={`flex-1 rounded-xl py-2 text-sm font-semibold ${
            tab === "registrar" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Registrar
        </button>
        <button
          onClick={() => setTab("historico")}
          className={`flex-1 rounded-xl py-2 text-sm font-semibold ${
            tab === "historico" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          Histórico
        </button>
      </div>

      {tab === "registrar" ? (
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <SaleForm
              key={editing?.id ?? "new"}
              editing={editing}
              onSaved={handleSaved}
              onCancelEdit={() => setEditing(null)}
            />
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <input
                type="date"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="rounded-lg border border-gray-300 px-2 py-1"
              />
            </div>
            <div className="mb-3 grid grid-cols-3 gap-2 text-center text-sm">
              <div className="rounded-lg bg-gray-100 p-2">
                <div className="font-bold">{summary.count}</div>
                <div className="text-gray-500">Qtd</div>
              </div>
              <div className="rounded-lg bg-gray-100 p-2">
                <div className="font-bold">{Number(summary.total).toFixed(2)}</div>
                <div className="text-gray-500">Total</div>
              </div>
              <div className="rounded-lg bg-gray-100 p-2">
                <div className="font-bold">{Number(summary.avg).toFixed(2)}</div>
                <div className="text-gray-500">Ticket</div>
              </div>
            </div>
            <ul className="divide-y">
              {sales.map((s) => (
                <li key={s.id} className="flex items-center justify-between py-2">
                  <div>
                    <div className="font-semibold">{Number(s.amount).toFixed(2)}</div>
                    <div className="text-xs text-gray-500">{s.note}</div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditing(s)}
                      className="text-sm text-blue-600"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="text-sm text-red-600"
                    >
                      Excluir
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
    </main>
  );
}
