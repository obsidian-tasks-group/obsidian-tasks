import moment from 'moment';
import { GlobalFilter } from '../../src/Config/GlobalFilter';
import { findDataviewFieldRanges, findSignifierRanges, propertyRangesForLine } from '../../src/Obsidian/SignifierIcons';

jest.mock('obsidian');

window.moment = moment;

/**
 * Show each signifier found in the line as '[icon-name]', to make the results easy to read.
 */
function showIcons(line: string) {
    let result = '';
    let position = 0;
    for (const range of findSignifierRanges(line)) {
        result += line.substring(position, range.from) + `[${range.iconId}]`;
        position = range.to;
    }
    return result + line.substring(position);
}

afterEach(() => {
    GlobalFilter.getInstance().reset();
});

describe('findSignifierRanges', () => {
    it('finds every emoji signifier in a task line', () => {
        const line =
            '- [ ] Do it 🆔 abc ⛔ def ⏫ 🔁 every day 🏁 delete ➕ 2023-07-01 🛫 2023-07-02 ⏳ 2023-07-03 📅 2023-07-04 ❌ 2023-07-06 ✅ 2023-07-05';
        expect(showIcons(line)).toEqual(
            '- [ ] Do it [fingerprint] abc [lock] def [tasks-fa-angle-up] [repeat] every day [flag] delete [plus-circle] 2023-07-01 [plane-takeoff] 2023-07-02 [hourglass] 2023-07-03 [calendar] 2023-07-04 [x-circle] 2023-07-06 [check-circle] 2023-07-05',
        );
    });

    it('recognises all the priority signifiers', () => {
        expect(showIcons('- [ ] a 🔺')).toEqual('- [ ] a [tasks-fa-angles-up]');
        expect(showIcons('- [ ] a 🔼')).toEqual('- [ ] a [tasks-fa-caret-up]');
        expect(showIcons('- [ ] a 🔽')).toEqual('- [ ] a [tasks-fa-angle-down]');
        expect(showIcons('- [ ] a ⏬')).toEqual('- [ ] a [tasks-fa-angles-down]');
    });

    it('recognises alternative date signifiers, and includes any emoji variation selector', () => {
        expect(showIcons('- [ ] a 📆 2023-07-04')).toEqual('- [ ] a [calendar] 2023-07-04');
        expect(showIcons('- [ ] a 🗓️ 2023-07-04')).toEqual('- [ ] a [calendar] 2023-07-04');
        expect(showIcons('- [ ] a ⌛ 2023-07-04')).toEqual('- [ ] a [hourglass] 2023-07-04');
    });

    it('ignores lines that are not tasks', () => {
        expect(findSignifierRanges('Plain text 📅 2023-07-04')).toEqual([]);
        expect(findSignifierRanges('- List item 📅 2023-07-04')).toEqual([]);
    });

    it('ignores tasks without the global filter', () => {
        GlobalFilter.getInstance().set('#task');
        expect(findSignifierRanges('- [ ] Not a task 📅 2023-07-04')).toEqual([]);
        expect(showIcons('- [ ] #task A task 📅 2023-07-04')).toEqual('- [ ] #task A task [calendar] 2023-07-04');
    });

    it('ignores emojis in the description, which are not task properties', () => {
        expect(showIcons('- [ ] Buy ⏫ arrows 📅 2023-07-04')).toEqual('- [ ] Buy ⏫ arrows [calendar] 2023-07-04');
    });

    it('ignores emojis that are joined to other text', () => {
        expect(showIcons('- [ ] word📅 2023-07-04')).toEqual('- [ ] word📅 2023-07-04');
    });
});

/**
 * Show each Dataview field found in the line as '[icon-name|emoji|value]'.
 */
function showDataviewFields(line: string) {
    let result = '';
    let position = 0;
    for (const range of findDataviewFieldRanges(line)) {
        result += line.substring(position, range.from) + `[${range.iconId}|${range.emoji}|${range.text}]`;
        position = range.to;
    }
    return result + line.substring(position);
}

describe('findDataviewFieldRanges', () => {
    it('finds every Tasks property written as a Dataview inline field', () => {
        const line =
            '- [ ] Do it  [priority:: highest]  [due:: 2026-10-01]  [scheduled:: 2026-09-30]  [start:: 2026-09-29]  [created:: 2026-09-28]  [repeat:: every day]';
        expect(showDataviewFields(line)).toEqual(
            '- [ ] Do it  [tasks-fa-angles-up|🔺|]  [calendar|📅|2026-10-01]  [hourglass|⏳|2026-09-30]  [plane-takeoff|🛫|2026-09-29]  [plus-circle|➕|2026-09-28]  [repeat|🔁|every day]',
        );
    });

    it('finds done, cancelled, dependency and completion fields', () => {
        const line =
            '- [x] Done  [completion:: 2026-10-02]  [cancelled:: 2026-10-03]  [id:: abc]  [dependsOn:: def]  [onCompletion:: delete]';
        expect(showDataviewFields(line)).toEqual(
            '- [x] Done  [check-circle|✅|2026-10-02]  [x-circle|❌|2026-10-03]  [fingerprint|🆔|abc]  [lock|⛔|def]  [flag|🏁|delete]',
        );
    });

    it('supports round brackets and extra spaces', () => {
        expect(showDataviewFields('- [ ] Task (priority::  low ) ( due::2026-10-01)')).toEqual(
            '- [ ] Task [tasks-fa-angle-down|🔽|] [calendar|📅|2026-10-01]',
        );
    });

    it('ignores unknown fields, empty values, unknown priorities and mismatched brackets', () => {
        const line = '- [ ] Task [project:: x] [due:: ] [priority:: urgent] [due:: 2026-10-01)';
        expect(findDataviewFieldRanges(line)).toEqual([]);
    });

    it('ignores lines that are not tasks, or lack the global filter', () => {
        expect(findDataviewFieldRanges('- List item [due:: 2026-10-01]')).toEqual([]);
        GlobalFilter.getInstance().set('#task');
        expect(findDataviewFieldRanges('- [ ] Not a task [due:: 2026-10-01]')).toEqual([]);
    });
});

describe('propertyRangesForLine', () => {
    const emojiLine = '- [ ] Task 📅 2026-10-01';
    const dataviewLine = '- [ ] Task [due:: 2026-10-01]';

    it('shows emoji signifiers as icons only when icons are chosen', () => {
        expect(propertyRangesForLine(emojiLine, 'tasksPluginEmoji', 'icons')).toHaveLength(1);
        expect(propertyRangesForLine(emojiLine, 'tasksPluginEmoji', 'emoji')).toEqual([]);
    });

    it('shows Dataview fields compactly with either style', () => {
        expect(propertyRangesForLine(dataviewLine, 'dataview', 'icons')).toHaveLength(1);
        expect(propertyRangesForLine(dataviewLine, 'dataview', 'emoji')).toHaveLength(1);
        // Dataview fields are not Tasks properties in the emoji format:
        expect(propertyRangesForLine(dataviewLine, 'tasksPluginEmoji', 'icons')).toEqual([]);
    });
});
