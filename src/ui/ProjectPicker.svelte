<script lang="ts">
    import { computePosition, flip, offset, shift, size } from '@floating-ui/dom';
    import type { TickTickProject } from '../Config/Settings';
    import type { EditableTask } from './EditableTask';
    import { searchProject } from './ProjectPickerHelpers';

    export let editableTask: EditableTask;
    export let _onDescriptionKeyDown: (e: KeyboardEvent) => void;
    export let placeholder: string = 'Type to search...';
    export let projects: TickTickProject[];
    export let search: string = '';

    let searchResults: TickTickProject[] | null = null;
    let searchIndex: number | null = 0;
    let inputWidth: number;
    let inputFocused = false;
    let showDropdown = false;

    let input: HTMLElement;
    let dropdown: HTMLElement;
    const workProject = { id: '67f9c5dd8f08d8402fd1b88f', name: '💼Work' };

    function selectProject(project: TickTickProject) {
        editableTask['tickTickProjectid'] = project.id;
        search = project.name;
        inputFocused = false;
    }

    if (search === '') {
        selectProject(workProject);
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
                    selectProject(searchResults[searchIndex]);
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

    function generateSearchResults(search: string) {
        if (!search && !showDropdown) return [];

        showDropdown = false;
        return searchProject(search, projects);
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

    $: {
        positionDropdown(input, dropdown);
    }

    $: {
        searchResults = inputFocused ? generateSearchResults(search) : null;
    }
</script>

<label for={'project'}>Project</label>
<!-- svelte-ignore a11y-accesskey -->
<span bind:clientWidth={inputWidth}>
    <input
        bind:this={input}
        bind:value={search}
        on:keydown={(e) => taskKeydown(e)}
        on:focus={onFocused}
        on:blur={() => (inputFocused = false)}
        id={'project'}
        class="tasks-modal-dependency-input"
        type="text"
        {placeholder}
    />
</span>
{#if searchResults && searchResults.length !== 0}
    <ul class="task-dependency-dropdown" bind:this={dropdown} on:mouseleave={() => (searchIndex = null)}>
        {#each searchResults as foundProject, index}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <li
                on:mousedown={() => selectProject(foundProject)}
                class:selected={search !== null && index === searchIndex}
                on:mouseenter={() => (searchIndex = index)}
            >
                <div class={'dependency-name'}>
                    {foundProject.name}
                </div>
            </li>
        {/each}
    </ul>
{/if}
