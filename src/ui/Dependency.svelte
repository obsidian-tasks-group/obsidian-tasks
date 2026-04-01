<script lang="ts">
    import { computePosition, flip, offset, shift, size } from '@floating-ui/dom';
    import type { Task } from '../Task/Task';
    import type { EditableTaskData } from './EditableTask';
    import { descriptionAdjustedForDependencySearch, searchForCandidateTasksForDependency } from './DependencyHelpers';
    import { labelContentWithAccessKey } from './EditTaskHelpers';

    interface Props {
        task: Task;
        editableTask: EditableTaskData;
        allTasks: Task[];
        _onDescriptionKeyDown: (e: KeyboardEvent) => void;
        id: string;
        type: 'blocking' | 'blockedBy';
        labelText: string;
        accesskey: string | null;
        placeholder?: string;
    }

    let {
        task,
        editableTask = $bindable(),
        allTasks,
        _onDescriptionKeyDown,
        id,
        type,
        labelText,
        accesskey,
        placeholder = 'Type to search...',
    }: Props = $props();

    let search = $state('');
    let searchIndex = $state<number | null>(0);
    let inputWidth = $state(0);
    let inputFocused = $state(false);
    let showDropdown = $state(false);

    let input = $state<HTMLElement | undefined>(undefined);
    let dropdown = $state<HTMLElement | undefined>(undefined);

    function addTask(task: Task) {
        editableTask[type] = [...editableTask[type], task];
        search = '';
        inputFocused = false;
    }

    function removeTask(task: Task) {
        editableTask[type] = editableTask[type].filter((item) => item !== task);
    }

    function taskKeydown(e: KeyboardEvent) {
        if (searchResults === null) return;

        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                if (!!searchIndex && searchIndex > 0) {
                    searchIndex -= 1;
                } else {
                    searchIndex = searchResults.length - 1;
                }
                break;
            case 'ArrowDown':
                e.preventDefault();
                if (!!searchIndex && searchIndex < searchResults.length - 1) {
                    searchIndex += 1;
                } else {
                    searchIndex = 0;
                }
                break;
            case 'Enter':
                if (e.isComposing) return;

                if (searchIndex !== null) {
                    e.preventDefault();
                    addTask(searchResults[searchIndex]);
                    searchIndex = null;
                    inputFocused = false;
                } else {
                    _onDescriptionKeyDown(e);
                }
                break;
            default:
                searchIndex = 0;
                break;
        }
        searchIndex && dropdown?.getElementsByTagName('li')[searchIndex]?.scrollIntoView({ block: 'nearest' });
    }

    function generateSearchResults(search: string, shouldShowDropdown: boolean) {
        if (!search && !shouldShowDropdown) return [];

        showDropdown = false;
        return searchForCandidateTasksForDependency(
            search,
            allTasks,
            task,
            editableTask.blockedBy,
            editableTask.blocking,
        );
    }

    function onFocused() {
        inputFocused = true;
        showDropdown = true;
    }

    function positionDropdown(input: HTMLElement, dropdown: HTMLElement, width: number) {
        if (!input || !dropdown) return;

        computePosition(input, dropdown, {
            middleware: [
                offset(6),
                shift(),
                flip(),
                size({
                    apply() {
                        Object.assign(dropdown.style, { width: `${width}px` });
                    },
                }),
            ],
        }).then(({ x, y }) => {
            dropdown.style.left = `${x}px`;
            dropdown.style.top = `${y}px`;
        });
    }

    function displayPath(path: string) {
        return path === task.taskLocation.path ? '' : path;
    }

    function descriptionTooltipText(task: Task) {
        return descriptionAdjustedForDependencySearch(task);
    }

    function showDescriptionTooltip(element: HTMLElement, text: string) {
        const tooltip = element.createDiv();
        tooltip.addClasses(['tooltip', 'pop-up']);
        tooltip.innerText = text;

        computePosition(element, tooltip, {
            placement: 'top',
            middleware: [offset(-18), shift()],
        }).then(({ x, y }) => {
            tooltip.style.left = `${x}px`;
            tooltip.style.top = `${y}px`;
        });

        element.addEventListener('mouseleave', () => tooltip.remove());
    }

    let searchResults = $derived(inputFocused ? generateSearchResults(search, showDropdown) : null);

    $effect(() => {
        if (input) {
            inputWidth = input.getBoundingClientRect().width;
        }

        const width = inputWidth;
        if (input && dropdown) {
            positionDropdown(input, dropdown, width);
        }
    });
</script>

<label for={id}>{@html labelContentWithAccessKey(labelText, accesskey)}</label>
<!-- svelte-ignore a11y-accesskey -->
<input
    bind:this={input}
    bind:value={search}
    on:keydown={(e) => taskKeydown(e)}
    on:focus={onFocused}
    on:blur={() => (inputFocused = false)}
    {accesskey}
    {id}
    class="tasks-modal-dependency-input"
    type="text"
    {placeholder}
/>
{#if searchResults && searchResults.length !== 0}
    <ul class="task-dependency-dropdown" bind:this={dropdown} on:mouseleave={() => (searchIndex = null)}>
        {#each searchResults as searchTask, index}
            {@const filepath = displayPath(searchTask.taskLocation.path)}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <li
                on:mousedown={() => addTask(searchTask)}
                class:selected={search !== null && index === searchIndex}
                on:mouseenter={() => (searchIndex = index)}
            >
                <div
                    class={filepath ? 'dependency-name-shared' : 'dependency-name'}
                    on:mouseenter={(e) => showDescriptionTooltip(e.currentTarget, descriptionTooltipText(searchTask))}
                >
                    [{searchTask.status.symbol}] {descriptionAdjustedForDependencySearch(searchTask)}
                </div>
                {#if filepath}
                    <div
                        class="dependency-path"
                        on:mouseenter={(e) => showDescriptionTooltip(e.currentTarget, filepath)}
                    >
                        {filepath}
                    </div>
                {/if}
            </li>
        {/each}
    </ul>
{/if}
{#if editableTask[type].length !== 0}
    <div class="task-dependencies-container results-dependency">
        {#each editableTask[type] as task}
            <div
                class="task-dependency"
                on:mouseenter={(e) => showDescriptionTooltip(e.currentTarget, descriptionTooltipText(task))}
            >
                <span class="task-dependency-name"
                    >[{task.status.symbol}] {descriptionAdjustedForDependencySearch(task)}</span
                >

                <button on:click={() => removeTask(task)} type="button" class="task-dependency-delete">
                    <svg
                        style="display: block; margin: auto;"
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="4"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="lucide lucide-x"
                    >
                        <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                    </svg>
                </button>
            </div>
        {/each}
    </div>
{/if}
