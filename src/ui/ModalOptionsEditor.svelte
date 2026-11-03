<script lang="ts">
    import { setIcon } from 'obsidian';
    import { tick } from 'svelte';
    import {
        type EditModalFieldGroup,
        defaultEditModalShowSettings,
        editModalFieldGroupsInOrder,
    } from '../Config/EditModalShowSettings';
    import { settingsStore } from './SettingsStore';

    export let onSave: () => void;
    export let onClose: () => void;

    // Create a reactive object for the options
    // Forced to use any here instead of EditModalShowSettings. Otherwise there is a compiler error at
    // <input type="checkbox" checked={options[fieldName]} /> below. This is solved in Svelte 5.
    let options: any = { ...defaultEditModalShowSettings, ...$settingsStore.isShownInEditModal };

    let groups: EditModalFieldGroup[] = editModalFieldGroupsInOrder($settingsStore.editModalFieldOrder);

    const onChange = (fieldName: string) => (event: Event) => {
        options[fieldName] = (event.target as HTMLInputElement).checked;
    };

    const _onSave = () => {
        settingsStore.set({
            ...$settingsStore,
            isShownInEditModal: options,
            editModalFieldOrder: groups.flatMap((group) => group.fields),
        });
        onSave();
    };

    const onResetOrder = () => {
        groups = editModalFieldGroupsInOrder(undefined);
    };

    // Helper to format field names for display
    const formatFieldName = (fieldName: string): string => {
        return fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace('_', ' ');
    };

    const icon = (node: HTMLElement, iconId: string) => {
        setIcon(node, iconId);
    };

    // ---------------------------------------------------------------------------
    // Reordering
    //
    // Each handle moves its item within its own list: a group among the groups,
    // or a field within its group. Elements marked with 'data-reorder-item' are
    // the items, and their order in the DOM matches the order in 'groups'.
    // ---------------------------------------------------------------------------

    type MoveItem = (from: number, to: number) => void;

    function moved<T>(items: T[], from: number, to: number): T[] {
        const result = [...items];
        result.splice(to, 0, ...result.splice(from, 1));
        return result;
    }

    const moveGroup: MoveItem = (from, to) => {
        groups = moved(groups, from, to);
    };

    const moveField =
        (group: EditModalFieldGroup): MoveItem =>
        (from, to) => {
            group.fields = moved(group.fields, from, to);
            groups = groups;
        };

    function itemAndSiblings(handle: HTMLElement) {
        const item = handle.closest('[data-reorder-item]') as HTMLElement;
        const siblings = Array.from(item.parentElement!.children).filter((element) =>
            element.hasAttribute('data-reorder-item'),
        );
        return { item, siblings };
    }

    // Pointer events, rather than HTML5 drag-and-drop, so that dragging also works on touch screens.
    function onHandlePointerDown(event: PointerEvent, move: MoveItem) {
        if (event.button !== 0) {
            return;
        }
        event.preventDefault();

        const { item } = itemAndSiblings(event.currentTarget as HTMLElement);
        item.classList.add('is-dragging');

        const onPointerMove = (moveEvent: PointerEvent) => {
            const { siblings } = itemAndSiblings(item);
            const from = siblings.indexOf(item);
            const to = siblings.filter((sibling) => {
                const rect = sibling.getBoundingClientRect();
                return sibling !== item && rect.top + rect.height / 2 < moveEvent.clientY;
            }).length;
            if (to !== from) {
                move(from, to);
            }
        };

        const onPointerUp = () => {
            item.classList.remove('is-dragging');
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerUp);
            document.removeEventListener('pointercancel', onPointerUp);
        };

        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
        document.addEventListener('pointercancel', onPointerUp);
    }

    async function onHandleKeyDown(event: KeyboardEvent, move: MoveItem) {
        const step = { ArrowUp: -1, ArrowDown: 1 }[event.key];
        if (step === undefined) {
            return;
        }
        event.preventDefault();

        const handle = event.currentTarget as HTMLElement;
        const { item, siblings } = itemAndSiblings(handle);
        const from = siblings.indexOf(item);
        const to = from + step;
        if (to < 0 || to >= siblings.length) {
            return;
        }
        move(from, to);

        // Moving the item in the DOM loses the focus.
        await tick();
        handle.focus();
    }
</script>

<div class="tasks-options-modal">
    <div class="tasks-options-modal-groups">
        {#each groups as group, groupIndex (group.name)}
            <div class="tasks-options-modal-group" data-reorder-item>
                <button
                    type="button"
                    class="tasks-options-modal-handle clickable-icon"
                    aria-label="Drag to rearrange group"
                    use:icon={'grip-vertical'}
                    on:pointerdown={(event) => onHandlePointerDown(event, moveGroup)}
                    on:keydown={(event) => onHandleKeyDown(event, moveGroup)}
                ></button>
    <div class="tasks-options-modal-checkboxes">
                    {#each group.fields as fieldName (fieldName)}
                        <div class="tasks-options-modal-field" data-reorder-item>
            <label>
                <input type="checkbox" checked={options[fieldName]} id={fieldName} on:change={onChange(fieldName)} />
                <span>{formatFieldName(fieldName)}</span>
            </label>
                            {#if group.fields.length > 1}
                                <button
                                    type="button"
                                    class="tasks-options-modal-handle clickable-icon"
                                    aria-label="Drag to rearrange"
                                    use:icon={'menu'}
                                    on:pointerdown={(event) => onHandlePointerDown(event, moveField(group))}
                                    on:keydown={(event) => onHandleKeyDown(event, moveField(group))}
                                ></button>
                            {/if}
                        </div>
                    {/each}
                </div>
            </div>

            {#if groupIndex < groups.length - 1}
                <hr />
            {/if}
        {/each}
    </div>

    <div class="tasks-options-modal-footer">
        <button type="button" class="tasks-options-modal-reset" on:click={onResetOrder}>Reset order</button>
        <button type="button" class="mod-cta" on:click={_onSave}>Apply</button>
        <button type="button" on:click={onClose}>Cancel</button>
    </div>
</div>
