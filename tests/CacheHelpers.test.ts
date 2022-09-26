import { getAllTagsInFileSorted, getTagsOnLine, getUniqueTagsInFileSorted } from '../src/CacheHelpers';
import { getSampleMetadataTagCacheData } from './SampleData/SampleMetadataTagCacheData';

describe('CacheHelpers', () => {
    describe('Finding Tags', () => {
        it('works on file without tags', () => {
            expect(getTagsOnLine(undefined, 27)).toStrictEqual([]);
            expect(getAllTagsInFileSorted(undefined)).toStrictEqual([]);
        });

        it('should find all tags on a line', () => {
            const tagCache = getSampleMetadataTagCacheData();

            const lineNumber = 74;
            const tagsOnLine = getTagsOnLine(tagCache, lineNumber);
            expect(tagsOnLine).toStrictEqual(['#task', '#withSymbol']);
        });

        it('should find all tags in a file', () => {
            const tagCache = getSampleMetadataTagCacheData();

            const tagsInFile = getAllTagsInFileSorted(tagCache);
            const uniqueTagsInFile = getUniqueTagsInFileSorted(tagsInFile);
            expect(uniqueTagsInFile).toStrictEqual([
                '#FFF23456',
                '#letters-followed-by-dollar',
                '#task',
                '#withSymbol',
            ]);
        });
    });
});
