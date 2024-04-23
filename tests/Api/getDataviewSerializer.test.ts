import type { App } from 'obsidian';
import { tasksApiV1 } from '../../src/Api';
import { DataviewTaskSerializer } from '../../src/TaskSerializer/DataviewTaskSerializer';

jest.mock('obsidian', () => ({
    Modal: class Mock {},
}));

const app = {} as App;
describe('APIv1 - getDataviewTaskSerializer', () => {
    const api = tasksApiV1(app);

    it('should return a DataviewTaskSerializer instance', () => {
        expect(api.getDataviewTaskSerializer()).toBeInstanceOf(DataviewTaskSerializer);
    });
});
