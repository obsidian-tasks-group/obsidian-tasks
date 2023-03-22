import { TaskLocation } from '../src/TaskLocation';

describe('TaskLocation', () => {
    it('should store the full task location', () => {
        // Arrange
        const path = 'a/b/c.md';
        const lineNumber = 15;
        const sectionStart = 3;
        const sectionIndex = 7;
        const precedingHeader = 'My Header';

        // Act
        const taskLocation = new TaskLocation(path, lineNumber, sectionStart, sectionIndex, precedingHeader);

        // Assert
        expect(taskLocation.path).toStrictEqual(path);
        expect(taskLocation.lineNumber).toStrictEqual(lineNumber);
        expect(taskLocation.sectionStart).toStrictEqual(sectionStart);
        expect(taskLocation.sectionIndex).toStrictEqual(sectionIndex);
        expect(taskLocation.precedingHeader).toStrictEqual(precedingHeader);
    });

    it('should construct from only the file path', () => {
        // Arrange
        const path = 'a/b/c.md';

        // Act
        const taskLocation = TaskLocation.fromUnknownPosition(path);

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
        const taskLocation = new TaskLocation(path, lineNumber, sectionStart, sectionIndex, precedingHeader);

        // Act
        const newPath = 'd/e/f.md';
        const newLocation = taskLocation.fromRenamedFile(newPath);

        // Assert
        expect(newLocation.path).toStrictEqual(newPath);
        expect(newLocation.lineNumber).toStrictEqual(lineNumber);
        expect(newLocation.sectionStart).toStrictEqual(sectionStart);
        expect(newLocation.sectionIndex).toStrictEqual(sectionIndex);
        expect(newLocation.precedingHeader).toStrictEqual(precedingHeader);
    });
});
