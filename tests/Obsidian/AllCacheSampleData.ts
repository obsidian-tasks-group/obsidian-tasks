// DO NOT EDIT!
// This file is machine-generated in the test vault, by convert_test_data_markdown_to_js.js.

import type { SimulatedFile } from './SimulatedFile';

export type MockDataName =
    | 'all_link_types'
    | 'blockquote'
    | 'callout'
    | 'callout_custom'
    | 'callout_labelled'
    | 'callouts_nested_issue_2890_labelled'
    | 'callouts_nested_issue_2890_unlabelled'
    | 'code_block_in_task'
    | 'comments_html_style'
    | 'comments_markdown_style'
    | 'corrupt_rerender_issue_3715_search'
    | 'corrupt_rerender_issue_3715_tasks'
    | 'docs_sample_for_explain_query_file_defaults'
    | 'docs_sample_for_task_properties_reference'
    | 'editing_tasks_no_headings_two_tasks'
    | 'editing_tasks_no_tasks_before_first_heading'
    | 'editing_tasks_one_heading_no_tasks'
    | 'editing_tasks_one_heading_one_task'
    | 'editing_tasks_section_has_no_tasks'
    | 'editing_tasks_two_sections'
    | 'editing_tests_tasks_before_first_heading'
    | 'embed_link_in_task'
    | 'empty_yaml'
    | 'example_kanban'
    | 'inheritance_1parent1child'
    | 'inheritance_1parent1child1newroot_after_header'
    | 'inheritance_1parent1child1sibling_emptystring'
    | 'inheritance_1parent2children'
    | 'inheritance_1parent2children1grandchild'
    | 'inheritance_1parent2children1sibling'
    | 'inheritance_1parent2children2grandchildren'
    | 'inheritance_1parent2children2grandchildren1sibling'
    | 'inheritance_1parent2children2grandchildren1sibling_start_with_heading'
    | 'inheritance_2roots_listitem_listitem_task'
    | 'inheritance_2siblings'
    | 'inheritance_listitem_listitem_task'
    | 'inheritance_listitem_task'
    | 'inheritance_listitem_task_siblings'
    | 'inheritance_non_task_child'
    | 'inheritance_rendering_sample'
    | 'inheritance_task_2listitem_3task'
    | 'inheritance_task_listitem'
    | 'inheritance_task_listitem_mixed_grandchildren'
    | 'inheritance_task_listitem_task'
    | 'inheritance_task_mixed_children'
    | 'internal_heading_links'
    | 'jason_properties'
    | 'link_in_file_body'
    | 'link_in_file_body_with_custom_display_text'
    | 'link_in_heading'
    | 'link_in_task_html'
    | 'link_in_task_markdown_link'
    | 'link_in_task_wikilink'
    | 'link_in_task_wikilink_different_case'
    | 'link_in_yaml'
    | 'link_is_broken'
    | 'links_everywhere'
    | 'list_statuses'
    | 'list_styles'
    | 'mixed_list_markers'
    | 'multi_line_task_and_list_item'
    | 'multiple_headings'
    | 'no_heading'
    | 'no_yaml'
    | 'non_tasks'
    | 'numbered_list_items_standard'
    | 'numbered_list_items_with_paren'
    | 'numbered_tasks_issue_3481'
    | 'numbered_tasks_issue_3481_searches'
    | 'one_task'
    | 'query_file_defaults_all_options_false'
    | 'query_file_defaults_all_options_null'
    | 'query_file_defaults_all_options_true'
    | 'query_file_defaults_ignore_global_query'
    | 'query_file_defaults_short_mode'
    | 'query_using_properties'
    | 'yaml_1_alias'
    | 'yaml_2_aliases'
    | 'yaml_aliases_with_two_values_on_one_line'
    | 'yaml_all_property_types_empty'
    | 'yaml_all_property_types_populated'
    | 'yaml_capitalised_property_name'
    | 'yaml_complex_example'
    | 'yaml_complex_example_standardised'
    | 'yaml_cssclasses_with_two_values_on_one_line'
    | 'yaml_custom_number_property'
    | 'yaml_tags_field_added_by_obsidian_but_not_populated'
    | 'yaml_tags_had_value_then_was_emptied_by_obsidian'
    | 'yaml_tags_has_multiple_values'
    | 'yaml_tags_is_empty'
    | 'yaml_tags_is_empty_list'
    | 'yaml_tags_with_one_value_on_new_line'
    | 'yaml_tags_with_one_value_on_single_line'
    | 'yaml_tags_with_two_values_on_one_line'
    | 'yaml_tags_with_two_values_on_two_lines'
    | 'zero_width';

