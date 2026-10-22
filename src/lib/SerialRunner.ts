/**
 * Runs an async job so that runs never overlap, without losing requests.
 *
 * If {@link run} is called while the job is running, the current run is not interrupted
 * and no additional overlapping run is started. Instead, the runner remembers that another
 * run was requested and runs the job once more after the current run finishes.
 *
 * Multiple calls to {@link run} while a run is in progress are coalesced into a single
 * follow-up run. Therefore, the job should read the latest state each time it runs,
 * rather than being passed per-request state.
 *
 * This class is not a queue: it preserves the fact that something changed while a run
 * was in progress, but it does not preserve every intermediate request.
 */
export class SerialRunner {
    private readonly job: () => Promise<void>;
    private isRunning = false;
    private isRequestedWhileRunning = false;

    constructor(job: () => Promise<void>) {
        this.job = job;
    }

    /**
     * Requests that the job run.
     *
     * If no run is in progress, this starts running the job immediately, and the returned
     * promise resolves or rejects with that run cycle.
     *
     * If a run is already in progress, this only requests one follow-up run and returns
     * immediately. In that case, awaiting the returned promise does not wait for the
     * in-progress run or the follow-up run to finish.
     */
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
