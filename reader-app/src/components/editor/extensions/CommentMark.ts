import { Mark, mergeAttributes } from '@tiptap/core';

export interface CommentMarkOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    comment: {
      setComment: (markId: string) => ReturnType;
      unsetComment: () => ReturnType;
    };
  }
}

export const CommentMark = Mark.create<CommentMarkOptions>({
  name: 'comment',

  inclusive: false,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'comment-mark',
        style:
          'border-bottom: 2px dotted #f59e0b; background-color: rgba(245, 158, 11, 0.08);',
      },
    };
  },

  addAttributes() {
    return {
      markId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-mark-id'),
        renderHTML: (attributes) => {
          if (!attributes.markId) return {};
          return { 'data-mark-id': attributes.markId };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-comment]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-comment': '',
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setComment:
        (markId) =>
        ({ commands }) =>
          commands.setMark(this.name, { markId }),
      unsetComment:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
    };
  },
});

export default CommentMark;
