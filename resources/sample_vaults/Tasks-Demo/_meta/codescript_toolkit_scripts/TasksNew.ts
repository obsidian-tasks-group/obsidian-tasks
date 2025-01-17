interface Task {
    description: string;
}

// https://github.com/mnaoumov/obsidian-better-markdown-links
// If you want to use the updated functions from your plugin, you can copy types.d.ts into your code.
// https://github.com/mnaoumov/obsidian-better-markdown-links/blob/main/types.d.ts

export function parentDescription(task: Task): string {
    return task.description.toUpperCase();
}
