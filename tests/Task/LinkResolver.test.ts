import type { Reference } from 'obsidian';
import link_in_file_body from '../Obsidian/__test_data__/link_in_file_body.json';
import { LinkResolver } from '../../src/Task/LinkResolver';

describe('LinkResolver', () => {
    let rawLink: Reference;

    beforeEach(() => {
        rawLink = link_in_file_body.cachedMetadata.links[0];
    });

    it('should resolve a link via local instance', () => {
        const resolver = new LinkResolver();
        const link = resolver.resolve(rawLink, link_in_file_body.filePath);

        expect(link.originalMarkdown).toEqual('[[yaml_tags_is_empty]]');
        expect(link.destinationPath).toBeNull();
    });

    it('should resolve a link via global instance', () => {
        const link = LinkResolver.getInstance().resolve(rawLink, link_in_file_body.filePath);

        expect(link.originalMarkdown).toEqual('[[yaml_tags_is_empty]]');
        expect(link.destinationPath).toBeNull();
    });

    it('should allow a function to be supplied, to find the destination of a link', () => {
        const resolver = new LinkResolver();
        resolver.setGetFirstLinkpathDestFn((_rawLink: Reference, _sourcePath: string) => 'Hello World.md');

        const link = resolver.resolve(rawLink, link_in_file_body.filePath);
        expect(link.destinationPath).toEqual('Hello World.md');
    });

    it('should allow the global instance to be reset', () => {
        const globalInstance = LinkResolver.getInstance();
        globalInstance.setGetFirstLinkpathDestFn(
            (_rawLink: Reference, _sourcePath: string) => 'From Global Instance.md',
        );

        const link1 = globalInstance.resolve(rawLink, link_in_file_body.filePath);
        expect(link1.destinationPath).toEqual('From Global Instance.md');

        globalInstance.resetGetFirstLinkpathDestFn();

        const link2 = globalInstance.resolve(rawLink, link_in_file_body.filePath);
        expect(link2.destinationPath).toBeNull();
    });
});
