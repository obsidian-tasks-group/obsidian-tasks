export function editTaskLabelContent(labelText: string, accessKey: string | null) {
    if (accessKey === null) {
        return capitalizeFirstLetter(labelText);
    }

    if (!labelText.toLowerCase().includes(accessKey)) {
        return `${capitalizeFirstLetter(labelText)} (<span class="accesskey">${accessKey}</span>)`;
    }

    const accessKeyIndex = labelText.toLowerCase().indexOf(accessKey);
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

function capitalizeFirstLetter(id: string) {
    return id.charAt(0).toUpperCase() + id.slice(1);
}
