import { type RenderResult, fireEvent } from '@testing-library/svelte';
import type { EditModalShowSettings } from '../../src/Config/EditModalShowSettings';
import { getSettings } from '../../src/Config/Settings';
import type EditTask from '../../src/ui/EditTask.svelte';
import type ModalOptionsEditor from '../../src/ui/ModalOptionsEditor.svelte';

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

export function getAndCheckButton(result: RenderResult<ModalOptionsEditor>, buttonId: string): HTMLButtonElement {
    const submit = result.getByText(buttonId) as HTMLButtonElement;
    expect(submit).toBeTruthy();
    return submit;
}

export function checkAndClickApplyButton(result: RenderResult<ModalOptionsEditor>) {
    const apply = getAndCheckButton(result, 'Apply');
    apply.click();
}

export function checkAndClickCancelButton(result: RenderResult<ModalOptionsEditor>) {
    const cancel = getAndCheckButton(result, 'Cancel');
    cancel.click();
}

export async function editInputElement(inputElement: HTMLInputElement, newValue: string | boolean) {
    await fireEvent.input(inputElement, { target: { value: newValue } });
}

export async function uncheckCheckbox(container: HTMLElement, elementId: string) {
    const inputElement = getAndCheckRenderedElement<HTMLInputElement>(container, elementId);

    await fireEvent.change(inputElement, { target: { checked: false } });
}

function randomIndex(max: number) {
    return Math.floor(Math.random() * max);
}

export function optionsWithoutARandomField() {
    const fields = Object.keys(getSettings().isShownInEditModal) as (keyof EditModalShowSettings)[];
    const randomField = fields[randomIndex(fields.length - 1)];
    const optionsWithoutARandomField = { ...getSettings().isShownInEditModal };
    delete optionsWithoutARandomField[randomField];
    return optionsWithoutARandomField;
}
