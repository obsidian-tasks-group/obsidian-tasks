import { labelContentWithAccessKey } from '../../src/ui/EditTaskHelpers';

describe('labelContentWithAccessKey() tests', () => {
    it.each([
        [
            'first letter is the access key f, not the second',
            'f',
            '<span class="accesskey">F</span>irst letter is the access key f, not the second',
        ],
        [
            'make this x the access key even if it is in the middle',
            'x',
            'Make this <span class="accesskey">x</span> the access key even if it is in the middle',
        ],
        [
            'make this u the access key too even if the parameter is a capital U',
            'U',
            'Make this u the access key too even if the parameter is a capital U (<span class="accesskey">u</span>)',
        ],
        [
            'the last letter of the alphabet is absent here',
            'z',
            'The last letter of the alphabet is absent here (<span class="accesskey">z</span>)',
        ],
        ['access key is null', null, 'Access key is null'],
    ])("label text '%s' with access key '%s' should have label content '%s'", (labelText, accessKey, labelContent) => {
        expect(labelContentWithAccessKey(labelText, accessKey)).toEqual(labelContent);
    });
});
