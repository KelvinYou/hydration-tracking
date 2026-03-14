"use client";

import { useState, useEffect, useRef } from "react";
import { WaterLog, UnitPreference } from "@/types";
import { formatAmount, toMl, displayValue, unitLabel } from "@/lib/units";
import { formatTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LogTimelineProps {
  logs: WaterLog[];
  unit: UnitPreference;
  onDelete: (id: string) => void;
  onEdit: (id: string, amountMl: number, loggedAt?: string) => void;
}

interface PendingDelete {
  id: string;
  timer: ReturnType<typeof setTimeout>;
}

export function LogTimeline({ logs, unit, onDelete, onEdit }: LogTimelineProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editTime, setEditTime] = useState("");
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const onDeleteRef = useRef(onDelete);
  onDeleteRef.current = onDelete;

  // Execute any pending delete on unmount
  useEffect(() => {
    return () => {
      if (pendingDelete) {
        clearTimeout(pendingDelete.timer);
        onDeleteRef.current(pendingDelete.id);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
  );

  const handleEditStart = (log: WaterLog) => {
    setEditingId(log.id);
    setEditValue(String(displayValue(log.amount_ml, unit)));
    const d = new Date(log.logged_at);
    setEditTime(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
  };

  const handleEditSave = (log: WaterLog) => {
    const value = parseInt(editValue);
    if (value > 0) {
      const original = new Date(log.logged_at);
      const [hours, minutes] = editTime.split(":").map(Number);
      original.setHours(hours, minutes, 0, 0);
      onEdit(log.id, toMl(value, unit), original.toISOString());
    }
    setEditingId(null);
  };

  const handleDeleteClick = (id: string) => {
    // If there's already a pending delete for a different item, execute it immediately
    if (pendingDelete && pendingDelete.id !== id) {
      clearTimeout(pendingDelete.timer);
      onDelete(pendingDelete.id);
    }

    const timer = setTimeout(() => {
      onDelete(id);
      setPendingDelete(null);
    }, 4000);

    setPendingDelete({ id, timer });
  };

  const handleUndoDelete = () => {
    if (pendingDelete) {
      clearTimeout(pendingDelete.timer);
      setPendingDelete(null);
    }
  };

  if (sortedLogs.length === 0 && !pendingDelete) {
    return (
      <div className="text-center py-8 text-gray-400 dark:text-gray-500">
        <p className="text-lg">No logs yet today</p>
        <p className="text-sm mt-1">Tap a button above to log your first drink</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Undo Toast */}
      {pendingDelete && (
        <div className="flex items-center justify-between px-4 py-3 bg-gray-800 dark:bg-gray-700 text-white rounded-xl text-sm" role="status" aria-live="polite">
          <span>Log removed</span>
          <Button
            variant="link"
            onClick={handleUndoDelete}
            className="font-semibold text-blue-400 hover:text-blue-300 min-w-[44px] min-h-[44px] p-0"
          >
            Undo
          </Button>
        </div>
      )}

      <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
        Today&apos;s Log
      </h3>
      <div className="space-y-1">
        {sortedLogs.map((log) => {
          const isPendingDelete = pendingDelete?.id === log.id;
          return (
            <div
              key={log.id}
              className={`flex items-center justify-between py-3 px-4 rounded-lg transition-opacity ${
                isPendingDelete
                  ? "bg-gray-50 dark:bg-gray-800/30 opacity-40"
                  : "bg-gray-50 dark:bg-gray-800/50"
              }`}
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
                    <Input
                      type="time"
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                      className="h-8 w-auto px-2 text-sm"
                    />
                    <Input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="h-8 w-20 px-2 text-sm"
                      autoFocus
                      min={1}
                    />
                    <span className="text-sm text-gray-500">{unitLabel(unit)}</span>
                    <Button
                      type="submit"
                      variant="link"
                      className="text-green-500 hover:text-green-600 min-h-[44px] px-2 p-0"
                    >
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => setEditingId(null)}
                      className="text-gray-400 hover:text-gray-500 min-h-[44px] px-2 p-0"
                    >
                      Cancel
                    </Button>
                  </form>
                ) : (
                  <span className="font-medium text-gray-900 dark:text-white">
                    +{formatAmount(log.amount_ml, unit)}
                  </span>
                )}
              </div>
              {editingId !== log.id && !isPendingDelete && (
                <div className="flex items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditStart(log)}
                    className="min-w-[44px] min-h-[44px] text-gray-400 hover:text-blue-500"
                    aria-label="Edit log"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(log.id)}
                    className="min-w-[44px] min-h-[44px] text-gray-400 hover:text-red-500"
                    aria-label="Delete log"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
