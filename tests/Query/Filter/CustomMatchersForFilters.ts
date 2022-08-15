import type { FilterOrErrorMessage } from '../../../src/Query/Filter/Filter';
import { fromLine } from '../../TestHelpers';

declare global {
    namespace jest {
        interface Matchers<R> {
            toMatchTaskWithDescription(description: string): R;
        }

        interface Expect {
            toMatchTaskWithDescription(description: string): any;
        }

        interface InverseAsymmetricMatchers {
            toMatchTaskWithDescription(description: string): any;
        }
    }
}

export function toMatchTaskWithDescription(
    filter: FilterOrErrorMessage,
    description: string,
) {
    const task = fromLine({
        line: description,
    });

    const matches = filter.filter!(task);
    if (!matches) {
        return {
            message: () => `unexpected failure to match task: ${description}`,
            pass: false,
        };
    }

    return {
        message: () => `filter should not have matched task: ${description}`,
        pass: true,
    };
}
