import { verifyAsJson } from 'approvals/lib/Providers/Jest/JestApprovals';
import type { Reference } from 'obsidian';
import { TasksFile } from '../../src/Scripting/TasksFile';
import { getTasksFileFromMockData, listPathAndData } from '../TestingTools/MockDataHelpers';
import { LinkResolver } from '../../src/Task/LinkResolver';
import type { MockDataName } from '../Obsidian/AllCacheSampleData';
import { getAllTags, getFirstLinkpathDest, parseFrontMatterTags } from '../__mocks__/obsidian';
import { MockDataLoader } from '../TestingTools/MockDataLoader';
import { determineExpressionType, formatToRepresentType } from './ScriptingTestHelpers';

afterEach(() => {
    LinkResolver.getInstance().resetGetFirstLinkpathDestFn();
});

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
    function expectRawFrontmatterToBeIdentical(
        case1: MockDataName,
        case2: MockDataName,
        expectedToBeIdentical: boolean,
    ) {
        const file1 = getTasksFileFromMockData(case1);
        const file2 = getTasksFileFromMockData(case2);
        expect(file1.rawFrontmatterIdenticalTo(file2)).toEqual(expectedToBeIdentical);
        expect(file2.rawFrontmatterIdenticalTo(file1)).toEqual(expectedToBeIdentical);
    }

    it('should treat self as identical', () => {
        expectRawFrontmatterToBeIdentical('no_yaml', 'no_yaml', true);
    });

    it('should treat empty frontmatter same as no frontmatter', () => {
        expectRawFrontmatterToBeIdentical('no_yaml', 'empty_yaml', true);
    });

    it('should recognise identical frontmatter - simple empty tags list', () => {
        expectRawFrontmatterToBeIdentical(
            'yaml_tags_is_empty_list',
            'yaml_tags_had_value_then_was_emptied_by_obsidian',
            true,
        );
    });

    it('should detect different alias values as different', () => {
        expectRawFrontmatterToBeIdentical('yaml_1_alias', 'yaml_2_aliases', false);
    });

    it('should treat missing and populated frontmatter as different', () => {
        expectRawFrontmatterToBeIdentical('no_yaml', 'yaml_complex_example', false);
    });
});

