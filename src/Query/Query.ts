import { getSettings } from '../Config/Settings';
import type { IQuery } from '../IQuery';
import { QueryLayoutOptions, parseQueryShowHideOptions } from '../Layout/QueryLayoutOptions';
import { TaskLayoutOptions, parseTaskShowHideOptions } from '../Layout/TaskLayoutOptions';
import { errorMessageForException } from '../lib/ExceptionTools';
import { logging } from '../lib/logging';
import { expandPlaceholders } from '../Scripting/ExpandPlaceholders';
import { makeQueryContext } from '../Scripting/QueryContext';
import type { Task } from '../Task/Task';
import type { OptionalTasksFile } from '../Scripting/TasksFile';
import { unknownPresetErrorMessage } from './Presets/Presets';
import { Explainer } from './Explain/Explainer';
import type { Filter } from './Filter/Filter';
import * as FilterParser from './FilterParser';
import type { Grouper } from './Group/Grouper';
import { TaskGroups } from './Group/TaskGroups';
import { QueryResult } from './QueryResult';
import { continueLines, splitSourceHonouringLineContinuations } from './Scanner';
import { SearchInfo } from './SearchInfo';
import { Sort } from './Sort/Sort';
import type { Sorter } from './Sort/Sorter';
import { Statement } from './Statement';

let queryInstanceCounter = 0;

export class Query implements IQuery {
    /** Note: source is the raw source, before expanding any placeholders */
    public readonly source: string;

    /** statements contain each source line after processing continuations and placeholders.
     * There may be more statements than lines in the source, if any multi-line query file property values were used. */
    public readonly statements: Statement[] = [];

    public readonly tasksFile: OptionalTasksFile;

    private _limit: number | undefined = undefined;
    private _taskGroupLimit: number | undefined = undefined;

    private readonly _taskLayoutOptions: TaskLayoutOptions = new TaskLayoutOptions();
    private readonly _queryLayoutOptions: QueryLayoutOptions = new QueryLayoutOptions();
    public readonly layoutStatements: Statement[] = [];

    private readonly _filters: Filter[] = [];
    private _error: string | undefined = undefined;
    private readonly _sorting: Sorter[] = [];
    private readonly _grouping: Grouper[] = [];
    private _ignoreGlobalQuery: boolean = false;

    private readonly hideOptionsRegexp = /^(hide|show) +(.*)/i;
    private readonly shortModeRegexp = /^short/i;
    private readonly fullModeRegexp = /^full/i;
    private readonly explainQueryRegexp = /^explain/i;
    private readonly ignoreGlobalQueryRegexp = /^ignore global query/i;

    logger = logging.getLogger('tasks.Query');
    // Used internally to uniquely log each query execution in the console.
    private readonly _queryId: string;

    private readonly limitRegexp = /^limit (groups )?(to )?(\d+)( tasks?)?/i;

    private readonly commentRegexp = /^#.*/;
    private readonly presetRegexp = /^preset +(.*)/i;

    constructor(source: string, tasksFile: OptionalTasksFile = undefined) {
        this._queryId = this.generateQueryId(10);

        this.source = source;
        this.tasksFile = tasksFile;

        const anyContinuationLinesRemoved = continueLines(source);

        for (const statement of anyContinuationLinesRemoved) {
            const expandedStatements = this.expandPlaceholders(statement, tasksFile);
            if (this.error !== undefined) {
                // There was an error expanding placeholders.
                return;
            }
            this.statements.push(...expandedStatements);
        }

        for (const statement of this.statements) {
            try {
                this.parseLine(statement);
                if (this.error !== undefined) {
                    return;
                }
            } catch (e) {
                let message;
                if (e instanceof Error) {
                    message = e.message;
                } else {
                    message = 'Unknown error';
                }

                this.setError(message, statement);
                return;
            }
        }
    }

    /**
     * Remove any instructions that are not valid for Global Queries:
     */
    public removeIllegalGlobalQueryInstructions() {
        // It does not make sense to use 'ignore global query'
        // in global queries: the value is ignored, and it would be confusing
        // for 'explain' output to report that it had been supplied:
        this._ignoreGlobalQuery = false;
    }

    public get filePath(): string | undefined {
        return this.tasksFile?.path ?? undefined;
    }

