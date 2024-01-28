/**
 * VaultArchiveFile and VaultLogListHeading are
 * set in the {@link SettingsTab} and associated services.
 *
 * To use these classes, get the single global instance of each by calling either
 *    {@link VaultArchiveFile.getInstance()}, or
 *    {@link VaultLogListHeading.getInstance()}
 *
 * @export
 * @class VaultArchiveFile
 * @class VaultLogListHeading
 */
export class VaultArchiveFile {
    private static instance: VaultArchiveFile;

    static empty = '';
    private _vaultArchiveFile = '';

    /**
     * Provides access to the single global instance of the VaultArchiveFile.
     * This should be used in the plugin code.
     */
    public static getInstance(): VaultArchiveFile {
        if (!VaultArchiveFile.instance) {
            VaultArchiveFile.instance = new VaultArchiveFile();
        }
        return VaultArchiveFile.instance;
    }

    public get() {
        return this._vaultArchiveFile;
    }
    public set(source: string) {
        this._vaultArchiveFile = source;
    }
}

export class VaultLogListHeading {
    private static instance: VaultLogListHeading;

    static empty = '';
    private _vaultLogListHeading = '';

    /**
     * Provides access to the single global instance of the VaultLogListHeading.
     * This should be used in the plugin code.
     */
    public static getInstance(): VaultLogListHeading {
        if (!VaultLogListHeading.instance) {
            VaultLogListHeading.instance = new VaultLogListHeading();
        }
        return VaultLogListHeading.instance;
    }

    public get() {
        return this._vaultLogListHeading;
    }
    public set(source: string) {
        this._vaultLogListHeading = source;
    }
}
