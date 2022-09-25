import type { TagCache } from 'obsidian';
import { getAllTagsInFileSorted, getTagsOnLine, getUniqueTagsInFileSorted } from '../src/CacheHelpers';

describe('CacheHelpers', () => {
    it('works on file without tags', () => {
        expect(getTagsOnLine(undefined, 27)).toStrictEqual([]);
        expect(getAllTagsInFileSorted(undefined)).toStrictEqual([]);
    });

    it('works on file with tags', () => {
        // TODO Shorten this JSON block
        // Created by doing this, manually, in the Obsidian console:
        //  let tfile = app.vault.getAbstractFileByPath('Manual Testing/Testing Tag Recognition.md');
        //  let cache = app.metadataCache.getFileCache(tfile);
        // Then console.log(cache.tags);
        const jsonString = `
        [
    {
        "tag": "#y1984",
        "position": {
            "start": {
                "line": 15,
                "col": 118,
                "offset": 554
            },
            "end": {
                "line": 15,
                "col": 124,
                "offset": 560
            }
        }
    },
    {
        "tag": "#task",
        "position": {
            "start": {
                "line": 25,
                "col": 8,
                "offset": 810
            },
            "end": {
                "line": 25,
                "col": 13,
                "offset": 815
            }
        }
    },
    {
        "tag": "#task",
        "position": {
            "start": {
                "line": 26,
                "col": 8,
                "offset": 946
            },
            "end": {
                "line": 26,
                "col": 13,
                "offset": 951
            }
        }
    },
    {
        "tag": "#task",
        "position": {
            "start": {
                "line": 27,
                "col": 8,
                "offset": 1106
            },
            "end": {
                "line": 27,
                "col": 13,
                "offset": 1111
            }
        }
    },
    {
        "tag": "#task",
        "position": {
            "start": {
                "line": 28,
                "col": 8,
                "offset": 1311
            },
            "end": {
                "line": 28,
                "col": 13,
                "offset": 1316
            }
        }
    },
    {
        "tag": "#task",
        "position": {
            "start": {
                "line": 29,
                "col": 8,
                "offset": 1403
            },
            "end": {
                "line": 29,
                "col": 13,
                "offset": 1408
            }
        }
    },
    {
        "tag": "#task",
        "position": {
            "start": {
                "line": 30,
                "col": 8,
                "offset": 1502
            },
            "end": {
                "line": 30,
                "col": 13,
                "offset": 1507
            }
        }
    },
    {
        "tag": "#task",
        "position": {
            "start": {
                "line": 31,
                "col": 8,
                "offset": 1591
            },
            "end": {
                "line": 31,
                "col": 13,
                "offset": 1596
            }
        }
    },
    {
        "tag": "#task",
        "position": {
            "start": {
                "line": 32,
                "col": 8,
                "offset": 1660
            },
            "end": {
                "line": 32,
                "col": 13,
                "offset": 1665
            }
        }
    },
    {
        "tag": "#task",
        "position": {
            "start": {
                "line": 33,
                "col": 8,
                "offset": 1725
            },
            "end": {
                "line": 33,
                "col": 13,
                "offset": 1730
            }
        }
    },
    {
        "tag": "#task",
        "position": {
            "start": {
                "line": 34,
                "col": 8,
                "offset": 1787
            },
            "end": {
                "line": 34,
                "col": 13,
                "offset": 1792
            }
        }
    },
    {
        "tag": "#task",
        "position": {
            "start": {
                "line": 40,
                "col": 8,
                "offset": 1944
            },
            "end": {
                "line": 40,
                "col": 13,
                "offset": 1949
            }
        }
    },
    {
        "tag": "#ValidTag",
        "position": {
            "start": {
                "line": 40,
                "col": 33,
                "offset": 1969
            },
            "end": {
                "line": 40,
                "col": 42,
                "offset": 1978
            }
        }
    },
    {
        "tag": "#task",
        "position": {
            "start": {
                "line": 41,
                "col": 8,
                "offset": 2000
            },
            "end": {
                "line": 41,
                "col": 13,
                "offset": 2005
            }
        }
    },
    {
        "tag": "#y1984",
        "position": {
            "start": {
                "line": 41,
                "col": 33,
                "offset": 2025
            },
            "end": {
                "line": 41,
                "col": 39,
                "offset": 2031
            }
        }
    },
    {
        "tag": "#task",
        "position": {
            "start": {
                "line": 42,
                "col": 8,
                "offset": 2053
            },
            "end": {
                "line": 42,
                "col": 13,
                "offset": 2058
            }
        }
    },
    {
        "tag": "#1_2",
        "position": {
            "start": {
                "line": 42,
                "col": 33,
                "offset": 2078
            },
            "end": {
                "line": 42,
                "col": 37,
                "offset": 2082
            }
        }
    },
    {
        "tag": "#task",
        "position": {
            "start": {
                "line": 43,
                "col": 8,
                "offset": 2132
            },
            "end": {
                "line": 43,
                "col": 13,
                "offset": 2137
            }
        }
    },
    {
        "tag": "#1-2",
        "position": {
            "start": {
                "line": 43,
                "col": 33,
                "offset": 2157
            },
            "end": {
                "line": 43,
                "col": 37,
                "offset": 2161
            }
        }
    },
    {
        "tag": "#task",
        "position": {
            "start": {
                "line": 44,
                "col": 8,
                "offset": 2193
            },
            "end": {
                "line": 44,
                "col": 13,
                "offset": 2198
            }
        }
    },
    {
        "tag": "#y1984",
        "position": {
            "start": {
                "line": 44,
                "col": 43,
                "offset": 2228
            },
            "end": {
                "line": 44,
                "col": 49,
                "offset": 2234
            }
        }
    },
    {
        "tag": "#task",
        "position": {
            "start": {
                "line": 45,
                "col": 8,
                "offset": 2283
            },
            "end": {
                "line": 45,
                "col": 13,
                "offset": 2288
            }
        }
    },
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
        "tag": "#task",
        "position": {
            "start": {
                "line": 46,
                "col": 8,
                "offset": 2358
            },
            "end": {
                "line": 46,
                "col": 13,
                "offset": 2363
            }
        }
    },
    {
        "tag": "#FFF34567",
        "position": {
            "start": {
                "line": 46,
                "col": 33,
                "offset": 2383
            },
            "end": {
                "line": 46,
                "col": 42,
                "offset": 2392
            }
        }
    },
    {
        "tag": "#task",
        "position": {
            "start": {
                "line": 47,
                "col": 8,
                "offset": 2401
            },
            "end": {
                "line": 47,
                "col": 13,
                "offset": 2406
            }
        }
    },
    {
        "tag": "#letters-followed-by-asterisk",
        "position": {
            "start": {
                "line": 47,
                "col": 33,
                "offset": 2426
            },
            "end": {
                "line": 47,
                "col": 62,
                "offset": 2455
            }
        }
    },
    {
        "tag": "#task",
        "position": {
            "start": {
                "line": 48,
                "col": 8,
                "offset": 2465
            },
            "end": {
                "line": 48,
                "col": 13,
                "offset": 2470
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
                "line": 49,
                "col": 8,
                "offset": 2527
            },
            "end": {
                "line": 49,
                "col": 13,
                "offset": 2532
            }
        }
    },
    {
        "tag": "#HyperlinkedText",
        "position": {
            "start": {
                "line": 49,
                "col": 46,
                "offset": 2565
            },
            "end": {
                "line": 49,
                "col": 62,
                "offset": 2581
            }
        }
    },
    {
        "tag": "#task",
        "position": {
            "start": {
                "line": 50,
                "col": 8,
                "offset": 2702
            },
            "end": {
                "line": 50,
                "col": 13,
                "offset": 2707
            }
        }
    },
    {
        "tag": "#withEmptySub/",
        "position": {
            "start": {
                "line": 50,
                "col": 33,
                "offset": 2727
            },
            "end": {
                "line": 50,
                "col": 47,
                "offset": 2741
            }
        }
    },
    {
        "tag": "#task",
        "position": {
            "start": {
                "line": 51,
                "col": 8,
                "offset": 2750
            },
            "end": {
                "line": 51,
                "col": 13,
                "offset": 2755
            }
        }
    },
    {
        "tag": "#withEmptySub/£sub",
        "position": {
            "start": {
                "line": 51,
                "col": 33,
                "offset": 2775
            },
            "end": {
                "line": 51,
                "col": 51,
                "offset": 2793
            }
        }
    },
    {
        "tag": "#task",
        "position": {
            "start": {
                "line": 52,
                "col": 8,
                "offset": 2802
            },
            "end": {
                "line": 52,
                "col": 13,
                "offset": 2807
            }
        }
    },
    {
        "tag": "#withNonEmpty/Sub",
        "position": {
            "start": {
                "line": 52,
                "col": 33,
                "offset": 2827
            },
            "end": {
                "line": 52,
                "col": 50,
                "offset": 2844
            }
        }
    },
    {
        "tag": "#task",
        "position": {
            "start": {
                "line": 53,
                "col": 8,
                "offset": 2853
            },
            "end": {
                "line": 53,
                "col": 13,
                "offset": 2858
            }
        }
    },
    {
        "tag": "#withNonEmpty/Sub£",
        "position": {
            "start": {
                "line": 53,
                "col": 33,
                "offset": 2878
            },
            "end": {
                "line": 53,
                "col": 51,
                "offset": 2896
            }
        }
    },
    {
        "tag": "#task",
        "position": {
            "start": {
                "line": 54,
                "col": 8,
                "offset": 2905
            },
            "end": {
                "line": 54,
                "col": 13,
                "offset": 2910
            }
        }
    },
    {
        "tag": "#withSymbol",
        "position": {
            "start": {
                "line": 54,
                "col": 33,
                "offset": 2930
            },
            "end": {
                "line": 54,
                "col": 44,
                "offset": 2941
            }
        }
    },
    {
        "tag": "#task",
        "position": {
            "start": {
                "line": 55,
                "col": 8,
                "offset": 2951
            },
            "end": {
                "line": 55,
                "col": 13,
                "offset": 2956
            }
        }
    },
    {
        "tag": "#withSymbol",
        "position": {
            "start": {
                "line": 55,
                "col": 33,
                "offset": 2976
            },
            "end": {
                "line": 55,
                "col": 44,
                "offset": 2987
            }
        }
    },
    {
        "tag": "#task",
        "position": {
            "start": {
                "line": 56,
                "col": 8,
                "offset": 2997
            },
            "end": {
                "line": 56,
                "col": 13,
                "offset": 3002
            }
        }
    },
    {
        "tag": "#withSymbol™",
        "position": {
            "start": {
                "line": 56,
                "col": 54,
                "offset": 3043
            },
            "end": {
                "line": 56,
                "col": 66,
                "offset": 3055
            }
        }
    },
    {
        "tag": "#task",
        "position": {
            "start": {
                "line": 57,
                "col": 8,
                "offset": 3064
            },
            "end": {
                "line": 57,
                "col": 13,
                "offset": 3069
            }
        }
    },
    {
        "tag": "#withSymbol£",
        "position": {
            "start": {
                "line": 57,
                "col": 54,
                "offset": 3110
            },
            "end": {
                "line": 57,
                "col": 66,
                "offset": 3122
            }
        }
    },
    {
        "tag": "#task",
        "position": {
            "start": {
                "line": 58,
                "col": 8,
                "offset": 3131
            },
            "end": {
                "line": 58,
                "col": 13,
                "offset": 3136
            }
        }
    },
    {
        "tag": "#withSymbol",
        "position": {
            "start": {
                "line": 58,
                "col": 33,
                "offset": 3156
            },
            "end": {
                "line": 58,
                "col": 44,
                "offset": 3167
            }
        }
    },
    {
        "tag": "#task",
        "position": {
            "start": {
                "line": 59,
                "col": 8,
                "offset": 3177
            },
            "end": {
                "line": 59,
                "col": 13,
                "offset": 3182
            }
        }
    },
    {
        "tag": "#withSymbol",
        "position": {
            "start": {
                "line": 59,
                "col": 33,
                "offset": 3202
            },
            "end": {
                "line": 59,
                "col": 44,
                "offset": 3213
            }
        }
    },
    {
        "tag": "#task",
        "position": {
            "start": {
                "line": 60,
                "col": 8,
                "offset": 3223
            },
            "end": {
                "line": 60,
                "col": 13,
                "offset": 3228
            }
        }
    },
    {
        "tag": "#withSymbol",
        "position": {
            "start": {
                "line": 60,
                "col": 33,
                "offset": 3248
            },
            "end": {
                "line": 60,
                "col": 44,
                "offset": 3259
            }
        }
    },
    {
        "tag": "#task",
        "position": {
            "start": {
                "line": 61,
                "col": 8,
                "offset": 3269
            },
            "end": {
                "line": 61,
                "col": 13,
                "offset": 3274
            }
        }
    },
    {
        "tag": "#withSymbol",
        "position": {
            "start": {
                "line": 61,
                "col": 33,
                "offset": 3294
            },
            "end": {
                "line": 61,
                "col": 44,
                "offset": 3305
            }
        }
    },
    {
        "tag": "#task",
        "position": {
            "start": {
                "line": 62,
                "col": 8,
                "offset": 3315
            },
            "end": {
                "line": 62,
                "col": 13,
                "offset": 3320
            }
        }
    },
    {
        "tag": "#withSymbol",
        "position": {
            "start": {
                "line": 62,
                "col": 33,
                "offset": 3340
            },
            "end": {
                "line": 62,
                "col": 44,
                "offset": 3351
            }
        }
    },
    {
        "tag": "#task",
        "position": {
            "start": {
                "line": 63,
                "col": 8,
                "offset": 3361
            },
            "end": {
                "line": 63,
                "col": 13,
                "offset": 3366
            }
        }
    },
    {
        "tag": "#withSymbol",
        "position": {
            "start": {
                "line": 63,
                "col": 33,
                "offset": 3386
            },
            "end": {
                "line": 63,
                "col": 44,
                "offset": 3397
            }
        }
    },
    {
        "tag": "#task",
        "position": {
            "start": {
                "line": 64,
                "col": 8,
                "offset": 3407
            },
            "end": {
                "line": 64,
                "col": 13,
                "offset": 3412
            }
        }
    },
    {
        "tag": "#withSymbol",
        "position": {
            "start": {
                "line": 64,
                "col": 33,
                "offset": 3432
            },
            "end": {
                "line": 64,
                "col": 44,
                "offset": 3443
            }
        }
    },
    {
        "tag": "#task",
        "position": {
            "start": {
                "line": 65,
                "col": 8,
                "offset": 3453
            },
            "end": {
                "line": 65,
                "col": 13,
                "offset": 3458
            }
        }
    },
    {
        "tag": "#withSymbol",
        "position": {
            "start": {
                "line": 65,
                "col": 33,
                "offset": 3478
            },
            "end": {
                "line": 65,
                "col": 44,
                "offset": 3489
            }
        }
    },
    {
        "tag": "#task",
        "position": {
            "start": {
                "line": 66,
                "col": 8,
                "offset": 3499
            },
            "end": {
                "line": 66,
                "col": 13,
                "offset": 3504
            }
        }
    },
    {
        "tag": "#withSymbol",
        "position": {
            "start": {
                "line": 66,
                "col": 33,
                "offset": 3524
            },
            "end": {
                "line": 66,
                "col": 44,
                "offset": 3535
            }
        }
    },
    {
        "tag": "#task",
        "position": {
            "start": {
                "line": 67,
                "col": 8,
                "offset": 3545
            },
            "end": {
                "line": 67,
                "col": 13,
                "offset": 3550
            }
        }
    },
    {
        "tag": "#withSymbol",
        "position": {
            "start": {
                "line": 67,
                "col": 33,
                "offset": 3570
            },
            "end": {
                "line": 67,
                "col": 44,
                "offset": 3581
            }
        }
    },
    {
        "tag": "#task",
        "position": {
            "start": {
                "line": 68,
                "col": 8,
                "offset": 3591
            },
            "end": {
                "line": 68,
                "col": 13,
                "offset": 3596
            }
        }
    },
    {
        "tag": "#withSymbol",
        "position": {
            "start": {
                "line": 68,
                "col": 33,
                "offset": 3616
            },
            "end": {
                "line": 68,
                "col": 44,
                "offset": 3627
            }
        }
    },
    {
        "tag": "#task",
        "position": {
            "start": {
                "line": 69,
                "col": 8,
                "offset": 3637
            },
            "end": {
                "line": 69,
                "col": 13,
                "offset": 3642
            }
        }
    },
    {
        "tag": "#withSymbol",
        "position": {
            "start": {
                "line": 69,
                "col": 33,
                "offset": 3662
            },
            "end": {
                "line": 69,
                "col": 44,
                "offset": 3673
            }
        }
    },
    {
        "tag": "#task",
        "position": {
            "start": {
                "line": 70,
                "col": 8,
                "offset": 3683
            },
            "end": {
                "line": 70,
                "col": 13,
                "offset": 3688
            }
        }
    },
    {
        "tag": "#withSymbol",
        "position": {
            "start": {
                "line": 70,
                "col": 33,
                "offset": 3708
            },
            "end": {
                "line": 70,
                "col": 44,
                "offset": 3719
            }
        }
    },
    {
        "tag": "#task",
        "position": {
            "start": {
                "line": 71,
                "col": 8,
                "offset": 3729
            },
            "end": {
                "line": 71,
                "col": 13,
                "offset": 3734
            }
        }
    },
    {
        "tag": "#withSymbol",
        "position": {
            "start": {
                "line": 71,
                "col": 33,
                "offset": 3754
            },
            "end": {
                "line": 71,
                "col": 44,
                "offset": 3765
            }
        }
    },
    {
        "tag": "#task",
        "position": {
            "start": {
                "line": 72,
                "col": 8,
                "offset": 3775
            },
            "end": {
                "line": 72,
                "col": 13,
                "offset": 3780
            }
        }
    },
    {
        "tag": "#withSymbol",
        "position": {
            "start": {
                "line": 72,
                "col": 33,
                "offset": 3800
            },
            "end": {
                "line": 72,
                "col": 44,
                "offset": 3811
            }
        }
    },
    {
        "tag": "#task",
        "position": {
            "start": {
                "line": 73,
                "col": 8,
                "offset": 3821
            },
            "end": {
                "line": 73,
                "col": 13,
                "offset": 3826
            }
        }
    },
    {
        "tag": "#withSymbol",
        "position": {
            "start": {
                "line": 73,
                "col": 33,
                "offset": 3846
            },
            "end": {
                "line": 73,
                "col": 44,
                "offset": 3857
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
    },
    {
        "tag": "#task",
        "position": {
            "start": {
                "line": 75,
                "col": 8,
                "offset": 3913
            },
            "end": {
                "line": 75,
                "col": 13,
                "offset": 3918
            }
        }
    },
    {
        "tag": "#withSymbol",
        "position": {
            "start": {
                "line": 75,
                "col": 33,
                "offset": 3938
            },
            "end": {
                "line": 75,
                "col": 44,
                "offset": 3949
            }
        }
    },
    {
        "tag": "#task",
        "position": {
            "start": {
                "line": 76,
                "col": 8,
                "offset": 3959
            },
            "end": {
                "line": 76,
                "col": 13,
                "offset": 3964
            }
        }
    },
    {
        "tag": "#withSymbol",
        "position": {
            "start": {
                "line": 76,
                "col": 33,
                "offset": 3984
            },
            "end": {
                "line": 76,
                "col": 44,
                "offset": 3995
            }
        }
    },
    {
        "tag": "#task",
        "position": {
            "start": {
                "line": 77,
                "col": 8,
                "offset": 4005
            },
            "end": {
                "line": 77,
                "col": 13,
                "offset": 4010
            }
        }
    },
    {
        "tag": "#withSymbol",
        "position": {
            "start": {
                "line": 77,
                "col": 33,
                "offset": 4030
            },
            "end": {
                "line": 77,
                "col": 44,
                "offset": 4041
            }
        }
    },
    {
        "tag": "#task",
        "position": {
            "start": {
                "line": 78,
                "col": 8,
                "offset": 4051
            },
            "end": {
                "line": 78,
                "col": 13,
                "offset": 4056
            }
        }
    },
    {
        "tag": "#withSymbol",
        "position": {
            "start": {
                "line": 78,
                "col": 33,
                "offset": 4076
            },
            "end": {
                "line": 78,
                "col": 44,
                "offset": 4087
            }
        }
    }
]`;

        const tagCache: TagCache[] = JSON.parse(jsonString);

        const lineNumber = 74;
        const tagsOnLine = getTagsOnLine(tagCache, lineNumber);
        expect(tagsOnLine).toStrictEqual(['#task', '#withSymbol']);

        const tagsInFile = getAllTagsInFileSorted(tagCache);

        const uniqueTagsInFile = getUniqueTagsInFileSorted(tagsInFile);
        expect(uniqueTagsInFile).toStrictEqual([
            '#1-2',
            '#1_2',
            '#FFF23456',
            '#FFF34567',
            '#HyperlinkedText',
            '#ValidTag',
            '#letters-followed-by-asterisk',
            '#letters-followed-by-dollar',
            '#task',
            '#withEmptySub/',
            '#withEmptySub/£sub',
            '#withNonEmpty/Sub',
            '#withNonEmpty/Sub£',
            '#withSymbol',
            '#withSymbol£',
            '#withSymbol™',
            '#y1984',
        ]);
    });
});
