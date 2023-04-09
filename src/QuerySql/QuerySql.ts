import alasql from 'alasql';
import moment from 'moment';
import { rrulestr } from 'rrule';

import { TaskLocation } from '../TaskLocation';
import { Recurrence } from '../Recurrence';
import { type Priority, Task } from '../Task';
import type { IQuery } from '../IQuery';
import { TaskGroups } from '../Query/TaskGroups';
import { Group } from '../Query/Group';
import { TaskGroup } from '../Query/TaskGroup';
import { GroupHeading } from '../Query/GroupHeading';
import { logging } from '../lib/logging';
import { isFeatureEnabled } from '../Config/Settings';
import type { Grouper } from '../Query/Grouper';
import { LayoutOptions } from '../TaskLayout';
import type { Status } from '../Status';

export type GroupingProperty = 'backlink' | 'filename' | 'folder' | 'heading' | 'path' | 'status';
export type Grouping = { property: GroupingProperty };
export type RecurrenceRecord = {
    rrule: string;
    baseOnToday: boolean;
    referenceDate: Date | null;
    startDate: Date | null;
    scheduledDate: Date | null;
    dueDate: Date | null;
};
export type TaskRecord = {
    status: Status;
    description: string;
    path: string;
    file: string | null;
    indentation: string;
    listMarker: string;
    sectionStart: number;
    sectionIndex: number;
    precedingHeader: string | null;
    priority: Priority;
    startDate: Date | null;
    scheduledDate: Date | null;
    dueDate: Date | null;
    createdDate: Date | null;
    doneDate: Date | null;
    recurrence: RecurrenceRecord | null;
    blockLink: string;
    tags: string[] | [];
    originalMarkdown: string;
    scheduledDateIsInferred: boolean;
};

export class QuerySql implements IQuery {
    public source: string;
    public name: string;
    // public sourceHash: string;

    // @ts-ignore
    private _sourcePath: string;
    // @ts-ignore
    private _frontmatter: any | null | undefined;

    private _layoutOptions: LayoutOptions = new LayoutOptions();

    // private _grouping: Grouping[] = [];
    private _error: string | undefined = undefined;
    private _groupingPossible: boolean = false;
    private _groupByFields: [string, string][] = [];
    private _rawMode: boolean = false;
    private _rawWithTasksMode: boolean = false;
    logger = logging.getLogger('taskssql.QuerySql');

