"use client";

import { useState } from "react";
import { Plus, StickyNote, X, Pencil, Check } from "lucide-react";
import { useGameStore, useNotes } from "@/lib/game/store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAudio } from "@/hooks/use-audio";
import { cn } from "@/lib/utils";

const SUSPECT_TAGS = [
  { id: "MAYA", label: "MAYA", color: "border-rose-500/40 text-rose-400/90 bg-rose-500/10" },
  { id: "DANIEL", label: "DANIEL", color: "border-sky-500/40 text-sky-400/90 bg-sky-500/10" },
  { id: "SOFIA", label: "SOFIA", color: "border-violet-500/40 text-violet-400/90 bg-violet-500/10" },
  { id: "RYAN", label: "RYAN", color: "border-amber-500/40 text-amber-400/90 bg-amber-500/10" },
];

interface NoteDraft {
  id?: string;
  text: string;
  tags: string[];
}

export function InvestigationNotes() {
  const notes = useNotes();
  const addNote = useGameStore((s) => s.addNote);
  const removeNote = useGameStore((s) => s.removeNote);
  const updateNote = useGameStore((s) => s.updateNote);
  const [draft, setDraft] = useState<NoteDraft>({ text: "", tags: [] });
  const [editingId, setEditingId] = useState<string | null>(null);
  const { play } = useAudio();

  const toggleTag = (tag: string) => {
    play("click");
    setDraft((d) => ({
      ...d,
      tags: d.tags.includes(tag) ? d.tags.filter((t) => t !== tag) : [...d.tags, tag],
    }));
  };

  const submit = () => {
    const t = draft.text.trim();
    if (!t) return;
    const taggedText = draft.tags.length > 0 ? `[${draft.tags.join(",")}] ${t}` : t;
    addNote(taggedText);
    setDraft({ text: "", tags: [] });
    play("click");
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="p-2 border-b border-border/60 space-y-2">
        <Textarea
          value={draft.text}
          onChange={(e) => setDraft((d) => ({ ...d, text: e.target.value }))}
          placeholder="Record an observation, a hypothesis, a lead to follow…"
          className="min-h-[72px] resize-none bg-black/20 border-border/60 font-mono text-xs"
        />
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground/70 mr-1">Tag:</span>
          {SUSPECT_TAGS.map((tg) => (
            <button
              key={tg.id}
              onClick={() => toggleTag(tg.id)}
              className={cn(
                "text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 border rounded-sm transition-colors",
                draft.tags.includes(tg.id) ? tg.color : "border-border/50 text-muted-foreground/60 hover:border-border",
              )}
            >
              {tg.label}
            </button>
          ))}
        </div>
        <Button
          onClick={submit}
          size="sm"
          className="w-full font-mono uppercase tracking-wider text-[11px] h-7 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="size-3" /> Add Note
        </Button>
      </div>
      <div className="flex-1 min-h-0 overflow-auto p-2 space-y-1.5">
        {notes.length === 0 && (
          <div className="text-center py-8 text-muted-foreground/50">
            <StickyNote className="size-5 mx-auto mb-2 opacity-40" />
            <p className="text-[11px] font-mono text-muted-foreground/60">No notes recorded yet.</p>
          </div>
        )}
        {notes.map((n) => {
          const isEditing = editingId === n.id;
          const tags = parseTags(n.text);
          const cleanText = stripTags(n.text);
          return (
            <NoteCard
              key={n.id}
              note={n}
              isEditing={isEditing}
              tags={tags}
              cleanText={cleanText}
              onStartEdit={() => setEditingId(n.id)}
              onSaveEdit={(newText) => {
                const newTags = tags;
                const tagged = newTags.length > 0 ? `[${newTags.join(",")}] ${newText}` : newText;
                updateNote(n.id, tagged);
                setEditingId(null);
                play("click");
              }}
              onCancelEdit={() => setEditingId(null)}
              onDelete={() => {
                play("click");
                removeNote(n.id);
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function NoteCard({
  note,
  isEditing,
  tags,
  cleanText,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
}: {
  note: { id: string; text: string; createdAt: number };
  isEditing: boolean;
  tags: string[];
  cleanText: string;
  onStartEdit: () => void;
  onSaveEdit: (text: string) => void;
  onCancelEdit: () => void;
  onDelete: () => void;
}) {
  const [editText, setEditText] = useState(cleanText);
  const { play } = useAudio();

  if (isEditing) {
    return (
      <div className="border border-primary/40 bg-primary/5 rounded-sm p-2 space-y-1.5">
        <Textarea
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          className="min-h-[60px] resize-none bg-black/30 border-border/60 font-mono text-xs"
          autoFocus
        />
        <div className="flex gap-1.5">
          <Button
            onClick={() => onSaveEdit(editText)}
            size="sm"
            className="h-6 font-mono text-[10px] uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Check className="size-3" /> Save
          </Button>
          <Button
            onClick={() => {
              setEditText(cleanText);
              onCancelEdit();
            }}
            variant="outline"
            size="sm"
            className="h-6 font-mono text-[10px] uppercase tracking-wider"
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative border border-border/50 bg-black/20 rounded-sm p-2 pr-14">
      {tags.length > 0 && (
        <div className="flex gap-1 mb-1 flex-wrap">
          {tags.map((t) => {
            const tagDef = SUSPECT_TAGS.find((s) => s.id === t);
            return (
              <span
                key={t}
                className={cn(
                  "text-[8px] font-mono uppercase tracking-wider px-1 py-px border rounded-sm",
                  tagDef ? tagDef.color : "border-border/50 text-muted-foreground/70",
                )}
              >
                {t}
              </span>
            );
          })}
        </div>
      )}
      <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap break-words">{cleanText}</p>
      <div className="mt-1 text-[9px] font-mono text-muted-foreground/50">
        {new Date(note.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </div>
      <div className="absolute top-1.5 right-1.5 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => {
            play("click");
            onStartEdit();
          }}
          className="size-5 rounded-sm flex items-center justify-center text-muted-foreground/50 hover:text-primary hover:bg-primary/10"
          aria-label="Edit note"
        >
          <Pencil className="size-3" />
        </button>
        <button
          onClick={onDelete}
          className="size-5 rounded-sm flex items-center justify-center text-muted-foreground/50 hover:text-primary hover:bg-primary/10"
          aria-label="Delete note"
        >
          <X className="size-3" />
        </button>
      </div>
    </div>
  );
}

function parseTags(text: string): string[] {
  const m = text.match(/^\[([A-Z,]+)\]\s*/);
  if (!m) return [];
  return m[1].split(",").filter(Boolean);
}

function stripTags(text: string): string {
  return text.replace(/^\[([A-Z,]+)\]\s*/, "");
}
