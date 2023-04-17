import alasql from 'alasql';

import { Task } from '../Task';
import type { IQuery } from '../IQuery';
import { Group } from '../Query/Group';
import { logging } from '../lib/logging';
import { isFeatureEnabled } from '../Config/Settings';
import type { Grouper } from '../Query/Grouper';
import { LayoutOptions } from '../TaskLayout';
import type { TaskGroups } from '../Query/TaskGroups';
import { GlobalFilter } from '../Config/GlobalFilter';
import type { Status } from '../Status';
import { StatusType } from '../StatusConfiguration';

export type GroupingProperty = 'backlink' | 'filename' | 'folder' | 'heading' | 'path' | 'status';
export type Grouping = { property: GroupingProperty };

export class QuerySql implements IQuery {
    public source: string;
    public name: string;

    // @ts-ignore
    private _sourcePath: string;
    // @ts-ignore
    private _frontmatter: any | null | undefined;

    private _layoutOptions: LayoutOptions = new LayoutOptions();

    private _error: string | undefined = undefined;
    // private _groupingPossible: boolean = false;
    // private _groupByFields: [string, string][] = [];
    private _rawMode: boolean = false;
    private _rawWithTasksMode: boolean = false;
    private _multilineQueryMode: boolean = false;
    private _rawResults: any;

    logger = logging.getLogger('tasks.QuerySql');

