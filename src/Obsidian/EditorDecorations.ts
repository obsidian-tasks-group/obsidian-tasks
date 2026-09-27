import type { EditorView } from '@codemirror/view';
import type { App } from 'obsidian';

let refreshVersion = 0;

/**
 * Changes whenever {@link refreshEditorDecorations} is called.
 */
export function editorDecorationsRefreshVersion(): number {
    return refreshVersion;
}

/**
 * Re-draw Tasks' decorations in all open editors, after a display setting changes.
 */
export function refreshEditorDecorations(app: App) {
    refreshVersion++;
    app.workspace.iterateAllLeaves((leaf) => {
        // @ts-expect-error TS2339: Property editor does not exist on type View
        const editorView: EditorView | undefined = leaf.view.editor?.cm;
        editorView?.dispatch({ selection: editorView.state.selection });
    });
}

const fenceRegex = /^\s*(?:>\s*)*(```|~~~)/;

/**
 * Which lines, up to `lastLineIndex`, are inside fenced code blocks.
 */
export function linesInsideCodeBlocks(lines: readonly string[], lastLineIndex: number): boolean[] {
    const insideCodeBlock: boolean[] = [];
    let inside = false;
    for (let i = 0; i <= lastLineIndex && i < lines.length; i++) {
        if (fenceRegex.test(lines[i])) {
            insideCodeBlock.push(true);
            inside = !inside;
            continue;
        }
        insideCodeBlock.push(inside);
    }
    return insideCodeBlock;
}
