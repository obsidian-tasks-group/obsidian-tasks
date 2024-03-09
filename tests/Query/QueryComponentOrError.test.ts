import { QueryComponentOrError } from '../../src/Query/QueryComponentOrError';

describe('QueryComponentOrError', () => {
    it('should check validity', () => {
        expect(QueryComponentOrError.fromObject<number>('instruction', 42).isValid()).toBe(true);
        expect(QueryComponentOrError.fromError<number>('instruction', 'error message').isValid()).toBe(false);
    });
});
