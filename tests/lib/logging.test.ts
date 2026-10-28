import { LogManager, type LogOptions } from '../../src/lib/logging';

describe('Logger responds to changed logging options', () => {
    const optionsWithCacheLevel = (level: string): LogOptions => ({
        minLevels: { '': 'info', tasks: 'info', 'tasks.Cache': level },
    });

    function setUp(initialLevel: string) {
        const logManager = new LogManager();
        logManager.configure(optionsWithCacheLevel(initialLevel));

        const messages: string[] = [];
        logManager.onLogEntry((logEntry) => messages.push(logEntry.message));

        // Some classes, such as Cache, get their logger once, and keep it.
        const logger = logManager.getLogger('tasks.Cache');

        return { logManager, messages, logger };
    }

    it('should start logging debug messages when the level is lowered', () => {
        const { logManager, messages, logger } = setUp('info');

        logger.debug('before'); // ignored, because the level is initially 'info'
        logManager.configure(optionsWithCacheLevel('debug'));
        logger.debug('after'); // logged, because the level is now 'debug'

        expect(messages).toEqual(['after']);
    });

    it('should stop logging debug messages when the level is raised', () => {
        const { logManager, messages, logger } = setUp('debug');

        logger.debug('before'); // logged, because the level is initially 'debug'
        logManager.configure(optionsWithCacheLevel('info'));
        logger.debug('after'); // ignored, because the level is now 'info'

        expect(messages).toEqual(['before']);
    });

    it('should only look up its level again after the options change', () => {
        const { logManager, logger } = setUp('info');
        // Looking up the level loops over all the options, so it is too slow to do for every message.
        const minLevelFor = vi.spyOn(logManager, 'minLevelFor');

        logger.info('first');
        logger.info('second');
        expect(minLevelFor).toHaveBeenCalledTimes(1);

        logManager.configure(optionsWithCacheLevel('debug'));
        logger.info('third');
        logger.info('fourth');
        expect(minLevelFor).toHaveBeenCalledTimes(2);
    });
});
