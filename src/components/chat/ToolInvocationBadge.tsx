"use client";

import type { ToolInvocation } from "ai";
import { Loader2 } from "lucide-react";

interface ToolInvocationBadgeProps {
  toolInvocation: ToolInvocation;
}

function basename(path: string): string {
  const trimmed = path.replace(/\/$/, "");
  const idx = trimmed.lastIndexOf("/");
  return idx === -1 ? trimmed : trimmed.slice(idx + 1);
}

function coerceArgs(args: unknown): Record<string, unknown> | null {
  if (args && typeof args === "object") {
    return args as Record<string, unknown>;
  }
  if (typeof args === "string") {
    try {
      const parsed = JSON.parse(args);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch {
      return null;
    }
  }
  return null;
}

export function getToolInvocationLabel(toolInvocation: ToolInvocation): string {
  const { toolName } = toolInvocation;
  const args = coerceArgs((toolInvocation as { args?: unknown }).args);

  if (!args) return toolName;

  const path = typeof args.path === "string" ? args.path : undefined;

  if (toolName === "str_replace_editor") {
    const command = args.command;
    if (command === "create" && path) return `Creating ${basename(path)}`;
    if (command === "str_replace" && path) return `Editing ${basename(path)}`;
    if (command === "insert" && path) return `Editing ${basename(path)}`;
    if (command === "view" && path) return `Viewing ${basename(path)}`;
    if (command === "undo_edit") return "Undoing last edit";
    return toolName;
  }

  if (toolName === "file_manager") {
    const command = args.command;
    const newPath = typeof args.new_path === "string" ? args.new_path : undefined;
    if (command === "rename" && path && newPath) {
      return `Renaming ${basename(path)} → ${basename(newPath)}`;
    }
    if (command === "delete" && path) return `Deleting ${basename(path)}`;
    return toolName;
  }

  return toolName;
}

export function ToolInvocationBadge({ toolInvocation }: ToolInvocationBadgeProps) {
  const label = getToolInvocationLabel(toolInvocation);
  const isDone = toolInvocation.state === "result" && toolInvocation.result;

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
