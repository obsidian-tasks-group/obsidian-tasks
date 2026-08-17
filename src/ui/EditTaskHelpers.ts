import { capitalizeFirstLetter } from '../lib/StringHelpers';

/**
 * Returns contents for a `<label>` HTML element.
 *
 * If the {@link accessKey} is found in the label text (case-insensitive), it will be given `accesskey` class
 * within a `<span>` HTML element. Else the access key will be added at the end of the label text,
 * surrounded with round brackets.
 *
 * The first letter of the label will be capitalised.
 *
 * @param labelText to be displayed in the <label> HTML element.
 * @param accessKey optional access key. Set to null if not needed.
 */
export function labelContentWithAccessKey(labelText: string, accessKey: string | null) {
    if (accessKey === null) {
        return capitalizeFirstLetter(labelText);
    }

    const accessKeyIndex = labelText.toLowerCase().indexOf(accessKey.toLowerCase());
    if (accessKeyIndex === -1) {
        return `${capitalizeFirstLetter(labelText)} (<span class="accesskey">${accessKey.toLowerCase()}</span>)`;
    }

    let labelContent = labelText.substring(0, accessKeyIndex);
    labelContent += '<span class="accesskey">';

    if (accessKeyIndex === 0) {
        labelContent += labelText.substring(accessKeyIndex, accessKeyIndex + 1).toUpperCase();
    } else {
        labelContent += labelText.substring(accessKeyIndex, accessKeyIndex + 1);
    }

    labelContent += '</span>';
    labelContent += labelText.substring(accessKeyIndex + 1);
    labelContent = capitalizeFirstLetter(labelContent);
    return labelContent;
}

/** How long to wait for the element to rise clear of the software keyboard. */
const riseTimeout = 400;

/**
 * A modal that is not moving has no transform of its own. Browsers report that as 'none', or as an identity
 * matrix if a transition happens to settle on one, and jsdom - which does not calculate transforms - as ''.
 */
const stationaryTransforms = ['none', '', 'matrix(1, 0, 0, 1, 0, 0)'];

/**
 * Focus an element, without the software keyboard scrolling the modal it sits in.
 *
 * On a phone, Obsidian opens a modal by sliding it up from the bottom of the screen, which takes up to 250ms.
 * Until that finishes, everything in the modal is lower down the screen than where it will end up.
 *
 * Focus something during the slide and WebKit remembers where it was at that moment. The keyboard then
 * appears, WebKit scrolls the modal's content to bring that remembered spot into view, and the form is left
 * part way down. `preventScroll` is no help - it only stops the scrolling that `focus()` itself would do.
 *
 * Two other fixes were tried first. Waiting for the whole slide is reliable, but then nothing can start the
 * keyboard until around 300ms in, and it feels sluggish. Focusing straight away and scrolling back afterwards
 * is fast, but you can see it happen: the browser scrolls on the compositor and paints before we put it back.
 *
 * So wait only until the keyboard will not cover the element. From that point WebKit can see all of it and
 * has no reason to scroll anywhere. That comes well before the slide ends, because the easing covers most of
 * the distance early on and then inches through the last few pixels.
 *
 * @param el the element to focus, which should be near enough the top of the form to fit above the keyboard.
 */
export async function focusOnceClearOfKeyboard(el: HTMLElement) {
    // Obsidian applies the modal's starting transform just after building its content, and so just after this
    // was called. Wait a frame, or the modal still looks like it is exactly where it is going to end up.
    await nextAnimationFrame();

    // A modal that is not moving is already where it will end up, so the keyboard has nothing it can scroll.
    // Same goes for desktop, for animations turned off, and for a form rendered outside a modal altogether.
    const modalEl = el.closest<HTMLElement>('.modal');
    if (modalEl && isMoving(modalEl)) {
        await waitUntilAboveKeyboard(el, modalEl);
    }

    // Focusing an element that has since been removed does nothing, which is what we want if the modal was
    // closed while we were waiting.
    el.focus({ preventScroll: true });
}

/** Wait until all of the element is above the space the software keyboard is going to take up. */
async function waitUntilAboveKeyboard(el: HTMLElement, modalEl: HTMLElement) {
    const view = modalEl.ownerDocument.defaultView;
    const viewportHeight = view?.visualViewport?.height ?? view?.innerHeight ?? 0;
    const keyboardTop = viewportHeight - keyboardSpace(modalEl);
    const giveUpAt = Date.now() + riseTimeout;

    while (Date.now() < giveUpAt) {
        // Bounding boxes include the transform that is sliding the modal up, so this is where the element is
        // on screen now, not where it will end up. Closing the modal shrinks the box to nothing, which ends
        // the wait as well.
        if (el.getBoundingClientRect().bottom <= keyboardTop) {
            return;
        }

        // Once the modal has arrived, the element is as high up as it is ever going to get.
        if (!isMoving(modalEl)) {
            return;
        }

        await nextAnimationFrame();
    }
}

/**
 * How much room the software keyboard is expected to need, in pixels.
 *
 * Read from the property TaskModal.scss sets, rather than repeated here, so that a snippet overriding it moves
 * the padding below the form and this wait together. Measuring a real element resolves whatever units it is
 * written in - `vh`, `clamp()`, anything - exactly as the browser will.
 */
function keyboardSpace(modalEl: HTMLElement) {
    const probe = modalEl.ownerDocument.createElement('div');
    probe.style.cssText =
        'position:absolute;visibility:hidden;pointer-events:none;width:0;' +
        'height:var(--tasks-keyboard-space-allowance, clamp(220px, 35vh, 360px))';

    modalEl.appendChild(probe);
    const space = probe.offsetHeight;
    probe.remove();

    return space;
}

function isMoving(modalEl: HTMLElement) {
    // Ask the modal's own window, as Obsidian can open modals in pop-out windows.
    const transform = modalEl.ownerDocument.defaultView?.getComputedStyle(modalEl).transform;

    return transform !== undefined && !stationaryTransforms.includes(transform);
}

function nextAnimationFrame() {
    return new Promise<void>((resolve) => {
        if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(() => resolve());
        } else {
            // Test environments that have no rendering loop to wait for.
            setTimeout(resolve, 0);
        }
    });
}
