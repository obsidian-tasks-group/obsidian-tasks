import type { CachedMetadata } from 'obsidian';
import { logging } from '../../src/lib/logging';
import { getTasksFromFileContent2 } from '../../src/Obsidian/Cache';

function errorReporter() {
    return;
}

describe('cache', () => {
    it('should read one task', () => {
        const cachedMetadata: CachedMetadata = {
            tags: [
                {
                    position: {
                        start: {
                            line: 0,
                            col: 6,
                            offset: 6,
                        },
                        end: {
                            line: 0,
                            col: 11,
                            offset: 11,
                        },
                    },
                    tag: '#task',
                },
            ],
            sections: [
                {
                    type: 'list',
                    position: {
                        start: {
                            line: 0,
                            col: 0,
                            offset: 0,
                        },
                        end: {
                            line: 0,
                            col: 30,
                            offset: 30,
                        },
                    },
                },
            ],
            listItems: [
                {
                    position: {
                        start: {
                            line: 0,
                            col: 0,
                            offset: 0,
                        },
                        end: {
                            line: 0,
                            col: 30,
                            offset: 30,
                        },
                    },
                    parent: -1,
                    task: ' ',
                },
            ],
        };
        const logger = logging.getLogger('testCache');
        const fileContent = '- [ ] #task the only task here';
        const tasks = getTasksFromFileContent2(
            'one_task.md',
            fileContent,
            cachedMetadata.listItems!,
            logger,
            cachedMetadata,
            errorReporter,
        );
        expect(tasks.length).toEqual(1);
        expect(tasks[0].description).toEqual('#task the only task here');
    });
});