    // Directives
    // These are used to control the settings of the query and task output.
    private _commentRegexp = /^#.*/;
    private _commentReplacementRegexp = /(^#.*$(\r\n|\r|\n)?)/gm;
    private _customJSRegexp = /^customjs (.*) (.*)/;
    private _customTemplateRegexp = /^template (.*)/;
    private _multilineQueryRegexp = /^(multiline|ml)/;
    private _rawQuery = /^raw (empty|tasks)/;
    private _shortModeRegexp = /^short/;

    // Pending a future PR to enable Custom JS again.
    private _customJsClasses: Array<[string, string]>;
    private _customTemplate: string = '';

    // Used internally to uniquely log each query execution in the console.
    private _queryId: string = '';

    // Enables the direct querying of Tasks and skips the translation to the
    // simpler TaskRecord.
    private _enableDirectTaskQueries: boolean = true;

    /**
     * This prefix is added to any query unless #raw empty is used.
     *
     * @private
     * @memberof QuerySql
     */
    private readonly defaultQueryPrefix = 'SELECT * FROM ?';

    /**
     * Creates an instance of QuerySql.
     * @param {({
     *         source: string;
     *         sourcePath: string;
     *         frontmatter: any | null | undefined;
     *     })} {
     *         source,
     *         sourcePath,
     *         frontmatter
     *     } - This is a collection of the source query, the path to the source query, and the frontmatter.
     * @memberof QuerySql
     */
    constructor({
        source,
        sourcePath,
        frontmatter,
    }: {
        source: string;
        sourcePath: string;
        frontmatter: any | null | undefined;
    }) {
        this.name = 'QuerySql';
        this._queryId = this.generateQueryId(10);

        this._sourcePath = sourcePath;
        this._frontmatter = frontmatter;
        this.logger.debugWithId(this._queryId, 'Source Path', this._sourcePath);
        this.logger.debugWithId(this._queryId, 'Source Front Matter', this._frontmatter);

        // Pending a future PR to enable Custom JS again.
        this._customJsClasses = [];

        // Process the query to pull out directives and comments.
        this.processDirectivesAndComments(source);

        // Remove all the comments from the query.
        this.source = source.replace(this._commentReplacementRegexp, '').trim();
        this.logger.infoWithId(this._queryId, 'Source Query', this.source);

        // If this is multiline then only the last query should have the prefix.
        if (this._multilineQueryMode) {
            this.setPrefixForMultilineQuery();
        } else {
            if (!this.source.includes('SELECT')) {
                this.source = `${this.defaultQueryPrefix} ${this.source}`;
            }
        }

        // Exit out if raw with no set table to query. This is '#raw empty'.
        if (this._rawMode && !this._rawWithTasksMode) {
            this.logger.debugWithId(this._queryId, 'RAW mode without tasks as data source');
            return;
        }

        // If there is a group by clause, then we can do grouping later on, no need to
        // use the existing filters in current grouping classes.
        // if (/(^|\s)GROUP BY*/gim.test(this.source)) {
        //     this._groupingPossible = true;
        // }
        // this.logger.debugWithId(this._queryId, 'Grouping Possible', this._groupingPossible);

        // const sqlTokens = this.source.match(/[^\s,;]+|;/gi);

        // if (this._groupingPossible && sqlTokens !== null) {
        //     this.parseGroupingDetails(sqlTokens);
        // }
    }

    /**
     * This function returns an empty array of type Grouper.
     *
     * @readonly
     * @type {Grouper[]} - An empty array of type `Grouper[]`
     * @memberof QuerySql
     */
    public get grouping(): Grouper[] {
        return new Array<Grouper>();
        // return this._grouping;
    }

    /**
     * Returns the error message if any errors occur. It is 'undefined' if no errors.
     *
     * @readonly
     * @type {(string | undefined)}
     * @memberof QuerySql
     */
    public get error(): string | undefined {
        return this._error;
    }

    /**
     * The ID of this query execution.
     *
     * @readonly
     * @type {(string | undefined)}
     * @memberof QuerySql
     */
    public get queryId(): string | undefined {
        return this._queryId;
    }

    /**
     * The custom template. Pending future PR.
     *
     * @readonly
     * @type {(string | undefined)}
     * @memberof QuerySql
     */
    public get template(): string | undefined {
        return this._customTemplate;
    }

    /**
     * The layout options for this query.
     *
     * @readonly
     * @type {LayoutOptions}
     * @memberof QuerySql
     */
    public get layoutOptions(): LayoutOptions {
        return this._layoutOptions;
    }

    /**
     * Contains the raw results of query if #raw empty is used.
     *
     * @readonly
     * @type {*}
     * @memberof QuerySql
     */
    public get rawResults(): any {
        return this._rawResults;
    }

    /**
     * Returns true if using 'Task' as the data source
     *
     * @type {boolean}
     * @memberof QuerySql
     */
    public get enableDirectTaskQueries(): boolean {
        return this._enableDirectTaskQueries;
    }

    /**
     * Enables the processing to be toggled between 'Task[]' and 'TaskRecord[]'
     *
     * @memberof QuerySql
     */
    public set enableDirectTaskQueries(value: boolean) {
        this._enableDirectTaskQueries = value;
    }

    /**
     * This will run the SQL query against the collection of tasks and
     * will return the tasks that match the query.
     *
     * @param {Task[]} tasks
     * @return {*}  {Task[]}
     * @memberof QuerySql
     */
    public queryTasks(tasks: Task[]): Task[] {
        this.logger.infoWithId(this._queryId, `Executing query: [${this.source}]`);
        const currentQuery = this;

        /*
         * As we are using alaSQL we can take advantage of a in memory cache. The pagedata
         * table contains the source path for the executing code block when rendered. This
         * allows the code block to reference the page it is being rendered on and access
         * the page meta data for more complex queries.
         */
        // if (alasql('SHOW TABLES FROM alasql LIKE "pagedata"').length == 0) {
        //     alasql('CREATE TABLE pagedata (name STRING, keyvalue STRING)');
        // }

        // if (alasql(`SELECT keyvalue FROM pagedata WHERE name = "sourcePath${this._queryId}"`).length == 0) {
        //     alasql(`INSERT INTO pagedata VALUES ('sourcePath${this._queryId}','${this._sourcePath.replace("'", "''")}')`);
        // }

        // Set moment() function available to AlaSQL.
        alasql.fn.moment = window.moment;

        // Return details about the note the query is running on.
        alasql.fn.notePathWithFileExtension = function () {
            return currentQuery._sourcePath;
        };

        alasql.fn.notePath = function () {
            return currentQuery._sourcePath.split('/').slice(0, -1).join('/');
        };

        alasql.fn.noteFileName = function () {
            return currentQuery._sourcePath.split('/').slice(-1)[0].split('.')[0];
        };

        // Return details about the note the query is running on.
        alasql.fn.pageProperty = function (field: string) {
            return currentQuery._frontmatter[field];
        };

        // To make the process of querying by status type simpler
        // these functions can help filter by different properties
        // of the status object.
        alasql.fn.isToDo = function (status: Status) {
            return status.type == StatusType.TODO;
        };

        alasql.fn.isDone = function (status: Status) {
            return status.type == StatusType.DONE;
        };

        alasql.fn.isInProgress = function (status: Status) {
            return status.type == StatusType.IN_PROGRESS;
        };

        alasql.fn.isCancelled = function (status: Status) {
            return status.type == StatusType.CANCELLED;
        };

        alasql.fn.isNonTask = function (status: Status) {
            return status.type == StatusType.NON_TASK;
        };

        // The status type has filtering based on a number and not
        // the string value of the status. This function allows that
        // to be replicated in the SQL Query.
        alasql.fn.statusTypeOrdering = function (status: Status) {
            let prefix: string;
            // Add a numeric prefix to sort in to a meaningful order for users
            switch (status.type) {
                case StatusType.IN_PROGRESS:
                    prefix = '1';
                    break;
                case StatusType.TODO:
                    prefix = '2';
                    break;
                case StatusType.DONE:
                    prefix = '3';
                    break;
                case StatusType.CANCELLED:
                    prefix = '4';
                    break;
                case StatusType.NON_TASK:
                    prefix = '5';
                    break;
                case StatusType.EMPTY:
                    prefix = '6';
                    break;
            }
            return prefix + ' ' + status.type;
        };

        // In the current Query engine when sorting or filtering on the description it
        // strips the markdown from the string. This allows the same process to happen.
        const globalFilter = GlobalFilter.get();
        alasql.fn.removeMarkdown = function (field) {
            field = field.replace(globalFilter, '').trim();

            const startsWithLinkRegex = /^\[\[?([^\]]*)]]?/;
            const linkRegexMatch = field.match(startsWithLinkRegex);
            if (linkRegexMatch !== null) {
                const innerLinkText = linkRegexMatch[1];
                // For a link, we have to check whether it has another visible name set.
                // For example `[[this is the link|but this is actually shown]]`.
                field =
                    innerLinkText.substring(innerLinkText.indexOf('|') + 1) + field.replace(startsWithLinkRegex, '');
            }

            const markdownRegularExpressions = [
                /^\*\*([^*]+)\*\*/,
                /^\*([^*]+)\*/,
                /^==([^=]+)==/,
                /^__([^_]+)__/,
                /^_([^_]+)_/,
            ];

            markdownRegularExpressions.forEach((markdownPattern) => {
                if (field.match(markdownPattern) !== null) {
                    field = field.match(markdownPattern)[1] + field.replace(markdownPattern, '');
                    console.log(field);
                }
            });
            return field;
        };

        // Needs integration with customJS, will be readded in later revision.
        // this._customJsClasses.forEach((element) => {
        //     alasql.fn[element[1]] = window.customJS[element[0]][element[1]];
        // });

        // Allows user to add debugMe() to the query to break into the debugger.
        // Example: WHERE debugMe()
        alasql.fn.debugMe = function () {
            // eslint-disable-next-line no-debugger
            debugger;
        };

        // Needs access to the metadata cache of Obsidian to get page data from front matter to use in query,
        // will be readded in later revision.
        // alasql.fn.queryBlockFile = function () {
        //     const result = alasql(`SELECT keyvalue FROM pagedata WHERE name = "sourcePath${this._queryId}"`);
        //     if (result.length == 1) {
        //         const fileCache = TasksServices.obsidianApp.metadataCache.getCache(result[0].keyvalue);

        //         return {
        //             frontmatter: fileCache?.frontmatter,
        //             tags: fileCache?.tags,
        //             path: result[0].keyvalue,
        //             basename: result[0].keyvalue.split('/').slice(-1)[0].split('.')[0],
        //         };
        //     }

        //     return {
        //         frontmatter: null,
        //         tags: [],
        //         path: result[0].keyvalue,
        //         basename: result[0].keyvalue.split('/').slice(-1)[0].split('.')[0],
        //     };
        // };

        // Return the ID of this query used for debugging as needed.
        alasql.fn.queryId = function () {
            return currentQuery._queryId;
        };

        alasql.options.nocount = true; // Disable row count for queries.

        // If the '# raw' command is added to the query then we will return the raw
        // query results, allows more advanced based query results. The information
        // is returned to the console currently. Independent rendering is a TBD.
        if (this._rawMode && !this._rawWithTasksMode) {
            let rawResult;

            // This query will use tasks to query against.
            try {
                if (this._multilineQueryMode) {
                    rawResult = alasql(this.source).slice(-1)[0];
                } else {
                    rawResult = alasql(this.source);
                }
            } catch (error) {
                this._error = `Error with query: ${error}`;
                this.logger.errorWithId(this._queryId, 'Error with query', error);
            }
            this.logger.infoWithId(this._queryId, 'RAW SQL Query Results:', rawResult);
            this._rawResults = rawResult;

            // Return a empty array of Tasks as output is on console.
            rawResult = new Array<Task>();
            this._error = 'To view results please open the console.';

            return rawResult.map((task) => {
                return new Task({ ...task });
            });
        }

        // Direct tasks uses the Task object and not TaskRecord so less conversion/overhead.
        // This does make the object slightly more complex than the flattened version, updates
        // to the Task object to expose get properties would help here and possibly in the
        // filters for consistency.
        // Further perf options are to have a database in memory with all the tasks in it and
        // then update the db on a change event like the current cache with references to the
        // tasks.
        // By default direct should be used as it is faster.
        let queryResult: Task[];

        try {
            if (this._multilineQueryMode) {
                queryResult = alasql(this.source, [tasks]).slice(-1)[0];
            } else {
                queryResult = alasql(this.source, [tasks]);
            }
        } catch (error) {
            this._error = `Error with query: ${error}`;
            this.logger.errorWithId(this._queryId, 'Error with query', error);
            queryResult = new Array<Task>();
        }
        if (this._rawMode && this._rawWithTasksMode) {
            this.logger.infoWithId(this._queryId, 'RAW SQL Query Results with Tasks as data:', queryResult);
        }
        this.logger.debugWithId(this._queryId, `queryResult: ${queryResult.length}`, queryResult);
        return queryResult.map((task) => {
            return new Task({ ...task });
        });
    }

