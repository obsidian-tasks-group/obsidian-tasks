<!-- placeholder to force blank line before included text -->

| Field | Type 1 | Example 1 | Type 2 | Example 2 |
| ----- | ----- | ----- | ----- | ----- |
| `task.file.hasProperty('creation date')` | `boolean` | `true` | `boolean` | `false` |
| `task.file.property('creation date')` | `string` | `'2024-05-25T15:17:00'` | `null` | `null` |
| `task.file.property('sample_checkbox_property')` | `boolean` | `true` | `null` | `null` |
| `task.file.property('sample_date_property')` | `string` | `'2024-07-21'` | `null` | `null` |
| `task.file.property('sample_date_and_time_property')` | `string` | `'2024-07-21T12:37:00'` | `null` | `null` |
| `task.file.property('sample_list_property')` | `string[]` | `['Sample', 'List', 'Value']` | `null` | `null` |
| `task.file.property('sample_number_property')` | `number` | `246` | `null` | `null` |
| `task.file.property('sample_text_property')` | `string` | `'Sample Text Value'` | `null` | `null` |
| `task.file.property('sample_text_multiline_property')` | `string` | `'Sample\nText\nValue\n'` | `null` | `null` |
| `task.file.property('sample_link_property')` | `string` | `'[[yaml_all_property_types_populated]]'` | `null` | `null` |
| `task.file.property('sample_link_list_property')` | `string[]` | `['[[yaml_all_property_types_populated]]', '[[yaml_all_property_types_empty]]']` | `null` | `null` |
| `task.file.property('tags')` | `string[]` | `['#tag-from-file-properties']` | `any[]` | `[]` |


<!-- placeholder to force blank line after included text -->
