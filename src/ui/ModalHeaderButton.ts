/**
 * Position a button, styled like the modal's close button, just before the close button.
 *
 * The close button's size and position differ between Obsidian versions and themes,
 * so measure it rather than rely on a fixed offset.
 */
export function placeBesideCloseButton(modalEl: HTMLElement, button: HTMLElement) {
    window.requestAnimationFrame(() => {
        const closeButton = Array.from(
            modalEl.querySelectorAll<HTMLElement>(':scope > .modal-close-button, :scope > .modal-header-button'),
        ).find((element) => element !== button);
        if (!closeButton || closeButton.offsetWidth === 0) {
            return;
        }

        const style = window.getComputedStyle(closeButton);
        const closeButtonEnd = parseFloat(style.insetInlineEnd) || parseFloat(style.right) || 0;
        const gap = 4;
        button.style.insetInlineEnd = `${closeButtonEnd + closeButton.offsetWidth + gap}px`;
        button.style.top = style.top;
    });
}
