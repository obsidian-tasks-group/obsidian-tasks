import { LatestRenderCoordinator } from '../../src/Renderer/LatestRenderCoordinator';

/**
 * A promise that the test resolves by hand, to simulate a slow render.
 */
function deferred() {
    let resolve!: () => void;
    const promise = new Promise<void>((r) => (resolve = r));
    return { promise, resolve };
}

describe('LatestRenderCoordinator', () => {
    it('never runs jobs at the same time, and ends with the latest request', async () => {
        const events: string[] = [];
        const firstRender = deferred();
        const coordinator = new LatestRenderCoordinator<string>(async (params) => {
            events.push(`start ${params}`);
            if (params === 'a') {
                await firstRender.promise;
            }
            events.push(`end ${params}`);
        });

        const done = coordinator.request('a');
        // These arrive while 'a' is still rendering. Only the latest should be rendered afterwards.
        void coordinator.request('b');
        void coordinator.request('c');
        expect(coordinator.hasQueuedRequest).toEqual(true);

        firstRender.resolve();
        await done;

        expect(events).toEqual(['start a', 'end a', 'start c', 'end c']);
        expect(coordinator.hasQueuedRequest).toEqual(false);
    });

    it('keeps rendering after a job throws', async () => {
        const errors: unknown[] = [];
        const rendered: string[] = [];
        const coordinator = new LatestRenderCoordinator<string>(
            async (params) => {
                if (params === 'bad') {
                    throw new Error('render failed');
                }
                rendered.push(params);
            },
            (error) => errors.push(error),
        );

        await coordinator.request('bad');
        await coordinator.request('good');

        expect(errors).toHaveLength(1);
        expect(rendered).toEqual(['good']);
    });

    it('tells a running job it is no longer current after cancel(), and drops queued requests', async () => {
        const firstRender = deferred();
        const results: { params: string; current: boolean }[] = [];
        const coordinator = new LatestRenderCoordinator<string>(async (params, isCurrent) => {
            await firstRender.promise;
            results.push({ params, current: isCurrent() });
        });

        const done = coordinator.request('a');
        void coordinator.request('b');
        coordinator.cancel();
        firstRender.resolve();
        await done;

        expect(results).toEqual([{ params: 'a', current: false }]);
    });
});
