export function editTaskLabelContent(id: string, accessKey: string | null) {
    if (accessKey === null) {
        return capitalizeFirstLetter(id);
    }

    if (!id.includes(accessKey)) {
        return `${capitalizeFirstLetter(id)} (<span class="accesskey">${accessKey}</span>)`;
    }

    const accessKeyIndex = id.indexOf(accessKey);
    let labelContent = id.substring(0, accessKeyIndex);
    labelContent += '<span class="accesskey">';

    if (accessKeyIndex === 0) {
        labelContent += id.substring(accessKeyIndex, accessKeyIndex + 1).toUpperCase();
    } else {
        labelContent += id.substring(accessKeyIndex, accessKeyIndex + 1);
    }

    labelContent += '</span>';
    labelContent += id.substring(accessKeyIndex + 1);
    labelContent = capitalizeFirstLetter(labelContent);
    return labelContent;
}

function capitalizeFirstLetter(id: string) {
    return id.charAt(0).toUpperCase() + id.slice(1);
}
