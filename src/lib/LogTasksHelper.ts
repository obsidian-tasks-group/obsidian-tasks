import type { Task } from '../Task';
import type { Logger } from './logging';

export function logStartOfTaskEdit(logger: Logger, codeLocation: string, originalTask: Task) {
    logger.debug(`${codeLocation} entered. ${originalTask.path}`);
    logger.debug(`replaceTaskWithTasks() original: ${originalTask.originalMarkdown}`);
}

export function logEndOfTaskEdit(logger: Logger, codeLocation: string, newTasks: Task[]) {
    newTasks.map((task: Task, index: number) =>
        logger.debug(`${codeLocation} ==> ${index + 1}   : ${task.toFileLineString()}`),
    );
}
