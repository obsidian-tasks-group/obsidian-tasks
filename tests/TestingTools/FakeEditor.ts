import type { Editor, EditorPosition } from 'obsidian';

/**
 * Holds a note's text, behind the Editor methods that Tasks' editor commands call.
 */
export class FakeEditor {
    private lines: string[];

    constructor(content: string) {
        this.lines = content.split('\n');
    }

    public getValue() {
        return this.lines.join('\n');
    }

    public lineCount() {
        return this.lines.length;
    }

    public getLine(line: number) {
        return this.lines[line];
    }

    public setLine(line: number, text: string) {
        this.replaceRange(text, { line, ch: 0 }, { line, ch: this.lines[line].length });
    }

    public replaceRange(replacement: string, from: EditorPosition, to: EditorPosition) {
        const text = this.getValue();
        this.lines = (text.slice(0, this.offset(from)) + replacement + text.slice(this.offset(to))).split('\n');
    }

    public asEditor() {
        return this as unknown as Editor;
    }

    private offset(position: EditorPosition) {
        return this.lines.slice(0, position.line).reduce((sum, line) => sum + line.length + 1, 0) + position.ch;
    }
}
