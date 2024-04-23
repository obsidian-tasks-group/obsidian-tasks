import type { App } from 'obsidian';
import { tasksApiV1 } from '../../src/Api';
import { DefaultTaskSerializer } from '../../src/TaskSerializer/DefaultTaskSerializer';

jest.mock('obsidian', () => ({
    Modal: class Mock {},
}));

const app = {} as App;
describe('APIv1 - getDefaultTaskSerializer', () => {
    const api = tasksApiV1(app);

    it('should return a DefaultTaskSerializer instance', () => {
        expect(api.getDefaultTaskSerializer()).toBeInstanceOf(DefaultTaskSerializer);
    });
});
