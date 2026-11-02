import type { TFile, Vault } from 'obsidian';
import { createTFile } from '../__mocks__/obsidian';

/**
 * Holds files and folders in memory, behind the Vault methods that Tasks calls to write files.
 * Like Obsidian, it creates a folder's missing parents, and refuses to create a file in a missing folder.
 */
export class FakeVault {
    public readonly files = new Map<string, string>();
    public readonly folders = new Set<string>();
    public processError: Error | null = null;

    public getFileByPath(path: string): TFile | null {
        return this.files.has(path) ? createTFile(path) : null;
    }

    public getFolderByPath(path: string) {
        return this.folders.has(path) ? { path } : null;
    }

    public async createFolder(path: string) {
        const names = path.split('/');
        names.forEach((_name, index) => this.folders.add(names.slice(0, index + 1).join('/')));
    }

    public async create(path: string, data: string) {
        this.checkParentFolderExists(path);
        this.files.set(path, data);
        return createTFile(path);
    }

    public async read(file: TFile) {
        return this.files.get(file.path) ?? '';
    }

    public async modify(file: TFile, data: string) {
        this.files.set(file.path, data);
    }

    public async process(file: TFile, fn: (data: string) => string) {
        if (this.processError) {
            throw this.processError;
        }
        const data = fn(this.files.get(file.path) ?? '');
        this.files.set(file.path, data);
        return data;
    }

    public asVault() {
        return this as unknown as Vault;
    }

    private checkParentFolderExists(path: string) {
        const parent = path.split('/').slice(0, -1).join('/');
        if (parent !== '' && !this.folders.has(parent)) {
            throw new Error(`No folder ${parent}`);
        }
    }
}