    private _commentReplacementRegexp = /(^#.*$(\r\n|\r|\n)?)/gm;
    private _commentRegexp = /^#.*/;
    private _hideOptionsRegexp =
        /^hide (task count|backlink|priority|start date|scheduled date|done date|due date|recurrence rule|edit button)/;
    private _shortModeRegexp = /^short/;
    private _rawQuery = /^raw (empty|tasks)/;
    private _customJSRegexp = /^customjs (.*) (.*)/;
    private _customTemplateRegexp = /^template (.*)/;

    private _customJsClasses: Array<[string, string]>;
    private _customTemplate: string = '';

    private _queryId: string = '';

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

        // this.sourceHash = ADLER32.str(source).toString();

        this._sourcePath = sourcePath;
        this._frontmatter = frontmatter;
        this._customJsClasses = [];

        source
            .split('\n')
            .map((line: string) => line.trim())
            .forEach((line: string) => {
                switch (true) {
                    case line === '':
                        break;
                    case this._commentRegexp.test(line):
                        {
                            // Comment lines are rendering directives
                            // #hide (task count|backlink|priority|start date|scheduled date|done date|due date|recurrence rule|edit button)
                            // #short
                            // #raw (empty|tasks)
                            // Will be used to filter the columns... probably...
                            const directive = line.slice(1).trim();

                            if (this._shortModeRegexp.test(directive)) {
                                // this._layoutOptions.shortMode = true;
                            } else if (this._hideOptionsRegexp.test(directive)) {
                                this.parseHideOptions({ line: directive });
                            } else if (this._rawQuery.test(directive)) {
                                this._rawMode = true;
                                const rawOptions = directive.match(this._rawQuery);
                                if (rawOptions !== null && rawOptions[1].trim().toLowerCase() === 'empty') {
                                    this._rawWithTasksMode = false;
                                } else {
                                    this._rawWithTasksMode = true;
                                }
                            } else if (this._customJSRegexp.test(directive)) {
                                const customJSClasses = directive.match(this._customJSRegexp);
                                if (
                                    customJSClasses !== null &&
                                    customJSClasses[1].trim() !== '' &&
                                    customJSClasses[2].trim() !== ''
                                ) {
                                    this._customJsClasses.push([customJSClasses[1].trim(), customJSClasses[2].trim()]);
                                }
                            } else if (this._customTemplateRegexp.test(directive)) {
                                // Search for #template <template>.
                                if (isFeatureEnabled('ENABLE_INLINE_TEMPLATE')) {
                                    const customTemplate = directive.match(this._customTemplateRegexp);
                                    if (customTemplate !== null && customTemplate[1].trim() !== '') {
                                        this._customTemplate = customTemplate[1].trim();
                                    }
                                }
                            }
                        }
                        break;
                }
            });

        const queryPrefix = 'SELECT * FROM ?';

        this.source = source.replace(this._commentReplacementRegexp, '').trim();

        this.logger.infoWithId(this._queryId, 'Source Query', this.source);

        // Exit out if raw with no set table to query.
        if (this._rawMode && !this._rawWithTasksMode) {
            return;
        }
        const sqlTokens = this.source.match(/[^\s,;]+|;/gi);

        // If there is a group by clause, then we can do grouping later on, no need to
        // use the existing filters in current grouping classes.
        if (/(^|\s)GROUP BY*/gim.test(this.source)) {
            this._groupingPossible = true;
        }

        this.logger.infoWithId(this._queryId, 'Grouping Possible', this._groupingPossible);

        if (/^SELECT/gim.test(this.source)) {
            // User has entered a full query. Clean up.
            this.source = this.source.replace(/(^|\s)FROM Tasks*/gim, ' FROM ?');
            this.logger.infoWithId(this._queryId, 'Source Query after clean from full', this.source);
        } else {
            if (this._groupingPossible && sqlTokens !== null) {
                try {
                    // Get the column/s we are grouping on. Starting with support
                    // for one only.
                    // this.logger.infoWithId(this._queryId, 'SQL Tokens.', sqlTokens);
                    for (let index = 0; index < sqlTokens.length; index++) {
                        // Find 'GROUP BY'
                        if (sqlTokens[index] === 'GROUP' && sqlTokens[index + 1] === 'BY') {
                            // If using a property in a object use the value before the ->.
                            if (sqlTokens[index + 2].contains('->')) {
                                this._groupByFields.push([sqlTokens[index + 2].split('->')[0], sqlTokens[index + 2]]);
                            } else {
                                this._groupByFields.push([sqlTokens[index + 2], sqlTokens[index + 2]]);
                            }
                        }
                    }
                    if (this._groupByFields.length > 0) {
                        this.source = `SELECT ${this._groupByFields[0][1]} AS ${this._groupByFields[0][0]}, ARRAY(_) AS tasks FROM ? ${this.source}`;
                    } else {
                        this.source = `${queryPrefix} ${this.source}`;
                    }
                } catch (error) {
                    this.logger.errorWithId(this._queryId, 'Unable to parse group statement.', this.source);
                }
            } else {
                this.source = `${queryPrefix} ${this.source}`;
            }
        }
    }

    public get grouping(): Grouper[] {
        return new Array<Grouper>();
        // return this._grouping;
    }

    public get error(): string | undefined {
        return this._error;
    }

    public get template(): string | undefined {
        return this._customTemplate;
    }

    public get layoutOptions(): LayoutOptions {
        return this._layoutOptions;
    }

    // public applyQueryToTasks(tasks: Task[]): TaskGroups {
    // }