describe('TasksFile - reading frontmatter', () => {
    it('should read file if not given CachedMetadata', () => {
        const tasksFile = new TasksFile('some path.md', {});

        expect(tasksFile.cachedMetadata.frontmatter).toBeUndefined();
        expect(tasksFile.frontmatter).toEqual({ tags: [] });
    });

    it('should read file with no yaml metadata', () => {
        const tasksFile = getTasksFileFromMockData('no_yaml');
        expect(tasksFile.cachedMetadata.frontmatter).toBeUndefined();
        expect(tasksFile.frontmatter).toEqual({ tags: [] });
        expect(tasksFile.frontmatter.tags).toEqual([]);
    });

    it('should read file with empty yaml metadata', () => {
        const tasksFile = getTasksFileFromMockData('empty_yaml');
        expect(tasksFile.cachedMetadata.frontmatter).toBeUndefined();
        expect(tasksFile.frontmatter).toEqual({ tags: [] });
        expect(tasksFile.frontmatter.tags).toEqual([]);
    });

    it('should provide an independent copy of frontmatter', () => {
        const tasksFile = getTasksFileFromMockData('yaml_tags_has_multiple_values');

        expect(tasksFile.frontmatter).not.toBe(tasksFile.cachedMetadata.frontmatter);

        expect(tasksFile.cachedMetadata.frontmatter?.tags).toEqual(['multiple1', 'multiple2']);
        expect(tasksFile.frontmatter.tags).toEqual(['#multiple1', '#multiple2']);

        tasksFile.frontmatter.tags.push('newTag');
        expect(tasksFile.cachedMetadata.frontmatter?.tags).toEqual(['multiple1', 'multiple2']);
        expect(tasksFile.frontmatter.tags).toEqual(['#multiple1', '#multiple2', 'newTag']);
    });

    it('should read file with multiple tags in yaml metadata', () => {
        const tasksFile = getTasksFileFromMockData('yaml_tags_has_multiple_values');
        expect(tasksFile.cachedMetadata.frontmatter?.tags).toEqual(['multiple1', 'multiple2']);
    });

    it('should detect whether file is a kanban plugin board', () => {
        const tasksFile = getTasksFileFromMockData('example_kanban');

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
        const tasksFile = getTasksFileFromMockData('yaml_custom_number_property');
        expect(tasksFile.frontmatter?.custom_number_prop).toEqual(42);
    });

    it('should read JSON frontmatter', () => {
        const tasksFile = getTasksFileFromMockData('jason_properties');
        // Obsidian 1.9.x change in behaviour: See #3482
        // The tags line in frontmatter is:
        //        "tags": "journal",
        // Obsidian 1.8.10 and earlier read this as an array:
        //      ["#journal"]
        // Obsidian 1.9.0 to 1.9.2 reads this as an empty array:
        //      []
        // Obsidian 1.9.4 again reads this as an array:
        //      ["#journal"]
        expect(tasksFile.frontmatter.tags).toEqual(['#journal']);
        expect(tasksFile.frontmatter.publish).toEqual(false);
    });

    it('should read yaml_complex_example', () => {
        const tasksFile = getTasksFileFromMockData('yaml_complex_example');
        // Obsidian 1.9.x change in behaviour: See #3482
        // The tags line in frontmatter is:
        //      TAG:
        //          - value1
        //          - value2
        // Obsidian 1.8.10 and earlier read tags as an array:
        //      ["#value1", "#value2"]
        // Obsidian 1.9.0 to 1.9.2 reads tags as an empty array:
        //      []

        verifyAsJson(tasksFile.frontmatter);
    });

    it('should read yaml_complex_example_standardised', () => {
        const tasksFile = getTasksFileFromMockData('yaml_complex_example_standardised');
        verifyAsJson(tasksFile.frontmatter);
    });

    it('should read yaml_all_property_types_empty', () => {
        // See https://help.obsidian.md/Editing+and+formatting/Properties#Property+types
        const tasksFile = getTasksFileFromMockData('yaml_all_property_types_empty');
        verifyAsJson(tasksFile.frontmatter);
    });

    it('should read yaml_all_property_types_populated', () => {
        // See https://help.obsidian.md/Editing+and+formatting/Properties#Property+types
        const tasksFile = getTasksFileFromMockData('yaml_all_property_types_populated');
        const frontmatter = tasksFile.frontmatter;
        verifyAsJson(frontmatter);
        const propertyValueTypes = Object.keys(frontmatter).map(
            (key) =>
                `${key} => ${determineExpressionType(frontmatter[key])} = ${formatToRepresentType(frontmatter[key])}`,
        );
        expect(propertyValueTypes).toMatchInlineSnapshot(`
            [
              "aliases => string[] = ['YAML All Property Types Populated']",
              "creation date => string = '2024-05-25T15:17:00'",
              "sample_checkbox_property => boolean = true",
              "sample_date_and_time_property => string = '2024-07-21T12:37:00'",
              "sample_date_property => string = '2024-07-21'",
              "sample_link_list_property => string[] = ['[[yaml_all_property_types_populated]]', '[[yaml_all_property_types_empty]]']",
              "sample_link_property => string = '[[yaml_all_property_types_populated]]'",
              "sample_list_property => string[] = ['Sample', 'List', 'Value']",
              "sample_number_property => number = 246",
              "sample_text_property => string = 'Sample Text Value'",
              "tags => string[] = ['#sample/tag/value']",
            ]
        `);
    });
});

