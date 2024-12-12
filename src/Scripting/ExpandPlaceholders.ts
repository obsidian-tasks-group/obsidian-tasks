import Mustache from 'mustache';
import proxyData from 'mustache-validator';

// https://github.com/janl/mustache.js

/**
 * Expand any placeholder strings - {{....}} - in the given template, and return the result.
 *
 * The template implementation is currently provided by: [mustache.js](https://github.com/janl/mustache.js).
 *
 * @param template - A template string, typically with placeholders such as {{query.task.folder}}
 * @param view - The property values
 *
 * @throws Error
 *
 *      By using mustache-validator's proxyData, we ensure that any accesses of property names that are
 *      not in the view, we ensure that errors are detected immediately.
 *      The first unknown placeholder is included in Error.message.
 */
export function expandPlaceholders(template: string, view: any): string {
    // Turn off HTML escaping of things like '/' in file paths:
    // https://github.com/janl/mustache.js#variables
    Mustache.escape = function (text) {
        return text;
    };

    // Regex to detect function calls in placeholders
    const functionRegex = /{{\s*([\w.]+)\(([^)]*)\)\s*}}/g;

    const evaluatedTemplate = template.replace(functionRegex, (_match, functionPath, args) => {
        const pathParts = functionPath.split('.');
        const functionName = pathParts.pop();
        const obj = pathParts.reduce((acc: any, part: any) => acc && acc[part], view);

        if (obj && typeof obj[functionName] === 'function') {
            const argValues = args.split(',').map((arg: any) => arg.trim().replace(/^['"]|['"]$/g, ''));
            return obj[functionName](...argValues);
        }

        throw new Error(`Unknown property or invalid function: ${functionPath}`);
    });

    // Render the preprocessed template
    try {
        return Mustache.render(evaluatedTemplate, proxyData(view));
    } catch (error) {
        let message = '';
        if (error instanceof Error) {
            message = `There was an error expanding one or more placeholders.

The error message was:
    ${error.message.replace(/ > /g, '.').replace('Missing Mustache data property', 'Unknown property')}`;
        } else {
            message = 'Unknown error expanding placeholders.';
        }
        message += `

The problem is in:
    ${template}`;
        throw Error(message);
    }
}
