// dataview script to create a table of Tasks plugin results.
// See 'resources/sample_vaults/Tasks-Demo/How To/Eisenhower Matrix.md' for a demonstration of use.

// General code - could be moved out if I could get import or requires to work
function tasksBlock(lines) {
    let codeBlockLanguage = input.codeBlockLanguage;
    if (codeBlockLanguage === '') {
        codeBlockLanguage = 'tasks';
    }
    return '\n\n```' + codeBlockLanguage + '\n' + lines + '\n```\n';
}

function instructionsForCell(instructions, rowInstruction, columnInstruction) {
    const label = `# Cell: (${rowInstruction.title}, ${columnInstruction.title})`;
    const specific = [
        '# Row instructions:',
        rowInstruction.instructionsBlock,
        '',
        '# Column instructions:',
        columnInstruction.instructionsBlock
    ];
    let globalInstructions = '# Global instructions:' + instructions;
    const fullInstructions = (label + '\n\n' + specific.join('\n') + '\n\n' + globalInstructions).replace(/ +/g, ' ');
    return tasksBlock(fullInstructions);
}

class RowOrColInstructions {
    constructor(title, instructionsBlock) {
        this.title = title;
        this.instructionsBlock = instructionsBlock;
    }
}

function createTasksTable(rowInstructions, columnInstructions, instructions) {
    const myTable = [];
    for (const rowInstruction of rowInstructions) {
        const columnTitles = [];
        const row = [];
        for (const columnInstruction of columnInstructions) {
            columnTitles.push(`<b>${columnInstruction.title} + ${rowInstruction.title}</b>`);
            row.push(
                instructionsForCell(instructions, rowInstruction, columnInstruction)
            );

        }
        myTable.push(columnTitles);
        myTable.push(row);
    }

    const columnTitles = columnInstructions.map(c => c.title);
    return {columnTitles, myTable};
}

function createInstructions(rows) {
    const result = [];
    for (const row of rows) {
        result.push(new RowOrColInstructions(row[0], row[1]));
    }
    return result;
}

function convertTableToString(columnTitles, myTable) {
    let result = columnTitles.toString() + '\n\n';
    result += myTable.toString();
    return result;
}

// Code specific to this view

function createColumnTitlesAndCells() {
    const rowInstructions = createInstructions(input.rows);
    const columnInstructions = createInstructions(input.columns);
    const {columnTitles, myTable} = createTasksTable(rowInstructions, columnInstructions, input.extraCommands);
    return {columnTitles, myTable};
}

// =====================================================================================
// FUNCTIONS ABOVE HERE ^^^
// =====================================================================================

const {columnTitles, myTable} = createColumnTitlesAndCells();

dv.table(columnTitles, myTable);
