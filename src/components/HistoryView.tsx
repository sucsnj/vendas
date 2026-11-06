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

  async function handleDelete(id: string) {
    await deleteSale(id);
    setRefresh((v) => v + 1);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <label className="mb-1 block text-sm font-medium">Mês</label>
        <select
          value={selectedMonth}
          onChange={(e) => {
            setSelectedMonth(e.target.value);
            setSelectedDay("");
          }}
          className="w-full rounded-xl border border-gray-300 px-3 py-2"
        >
          {months.map((m) => (
            <option key={m.month} value={m.month}>
              {m.month} — Total {Number(m.total).toFixed(2)} ({m.count})
            </option>
          ))}
        </select>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
          <div className="rounded-lg bg-gray-100 p-2">
            <div className="font-bold">{monthSummary.count}</div>
            <div className="text-gray-500">Qtd</div>
          </div>
          <div className="rounded-lg bg-gray-100 p-2">
            <div className="font-bold">{Number(monthSummary.total).toFixed(2)}</div>
            <div className="text-gray-500">Total</div>
          </div>
          <div className="rounded-lg bg-gray-100 p-2">
            <div className="font-bold">{Number(monthSummary.avg).toFixed(2)}</div>
            <div className="text-gray-500">Ticket</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <label className="mb-1 block text-sm font-medium">Dia</label>
        <select
          value={selectedDay}
          onChange={(e) => setSelectedDay(e.target.value)}
          className="w-full rounded-xl border border-gray-300 px-3 py-2"
        >
          {days.map((d) => (
            <option key={d.day} value={d.day}>
              {d.day} — {Number(d.total).toFixed(2)} ({d.count})
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <ul className="divide-y">
          {sales.map((s) => (
            <li key={s.id} className="flex items-center justify-between py-2">
              <div>
                <div className="font-semibold">{Number(s.amount).toFixed(2)}</div>
                <div className="text-xs text-gray-500">{s.note}</div>
              </div>
              <button
                onClick={() => handleDelete(s.id)}
                className="text-sm text-red-600"
              >
                Excluir
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
