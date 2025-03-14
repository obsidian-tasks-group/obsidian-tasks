import Mustache from 'mustache';
import proxyData from 'mustache-validator';
import { type ExpressionParameter, evaluateExpression, parseExpression } from './Expression';

// https://github.com/janl/mustache.js

/**
 * Expand any placeholder strings - {{....}} - in the given template, and return the result.
 *
 * The template implementation is currently provided by: [mustache.js](https://github.com/janl/mustache.js).
 * This is augmented by also allowing the templates to contain function calls.
 *
 * @param template - A template string, typically with placeholders such as {{query.task.folder}} or
 *                  {{query.file.property('task_instruction')}}
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

    try {
        // Preprocess the template to evaluate any placeholders that involve function calls
        const evaluatedTemplate = evaluateAnyFunctionCalls(template, view);

        // Render the preprocessed template
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

// Regex to detect placeholders
const PLACEHOLDER_REGEX = new RegExp(
    [
        // Match the opening double braces `{{`
        '\\{\\{',

        // Lazily capture everything inside (.*?), ensuring it stops at the first `}}`
        '(.*?)',

        // Match the closing double braces `}}`
        '\\}\\}',
    ].join(''), // Combine the parts into a single string
    'g', // Global flag to find all matches
);

function evaluateAnyFunctionCalls(template: string, view: any) {
    return template.replace(PLACEHOLDER_REGEX, (_match, reconstructed) => {
        const paramsArgs: ExpressionParameter[] = createExpressionParameters(view);
        const functionOrError = parseExpression(paramsArgs, reconstructed);
        if (functionOrError.isValid()) {
            const result = evaluateExpression(functionOrError.queryComponent!, paramsArgs);
            if (result === null) {
                throw Error(
                    `Invalid placeholder result 'null'.
    Check for missing file property in this expression:
        {{${reconstructed}}}`,
                );
            }
            if (result !== undefined) {
                return result;
            }
        }

        // Fall back on returning the raw string, including {{ and }} - and get Mustache to report the error.
        return _match;
    });
}

function createExpressionParameters(view: any): ExpressionParameter[] {
    return Object.entries(view) as ExpressionParameter[];
}
