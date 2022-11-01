import { Lazy } from '../../src/lib/Lazy';

describe('Lazy', () => {
    it('should return produced value', () => {
        const lazyString = new Lazy(() => 'result');
        expect(lazyString.value).toBe('result');
    });

    it('should call the produced once', () => {
        let counter = 0;
        const lazyString = new Lazy(() => {
            ++counter;
            return 'result' + counter;
        });

        expect(lazyString.value).toBe('result1');
        expect(lazyString.value).toBe('result1');
        expect(counter).toBe(1);
    });

    it('should cache null values', () => {
        let counter = 0;
        const lazyString = new Lazy<string | null>(() => {
            ++counter;
            return null;
        });

        expect(lazyString.value).toBeNull();
        expect(lazyString.value).toBeNull();

        // producer called only once even if it returned null
        expect(counter).toBe(1);
    });
});
