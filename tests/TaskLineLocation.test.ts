import { TaskLineLocation } from '../src/TaskLineLocation';

describe('TaskLineLocation', () => {
    it('should store the file path', () => {
        // Arrange
        const path = 'a/b/c.md';
        const sectionStart = 3;
        const taskLineLocation = new TaskLineLocation(path, sectionStart);

        // Assert
        expect(taskLineLocation.path).toStrictEqual(path);
        expect(taskLineLocation.sectionStart).toStrictEqual(sectionStart);
    });
});
