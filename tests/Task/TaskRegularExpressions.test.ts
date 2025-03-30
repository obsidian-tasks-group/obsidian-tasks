import { TaskRegularExpressions } from '../../src/Task/TaskRegularExpressions';

describe('List Markers', () => {
    it.each([
        // split list
        '-',
        '*',
        '+',
        '0.',
        '1.',
        '12345.',
        '0)',
        '1)',
        '12345)',
    ])('should be a valid list marker: "%s"', (candidate: string) => {
        expect(TaskRegularExpressions.listMarkerRegex.exec(candidate)).not.toBeNull();
    });

    it.each([
        // split list
        '%',
        '.',
        ')',
    ])('should NOT be a valid list marker: "%s"', (candidate: string) => {
        expect(TaskRegularExpressions.listMarkerRegex.exec(candidate)).toBeNull();
    });
});
