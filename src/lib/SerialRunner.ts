/**
 * Runs an async job so that runs never overlap, without losing requests.
 *
 * If {@link run} is called while the job is running, the job runs once more after
 * the current run finishes, however many requests arrived in the meantime.
 * So the job should read the latest data each time it runs, not be passed it.
 */
export class SerialRunner {
    private readonly job: () => Promise<void>;
    private isRunning = false;
    private isRequestedWhileRunning = false;

    constructor(job: () => Promise<void>) {
        this.job = job;
    }

    public async run(): Promise<void> {
        if (this.isRunning) {
            this.isRequestedWhileRunning = true;
            return;
        }

        this.isRunning = true;
        try {
            do {
                this.isRequestedWhileRunning = false;
                await this.job();
            } while (this.isRequestedWhileRunning);
        } finally {
            this.isRunning = false;
        }
    }
}
