import { expandPlaceholders } from '../../src/Scripting/ExpandPlaceholders';
import { makeQueryContext } from '../../src/Scripting/QueryContext';
import { TasksFile } from '../../src/Scripting/TasksFile';
import { type ExpressionParameter, evaluateExpression, parseExpression } from '../../src/Scripting/Expression';

function createExpressionParameters(view: any): ExpressionParameter[] {
    return Object.entries(view) as ExpressionParameter[];
}

function checkResultViaExpression(view: any, expressionText: string, expected: any) {
    const paramsArgs: ExpressionParameter[] = createExpressionParameters(view);
    const functionOrError = parseExpression(paramsArgs, expressionText);
    expect(functionOrError.isValid()).toEqual(true);
    expect(functionOrError.queryComponent).not.toBeUndefined();
    if (functionOrError.queryComponent) {
        const result = evaluateExpression(functionOrError.queryComponent, paramsArgs);
        expect(result).toEqual(expected);
    }
}

describe('ExpandTemplate', () => {
    const tasksFile = new TasksFile('a/b/path with space.md');

    it('hard-coded call', () => {
        const view = {
            title: 'Joe',
            calc: () => 2 + 4,
        };

        const output = expandPlaceholders('{{ title }} spends {{ calc }}', view);
        expect(output).toMatchInlineSnapshot('"Joe spends 6"');
    });

    it('fake query - with file path', () => {
        const rawString = `path includes {{query.file.path}}
filename includes {{query.file.filename}}`;

        const queryContext = makeQueryContext(tasksFile);
        expect(expandPlaceholders(rawString, queryContext)).toMatchInlineSnapshot(`
            "path includes a/b/path with space.md
            filename includes path with space.md"
        `);
    });

    it('fake query - with method call on path', () => {
        // I discovered by chance that adding support for properties in query placeholders enabled the following to work
        const rawString = 'path includes {{query.file.path.toUpperCase()}}';

        const queryContext = makeQueryContext(tasksFile);
        expect(expandPlaceholders(rawString, queryContext)).toEqual('path includes A/B/PATH WITH SPACE.MD');
    });

    it('fake query - with hasProperty', () => {
        // TODO We really must prevent use of booleans as strings in property placeholders
        const rawString = '{{query.file.hasProperty("no-such-property")}}';

        const queryContext = makeQueryContext(tasksFile);
        // I think converting a bool to a string is unhelpful here.
        expect(expandPlaceholders(rawString, queryContext)).toEqual('false');
    });

    it.failing('fake query - with expression', () => {
        // I really want a way to use true/false properties to control the layout
        // This needs to be tested with:
        //    - property is present in file and is true
        //    - property is present in file and is false
        //    - property is present in file and is missing
        //    - property is not in the file
        const rawString = '{{query.file.property("show-tree") ? "show tree" : "hide tree"}}';

        const queryContext = makeQueryContext(tasksFile);
        /*
            Currently gives:
            Error: There was an error expanding one or more placeholders.

            The error message was:
                Unknown property: query.file.property("show-tree") ? "show tree" : "hide tree"
         */
        expect(expandPlaceholders(rawString, queryContext)).toEqual('hide tree');
    });

    it('should return the input string if no {{ in line', function () {
        const queryContext = makeQueryContext(tasksFile);
        const line = 'no braces here';

        const result = expandPlaceholders(line, queryContext);

        // This test revealed that Mustache itself returns the input string if no {{ present.
        expect(Object.is(line, result)).toEqual(true);
    });

    it('should throw an error if unknown template field used', () => {
        const view = {
            title: 'Joe',
        };

        const source = '{{ title }} spends {{ unknownField }}';
        expect(() => expandPlaceholders(source, view)).toThrow(`There was an error expanding one or more placeholders.

The error message was:
    Unknown property: unknownField

The problem is in:
    {{ title }} spends {{ unknownField }}`);
    });

    it('should throw an error if unknown template nested field used', () => {
        const queryContext = makeQueryContext(new TasksFile('stuff.md'));
        const source = '{{ query.file.nonsense }}';

        expect(() => expandPlaceholders(source, queryContext)).toThrow(
            `There was an error expanding one or more placeholders.

The error message was:
    Unknown property: query.file.nonsense

The problem is in:
    {{ query.file.nonsense }}`,
        );
    });

    it.failing('should not treat absent property values as string ', () => {
        // TODO We really must prevent use of null - and probably undefined - as strings from property placeholders
        const rawString = '{{ query.file.property("non-existent")}}';

        const queryContext = makeQueryContext(tasksFile);
        const expanded = expandPlaceholders(rawString, queryContext);
        expect(expanded).not.toContain('null');
    });
});

