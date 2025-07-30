import type { Reference } from 'obsidian';
import { Link } from './Link';

export class LinkResolver {
    public resolve(rawLink: Reference, pathContainingLink: string, destinationPath?: string) {
        return new Link(rawLink, pathContainingLink, destinationPath);
    }
}
