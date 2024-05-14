import { labelContentWithAccessKey } from '../../src/ui/EditTaskHelpers';

describe('labelContentWithAccessKey() tests', () => {
    it('should add access key span if it matches the first letter and capitalise it', () => {
        const labelContent = labelContentWithAccessKey('first letter', 'f');
        expect(labelContent).toMatchInlineSnapshot('"<span class="accesskey">F</span>irst letter"');
    });

    it('should add access key span if it matches not the first letter', () => {
        const labelContent = labelContentWithAccessKey('make this x the access key', 'x');
        expect(labelContent).toMatchInlineSnapshot('"Make this <span class="accesskey">x</span> the access key"');
    });

    it('should treat a capitalised access key in the same way as a regular one', () => {
        const labelContent = labelContentWithAccessKey('make this u the access key too', 'U');
        expect(labelContent).toMatchInlineSnapshot(
            '"Make this u the access key too (<span class="accesskey">u</span>)"',
        );
    });

    it('should not add access key span after the label text if the access key is not present in the label text', () => {
        const labelContent = labelContentWithAccessKey('the last letter of the alphabet is absent here', 'z');
        expect(labelContent).toMatchInlineSnapshot(
            '"The last letter of the alphabet is absent here (<span class="accesskey">z</span>)"',
        );
    });

    it('should not add access key span if the it is null, but should capitalise the first word', () => {
        const labelContent = labelContentWithAccessKey('access key is null', null);
        expect(labelContent).toMatchInlineSnapshot('"Access key is null"');
    });
});
