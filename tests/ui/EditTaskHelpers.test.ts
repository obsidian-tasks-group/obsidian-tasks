/**
 * @jest-environment jsdom
 */
import { focusOnceClearOfKeyboard, labelContentWithAccessKey } from '../../src/ui/EditTaskHelpers';

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

describe('focusOnceClearOfKeyboard() tests', () => {
    // jsdom calculates no layout, so the two things the wait actually reads have to be supplied here: the
    // modal's transform, which is how it tells that the modal is still sliding in, and where the field is on
    // the screen.
    //
    // jsdom's viewport is 768px tall and an element measures 0, so unless a test says otherwise the keyboard
    // is expected to need no room, and anything ending above 768 counts as clear of it.
    const viewportHeight = 768;
    const realGetComputedStyle = window.getComputedStyle;
    const realOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');

    let modalEl: HTMLElement;
    let fieldEl: HTMLTextAreaElement;
    let transform: string;

    beforeEach(() => {
        transform = 'none';

        modalEl = document.createElement('div');
        modalEl.classList.add('modal');

        fieldEl = document.createElement('textarea');
        modalEl.appendChild(fieldEl);
        document.body.appendChild(modalEl);
        putFieldAt(0);

        jest.spyOn(window, 'getComputedStyle').mockImplementation((...args: unknown[]) => {
            const [el, pseudoEl] = args as [Element, string | null | undefined];

            return el === modalEl
                ? ({ transform } as unknown as CSSStyleDeclaration)
                : realGetComputedStyle(el, pseudoEl);
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
        if (realOffsetHeight) {
            Object.defineProperty(HTMLElement.prototype, 'offsetHeight', realOffsetHeight);
        }
        document.body.innerHTML = '';
    });

    /** Start the modal sliding up from the bottom of the screen, as Obsidian does on a phone. */
    function startSlidingIn() {
        transform = 'matrix(1, 0, 0, 1, 0, 800)';
    }

    /** Land the modal where it is going to stay. */
    function finishSlidingIn() {
        transform = 'none';
    }

    function putFieldAt(bottom: number) {
        fieldEl.getBoundingClientRect = () => ({ bottom } as DOMRect);
    }

    /** Pretend the keyboard needs this much room, by giving the element that measures it a height. */
    function expectKeyboardToNeed(height: number) {
        Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, get: () => height });
    }

    async function waitForFrames(count: number) {
        for (let frame = 0; frame < count; frame++) {
            await new Promise((resolve) => requestAnimationFrame(resolve));
        }
    }

    it('should focus a field that is not in a modal', async () => {
        const looseFieldEl = document.createElement('textarea');
        document.body.appendChild(looseFieldEl);

        await focusOnceClearOfKeyboard(looseFieldEl);

        expect(document.activeElement).toBe(looseFieldEl);
    });

    it('should focus the field without waiting, when the modal is not moving', async () => {
        // Where the field is does not matter: a modal that has stopped moving is where it is going to stay,
        // so the keyboard appearing cannot move the field out from under it.
        putFieldAt(viewportHeight * 10);

        await focusOnceClearOfKeyboard(fieldEl);

        expect(document.activeElement).toBe(fieldEl);
    });

    it('should not focus the field until it has risen clear of the keyboard', async () => {
        startSlidingIn();
        putFieldAt(viewportHeight * 2);

        const focused = focusOnceClearOfKeyboard(fieldEl);
        await waitForFrames(5);
        expect(document.activeElement).not.toBe(fieldEl);

        putFieldAt(viewportHeight / 2);
        await focused;

        expect(document.activeElement).toBe(fieldEl);
    });

    it('should count the space the keyboard is going to need as out of reach', async () => {
        expectKeyboardToNeed(300);
        startSlidingIn();

        // Inside the viewport, but inside the bottom 300px of it that the keyboard is going to cover.
        putFieldAt(600);

        const focused = focusOnceClearOfKeyboard(fieldEl);
        await waitForFrames(5);
        expect(document.activeElement).not.toBe(fieldEl);

        putFieldAt(400);
        await focused;

        expect(document.activeElement).toBe(fieldEl);
    });

    it('should focus the field once the modal has arrived, even if it never rose clear', async () => {
        startSlidingIn();
        putFieldAt(viewportHeight * 2);

        const focused = focusOnceClearOfKeyboard(fieldEl);
        await waitForFrames(3);
        expect(document.activeElement).not.toBe(fieldEl);

        finishSlidingIn();
        await focused;

        expect(document.activeElement).toBe(fieldEl);
    });

    it('should give up waiting, and focus the field anyway, when the modal never stops moving', async () => {
        const now = jest.spyOn(Date, 'now').mockReturnValue(0);
        startSlidingIn();
        putFieldAt(viewportHeight * 2);

        const focused = focusOnceClearOfKeyboard(fieldEl);
        await waitForFrames(3);
        expect(document.activeElement).not.toBe(fieldEl);

        // Well past the point where it stops waiting for a modal that is going nowhere.
        now.mockReturnValue(60_000);
        await focused;

        expect(document.activeElement).toBe(fieldEl);
    });

    it('should not let focusing the field scroll it into view', async () => {
        // Focus does its own scrolling to reveal the field, which would undo the point of the wait.
        const focus = jest.spyOn(fieldEl, 'focus');

        await focusOnceClearOfKeyboard(fieldEl);

        expect(focus).toHaveBeenCalledWith({ preventScroll: true });
    });

    it('should quietly do nothing if the modal is closed while the field is still rising', async () => {
        startSlidingIn();
        putFieldAt(viewportHeight * 2);

        const focused = focusOnceClearOfKeyboard(fieldEl);
        await waitForFrames(2);

        // Closing the modal takes the field out of the document with it, and a field that is not in the
        // document has no size and cannot be focused.
        modalEl.remove();
        putFieldAt(0);

        await expect(focused).resolves.toBeUndefined();
        expect(document.activeElement).not.toBe(fieldEl);
    });
});