describe('TasksFile - accessing links', () => {
    it('should access all links in the file - both properties and body', () => {
        const tasksFile = getTasksFileFromMockData('links_everywhere');
        expect(tasksFile.outlinks.length).toEqual(5);
        expect(tasksFile.outlinks.map((link) => link.originalMarkdown)).toMatchInlineSnapshot(`
            [
              "[[link_in_yaml]]",
              "[[#A link in a link_in_heading]]",
              "[[link_in_file_body]]",
              "[[link_in_heading]]",
              "[[link_in_task_wikilink]]",
            ]
        `);
    });

    it('should access all links in the file body', () => {
        {
            const tasksFile = getTasksFileFromMockData('links_everywhere');
            expect(tasksFile.outlinksInBody.length).toEqual(3);
            expect(tasksFile.outlinksInBody[0].originalMarkdown).toEqual('[[link_in_file_body]]');
        }

        {
            const tasksFile = getTasksFileFromMockData('link_in_yaml');
            expect(tasksFile.outlinksInBody.length).toEqual(0);
        }
    });

    it('should access all links in properties', () => {
        const tasksFile = getTasksFileFromMockData('link_in_yaml');
        expect(tasksFile.outlinksInProperties.length).toEqual(1);
        expect(tasksFile.outlinksInProperties[0].originalMarkdown).toEqual('[[yaml_tags_is_empty]]');
        expect(tasksFile.outlinksInProperties[0].destinationPath).toBeNull();
    });

    it('should save destinationPath when LinksResolver is supplied', () => {
        LinkResolver.getInstance().setGetFirstLinkpathDestFn(
            (_rawLink: Reference, _sourcePath: string) => 'Hello World.md',
        );

        const tasksFile = getTasksFileFromMockData('link_in_yaml');
        expect(tasksFile.outlinksInProperties[0].originalMarkdown).toEqual('[[yaml_tags_is_empty]]');
        expect(tasksFile.outlinksInProperties[0].destinationPath).toEqual('Hello World.md');
    });
});

describe('TasksFile - reading tags', () => {
    it('should read a tag from body and the frontmatter', () => {
        const tasksFile = getTasksFileFromMockData('yaml_tags_with_one_value_on_new_line');
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
        const tasksFile = getTasksFileFromMockData('callouts_nested_issue_2890_unlabelled');
        expect(tasksFile.tags).toEqual(['#task']);
    });

    // begin-snippet: iterate-over-multiple-SimulatedFiles
    it.each(
        listPathAndData([
            'yaml_custom_number_property', // no tags value in frontmatter
            'yaml_tags_field_added_by_obsidian_but_not_populated',
            'yaml_tags_had_value_then_was_emptied_by_obsidian',
            'yaml_tags_is_empty_list',
            'yaml_tags_is_empty',
        ]),
    )('should provide empty list if no tags in frontmatter: "%s"', (_path: string, testDataName: MockDataName) => {
        const tasksFile = getTasksFileFromMockData(testDataName);
        expect(tasksFile.frontmatter.tags).toEqual([]);
    });
    // end-snippet

    it('should be able to read all tags for any loaded SimulatedFile', () => {
        const file1 = getTasksFileFromMockData('yaml_tags_with_one_value_on_new_line');
        expect(getAllTags(file1.cachedMetadata)).toEqual(['#single-value-new-line', '#task']);

        const file2 = getTasksFileFromMockData('yaml_tags_with_one_value_on_single_line');
        expect(getAllTags(file2.cachedMetadata)).toEqual(['#single-value-single-line', '#task']);

        // Now see if we can again find the tags in file1
        expect(getAllTags(file1.cachedMetadata)).toEqual(['#single-value-new-line', '#task']);
    });

    it('should be able to read frontmatter tags for any loaded SimulatedFile', () => {
        const file1 = getTasksFileFromMockData('yaml_tags_with_one_value_on_new_line');
        expect(parseFrontMatterTags(file1.cachedMetadata.frontmatter)).toEqual(['#single-value-new-line']);

        const file2 = getTasksFileFromMockData('yaml_tags_with_one_value_on_single_line');
        expect(parseFrontMatterTags(file2.cachedMetadata.frontmatter)).toEqual(['#single-value-single-line']);

        // Now see if we can again find the tags in file1
        expect(parseFrontMatterTags(file1.cachedMetadata.frontmatter)).toEqual(['#single-value-new-line']);

        const t = () => {
            parseFrontMatterTags(file1.frontmatter);
        };
        expect(t).toThrow(Error);
        expect(t).toThrowError(
            'FrontMatterCache not found in any loaded SimulatedFile. Did you supply TasksFile.frontmatter instead of TasksFile.cachedMetadata.frontmatter?',
        );
    });

    it('should be able to call getFirstLinkpathDest() for any loaded SimulatedFile', () => {
        function loadMockDataAndResolveFirstLink(testDataName: MockDataName, expectedLinkSource: string) {
            const file = getTasksFileFromMockData(testDataName);
            const link = file.cachedMetadata.links![0];
            expect(link.original).toMatchInlineSnapshot(expectedLinkSource);
            const markdownPath = MockDataLoader.markdownPath(testDataName);
            const firstLinkpathDest = getFirstLinkpathDest(link, markdownPath);
            return { link, markdownPath, firstLinkpathDest };
        }

        const destination1 = loadMockDataAndResolveFirstLink('link_in_file_body', '"[[yaml_tags_is_empty]]"');
        expect(destination1.firstLinkpathDest).toMatchInlineSnapshot('"Test Data/yaml_tags_is_empty.md"');

        const destination2 = loadMockDataAndResolveFirstLink('link_in_heading', '"[[multiple_headings]]"');
        expect(destination2.firstLinkpathDest).toMatchInlineSnapshot('"Test Data/multiple_headings.md"');

        // Now see if we can again resolve the link from file1
        expect(getFirstLinkpathDest(destination1.link, destination1.markdownPath)).toMatchInlineSnapshot(
            '"Test Data/yaml_tags_is_empty.md"',
        );
    });
});

