import { LogManager, type LogOptions } from '../../src/lib/logging';

describe('Logger responds to changed logging options', () => {
    const optionsWithCacheLevel = (level: string): LogOptions => ({
        minLevels: { '': 'info', tasks: 'info', 'tasks.Cache': level },
    });

    // Some classes, such as Cache, get their logger once, and keep it.
    function setUp(initialLevel: string) {
        const logManager = new LogManager();
        logManager.configure(optionsWithCacheLevel(initialLevel));
        const messages: string[] = [];
        logManager.onLogEntry((logEntry) => messages.push(logEntry.message));
        const logger = logManager.getLogger('tasks.Cache');
        return { logManager, messages, logger };
    }

    it.fails('should start logging debug messages when the level is lowered', () => {
        const { logManager, messages, logger } = setUp('info');

        logger.debug('before');
        logManager.configure(optionsWithCacheLevel('debug'));
        logger.debug('after');

        expect(messages).toEqual(['after']);
    });

    it.fails('should stop logging debug messages when the level is raised', () => {
        const { logManager, messages, logger } = setUp('debug');

        logger.debug('before');
        logManager.configure(optionsWithCacheLevel('info'));
        logger.debug('after');

        expect(messages).toEqual(['before']);
    });
});
