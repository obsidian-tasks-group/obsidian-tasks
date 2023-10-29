import type { StatusRegistry } from './StatusRegistry';

export function createStatusRegistryReport(statusRegistry: StatusRegistry, buttonName: string, versionString: string) {
    // Ideas for further improvement
    // - Actually make it an informative report, that shows any issues in settings with duplicate symbols.
    // - Show any 'next status symbols' that are not known to the plugin.
    // - Show any status transitions that won't work with recurring tasks currently, as DONE not followed by TODO.

    const detailed = true;
    const mermaidText = statusRegistry.mermaidDiagram(detailed);
    return `# ${buttonName}

This file was created by the Obsidian Tasks plugin (version ${versionString}) to help visualise the task statuses in this vault.

You can delete this file any time.

<!-- Switch to Live Preview or Reading Mode to see the diagram. -->
${mermaidText}`;
}
