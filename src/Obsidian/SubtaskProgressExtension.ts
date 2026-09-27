import { Decoration, type DecorationSet, EditorView, ViewPlugin, type ViewUpdate, WidgetType } from '@codemirror/view';
import { editorLivePreviewField } from 'obsidian';
import { getSettings } from '../Config/Settings';
import { type SubtaskProgress, renderSubtaskProgress, subtaskProgressFromLines } from '../Task/SubtaskProgress';
import { editorDecorationsRefreshVersion, linesInsideCodeBlocks } from './EditorDecorations';

class SubtaskProgressWidget extends WidgetType {
    constructor(private readonly progress: SubtaskProgress) {
        super();
    }

    eq(other: SubtaskProgressWidget) {
        return (
            other.progress.done === this.progress.done &&
            other.progress.inProgress === this.progress.inProgress &&
            other.progress.total === this.progress.total
        );
    }

    toDOM() {
        const wrapper = createSpan({ cls: 'tasks-editor-progress' });
        renderSubtaskProgress(wrapper, this.progress);
        return wrapper;
    }

    ignoreEvent() {
        return false;
    }
}

function shouldShowProgress(view: EditorView) {
    return getSettings().showSubtaskProgress && view.state.field(editorLivePreviewField, false) === true;
}

function buildDecorations(view: EditorView): DecorationSet {
    if (!shouldShowProgress(view)) {
        return Decoration.none;
    }

    const { doc } = view.state;
    const visibleRanges = view.visibleRanges;
    if (visibleRanges.length === 0) {
        return Decoration.none;
    }

    // Subtasks may continue below the visible part of the note, so read the whole note.
    const lines = doc.toString().split('\n');
    const lastVisibleLineIndex = doc.lineAt(visibleRanges[visibleRanges.length - 1].to).number - 1;
    const insideCodeBlock = linesInsideCodeBlocks(lines, lastVisibleLineIndex);

    const decorations: ReturnType<Decoration['range']>[] = [];
    for (const { from, to } of visibleRanges) {
        let pos = from;
        while (pos <= to) {
            const line = doc.lineAt(pos);
            pos = line.to + 1;

            const lineIndex = line.number - 1;
            if (insideCodeBlock[lineIndex]) {
                continue;
            }

            const progress = subtaskProgressFromLines(lines, lineIndex);
            if (progress !== null) {
                decorations.push(
                    Decoration.widget({ widget: new SubtaskProgressWidget(progress), side: 1 }).range(line.to),
                );
            }
        }
    }
    return Decoration.set(decorations, true);
}

/**
 * In Live Preview, show a progress bar at the end of each task that has subtasks.
 */
export function newSubtaskProgressExtension() {
    return ViewPlugin.fromClass(
        class {
            decorations: DecorationSet;
            private refreshVersion = editorDecorationsRefreshVersion();

            constructor(view: EditorView) {
                this.decorations = buildDecorations(view);
            }

            update(update: ViewUpdate) {
                const livePreviewChanged =
                    update.startState.field(editorLivePreviewField, false) !==
                    update.state.field(editorLivePreviewField, false);
                const refreshRequested = this.refreshVersion !== editorDecorationsRefreshVersion();
                if (update.docChanged || update.viewportChanged || livePreviewChanged || refreshRequested) {
                    this.refreshVersion = editorDecorationsRefreshVersion();
                    this.decorations = buildDecorations(update.view);
                }
            }
        },
        {
            decorations: (plugin) => plugin.decorations,
        },
    );
}
