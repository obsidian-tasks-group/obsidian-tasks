import { TaskLineLocation } from '../src/TaskLineLocation';

describe('TaskLineLocation', () => {
    it('should store the full task location', () => {
        // Arrange
        const path = 'a/b/c.md';
        const sectionStart = 3;
        const sectionIndex = 7;
        const precedingHeader = 'My Header';

        // Act
        const taskLineLocation = new TaskLineLocation(path, sectionStart, sectionIndex, precedingHeader);

        // Assert
        expect(taskLineLocation.path).toStrictEqual(path);
        expect(taskLineLocation.sectionStart).toStrictEqual(sectionStart);
        expect(taskLineLocation.sectionIndex).toStrictEqual(sectionIndex);
        expect(taskLineLocation.precedingHeader).toStrictEqual(precedingHeader);
    });

    it('should construct from only the file path', () => {
        // Arrange
        const path = 'a/b/c.md';

        // Act
        const taskLineLocation = TaskLineLocation.fromUnknownPosition(path);

        // Assert
        expect(taskLineLocation.path).toStrictEqual(path);
        expect(taskLineLocation.sectionStart).toStrictEqual(0);
        expect(taskLineLocation.sectionIndex).toStrictEqual(0);
        expect(taskLineLocation.precedingHeader).toBeNull();
    });

    it('should provide convenient renaming of path', () => {
        // Arrange
        const path = 'a/b/c.md';
        const sectionStart = 13;
        const sectionIndex = 10;
        const precedingHeader = 'My Previous Header';
        const taskLineLocation = new TaskLineLocation(path, sectionStart, sectionIndex, precedingHeader);

        // Act
        const newPath = 'd/e/f.md';
        const newLocation = taskLineLocation.fromRenamedFile(newPath);

        // Assert
        expect(newLocation.path).toStrictEqual(newPath);
        expect(newLocation.sectionStart).toStrictEqual(sectionStart);
        expect(newLocation.sectionIndex).toStrictEqual(sectionIndex);
        expect(newLocation.precedingHeader).toStrictEqual(precedingHeader);
    });
});