    public get queryId(): string {
        return this._queryId;
    }

    private parseLine(statement: Statement) {
        const line = statement.anyPlaceholdersExpanded;
        switch (true) {
            case this.presetRegexp.test(line):
                this.parsePreset(line, statement);
                break;
            case this.shortModeRegexp.test(line):
                this._queryLayoutOptions.shortMode = true;
                this.saveLayoutStatement(statement);
                break;
            case this.fullModeRegexp.test(line):
                this._queryLayoutOptions.shortMode = false;
                this.saveLayoutStatement(statement);
                break;
            case this.explainQueryRegexp.test(line):
                this._queryLayoutOptions.explainQuery = true;
                // We intentionally do not explain the 'explain' statement, as it clutters up documentation.
                break;
            case this.ignoreGlobalQueryRegexp.test(line):
                this._ignoreGlobalQuery = true;
                break;
            case this.limitRegexp.test(line):
                this.parseLimit(line);
                break;
            case this.parseSortBy(line, statement):
                break;
            case this.parseGroupBy(line, statement):
                break;
            case this.hideOptionsRegexp.test(line):
                this.parseHideOptions(statement);
                break;
            case this.commentRegexp.test(line):
                // Comment lines are ignored
                break;
            case this.parseFilter(line, statement):
                break;
            default:
                this.setError('do not understand query', statement);
        }
    }

    private formatQueryForLogging() {
        return `
>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
${this.source}
<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
`;
    }

    private expandPlaceholders(statement: Statement, tasksFile: OptionalTasksFile): Statement[] {
        const source = statement.anyContinuationLinesRemoved;
        if (source.includes('{{') && source.includes('}}')) {
            if (this.tasksFile === undefined) {
                this._error = `The query looks like it contains a placeholder, with "{{" and "}}"
but no file path has been supplied, so cannot expand placeholder values.
The query is:
${source}`;
                return [statement];
            }
        }

        const isAComment = this.commentRegexp.test(source);
        if (isAComment) {
            // If it's a comment, we return the line un-changed, to avoid:
            // 1. pointless error messages for any harmless unknown placeholders,
            // 2. accidentally processing the second-and-subsequent lines of multi-line placeholders.
            return [statement];
        }

        // TODO Give user error info if they try and put a string in a regex search
        let expandedSource: string = source;
        if (tasksFile) {
            const queryContext = makeQueryContext(tasksFile);
            let previousExpandedSource: string = '';
            try {
                // Keep expanding placeholders until no more changes occur or max iterations reached.
                const maxIterations = 10; // Prevent infinite loops if there are any circular references.
                let iterations = 0;

                while (expandedSource !== previousExpandedSource && iterations < maxIterations) {
                    previousExpandedSource = expandedSource;
                    expandedSource = expandPlaceholders(previousExpandedSource, queryContext);
                    iterations++;
                }

                if (expandedSource !== source) {
                    expandedSource = continueLines(expandedSource)
                        .map((statement) => statement.anyContinuationLinesRemoved)
                        .join('\n');
                }
            } catch (error) {
                if (error instanceof Error) {
                    this._error = error.message;
                } else {
                    this._error = 'Internal error. expandPlaceholders() threw something other than Error.';
                }
                return [statement];
            }
        }

        return this.createStatementsFromExpandedPlaceholders(expandedSource, statement);
    }

    private createStatementsFromExpandedPlaceholders(expandedSource: string, statement: Statement) {
        // Trim and filter empty lines in one step.
        const expandedSourceLines = expandedSource
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line.length > 0);

        if (expandedSourceLines.length === 1) {
            // Save the single expanded line back into the statement.
            statement.recordExpandedPlaceholders(expandedSourceLines[0]);
            return [statement];
        }

