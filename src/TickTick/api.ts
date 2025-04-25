import { type RequestUrlParam, type RequestUrlResponse, requestUrl } from 'obsidian';
import type { Task } from '../Task/Task';

const LOGIN_ENDPOINT = 'https://api.ticktick.com/api/v2/user/signon?wc=true&remember=true';
const TASK_ENDPOINT = 'https://api.ticktick.com/api/v2/task';
// const V1_ENDPOINT = 'https://api.ticktick.com/api/v1';
// const PROJECT_ENDPOINT = 'https://api.ticktick.com/api/v2/project';
// const BATCH_CHECK_ENDPOINT = 'https://ticktick.com/api/v2/batch/check/0';
const BATCH_ENDPOINT = 'https://ticktick.com/api/v2/batch/task';
// const DELTE_TAG_ENDPOINT = 'https://api.ticktick.com/api/v2/tag/delete';
//
// const ALL_COMPLETED_ENDPOINT = 'https://api.ticktick.com/api/v2/project/all/completedInAll/';

export class TickTickApi {
    private static instance: TickTickApi;

    private _username = '';
    private _password = '';
    private _token = '';
    private _deviceAgent = '';
    private _userAgent = '';
    private cookies = [''];
    private _cookieHeader = '';
    public projects = {};
    public inbox = {};
    public tags: { name: string }[] = [];

    private _lastError: any;

    get lastError(): any {
        return this._lastError;
    }

    set lastError(value: any) {
        this._lastError = value;
    }

    get token(): any {
        return this._token;
    }

    set token(value: any) {
        this._token = value;
    }

    get deviceAgent() {
        if (!this._deviceAgent) {
            this._deviceAgent = this.getXDevice();
        }
        return this._deviceAgent;
    }

    get userAgent() {
        if (!this._userAgent) {
            this._userAgent = navigator.userAgent;
        }
        return this._userAgent;
    }

    get cookieHeader() {
        if (!this._cookieHeader) {
            this._cookieHeader = localStorage.getItem('TTS_Cookies') ?? '';
        }
        return this._cookieHeader;
    }

    set cookieHeader(value: any) {
        this._cookieHeader = value;
        localStorage.setItem('TTS_Cookies', this._cookieHeader);
    }

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

    private getXDevice() {
        console.log("'generatedID': ", this.generateRandomID());
        const randomID = this.generateRandomID();
        //TickTick wants a version number equal to or greater than 6070. I thought it was random. It's not.
        const randomVersion = 6070;

        const xDeviceObject = {
            //TickTick won't take anything but web
            platform: 'web', //`${this.getPlatform()}`,
            //TickTick won't take anything but a Windows variant apparently.
            os: 'Windows 10', //`${uaObject.os.name} ${uaObject.os.version}`,
            //TickTick doesn't care about the device name.
            device: 'Firefox 117.0', //`${uaObject.browser.name} ${uaObject.browser.version}`,
            name: '', //"${uaObject.engine.name}",
            version: randomVersion,
            id: randomID,
            channel: 'website',
            campaign: '',
            websocket: '',
        };

        return JSON.stringify(xDeviceObject);
    }

