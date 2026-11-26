import { type EditorChange, type EditorPosition, MarkdownView } from 'obsidian';

/**
 * A minimal fake of Obsidian's MarkdownView.
 */
export function makeFakeMarkdownView(): MarkdownView & { file: { path: string } } {
    return Object.assign(Object.create(MarkdownView.prototype) as MarkdownView, { file: { path: 'file.md' } });
}

/**
 * A minimal fake of Obsidian's Editor, holding the given lines,
 * with the selection running from the start of {@link fromLine} to the end of {@link toLine},
 * or to column {@link headCh} of {@link toLine}, if given.
 */
export function makeFakeEditor(lines: string[], fromLine: number, toLine: number, headCh?: number) {
    let text = lines.join('\n');
    const getLines = () => text.split('\n');
    const offset = ({ line, ch }: EditorPosition) =>
        getLines()
            .slice(0, line)
            .reduce((sum, l) => sum + l.length + 1, 0) + ch;
    const editor = {
        getLine: (n: number) => getLines()[n],
        lineCount: () => getLines().length,
        getCursor: () => ({ line: toLine, ch: 0 }),
        setCursor: vi.fn(),
        listSelections: () => [
            { anchor: { line: fromLine, ch: 0 }, head: { line: toLine, ch: headCh ?? lines[toLine].length } },
        ],
        replaceRange: (replacement: string, from: EditorPosition, to: EditorPosition) => {
            text = text.slice(0, offset(from)) + replacement + text.slice(offset(to));
        },
        transaction: vi.fn(({ changes }: { changes: EditorChange[] }) => {
            // Apply from the end of the file backwards, so earlier positions stay valid.
            for (const change of [...changes].reverse()) {
                editor.replaceRange(change.text, change.from, change.to!);
            }
        }),
    };
    return { editor, getText: () => text };
}