    /**
     * This is the public entry point for the tasks rendering, it will
     * call the internal function to get tasks and then handle the
     * update of the grouping so groups will render correctly.
     *
     * @param {Task[]} tasks
     * @return {*}  {TaskGroups}
     * @memberof QuerySql
     */
    public applyQueryToTasks(tasks: Task[]): TaskGroups {
        const queryResult: Task[] = this.queryTasks(tasks) as Task[];

        // Group is work in progress, the result of the query is a grouped
        // tree but the group logic used in tasks is more focused on a
        // static set of queries and not dynamic so hit and miss for
        // now.
        // if (this._groupingPossible) {
        //     // There may be sub groups in the returned data. This would be
        //     // array -> <any>(somefield: value, array -> TaskRecord[])
        //     // interface GroupedResult {
        //     //     status: number;
        //     //     tasks: Array<User>;
        //     //   }
        //     const parentGroups: any[] = queryResult;
        //     const renderedGroups: TaskGroup[] = new Array<TaskGroup>();

        //     for (const group of parentGroups) {
        //         const currentGroup: [string, any][] = group;
        //         const groupByFieldName = <string>Object.entries(currentGroup)[0][0];
        //         const groupByFieldValue = <string>Object.entries(currentGroup)[0][1];
        //         let foundTasks: Task[];

        //         if (this._enableDirectTaskQueries) {
        //             const groupByFieldTasks = <Task[]>Object.entries(currentGroup)[1][1];
        //             this.logger.infoWithId(
        //                 this._queryId,
        //                 `groupByFieldName: ${groupByFieldName} groupByFieldValue: ${groupByFieldValue} groupByFieldTasks ${groupByFieldTasks}`,
        //                 queryResult,
        //             );
        //             foundTasks = groupByFieldTasks.map((task) => {
        //                 return new Task({ ...task });
        //             });
        //         } else {
        //             const groupByFieldTasks = <TaskRecord[]>Object.entries(currentGroup)[1][1];
        //             this.logger.infoWithId(
        //                 this._queryId,
        //                 `groupByFieldName: ${groupByFieldName} groupByFieldValue: ${groupByFieldValue} groupByFieldTasks ${groupByFieldTasks}`,
        //                 queryResult,
        //             );
        //             foundTasks = groupByFieldTasks.map((task) => {
        //                 return QuerySql.fromTaskRecord(task);
        //             });
        //         }

        //         renderedGroups.push(
        //             new TaskGroup([groupByFieldName], [new GroupHeading(1, groupByFieldValue)], foundTasks),
        //         );
        //     }

        //     const preGrouped = new TaskGroups([], []);
        //     preGrouped.groups = renderedGroups;
        //     return preGrouped;
        // } else {
        return Group.by(this.grouping, queryResult as Task[]);
        // }
    }

