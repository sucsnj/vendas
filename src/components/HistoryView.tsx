"use client";

import { useEffect, useState } from "react";
import {
  getMonthsSummary,
  getDaysInMonth,
  getSalesByDay,
  getMonthSummary,
  deleteSale,
} from "@/lib/db/salesRepo";
import type { Sale } from "@/lib/db/schema";
import { Trash2 } from "lucide-react";
import { Toast } from "./Toast";

export function HistoryView() {
  type MonthRow = { month: string; total: number; count: number; avg: number };
  type DayRow = { day: string; total: number; count: number; avg: number };
  const [months, setMonths] = useState<MonthRow[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [days, setDays] = useState<DayRow[]>([]);
  const [monthSummary, setMonthSummary] = useState({ total: 0, count: 0, avg: 0 });
  const [selectedDay, setSelectedDay] = useState<string>("");
  const [sales, setSales] = useState<Sale[]>([]);
  const [refresh, setRefresh] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const m = await getMonthsSummary();
      setMonths(m);
      if (!selectedMonth && m.length) setSelectedMonth(m[m.length - 1].month);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  useEffect(() => {
    if (!selectedMonth) return;
    (async () => {
      const [d, ms] = await Promise.all([
        getDaysInMonth(selectedMonth),
        getMonthSummary(selectedMonth),
      ]);
      setDays(d);
      setMonthSummary(ms);
      if (d.length && !selectedDay) setSelectedDay(d[d.length - 1].day);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, refresh]);

  useEffect(() => {
    if (!selectedDay) return;
    (async () => {
      setSales(await getSalesByDay(selectedDay));
    })();
  }, [selectedDay, refresh]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  async function handleDelete(id: string) {
    await deleteSale(id);
    setRefresh((v) => v + 1);
    setToast("Venda excluida");
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-teal-800/40 bg-[#0e222b]/90 p-4 shadow-blue-950/50">
        <label className="mb-1 block text-sm font-medium text-teal-200/70">Mês</label>
        <select
          value={selectedMonth}
          onChange={(e) => {
            setSelectedMonth(e.target.value);
            setSelectedDay("");
          }}
          className="w-full rounded-xl border border-teal-800/40 bg-[#060e12] px-3 py-2 text-white"
        >
          {months.map((m) => (
            <option key={m.month} value={m.month} className="bg-[#0e222b]/90">
              {m.month} - Total {Number(m.total).toFixed(2).replace(".", ",")} ({m.count})
            </option>
          ))}
        </select>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
          <div className="rounded-lg bg-[#060e12] p-2">
            <div className="font-bold text-white">{monthSummary.count}</div>
            <div className="text-[10px] font-bold uppercase text-teal-300/70">Qtd</div>
          </div>
          <div className="rounded-lg bg-[#060e12] p-2">
            <div className="font-bold text-white">{Number(monthSummary.total).toFixed(2).replace(".", ",")}</div>
            <div className="text-[10px] font-bold uppercase text-teal-300/70">Total</div>
          </div>
          <div className="rounded-lg bg-[#060e12] p-2">
            <div className="font-bold text-teal-400">{Number(monthSummary.avg).toFixed(2).replace(".", ",")}</div>
            <div className="text-[10px] font-bold uppercase text-teal-300/70">Ticket</div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-teal-800/40 bg-[#0e222b]/90 p-4 shadow-blue-950/50">
        <label className="mb-1 block text-sm font-medium text-teal-200/70">Dia</label>
        <select
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
          className="w-full rounded-xl border border-teal-800/40 bg-[#060e12] px-3 py-2 text-white"
        >
          {days.map((d) => (
            <option key={d.day} value={d.day} className="bg-[#0e222b]/90">
              {d.day} - {Number(d.total).toFixed(2).replace(".", ",")} ({d.count})
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-3xl border border-teal-800/40 bg-[#0e222b]/90 p-4 shadow-blue-950/50">
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
              <button
                onClick={() => handleDelete(s.id)}
                className="text-red-400"
                aria-label="Excluir"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>
      <Toast message={toast} />
    </div>
  );
}
