"use client";

import Editor, { type OnMount, type BeforeMount } from "@monaco-editor/react";
import { useRef, useCallback, useEffect, useState } from "react";
import { Play, Trash2, Clock, Loader2, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSqlQuery } from "@/hooks/use-sql-query";
import type { QueryResult } from "@/lib/sql/engine";
import { useAudio } from "@/hooks/use-audio";

interface SQLEditorProps {
  value: string;
  onChange: (v: string) => void;
  onResult: (result: QueryResult) => void;
  onRunningChange?: (running: boolean) => void;
}

export function SQLEditor({ value, onChange, onResult, onRunningChange }: SQLEditorProps) {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const runningRef = useRef(false);
  // Prevents onChange from firing during programmatic setValue updates.
  const suppressChangeRef = useRef(false);
  // Holds the latest run handler so the Monaco keybinding (registered once) always calls the current closure.
  const runRef = useRef<() => void>(() => {});
  const [running, setRunning] = useState(false);
  const { runQuery } = useSqlQuery();
  const { play } = useAudio();

  const runInternal = useCallback(async () => {
    if (runningRef.current) return;
    const sql = editorRef.current?.getValue() ?? value;
    if (!sql.trim()) {
      play("error");
      onResult({
        ok: false,
        error: {
          kind: "EMPTY_QUERY",
          title: "EMPTY QUERY",
          message: "The search terminal is empty. Enter a search command and run it.",
          hint: "Tip: try SELECT * FROM suspects;",
        },
        executionTimeMs: 0,
      });
      return;
    }
    runningRef.current = true;
    setRunning(true);
    onRunningChange?.(true);
    const result = await runQuery(sql);
    runningRef.current = false;
    setRunning(false);
    onRunningChange?.(false);
    onResult(result);
  }, [value, runQuery, onResult, play, onRunningChange]);

  // Keep the ref in sync so the Ctrl/Cmd+Enter command (registered once) always calls the latest handler.
  useEffect(() => {
    runRef.current = runInternal;
  }, [runInternal]);

  // Sync external value changes (e.g. "Load query" button, "Load starter query") into the Monaco editor.
  useEffect(() => {
    if (!editorRef.current) return;
    const currentValue = editorRef.current.getValue();
    if (currentValue !== value) {
      suppressChangeRef.current = true;
      editorRef.current.setValue(value);
      const lineCount = editorRef.current.getModel()?.getLineCount() ?? 1;
      editorRef.current.setPosition({ lineNumber: lineCount, column: 1 });
      // Reset suppress flag after the change event has been processed.
      setTimeout(() => { suppressChangeRef.current = false; }, 0);
    }
  }, [value]);

  const handleMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    // Custom dark forensic theme
    monaco.editor.defineTheme("forensic-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "5a6275", fontStyle: "italic" },
        { token: "keyword", foreground: "e0564f" },
        { token: "keyword.sql", foreground: "e0564f" },
        { token: "string", foreground: "c8b88a" },
        { token: "string.sql", foreground: "c8b88a" },
        { token: "number", foreground: "d8a657" },
        { token: "identifier", foreground: "d4d4d8" },
        { token: "type", foreground: "8db07f" },
        { token: "delimiter", foreground: "8b8d98" },
        { token: "operator", foreground: "8b8d98" },
      ],
      colors: {
        "editor.background": "#00000000",
        "editor.foreground": "#d4d4d8",
        "editorLineNumber.foreground": "#3f4350",
        "editorLineNumber.activeForeground": "#e0564f",
        "editorCursor.foreground": "#e0564f",
        "editor.selectionBackground": "#e0564f33",
        "editor.lineHighlightBackground": "#ffffff08",
        "editorIndentGuide.background": "#ffffff0a",
        "editorIndentGuide.activeBackground": "#e0564f44",
        "editorWidget.background": "#1a1d27",
        "editorWidget.border": "#ffffff14",
        "editorSuggestWidget.background": "#1a1d27",
        "editorSuggestWidget.border": "#ffffff14",
        "editorSuggestWidget.selectedBackground": "#e0564f22",
        "editorSuggestWidget.highlightForeground": "#e0564f",
        "input.background": "#1a1d27",
        "input.border": "#ffffff14",
        "scrollbarSlider.background": "#ffffff14",
        "scrollbarSlider.hoverBackground": "#e0564f44",
        "scrollbarSlider.activeBackground": "#e0564f66",
      },
    });
    monaco.editor.setTheme("forensic-dark");

    // Run on Cmd/Ctrl+Enter — call through the ref to avoid stale-closure issues.
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      void runRef.current();
    });

    // Register SQL completion for the investigation tables
    const tables = [
      "suspects", "employees", "locations", "visits", "calls", "transactions", "messages", "security_logs", "evidence",
    ];
    const sqlCompletion = monaco.languages.registerCompletionItemProvider("sql", {
      triggerCharacters: [" ", "."],
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };
        const suggestions = [
          ...tables.map((t) => ({
            label: t,
            kind: monaco.languages.CompletionItemKind.Class,
            insertText: t,
            detail: "table",
            range,
          })),
          ...[
            "SELECT", "FROM", "WHERE", "JOIN", "LEFT JOIN", "INNER JOIN", "ON", "GROUP BY", "ORDER BY",
            "LIMIT", "AND", "OR", "NOT", "NULL", "IS", "IN", "LIKE", "BETWEEN", "AS", "DISTINCT", "COUNT",
            "SUM", "AVG", "MAX", "MIN", "DESC", "ASC", "CASE", "WHEN", "THEN", "ELSE", "END",
          ].map((kw) => ({
            label: kw,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: kw,
            range,
          })),
        ];
        return { suggestions };
      },
    });
    // store to dispose later (not strictly necessary for app lifetime)
    void sqlCompletion;
  }, []);

  const beforeMount: BeforeMount = useCallback((monaco) => {
    // nothing extra
    void monaco;
  }, []);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border/60 bg-card/40">
        <div className="flex items-center gap-1.5">
          <Button
            onClick={() => void runInternal()}
            disabled={running}
            size="sm"
            className="font-mono uppercase tracking-wider text-xs h-8 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {running ? <Loader2 className="size-3.5 animate-spin" /> : <Play className="size-3.5" />}
            Search
          </Button>
          <Button
            onClick={() => {
              play("click");
              onChange("");
            }}
            variant="outline"
            size="sm"
            className="font-mono uppercase tracking-wider text-xs h-8"
          >
            <Trash2 className="size-3.5" />
            Clear
          </Button>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
          <span className="hidden sm:inline-flex items-center gap-1">
            <Keyboard className="size-3" />
            Ctrl + Enter
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3" />
            Records DB
          </span>
        </div>
      </div>

      {/* Editor */}
      <div className="monaco-shell flex-1 min-h-0 bg-black/20">
        <Editor
          height="100%"
          defaultLanguage="sql"
          value={value}
          onChange={(v) => {
            if (suppressChangeRef.current) return;
            onChange(v ?? "");
          }}
          onMount={handleMount}
          beforeMount={beforeMount}
          theme="forensic-dark"
          options={{
            fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
            fontSize: 13,
            lineHeight: 20,
            minimap: { enabled: false },
            lineNumbers: "on",
            renderLineHighlight: "all",
            scrollBeyondLastLine: false,
            padding: { top: 12, bottom: 12 },
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            tabSize: 2,
            automaticLayout: true,
            wordWrap: "on",
            bracketPairColorization: { enabled: true },
            suggest: { showWords: true, showKeywords: true },
            quickSuggestions: { other: true, comments: false, strings: false },
            suggestOnTriggerCharacters: true,
            formatOnPaste: true,
            renderWhitespace: "selection",
            overviewRulerLanes: 0,
            scrollbar: { vertical: "auto", horizontal: "auto", verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
          }}
        />
      </div>
    </div>
  );
}
