import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

/* ------------------------------------------------------------------ */
/*  Type declarations                                                  */
/* ------------------------------------------------------------------ */

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    searchAndReplace: {
      setSearchTerm: (term: string) => ReturnType;
      setReplaceTerm: (term: string) => ReturnType;
      toggleCaseSensitive: () => ReturnType;
      findNext: () => ReturnType;
      findPrevious: () => ReturnType;
      replaceOne: () => ReturnType;
      replaceAll: () => ReturnType;
      clearSearch: () => ReturnType;
    };
  }
}

/* ------------------------------------------------------------------ */
/*  Storage type                                                       */
/* ------------------------------------------------------------------ */

export interface SearchAndReplaceStorage {
  searchTerm: string;
  replaceTerm: string;
  caseSensitive: boolean;
  results: { from: number; to: number }[];
  currentIndex: number;
}

/* ------------------------------------------------------------------ */
/*  Plugin key                                                         */
/* ------------------------------------------------------------------ */

const searchPluginKey = new PluginKey("searchAndReplace");

/* ------------------------------------------------------------------ */
/*  Match finder — walks text nodes directly                           */
/* ------------------------------------------------------------------ */

interface ProseMirrorNode {
  isText: boolean;
  text: string;
  descendants: (
    callback: (node: ProseMirrorNode, pos: number) => void,
  ) => void;
}

function findMatches(
  doc: ProseMirrorNode,
  searchTerm: string,
  caseSensitive: boolean,
): { from: number; to: number }[] {
  if (!searchTerm) return [];

  const results: { from: number; to: number }[] = [];

  doc.descendants((node: ProseMirrorNode, pos: number) => {
    if (!node.isText) return;
    const text = caseSensitive ? node.text : node.text.toLowerCase();
    const term = caseSensitive ? searchTerm : searchTerm.toLowerCase();

    let index = text.indexOf(term);
    while (index !== -1) {
      results.push({ from: pos + index, to: pos + index + term.length });
      index = text.indexOf(term, index + 1);
    }
  });

  return results;
}

/* ------------------------------------------------------------------ */
/*  Extension                                                          */
/* ------------------------------------------------------------------ */

export const SearchAndReplace = Extension.create<
  Record<string, never>,
  SearchAndReplaceStorage
>({
  name: "searchAndReplace",

  addStorage() {
    return {
      searchTerm: "",
      replaceTerm: "",
      caseSensitive: false,
      results: [],
      currentIndex: 0,
    };
  },

  addCommands() {
    return {
      setSearchTerm:
        (term: string) =>
        ({ editor }) => {
          const s = editor.storage.searchAndReplace as SearchAndReplaceStorage;
          s.searchTerm = term;
          s.results = findMatches(
            editor.state.doc as unknown as ProseMirrorNode,
            term,
            s.caseSensitive,
          );
          s.currentIndex = s.results.length > 0 ? 0 : 0;
          // Force decoration update
          editor.view.dispatch(editor.state.tr);
          return true;
        },

      setReplaceTerm:
        (term: string) =>
        ({ editor }) => {
          (
            editor.storage.searchAndReplace as SearchAndReplaceStorage
          ).replaceTerm = term;
          return true;
        },

      toggleCaseSensitive:
        () =>
        ({ editor }) => {
          const s = editor.storage.searchAndReplace as SearchAndReplaceStorage;
          s.caseSensitive = !s.caseSensitive;
          s.results = findMatches(
            editor.state.doc as unknown as ProseMirrorNode,
            s.searchTerm,
            s.caseSensitive,
          );
          s.currentIndex = Math.min(
            s.currentIndex,
            Math.max(0, s.results.length - 1),
          );
          editor.view.dispatch(editor.state.tr);
          return true;
        },

      findNext:
        () =>
        ({ editor }) => {
          const s = editor.storage.searchAndReplace as SearchAndReplaceStorage;
          if (s.results.length === 0) return false;
          s.currentIndex = (s.currentIndex + 1) % s.results.length;
          const match = s.results[s.currentIndex];
          editor.commands.setTextSelection(match);
          editor.view.dispatch(editor.state.tr.scrollIntoView());
          return true;
        },

      findPrevious:
        () =>
        ({ editor }) => {
          const s = editor.storage.searchAndReplace as SearchAndReplaceStorage;
          if (s.results.length === 0) return false;
          s.currentIndex =
            (s.currentIndex - 1 + s.results.length) % s.results.length;
          const match = s.results[s.currentIndex];
          editor.commands.setTextSelection(match);
          editor.view.dispatch(editor.state.tr.scrollIntoView());
          return true;
        },

      replaceOne:
        () =>
        ({ editor, tr }) => {
          const s = editor.storage.searchAndReplace as SearchAndReplaceStorage;
          if (s.results.length === 0) return false;
          const match = s.results[s.currentIndex];
          tr.insertText(s.replaceTerm, match.from, match.to);
          // Recalculate matches from the updated doc
          s.results = findMatches(
            tr.doc as unknown as ProseMirrorNode,
            s.searchTerm,
            s.caseSensitive,
          );
          s.currentIndex = Math.min(
            s.currentIndex,
            Math.max(0, s.results.length - 1),
          );
          return true;
        },

      replaceAll:
        () =>
        ({ editor, tr }) => {
          const s = editor.storage.searchAndReplace as SearchAndReplaceStorage;
          if (s.results.length === 0) return false;
          // Replace from end to start to preserve earlier positions
          const sorted = [...s.results].sort((a, b) => b.from - a.from);
          for (const match of sorted) {
            tr.insertText(s.replaceTerm, match.from, match.to);
          }
          s.results = [];
          s.currentIndex = 0;
          return true;
        },

      clearSearch:
        () =>
        ({ editor }) => {
          const s = editor.storage.searchAndReplace as SearchAndReplaceStorage;
          s.searchTerm = "";
          s.replaceTerm = "";
          s.results = [];
          s.currentIndex = 0;
          editor.view.dispatch(editor.state.tr);
          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    const storage = this.storage as SearchAndReplaceStorage;

    return [
      new Plugin({
        key: searchPluginKey,
        props: {
          decorations: (state) => {
            const { searchTerm, results, currentIndex } = storage;

            if (!searchTerm || results.length === 0) {
              return DecorationSet.empty;
            }

            const decorations = results.map((result, i) => {
              const className =
                i === currentIndex ? "search-match-active" : "search-match";
              return Decoration.inline(result.from, result.to, {
                class: className,
              });
            });

            return DecorationSet.create(state.doc, decorations);
          },
        },
      }),
    ];
  },
});
