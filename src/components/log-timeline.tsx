"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { WaterLog, UnitPreference } from "@/types";
import { formatAmount, toMl, displayValue, unitLabel } from "@/lib/units";
import { formatTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const editLogSchema = z.object({
  editValue: z.number().min(1, "Amount must be at least 1"),
  editTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format"),
});

type EditLogFormValues = z.infer<typeof editLogSchema>;

interface LogTimelineProps {
  logs: WaterLog[];
  unit: UnitPreference;
  onDelete: (id: string) => void;
  onEdit: (id: string, amountMl: number, loggedAt?: string) => void;
  onAdd: (amountMl: number) => void;
}

export function LogTimeline({ logs, unit, onDelete, onEdit, onAdd }: LogTimelineProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<EditLogFormValues>({
    resolver: zodResolver(editLogSchema),
  });

  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime()
  );

  const handleEditStart = (log: WaterLog) => {
    setEditingId(log.id);
    const d = new Date(log.logged_at);
    reset({
      editValue: displayValue(log.amount_ml, unit),
      editTime: `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
    });
  };

  const handleEditSave = (log: WaterLog) => (data: EditLogFormValues) => {
    const original = new Date(log.logged_at);
    const [hours, minutes] = data.editTime.split(":").map(Number);
    const updated = new Date(
      original.getFullYear(),
      original.getMonth(),
      original.getDate(),
      hours,
      minutes,
      0,
      0
    );
    onEdit(log.id, toMl(data.editValue, unit), updated.toISOString());
    toast.success("Log updated");
    setEditingId(null);
  };

  const handleDeleteClick = (log: WaterLog) => {
    const { id, amount_ml } = log;
    onDelete(id);
    toast("Log removed", {
      action: {
        label: "Undo",
        onClick: () => {
          onAdd(amount_ml);
        },
      },
    });
  };

  if (sortedLogs.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm flex items-center justify-center shadow-sm">
            <svg className="w-8 h-8 text-sky-400/60" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
          </div>
        </div>
        <div>
          <p className="text-base font-semibold text-foreground/60">No logs yet today</p>
          <p className="text-sm text-muted-foreground mt-1">
            Tap a button above to log your first drink
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">
        Today&apos;s Log
      </h3>
      <div className="space-y-1.5">
        {sortedLogs.map((log) => (
          <div
            key={log.id}
            className="group flex items-center justify-between py-2.5 px-3.5 rounded-2xl bg-card/60 dark:bg-card/40 backdrop-blur-sm border border-border/40 hover:border-border/70 hover:bg-card/80 transition-all duration-200"
            style={{ borderLeft: "3px solid oklch(0.60 0.14 230 / 0.40)" }}
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Drop icon */}
              <div className="shrink-0 w-7 h-7 rounded-xl flex items-center justify-center"
                style={{ background: "oklch(0.60 0.14 230 / 0.10)" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"
                  style={{ color: "oklch(0.60 0.14 230)" }}>
                  <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                </svg>
              </div>

              {editingId === log.id ? (
                <form
                  onSubmit={handleSubmit(handleEditSave(log))}
                  className="flex items-center gap-2 flex-wrap"
                >
                  <Input
                    type="time"
                    {...register("editTime")}
                    className="h-8 w-auto px-2 text-sm rounded-xl border-border/50 bg-background/50"
                  />
                  <Input
                    type="number"
                    {...register("editValue", { valueAsNumber: true })}
                    className="h-8 w-20 px-2 text-sm rounded-xl border-border/50 bg-background/50"
                    autoFocus
                    min={1}
                  />
                  <span className="text-sm text-muted-foreground">{unitLabel(unit)}</span>
                  <Button
                    type="submit"
                    variant="link"
                    className="text-sky-500 hover:text-sky-400 min-h-[44px] px-2 p-0 text-sm font-semibold"
                  >
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setEditingId(null)}
                    className="text-muted-foreground hover:text-foreground min-h-[44px] px-2 p-0 text-sm"
                  >
                    Cancel
                  </Button>
                </form>
              ) : (
                <div className="min-w-0">
                  <span className="font-semibold text-foreground text-sm">
                    +{formatAmount(log.amount_ml, unit)}
                  </span>
                  <span className="ml-2 text-xs text-muted-foreground tabular-nums">
                    {formatTime(log.logged_at)}
                  </span>
                </div>
              )}
            </div>

            {editingId !== log.id && (
              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditStart(log)}
                  className="min-w-[36px] min-h-[36px] w-9 h-9 rounded-xl text-muted-foreground hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950/30"
                  aria-label="Edit log"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteClick(log)}
                  className="min-w-[36px] min-h-[36px] w-9 h-9 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                  aria-label="Delete log"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
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
