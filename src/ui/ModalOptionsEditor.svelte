<script lang="ts">
    export let onSave: (options: { option1: boolean; option2: boolean; option3: boolean }) => void;
    export let onClose: () => void;

    let option1 = false;
    let option2 = false;
    let option3 = false;

    const _onSave = () => {
        onSave({ option1, option2, option3 });
    };

    const _onCancel = () => {
        onClose();
    };
</script>

<div class="options-modal">
    <div class="checkbox-group">
        <!-- Option 1 -->
        <label class="checkbox-item">
            <input type="checkbox" bind:checked={option1} />
            <span>Option 1</span>
        </label>

        <!-- Option 2 -->
        <label class="checkbox-item">
            <input type="checkbox" bind:checked={option2} />
            <span>Option 2</span>
        </label>

        <!-- Option 3 -->
        <label class="checkbox-item">
            <input type="checkbox" bind:checked={option3} />
            <span>Option 3</span>
        </label>
    </div>

    <div class="modal-footer">
        <button type="button" class="mod-cta" on:click={_onSave}>Apply</button>
        <button type="button" on:click={_onCancel}>Cancel</button>
    </div>
</div>

<style>
    .options-modal {
        padding: 0;
    }

    .checkbox-group {
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 20px;
    }

    .checkbox-item {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        padding: 8px;
        border-radius: 4px;
        transition: background-color 0.2s;
    }

    .checkbox-item:hover {
        background-color: var(--background-modifier-hover);
    }

    .checkbox-item input[type='checkbox'] {
        margin: 0;
    }

    .checkbox-item span {
        user-select: none;
    }

    .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        padding: 16px 20px;
        border-top: 1px solid var(--background-modifier-border);
    }

    .modal-footer button {
        padding: 6px 12px;
        border-radius: 4px;
        border: 1px solid var(--background-modifier-border);
        background: var(--interactive-normal);
        color: var(--text-normal);
        cursor: pointer;
    }

    .modal-footer button:hover {
        background: var(--interactive-hover);
    }

    .modal-footer button.mod-cta {
        background: var(--interactive-accent);
        color: var(--text-on-accent);
        border-color: var(--interactive-accent);
    }

    .modal-footer button.mod-cta:hover {
        background: var(--interactive-accent-hover);
    }
</style>
