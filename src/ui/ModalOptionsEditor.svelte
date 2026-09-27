<script lang="ts">
    import { defaultEditModalShowSettings } from '../Config/EditModalShowSettings';
    import { settingsStore } from './SettingsStore';

    export let onSave: () => void;
    export let onClose: () => void;

    // Create a reactive object for the options
    // Forced to use any here instead of EditModalShowSettings. Otherwise there is a compiler error at
    // <input type="checkbox" checked={options[fieldName]} /> below. This is solved in Svelte 5.
    let options: any = { ...defaultEditModalShowSettings, ...$settingsStore.isShownInEditModal };

    const onChange = (fieldName: string) => (event: Event) => {
        options[fieldName] = (event.target as HTMLInputElement).checked;
    };

    const _onSave = () => {
        settingsStore.set({ ...$settingsStore, isShownInEditModal: options });
        onSave();
    };

    // The fields in the order they appear in the edit dialog, with their display names.
    // NEW_TASK_FIELD_EDIT_REQUIRED
    const fieldLabels: Record<string, string> = {
        priority: 'Priority',
        due: 'Due date',
        scheduled: 'Scheduled date',
        start: 'Start date',
        recurrence: 'Recurs',
        before_this: 'Blocked by',
        after_this: 'Blocks',
        status: 'Status',
        created: 'Created date',
        done: 'Done date',
        cancelled: 'Cancelled date',
    };
    const fieldNames = [
        ...Object.keys(fieldLabels),
        ...Object.keys(options).filter((fieldName) => !(fieldName in fieldLabels)),
    ];

    const withLinesAfterFields = ['priority', 'recurrence', 'after_this'];
</script>

<div class="tasks-options-modal">
    <div class="tasks-options-modal-checkboxes">
        {#each fieldNames as fieldName}
            <label>
                <input type="checkbox" checked={options[fieldName]} id={fieldName} on:change={onChange(fieldName)} />
                <span>{fieldLabels[fieldName] ?? fieldName}</span>
            </label>

            {#if withLinesAfterFields.includes(fieldName)}
                <hr />
            {/if}
        {/each}
    </div>

    <div class="tasks-options-modal-footer">
        <button type="button" class="mod-cta" on:click={_onSave}>Apply</button>
        <button type="button" on:click={onClose}>Cancel</button>
    </div>
</div>
