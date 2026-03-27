import { Mark, mergeAttributes } from '@tiptap/core';

export interface WikilinkMarkOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    wikilink: {
      setWikilink: (attributes: {
        target: string;
        bookId?: string | null;
        display?: string;
      }) => ReturnType;
      unsetWikilink: () => ReturnType;
    };
  }
}

export const WikilinkMark = Mark.create<WikilinkMarkOptions>({
  name: 'wikilink',

  inclusive: false,

  excludes: 'link',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      target: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-target'),
        renderHTML: (attributes) => ({ 'data-target': attributes.target }),
      },
      bookId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-book-id'),
        renderHTML: (attributes) => {
          if (!attributes.bookId) return {};
          return { 'data-book-id': attributes.bookId };
        },
      },
      display: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-display'),
        renderHTML: (attributes) => {
          if (!attributes.display) return {};
          return { 'data-display': attributes.display };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'a[data-wikilink]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const resolvedClass = HTMLAttributes['data-book-id']
      ? 'wikilink wikilink-resolved'
      : 'wikilink wikilink-orphan';

    return [
      'a',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-wikilink': '',
        class: resolvedClass,
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setWikilink:
        (attributes) =>
        ({ commands }) =>
          commands.setMark(this.name, attributes),
      unsetWikilink:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
    };
  },
});

export default WikilinkMark;
