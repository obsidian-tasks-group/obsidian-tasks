import moment from 'moment';
import type { TickTickProject } from 'Config/Settings';
import { Task } from '../Task/Task';
import { TasksFile } from '../Scripting/TasksFile';
import { Priority } from '../Task/Priority';
import { TaskLocation } from '../Task/TaskLocation';
import { OnCompletion } from '../Task/OnCompletion';
import { StatusType } from '../Statuses/StatusConfiguration';
import { Status } from '../Statuses/Status';
import { Client } from './client';

const LOGIN_ENDPOINT = 'https://api.ticktick.com/api/v2/user/signon?wc=true&remember=true';
const TASK_ENDPOINT = 'https://api.ticktick.com/api/v2/task';
// const V1_ENDPOINT = 'https://api.ticktick.com/api/v1';
// const PROJECT_ENDPOINT = 'https://api.ticktick.com/api/v2/project';
const BATCH_CHECK_ENDPOINT = 'https://ticktick.com/api/v2/batch/check';
const BATCH_ENDPOINT = 'https://ticktick.com/api/v2/batch/task';
// const DELTE_TAG_ENDPOINT = 'https://api.ticktick.com/api/v2/tag/delete';
//
// const ALL_COMPLETED_ENDPOINT = 'https://api.ticktick.com/api/v2/project/all/completedInAll/';
//
// statuses: done = 2, cancelled = -1
//
type TaskSync = {
    add: Task[];
    update: Task[];
    delete: Task[];
};
type SyncCheckpoint = {
    checkpoint: number;
    taskSync: TaskSync;
    projects: TickTickProject[];
};

export class TickTickApi {
    private static instance: TickTickApi;

    private client: Client = Client.getInstance();

    private _username = '';
    private _password = '';
    public projects = {};
    public inbox = {};
    public tags: { name: string }[] = [];

    public static getInstance(): TickTickApi {
        if (!TickTickApi.instance) {
            TickTickApi.instance = new TickTickApi();
        }

        return TickTickApi.instance;
    }

    public getUsername(): string {
        return this._username;
    }

    public getPassword(): string {
        return this._password;
    }

    public setUsername(value: string) {
        this._username = value;
    }

    public setPassword(value: string) {
        this._password = value;
    }

    public async sync(checkPoint: number): Promise<SyncCheckpoint> {
        const ret = {
            checkpoint: 0,
            taskSync: { add: [], update: [], delete: [] },
            projectSync: { add: [], update: [], delete: [] },
            projects: [],
        } as SyncCheckpoint;

        const response = await this.client.get('Get Batch', BATCH_CHECK_ENDPOINT + `/${checkPoint}`);
        if (!response) {
            return ret;
        }

        ret.checkpoint = response.checkPoint;

        for (const update of response.syncTaskBean.update) {
            ret.taskSync.update.push(taskFromTickTickTask(update));
        }
        for (const add of response.syncTaskBean.add) {
            ret.taskSync.add.push(taskFromTickTickTask(add));
        }
        for (const del of response.syncTaskBean.delete) {
            ret.taskSync.delete.push(taskFromTickTickTask(del));
        }

        const inbox = { id: response.inboxId, name: 'Inbox' };
        if (response.projectProfiles) {
            ret.projects = [
                inbox,
                ...response.projectProfiles.map((profile: any) => {
                    return {
                        id: profile.id,
                        name: profile.name,
                    };
                }),
            ];
        }

        return ret;
    }

    public async listProjects(): Promise<TickTickProject[]> {
        const response = await this.client.get('Get Batch', BATCH_CHECK_ENDPOINT + '/0');
        if (!response) {
            return [];
        }

        const inbox = { id: response.inboxId, name: 'Inbox' };
        const tickTickProjects = response.projectProfiles.map((profile: any) => {
            return {
                id: profile.id,
                name: profile.name,
            };
        });

        return [inbox, ...tickTickProjects];
    }

    // private async deleteTask(taskId: string, projectId: string) {
    //     await this.delete('Delete task', TASK_ENDPOINT, {
    //         projectId,
    //         taskId,
    //     });
    // }

    // [
    //     {
    //         "id": "680497c68f0897947f548f0f",
    //         "projectId": "inbox118711340",
    //         "sortOrder": -1099511627776,
    //         "title": "test test",
    //         "timeZone": "",
    //         "isFloating": false,
    //         "reminder": "",
    //         "reminders": [],
    //         "priority": 0,
    //         "status": 0,
    //         "items": [],
    //         "modifiedTime": "2025-04-20T06:44:22.408+0000",
    //         "etag": "mw786jbi",
    //         "deleted": 0,
    //         "createdTime": "2025-04-20T06:44:22.408+0000",
    //         "creator": 118711340,
    //         "tags": [],
    //         "kind": "TEXT"
    //     }
    // ]
    // private async fetchAllCompleted() {
    //     const res = await this.get('Fetch all completed', ALL_COMPLETED_ENDPOINT);
    //     console.log(res);
    //     return res;
    // }
    // private async fetchUncompleted() {
    //     const res = await this.get('Fetch uncompleted', BATCH_CHECK_ENDPOINT);
    //     const projects = res.projectProfiles as { id: string }[];
    //     const projectsById = {} as { [key: string]: {} };
    //     projects.forEach((element) => {
    //         projectsById[element.id] = element;
    //     });
    //
    //     const inbox = {
    //         id: res.inboxId,
    //         name: 'Inbox',
    //         sortOrder: 0,
    //     };
    //     projectsById[res.inboxId] = inbox;
    //
    //     this.projects = projectsById;
    //     this.inbox = inbox;
    //     this.tags = res.tags;
    //     console.log('res', res);
    //     console.log('update bean thing', res['syncTaskBean']['update']);
    //     return res['syncTaskBean']['update'];
    // }
    //
    // private async getProjectId(): Promise<string> {
    //     const res = await this.get('Get Project', PROJECT_ENDPOINT);
    //     return res.id;
    // }

