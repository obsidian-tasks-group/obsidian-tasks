import { labelContentWithAccessKey } from '../../src/ui/EditTaskHelpers';

describe('labelContentWithAccessKey() tests', () => {
    it.each([
        [
            //should make...
            'first letter is the access key f, not the second',
            'f',
            '<span class="accesskey">F</span>irst letter is the access key f, not the second',
        ],
        [
            'should make this x the access key even if it is in the middle',
            'x',
            'Should make this <span class="accesskey">x</span> the access key even if it is in the middle',
        ],
        [
            'should keep the Capitalised letter as the access key',
            'C',
            'Should keep the <span class="accesskey">C</span>apitalised letter as the access key',
        ],
        [
            'should make this y the access key too even if the parameter is a capital Y',
            'Y',
            'Should make this <span class="accesskey">y</span> the access key too even if the parameter is a capital Y',
        ],
        [
            'should add the access key at the end of this text',
            'z',
            'Should add the access key at the end of this text (<span class="accesskey">z</span>)',
        ],
        [
            'should add the access key at the end of this text even if the parameter is capital',
            'Z',
            'Should add the access key at the end of this text even if the parameter is capital (<span class="accesskey">z</span>)',
        ],
        ['should not add an access key span here', null, 'Should not add an access key span here'],
    ])("label text '%s' with access key '%s' should have label content '%s'", (labelText, accessKey, labelContent) => {
        expect(labelContentWithAccessKey(labelText, accessKey)).toEqual(labelContent);
    });
});
