export function moveTaskWithinSameFile(
    sourceLines: string[],
    taskLineIndex: number,
    insertionLine: number,
    linesToMove: string[],
): string[] {
    const numLinesToMove = linesToMove.length;

    if (insertionLine <= taskLineIndex) {
        // Inserting before the task - insert first, then delete (accounting for offset)
        return [
            ...sourceLines.slice(0, insertionLine),
            ...linesToMove,
            ...sourceLines.slice(insertionLine, taskLineIndex),
            ...sourceLines.slice(taskLineIndex + numLinesToMove),
        ];
    } else {
        // Inserting after the task - the slicing handles the offset naturally
        return [
            ...sourceLines.slice(0, taskLineIndex),
            ...sourceLines.slice(taskLineIndex + numLinesToMove, insertionLine),
            ...linesToMove,
            ...sourceLines.slice(insertionLine),
        ];
    }
}

export function moveTaskBetweenFiles(
    sourceLines: string[],
    targetLines: string[],
    taskLineIndex: number,
    insertionLine: number,
    linesToMove: string[],
): { newTargetLines: string[]; newSourceLines: string[] } {
    const numLinesToMove = linesToMove.length;

    // Insert into target first
    const newTargetLines = [
        ...targetLines.slice(0, insertionLine),
        ...linesToMove,
        ...targetLines.slice(insertionLine),
    ];

    // Delete from source
    const newSourceLines = [
        ...sourceLines.slice(0, taskLineIndex),
        ...sourceLines.slice(taskLineIndex + numLinesToMove),
    ];
    return { newTargetLines, newSourceLines };
}
