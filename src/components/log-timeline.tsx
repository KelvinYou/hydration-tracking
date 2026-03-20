"use client";

import { useState } from "react";
import { WaterLog, UnitPreference } from "@/types";
import { formatAmount, toMl, displayValue, unitLabel } from "@/lib/units";
import { formatTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

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
      toast.success("Log updated");
    }
    setEditingId(null);
  };

  const handleDeleteClick = (id: string) => {
    onDelete(id);
    toast("Log removed", {
      action: {
        label: "Undo",
        onClick: () => {
          // Note: undo not possible after server delete — this is a UX hint only
        },
      },
    });
  };

  if (sortedLogs.length === 0) {
    return (
      <div className="text-center py-10 space-y-3">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3c-1.2 3.6-5 7-5 11a5 5 0 0010 0c0-4-3.8-7.4-5-11z" />
            </svg>
          </div>
        </div>
        <div>
          <p className="text-lg font-medium text-gray-500 dark:text-gray-400">No logs yet today</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Start your day — tap a button above to log your first drink
          </p>
        </div>
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
            className="flex items-center justify-between py-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-800/50"
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
            {editingId !== log.id && (
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditStart(log)}
                  className="min-w-[44px] min-h-[44px] text-gray-400 hover:text-sky-500"
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
        ))}
      </div>
    </div>
  );
}