    public explainQuery(): string {
        return 'Explanation of this Tasks SQL code block query:\n\n';
    }

    /**
     * Processes all the lines in the query for directives and comments
     *
     * @private
     * @param {string} source
     * @memberof QuerySql
     */
    private processDirectivesAndComments(source: string) {
        source
            .split('\n')
            .map((line: string) => line.trim())
            .forEach((line: string) => {
                this.logger.debugWithId(this._queryId, 'Line to process:', line);
                switch (true) {
                    case line === '':
                        break;
                    case this._commentRegexp.test(line):
                        this.processQueryDirectivesAndComments(line);
                        break;
                }
            });
    }

    /**
     * For a multiline query break it up into an array and set prefix on last query.
     *
     * @private
     * @return {void}
     * @memberof QuerySql
     */
    private setPrefixForMultilineQuery(): void {
        const multilineQuery = this.source
            .split(';')
            .filter((element) => element)
            .map((line: string) => line.trim());

        const lastQuery: string = multilineQuery[multilineQuery.length - 1];
        // Add the select prefix to the last query only.
        if (!lastQuery.includes('SELECT')) {
            multilineQuery[multilineQuery.length - 1] = `${this.defaultQueryPrefix} ${
                multilineQuery[multilineQuery.length - 1]
            }`;
        }
        this.source = multilineQuery.join(';');
    }

