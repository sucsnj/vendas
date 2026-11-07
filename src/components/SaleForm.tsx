"use client";

import { useState } from "react";
import { CalculatorInput } from "./CalculatorInput";
import { toDayReference, nowUtcIso } from "@/lib/timezone";
import { evaluateExpression } from "@/lib/calculator";
import { insertSale, updateSale } from "@/lib/db/salesRepo";
import type { Sale } from "@/lib/db/schema";
import { FileText, Calendar, CheckCircle2 } from "lucide-react";

type Props = {
  editing?: Sale | null;
  onSaved: () => void;
  onCancelEdit?: () => void;
};

export function SaleForm({ editing, onSaved, onCancelEdit }: Props) {
  const [expression, setExpression] = useState(editing?.rawExpression ?? "");
  const [note, setNote] = useState(editing?.note ?? "");
  const [dayReference, setDayReference] = useState(editing?.dayReference ?? toDayReference());
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    const amount = evaluateExpression(expression);
    if (amount === null) {
      setError("Expressão inválida");
      return;
    }
    const now = nowUtcIso();
    try {
      if (editing) {
        await updateSale(editing.id, {
          amount,
          rawExpression: expression,
          note: note || null,
          dayReference,
          updatedAt: now,
        });
      } else {
        await insertSale({
          id: crypto.randomUUID(),
          amount,
          rawExpression: expression,
          note: note || null,
          createdAt: now,
          updatedAt: now,
          dayReference,
        });
      }
      if (!editing) {
        setExpression("");
        setNote("");
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="space-y-4">
      <CalculatorInput value={expression} onChange={setExpression} onSubmit={submit} />
      <div>
        <label className="mb-1 flex items-center gap-1 text-sm font-medium text-teal-200/70">
          <FileText className="h-4 w-4" /> Observação
        </label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={100}
          className="w-full rounded-xl border border-teal-800/40 bg-[#060e12] px-3 py-2 text-base text-white placeholder-blue-300/40 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="mb-1 flex items-center gap-1 text-sm font-medium text-teal-200/70">
          <Calendar className="h-4 w-4" /> Data
        </label>
        <input
          type="date"
          value={dayReference}
          onChange={(e) => setDayReference(e.target.value)}
          className="w-full rounded-xl border border-teal-800/40 bg-[#060e12] px-3 py-2 text-base text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      {error && <div className="text-sm text-red-400">{error}</div>}
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-yellow-400 py-3.5 text-base font-extrabold text-slate-950 font-black shadow-lg shadow-yellow-400/25 hover:bg-blue-300"
        >
          <CheckCircle2 className="h-4 w-4" />
          {editing ? "Salvar" : "Adicionar"}
        </button>
        {editing && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-xl bg-[#122b37] px-4 py-3.5 text-base font-medium text-blue-200"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
