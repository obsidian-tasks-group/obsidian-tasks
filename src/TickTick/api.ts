import type { Task } from '../Task/Task';
import { StatusType } from '../Statuses/StatusConfiguration';
import { Client } from './client';

const LOGIN_ENDPOINT = 'https://api.ticktick.com/api/v2/user/signon?wc=true&remember=true';
const TASK_ENDPOINT = 'https://api.ticktick.com/api/v2/task';
// const V1_ENDPOINT = 'https://api.ticktick.com/api/v1';
// const PROJECT_ENDPOINT = 'https://api.ticktick.com/api/v2/project';
// const BATCH_CHECK_ENDPOINT = 'https://ticktick.com/api/v2/batch/check/0';
const BATCH_ENDPOINT = 'https://ticktick.com/api/v2/batch/task';
// const DELTE_TAG_ENDPOINT = 'https://api.ticktick.com/api/v2/tag/delete';
//
// const ALL_COMPLETED_ENDPOINT = 'https://api.ticktick.com/api/v2/project/all/completedInAll/';
//
// statuses: done = 2, cancelled = -1

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

    public async sync(tasks: Task[]): Promise<Task[]> {
        return tasks.map((task) => {
            return task;
        });
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

    public async create(task: Task): Promise<{ id: string; projectId: string }> {
        try {
            // TODO: all fields
            const body = {
                title: task.descriptionWithoutTags,
                dueDate: task.dueDate?.toISOString(),
            };
            const response = await this.client.post('Create', TASK_ENDPOINT, body);
            if (response) {
                return { id: response.id, projectId: response.projectId };
            }
        } catch (error) {
            console.error(error);
        }
        return { id: '', projectId: '' };
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
