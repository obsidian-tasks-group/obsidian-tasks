import { type Editor, Notice, type TFile, type Vault, normalizePath } from 'obsidian';
import { getSettings } from '../Config/Settings';
import type { Task } from '../Task/Task';
import { TaskRegularExpressions } from '../Task/TaskRegularExpressions';

/**
 * Deletes a task's line from its note, if the line still holds the given text, and returns whether it did.
 *
 * @see editorLineDeleter
 * @see fileLineDeleter
 */
export type LineDeleter = (expectedText: string) => boolean | Promise<boolean>;

function warnAndNotice(message: string) {
    console.warn(message);
    new Notice(message, 10000);
}

/**
 * Append a completed task to the end of the archive file, without its indentation,
 * creating the file, and any folders it needs, if they are missing.
 *
 * @param vault
 * @param archiveFilePath - the path in the settings, before {@link normalizePath}
 * @param task - the task to append
 * @returns whether the task was appended. If it wasn't, a notice names the archive file.
 */
export async function appendToArchiveFile(vault: Vault, archiveFilePath: string, task: Task): Promise<boolean> {
    const path = normalizePath(archiveFilePath);
    // Obsidian ignores any file or folder whose name starts with a dot, so no search would find the task there.
    if (!path.endsWith('.md') || path.split('/').some((name) => name.startsWith('.'))) {
        warnAndNotice(
            `Tasks: Can't move "${task.description}" to the archive file "${archiveFilePath}": its path must end in .md, and no name in it can start with a dot.`,
        );
        return false;
    }

    const line = task.toFileLineString().replace(TaskRegularExpressions.indentationRegex, '');
    try {
        const file = vault.getFileByPath(path);
        if (file === null) {
            await createParentFolder(vault, path);
            await vault.create(path, line + '\n');
        } else {
            await vault.process(file, (data) => {
                const lineBreak = data === '' || data.endsWith('\n') ? '' : '\n';
                return data + lineBreak + line + '\n';
            });
        }
        return true;
    } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        warnAndNotice(`Tasks: Can't move "${task.description}" to the archive file "${path}":\n\n${reason}`);
        return false;
    }
}

async function createParentFolder(vault: Vault, filePath: string) {
    // createFolder() creates any missing parents too.
    const parent = filePath.split('/').slice(0, -1).join('/');
    if (parent !== '' && vault.getFolderByPath(parent) === null) {
        await vault.createFolder(parent);
    }
}

/**
 * Move a completed task, which the caller has just written to its note, to the end of the archive file.
 *
 * The task stays in its note, completed, when the note is the archive file itself, or when the append fails.
 *
 * @param vault
 * @param sourcePath - the path of the note that holds the task
 * @param task - the completed task, which is the `task` that `findTaskToArchive()` returned
 * @param deleteLine - deletes the task's line from its note, once the append has succeeded
 */
export async function moveToArchiveFile(
    vault: Vault,
    sourcePath: string,
    task: Task,
    deleteLine: LineDeleter,
): Promise<void> {
    const { archiveFilePath } = getSettings();
    const path = normalizePath(archiveFilePath);
    if (sourcePath === path) {
        return;
    }

    if (!(await appendToArchiveFile(vault, archiveFilePath, task))) {
        return;
    }

    if (!(await deleteLine(task.toFileLineString()))) {
        warnAndNotice(
            `Tasks: Moved "${task.description}" to the archive file "${path}", but couldn't remove it from "${sourcePath}", so it's now in both files.`,
        );
    }
}

/**
 * A {@link LineDeleter} for a note open in an editor, which deletes the line and its line break,
 * as the editor commands do for a task whose On Completion action is delete.
 *
 * @param editor
 * @param lineNumber - the zero-based line number that the task was written to
 */
export function editorLineDeleter(editor: Editor, lineNumber: number): LineDeleter {
    return (expectedText: string) => {
        if (editor.getLine(lineNumber) !== expectedText) {
            return false;
        }

        if (lineNumber < editor.lineCount() - 1) {
            editor.replaceRange('', { line: lineNumber, ch: 0 }, { line: lineNumber + 1, ch: 0 });
        } else {
            editor.setLine(lineNumber, '');
        }
        return true;
    };
}

/**
 * A {@link LineDeleter} for a note written through the vault.
 *
 * @param vault
 * @param file - the note that holds the task
 * @param lineNumber - the zero-based line number that the task was written to
 */
export function fileLineDeleter(vault: Vault, file: TFile, lineNumber: number): LineDeleter {
    return async (expectedText: string) => {
        let deleted = false;
        try {
            await vault.process(file, (data) => {
                const lines = data.split('\n');
                if (lines[lineNumber] !== expectedText) {
                    return data;
                }

                lines.splice(lineNumber, 1);
                deleted = true;
                return lines.join('\n');
            });
        } catch (error) {
            console.error(error);
            return false;
        }
        return deleted;
    };
}
