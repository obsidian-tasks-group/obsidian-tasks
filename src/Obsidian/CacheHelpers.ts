import type { HeadingCache, SectionCache } from 'obsidian';

export function getSection(lineNumberTask: number, sections: SectionCache[] | undefined): SectionCache | null {
    if (sections === undefined) {
        return null;
    }

    for (const section of sections) {
        if (section.position.start.line <= lineNumberTask && section.position.end.line >= lineNumberTask) {
            return section;
        }
    }

    return null;
}

export function getPrecedingHeader(lineNumberTask: number, headings: HeadingCache[] | undefined): string | null {
    if (headings === undefined) {
        return null;
    }

    let precedingHeader: string | null = null;

    for (const heading of headings) {
        if (heading.position.start.line > lineNumberTask) {
            return precedingHeader;
        }
        precedingHeader = heading.heading;
    }
    return precedingHeader;
}
