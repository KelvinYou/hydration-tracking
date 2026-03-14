"use client";

import { useState } from "react";
import { WaterLog, UnitPreference } from "@/types";
import { formatAmount, toMl, displayValue, unitLabel } from "@/lib/units";
import { formatTime } from "@/lib/utils";

interface LogTimelineProps {
  logs: WaterLog[];
  unit: UnitPreference;
  onDelete: (id: string) => void;
  onEdit: (id: string, amountMl: number, loggedAt?: string) => void;
}

export function LogTimeline({ logs, unit, onDelete, onEdit }: LogTimelineProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editTime, setEditTime] = useState("");

  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
  );

  const handleEditStart = (log: WaterLog) => {
    setEditingId(log.id);
    setEditValue(String(displayValue(log.amount_ml, unit)));
    // Format logged_at as HH:MM for the time input
    const d = new Date(log.logged_at);
    setEditTime(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
  };

  const handleEditSave = (log: WaterLog) => {
    const value = parseInt(editValue);
    if (value > 0) {
      // Rebuild the ISO timestamp using the original date + new time
      const original = new Date(log.logged_at);
      const [hours, minutes] = editTime.split(":").map(Number);
      original.setHours(hours, minutes, 0, 0);
      onEdit(log.id, toMl(value, unit), original.toISOString());
    }
    setEditingId(null);
  };

  if (sortedLogs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 dark:text-gray-500">
        <p className="text-lg">No logs yet today</p>
        <p className="text-sm mt-1">Tap a button above to log your first drink</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        Today&apos;s Log
      </h3>
      <div className="space-y-1">
        {sortedLogs.map((log) => (
          <div
            key={log.id}
            className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 dark:text-gray-400 w-20">
                {formatTime(log.logged_at)}
              </span>
              {editingId === log.id ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleEditSave(log);
                  }}
                  className="flex items-center gap-2 flex-wrap"
                >
                  <input
                    type="time"
                    value={editTime}
                    onChange={(e) => setEditTime(e.target.value)}
                    className="px-2 py-1 border rounded bg-white dark:bg-gray-700 text-sm"
                  />
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-20 px-2 py-1 border rounded bg-white dark:bg-gray-700 text-sm"
                    autoFocus
                    min="1"
                  />
                  <span className="text-sm text-gray-500">{unitLabel(unit)}</span>
                  <button
                    type="submit"
                    className="text-green-500 hover:text-green-600 text-sm font-medium"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="text-gray-400 hover:text-gray-500 text-sm"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <span className="font-medium text-gray-900 dark:text-white">
                  +{formatAmount(log.amount_ml, unit)}
                </span>
              )}
            </div>
            {editingId !== log.id && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEditStart(log)}
                  className="p-1.5 text-gray-400 hover:text-blue-500 transition-colors"
                  aria-label="Edit log"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={() => onDelete(log.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Delete log"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
