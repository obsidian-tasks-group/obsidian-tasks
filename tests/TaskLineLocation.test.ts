import { TaskLineLocation } from '../src/TaskLineLocation';

describe('TaskLineLocation', () => {
    it('should store the file path', () => {
        // Arrange
        const path = 'a/b/c.md';
        const taskLineLocation = new TaskLineLocation(path);

        // Assert
        expect(taskLineLocation.path).toStrictEqual(path);
    });
});