        // Handle multiple-line placeholders.
        return expandedSourceLines.map((expandedSourceLine, index) => {
            const counter = `: statement ${index + 1} after expansion of placeholder`;
            const newStatement = new Statement(
                statement.rawInstruction + counter,
                statement.anyContinuationLinesRemoved + counter,
            );
            newStatement.recordExpandedPlaceholders(expandedSourceLine);
            return newStatement;
        });
    }

    /**
     *
     * Appends {@link q2} to this query.
     *
     * @note At time of writing, this query language appears to play nicely with combining queries.
     *
     * More formally, the concatenation operation on the query language:
     *     * Is closed (concatenating two queries is another valid query)
     *     * Is not commutative (q1.append(q2) !== q2.append(q1))
     *
     * And the semantics of the combination are straight forward:
     *     * Combining two queries appends their filters
     *           (assuming that the filters are pure functions, filter concatenation is commutative)
     *     * Combining two queries appends their sorting instructions. (this is not commutative)
     *     * Combining two queries appends their grouping instructions. (this is not commutative)
     *     * Successive limit instructions overwrite previous ones.
     *
     * @param {Query} q2
     * @return {Query} The combined query
     */
    public append(q2: Query): Query {
        if (this.source === '') return q2;
        if (q2.source === '') return this;
        return new Query(`${this.source}\n${q2.source}`, this.tasksFile);
    }

    /**
     * Generate a text description of the contents of this query.
     *
     * This does not show any global filter and global query.
     * Use {@link explainResults} if you want to see any global query and global filter as well.
     */
    public explainQuery(): string {
        const explainer = new Explainer();
        return explainer.explainQuery(this);
    }

    public get limit(): number | undefined {
        return this._limit;
    }

    public get taskGroupLimit(): number | undefined {
        return this._taskGroupLimit;
    }

    get taskLayoutOptions(): TaskLayoutOptions {
        return this._taskLayoutOptions;
    }

    public get queryLayoutOptions(): QueryLayoutOptions {
        return this._queryLayoutOptions;
    }

    public get filters(): Filter[] {
        return this._filters;
    }

    /**
     * Add a new filter to this Query.
     *
     * At the time of writing, it is intended to allow tests to create filters
     * programatically, for things that can not yet be done via 'filter by function'.
     * @param filter
     */
    public addFilter(filter: Filter) {
        this._filters.push(filter);
    }

    public get sorting() {
        return this._sorting;
    }

    /**
     * Return the {@link Grouper} objects that represent any `group by` instructions in the tasks block.
     */
    public get grouping(): Grouper[] {
        return this._grouping;
    }

    public get error(): string | undefined {
        return this._error;
    }

    private setError(message: string, statement: Statement) {
        this._error = Query.generateErrorMessage(statement, message);
    }

    private static generateErrorMessage(statement: Statement, message: string) {
        if (statement.allLinesIdentical()) {
            return `${message}
Problem line: "${statement.rawInstruction}"`;
        } else {
            return `${message}
Problem statement:
${statement.explainStatement('    ')}
`;
        }
    }

    public get ignoreGlobalQuery(): boolean {
        return this._ignoreGlobalQuery;
    }

    public applyQueryToTasks(tasks: Task[]): QueryResult {
        this.debug(`[search] Executing query: ${this.formatQueryForLogging()}`);

        const searchInfo = new SearchInfo(this.tasksFile, tasks);

        // Custom filter (filter by function) does not report the instruction line in any exceptions,
        // for performance reasons. So we keep track of it here.
        let possiblyBrokenStatement: Statement | undefined = undefined;
        try {
            this.filters.forEach((filter) => {
                possiblyBrokenStatement = filter.statement;
                tasks = tasks.filter((task) => filter.filterFunction(task, searchInfo));
            });
            possiblyBrokenStatement = undefined;

            const { debugSettings } = getSettings();
            const tasksSorted = debugSettings.ignoreSortInstructions ? tasks : Sort.by(this.sorting, tasks, searchInfo);
            const tasksSortedLimited = tasksSorted.slice(0, this.limit);

            const taskGroups = new TaskGroups(this.grouping, tasksSortedLimited, searchInfo);

            if (this._taskGroupLimit !== undefined) {
                taskGroups.applyTaskLimit(this._taskGroupLimit);
            }

            return new QueryResult(taskGroups, tasksSorted.length, this.tasksFile);
        } catch (e) {
            const description = 'Search failed';
            let message = errorMessageForException(description, e);

            if (possiblyBrokenStatement) {
                message = Query.generateErrorMessage(possiblyBrokenStatement, message);
            }
            return QueryResult.fromError(message);
        }
    }

    private parseHideOptions(statement: Statement): void {
        const line = statement.anyPlaceholdersExpanded;
        const hideOptionsMatch = line.match(this.hideOptionsRegexp);
        if (hideOptionsMatch === null) {
            return;
        }
        const hide = hideOptionsMatch[1].toLowerCase() === 'hide';
        const option = hideOptionsMatch[2].toLowerCase();

        if (parseQueryShowHideOptions(this._queryLayoutOptions, option, hide)) {
            this.saveLayoutStatement(statement);
            return;
        }
        if (parseTaskShowHideOptions(this._taskLayoutOptions, option, !hide)) {
            this.saveLayoutStatement(statement);
            return;
        }
        this.setError('do not understand hide/show option', new Statement(line, line));
    }

    private saveLayoutStatement(statement: Statement) {
        this.layoutStatements.push(statement);
    }

    private parseFilter(line: string, statement: Statement) {
        const filterOrError = FilterParser.parseFilter(line);
        if (filterOrError != null) {
            if (filterOrError.filter) {
                // Overwrite the filter's statement, to preserve details of any
                // continuation lines and placeholder expansions.
                filterOrError.filter.setStatement(statement);

                this._filters.push(filterOrError.filter);
            } else {
                this.setError(filterOrError.error ?? 'Unknown error', statement);
            }
            return true;
        }
        return false;
    }

    private parseLimit(line: string): void {
        const limitMatch = line.match(this.limitRegexp);
        if (limitMatch === null) {
            this.setError('do not understand query limit', new Statement(line, line));
            return;
        }

        // limitMatch[3] is per regex always digits and therefore parsable.
        const limitFromLine = Number.parseInt(limitMatch[3], 10);

        if (limitMatch[1] !== undefined) {
            this._taskGroupLimit = limitFromLine;
        } else {
            this._limit = limitFromLine;
        }
    }

    private parseSortBy(line: string, statement: Statement): boolean {
        const sortingMaybe = FilterParser.parseSorter(line);
        if (sortingMaybe) {
            sortingMaybe.setStatement(statement);
            this._sorting.push(sortingMaybe);
            return true;
        }
        return false;
    }

    /**
     * Parsing of `group by` lines, for grouping that is implemented in the {@link Field}
     * classes.
     *
     * @param line
     * @param statement
     * @private
     */
    private parseGroupBy(line: string, statement: Statement): boolean {
        const groupingMaybe = FilterParser.parseGrouper(line);
        if (groupingMaybe) {
            groupingMaybe.setStatement(statement);
            this._grouping.push(groupingMaybe);
            return true;
        }
        return false;
    }

    private parsePreset(line: string, statement: Statement) {
        const preset = this.presetRegexp.exec(line);
        if (preset) {
            const presetName = preset[1].trim();
            const { presets } = getSettings();
            const presetValue = presets[presetName];
            if (!presetValue) {
                this.setError(unknownPresetErrorMessage(presetName, presets), statement);
                return;
            }

            // Process the preset text with placeholder expansion
            const instructions = splitSourceHonouringLineContinuations(presetValue);
            for (const instruction of instructions) {
                const newStatement = new Statement(statement.rawInstruction, statement.anyContinuationLinesRemoved);
                newStatement.recordExpandedPlaceholders(instruction);

                // Apply placeholder expansion again if needed
                if (instruction.includes('{{') && instruction.includes('}}') && this.tasksFile) {
                    const queryContext = makeQueryContext(this.tasksFile);
                    const expandedInstruction = expandPlaceholders(instruction, queryContext);
                    newStatement.recordExpandedPlaceholders(expandedInstruction);
                }

                this.parseLine(newStatement);
            }
        }
    }

    /**
     * Creates a unique ID for correlation of console logging.
     *
     * @private
     * @param {number} length
     * @return {*}  {string}
     */
    private generateQueryId(length: number): string {
        queryInstanceCounter += 1;
        return queryInstanceCounter.toString().padStart(length, '0');
    }

    public debug(message: string, objects?: any): void {
        this.logger.debugWithId(this._queryId, `"${this.filePath}": ${message}`, objects);
    }

    public warn(message: string, objects?: any): void {
        this.logger.warnWithId(this._queryId, `"${this.filePath}": ${message}`, objects);
    }
}
