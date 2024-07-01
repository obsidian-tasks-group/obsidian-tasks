import type { CachedMetadata } from 'obsidian';
import { TasksFile } from '../../src/Scripting/TasksFile';
import { no_yaml } from '../Obsidian/__test_data__/no_yaml';
import { empty_yaml } from '../Obsidian/__test_data__/empty_yaml';
import { yaml_tags_has_multiple_values } from '../Obsidian/__test_data__/yaml_tags_has_multiple_values';
import { yaml_custom_number_property } from '../Obsidian/__test_data__/yaml_custom_number_property';

describe('TasksFile', () => {
    it('should provide access to path', () => {
        const path = 'a/b/c/d.md';
        const file = new TasksFile(path);
        expect(file.path).toEqual(path);
    });

    it('should provide access to path without extension', () => {
        const path = 'a/b/c/d.md';
        const file = new TasksFile(path);
        expect(file.pathWithoutExtension).toEqual('a/b/c/d');
        expect(new TasksFile('/root/folder.mds/file.md').pathWithoutExtension).toStrictEqual('/root/folder.mds/file');
    });

    it('should provide access to the root', () => {
        expect(new TasksFile('').root).toStrictEqual('/');
        expect(new TasksFile('outside/inside/A.md').root).toStrictEqual('outside/');
        expect(new TasksFile('a_b/_c_d_/B.md').root).toStrictEqual('a_b/');
        expect(new TasksFile('/root/SeArch_Text/search_text.md').root).toStrictEqual('root/');
    });

    it('should provide access to the folder', () => {
        expect(new TasksFile('').folder).toStrictEqual('/');
        expect(new TasksFile('outside/inside/file.md').folder).toStrictEqual('outside/inside/');
        expect(new TasksFile('a_b/_c_d_/file.md').folder).toStrictEqual('a_b/_c_d_/');
    });

    it('should provide access to the filename', () => {
        expect(new TasksFile('').filename).toEqual('');
        expect(new TasksFile('file in root.md').filename).toEqual('file in root.md');
        expect(new TasksFile('directory name/file in sub-directory.md').filename).toEqual('file in sub-directory.md');
    });

    it('should provide access to the filename without extension', () => {
        expect(new TasksFile('').filenameWithoutExtension).toEqual('');
        expect(new TasksFile('file in root.md').filenameWithoutExtension).toEqual('file in root');
        expect(new TasksFile('directory name/file in sub-directory.md').filenameWithoutExtension).toEqual(
            'file in sub-directory',
        );
        // Check it only replaces the last .md
        expect(new TasksFile('1.md.only-replace.2.md').filenameWithoutExtension).toEqual('1.md.only-replace.2');

        // Check it escapes the '.' in the file extension
        expect(new TasksFile('1.md.only-replace.2,md').filenameWithoutExtension).toEqual('1.md.only-replace.2,md');
    });
});

describe('TasksFile - reading frontmatter', () => {
    it('should read file if not given CachedMetadata', () => {
        const tasksFile = new TasksFile('some path.md', {});

        expect(tasksFile.cachedMetadata.frontmatter).toBeUndefined();
        expect(tasksFile.frontmatter).toEqual({});
    });

    it('should read file with no yaml metadata', () => {
        const data = no_yaml;
        const cachedMetadata = data.cachedMetadata as any as CachedMetadata;
        const tasksFile = new TasksFile(data.filePath, cachedMetadata);

        expect(tasksFile.cachedMetadata.frontmatter).toBeUndefined();
        expect(tasksFile.frontmatter).toEqual({});
    });

    it('should read file with empty yaml metadata', () => {
        const data = empty_yaml;
        const cachedMetadata = data.cachedMetadata as any as CachedMetadata;
        const tasksFile = new TasksFile(data.filePath, cachedMetadata);

        expect(tasksFile.cachedMetadata.frontmatter).toBeUndefined();
        expect(tasksFile.frontmatter).toEqual({});
    });

    it('should read file with multiple tags in yaml metadata', () => {
        const data = yaml_tags_has_multiple_values;
        const cachedMetadata = data.cachedMetadata as any as CachedMetadata;
        const tasksFile = new TasksFile(data.filePath, cachedMetadata);

        expect(tasksFile.cachedMetadata.frontmatter?.tags).toEqual(['multiple1', 'multiple2']);
        expect(tasksFile.frontmatter.tags).toEqual(['multiple1', 'multiple2']);
    });

    // See property types: https://help.obsidian.md/Editing+and+formatting/Properties#Property+types
    // Obsidian supports the following property types:
    //  Text
    //  List
    //  Number
    //  Checkbox
    //  Date
    //  Date & time
    it('should read file with custom number property', () => {
        const data = yaml_custom_number_property;
        const cachedMetadata = data.cachedMetadata as any as CachedMetadata;
        const tasksFile = new TasksFile(data.filePath, cachedMetadata);

        expect(tasksFile.frontmatter?.custom_number_prop).toEqual(42);
    });
});
