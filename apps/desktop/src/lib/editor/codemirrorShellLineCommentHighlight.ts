import type { Extension } from "@codemirror/state";
import { tags } from "@lezer/highlight";
import { shellLineCommentRanges } from "@/lib/editor/shellLineCommentRanges";

type EditorViewType = import("@codemirror/view").EditorView;
type DecorationSet = import("@codemirror/view").DecorationSet;

export const SHELL_LINE_COMMENT_CLASS = "cm-shell-line-comment";

interface ShellLineCommentHighlightDeps {
  ViewPlugin: typeof import("@codemirror/view").ViewPlugin;
  Decoration: typeof import("@codemirror/view").Decoration;
  highlightingFor: typeof import("@codemirror/language").highlightingFor;
}

/** Reuses the active theme's comment colour so `//` matches what the SQL grammar gives `--`. */
export function shellLineCommentClass(state: import("@codemirror/state").EditorState, highlightingFor: ShellLineCommentHighlightDeps["highlightingFor"]): string {
  const themeClass = highlightingFor(state, [tags.lineComment, tags.comment]);
  return themeClass ? `${SHELL_LINE_COMMENT_CLASS} ${themeClass}` : SHELL_LINE_COMMENT_CLASS;
}

export function createShellLineCommentHighlight({ ViewPlugin, Decoration, highlightingFor }: ShellLineCommentHighlightDeps): Extension {
  function buildDecorations(view: EditorViewType, className: string): DecorationSet {
    const visible = view.visibleRanges;
    const end = visible[visible.length - 1]?.to ?? 0;
    if (!end) return Decoration.set([]);
    // Quote tracking needs the text before the viewport, so scan from the start of the document.
    const ranges = shellLineCommentRanges(view.state.doc.sliceString(0, end));
    const decoration = Decoration.mark({ class: className });
    return Decoration.set(ranges.filter((range) => visible.some((visibleRange) => range.from < visibleRange.to && range.to > visibleRange.from)).map((range) => decoration.range(range.from, range.to)));
  }

  return ViewPlugin.fromClass(
    class {
      decorations: DecorationSet;
      className: string;
      constructor(view: EditorViewType) {
        this.className = shellLineCommentClass(view.state, highlightingFor);
        this.decorations = buildDecorations(view, this.className);
      }
      update(update: import("@codemirror/view").ViewUpdate) {
        const className = shellLineCommentClass(update.state, highlightingFor);
        if (!update.docChanged && !update.viewportChanged && className === this.className) return;
        this.className = className;
        this.decorations = buildDecorations(update.view, className);
      }
    },
    { decorations: (plugin) => plugin.decorations },
  );
}
