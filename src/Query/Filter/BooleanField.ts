import { PostfixExpression, parse as boonParse } from 'boon-js';

import { parseFilter } from '../FilterParser';
import type { Task } from '../../Task';
import { Field } from './Field';
import { Filter, FilterOrErrorMessage } from './Filter';

export class BooleanField extends Field {
    private static readonly basicBooleanRegexp = /.*(AND|OR|XOR|NOT).*/g;
    private subFields: Record<string, Filter> = {};

    protected filterRegexp(): RegExp {
        return BooleanField.basicBooleanRegexp;
    }

    public createFilterOrErrorMessage(line: string): FilterOrErrorMessage {
        return this.parseLine(line);
    }

    protected fieldName(): string {
        return 'boolean query';
    }

    private parseLine(line: string): FilterOrErrorMessage {
        const result = new FilterOrErrorMessage();
        if (line.length === 0) {
            result.error = 'empty line';
            return result;
        }
        const preprocessed = this.preprocessExpression(line);
        try {
            const postfixExpression = boonParse(preprocessed);
            // Construct sub-field map, i.e. have subFields include a filter function for every
            // final token in the expression
            for (const token of postfixExpression) {
                if (token.name === 'IDENTIFIER' && token.value) {
                    if (!(token.value in this.subFields)) {
                        const parsedField = parseFilter(token.value);
                        if (parsedField === null) {
                            result.error = `couldn't parse sub-expression '${token.value}'`;
                            return result;
                        }
                        if (parsedField.error) {
                            result.error = `couldn't parse sub-expression '${token.value}': ${parsedField.error}`;
                            return result;
                        } else if (parsedField.filter) {
                            this.subFields[token.value] = parsedField.filter;
                        }
                    }
                }
            }
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
                if (token.value == null) throw Error('null token value');
                // TODO document
                const filter = this.subFields[token.value];
                const result = filter(task);
                booleanStack.push(toString(result));
            } else if (token.name === 'OPERATOR') {
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
                } else {
                    throw Error('Unsuppoted operator' + token.value);
                }
            } else {
                throw Error('Unsupported token type:' + token);
            }
        }
        return toBool(booleanStack[0]);
    }
}