    // private async get(reqName: string, endpoint: string): Promise<any> {
    //     try {
    //         const headers = this.headers();
    //         const response = await this.makeRequest(reqName, endpoint, 'GET', headers);
    //         if (response) {
    //             // TODO: decide what to do about inboxId
    //             return response;
    //         }
    //     } catch (error) {
    //         console.error(error);
    //     }
    // }

    // private async delete(reqName: string, endpoint: ENDPOINT, body: any): Promise<any> {
    //     try {
    //         const headers = this.headers();
    //         const response = await this.makeRequest(reqName, endpoint, 'DELETE', headers, body);
    //         if (response) {
    //             // TODO: decide what to do about inboxId
    //             return response;
    //         }
    //     } catch (error) {
    //         console.error(error);
    //     }
    // }

    public async login() {
        try {
            const body = {
                username: this._username,
                password: this._password,
            };
            await this.client.login('Login', LOGIN_ENDPOINT, body);
        } catch (error) {
            console.error(error);
        }
    }

    public async create(task: Task): Promise<TickTickTask | null> {
        try {
            // TODO: all fields
            let projectId = null;
            if (task.tickTickProjectId) {
                projectId = task.tickTickProjectId;
            }
            const body = {
                title: task.descriptionWithoutTags,
                dueDate: task.dueDate?.toISOString(),
                projectId: projectId,
                tags: task.tags,
            };
            const response = await this.client.post('Create', TASK_ENDPOINT, body);
            if (response) {
                return response;
            }
        } catch (error) {
            console.error(error);
        }
        return null;
    }

    public async update(task: Task): Promise<string> {
        let status = 0;
        let completedTime = null;
        if (task.status.type === StatusType.DONE) {
            status = 2;
            completedTime = task.doneDate?.toISOString();
        } else if (task.status.type === StatusType.CANCELLED) {
            status = -1;
            completedTime = task.cancelledDate?.toISOString();
        }

        try {
            const tickTickTask = {
                title: task.descriptionWithoutTags,
                dueDate: task.dueDate?.toISOString(),
                id: task.tickTickId,
                projectId: task.tickTickProjectId,
                status: status,
                completedTime: completedTime,
                tags: task.tags,
            };

            const body = {
                update: [tickTickTask],
            };
            const response = await this.client.post('Update', BATCH_ENDPOINT, body);
            if (response) {
                return response.id;
            }
        } catch (error) {
            console.error(error);
        }
        return '';
    }
}

type TickTickTask = {
    id: string;
    projectId: string;
    title: string;
    dueDate: string;
    createdDate: string;
    completedTime: string;
    status: number;
    tags: {
        rawName: string;
    }[];
};

const toTaskStatus = (n: number) => {
    switch (n) {
        case 0:
            return Status.TODO;
        case 2:
            return Status.DONE;
        case -1:
            return Status.CANCELLED;
        default:
            return Status.TODO;
    }
};

export const taskFromTickTickTask = (task: TickTickTask): Task => {
    // If we are not on a line of a task, we take what we have.
    let duedate = null;
    let doneDate = null;
    let createdDate = null;
    let tags: string[] = [];

    if (task.dueDate) {
        duedate = moment(task.dueDate);
    }
    if (task.completedTime) {
        doneDate = moment(task.completedTime);
    }
    if (task.createdDate) {
        createdDate = moment(task.createdDate);
    }
    if (task.tags) {
        tags = task.tags.map((tag) => tag.rawName);
    }
    return new Task({
        // NEW_TASK_FIELD_EDIT_REQUIRED
        status: toTaskStatus(task.status),
        description: `#task ${task.title}`,
        // We don't need the location fields except file to edit here in the editor.
        taskLocation: TaskLocation.fromUnknownPosition(new TasksFile('Tasks/Inbox')),
        indentation: '',
        listMarker: '-',
        priority: Priority.None,
        createdDate: createdDate,
        startDate: null,
        scheduledDate: null,
        dueDate: duedate,
        doneDate: doneDate,
        cancelledDate: null,
        recurrence: null,
        onCompletion: OnCompletion.Ignore,
        dependsOn: [],
        id: '',
        tickTickId: task.id,
        tickTickProjectId: task.projectId,
        blockLink: '',
        tags: tags,
        originalMarkdown: '',
        scheduledDateIsInferred: false,
    });
};
