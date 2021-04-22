import { Plugin } from 'obsidian';

import { Cache } from './Cache';
import { Commands } from './Commands';
import { File } from './File';
import { InlineRenderer } from './InlineRenderer';
import { QueryRenderer } from './QueryRenderer';

export default class TasksPlugin extends Plugin {
    private cache: Cache | undefined;

    async onload() {
        console.log('loading plugin "test"');

        File.initialize({
            metadataCache: this.app.metadataCache,
            vault: this.app.vault,
        });
        this.cache = new Cache({
            metadataCache: this.app.metadataCache,
            vault: this.app.vault,
        });
        new InlineRenderer({ plugin: this });
        new QueryRenderer({ plugin: this, cache: this.cache });
        new Commands({ plugin: this });
    }

    onunload() {
        console.log('unloading plugin "test"');
        this.cache?.unload();
    }
}
