import type { QueryContext } from './QueryContext';
import type { TasksFile } from './TasksFile';

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

    const activeFilePrefix = 'query.activeFile.';
    if (placeholder.startsWith(activeFilePrefix)) {
        const fieldExpression = placeholder.slice(activeFilePrefix.length);
        const activeFile = queryContext.query.activeFile;
        if (activeFile === undefined) {
            const resolution = resolveFileField(fieldExpression, queryContext.query.file);
            if (resolution.resolved) {
                throw new Error(`There is no active file, so cannot expand {{${placeholder}}}`);
            }
            return resolution;
        }
        return resolveFileField(fieldExpression, activeFile);
    }

    const filePrefix = 'query.file.';
    if (placeholder.startsWith(filePrefix)) {
        return resolveFileField(placeholder.slice(filePrefix.length), queryContext.query.file);
    }

    return notResolved();
}

function resolveFileField(fieldExpression: string, file: TasksFile): KnownPlaceholderResolution {
    switch (fieldExpression) {
        case 'path':
            return resolved(file.path);
        case 'pathWithoutExtension':
            return resolved(file.pathWithoutExtension);
        case 'root':
            return resolved(file.root);
        case 'folder':
            return resolved(file.folder);
        case 'filename':
            return resolved(file.filename);
        case 'filenameWithoutExtension':
            return resolved(file.filenameWithoutExtension);
        case 'outlinksInProperties':
            return resolved(file.outlinksInProperties);
        case 'outlinksInBody':
            return resolved(file.outlinksInBody);
        case 'outlinks':
            return resolved(file.outlinks);
    }

    const propertyName = getSingleStringArgument(fieldExpression, singleStringArgumentRegex('property'));
    if (propertyName !== null) {
        return resolved(file.property(propertyName));
    }

    const hasPropertyName = getSingleStringArgument(fieldExpression, singleStringArgumentRegex('hasProperty'));
    if (hasPropertyName !== null) {
        return resolved(file.hasProperty(hasPropertyName));
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

function singleStringArgumentRegex(functionName: string): RegExp {
    // escape dots in property name, such as query.file.path
    const escapedFunctionName = functionName.replace(/\./g, String.raw`\.`);
    return new RegExp(String.raw`^${escapedFunctionName}\((['"])([^'"]*)\1\)$`);
}

function getSingleStringArgument(expression: string, regex: RegExp): string | null {
    const match = new RegExp(regex).exec(expression);
    return match?.[2] ?? null;
}
