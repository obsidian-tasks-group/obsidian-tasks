<script lang="ts">
    import { getSettings } from '../Config/Settings';

    export let onSave: (options: { [key: string]: boolean }) => void;
    export let onClose: () => void;

    const { isShownInEditModal } = getSettings();

    // Create a reactive object for the options
    let options: { [key: string]: boolean } = {};

    // Initialize options from settings
    $: {
        options = {};
        for (const [field, value] of Object.entries(isShownInEditModal)) {
            options[field] = value;
        }
    }

    const _onSave = () => {
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
                <input type="checkbox" bind:checked={options[fieldName]} />
                <span>{formatFieldName(fieldName)}</span>
            </label>
        {/each}
    </div>

    <div class="modal-footer">
        <button type="button" class="mod-cta" on:click={_onSave}>Apply</button>
        <button type="button" on:click={_onCancel}>Cancel</button>
    </div>
</div>
