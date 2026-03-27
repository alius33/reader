"use client";

import type { Editor as TiptapEditor } from "@tiptap/react";
import { LayoutPanelTop } from "lucide-react";
import { ToolbarDropdown } from "../shared";
import { CALLOUT_COLORS } from "../../extensions/CalloutNode";

/* ------------------------------------------------------------------ */
/*  CalloutInsertMenu                                                   */
/* ------------------------------------------------------------------ */

interface CalloutInsertMenuProps {
  editor: TiptapEditor;
}

const CALLOUT_TYPES = Object.entries(CALLOUT_COLORS).map(([type, meta]) => ({
  type,
  label: type.charAt(0).toUpperCase() + type.slice(1),
  icon: meta.icon,
  color: meta.border,
}));

export function CalloutInsertMenu({ editor }: CalloutInsertMenuProps) {
  return (
    <ToolbarDropdown
      icon={<LayoutPanelTop className="h-4 w-4" />}
      label="Callout"
    >
      {CALLOUT_TYPES.map((ct) => (
        <button
          key={ct.type}
          onClick={() => {
            editor
              .chain()
              .focus()
              .insertContent({
                type: "callout",
                attrs: {
                  calloutType: ct.type,
                  title: "",
                  collapsible: false,
                  collapsed: false,
                },
                content: [{ type: "paragraph" }],
              })
              .run();
          }}
          className="flex w-full items-center gap-2 rounded px-2 py-1 text-xs hover:bg-accent"
        >
          <span className="text-sm">{ct.icon}</span>
          <span style={{ color: ct.color, fontWeight: 500 }}>{ct.label}</span>
        </button>
      ))}
    </ToolbarDropdown>
  );
}
