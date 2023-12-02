import type { Task } from '../Task';
import type { Logger } from './logging';

export function logStartOfTaskEdit(logger: Logger, codeLocation: string, originalTask: Task) {
    logger.debug(
        `${codeLocation}: task line number: ${originalTask.taskLocation.lineNumber}. file path: "${originalTask.path}"`,
    );
    logger.debug(`${codeLocation} original: ${originalTask.originalMarkdown}`);
}

export function logEndOfTaskEdit(logger: Logger, codeLocation: string, newTasks: Task[]) {
    newTasks.map((task: Task, index: number) =>
        logger.debug(`${codeLocation} ==> ${index + 1}   : ${task.toFileLineString()}`),
    );
}
