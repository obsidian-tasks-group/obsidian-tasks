import { TasksFile } from '../../src/Scripting/TasksFile';
import { TaskLocation } from '../../src/Task/TaskLocation';

describe('TaskLocation', () => {
    it('should store the full task location', () => {
        // Arrange
        const path = 'a/b/c.md';
        const lineNumber = 15;
        const sectionStart = 3;
        const sectionIndex = 7;
        const precedingHeader = 'My Header';

        // Act
        const taskLocation = new TaskLocation(
            new TasksFile(path),
            lineNumber,
            sectionStart,
            sectionIndex,
            precedingHeader,
        );

        // Assert
        expect(taskLocation.path).toStrictEqual(path);
        expect(taskLocation.tasksFile.path).toStrictEqual(path);
        expect(taskLocation.lineNumber).toStrictEqual(lineNumber);
        expect(taskLocation.sectionStart).toStrictEqual(sectionStart);
        expect(taskLocation.sectionIndex).toStrictEqual(sectionIndex);
        expect(taskLocation.precedingHeader).toStrictEqual(precedingHeader);
    });

    it('should construct from only the file path', () => {
        // Arrange
        const path = 'a/b/c.md';

        // Act
        const taskLocation = TaskLocation.fromUnknownPosition(new TasksFile(path));

        // Assert
        expect(taskLocation.path).toStrictEqual(path);
        expect(taskLocation.lineNumber).toStrictEqual(0);
        expect(taskLocation.sectionStart).toStrictEqual(0);
        expect(taskLocation.sectionIndex).toStrictEqual(0);
        expect(taskLocation.precedingHeader).toBeNull();
    });

    it('should provide convenient renaming of path', () => {
        // Arrange
        const path = 'a/b/c.md';
        const lineNumber = 43;
        const sectionStart = 13;
        const sectionIndex = 10;
        const precedingHeader = 'My Previous Header';
        const taskLocation = new TaskLocation(
            new TasksFile(path),
            lineNumber,
            sectionStart,
            sectionIndex,
            precedingHeader,
        );

        // Act
        const newPath = 'd/e/f.md';
        const newLocation = taskLocation.fromRenamedFile(new TasksFile(newPath));

        // Assert
        expect(newLocation.path).toStrictEqual(newPath);
        expect(newLocation.lineNumber).toStrictEqual(lineNumber);
        expect(newLocation.sectionStart).toStrictEqual(sectionStart);
        expect(newLocation.sectionIndex).toStrictEqual(sectionIndex);
        expect(newLocation.precedingHeader).toStrictEqual(precedingHeader);
    });

    it('should recognise unknown paths', () => {
        expect(TaskLocation.fromUnknownPosition(new TasksFile('x.md')).hasKnownPath).toBe(true);
        expect(TaskLocation.fromUnknownPosition(new TasksFile('')).hasKnownPath).toBe(false);
    });
});

describe('TaskLocation - identicalTo', function () {
    const tasksFile: TasksFile = new TasksFile('x.md');
    const lineNumber: number = 40;
    const sectionStart: number = 30;
    const sectionIndex: number = 3;
    const precedingHeader: string | null = 'heading';

    const lhs = new TaskLocation(tasksFile, lineNumber, sectionStart, sectionIndex, precedingHeader);

    it('should detect identical objects', () => {
        const rhs = new TaskLocation(tasksFile, lineNumber, sectionStart, sectionIndex, precedingHeader);
        expect(lhs.identicalTo(rhs)).toEqual(true);
    });

    it('should check tasksFile', () => {
        const rhs = new TaskLocation(new TasksFile('y.md'), lineNumber, sectionStart, sectionIndex, precedingHeader);
        expect(lhs.identicalTo(rhs)).toEqual(false);
    });

    it('should check lineNumber', () => {
        const rhs = new TaskLocation(tasksFile, 0, sectionStart, sectionIndex, precedingHeader);
        expect(lhs.identicalTo(rhs)).toEqual(false);
    });

    it('should check sectionStart', () => {
        const rhs = new TaskLocation(tasksFile, lineNumber, 0, sectionIndex, precedingHeader);
        expect(lhs.identicalTo(rhs)).toEqual(false);
    });

    it('should check sectionIndex', () => {
        const rhs = new TaskLocation(tasksFile, lineNumber, sectionStart, 0, precedingHeader);
        expect(lhs.identicalTo(rhs)).toEqual(false);
    });

    it('should check precedingHeader', () => {
        {
            const precedingHeader = null;
            const rhs = new TaskLocation(tasksFile, lineNumber, sectionStart, sectionIndex, precedingHeader);
            expect(lhs.identicalTo(rhs)).toEqual(false);
        }

        {
            const precedingHeader = 'different header';
            const rhs = new TaskLocation(tasksFile, lineNumber, sectionStart, sectionIndex, precedingHeader);
            expect(lhs.identicalTo(rhs)).toEqual(false);
        }
    });
});
