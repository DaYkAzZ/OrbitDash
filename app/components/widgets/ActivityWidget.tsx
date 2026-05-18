"use client";
import { useState } from "react";
import type { WidgetConfig } from "@/app/types";
import { useWidgetStore } from "@/app/store/useWidgetStore";

export function ActivityWidgetExpanded({ widget, onClose }: { widget: WidgetConfig; onClose: () => void }) {
  const { updateWidgetData } = useWidgetStore();
  const [newTask, setNewTask] = useState("");
  const tasks: any[] = widget.data.tasks ?? [];

  const toggleTask = (id: string) => {
    const updated = tasks.map((t) => t.id === id ? { ...t, done: !t.done } : t);
    const done = updated.filter((t) => t.done).length;
    updateWidgetData(widget.id, { tasks: updated, tasksCompleted: done, tasksTotal: updated.length });
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    const t = { id: `t-${Date.now()}`, label: newTask.trim(), done: false };
    const updated = [...tasks, t];
    updateWidgetData(widget.id, { tasks: updated, tasksTotal: updated.length });
    setNewTask("");
  };

  const removeTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    const done = updated.filter((t) => t.done).length;
    updateWidgetData(widget.id, { tasks: updated, tasksCompleted: done, tasksTotal: updated.length });
  };

  const pct = tasks.length ? Math.round((tasks.filter((t) => t.done).length / tasks.length) * 100) : 0;

  return (
    <div className="p-6 space-y-5">
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Tâches", value: `${tasks.filter((t) => t.done).length}/${tasks.length}` },
          { label: "Série",  value: `🔥 ${widget.data.streak ?? 0}j` },
          { label: "Focus",  value: `${widget.data.focusSessions ?? 0} sessions` },
        ].map((s) => (
          <div key={s.label} className="stat-card text-center">
            <p className="text-sm font-bold text-[var(--text-1)]">{s.value}</p>
            <p className="text-xs text-[var(--text-3)]">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs mb-2">
          <span className="text-[var(--text-2)]">Progression</span>
          <span className="font-semibold text-[var(--text-1)]">{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-[var(--bg-hover)] overflow-hidden">
          <div className="h-full rounded-full bg-[var(--accent)] transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Add task */}
      <div className="flex gap-2">
        <input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          placeholder="Nouvelle tâche…"
          className="flex-1 h-9 px-3 rounded-lg border border-[var(--border)] bg-[var(--bg-hover)] text-sm text-[var(--text-1)] placeholder-[var(--text-3)] focus:outline-none focus:border-[var(--accent)] transition-colors" />
        <button onClick={addTask} className="h-9 px-3 rounded-lg bg-[var(--accent)] text-white text-sm font-semibold hover:bg-[var(--accent-hover)] transition-colors">+</button>
      </div>

      {/* Task list */}
      <div className="space-y-1.5">
        {tasks.map((t) => (
          <div key={t.id} className="group flex items-center gap-3 p-2.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors">
            <button onClick={() => toggleTask(t.id)}
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-none transition-colors ${t.done ? "bg-[var(--accent)] border-[var(--accent)]" : "border-[var(--border)]"}`}>
              {t.done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
            </button>
            <span className={`text-sm flex-1 ${t.done ? "line-through text-[var(--text-3)]" : "text-[var(--text-1)]"}`}>{t.label}</span>
            <button onClick={() => removeTask(t.id)} className="opacity-0 group-hover:opacity-100 btn-icon w-5 h-5 hover:!text-red-500">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
