import { expandPlaceholders } from '../../src/Scripting/ExpandPlaceholders';
import { makeQueryContext } from '../../src/Scripting/QueryContext';
import { TasksFile } from '../../src/Scripting/TasksFile';

describe('ExpandTemplate', () => {
    const tasksFile = new TasksFile('a/b/path with space.md');

    it('hard-coded call', () => {
        const view = {
            title: 'Joe',
            calc: () => 2 + 4,
        };

        const output = expandPlaceholders('{{ title }} spends {{ calc() }}', view);
        expect(output).toEqual('Joe spends 6');
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

    it('fake query - with expression', () => {
        const rawString = '{{query.file.property("show-tree") ? "show tree" : "hide tree"}}';

        const queryContext = makeQueryContext(tasksFile);
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
    unknownField is not defined

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

    it('should not treat absent property values as string, but report the error ', () => {
        const rawString = '{{ query.file.property("non-existent")}}';

        const queryContext = makeQueryContext(tasksFile);

        expect(() => expandPlaceholders(rawString, queryContext)).toThrow(
            `There was an error expanding one or more placeholders.

The error message was:
    Invalid placeholder result 'null'.
    Check for missing file property in this expression:
        {{ query.file.property("non-existent")}}

The problem is in:
    {{ query.file.property("non-existent")}}`,
        );
    });
});

describe('ExpandTemplate with functions', () => {
    describe('Basic Functionality', () => {
        it('Simple property access', () => {
            const output = expandPlaceholders('Hello, {{name}}!', { name: 'World' });
            expect(output).toEqual('Hello, World!');
        });

        it('Valid function call', () => {
            const output = expandPlaceholders("Result: {{math.square('4')}}", {
                math: { square: (x: string) => parseInt(x) ** 2 },
            });
            expect(output).toEqual('Result: 16');
        });
    });

    describe('Complex Nested Paths', () => {
        it('Nested object function access', () => {
            const output = expandPlaceholders("Value: {{data.subData.func('arg')}}", {
                data: {
                    subData: {
                        func: (x: string) => `Result for ${x}`,
                    },
                },
            });
            expect(output).toEqual('Value: Result for arg');
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
            const output = expandPlaceholders('Version: {{sys.getVersion()}}', {
                sys: { getVersion: () => '1.0.0' },
            });
            expect(output).toEqual('Version: 1.0.0');
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

        it('Two function calls', () => {
            const output = expandPlaceholders("{{math.square('3')}} - and - {{math.square('5')}}", {
                math: { square: (x: string) => parseInt(x) ** 2 },
            });
            expect(output).toEqual('9 - and - 25');
        });
    });

    describe('More Supported Syntaxes', () => {
        it('Object property access using key syntax', () => {
            const result = expandPlaceholders("Valid: {{supported.func['key']}}", {
                supported: { func: { key: 'value' } },
            });
            expect(result).toEqual('Valid: value');
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
