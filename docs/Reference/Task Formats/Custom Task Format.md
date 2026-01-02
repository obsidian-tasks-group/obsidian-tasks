# Custom Task Format

The **Custom Task Format** allows you to configure the exact text patterns used for various task components, such as dates, priorities, and recurrence rules. This is useful if you want to use a specific syntax in your raw md files that is not covered by the standard [Tasks Emoji Format](Tasks%20Emoji%20Format.md) or [Dataview Format](Dataview%20Format.md).

## Configuration

To use the Custom Format:

1. Go to **Settings** -> **Tasks**.
2. Under **Task Format**, select **Custom**.
3. A new section **Custom Format Settings** will appear below the "Dates" section.

### Date Format
You can specify the date format used for all dates (Created, Done, Due, etc.). It supports [Moment.js date formats](https://momentjs.com/docs/#/displaying/format/).

- **Default:** `DD.MM.YY` (e.g., `25.12.25`)

### Patterns
You can define the pattern for each component. Use the placeholder `%value%` to indicate where the actual value (date, priority symbol, etc.) should be placed.

> [!NOTE] Migration Warning
> Changing these strings will not affect existing entries. If you change a pattern, the plugin will no longer recognize the old format in your existing tasks. You will need to migrate them manually.

#### Defaults
The default configuration for Custom Format uses text-based markers instead of emojis:

| Component | Default Pattern | Example |
| :--- | :--- | :--- |
| **Created Date** | `(Created %value%)` | `(Created 25.12.25)` |
| **Done Date** | `(Done %value%)` | `(Done 25.12.25)` |
| **Due Date** | `(Due %value%)` | `(Due 25.12.25)` |
| **Scheduled Date** | `(Plan %value%)` | `(Plan 25.12.25)` |
| **Start Date** | `(Start %value%)` | `(Start 25.12.25)` |
| **Cancelled Date** | `(Cancelled %value%)` | `(Cancelled 25.12.25)` |
| **Recurrence** | `(Repeat %value%)` | `(Repeat every week)` |
| **Priority Highest** | `(Prio HH)` | `(Prio HH)` |
| **Priority High** | `(Prio H)` | `(Prio H)` |
| **Priority Medium** | `(Prio M)` | `(Prio M)` |
| **Priority Low** | `(Prio L)` | `(Prio L)` |
| **Priority Lowest** | `(Prio LL)` | `(Prio LL)` |

## Custom Format for Dates

<!-- snippet: DocsSamplesForTaskFormats.test.Serializer_Dates_custom-snippet.approved.md -->
```md
- [ ] #task Has a created date (Created 13.04.23)
- [ ] #task Has a scheduled date (Plan 14.04.23)
- [ ] #task Has a start date (Start 15.04.23)
- [ ] #task Has a due date (Due 16.04.23)
- [x] #task Has a done date (Done 17.04.23)
- [-] #task Has a cancelled date (Cancelled 18.04.23)
```
<!-- endSnippet -->

For more information, see [[Dates]].

## Custom Format for Priorities

<!-- snippet: DocsSamplesForTaskFormats.test.Serializer_Priorities_custom-snippet.approved.md -->
```md
- [ ] #task Lowest priority (Prio LL)
- [ ] #task Low priority (Prio L)
- [ ] #task Normal priority
- [ ] #task Medium priority (Prio M)
- [ ] #task High priority (Prio H)
- [ ] #task Highest priority (Prio HH)
```
<!-- endSnippet -->

For more information, see [[Priority]].

## Custom Format for OnCompletion

<!-- snippet: DocsSamplesForTaskFormats.test.Serializer_OnCompletion_custom-snippet.approved.md -->
```md
- [ ] #task Keep this task when done
- [ ] #task Keep this task when done too (OnCompletion keep)
- [ ] #task Remove this task when done (OnCompletion delete)
- [ ] #task Remove completed instance of this recurring task when done (Repeat every day) (OnCompletion delete)
```
<!-- endSnippet -->

For more information, see [[On Completion]].

## Custom Format for Dependencies

<!-- snippet: DocsSamplesForTaskFormats.test.Serializer_Dependencies_custom-snippet.approved.md -->
```md
- [ ] #task do this first (ID dcf64c)
- [ ] #task do this after first and some other task (DependsOn dcf64c,0h17ye)
```
<!-- endSnippet -->

For more information, see [[Task Dependencies]].
