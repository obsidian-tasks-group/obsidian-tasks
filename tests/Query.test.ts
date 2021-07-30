import { Query } from '../src/Query';

describe('Query', () => {
    describe('sorting instructions', () => {
        const cases: Record<string, { input: string; output: string[] }> = {
            'by status': {
                input: 'sort by status',
                output: ['status'],
            },
            multiple: {
                input: 'sort by status\nsort by due',
                output: ['status', 'due'],
            },
        };
        for (const [name, { input, output }] of Object.entries(cases)) {
            test(name, () => {
                const query = new Query({ source: input });

                expect(query.sorting).toEqual(output);
            });
        }
    });
});
