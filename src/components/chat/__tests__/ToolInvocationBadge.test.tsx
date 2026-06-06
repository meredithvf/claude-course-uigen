import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import type { ToolInvocation } from "ai";
import {
  ToolInvocationBadge,
  getToolInvocationLabel,
} from "../ToolInvocationBadge";

afterEach(() => {
  cleanup();
});

function makeInvocation(overrides: Partial<ToolInvocation> = {}): ToolInvocation {
  return {
    toolCallId: "call_1",
    toolName: "str_replace_editor",
    args: {},
    state: "call",
    ...overrides,
  } as ToolInvocation;
}

test("getToolInvocationLabel: str_replace_editor create → Creating {basename}", () => {
  const label = getToolInvocationLabel(
    makeInvocation({ args: { command: "create", path: "/App.jsx" } })
  );
  expect(label).toBe("Creating App.jsx");
});

test("getToolInvocationLabel: str_replace_editor str_replace → Editing {basename}", () => {
  const label = getToolInvocationLabel(
    makeInvocation({
      args: { command: "str_replace", path: "/components/Card.jsx" },
    })
  );
  expect(label).toBe("Editing Card.jsx");
});

test("getToolInvocationLabel: str_replace_editor insert → Editing {basename}", () => {
  const label = getToolInvocationLabel(
    makeInvocation({
      args: { command: "insert", path: "/components/Foo.jsx", insert_line: 3 },
    })
  );
  expect(label).toBe("Editing Foo.jsx");
});

test("getToolInvocationLabel: str_replace_editor view → Viewing {basename}", () => {
  const label = getToolInvocationLabel(
    makeInvocation({
      args: { command: "view", path: "/components/Bar.jsx" },
    })
  );
  expect(label).toBe("Viewing Bar.jsx");
});

test("getToolInvocationLabel: str_replace_editor undo_edit → Undoing last edit", () => {
  const label = getToolInvocationLabel(
    makeInvocation({ args: { command: "undo_edit" } })
  );
  expect(label).toBe("Undoing last edit");
});

test("getToolInvocationLabel: file_manager rename → Renaming {old} → {new}", () => {
  const label = getToolInvocationLabel(
    makeInvocation({
      toolName: "file_manager",
      args: {
        command: "rename",
        path: "/components/old.jsx",
        new_path: "/components/new.jsx",
      },
    })
  );
  expect(label).toBe("Renaming old.jsx → new.jsx");
});

test("getToolInvocationLabel: file_manager delete → Deleting {basename}", () => {
  const label = getToolInvocationLabel(
    makeInvocation({
      toolName: "file_manager",
      args: { command: "delete", path: "/components/foo.jsx" },
    })
  );
  expect(label).toBe("Deleting foo.jsx");
});

test("getToolInvocationLabel: unknown tool falls back to raw toolName", () => {
  const label = getToolInvocationLabel(
    makeInvocation({
      toolName: "some_unknown_tool",
      args: { command: "create", path: "/x.jsx" },
    })
  );
  expect(label).toBe("some_unknown_tool");
});

test("getToolInvocationLabel: args as JSON string still produces friendly label", () => {
  const label = getToolInvocationLabel(
    makeInvocation({
      args: JSON.stringify({ command: "create", path: "/App.jsx" }) as unknown as ToolInvocation["args"],
    })
  );
  expect(label).toBe("Creating App.jsx");
});

test("getToolInvocationLabel: empty args falls back to raw toolName", () => {
  const label = getToolInvocationLabel(makeInvocation({ args: {} }));
  expect(label).toBe("str_replace_editor");
});

test("getToolInvocationLabel: malformed JSON string falls back to raw toolName", () => {
  const label = getToolInvocationLabel(
    makeInvocation({
      args: "{not valid json" as unknown as ToolInvocation["args"],
    })
  );
  expect(label).toBe("str_replace_editor");
});

test("getToolInvocationLabel: str_replace_editor create without path falls back", () => {
  const label = getToolInvocationLabel(
    makeInvocation({ args: { command: "create" } })
  );
  expect(label).toBe("str_replace_editor");
});

test("ToolInvocationBadge renders friendly label", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation({
        args: { command: "create", path: "/App.jsx" },
      })}
    />
  );
  expect(screen.getByText("Creating App.jsx")).toBeDefined();
});

test("ToolInvocationBadge shows green dot when state is result", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation({
        args: { command: "create", path: "/App.jsx" },
        state: "result",
        result: "ok",
      } as Partial<ToolInvocation>)}
    />
  );
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).not.toBeNull();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("ToolInvocationBadge shows spinner when state is not result", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation({
        args: { command: "create", path: "/App.jsx" },
        state: "call",
      })}
    />
  );
  expect(container.querySelector(".animate-spin")).not.toBeNull();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("ToolInvocationBadge renders raw tool name as fallback", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={makeInvocation({
        toolName: "mystery_tool",
        args: {},
      })}
    />
  );
  expect(screen.getByText("mystery_tool")).toBeDefined();
});
