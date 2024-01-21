import { parse as boonParse } from 'boon-js';
import type { PostfixExpression } from 'boon-js';

import { parseFilter } from '../FilterParser';
import type { Task } from '../../Task/Task';
import { Explanation } from '../Explain/Explanation';
import type { SearchInfo } from '../SearchInfo';
import { Field } from './Field';
import { FilterOrErrorMessage } from './FilterOrErrorMessage';
import { Filter } from './Filter';

/**
 * BooleanField is a 'container' field type that parses a high-level filtering query of
 * the format --
 *    (filter1) AND ((filter2) OR (filter3))
 * The filters can be mixed and matched with any boolean operators as long as the individual filters are
 * wrapped in either parenthesis or quotes -- (filter1) or "filter1".
 * What happens internally is that when the boolean field is asked to create a filter, it parses the boolean
 * query into a logical postfix expression (https://en.wikipedia.org/wiki/Reverse_Polish_notation),
 * with the individual filter components as "identifier" tokens.
 * These identifiers have an associated actual Filter (which is cached during the query parsing).
 * The returned Filter of the whole boolean query is eventually a function that for each Task object,
 * evaluates the complete postfix expression by going through the individual filters and then resolving
 * the expression into a single boolean entity.
 */
export class BooleanField extends Field {
    // First pattern in this matches conventional (filter1) OR (filter2) and similar
    // Second pattern matches (filter1) - that is, ensures that a single filter is treated as valid
    private readonly basicBooleanRegexp = /(.*(AND|OR|XOR|NOT)\s*[("].*|\(.+\))/g;
    private readonly supportedOperators = ['AND', 'OR', 'XOR', 'NOT'];
    private subFields: Record<string, Filter> = {};

    protected filterRegExp(): RegExp {
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
        if (line.length === 0) {
            return FilterOrErrorMessage.fromError(line, 'empty line');
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
                            return FilterOrErrorMessage.fromError(
                                line,
                                `couldn't parse sub-expression '${identifier}'`,
                            );
                        }
                        if (parsedField.error) {
                            return FilterOrErrorMessage.fromError(
                                line,
                                `couldn't parse sub-expression '${identifier}': ${parsedField.error}`,
                            );
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
                        return FilterOrErrorMessage.fromError(line, 'empty operator in boolean query');
                    }
                    if (!this.supportedOperators.includes(token.value)) {
                        return FilterOrErrorMessage.fromError(line, `unknown boolean operator '${token.value}'`);
                    }
                }
            }
            // Return the filter with filter function that can run the complete query
            const filterFunction = (task: Task, searchInfo: SearchInfo) => {
                return this.filterTaskWithParsedQuery(task, postfixExpression, searchInfo);
            };
            const explanation = this.constructExplanation(postfixExpression);
            return FilterOrErrorMessage.fromFilter(new Filter(line, filterFunction, explanation));
        } catch (error) {
            const message = error instanceof Error ? error.message : 'unknown error type';
            return FilterOrErrorMessage.fromError(
                line,
                `malformed boolean query -- ${message} (check the documentation for guidelines)`,
            );
        }
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
        searchInfo: SearchInfo,
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
                const result = filter.filterFunction(task, searchInfo);
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
                    booleanStack.push(toString((arg1 && !arg2) || (!arg1 && arg2)));
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

    /**
     * Construct an {@link Explanation} representing the complete Boolean instruction currently being analysed.
     *
     * @param postfixExpression
     */
    private constructExplanation(postfixExpression: PostfixExpression): Explanation {
        // For an explanation of the code, see the JSdoc and comments of filterTaskWithParsedQuery()
        const explanationStack: Explanation[] = [];
        for (const token of postfixExpression) {
            if (token.name === 'IDENTIFIER') {
                if (token.value == null) throw Error('null token value'); // This should not happen
                const filter = this.subFields[token.value.trim()];
                explanationStack.push(filter.explanation);
            } else if (token.name === 'OPERATOR') {
                // To evaluate an operator we need to pop the required number of items from the boolean stack,
                // do the logical evaluation and push back the result
                if (token.value === 'NOT') {
                    const arg1 = explanationStack.pop();
                    explanationStack.push(Explanation.booleanNot([arg1!]));
                } else if (token.value === 'OR') {
                    const arg2 = explanationStack.pop();
                    const arg1 = explanationStack.pop();
                    explanationStack.push(Explanation.booleanOr([arg1!, arg2!]));
                } else if (token.value === 'AND') {
                    const arg2 = explanationStack.pop();
                    const arg1 = explanationStack.pop();
                    explanationStack.push(Explanation.booleanAnd([arg1!, arg2!]));
                } else if (token.value === 'XOR') {
                    const arg2 = explanationStack.pop();
                    const arg1 = explanationStack.pop();
                    explanationStack.push(Explanation.booleanXor([arg1!, arg2!]));
                } else {
                    throw Error('Unsupported operator: ' + token.value);
                }
            } else {
                throw Error('Unsupported token type: ' + token.name);
            }
        }
        // Eventually the Explanation is the only item left in the boolean stack
        return explanationStack[0];
    }
}
