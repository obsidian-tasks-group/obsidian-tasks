import { getSettings } from '../Config/Settings';
import type { IQuery } from '../IQuery';
import { QueryLayoutOptions } from '../Layout/QueryLayoutOptions';
import { TaskLayoutComponent, TaskLayoutOptions } from '../Layout/TaskLayoutOptions';
import { errorMessageForException } from '../lib/ExceptionTools';
import { logging } from '../lib/logging';
import { expandPlaceholders } from '../Scripting/ExpandPlaceholders';
import { makeQueryContext } from '../Scripting/QueryContext';
import type { Task } from '../Task/Task';
import { Explainer } from './Explain/Explainer';
import type { Filter } from './Filter/Filter';
import * as FilterParser from './FilterParser';
import type { Grouper } from './Group/Grouper';
import { TaskGroups } from './Group/TaskGroups';
import { QueryResult } from './QueryResult';
import { continueLines } from './Scanner';
import { SearchInfo } from './SearchInfo';
import { Sort } from './Sort/Sort';
import type { Sorter } from './Sort/Sorter';
import { Statement } from './Statement';

export class Query implements IQuery {
    /** Note: source is the raw source, before expanding any placeholders */
    public readonly source: string;
    public readonly filePath: string | undefined;

    private _limit: number | undefined = undefined;
    private _taskGroupLimit: number | undefined = undefined;
    private _taskLayoutOptions: TaskLayoutOptions = new TaskLayoutOptions();
    private _queryLayoutOptions: QueryLayoutOptions = new QueryLayoutOptions();
    private _filters: Filter[] = [];
    private _error: string | undefined = undefined;
    private _sorting: Sorter[] = [];
    private _grouping: Grouper[] = [];
    private _ignoreGlobalQuery: boolean = false;

    private readonly hideOptionsRegexp =
        /^(hide|show) (task count|backlink|priority|cancelled date|created date|start date|scheduled date|done date|due date|recurrence rule|edit button|postpone button|urgency|tags|depends on|id)/i;
    private readonly shortModeRegexp = /^short/i;
    private readonly fullModeRegexp = /^full/i;
    private readonly explainQueryRegexp = /^explain/i;
    private readonly ignoreGlobalQueryRegexp = /^ignore global query/i;

    logger = logging.getLogger('tasks.Query');
    // Used internally to uniquely log each query execution in the console.
    private _queryId: string = '';

    private readonly limitRegexp = /^limit (groups )?(to )?(\d+)( tasks?)?/i;

    private readonly commentRegexp = /^#.*/;