    /**
     * Look for the GROUP BY clause and setup processing to handle it.
     *
     * @private
     * @param {RegExpMatchArray} sqlTokens
     * @memberof QuerySql
     */
    // private parseGroupingDetails(sqlTokens: RegExpMatchArray) {
    //     try {
    //         for (let index = 0; index < sqlTokens.length; index++) {
    //             // Find 'GROUP BY'
    //             if (sqlTokens[index] === 'GROUP' && sqlTokens[index + 1] === 'BY') {
    //                 // If using a property in a object use the value before the ->.
    //                 if (sqlTokens[index + 2].contains('->')) {
    //                     this._groupByFields.push([sqlTokens[index + 2].split('->')[0], sqlTokens[index + 2]]);
    //                 } else {
    //                     this._groupByFields.push([sqlTokens[index + 2], sqlTokens[index + 2]]);
    //                 }
    //             }
    //         }
    //         if (this._groupByFields.length > 0) {
    //             this.source = `SELECT ${this._groupByFields[0][1]} AS ${this._groupByFields[0][0]}, ARRAY(_) AS tasks FROM ? ${this.source}`;
    //         } else {
    //             this.source = `${this.defaultQueryPrefix} ${this.source}`;
    //         }
    //     } catch (error) {
    //         this._error = `Unable to parse group statement from ${this.source}`;
    //         this.logger.errorWithId(this._queryId, 'Unable to parse group statement.', this.source);
    //     }
    // }

