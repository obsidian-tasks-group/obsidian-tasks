# Custom Task Format

The **Custom Task Format** allows you to configure the exact text patterns used for various task components, such as dates, priorities, and recurrence rules. This is useful if you want to use a specific syntax that is not covered by the standard [Tasks Emoji Format](Tasks%20Emoji%20Format.md) or [Dataview Format](Dataview%20Format.md).

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

## Example
With the default Custom Format settings, a task might look like this:

```markdown
- [ ] Call Alice (Prio H) (Due 25.12.25) (Repeat every week)
```
