import { verifyAsJson } from 'approvals/lib/Providers/Jest/JestApprovals';
import { TasksFile } from '../../src/Scripting/TasksFile';
import { callouts_nested_issue_2890_unlabelled } from '../Obsidian/__test_data__/callouts_nested_issue_2890_unlabelled';
import { no_yaml } from '../Obsidian/__test_data__/no_yaml';
import { empty_yaml } from '../Obsidian/__test_data__/empty_yaml';
import { yaml_capitalised_property_name } from '../Obsidian/__test_data__/yaml_capitalised_property_name';
import { yaml_tags_has_multiple_values } from '../Obsidian/__test_data__/yaml_tags_has_multiple_values';
import { yaml_custom_number_property } from '../Obsidian/__test_data__/yaml_custom_number_property';
import { yaml_tags_with_one_value_on_new_line } from '../Obsidian/__test_data__/yaml_tags_with_one_value_on_new_line';
import { yaml_tags_field_added_by_obsidian_but_not_populated } from '../Obsidian/__test_data__/yaml_tags_field_added_by_obsidian_but_not_populated';
import { yaml_tags_had_value_then_was_emptied_by_obsidian } from '../Obsidian/__test_data__/yaml_tags_had_value_then_was_emptied_by_obsidian';
import { yaml_tags_is_empty_list } from '../Obsidian/__test_data__/yaml_tags_is_empty_list';
import { yaml_tags_is_empty } from '../Obsidian/__test_data__/yaml_tags_is_empty';
import { example_kanban } from '../Obsidian/__test_data__/example_kanban';
import { getTasksFileFromMockData, listPathAndData } from '../TestingTools/MockDataHelpers';
import { jason_properties } from '../Obsidian/__test_data__/jason_properties';
import { yaml_complex_example } from '../Obsidian/__test_data__/yaml_complex_example';
import { yaml_complex_example_standardised } from '../Obsidian/__test_data__/yaml_complex_example_standardised';
import { yaml_all_property_types_empty } from '../Obsidian/__test_data__/yaml_all_property_types_empty';
import { yaml_all_property_types_populated } from '../Obsidian/__test_data__/yaml_all_property_types_populated';
import { yaml_1_alias } from '../Obsidian/__test_data__/yaml_1_alias';
import { yaml_2_aliases } from '../Obsidian/__test_data__/yaml_2_aliases';
import { determineExpressionType, formatToRepresentType } from './ScriptingTestHelpers';

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

describe('TasksFile - raw frontmatter - identicalTo', () => {
    function expectRawFrontmatterToBeIdentical(case1: any, case2: any, expectedToBeIdentical: boolean) {
        const file1 = getTasksFileFromMockData(case1);
        const file2 = getTasksFileFromMockData(case2);
        expect(file1.rawFrontmatterIdenticalTo(file2)).toEqual(expectedToBeIdentical);
        expect(file2.rawFrontmatterIdenticalTo(file1)).toEqual(expectedToBeIdentical);
    }

    it('should treat self as identical', () => {
        expectRawFrontmatterToBeIdentical(no_yaml, no_yaml, true);
    });

    it('should treat empty frontmatter same as no frontmatter', () => {
        expectRawFrontmatterToBeIdentical(no_yaml, empty_yaml, true);
    });

    it('should recognise identical frontmatter - simple empty tags list', () => {
        expectRawFrontmatterToBeIdentical(
            yaml_tags_is_empty_list,
            yaml_tags_had_value_then_was_emptied_by_obsidian,
            true,
        );
    });

    it('should detect different alias values as different', () => {
        expectRawFrontmatterToBeIdentical(yaml_1_alias, yaml_2_aliases, false);
    });

    it('should treat missing and populated frontmatter as different', () => {
        expectRawFrontmatterToBeIdentical(no_yaml, yaml_complex_example, false);
    });
});

