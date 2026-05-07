import type { QueryContext } from './QueryContext';

export type KnownPlaceholderResolution =
    | {
          resolved: true;
          value: unknown;
      }
    | {
          resolved: false;
      };

/**
 * Resolve documented query placeholders that are safe to evaluate without JavaScript execution.
 *
 * This intentionally supports only known placeholder expressions. It is not a JavaScript parser.
 * Expressions not recognised here should fall back to JavaScript evaluation only when JavaScript
 * execution is enabled.
 */
export function resolveKnownPlaceholder(reconstructed: string, queryContext: QueryContext): KnownPlaceholderResolution {
    const placeholder = reconstructed.trim();
    const queryFile = queryContext.query.file;

    switch (placeholder) {
        case 'query.file.path':
            return resolved(queryFile.path);
        case 'query.file.pathWithoutExtension':
            return resolved(queryFile.pathWithoutExtension);
        case 'query.file.root':
            return resolved(queryFile.root);
        case 'query.file.folder':
            return resolved(queryFile.folder);
        case 'query.file.filename':
            return resolved(queryFile.filename);
        case 'query.file.filenameWithoutExtension':
            return resolved(queryFile.filenameWithoutExtension);
        case 'query.file.outlinksInProperties':
            return resolved(queryFile.outlinksInProperties);
        case 'query.file.outlinksInBody':
            return resolved(queryFile.outlinksInBody);
        case 'query.file.outlinks':
            return resolved(queryFile.outlinks);
    }

    const propertyName = getSingleStringArgument(placeholder, /^query\.file\.property\((['"])([^'"]*)\1\)$/);
    if (propertyName !== null) {
        return resolved(queryFile.property(propertyName));
    }

    const hasPropertyName = getSingleStringArgument(placeholder, /^query\.file\.hasProperty\((['"])([^'"]*)\1\)$/);
    if (hasPropertyName !== null) {
        return resolved(queryFile.hasProperty(hasPropertyName));
    }

    return notResolved();
}

function resolved(value: unknown): KnownPlaceholderResolution {
    return {
        resolved: true,
        value,
    };
}

function notResolved(): KnownPlaceholderResolution {
    return {
        resolved: false,
    };
}

function getSingleStringArgument(expression: string, regex: RegExp): string | null {
    const match = expression.match(regex);
    return match?.[2] ?? null;
}
