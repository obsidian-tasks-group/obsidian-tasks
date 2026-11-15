import { MarkdownView } from 'obsidian';

export function makeFakeMarkdownView(): MarkdownView & { file: { path: string } } {
    return Object.assign(Object.create(MarkdownView.prototype) as MarkdownView, { file: { path: 'file.md' } });
}