describe('ExpandTemplate with functions', () => {
    describe('Basic Functionality', () => {
        it('Simple property access', () => {
            const output = expandPlaceholders('Hello, {{name}}!', { name: 'World' });
            expect(output).toEqual('Hello, World!');
        });

        it('Valid function call', () => {
            const view = {
                math: { square: (x: string) => parseInt(x) ** 2 },
            };
            const output = expandPlaceholders("Result: {{math.square('4')}}", view);
            expect(output).toEqual('Result: 16');

            checkResultViaExpression(view, "math.square('4')", 16);
        });
    });

    describe('Complex Nested Paths', () => {
        it('Nested object function access', () => {
            const view = {
                data: {
                    subData: {
                        func: (x: string) => `Result for ${x}`,
                    },
                },
            };
            const output = expandPlaceholders("Value: {{data.subData.func('arg')}}", view);
            expect(output).toEqual('Value: Result for arg');

            checkResultViaExpression(view, "data.subData.func('arg')", 'Result for arg');
        });
    });

    describe('Special Characters in Arguments', () => {
        it('Mixed quotes in arguments', () => {
            const output = expandPlaceholders("Command: {{cmd.run('Hello, \\'world\\'')}}", {
                cmd: { run: (x: string) => `Running ${x}` },
            });
            expect(output).toEqual("Command: Running Hello, 'world'");
        });

        it('Whitespace in arguments', () => {
            const output = expandPlaceholders("Path: {{file.get('   /my path/   ')}}", {
                file: { get: (x: string) => x.trim() },
            });
            expect(output).toEqual('Path: /my path/');
        });
    });

    describe('Error Handling', () => {
        it('Non-existent function', () => {
            expect(() => {
                expandPlaceholders('Call: {{invalid.func()}}', { invalid: {} });
            }).toThrow('invalid.func is not a function');
        });

        it('Missing arguments', () => {
            const output = expandPlaceholders('Result: {{calc.add()}}', {
                calc: { add: () => 'No args' },
            });
            expect(output).toEqual('Result: No args');
        });

        it('Function that throws an error', () => {
            expect(() => {
                expandPlaceholders('Test: {{bug.trigger()}}', {
                    bug: {
                        trigger: () => {
                            throw new Error('Something broke');
                        },
                    },
                });
            }).toThrow('Something broke');
        });
    });

    describe('Edge Cases', () => {
        it('Empty template', () => {
            const output = expandPlaceholders('', { key: 'value' });
            expect(output).toEqual('');
        });

        it('Function with no arguments', () => {
            const view = {
                sys: { getVersion: () => '1.0.0' },
            };
            const output = expandPlaceholders('Version: {{sys.getVersion()}}', view);
            expect(output).toEqual('Version: 1.0.0');

            checkResultViaExpression(view, 'sys.getVersion()', '1.0.0');
        });

        it('Template with no placeholders', () => {
            const output = expandPlaceholders('Static text.', { anything: 'irrelevant' });
            expect(output).toEqual('Static text.');
        });

        it('Reserved characters', () => {
            const output = expandPlaceholders("Escape: {{text.replace('&')}}", {
                text: { replace: (x: string) => x.replace('&', '&amp;') },
            });
            expect(output).toEqual('Escape: &amp;');
        });
    });

    describe('Multiple Placeholders', () => {
        it('Mixed property and function calls', () => {
            const output = expandPlaceholders("{{user.name}}: {{math.square('5')}}", {
                user: { name: 'Alice' },
                math: { square: (x: string) => parseInt(x) ** 2 },
            });
            expect(output).toEqual('Alice: 25');
        });

        it.failing('Two function calls', () => {
            // This is currently interpreted as:
            //  1. A single function call to math.square
            //  2. With the parameter "'3'}} - and - {{math.square('5'"
            const output = expandPlaceholders("{{math.square('3'}} - and - {{math.square('5')}}", {
                math: { square: (x: string) => parseInt(x) ** 2 },
            });
            // Currently the result is just '9'
            expect(output).toEqual('9 - and - 25');
        });
    });

    describe('Unsupported Syntax', () => {
        it('Unsupported Mustache syntax', () => {
            expect(() => {
                expandPlaceholders("Invalid: {{unsupported.func['key']}}", {
                    unsupported: { func: { key: 'value' } },
                });
            }).toThrow(`There was an error expanding one or more placeholders.

The error message was:
    Unknown property: unsupported.func['key']

The problem is in:
    Invalid: {{unsupported.func['key']}}`);
        });
    });

    describe('Security and Performance', () => {
        it('Prototype pollution prevention', () => {
            expect(() => {
                expandPlaceholders('{{__proto__.polluted}}', {});
            }).toThrow(`There was an error expanding one or more placeholders.

The error message was:
    Unknown property: __proto__.polluted

The problem is in:
    {{__proto__.polluted}}`);
        });

        it('Large templates', () => {
            const largeTemplate = Array(1001).fill('{{value}}').join(' and ');
            const output = expandPlaceholders(largeTemplate, { value: 'test' });
            expect(output).toEqual('test and '.repeat(1000).trim() + ' test');
        });
    });
});

describe('experiments for new Placeholders implementation', () => {
    // The failing new 'Two function calls' test shows that the current finding of placeholders
    // is not robust if there is more than one function-like placeholder on a line.
    // So I am starting to experiment with different implementations of
    // ExpandPlaceholder's evaluateAnyFunctionCalls().
    describe('should find non-nested placeholders', () => {
        function findNonNestedMatches(str: string): string[] {
            const regex = new RegExp(
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

            const matches: string[] = [];
            let match;

            while ((match = regex.exec(str)) !== null) {
                const innerContent = match[1];

                // Ensure there are no nested `{{` or `}}` in the inner content
                if (!innerContent.includes('{{') && !innerContent.includes('}}')) {
                    matches.push(match[0]); // Add the full match, including `{{` and `}}`
                } else {
                    console.log(`Skipping ${match[1]}`);
                }
            }

            return matches;
        }

        it('sample 1 - no spaces', () => {
            const input = 'text{{valid1}}more-text{{valid2}}and-more{{invalid{{nested}}}}';
            expect(findNonNestedMatches(input)).toEqual(['{{valid1}}', '{{valid2}}']);
        });

        it('sample 2 - with spaces', () => {
            const input = 'text {{valid}} text {{valid2}} {{invalid {{nested}} }}';
            expect(findNonNestedMatches(input)).toEqual(['{{valid}}', '{{valid2}}']);
        });

        it('sample 3 - nested text is at the start', () => {
            const input = '{{outer{{inner}}}} {{valid}}';
            expect(findNonNestedMatches(input)).toEqual(['{{valid}}']);
        });
    });
});
