import { type RequestUrlParam, type RequestUrlResponse, requestUrl } from 'obsidian';

export class Client {
    private static instance: Client;

    private _deviceAgent = '';
    private _userAgent = '';
    private cookies = [''];
    private _cookieHeader = '';
    private _token = '';

    private _lastError: any;

    public static getInstance(): Client {
        if (!Client.instance) {
            Client.instance = new Client();
        }

        return Client.instance;
    }

    get token(): any {
        return this._token;
    }

    set token(value: any) {
        this._token = value;
    }

    get lastError(): any {
        return this._lastError;
    }

    set lastError(value: any) {
        this._lastError = value;
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

    get headers() {
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

    get loginHeaders() {
        return {
            Accept: '*/*',
            'x-device': this.deviceAgent,
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        };
    }

    public async get(reqName: string, endpoint: string): Promise<any> {
        try {
            const headers = this.headers;
            const response = await this.makeRequest(reqName, endpoint, 'GET', headers);
            if (response) {
                return response;
            }
        } catch (error) {
            // console.error(error);
        }
    }
    public async post(reqName: string, endpoint: string, body: any): Promise<any> {
        try {
            const headers = this.headers;
            const response = await this.makeRequest(reqName, endpoint, 'POST', headers, body);
            if (response) {
                // TODO: decide what to do about inboxId
                return response;
            }
        } catch (error) {
            // console.log(error);
        }
    }

    public async login(reqName: string, endpoint: string, body: any): Promise<any> {
        try {
            const headers = this.headers;
            const response = await this.makeRequest(reqName, endpoint, 'POST', headers, body);
            if (response && response.token) {
                this.token = response.token;
            }
        } catch (error) {
            // console.log(error);
        }
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
            // console.error(exception);
            // console.log(exception);
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
