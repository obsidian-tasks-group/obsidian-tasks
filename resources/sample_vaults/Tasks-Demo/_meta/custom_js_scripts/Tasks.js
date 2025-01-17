class Tasks {

    /**
     * Match tasks which contain the searchString text anywhere.
     *
     * Search is case-insensitive, but spaces matter.
     *
     * @example
     * filter by function \
     *     const {Tasks} = customJS; \
     *     return Tasks.containsText(task, 'search string');
     */
    containsText(task, searchString) {
        const frontmatterCopy = JSON.parse(JSON.stringify(task.file.frontmatter, null, 4));
        // Remove any front-matter properties relating to other files, rather than the current one
        delete frontmatterCopy.up; // Will be already represented in task.path
        delete frontmatterCopy.next; // Is not related to the task file's contents
    return [
        // add more things to search?
        task.description,
        task.file.path,
        task.heading,
        task.id,
        task.dependsOn.join('\n'),
        task.status.name,
        task.priorityName,
        JSON.stringify(frontmatterCopy, null, 4),
        task.blockLink.replace(' ^', ''),
    ]
        .join('\n')
        .toLowerCase()
        .includes(searchString.toLowerCase());
    }

    /**
     * group by recurring, but only if there is a happens date.
     *
     * @example
     * group by function \
     *     const {Tasks} = customJS; \
     *     return Tasks.recurringIfHasHappensDate(task);
     */
    recurringIfHasHappensDate(task) {
        if (task.happens.moment === null) return '';
        if (task.recurrence !== null) return ['Recurring'];
        return ['Not Recurring'];
    }

    /**
     * group by all IDs in a task - its id, and anything it depends on
     *
     * @example
     * group by function \
     *     const {Tasks} = customJS; \
     *     return Tasks.allIds(task);
     */
    allIds(task) {
        const combinedIds = Array.from(task.dependsOn);
        if (task.id !== '') combinedIds.push(task.id);
        return combinedIds;
    }

    /**
     * Group tasks by whether they are:
     *  - Blocked (and cannot be done).
     *  - Blocking (and can be done).
     *  - Or are neither, and can be done in any order.
     *
     * @example
     * group by function \
     *     const {Tasks} = customJS; \
     *     return Tasks.blockingAndBlockedLabel(task, query);
     */
    blockingAndBlockedLabel(task, query) {
        const blocked = task.isBlocked(query.allTasks);
        const blocking = task.isBlocking(query.allTasks);
        if (blocked) {
            return '%%3%% 🔒 Blocked';
        }
        if (blocking) {
            return '%%1%% 🚧 Blocking';
        }
        // Maybe 🌀 or 🎲 ?
        return '%%1%% 🌀 Do in any order';
    }

    /**
     * Return true if no tasks have the given ID
     * @param id
     * @param allTasks
     */
    idMissing(id, allTasks) {
        return ! allTasks.some((task) => task.id === id);
    }

    /**
     * Return true if the task depends on any IDs which do not match any tasks in the vault.
     * @param task
     * @param query
     * @returns {boolean}
     */
    dependsOnMissingID(task, query) {
        return task.dependsOn.some((id) => this.idMissing(id, query.allTasks));
    }

    /**
     * @example
     * sort by function \
     *   const {Tasks} = customJS; \
     *   return Tasks.randomSortKey(task);
     *
     * Credit: @qelo in https://github.com/obsidian-tasks-group/obsidian-tasks/discussions/330#discussioncomment-8902878
     */
    randomSortKey(task) {
        const TSH = s => {
            for (var i = 0, h = 9; i < s.length;) h = Math.imul(h ^ s.charCodeAt(i++), 9 ** 9);
            return h ^ h >>> 9
        };
        return TSH(moment().format('Y-MM-DD') + ' ' + task.description)
    }

    byAmPm(task) {
        const tags = task.tags.join(' '); const morning = tags.includes('#when/morning'); const evening = tags.includes('#when/evening'); if (morning) return '%%1%% 🔆 Morning'; if (evening) return '%%3%% 🌅 Evening'; return '%%2%% 🕛 Anytime';
    }

    byContext(task) {
        return task.tags.filter( (tag) => tag.includes("#context/") ).map( (tag) => tag.replace("pc_", "🖥 pc_")).map( (tag) => tag.split("/")[1] ? tag.split("/").slice(1, 2) : "");
    }

    byDueScheduled(task) {
        // The Original was reversed
        return task.due.moment ? '%%2%% 📅 Due' : task.scheduled.moment ?  '%%1%% ⏳ Scheduled' : '%%3%% Undated'
    }

    byFilename(task) {
        return '📄 ' + task.file.filename.slice(0, -3);
    }

    byFolder(task) {
        return '📂 ' + task.file.folder;
    }

    /**
     * This is for use in grouping
     *
     * @example
     * group by function \
     *     const {Tasks} = customJS; \
     *     return Tasks.byImportantNotImportant(task);
     */
    byImportantNotImportant(task) {
        return task.status.name.includes('!!') ? '# 🌶️🌶️🌶️🌶️ Important' : '🤔🤔🤔🤔 Not Important';
    }

    /**
     * group by parent folder
     *
     * @example
     * group by function \
     *     const {Tasks} = customJS; \
     *     return Tasks.byParentFolder(task);
     */
    byParentFolder(task) {
        return '📂 ' + task.file.folder.slice(0, -1).split('/').pop() + '/';
    }

    byRoot(task) {
        return '📁 ' + task.file.root;
    }

    byStartTime(task) {
        const re = /^(\d\d):(\d\d) /;
        const result = re.exec(task.description);
        return result ? result[0] : '23:99';
    }

    /**
     * group by the description of the parent task or list item - otherwise 'Other Tasks'.
     * To allow for numbered list items, the the original makrdown is placed first, inside comments.
     *
     * @example
     * group by function \
     *     const {Tasks} = customJS; \
     *     return Tasks.byParentItemDescription(task);
     */
    byParentItemDescription(task) {
        const parent = task.parent;
        if (! parent) return 'Other Tasks';
        return `%%${parent.originalMarkdown}%% ${parent.description}`;
    }

    /**
     * Use an array of labels to control the order of non-alphabetical headings.
     *
     * Unknown labels are displayed first.
     * @param rawLabel
     * @param desiredLabelOrder
     * @returns {string}
     */
    byIndexOf(rawLabel, desiredLabelOrder) {
        const headingIndex = desiredLabelOrder.indexOf(rawLabel);
        if (headingIndex !== -1) {
            return `%%${headingIndex}%% ${rawLabel}`;
        } else {
            return rawLabel;
        }
    }
}