describe('TasksFile - reading frontmatter', () => {
    it('should read file if not given CachedMetadata', () => {
        const tasksFile = new TasksFile('some path.md', {});

        expect(tasksFile.cachedMetadata.frontmatter).toBeUndefined();
        expect(tasksFile.frontmatter).toEqual({ tags: [] });
    });

    it('should read file with no yaml metadata', () => {
        const tasksFile = getTasksFileFromMockData(no_yaml);
        expect(tasksFile.cachedMetadata.frontmatter).toBeUndefined();
        expect(tasksFile.frontmatter).toEqual({ tags: [] });
        expect(tasksFile.frontmatter.tags).toEqual([]);
    });

    it('should read file with empty yaml metadata', () => {
        const tasksFile = getTasksFileFromMockData(empty_yaml);
        expect(tasksFile.cachedMetadata.frontmatter).toBeUndefined();
        expect(tasksFile.frontmatter).toEqual({ tags: [] });
        expect(tasksFile.frontmatter.tags).toEqual([]);
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

    it('should read JSON frontmatter', () => {
        const tasksFile = getTasksFileFromMockData(jason_properties);
        expect(tasksFile.frontmatter.tags).toEqual(['#journal']);
        expect(tasksFile.frontmatter.publish).toEqual(false);
    });

    it('should read yaml_complex_example', () => {
        const tasksFile = getTasksFileFromMockData(yaml_complex_example);
        verifyAsJson(tasksFile.frontmatter);
    });

    it('should read yaml_complex_example_standardised', () => {
        const tasksFile = getTasksFileFromMockData(yaml_complex_example_standardised);
        verifyAsJson(tasksFile.frontmatter);
    });

    it('should read yaml_all_property_types_empty', () => {
        // See https://help.obsidian.md/Editing+and+formatting/Properties#Property+types
        const tasksFile = getTasksFileFromMockData(yaml_all_property_types_empty);
        verifyAsJson(tasksFile.frontmatter);
    });

    it('should read yaml_all_property_types_populated', () => {
        // See https://help.obsidian.md/Editing+and+formatting/Properties#Property+types
        const tasksFile = getTasksFileFromMockData(yaml_all_property_types_populated);
        const frontmatter = tasksFile.frontmatter;
        verifyAsJson(frontmatter);
        const propertyValueTypes = Object.keys(frontmatter).map(
            (key) =>
                `${key} => ${determineExpressionType(frontmatter[key])} = ${formatToRepresentType(frontmatter[key])}`,
        );
        expect(propertyValueTypes).toMatchInlineSnapshot(`
            [
              "sample_checkbox_property => boolean = true",
              "sample_date_property => string = '2024-07-21'",
              "sample_date_and_time_property => string = '2024-07-21T12:37:00'",
              "sample_list_property => string[] = ['Sample', 'List', 'Value']",
              "sample_number_property => number = 246",
              "sample_text_property => string = 'Sample Text Value'",
              "sample_link_property => string = '[[yaml_all_property_types_populated]]'",
              "sample_link_list_property => string[] = ['[[yaml_all_property_types_populated]]', '[[yaml_all_property_types_empty]]']",
              "aliases => string[] = ['YAML All Property Types Populated']",
              "tags => string[] = ['#sample/tag/value']",
              "creation date => string = '2024-05-25T15:17:00'",
            ]
        `);
    });
});

describe('TasksFile - reading tags', () => {
    it('should read a tag from body and the frontmatter', () => {
        const tasksFile = getTasksFileFromMockData(yaml_tags_with_one_value_on_new_line);
        expect(tasksFile.tags).toEqual(['#single-value-new-line', '#task']);
        expect(tasksFile.frontmatter.tags).toEqual(['#single-value-new-line']);
    });

    it('should return empty tag list if frontmatter not supplied', () => {
        // This confirms that accessing tags via TasksFile behaves reasonably
        // in tests of tasks that were created without CachedMetadata (as is the case with the majority of tests)
        const tasksFile = new TasksFile('somewhere.md');
        expect(tasksFile.tags).toEqual([]);
        expect(tasksFile.frontmatter.tags).toEqual([]);
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

describe('TasksFile - properties', () => {
    it('should not have any properties in a file with empty frontmatter', () => {
        const tasksFile = getTasksFileFromMockData(yaml_all_property_types_empty);

        Object.keys(tasksFile.frontmatter).forEach((key) => {
            if (key === 'tags') {
                expect(tasksFile.hasProperty(key)).toEqual(true);
            } else {
                expect(tasksFile.hasProperty(key)).toEqual(false);
            }
        });
    });

    it('should have all properties in a file with populated frontmatter', () => {
        const tasksFile = getTasksFileFromMockData(yaml_all_property_types_populated);

        Object.keys(tasksFile.frontmatter).forEach((key) => {
            expect(tasksFile.hasProperty(key)).toEqual(true);
        });
    });

    it('should treat non-exising properties correctly', () => {
        const tasksFile = getTasksFileFromMockData(no_yaml);
        expect(tasksFile.hasProperty('appleSauce')).toEqual(false);
    });

    it('should obtain a string property value', () => {
        const tasksFile = getTasksFileFromMockData(example_kanban);
        expect(tasksFile.property('kanban-plugin')).toEqual('basic');
    });

    it('should return null for a missing property value', () => {
        const tasksFile = getTasksFileFromMockData(no_yaml);
        expect(tasksFile.property('kanban-plugin')).toEqual(null);
    });

    it('should remove nulls from a list property', () => {
        const tasksFile = getTasksFileFromMockData(yaml_complex_example);
        expect(tasksFile.property('custom_list')).toEqual(['value 1', 'value 2']);
        expect(tasksFile.property('unknown_list')).toEqual([]);
    });

    it('should return properties of each type', () => {
        const tasksFile = getTasksFileFromMockData(yaml_all_property_types_populated);
        expect(tasksFile.property('sample_checkbox_property')).toEqual(true);
        expect(tasksFile.property('sample_date_property')).toEqual('2024-07-21');
        expect(tasksFile.property('sample_date_and_time_property')).toEqual('2024-07-21T12:37:00');
        expect(tasksFile.property('sample_list_property')).toEqual(['Sample', 'List', 'Value']);
        expect(tasksFile.property('sample_number_property')).toEqual(246);
        expect(tasksFile.property('sample_text_property')).toEqual('Sample Text Value');
        expect(tasksFile.property('sample_link_property')).toEqual('[[yaml_all_property_types_populated]]');
        expect(tasksFile.property('sample_link_list_property')).toEqual([
            '[[yaml_all_property_types_populated]]',
            '[[yaml_all_property_types_empty]]',
        ]);
        expect(tasksFile.property('aliases')).toEqual(['YAML All Property Types Populated']);
        expect(tasksFile.property('tags')).toEqual(['#sample/tag/value']);
        expect(tasksFile.property('creation date')).toEqual('2024-05-25T15:17:00');
    });

    it('should ignore the case of a lower case property name', () => {
        const tasksFile = getTasksFileFromMockData(yaml_all_property_types_populated);
        expect(tasksFile.hasProperty('SAMPLE_CHECKBOX_PROPERTY')).toEqual(true);
        expect(tasksFile.property('SAMPLE_CHECKBOX_PROPERTY')).toEqual(true);
    });

    it('should ignore the case of an upper case property name', () => {
        const tasksFile = getTasksFileFromMockData(yaml_capitalised_property_name);
        expect(tasksFile.hasProperty('capital_property')).toEqual(true);
        expect(tasksFile.property('capital_property')).toEqual('some value');
    });
});