    /**
     * This function processes query directives and comments in a given line of
     * code.
     *
     * @private
     * @param {string} line - A string representing a line of code that may
     * contain directives or comments.
     * @memberof QuerySql
     */
    private processQueryDirectivesAndComments(line: string): void {
        const directive = line.slice(1).trim();
        switch (true) {
            case this._shortModeRegexp.test(directive):
                this._layoutOptions.shortMode = true;
                break;
            case LayoutOptions.hideOptionsRegexp.test(directive):
                this.parseHideOptions({ line: directive });
                break;
            case this._rawQuery.test(directive):
                this.parseRawOptions(directive);
                break;
            case this._multilineQueryRegexp.test(directive):
                this.parseMultilineOptions(directive);
                break;
            case this._customJSRegexp.test(directive):
                this.parseCustomJSPluginOptions(directive);
                break;
            case this._customTemplateRegexp.test(directive):
                this.parseCustomTemplateOptions(directive);
                break;
        }
    }

    /**
     * Search for #template <template>. Functionality is pending future PR.
     *
     * @private
     * @param {string} directive - The string minus the # symbol to process.
     * @memberof QuerySql
     */
    private parseCustomTemplateOptions(directive: string) {
        if (isFeatureEnabled('ENABLE_INLINE_TEMPLATE')) {
            const customTemplate = directive.match(this._customTemplateRegexp);
            if (customTemplate !== null && customTemplate[1].trim() !== '') {
                this._customTemplate = customTemplate[1].trim();
            }
        }
    }

    /**
     * Allow custom functions to be available in the SQL query via the CustomJS
     * plugin. Functionality is pending future PR.
     *
     * @private
     * @param {string} directive - The string minus the # symbol to process.
     * @memberof QuerySql
     */
    private parseCustomJSPluginOptions(directive: string) {
        const customJSClasses = directive.match(this._customJSRegexp);
        if (customJSClasses !== null && customJSClasses[1].trim() !== '' && customJSClasses[2].trim() !== '') {
            this._customJsClasses.push([customJSClasses[1].trim(), customJSClasses[2].trim()]);
        }
    }

    /**
     *  Multiline mode directs the processing to only take the last array, if
     *  you are running raw mode and want all the output of the commands this
     *  can be skipped.
     *
     * @private
     * @param {string} directive - The string minus the # symbol to process.
     * @memberof QuerySql
     */
    private parseMultilineOptions(directive: string) {
        this.logger.debugWithId(this._queryId, 'Detected multiline directive', directive);
        this._multilineQueryMode = true;
    }

    /**
     * Parses the raw options to allow customized queries and debugging via console.
     *
     * @private
     * @param {string} directive - The string minus the # symbol to process.
     * @memberof QuerySql
     */
    private parseRawOptions(directive: string) {
        this.logger.debugWithId(this._queryId, 'Detected RAW mode directive', directive);
        this._rawMode = true;
        const rawOptions = directive.match(this._rawQuery);
        if (rawOptions !== null && rawOptions[1].trim().toLowerCase() === 'empty') {
            this._rawWithTasksMode = false;
        } else {
            this._rawWithTasksMode = true;
        }
    }

    /**
     * Parses the common layout options for the tasks plugin.
     *
     * @private
     * @param {{ line: string }} { line }
     * @memberof QuerySql
     */
    private parseHideOptions({ line }: { line: string }): void {
        this._layoutOptions.parseLayoutOptions({ line });
    }

