<script lang="ts">
    import type { Task } from "../Task/Task";
    import { computePosition, flip, offset, shift, size } from "@floating-ui/dom";
    import type { EditableTask } from "./EditableTask";

    export let task: Task;
    export let editableTask: EditableTask;
    export let allTasks: Task[];
    export let _onDescriptionKeyDown: (e: KeyboardEvent) => void;
    export let type: "blocking" | "blockedBy";
    export let accesskey: (key: string) => string | null;

    const MAX_SEARCH_RESULTS = 20;

    let search: string = '';
    let searchResults: Task[] | null = null;
    let searchIndex: number | null = 0;
    let inputWidth: number;
    let inputFocused = false;
    let showDropdown = false;

    let input: HTMLElement;
    let dropdown: HTMLElement;

    function addTask(task: Task) {
        editableTask[type] = [...editableTask[type], task];
        search = '';
        inputFocused = false;
    }

    function removeTask(task: Task) {
        editableTask[type] = editableTask[type].filter(item => item !== task);
    }

    function taskKeydown(e: KeyboardEvent) {
        if (searchResults === null) return;

        switch(e.key) {
            case "ArrowUp":
                e.preventDefault();
                if (!!searchIndex && searchIndex > 0) {
                    searchIndex -= 1;
                } else {
                    searchIndex = searchResults.length - 1;
                }
                break;
            case "ArrowDown":
                e.preventDefault();
                if (!!searchIndex && searchIndex < searchResults.length - 1) {
                    searchIndex += 1;
                } else {
                    searchIndex = 0;
                }
                break;
            case "Enter":
                if (searchIndex !== null) {
                    e.preventDefault();
                    addTask(searchResults[searchIndex]);
                    searchIndex = null;
                    inputFocused = false
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

    function generateSearchResults(search: string) {
        if (!search && !showDropdown) return [];

        showDropdown = false;

        let results = allTasks.filter(task => task.description.toLowerCase().includes(search.toLowerCase()));

        // remove itself, and tasks this task already has a relationship with from results
        results = results.filter((item) => {
            // line number is unavailable for the task being edited
            // Known issue - filters out duplicate lines in task file
            const sameFile = item.description === task.description &&
                item.taskLocation.path === task.taskLocation.path &&
                item.originalMarkdown === task.originalMarkdown

            return ![...editableTask.blockedBy, ...editableTask.blocking].includes(item) && !sameFile;
        });

        // search results favour tasks from the same file as this task
        results.sort((a, b) => {
            const aInSamePath = a.taskLocation.path === task.taskLocation.path;
            const bInSamePath = b.taskLocation.path === task.taskLocation.path;

            // prioritise tasks close to this task in the same file
            if (aInSamePath && bInSamePath) {
                return Math.abs(a.taskLocation.lineNumber - task.taskLocation.lineNumber)
                    - Math.abs(b.taskLocation.lineNumber - task.taskLocation.lineNumber);
            } else if (aInSamePath) {
                return -1;
            } else if (bInSamePath) {
                return 1;
            } else {
                return 0;
            }
        });

        return results.slice(0,MAX_SEARCH_RESULTS);
    }

    function onFocused() {
        inputFocused = true;
        showDropdown = true;
    }

    function positionDropdown(input: HTMLElement, dropdown: HTMLElement) {
        if (!input || !dropdown) return;

        computePosition(input, dropdown, {
            middleware: [
                offset(6),
                shift(),
                flip(),
                size({
                    apply() {
                        dropdown && Object.assign(dropdown.style, { width: `${inputWidth}px` });
                    },
                }),
            ],
        }).then(({ x, y }) => {
            dropdown.style.left = `${x}px`;
            dropdown.style.top = `${y}px`;
        });
    }

    function displayPath(path: string) {
        return path === task.taskLocation.path ? "" : path;
    }

    function showDescriptionTooltip(element: HTMLElement, text: string) {
        const tooltip = element.createDiv();
        tooltip.addClasses(['tooltip', 'pop-up']);
        tooltip.innerText = text;

        computePosition(element, tooltip, {
            placement: "top",
            middleware: [
                offset(-18),
                shift()
            ]
        }).then(({x, y}) => {
            tooltip.style.left = `${x}px`;
            tooltip.style.top = `${y}px`;
        });

        element.addEventListener('mouseleave', () => tooltip.remove());
    }

    $: {
        positionDropdown(input, dropdown);
    }

    $: {
        searchResults = inputFocused ? generateSearchResults(search) : null;
    }
</script>

<!-- svelte-ignore a11y-accesskey -->
<span class="input" bind:clientWidth={inputWidth}>
    <input
        bind:this={input}
        bind:value={search}
        on:keydown={(e) => taskKeydown(e)}
        on:focus={onFocused}
        on:blur={() => inputFocused = false}
        accesskey={accesskey("b")}
        id="{type}"
        class="input"
        type="text"
        placeholder="Type to search..."
    />
</span>
{#if searchResults && searchResults.length !== 0}
    <ul class="task-dependency-dropdown"
        bind:this={dropdown}
        on:mouseleave={() => searchIndex = null}>
        {#each searchResults as searchTask, index}
            {@const filepath = displayPath(searchTask.taskLocation.path)}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <li on:mousedown={() => addTask(searchTask)}
                class:selected={search !== null && index === searchIndex}
                on:mouseenter={() => searchIndex = index}>
                <div class="{filepath ? 'dependency-name-shared' : 'dependency-name'}"
                     on:mouseenter={(e) => showDescriptionTooltip(e.currentTarget, searchTask.descriptionWithoutTags)}>
                    [{searchTask.status.symbol}] {searchTask.descriptionWithoutTags}
                </div>
                {#if filepath}
                    <div class="dependency-path"
                         on:mouseenter={(e) => showDescriptionTooltip(e.currentTarget, filepath)}>
                        {filepath}
                    </div>
                {/if}
            </li>
        {/each}
    </ul>
{/if}
<div class="task-dependencies-container results">
    {#each editableTask[type] as task}
        <div class="task-dependency"
             on:mouseenter={(e) => showDescriptionTooltip(e.currentTarget, task.descriptionWithoutTags)}>
            <span class="task-dependency-name">[{task.status.symbol}] {task.descriptionWithoutTags}</span>

            <button on:click={() => removeTask(task)} type="button" class="task-dependency-delete">
                <svg style="display: block; margin: auto;" xmlns="http://www.w3.org/2000/svg" width="12"
                     viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"
                     stroke-linejoin="round" class="lucide lucide-x">
                    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                </svg>
            </button>
        </div>
    {/each}
</div>