    constructor(source: string, path: string | undefined = undefined) {
        this._queryId = this.generateQueryId(10);

        this.source = source;
        this.filePath = path;

        this.debug(`Creating query: ${this.formatQueryForLogging()}`);

        continueLines(source).forEach((statement: Statement) => {
            const line = this.expandPlaceholders(statement, path);
            if (this.error !== undefined) {
                // There was an error expanding placeholders.
                return;
            }

            try {
                this.parseLine(line, statement);
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
        });
    }

    public get queryId(): string {
        return this._queryId;
    }

    private parseLine(line: string, statement: Statement) {
        switch (true) {
            case this.shortModeRegexp.test(line):
                this._queryLayoutOptions.shortMode = true;
                break;
            case this.fullModeRegexp.test(line):
                this._queryLayoutOptions.shortMode = false;
                break;
            case this.explainQueryRegexp.test(line):
                this._queryLayoutOptions.explainQuery = true;
                break;
            case this.ignoreGlobalQueryRegexp.test(line):
                this._ignoreGlobalQuery = true;
                break;
            case this.limitRegexp.test(line):
                this.parseLimit(line);
                break;
            case this.parseSortBy(line):
                break;
            case this.parseGroupBy(line):
                break;
            case this.hideOptionsRegexp.test(line):
                this.parseHideOptions(line);
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
        return `[${this.source.split('\n').join(' ; ')}]`;
    }

    private expandPlaceholders(statement: Statement, path: string | undefined) {
        const source = statement.anyContinuationLinesRemoved;
        if (source.includes('{{') && source.includes('}}')) {
            if (this.filePath === undefined) {
                this._error = `The query looks like it contains a placeholder, with "{{" and "}}"
but no file path has been supplied, so cannot expand placeholder values.
The query is:
${source}`;
                return source;
            }
        }

        // TODO Do not complain about any placeholder errors in comment lines
        // TODO Show the original and expanded text in explanations
        // TODO Give user error info if they try and put a string in a regex search
        let expandedSource: string = source;
        if (path) {
            const queryContext = makeQueryContext(path);
            try {
                expandedSource = expandPlaceholders(source, queryContext);
            } catch (error) {
                if (error instanceof Error) {
                    this._error = error.message;
                } else {
                    this._error = 'Internal error. expandPlaceholders() threw something other than Error.';
                }
                return source;
            }
        }

        // Save any expanded text back in to the statement:
        statement.recordExpandedPlaceholders(expandedSource);
        return expandedSource;
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
        return new Query(`${this.source}\n${q2.source}`, this.filePath);
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
        if (statement.allLinesIdentical()) {
            this._error = `${message}
Problem line: "${statement.rawInstruction}"`;
        } else {
            this._error = `${message}
Problem statement:
${statement.explainStatement('    ')}
`;
        }
    }

    public get ignoreGlobalQuery(): boolean {
        return this._ignoreGlobalQuery;
    }

    public applyQueryToTasks(tasks: Task[]): QueryResult {
        this.debug(`Executing query: ${this.formatQueryForLogging()}`);

        const searchInfo = new SearchInfo(this.filePath, tasks);
        try {
            this.filters.forEach((filter) => {
                tasks = tasks.filter((task) => filter.filterFunction(task, searchInfo));
            });

            const { debugSettings } = getSettings();
            const tasksSorted = debugSettings.ignoreSortInstructions ? tasks : Sort.by(this.sorting, tasks, searchInfo);
            const tasksSortedLimited = tasksSorted.slice(0, this.limit);

            const taskGroups = new TaskGroups(this.grouping, tasksSortedLimited, searchInfo);

            if (this._taskGroupLimit !== undefined) {
                taskGroups.applyTaskLimit(this._taskGroupLimit);
            }

            return new QueryResult(taskGroups, tasksSorted.length);
        } catch (e) {
            const description = 'Search failed';
            return QueryResult.fromError(errorMessageForException(description, e));
        }
    }

    private parseHideOptions(line: string): void {
        const hideOptionsMatch = line.match(this.hideOptionsRegexp);
        if (hideOptionsMatch !== null) {
            const hide = hideOptionsMatch[1].toLowerCase() === 'hide';
            const option = hideOptionsMatch[2].toLowerCase();

            switch (option) {
                case 'task count':
                    this._queryLayoutOptions.hideTaskCount = hide;
                    break;
                case 'backlink':
                    this._queryLayoutOptions.hideBacklinks = hide;
                    break;
                case 'postpone button':
                    this._queryLayoutOptions.hidePostponeButton = hide;
                    break;
                case 'priority':
                    this._taskLayoutOptions.setVisibility(TaskLayoutComponent.Priority, !hide);
                    break;
                case 'cancelled date':
                    this._taskLayoutOptions.setVisibility(TaskLayoutComponent.CancelledDate, !hide);
                    break;
                case 'created date':
                    this._taskLayoutOptions.setVisibility(TaskLayoutComponent.CreatedDate, !hide);
                    break;
                case 'start date':
                    this._taskLayoutOptions.setVisibility(TaskLayoutComponent.StartDate, !hide);
                    break;
                case 'scheduled date':
                    this._taskLayoutOptions.setVisibility(TaskLayoutComponent.ScheduledDate, !hide);
                    break;
                case 'due date':
                    this._taskLayoutOptions.setVisibility(TaskLayoutComponent.DueDate, !hide);
                    break;
                case 'done date':
                    this._taskLayoutOptions.setVisibility(TaskLayoutComponent.DoneDate, !hide);
                    break;
                case 'recurrence rule':
                    this._taskLayoutOptions.setVisibility(TaskLayoutComponent.RecurrenceRule, !hide);
                    break;
                case 'edit button':
                    this._queryLayoutOptions.hideEditButton = hide;
                    break;
                case 'urgency':
                    this._queryLayoutOptions.hideUrgency = hide;
                    break;
                case 'tags':
                    this._taskLayoutOptions.setTagsVisibility(!hide);
                    break;
                case 'id':
                    this._taskLayoutOptions.setVisibility(TaskLayoutComponent.Id, !hide);
                    break;
                case 'depends on':
                    this._taskLayoutOptions.setVisibility(TaskLayoutComponent.DependsOn, !hide);
                    break;
                default:
                    this.setError('do not understand hide/show option', new Statement(line, line));
            }
        }
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

    private parseSortBy(line: string): boolean {
        const sortingMaybe = FilterParser.parseSorter(line);
        if (sortingMaybe) {
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
     * @private
     */
    private parseGroupBy(line: string): boolean {
        const groupingMaybe = FilterParser.parseGrouper(line);
        if (groupingMaybe) {
            this._grouping.push(groupingMaybe);
            return true;
        }
        return false;
    }

    /**
     * Creates a unique ID for correlation of console logging.
     *
     * @private
     * @param {number} length
     * @return {*}  {string}
     * @memberof Query
     */
    private generateQueryId(length: number): string {
        const chars = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890';
        const randomArray = Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]);

        const randomString = randomArray.join('');
        return randomString;
    }

    public debug(message: string, objects?: any): void {
        this.logger.debugWithId(this._queryId, `"${this.filePath}": ${message}`, objects);
    }
}
