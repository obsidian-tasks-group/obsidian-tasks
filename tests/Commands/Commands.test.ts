import { Commands } from '../../src/Commands';

describe('Registering commands', () => {
    it('should register the quick search command', () => {
        const addCommand = jest.fn();
        new Commands({
            plugin: {
                app: {},
                addCommand,
                getTasks: () => [],
            } as any,
        });

        expect(addCommand).toHaveBeenCalledWith(
            expect.objectContaining({
                id: 'quick-search',
                name: 'Quick search',
            }),
        );
    });
});
