<script lang="ts">
    import { TASK_FORMATS } from '../Config/Settings';
    import { Priority } from '../Task/Priority';
    import { icon, iconForPriority, useIconsForDisplay } from './Icons';

    export let priority: string;
    export let withAccessKeys: boolean;

    $: accesskey = (key: string) => (withAccessKeys ? key : null);

    const { prioritySymbols } = TASK_FORMATS.tasksPluginEmoji.taskSerializer.symbols;

    const priorityOptions: {
        value: typeof priority;
        label: string;
        symbol: string;
        icon: string | null;
        accessKey: string;
        accessKeyIndex: number;
    }[] = [
        {
            value: 'highest',
            label: 'Highest',
            symbol: prioritySymbols.Highest,
            icon: iconForPriority(Priority.Highest),
            accessKey: 'i',
            accessKeyIndex: 1,
        },
        {
            value: 'high',
            label: 'High',
            symbol: prioritySymbols.High,
            icon: iconForPriority(Priority.High),
            accessKey: 'h',
            accessKeyIndex: 0,
        },
        {
            value: 'medium',
            label: 'Medium',
            symbol: prioritySymbols.Medium,
            icon: iconForPriority(Priority.Medium),
            accessKey: 'm',
            accessKeyIndex: 0,
        },
        {
            value: 'none',
            label: 'Normal',
            symbol: prioritySymbols.None,
            icon: null,
            accessKey: 'n',
            accessKeyIndex: 0,
        },
        {
            value: 'low',
            label: 'Low',
            symbol: prioritySymbols.Low,
            icon: iconForPriority(Priority.Low),
            accessKey: 'l',
            accessKeyIndex: 0,
        },
        {
            value: 'lowest',
            label: 'Lowest',
            symbol: prioritySymbols.Lowest,
            icon: iconForPriority(Priority.Lowest),
            accessKey: 'o',
            accessKeyIndex: 1,
        },
    ];

    const useIcons = useIconsForDisplay();
</script>

<label for="priority-{priority}" id="priority">Priority</label>
{#each priorityOptions as { value, label, symbol, icon: priorityIcon, accessKey, accessKeyIndex }}
    <div class="task-modal-priority-option-container">
        <!-- svelte-ignore a11y-accesskey -->
        <input type="radio" id="priority-{value}" {value} bind:group={priority} accesskey={accesskey(accessKey)} />
        <label for="priority-{value}">
            <!-- One span for the text, so that the label's gap only separates the text from the icon -->
            <span class="tasks-priority-label"
                >{#if withAccessKeys}<span>{label.substring(0, accessKeyIndex)}</span><span class="accesskey"
                        >{label.substring(accessKeyIndex, accessKeyIndex + 1)}</span
                    ><span>{label.substring(accessKeyIndex + 1)}</span>{:else}{label}{/if}</span
            >
            {#if useIcons}
                {#if priorityIcon}
                    <span use:icon={{ id: priorityIcon, label: '' }} />
                {/if}
            {:else if symbol && symbol.charCodeAt(0) >= 0x100}
                <span class="tasks-priority-emoji">{symbol}</span>
            {/if}
        </label>
    </div>
{/each}
