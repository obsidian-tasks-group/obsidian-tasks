<script lang="ts">
    import { defaultEditModalShowSettings } from '../Config/EditModalShowSettings';
    import type { EditModalShowSettings } from '../Config/EditModalShowSettings';
    import { settingsStore } from './SettingsStore';

    interface Props {
        onSave: () => void;
        onClose: () => void;
    }

    let { onSave, onClose }: Props = $props();

    type ModalOptions = EditModalShowSettings;
    let options = $state<ModalOptions>({ ...defaultEditModalShowSettings, ...$settingsStore.isShownInEditModal });
    let fieldNames = $derived(Object.keys(options) as (keyof ModalOptions)[]);

    const onChange = (fieldName: keyof ModalOptions) => (event: Event) => {
        options[fieldName] = (event.target as HTMLInputElement).checked;
    };

    const _onSave = () => {
        settingsStore.set({ ...$settingsStore, isShownInEditModal: { ...options } });
        onSave();
    };

    // Helper to format field names for display
    const formatFieldName = (fieldName: string): string => {
        return fieldName.charAt(0).toUpperCase() + fieldName.slice(1).replace('_', ' ');
    };

    const withLinesAfterFields = ['priority', 'start', 'after_this'];
</script>

<div class="tasks-options-modal">
    <div class="tasks-options-modal-checkboxes">
        {#each fieldNames as fieldName}
            <label>
                <input type="checkbox" checked={options[fieldName]} id={fieldName} on:change={onChange(fieldName)} />
                <span>{formatFieldName(fieldName)}</span>
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
