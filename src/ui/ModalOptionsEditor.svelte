<script lang="ts">
    import { type EditModalShowSettings, getSettings, updateSettings } from '../Config/Settings';

    export let onSave: (options: EditModalShowSettings) => void;
    export let onClose: () => void;

    const { isShownInEditModal } = getSettings();

    // Create a reactive object for the options
    // Forced to use any here instead of EditModalShowSettings. Otherwise there is a compiler error at
    // <input type="checkbox" checked={options[fieldName]} /> below. This is solved in Svelte 5.
    let options: any = { ...isShownInEditModal };

    const onChange = (fieldName: string) => (event: Event) => {
        options[fieldName] = (event.target as HTMLInputElement).checked;
    };

    const _onSave = () => {
        updateSettings({ isShownInEditModal: options });
        onSave(options);
    };

    const _onCancel = () => {
        onClose();
    };

    // Helper to format field names for display
    const formatFieldName = (fieldName: string): string => {
        return fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
    };
</script>

<div class="options-modal">
    <div class="checkbox-group">
        {#each Object.keys(options) as fieldName}
            <label class="checkbox-item">
                <input type="checkbox" checked={options[fieldName]} id={fieldName} on:change={onChange(fieldName)} />
                <span>{formatFieldName(fieldName)}</span>
            </label>
        {/each}
    </div>

    <div class="modal-footer">
        <button type="button" class="mod-cta" on:click={_onSave}>Apply</button>
        <button type="button" on:click={_onCancel}>Cancel</button>
    </div>
</div>
