import type { RenderResult } from '@testing-library/svelte';
import type EditTask from '../../src/ui/EditTask.svelte';

/**
 * Find the element with the given id.
 * Template type T might be, for example, HTMLInputElement or HTMLSelectElement
 * @param container
 * @param elementId
 */
export function getAndCheckRenderedElement<T>(container: HTMLElement, elementId: string) {
    const element = container.ownerDocument.getElementById(elementId) as T;
    expect(element).not.toBeNull();
    return element;
}

export function getAndCheckRenderedDescriptionElement(container: HTMLElement): HTMLInputElement {
    return getAndCheckRenderedElement<HTMLInputElement>(container, 'description');
}

export function getAndCheckApplyButton(result: RenderResult<EditTask>): HTMLButtonElement {
    const submit = result.getByText('Apply') as HTMLButtonElement;
    expect(submit).toBeTruthy();
    return submit;
}
