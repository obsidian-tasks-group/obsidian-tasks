import { Editor, MarkdownView, View } from 'obsidian';

// import type {Task} from "../Task/Task";
// import {taskFromLine} from "./CreateOrEditTaskParser";
// import { TaskModal } from '../Obsidian/TaskModal';
// import type { Task } from '../Task/Task';
// import { DateFallback } from '../Task/DateFallback';
// import { taskFromLine } from './CreateOrEditTaskParser';

// const app = App;
// const metadata = app.metadataCache.getFileCache(file)
// const metadata.frontmatter
// const metadata.headings
// const metadata.listItems

export const deleteLine = (checking: boolean, editor: Editor, view: View) => {
    if (checking) {
        return view instanceof MarkdownView;
    }

    if (!(view instanceof MarkdownView)) {
        return;
    }

    const path = view.file?.path;
    if (path === undefined) {
        return;
    }

    const cursorPosition = editor.getCursor();
    const lineNumber = cursorPosition.line;
    const line = editor.getLine(lineNumber);

    console.log(lineNumber, line);

    console.log(deleteLine.name);
    console.log('  ', lineNumber, '  ', line);
};

export const moveLineToArchive = (checking: boolean, editor: Editor, view: View) => {
    if (checking) {
        return view instanceof MarkdownView;
    }

    if (!(view instanceof MarkdownView)) {
        return;
    }

    const path = view.file?.path;
    if (path === undefined) {
        return;
    }

    const cursorPosition = editor.getCursor();
    const lineNumber = cursorPosition.line;
    const line = editor.getLine(lineNumber);

    console.log(moveLineToArchive.name);
    console.log('  ', lineNumber, '  ', line);
};

export const moveLineToLogList = (checking: boolean, editor: Editor, view: View) => {
    if (checking) {
        return view instanceof MarkdownView;
    }

    if (!(view instanceof MarkdownView)) {
        return;
    }

    const path = view.file?.path;
    if (path === undefined) {
        return;
    }

    const cursorPosition = editor.getCursor();
    const lineNumber = cursorPosition.line;
    const line = editor.getLine(lineNumber);

    console.log(moveLineToLogList.name);
    console.log('  ', lineNumber, '  ', line);
};

export const moveLineToListEnd = (checking: boolean, editor: Editor, view: View) => {
    if (checking) {
        return view instanceof MarkdownView;
    }

    if (!(view instanceof MarkdownView)) {
        return;
    }

    const path = view.file?.path;
    if (path === undefined) {
        return;
    }

    const cursorPosition = editor.getCursor();
    const lineNumber = cursorPosition.line;
    const line = editor.getLine(lineNumber);

    console.log(moveLineToListEnd.name);
    console.log('  ', lineNumber, '  ', line);
};
