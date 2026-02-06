import type { Reference } from 'obsidian';
import { LinkResolver } from '../../src/Task/LinkResolver';
import { Link } from '../../src/Task/Link';
import { MockDataLoader } from '../TestingTools/MockDataLoader';

describe('LinkResolver', () => {
    let rawLink: Reference;
    const link_in_file_body = MockDataLoader.get('link_in_file_body');

    beforeEach(() => {
        rawLink = link_in_file_body.cachedMetadata.links![0];
    });

    it('should resolve a link via local instance', () => {
        const link = new Link(rawLink, link_in_file_body.filePath);

        expect(link.originalMarkdown).toEqual('[[yaml_tags_is_empty]]');
        expect(link.destinationPath).toBeNull();
    });

    it('should resolve a link via global instance', () => {
        const link = new Link(rawLink, link_in_file_body.filePath);

        expect(link.originalMarkdown).toEqual('[[yaml_tags_is_empty]]');
        expect(link.destinationPath).toBeNull();
    });

    it('should allow a function to be supplied, to find the destination of a link', () => {
        const resolver = LinkResolver.getInstance();
        resolver.setGetFirstLinkpathDestFn(() => 'Hello World.md');

        const link = new Link(rawLink, link_in_file_body.filePath);
        expect(link.destinationPath).toEqual('Hello World.md');
    });

    it('should allow the global instance to be reset', () => {
        const globalInstance = LinkResolver.getInstance();
        globalInstance.setGetFirstLinkpathDestFn(() => 'From Global Instance.md');

        const link1 = new Link(rawLink, link_in_file_body.filePath);
        expect(link1.destinationPath).toEqual('From Global Instance.md');

        globalInstance.resetGetFirstLinkpathDestFn();

        const link2 = new Link(rawLink, link_in_file_body.filePath);
        expect(link2.destinationPath).toBeNull();
    });

    it('resetting global instance affects pre-existing links', () => {
        const globalInstance = LinkResolver.getInstance();
        globalInstance.setGetFirstLinkpathDestFn(() => 'From Global Instance.md');

        const link1 = new Link(rawLink, link_in_file_body.filePath);
        expect(link1.destinationPath).toEqual('From Global Instance.md');

        globalInstance.resetGetFirstLinkpathDestFn();

        expect(link1.destinationPath).toBeNull();
    });
});
