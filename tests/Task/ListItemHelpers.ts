import { ListItem } from '../../src/Task/ListItem';
import type { TaskLocation } from '../../src/Task/TaskLocation';

export function createChildListItem(originalMarkdown: string, parent: ListItem, _taskLocation: TaskLocation | null) {
    // This exists purely to silence WebStorm about typescript:S1848
    // See https://sonarcloud.io/organizations/obsidian-tasks-group/rules?open=typescript%3AS1848&rule_key=typescript%3AS1848
    // ListItem will incorrectly have line number from its parent
    new ListItem(originalMarkdown, parent, parent.taskLocation);
}
