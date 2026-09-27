/**
 * Font Awesome Free icons for the priority levels, where Obsidian's Lucide icons have no suitable set.
 *
 * Font Awesome Free by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license/free (Icons: CC BY 4.0)
 * Copyright 2024 Fonticons, Inc.
 */

interface FontAwesomeIcon {
    width: number;
    height: number;
    path: string;
}

export const fontAwesomeIcons: Record<string, FontAwesomeIcon> = {
    'angles-up': {
        width: 448,
        height: 512,
        path: 'M246.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L224 109.3 361.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160zm160 352l-160-160c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L224 301.3 361.4 438.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3z',
    },
    'angle-up': {
        width: 448,
        height: 512,
        path: 'M201.4 137.4c12.5-12.5 32.8-12.5 45.3 0l160 160c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L224 205.3 86.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l160-160z',
    },
    'caret-up': {
        width: 320,
        height: 512,
        path: 'M182.6 137.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8H288c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-128-128z',
    },
    'angle-down': {
        width: 448,
        height: 512,
        path: 'M201.4 374.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 306.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z',
    },
    'angles-down': {
        width: 448,
        height: 512,
        path: 'M246.6 470.6c-12.5 12.5-32.8 12.5-45.3 0l-160-160c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L224 402.7 361.4 265.4c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3l-160 160zm160-352l-160 160c-12.5 12.5-32.8 12.5-45.3 0l-160-160c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L224 210.7 361.4 73.4c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3z',
    },
};

/**
 * Obsidian's addIcon() expects SVG content in a 100x100 box, so scale the icon's view box to fit.
 */
export function fontAwesomeSvgContent(icon: FontAwesomeIcon): string {
    return `<svg x="0" y="0" width="100" height="100" viewBox="0 0 ${icon.width} ${icon.height}" preserveAspectRatio="xMidYMid meet"><path fill="currentColor" d="${icon.path}"/></svg>`;
}
