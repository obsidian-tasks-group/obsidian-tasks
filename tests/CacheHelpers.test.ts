import { getAllTagsInFileSorted, getTagsOnLine, getUniqueTagsInFileSorted } from '../src/CacheHelpers';
import { getSampleMetadataTagCacheData } from './SampleData/SampleMetadataTagCacheData';

describe('CacheHelpers', () => {
    it('works on file without tags', () => {
        expect(getTagsOnLine(undefined, 27)).toStrictEqual([]);
        expect(getAllTagsInFileSorted(undefined)).toStrictEqual([]);
    });

    it('works on file with tags', () => {
        const tagCache = getSampleMetadataTagCacheData();

        const lineNumber = 74;
        const tagsOnLine = getTagsOnLine(tagCache, lineNumber);
        expect(tagsOnLine).toStrictEqual(['#task', '#withSymbol']);

        const tagsInFile = getAllTagsInFileSorted(tagCache);

        const uniqueTagsInFile = getUniqueTagsInFileSorted(tagsInFile);
        expect(uniqueTagsInFile).toStrictEqual(['#FFF23456', '#letters-followed-by-dollar', '#task', '#withSymbol']);
    });
});
