import { verify } from 'approvals/lib/Providers/Jest/JestApprovals';
import { DescriptionField } from '../../../src/Query/Filter/DescriptionField';
import { Query } from '../../../src/Query/Query';

describe('should report regular expression errors to user ', () => {
    it('should report mismatched parenthesis', () => {
        const instruction = 'description regex matches /hello(/';
        const filterOrError = new DescriptionField().createFilterOrErrorMessage(instruction);
        expect(filterOrError.error).toEqual(
            'Error: Parsing regular expression. The error message was: "SyntaxError: Invalid regular expression: /hello(/: Unterminated group"',
        );
    });
});

describe('explains regular sub-string searches', () => {
    it('should explain simple string search', () => {
        const instruction = 'description includes hello';
        const field = new DescriptionField().createFilterOrErrorMessage(instruction);
        expect(field).toHaveExplanation('description includes hello');
    });
});

describe('explains regular expression searches', () => {
    it('should explain regex matches search', () => {
        const instruction = 'description regex matches /hello/';
        const field = new DescriptionField().createFilterOrErrorMessage(instruction);
        expect(field).toHaveExplanation("using regex:            'hello' with no flags");
    });

    it('should explain regex does not match search', () => {
        const instruction = 'description regex does not match /hello/';
        const field = new DescriptionField().createFilterOrErrorMessage(instruction);
        expect(field).toHaveExplanation("using regex:                   'hello' with no flags");
    });

    it('bulk test', () => {
        /* This test uses Approval Tests' verify() to quickly get good coverage on a wide variety
           of regular expression examples.
         */

        // Arrange
        // Alphabetical order please
        const source = `
            description regex does not match /(buy|order|voucher|lakeland|purchase|\\spresent)/i
            description regex does not match /^$/
            description regex matches /  /
            description regex matches /#context/pc_photos|#context/pc_clare|#context/pc_macbook/i
            description regex matches /#context\\/pc_photos|#context\\/pc_clare|#context\\/pc_macbook/i
            description regex matches /#tag\\/subtag[0-9]\\/subsubtag[0-9]/i
            description regex matches /(buy|order|voucher|lakeland|purchase|\\spresent)/i
            description regex matches /[⏫🔼🔽📅⏳🛫🔁]/
            description regex matches /[⏫🔼🔽📅⏳🛫🔁]/u
            description regex matches /^$/
            description regex matches /^Log/i
            description regex matches /waiting|waits|wartet/
            description regex matches /waiting|waits|wartet/i
            filename regex does not match /^Tasks User Support Kanban\\.md$/
            folder regex matches /root/sub-folder/sub-sub-folder/
            folder regex matches /root\\/sub-folder\\/sub-sub-folder/
            heading regex matches /^Exactly Matched Heading$/
            path regex does not match /^_meta/
            path regex does not match /^_templates/
            path regex does not match /sadfasfdafa/i
            path regex does not match /sadfasfdafa/igm
            path regex does not match /w.bble/
            path regex matches /(george phone|exercise|100th|knee|TRVs|HWRC|2023-03-21 Python Pairing on the Hub with so-and-so|Epson|Fred's flat|1519 - feat - Theme-ability|McDermid)/i
            path regex matches /(george)/i
            path regex matches /Log/
            path regex matches /clare/i
            path regex matches /root/sub-folder/sub-sub-folder/index\\.md/
            path regex matches /root\\/sub-folder\\/sub-sub-folder\\/index\\.md/
            path regex matches /sadfasfdafa/i
            recurrence regex does not match /\\d/
            recurrence regex matches /\\d/
            tag regex does not match /./
            tag regex matches /#book$/
            tag regex matches /#t$/
            tags regex does not match /(home|town)/
            tags regex matches /(home|pc_mac|town)/
`;
        const query = new Query({ source });

        // Assert
        verify(query.explainQuery() + `\nError: ${query.error ?? 'None'}`);
    });
});
