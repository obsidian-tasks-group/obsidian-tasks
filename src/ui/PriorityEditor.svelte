<script lang="ts">
    import { TASK_FORMATS } from '../Config/Settings';

    export let priority: string;
    export let withAccessKeys: boolean;

    $: accesskey = (key: string) => (withAccessKeys ? key : null);

    const { prioritySymbols } = TASK_FORMATS.tasksPluginEmoji.taskSerializer.symbols;

    const priorityOptions: {
        value: typeof priority;
        label: string;
        symbol: string;
        accessKey: string;
        accessKeyIndex: number;
    }[] = [
        {
            value: 'lowest',
            label: 'Lowest',
            symbol: prioritySymbols.Lowest,
            accessKey: 'o',
            accessKeyIndex: 1,
        },
        {
            value: 'low',
            label: 'Low',
            symbol: prioritySymbols.Low,
            accessKey: 'l',
            accessKeyIndex: 0,
        },
        {
            value: 'none',
            label: 'Normal',
            symbol: prioritySymbols.None,
            accessKey: 'n',
            accessKeyIndex: 0,
        },
        {
            value: 'medium',
            label: 'Medium',
            symbol: prioritySymbols.Medium,
            accessKey: 'm',
            accessKeyIndex: 0,
        },
        {
            value: 'high',
            label: 'High',
            symbol: prioritySymbols.High,
            accessKey: 'h',
            accessKeyIndex: 0,
        },
        {
            value: 'highest',
            label: 'Highest',
            symbol: prioritySymbols.Highest,
            accessKey: 'i',
            accessKeyIndex: 1,
        },
    ];
</script>

<label for="priority-{priority}" id="priority">Priority</label>
{#each priorityOptions as { value, label, symbol, accessKey, accessKeyIndex }}
    <div class="task-modal-priority-option-container">
        <!-- svelte-ignore a11y-accesskey -->
        <input type="radio" id="priority-{value}" {value} bind:group={priority} accesskey={accesskey(accessKey)} />
        <label for="priority-{value}">
            {#if withAccessKeys}
                <span>{label.substring(0, accessKeyIndex)}</span><span class="accesskey"
                    >{label.substring(accessKeyIndex, accessKeyIndex + 1)}</span
                ><span>{label.substring(accessKeyIndex + 1)}</span>
            {:else}
                <span>{label}</span>
            {/if}
            {#if symbol && symbol.charCodeAt(0) >= 0x100}
                <span>{symbol}</span>
            {/if}
        </label>
    </div>
{/each}
