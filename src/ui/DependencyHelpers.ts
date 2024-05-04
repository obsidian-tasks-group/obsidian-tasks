import { type FuzzyMatch, prepareSimpleSearch } from 'obsidian';
import type { Task } from '../Task/Task';
import { GlobalFilter } from '../Config/GlobalFilter';

const MAX_SEARCH_RESULTS = 20;

/**
 * Return the text to use for searching and displaying tasks, for the dependency fields.
 *
 * The global filter is removed, but sub-tags of the global filter are
 * not removed.
 * @param task
 */
export function descriptionAdjustedForDependencySearch(task: Task) {
    return GlobalFilter.getInstance().removeAsWordFrom(task.description);
}

function searchDescriptionWithoutTags(query: string, allTasks: Task[]): Task[] {
    if (query === '') {
        return allTasks;
    }

    const preparedSearch = prepareSimpleSearch(query);

    // The cutoff was chosen empirically, to filter out very poor matches:
    const minimumScoreCutoff = -4.0;

    const matches: FuzzyMatch<Task>[] = allTasks
        .map((task) => {
            const result = preparedSearch(descriptionAdjustedForDependencySearch(task));
            if (result && result.score > minimumScoreCutoff) {
                return {
                    item: task,
                    match: result,
                };
            }
            return null;
        })
        .filter(Boolean) as FuzzyMatch<Task>[];

    // All scores are negative. Closer to zero is better.
    const sortedMatches = matches.sort((a, b) => b.match.score - a.match.score);

    // Retain commented-out logging until confident in the minimumScoreCutoff value.
    // console.log('>>>>>>>>>> start of matches');
    // sortedMatches.forEach((match) => {
    //     console.log(`${JSON.stringify(match.match)}: ${descriptionAdjustedForDependencySearch(match.item)}`);
    // });
    // console.log('<<<<<<<<<< end of matches');

    return sortedMatches.map((item) => item.item);
}

export function searchForCandidateTasksForDependency(
    search: string,
    allTasks: Task[],
    task?: Task,
    blockedBy?: Task[],
    blocking?: Task[],
) {
    let results = searchDescriptionWithoutTags(search, allTasks);

    results = results.filter((item) => {
        // Do not offer to depend on DONE, CANCELLED or NON_TASK tasks:
        if (item.isDone) {
            return false;
        }

        // Do not show any tasks that look like templates:
        if (item.description.includes('<%') && item.description.includes('%>')) {
            return false;
        }

        // remove itself from results
        // Known issue - filters out duplicate lines in task file
        const sameTask =
            item.description === task?.description &&
            item.taskLocation.path === task?.taskLocation.path &&
            item.originalMarkdown === task?.originalMarkdown;
        if (sameTask) {
            return false;
        }

        //remove tasks this task already has a relationship with from results
        if (blockedBy?.includes(item) || blocking?.includes(item)) {
            return false;
        }

        return true;
    });

    // if a task is provided, show close Relations higher
    if (task) {
        // search results favour tasks from the same file as this task
        results.sort((a, b) => {
            const aInSamePath = a.taskLocation.path === task.taskLocation.path;
            const bInSamePath = b.taskLocation.path === task.taskLocation.path;

            // prioritise tasks close to this task in the same file
            if (aInSamePath && bInSamePath) {
                return (
                    Math.abs(a.taskLocation.lineNumber - task.taskLocation.lineNumber) -
                    Math.abs(b.taskLocation.lineNumber - task.taskLocation.lineNumber)
                );
            } else if (aInSamePath) {
                return -1;
            } else if (bInSamePath) {
                return 1;
            } else {
                return 0;
            }
        });
    }

    return results.slice(0, MAX_SEARCH_RESULTS);
}
