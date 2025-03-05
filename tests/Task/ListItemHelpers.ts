import { ListItem } from '../../src/Task/ListItem';
import { TaskLocation } from '../../src/Task/TaskLocation';

export function createChildListItem(originalMarkdown: string, parent: ListItem) {
    // This exists purely to silence WebStorm about typescript:S1848
    // See https://sonarcloud.io/organizations/obsidian-tasks-group/rules?open=typescript%3AS1848&rule_key=typescript%3AS1848
    const taskLocation = TaskLocation.fromUnknownPosition(parent.taskLocation.tasksFile);
    ListItem.fromListItemLine(originalMarkdown, parent, taskLocation);
}
