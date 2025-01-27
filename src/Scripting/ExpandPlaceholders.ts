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

// Regex to detect function calls in placeholders
const FUNCTION_REGEX = new RegExp(
    [
        // Match opening double curly braces with optional whitespace
        '{{\\s*',

        // Match and capture the function path (e.g., "object.path.toFunction")
        '([\\w.]+)',

        // Match the opening parenthesis and capture arguments inside
        '\\(([^)]*)\\)',

        // Match optional whitespace followed by closing double curly braces
        '\\s*}}',
    ].join(''), // Combine all parts without additional separators
    'g', // Global flag to match all instances in the template
);

function evaluateAnyFunctionCalls(template: string, view: any) {
    return template.replace(FUNCTION_REGEX, (_match, functionPath, args) => {
        const paramsArgs: ExpressionParameter[] = createExpressionParameters(view);
        const reconstructed = `${functionPath}(${args})`;
        const functionOrError = parseExpression(paramsArgs, reconstructed);
        if (functionOrError.isValid()) {
            return evaluateExpression(functionOrError.queryComponent!, paramsArgs);
        }

        // Fall back on returning the raw string, including {{ and }} - and get Mustache to report the error.
        return _match;
    });
}

function createExpressionParameters(view: any): ExpressionParameter[] {
    return Object.entries(view) as ExpressionParameter[];
}
