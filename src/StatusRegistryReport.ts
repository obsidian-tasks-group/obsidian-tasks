import type { StatusRegistry } from './StatusRegistry';

export function createStatusRegistryReport(statusRegistry: StatusRegistry, buttonName: string, versionString: string) {
    const detailed = true;
    const mermaidText = statusRegistry.mermaidDiagram(detailed);
    return `# ${buttonName}

This file was created by the Obsidian Tasks plugin (version ${versionString}) to help visualise the task statuses in this vault.

You can delete this file any time.

<!-- Switch to Live Preview or Reading Mode to see the diagram. -->
${mermaidText}`;
}
