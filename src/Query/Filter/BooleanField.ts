import { parse as boonParse } from 'boon-js';
import type { PostfixExpression } from 'boon-js';

import { parseFilter } from '../FilterParser';
import type { Task } from '../../Task';
import { Field } from './Field';
import { FilterOrErrorMessage } from './Filter';
import type { Filter } from './Filter';

/**
 * BooleanField is a 'container' field type that parses a high-level filtering query of
 * the format --
 *    (filter1) AND ((filter2) OR (filter3))
 * The filters can be mixed and matched with any boolean operators as long as the individual filters are
 * wrapped in either paranthesis or quotes -- (filter1) or "filter1".
 * What happens internally is that when the boolean field is asked to create a filter, it parses the boolean
 * query into a logical postfix expression (https://en.wikipedia.org/wiki/Reverse_Polish_notation),
 * with the individual filter components as "identifier" tokens.
 * These identifiers have an associated actual Filter (which is cached during the query parsing).
 * The returned Filter of the whole boolean query is eventually a function that for each Task object,
 * evaluates the complete postfix expression by going through the individual filters and then resolving
 * the expression into a single boolean entity.
 */
export class BooleanField extends Field {
    private readonly basicBooleanRegexp = /.*(AND|OR|XOR|NOT)\s*[("].*/g;
    private readonly supportedOperators = ['AND', 'OR', 'XOR', 'NOT'];
    private subFields: Record<string, Filter> = {};

    protected filterRegexp(): RegExp {
        return this.basicBooleanRegexp;
    }

    public createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        return this.parseLine(line);
    }

    public fieldName(): string {
        return 'boolean query';
    }

    /**
     * This builds a Filter for a complete boolean query by:
     * 1. Preprocessing the expression into something our helper package, boon-js, knows how to build an expression for.
     * 2. Creating a postfix logical expression using boon-js, which has -
     *    a. Identifiers (leaves), which are regular Field filters represented as their string.
     *    b. Operators, which are logical operators between identifiers or between parenthesis.
     * 3. Creating the filter functions for all the Identifiers in the expression and caching them in this.subFields.
     * 4. Returning a final function filter, which for each Task can run the complete query.
     */
    private parseLine(line: string): FilterOrErrorMessage {
        const result = new FilterOrErrorMessage();
        if (line.length === 0) {
            result.error = 'empty line';
            return result;
        }
        const preprocessed = this.preprocessExpression(line);
        try {
            // Convert the (preprocessed) line into a postfix logical expression
            const postfixExpression = boonParse(preprocessed);
            // Construct sub-field map, i.e. have subFields include a filter function for every
            // final token in the expression
            for (const token of postfixExpression) {
                if (token.name === 'IDENTIFIER' && token.value) {
                    const identifier = token.value.trim();
                    if (!(identifier in this.subFields)) {
                        const parsedField = parseFilter(identifier);
                        if (parsedField === null) {
                            result.error = `couldn't parse sub-expression '${identifier}'`;
                            return result;
                        }
                        if (parsedField.error) {
                            result.error = `couldn't parse sub-expression '${identifier}': ${parsedField.error}`;
                            return result;
                        } else if (parsedField.filter) {
                            this.subFields[identifier] = parsedField.filter;
                        }
                    }
                } else if (token.name === 'OPERATOR') {
                    // While we're already iterating over the expression, although we don't need the operators at
                    // this stage but only in filterTaskWithParsedQuery below, we're using the opportunity to verify
                    // they are valid. If we won't, then an invalid operator will only be detected when the query is
                    // run on a task
                    if (token.value == undefined) {
                        result.error = 'empty operator in boolean query';
                        return result;
                    }
                    if (!this.supportedOperators.includes(token.value)) {
                        result.error = `unknown boolean operator '${token.value}'`;
                        return result;
                    }
                }
            }
            // Return the filter function that can run the complete query
            result.filter = (task: Task) => {
                return this.filterTaskWithParsedQuery(task, postfixExpression);
            };
            return result;
        } catch (error) {
            const message =
                error instanceof Error ? error.message : 'unknown error type';
            result.error = `malformed boolean query -- ${message} (check the documentation for guidelines)`;
            return result;
        }
        return result;
    }

    private preprocessExpression(line: string): string {
        // Prepare the query to be processed by boon-js.
        // Boon doesn't process expression with spaces unless they are surrounded by quotes, so replace
        // (due today) by ("due today").
        return line.replace(/\(([^()]+)\)/g, '("$1")');
    }

    /*
     * This run a Task object through a complete boolean expression.
     * It basically resolves the postfix expression until it is reduced into a single boolean value,
     * which is the result of the complete expression.
     * See here how it works: http://www.btechsmartclass.com/data_structures/postfix-evaluation.html
     * Another reference: https://www.tutorialspoint.com/Evaluate-Postfix-Expression
     */
    private filterTaskWithParsedQuery(
        task: Task,
        postfixExpression: PostfixExpression,
    ): boolean {
        const toBool = (s: string | undefined) => {
            return s === 'true';
        };
        const toString = (b: boolean) => {
            return b ? 'true' : 'false';
        };
        const booleanStack: string[] = [];
        for (const token of postfixExpression) {
            if (token.name === 'IDENTIFIER') {
                // Identifiers are the sub-fields of the expression, the actual filters, e.g. 'description includes foo'.
                // For each identifier we created earlier the corresponding Filter, so now we can just evaluate the given
                // task for each identifier that we find in the postfix expression.
                if (token.value == null) throw Error('null token value'); // This should not happen
                const filter = this.subFields[token.value.trim()];
                const result = filter(task);
                booleanStack.push(toString(result));
            } else if (token.name === 'OPERATOR') {
                // To evaluate an operator we need to pop the required number of items from the boolean stack,
                // do the logical evaluation and push back the result
                if (token.value === 'NOT') {
                    const arg1 = toBool(booleanStack.pop());
                    booleanStack.push(toString(!arg1));
                } else if (token.value === 'OR') {
                    const arg1 = toBool(booleanStack.pop());
                    const arg2 = toBool(booleanStack.pop());
                    booleanStack.push(toString(arg1 || arg2));
                } else if (token.value === 'AND') {
                    const arg1 = toBool(booleanStack.pop());
                    const arg2 = toBool(booleanStack.pop());
                    booleanStack.push(toString(arg1 && arg2));
                } else if (token.value === 'XOR') {
                    const arg1 = toBool(booleanStack.pop());
                    const arg2 = toBool(booleanStack.pop());
                    booleanStack.push(
                        toString((arg1 && !arg2) || (!arg1 && arg2)),
                    );
                } else {
                    throw Error('Unsupported operator: ' + token.value);
                }
            } else {
                throw Error('Unsupported token type: ' + token);
            }
        }
        // Eventually the result of the expression for this Task is the only item left in the boolean stack
        return toBool(booleanStack[0]);
    }
}
