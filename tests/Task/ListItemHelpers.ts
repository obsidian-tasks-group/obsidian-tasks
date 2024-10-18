import { ListItem } from '../../src/Task/ListItem';

export function createChildListItem(originalMarkdown: string, parent: ListItem) {
    // This exists purely to silence WebStorm about typescript:S1848
    // See https://sonarcloud.io/organizations/obsidian-tasks-group/rules?open=typescript%3AS1848&rule_key=typescript%3AS1848
    new ListItem(originalMarkdown, parent);
}
