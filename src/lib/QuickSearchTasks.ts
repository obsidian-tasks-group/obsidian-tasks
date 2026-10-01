/**
 * @fileoverview Non-UI parts of the Quick Search command implementation.
 * See also `src/ui/QuickSearchTasksModal.ts`.
 */

import { prepareFuzzySearch } from 'obsidian';
import { getSettings } from '../Config/Settings';
import type { Task } from '../Task/Task';
import { GlobalQuery } from '../Config/GlobalQuery';
import { SearchInfo } from '../Query/SearchInfo';
import type { Filter } from '../Query/Filter/Filter';
import { TasksFile } from '../Scripting/TasksFile';
import { DescriptionField } from '../Query/Filter/DescriptionField';
import { Sort } from '../Query/Sort/Sort';

interface TaskDescriptionMatch {
    score: number;
}

type TaskDescriptionMatcher = (description: string) => TaskDescriptionMatch | null;

/**
 * Finds and returns tasks that match a given description query.
 *
 * The actual search behaviour depends on the global values of these settings:
 * - Settings.quickSearch
 * - Settings.globalQuery
 * - Settings.presets
 *
 * @param {readonly Task[]} tasks - A list of tasks to be searched.
 * @param {string} query - The description query to search for within the tasks.
 * @return {Task[]} An array of tasks that match the given query, sorted accordingly.
 */
export function findTasksByDescription(tasks: readonly Task[], query: string): Task[] {
    if (query.trim() === '') {
        return [];
    }

    if (getSettings().quickSearch.fuzzyMatching) {
        return findTaskMatches(tasks, prepareFuzzySearch(query));
    } else {
        const normalizedQuery = query.toLowerCase();

        return findTaskMatches(tasks, (description) =>
            description.toLowerCase().includes(normalizedQuery) ? { score: 0 } : null,
        );
    }
}

// -----------------------------------------------------------------------
// Helper functions for filtering on the user's GlobalQuery setting.
// -----------------------------------------------------------------------

function getGlobalQueryFilters(): Filter[] {
    // The placeholder presents mechanism results in an exception being thrown
    // if we do not provide a location for the query source file,
    // and the Global Query contains placeholder presets as {{preset.simple}}:
    //     Invalid Global Query: The query looks like it contains a placeholder, with "{{" and "}}"
    //     but no file path has been supplied, so cannot expand placeholder values.
    //     The query is:
    //     {{preset.simple}}
    // So we create a fake location for the query source file:
    const dummyTasksFile = new TasksFile('Dummy Path for Quick Search command.md');

    const query = GlobalQuery.getInstance().query(dummyTasksFile);
    if (query.error !== undefined) {
        // Silently ignore invalid Global Query
        return [];
    }
    return query.filters;
}

function taskMatchesGlobalQuery(globalQueryFilters: Filter[], task: Task, searchInfo: SearchInfo): boolean {
    try {
        return globalQueryFilters.every((filter) => filter.filterFunction(task, searchInfo));
    } catch {
        // Silently ignore search-time errors from Global Query - just include the task in the search results
        return true;
    }
}

// -----------------------------------------------------------------------
// Helper functions for filtering on the query string.
// -----------------------------------------------------------------------

// -----------------------------------------------------------------------
// Helper functions for sorting the candidate tasks.
// -----------------------------------------------------------------------

function findTaskMatches(tasks: readonly Task[], matchDescription: TaskDescriptionMatcher): Task[] {
    // Many users will have defined a Global Query in their Tasks settings,
    // such as to tell Tasks to ignore tasks that are in their Template folder.
    // So we want Quick Search to only return tasks that match the filters in the Global Query.
    const globalQueryFilters = getGlobalQueryFilters();
    const searchInfo = SearchInfo.fromAllTasks([...tasks]);

    const matches = tasks
        .filter((task) => !task.isDone && taskMatchesGlobalQuery(globalQueryFilters, task, searchInfo))
        .map((task) => {
            const match = matchDescription(task.descriptionWithoutTags);
            return match === null ? null : { task, score: match.score };
        })
        .filter((match): match is { task: Task; score: number } => match !== null);

    const defaultOrder = new Map(
        sortTasksByDescription(
            matches.map((match) => match.task),
            searchInfo,
        ).map((task, index) => [task, index]),
    );

    return matches
        .sort((a, b) => b.score - a.score || defaultOrder.get(a.task)! - defaultOrder.get(b.task)!)
        .map((match) => match.task);
}

function sortTasksByDescription(results: Task[], searchInfo: SearchInfo): Task[] {
    // Sort the results by description, using same logic as the 'sort by description' instruction.
    const sorter = new DescriptionField().createNormalSorter();
    // And if the descriptions are identical, sort the tasks by the
    // default Tasks order used in Tasks queries.
    return Sort.by([sorter], results, searchInfo);
}
