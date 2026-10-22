import { SerialRunner } from '../../src/lib/SerialRunner';

/**
 * A job that records the data it saw, and only finishes when the test says so.
 */
function makeJob(readData: () => string) {
    const seen: string[] = [];
    let finishCurrentRun = () => {};
    const job = () =>
        new Promise<void>((resolve) => {
            seen.push(readData());
            finishCurrentRun = resolve;
        });
    return { job, seen, finishCurrentRun: () => finishCurrentRun() };
}

describe('SerialRunner', () => {
    it('should run the job', async () => {
        const { job, seen, finishCurrentRun } = makeJob(() => 'v1');
        const runner = new SerialRunner(job);

        const run = runner.run();
        finishCurrentRun();
        await run;

        expect(seen).toEqual(['v1']);
    });

    it('should run again with the latest data, when requested while running', async () => {
        let data = 'v1';
        const { job, seen, finishCurrentRun } = makeJob(() => data);
        const runner = new SerialRunner(job);

        const firstRun = runner.run();
        data = 'v2';
        await runner.run();
        data = 'v3';
        await runner.run();

        finishCurrentRun();
        // Allow the runner to continue from the completed run into the next loop iteration.
        await Promise.resolve();
        finishCurrentRun();
        await firstRun;

        // The run with v2 is skipped, but the latest data is not lost.
        expect(seen).toEqual(['v1', 'v3']);
    });

    it('should run a third time, if requested during the follow-up run', async () => {
        let data = 'v1';
        const { job, seen, finishCurrentRun } = makeJob(() => data);
        const runner = new SerialRunner(job);

        // Start run 1, then request one follow-up run with newer data.
        const firstRun = runner.run();
        data = 'v2';
        await runner.run();

        // Finish run 1 so that the requested follow-up run can begin.
        finishCurrentRun();
        await Promise.resolve();

        // While run 2 is active, request one more run with the latest data.
        data = 'v3';
        await runner.run();

        // Finish run 2, then allow the third run to start.
        finishCurrentRun();
        await Promise.resolve();

        // Finish run 3 and verify that all three snapshots were seen.
        finishCurrentRun();
        await firstRun;

        expect(seen).toEqual(['v1', 'v2', 'v3']);
    });

    it('should return immediately when run is called during an active run', async () => {
        const { job, finishCurrentRun } = makeJob(() => 'v1');
        const runner = new SerialRunner(job);

        // Start run 1 and keep it blocked.
        const firstRun = runner.run();

        // A concurrent call should only request a follow-up run.
        // It should not wait for either run 1 or the follow-up run to finish.
        let concurrentCallResolved = false;
        const concurrentRun = runner.run().then(() => {
            concurrentCallResolved = true;
        });

        await concurrentRun;
        expect(concurrentCallResolved).toBe(true);

        // Clean up the in-progress run and its requested follow-up run.
        finishCurrentRun();
        await Promise.resolve();
        finishCurrentRun();
        await firstRun;
    });

    it('should still run after the job throws', async () => {
        let runCount = 0;
        const runner = new SerialRunner(async () => {
            runCount++;
            if (runCount === 1) {
                throw new Error('render failed');
            }
        });

        await expect(runner.run()).rejects.toThrow('render failed');
        await runner.run();

        expect(runCount).toEqual(2);
    });

    it('should still run after the follow-up run throws', async () => {
        let runCount = 0;
        let releaseCurrentRun = () => {};

        const runner = new SerialRunner(
            () =>
                new Promise<void>((resolve, reject) => {
                    runCount++;
                    releaseCurrentRun = () => {
                        if (runCount === 2) {
                            reject(new Error('follow-up run failed'));
                        } else {
                            resolve();
                        }
                    };
                }),
        );

        // Start run 1, then request one coalesced follow-up run.
        const firstRun = runner.run();
        await runner.run();

        // Finish run 1 so that the requested follow-up run can begin.
        releaseCurrentRun();
        await Promise.resolve();

        // Fail run 2 and check that the original caller sees the error.
        releaseCurrentRun();
        await expect(firstRun).rejects.toThrow('follow-up run failed');

        // The runner should recover and allow a fresh later run.
        const thirdRun = runner.run();
        releaseCurrentRun();
        await thirdRun;

        expect(runCount).toEqual(3);
    });
});
