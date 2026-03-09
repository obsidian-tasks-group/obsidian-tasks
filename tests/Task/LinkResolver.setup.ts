import type { Reference } from 'obsidian';
import { LinkResolver } from '../../src/Task/LinkResolver';
import { getFirstLinkpathDest } from '../__mocks__/obsidian';
import { MockDataLoader } from '../TestingTools/MockDataLoader';

beforeAll(() => {
    LinkResolver.getInstance().setGetFirstLinkpathDestFn((rawLink: Reference, sourcePath: string) => {
        return getFirstLinkpathDest(rawLink, sourcePath);
    });
    LinkResolver.getInstance().setGetFileCacheFn(
        (filePath: string) => MockDataLoader.findDataFromMarkdownPath(filePath).cachedMetadata,
    );
});
