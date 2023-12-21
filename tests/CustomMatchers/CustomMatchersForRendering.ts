import { diff } from 'jest-diff';

declare global {
    namespace jest {
        interface Matchers<R> {
            toHaveDataAttributes(expectedDataAttributes: string): R;
        }

        interface Expect {
            toHaveDataAttributes(expectedDataAttributes: string): any;
        }

        interface InverseAsymmetricMatchers {
            toHaveDataAttributes(expectedDataAttributes: string): any;
        }
    }
}

function getDataAttributesAsString(element: HTMLElement): string {
    const dataAttributes = element.dataset;
    const keys = Object.keys(dataAttributes);

    return keys.map((key) => `${key}: ${dataAttributes[key]}`).join('\n');
}

export function toHaveDataAttributes(htmlElement: HTMLElement, expectedDataAttributes: string) {
    const renderedDataAttributes = getDataAttributesAsString(htmlElement);

    const pass: boolean = renderedDataAttributes === expectedDataAttributes;
    const message: () => string = () =>
        pass
            ? `Data attributes should not be\n${renderedDataAttributes}`
            : `Data attributes are not the same as expected:\n${diff(expectedDataAttributes, renderedDataAttributes)}`;
    return {
        message,
        pass,
    };
}