    /**
     * This will run the SQL query against the collection of tasks and
     * will return the tasks that match the query.
     *
     * @param {Task[]} tasks
     * @return {*}  {Task[]}
     * @memberof QuerySql
     */
    public queryTasks(tasks: Task[]): Task[] | any {
        this.logger.infoWithId(this._queryId, `Executing query: [${this.source}]`);
        const records: TaskRecord[] = this.convertToTaskRecords(tasks);

        /*
         * As we are using alaSQL we can take advantage of a in memory cache. The pagedata
         * table contains the source path for the executing code block when rendered. This
         * allows the code block to reference the page it is being rendered on and access
         * the page meta data for more complex queries.
         */
        if (alasql('SHOW TABLES FROM alasql LIKE "pagedata"').length == 0) {
            alasql('CREATE TABLE pagedata (name STRING, keyvalue STRING)');
        }

        if (alasql(`SELECT keyvalue FROM pagedata WHERE name = "sourcePath${this._queryId}"`).length == 0) {
            alasql(`INSERT INTO pagedata VALUES ('sourcePath${this._queryId}','${this._sourcePath}')`);
        }

        // Set moment() function available to AlaSQL
        alasql.fn.moment = moment;

        alasql.fn.pageProperty = function (field) {
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

        // Return the ID of this query used for degugging as needed.
        alasql.fn.queryId = function () {
            return this._queryId;
        };

        alasql.options.nocount = true; // Disable row count for queries.
        //console.log(alasql(`DECLARE @queryId STRING = '${queryId}';`));

        // If the '# raw' command is added to the query then we will return the raw
        // query results, allows more advanced based query results. The information
        // is returned to the console currently. Independent rendering is a TBD.
        if (this._rawMode && !this._rawWithTasksMode) {
            const rawResult = alasql(this.source);
            this.logger.infoWithId(this._queryId, 'RAW Data result from AlaSQL query', rawResult);
            return new Array<Task>();
        }

        let queryResult: TaskRecord[];
        try {
            queryResult = alasql(this.source, [records]);
        } catch (error) {
            queryResult = new Array<TaskRecord>();
            this.logger.debugWithId(this._queryId, 'Error with query', error);
        }
        this.logger.debugWithId(this._queryId, `queryResult: ${queryResult.length}`, queryResult);

        // If the '# raw tasks' command is added to the query then we will return the raw
        // results in the console and the tasks back to the group renderer.
        if (this._rawMode && this._rawWithTasksMode) {
            this.logger.infoWithId(this._queryId, 'RAW Data result from AlaSQL query', queryResult);
        }

        if (this._groupingPossible) {
            return queryResult;
        } else {
            const foundTasks: Task[] = queryResult.map((task) => {
                return QuerySql.fromTaskRecord(task);
            });

            return foundTasks;
        }
    }

    private convertToTaskRecords(tasks: Task[]): TaskRecord[] {
        return tasks.map((task) => {
            return QuerySql.toTaskRecord(task);
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
        const queryResult: any[] = this.queryTasks(tasks);

        // Group is work in progress, the result of the query is a grouped
        // tree but the group logic used in tasks is more focused on a
        // static set of queries and not dynamic so hit and miss for
        // now.
        if (this._groupingPossible) {
            // There may be sub groups in the returned data. This would be
            // array -> <any>(somefield: value, array -> TaskRecord[])
            // interface GroupedResult {
            //     status: number;
            //     tasks: Array<User>;
            //   }
            const parentGroups: any[] = queryResult;

            const renderedGroups: TaskGroup[] = new Array<TaskGroup>();

            for (const group of parentGroups) {
                const currentGroup: [string, any][] = group;
                const groupByFieldName = <string>Object.entries(currentGroup)[0][0];
                const groupByFieldValue = <string>Object.entries(currentGroup)[0][1];
                const groupByFieldTasks = <TaskRecord[]>Object.entries(currentGroup)[1][1];
                this.logger.infoWithId(
                    this._queryId,
                    `groupByFieldName: ${groupByFieldName} groupByFieldValue: ${groupByFieldValue} groupByFieldTasks ${groupByFieldTasks}`,
                    queryResult,
                );
                const foundTasks: Task[] = groupByFieldTasks.map((task) => {
                    return QuerySql.fromTaskRecord(task);
                });

                renderedGroups.push(
                    new TaskGroup([groupByFieldName], [new GroupHeading(1, groupByFieldValue)], foundTasks),
                );
            }

            const preGrouped = new TaskGroups([], []);
            preGrouped.groups = renderedGroups;
            return preGrouped;
        } else {
            return Group.by(this.grouping, queryResult);
        }
    }

    public explainQuery(): string {
        return 'Explanation of this Tasks SQL code block query:\n\n';
    }

    private parseHideOptions({ line }: { line: string }): void {
        const hideOptionsMatch = line.match(this._hideOptionsRegexp);
        if (hideOptionsMatch !== null) {
            const option = hideOptionsMatch[1].trim().toLowerCase();

            switch (option) {
                case 'task count':
                    this._layoutOptions.hideTaskCount = true;
                    break;
                case 'backlink':
                    this._layoutOptions.hideBacklinks = true;
                    break;
                case 'priority':
                    this._layoutOptions.hidePriority = true;
                    break;
                case 'start date':
                    this._layoutOptions.hideStartDate = true;
                    break;
                case 'scheduled date':
                    this._layoutOptions.hideScheduledDate = true;
                    break;
                case 'due date':
                    this._layoutOptions.hideDueDate = true;
                    break;
                case 'done date':
                    this._layoutOptions.hideDoneDate = true;
                    break;
                case 'recurrence rule':
                    this._layoutOptions.hideRecurrenceRule = true;
                    break;
                case 'edit button':
                    this._layoutOptions.hideEditButton = true;
                    break;
                default:
                    this._error = 'do not understand hide option';
            }
        }
    }

    private generateQueryId(length: number): string {
        const chars = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890';
        const randomArray = Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]);

        const randomString = randomArray.join('');
        return randomString;
    }

    static fromTaskRecord(record: TaskRecord): Task {
        return new Task({
            status: record.status,
            description: record.description,
            taskLocation: new TaskLocation(
                record.path,
                0,
                record.sectionStart,
                record.sectionIndex,
                record.precedingHeader,
            ),
            indentation: record.indentation,
            listMarker: record.listMarker,
            priority: record.priority,
            createdDate: record.createdDate !== null ? moment(record.createdDate) : null, // !== null ? new CreatedDateProperty(record.createdDate) : null,
            startDate: record.startDate !== null ? moment(record.startDate) : null,
            scheduledDate: record.scheduledDate !== null ? moment(record.scheduledDate) : null,
            dueDate: record.dueDate !== null ? moment(record.dueDate) : null,
            doneDate: record.doneDate !== null ? moment(record.doneDate) : null,
            recurrence: record.recurrence ? QuerySql.fromRecurrenceRecord(record.recurrence) : null,
            blockLink: record.blockLink,
            tags: record.tags,
            originalMarkdown: record.originalMarkdown,
            scheduledDateIsInferred: record.scheduledDateIsInferred,
        });
    }

    static toTaskRecord(task: Task): TaskRecord {
        return {
            status: task.status,
            description: task.description,
            path: task.path,
            file: task.filename,
            indentation: task.indentation,
            listMarker: task.listMarker,
            sectionStart: task.sectionStart,
            sectionIndex: task.sectionIndex,
            precedingHeader: task.precedingHeader,
            tags: task.tags,
            blockLink: task.blockLink,
            priority: task.priority,
            startDate: task.startDate ? task.startDate.toDate() : null,
            scheduledDate: task.scheduledDate ? task.scheduledDate.toDate() : null,
            dueDate: task.dueDate ? task.dueDate.toDate() : null,
            createdDate: task.createdDate ? task.createdDate.toDate() : null,
            doneDate: task.doneDate ? task.doneDate.toDate() : null,
            recurrence: task.recurrence ? QuerySql.toRecurrenceRecord(task.recurrence) : null,
            originalMarkdown: task.originalMarkdown,
            scheduledDateIsInferred: task.scheduledDateIsInferred,
        };
    }

    static fromRecurrenceRecord(record: RecurrenceRecord): Recurrence {
        return new Recurrence({
            rrule: rrulestr(record.rrule),
            baseOnToday: record.baseOnToday,
            referenceDate: record.referenceDate ? window.moment(record.referenceDate) : null,
            startDate: record.startDate ? window.moment(record.startDate) : null,
            scheduledDate: record.scheduledDate ? window.moment(record.scheduledDate) : null,
            dueDate: record.dueDate ? window.moment(record.dueDate) : null,
        });
    }

    static toRecurrenceRecord(recurrence: Recurrence): RecurrenceRecord {
        return {
            rrule: recurrence.rrule.toString(),
            baseOnToday: recurrence.baseOnToday,
            referenceDate: recurrence.referenceDate ? recurrence.referenceDate.toDate() : null,
            startDate: recurrence.startDate ? recurrence.startDate.toDate() : null,
            scheduledDate: recurrence.scheduledDate ? recurrence.scheduledDate.toDate() : null,
            dueDate: recurrence.dueDate ? recurrence.dueDate.toDate() : null,
        };
    }
}
