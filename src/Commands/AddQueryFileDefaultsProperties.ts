import { type App, Notice, type TFile } from 'obsidian';
import { QueryFileDefaults } from '../Query/QueryFileDefaults';

export async function ensureQueryFileDefaultsInFrontmatter(app: App, file: TFile) {
    await app.fileManager.processFrontMatter(file, (frontmatter) => {
        const requiredKeys = new QueryFileDefaults().allPropertyNamesSorted();
        let updated = false;
        requiredKeys.forEach((key) => {
            if (!(key in frontmatter)) {
                frontmatter[key] = null;
                updated = true;
            }
        });

        if (!updated) {
            new Notice('All supported properties are already present.');
        } else {
            new Notice('Properties updated successfully.');
        }
    });
}
