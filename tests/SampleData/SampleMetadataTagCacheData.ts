import type { TagCache } from 'obsidian';

export function getSampleMetadataTagCacheData(): TagCache[] {
    // This JSON block created by doing this, manually, in the Obsidian console:
    //  let tfile = app.vault.getAbstractFileByPath('Manual Testing/Testing Tag Recognition.md');
    //  let cache = app.metadataCache.getFileCache(tfile);
    // Then console.log(cache.tags);
    // Later, I reduced the volume of test data.
    const jsonString = `
        [
    {
        "tag": "#FFF23456",
        "position": {
            "start": {
                "line": 45,
                "col": 64,
                "offset": 2339
            },
            "end": {
                "line": 45,
                "col": 73,
                "offset": 2348
            }
        }
    },
    {
        "tag": "#letters-followed-by-dollar",
        "position": {
            "start": {
                "line": 48,
                "col": 33,
                "offset": 2490
            },
            "end": {
                "line": 48,
                "col": 60,
                "offset": 2517
            }
        }
    },
    {
        "tag": "#task",
        "position": {
            "start": {
                "line": 74,
                "col": 8,
                "offset": 3867
            },
            "end": {
                "line": 74,
                "col": 13,
                "offset": 3872
            }
        }
    },
    {
        "tag": "#withSymbol",
        "position": {
            "start": {
                "line": 74,
                "col": 33,
                "offset": 3892
            },
            "end": {
                "line": 74,
                "col": 44,
                "offset": 3903
            }
        }
    }
]`;

    return JSON.parse(jsonString);
}
