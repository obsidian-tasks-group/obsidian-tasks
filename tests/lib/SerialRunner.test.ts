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
        await Promise.resolve();
        finishCurrentRun();
        await firstRun;

        // The run with v2 is skipped, but the latest data is not lost.
        expect(seen).toEqual(['v1', 'v3']);
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
});
