/**
 * A render job. `isCurrent()` becomes false once the coordinator has been cancelled.
 */
export type RenderJob<P> = (params: P, isCurrent: () => boolean) => Promise<void>;

/**
 * Runs asynchronous render jobs one at a time. A request made during a job is queued, replacing any
 * earlier queued request, so the last render always uses the latest parameters.
 */
export class LatestRenderCoordinator<P> {
    private queued: { params: P } | null = null;
    private running: Promise<void> | null = null;
    private generation = 0;

    constructor(
        private readonly job: RenderJob<P>,
        private readonly onError: (error: unknown) => void = (error) => console.error(error),
    ) {}

    public get hasQueuedRequest(): boolean {
        return this.queued !== null;
    }

    /**
     * @returns A promise that resolves when this request, or a later one that replaced it, has been rendered.
     */
    public request(params: P): Promise<void> {
        this.queued = { params };
        if (this.running === null) {
            this.running = this.runQueued();
        }
        return this.running;
    }

    public cancel(): void {
        this.generation++;
        this.queued = null;
    }

    private async runQueued(): Promise<void> {
        while (this.queued !== null) {
            const { params } = this.queued;
            this.queued = null;

            const generation = this.generation;
            const isCurrent = () => generation === this.generation;
            try {
                await this.job(params, isCurrent);
            } catch (error) {
                this.onError(error);
            }
        }
        // Cleared in the same step as the loop's last check, so no request can be left queued.
        this.running = null;
    }
}