/**
 * Names of all the sample data in `resources/sample_vaults/Tasks-Demo/Test Data`.
 *
 * To read all the tasks in all the sample data files,
 * use {@link readAllTasksFromAllSimulatedFiles}
 *
 * Example use:
 *
 * ```typescript
 *      let output = '';
 *      AllMockDataNames.forEach((file) => {
 *          const tasksFile = getTasksFileFromMockData(file);
 *          output += visualiseLinks(tasksFile.outlinksInProperties, file);
 *      });
 *      verifyMarkdown(output);
 * ```
 *
 * Related code that uses some or all of this data:
 * - {@link SimulatedFile}
 * - {@link readTasksFromSimulatedFile}
 * - {@link getTasksFileFromMockData}
 * - {@link listPathAndData}
 * - {@link readAllTasksFromAllSimulatedFiles}
 */
export const AllMockDataNames: MockDataName[] = [
    'all_link_types',
    'blockquote',
    'callout',
    'callout_custom',
    'callout_labelled',
    'callouts_nested_issue_2890_labelled',
    'callouts_nested_issue_2890_unlabelled',
    'code_block_in_task',
    'comments_html_style',
    'comments_markdown_style',
    'corrupt_rerender_issue_3715_search',
    'corrupt_rerender_issue_3715_tasks',
    'docs_sample_for_explain_query_file_defaults',
    'docs_sample_for_task_properties_reference',
    'editing_tasks_no_headings_two_tasks',
    'editing_tasks_no_tasks_before_first_heading',
    'editing_tasks_one_heading_no_tasks',
    'editing_tasks_one_heading_one_task',
    'editing_tasks_section_has_no_tasks',
    'editing_tasks_two_sections',
    'editing_tests_tasks_before_first_heading',
    'embed_link_in_task',
    'empty_yaml',
    'example_kanban',
    'inheritance_1parent1child',
    'inheritance_1parent1child1newroot_after_header',
    'inheritance_1parent1child1sibling_emptystring',
    'inheritance_1parent2children',
    'inheritance_1parent2children1grandchild',
    'inheritance_1parent2children1sibling',
    'inheritance_1parent2children2grandchildren',
    'inheritance_1parent2children2grandchildren1sibling',
    'inheritance_1parent2children2grandchildren1sibling_start_with_heading',
    'inheritance_2roots_listitem_listitem_task',
    'inheritance_2siblings',
    'inheritance_listitem_listitem_task',
    'inheritance_listitem_task',
    'inheritance_listitem_task_siblings',
    'inheritance_non_task_child',
    'inheritance_rendering_sample',
    'inheritance_task_2listitem_3task',
    'inheritance_task_listitem',
    'inheritance_task_listitem_mixed_grandchildren',
    'inheritance_task_listitem_task',
    'inheritance_task_mixed_children',
    'internal_heading_links',
    'jason_properties',
    'link_in_file_body',
    'link_in_file_body_with_custom_display_text',
    'link_in_heading',
    'link_in_task_html',
    'link_in_task_markdown_link',
    'link_in_task_wikilink',
    'link_in_task_wikilink_different_case',
    'link_in_yaml',
    'link_is_broken',
    'links_everywhere',
    'list_statuses',
    'list_styles',
    'mixed_list_markers',
    'multi_line_task_and_list_item',
    'multiple_headings',
    'no_heading',
    'no_yaml',
    'non_tasks',
    'numbered_list_items_standard',
    'numbered_list_items_with_paren',
    'numbered_tasks_issue_3481',
    'numbered_tasks_issue_3481_searches',
    'one_task',
    'query_file_defaults_all_options_false',
    'query_file_defaults_all_options_null',
    'query_file_defaults_all_options_true',
    'query_file_defaults_ignore_global_query',
    'query_file_defaults_short_mode',
    'query_using_properties',
    'yaml_1_alias',
    'yaml_2_aliases',
    'yaml_aliases_with_two_values_on_one_line',
    'yaml_all_property_types_empty',
    'yaml_all_property_types_populated',
    'yaml_capitalised_property_name',
    'yaml_complex_example',
    'yaml_complex_example_standardised',
    'yaml_cssclasses_with_two_values_on_one_line',
    'yaml_custom_number_property',
    'yaml_tags_field_added_by_obsidian_but_not_populated',
    'yaml_tags_had_value_then_was_emptied_by_obsidian',
    'yaml_tags_has_multiple_values',
    'yaml_tags_is_empty',
    'yaml_tags_is_empty_list',
    'yaml_tags_with_one_value_on_new_line',
    'yaml_tags_with_one_value_on_single_line',
    'yaml_tags_with_two_values_on_one_line',
    'yaml_tags_with_two_values_on_two_lines',
    'zero_width',
];