    /**
     * Creates a unique ID for correlation of console logging.
     *
     * @private
     * @param {number} length
     * @return {*}  {string}
     * @memberof QuerySql
     */
    private generateQueryId(length: number): string {
        const chars = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890';
        const randomArray = Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]);

        const randomString = randomArray.join('');
        return randomString;
    }

    // private convertToTaskRecords(tasks: Task[]): TaskRecord[] {
    //     return tasks.map((task) => {
    //         return QuerySql.toTaskRecord(task);
    //     });
    // }

    // static fromTaskRecord(record: TaskRecord): Task {
    //     return new Task({
    //         status: record.status,
    //         description: record.description,
    //         taskLocation: new TaskLocation(
    //             record.path,
    //             0,
    //             record.sectionStart,
    //             record.sectionIndex,
    //             record.precedingHeader,
    //         ),
    //         indentation: record.indentation,
    //         listMarker: record.listMarker,
    //         priority: record.priority,
    //         createdDate: record.createdDate !== null ? window.moment(record.createdDate) : null, // !== null ? new CreatedDateProperty(record.createdDate) : null,
    //         startDate: record.startDate !== null ? window.moment(record.startDate) : null,
    //         scheduledDate: record.scheduledDate !== null ? window.moment(record.scheduledDate) : null,
    //         dueDate: record.dueDate !== null ? window.moment(record.dueDate) : null,
    //         doneDate: record.doneDate !== null ? window.moment(record.doneDate) : null,
    //         recurrence: record.recurrence ? QuerySql.fromRecurrenceRecord(record.recurrence) : null,
    //         blockLink: record.blockLink,
    //         tags: record.tags,
    //         originalMarkdown: record.originalMarkdown,
    //         scheduledDateIsInferred: record.scheduledDateIsInferred,
    //     });
    // }

    // static toTaskRecord(task: Task): TaskRecord {
    //     return {
    //         status: task.status,
    //         description: task.description,
    //         path: task.path,
    //         file: task.filename,
    //         indentation: task.indentation,
    //         listMarker: task.listMarker,
    //         sectionStart: task.sectionStart,
    //         sectionIndex: task.sectionIndex,
    //         precedingHeader: task.precedingHeader,
    //         tags: task.tags,
    //         blockLink: task.blockLink,
    //         priority: task.priority,
    //         startDate: task.startDate ? task.startDate.toDate() : null,
    //         scheduledDate: task.scheduledDate ? task.scheduledDate.toDate() : null,
    //         dueDate: task.dueDate ? task.dueDate.toDate() : null,
    //         createdDate: task.createdDate ? task.createdDate.toDate() : null,
    //         doneDate: task.doneDate ? task.doneDate.toDate() : null,
    //         recurrence: task.recurrence ? QuerySql.toRecurrenceRecord(task.recurrence) : null,
    //         originalMarkdown: task.originalMarkdown,
    //         scheduledDateIsInferred: task.scheduledDateIsInferred,
    //     };
    // }

    // static fromRecurrenceRecord(record: RecurrenceRecord): Recurrence {
    //     return new Recurrence({
    //         rrule: rrulestr(record.rrule),
    //         baseOnToday: record.baseOnToday,
    //         referenceDate: record.referenceDate ? window.moment(record.referenceDate) : null,
    //         startDate: record.startDate ? window.moment(record.startDate) : null,
    //         scheduledDate: record.scheduledDate ? window.moment(record.scheduledDate) : null,
    //         dueDate: record.dueDate ? window.moment(record.dueDate) : null,
    //     });
    // }

    // static toRecurrenceRecord(recurrence: Recurrence): RecurrenceRecord {
    //     return {
    //         rrule: recurrence.rrule.toString(),
    //         baseOnToday: recurrence.baseOnToday,
    //         referenceDate: recurrence.referenceDate ? recurrence.referenceDate.toDate() : null,
    //         startDate: recurrence.startDate ? recurrence.startDate.toDate() : null,
    //         scheduledDate: recurrence.scheduledDate ? recurrence.scheduledDate.toDate() : null,
    //         dueDate: recurrence.dueDate ? recurrence.dueDate.toDate() : null,
    //     };
    // }
}

// export type RecurrenceRecord = {
//     rrule: string;
//     baseOnToday: boolean;
//     referenceDate: Date | null;
//     startDate: Date | null;
//     scheduledDate: Date | null;
//     dueDate: Date | null;
// };

// export type TaskRecord = {
//     status: Status;
//     description: string;
//     path: string;
//     file: string | null;
//     indentation: string;
//     listMarker: string;
//     sectionStart: number;
//     sectionIndex: number;
//     precedingHeader: string | null;
//     priority: Priority;
//     startDate: Date | null;
//     scheduledDate: Date | null;
//     dueDate: Date | null;
//     createdDate: Date | null;
//     doneDate: Date | null;
//     recurrence: RecurrenceRecord | null;
//     blockLink: string;
//     tags: string[] | [];
//     originalMarkdown: string;
//     scheduledDateIsInferred: boolean;
// };
