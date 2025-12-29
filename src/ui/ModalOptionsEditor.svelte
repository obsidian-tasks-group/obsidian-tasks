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
