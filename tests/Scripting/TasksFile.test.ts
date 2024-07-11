import type { CachedMetadata } from 'obsidian';
import { TasksFile } from '../../src/Scripting/TasksFile';
import { setCurrentCacheFile } from '../__mocks__/obsidian';
import { callouts_nested_issue_2890_unlabelled } from '../Obsidian/__test_data__/callouts_nested_issue_2890_unlabelled';
import { no_yaml } from '../Obsidian/__test_data__/no_yaml';
import { empty_yaml } from '../Obsidian/__test_data__/empty_yaml';
import { yaml_tags_has_multiple_values } from '../Obsidian/__test_data__/yaml_tags_has_multiple_values';
import { yaml_custom_number_property } from '../Obsidian/__test_data__/yaml_custom_number_property';
import { yaml_tags_with_one_value_on_new_line } from '../Obsidian/__test_data__/yaml_tags_with_one_value_on_new_line';
import { yaml_tags_field_added_by_obsidian_but_not_populated } from '../Obsidian/__test_data__/yaml_tags_field_added_by_obsidian_but_not_populated';
import { yaml_tags_had_value_then_was_emptied_by_obsidian } from '../Obsidian/__test_data__/yaml_tags_had_value_then_was_emptied_by_obsidian';
import { yaml_tags_is_empty_list } from '../Obsidian/__test_data__/yaml_tags_is_empty_list';
import { yaml_tags_is_empty } from '../Obsidian/__test_data__/yaml_tags_is_empty';
import { example_kanban } from '../Obsidian/__test_data__/example_kanban';

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

function getTasksFileFromMockData(data: any) {
    setCurrentCacheFile(data);
    const cachedMetadata = data.cachedMetadata as any as CachedMetadata;
    return new TasksFile(data.filePath, cachedMetadata);
}

function listPathAndData(inputs: any[]) {
    // We use map() to extract the path, to use it as a test name in it.each()
    return inputs.map((data) => [data.filePath, data]);
}

describe('TasksFile - reading frontmatter', () => {
    it('should read file if not given CachedMetadata', () => {
        const tasksFile = new TasksFile('some path.md', {});

        expect(tasksFile.cachedMetadata.frontmatter).toBeUndefined();
        expect(tasksFile.frontmatter).toEqual({});
    });

    it('should read file with no yaml metadata', () => {
        const tasksFile = getTasksFileFromMockData(no_yaml);
        expect(tasksFile.cachedMetadata.frontmatter).toBeUndefined();
        expect(tasksFile.frontmatter).toEqual({});
        expect(tasksFile.frontmatter.tags).toEqual(undefined); // TODO This will be inconvenient for users - should be []?
    });

    it('should read file with empty yaml metadata', () => {
        const tasksFile = getTasksFileFromMockData(empty_yaml);
        expect(tasksFile.cachedMetadata.frontmatter).toBeUndefined();
        expect(tasksFile.frontmatter).toEqual({});
        expect(tasksFile.frontmatter.tags).toEqual(undefined); // TODO This will be inconvenient for users - should be []?
    });

    it('should provide an independent copy of frontmatter', () => {
        const tasksFile = getTasksFileFromMockData(yaml_tags_has_multiple_values);

        expect(tasksFile.frontmatter).not.toBe(tasksFile.cachedMetadata.frontmatter);

        expect(tasksFile.cachedMetadata.frontmatter?.tags).toEqual(['multiple1', 'multiple2']);
        expect(tasksFile.frontmatter.tags).toEqual(['#multiple1', '#multiple2']);

        tasksFile.frontmatter.tags.push('newTag');
        expect(tasksFile.cachedMetadata.frontmatter?.tags).toEqual(['multiple1', 'multiple2']);
        expect(tasksFile.frontmatter.tags).toEqual(['#multiple1', '#multiple2', 'newTag']);
    });

    it('should read file with multiple tags in yaml metadata', () => {
        const tasksFile = getTasksFileFromMockData(yaml_tags_has_multiple_values);
        expect(tasksFile.cachedMetadata.frontmatter?.tags).toEqual(['multiple1', 'multiple2']);
    });

    it('should detect whether file is a kanban plugin board', () => {
        const tasksFile = getTasksFileFromMockData(example_kanban);

        expect(tasksFile.frontmatter['kanban-plugin']).toEqual('basic');
        // An example search might be:
        //      filter by function task.file.frontmatter['kanban-plugin'] !== undefined

        // TODO Consider sanitising property names:
        //      See dataview docs for ideas:
        //          https://blacksmithgu.github.io/obsidian-dataview/annotation/add-metadata/#field-names
        expect(tasksFile.frontmatter.kanban_plugin).toBeUndefined();
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
        const tasksFile = getTasksFileFromMockData(yaml_custom_number_property);
        expect(tasksFile.frontmatter?.custom_number_prop).toEqual(42);
    });
});

describe('TasksFile - reading tags', () => {
    it('should read a tag from body and the frontmatter', () => {
        const tasksFile = getTasksFileFromMockData(yaml_tags_with_one_value_on_new_line);
        expect(tasksFile.tags).toEqual(['#single-value-new-line', '#task']);
        expect(tasksFile.frontmatter.tags).toEqual(['#single-value-new-line']);
    });

    it('should read tags from body of file without duplication', () => {
        const tasksFile = getTasksFileFromMockData(callouts_nested_issue_2890_unlabelled);
        expect(tasksFile.tags).toEqual(['#task']);
    });

    it.each(
        listPathAndData([
            yaml_custom_number_property, // no tags value in frontmatter
            yaml_tags_field_added_by_obsidian_but_not_populated,
            yaml_tags_had_value_then_was_emptied_by_obsidian,
            yaml_tags_is_empty_list,
            yaml_tags_is_empty,
        ]),
    )('should provide empty list if no tags in frontmatter: "%s"', (_path: string, data: any) => {
        const tasksFile = getTasksFileFromMockData(data);
        expect(tasksFile.frontmatter.tags).toEqual([]);
    });
});
