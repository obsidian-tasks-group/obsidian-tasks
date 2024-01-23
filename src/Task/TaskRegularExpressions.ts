export class TaskRegularExpressions {
    public static readonly dateFormat = 'YYYY-MM-DD';
    public static readonly dateTimeFormat = 'YYYY-MM-DD HH:mm';

    // Matches indentation before a list marker (including > for potentially nested blockquotes or Obsidian callouts)
    public static readonly indentationRegex = /^([\s\t>]*)/;

    // Matches - * and + list markers, or numbered list markers (eg 1.)
    public static readonly listMarkerRegex = /([-*+]|[0-9]+\.)/;

    // Matches a checkbox and saves the status character inside
    public static readonly checkboxRegex = /\[(.)\]/u;

    // Matches the rest of the task after the checkbox.
    public static readonly afterCheckboxRegex = / *(.*)/u;

    // Main regex for parsing a line. It matches the following:
    // - Indentation
    // - List marker
    // - Status character
    // - Rest of task after checkbox markdown
    // See Task.extractTaskComponents() for abstraction around this regular expression.
    // That is private for now, but could be made public in future if needed.
    public static readonly taskRegex = new RegExp(
        TaskRegularExpressions.indentationRegex.source +
            TaskRegularExpressions.listMarkerRegex.source +
            ' +' +
            TaskRegularExpressions.checkboxRegex.source +
            TaskRegularExpressions.afterCheckboxRegex.source,
        'u',
    );

    // Used with the "Create or Edit Task" command to parse indentation and status if present
    public static readonly nonTaskRegex = new RegExp(
        TaskRegularExpressions.indentationRegex.source +
            TaskRegularExpressions.listMarkerRegex.source +
            '? *(' +
            TaskRegularExpressions.checkboxRegex.source +
            ')?' +
            TaskRegularExpressions.afterCheckboxRegex.source,
        'u',
    );

    // Used with "Toggle Done" command to detect a list item that can get a checkbox added to it.
    public static readonly listItemRegex = new RegExp(
        TaskRegularExpressions.indentationRegex.source + TaskRegularExpressions.listMarkerRegex.source,
    );

    // Match on block link at end.
    public static readonly blockLinkRegex = / \^[a-zA-Z0-9-]+$/u;

    // Regex to match all hash tags, basically hash followed by anything but the characters in the negation.
    // To ensure URLs are not caught it is looking of beginning of string tag and any
    // tag that has a space in front of it. Any # that has a character in front
    // of it will be ignored.
    // EXAMPLE:
    // description: '#dog #car http://www/ddd#ere #house'
    // matches: #dog, #car, #house
    // MAINTENANCE NOTE:
    //  If hashTags is modified, please update 'Recognising Tags' in Tags.md in the docs.
    public static readonly hashTags = /(^|\s)#[^ !@#$%^&*(),.?":{}|<>]+/g;
    public static readonly hashTagsFromEnd = new RegExp(this.hashTags.source + '$');
}
