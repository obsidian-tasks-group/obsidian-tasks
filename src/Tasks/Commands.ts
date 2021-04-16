import { Obsidian } from '../Obsidian';
import { File } from './File';
import { REGEX_TASK } from './Task';

export class Commands {
    private readonly file: File;
    private readonly obsidian: Obsidian;

    constructor({ file, obsidian }: { file: File; obsidian: Obsidian }) {
        this.file = file;
        this.obsidian = obsidian;

        this.obsidian.addCommand({
            id: 'toggle-done',
            name: 'Toggle Done',
            checkCallback: (checking: boolean) => {
                if (checking) {
                    const markdownView = this.obsidian.activeMarkdownView;
                    if (markdownView === undefined) {
                        return false;
                    }

                    const editor = this.obsidian.editor;
                    const currentLine = editor.getLine(editor.getCursor().line);

                    const isTasksLine = REGEX_TASK.test(currentLine);

                    return isTasksLine;
                }

                // We are certain we are in the editor on a tasks line due to the check above.
                const path = obsidian.activeFilePath;
                if (path === undefined) {
                    return;
                }
                const editor = obsidian.editor;
                const cursorPosition = editor.getCursor();
                const lineNumber = cursorPosition.line;
                this.file.toggleDone({ path, lineNumber });
            },
        });
    }
}
