import { escapeInvisibleCharacters } from '../../src/lib/StringHelpers';

describe('StringHelpers', () => {
    it('escapeInvisibleCharacters', () => {
        const value = `
// Variation Selectors
⛔\uFE00 // VS1
⛔\uFE01 // VS2
⛔\uFE02 // VS3
⛔\uFE03 // VS4
⛔\uFE04 // VS5
⛔\uFE05 // VS6
⛔\uFE06 // VS7
⛔\uFE07 // VS8
⛔\uFE08 // VS9
⛔\uFE09 // VS10
⛔\uFE0A // VS11
⛔\uFE0B // VS12
⛔\uFE0C // VS13
⛔\uFE0D // VS14
⛔\uFE0E // VS15
⛔\uFE0F // VS16
`;
        expect(value).toMatchInlineSnapshot(`
            "
            // Variation Selectors
            ⛔︀ // VS1
            ⛔︁ // VS2
            ⛔︂ // VS3
            ⛔︃ // VS4
            ⛔︄ // VS5
            ⛔︅ // VS6
            ⛔︆ // VS7
            ⛔︇ // VS8
            ⛔︈ // VS9
            ⛔︉ // VS10
            ⛔︊ // VS11
            ⛔︋ // VS12
            ⛔︌ // VS13
            ⛔︍ // VS14
            ⛔︎ // VS15
            ⛔️ // VS16
            "
        `);

        expect(escapeInvisibleCharacters(value)).toMatchInlineSnapshot(`
            "
            // Variation Selectors
            ⛔\\ufe00 // VS1
            ⛔\\ufe01 // VS2
            ⛔\\ufe02 // VS3
            ⛔\\ufe03 // VS4
            ⛔\\ufe04 // VS5
            ⛔\\ufe05 // VS6
            ⛔\\ufe06 // VS7
            ⛔\\ufe07 // VS8
            ⛔\\ufe08 // VS9
            ⛔\\ufe09 // VS10
            ⛔\\ufe0a // VS11
            ⛔\\ufe0b // VS12
            ⛔\\ufe0c // VS13
            ⛔\\ufe0d // VS14
            ⛔\\ufe0e // VS15
            ⛔\\ufe0f // VS16
            "
        `);
    });
});
