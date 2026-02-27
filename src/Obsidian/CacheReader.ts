import { App, type CachedMetadata, TFile } from 'obsidian';

export function globalGetFileCache(app: App, filePath: string) {
    const tFile = app.vault.getAbstractFileByPath(filePath);
    let fileCache: CachedMetadata | null = null;
    if (tFile && tFile instanceof TFile) {
        fileCache = app.metadataCache.getFileCache(tFile);
    }
    return fileCache;
}