describe('TasksFile - properties', () => {
    it('should not have any properties in a file with empty frontmatter', () => {
        const tasksFile = getTasksFileFromMockData('yaml_all_property_types_empty');

        Object.keys(tasksFile.frontmatter).forEach((key) => {
            if (key === 'tags') {
                expect(tasksFile.hasProperty(key)).toEqual(true);
            } else {
                expect(tasksFile.hasProperty(key)).toEqual(false);
            }
        });
    });

    it('should have all properties in a file with populated frontmatter', () => {
        const tasksFile = getTasksFileFromMockData('yaml_all_property_types_populated');

        Object.keys(tasksFile.frontmatter).forEach((key) => {
            expect(tasksFile.hasProperty(key)).toEqual(true);
        });
    });

    it('should treat non-exising properties correctly', () => {
        // begin-snippet: getTasksFileFromMockData
        const tasksFile = getTasksFileFromMockData('no_yaml');
        // end-snippet
        expect(tasksFile.hasProperty('appleSauce')).toEqual(false);
    });

    it('should obtain a string property value', () => {
        const tasksFile = getTasksFileFromMockData('example_kanban');
        expect(tasksFile.property('kanban-plugin')).toEqual('basic');
    });

    it('should return null for a missing property value', () => {
        const tasksFile = getTasksFileFromMockData('no_yaml');
        expect(tasksFile.property('kanban-plugin')).toEqual(null);
    });

    it('should remove nulls from a list property', () => {
        const tasksFile = getTasksFileFromMockData('yaml_complex_example');
        expect(tasksFile.property('custom_list')).toEqual(['value 1', 'value 2']);
        expect(tasksFile.property('unknown_list')).toEqual([]);
    });

    it('should return properties of each type', () => {
        const tasksFile = getTasksFileFromMockData('yaml_all_property_types_populated');
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
        const tasksFile = getTasksFileFromMockData('yaml_all_property_types_populated');
        expect(tasksFile.hasProperty('SAMPLE_CHECKBOX_PROPERTY')).toEqual(true);
        expect(tasksFile.property('SAMPLE_CHECKBOX_PROPERTY')).toEqual(true);
    });

    it('should ignore the case of an upper case property name', () => {
        const tasksFile = getTasksFileFromMockData('yaml_capitalised_property_name');
        expect(tasksFile.hasProperty('capital_property')).toEqual(true);
        expect(tasksFile.property('capital_property')).toEqual('some value');
    });
});

describe('TasksFile - identicalTo', () => {
    const path = 'a/b/c/d.md';
    const cachedMetadata = {};

    it('should detect identical objects', () => {
        const lhs = new TasksFile(path, cachedMetadata);
        const rhs = new TasksFile(path, cachedMetadata);
        expect(lhs.identicalTo(rhs)).toEqual(true);
    });

    it('should check path', () => {
        const lhs = new TasksFile(path, cachedMetadata);
        const rhs = new TasksFile('somewhere else.md', cachedMetadata);
        expect(lhs.identicalTo(rhs)).toEqual(false);
    });

    it('should check cachedMetadata', () => {
        const lhs = getTasksFileFromMockData('example_kanban');
        expect(lhs.identicalTo(getTasksFileFromMockData('example_kanban'))).toEqual(true);
        expect(lhs.identicalTo(getTasksFileFromMockData('jason_properties'))).toEqual(false);
    });
});
