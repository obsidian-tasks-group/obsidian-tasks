import { TaskBuilder } from '../../TestingTools/TaskBuilder';
import { FilenameField } from '../../../src/Query/Filter/FilenameField';
import {
    toBeValid,
    toMatchTaskWithPath,
} from '../../CustomMatchers/CustomMatchersForFilters';

expect.extend({
    toMatchTaskWithPath,
});

expect.extend({
    toBeValid,
});

describe('filename', () => {
    it('should provide access to the file name with extension', () => {
        const pathField = new FilenameField();

        const builder = new TaskBuilder();

        expect(pathField.value(builder.path('').build())).toStrictEqual('');

        expect(
            pathField.value(builder.path('file in root.md').build()),
        ).toStrictEqual('file in root.md');

        expect(
            pathField.value(
                builder.path('directory name/file in sub-directory.md').build(),
            ),
        ).toStrictEqual('file in sub-directory.md');
    });
});

describe('filename', () => {
    // Note: We don't need to check all behaviours that are implemented in the base class.
    // These are minimal tests to confirm that the filters are correctly wired up,
    // to guard against possible future coding errors.

    it('by filename (includes)', () => {
        // Arrange
        const filter = new FilenameField().createFilterOrErrorMessage(
            'filename includes search_text',
        );

        // Assert
        expect(filter).toBeValid();
        expect(filter).not.toMatchTaskWithPath('');
        expect(filter).toMatchTaskWithPath('/some/path/SeArch_Text.md');
        expect(filter).not.toMatchTaskWithPath('/other/search_text/file.md'); // Ignores text in folder names
    });

    it('by filename (does not include)', () => {
        // Arrange
        const filter = new FilenameField().createFilterOrErrorMessage(
            'filename does not include search_text',
        );

        // Assert
        expect(filter).toBeValid();
        expect(filter).toMatchTaskWithPath('');
        expect(filter).toMatchTaskWithPath('/other/search_text/file.md'); // Ignores text in folder names
        expect(filter).not.toMatchTaskWithPath('/SoMe/PaTh/SeArcH_Text.md');
    });

    it('by filename (regex matches)', () => {
        // Arrange
        const filter = new FilenameField().createFilterOrErrorMessage(
            String.raw`filename regex matches /w.bble/`,
        );

        // Assert
        expect(filter).toBeValid();
        expect(filter).toMatchTaskWithPath('/some/path/wibble.md');
        expect(filter).not.toMatchTaskWithPath('/some/wibble/filename.md');
    });

    it('by filename (regex does not match)', () => {
        // Arrange
        const filter = new FilenameField().createFilterOrErrorMessage(
            String.raw`filename regex does not match /w.bble/`,
        );

        // Assert
        expect(filter).toBeValid();
        expect(filter).toMatchTaskWithPath('/some/wobble/path name.md');
        expect(filter).not.toMatchTaskWithPath('/some/path/wibble.md');
    });
});
