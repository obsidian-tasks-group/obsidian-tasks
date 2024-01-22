import type { Task } from '../Task/Task';
import type { Logger } from './logging';

/**
 * Debug logging helper, for the start of Task-editing (or file-editing) operations
 * @param logger
 * @param codeLocation - a string description, such as 'callingFunctionName()'.
 * @param originalTask
 */
export function logStartOfTaskEdit(logger: Logger, codeLocation: string, originalTask: Task) {
    logger.debug(
        `${codeLocation}: task line number: ${originalTask.taskLocation.lineNumber}. file path: "${originalTask.path}"`,
    );
    logger.debug(`${codeLocation} original: ${originalTask.originalMarkdown}`);
}

/**
 * Debug logging helper, for the completion of Task-editing (or file-editing) operations
 * @param logger
 * @param codeLocation - a string description, such as 'callingFunctionName()'.
 * @param newTasks
 */
export function logEndOfTaskEdit(logger: Logger, codeLocation: string, newTasks: Task[]) {
    newTasks.map((task: Task, index: number) => {
        // Alignment of task lines is intentionally consistent between logStartOfTaskEdit() and this:
        logger.debug(`${codeLocation} ==> ${index + 1}   : ${task.toFileLineString()}`);
    });
}