    private generateRandomID() {
        let result = localStorage.getItem('TTS_UniqueID');

        //leftover from one of the old iterations.
        if (result) {
            if (result.includes('-')) {
                localStorage.removeItem('TTS_UniqueID');
                result = null;
            }
        }

        if (!result) {
            const prefix = '66';
            const length = 24; // Total length of the string
            const characters = '0123456789abcdef'; // Allowed characters (hexadecimal)

            result = prefix; // Start with '66'

            // Calculate the number of characters needed after the prefix
            const remainingLength = length - prefix.length;

            for (let i = 0; i < remainingLength; i++) {
                const randomIndex = Math.floor(Math.random() * characters.length);
                result += characters[randomIndex]; // Append a random character
            }
            localStorage.setItem('TTS_UniqueID', result);
        }

        return result;
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

    private async post(reqName: string, endpoint: string, body: any): Promise<any> {
        try {
            const headers = this.headers();
            const response = await this.makeRequest(reqName, endpoint, 'POST', headers, body);
            if (response) {
                // TODO: decide what to do about inboxId
                return response;
            }
        } catch (error) {
            console.error(error);
        }
    }

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

    private headers() {
        return {
            //For the record, the bloody rules keep changin and we might have to the _csrf_token
            'Content-Type': 'application/json',
            'User-Agent': this.userAgent,
            'x-device': this.deviceAgent,
            // 'Cookie': 't=' + `${this.token}` + '; AWSALB=pSOIrwzvoncz4ZewmeDJ7PMpbA5nOrji5o1tcb1yXSzeEDKmqlk/maPqPiqTGaXJLQk0yokDm0WtcoxmwemccVHh+sFbA59Mx1MBjBFVV9vACQO5HGpv8eO5pXYL; AWSALBCORS=pSOIrwzvoncz4ZewmeDJ7PMpbA5nOrji5o1tcb1yXSzeEDKmqlk/maPqPiqTGaXJLQk0yokDm0WtcoxmwemccVHh+sFbA59Mx1MBjBFVV9vACQO5HGpv8eO5pXYL',
            Cookie: 't=' + `${this.token}` + ';' + this.cookieHeader,
            t: this.token,
        };
    }

    public async login() {
        try {
            const body = {
                username: this._username,
                password: this._password,
            };
            const headers = {
                Accept: '*/*',
                'x-device': this.deviceAgent,
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            };
            console.log('username', this._username);
            console.log('password', this._password);
            const response = await this.makeRequest('Login', LOGIN_ENDPOINT, 'POST', headers, body);
            // const response = await this.post('Login', LOGIN_ENDPOINT, body);
            console.log('Signed in Response: ', response);
            if (response && response.token) {
                // TODO: decide what to do about inboxId
                console.log(response);
                console.log(response.token);
                this.token = response.token;
            }
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
            const response = await this.post('Create', TASK_ENDPOINT, body);
            if (response) {
                console.log('created response', response);
                return { id: response.id, projectId: response.projectId };
            }
        } catch (error) {
            console.error(error);
        }
        return { id: '', projectId: '' };
    }

    public async update(task: Task): Promise<string> {
        try {
            const tickTickTask = {
                title: task.descriptionWithoutTags,
                dueDate: task.dueDate?.toISOString(),
                id: task.tickTickId,
                projectId: task.tickTickProjectId,
            };

            const body = {
                update: [tickTickTask],
            };
            const response = await this.post('Update', BATCH_ENDPOINT, body);
            if (response) {
                return response.id;
            }
        } catch (error) {
            console.error(error);
        }
        return '';
    }

    //https://github.com/lazeroffmichael/ticktick-py/issues/42#issuecomment-1606568919
    async makeRequest(operation: string, url: string, method: string, headers: any, body: any | undefined = undefined) {
        try {
            const options: RequestUrlParam = {
                method: method,
                url: url,
                headers: headers,
                contentType: 'application/json',
                body: body ? JSON.stringify(body) : undefined,
                throw: false,
            };
            console.log('make request');
            const result = await requestUrl(options);
            console.log('made request', result);
            //console.log(operation, result)
            if (result.status != 200) {
                this.setError(operation, result, null);
                console.log('error result', result);
                return null;
            }
            this.cookies = (result.headers['set-cookie'] as unknown as string[]) ?? [];
            this.cookieHeader = this.cookies.join('; ') + ';';
            return result.json;
        } catch (exception) {
            console.error(exception);
            return null;
        }
    }

    private setError(operation: string, response: RequestUrlResponse | null, error: string | null) {
        if (response) {
            const statusCode = response.status;
            let errorMessage;
            if (statusCode == 429) {
                //Too many requests and we don't get anything else.
                errorMessage = 'Error: ' + statusCode + ' TickTick reporting too many requests.';
                this._lastError = { operation, statusCode, errorMessage };
            } else {
                //When ticktick errors out, sometimes we get a JSON response, sometimes we get
                // a HTML response. Sometimes we get no response. Try to accommodate everything.
                try {
                    errorMessage = response.json;
                } catch (e) {
                    console.log('Bad JSON response');
                    console.log('Trying Text.');
                    try {
                        errorMessage = this.extractTitleContent(response.text);
                        console.error('Error: ', errorMessage);
                    } catch (e) {
                        console.log('Bad text response');
                        console.log('No error message.');
                        errorMessage = 'No Error message received.';
                    }
                }
                this._lastError = { operation, statusCode, errorMessage };
            }
        } else {
            let errorMessage;
            const statusCode = 666;

            if (error) {
                errorMessage = error;
            } else {
                errorMessage = 'Unknown Error';
            }
            console.error(operation, errorMessage);
            this._lastError = { operation, statusCode, errorMessage };
        }
    }

    private extractTitleContent(inputString: string) {
        const startTag = '<title>';
        const endTag = '</title>';
        const startIndex = inputString.indexOf(startTag) + startTag.length;
        const endIndex = inputString.indexOf(endTag);

        return inputString.substring(startIndex, endIndex);
    }
}
