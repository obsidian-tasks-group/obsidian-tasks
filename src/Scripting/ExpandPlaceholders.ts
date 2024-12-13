import Mustache from 'mustache';
import proxyData from 'mustache-validator';

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

    // Preprocess the template to evaluate any placeholders that involve function calls
    const evaluatedTemplate = evaluateAnyFunctionCalls(template, view);

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

const ARGUMENTS_REGEX = new RegExp(
    [
        // Match single-quoted arguments
        "'((?:\\\\'|[^'])*)'",

        // Match double-quoted arguments
        '"((?:\\\\"|[^"])*)"',

        // Match unquoted arguments (non-commas)
        '([^,]+)',
    ].join('|'), // Combine all parts with OR (|)
    'g', // Global flag for multiple matches
);

function parseArgs(args: string): string[] {
    const parsedArgs: string[] = [];
    let match;

    while ((match = ARGUMENTS_REGEX.exec(args)) !== null) {
        if (match[1] !== undefined) {
            // Single-quoted argument
            parsedArgs.push(match[1].replace(/\\'/g, "'"));
        } else if (match[2] !== undefined) {
            // Double-quoted argument
            parsedArgs.push(match[2].replace(/\\"/g, '"'));
        } else if (match[3] !== undefined) {
            // Unquoted argument
            parsedArgs.push(match[3].trim());
        }
    }

    return parsedArgs;
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
        // Split the function path (e.g., "query.file.property") into parts
        const pathParts = functionPath.split('.');

        // Extract the function name (last part of the path)
        const functionName = pathParts.pop();

        // Traverse the view object to find the object containing the function.
        //
        // This is needed because JavaScript/TypeScript doesn’t provide a direct way
        // to access view['query']['file']['property'] based on such a dynamic path.
        //
        // So we need the loop to "walk" through the view object step by step,
        // accessing each level as specified by the pathParts.
        //
        // Also, if any part of the path is missing (e.g., view.query.file exists,
        // but view.query.file.property does not), the loop ensures the traversal
        // stops early, and obj becomes undefined instead of throwing an error.
        let obj = view; // Start at the root of the view object
        for (const part of pathParts) {
            if (obj == null) {
                // Stop traversal if obj is null or undefined
                obj = undefined;
                break;
            }
            obj = obj[part]; // Move to the next level of the object
        }
        // At the end of the loop, obj contains the resolved value or undefined if any part of the path was invalid

        // Check if the function exists on the resolved object
        if (obj && typeof obj[functionName] === 'function') {
            // Parse the arguments from the placeholder, stripping quotes and trimming whitespace
            const argValues = parseArgs(args);

            // Call the function with the parsed arguments and return the result
            return obj[functionName](...argValues);
        }

        // Throw an error if the function does not exist or is invalid
        throw new Error(`Unknown property or invalid function: ${functionPath}`);
    });
}
