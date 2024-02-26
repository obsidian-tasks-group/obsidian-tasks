import type { Task } from '../Task/Task';

const MAX_SEARCH_RESULTS = 20;

export function searchForCandidateTasksForDependency(
    search: string,
    allTasks: Task[],
    task: Task,
    blockedBy: Task[],
    blocking: Task[],
) {
    let results = allTasks.filter((task) => task.description.toLowerCase().includes(search.toLowerCase()));

    results = results.filter((item) => {
        // Do not show any tasks that look like templates:
        if (item.description.includes('<%') && item.description.includes('%>')) {
            return false;
        }

        // remove itself, and tasks this task already has a relationship with from results
        // line number is unavailable for the task being edited
        // Known issue - filters out duplicate lines in task file
        const sameFile =
            item.description === task.description &&
            item.taskLocation.path === task.taskLocation.path &&
            item.originalMarkdown === task.originalMarkdown;

        return ![...blockedBy, ...blocking].includes(item) && !sameFile;
    });

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

    return results.slice(0, MAX_SEARCH_RESULTS);
}
