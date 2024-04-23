import type { App } from 'obsidian';
import { tasksApiV1 } from '../../src/Api';
import { toggleLine } from '../../src/Commands/ToggleDone';

jest.mock('obsidian', () => ({
    Modal: class Mock {},
}));

const app = {} as App;
describe('APIv1 - toggleLine', () => {
    const api = tasksApiV1(app);

    it('should be the toggleLine function', () => {
        expect(api.toggleLine).toBe(toggleLine);
    });
});
