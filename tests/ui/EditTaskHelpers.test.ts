import { labelContentWithAccessKey } from '../../src/ui/EditTaskHelpers';

describe('labelContentWithAccessKey() tests', () => {
    it.each([
        ['first letter', 'f', '<span class="accesskey">F</span>irst letter'],
        ['make this x the access key', 'x', 'Make this <span class="accesskey">x</span> the access key'],
        ['make this u the access key too', 'U', 'Make this u the access key too (<span class="accesskey">u</span>)'],
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
