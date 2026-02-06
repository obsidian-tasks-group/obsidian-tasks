/**
 * @jest-environment jsdom
 */

import moment from 'moment';
import { setStatusOnLine } from '../../src/Commands/CreateSetStatusLineTransformer';
import { Status } from '../../src/Statuses/Status';

window.moment = moment;

describe('setStatusOnLine', () => {
    it('should return undefined for a non-task line', () => {
        const result = setStatusOnLine('This is not a task', 'file.md', Status.DONE);
        expect(result).toBeUndefined();
    });

    it('should return undefined for an empty line', () => {
        const result = setStatusOnLine('', 'file.md', Status.DONE);
        expect(result).toBeUndefined();
    });

    it('should return an EditorInsertion for a valid task line', () => {
        const result = setStatusOnLine('- [ ] A simple task', 'file.md', Status.DONE);
        expect(result).toBeDefined();
        expect(result).toHaveProperty('text');
        expect(result).toHaveProperty('moveTo');
    });

    it('should set moveTo.line to 0 for a single-line result', () => {
        const result = setStatusOnLine('- [ ] A simple task', 'file.md', Status.DONE);
        expect(result).toBeDefined();
        expect(result!.moveTo).toEqual({ line: 0 });
    });

    it('should return multiple lines with moveTo.line as last line index for a recurring task', () => {
        const result = setStatusOnLine('- [ ] A recurring task 🔁 every day 📅 2022-09-04', 'file.md', Status.DONE);
        expect(result).toBeDefined();
        const lines = result!.text.split('\n');
        expect(lines.length).toBeGreaterThan(1);
        expect(result!.moveTo).toEqual({ line: lines.length - 1 });
    });
});
