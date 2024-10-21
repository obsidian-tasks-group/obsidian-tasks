export const mockHTMLRenderer = async (text: string, element: HTMLSpanElement, _path: string) => {
    // Contrary to the default mockTextRenderer(),
    // instead of the rendered HTMLSpanElement.innerText,
    // we need the plain HTML here like in TaskLineRenderer.renderComponentText(),
    // to ensure that description and tags are retained.
    element.innerHTML = text;
};

export const mockTextRenderer = async (text: string, element: HTMLSpanElement, _path: string) => {
    element.innerText = text;
};
