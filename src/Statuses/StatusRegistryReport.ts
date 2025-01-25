import type { StatusSettings } from '../Config/StatusSettings';
import { i18n } from '../i18n/i18n';
import type { StatusRegistry } from './StatusRegistry';
import { tabulateStatusSettings } from './StatusSettingsReport';

export function createStatusRegistryReport(
    statusSettings: StatusSettings,
    statusRegistry: StatusRegistry,
    buttonName: string,
    versionString: string,
) {
    // Ideas for further improvement
    // - Actually make it an informative report, that shows any issues in settings with duplicate symbols.
    // - Show any 'next status symbols' that are not known to the plugin.
    // - Show any status transitions that won't work with recurring tasks currently, as DONE not followed by TODO.

    const detailed = true;
    const settingsTable = tabulateStatusSettings(statusSettings);
    const mermaidText = statusRegistry.mermaidDiagram(detailed);
    return `# ${buttonName}

## ${i18n.t('reports.statusRegistry.about.title')}

${i18n.t('reports.statusRegistry.about.createdBy', { version: versionString })}

${i18n.t('reports.statusRegistry.about.updateReport.line1')}

- ${i18n.t('reports.statusRegistry.about.updateReport.line2')}
- ${i18n.t('reports.statusRegistry.about.updateReport.line3')}

${i18n.t('reports.statusRegistry.about.deleteFileAnyTime')}

## ${i18n.t('reports.statusRegistry.statusSettings.title')}

<!--
${i18n.t('reports.statusRegistry.statusSettings.comment.line1')}
${i18n.t('reports.statusRegistry.statusSettings.comment.line2')}
${i18n.t('reports.statusRegistry.statusSettings.comment.line3')}
-->

${i18n.t('reports.statusRegistry.statusSettings.theseAreStatusValues')}

${settingsTable}
## ${i18n.t('reports.statusRegistry.loadedSettings.title')}

<!-- ${i18n.t('reports.statusRegistry.loadedSettings.switchToLivePreview')} -->

${i18n.t('reports.statusRegistry.loadedSettings.settingsActuallyUsed')}
${mermaidText}`;
}
