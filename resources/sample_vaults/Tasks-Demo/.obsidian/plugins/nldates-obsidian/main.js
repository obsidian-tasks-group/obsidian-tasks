'use strict';

var require$$0$1 = require('obsidian');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var require$$0__default = /*#__PURE__*/_interopDefaultLegacy(require$$0$1);

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function getAugmentedNamespace(n) {
	if (n.__esModule) return n;
	var a = Object.defineProperty({}, '__esModule', {value: true});
	Object.keys(n).forEach(function (k) {
		var d = Object.getOwnPropertyDescriptor(n, k);
		Object.defineProperty(a, k, d.get ? d : {
			enumerable: true,
			get: function () {
				return n[k];
			}
		});
	});
	return a;
}

var main = {};

Object.defineProperty(main, '__esModule', { value: true });

var obsidian = require$$0__default["default"];

const DEFAULT_DAILY_NOTE_FORMAT = "YYYY-MM-DD";
const DEFAULT_WEEKLY_NOTE_FORMAT = "gggg-[W]ww";
const DEFAULT_MONTHLY_NOTE_FORMAT = "YYYY-MM";
const DEFAULT_QUARTERLY_NOTE_FORMAT = "YYYY-[Q]Q";
const DEFAULT_YEARLY_NOTE_FORMAT = "YYYY";

function shouldUsePeriodicNotesSettings(periodicity) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const periodicNotes = window.app.plugins.getPlugin("periodic-notes");
    return periodicNotes && periodicNotes.settings?.[periodicity]?.enabled;
}
/**
 * Read the user settings for the `daily-notes` plugin
 * to keep behavior of creating a new note in-sync.
 */
function getDailyNoteSettings() {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { internalPlugins, plugins } = window.app;
        if (shouldUsePeriodicNotesSettings("daily")) {
            const { format, folder, template } = plugins.getPlugin("periodic-notes")?.settings?.daily || {};
            return {
                format: format || DEFAULT_DAILY_NOTE_FORMAT,
                folder: folder?.trim() || "",
                template: template?.trim() || "",
            };
        }
        const { folder, format, template } = internalPlugins.getPluginById("daily-notes")?.instance?.options || {};
        return {
            format: format || DEFAULT_DAILY_NOTE_FORMAT,
            folder: folder?.trim() || "",
            template: template?.trim() || "",
        };
    }
    catch (err) {
        console.info("No custom daily note settings found!", err);
    }
}
/**
 * Read the user settings for the `weekly-notes` plugin
 * to keep behavior of creating a new note in-sync.
 */
function getWeeklyNoteSettings() {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pluginManager = window.app.plugins;
        const calendarSettings = pluginManager.getPlugin("calendar")?.options;
        const periodicNotesSettings = pluginManager.getPlugin("periodic-notes")?.settings?.weekly;
        if (shouldUsePeriodicNotesSettings("weekly")) {
            return {
                format: periodicNotesSettings.format || DEFAULT_WEEKLY_NOTE_FORMAT,
                folder: periodicNotesSettings.folder?.trim() || "",
                template: periodicNotesSettings.template?.trim() || "",
            };
        }
        const settings = calendarSettings || {};
        return {
            format: settings.weeklyNoteFormat || DEFAULT_WEEKLY_NOTE_FORMAT,
            folder: settings.weeklyNoteFolder?.trim() || "",
            template: settings.weeklyNoteTemplate?.trim() || "",
        };
    }
    catch (err) {
        console.info("No custom weekly note settings found!", err);
    }
}
/**
 * Read the user settings for the `periodic-notes` plugin
 * to keep behavior of creating a new note in-sync.
 */
function getMonthlyNoteSettings() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pluginManager = window.app.plugins;
    try {
        const settings = (shouldUsePeriodicNotesSettings("monthly") &&
            pluginManager.getPlugin("periodic-notes")?.settings?.monthly) ||
            {};
        return {
            format: settings.format || DEFAULT_MONTHLY_NOTE_FORMAT,
            folder: settings.folder?.trim() || "",
            template: settings.template?.trim() || "",
        };
    }
    catch (err) {
        console.info("No custom monthly note settings found!", err);
    }
}
/**
 * Read the user settings for the `periodic-notes` plugin
 * to keep behavior of creating a new note in-sync.
 */
function getQuarterlyNoteSettings() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pluginManager = window.app.plugins;
    try {
        const settings = (shouldUsePeriodicNotesSettings("quarterly") &&
            pluginManager.getPlugin("periodic-notes")?.settings?.quarterly) ||
            {};
        return {
            format: settings.format || DEFAULT_QUARTERLY_NOTE_FORMAT,
            folder: settings.folder?.trim() || "",
            template: settings.template?.trim() || "",
        };
    }
    catch (err) {
        console.info("No custom quarterly note settings found!", err);
    }
}
/**
 * Read the user settings for the `periodic-notes` plugin
 * to keep behavior of creating a new note in-sync.
 */
function getYearlyNoteSettings() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pluginManager = window.app.plugins;
    try {
        const settings = (shouldUsePeriodicNotesSettings("yearly") &&
            pluginManager.getPlugin("periodic-notes")?.settings?.yearly) ||
            {};
        return {
            format: settings.format || DEFAULT_YEARLY_NOTE_FORMAT,
            folder: settings.folder?.trim() || "",
            template: settings.template?.trim() || "",
        };
    }
    catch (err) {
        console.info("No custom yearly note settings found!", err);
    }
}

// Credit: @creationix/path.js
function join(...partSegments) {
    // Split the inputs into a list of path commands.
    let parts = [];
    for (let i = 0, l = partSegments.length; i < l; i++) {
        parts = parts.concat(partSegments[i].split("/"));
    }
    // Interpret the path commands to get the new resolved path.
    const newParts = [];
    for (let i = 0, l = parts.length; i < l; i++) {
        const part = parts[i];
        // Remove leading and trailing slashes
        // Also remove "." segments
        if (!part || part === ".")
            continue;
        // Push new path segments.
        else
            newParts.push(part);
    }
    // Preserve the initial slash if there was one.
    if (parts[0] === "")
        newParts.unshift("");
    // Turn back into a single string path.
    return newParts.join("/");
}
function basename(fullPath) {
    let base = fullPath.substring(fullPath.lastIndexOf("/") + 1);
    if (base.lastIndexOf(".") != -1)
        base = base.substring(0, base.lastIndexOf("."));
    return base;
}
async function ensureFolderExists(path) {
    const dirs = path.replace(/\\/g, "/").split("/");
    dirs.pop(); // remove basename
    if (dirs.length) {
        const dir = join(...dirs);
        if (!window.app.vault.getAbstractFileByPath(dir)) {
            await window.app.vault.createFolder(dir);
        }
    }
}
async function getNotePath(directory, filename) {
    if (!filename.endsWith(".md")) {
        filename += ".md";
    }
    const path = obsidian.normalizePath(join(directory, filename));
    await ensureFolderExists(path);
    return path;
}
async function getTemplateInfo(template) {
    const { metadataCache, vault } = window.app;
    const templatePath = obsidian.normalizePath(template);
    if (templatePath === "/") {
        return Promise.resolve(["", null]);
    }
    try {
        const templateFile = metadataCache.getFirstLinkpathDest(templatePath, "");
        const contents = await vault.cachedRead(templateFile);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const IFoldInfo = window.app.foldManager.load(templateFile);
        return [contents, IFoldInfo];
    }
    catch (err) {
        console.error(`Failed to read the daily note template '${templatePath}'`, err);
        new obsidian.Notice("Failed to read the daily note template");
        return ["", null];
    }
}

/**
 * dateUID is a way of weekly identifying daily/weekly/monthly notes.
 * They are prefixed with the granularity to avoid ambiguity.
 */
function getDateUID(date, granularity = "day") {
    const ts = date.clone().startOf(granularity).format();
    return `${granularity}-${ts}`;
}
function removeEscapedCharacters(format) {
    return format.replace(/\[[^\]]*\]/g, ""); // remove everything within brackets
}
/**
 * XXX: When parsing dates that contain both week numbers and months,
 * Moment choses to ignore the week numbers. For the week dateUID, we
 * want the opposite behavior. Strip the MMM from the format to patch.
 */
function isFormatAmbiguous(format, granularity) {
    if (granularity === "week") {
        const cleanFormat = removeEscapedCharacters(format);
        return (/w{1,2}/i.test(cleanFormat) &&
            (/M{1,4}/.test(cleanFormat) || /D{1,4}/.test(cleanFormat)));
    }
    return false;
}
function getDateFromFile(file, granularity) {
    return getDateFromFilename(file.basename, granularity);
}
function getDateFromPath(path, granularity) {
    return getDateFromFilename(basename(path), granularity);
}
function getDateFromFilename(filename, granularity) {
    const getSettings = {
        day: getDailyNoteSettings,
        week: getWeeklyNoteSettings,
        month: getMonthlyNoteSettings,
        quarter: getQuarterlyNoteSettings,
        year: getYearlyNoteSettings,
    };
    const format = getSettings[granularity]().format.split("/").pop();
    const noteDate = window.moment(filename, format, true);
    if (!noteDate.isValid()) {
        return null;
    }
    if (isFormatAmbiguous(format, granularity)) {
        if (granularity === "week") {
            const cleanFormat = removeEscapedCharacters(format);
            if (/w{1,2}/i.test(cleanFormat)) {
                return window.moment(filename, 
                // If format contains week, remove day & month formatting
                format.replace(/M{1,4}/g, "").replace(/D{1,4}/g, ""), false);
            }
        }
    }
    return noteDate;
}

class DailyNotesFolderMissingError extends Error {
}
/**
 * This function mimics the behavior of the daily-notes plugin
 * so it will replace {{date}}, {{title}}, and {{time}} with the
 * formatted timestamp.
 *
 * Note: it has an added bonus that it's not 'today' specific.
 */
async function createDailyNote(date) {
    const app = window.app;
    const { vault } = app;
    const moment = window.moment;
    const { template, format, folder } = getDailyNoteSettings();
    const [templateContents, IFoldInfo] = await getTemplateInfo(template);
    const filename = date.format(format);
    const normalizedPath = await getNotePath(folder, filename);
    try {
        const createdFile = await vault.create(normalizedPath, templateContents
            .replace(/{{\s*date\s*}}/gi, filename)
            .replace(/{{\s*time\s*}}/gi, moment().format("HH:mm"))
            .replace(/{{\s*title\s*}}/gi, filename)
            .replace(/{{\s*(date|time)\s*(([+-]\d+)([yqmwdhs]))?\s*(:.+?)?}}/gi, (_, _timeOrDate, calc, timeDelta, unit, momentFormat) => {
            const now = moment();
            const currentDate = date.clone().set({
                hour: now.get("hour"),
                minute: now.get("minute"),
                second: now.get("second"),
            });
            if (calc) {
                currentDate.add(parseInt(timeDelta, 10), unit);
            }
            if (momentFormat) {
                return currentDate.format(momentFormat.substring(1).trim());
            }
            return currentDate.format(format);
        })
            .replace(/{{\s*yesterday\s*}}/gi, date.clone().subtract(1, "day").format(format))
            .replace(/{{\s*tomorrow\s*}}/gi, date.clone().add(1, "d").format(format)));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        app.foldManager.save(createdFile, IFoldInfo);
        return createdFile;
    }
    catch (err) {
        console.error(`Failed to create file: '${normalizedPath}'`, err);
        new obsidian.Notice("Unable to create new file.");
    }
}
function getDailyNote(date, dailyNotes) {
    return dailyNotes[getDateUID(date, "day")] ?? null;
}
function getAllDailyNotes() {
    /**
     * Find all daily notes in the daily note folder
     */
    const { vault } = window.app;
    const { folder } = getDailyNoteSettings();
    const dailyNotesFolder = vault.getAbstractFileByPath(obsidian.normalizePath(folder));
    if (!dailyNotesFolder) {
        throw new DailyNotesFolderMissingError("Failed to find daily notes folder");
    }
    const dailyNotes = {};
    obsidian.Vault.recurseChildren(dailyNotesFolder, (note) => {
        if (note instanceof obsidian.TFile) {
            const date = getDateFromFile(note, "day");
            if (date) {
                const dateString = getDateUID(date, "day");
                dailyNotes[dateString] = note;
            }
        }
    });
    return dailyNotes;
}

class WeeklyNotesFolderMissingError extends Error {
}
function getDaysOfWeek() {
    const { moment } = window;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let weekStart = moment.localeData()._week.dow;
    const daysOfWeek = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
    ];
    while (weekStart) {
        daysOfWeek.push(daysOfWeek.shift());
        weekStart--;
    }
    return daysOfWeek;
}
function getDayOfWeekNumericalValue(dayOfWeekName) {
    return getDaysOfWeek().indexOf(dayOfWeekName.toLowerCase());
}
async function createWeeklyNote(date) {
    const { vault } = window.app;
    const { template, format, folder } = getWeeklyNoteSettings();
    const [templateContents, IFoldInfo] = await getTemplateInfo(template);
    const filename = date.format(format);
    const normalizedPath = await getNotePath(folder, filename);
    try {
        const createdFile = await vault.create(normalizedPath, templateContents
            .replace(/{{\s*(date|time)\s*(([+-]\d+)([yqmwdhs]))?\s*(:.+?)?}}/gi, (_, _timeOrDate, calc, timeDelta, unit, momentFormat) => {
            const now = window.moment();
            const currentDate = date.clone().set({
                hour: now.get("hour"),
                minute: now.get("minute"),
                second: now.get("second"),
            });
            if (calc) {
                currentDate.add(parseInt(timeDelta, 10), unit);
            }
            if (momentFormat) {
                return currentDate.format(momentFormat.substring(1).trim());
            }
            return currentDate.format(format);
        })
            .replace(/{{\s*title\s*}}/gi, filename)
            .replace(/{{\s*time\s*}}/gi, window.moment().format("HH:mm"))
            .replace(/{{\s*(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\s*:(.*?)}}/gi, (_, dayOfWeek, momentFormat) => {
            const day = getDayOfWeekNumericalValue(dayOfWeek);
            return date.weekday(day).format(momentFormat.trim());
        }));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        window.app.foldManager.save(createdFile, IFoldInfo);
        return createdFile;
    }
    catch (err) {
        console.error(`Failed to create file: '${normalizedPath}'`, err);
        new obsidian.Notice("Unable to create new file.");
    }
}
function getWeeklyNote(date, weeklyNotes) {
    return weeklyNotes[getDateUID(date, "week")] ?? null;
}
function getAllWeeklyNotes() {
    const weeklyNotes = {};
    if (!appHasWeeklyNotesPluginLoaded()) {
        return weeklyNotes;
    }
    const { vault } = window.app;
    const { folder } = getWeeklyNoteSettings();
    const weeklyNotesFolder = vault.getAbstractFileByPath(obsidian.normalizePath(folder));
    if (!weeklyNotesFolder) {
        throw new WeeklyNotesFolderMissingError("Failed to find weekly notes folder");
    }
    obsidian.Vault.recurseChildren(weeklyNotesFolder, (note) => {
        if (note instanceof obsidian.TFile) {
            const date = getDateFromFile(note, "week");
            if (date) {
                const dateString = getDateUID(date, "week");
                weeklyNotes[dateString] = note;
            }
        }
    });
    return weeklyNotes;
}

class MonthlyNotesFolderMissingError extends Error {
}
/**
 * This function mimics the behavior of the daily-notes plugin
 * so it will replace {{date}}, {{title}}, and {{time}} with the
 * formatted timestamp.
 *
 * Note: it has an added bonus that it's not 'today' specific.
 */
async function createMonthlyNote(date) {
    const { vault } = window.app;
    const { template, format, folder } = getMonthlyNoteSettings();
    const [templateContents, IFoldInfo] = await getTemplateInfo(template);
    const filename = date.format(format);
    const normalizedPath = await getNotePath(folder, filename);
    try {
        const createdFile = await vault.create(normalizedPath, templateContents
            .replace(/{{\s*(date|time)\s*(([+-]\d+)([yqmwdhs]))?\s*(:.+?)?}}/gi, (_, _timeOrDate, calc, timeDelta, unit, momentFormat) => {
            const now = window.moment();
            const currentDate = date.clone().set({
                hour: now.get("hour"),
                minute: now.get("minute"),
                second: now.get("second"),
            });
            if (calc) {
                currentDate.add(parseInt(timeDelta, 10), unit);
            }
            if (momentFormat) {
                return currentDate.format(momentFormat.substring(1).trim());
            }
            return currentDate.format(format);
        })
            .replace(/{{\s*date\s*}}/gi, filename)
            .replace(/{{\s*time\s*}}/gi, window.moment().format("HH:mm"))
            .replace(/{{\s*title\s*}}/gi, filename));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        window.app.foldManager.save(createdFile, IFoldInfo);
        return createdFile;
    }
    catch (err) {
        console.error(`Failed to create file: '${normalizedPath}'`, err);
        new obsidian.Notice("Unable to create new file.");
    }
}
function getMonthlyNote(date, monthlyNotes) {
    return monthlyNotes[getDateUID(date, "month")] ?? null;
}
function getAllMonthlyNotes() {
    const monthlyNotes = {};
    if (!appHasMonthlyNotesPluginLoaded()) {
        return monthlyNotes;
    }
    const { vault } = window.app;
    const { folder } = getMonthlyNoteSettings();
    const monthlyNotesFolder = vault.getAbstractFileByPath(obsidian.normalizePath(folder));
    if (!monthlyNotesFolder) {
        throw new MonthlyNotesFolderMissingError("Failed to find monthly notes folder");
    }
    obsidian.Vault.recurseChildren(monthlyNotesFolder, (note) => {
        if (note instanceof obsidian.TFile) {
            const date = getDateFromFile(note, "month");
            if (date) {
                const dateString = getDateUID(date, "month");
                monthlyNotes[dateString] = note;
            }
        }
    });
    return monthlyNotes;
}

class QuarterlyNotesFolderMissingError extends Error {
}
/**
 * This function mimics the behavior of the daily-notes plugin
 * so it will replace {{date}}, {{title}}, and {{time}} with the
 * formatted timestamp.
 *
 * Note: it has an added bonus that it's not 'today' specific.
 */
async function createQuarterlyNote(date) {
    const { vault } = window.app;
    const { template, format, folder } = getQuarterlyNoteSettings();
    const [templateContents, IFoldInfo] = await getTemplateInfo(template);
    const filename = date.format(format);
    const normalizedPath = await getNotePath(folder, filename);
    try {
        const createdFile = await vault.create(normalizedPath, templateContents
            .replace(/{{\s*(date|time)\s*(([+-]\d+)([yqmwdhs]))?\s*(:.+?)?}}/gi, (_, _timeOrDate, calc, timeDelta, unit, momentFormat) => {
            const now = window.moment();
            const currentDate = date.clone().set({
                hour: now.get("hour"),
                minute: now.get("minute"),
                second: now.get("second"),
            });
            if (calc) {
                currentDate.add(parseInt(timeDelta, 10), unit);
            }
            if (momentFormat) {
                return currentDate.format(momentFormat.substring(1).trim());
            }
            return currentDate.format(format);
        })
            .replace(/{{\s*date\s*}}/gi, filename)
            .replace(/{{\s*time\s*}}/gi, window.moment().format("HH:mm"))
            .replace(/{{\s*title\s*}}/gi, filename));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        window.app.foldManager.save(createdFile, IFoldInfo);
        return createdFile;
    }
    catch (err) {
        console.error(`Failed to create file: '${normalizedPath}'`, err);
        new obsidian.Notice("Unable to create new file.");
    }
}
function getQuarterlyNote(date, quarterly) {
    return quarterly[getDateUID(date, "quarter")] ?? null;
}
function getAllQuarterlyNotes() {
    const quarterly = {};
    if (!appHasQuarterlyNotesPluginLoaded()) {
        return quarterly;
    }
    const { vault } = window.app;
    const { folder } = getQuarterlyNoteSettings();
    const quarterlyFolder = vault.getAbstractFileByPath(obsidian.normalizePath(folder));
    if (!quarterlyFolder) {
        throw new QuarterlyNotesFolderMissingError("Failed to find quarterly notes folder");
    }
    obsidian.Vault.recurseChildren(quarterlyFolder, (note) => {
        if (note instanceof obsidian.TFile) {
            const date = getDateFromFile(note, "quarter");
            if (date) {
                const dateString = getDateUID(date, "quarter");
                quarterly[dateString] = note;
            }
        }
    });
    return quarterly;
}

class YearlyNotesFolderMissingError extends Error {
}
/**
 * This function mimics the behavior of the daily-notes plugin
 * so it will replace {{date}}, {{title}}, and {{time}} with the
 * formatted timestamp.
 *
 * Note: it has an added bonus that it's not 'today' specific.
 */
async function createYearlyNote(date) {
    const { vault } = window.app;
    const { template, format, folder } = getYearlyNoteSettings();
    const [templateContents, IFoldInfo] = await getTemplateInfo(template);
    const filename = date.format(format);
    const normalizedPath = await getNotePath(folder, filename);
    try {
        const createdFile = await vault.create(normalizedPath, templateContents
            .replace(/{{\s*(date|time)\s*(([+-]\d+)([yqmwdhs]))?\s*(:.+?)?}}/gi, (_, _timeOrDate, calc, timeDelta, unit, momentFormat) => {
            const now = window.moment();
            const currentDate = date.clone().set({
                hour: now.get("hour"),
                minute: now.get("minute"),
                second: now.get("second"),
            });
            if (calc) {
                currentDate.add(parseInt(timeDelta, 10), unit);
            }
            if (momentFormat) {
                return currentDate.format(momentFormat.substring(1).trim());
            }
            return currentDate.format(format);
        })
            .replace(/{{\s*date\s*}}/gi, filename)
            .replace(/{{\s*time\s*}}/gi, window.moment().format("HH:mm"))
            .replace(/{{\s*title\s*}}/gi, filename));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        window.app.foldManager.save(createdFile, IFoldInfo);
        return createdFile;
    }
    catch (err) {
        console.error(`Failed to create file: '${normalizedPath}'`, err);
        new obsidian.Notice("Unable to create new file.");
    }
}
function getYearlyNote(date, yearlyNotes) {
    return yearlyNotes[getDateUID(date, "year")] ?? null;
}
function getAllYearlyNotes() {
    const yearlyNotes = {};
    if (!appHasYearlyNotesPluginLoaded()) {
        return yearlyNotes;
    }
    const { vault } = window.app;
    const { folder } = getYearlyNoteSettings();
    const yearlyNotesFolder = vault.getAbstractFileByPath(obsidian.normalizePath(folder));
    if (!yearlyNotesFolder) {
        throw new YearlyNotesFolderMissingError("Failed to find yearly notes folder");
    }
    obsidian.Vault.recurseChildren(yearlyNotesFolder, (note) => {
        if (note instanceof obsidian.TFile) {
            const date = getDateFromFile(note, "year");
            if (date) {
                const dateString = getDateUID(date, "year");
                yearlyNotes[dateString] = note;
            }
        }
    });
    return yearlyNotes;
}

function appHasDailyNotesPluginLoaded() {
    const { app } = window;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dailyNotesPlugin = app.internalPlugins.plugins["daily-notes"];
    if (dailyNotesPlugin && dailyNotesPlugin.enabled) {
        return true;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const periodicNotes = app.plugins.getPlugin("periodic-notes");
    return periodicNotes && periodicNotes.settings?.daily?.enabled;
}
/**
 * XXX: "Weekly Notes" live in either the Calendar plugin or the periodic-notes plugin.
 * Check both until the weekly notes feature is removed from the Calendar plugin.
 */
function appHasWeeklyNotesPluginLoaded() {
    const { app } = window;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (app.plugins.getPlugin("calendar")) {
        return true;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const periodicNotes = app.plugins.getPlugin("periodic-notes");
    return periodicNotes && periodicNotes.settings?.weekly?.enabled;
}
function appHasMonthlyNotesPluginLoaded() {
    const { app } = window;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const periodicNotes = app.plugins.getPlugin("periodic-notes");
    return periodicNotes && periodicNotes.settings?.monthly?.enabled;
}
function appHasQuarterlyNotesPluginLoaded() {
    const { app } = window;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const periodicNotes = app.plugins.getPlugin("periodic-notes");
    return periodicNotes && periodicNotes.settings?.quarterly?.enabled;
}
function appHasYearlyNotesPluginLoaded() {
    const { app } = window;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const periodicNotes = app.plugins.getPlugin("periodic-notes");
    return periodicNotes && periodicNotes.settings?.yearly?.enabled;
}
function getPeriodicNoteSettings(granularity) {
    const getSettings = {
        day: getDailyNoteSettings,
        week: getWeeklyNoteSettings,
        month: getMonthlyNoteSettings,
        quarter: getQuarterlyNoteSettings,
        year: getYearlyNoteSettings,
    }[granularity];
    return getSettings();
}
function createPeriodicNote(granularity, date) {
    const createFn = {
        day: createDailyNote,
        month: createMonthlyNote,
        week: createWeeklyNote,
    };
    return createFn[granularity](date);
}

main.DEFAULT_DAILY_NOTE_FORMAT = DEFAULT_DAILY_NOTE_FORMAT;
main.DEFAULT_MONTHLY_NOTE_FORMAT = DEFAULT_MONTHLY_NOTE_FORMAT;
main.DEFAULT_QUARTERLY_NOTE_FORMAT = DEFAULT_QUARTERLY_NOTE_FORMAT;
main.DEFAULT_WEEKLY_NOTE_FORMAT = DEFAULT_WEEKLY_NOTE_FORMAT;
main.DEFAULT_YEARLY_NOTE_FORMAT = DEFAULT_YEARLY_NOTE_FORMAT;
main.appHasDailyNotesPluginLoaded = appHasDailyNotesPluginLoaded;
main.appHasMonthlyNotesPluginLoaded = appHasMonthlyNotesPluginLoaded;
main.appHasQuarterlyNotesPluginLoaded = appHasQuarterlyNotesPluginLoaded;
main.appHasWeeklyNotesPluginLoaded = appHasWeeklyNotesPluginLoaded;
main.appHasYearlyNotesPluginLoaded = appHasYearlyNotesPluginLoaded;
var createDailyNote_1 = main.createDailyNote = createDailyNote;
main.createMonthlyNote = createMonthlyNote;
main.createPeriodicNote = createPeriodicNote;
main.createQuarterlyNote = createQuarterlyNote;
main.createWeeklyNote = createWeeklyNote;
main.createYearlyNote = createYearlyNote;
var getAllDailyNotes_1 = main.getAllDailyNotes = getAllDailyNotes;
main.getAllMonthlyNotes = getAllMonthlyNotes;
main.getAllQuarterlyNotes = getAllQuarterlyNotes;
main.getAllWeeklyNotes = getAllWeeklyNotes;
main.getAllYearlyNotes = getAllYearlyNotes;
var getDailyNote_1 = main.getDailyNote = getDailyNote;
main.getDailyNoteSettings = getDailyNoteSettings;
main.getDateFromFile = getDateFromFile;
main.getDateFromPath = getDateFromPath;
main.getDateUID = getDateUID;
main.getMonthlyNote = getMonthlyNote;
main.getMonthlyNoteSettings = getMonthlyNoteSettings;
main.getPeriodicNoteSettings = getPeriodicNoteSettings;
main.getQuarterlyNote = getQuarterlyNote;
main.getQuarterlyNoteSettings = getQuarterlyNoteSettings;
main.getTemplateInfo = getTemplateInfo;
main.getWeeklyNote = getWeeklyNote;
main.getWeeklyNoteSettings = getWeeklyNoteSettings;
main.getYearlyNote = getYearlyNote;
main.getYearlyNoteSettings = getYearlyNoteSettings;

const daysOfWeek = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
];
function getWordBoundaries(editor) {
    const cursor = editor.getCursor();
    const pos = editor.posToOffset(cursor);
    const word = editor.cm.state.wordAt(pos);
    const wordStart = editor.offsetToPos(word.from);
    const wordEnd = editor.offsetToPos(word.to);
    return {
        from: wordStart,
        to: wordEnd,
    };
}
function getSelectedText(editor) {
    if (editor.somethingSelected()) {
        return editor.getSelection();
    }
    else {
        const wordBoundaries = getWordBoundaries(editor);
        editor.setSelection(wordBoundaries.from, wordBoundaries.to); // TODO check if this needs to be updated/improved
        return editor.getSelection();
    }
}
function adjustCursor(editor, cursor, newStr, oldStr) {
    const cursorOffset = newStr.length - oldStr.length;
    editor.setCursor({
        line: cursor.line,
        ch: cursor.ch + cursorOffset,
    });
}
function getFormattedDate(date, format) {
    return window.moment(date).format(format);
}
function getLastDayOfMonth(year, month) {
    return new Date(year, month, 0).getDate();
}
function parseTruthy(flag) {
    return ["y", "yes", "1", "t", "true"].indexOf(flag.toLowerCase()) >= 0;
}
function getWeekNumber(dayOfWeek) {
    return daysOfWeek.indexOf(dayOfWeek);
}
function getLocaleWeekStart() {
    // @ts-ignore
    const startOfWeek = window.moment.localeData()._week.dow;
    return daysOfWeek[startOfWeek];
}
function generateMarkdownLink(app, subpath, alias) {
    const useMarkdownLinks = app.vault.getConfig("useMarkdownLinks");
    const path = require$$0$1.normalizePath(subpath);
    if (useMarkdownLinks) {
        if (alias) {
            return `[${alias}](${path.replace(/ /g, "%20")})`;
        }
        else {
            return `[${subpath}](${path})`;
        }
    }
    else {
        if (alias) {
            return `[[${path}|${alias}]]`;
        }
        else {
            return `[[${path}]]`;
        }
    }
}
function getOrCreateDailyNote(date) {
    return __awaiter(this, void 0, void 0, function* () {
        // Borrowed from the Slated plugin:
        // https://github.com/tgrosinger/slated-obsidian/blob/main/src/vault.ts#L17
        const desiredNote = getDailyNote_1(date, getAllDailyNotes_1());
        if (desiredNote) {
            return Promise.resolve(desiredNote);
        }
        return createDailyNote_1(date);
    });
}
function extractTerms$1(dictionary) {
    let keys;
    if (dictionary instanceof Array) {
        keys = [...dictionary];
    }
    else if (dictionary instanceof Map) {
        keys = Array.from(dictionary.keys());
    }
    else {
        keys = Object.keys(dictionary);
    }
    return keys;
}
function matchAnyPattern$1(dictionary) {
    const joinedTerms = extractTerms$1(dictionary)
        .sort((a, b) => b.length - a.length)
        .join("|")
        .replace(/\./g, "\\.");
    return `(?:${joinedTerms})`;
}
const ORDINAL_WORD_DICTIONARY = {
    first: 1,
    second: 2,
    third: 3,
    fourth: 4,
    fifth: 5,
    sixth: 6,
    seventh: 7,
    eighth: 8,
    ninth: 9,
    tenth: 10,
    eleventh: 11,
    twelfth: 12,
    thirteenth: 13,
    fourteenth: 14,
    fifteenth: 15,
    sixteenth: 16,
    seventeenth: 17,
    eighteenth: 18,
    nineteenth: 19,
    twentieth: 20,
    "twenty first": 21,
    "twenty-first": 21,
    "twenty second": 22,
    "twenty-second": 22,
    "twenty third": 23,
    "twenty-third": 23,
    "twenty fourth": 24,
    "twenty-fourth": 24,
    "twenty fifth": 25,
    "twenty-fifth": 25,
    "twenty sixth": 26,
    "twenty-sixth": 26,
    "twenty seventh": 27,
    "twenty-seventh": 27,
    "twenty eighth": 28,
    "twenty-eighth": 28,
    "twenty ninth": 29,
    "twenty-ninth": 29,
    thirtieth: 30,
    "thirty first": 31,
    "thirty-first": 31,
};
const ORDINAL_NUMBER_PATTERN = `(?:${matchAnyPattern$1(ORDINAL_WORD_DICTIONARY)}|[0-9]{1,2}(?:st|nd|rd|th)?)`;
function parseOrdinalNumberPattern(match) {
    let num = match.toLowerCase();
    if (ORDINAL_WORD_DICTIONARY[num] !== undefined) {
        return ORDINAL_WORD_DICTIONARY[num];
    }
    num = num.replace(/(?:st|nd|rd|th)$/i, "");
    return parseInt(num);
}

class DatePickerModal extends require$$0$1.Modal {
    constructor(app, plugin) {
        super(app);
        this.plugin = plugin;
    }
    onOpen() {
        let previewEl;
        let dateInput = "";
        let momentFormat = this.plugin.settings.modalMomentFormat;
        let insertAsLink = this.plugin.settings.modalToggleLink;
        const getDateStr = () => {
            let cleanDateInput = dateInput;
            let shouldIncludeAlias = false;
            if (dateInput.endsWith("|")) {
                shouldIncludeAlias = true;
                cleanDateInput = dateInput.slice(0, -1);
            }
            const parsedDate = this.plugin.parseDate(cleanDateInput || "today");
            let parsedDateString = parsedDate.moment.isValid()
                ? parsedDate.moment.format(momentFormat)
                : "";
            if (insertAsLink) {
                parsedDateString = generateMarkdownLink(this.app, parsedDateString, shouldIncludeAlias ? cleanDateInput : undefined);
            }
            return parsedDateString;
        };
        this.contentEl.createEl("form", {}, (formEl) => {
            const dateInputEl = new require$$0$1.Setting(formEl)
                .setName("Date")
                .setDesc(getDateStr())
                .addText((textEl) => {
                textEl.setPlaceholder("Today");
                textEl.onChange((value) => {
                    dateInput = value;
                    previewEl.setText(getDateStr());
                });
                window.setTimeout(() => textEl.inputEl.focus(), 10);
            });
            previewEl = dateInputEl.descEl;
            new require$$0$1.Setting(formEl)
                .setName("Date Format")
                .setDesc("Moment format to be used")
                .addMomentFormat((momentEl) => {
                momentEl.setPlaceholder("YYYY-MM-DD HH:mm");
                momentEl.setValue(momentFormat);
                momentEl.onChange((value) => {
                    momentFormat = value.trim() || "YYYY-MM-DD HH:mm";
                    this.plugin.settings.modalMomentFormat = momentFormat;
                    this.plugin.saveSettings();
                    previewEl.setText(getDateStr());
                });
            });
            new require$$0$1.Setting(formEl).setName("Add as link?").addToggle((toggleEl) => {
                toggleEl.setValue(this.plugin.settings.modalToggleLink).onChange((value) => {
                    insertAsLink = value;
                    this.plugin.settings.modalToggleLink = insertAsLink;
                    this.plugin.saveSettings();
                    previewEl.setText(getDateStr());
                });
            });
            formEl.createDiv("modal-button-container", (buttonContainerEl) => {
                buttonContainerEl
                    .createEl("button", { attr: { type: "button" }, text: "Never mind" })
                    .addEventListener("click", () => this.close());
                buttonContainerEl.createEl("button", {
                    attr: { type: "submit" },
                    cls: "mod-cta",
                    text: "Insert Date",
                });
            });
            const activeView = this.app.workspace.getActiveViewOfType(require$$0$1.MarkdownView);
            const activeEditor = activeView.editor;
            formEl.addEventListener("submit", (e) => {
                e.preventDefault();
                this.close();
                activeEditor.replaceSelection(getDateStr());
            });
        });
    }
}

var dist = {};

var en$1 = {};

var ENTimeUnitWithinFormatParser$1 = {};

var constants$7 = {};

var pattern = {};

Object.defineProperty(pattern, "__esModule", { value: true });
pattern.matchAnyPattern = pattern.extractTerms = pattern.repeatedTimeunitPattern = void 0;
function repeatedTimeunitPattern(prefix, singleTimeunitPattern) {
    const singleTimeunitPatternNoCapture = singleTimeunitPattern.replace(/\((?!\?)/g, "(?:");
    return `${prefix}${singleTimeunitPatternNoCapture}\\s{0,5}(?:,?\\s{0,5}${singleTimeunitPatternNoCapture}){0,10}`;
}
pattern.repeatedTimeunitPattern = repeatedTimeunitPattern;
function extractTerms(dictionary) {
    let keys;
    if (dictionary instanceof Array) {
        keys = [...dictionary];
    }
    else if (dictionary instanceof Map) {
        keys = Array.from(dictionary.keys());
    }
    else {
        keys = Object.keys(dictionary);
    }
    return keys;
}
pattern.extractTerms = extractTerms;
function matchAnyPattern(dictionary) {
    const joinedTerms = extractTerms(dictionary)
        .sort((a, b) => b.length - a.length)
        .join("|")
        .replace(/\./g, "\\.");
    return `(?:${joinedTerms})`;
}
pattern.matchAnyPattern = matchAnyPattern;

var years = {};

var SECONDS_A_MINUTE = 60;
var SECONDS_A_HOUR = SECONDS_A_MINUTE * 60;
var SECONDS_A_DAY = SECONDS_A_HOUR * 24;
var SECONDS_A_WEEK = SECONDS_A_DAY * 7;
var MILLISECONDS_A_SECOND = 1e3;
var MILLISECONDS_A_MINUTE = SECONDS_A_MINUTE * MILLISECONDS_A_SECOND;
var MILLISECONDS_A_HOUR = SECONDS_A_HOUR * MILLISECONDS_A_SECOND;
var MILLISECONDS_A_DAY = SECONDS_A_DAY * MILLISECONDS_A_SECOND;
var MILLISECONDS_A_WEEK = SECONDS_A_WEEK * MILLISECONDS_A_SECOND; // English locales

var MS = 'millisecond';
var S = 'second';
var MIN = 'minute';
var H = 'hour';
var D = 'day';
var W = 'week';
var M = 'month';
var Q = 'quarter';
var Y = 'year';
var DATE = 'date';
var FORMAT_DEFAULT = 'YYYY-MM-DDTHH:mm:ssZ';
var INVALID_DATE_STRING = 'Invalid Date'; // regex

var REGEX_PARSE = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[^0-9]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?\.?(\d+)?$/;
var REGEX_FORMAT = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g;

// English [en]
// We don't need weekdaysShort, weekdaysMin, monthsShort in en.js locale
var en = {
  name: 'en',
  weekdays: 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
  months: 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_')
};

var padStart = function padStart(string, length, pad) {
  var s = String(string);
  if (!s || s.length >= length) return string;
  return "" + Array(length + 1 - s.length).join(pad) + string;
};

var padZoneStr = function padZoneStr(instance) {
  var negMinutes = -instance.utcOffset();
  var minutes = Math.abs(negMinutes);
  var hourOffset = Math.floor(minutes / 60);
  var minuteOffset = minutes % 60;
  return "" + (negMinutes <= 0 ? '+' : '-') + padStart(hourOffset, 2, '0') + ":" + padStart(minuteOffset, 2, '0');
};

var monthDiff = function monthDiff(a, b) {
  // function from moment.js in order to keep the same result
  if (a.date() < b.date()) return -monthDiff(b, a);
  var wholeMonthDiff = (b.year() - a.year()) * 12 + (b.month() - a.month());
  var anchor = a.clone().add(wholeMonthDiff, M);
  var c = b - anchor < 0;
  var anchor2 = a.clone().add(wholeMonthDiff + (c ? -1 : 1), M);
  return +(-(wholeMonthDiff + (b - anchor) / (c ? anchor - anchor2 : anchor2 - anchor)) || 0);
};

var absFloor = function absFloor(n) {
  return n < 0 ? Math.ceil(n) || 0 : Math.floor(n);
};

var prettyUnit = function prettyUnit(u) {
  var special = {
    M: M,
    y: Y,
    w: W,
    d: D,
    D: DATE,
    h: H,
    m: MIN,
    s: S,
    ms: MS,
    Q: Q
  };
  return special[u] || String(u || '').toLowerCase().replace(/s$/, '');
};

var isUndefined = function isUndefined(s) {
  return s === undefined;
};

var U = {
  s: padStart,
  z: padZoneStr,
  m: monthDiff,
  a: absFloor,
  p: prettyUnit,
  u: isUndefined
};

var L = 'en'; // global locale

var Ls = {}; // global loaded locale

Ls[L] = en;

var isDayjs = function isDayjs(d) {
  return d instanceof Dayjs;
}; // eslint-disable-line no-use-before-define


var parseLocale = function parseLocale(preset, object, isLocal) {
  var l;
  if (!preset) return L;

  if (typeof preset === 'string') {
    if (Ls[preset]) {
      l = preset;
    }

    if (object) {
      Ls[preset] = object;
      l = preset;
    }
  } else {
    var name = preset.name;
    Ls[name] = preset;
    l = name;
  }

  if (!isLocal && l) L = l;
  return l || !isLocal && L;
};

var dayjs$1 = function dayjs(date, c) {
  if (isDayjs(date)) {
    return date.clone();
  } // eslint-disable-next-line no-nested-ternary


  var cfg = typeof c === 'object' ? c : {};
  cfg.date = date;
  cfg.args = arguments; // eslint-disable-line prefer-rest-params

  return new Dayjs(cfg); // eslint-disable-line no-use-before-define
};

var wrapper = function wrapper(date, instance) {
  return dayjs$1(date, {
    locale: instance.$L,
    utc: instance.$u,
    x: instance.$x,
    $offset: instance.$offset // todo: refactor; do not use this.$offset in you code

  });
};

var Utils = U; // for plugin use

Utils.l = parseLocale;
Utils.i = isDayjs;
Utils.w = wrapper;

var parseDate = function parseDate(cfg) {
  var date = cfg.date,
      utc = cfg.utc;
  if (date === null) return new Date(NaN); // null is invalid

  if (Utils.u(date)) return new Date(); // today

  if (date instanceof Date) return new Date(date);

  if (typeof date === 'string' && !/Z$/i.test(date)) {
    var d = date.match(REGEX_PARSE);

    if (d) {
      var m = d[2] - 1 || 0;
      var ms = (d[7] || '0').substring(0, 3);

      if (utc) {
        return new Date(Date.UTC(d[1], m, d[3] || 1, d[4] || 0, d[5] || 0, d[6] || 0, ms));
      }

      return new Date(d[1], m, d[3] || 1, d[4] || 0, d[5] || 0, d[6] || 0, ms);
    }
  }

  return new Date(date); // everything else
};

var Dayjs = /*#__PURE__*/function () {
  function Dayjs(cfg) {
    this.$L = parseLocale(cfg.locale, null, true);
    this.parse(cfg); // for plugin
  }

  var _proto = Dayjs.prototype;

  _proto.parse = function parse(cfg) {
    this.$d = parseDate(cfg);
    this.$x = cfg.x || {};
    this.init();
  };

  _proto.init = function init() {
    var $d = this.$d;
    this.$y = $d.getFullYear();
    this.$M = $d.getMonth();
    this.$D = $d.getDate();
    this.$W = $d.getDay();
    this.$H = $d.getHours();
    this.$m = $d.getMinutes();
    this.$s = $d.getSeconds();
    this.$ms = $d.getMilliseconds();
  } // eslint-disable-next-line class-methods-use-this
  ;

  _proto.$utils = function $utils() {
    return Utils;
  };

  _proto.isValid = function isValid() {
    return !(this.$d.toString() === INVALID_DATE_STRING);
  };

  _proto.isSame = function isSame(that, units) {
    var other = dayjs$1(that);
    return this.startOf(units) <= other && other <= this.endOf(units);
  };

  _proto.isAfter = function isAfter(that, units) {
    return dayjs$1(that) < this.startOf(units);
  };

  _proto.isBefore = function isBefore(that, units) {
    return this.endOf(units) < dayjs$1(that);
  };

  _proto.$g = function $g(input, get, set) {
    if (Utils.u(input)) return this[get];
    return this.set(set, input);
  };

  _proto.unix = function unix() {
    return Math.floor(this.valueOf() / 1000);
  };

  _proto.valueOf = function valueOf() {
    // timezone(hour) * 60 * 60 * 1000 => ms
    return this.$d.getTime();
  };

  _proto.startOf = function startOf(units, _startOf) {
    var _this = this;

    // startOf -> endOf
    var isStartOf = !Utils.u(_startOf) ? _startOf : true;
    var unit = Utils.p(units);

    var instanceFactory = function instanceFactory(d, m) {
      var ins = Utils.w(_this.$u ? Date.UTC(_this.$y, m, d) : new Date(_this.$y, m, d), _this);
      return isStartOf ? ins : ins.endOf(D);
    };

    var instanceFactorySet = function instanceFactorySet(method, slice) {
      var argumentStart = [0, 0, 0, 0];
      var argumentEnd = [23, 59, 59, 999];
      return Utils.w(_this.toDate()[method].apply( // eslint-disable-line prefer-spread
      _this.toDate('s'), (isStartOf ? argumentStart : argumentEnd).slice(slice)), _this);
    };

    var $W = this.$W,
        $M = this.$M,
        $D = this.$D;
    var utcPad = "set" + (this.$u ? 'UTC' : '');

    switch (unit) {
      case Y:
        return isStartOf ? instanceFactory(1, 0) : instanceFactory(31, 11);

      case M:
        return isStartOf ? instanceFactory(1, $M) : instanceFactory(0, $M + 1);

      case W:
        {
          var weekStart = this.$locale().weekStart || 0;
          var gap = ($W < weekStart ? $W + 7 : $W) - weekStart;
          return instanceFactory(isStartOf ? $D - gap : $D + (6 - gap), $M);
        }

      case D:
      case DATE:
        return instanceFactorySet(utcPad + "Hours", 0);

      case H:
        return instanceFactorySet(utcPad + "Minutes", 1);

      case MIN:
        return instanceFactorySet(utcPad + "Seconds", 2);

      case S:
        return instanceFactorySet(utcPad + "Milliseconds", 3);

      default:
        return this.clone();
    }
  };

  _proto.endOf = function endOf(arg) {
    return this.startOf(arg, false);
  };

  _proto.$set = function $set(units, _int) {
    var _C$D$C$DATE$C$M$C$Y$C;

    // private set
    var unit = Utils.p(units);
    var utcPad = "set" + (this.$u ? 'UTC' : '');
    var name = (_C$D$C$DATE$C$M$C$Y$C = {}, _C$D$C$DATE$C$M$C$Y$C[D] = utcPad + "Date", _C$D$C$DATE$C$M$C$Y$C[DATE] = utcPad + "Date", _C$D$C$DATE$C$M$C$Y$C[M] = utcPad + "Month", _C$D$C$DATE$C$M$C$Y$C[Y] = utcPad + "FullYear", _C$D$C$DATE$C$M$C$Y$C[H] = utcPad + "Hours", _C$D$C$DATE$C$M$C$Y$C[MIN] = utcPad + "Minutes", _C$D$C$DATE$C$M$C$Y$C[S] = utcPad + "Seconds", _C$D$C$DATE$C$M$C$Y$C[MS] = utcPad + "Milliseconds", _C$D$C$DATE$C$M$C$Y$C)[unit];
    var arg = unit === D ? this.$D + (_int - this.$W) : _int;

    if (unit === M || unit === Y) {
      // clone is for badMutable plugin
      var date = this.clone().set(DATE, 1);
      date.$d[name](arg);
      date.init();
      this.$d = date.set(DATE, Math.min(this.$D, date.daysInMonth())).$d;
    } else if (name) this.$d[name](arg);

    this.init();
    return this;
  };

  _proto.set = function set(string, _int2) {
    return this.clone().$set(string, _int2);
  };

  _proto.get = function get(unit) {
    return this[Utils.p(unit)]();
  };

  _proto.add = function add(number, units) {
    var _this2 = this,
        _C$MIN$C$H$C$S$unit;

    number = Number(number); // eslint-disable-line no-param-reassign

    var unit = Utils.p(units);

    var instanceFactorySet = function instanceFactorySet(n) {
      var d = dayjs$1(_this2);
      return Utils.w(d.date(d.date() + Math.round(n * number)), _this2);
    };

    if (unit === M) {
      return this.set(M, this.$M + number);
    }

    if (unit === Y) {
      return this.set(Y, this.$y + number);
    }

    if (unit === D) {
      return instanceFactorySet(1);
    }

    if (unit === W) {
      return instanceFactorySet(7);
    }

    var step = (_C$MIN$C$H$C$S$unit = {}, _C$MIN$C$H$C$S$unit[MIN] = MILLISECONDS_A_MINUTE, _C$MIN$C$H$C$S$unit[H] = MILLISECONDS_A_HOUR, _C$MIN$C$H$C$S$unit[S] = MILLISECONDS_A_SECOND, _C$MIN$C$H$C$S$unit)[unit] || 1; // ms

    var nextTimeStamp = this.$d.getTime() + number * step;
    return Utils.w(nextTimeStamp, this);
  };

  _proto.subtract = function subtract(number, string) {
    return this.add(number * -1, string);
  };

  _proto.format = function format(formatStr) {
    var _this3 = this;

    if (!this.isValid()) return INVALID_DATE_STRING;
    var str = formatStr || FORMAT_DEFAULT;
    var zoneStr = Utils.z(this);
    var locale = this.$locale();
    var $H = this.$H,
        $m = this.$m,
        $M = this.$M;
    var weekdays = locale.weekdays,
        months = locale.months,
        meridiem = locale.meridiem;

    var getShort = function getShort(arr, index, full, length) {
      return arr && (arr[index] || arr(_this3, str)) || full[index].substr(0, length);
    };

    var get$H = function get$H(num) {
      return Utils.s($H % 12 || 12, num, '0');
    };

    var meridiemFunc = meridiem || function (hour, minute, isLowercase) {
      var m = hour < 12 ? 'AM' : 'PM';
      return isLowercase ? m.toLowerCase() : m;
    };

    var matches = {
      YY: String(this.$y).slice(-2),
      YYYY: this.$y,
      M: $M + 1,
      MM: Utils.s($M + 1, 2, '0'),
      MMM: getShort(locale.monthsShort, $M, months, 3),
      MMMM: getShort(months, $M),
      D: this.$D,
      DD: Utils.s(this.$D, 2, '0'),
      d: String(this.$W),
      dd: getShort(locale.weekdaysMin, this.$W, weekdays, 2),
      ddd: getShort(locale.weekdaysShort, this.$W, weekdays, 3),
      dddd: weekdays[this.$W],
      H: String($H),
      HH: Utils.s($H, 2, '0'),
      h: get$H(1),
      hh: get$H(2),
      a: meridiemFunc($H, $m, true),
      A: meridiemFunc($H, $m, false),
      m: String($m),
      mm: Utils.s($m, 2, '0'),
      s: String(this.$s),
      ss: Utils.s(this.$s, 2, '0'),
      SSS: Utils.s(this.$ms, 3, '0'),
      Z: zoneStr // 'ZZ' logic below

    };
    return str.replace(REGEX_FORMAT, function (match, $1) {
      return $1 || matches[match] || zoneStr.replace(':', '');
    }); // 'ZZ'
  };

  _proto.utcOffset = function utcOffset() {
    // Because a bug at FF24, we're rounding the timezone offset around 15 minutes
    // https://github.com/moment/moment/pull/1871
    return -Math.round(this.$d.getTimezoneOffset() / 15) * 15;
  };

  _proto.diff = function diff(input, units, _float) {
    var _C$Y$C$M$C$Q$C$W$C$D$;

    var unit = Utils.p(units);
    var that = dayjs$1(input);
    var zoneDelta = (that.utcOffset() - this.utcOffset()) * MILLISECONDS_A_MINUTE;
    var diff = this - that;
    var result = Utils.m(this, that);
    result = (_C$Y$C$M$C$Q$C$W$C$D$ = {}, _C$Y$C$M$C$Q$C$W$C$D$[Y] = result / 12, _C$Y$C$M$C$Q$C$W$C$D$[M] = result, _C$Y$C$M$C$Q$C$W$C$D$[Q] = result / 3, _C$Y$C$M$C$Q$C$W$C$D$[W] = (diff - zoneDelta) / MILLISECONDS_A_WEEK, _C$Y$C$M$C$Q$C$W$C$D$[D] = (diff - zoneDelta) / MILLISECONDS_A_DAY, _C$Y$C$M$C$Q$C$W$C$D$[H] = diff / MILLISECONDS_A_HOUR, _C$Y$C$M$C$Q$C$W$C$D$[MIN] = diff / MILLISECONDS_A_MINUTE, _C$Y$C$M$C$Q$C$W$C$D$[S] = diff / MILLISECONDS_A_SECOND, _C$Y$C$M$C$Q$C$W$C$D$)[unit] || diff; // milliseconds

    return _float ? result : Utils.a(result);
  };

  _proto.daysInMonth = function daysInMonth() {
    return this.endOf(M).$D;
  };

  _proto.$locale = function $locale() {
    // get locale object
    return Ls[this.$L];
  };

  _proto.locale = function locale(preset, object) {
    if (!preset) return this.$L;
    var that = this.clone();
    var nextLocaleName = parseLocale(preset, object, true);
    if (nextLocaleName) that.$L = nextLocaleName;
    return that;
  };

  _proto.clone = function clone() {
    return Utils.w(this.$d, this);
  };

  _proto.toDate = function toDate() {
    return new Date(this.valueOf());
  };

  _proto.toJSON = function toJSON() {
    return this.isValid() ? this.toISOString() : null;
  };

  _proto.toISOString = function toISOString() {
    // ie 8 return
    // new Dayjs(this.valueOf() + this.$d.getTimezoneOffset() * 60000)
    // .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]')
    return this.$d.toISOString();
  };

  _proto.toString = function toString() {
    return this.$d.toUTCString();
  };

  return Dayjs;
}();

var proto = Dayjs.prototype;
dayjs$1.prototype = proto;
[['$ms', MS], ['$s', S], ['$m', MIN], ['$H', H], ['$W', D], ['$M', M], ['$y', Y], ['$D', DATE]].forEach(function (g) {
  proto[g[1]] = function (input) {
    return this.$g(input, g[0], g[1]);
  };
});

dayjs$1.extend = function (plugin, option) {
  if (!plugin.$i) {
    // install plugin only once
    plugin(option, Dayjs, dayjs$1);
    plugin.$i = true;
  }

  return dayjs$1;
};

dayjs$1.locale = parseLocale;
dayjs$1.isDayjs = isDayjs;

dayjs$1.unix = function (timestamp) {
  return dayjs$1(timestamp * 1e3);
};

dayjs$1.en = Ls[L];
dayjs$1.Ls = Ls;
dayjs$1.p = {};

var esm = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': dayjs$1
});

var require$$0 = /*@__PURE__*/getAugmentedNamespace(esm);

var __importDefault$I = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(years, "__esModule", { value: true });
years.findYearClosestToRef = years.findMostLikelyADYear = void 0;
const dayjs_1$s = __importDefault$I(require$$0);
function findMostLikelyADYear(yearNumber) {
    if (yearNumber < 100) {
        if (yearNumber > 50) {
            yearNumber = yearNumber + 1900;
        }
        else {
            yearNumber = yearNumber + 2000;
        }
    }
    return yearNumber;
}
years.findMostLikelyADYear = findMostLikelyADYear;
function findYearClosestToRef(refDate, day, month) {
    const refMoment = (0, dayjs_1$s.default)(refDate);
    let dateMoment = refMoment;
    dateMoment = dateMoment.month(month - 1);
    dateMoment = dateMoment.date(day);
    dateMoment = dateMoment.year(refMoment.year());
    const nextYear = dateMoment.add(1, "y");
    const lastYear = dateMoment.add(-1, "y");
    if (Math.abs(nextYear.diff(refMoment)) < Math.abs(dateMoment.diff(refMoment))) {
        dateMoment = nextYear;
    }
    else if (Math.abs(lastYear.diff(refMoment)) < Math.abs(dateMoment.diff(refMoment))) {
        dateMoment = lastYear;
    }
    return dateMoment.year();
}
years.findYearClosestToRef = findYearClosestToRef;

(function (exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTimeUnits = exports.TIME_UNITS_PATTERN = exports.parseYear = exports.YEAR_PATTERN = exports.parseOrdinalNumberPattern = exports.ORDINAL_NUMBER_PATTERN = exports.parseNumberPattern = exports.NUMBER_PATTERN = exports.TIME_UNIT_DICTIONARY = exports.ORDINAL_WORD_DICTIONARY = exports.INTEGER_WORD_DICTIONARY = exports.MONTH_DICTIONARY = exports.FULL_MONTH_NAME_DICTIONARY = exports.WEEKDAY_DICTIONARY = void 0;
const pattern_1 = pattern;
const years_1 = years;
exports.WEEKDAY_DICTIONARY = {
    sunday: 0,
    sun: 0,
    "sun.": 0,
    monday: 1,
    mon: 1,
    "mon.": 1,
    tuesday: 2,
    tue: 2,
    "tue.": 2,
    wednesday: 3,
    wed: 3,
    "wed.": 3,
    thursday: 4,
    thurs: 4,
    "thurs.": 4,
    thur: 4,
    "thur.": 4,
    thu: 4,
    "thu.": 4,
    friday: 5,
    fri: 5,
    "fri.": 5,
    saturday: 6,
    sat: 6,
    "sat.": 6,
};
exports.FULL_MONTH_NAME_DICTIONARY = {
    january: 1,
    february: 2,
    march: 3,
    april: 4,
    may: 5,
    june: 6,
    july: 7,
    august: 8,
    september: 9,
    october: 10,
    november: 11,
    december: 12,
};
exports.MONTH_DICTIONARY = Object.assign(Object.assign({}, exports.FULL_MONTH_NAME_DICTIONARY), { jan: 1, "jan.": 1, feb: 2, "feb.": 2, mar: 3, "mar.": 3, apr: 4, "apr.": 4, jun: 6, "jun.": 6, jul: 7, "jul.": 7, aug: 8, "aug.": 8, sep: 9, "sep.": 9, sept: 9, "sept.": 9, oct: 10, "oct.": 10, nov: 11, "nov.": 11, dec: 12, "dec.": 12 });
exports.INTEGER_WORD_DICTIONARY = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
    eleven: 11,
    twelve: 12,
};
exports.ORDINAL_WORD_DICTIONARY = {
    first: 1,
    second: 2,
    third: 3,
    fourth: 4,
    fifth: 5,
    sixth: 6,
    seventh: 7,
    eighth: 8,
    ninth: 9,
    tenth: 10,
    eleventh: 11,
    twelfth: 12,
    thirteenth: 13,
    fourteenth: 14,
    fifteenth: 15,
    sixteenth: 16,
    seventeenth: 17,
    eighteenth: 18,
    nineteenth: 19,
    twentieth: 20,
    "twenty first": 21,
    "twenty-first": 21,
    "twenty second": 22,
    "twenty-second": 22,
    "twenty third": 23,
    "twenty-third": 23,
    "twenty fourth": 24,
    "twenty-fourth": 24,
    "twenty fifth": 25,
    "twenty-fifth": 25,
    "twenty sixth": 26,
    "twenty-sixth": 26,
    "twenty seventh": 27,
    "twenty-seventh": 27,
    "twenty eighth": 28,
    "twenty-eighth": 28,
    "twenty ninth": 29,
    "twenty-ninth": 29,
    "thirtieth": 30,
    "thirty first": 31,
    "thirty-first": 31,
};
exports.TIME_UNIT_DICTIONARY = {
    sec: "second",
    second: "second",
    seconds: "second",
    min: "minute",
    mins: "minute",
    minute: "minute",
    minutes: "minute",
    h: "hour",
    hr: "hour",
    hrs: "hour",
    hour: "hour",
    hours: "hour",
    day: "d",
    days: "d",
    week: "week",
    weeks: "week",
    month: "month",
    months: "month",
    y: "year",
    yr: "year",
    year: "year",
    years: "year",
};
exports.NUMBER_PATTERN = `(?:${(0, pattern_1.matchAnyPattern)(exports.INTEGER_WORD_DICTIONARY)}|[0-9]+|[0-9]+\\.[0-9]+|half(?:\\s{0,2}an?)?|an?\\b(?:\\s{0,2}few)?|few|several|a?\\s{0,2}couple\\s{0,2}(?:of)?)`;
function parseNumberPattern(match) {
    const num = match.toLowerCase();
    if (exports.INTEGER_WORD_DICTIONARY[num] !== undefined) {
        return exports.INTEGER_WORD_DICTIONARY[num];
    }
    else if (num === "a" || num === "an") {
        return 1;
    }
    else if (num.match(/few/)) {
        return 3;
    }
    else if (num.match(/half/)) {
        return 0.5;
    }
    else if (num.match(/couple/)) {
        return 2;
    }
    else if (num.match(/several/)) {
        return 7;
    }
    return parseFloat(num);
}
exports.parseNumberPattern = parseNumberPattern;
exports.ORDINAL_NUMBER_PATTERN = `(?:${(0, pattern_1.matchAnyPattern)(exports.ORDINAL_WORD_DICTIONARY)}|[0-9]{1,2}(?:st|nd|rd|th)?)`;
function parseOrdinalNumberPattern(match) {
    let num = match.toLowerCase();
    if (exports.ORDINAL_WORD_DICTIONARY[num] !== undefined) {
        return exports.ORDINAL_WORD_DICTIONARY[num];
    }
    num = num.replace(/(?:st|nd|rd|th)$/i, "");
    return parseInt(num);
}
exports.parseOrdinalNumberPattern = parseOrdinalNumberPattern;
exports.YEAR_PATTERN = `(?:[1-9][0-9]{0,3}\\s{0,2}(?:BE|AD|BC|BCE|CE)|[1-2][0-9]{3}|[5-9][0-9])`;
function parseYear(match) {
    if (/BE/i.test(match)) {
        match = match.replace(/BE/i, "");
        return parseInt(match) - 543;
    }
    if (/BCE?/i.test(match)) {
        match = match.replace(/BCE?/i, "");
        return -parseInt(match);
    }
    if (/(AD|CE)/i.test(match)) {
        match = match.replace(/(AD|CE)/i, "");
        return parseInt(match);
    }
    const rawYearNumber = parseInt(match);
    return (0, years_1.findMostLikelyADYear)(rawYearNumber);
}
exports.parseYear = parseYear;
const SINGLE_TIME_UNIT_PATTERN = `(${exports.NUMBER_PATTERN})\\s{0,3}(${(0, pattern_1.matchAnyPattern)(exports.TIME_UNIT_DICTIONARY)})`;
const SINGLE_TIME_UNIT_REGEX = new RegExp(SINGLE_TIME_UNIT_PATTERN, "i");
exports.TIME_UNITS_PATTERN = (0, pattern_1.repeatedTimeunitPattern)(`(?:(?:about|around)\\s{0,3})?`, SINGLE_TIME_UNIT_PATTERN);
function parseTimeUnits(timeunitText) {
    const fragments = {};
    let remainingText = timeunitText;
    let match = SINGLE_TIME_UNIT_REGEX.exec(remainingText);
    while (match) {
        collectDateTimeFragment(fragments, match);
        remainingText = remainingText.substring(match[0].length).trim();
        match = SINGLE_TIME_UNIT_REGEX.exec(remainingText);
    }
    return fragments;
}
exports.parseTimeUnits = parseTimeUnits;
function collectDateTimeFragment(fragments, match) {
    const num = parseNumberPattern(match[1]);
    const unit = exports.TIME_UNIT_DICTIONARY[match[2].toLowerCase()];
    fragments[unit] = num;
}
}(constants$7));

var results = {};

var quarterOfYear = {exports: {}};

(function (module, exports) {
!function(t,n){module.exports=n();}(commonjsGlobal,function(){var t="month",n="quarter";return function(r,i){var e=i.prototype;e.quarter=function(t){return this.$utils().u(t)?Math.ceil((this.month()+1)/3):this.month(this.month()%3+3*(t-1))};var u=e.add;e.add=function(r,i){return r=Number(r),this.$utils().p(i)===n?this.add(3*r,t):u.bind(this)(r,i)};var s=e.startOf;e.startOf=function(r,i){var e=this.$utils(),u=!!e.u(i)||i;if(e.p(r)===n){var a=this.quarter()-1;return u?this.month(3*a).startOf(t).startOf("day"):this.month(3*a+2).endOf(t).endOf("day")}return s.bind(this)(r,i)};}});
}(quarterOfYear));

var weekday = {exports: {}};

(function (module, exports) {
!function(e,t){module.exports=t();}(commonjsGlobal,function(){return function(e,t){t.prototype.weekday=function(e){var t=this.$locale().weekStart||0,n=this.$W,i=(n<t?n+7:n)-t;return this.$utils().u(e)?i:this.subtract(i,"day").add(e,"day")};}});
}(weekday));

var dayjs = {};

Object.defineProperty(dayjs, "__esModule", { value: true });
dayjs.implySimilarTime = dayjs.assignSimilarTime = dayjs.assignSimilarDate = dayjs.assignTheNextDay = void 0;
const index_1$e = dist;
function assignTheNextDay(component, targetDayJs) {
    targetDayJs = targetDayJs.add(1, "day");
    assignSimilarDate(component, targetDayJs);
    implySimilarTime(component, targetDayJs);
}
dayjs.assignTheNextDay = assignTheNextDay;
function assignSimilarDate(component, targetDayJs) {
    component.assign("day", targetDayJs.date());
    component.assign("month", targetDayJs.month() + 1);
    component.assign("year", targetDayJs.year());
}
dayjs.assignSimilarDate = assignSimilarDate;
function assignSimilarTime(component, targetDayJs) {
    component.assign("hour", targetDayJs.hour());
    component.assign("minute", targetDayJs.minute());
    component.assign("second", targetDayJs.second());
    component.assign("millisecond", targetDayJs.millisecond());
    if (component.get("hour") < 12) {
        component.assign("meridiem", index_1$e.Meridiem.AM);
    }
    else {
        component.assign("meridiem", index_1$e.Meridiem.PM);
    }
}
dayjs.assignSimilarTime = assignSimilarTime;
function implySimilarTime(component, targetDayJs) {
    component.imply("hour", targetDayJs.hour());
    component.imply("minute", targetDayJs.minute());
    component.imply("second", targetDayJs.second());
    component.imply("millisecond", targetDayJs.millisecond());
}
dayjs.implySimilarTime = implySimilarTime;

var timezone = {};

(function (exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.toTimezoneOffset = exports.TIMEZONE_ABBR_MAP = void 0;
exports.TIMEZONE_ABBR_MAP = {
    ACDT: 630,
    ACST: 570,
    ADT: -180,
    AEDT: 660,
    AEST: 600,
    AFT: 270,
    AKDT: -480,
    AKST: -540,
    ALMT: 360,
    AMST: -180,
    AMT: -240,
    ANAST: 720,
    ANAT: 720,
    AQTT: 300,
    ART: -180,
    AST: -240,
    AWDT: 540,
    AWST: 480,
    AZOST: 0,
    AZOT: -60,
    AZST: 300,
    AZT: 240,
    BNT: 480,
    BOT: -240,
    BRST: -120,
    BRT: -180,
    BST: 60,
    BTT: 360,
    CAST: 480,
    CAT: 120,
    CCT: 390,
    CDT: -300,
    CEST: 120,
    CET: 60,
    CHADT: 825,
    CHAST: 765,
    CKT: -600,
    CLST: -180,
    CLT: -240,
    COT: -300,
    CST: -360,
    CVT: -60,
    CXT: 420,
    ChST: 600,
    DAVT: 420,
    EASST: -300,
    EAST: -360,
    EAT: 180,
    ECT: -300,
    EDT: -240,
    EEST: 180,
    EET: 120,
    EGST: 0,
    EGT: -60,
    EST: -300,
    ET: -300,
    FJST: 780,
    FJT: 720,
    FKST: -180,
    FKT: -240,
    FNT: -120,
    GALT: -360,
    GAMT: -540,
    GET: 240,
    GFT: -180,
    GILT: 720,
    GMT: 0,
    GST: 240,
    GYT: -240,
    HAA: -180,
    HAC: -300,
    HADT: -540,
    HAE: -240,
    HAP: -420,
    HAR: -360,
    HAST: -600,
    HAT: -90,
    HAY: -480,
    HKT: 480,
    HLV: -210,
    HNA: -240,
    HNC: -360,
    HNE: -300,
    HNP: -480,
    HNR: -420,
    HNT: -150,
    HNY: -540,
    HOVT: 420,
    ICT: 420,
    IDT: 180,
    IOT: 360,
    IRDT: 270,
    IRKST: 540,
    IRKT: 540,
    IRST: 210,
    IST: 330,
    JST: 540,
    KGT: 360,
    KRAST: 480,
    KRAT: 480,
    KST: 540,
    KUYT: 240,
    LHDT: 660,
    LHST: 630,
    LINT: 840,
    MAGST: 720,
    MAGT: 720,
    MART: -510,
    MAWT: 300,
    MDT: -360,
    MESZ: 120,
    MEZ: 60,
    MHT: 720,
    MMT: 390,
    MSD: 240,
    MSK: 180,
    MST: -420,
    MUT: 240,
    MVT: 300,
    MYT: 480,
    NCT: 660,
    NDT: -90,
    NFT: 690,
    NOVST: 420,
    NOVT: 360,
    NPT: 345,
    NST: -150,
    NUT: -660,
    NZDT: 780,
    NZST: 720,
    OMSST: 420,
    OMST: 420,
    PDT: -420,
    PET: -300,
    PETST: 720,
    PETT: 720,
    PGT: 600,
    PHOT: 780,
    PHT: 480,
    PKT: 300,
    PMDT: -120,
    PMST: -180,
    PONT: 660,
    PST: -480,
    PT: -480,
    PWT: 540,
    PYST: -180,
    PYT: -240,
    RET: 240,
    SAMT: 240,
    SAST: 120,
    SBT: 660,
    SCT: 240,
    SGT: 480,
    SRT: -180,
    SST: -660,
    TAHT: -600,
    TFT: 300,
    TJT: 300,
    TKT: 780,
    TLT: 540,
    TMT: 300,
    TVT: 720,
    ULAT: 480,
    UTC: 0,
    UYST: -120,
    UYT: -180,
    UZT: 300,
    VET: -210,
    VLAST: 660,
    VLAT: 660,
    VUT: 660,
    WAST: 120,
    WAT: 60,
    WEST: 60,
    WESZ: 60,
    WET: 0,
    WEZ: 0,
    WFT: 720,
    WGST: -120,
    WGT: -180,
    WIB: 420,
    WIT: 540,
    WITA: 480,
    WST: 780,
    WT: 0,
    YAKST: 600,
    YAKT: 600,
    YAPT: 600,
    YEKST: 360,
    YEKT: 360,
};
function toTimezoneOffset(timezoneInput) {
    var _a;
    if (timezoneInput === null) {
        return null;
    }
    if (typeof timezoneInput === "number") {
        return timezoneInput;
    }
    return (_a = exports.TIMEZONE_ABBR_MAP[timezoneInput]) !== null && _a !== void 0 ? _a : 0;
}
exports.toTimezoneOffset = toTimezoneOffset;
}(timezone));

var __importDefault$H = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(results, "__esModule", { value: true });
results.ParsingResult = results.ParsingComponents = results.ReferenceWithTimezone = void 0;
const quarterOfYear_1 = __importDefault$H(quarterOfYear.exports);
const weekday_1 = __importDefault$H(weekday.exports);
const dayjs_1$r = __importDefault$H(require$$0);
const dayjs_2$9 = dayjs;
const timezone_1 = timezone;
dayjs_1$r.default.extend(quarterOfYear_1.default);
dayjs_1$r.default.extend(weekday_1.default);
class ReferenceWithTimezone {
    constructor(input) {
        var _a;
        input = input !== null && input !== void 0 ? input : new Date();
        if (input instanceof Date) {
            this.instant = input;
            this.timezoneOffset = -input.getTimezoneOffset();
        }
        else {
            this.instant = (_a = input.instant) !== null && _a !== void 0 ? _a : new Date();
            this.timezoneOffset = (0, timezone_1.toTimezoneOffset)(input.timezone);
        }
    }
}
results.ReferenceWithTimezone = ReferenceWithTimezone;
class ParsingComponents {
    constructor(reference, knownComponents) {
        this.reference = reference;
        this.knownValues = {};
        this.impliedValues = {};
        if (knownComponents) {
            for (const key in knownComponents) {
                this.knownValues[key] = knownComponents[key];
            }
        }
        const refDayJs = (0, dayjs_1$r.default)(reference.instant);
        this.imply("day", refDayJs.date());
        this.imply("month", refDayJs.month() + 1);
        this.imply("year", refDayJs.year());
        this.imply("hour", 12);
        this.imply("minute", 0);
        this.imply("second", 0);
        this.imply("millisecond", 0);
    }
    get(component) {
        if (component in this.knownValues) {
            return this.knownValues[component];
        }
        if (component in this.impliedValues) {
            return this.impliedValues[component];
        }
        return null;
    }
    isCertain(component) {
        return component in this.knownValues;
    }
    getCertainComponents() {
        return Object.keys(this.knownValues);
    }
    imply(component, value) {
        if (component in this.knownValues) {
            return this;
        }
        this.impliedValues[component] = value;
        return this;
    }
    assign(component, value) {
        this.knownValues[component] = value;
        delete this.impliedValues[component];
        return this;
    }
    delete(component) {
        delete this.knownValues[component];
        delete this.impliedValues[component];
    }
    clone() {
        const component = new ParsingComponents(this.reference);
        component.knownValues = {};
        component.impliedValues = {};
        for (const key in this.knownValues) {
            component.knownValues[key] = this.knownValues[key];
        }
        for (const key in this.impliedValues) {
            component.impliedValues[key] = this.impliedValues[key];
        }
        return component;
    }
    isOnlyDate() {
        return !this.isCertain("hour") && !this.isCertain("minute") && !this.isCertain("second");
    }
    isOnlyTime() {
        return !this.isCertain("weekday") && !this.isCertain("day") && !this.isCertain("month");
    }
    isOnlyWeekdayComponent() {
        return this.isCertain("weekday") && !this.isCertain("day") && !this.isCertain("month");
    }
    isOnlyDayMonthComponent() {
        return this.isCertain("day") && this.isCertain("month") && !this.isCertain("year");
    }
    isValidDate() {
        const date = this.dateWithoutTimezoneAdjustment();
        if (date.getFullYear() !== this.get("year"))
            return false;
        if (date.getMonth() !== this.get("month") - 1)
            return false;
        if (date.getDate() !== this.get("day"))
            return false;
        if (this.get("hour") != null && date.getHours() != this.get("hour"))
            return false;
        if (this.get("minute") != null && date.getMinutes() != this.get("minute"))
            return false;
        return true;
    }
    toString() {
        return `[ParsingComponents {knownValues: ${JSON.stringify(this.knownValues)}, impliedValues: ${JSON.stringify(this.impliedValues)}}]`;
    }
    dayjs() {
        return (0, dayjs_1$r.default)(this.date());
    }
    date() {
        const date = this.dateWithoutTimezoneAdjustment();
        return new Date(date.getTime() + this.getSystemTimezoneAdjustmentMinute(date) * 60000);
    }
    dateWithoutTimezoneAdjustment() {
        const date = new Date(this.get("year"), this.get("month") - 1, this.get("day"), this.get("hour"), this.get("minute"), this.get("second"), this.get("millisecond"));
        date.setFullYear(this.get("year"));
        return date;
    }
    getSystemTimezoneAdjustmentMinute(date) {
        var _a, _b;
        if (!date || date.getTime() < 0) {
            date = new Date();
        }
        const currentTimezoneOffset = -date.getTimezoneOffset();
        const targetTimezoneOffset = (_b = (_a = this.get("timezoneOffset")) !== null && _a !== void 0 ? _a : this.reference.timezoneOffset) !== null && _b !== void 0 ? _b : currentTimezoneOffset;
        return currentTimezoneOffset - targetTimezoneOffset;
    }
    static createRelativeFromReference(reference, fragments) {
        let date = (0, dayjs_1$r.default)(reference.instant);
        for (const key in fragments) {
            date = date.add(fragments[key], key);
        }
        const components = new ParsingComponents(reference);
        if (fragments["hour"] || fragments["minute"] || fragments["second"]) {
            (0, dayjs_2$9.assignSimilarTime)(components, date);
            (0, dayjs_2$9.assignSimilarDate)(components, date);
            if (reference.timezoneOffset !== null) {
                components.assign("timezoneOffset", -reference.instant.getTimezoneOffset());
            }
        }
        else {
            (0, dayjs_2$9.implySimilarTime)(components, date);
            if (reference.timezoneOffset !== null) {
                components.imply("timezoneOffset", -reference.instant.getTimezoneOffset());
            }
            if (fragments["d"]) {
                components.assign("day", date.date());
                components.assign("month", date.month() + 1);
                components.assign("year", date.year());
            }
            else {
                if (fragments["week"]) {
                    components.imply("weekday", date.day());
                }
                components.imply("day", date.date());
                if (fragments["month"]) {
                    components.assign("month", date.month() + 1);
                    components.assign("year", date.year());
                }
                else {
                    components.imply("month", date.month() + 1);
                    if (fragments["year"]) {
                        components.assign("year", date.year());
                    }
                    else {
                        components.imply("year", date.year());
                    }
                }
            }
        }
        return components;
    }
}
results.ParsingComponents = ParsingComponents;
class ParsingResult {
    constructor(reference, index, text, start, end) {
        this.reference = reference;
        this.refDate = reference.instant;
        this.index = index;
        this.text = text;
        this.start = start || new ParsingComponents(reference);
        this.end = end;
    }
    clone() {
        const result = new ParsingResult(this.reference, this.index, this.text);
        result.start = this.start ? this.start.clone() : null;
        result.end = this.end ? this.end.clone() : null;
        return result;
    }
    date() {
        return this.start.date();
    }
    toString() {
        return `[ParsingResult {index: ${this.index}, text: '${this.text}', ...}]`;
    }
}
results.ParsingResult = ParsingResult;

var AbstractParserWithWordBoundary = {};

Object.defineProperty(AbstractParserWithWordBoundary, "__esModule", { value: true });
AbstractParserWithWordBoundary.AbstractParserWithWordBoundaryChecking = void 0;
class AbstractParserWithWordBoundaryChecking {
    constructor() {
        this.cachedInnerPattern = null;
        this.cachedPattern = null;
    }
    pattern(context) {
        const innerPattern = this.innerPattern(context);
        if (innerPattern == this.cachedInnerPattern) {
            return this.cachedPattern;
        }
        this.cachedPattern = new RegExp(`(\\W|^)${innerPattern.source}`, innerPattern.flags);
        this.cachedInnerPattern = innerPattern;
        return this.cachedPattern;
    }
    extract(context, match) {
        var _a;
        const header = (_a = match[1]) !== null && _a !== void 0 ? _a : "";
        match.index = match.index + header.length;
        match[0] = match[0].substring(header.length);
        for (let i = 2; i < match.length; i++) {
            match[i - 1] = match[i];
        }
        return this.innerExtract(context, match);
    }
}
AbstractParserWithWordBoundary.AbstractParserWithWordBoundaryChecking = AbstractParserWithWordBoundaryChecking;

Object.defineProperty(ENTimeUnitWithinFormatParser$1, "__esModule", { value: true });
const constants_1$C = constants$7;
const results_1$e = results;
const AbstractParserWithWordBoundary_1$R = AbstractParserWithWordBoundary;
const PATTERN_WITH_PREFIX = new RegExp(`(?:within|in|for)\\s*` +
    `(?:(?:about|around|roughly|approximately|just)\\s*(?:~\\s*)?)?(${constants_1$C.TIME_UNITS_PATTERN})(?=\\W|$)`, "i");
const PATTERN_WITHOUT_PREFIX = new RegExp(`(?:(?:about|around|roughly|approximately|just)\\s*(?:~\\s*)?)?(${constants_1$C.TIME_UNITS_PATTERN})(?=\\W|$)`, "i");
class ENTimeUnitWithinFormatParser extends AbstractParserWithWordBoundary_1$R.AbstractParserWithWordBoundaryChecking {
    innerPattern(context) {
        return context.option.forwardDate ? PATTERN_WITHOUT_PREFIX : PATTERN_WITH_PREFIX;
    }
    innerExtract(context, match) {
        const timeUnits = (0, constants_1$C.parseTimeUnits)(match[1]);
        return results_1$e.ParsingComponents.createRelativeFromReference(context.reference, timeUnits);
    }
}
ENTimeUnitWithinFormatParser$1.default = ENTimeUnitWithinFormatParser;

var ENMonthNameLittleEndianParser$1 = {};

Object.defineProperty(ENMonthNameLittleEndianParser$1, "__esModule", { value: true });
const years_1$9 = years;
const constants_1$B = constants$7;
const constants_2$7 = constants$7;
const constants_3$3 = constants$7;
const pattern_1$h = pattern;
const AbstractParserWithWordBoundary_1$Q = AbstractParserWithWordBoundary;
const PATTERN$B = new RegExp(`(?:on\\s{0,3})?` +
    `(${constants_3$3.ORDINAL_NUMBER_PATTERN})` +
    `(?:` +
    `\\s{0,3}(?:to|\\-|\\–|until|through|till)?\\s{0,3}` +
    `(${constants_3$3.ORDINAL_NUMBER_PATTERN})` +
    ")?" +
    `(?:-|/|\\s{0,3}(?:of)?\\s{0,3})` +
    `(${(0, pattern_1$h.matchAnyPattern)(constants_1$B.MONTH_DICTIONARY)})` +
    "(?:" +
    `(?:-|/|,?\\s{0,3})` +
    `(${constants_2$7.YEAR_PATTERN}(?![^\\s]\\d))` +
    ")?" +
    "(?=\\W|$)", "i");
const DATE_GROUP$7 = 1;
const DATE_TO_GROUP$5 = 2;
const MONTH_NAME_GROUP$9 = 3;
const YEAR_GROUP$c = 4;
class ENMonthNameLittleEndianParser extends AbstractParserWithWordBoundary_1$Q.AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$B;
    }
    innerExtract(context, match) {
        const result = context.createParsingResult(match.index, match[0]);
        const month = constants_1$B.MONTH_DICTIONARY[match[MONTH_NAME_GROUP$9].toLowerCase()];
        const day = (0, constants_3$3.parseOrdinalNumberPattern)(match[DATE_GROUP$7]);
        if (day > 31) {
            match.index = match.index + match[DATE_GROUP$7].length;
            return null;
        }
        result.start.assign("month", month);
        result.start.assign("day", day);
        if (match[YEAR_GROUP$c]) {
            const yearNumber = (0, constants_2$7.parseYear)(match[YEAR_GROUP$c]);
            result.start.assign("year", yearNumber);
        }
        else {
            const year = (0, years_1$9.findYearClosestToRef)(context.refDate, day, month);
            result.start.imply("year", year);
        }
        if (match[DATE_TO_GROUP$5]) {
            const endDate = (0, constants_3$3.parseOrdinalNumberPattern)(match[DATE_TO_GROUP$5]);
            result.end = result.start.clone();
            result.end.assign("day", endDate);
        }
        return result;
    }
}
ENMonthNameLittleEndianParser$1.default = ENMonthNameLittleEndianParser;

var ENMonthNameMiddleEndianParser$1 = {};

Object.defineProperty(ENMonthNameMiddleEndianParser$1, "__esModule", { value: true });
const years_1$8 = years;
const constants_1$A = constants$7;
const constants_2$6 = constants$7;
const constants_3$2 = constants$7;
const pattern_1$g = pattern;
const AbstractParserWithWordBoundary_1$P = AbstractParserWithWordBoundary;
const PATTERN$A = new RegExp(`(${(0, pattern_1$g.matchAnyPattern)(constants_1$A.MONTH_DICTIONARY)})` +
    "(?:-|/|\\s*,?\\s*)" +
    `(${constants_2$6.ORDINAL_NUMBER_PATTERN})(?!\\s*(?:am|pm))\\s*` +
    "(?:" +
    "(?:to|\\-)\\s*" +
    `(${constants_2$6.ORDINAL_NUMBER_PATTERN})\\s*` +
    ")?" +
    "(?:" +
    "(?:-|/|\\s*,?\\s*)" +
    `(${constants_3$2.YEAR_PATTERN})` +
    ")?" +
    "(?=\\W|$)(?!\\:\\d)", "i");
const MONTH_NAME_GROUP$8 = 1;
const DATE_GROUP$6 = 2;
const DATE_TO_GROUP$4 = 3;
const YEAR_GROUP$b = 4;
class ENMonthNameMiddleEndianParser extends AbstractParserWithWordBoundary_1$P.AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$A;
    }
    innerExtract(context, match) {
        const month = constants_1$A.MONTH_DICTIONARY[match[MONTH_NAME_GROUP$8].toLowerCase()];
        const day = (0, constants_2$6.parseOrdinalNumberPattern)(match[DATE_GROUP$6]);
        if (day > 31) {
            return null;
        }
        const components = context.createParsingComponents({
            day: day,
            month: month,
        });
        if (match[YEAR_GROUP$b]) {
            const year = (0, constants_3$2.parseYear)(match[YEAR_GROUP$b]);
            components.assign("year", year);
        }
        else {
            const year = (0, years_1$8.findYearClosestToRef)(context.refDate, day, month);
            components.imply("year", year);
        }
        if (!match[DATE_TO_GROUP$4]) {
            return components;
        }
        const endDate = (0, constants_2$6.parseOrdinalNumberPattern)(match[DATE_TO_GROUP$4]);
        const result = context.createParsingResult(match.index, match[0]);
        result.start = components;
        result.end = components.clone();
        result.end.assign("day", endDate);
        return result;
    }
}
ENMonthNameMiddleEndianParser$1.default = ENMonthNameMiddleEndianParser;

var ENMonthNameParser$1 = {};

Object.defineProperty(ENMonthNameParser$1, "__esModule", { value: true });
const constants_1$z = constants$7;
const years_1$7 = years;
const pattern_1$f = pattern;
const constants_2$5 = constants$7;
const AbstractParserWithWordBoundary_1$O = AbstractParserWithWordBoundary;
const PATTERN$z = new RegExp(`((?:in)\\s*)?` +
    `(${(0, pattern_1$f.matchAnyPattern)(constants_1$z.MONTH_DICTIONARY)})` +
    `\\s*` +
    `(?:` +
    `[,-]?\\s*(${constants_2$5.YEAR_PATTERN})?` +
    ")?" +
    "(?=[^\\s\\w]|\\s+[^0-9]|\\s+$|$)", "i");
const PREFIX_GROUP$4 = 1;
const MONTH_NAME_GROUP$7 = 2;
const YEAR_GROUP$a = 3;
class ENMonthNameParser extends AbstractParserWithWordBoundary_1$O.AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$z;
    }
    innerExtract(context, match) {
        const monthName = match[MONTH_NAME_GROUP$7].toLowerCase();
        if (match[0].length <= 3 && !constants_1$z.FULL_MONTH_NAME_DICTIONARY[monthName]) {
            return null;
        }
        const result = context.createParsingResult(match.index + (match[PREFIX_GROUP$4] || "").length, match.index + match[0].length);
        result.start.imply("day", 1);
        const month = constants_1$z.MONTH_DICTIONARY[monthName];
        result.start.assign("month", month);
        if (match[YEAR_GROUP$a]) {
            const year = (0, constants_2$5.parseYear)(match[YEAR_GROUP$a]);
            result.start.assign("year", year);
        }
        else {
            const year = (0, years_1$7.findYearClosestToRef)(context.refDate, 1, month);
            result.start.imply("year", year);
        }
        return result;
    }
}
ENMonthNameParser$1.default = ENMonthNameParser;

var ENCasualYearMonthDayParser$1 = {};

Object.defineProperty(ENCasualYearMonthDayParser$1, "__esModule", { value: true });
const constants_1$y = constants$7;
const pattern_1$e = pattern;
const AbstractParserWithWordBoundary_1$N = AbstractParserWithWordBoundary;
const PATTERN$y = new RegExp(`([0-9]{4})[\\.\\/\\s]` +
    `(?:(${(0, pattern_1$e.matchAnyPattern)(constants_1$y.MONTH_DICTIONARY)})|([0-9]{1,2}))[\\.\\/\\s]` +
    `([0-9]{1,2})` +
    "(?=\\W|$)", "i");
const YEAR_NUMBER_GROUP$3 = 1;
const MONTH_NAME_GROUP$6 = 2;
const MONTH_NUMBER_GROUP$2 = 3;
const DATE_NUMBER_GROUP$2 = 4;
class ENCasualYearMonthDayParser extends AbstractParserWithWordBoundary_1$N.AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$y;
    }
    innerExtract(context, match) {
        const month = match[MONTH_NUMBER_GROUP$2]
            ? parseInt(match[MONTH_NUMBER_GROUP$2])
            : constants_1$y.MONTH_DICTIONARY[match[MONTH_NAME_GROUP$6].toLowerCase()];
        if (month < 1 || month > 12) {
            return null;
        }
        const year = parseInt(match[YEAR_NUMBER_GROUP$3]);
        const day = parseInt(match[DATE_NUMBER_GROUP$2]);
        return {
            day: day,
            month: month,
            year: year,
        };
    }
}
ENCasualYearMonthDayParser$1.default = ENCasualYearMonthDayParser;

var ENSlashMonthFormatParser$1 = {};

Object.defineProperty(ENSlashMonthFormatParser$1, "__esModule", { value: true });
const AbstractParserWithWordBoundary_1$M = AbstractParserWithWordBoundary;
const PATTERN$x = new RegExp("([0-9]|0[1-9]|1[012])/([0-9]{4})" + "", "i");
const MONTH_GROUP$4 = 1;
const YEAR_GROUP$9 = 2;
class ENSlashMonthFormatParser extends AbstractParserWithWordBoundary_1$M.AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$x;
    }
    innerExtract(context, match) {
        const year = parseInt(match[YEAR_GROUP$9]);
        const month = parseInt(match[MONTH_GROUP$4]);
        return context.createParsingComponents().imply("day", 1).assign("month", month).assign("year", year);
    }
}
ENSlashMonthFormatParser$1.default = ENSlashMonthFormatParser;

var ENTimeExpressionParser$1 = {};

var AbstractTimeExpressionParser$1 = {};

Object.defineProperty(AbstractTimeExpressionParser$1, "__esModule", { value: true });
AbstractTimeExpressionParser$1.AbstractTimeExpressionParser = void 0;
const index_1$d = dist;
function primaryTimePattern(primaryPrefix, primarySuffix) {
    return new RegExp("(^|\\s|T|\\b)" +
        `${primaryPrefix}` +
        "(\\d{1,4})" +
        "(?:" +
        "(?:\\.|\\:|\\：)" +
        "(\\d{1,2})" +
        "(?:" +
        "(?:\\:|\\：)" +
        "(\\d{2})" +
        "(?:\\.(\\d{1,6}))?" +
        ")?" +
        ")?" +
        "(?:\\s*(a\\.m\\.|p\\.m\\.|am?|pm?))?" +
        `${primarySuffix}`, "i");
}
function followingTimePatten(followingPhase, followingSuffix) {
    return new RegExp(`^(${followingPhase})` +
        "(\\d{1,4})" +
        "(?:" +
        "(?:\\.|\\:|\\：)" +
        "(\\d{1,2})" +
        "(?:" +
        "(?:\\.|\\:|\\：)" +
        "(\\d{1,2})(?:\\.(\\d{1,6}))?" +
        ")?" +
        ")?" +
        "(?:\\s*(a\\.m\\.|p\\.m\\.|am?|pm?))?" +
        `${followingSuffix}`, "i");
}
const HOUR_GROUP$3 = 2;
const MINUTE_GROUP$3 = 3;
const SECOND_GROUP$3 = 4;
const MILLI_SECOND_GROUP = 5;
const AM_PM_HOUR_GROUP$3 = 6;
class AbstractTimeExpressionParser {
    constructor(strictMode = false) {
        this.cachedPrimaryPrefix = null;
        this.cachedPrimarySuffix = null;
        this.cachedPrimaryTimePattern = null;
        this.cachedFollowingPhase = null;
        this.cachedFollowingSuffix = null;
        this.cachedFollowingTimePatten = null;
        this.strictMode = strictMode;
    }
    primarySuffix() {
        return "(?=\\W|$)";
    }
    followingSuffix() {
        return "(?=\\W|$)";
    }
    pattern(context) {
        return this.getPrimaryTimePatternThroughCache();
    }
    extract(context, match) {
        const startComponents = this.extractPrimaryTimeComponents(context, match);
        if (!startComponents) {
            match.index += match[0].length;
            return null;
        }
        const index = match.index + match[1].length;
        const text = match[0].substring(match[1].length);
        const result = context.createParsingResult(index, text, startComponents);
        match.index += match[0].length;
        const remainingText = context.text.substring(match.index);
        const followingPattern = this.getFollowingTimePatternThroughCache();
        const followingMatch = followingPattern.exec(remainingText);
        if (!followingMatch ||
            followingMatch[0].match(/^\s*([+-])\s*\d{3,4}$/)) {
            return this.checkAndReturnWithoutFollowingPattern(result);
        }
        result.end = this.extractFollowingTimeComponents(context, followingMatch, result);
        if (result.end) {
            result.text += followingMatch[0];
        }
        return this.checkAndReturnWithFollowingPattern(result);
    }
    extractPrimaryTimeComponents(context, match, strict = false) {
        const components = context.createParsingComponents();
        let minute = 0;
        let meridiem = null;
        let hour = parseInt(match[HOUR_GROUP$3]);
        if (hour > 100) {
            if (this.strictMode || match[MINUTE_GROUP$3] != null) {
                return null;
            }
            minute = hour % 100;
            hour = Math.floor(hour / 100);
        }
        if (hour > 24) {
            return null;
        }
        if (match[MINUTE_GROUP$3] != null) {
            if (match[MINUTE_GROUP$3].length == 1 && !match[AM_PM_HOUR_GROUP$3]) {
                return null;
            }
            minute = parseInt(match[MINUTE_GROUP$3]);
        }
        if (minute >= 60) {
            return null;
        }
        if (hour > 12) {
            meridiem = index_1$d.Meridiem.PM;
        }
        if (match[AM_PM_HOUR_GROUP$3] != null) {
            if (hour > 12)
                return null;
            const ampm = match[AM_PM_HOUR_GROUP$3][0].toLowerCase();
            if (ampm == "a") {
                meridiem = index_1$d.Meridiem.AM;
                if (hour == 12) {
                    hour = 0;
                }
            }
            if (ampm == "p") {
                meridiem = index_1$d.Meridiem.PM;
                if (hour != 12) {
                    hour += 12;
                }
            }
        }
        components.assign("hour", hour);
        components.assign("minute", minute);
        if (meridiem !== null) {
            components.assign("meridiem", meridiem);
        }
        else {
            if (hour < 12) {
                components.imply("meridiem", index_1$d.Meridiem.AM);
            }
            else {
                components.imply("meridiem", index_1$d.Meridiem.PM);
            }
        }
        if (match[MILLI_SECOND_GROUP] != null) {
            const millisecond = parseInt(match[MILLI_SECOND_GROUP].substring(0, 3));
            if (millisecond >= 1000)
                return null;
            components.assign("millisecond", millisecond);
        }
        if (match[SECOND_GROUP$3] != null) {
            const second = parseInt(match[SECOND_GROUP$3]);
            if (second >= 60)
                return null;
            components.assign("second", second);
        }
        return components;
    }
    extractFollowingTimeComponents(context, match, result) {
        const components = context.createParsingComponents();
        if (match[MILLI_SECOND_GROUP] != null) {
            const millisecond = parseInt(match[MILLI_SECOND_GROUP].substring(0, 3));
            if (millisecond >= 1000)
                return null;
            components.assign("millisecond", millisecond);
        }
        if (match[SECOND_GROUP$3] != null) {
            const second = parseInt(match[SECOND_GROUP$3]);
            if (second >= 60)
                return null;
            components.assign("second", second);
        }
        let hour = parseInt(match[HOUR_GROUP$3]);
        let minute = 0;
        let meridiem = -1;
        if (match[MINUTE_GROUP$3] != null) {
            minute = parseInt(match[MINUTE_GROUP$3]);
        }
        else if (hour > 100) {
            minute = hour % 100;
            hour = Math.floor(hour / 100);
        }
        if (minute >= 60 || hour > 24) {
            return null;
        }
        if (hour >= 12) {
            meridiem = index_1$d.Meridiem.PM;
        }
        if (match[AM_PM_HOUR_GROUP$3] != null) {
            if (hour > 12) {
                return null;
            }
            const ampm = match[AM_PM_HOUR_GROUP$3][0].toLowerCase();
            if (ampm == "a") {
                meridiem = index_1$d.Meridiem.AM;
                if (hour == 12) {
                    hour = 0;
                    if (!components.isCertain("day")) {
                        components.imply("day", components.get("day") + 1);
                    }
                }
            }
            if (ampm == "p") {
                meridiem = index_1$d.Meridiem.PM;
                if (hour != 12)
                    hour += 12;
            }
            if (!result.start.isCertain("meridiem")) {
                if (meridiem == index_1$d.Meridiem.AM) {
                    result.start.imply("meridiem", index_1$d.Meridiem.AM);
                    if (result.start.get("hour") == 12) {
                        result.start.assign("hour", 0);
                    }
                }
                else {
                    result.start.imply("meridiem", index_1$d.Meridiem.PM);
                    if (result.start.get("hour") != 12) {
                        result.start.assign("hour", result.start.get("hour") + 12);
                    }
                }
            }
        }
        components.assign("hour", hour);
        components.assign("minute", minute);
        if (meridiem >= 0) {
            components.assign("meridiem", meridiem);
        }
        else {
            const startAtPM = result.start.isCertain("meridiem") && result.start.get("hour") > 12;
            if (startAtPM) {
                if (result.start.get("hour") - 12 > hour) {
                    components.imply("meridiem", index_1$d.Meridiem.AM);
                }
                else if (hour <= 12) {
                    components.assign("hour", hour + 12);
                    components.assign("meridiem", index_1$d.Meridiem.PM);
                }
            }
            else if (hour > 12) {
                components.imply("meridiem", index_1$d.Meridiem.PM);
            }
            else if (hour <= 12) {
                components.imply("meridiem", index_1$d.Meridiem.AM);
            }
        }
        if (components.date().getTime() < result.start.date().getTime()) {
            components.imply("day", components.get("day") + 1);
        }
        return components;
    }
    checkAndReturnWithoutFollowingPattern(result) {
        if (result.text.match(/^\d$/)) {
            return null;
        }
        if (result.text.match(/\d[apAP]$/)) {
            return null;
        }
        const endingWithNumbers = result.text.match(/[^\d:.](\d[\d.]+)$/);
        if (endingWithNumbers) {
            const endingNumbers = endingWithNumbers[1];
            if (this.strictMode) {
                return null;
            }
            if (endingNumbers.includes(".") && !endingNumbers.match(/\d(\.\d{2})+$/)) {
                return null;
            }
            const endingNumberVal = parseInt(endingNumbers);
            if (endingNumberVal > 24) {
                return null;
            }
        }
        return result;
    }
    checkAndReturnWithFollowingPattern(result) {
        if (result.text.match(/^\d+-\d+$/)) {
            return null;
        }
        const endingWithNumbers = result.text.match(/[^\d:.](\d[\d.]+)\s*-\s*(\d[\d.]+)$/);
        if (endingWithNumbers) {
            if (this.strictMode) {
                return null;
            }
            const startingNumbers = endingWithNumbers[1];
            const endingNumbers = endingWithNumbers[2];
            if (endingNumbers.includes(".") && !endingNumbers.match(/\d(\.\d{2})+$/)) {
                return null;
            }
            const endingNumberVal = parseInt(endingNumbers);
            const startingNumberVal = parseInt(startingNumbers);
            if (endingNumberVal > 24 || startingNumberVal > 24) {
                return null;
            }
        }
        return result;
    }
    getPrimaryTimePatternThroughCache() {
        const primaryPrefix = this.primaryPrefix();
        const primarySuffix = this.primarySuffix();
        if (this.cachedPrimaryPrefix === primaryPrefix && this.cachedPrimarySuffix === primarySuffix) {
            return this.cachedPrimaryTimePattern;
        }
        this.cachedPrimaryTimePattern = primaryTimePattern(primaryPrefix, primarySuffix);
        this.cachedPrimaryPrefix = primaryPrefix;
        this.cachedPrimarySuffix = primarySuffix;
        return this.cachedPrimaryTimePattern;
    }
    getFollowingTimePatternThroughCache() {
        const followingPhase = this.followingPhase();
        const followingSuffix = this.followingSuffix();
        if (this.cachedFollowingPhase === followingPhase && this.cachedFollowingSuffix === followingSuffix) {
            return this.cachedFollowingTimePatten;
        }
        this.cachedFollowingTimePatten = followingTimePatten(followingPhase, followingSuffix);
        this.cachedFollowingPhase = followingPhase;
        this.cachedFollowingSuffix = followingSuffix;
        return this.cachedFollowingTimePatten;
    }
}
AbstractTimeExpressionParser$1.AbstractTimeExpressionParser = AbstractTimeExpressionParser;

Object.defineProperty(ENTimeExpressionParser$1, "__esModule", { value: true });
const index_1$c = dist;
const AbstractTimeExpressionParser_1$4 = AbstractTimeExpressionParser$1;
class ENTimeExpressionParser extends AbstractTimeExpressionParser_1$4.AbstractTimeExpressionParser {
    constructor(strictMode) {
        super(strictMode);
    }
    followingPhase() {
        return "\\s*(?:\\-|\\–|\\~|\\〜|to|\\?)\\s*";
    }
    primaryPrefix() {
        return "(?:(?:at|from)\\s*)??";
    }
    primarySuffix() {
        return "(?:\\s*(?:o\\W*clock|at\\s*night|in\\s*the\\s*(?:morning|afternoon)))?(?!/)(?=\\W|$)";
    }
    extractPrimaryTimeComponents(context, match) {
        const components = super.extractPrimaryTimeComponents(context, match);
        if (components) {
            if (match[0].endsWith("night")) {
                const hour = components.get("hour");
                if (hour >= 6 && hour < 12) {
                    components.assign("hour", components.get("hour") + 12);
                    components.assign("meridiem", index_1$c.Meridiem.PM);
                }
                else if (hour < 6) {
                    components.assign("meridiem", index_1$c.Meridiem.AM);
                }
            }
            if (match[0].endsWith("afternoon")) {
                components.assign("meridiem", index_1$c.Meridiem.PM);
                const hour = components.get("hour");
                if (hour >= 0 && hour <= 6) {
                    components.assign("hour", components.get("hour") + 12);
                }
            }
            if (match[0].endsWith("morning")) {
                components.assign("meridiem", index_1$c.Meridiem.AM);
                const hour = components.get("hour");
                if (hour < 12) {
                    components.assign("hour", components.get("hour"));
                }
            }
        }
        return components;
    }
}
ENTimeExpressionParser$1.default = ENTimeExpressionParser;

var ENTimeUnitAgoFormatParser$1 = {};

var timeunits = {};

Object.defineProperty(timeunits, "__esModule", { value: true });
timeunits.addImpliedTimeUnits = timeunits.reverseTimeUnits = void 0;
function reverseTimeUnits(timeUnits) {
    const reversed = {};
    for (const key in timeUnits) {
        reversed[key] = -timeUnits[key];
    }
    return reversed;
}
timeunits.reverseTimeUnits = reverseTimeUnits;
function addImpliedTimeUnits(components, timeUnits) {
    const output = components.clone();
    let date = components.dayjs();
    for (const key in timeUnits) {
        date = date.add(timeUnits[key], key);
    }
    if ("day" in timeUnits || "d" in timeUnits || "week" in timeUnits || "month" in timeUnits || "year" in timeUnits) {
        output.imply("day", date.date());
        output.imply("month", date.month() + 1);
        output.imply("year", date.year());
    }
    if ("second" in timeUnits || "minute" in timeUnits || "hour" in timeUnits) {
        output.imply("second", date.second());
        output.imply("minute", date.minute());
        output.imply("hour", date.hour());
    }
    return output;
}
timeunits.addImpliedTimeUnits = addImpliedTimeUnits;

Object.defineProperty(ENTimeUnitAgoFormatParser$1, "__esModule", { value: true });
const constants_1$x = constants$7;
const results_1$d = results;
const AbstractParserWithWordBoundary_1$L = AbstractParserWithWordBoundary;
const timeunits_1$6 = timeunits;
const PATTERN$w = new RegExp(`(${constants_1$x.TIME_UNITS_PATTERN})\\s{0,5}(?:ago|before|earlier)(?=(?:\\W|$))`, "i");
const STRICT_PATTERN$3 = new RegExp(`(${constants_1$x.TIME_UNITS_PATTERN})\\s{0,5}ago(?=(?:\\W|$))`, "i");
class ENTimeUnitAgoFormatParser extends AbstractParserWithWordBoundary_1$L.AbstractParserWithWordBoundaryChecking {
    constructor(strictMode) {
        super();
        this.strictMode = strictMode;
    }
    innerPattern() {
        return this.strictMode ? STRICT_PATTERN$3 : PATTERN$w;
    }
    innerExtract(context, match) {
        const timeUnits = (0, constants_1$x.parseTimeUnits)(match[1]);
        const outputTimeUnits = (0, timeunits_1$6.reverseTimeUnits)(timeUnits);
        return results_1$d.ParsingComponents.createRelativeFromReference(context.reference, outputTimeUnits);
    }
}
ENTimeUnitAgoFormatParser$1.default = ENTimeUnitAgoFormatParser;

var ENTimeUnitLaterFormatParser$1 = {};

Object.defineProperty(ENTimeUnitLaterFormatParser$1, "__esModule", { value: true });
const constants_1$w = constants$7;
const results_1$c = results;
const AbstractParserWithWordBoundary_1$K = AbstractParserWithWordBoundary;
const PATTERN$v = new RegExp(`(${constants_1$w.TIME_UNITS_PATTERN})\\s{0,5}(?:later|after|from now|henceforth|forward|out)` + "(?=(?:\\W|$))", "i");
const STRICT_PATTERN$2 = new RegExp("" + "(" + constants_1$w.TIME_UNITS_PATTERN + ")" + "(later|from now)" + "(?=(?:\\W|$))", "i");
const GROUP_NUM_TIMEUNITS$1 = 1;
class ENTimeUnitLaterFormatParser extends AbstractParserWithWordBoundary_1$K.AbstractParserWithWordBoundaryChecking {
    constructor(strictMode) {
        super();
        this.strictMode = strictMode;
    }
    innerPattern() {
        return this.strictMode ? STRICT_PATTERN$2 : PATTERN$v;
    }
    innerExtract(context, match) {
        const fragments = (0, constants_1$w.parseTimeUnits)(match[GROUP_NUM_TIMEUNITS$1]);
        return results_1$c.ParsingComponents.createRelativeFromReference(context.reference, fragments);
    }
}
ENTimeUnitLaterFormatParser$1.default = ENTimeUnitLaterFormatParser;

var ENMergeDateRangeRefiner$1 = {};

var AbstractMergeDateRangeRefiner$1 = {};

var abstractRefiners = {};

Object.defineProperty(abstractRefiners, "__esModule", { value: true });
abstractRefiners.MergingRefiner = abstractRefiners.Filter = void 0;
class Filter {
    refine(context, results) {
        return results.filter((r) => this.isValid(context, r));
    }
}
abstractRefiners.Filter = Filter;
class MergingRefiner {
    refine(context, results) {
        if (results.length < 2) {
            return results;
        }
        const mergedResults = [];
        let curResult = results[0];
        let nextResult = null;
        for (let i = 1; i < results.length; i++) {
            nextResult = results[i];
            const textBetween = context.text.substring(curResult.index + curResult.text.length, nextResult.index);
            if (!this.shouldMergeResults(textBetween, curResult, nextResult, context)) {
                mergedResults.push(curResult);
                curResult = nextResult;
            }
            else {
                const left = curResult;
                const right = nextResult;
                const mergedResult = this.mergeResults(textBetween, left, right, context);
                context.debug(() => {
                    console.log(`${this.constructor.name} merged ${left} and ${right} into ${mergedResult}`);
                });
                curResult = mergedResult;
            }
        }
        if (curResult != null) {
            mergedResults.push(curResult);
        }
        return mergedResults;
    }
}
abstractRefiners.MergingRefiner = MergingRefiner;

Object.defineProperty(AbstractMergeDateRangeRefiner$1, "__esModule", { value: true });
const abstractRefiners_1$3 = abstractRefiners;
class AbstractMergeDateRangeRefiner extends abstractRefiners_1$3.MergingRefiner {
    shouldMergeResults(textBetween, currentResult, nextResult) {
        return !currentResult.end && !nextResult.end && textBetween.match(this.patternBetween()) != null;
    }
    mergeResults(textBetween, fromResult, toResult) {
        if (!fromResult.start.isOnlyWeekdayComponent() && !toResult.start.isOnlyWeekdayComponent()) {
            toResult.start.getCertainComponents().forEach((key) => {
                if (!fromResult.start.isCertain(key)) {
                    fromResult.start.assign(key, toResult.start.get(key));
                }
            });
            fromResult.start.getCertainComponents().forEach((key) => {
                if (!toResult.start.isCertain(key)) {
                    toResult.start.assign(key, fromResult.start.get(key));
                }
            });
        }
        if (fromResult.start.date().getTime() > toResult.start.date().getTime()) {
            let fromMoment = fromResult.start.dayjs();
            let toMoment = toResult.start.dayjs();
            if (fromResult.start.isOnlyWeekdayComponent() && fromMoment.add(-7, "days").isBefore(toMoment)) {
                fromMoment = fromMoment.add(-7, "days");
                fromResult.start.imply("day", fromMoment.date());
                fromResult.start.imply("month", fromMoment.month() + 1);
                fromResult.start.imply("year", fromMoment.year());
            }
            else if (toResult.start.isOnlyWeekdayComponent() && toMoment.add(7, "days").isAfter(fromMoment)) {
                toMoment = toMoment.add(7, "days");
                toResult.start.imply("day", toMoment.date());
                toResult.start.imply("month", toMoment.month() + 1);
                toResult.start.imply("year", toMoment.year());
            }
            else {
                [toResult, fromResult] = [fromResult, toResult];
            }
        }
        const result = fromResult.clone();
        result.start = fromResult.start;
        result.end = toResult.start;
        result.index = Math.min(fromResult.index, toResult.index);
        if (fromResult.index < toResult.index) {
            result.text = fromResult.text + textBetween + toResult.text;
        }
        else {
            result.text = toResult.text + textBetween + fromResult.text;
        }
        return result;
    }
}
AbstractMergeDateRangeRefiner$1.default = AbstractMergeDateRangeRefiner;

var __importDefault$G = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(ENMergeDateRangeRefiner$1, "__esModule", { value: true });
const AbstractMergeDateRangeRefiner_1$7 = __importDefault$G(AbstractMergeDateRangeRefiner$1);
class ENMergeDateRangeRefiner extends AbstractMergeDateRangeRefiner_1$7.default {
    patternBetween() {
        return /^\s*(to|-)\s*$/i;
    }
}
ENMergeDateRangeRefiner$1.default = ENMergeDateRangeRefiner;

var ENMergeDateTimeRefiner$2 = {};

var AbstractMergeDateTimeRefiner = {};

var mergingCalculation = {};

Object.defineProperty(mergingCalculation, "__esModule", { value: true });
mergingCalculation.mergeDateTimeComponent = mergingCalculation.mergeDateTimeResult = void 0;
const index_1$b = dist;
function mergeDateTimeResult(dateResult, timeResult) {
    const result = dateResult.clone();
    const beginDate = dateResult.start;
    const beginTime = timeResult.start;
    result.start = mergeDateTimeComponent(beginDate, beginTime);
    if (dateResult.end != null || timeResult.end != null) {
        const endDate = dateResult.end == null ? dateResult.start : dateResult.end;
        const endTime = timeResult.end == null ? timeResult.start : timeResult.end;
        const endDateTime = mergeDateTimeComponent(endDate, endTime);
        if (dateResult.end == null && endDateTime.date().getTime() < result.start.date().getTime()) {
            if (endDateTime.isCertain("day")) {
                endDateTime.assign("day", endDateTime.get("day") + 1);
            }
            else {
                endDateTime.imply("day", endDateTime.get("day") + 1);
            }
        }
        result.end = endDateTime;
    }
    return result;
}
mergingCalculation.mergeDateTimeResult = mergeDateTimeResult;
function mergeDateTimeComponent(dateComponent, timeComponent) {
    const dateTimeComponent = dateComponent.clone();
    if (timeComponent.isCertain("hour")) {
        dateTimeComponent.assign("hour", timeComponent.get("hour"));
        dateTimeComponent.assign("minute", timeComponent.get("minute"));
        if (timeComponent.isCertain("second")) {
            dateTimeComponent.assign("second", timeComponent.get("second"));
            if (timeComponent.isCertain("millisecond")) {
                dateTimeComponent.assign("millisecond", timeComponent.get("millisecond"));
            }
            else {
                dateTimeComponent.imply("millisecond", timeComponent.get("millisecond"));
            }
        }
        else {
            dateTimeComponent.imply("second", timeComponent.get("second"));
            dateTimeComponent.imply("millisecond", timeComponent.get("millisecond"));
        }
    }
    else {
        dateTimeComponent.imply("hour", timeComponent.get("hour"));
        dateTimeComponent.imply("minute", timeComponent.get("minute"));
        dateTimeComponent.imply("second", timeComponent.get("second"));
        dateTimeComponent.imply("millisecond", timeComponent.get("millisecond"));
    }
    if (timeComponent.isCertain("timezoneOffset")) {
        dateTimeComponent.assign("timezoneOffset", timeComponent.get("timezoneOffset"));
    }
    if (timeComponent.isCertain("meridiem")) {
        dateTimeComponent.assign("meridiem", timeComponent.get("meridiem"));
    }
    else if (timeComponent.get("meridiem") != null && dateTimeComponent.get("meridiem") == null) {
        dateTimeComponent.imply("meridiem", timeComponent.get("meridiem"));
    }
    if (dateTimeComponent.get("meridiem") == index_1$b.Meridiem.PM && dateTimeComponent.get("hour") < 12) {
        if (timeComponent.isCertain("hour")) {
            dateTimeComponent.assign("hour", dateTimeComponent.get("hour") + 12);
        }
        else {
            dateTimeComponent.imply("hour", dateTimeComponent.get("hour") + 12);
        }
    }
    return dateTimeComponent;
}
mergingCalculation.mergeDateTimeComponent = mergeDateTimeComponent;

Object.defineProperty(AbstractMergeDateTimeRefiner, "__esModule", { value: true });
const abstractRefiners_1$2 = abstractRefiners;
const mergingCalculation_1 = mergingCalculation;
class ENMergeDateTimeRefiner$1 extends abstractRefiners_1$2.MergingRefiner {
    shouldMergeResults(textBetween, currentResult, nextResult) {
        return (((currentResult.start.isOnlyDate() && nextResult.start.isOnlyTime()) ||
            (nextResult.start.isOnlyDate() && currentResult.start.isOnlyTime())) &&
            textBetween.match(this.patternBetween()) != null);
    }
    mergeResults(textBetween, currentResult, nextResult) {
        const result = currentResult.start.isOnlyDate()
            ? (0, mergingCalculation_1.mergeDateTimeResult)(currentResult, nextResult)
            : (0, mergingCalculation_1.mergeDateTimeResult)(nextResult, currentResult);
        result.index = currentResult.index;
        result.text = currentResult.text + textBetween + nextResult.text;
        return result;
    }
}
AbstractMergeDateTimeRefiner.default = ENMergeDateTimeRefiner$1;

var __importDefault$F = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(ENMergeDateTimeRefiner$2, "__esModule", { value: true });
const AbstractMergeDateTimeRefiner_1$6 = __importDefault$F(AbstractMergeDateTimeRefiner);
class ENMergeDateTimeRefiner extends AbstractMergeDateTimeRefiner_1$6.default {
    patternBetween() {
        return new RegExp("^\\s*(T|at|after|before|on|of|,|-)?\\s*$");
    }
}
ENMergeDateTimeRefiner$2.default = ENMergeDateTimeRefiner;

var configurations = {};

var ExtractTimezoneAbbrRefiner$1 = {};

Object.defineProperty(ExtractTimezoneAbbrRefiner$1, "__esModule", { value: true });
const TIMEZONE_NAME_PATTERN = new RegExp("^\\s*,?\\s*\\(?([A-Z]{2,4})\\)?(?=\\W|$)", "i");
const DEFAULT_TIMEZONE_ABBR_MAP = {
    ACDT: 630,
    ACST: 570,
    ADT: -180,
    AEDT: 660,
    AEST: 600,
    AFT: 270,
    AKDT: -480,
    AKST: -540,
    ALMT: 360,
    AMST: -180,
    AMT: -240,
    ANAST: 720,
    ANAT: 720,
    AQTT: 300,
    ART: -180,
    AST: -240,
    AWDT: 540,
    AWST: 480,
    AZOST: 0,
    AZOT: -60,
    AZST: 300,
    AZT: 240,
    BNT: 480,
    BOT: -240,
    BRST: -120,
    BRT: -180,
    BST: 60,
    BTT: 360,
    CAST: 480,
    CAT: 120,
    CCT: 390,
    CDT: -300,
    CEST: 120,
    CET: 60,
    CHADT: 825,
    CHAST: 765,
    CKT: -600,
    CLST: -180,
    CLT: -240,
    COT: -300,
    CST: -360,
    CVT: -60,
    CXT: 420,
    ChST: 600,
    DAVT: 420,
    EASST: -300,
    EAST: -360,
    EAT: 180,
    ECT: -300,
    EDT: -240,
    EEST: 180,
    EET: 120,
    EGST: 0,
    EGT: -60,
    EST: -300,
    ET: -300,
    FJST: 780,
    FJT: 720,
    FKST: -180,
    FKT: -240,
    FNT: -120,
    GALT: -360,
    GAMT: -540,
    GET: 240,
    GFT: -180,
    GILT: 720,
    GMT: 0,
    GST: 240,
    GYT: -240,
    HAA: -180,
    HAC: -300,
    HADT: -540,
    HAE: -240,
    HAP: -420,
    HAR: -360,
    HAST: -600,
    HAT: -90,
    HAY: -480,
    HKT: 480,
    HLV: -210,
    HNA: -240,
    HNC: -360,
    HNE: -300,
    HNP: -480,
    HNR: -420,
    HNT: -150,
    HNY: -540,
    HOVT: 420,
    ICT: 420,
    IDT: 180,
    IOT: 360,
    IRDT: 270,
    IRKST: 540,
    IRKT: 540,
    IRST: 210,
    IST: 330,
    JST: 540,
    KGT: 360,
    KRAST: 480,
    KRAT: 480,
    KST: 540,
    KUYT: 240,
    LHDT: 660,
    LHST: 630,
    LINT: 840,
    MAGST: 720,
    MAGT: 720,
    MART: -510,
    MAWT: 300,
    MDT: -360,
    MESZ: 120,
    MEZ: 60,
    MHT: 720,
    MMT: 390,
    MSD: 240,
    MSK: 240,
    MST: -420,
    MUT: 240,
    MVT: 300,
    MYT: 480,
    NCT: 660,
    NDT: -90,
    NFT: 690,
    NOVST: 420,
    NOVT: 360,
    NPT: 345,
    NST: -150,
    NUT: -660,
    NZDT: 780,
    NZST: 720,
    OMSST: 420,
    OMST: 420,
    PDT: -420,
    PET: -300,
    PETST: 720,
    PETT: 720,
    PGT: 600,
    PHOT: 780,
    PHT: 480,
    PKT: 300,
    PMDT: -120,
    PMST: -180,
    PONT: 660,
    PST: -480,
    PT: -480,
    PWT: 540,
    PYST: -180,
    PYT: -240,
    RET: 240,
    SAMT: 240,
    SAST: 120,
    SBT: 660,
    SCT: 240,
    SGT: 480,
    SRT: -180,
    SST: -660,
    TAHT: -600,
    TFT: 300,
    TJT: 300,
    TKT: 780,
    TLT: 540,
    TMT: 300,
    TVT: 720,
    ULAT: 480,
    UTC: 0,
    UYST: -120,
    UYT: -180,
    UZT: 300,
    VET: -210,
    VLAST: 660,
    VLAT: 660,
    VUT: 660,
    WAST: 120,
    WAT: 60,
    WEST: 60,
    WESZ: 60,
    WET: 0,
    WEZ: 0,
    WFT: 720,
    WGST: -120,
    WGT: -180,
    WIB: 420,
    WIT: 540,
    WITA: 480,
    WST: 780,
    WT: 0,
    YAKST: 600,
    YAKT: 600,
    YAPT: 600,
    YEKST: 360,
    YEKT: 360,
};
class ExtractTimezoneAbbrRefiner {
    constructor(timezoneOverrides) {
        this.timezone = Object.assign(Object.assign({}, DEFAULT_TIMEZONE_ABBR_MAP), timezoneOverrides);
    }
    refine(context, results) {
        var _a;
        const timezoneOverrides = (_a = context.option.timezones) !== null && _a !== void 0 ? _a : {};
        results.forEach((result) => {
            var _a, _b;
            const suffix = context.text.substring(result.index + result.text.length);
            const match = TIMEZONE_NAME_PATTERN.exec(suffix);
            if (!match) {
                return;
            }
            const timezoneAbbr = match[1].toUpperCase();
            const extractedTimezoneOffset = (_b = (_a = timezoneOverrides[timezoneAbbr]) !== null && _a !== void 0 ? _a : this.timezone[timezoneAbbr]) !== null && _b !== void 0 ? _b : null;
            if (extractedTimezoneOffset === null) {
                return;
            }
            context.debug(() => {
                console.log(`Extracting timezone: '${timezoneAbbr}' into : ${extractedTimezoneOffset}`);
            });
            const currentTimezoneOffset = result.start.get("timezoneOffset");
            if (currentTimezoneOffset !== null && extractedTimezoneOffset != currentTimezoneOffset) {
                if (result.start.isCertain("timezoneOffset")) {
                    return;
                }
                if (timezoneAbbr != match[1]) {
                    return;
                }
            }
            if (result.start.isOnlyDate()) {
                if (timezoneAbbr != match[1]) {
                    return;
                }
            }
            result.text += match[0];
            if (!result.start.isCertain("timezoneOffset")) {
                result.start.assign("timezoneOffset", extractedTimezoneOffset);
            }
            if (result.end != null && !result.end.isCertain("timezoneOffset")) {
                result.end.assign("timezoneOffset", extractedTimezoneOffset);
            }
        });
        return results;
    }
}
ExtractTimezoneAbbrRefiner$1.default = ExtractTimezoneAbbrRefiner;

var ExtractTimezoneOffsetRefiner$1 = {};

Object.defineProperty(ExtractTimezoneOffsetRefiner$1, "__esModule", { value: true });
const TIMEZONE_OFFSET_PATTERN = new RegExp("^\\s*(?:(?:GMT|UTC)\\s?)?([+-])(\\d{1,2})(?::?(\\d{2}))?", "i");
const TIMEZONE_OFFSET_SIGN_GROUP = 1;
const TIMEZONE_OFFSET_HOUR_OFFSET_GROUP = 2;
const TIMEZONE_OFFSET_MINUTE_OFFSET_GROUP = 3;
class ExtractTimezoneOffsetRefiner {
    refine(context, results) {
        results.forEach(function (result) {
            if (result.start.isCertain("timezoneOffset")) {
                return;
            }
            const suffix = context.text.substring(result.index + result.text.length);
            const match = TIMEZONE_OFFSET_PATTERN.exec(suffix);
            if (!match) {
                return;
            }
            context.debug(() => {
                console.log(`Extracting timezone: '${match[0]}' into : ${result}`);
            });
            const hourOffset = parseInt(match[TIMEZONE_OFFSET_HOUR_OFFSET_GROUP]);
            const minuteOffset = parseInt(match[TIMEZONE_OFFSET_MINUTE_OFFSET_GROUP] || "0");
            let timezoneOffset = hourOffset * 60 + minuteOffset;
            if (match[TIMEZONE_OFFSET_SIGN_GROUP] === "-") {
                timezoneOffset = -timezoneOffset;
            }
            if (result.end != null) {
                result.end.assign("timezoneOffset", timezoneOffset);
            }
            result.start.assign("timezoneOffset", timezoneOffset);
            result.text += match[0];
        });
        return results;
    }
}
ExtractTimezoneOffsetRefiner$1.default = ExtractTimezoneOffsetRefiner;

var OverlapRemovalRefiner$1 = {};

Object.defineProperty(OverlapRemovalRefiner$1, "__esModule", { value: true });
class OverlapRemovalRefiner {
    refine(context, results) {
        if (results.length < 2) {
            return results;
        }
        const filteredResults = [];
        let prevResult = results[0];
        for (let i = 1; i < results.length; i++) {
            const result = results[i];
            if (result.index < prevResult.index + prevResult.text.length) {
                if (result.text.length > prevResult.text.length) {
                    prevResult = result;
                }
            }
            else {
                filteredResults.push(prevResult);
                prevResult = result;
            }
        }
        if (prevResult != null) {
            filteredResults.push(prevResult);
        }
        return filteredResults;
    }
}
OverlapRemovalRefiner$1.default = OverlapRemovalRefiner;

var ForwardDateRefiner$1 = {};

var __importDefault$E = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(ForwardDateRefiner$1, "__esModule", { value: true });
const dayjs_1$q = __importDefault$E(require$$0);
class ForwardDateRefiner {
    refine(context, results) {
        if (!context.option.forwardDate) {
            return results;
        }
        results.forEach(function (result) {
            let refMoment = (0, dayjs_1$q.default)(context.refDate);
            if (result.start.isOnlyDayMonthComponent() && refMoment.isAfter(result.start.dayjs())) {
                for (let i = 0; i < 3 && refMoment.isAfter(result.start.dayjs()); i++) {
                    result.start.imply("year", result.start.get("year") + 1);
                    context.debug(() => {
                        console.log(`Forward yearly adjusted for ${result} (${result.start})`);
                    });
                    if (result.end && !result.end.isCertain("year")) {
                        result.end.imply("year", result.end.get("year") + 1);
                        context.debug(() => {
                            console.log(`Forward yearly adjusted for ${result} (${result.end})`);
                        });
                    }
                }
            }
            if (result.start.isOnlyWeekdayComponent() && refMoment.isAfter(result.start.dayjs())) {
                if (refMoment.day() >= result.start.get("weekday")) {
                    refMoment = refMoment.day(result.start.get("weekday") + 7);
                }
                else {
                    refMoment = refMoment.day(result.start.get("weekday"));
                }
                result.start.imply("day", refMoment.date());
                result.start.imply("month", refMoment.month() + 1);
                result.start.imply("year", refMoment.year());
                context.debug(() => {
                    console.log(`Forward weekly adjusted for ${result} (${result.start})`);
                });
                if (result.end && result.end.isOnlyWeekdayComponent()) {
                    if (refMoment.day() > result.end.get("weekday")) {
                        refMoment = refMoment.day(result.end.get("weekday") + 7);
                    }
                    else {
                        refMoment = refMoment.day(result.end.get("weekday"));
                    }
                    result.end.imply("day", refMoment.date());
                    result.end.imply("month", refMoment.month() + 1);
                    result.end.imply("year", refMoment.year());
                    context.debug(() => {
                        console.log(`Forward weekly adjusted for ${result} (${result.end})`);
                    });
                }
            }
        });
        return results;
    }
}
ForwardDateRefiner$1.default = ForwardDateRefiner;

var UnlikelyFormatFilter$1 = {};

Object.defineProperty(UnlikelyFormatFilter$1, "__esModule", { value: true });
const abstractRefiners_1$1 = abstractRefiners;
class UnlikelyFormatFilter extends abstractRefiners_1$1.Filter {
    constructor(strictMode) {
        super();
        this.strictMode = strictMode;
    }
    isValid(context, result) {
        if (result.text.replace(" ", "").match(/^\d*(\.\d*)?$/)) {
            context.debug(() => {
                console.log(`Removing unlikely result '${result.text}'`);
            });
            return false;
        }
        if (!result.start.isValidDate()) {
            context.debug(() => {
                console.log(`Removing invalid result: ${result} (${result.start})`);
            });
            return false;
        }
        if (result.end && !result.end.isValidDate()) {
            context.debug(() => {
                console.log(`Removing invalid result: ${result} (${result.end})`);
            });
            return false;
        }
        if (this.strictMode) {
            return this.isStrictModeValid(context, result);
        }
        return true;
    }
    isStrictModeValid(context, result) {
        if (result.start.isOnlyWeekdayComponent()) {
            context.debug(() => {
                console.log(`(Strict) Removing weekday only component: ${result} (${result.end})`);
            });
            return false;
        }
        if (result.start.isOnlyTime() && (!result.start.isCertain("hour") || !result.start.isCertain("minute"))) {
            context.debug(() => {
                console.log(`(Strict) Removing uncertain time component: ${result} (${result.end})`);
            });
            return false;
        }
        return true;
    }
}
UnlikelyFormatFilter$1.default = UnlikelyFormatFilter;

var ISOFormatParser$1 = {};

Object.defineProperty(ISOFormatParser$1, "__esModule", { value: true });
const AbstractParserWithWordBoundary_1$J = AbstractParserWithWordBoundary;
const PATTERN$u = new RegExp("([0-9]{4})\\-([0-9]{1,2})\\-([0-9]{1,2})" +
    "(?:T" +
    "([0-9]{1,2}):([0-9]{1,2})" +
    "(?:" +
    ":([0-9]{1,2})(?:\\.(\\d{1,4}))?" +
    ")?" +
    "(?:" +
    "Z|([+-]\\d{2}):?(\\d{2})?" +
    ")?" +
    ")?" +
    "(?=\\W|$)", "i");
const YEAR_NUMBER_GROUP$2 = 1;
const MONTH_NUMBER_GROUP$1 = 2;
const DATE_NUMBER_GROUP$1 = 3;
const HOUR_NUMBER_GROUP = 4;
const MINUTE_NUMBER_GROUP = 5;
const SECOND_NUMBER_GROUP = 6;
const MILLISECOND_NUMBER_GROUP = 7;
const TZD_HOUR_OFFSET_GROUP = 8;
const TZD_MINUTE_OFFSET_GROUP = 9;
class ISOFormatParser extends AbstractParserWithWordBoundary_1$J.AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$u;
    }
    innerExtract(context, match) {
        const components = {};
        components["year"] = parseInt(match[YEAR_NUMBER_GROUP$2]);
        components["month"] = parseInt(match[MONTH_NUMBER_GROUP$1]);
        components["day"] = parseInt(match[DATE_NUMBER_GROUP$1]);
        if (match[HOUR_NUMBER_GROUP] != null) {
            components["hour"] = parseInt(match[HOUR_NUMBER_GROUP]);
            components["minute"] = parseInt(match[MINUTE_NUMBER_GROUP]);
            if (match[SECOND_NUMBER_GROUP] != null) {
                components["second"] = parseInt(match[SECOND_NUMBER_GROUP]);
            }
            if (match[MILLISECOND_NUMBER_GROUP] != null) {
                components["millisecond"] = parseInt(match[MILLISECOND_NUMBER_GROUP]);
            }
            if (match[TZD_HOUR_OFFSET_GROUP] == null) {
                components["timezoneOffset"] = 0;
            }
            else {
                const hourOffset = parseInt(match[TZD_HOUR_OFFSET_GROUP]);
                let minuteOffset = 0;
                if (match[TZD_MINUTE_OFFSET_GROUP] != null) {
                    minuteOffset = parseInt(match[TZD_MINUTE_OFFSET_GROUP]);
                }
                let offset = hourOffset * 60;
                if (offset < 0) {
                    offset -= minuteOffset;
                }
                else {
                    offset += minuteOffset;
                }
                components["timezoneOffset"] = offset;
            }
        }
        return components;
    }
}
ISOFormatParser$1.default = ISOFormatParser;

var MergeWeekdayComponentRefiner$1 = {};

Object.defineProperty(MergeWeekdayComponentRefiner$1, "__esModule", { value: true });
const abstractRefiners_1 = abstractRefiners;
class MergeWeekdayComponentRefiner extends abstractRefiners_1.MergingRefiner {
    mergeResults(textBetween, currentResult, nextResult) {
        const newResult = nextResult.clone();
        newResult.index = currentResult.index;
        newResult.text = currentResult.text + textBetween + newResult.text;
        newResult.start.assign("weekday", currentResult.start.get("weekday"));
        if (newResult.end) {
            newResult.end.assign("weekday", currentResult.start.get("weekday"));
        }
        return newResult;
    }
    shouldMergeResults(textBetween, currentResult, nextResult) {
        const weekdayThenNormalDate = currentResult.start.isOnlyWeekdayComponent() &&
            !currentResult.start.isCertain("hour") &&
            nextResult.start.isCertain("day");
        return weekdayThenNormalDate && textBetween.match(/^,?\s*$/) != null;
    }
}
MergeWeekdayComponentRefiner$1.default = MergeWeekdayComponentRefiner;

var __importDefault$D = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(configurations, "__esModule", { value: true });
configurations.includeCommonConfiguration = void 0;
const ExtractTimezoneAbbrRefiner_1 = __importDefault$D(ExtractTimezoneAbbrRefiner$1);
const ExtractTimezoneOffsetRefiner_1 = __importDefault$D(ExtractTimezoneOffsetRefiner$1);
const OverlapRemovalRefiner_1 = __importDefault$D(OverlapRemovalRefiner$1);
const ForwardDateRefiner_1 = __importDefault$D(ForwardDateRefiner$1);
const UnlikelyFormatFilter_1 = __importDefault$D(UnlikelyFormatFilter$1);
const ISOFormatParser_1 = __importDefault$D(ISOFormatParser$1);
const MergeWeekdayComponentRefiner_1 = __importDefault$D(MergeWeekdayComponentRefiner$1);
function includeCommonConfiguration(configuration, strictMode = false) {
    configuration.parsers.unshift(new ISOFormatParser_1.default());
    configuration.refiners.unshift(new MergeWeekdayComponentRefiner_1.default());
    configuration.refiners.unshift(new ExtractTimezoneAbbrRefiner_1.default());
    configuration.refiners.unshift(new ExtractTimezoneOffsetRefiner_1.default());
    configuration.refiners.unshift(new OverlapRemovalRefiner_1.default());
    configuration.refiners.push(new OverlapRemovalRefiner_1.default());
    configuration.refiners.push(new ForwardDateRefiner_1.default());
    configuration.refiners.push(new UnlikelyFormatFilter_1.default(strictMode));
    return configuration;
}
configurations.includeCommonConfiguration = includeCommonConfiguration;

var ENCasualDateParser$1 = {};

var casualReferences = {};

var __importDefault$C = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(casualReferences, "__esModule", { value: true });
casualReferences.tonight = casualReferences.tomorrow = casualReferences.yesterday = casualReferences.today = casualReferences.now = void 0;
const results_1$b = results;
const dayjs_1$p = __importDefault$C(require$$0);
const dayjs_2$8 = dayjs;
const index_1$a = dist;
function now(reference) {
    const targetDate = (0, dayjs_1$p.default)(reference.instant);
    const component = new results_1$b.ParsingComponents(reference, {});
    (0, dayjs_2$8.assignSimilarDate)(component, targetDate);
    (0, dayjs_2$8.assignSimilarTime)(component, targetDate);
    if (reference.timezoneOffset !== null) {
        component.assign("timezoneOffset", targetDate.utcOffset());
    }
    return component;
}
casualReferences.now = now;
function today(reference) {
    const targetDate = (0, dayjs_1$p.default)(reference.instant);
    const component = new results_1$b.ParsingComponents(reference, {});
    (0, dayjs_2$8.assignSimilarDate)(component, targetDate);
    (0, dayjs_2$8.implySimilarTime)(component, targetDate);
    return component;
}
casualReferences.today = today;
function yesterday(reference) {
    let targetDate = (0, dayjs_1$p.default)(reference.instant);
    const component = new results_1$b.ParsingComponents(reference, {});
    targetDate = targetDate.add(-1, "day");
    (0, dayjs_2$8.assignSimilarDate)(component, targetDate);
    (0, dayjs_2$8.implySimilarTime)(component, targetDate);
    return component;
}
casualReferences.yesterday = yesterday;
function tomorrow(reference) {
    const targetDate = (0, dayjs_1$p.default)(reference.instant);
    const component = new results_1$b.ParsingComponents(reference, {});
    (0, dayjs_2$8.assignTheNextDay)(component, targetDate);
    return component;
}
casualReferences.tomorrow = tomorrow;
function tonight(reference, implyHour = 22) {
    const targetDate = (0, dayjs_1$p.default)(reference.instant);
    const component = new results_1$b.ParsingComponents(reference, {});
    component.imply("hour", implyHour);
    component.imply("meridiem", index_1$a.Meridiem.PM);
    (0, dayjs_2$8.assignSimilarDate)(component, targetDate);
    return component;
}
casualReferences.tonight = tonight;

var __createBinding$5 = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault$5 = (commonjsGlobal && commonjsGlobal.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar$5 = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding$5(result, mod, k);
    __setModuleDefault$5(result, mod);
    return result;
};
var __importDefault$B = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(ENCasualDateParser$1, "__esModule", { value: true });
const dayjs_1$o = __importDefault$B(require$$0);
const AbstractParserWithWordBoundary_1$I = AbstractParserWithWordBoundary;
const dayjs_2$7 = dayjs;
const references$5 = __importStar$5(casualReferences);
const PATTERN$t = /(now|today|tonight|tomorrow|tmr|tmrw|yesterday|last\s*night)(?=\W|$)/i;
class ENCasualDateParser extends AbstractParserWithWordBoundary_1$I.AbstractParserWithWordBoundaryChecking {
    innerPattern(context) {
        return PATTERN$t;
    }
    innerExtract(context, match) {
        let targetDate = (0, dayjs_1$o.default)(context.refDate);
        const lowerText = match[0].toLowerCase();
        const component = context.createParsingComponents();
        switch (lowerText) {
            case "now":
                return references$5.now(context.reference);
            case "today":
                return references$5.today(context.reference);
            case "yesterday":
                return references$5.yesterday(context.reference);
            case "tomorrow":
            case "tmr":
            case "tmrw":
                return references$5.tomorrow(context.reference);
            case "tonight":
                return references$5.tonight(context.reference);
            default:
                if (lowerText.match(/last\s*night/)) {
                    if (targetDate.hour() > 6) {
                        targetDate = targetDate.add(-1, "day");
                    }
                    (0, dayjs_2$7.assignSimilarDate)(component, targetDate);
                    component.imply("hour", 0);
                }
                break;
        }
        return component;
    }
}
ENCasualDateParser$1.default = ENCasualDateParser;

var ENCasualTimeParser$1 = {};

var __importDefault$A = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(ENCasualTimeParser$1, "__esModule", { value: true });
const index_1$9 = dist;
const AbstractParserWithWordBoundary_1$H = AbstractParserWithWordBoundary;
const dayjs_1$n = __importDefault$A(require$$0);
const dayjs_2$6 = dayjs;
const PATTERN$s = /(?:this)?\s{0,3}(morning|afternoon|evening|night|midnight|noon)(?=\W|$)/i;
class ENCasualTimeParser extends AbstractParserWithWordBoundary_1$H.AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$s;
    }
    innerExtract(context, match) {
        const targetDate = (0, dayjs_1$n.default)(context.refDate);
        const component = context.createParsingComponents();
        switch (match[1].toLowerCase()) {
            case "afternoon":
                component.imply("meridiem", index_1$9.Meridiem.PM);
                component.imply("hour", 15);
                break;
            case "evening":
            case "night":
                component.imply("meridiem", index_1$9.Meridiem.PM);
                component.imply("hour", 20);
                break;
            case "midnight":
                (0, dayjs_2$6.assignTheNextDay)(component, targetDate);
                component.imply("hour", 0);
                component.imply("minute", 0);
                component.imply("second", 0);
                break;
            case "morning":
                component.imply("meridiem", index_1$9.Meridiem.AM);
                component.imply("hour", 6);
                break;
            case "noon":
                component.imply("meridiem", index_1$9.Meridiem.AM);
                component.imply("hour", 12);
                break;
        }
        return component;
    }
}
ENCasualTimeParser$1.default = ENCasualTimeParser;

var ENWeekdayParser$1 = {};

var weeks = {};

var __importDefault$z = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(weeks, "__esModule", { value: true });
weeks.toDayJSClosestWeekday = weeks.toDayJSWeekday = void 0;
const dayjs_1$m = __importDefault$z(require$$0);
function toDayJSWeekday(refDate, offset, modifier, locale) {
    var _a;
    if (!modifier) {
        return toDayJSClosestWeekday(refDate, offset, locale);
    }
    let date = (0, dayjs_1$m.default)(refDate).locale("en", locale);
    const weekStart = (_a = locale === null || locale === void 0 ? void 0 : locale.weekStart) !== null && _a !== void 0 ? _a : 0;
    const weekdayOffset = (7 + offset - weekStart) % 7;
    switch (modifier) {
        case "this":
            date = date.weekday(weekdayOffset);
            break;
        case "next":
            date = date.weekday(weekdayOffset + 7);
            break;
        case "last":
            date = date.weekday(weekdayOffset - 7);
            break;
    }
    return date;
}
weeks.toDayJSWeekday = toDayJSWeekday;
function toDayJSClosestWeekday(refDate, offset, locale) {
    var _a;
    let date = (0, dayjs_1$m.default)(refDate).locale("en", locale);
    const refOffset = date.weekday();
    const weekStart = (_a = locale === null || locale === void 0 ? void 0 : locale.weekStart) !== null && _a !== void 0 ? _a : 0;
    const weekdayOffset = (7 + offset - weekStart) % 7;
    if (Math.abs(weekdayOffset - 7 - refOffset) < Math.abs(weekdayOffset - refOffset)) {
        date = date.weekday(weekdayOffset - 7);
    }
    else if (Math.abs(weekdayOffset + 7 - refOffset) < Math.abs(weekdayOffset - refOffset)) {
        date = date.weekday(weekdayOffset + 7);
    }
    else {
        date = date.weekday(weekdayOffset);
    }
    return date;
}
weeks.toDayJSClosestWeekday = toDayJSClosestWeekday;

Object.defineProperty(ENWeekdayParser$1, "__esModule", { value: true });
const constants_1$v = constants$7;
const pattern_1$d = pattern;
const AbstractParserWithWordBoundary_1$G = AbstractParserWithWordBoundary;
const weeks_1$4 = weeks;
const PATTERN$r = new RegExp("(?:(?:\\,|\\(|\\（)\\s*)?" +
    "(?:on\\s*?)?" +
    "(?:(this|last|past|next)\\s*)?" +
    `(${(0, pattern_1$d.matchAnyPattern)(constants_1$v.WEEKDAY_DICTIONARY)})` +
    "(?:\\s*(?:\\,|\\)|\\）))?" +
    "(?:\\s*(this|last|past|next)\\s*week)?" +
    "(?=\\W|$)", "i");
const PREFIX_GROUP$3 = 1;
const WEEKDAY_GROUP$4 = 2;
const POSTFIX_GROUP$3 = 3;
class ENWeekdayParser extends AbstractParserWithWordBoundary_1$G.AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$r;
    }
    innerExtract(context, match) {
        const dayOfWeek = match[WEEKDAY_GROUP$4].toLowerCase();
        const offset = constants_1$v.WEEKDAY_DICTIONARY[dayOfWeek];
        const prefix = match[PREFIX_GROUP$3];
        const postfix = match[POSTFIX_GROUP$3];
        let modifierWord = prefix || postfix;
        modifierWord = modifierWord || "";
        modifierWord = modifierWord.toLowerCase();
        let modifier = null;
        if (modifierWord == "last" || modifierWord == "past") {
            modifier = "last";
        }
        else if (modifierWord == "next") {
            modifier = "next";
        }
        else if (modifierWord == "this") {
            modifier = "this";
        }
        const date = (0, weeks_1$4.toDayJSWeekday)(context.refDate, offset, modifier, context.option.locale);
        return context
            .createParsingComponents()
            .assign("weekday", offset)
            .imply("day", date.date())
            .imply("month", date.month() + 1)
            .imply("year", date.year());
    }
}
ENWeekdayParser$1.default = ENWeekdayParser;

var ENRelativeDateFormatParser$1 = {};

var __importDefault$y = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(ENRelativeDateFormatParser$1, "__esModule", { value: true });
const constants_1$u = constants$7;
const results_1$a = results;
const dayjs_1$l = __importDefault$y(require$$0);
const AbstractParserWithWordBoundary_1$F = AbstractParserWithWordBoundary;
const pattern_1$c = pattern;
const PATTERN$q = new RegExp(`(this|next|last|past)\\s*(${(0, pattern_1$c.matchAnyPattern)(constants_1$u.TIME_UNIT_DICTIONARY)})(?=\\s*)` + "(?=\\W|$)", "i");
const MODIFIER_WORD_GROUP$1 = 1;
const RELATIVE_WORD_GROUP$1 = 2;
class ENRelativeDateFormatParser extends AbstractParserWithWordBoundary_1$F.AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$q;
    }
    innerExtract(context, match) {
        const modifier = match[MODIFIER_WORD_GROUP$1].toLowerCase();
        const unitWord = match[RELATIVE_WORD_GROUP$1].toLowerCase();
        const timeunit = constants_1$u.TIME_UNIT_DICTIONARY[unitWord];
        if (modifier == "next") {
            const timeUnits = {};
            timeUnits[timeunit] = 1;
            return results_1$a.ParsingComponents.createRelativeFromReference(context.reference, timeUnits);
        }
        if (modifier == "last" || modifier == "past") {
            const timeUnits = {};
            timeUnits[timeunit] = -1;
            return results_1$a.ParsingComponents.createRelativeFromReference(context.reference, timeUnits);
        }
        const components = context.createParsingComponents();
        let date = (0, dayjs_1$l.default)(context.reference.instant);
        if (unitWord.match(/week/i)) {
            date = date.add(-date.get("d"), "d");
            components.imply("day", date.date());
            components.imply("month", date.month() + 1);
            components.imply("year", date.year());
        }
        else if (unitWord.match(/month/i)) {
            date = date.add(-date.date() + 1, "d");
            components.imply("day", date.date());
            components.assign("year", date.year());
            components.assign("month", date.month() + 1);
        }
        else if (unitWord.match(/year/i)) {
            date = date.add(-date.date() + 1, "d");
            date = date.add(-date.month(), "month");
            components.imply("day", date.date());
            components.imply("month", date.month() + 1);
            components.assign("year", date.year());
        }
        return components;
    }
}
ENRelativeDateFormatParser$1.default = ENRelativeDateFormatParser;

var chrono$1 = {};

Object.defineProperty(chrono$1, "__esModule", { value: true });
chrono$1.ParsingContext = chrono$1.Chrono = void 0;
const results_1$9 = results;
const en_1 = en$1;
class Chrono {
    constructor(configuration) {
        configuration = configuration || (0, en_1.createCasualConfiguration)();
        this.parsers = [...configuration.parsers];
        this.refiners = [...configuration.refiners];
    }
    clone() {
        return new Chrono({
            parsers: [...this.parsers],
            refiners: [...this.refiners],
        });
    }
    parseDate(text, referenceDate, option) {
        const results = this.parse(text, referenceDate, option);
        return results.length > 0 ? results[0].start.date() : null;
    }
    parse(text, referenceDate, option) {
        const context = new ParsingContext(text, referenceDate, option);
        let results = [];
        this.parsers.forEach((parser) => {
            const parsedResults = Chrono.executeParser(context, parser);
            results = results.concat(parsedResults);
        });
        results.sort((a, b) => {
            return a.index - b.index;
        });
        this.refiners.forEach(function (refiner) {
            results = refiner.refine(context, results);
        });
        return results;
    }
    static executeParser(context, parser) {
        const results = [];
        const pattern = parser.pattern(context);
        const originalText = context.text;
        let remainingText = context.text;
        let match = pattern.exec(remainingText);
        while (match) {
            const index = match.index + originalText.length - remainingText.length;
            match.index = index;
            const result = parser.extract(context, match);
            if (!result) {
                remainingText = originalText.substring(match.index + 1);
                match = pattern.exec(remainingText);
                continue;
            }
            let parsedResult = null;
            if (result instanceof results_1$9.ParsingResult) {
                parsedResult = result;
            }
            else if (result instanceof results_1$9.ParsingComponents) {
                parsedResult = context.createParsingResult(match.index, match[0]);
                parsedResult.start = result;
            }
            else {
                parsedResult = context.createParsingResult(match.index, match[0], result);
            }
            context.debug(() => console.log(`${parser.constructor.name} extracted result ${parsedResult}`));
            results.push(parsedResult);
            remainingText = originalText.substring(index + parsedResult.text.length);
            match = pattern.exec(remainingText);
        }
        return results;
    }
}
chrono$1.Chrono = Chrono;
class ParsingContext {
    constructor(text, refDate, option) {
        this.text = text;
        this.reference = new results_1$9.ReferenceWithTimezone(refDate);
        this.option = option !== null && option !== void 0 ? option : {};
        this.refDate = this.reference.instant;
    }
    createParsingComponents(components) {
        if (components instanceof results_1$9.ParsingComponents) {
            return components;
        }
        return new results_1$9.ParsingComponents(this.reference, components);
    }
    createParsingResult(index, textOrEndIndex, startComponents, endComponents) {
        const text = typeof textOrEndIndex === "string" ? textOrEndIndex : this.text.substring(index, textOrEndIndex);
        const start = startComponents ? this.createParsingComponents(startComponents) : null;
        const end = endComponents ? this.createParsingComponents(endComponents) : null;
        return new results_1$9.ParsingResult(this.reference, index, text, start, end);
    }
    debug(block) {
        if (this.option.debug) {
            if (this.option.debug instanceof Function) {
                this.option.debug(block);
            }
            else {
                const handler = this.option.debug;
                handler.debug(block);
            }
        }
    }
}
chrono$1.ParsingContext = ParsingContext;

var SlashDateFormatParser$1 = {};

Object.defineProperty(SlashDateFormatParser$1, "__esModule", { value: true });
const years_1$6 = years;
const PATTERN$p = new RegExp("([^\\d]|^)" +
    "([0-3]{0,1}[0-9]{1})[\\/\\.\\-]([0-3]{0,1}[0-9]{1})" +
    "(?:[\\/\\.\\-]([0-9]{4}|[0-9]{2}))?" +
    "(\\W|$)", "i");
const OPENING_GROUP = 1;
const ENDING_GROUP = 5;
const FIRST_NUMBERS_GROUP = 2;
const SECOND_NUMBERS_GROUP = 3;
const YEAR_GROUP$8 = 4;
class SlashDateFormatParser {
    constructor(littleEndian) {
        this.groupNumberMonth = littleEndian ? SECOND_NUMBERS_GROUP : FIRST_NUMBERS_GROUP;
        this.groupNumberDay = littleEndian ? FIRST_NUMBERS_GROUP : SECOND_NUMBERS_GROUP;
    }
    pattern() {
        return PATTERN$p;
    }
    extract(context, match) {
        if (match[OPENING_GROUP] == "/" || match[ENDING_GROUP] == "/") {
            match.index += match[0].length;
            return;
        }
        const index = match.index + match[OPENING_GROUP].length;
        const text = match[0].substr(match[OPENING_GROUP].length, match[0].length - match[OPENING_GROUP].length - match[ENDING_GROUP].length);
        if (text.match(/^\d\.\d$/) || text.match(/^\d\.\d{1,2}\.\d{1,2}\s*$/)) {
            return;
        }
        if (!match[YEAR_GROUP$8] && match[0].indexOf("/") < 0) {
            return;
        }
        const result = context.createParsingResult(index, text);
        let month = parseInt(match[this.groupNumberMonth]);
        let day = parseInt(match[this.groupNumberDay]);
        if (month < 1 || month > 12) {
            if (month > 12) {
                if (day >= 1 && day <= 12 && month <= 31) {
                    [day, month] = [month, day];
                }
                else {
                    return null;
                }
            }
        }
        if (day < 1 || day > 31) {
            return null;
        }
        result.start.assign("day", day);
        result.start.assign("month", month);
        if (match[YEAR_GROUP$8]) {
            const rawYearNumber = parseInt(match[YEAR_GROUP$8]);
            const year = (0, years_1$6.findMostLikelyADYear)(rawYearNumber);
            result.start.assign("year", year);
        }
        else {
            const year = (0, years_1$6.findYearClosestToRef)(context.refDate, day, month);
            result.start.imply("year", year);
        }
        return result;
    }
}
SlashDateFormatParser$1.default = SlashDateFormatParser;

var ENTimeUnitCasualRelativeFormatParser$1 = {};

Object.defineProperty(ENTimeUnitCasualRelativeFormatParser$1, "__esModule", { value: true });
const constants_1$t = constants$7;
const results_1$8 = results;
const AbstractParserWithWordBoundary_1$E = AbstractParserWithWordBoundary;
const timeunits_1$5 = timeunits;
const PATTERN$o = new RegExp(`(this|last|past|next|\\+|-)\\s*(${constants_1$t.TIME_UNITS_PATTERN})(?=\\W|$)`, "i");
class ENTimeUnitCasualRelativeFormatParser extends AbstractParserWithWordBoundary_1$E.AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$o;
    }
    innerExtract(context, match) {
        const prefix = match[1].toLowerCase();
        let timeUnits = (0, constants_1$t.parseTimeUnits)(match[2]);
        switch (prefix) {
            case "last":
            case "past":
            case "-":
                timeUnits = (0, timeunits_1$5.reverseTimeUnits)(timeUnits);
                break;
        }
        return results_1$8.ParsingComponents.createRelativeFromReference(context.reference, timeUnits);
    }
}
ENTimeUnitCasualRelativeFormatParser$1.default = ENTimeUnitCasualRelativeFormatParser;

(function (exports) {
var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConfiguration = exports.createCasualConfiguration = exports.parseDate = exports.parse = exports.GB = exports.strict = exports.casual = void 0;
const ENTimeUnitWithinFormatParser_1 = __importDefault(ENTimeUnitWithinFormatParser$1);
const ENMonthNameLittleEndianParser_1 = __importDefault(ENMonthNameLittleEndianParser$1);
const ENMonthNameMiddleEndianParser_1 = __importDefault(ENMonthNameMiddleEndianParser$1);
const ENMonthNameParser_1 = __importDefault(ENMonthNameParser$1);
const ENCasualYearMonthDayParser_1 = __importDefault(ENCasualYearMonthDayParser$1);
const ENSlashMonthFormatParser_1 = __importDefault(ENSlashMonthFormatParser$1);
const ENTimeExpressionParser_1 = __importDefault(ENTimeExpressionParser$1);
const ENTimeUnitAgoFormatParser_1 = __importDefault(ENTimeUnitAgoFormatParser$1);
const ENTimeUnitLaterFormatParser_1 = __importDefault(ENTimeUnitLaterFormatParser$1);
const ENMergeDateRangeRefiner_1 = __importDefault(ENMergeDateRangeRefiner$1);
const ENMergeDateTimeRefiner_1 = __importDefault(ENMergeDateTimeRefiner$2);
const configurations_1 = configurations;
const ENCasualDateParser_1 = __importDefault(ENCasualDateParser$1);
const ENCasualTimeParser_1 = __importDefault(ENCasualTimeParser$1);
const ENWeekdayParser_1 = __importDefault(ENWeekdayParser$1);
const ENRelativeDateFormatParser_1 = __importDefault(ENRelativeDateFormatParser$1);
const chrono_1 = chrono$1;
const SlashDateFormatParser_1 = __importDefault(SlashDateFormatParser$1);
const ENTimeUnitCasualRelativeFormatParser_1 = __importDefault(ENTimeUnitCasualRelativeFormatParser$1);
exports.casual = new chrono_1.Chrono(createCasualConfiguration(false));
exports.strict = new chrono_1.Chrono(createConfiguration(true, false));
exports.GB = new chrono_1.Chrono(createConfiguration(false, true));
function parse(text, ref, option) {
    return exports.casual.parse(text, ref, option);
}
exports.parse = parse;
function parseDate(text, ref, option) {
    return exports.casual.parseDate(text, ref, option);
}
exports.parseDate = parseDate;
function createCasualConfiguration(littleEndian = false) {
    const option = createConfiguration(false, littleEndian);
    option.parsers.unshift(new ENCasualDateParser_1.default());
    option.parsers.unshift(new ENCasualTimeParser_1.default());
    option.parsers.unshift(new ENMonthNameParser_1.default());
    option.parsers.unshift(new ENRelativeDateFormatParser_1.default());
    option.parsers.unshift(new ENTimeUnitCasualRelativeFormatParser_1.default());
    return option;
}
exports.createCasualConfiguration = createCasualConfiguration;
function createConfiguration(strictMode = true, littleEndian = false) {
    return (0, configurations_1.includeCommonConfiguration)({
        parsers: [
            new SlashDateFormatParser_1.default(littleEndian),
            new ENTimeUnitWithinFormatParser_1.default(),
            new ENMonthNameLittleEndianParser_1.default(),
            new ENMonthNameMiddleEndianParser_1.default(),
            new ENWeekdayParser_1.default(),
            new ENCasualYearMonthDayParser_1.default(),
            new ENSlashMonthFormatParser_1.default(),
            new ENTimeExpressionParser_1.default(strictMode),
            new ENTimeUnitAgoFormatParser_1.default(strictMode),
            new ENTimeUnitLaterFormatParser_1.default(strictMode),
        ],
        refiners: [new ENMergeDateTimeRefiner_1.default(), new ENMergeDateRangeRefiner_1.default()],
    }, strictMode);
}
exports.createConfiguration = createConfiguration;
}(en$1));

var de = {};

var DETimeExpressionParser$1 = {};

Object.defineProperty(DETimeExpressionParser$1, "__esModule", { value: true });
const AbstractTimeExpressionParser_1$3 = AbstractTimeExpressionParser$1;
const index_1$8 = dist;
class DETimeExpressionParser extends AbstractTimeExpressionParser_1$3.AbstractTimeExpressionParser {
    primaryPrefix() {
        return "(?:(?:um|von)\\s*)?";
    }
    followingPhase() {
        return "\\s*(?:\\-|\\–|\\~|\\〜|bis)\\s*";
    }
    primarySuffix() {
        return "(?:\\s*uhr)?(?:\\s*(?:morgens|vormittags|nachmittags|abends|nachts))?(?=\\W|$)";
    }
    extractPrimaryTimeComponents(context, match) {
        const components = super.extractPrimaryTimeComponents(context, match);
        if (components) {
            if (match[0].endsWith("morgens") || match[0].endsWith("vormittags")) {
                components.assign("meridiem", index_1$8.Meridiem.AM);
                const hour = components.get("hour");
                if (hour < 12) {
                    components.assign("hour", components.get("hour"));
                }
            }
            if (match[0].endsWith("nachmittags") || match[0].endsWith("abends") || match[0].endsWith("nachts")) {
                components.assign("meridiem", index_1$8.Meridiem.PM);
                const hour = components.get("hour");
                if (hour < 12) {
                    components.assign("hour", components.get("hour") + 12);
                }
            }
        }
        return components;
    }
}
DETimeExpressionParser$1.default = DETimeExpressionParser;

var DEWeekdayParser$1 = {};

var constants$6 = {};

(function (exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTimeUnits = exports.TIME_UNITS_PATTERN = exports.parseYear = exports.YEAR_PATTERN = exports.parseNumberPattern = exports.NUMBER_PATTERN = exports.TIME_UNIT_DICTIONARY = exports.INTEGER_WORD_DICTIONARY = exports.MONTH_DICTIONARY = exports.WEEKDAY_DICTIONARY = void 0;
const pattern_1 = pattern;
const years_1 = years;
exports.WEEKDAY_DICTIONARY = {
    "sonntag": 0,
    "so": 0,
    "montag": 1,
    "mo": 1,
    "dienstag": 2,
    "di": 2,
    "mittwoch": 3,
    "mi": 3,
    "donnerstag": 4,
    "do": 4,
    "freitag": 5,
    "fr": 5,
    "samstag": 6,
    "sa": 6,
};
exports.MONTH_DICTIONARY = {
    "januar": 1,
    "jan": 1,
    "jan.": 1,
    "februar": 2,
    "feb": 2,
    "feb.": 2,
    "märz": 3,
    "maerz": 3,
    "mär": 3,
    "mär.": 3,
    "mrz": 3,
    "mrz.": 3,
    "april": 4,
    "apr": 4,
    "apr.": 4,
    "mai": 5,
    "juni": 6,
    "jun": 6,
    "jun.": 6,
    "juli": 7,
    "jul": 7,
    "jul.": 7,
    "august": 8,
    "aug": 8,
    "aug.": 8,
    "september": 9,
    "sep": 9,
    "sep.": 9,
    "sept": 9,
    "sept.": 9,
    "oktober": 10,
    "okt": 10,
    "okt.": 10,
    "november": 11,
    "nov": 11,
    "nov.": 11,
    "dezember": 12,
    "dez": 12,
    "dez.": 12,
};
exports.INTEGER_WORD_DICTIONARY = {
    "eins": 1,
    "zwei": 2,
    "drei": 3,
    "vier": 4,
    "fünf": 5,
    "fuenf": 5,
    "sechs": 6,
    "sieben": 7,
    "acht": 8,
    "neun": 9,
    "zehn": 10,
    "elf": 11,
    "zwölf": 12,
    "zwoelf": 12,
};
exports.TIME_UNIT_DICTIONARY = {
    sec: "second",
    second: "second",
    seconds: "second",
    min: "minute",
    mins: "minute",
    minute: "minute",
    minutes: "minute",
    h: "hour",
    hr: "hour",
    hrs: "hour",
    hour: "hour",
    hours: "hour",
    day: "d",
    days: "d",
    week: "week",
    weeks: "week",
    month: "month",
    months: "month",
    y: "year",
    yr: "year",
    year: "year",
    years: "year",
};
exports.NUMBER_PATTERN = `(?:${(0, pattern_1.matchAnyPattern)(exports.INTEGER_WORD_DICTIONARY)}|[0-9]+|[0-9]+\\.[0-9]+|half(?:\\s*an?)?|an?\\b(?:\\s*few)?|few|several|a?\\s*couple\\s*(?:of)?)`;
function parseNumberPattern(match) {
    const num = match.toLowerCase();
    if (exports.INTEGER_WORD_DICTIONARY[num] !== undefined) {
        return exports.INTEGER_WORD_DICTIONARY[num];
    }
    else if (num === "a" || num === "an") {
        return 1;
    }
    else if (num.match(/few/)) {
        return 3;
    }
    else if (num.match(/half/)) {
        return 0.5;
    }
    else if (num.match(/couple/)) {
        return 2;
    }
    else if (num.match(/several/)) {
        return 7;
    }
    return parseFloat(num);
}
exports.parseNumberPattern = parseNumberPattern;
exports.YEAR_PATTERN = `(?:[0-9]{1,4}(?:\\s*[vn]\\.?\\s*C(?:hr)?\\.?)?)`;
function parseYear(match) {
    if (/v/i.test(match)) {
        return -parseInt(match.replace(/[^0-9]+/gi, ""));
    }
    if (/n/i.test(match)) {
        return parseInt(match.replace(/[^0-9]+/gi, ""));
    }
    const rawYearNumber = parseInt(match);
    return (0, years_1.findMostLikelyADYear)(rawYearNumber);
}
exports.parseYear = parseYear;
const SINGLE_TIME_UNIT_PATTERN = `(${exports.NUMBER_PATTERN})\\s{0,5}(${(0, pattern_1.matchAnyPattern)(exports.TIME_UNIT_DICTIONARY)})\\s{0,5}`;
const SINGLE_TIME_UNIT_REGEX = new RegExp(SINGLE_TIME_UNIT_PATTERN, "i");
exports.TIME_UNITS_PATTERN = (0, pattern_1.repeatedTimeunitPattern)("", SINGLE_TIME_UNIT_PATTERN);
function parseTimeUnits(timeunitText) {
    const fragments = {};
    let remainingText = timeunitText;
    let match = SINGLE_TIME_UNIT_REGEX.exec(remainingText);
    while (match) {
        collectDateTimeFragment(fragments, match);
        remainingText = remainingText.substring(match[0].length);
        match = SINGLE_TIME_UNIT_REGEX.exec(remainingText);
    }
    return fragments;
}
exports.parseTimeUnits = parseTimeUnits;
function collectDateTimeFragment(fragments, match) {
    const num = parseNumberPattern(match[1]);
    const unit = exports.TIME_UNIT_DICTIONARY[match[2].toLowerCase()];
    fragments[unit] = num;
}
}(constants$6));

Object.defineProperty(DEWeekdayParser$1, "__esModule", { value: true });
const constants_1$s = constants$6;
const pattern_1$b = pattern;
const AbstractParserWithWordBoundary_1$D = AbstractParserWithWordBoundary;
const weeks_1$3 = weeks;
const PATTERN$n = new RegExp("(?:(?:\\,|\\(|\\（)\\s*)?" +
    "(?:a[mn]\\s*?)?" +
    "(?:(diese[mn]|letzte[mn]|n(?:ä|ae)chste[mn])\\s*)?" +
    `(${(0, pattern_1$b.matchAnyPattern)(constants_1$s.WEEKDAY_DICTIONARY)})` +
    "(?:\\s*(?:\\,|\\)|\\）))?" +
    "(?:\\s*(diese|letzte|n(?:ä|ae)chste)\\s*woche)?" +
    "(?=\\W|$)", "i");
const PREFIX_GROUP$2 = 1;
const SUFFIX_GROUP = 3;
const WEEKDAY_GROUP$3 = 2;
class DEWeekdayParser extends AbstractParserWithWordBoundary_1$D.AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$n;
    }
    innerExtract(context, match) {
        const dayOfWeek = match[WEEKDAY_GROUP$3].toLowerCase();
        const offset = constants_1$s.WEEKDAY_DICTIONARY[dayOfWeek];
        const prefix = match[PREFIX_GROUP$2];
        const postfix = match[SUFFIX_GROUP];
        let modifierWord = prefix || postfix;
        modifierWord = modifierWord || "";
        modifierWord = modifierWord.toLowerCase();
        let modifier = null;
        if (modifierWord.match(/letzte/)) {
            modifier = "last";
        }
        else if (modifierWord.match(/chste/)) {
            modifier = "next";
        }
        else if (modifierWord.match(/diese/)) {
            modifier = "this";
        }
        const date = (0, weeks_1$3.toDayJSWeekday)(context.refDate, offset, modifier);
        return context
            .createParsingComponents()
            .assign("weekday", offset)
            .imply("day", date.date())
            .imply("month", date.month() + 1)
            .imply("year", date.year());
    }
}
DEWeekdayParser$1.default = DEWeekdayParser;

var DEMergeDateRangeRefiner$1 = {};

var __importDefault$x = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(DEMergeDateRangeRefiner$1, "__esModule", { value: true });
const AbstractMergeDateRangeRefiner_1$6 = __importDefault$x(AbstractMergeDateRangeRefiner$1);
class DEMergeDateRangeRefiner extends AbstractMergeDateRangeRefiner_1$6.default {
    patternBetween() {
        return /^\s*(bis(?:\s*(?:am|zum))?|-)\s*$/i;
    }
}
DEMergeDateRangeRefiner$1.default = DEMergeDateRangeRefiner;

var DEMergeDateTimeRefiner$1 = {};

var __importDefault$w = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(DEMergeDateTimeRefiner$1, "__esModule", { value: true });
const AbstractMergeDateTimeRefiner_1$5 = __importDefault$w(AbstractMergeDateTimeRefiner);
class DEMergeDateTimeRefiner extends AbstractMergeDateTimeRefiner_1$5.default {
    patternBetween() {
        return new RegExp("^\\s*(T|um|am|,|-)?\\s*$");
    }
}
DEMergeDateTimeRefiner$1.default = DEMergeDateTimeRefiner;

var DECasualDateParser$1 = {};

var DECasualTimeParser$1 = {};

var __importDefault$v = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(DECasualTimeParser$1, "__esModule", { value: true });
const dayjs_1$k = __importDefault$v(require$$0);
const index_1$7 = dist;
const AbstractParserWithWordBoundary_1$C = AbstractParserWithWordBoundary;
const dayjs_2$5 = dayjs;
const timeunits_1$4 = timeunits;
class DECasualTimeParser extends AbstractParserWithWordBoundary_1$C.AbstractParserWithWordBoundaryChecking {
    innerPattern(context) {
        return /(diesen)?\s*(morgen|vormittag|mittags?|nachmittag|abend|nacht|mitternacht)(?=\W|$)/i;
    }
    innerExtract(context, match) {
        const targetDate = (0, dayjs_1$k.default)(context.refDate);
        const timeKeywordPattern = match[2].toLowerCase();
        const component = context.createParsingComponents();
        (0, dayjs_2$5.implySimilarTime)(component, targetDate);
        return DECasualTimeParser.extractTimeComponents(component, timeKeywordPattern);
    }
    static extractTimeComponents(component, timeKeywordPattern) {
        switch (timeKeywordPattern) {
            case "morgen":
                component.imply("hour", 6);
                component.imply("minute", 0);
                component.imply("second", 0);
                component.imply("meridiem", index_1$7.Meridiem.AM);
                break;
            case "vormittag":
                component.imply("hour", 9);
                component.imply("minute", 0);
                component.imply("second", 0);
                component.imply("meridiem", index_1$7.Meridiem.AM);
                break;
            case "mittag":
            case "mittags":
                component.imply("hour", 12);
                component.imply("minute", 0);
                component.imply("second", 0);
                component.imply("meridiem", index_1$7.Meridiem.AM);
                break;
            case "nachmittag":
                component.imply("hour", 15);
                component.imply("minute", 0);
                component.imply("second", 0);
                component.imply("meridiem", index_1$7.Meridiem.PM);
                break;
            case "abend":
                component.imply("hour", 18);
                component.imply("minute", 0);
                component.imply("second", 0);
                component.imply("meridiem", index_1$7.Meridiem.PM);
                break;
            case "nacht":
                component.imply("hour", 22);
                component.imply("minute", 0);
                component.imply("second", 0);
                component.imply("meridiem", index_1$7.Meridiem.PM);
                break;
            case "mitternacht":
                if (component.get("hour") > 1) {
                    component = (0, timeunits_1$4.addImpliedTimeUnits)(component, { "day": 1 });
                }
                component.imply("hour", 0);
                component.imply("minute", 0);
                component.imply("second", 0);
                component.imply("meridiem", index_1$7.Meridiem.AM);
                break;
        }
        return component;
    }
}
DECasualTimeParser$1.default = DECasualTimeParser;

var __createBinding$4 = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault$4 = (commonjsGlobal && commonjsGlobal.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar$4 = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding$4(result, mod, k);
    __setModuleDefault$4(result, mod);
    return result;
};
var __importDefault$u = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(DECasualDateParser$1, "__esModule", { value: true });
const dayjs_1$j = __importDefault$u(require$$0);
const AbstractParserWithWordBoundary_1$B = AbstractParserWithWordBoundary;
const dayjs_2$4 = dayjs;
const DECasualTimeParser_1 = __importDefault$u(DECasualTimeParser$1);
const references$4 = __importStar$4(casualReferences);
const PATTERN$m = new RegExp(`(jetzt|heute|morgen|übermorgen|uebermorgen|gestern|vorgestern|letzte\\s*nacht)` +
    `(?:\\s*(morgen|vormittag|mittags?|nachmittag|abend|nacht|mitternacht))?` +
    `(?=\\W|$)`, "i");
const DATE_GROUP$5 = 1;
const TIME_GROUP = 2;
class DECasualDateParser extends AbstractParserWithWordBoundary_1$B.AbstractParserWithWordBoundaryChecking {
    innerPattern(context) {
        return PATTERN$m;
    }
    innerExtract(context, match) {
        let targetDate = (0, dayjs_1$j.default)(context.refDate);
        const dateKeyword = (match[DATE_GROUP$5] || "").toLowerCase();
        const timeKeyword = (match[TIME_GROUP] || "").toLowerCase();
        let component = context.createParsingComponents();
        switch (dateKeyword) {
            case "jetzt":
                component = references$4.now(context.reference);
                break;
            case "heute":
                component = references$4.today(context.reference);
                break;
            case "morgen":
                (0, dayjs_2$4.assignTheNextDay)(component, targetDate);
                break;
            case "übermorgen":
            case "uebermorgen":
                targetDate = targetDate.add(1, "day");
                (0, dayjs_2$4.assignTheNextDay)(component, targetDate);
                break;
            case "gestern":
                targetDate = targetDate.add(-1, "day");
                (0, dayjs_2$4.assignSimilarDate)(component, targetDate);
                (0, dayjs_2$4.implySimilarTime)(component, targetDate);
                break;
            case "vorgestern":
                targetDate = targetDate.add(-2, "day");
                (0, dayjs_2$4.assignSimilarDate)(component, targetDate);
                (0, dayjs_2$4.implySimilarTime)(component, targetDate);
                break;
            default:
                if (dateKeyword.match(/letzte\s*nacht/)) {
                    if (targetDate.hour() > 6) {
                        targetDate = targetDate.add(-1, "day");
                    }
                    (0, dayjs_2$4.assignSimilarDate)(component, targetDate);
                    component.imply("hour", 0);
                }
                break;
        }
        if (timeKeyword) {
            component = DECasualTimeParser_1.default.extractTimeComponents(component, timeKeyword);
        }
        return component;
    }
}
DECasualDateParser$1.default = DECasualDateParser;

var DEMonthNameLittleEndianParser$1 = {};

Object.defineProperty(DEMonthNameLittleEndianParser$1, "__esModule", { value: true });
const years_1$5 = years;
const constants_1$r = constants$6;
const constants_2$4 = constants$6;
const pattern_1$a = pattern;
const AbstractParserWithWordBoundary_1$A = AbstractParserWithWordBoundary;
const PATTERN$l = new RegExp("(?:am\\s*?)?" +
    "(?:den\\s*?)?" +
    `([0-9]{1,2})\\.` +
    `(?:\\s*(?:bis(?:\\s*(?:am|zum))?|\\-|\\–|\\s)\\s*([0-9]{1,2})\\.?)?\\s*` +
    `(${(0, pattern_1$a.matchAnyPattern)(constants_1$r.MONTH_DICTIONARY)})` +
    `(?:(?:-|/|,?\\s*)(${constants_2$4.YEAR_PATTERN}(?![^\\s]\\d)))?` +
    `(?=\\W|$)`, "i");
const DATE_GROUP$4 = 1;
const DATE_TO_GROUP$3 = 2;
const MONTH_NAME_GROUP$5 = 3;
const YEAR_GROUP$7 = 4;
class DEMonthNameLittleEndianParser extends AbstractParserWithWordBoundary_1$A.AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$l;
    }
    innerExtract(context, match) {
        const result = context.createParsingResult(match.index, match[0]);
        const month = constants_1$r.MONTH_DICTIONARY[match[MONTH_NAME_GROUP$5].toLowerCase()];
        const day = parseInt(match[DATE_GROUP$4]);
        if (day > 31) {
            match.index = match.index + match[DATE_GROUP$4].length;
            return null;
        }
        result.start.assign("month", month);
        result.start.assign("day", day);
        if (match[YEAR_GROUP$7]) {
            const yearNumber = (0, constants_2$4.parseYear)(match[YEAR_GROUP$7]);
            result.start.assign("year", yearNumber);
        }
        else {
            const year = (0, years_1$5.findYearClosestToRef)(context.refDate, day, month);
            result.start.imply("year", year);
        }
        if (match[DATE_TO_GROUP$3]) {
            const endDate = parseInt(match[DATE_TO_GROUP$3]);
            result.end = result.start.clone();
            result.end.assign("day", endDate);
        }
        return result;
    }
}
DEMonthNameLittleEndianParser$1.default = DEMonthNameLittleEndianParser;

(function (exports) {
var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConfiguration = exports.createCasualConfiguration = exports.parseDate = exports.parse = exports.strict = exports.casual = void 0;
const configurations_1 = configurations;
const chrono_1 = chrono$1;
const SlashDateFormatParser_1 = __importDefault(SlashDateFormatParser$1);
const ISOFormatParser_1 = __importDefault(ISOFormatParser$1);
const DETimeExpressionParser_1 = __importDefault(DETimeExpressionParser$1);
const DEWeekdayParser_1 = __importDefault(DEWeekdayParser$1);
const DEMergeDateRangeRefiner_1 = __importDefault(DEMergeDateRangeRefiner$1);
const DEMergeDateTimeRefiner_1 = __importDefault(DEMergeDateTimeRefiner$1);
const DECasualDateParser_1 = __importDefault(DECasualDateParser$1);
const DECasualTimeParser_1 = __importDefault(DECasualTimeParser$1);
const DEMonthNameLittleEndianParser_1 = __importDefault(DEMonthNameLittleEndianParser$1);
exports.casual = new chrono_1.Chrono(createCasualConfiguration());
exports.strict = new chrono_1.Chrono(createConfiguration(true));
function parse(text, ref, option) {
    return exports.casual.parse(text, ref, option);
}
exports.parse = parse;
function parseDate(text, ref, option) {
    return exports.casual.parseDate(text, ref, option);
}
exports.parseDate = parseDate;
function createCasualConfiguration(littleEndian = true) {
    const option = createConfiguration(false, littleEndian);
    option.parsers.unshift(new DECasualTimeParser_1.default());
    option.parsers.unshift(new DECasualDateParser_1.default());
    return option;
}
exports.createCasualConfiguration = createCasualConfiguration;
function createConfiguration(strictMode = true, littleEndian = true) {
    return (0, configurations_1.includeCommonConfiguration)({
        parsers: [
            new ISOFormatParser_1.default(),
            new SlashDateFormatParser_1.default(littleEndian),
            new DETimeExpressionParser_1.default(),
            new DEMonthNameLittleEndianParser_1.default(),
            new DEWeekdayParser_1.default(),
        ],
        refiners: [new DEMergeDateRangeRefiner_1.default(), new DEMergeDateTimeRefiner_1.default()],
    }, strictMode);
}
exports.createConfiguration = createConfiguration;
}(de));

var fr = {};

var FRCasualDateParser$1 = {};

var __createBinding$3 = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault$3 = (commonjsGlobal && commonjsGlobal.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar$3 = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding$3(result, mod, k);
    __setModuleDefault$3(result, mod);
    return result;
};
var __importDefault$t = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(FRCasualDateParser$1, "__esModule", { value: true });
const dayjs_1$i = __importDefault$t(require$$0);
const index_1$6 = dist;
const AbstractParserWithWordBoundary_1$z = AbstractParserWithWordBoundary;
const dayjs_2$3 = dayjs;
const references$3 = __importStar$3(casualReferences);
class FRCasualDateParser extends AbstractParserWithWordBoundary_1$z.AbstractParserWithWordBoundaryChecking {
    innerPattern(context) {
        return /(maintenant|aujourd'hui|demain|hier|cette\s*nuit|la\s*veille)(?=\W|$)/i;
    }
    innerExtract(context, match) {
        let targetDate = (0, dayjs_1$i.default)(context.refDate);
        const lowerText = match[0].toLowerCase();
        const component = context.createParsingComponents();
        switch (lowerText) {
            case "maintenant":
                return references$3.now(context.reference);
            case "aujourd'hui":
                return references$3.today(context.reference);
            case "hier":
                return references$3.yesterday(context.reference);
            case "demain":
                return references$3.tomorrow(context.reference);
            default:
                if (lowerText.match(/cette\s*nuit/)) {
                    (0, dayjs_2$3.assignSimilarDate)(component, targetDate);
                    component.imply("hour", 22);
                    component.imply("meridiem", index_1$6.Meridiem.PM);
                }
                else if (lowerText.match(/la\s*veille/)) {
                    targetDate = targetDate.add(-1, "day");
                    (0, dayjs_2$3.assignSimilarDate)(component, targetDate);
                    component.imply("hour", 0);
                }
        }
        return component;
    }
}
FRCasualDateParser$1.default = FRCasualDateParser;

var FRCasualTimeParser$1 = {};

Object.defineProperty(FRCasualTimeParser$1, "__esModule", { value: true });
const index_1$5 = dist;
const AbstractParserWithWordBoundary_1$y = AbstractParserWithWordBoundary;
class FRCasualTimeParser extends AbstractParserWithWordBoundary_1$y.AbstractParserWithWordBoundaryChecking {
    innerPattern(context) {
        return /(cet?)?\s*(matin|soir|après-midi|aprem|a midi|à minuit)(?=\W|$)/i;
    }
    innerExtract(context, match) {
        const suffixLower = match[2].toLowerCase();
        const component = context.createParsingComponents();
        switch (suffixLower) {
            case "après-midi":
            case "aprem":
                component.imply("hour", 14);
                component.imply("minute", 0);
                component.imply("meridiem", index_1$5.Meridiem.PM);
                break;
            case "soir":
                component.imply("hour", 18);
                component.imply("minute", 0);
                component.imply("meridiem", index_1$5.Meridiem.PM);
                break;
            case "matin":
                component.imply("hour", 8);
                component.imply("minute", 0);
                component.imply("meridiem", index_1$5.Meridiem.AM);
                break;
            case "a midi":
                component.imply("hour", 12);
                component.imply("minute", 0);
                component.imply("meridiem", index_1$5.Meridiem.AM);
                break;
            case "à minuit":
                component.imply("hour", 0);
                component.imply("meridiem", index_1$5.Meridiem.AM);
                break;
        }
        return component;
    }
}
FRCasualTimeParser$1.default = FRCasualTimeParser;

var FRTimeExpressionParser$1 = {};

Object.defineProperty(FRTimeExpressionParser$1, "__esModule", { value: true });
const AbstractTimeExpressionParser_1$2 = AbstractTimeExpressionParser$1;
class FRTimeExpressionParser extends AbstractTimeExpressionParser_1$2.AbstractTimeExpressionParser {
    primaryPrefix() {
        return "(?:(?:[àa])\\s*)?";
    }
    followingPhase() {
        return "\\s*(?:\\-|\\–|\\~|\\〜|[àa]|\\?)\\s*";
    }
    extractPrimaryTimeComponents(context, match) {
        if (match[0].match(/^\s*\d{4}\s*$/)) {
            return null;
        }
        return super.extractPrimaryTimeComponents(context, match);
    }
}
FRTimeExpressionParser$1.default = FRTimeExpressionParser;

var FRMergeDateTimeRefiner$1 = {};

var __importDefault$s = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(FRMergeDateTimeRefiner$1, "__esModule", { value: true });
const AbstractMergeDateTimeRefiner_1$4 = __importDefault$s(AbstractMergeDateTimeRefiner);
class FRMergeDateTimeRefiner extends AbstractMergeDateTimeRefiner_1$4.default {
    patternBetween() {
        return new RegExp("^\\s*(T|à|a|vers|de|,|-)?\\s*$");
    }
}
FRMergeDateTimeRefiner$1.default = FRMergeDateTimeRefiner;

var FRMergeDateRangeRefiner$1 = {};

var __importDefault$r = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(FRMergeDateRangeRefiner$1, "__esModule", { value: true });
const AbstractMergeDateRangeRefiner_1$5 = __importDefault$r(AbstractMergeDateRangeRefiner$1);
class FRMergeDateRangeRefiner extends AbstractMergeDateRangeRefiner_1$5.default {
    patternBetween() {
        return /^\s*(à|a|-)\s*$/i;
    }
}
FRMergeDateRangeRefiner$1.default = FRMergeDateRangeRefiner;

var FRWeekdayParser$1 = {};

var constants$5 = {};

(function (exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTimeUnits = exports.TIME_UNITS_PATTERN = exports.parseYear = exports.YEAR_PATTERN = exports.parseOrdinalNumberPattern = exports.ORDINAL_NUMBER_PATTERN = exports.parseNumberPattern = exports.NUMBER_PATTERN = exports.TIME_UNIT_DICTIONARY = exports.INTEGER_WORD_DICTIONARY = exports.MONTH_DICTIONARY = exports.WEEKDAY_DICTIONARY = void 0;
const pattern_1 = pattern;
exports.WEEKDAY_DICTIONARY = {
    "dimanche": 0,
    "dim": 0,
    "lundi": 1,
    "lun": 1,
    "mardi": 2,
    "mar": 2,
    "mercredi": 3,
    "mer": 3,
    "jeudi": 4,
    "jeu": 4,
    "vendredi": 5,
    "ven": 5,
    "samedi": 6,
    "sam": 6,
};
exports.MONTH_DICTIONARY = {
    "janvier": 1,
    "jan": 1,
    "jan.": 1,
    "février": 2,
    "fév": 2,
    "fév.": 2,
    "fevrier": 2,
    "fev": 2,
    "fev.": 2,
    "mars": 3,
    "mar": 3,
    "mar.": 3,
    "avril": 4,
    "avr": 4,
    "avr.": 4,
    "mai": 5,
    "juin": 6,
    "jun": 6,
    "juillet": 7,
    "juil": 7,
    "jul": 7,
    "jul.": 7,
    "août": 8,
    "aout": 8,
    "septembre": 9,
    "sep": 9,
    "sep.": 9,
    "sept": 9,
    "sept.": 9,
    "octobre": 10,
    "oct": 10,
    "oct.": 10,
    "novembre": 11,
    "nov": 11,
    "nov.": 11,
    "décembre": 12,
    "decembre": 12,
    "dec": 12,
    "dec.": 12,
};
exports.INTEGER_WORD_DICTIONARY = {
    "un": 1,
    "deux": 2,
    "trois": 3,
    "quatre": 4,
    "cinq": 5,
    "six": 6,
    "sept": 7,
    "huit": 8,
    "neuf": 9,
    "dix": 10,
    "onze": 11,
    "douze": 12,
    "treize": 13,
};
exports.TIME_UNIT_DICTIONARY = {
    "sec": "second",
    "seconde": "second",
    "secondes": "second",
    "min": "minute",
    "mins": "minute",
    "minute": "minute",
    "minutes": "minute",
    "h": "hour",
    "hr": "hour",
    "hrs": "hour",
    "heure": "hour",
    "heures": "hour",
    "jour": "d",
    "jours": "d",
    "semaine": "week",
    "semaines": "week",
    "mois": "month",
    "trimestre": "quarter",
    "trimestres": "quarter",
    "ans": "year",
    "année": "year",
    "années": "year",
};
exports.NUMBER_PATTERN = `(?:${(0, pattern_1.matchAnyPattern)(exports.INTEGER_WORD_DICTIONARY)}|[0-9]+|[0-9]+\\.[0-9]+|une?\\b|quelques?|demi-?)`;
function parseNumberPattern(match) {
    const num = match.toLowerCase();
    if (exports.INTEGER_WORD_DICTIONARY[num] !== undefined) {
        return exports.INTEGER_WORD_DICTIONARY[num];
    }
    else if (num === "une" || num === "un") {
        return 1;
    }
    else if (num.match(/quelques?/)) {
        return 3;
    }
    else if (num.match(/demi-?/)) {
        return 0.5;
    }
    return parseFloat(num);
}
exports.parseNumberPattern = parseNumberPattern;
exports.ORDINAL_NUMBER_PATTERN = `(?:[0-9]{1,2}(?:er)?)`;
function parseOrdinalNumberPattern(match) {
    let num = match.toLowerCase();
    num = num.replace(/(?:er)$/i, "");
    return parseInt(num);
}
exports.parseOrdinalNumberPattern = parseOrdinalNumberPattern;
exports.YEAR_PATTERN = `(?:[1-9][0-9]{0,3}\\s*(?:AC|AD|p\\.\\s*C(?:hr?)?\\.\\s*n\\.)|[1-2][0-9]{3}|[5-9][0-9])`;
function parseYear(match) {
    if (/AC/i.test(match)) {
        match = match.replace(/BC/i, "");
        return -parseInt(match);
    }
    if (/AD/i.test(match) || /C/i.test(match)) {
        match = match.replace(/[^\d]+/i, "");
        return parseInt(match);
    }
    let yearNumber = parseInt(match);
    if (yearNumber < 100) {
        if (yearNumber > 50) {
            yearNumber = yearNumber + 1900;
        }
        else {
            yearNumber = yearNumber + 2000;
        }
    }
    return yearNumber;
}
exports.parseYear = parseYear;
const SINGLE_TIME_UNIT_PATTERN = `(${exports.NUMBER_PATTERN})\\s{0,5}(${(0, pattern_1.matchAnyPattern)(exports.TIME_UNIT_DICTIONARY)})\\s{0,5}`;
const SINGLE_TIME_UNIT_REGEX = new RegExp(SINGLE_TIME_UNIT_PATTERN, "i");
exports.TIME_UNITS_PATTERN = (0, pattern_1.repeatedTimeunitPattern)("", SINGLE_TIME_UNIT_PATTERN);
function parseTimeUnits(timeunitText) {
    const fragments = {};
    let remainingText = timeunitText;
    let match = SINGLE_TIME_UNIT_REGEX.exec(remainingText);
    while (match) {
        collectDateTimeFragment(fragments, match);
        remainingText = remainingText.substring(match[0].length);
        match = SINGLE_TIME_UNIT_REGEX.exec(remainingText);
    }
    return fragments;
}
exports.parseTimeUnits = parseTimeUnits;
function collectDateTimeFragment(fragments, match) {
    const num = parseNumberPattern(match[1]);
    const unit = exports.TIME_UNIT_DICTIONARY[match[2].toLowerCase()];
    fragments[unit] = num;
}
}(constants$5));

Object.defineProperty(FRWeekdayParser$1, "__esModule", { value: true });
const constants_1$q = constants$5;
const pattern_1$9 = pattern;
const AbstractParserWithWordBoundary_1$x = AbstractParserWithWordBoundary;
const weeks_1$2 = weeks;
const PATTERN$k = new RegExp("(?:(?:\\,|\\(|\\（)\\s*)?" +
    "(?:(?:ce)\\s*)?" +
    `(${(0, pattern_1$9.matchAnyPattern)(constants_1$q.WEEKDAY_DICTIONARY)})` +
    "(?:\\s*(?:\\,|\\)|\\）))?" +
    "(?:\\s*(dernier|prochain)\\s*)?" +
    "(?=\\W|\\d|$)", "i");
const WEEKDAY_GROUP$2 = 1;
const POSTFIX_GROUP$2 = 2;
class FRWeekdayParser extends AbstractParserWithWordBoundary_1$x.AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$k;
    }
    innerExtract(context, match) {
        const dayOfWeek = match[WEEKDAY_GROUP$2].toLowerCase();
        const offset = constants_1$q.WEEKDAY_DICTIONARY[dayOfWeek];
        if (offset === undefined) {
            return null;
        }
        let suffix = match[POSTFIX_GROUP$2];
        suffix = suffix || "";
        suffix = suffix.toLowerCase();
        let modifier = null;
        if (suffix == "dernier") {
            modifier = "last";
        }
        else if (suffix == "prochain") {
            modifier = "next";
        }
        const date = (0, weeks_1$2.toDayJSWeekday)(context.refDate, offset, modifier);
        return context
            .createParsingComponents()
            .assign("weekday", offset)
            .imply("day", date.date())
            .imply("month", date.month() + 1)
            .imply("year", date.year());
    }
}
FRWeekdayParser$1.default = FRWeekdayParser;

var FRSpecificTimeExpressionParser$1 = {};

Object.defineProperty(FRSpecificTimeExpressionParser$1, "__esModule", { value: true });
const index_1$4 = dist;
const FIRST_REG_PATTERN$2 = new RegExp("(^|\\s|T)" +
    "(?:(?:[àa])\\s*)?" +
    "(\\d{1,2})(?:h|:)?" +
    "(?:(\\d{1,2})(?:m|:)?)?" +
    "(?:(\\d{1,2})(?:s|:)?)?" +
    "(?:\\s*(A\\.M\\.|P\\.M\\.|AM?|PM?))?" +
    "(?=\\W|$)", "i");
const SECOND_REG_PATTERN$2 = new RegExp("^\\s*(\\-|\\–|\\~|\\〜|[àa]|\\?)\\s*" +
    "(\\d{1,2})(?:h|:)?" +
    "(?:(\\d{1,2})(?:m|:)?)?" +
    "(?:(\\d{1,2})(?:s|:)?)?" +
    "(?:\\s*(A\\.M\\.|P\\.M\\.|AM?|PM?))?" +
    "(?=\\W|$)", "i");
const HOUR_GROUP$2 = 2;
const MINUTE_GROUP$2 = 3;
const SECOND_GROUP$2 = 4;
const AM_PM_HOUR_GROUP$2 = 5;
class FRSpecificTimeExpressionParser {
    pattern(context) {
        return FIRST_REG_PATTERN$2;
    }
    extract(context, match) {
        const result = context.createParsingResult(match.index + match[1].length, match[0].substring(match[1].length));
        if (result.text.match(/^\d{4}$/)) {
            match.index += match[0].length;
            return null;
        }
        result.start = FRSpecificTimeExpressionParser.extractTimeComponent(result.start.clone(), match);
        if (!result.start) {
            match.index += match[0].length;
            return null;
        }
        const remainingText = context.text.substring(match.index + match[0].length);
        const secondMatch = SECOND_REG_PATTERN$2.exec(remainingText);
        if (secondMatch) {
            result.end = FRSpecificTimeExpressionParser.extractTimeComponent(result.start.clone(), secondMatch);
            if (result.end) {
                result.text += secondMatch[0];
            }
        }
        return result;
    }
    static extractTimeComponent(extractingComponents, match) {
        let hour = 0;
        let minute = 0;
        let meridiem = null;
        hour = parseInt(match[HOUR_GROUP$2]);
        if (match[MINUTE_GROUP$2] != null) {
            minute = parseInt(match[MINUTE_GROUP$2]);
        }
        if (minute >= 60 || hour > 24) {
            return null;
        }
        if (hour >= 12) {
            meridiem = index_1$4.Meridiem.PM;
        }
        if (match[AM_PM_HOUR_GROUP$2] != null) {
            if (hour > 12)
                return null;
            const ampm = match[AM_PM_HOUR_GROUP$2][0].toLowerCase();
            if (ampm == "a") {
                meridiem = index_1$4.Meridiem.AM;
                if (hour == 12) {
                    hour = 0;
                }
            }
            if (ampm == "p") {
                meridiem = index_1$4.Meridiem.PM;
                if (hour != 12) {
                    hour += 12;
                }
            }
        }
        extractingComponents.assign("hour", hour);
        extractingComponents.assign("minute", minute);
        if (meridiem !== null) {
            extractingComponents.assign("meridiem", meridiem);
        }
        else {
            if (hour < 12) {
                extractingComponents.imply("meridiem", index_1$4.Meridiem.AM);
            }
            else {
                extractingComponents.imply("meridiem", index_1$4.Meridiem.PM);
            }
        }
        if (match[SECOND_GROUP$2] != null) {
            const second = parseInt(match[SECOND_GROUP$2]);
            if (second >= 60)
                return null;
            extractingComponents.assign("second", second);
        }
        return extractingComponents;
    }
}
FRSpecificTimeExpressionParser$1.default = FRSpecificTimeExpressionParser;

var FRMonthNameLittleEndianParser$1 = {};

Object.defineProperty(FRMonthNameLittleEndianParser$1, "__esModule", { value: true });
const years_1$4 = years;
const constants_1$p = constants$5;
const constants_2$3 = constants$5;
const constants_3$1 = constants$5;
const pattern_1$8 = pattern;
const AbstractParserWithWordBoundary_1$w = AbstractParserWithWordBoundary;
const PATTERN$j = new RegExp("(?:on\\s*?)?" +
    `(${constants_3$1.ORDINAL_NUMBER_PATTERN})` +
    `(?:\\s*(?:au|\\-|\\–|jusqu'au?|\\s)\\s*(${constants_3$1.ORDINAL_NUMBER_PATTERN}))?` +
    `(?:-|/|\\s*(?:de)?\\s*)` +
    `(${(0, pattern_1$8.matchAnyPattern)(constants_1$p.MONTH_DICTIONARY)})` +
    `(?:(?:-|/|,?\\s*)(${constants_2$3.YEAR_PATTERN}(?![^\\s]\\d)))?` +
    `(?=\\W|$)`, "i");
const DATE_GROUP$3 = 1;
const DATE_TO_GROUP$2 = 2;
const MONTH_NAME_GROUP$4 = 3;
const YEAR_GROUP$6 = 4;
class FRMonthNameLittleEndianParser extends AbstractParserWithWordBoundary_1$w.AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$j;
    }
    innerExtract(context, match) {
        const result = context.createParsingResult(match.index, match[0]);
        const month = constants_1$p.MONTH_DICTIONARY[match[MONTH_NAME_GROUP$4].toLowerCase()];
        const day = (0, constants_3$1.parseOrdinalNumberPattern)(match[DATE_GROUP$3]);
        if (day > 31) {
            match.index = match.index + match[DATE_GROUP$3].length;
            return null;
        }
        result.start.assign("month", month);
        result.start.assign("day", day);
        if (match[YEAR_GROUP$6]) {
            const yearNumber = (0, constants_2$3.parseYear)(match[YEAR_GROUP$6]);
            result.start.assign("year", yearNumber);
        }
        else {
            const year = (0, years_1$4.findYearClosestToRef)(context.refDate, day, month);
            result.start.imply("year", year);
        }
        if (match[DATE_TO_GROUP$2]) {
            const endDate = (0, constants_3$1.parseOrdinalNumberPattern)(match[DATE_TO_GROUP$2]);
            result.end = result.start.clone();
            result.end.assign("day", endDate);
        }
        return result;
    }
}
FRMonthNameLittleEndianParser$1.default = FRMonthNameLittleEndianParser;

var FRTimeUnitAgoFormatParser$2 = {};

Object.defineProperty(FRTimeUnitAgoFormatParser$2, "__esModule", { value: true });
const constants_1$o = constants$5;
const results_1$7 = results;
const AbstractParserWithWordBoundary_1$v = AbstractParserWithWordBoundary;
const timeunits_1$3 = timeunits;
class FRTimeUnitAgoFormatParser$1 extends AbstractParserWithWordBoundary_1$v.AbstractParserWithWordBoundaryChecking {
    constructor() {
        super();
    }
    innerPattern() {
        return new RegExp(`il y a\\s*(${constants_1$o.TIME_UNITS_PATTERN})(?=(?:\\W|$))`, "i");
    }
    innerExtract(context, match) {
        const timeUnits = (0, constants_1$o.parseTimeUnits)(match[1]);
        const outputTimeUnits = (0, timeunits_1$3.reverseTimeUnits)(timeUnits);
        return results_1$7.ParsingComponents.createRelativeFromReference(context.reference, outputTimeUnits);
    }
}
FRTimeUnitAgoFormatParser$2.default = FRTimeUnitAgoFormatParser$1;

var FRTimeUnitWithinFormatParser$1 = {};

Object.defineProperty(FRTimeUnitWithinFormatParser$1, "__esModule", { value: true });
const constants_1$n = constants$5;
const results_1$6 = results;
const AbstractParserWithWordBoundary_1$u = AbstractParserWithWordBoundary;
class FRTimeUnitWithinFormatParser extends AbstractParserWithWordBoundary_1$u.AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return new RegExp(`(?:dans|en|pour|pendant)\\s*(${constants_1$n.TIME_UNITS_PATTERN})(?=\\W|$)`, "i");
    }
    innerExtract(context, match) {
        const timeUnits = (0, constants_1$n.parseTimeUnits)(match[1]);
        return results_1$6.ParsingComponents.createRelativeFromReference(context.reference, timeUnits);
    }
}
FRTimeUnitWithinFormatParser$1.default = FRTimeUnitWithinFormatParser;

var FRTimeUnitRelativeFormatParser = {};

Object.defineProperty(FRTimeUnitRelativeFormatParser, "__esModule", { value: true });
const constants_1$m = constants$5;
const results_1$5 = results;
const AbstractParserWithWordBoundary_1$t = AbstractParserWithWordBoundary;
const timeunits_1$2 = timeunits;
const pattern_1$7 = pattern;
class FRTimeUnitAgoFormatParser extends AbstractParserWithWordBoundary_1$t.AbstractParserWithWordBoundaryChecking {
    constructor() {
        super();
    }
    innerPattern() {
        return new RegExp(`(?:les?|la|l'|du|des?)\\s*` +
            `(${constants_1$m.NUMBER_PATTERN})?` +
            `(?:\\s*(prochaine?s?|derni[eè]re?s?|pass[ée]e?s?|pr[ée]c[ée]dents?|suivante?s?))?` +
            `\\s*(${(0, pattern_1$7.matchAnyPattern)(constants_1$m.TIME_UNIT_DICTIONARY)})` +
            `(?:\\s*(prochaine?s?|derni[eè]re?s?|pass[ée]e?s?|pr[ée]c[ée]dents?|suivante?s?))?`, "i");
    }
    innerExtract(context, match) {
        const num = match[1] ? (0, constants_1$m.parseNumberPattern)(match[1]) : 1;
        const unit = constants_1$m.TIME_UNIT_DICTIONARY[match[3].toLowerCase()];
        let timeUnits = {};
        timeUnits[unit] = num;
        let modifier = match[2] || match[4] || "";
        modifier = modifier.toLowerCase();
        if (!modifier) {
            return;
        }
        if (/derni[eè]re?s?/.test(modifier) || /pass[ée]e?s?/.test(modifier) || /pr[ée]c[ée]dents?/.test(modifier)) {
            timeUnits = (0, timeunits_1$2.reverseTimeUnits)(timeUnits);
        }
        return results_1$5.ParsingComponents.createRelativeFromReference(context.reference, timeUnits);
    }
}
FRTimeUnitRelativeFormatParser.default = FRTimeUnitAgoFormatParser;

(function (exports) {
var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConfiguration = exports.createCasualConfiguration = exports.parseDate = exports.parse = exports.strict = exports.casual = void 0;
const configurations_1 = configurations;
const chrono_1 = chrono$1;
const FRCasualDateParser_1 = __importDefault(FRCasualDateParser$1);
const FRCasualTimeParser_1 = __importDefault(FRCasualTimeParser$1);
const SlashDateFormatParser_1 = __importDefault(SlashDateFormatParser$1);
const FRTimeExpressionParser_1 = __importDefault(FRTimeExpressionParser$1);
const FRMergeDateTimeRefiner_1 = __importDefault(FRMergeDateTimeRefiner$1);
const FRMergeDateRangeRefiner_1 = __importDefault(FRMergeDateRangeRefiner$1);
const FRWeekdayParser_1 = __importDefault(FRWeekdayParser$1);
const FRSpecificTimeExpressionParser_1 = __importDefault(FRSpecificTimeExpressionParser$1);
const FRMonthNameLittleEndianParser_1 = __importDefault(FRMonthNameLittleEndianParser$1);
const FRTimeUnitAgoFormatParser_1 = __importDefault(FRTimeUnitAgoFormatParser$2);
const FRTimeUnitWithinFormatParser_1 = __importDefault(FRTimeUnitWithinFormatParser$1);
const FRTimeUnitRelativeFormatParser_1 = __importDefault(FRTimeUnitRelativeFormatParser);
exports.casual = new chrono_1.Chrono(createCasualConfiguration());
exports.strict = new chrono_1.Chrono(createConfiguration(true));
function parse(text, ref, option) {
    return exports.casual.parse(text, ref, option);
}
exports.parse = parse;
function parseDate(text, ref, option) {
    return exports.casual.parseDate(text, ref, option);
}
exports.parseDate = parseDate;
function createCasualConfiguration(littleEndian = true) {
    const option = createConfiguration(false, littleEndian);
    option.parsers.unshift(new FRCasualDateParser_1.default());
    option.parsers.unshift(new FRCasualTimeParser_1.default());
    option.parsers.unshift(new FRTimeUnitRelativeFormatParser_1.default());
    return option;
}
exports.createCasualConfiguration = createCasualConfiguration;
function createConfiguration(strictMode = true, littleEndian = true) {
    return (0, configurations_1.includeCommonConfiguration)({
        parsers: [
            new SlashDateFormatParser_1.default(littleEndian),
            new FRMonthNameLittleEndianParser_1.default(),
            new FRTimeExpressionParser_1.default(),
            new FRSpecificTimeExpressionParser_1.default(),
            new FRTimeUnitAgoFormatParser_1.default(),
            new FRTimeUnitWithinFormatParser_1.default(),
            new FRWeekdayParser_1.default(),
        ],
        refiners: [new FRMergeDateTimeRefiner_1.default(), new FRMergeDateRangeRefiner_1.default()],
    }, strictMode);
}
exports.createConfiguration = createConfiguration;
}(fr));

var ja = {};

var JPStandardParser$1 = {};

var constants$4 = {};

Object.defineProperty(constants$4, "__esModule", { value: true });
constants$4.toHankaku = void 0;
function toHankaku(text) {
    return String(text)
        .replace(/\u2019/g, "\u0027")
        .replace(/\u201D/g, "\u0022")
        .replace(/\u3000/g, "\u0020")
        .replace(/\uFFE5/g, "\u00A5")
        .replace(/[\uFF01\uFF03-\uFF06\uFF08\uFF09\uFF0C-\uFF19\uFF1C-\uFF1F\uFF21-\uFF3B\uFF3D\uFF3F\uFF41-\uFF5B\uFF5D\uFF5E]/g, alphaNum);
}
constants$4.toHankaku = toHankaku;
function alphaNum(token) {
    return String.fromCharCode(token.charCodeAt(0) - 65248);
}

var __importDefault$q = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(JPStandardParser$1, "__esModule", { value: true });
const constants_1$l = constants$4;
const years_1$3 = years;
const dayjs_1$h = __importDefault$q(require$$0);
const PATTERN$i = /(?:(?:([同今本])|((昭和|平成|令和)?([0-9０-９]{1,4}|元)))年\s*)?([0-9０-９]{1,2})月\s*([0-9０-９]{1,2})日/i;
const SPECIAL_YEAR_GROUP = 1;
const TYPICAL_YEAR_GROUP = 2;
const ERA_GROUP = 3;
const YEAR_NUMBER_GROUP$1 = 4;
const MONTH_GROUP$3 = 5;
const DAY_GROUP$3 = 6;
class JPStandardParser {
    pattern() {
        return PATTERN$i;
    }
    extract(context, match) {
        const month = parseInt((0, constants_1$l.toHankaku)(match[MONTH_GROUP$3]));
        const day = parseInt((0, constants_1$l.toHankaku)(match[DAY_GROUP$3]));
        const components = context.createParsingComponents({
            day: day,
            month: month,
        });
        if (match[SPECIAL_YEAR_GROUP] && match[SPECIAL_YEAR_GROUP].match("同|今|本")) {
            const moment = (0, dayjs_1$h.default)(context.refDate);
            components.assign("year", moment.year());
        }
        if (match[TYPICAL_YEAR_GROUP]) {
            const yearNumText = match[YEAR_NUMBER_GROUP$1];
            let year = yearNumText == "元" ? 1 : parseInt((0, constants_1$l.toHankaku)(yearNumText));
            if (match[ERA_GROUP] == "令和") {
                year += 2018;
            }
            else if (match[ERA_GROUP] == "平成") {
                year += 1988;
            }
            else if (match[ERA_GROUP] == "昭和") {
                year += 1925;
            }
            components.assign("year", year);
        }
        else {
            const year = (0, years_1$3.findYearClosestToRef)(context.refDate, day, month);
            components.imply("year", year);
        }
        return components;
    }
}
JPStandardParser$1.default = JPStandardParser;

var JPMergeDateRangeRefiner$1 = {};

var __importDefault$p = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(JPMergeDateRangeRefiner$1, "__esModule", { value: true });
const AbstractMergeDateRangeRefiner_1$4 = __importDefault$p(AbstractMergeDateRangeRefiner$1);
class JPMergeDateRangeRefiner extends AbstractMergeDateRangeRefiner_1$4.default {
    patternBetween() {
        return /^\s*(から|ー|-)\s*$/i;
    }
}
JPMergeDateRangeRefiner$1.default = JPMergeDateRangeRefiner;

var JPCasualDateParser$1 = {};

var __createBinding$2 = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault$2 = (commonjsGlobal && commonjsGlobal.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar$2 = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding$2(result, mod, k);
    __setModuleDefault$2(result, mod);
    return result;
};
var __importDefault$o = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(JPCasualDateParser$1, "__esModule", { value: true });
const dayjs_1$g = __importDefault$o(require$$0);
const index_1$3 = dist;
const references$2 = __importStar$2(casualReferences);
const PATTERN$h = /今日|当日|昨日|明日|今夜|今夕|今晩|今朝/i;
class JPCasualDateParser {
    pattern() {
        return PATTERN$h;
    }
    extract(context, match) {
        const text = match[0];
        const date = (0, dayjs_1$g.default)(context.refDate);
        const components = context.createParsingComponents();
        switch (text) {
            case "昨日":
                return references$2.yesterday(context.reference);
            case "明日":
                return references$2.tomorrow(context.reference);
            case "今日":
            case "当日":
                return references$2.today(context.reference);
        }
        if (text == "今夜" || text == "今夕" || text == "今晩") {
            components.imply("hour", 22);
            components.assign("meridiem", index_1$3.Meridiem.PM);
        }
        else if (text.match("今朝")) {
            components.imply("hour", 6);
            components.assign("meridiem", index_1$3.Meridiem.AM);
        }
        components.assign("day", date.date());
        components.assign("month", date.month() + 1);
        components.assign("year", date.year());
        return components;
    }
}
JPCasualDateParser$1.default = JPCasualDateParser;

(function (exports) {
var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConfiguration = exports.createCasualConfiguration = exports.parseDate = exports.parse = exports.strict = exports.casual = void 0;
const JPStandardParser_1 = __importDefault(JPStandardParser$1);
const JPMergeDateRangeRefiner_1 = __importDefault(JPMergeDateRangeRefiner$1);
const JPCasualDateParser_1 = __importDefault(JPCasualDateParser$1);
const chrono_1 = chrono$1;
exports.casual = new chrono_1.Chrono(createCasualConfiguration());
exports.strict = new chrono_1.Chrono(createConfiguration());
function parse(text, ref, option) {
    return exports.casual.parse(text, ref, option);
}
exports.parse = parse;
function parseDate(text, ref, option) {
    return exports.casual.parseDate(text, ref, option);
}
exports.parseDate = parseDate;
function createCasualConfiguration() {
    const option = createConfiguration();
    option.parsers.unshift(new JPCasualDateParser_1.default());
    return option;
}
exports.createCasualConfiguration = createCasualConfiguration;
function createConfiguration() {
    return {
        parsers: [new JPStandardParser_1.default()],
        refiners: [new JPMergeDateRangeRefiner_1.default()],
    };
}
exports.createConfiguration = createConfiguration;
}(ja));

var pt = {};

var PTWeekdayParser$1 = {};

var constants$3 = {};

Object.defineProperty(constants$3, "__esModule", { value: true });
constants$3.parseYear = constants$3.YEAR_PATTERN = constants$3.MONTH_DICTIONARY = constants$3.WEEKDAY_DICTIONARY = void 0;
constants$3.WEEKDAY_DICTIONARY = {
    "domingo": 0,
    "dom": 0,
    "segunda": 1,
    "segunda-feira": 1,
    "seg": 1,
    "terça": 2,
    "terça-feira": 2,
    "ter": 2,
    "quarta": 3,
    "quarta-feira": 3,
    "qua": 3,
    "quinta": 4,
    "quinta-feira": 4,
    "qui": 4,
    "sexta": 5,
    "sexta-feira": 5,
    "sex": 5,
    "sábado": 6,
    "sabado": 6,
    "sab": 6,
};
constants$3.MONTH_DICTIONARY = {
    "janeiro": 1,
    "jan": 1,
    "jan.": 1,
    "fevereiro": 2,
    "fev": 2,
    "fev.": 2,
    "março": 3,
    "mar": 3,
    "mar.": 3,
    "abril": 4,
    "abr": 4,
    "abr.": 4,
    "maio": 5,
    "mai": 5,
    "mai.": 5,
    "junho": 6,
    "jun": 6,
    "jun.": 6,
    "julho": 7,
    "jul": 7,
    "jul.": 7,
    "agosto": 8,
    "ago": 8,
    "ago.": 8,
    "setembro": 9,
    "set": 9,
    "set.": 9,
    "outubro": 10,
    "out": 10,
    "out.": 10,
    "novembro": 11,
    "nov": 11,
    "nov.": 11,
    "dezembro": 12,
    "dez": 12,
    "dez.": 12,
};
constants$3.YEAR_PATTERN = "[0-9]{1,4}(?![^\\s]\\d)(?:\\s*[a|d]\\.?\\s*c\\.?|\\s*a\\.?\\s*d\\.?)?";
function parseYear(match) {
    if (match.match(/^[0-9]{1,4}$/)) {
        let yearNumber = parseInt(match);
        if (yearNumber < 100) {
            if (yearNumber > 50) {
                yearNumber = yearNumber + 1900;
            }
            else {
                yearNumber = yearNumber + 2000;
            }
        }
        return yearNumber;
    }
    if (match.match(/a\.?\s*c\.?/i)) {
        match = match.replace(/a\.?\s*c\.?/i, "");
        return -parseInt(match);
    }
    return parseInt(match);
}
constants$3.parseYear = parseYear;

Object.defineProperty(PTWeekdayParser$1, "__esModule", { value: true });
const constants_1$k = constants$3;
const pattern_1$6 = pattern;
const AbstractParserWithWordBoundary_1$s = AbstractParserWithWordBoundary;
const weeks_1$1 = weeks;
const PATTERN$g = new RegExp("(?:(?:\\,|\\(|\\（)\\s*)?" +
    "(?:(este|esta|passado|pr[oó]ximo)\\s*)?" +
    `(${(0, pattern_1$6.matchAnyPattern)(constants_1$k.WEEKDAY_DICTIONARY)})` +
    "(?:\\s*(?:\\,|\\)|\\）))?" +
    "(?:\\s*(este|esta|passado|pr[óo]ximo)\\s*semana)?" +
    "(?=\\W|\\d|$)", "i");
const PREFIX_GROUP$1 = 1;
const WEEKDAY_GROUP$1 = 2;
const POSTFIX_GROUP$1 = 3;
class PTWeekdayParser extends AbstractParserWithWordBoundary_1$s.AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$g;
    }
    innerExtract(context, match) {
        const dayOfWeek = match[WEEKDAY_GROUP$1].toLowerCase();
        const offset = constants_1$k.WEEKDAY_DICTIONARY[dayOfWeek];
        if (offset === undefined) {
            return null;
        }
        const prefix = match[PREFIX_GROUP$1];
        const postfix = match[POSTFIX_GROUP$1];
        let norm = prefix || postfix || "";
        norm = norm.toLowerCase();
        let modifier = null;
        if (norm == "passado") {
            modifier = "this";
        }
        else if (norm == "próximo" || norm == "proximo") {
            modifier = "next";
        }
        else if (norm == "este") {
            modifier = "this";
        }
        const date = (0, weeks_1$1.toDayJSWeekday)(context.refDate, offset, modifier);
        return context
            .createParsingComponents()
            .assign("weekday", offset)
            .imply("day", date.date())
            .imply("month", date.month() + 1)
            .imply("year", date.year());
    }
}
PTWeekdayParser$1.default = PTWeekdayParser;

var PTTimeExpressionParser$1 = {};

Object.defineProperty(PTTimeExpressionParser$1, "__esModule", { value: true });
const AbstractTimeExpressionParser_1$1 = AbstractTimeExpressionParser$1;
class PTTimeExpressionParser extends AbstractTimeExpressionParser_1$1.AbstractTimeExpressionParser {
    primaryPrefix() {
        return "(?:(?:ao?|às?|das|da|de|do)\\s*)?";
    }
    followingPhase() {
        return "\\s*(?:\\-|\\–|\\~|\\〜|a(?:o)?|\\?)\\s*";
    }
}
PTTimeExpressionParser$1.default = PTTimeExpressionParser;

var PTMergeDateTimeRefiner$1 = {};

var __importDefault$n = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(PTMergeDateTimeRefiner$1, "__esModule", { value: true });
const AbstractMergeDateTimeRefiner_1$3 = __importDefault$n(AbstractMergeDateTimeRefiner);
class PTMergeDateTimeRefiner extends AbstractMergeDateTimeRefiner_1$3.default {
    patternBetween() {
        return new RegExp("^\\s*(?:,|à)?\\s*$");
    }
}
PTMergeDateTimeRefiner$1.default = PTMergeDateTimeRefiner;

var PTMergeDateRangeRefiner$1 = {};

var __importDefault$m = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(PTMergeDateRangeRefiner$1, "__esModule", { value: true });
const AbstractMergeDateRangeRefiner_1$3 = __importDefault$m(AbstractMergeDateRangeRefiner$1);
class PTMergeDateRangeRefiner extends AbstractMergeDateRangeRefiner_1$3.default {
    patternBetween() {
        return /^\s*(?:-)\s*$/i;
    }
}
PTMergeDateRangeRefiner$1.default = PTMergeDateRangeRefiner;

var PTMonthNameLittleEndianParser$1 = {};

Object.defineProperty(PTMonthNameLittleEndianParser$1, "__esModule", { value: true });
const years_1$2 = years;
const constants_1$j = constants$3;
const constants_2$2 = constants$3;
const pattern_1$5 = pattern;
const AbstractParserWithWordBoundary_1$r = AbstractParserWithWordBoundary;
const PATTERN$f = new RegExp(`([0-9]{1,2})(?:º|ª|°)?` +
    "(?:\\s*(?:desde|de|\\-|\\–|ao?|\\s)\\s*([0-9]{1,2})(?:º|ª|°)?)?\\s*(?:de)?\\s*" +
    `(?:-|/|\\s*(?:de|,)?\\s*)` +
    `(${(0, pattern_1$5.matchAnyPattern)(constants_1$j.MONTH_DICTIONARY)})` +
    `(?:\\s*(?:de|,)?\\s*(${constants_2$2.YEAR_PATTERN}))?` +
    `(?=\\W|$)`, "i");
const DATE_GROUP$2 = 1;
const DATE_TO_GROUP$1 = 2;
const MONTH_NAME_GROUP$3 = 3;
const YEAR_GROUP$5 = 4;
class PTMonthNameLittleEndianParser extends AbstractParserWithWordBoundary_1$r.AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$f;
    }
    innerExtract(context, match) {
        const result = context.createParsingResult(match.index, match[0]);
        const month = constants_1$j.MONTH_DICTIONARY[match[MONTH_NAME_GROUP$3].toLowerCase()];
        const day = parseInt(match[DATE_GROUP$2]);
        if (day > 31) {
            match.index = match.index + match[DATE_GROUP$2].length;
            return null;
        }
        result.start.assign("month", month);
        result.start.assign("day", day);
        if (match[YEAR_GROUP$5]) {
            const yearNumber = (0, constants_2$2.parseYear)(match[YEAR_GROUP$5]);
            result.start.assign("year", yearNumber);
        }
        else {
            const year = (0, years_1$2.findYearClosestToRef)(context.refDate, day, month);
            result.start.imply("year", year);
        }
        if (match[DATE_TO_GROUP$1]) {
            const endDate = parseInt(match[DATE_TO_GROUP$1]);
            result.end = result.start.clone();
            result.end.assign("day", endDate);
        }
        return result;
    }
}
PTMonthNameLittleEndianParser$1.default = PTMonthNameLittleEndianParser;

var PTCasualDateParser$1 = {};

var __createBinding$1 = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault$1 = (commonjsGlobal && commonjsGlobal.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar$1 = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding$1(result, mod, k);
    __setModuleDefault$1(result, mod);
    return result;
};
Object.defineProperty(PTCasualDateParser$1, "__esModule", { value: true });
const AbstractParserWithWordBoundary_1$q = AbstractParserWithWordBoundary;
const references$1 = __importStar$1(casualReferences);
class PTCasualDateParser extends AbstractParserWithWordBoundary_1$q.AbstractParserWithWordBoundaryChecking {
    innerPattern(context) {
        return /(agora|hoje|amanha|amanhã|ontem)(?=\W|$)/i;
    }
    innerExtract(context, match) {
        const lowerText = match[0].toLowerCase();
        const component = context.createParsingComponents();
        switch (lowerText) {
            case "agora":
                return references$1.now(context.reference);
            case "hoje":
                return references$1.today(context.reference);
            case "amanha":
            case "amanhã":
                return references$1.tomorrow(context.reference);
            case "ontem":
                return references$1.yesterday(context.reference);
        }
        return component;
    }
}
PTCasualDateParser$1.default = PTCasualDateParser;

var PTCasualTimeParser$1 = {};

var __importDefault$l = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(PTCasualTimeParser$1, "__esModule", { value: true });
const index_1$2 = dist;
const AbstractParserWithWordBoundary_1$p = AbstractParserWithWordBoundary;
const dayjs_1$f = dayjs;
const dayjs_2$2 = __importDefault$l(require$$0);
class PTCasualTimeParser extends AbstractParserWithWordBoundary_1$p.AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return /(?:esta\s*)?(manha|manhã|tarde|meia-noite|meio-dia|noite)(?=\W|$)/i;
    }
    innerExtract(context, match) {
        const targetDate = (0, dayjs_2$2.default)(context.refDate);
        const component = context.createParsingComponents();
        switch (match[1].toLowerCase()) {
            case "tarde":
                component.imply("meridiem", index_1$2.Meridiem.PM);
                component.imply("hour", 15);
                break;
            case "noite":
                component.imply("meridiem", index_1$2.Meridiem.PM);
                component.imply("hour", 22);
                break;
            case "manha":
            case "manhã":
                component.imply("meridiem", index_1$2.Meridiem.AM);
                component.imply("hour", 6);
                break;
            case "meia-noite":
                (0, dayjs_1$f.assignTheNextDay)(component, targetDate);
                component.imply("hour", 0);
                component.imply("minute", 0);
                component.imply("second", 0);
                break;
            case "meio-dia":
                component.imply("meridiem", index_1$2.Meridiem.AM);
                component.imply("hour", 12);
                break;
        }
        return component;
    }
}
PTCasualTimeParser$1.default = PTCasualTimeParser;

(function (exports) {
var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConfiguration = exports.createCasualConfiguration = exports.parseDate = exports.parse = exports.strict = exports.casual = void 0;
const configurations_1 = configurations;
const chrono_1 = chrono$1;
const SlashDateFormatParser_1 = __importDefault(SlashDateFormatParser$1);
const PTWeekdayParser_1 = __importDefault(PTWeekdayParser$1);
const PTTimeExpressionParser_1 = __importDefault(PTTimeExpressionParser$1);
const PTMergeDateTimeRefiner_1 = __importDefault(PTMergeDateTimeRefiner$1);
const PTMergeDateRangeRefiner_1 = __importDefault(PTMergeDateRangeRefiner$1);
const PTMonthNameLittleEndianParser_1 = __importDefault(PTMonthNameLittleEndianParser$1);
const PTCasualDateParser_1 = __importDefault(PTCasualDateParser$1);
const PTCasualTimeParser_1 = __importDefault(PTCasualTimeParser$1);
exports.casual = new chrono_1.Chrono(createCasualConfiguration());
exports.strict = new chrono_1.Chrono(createConfiguration(true));
function parse(text, ref, option) {
    return exports.casual.parse(text, ref, option);
}
exports.parse = parse;
function parseDate(text, ref, option) {
    return exports.casual.parseDate(text, ref, option);
}
exports.parseDate = parseDate;
function createCasualConfiguration(littleEndian = true) {
    const option = createConfiguration(false, littleEndian);
    option.parsers.push(new PTCasualDateParser_1.default());
    option.parsers.push(new PTCasualTimeParser_1.default());
    return option;
}
exports.createCasualConfiguration = createCasualConfiguration;
function createConfiguration(strictMode = true, littleEndian = true) {
    return (0, configurations_1.includeCommonConfiguration)({
        parsers: [
            new SlashDateFormatParser_1.default(littleEndian),
            new PTWeekdayParser_1.default(),
            new PTTimeExpressionParser_1.default(),
            new PTMonthNameLittleEndianParser_1.default(),
        ],
        refiners: [new PTMergeDateTimeRefiner_1.default(), new PTMergeDateRangeRefiner_1.default()],
    }, strictMode);
}
exports.createConfiguration = createConfiguration;
}(pt));

var nl = {};

var NLMergeDateRangeRefiner$1 = {};

var __importDefault$k = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(NLMergeDateRangeRefiner$1, "__esModule", { value: true });
const AbstractMergeDateRangeRefiner_1$2 = __importDefault$k(AbstractMergeDateRangeRefiner$1);
class NLMergeDateRangeRefiner extends AbstractMergeDateRangeRefiner_1$2.default {
    patternBetween() {
        return /^\s*(tot|-)\s*$/i;
    }
}
NLMergeDateRangeRefiner$1.default = NLMergeDateRangeRefiner;

var NLMergeDateTimeRefiner$1 = {};

var __importDefault$j = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(NLMergeDateTimeRefiner$1, "__esModule", { value: true });
const AbstractMergeDateTimeRefiner_1$2 = __importDefault$j(AbstractMergeDateTimeRefiner);
class NLMergeDateTimeRefiner extends AbstractMergeDateTimeRefiner_1$2.default {
    patternBetween() {
        return new RegExp("^\\s*(om|na|voor|in de|,|-)?\\s*$");
    }
}
NLMergeDateTimeRefiner$1.default = NLMergeDateTimeRefiner;

var NLCasualDateParser$1 = {};

var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (commonjsGlobal && commonjsGlobal.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(NLCasualDateParser$1, "__esModule", { value: true });
const AbstractParserWithWordBoundary_1$o = AbstractParserWithWordBoundary;
const references = __importStar(casualReferences);
class NLCasualDateParser extends AbstractParserWithWordBoundary_1$o.AbstractParserWithWordBoundaryChecking {
    innerPattern(context) {
        return /(nu|vandaag|morgen|morgend|gisteren)(?=\W|$)/i;
    }
    innerExtract(context, match) {
        const lowerText = match[0].toLowerCase();
        const component = context.createParsingComponents();
        switch (lowerText) {
            case "nu":
                return references.now(context.reference);
            case "vandaag":
                return references.today(context.reference);
            case "morgen":
            case "morgend":
                return references.tomorrow(context.reference);
            case "gisteren":
                return references.yesterday(context.reference);
        }
        return component;
    }
}
NLCasualDateParser$1.default = NLCasualDateParser;

var NLCasualTimeParser$1 = {};

var __importDefault$i = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(NLCasualTimeParser$1, "__esModule", { value: true });
const index_1$1 = dist;
const AbstractParserWithWordBoundary_1$n = AbstractParserWithWordBoundary;
const dayjs_1$e = __importDefault$i(require$$0);
const dayjs_2$1 = dayjs;
const DAY_GROUP$2 = 1;
const MOMENT_GROUP = 2;
class NLCasualTimeParser extends AbstractParserWithWordBoundary_1$n.AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return /(deze)?\s*(namiddag|avond|middernacht|ochtend|middag|'s middags|'s avonds|'s ochtends)(?=\W|$)/i;
    }
    innerExtract(context, match) {
        const targetDate = (0, dayjs_1$e.default)(context.refDate);
        const component = context.createParsingComponents();
        if (match[DAY_GROUP$2] === "deze") {
            component.assign("day", context.refDate.getDate());
            component.assign("month", context.refDate.getMonth() + 1);
            component.assign("year", context.refDate.getFullYear());
        }
        switch (match[MOMENT_GROUP].toLowerCase()) {
            case "namiddag":
            case "'s namiddags":
                component.imply("meridiem", index_1$1.Meridiem.PM);
                component.imply("hour", 15);
                break;
            case "avond":
            case "'s avonds'":
                component.imply("meridiem", index_1$1.Meridiem.PM);
                component.imply("hour", 20);
                break;
            case "middernacht":
                (0, dayjs_2$1.assignTheNextDay)(component, targetDate);
                component.imply("hour", 0);
                component.imply("minute", 0);
                component.imply("second", 0);
                break;
            case "ochtend":
            case "'s ochtends":
                component.imply("meridiem", index_1$1.Meridiem.AM);
                component.imply("hour", 6);
                break;
            case "middag":
            case "'s middags":
                component.imply("meridiem", index_1$1.Meridiem.AM);
                component.imply("hour", 12);
                break;
        }
        return component;
    }
}
NLCasualTimeParser$1.default = NLCasualTimeParser;

var NLTimeUnitWithinFormatParser$1 = {};

var constants$2 = {};

(function (exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTimeUnits = exports.TIME_UNITS_PATTERN = exports.parseYear = exports.YEAR_PATTERN = exports.parseOrdinalNumberPattern = exports.ORDINAL_NUMBER_PATTERN = exports.parseNumberPattern = exports.NUMBER_PATTERN = exports.TIME_UNIT_DICTIONARY = exports.ORDINAL_WORD_DICTIONARY = exports.INTEGER_WORD_DICTIONARY = exports.MONTH_DICTIONARY = exports.WEEKDAY_DICTIONARY = void 0;
const pattern_1 = pattern;
const years_1 = years;
exports.WEEKDAY_DICTIONARY = {
    zondag: 0,
    zon: 0,
    "zon.": 0,
    zo: 0,
    "zo.": 0,
    maandag: 1,
    ma: 1,
    "ma.": 1,
    dinsdag: 2,
    din: 2,
    "din.": 2,
    di: 2,
    "di.": 2,
    woensdag: 3,
    woe: 3,
    "woe.": 3,
    wo: 3,
    "wo.": 3,
    donderdag: 4,
    dond: 4,
    "dond.": 4,
    do: 4,
    "do.": 4,
    vrijdag: 5,
    vrij: 5,
    "vrij.": 5,
    vr: 5,
    "vr.": 5,
    zaterdag: 6,
    zat: 6,
    "zat.": 6,
    "za": 6,
    "za.": 6,
};
exports.MONTH_DICTIONARY = {
    januari: 1,
    jan: 1,
    "jan.": 1,
    februari: 2,
    feb: 2,
    "feb.": 2,
    maart: 3,
    mar: 3,
    "mar.": 3,
    april: 4,
    apr: 4,
    "apr.": 4,
    mei: 5,
    juni: 6,
    jun: 6,
    "jun.": 6,
    juli: 7,
    jul: 7,
    "jul.": 7,
    augustus: 8,
    aug: 8,
    "aug.": 8,
    september: 9,
    sep: 9,
    "sep.": 9,
    sept: 9,
    "sept.": 9,
    oktober: 10,
    okt: 10,
    "okt.": 10,
    november: 11,
    nov: 11,
    "nov.": 11,
    december: 12,
    dec: 12,
    "dec.": 12,
};
exports.INTEGER_WORD_DICTIONARY = {
    een: 1,
    twee: 2,
    drie: 3,
    vier: 4,
    vijf: 5,
    zes: 6,
    zeven: 7,
    acht: 8,
    negen: 9,
    tien: 10,
    elf: 11,
    twaalf: 12,
};
exports.ORDINAL_WORD_DICTIONARY = {
    eerste: 1,
    tweede: 2,
    derde: 3,
    vierde: 4,
    vijfde: 5,
    zesde: 6,
    zevende: 7,
    achtste: 8,
    negende: 9,
    tiende: 10,
    elfde: 11,
    twaalfde: 12,
    dertiende: 13,
    veertiende: 14,
    vijftiende: 15,
    zestiende: 16,
    zeventiende: 17,
    achttiende: 18,
    negentiende: 19,
    twintigste: 20,
    "eenentwintigste": 21,
    "tweeëntwintigste": 22,
    "drieentwintigste": 23,
    "vierentwintigste": 24,
    "vijfentwintigste": 25,
    "zesentwintigste": 26,
    "zevenentwintigste": 27,
    "achtentwintig": 28,
    "negenentwintig": 29,
    "dertigste": 30,
    "eenendertigste": 31,
};
exports.TIME_UNIT_DICTIONARY = {
    sec: "second",
    second: "second",
    seconden: "second",
    min: "minute",
    mins: "minute",
    minute: "minute",
    minuut: "minute",
    minuten: "minute",
    minuutje: "minute",
    h: "hour",
    hr: "hour",
    hrs: "hour",
    uur: "hour",
    u: "hour",
    uren: "hour",
    dag: "d",
    dagen: "d",
    week: "week",
    weken: "week",
    maand: "month",
    maanden: "month",
    jaar: "year",
    jr: "year",
    jaren: "year",
};
exports.NUMBER_PATTERN = `(?:${(0, pattern_1.matchAnyPattern)(exports.INTEGER_WORD_DICTIONARY)}|[0-9]+|[0-9]+[\\.,][0-9]+|halve?|half|paar)`;
function parseNumberPattern(match) {
    const num = match.toLowerCase();
    if (exports.INTEGER_WORD_DICTIONARY[num] !== undefined) {
        return exports.INTEGER_WORD_DICTIONARY[num];
    }
    else if (num === "paar") {
        return 2;
    }
    else if (num === "half" || num.match(/halve?/)) {
        return 0.5;
    }
    return parseFloat(num.replace(",", "."));
}
exports.parseNumberPattern = parseNumberPattern;
exports.ORDINAL_NUMBER_PATTERN = `(?:${(0, pattern_1.matchAnyPattern)(exports.ORDINAL_WORD_DICTIONARY)}|[0-9]{1,2}(?:ste|de)?)`;
function parseOrdinalNumberPattern(match) {
    let num = match.toLowerCase();
    if (exports.ORDINAL_WORD_DICTIONARY[num] !== undefined) {
        return exports.ORDINAL_WORD_DICTIONARY[num];
    }
    num = num.replace(/(?:ste|de)$/i, "");
    return parseInt(num);
}
exports.parseOrdinalNumberPattern = parseOrdinalNumberPattern;
exports.YEAR_PATTERN = `(?:[1-9][0-9]{0,3}\\s*(?:voor Christus|na Christus)|[1-2][0-9]{3}|[5-9][0-9])`;
function parseYear(match) {
    if (/voor Christus/i.test(match)) {
        match = match.replace(/voor Christus/i, "");
        return -parseInt(match);
    }
    if (/na Christus/i.test(match)) {
        match = match.replace(/na Christus/i, "");
        return parseInt(match);
    }
    const rawYearNumber = parseInt(match);
    return (0, years_1.findMostLikelyADYear)(rawYearNumber);
}
exports.parseYear = parseYear;
const SINGLE_TIME_UNIT_PATTERN = `(${exports.NUMBER_PATTERN})\\s{0,5}(${(0, pattern_1.matchAnyPattern)(exports.TIME_UNIT_DICTIONARY)})\\s{0,5}`;
const SINGLE_TIME_UNIT_REGEX = new RegExp(SINGLE_TIME_UNIT_PATTERN, "i");
exports.TIME_UNITS_PATTERN = (0, pattern_1.repeatedTimeunitPattern)(`(?:(?:binnen|in)\\s*)?`, SINGLE_TIME_UNIT_PATTERN);
function parseTimeUnits(timeunitText) {
    const fragments = {};
    let remainingText = timeunitText;
    let match = SINGLE_TIME_UNIT_REGEX.exec(remainingText);
    while (match) {
        collectDateTimeFragment(fragments, match);
        remainingText = remainingText.substring(match[0].length);
        match = SINGLE_TIME_UNIT_REGEX.exec(remainingText);
    }
    return fragments;
}
exports.parseTimeUnits = parseTimeUnits;
function collectDateTimeFragment(fragments, match) {
    const num = parseNumberPattern(match[1]);
    const unit = exports.TIME_UNIT_DICTIONARY[match[2].toLowerCase()];
    fragments[unit] = num;
}
}(constants$2));

Object.defineProperty(NLTimeUnitWithinFormatParser$1, "__esModule", { value: true });
const constants_1$i = constants$2;
const results_1$4 = results;
const AbstractParserWithWordBoundary_1$m = AbstractParserWithWordBoundary;
class NLTimeUnitWithinFormatParser extends AbstractParserWithWordBoundary_1$m.AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return new RegExp(`(?:binnen|in|binnen de|voor)\\s*` + "(" + constants_1$i.TIME_UNITS_PATTERN + ")" + `(?=\\W|$)`, "i");
    }
    innerExtract(context, match) {
        const timeUnits = (0, constants_1$i.parseTimeUnits)(match[1]);
        return results_1$4.ParsingComponents.createRelativeFromReference(context.reference, timeUnits);
    }
}
NLTimeUnitWithinFormatParser$1.default = NLTimeUnitWithinFormatParser;

var NLWeekdayParser$1 = {};

Object.defineProperty(NLWeekdayParser$1, "__esModule", { value: true });
const constants_1$h = constants$2;
const pattern_1$4 = pattern;
const AbstractParserWithWordBoundary_1$l = AbstractParserWithWordBoundary;
const weeks_1 = weeks;
const PATTERN$e = new RegExp("(?:(?:\\,|\\(|\\（)\\s*)?" +
    "(?:op\\s*?)?" +
    "(?:(deze|vorige|volgende)\\s*(?:week\\s*)?)?" +
    `(${(0, pattern_1$4.matchAnyPattern)(constants_1$h.WEEKDAY_DICTIONARY)})` +
    "(?=\\W|$)", "i");
const PREFIX_GROUP = 1;
const WEEKDAY_GROUP = 2;
const POSTFIX_GROUP = 3;
class NLWeekdayParser extends AbstractParserWithWordBoundary_1$l.AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$e;
    }
    innerExtract(context, match) {
        const dayOfWeek = match[WEEKDAY_GROUP].toLowerCase();
        const offset = constants_1$h.WEEKDAY_DICTIONARY[dayOfWeek];
        const prefix = match[PREFIX_GROUP];
        const postfix = match[POSTFIX_GROUP];
        let modifierWord = prefix || postfix;
        modifierWord = modifierWord || "";
        modifierWord = modifierWord.toLowerCase();
        let modifier = null;
        if (modifierWord == "vorige") {
            modifier = "last";
        }
        else if (modifierWord == "volgende") {
            modifier = "next";
        }
        else if (modifierWord == "deze") {
            modifier = "this";
        }
        const date = (0, weeks_1.toDayJSWeekday)(context.refDate, offset, modifier);
        return context
            .createParsingComponents()
            .assign("weekday", offset)
            .imply("day", date.date())
            .imply("month", date.month() + 1)
            .imply("year", date.year());
    }
}
NLWeekdayParser$1.default = NLWeekdayParser;

var NLMonthNameMiddleEndianParser$1 = {};

Object.defineProperty(NLMonthNameMiddleEndianParser$1, "__esModule", { value: true });
const years_1$1 = years;
const constants_1$g = constants$2;
const constants_2$1 = constants$2;
const constants_3 = constants$2;
const pattern_1$3 = pattern;
const AbstractParserWithWordBoundary_1$k = AbstractParserWithWordBoundary;
const PATTERN$d = new RegExp("(?:on\\s*?)?" +
    `(${constants_2$1.ORDINAL_NUMBER_PATTERN})` +
    "(?:\\s*" +
    "(?:tot|\\-|\\–|until|through|till|\\s)\\s*" +
    `(${constants_2$1.ORDINAL_NUMBER_PATTERN})` +
    ")?" +
    "(?:-|/|\\s*(?:of)?\\s*)" +
    "(" +
    (0, pattern_1$3.matchAnyPattern)(constants_1$g.MONTH_DICTIONARY) +
    ")" +
    "(?:" +
    "(?:-|/|,?\\s*)" +
    `(${constants_3.YEAR_PATTERN}(?![^\\s]\\d))` +
    ")?" +
    "(?=\\W|$)", "i");
const MONTH_NAME_GROUP$2 = 3;
const DATE_GROUP$1 = 1;
const DATE_TO_GROUP = 2;
const YEAR_GROUP$4 = 4;
class NLMonthNameMiddleEndianParser extends AbstractParserWithWordBoundary_1$k.AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$d;
    }
    innerExtract(context, match) {
        const month = constants_1$g.MONTH_DICTIONARY[match[MONTH_NAME_GROUP$2].toLowerCase()];
        const day = (0, constants_2$1.parseOrdinalNumberPattern)(match[DATE_GROUP$1]);
        if (day > 31) {
            match.index = match.index + match[DATE_GROUP$1].length;
            return null;
        }
        const components = context.createParsingComponents({
            day: day,
            month: month,
        });
        if (match[YEAR_GROUP$4]) {
            const year = (0, constants_3.parseYear)(match[YEAR_GROUP$4]);
            components.assign("year", year);
        }
        else {
            const year = (0, years_1$1.findYearClosestToRef)(context.refDate, day, month);
            components.imply("year", year);
        }
        if (!match[DATE_TO_GROUP]) {
            return components;
        }
        const endDate = (0, constants_2$1.parseOrdinalNumberPattern)(match[DATE_TO_GROUP]);
        const result = context.createParsingResult(match.index, match[0]);
        result.start = components;
        result.end = components.clone();
        result.end.assign("day", endDate);
        return result;
    }
}
NLMonthNameMiddleEndianParser$1.default = NLMonthNameMiddleEndianParser;

var NLMonthNameParser$1 = {};

Object.defineProperty(NLMonthNameParser$1, "__esModule", { value: true });
const constants_1$f = constants$2;
const years_1 = years;
const pattern_1$2 = pattern;
const constants_2 = constants$2;
const AbstractParserWithWordBoundary_1$j = AbstractParserWithWordBoundary;
const PATTERN$c = new RegExp(`(${(0, pattern_1$2.matchAnyPattern)(constants_1$f.MONTH_DICTIONARY)})` +
    `\\s*` +
    `(?:` +
    `[,-]?\\s*(${constants_2.YEAR_PATTERN})?` +
    ")?" +
    "(?=[^\\s\\w]|\\s+[^0-9]|\\s+$|$)", "i");
const MONTH_NAME_GROUP$1 = 1;
const YEAR_GROUP$3 = 2;
class NLMonthNameParser extends AbstractParserWithWordBoundary_1$j.AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$c;
    }
    innerExtract(context, match) {
        const components = context.createParsingComponents();
        components.imply("day", 1);
        const monthName = match[MONTH_NAME_GROUP$1];
        const month = constants_1$f.MONTH_DICTIONARY[monthName.toLowerCase()];
        components.assign("month", month);
        if (match[YEAR_GROUP$3]) {
            const year = (0, constants_2.parseYear)(match[YEAR_GROUP$3]);
            components.assign("year", year);
        }
        else {
            const year = (0, years_1.findYearClosestToRef)(context.refDate, 1, month);
            components.imply("year", year);
        }
        return components;
    }
}
NLMonthNameParser$1.default = NLMonthNameParser;

var NLSlashMonthFormatParser$1 = {};

Object.defineProperty(NLSlashMonthFormatParser$1, "__esModule", { value: true });
const AbstractParserWithWordBoundary_1$i = AbstractParserWithWordBoundary;
const PATTERN$b = new RegExp("([0-9]|0[1-9]|1[012])/([0-9]{4})" + "", "i");
const MONTH_GROUP$2 = 1;
const YEAR_GROUP$2 = 2;
class NLSlashMonthFormatParser extends AbstractParserWithWordBoundary_1$i.AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$b;
    }
    innerExtract(context, match) {
        const year = parseInt(match[YEAR_GROUP$2]);
        const month = parseInt(match[MONTH_GROUP$2]);
        return context.createParsingComponents().imply("day", 1).assign("month", month).assign("year", year);
    }
}
NLSlashMonthFormatParser$1.default = NLSlashMonthFormatParser;

var NLTimeExpressionParser$1 = {};

Object.defineProperty(NLTimeExpressionParser$1, "__esModule", { value: true });
const AbstractTimeExpressionParser_1 = AbstractTimeExpressionParser$1;
class NLTimeExpressionParser extends AbstractTimeExpressionParser_1.AbstractTimeExpressionParser {
    primaryPrefix() {
        return "(?:(?:om)\\s*)?";
    }
    followingPhase() {
        return "\\s*(?:\\-|\\–|\\~|\\〜|om|\\?)\\s*";
    }
    primarySuffix() {
        return "(?:\\s*(?:uur))?(?!/)(?=\\W|$)";
    }
    extractPrimaryTimeComponents(context, match) {
        if (match[0].match(/^\s*\d{4}\s*$/)) {
            return null;
        }
        return super.extractPrimaryTimeComponents(context, match);
    }
}
NLTimeExpressionParser$1.default = NLTimeExpressionParser;

var NLCasualYearMonthDayParser$1 = {};

Object.defineProperty(NLCasualYearMonthDayParser$1, "__esModule", { value: true });
const constants_1$e = constants$2;
const pattern_1$1 = pattern;
const AbstractParserWithWordBoundary_1$h = AbstractParserWithWordBoundary;
const PATTERN$a = new RegExp(`([0-9]{4})[\\.\\/\\s]` +
    `(?:(${(0, pattern_1$1.matchAnyPattern)(constants_1$e.MONTH_DICTIONARY)})|([0-9]{1,2}))[\\.\\/\\s]` +
    `([0-9]{1,2})` +
    "(?=\\W|$)", "i");
const YEAR_NUMBER_GROUP = 1;
const MONTH_NAME_GROUP = 2;
const MONTH_NUMBER_GROUP = 3;
const DATE_NUMBER_GROUP = 4;
class NLCasualYearMonthDayParser extends AbstractParserWithWordBoundary_1$h.AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$a;
    }
    innerExtract(context, match) {
        const month = match[MONTH_NUMBER_GROUP]
            ? parseInt(match[MONTH_NUMBER_GROUP])
            : constants_1$e.MONTH_DICTIONARY[match[MONTH_NAME_GROUP].toLowerCase()];
        if (month < 1 || month > 12) {
            return null;
        }
        const year = parseInt(match[YEAR_NUMBER_GROUP]);
        const day = parseInt(match[DATE_NUMBER_GROUP]);
        return {
            day: day,
            month: month,
            year: year,
        };
    }
}
NLCasualYearMonthDayParser$1.default = NLCasualYearMonthDayParser;

var NLCasualDateTimeParser$1 = {};

var __importDefault$h = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(NLCasualDateTimeParser$1, "__esModule", { value: true });
const AbstractParserWithWordBoundary_1$g = AbstractParserWithWordBoundary;
const index_1 = dist;
const dayjs_1$d = dayjs;
const dayjs_2 = __importDefault$h(require$$0);
const DATE_GROUP = 1;
const TIME_OF_DAY_GROUP = 2;
class NLCasualDateTimeParser extends AbstractParserWithWordBoundary_1$g.AbstractParserWithWordBoundaryChecking {
    innerPattern(context) {
        return /(gisteren|morgen|van)(ochtend|middag|namiddag|avond|nacht)(?=\W|$)/i;
    }
    innerExtract(context, match) {
        const dateText = match[DATE_GROUP].toLowerCase();
        const timeText = match[TIME_OF_DAY_GROUP].toLowerCase();
        const component = context.createParsingComponents();
        const targetDate = (0, dayjs_2.default)(context.refDate);
        switch (dateText) {
            case "gisteren":
                (0, dayjs_1$d.assignSimilarDate)(component, targetDate.add(-1, "day"));
                break;
            case "van":
                (0, dayjs_1$d.assignSimilarDate)(component, targetDate);
                break;
            case "morgen":
                (0, dayjs_1$d.assignTheNextDay)(component, targetDate);
                break;
        }
        switch (timeText) {
            case "ochtend":
                component.imply("meridiem", index_1.Meridiem.AM);
                component.imply("hour", 6);
                break;
            case "middag":
                component.imply("meridiem", index_1.Meridiem.AM);
                component.imply("hour", 12);
                break;
            case "namiddag":
                component.imply("meridiem", index_1.Meridiem.PM);
                component.imply("hour", 15);
                break;
            case "avond":
                component.imply("meridiem", index_1.Meridiem.PM);
                component.imply("hour", 20);
                break;
        }
        return component;
    }
}
NLCasualDateTimeParser$1.default = NLCasualDateTimeParser;

var NLTimeUnitCasualRelativeFormatParser$1 = {};

Object.defineProperty(NLTimeUnitCasualRelativeFormatParser$1, "__esModule", { value: true });
const constants_1$d = constants$2;
const results_1$3 = results;
const AbstractParserWithWordBoundary_1$f = AbstractParserWithWordBoundary;
const timeunits_1$1 = timeunits;
const PATTERN$9 = new RegExp(`(deze|vorige|afgelopen|komende|over|\\+|-)\\s*(${constants_1$d.TIME_UNITS_PATTERN})(?=\\W|$)`, "i");
class NLTimeUnitCasualRelativeFormatParser extends AbstractParserWithWordBoundary_1$f.AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$9;
    }
    innerExtract(context, match) {
        const prefix = match[1].toLowerCase();
        let timeUnits = (0, constants_1$d.parseTimeUnits)(match[2]);
        switch (prefix) {
            case "vorige":
            case "afgelopen":
            case "-":
                timeUnits = (0, timeunits_1$1.reverseTimeUnits)(timeUnits);
                break;
        }
        return results_1$3.ParsingComponents.createRelativeFromReference(context.reference, timeUnits);
    }
}
NLTimeUnitCasualRelativeFormatParser$1.default = NLTimeUnitCasualRelativeFormatParser;

var NLRelativeDateFormatParser$1 = {};

var __importDefault$g = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(NLRelativeDateFormatParser$1, "__esModule", { value: true });
const constants_1$c = constants$2;
const results_1$2 = results;
const dayjs_1$c = __importDefault$g(require$$0);
const AbstractParserWithWordBoundary_1$e = AbstractParserWithWordBoundary;
const pattern_1 = pattern;
const PATTERN$8 = new RegExp(`(dit|deze|komende|volgend|volgende|afgelopen|vorige)\\s*(${(0, pattern_1.matchAnyPattern)(constants_1$c.TIME_UNIT_DICTIONARY)})(?=\\s*)` +
    "(?=\\W|$)", "i");
const MODIFIER_WORD_GROUP = 1;
const RELATIVE_WORD_GROUP = 2;
class NLRelativeDateFormatParser extends AbstractParserWithWordBoundary_1$e.AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$8;
    }
    innerExtract(context, match) {
        const modifier = match[MODIFIER_WORD_GROUP].toLowerCase();
        const unitWord = match[RELATIVE_WORD_GROUP].toLowerCase();
        const timeunit = constants_1$c.TIME_UNIT_DICTIONARY[unitWord];
        if (modifier == "volgend" || modifier == "volgende" || modifier == "komende") {
            const timeUnits = {};
            timeUnits[timeunit] = 1;
            return results_1$2.ParsingComponents.createRelativeFromReference(context.reference, timeUnits);
        }
        if (modifier == "afgelopen" || modifier == "vorige") {
            const timeUnits = {};
            timeUnits[timeunit] = -1;
            return results_1$2.ParsingComponents.createRelativeFromReference(context.reference, timeUnits);
        }
        const components = context.createParsingComponents();
        let date = (0, dayjs_1$c.default)(context.reference.instant);
        if (unitWord.match(/week/i)) {
            date = date.add(-date.get("d"), "d");
            components.imply("day", date.date());
            components.imply("month", date.month() + 1);
            components.imply("year", date.year());
        }
        else if (unitWord.match(/maand/i)) {
            date = date.add(-date.date() + 1, "d");
            components.imply("day", date.date());
            components.assign("year", date.year());
            components.assign("month", date.month() + 1);
        }
        else if (unitWord.match(/jaar/i)) {
            date = date.add(-date.date() + 1, "d");
            date = date.add(-date.month(), "month");
            components.imply("day", date.date());
            components.imply("month", date.month() + 1);
            components.assign("year", date.year());
        }
        return components;
    }
}
NLRelativeDateFormatParser$1.default = NLRelativeDateFormatParser;

var NLTimeUnitAgoFormatParser$1 = {};

Object.defineProperty(NLTimeUnitAgoFormatParser$1, "__esModule", { value: true });
const constants_1$b = constants$2;
const results_1$1 = results;
const AbstractParserWithWordBoundary_1$d = AbstractParserWithWordBoundary;
const timeunits_1 = timeunits;
const PATTERN$7 = new RegExp("" + "(" + constants_1$b.TIME_UNITS_PATTERN + ")" + "(?:geleden|voor|eerder)(?=(?:\\W|$))", "i");
const STRICT_PATTERN$1 = new RegExp("" + "(" + constants_1$b.TIME_UNITS_PATTERN + ")" + "geleden(?=(?:\\W|$))", "i");
class NLTimeUnitAgoFormatParser extends AbstractParserWithWordBoundary_1$d.AbstractParserWithWordBoundaryChecking {
    constructor(strictMode) {
        super();
        this.strictMode = strictMode;
    }
    innerPattern() {
        return this.strictMode ? STRICT_PATTERN$1 : PATTERN$7;
    }
    innerExtract(context, match) {
        const timeUnits = (0, constants_1$b.parseTimeUnits)(match[1]);
        const outputTimeUnits = (0, timeunits_1.reverseTimeUnits)(timeUnits);
        return results_1$1.ParsingComponents.createRelativeFromReference(context.reference, outputTimeUnits);
    }
}
NLTimeUnitAgoFormatParser$1.default = NLTimeUnitAgoFormatParser;

var NLTimeUnitLaterFormatParser$1 = {};

Object.defineProperty(NLTimeUnitLaterFormatParser$1, "__esModule", { value: true });
const constants_1$a = constants$2;
const results_1 = results;
const AbstractParserWithWordBoundary_1$c = AbstractParserWithWordBoundary;
const PATTERN$6 = new RegExp("" + "(" + constants_1$a.TIME_UNITS_PATTERN + ")" + "(later|na|vanaf nu|voortaan|vooruit|uit)" + "(?=(?:\\W|$))", "i");
const STRICT_PATTERN = new RegExp("" + "(" + constants_1$a.TIME_UNITS_PATTERN + ")" + "(later|vanaf nu)" + "(?=(?:\\W|$))", "i");
const GROUP_NUM_TIMEUNITS = 1;
class NLTimeUnitLaterFormatParser extends AbstractParserWithWordBoundary_1$c.AbstractParserWithWordBoundaryChecking {
    constructor(strictMode) {
        super();
        this.strictMode = strictMode;
    }
    innerPattern() {
        return this.strictMode ? STRICT_PATTERN : PATTERN$6;
    }
    innerExtract(context, match) {
        const fragments = (0, constants_1$a.parseTimeUnits)(match[GROUP_NUM_TIMEUNITS]);
        return results_1.ParsingComponents.createRelativeFromReference(context.reference, fragments);
    }
}
NLTimeUnitLaterFormatParser$1.default = NLTimeUnitLaterFormatParser;

(function (exports) {
var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConfiguration = exports.createCasualConfiguration = exports.parseDate = exports.parse = exports.strict = exports.casual = void 0;
const configurations_1 = configurations;
const chrono_1 = chrono$1;
const NLMergeDateRangeRefiner_1 = __importDefault(NLMergeDateRangeRefiner$1);
const NLMergeDateTimeRefiner_1 = __importDefault(NLMergeDateTimeRefiner$1);
const NLCasualDateParser_1 = __importDefault(NLCasualDateParser$1);
const NLCasualTimeParser_1 = __importDefault(NLCasualTimeParser$1);
const SlashDateFormatParser_1 = __importDefault(SlashDateFormatParser$1);
const NLTimeUnitWithinFormatParser_1 = __importDefault(NLTimeUnitWithinFormatParser$1);
const NLWeekdayParser_1 = __importDefault(NLWeekdayParser$1);
const NLMonthNameMiddleEndianParser_1 = __importDefault(NLMonthNameMiddleEndianParser$1);
const NLMonthNameParser_1 = __importDefault(NLMonthNameParser$1);
const NLSlashMonthFormatParser_1 = __importDefault(NLSlashMonthFormatParser$1);
const NLTimeExpressionParser_1 = __importDefault(NLTimeExpressionParser$1);
const NLCasualYearMonthDayParser_1 = __importDefault(NLCasualYearMonthDayParser$1);
const NLCasualDateTimeParser_1 = __importDefault(NLCasualDateTimeParser$1);
const NLTimeUnitCasualRelativeFormatParser_1 = __importDefault(NLTimeUnitCasualRelativeFormatParser$1);
const NLRelativeDateFormatParser_1 = __importDefault(NLRelativeDateFormatParser$1);
const NLTimeUnitAgoFormatParser_1 = __importDefault(NLTimeUnitAgoFormatParser$1);
const NLTimeUnitLaterFormatParser_1 = __importDefault(NLTimeUnitLaterFormatParser$1);
exports.casual = new chrono_1.Chrono(createCasualConfiguration());
exports.strict = new chrono_1.Chrono(createConfiguration(true));
function parse(text, ref, option) {
    return exports.casual.parse(text, ref, option);
}
exports.parse = parse;
function parseDate(text, ref, option) {
    return exports.casual.parseDate(text, ref, option);
}
exports.parseDate = parseDate;
function createCasualConfiguration(littleEndian = true) {
    const option = createConfiguration(false, littleEndian);
    option.parsers.unshift(new NLCasualDateParser_1.default());
    option.parsers.unshift(new NLCasualTimeParser_1.default());
    option.parsers.unshift(new NLCasualDateTimeParser_1.default());
    option.parsers.unshift(new NLMonthNameParser_1.default());
    option.parsers.unshift(new NLRelativeDateFormatParser_1.default());
    option.parsers.unshift(new NLTimeUnitCasualRelativeFormatParser_1.default());
    return option;
}
exports.createCasualConfiguration = createCasualConfiguration;
function createConfiguration(strictMode = true, littleEndian = true) {
    return (0, configurations_1.includeCommonConfiguration)({
        parsers: [
            new SlashDateFormatParser_1.default(littleEndian),
            new NLTimeUnitWithinFormatParser_1.default(),
            new NLMonthNameMiddleEndianParser_1.default(),
            new NLMonthNameParser_1.default(),
            new NLWeekdayParser_1.default(),
            new NLCasualYearMonthDayParser_1.default(),
            new NLSlashMonthFormatParser_1.default(),
            new NLTimeExpressionParser_1.default(strictMode),
            new NLTimeUnitAgoFormatParser_1.default(strictMode),
            new NLTimeUnitLaterFormatParser_1.default(strictMode),
        ],
        refiners: [new NLMergeDateTimeRefiner_1.default(), new NLMergeDateRangeRefiner_1.default()],
    }, strictMode);
}
exports.createConfiguration = createConfiguration;
}(nl));

var zh = {};

var hant = {};

var ZHHantCasualDateParser$1 = {};

var __importDefault$f = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(ZHHantCasualDateParser$1, "__esModule", { value: true });
const dayjs_1$b = __importDefault$f(require$$0);
const AbstractParserWithWordBoundary_1$b = AbstractParserWithWordBoundary;
const NOW_GROUP$1 = 1;
const DAY_GROUP_1$3 = 2;
const TIME_GROUP_1$1 = 3;
const TIME_GROUP_2$1 = 4;
const DAY_GROUP_3$3 = 5;
const TIME_GROUP_3$1 = 6;
class ZHHantCasualDateParser extends AbstractParserWithWordBoundary_1$b.AbstractParserWithWordBoundaryChecking {
    innerPattern(context) {
        return new RegExp("(而家|立(?:刻|即)|即刻)|" +
            "(今|明|前|大前|後|大後|聽|昨|尋|琴)(早|朝|晚)|" +
            "(上(?:午|晝)|朝(?:早)|早(?:上)|下(?:午|晝)|晏(?:晝)|晚(?:上)|夜(?:晚)?|中(?:午)|凌(?:晨))|" +
            "(今|明|前|大前|後|大後|聽|昨|尋|琴)(?:日|天)" +
            "(?:[\\s|,|，]*)" +
            "(?:(上(?:午|晝)|朝(?:早)|早(?:上)|下(?:午|晝)|晏(?:晝)|晚(?:上)|夜(?:晚)?|中(?:午)|凌(?:晨)))?", "i");
    }
    innerExtract(context, match) {
        const index = match.index;
        const result = context.createParsingResult(index, match[0]);
        const refMoment = (0, dayjs_1$b.default)(context.refDate);
        let startMoment = refMoment;
        if (match[NOW_GROUP$1]) {
            result.start.imply("hour", refMoment.hour());
            result.start.imply("minute", refMoment.minute());
            result.start.imply("second", refMoment.second());
            result.start.imply("millisecond", refMoment.millisecond());
        }
        else if (match[DAY_GROUP_1$3]) {
            const day1 = match[DAY_GROUP_1$3];
            const time1 = match[TIME_GROUP_1$1];
            if (day1 == "明" || day1 == "聽") {
                if (refMoment.hour() > 1) {
                    startMoment = startMoment.add(1, "day");
                }
            }
            else if (day1 == "昨" || day1 == "尋" || day1 == "琴") {
                startMoment = startMoment.add(-1, "day");
            }
            else if (day1 == "前") {
                startMoment = startMoment.add(-2, "day");
            }
            else if (day1 == "大前") {
                startMoment = startMoment.add(-3, "day");
            }
            else if (day1 == "後") {
                startMoment = startMoment.add(2, "day");
            }
            else if (day1 == "大後") {
                startMoment = startMoment.add(3, "day");
            }
            if (time1 == "早" || time1 == "朝") {
                result.start.imply("hour", 6);
            }
            else if (time1 == "晚") {
                result.start.imply("hour", 22);
                result.start.imply("meridiem", 1);
            }
        }
        else if (match[TIME_GROUP_2$1]) {
            const timeString2 = match[TIME_GROUP_2$1];
            const time2 = timeString2[0];
            if (time2 == "早" || time2 == "朝" || time2 == "上") {
                result.start.imply("hour", 6);
            }
            else if (time2 == "下" || time2 == "晏") {
                result.start.imply("hour", 15);
                result.start.imply("meridiem", 1);
            }
            else if (time2 == "中") {
                result.start.imply("hour", 12);
                result.start.imply("meridiem", 1);
            }
            else if (time2 == "夜" || time2 == "晚") {
                result.start.imply("hour", 22);
                result.start.imply("meridiem", 1);
            }
            else if (time2 == "凌") {
                result.start.imply("hour", 0);
            }
        }
        else if (match[DAY_GROUP_3$3]) {
            const day3 = match[DAY_GROUP_3$3];
            if (day3 == "明" || day3 == "聽") {
                if (refMoment.hour() > 1) {
                    startMoment = startMoment.add(1, "day");
                }
            }
            else if (day3 == "昨" || day3 == "尋" || day3 == "琴") {
                startMoment = startMoment.add(-1, "day");
            }
            else if (day3 == "前") {
                startMoment = startMoment.add(-2, "day");
            }
            else if (day3 == "大前") {
                startMoment = startMoment.add(-3, "day");
            }
            else if (day3 == "後") {
                startMoment = startMoment.add(2, "day");
            }
            else if (day3 == "大後") {
                startMoment = startMoment.add(3, "day");
            }
            const timeString3 = match[TIME_GROUP_3$1];
            if (timeString3) {
                const time3 = timeString3[0];
                if (time3 == "早" || time3 == "朝" || time3 == "上") {
                    result.start.imply("hour", 6);
                }
                else if (time3 == "下" || time3 == "晏") {
                    result.start.imply("hour", 15);
                    result.start.imply("meridiem", 1);
                }
                else if (time3 == "中") {
                    result.start.imply("hour", 12);
                    result.start.imply("meridiem", 1);
                }
                else if (time3 == "夜" || time3 == "晚") {
                    result.start.imply("hour", 22);
                    result.start.imply("meridiem", 1);
                }
                else if (time3 == "凌") {
                    result.start.imply("hour", 0);
                }
            }
        }
        result.start.assign("day", startMoment.date());
        result.start.assign("month", startMoment.month() + 1);
        result.start.assign("year", startMoment.year());
        return result;
    }
}
ZHHantCasualDateParser$1.default = ZHHantCasualDateParser;

var ZHHantDateParser$1 = {};

var constants$1 = {};

(function (exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.zhStringToYear = exports.zhStringToNumber = exports.WEEKDAY_OFFSET = exports.NUMBER = void 0;
exports.NUMBER = {
    "零": 0,
    "一": 1,
    "二": 2,
    "兩": 2,
    "三": 3,
    "四": 4,
    "五": 5,
    "六": 6,
    "七": 7,
    "八": 8,
    "九": 9,
    "十": 10,
    "廿": 20,
    "卅": 30,
};
exports.WEEKDAY_OFFSET = {
    "天": 0,
    "日": 0,
    "一": 1,
    "二": 2,
    "三": 3,
    "四": 4,
    "五": 5,
    "六": 6,
};
function zhStringToNumber(text) {
    let number = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === "十") {
            number = number === 0 ? exports.NUMBER[char] : number * exports.NUMBER[char];
        }
        else {
            number += exports.NUMBER[char];
        }
    }
    return number;
}
exports.zhStringToNumber = zhStringToNumber;
function zhStringToYear(text) {
    let string = "";
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        string = string + exports.NUMBER[char];
    }
    return parseInt(string);
}
exports.zhStringToYear = zhStringToYear;
}(constants$1));

var __importDefault$e = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(ZHHantDateParser$1, "__esModule", { value: true });
const dayjs_1$a = __importDefault$e(require$$0);
const AbstractParserWithWordBoundary_1$a = AbstractParserWithWordBoundary;
const constants_1$9 = constants$1;
const YEAR_GROUP$1 = 1;
const MONTH_GROUP$1 = 2;
const DAY_GROUP$1 = 3;
class ZHHantDateParser extends AbstractParserWithWordBoundary_1$a.AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return new RegExp("(" +
            "\\d{2,4}|" +
            "[" + Object.keys(constants_1$9.NUMBER).join("") + "]{4}|" +
            "[" + Object.keys(constants_1$9.NUMBER).join("") + "]{2}" +
            ")?" +
            "(?:\\s*)" +
            "(?:年)?" +
            "(?:[\\s|,|，]*)" +
            "(" +
            "\\d{1,2}|" +
            "[" + Object.keys(constants_1$9.NUMBER).join("") + "]{1,2}" +
            ")" +
            "(?:\\s*)" +
            "(?:月)" +
            "(?:\\s*)" +
            "(" +
            "\\d{1,2}|" +
            "[" + Object.keys(constants_1$9.NUMBER).join("") + "]{1,2}" +
            ")?" +
            "(?:\\s*)" +
            "(?:日|號)?");
    }
    innerExtract(context, match) {
        const startMoment = (0, dayjs_1$a.default)(context.refDate);
        const result = context.createParsingResult(match.index, match[0]);
        let month = parseInt(match[MONTH_GROUP$1]);
        if (isNaN(month))
            month = (0, constants_1$9.zhStringToNumber)(match[MONTH_GROUP$1]);
        result.start.assign("month", month);
        if (match[DAY_GROUP$1]) {
            let day = parseInt(match[DAY_GROUP$1]);
            if (isNaN(day))
                day = (0, constants_1$9.zhStringToNumber)(match[DAY_GROUP$1]);
            result.start.assign("day", day);
        }
        else {
            result.start.imply("day", startMoment.date());
        }
        if (match[YEAR_GROUP$1]) {
            let year = parseInt(match[YEAR_GROUP$1]);
            if (isNaN(year))
                year = (0, constants_1$9.zhStringToYear)(match[YEAR_GROUP$1]);
            result.start.assign("year", year);
        }
        else {
            result.start.imply("year", startMoment.year());
        }
        return result;
    }
}
ZHHantDateParser$1.default = ZHHantDateParser;

var ZHHantDeadlineFormatParser$1 = {};

var __importDefault$d = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(ZHHantDeadlineFormatParser$1, "__esModule", { value: true });
const dayjs_1$9 = __importDefault$d(require$$0);
const AbstractParserWithWordBoundary_1$9 = AbstractParserWithWordBoundary;
const constants_1$8 = constants$1;
const PATTERN$5 = new RegExp("(\\d+|[" +
    Object.keys(constants_1$8.NUMBER).join("") +
    "]+|半|幾)(?:\\s*)" +
    "(?:個)?" +
    "(秒(?:鐘)?|分鐘|小時|鐘|日|天|星期|禮拜|月|年)" +
    "(?:(?:之|過)?後|(?:之)?內)", "i");
const NUMBER_GROUP$1 = 1;
const UNIT_GROUP$1 = 2;
class ZHHantDeadlineFormatParser extends AbstractParserWithWordBoundary_1$9.AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$5;
    }
    innerExtract(context, match) {
        const result = context.createParsingResult(match.index, match[0]);
        let number = parseInt(match[NUMBER_GROUP$1]);
        if (isNaN(number)) {
            number = (0, constants_1$8.zhStringToNumber)(match[NUMBER_GROUP$1]);
        }
        if (isNaN(number)) {
            const string = match[NUMBER_GROUP$1];
            if (string === "幾") {
                number = 3;
            }
            else if (string === "半") {
                number = 0.5;
            }
            else {
                return null;
            }
        }
        let date = (0, dayjs_1$9.default)(context.refDate);
        const unit = match[UNIT_GROUP$1];
        const unitAbbr = unit[0];
        if (unitAbbr.match(/[日天星禮月年]/)) {
            if (unitAbbr == "日" || unitAbbr == "天") {
                date = date.add(number, "d");
            }
            else if (unitAbbr == "星" || unitAbbr == "禮") {
                date = date.add(number * 7, "d");
            }
            else if (unitAbbr == "月") {
                date = date.add(number, "month");
            }
            else if (unitAbbr == "年") {
                date = date.add(number, "year");
            }
            result.start.assign("year", date.year());
            result.start.assign("month", date.month() + 1);
            result.start.assign("day", date.date());
            return result;
        }
        if (unitAbbr == "秒") {
            date = date.add(number, "second");
        }
        else if (unitAbbr == "分") {
            date = date.add(number, "minute");
        }
        else if (unitAbbr == "小" || unitAbbr == "鐘") {
            date = date.add(number, "hour");
        }
        result.start.imply("year", date.year());
        result.start.imply("month", date.month() + 1);
        result.start.imply("day", date.date());
        result.start.assign("hour", date.hour());
        result.start.assign("minute", date.minute());
        result.start.assign("second", date.second());
        return result;
    }
}
ZHHantDeadlineFormatParser$1.default = ZHHantDeadlineFormatParser;

var ZHHantRelationWeekdayParser$1 = {};

var __importDefault$c = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(ZHHantRelationWeekdayParser$1, "__esModule", { value: true });
const dayjs_1$8 = __importDefault$c(require$$0);
const AbstractParserWithWordBoundary_1$8 = AbstractParserWithWordBoundary;
const constants_1$7 = constants$1;
const PATTERN$4 = new RegExp("(?<prefix>上|今|下|這|呢)(?:個)?(?:星期|禮拜|週)(?<weekday>" + Object.keys(constants_1$7.WEEKDAY_OFFSET).join("|") + ")");
class ZHHantRelationWeekdayParser extends AbstractParserWithWordBoundary_1$8.AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$4;
    }
    innerExtract(context, match) {
        const result = context.createParsingResult(match.index, match[0]);
        const dayOfWeek = match.groups.weekday;
        const offset = constants_1$7.WEEKDAY_OFFSET[dayOfWeek];
        if (offset === undefined)
            return null;
        let modifier = null;
        const prefix = match.groups.prefix;
        if (prefix == "上") {
            modifier = "last";
        }
        else if (prefix == "下") {
            modifier = "next";
        }
        else if (prefix == "今" || prefix == "這" || prefix == "呢") {
            modifier = "this";
        }
        let startMoment = (0, dayjs_1$8.default)(context.refDate);
        let startMomentFixed = false;
        const refOffset = startMoment.day();
        if (modifier == "last" || modifier == "past") {
            startMoment = startMoment.day(offset - 7);
            startMomentFixed = true;
        }
        else if (modifier == "next") {
            startMoment = startMoment.day(offset + 7);
            startMomentFixed = true;
        }
        else if (modifier == "this") {
            startMoment = startMoment.day(offset);
        }
        else {
            if (Math.abs(offset - 7 - refOffset) < Math.abs(offset - refOffset)) {
                startMoment = startMoment.day(offset - 7);
            }
            else if (Math.abs(offset + 7 - refOffset) < Math.abs(offset - refOffset)) {
                startMoment = startMoment.day(offset + 7);
            }
            else {
                startMoment = startMoment.day(offset);
            }
        }
        result.start.assign("weekday", offset);
        if (startMomentFixed) {
            result.start.assign("day", startMoment.date());
            result.start.assign("month", startMoment.month() + 1);
            result.start.assign("year", startMoment.year());
        }
        else {
            result.start.imply("day", startMoment.date());
            result.start.imply("month", startMoment.month() + 1);
            result.start.imply("year", startMoment.year());
        }
        return result;
    }
}
ZHHantRelationWeekdayParser$1.default = ZHHantRelationWeekdayParser;

var ZHHantTimeExpressionParser$1 = {};

var __importDefault$b = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(ZHHantTimeExpressionParser$1, "__esModule", { value: true });
const dayjs_1$7 = __importDefault$b(require$$0);
const AbstractParserWithWordBoundary_1$7 = AbstractParserWithWordBoundary;
const constants_1$6 = constants$1;
const FIRST_REG_PATTERN$1 = new RegExp("(?:由|從|自)?" +
    "(?:" +
    "(今|明|前|大前|後|大後|聽|昨|尋|琴)(早|朝|晚)|" +
    "(上(?:午|晝)|朝(?:早)|早(?:上)|下(?:午|晝)|晏(?:晝)|晚(?:上)|夜(?:晚)?|中(?:午)|凌(?:晨))|" +
    "(今|明|前|大前|後|大後|聽|昨|尋|琴)(?:日|天)" +
    "(?:[\\s,，]*)" +
    "(?:(上(?:午|晝)|朝(?:早)|早(?:上)|下(?:午|晝)|晏(?:晝)|晚(?:上)|夜(?:晚)?|中(?:午)|凌(?:晨)))?" +
    ")?" +
    "(?:[\\s,，]*)" +
    "(?:(\\d+|[" +
    Object.keys(constants_1$6.NUMBER).join("") +
    "]+)(?:\\s*)(?:點|時|:|：)" +
    "(?:\\s*)" +
    "(\\d+|半|正|整|[" +
    Object.keys(constants_1$6.NUMBER).join("") +
    "]+)?(?:\\s*)(?:分|:|：)?" +
    "(?:\\s*)" +
    "(\\d+|[" +
    Object.keys(constants_1$6.NUMBER).join("") +
    "]+)?(?:\\s*)(?:秒)?)" +
    "(?:\\s*(A.M.|P.M.|AM?|PM?))?", "i");
const SECOND_REG_PATTERN$1 = new RegExp("(?:^\\s*(?:到|至|\\-|\\–|\\~|\\〜)\\s*)" +
    "(?:" +
    "(今|明|前|大前|後|大後|聽|昨|尋|琴)(早|朝|晚)|" +
    "(上(?:午|晝)|朝(?:早)|早(?:上)|下(?:午|晝)|晏(?:晝)|晚(?:上)|夜(?:晚)?|中(?:午)|凌(?:晨))|" +
    "(今|明|前|大前|後|大後|聽|昨|尋|琴)(?:日|天)" +
    "(?:[\\s,，]*)" +
    "(?:(上(?:午|晝)|朝(?:早)|早(?:上)|下(?:午|晝)|晏(?:晝)|晚(?:上)|夜(?:晚)?|中(?:午)|凌(?:晨)))?" +
    ")?" +
    "(?:[\\s,，]*)" +
    "(?:(\\d+|[" +
    Object.keys(constants_1$6.NUMBER).join("") +
    "]+)(?:\\s*)(?:點|時|:|：)" +
    "(?:\\s*)" +
    "(\\d+|半|正|整|[" +
    Object.keys(constants_1$6.NUMBER).join("") +
    "]+)?(?:\\s*)(?:分|:|：)?" +
    "(?:\\s*)" +
    "(\\d+|[" +
    Object.keys(constants_1$6.NUMBER).join("") +
    "]+)?(?:\\s*)(?:秒)?)" +
    "(?:\\s*(A.M.|P.M.|AM?|PM?))?", "i");
const DAY_GROUP_1$2 = 1;
const ZH_AM_PM_HOUR_GROUP_1$1 = 2;
const ZH_AM_PM_HOUR_GROUP_2$1 = 3;
const DAY_GROUP_3$2 = 4;
const ZH_AM_PM_HOUR_GROUP_3$1 = 5;
const HOUR_GROUP$1 = 6;
const MINUTE_GROUP$1 = 7;
const SECOND_GROUP$1 = 8;
const AM_PM_HOUR_GROUP$1 = 9;
class ZHHantTimeExpressionParser extends AbstractParserWithWordBoundary_1$7.AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return FIRST_REG_PATTERN$1;
    }
    innerExtract(context, match) {
        if (match.index > 0 && context.text[match.index - 1].match(/\w/)) {
            return null;
        }
        const refMoment = (0, dayjs_1$7.default)(context.refDate);
        const result = context.createParsingResult(match.index, match[0]);
        const startMoment = refMoment.clone();
        if (match[DAY_GROUP_1$2]) {
            var day1 = match[DAY_GROUP_1$2];
            if (day1 == "明" || day1 == "聽") {
                if (refMoment.hour() > 1) {
                    startMoment.add(1, "day");
                }
            }
            else if (day1 == "昨" || day1 == "尋" || day1 == "琴") {
                startMoment.add(-1, "day");
            }
            else if (day1 == "前") {
                startMoment.add(-2, "day");
            }
            else if (day1 == "大前") {
                startMoment.add(-3, "day");
            }
            else if (day1 == "後") {
                startMoment.add(2, "day");
            }
            else if (day1 == "大後") {
                startMoment.add(3, "day");
            }
            result.start.assign("day", startMoment.date());
            result.start.assign("month", startMoment.month() + 1);
            result.start.assign("year", startMoment.year());
        }
        else if (match[DAY_GROUP_3$2]) {
            var day3 = match[DAY_GROUP_3$2];
            if (day3 == "明" || day3 == "聽") {
                startMoment.add(1, "day");
            }
            else if (day3 == "昨" || day3 == "尋" || day3 == "琴") {
                startMoment.add(-1, "day");
            }
            else if (day3 == "前") {
                startMoment.add(-2, "day");
            }
            else if (day3 == "大前") {
                startMoment.add(-3, "day");
            }
            else if (day3 == "後") {
                startMoment.add(2, "day");
            }
            else if (day3 == "大後") {
                startMoment.add(3, "day");
            }
            result.start.assign("day", startMoment.date());
            result.start.assign("month", startMoment.month() + 1);
            result.start.assign("year", startMoment.year());
        }
        else {
            result.start.imply("day", startMoment.date());
            result.start.imply("month", startMoment.month() + 1);
            result.start.imply("year", startMoment.year());
        }
        let hour = 0;
        let minute = 0;
        let meridiem = -1;
        if (match[SECOND_GROUP$1]) {
            var second = parseInt(match[SECOND_GROUP$1]);
            if (isNaN(second)) {
                second = (0, constants_1$6.zhStringToNumber)(match[SECOND_GROUP$1]);
            }
            if (second >= 60)
                return null;
            result.start.assign("second", second);
        }
        hour = parseInt(match[HOUR_GROUP$1]);
        if (isNaN(hour)) {
            hour = (0, constants_1$6.zhStringToNumber)(match[HOUR_GROUP$1]);
        }
        if (match[MINUTE_GROUP$1]) {
            if (match[MINUTE_GROUP$1] == "半") {
                minute = 30;
            }
            else if (match[MINUTE_GROUP$1] == "正" || match[MINUTE_GROUP$1] == "整") {
                minute = 0;
            }
            else {
                minute = parseInt(match[MINUTE_GROUP$1]);
                if (isNaN(minute)) {
                    minute = (0, constants_1$6.zhStringToNumber)(match[MINUTE_GROUP$1]);
                }
            }
        }
        else if (hour > 100) {
            minute = hour % 100;
            hour = Math.floor(hour / 100);
        }
        if (minute >= 60) {
            return null;
        }
        if (hour > 24) {
            return null;
        }
        if (hour >= 12) {
            meridiem = 1;
        }
        if (match[AM_PM_HOUR_GROUP$1]) {
            if (hour > 12)
                return null;
            var ampm = match[AM_PM_HOUR_GROUP$1][0].toLowerCase();
            if (ampm == "a") {
                meridiem = 0;
                if (hour == 12)
                    hour = 0;
            }
            if (ampm == "p") {
                meridiem = 1;
                if (hour != 12)
                    hour += 12;
            }
        }
        else if (match[ZH_AM_PM_HOUR_GROUP_1$1]) {
            var zhAMPMString1 = match[ZH_AM_PM_HOUR_GROUP_1$1];
            var zhAMPM1 = zhAMPMString1[0];
            if (zhAMPM1 == "朝" || zhAMPM1 == "早") {
                meridiem = 0;
                if (hour == 12)
                    hour = 0;
            }
            else if (zhAMPM1 == "晚") {
                meridiem = 1;
                if (hour != 12)
                    hour += 12;
            }
        }
        else if (match[ZH_AM_PM_HOUR_GROUP_2$1]) {
            var zhAMPMString2 = match[ZH_AM_PM_HOUR_GROUP_2$1];
            var zhAMPM2 = zhAMPMString2[0];
            if (zhAMPM2 == "上" || zhAMPM2 == "朝" || zhAMPM2 == "早" || zhAMPM2 == "凌") {
                meridiem = 0;
                if (hour == 12)
                    hour = 0;
            }
            else if (zhAMPM2 == "下" || zhAMPM2 == "晏" || zhAMPM2 == "晚") {
                meridiem = 1;
                if (hour != 12)
                    hour += 12;
            }
        }
        else if (match[ZH_AM_PM_HOUR_GROUP_3$1]) {
            var zhAMPMString3 = match[ZH_AM_PM_HOUR_GROUP_3$1];
            var zhAMPM3 = zhAMPMString3[0];
            if (zhAMPM3 == "上" || zhAMPM3 == "朝" || zhAMPM3 == "早" || zhAMPM3 == "凌") {
                meridiem = 0;
                if (hour == 12)
                    hour = 0;
            }
            else if (zhAMPM3 == "下" || zhAMPM3 == "晏" || zhAMPM3 == "晚") {
                meridiem = 1;
                if (hour != 12)
                    hour += 12;
            }
        }
        result.start.assign("hour", hour);
        result.start.assign("minute", minute);
        if (meridiem >= 0) {
            result.start.assign("meridiem", meridiem);
        }
        else {
            if (hour < 12) {
                result.start.imply("meridiem", 0);
            }
            else {
                result.start.imply("meridiem", 1);
            }
        }
        match = SECOND_REG_PATTERN$1.exec(context.text.substring(result.index + result.text.length));
        if (!match) {
            if (result.text.match(/^\d+$/)) {
                return null;
            }
            return result;
        }
        const endMoment = startMoment.clone();
        result.end = context.createParsingComponents();
        if (match[DAY_GROUP_1$2]) {
            var day1 = match[DAY_GROUP_1$2];
            if (day1 == "明" || day1 == "聽") {
                if (refMoment.hour() > 1) {
                    endMoment.add(1, "day");
                }
            }
            else if (day1 == "昨" || day1 == "尋" || day1 == "琴") {
                endMoment.add(-1, "day");
            }
            else if (day1 == "前") {
                endMoment.add(-2, "day");
            }
            else if (day1 == "大前") {
                endMoment.add(-3, "day");
            }
            else if (day1 == "後") {
                endMoment.add(2, "day");
            }
            else if (day1 == "大後") {
                endMoment.add(3, "day");
            }
            result.end.assign("day", endMoment.date());
            result.end.assign("month", endMoment.month() + 1);
            result.end.assign("year", endMoment.year());
        }
        else if (match[DAY_GROUP_3$2]) {
            var day3 = match[DAY_GROUP_3$2];
            if (day3 == "明" || day3 == "聽") {
                endMoment.add(1, "day");
            }
            else if (day3 == "昨" || day3 == "尋" || day3 == "琴") {
                endMoment.add(-1, "day");
            }
            else if (day3 == "前") {
                endMoment.add(-2, "day");
            }
            else if (day3 == "大前") {
                endMoment.add(-3, "day");
            }
            else if (day3 == "後") {
                endMoment.add(2, "day");
            }
            else if (day3 == "大後") {
                endMoment.add(3, "day");
            }
            result.end.assign("day", endMoment.date());
            result.end.assign("month", endMoment.month() + 1);
            result.end.assign("year", endMoment.year());
        }
        else {
            result.end.imply("day", endMoment.date());
            result.end.imply("month", endMoment.month() + 1);
            result.end.imply("year", endMoment.year());
        }
        hour = 0;
        minute = 0;
        meridiem = -1;
        if (match[SECOND_GROUP$1]) {
            var second = parseInt(match[SECOND_GROUP$1]);
            if (isNaN(second)) {
                second = (0, constants_1$6.zhStringToNumber)(match[SECOND_GROUP$1]);
            }
            if (second >= 60)
                return null;
            result.end.assign("second", second);
        }
        hour = parseInt(match[HOUR_GROUP$1]);
        if (isNaN(hour)) {
            hour = (0, constants_1$6.zhStringToNumber)(match[HOUR_GROUP$1]);
        }
        if (match[MINUTE_GROUP$1]) {
            if (match[MINUTE_GROUP$1] == "半") {
                minute = 30;
            }
            else if (match[MINUTE_GROUP$1] == "正" || match[MINUTE_GROUP$1] == "整") {
                minute = 0;
            }
            else {
                minute = parseInt(match[MINUTE_GROUP$1]);
                if (isNaN(minute)) {
                    minute = (0, constants_1$6.zhStringToNumber)(match[MINUTE_GROUP$1]);
                }
            }
        }
        else if (hour > 100) {
            minute = hour % 100;
            hour = Math.floor(hour / 100);
        }
        if (minute >= 60) {
            return null;
        }
        if (hour > 24) {
            return null;
        }
        if (hour >= 12) {
            meridiem = 1;
        }
        if (match[AM_PM_HOUR_GROUP$1]) {
            if (hour > 12)
                return null;
            var ampm = match[AM_PM_HOUR_GROUP$1][0].toLowerCase();
            if (ampm == "a") {
                meridiem = 0;
                if (hour == 12)
                    hour = 0;
            }
            if (ampm == "p") {
                meridiem = 1;
                if (hour != 12)
                    hour += 12;
            }
            if (!result.start.isCertain("meridiem")) {
                if (meridiem == 0) {
                    result.start.imply("meridiem", 0);
                    if (result.start.get("hour") == 12) {
                        result.start.assign("hour", 0);
                    }
                }
                else {
                    result.start.imply("meridiem", 1);
                    if (result.start.get("hour") != 12) {
                        result.start.assign("hour", result.start.get("hour") + 12);
                    }
                }
            }
        }
        else if (match[ZH_AM_PM_HOUR_GROUP_1$1]) {
            var zhAMPMString1 = match[ZH_AM_PM_HOUR_GROUP_1$1];
            var zhAMPM1 = zhAMPMString1[0];
            if (zhAMPM1 == "朝" || zhAMPM1 == "早") {
                meridiem = 0;
                if (hour == 12)
                    hour = 0;
            }
            else if (zhAMPM1 == "晚") {
                meridiem = 1;
                if (hour != 12)
                    hour += 12;
            }
        }
        else if (match[ZH_AM_PM_HOUR_GROUP_2$1]) {
            var zhAMPMString2 = match[ZH_AM_PM_HOUR_GROUP_2$1];
            var zhAMPM2 = zhAMPMString2[0];
            if (zhAMPM2 == "上" || zhAMPM2 == "朝" || zhAMPM2 == "早" || zhAMPM2 == "凌") {
                meridiem = 0;
                if (hour == 12)
                    hour = 0;
            }
            else if (zhAMPM2 == "下" || zhAMPM2 == "晏" || zhAMPM2 == "晚") {
                meridiem = 1;
                if (hour != 12)
                    hour += 12;
            }
        }
        else if (match[ZH_AM_PM_HOUR_GROUP_3$1]) {
            var zhAMPMString3 = match[ZH_AM_PM_HOUR_GROUP_3$1];
            var zhAMPM3 = zhAMPMString3[0];
            if (zhAMPM3 == "上" || zhAMPM3 == "朝" || zhAMPM3 == "早" || zhAMPM3 == "凌") {
                meridiem = 0;
                if (hour == 12)
                    hour = 0;
            }
            else if (zhAMPM3 == "下" || zhAMPM3 == "晏" || zhAMPM3 == "晚") {
                meridiem = 1;
                if (hour != 12)
                    hour += 12;
            }
        }
        result.text = result.text + match[0];
        result.end.assign("hour", hour);
        result.end.assign("minute", minute);
        if (meridiem >= 0) {
            result.end.assign("meridiem", meridiem);
        }
        else {
            const startAtPM = result.start.isCertain("meridiem") && result.start.get("meridiem") == 1;
            if (startAtPM && result.start.get("hour") > hour) {
                result.end.imply("meridiem", 0);
            }
            else if (hour > 12) {
                result.end.imply("meridiem", 1);
            }
        }
        if (result.end.date().getTime() < result.start.date().getTime()) {
            result.end.imply("day", result.end.get("day") + 1);
        }
        return result;
    }
}
ZHHantTimeExpressionParser$1.default = ZHHantTimeExpressionParser;

var ZHHantWeekdayParser$1 = {};

var __importDefault$a = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(ZHHantWeekdayParser$1, "__esModule", { value: true });
const dayjs_1$6 = __importDefault$a(require$$0);
const AbstractParserWithWordBoundary_1$6 = AbstractParserWithWordBoundary;
const constants_1$5 = constants$1;
const PATTERN$3 = new RegExp("(?:星期|禮拜|週)(?<weekday>" + Object.keys(constants_1$5.WEEKDAY_OFFSET).join("|") + ")");
class ZHHantWeekdayParser extends AbstractParserWithWordBoundary_1$6.AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$3;
    }
    innerExtract(context, match) {
        const result = context.createParsingResult(match.index, match[0]);
        const dayOfWeek = match.groups.weekday;
        const offset = constants_1$5.WEEKDAY_OFFSET[dayOfWeek];
        if (offset === undefined)
            return null;
        let startMoment = (0, dayjs_1$6.default)(context.refDate);
        const refOffset = startMoment.day();
        if (Math.abs(offset - 7 - refOffset) < Math.abs(offset - refOffset)) {
            startMoment = startMoment.day(offset - 7);
        }
        else if (Math.abs(offset + 7 - refOffset) < Math.abs(offset - refOffset)) {
            startMoment = startMoment.day(offset + 7);
        }
        else {
            startMoment = startMoment.day(offset);
        }
        result.start.assign("weekday", offset);
        {
            result.start.imply("day", startMoment.date());
            result.start.imply("month", startMoment.month() + 1);
            result.start.imply("year", startMoment.year());
        }
        return result;
    }
}
ZHHantWeekdayParser$1.default = ZHHantWeekdayParser;

var ZHHantMergeDateRangeRefiner$1 = {};

var __importDefault$9 = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(ZHHantMergeDateRangeRefiner$1, "__esModule", { value: true });
const AbstractMergeDateRangeRefiner_1$1 = __importDefault$9(AbstractMergeDateRangeRefiner$1);
class ZHHantMergeDateRangeRefiner extends AbstractMergeDateRangeRefiner_1$1.default {
    patternBetween() {
        return /^\s*(至|到|\-|\~|～|－|ー)\s*$/i;
    }
}
ZHHantMergeDateRangeRefiner$1.default = ZHHantMergeDateRangeRefiner;

var ZHHantMergeDateTimeRefiner$1 = {};

var __importDefault$8 = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(ZHHantMergeDateTimeRefiner$1, "__esModule", { value: true });
const AbstractMergeDateTimeRefiner_1$1 = __importDefault$8(AbstractMergeDateTimeRefiner);
class ZHHantMergeDateTimeRefiner extends AbstractMergeDateTimeRefiner_1$1.default {
    patternBetween() {
        return /^\s*$/i;
    }
}
ZHHantMergeDateTimeRefiner$1.default = ZHHantMergeDateTimeRefiner;

(function (exports) {
var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConfiguration = exports.createCasualConfiguration = exports.parseDate = exports.parse = exports.strict = exports.casual = exports.hant = void 0;
const chrono_1 = chrono$1;
const ExtractTimezoneOffsetRefiner_1 = __importDefault(ExtractTimezoneOffsetRefiner$1);
const configurations_1 = configurations;
const ZHHantCasualDateParser_1 = __importDefault(ZHHantCasualDateParser$1);
const ZHHantDateParser_1 = __importDefault(ZHHantDateParser$1);
const ZHHantDeadlineFormatParser_1 = __importDefault(ZHHantDeadlineFormatParser$1);
const ZHHantRelationWeekdayParser_1 = __importDefault(ZHHantRelationWeekdayParser$1);
const ZHHantTimeExpressionParser_1 = __importDefault(ZHHantTimeExpressionParser$1);
const ZHHantWeekdayParser_1 = __importDefault(ZHHantWeekdayParser$1);
const ZHHantMergeDateRangeRefiner_1 = __importDefault(ZHHantMergeDateRangeRefiner$1);
const ZHHantMergeDateTimeRefiner_1 = __importDefault(ZHHantMergeDateTimeRefiner$1);
exports.hant = new chrono_1.Chrono(createCasualConfiguration());
exports.casual = new chrono_1.Chrono(createCasualConfiguration());
exports.strict = new chrono_1.Chrono(createConfiguration());
function parse(text, ref, option) {
    return exports.casual.parse(text, ref, option);
}
exports.parse = parse;
function parseDate(text, ref, option) {
    return exports.casual.parseDate(text, ref, option);
}
exports.parseDate = parseDate;
function createCasualConfiguration() {
    const option = createConfiguration();
    option.parsers.unshift(new ZHHantCasualDateParser_1.default());
    return option;
}
exports.createCasualConfiguration = createCasualConfiguration;
function createConfiguration() {
    const configuration = (0, configurations_1.includeCommonConfiguration)({
        parsers: [
            new ZHHantDateParser_1.default(),
            new ZHHantRelationWeekdayParser_1.default(),
            new ZHHantWeekdayParser_1.default(),
            new ZHHantTimeExpressionParser_1.default(),
            new ZHHantDeadlineFormatParser_1.default(),
        ],
        refiners: [new ZHHantMergeDateRangeRefiner_1.default(), new ZHHantMergeDateTimeRefiner_1.default()],
    });
    configuration.refiners = configuration.refiners.filter((refiner) => !(refiner instanceof ExtractTimezoneOffsetRefiner_1.default));
    return configuration;
}
exports.createConfiguration = createConfiguration;
}(hant));

var hans = {};

var ZHHansCasualDateParser$1 = {};

var __importDefault$7 = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(ZHHansCasualDateParser$1, "__esModule", { value: true });
const dayjs_1$5 = __importDefault$7(require$$0);
const AbstractParserWithWordBoundary_1$5 = AbstractParserWithWordBoundary;
const NOW_GROUP = 1;
const DAY_GROUP_1$1 = 2;
const TIME_GROUP_1 = 3;
const TIME_GROUP_2 = 4;
const DAY_GROUP_3$1 = 5;
const TIME_GROUP_3 = 6;
class ZHHansCasualDateParser extends AbstractParserWithWordBoundary_1$5.AbstractParserWithWordBoundaryChecking {
    innerPattern(context) {
        return new RegExp("(现在|立(?:刻|即)|即刻)|" +
            "(今|明|前|大前|后|大后|昨)(早|晚)|" +
            "(上(?:午)|早(?:上)|下(?:午)|晚(?:上)|夜(?:晚)?|中(?:午)|凌(?:晨))|" +
            "(今|明|前|大前|后|大后|昨)(?:日|天)" +
            "(?:[\\s|,|，]*)" +
            "(?:(上(?:午)|早(?:上)|下(?:午)|晚(?:上)|夜(?:晚)?|中(?:午)|凌(?:晨)))?", "i");
    }
    innerExtract(context, match) {
        const index = match.index;
        const result = context.createParsingResult(index, match[0]);
        const refMoment = (0, dayjs_1$5.default)(context.refDate);
        let startMoment = refMoment;
        if (match[NOW_GROUP]) {
            result.start.imply("hour", refMoment.hour());
            result.start.imply("minute", refMoment.minute());
            result.start.imply("second", refMoment.second());
            result.start.imply("millisecond", refMoment.millisecond());
        }
        else if (match[DAY_GROUP_1$1]) {
            const day1 = match[DAY_GROUP_1$1];
            const time1 = match[TIME_GROUP_1];
            if (day1 == "明") {
                if (refMoment.hour() > 1) {
                    startMoment = startMoment.add(1, "day");
                }
            }
            else if (day1 == "昨") {
                startMoment = startMoment.add(-1, "day");
            }
            else if (day1 == "前") {
                startMoment = startMoment.add(-2, "day");
            }
            else if (day1 == "大前") {
                startMoment = startMoment.add(-3, "day");
            }
            else if (day1 == "后") {
                startMoment = startMoment.add(2, "day");
            }
            else if (day1 == "大后") {
                startMoment = startMoment.add(3, "day");
            }
            if (time1 == "早") {
                result.start.imply("hour", 6);
            }
            else if (time1 == "晚") {
                result.start.imply("hour", 22);
                result.start.imply("meridiem", 1);
            }
        }
        else if (match[TIME_GROUP_2]) {
            const timeString2 = match[TIME_GROUP_2];
            const time2 = timeString2[0];
            if (time2 == "早" || time2 == "上") {
                result.start.imply("hour", 6);
            }
            else if (time2 == "下") {
                result.start.imply("hour", 15);
                result.start.imply("meridiem", 1);
            }
            else if (time2 == "中") {
                result.start.imply("hour", 12);
                result.start.imply("meridiem", 1);
            }
            else if (time2 == "夜" || time2 == "晚") {
                result.start.imply("hour", 22);
                result.start.imply("meridiem", 1);
            }
            else if (time2 == "凌") {
                result.start.imply("hour", 0);
            }
        }
        else if (match[DAY_GROUP_3$1]) {
            const day3 = match[DAY_GROUP_3$1];
            if (day3 == "明") {
                if (refMoment.hour() > 1) {
                    startMoment = startMoment.add(1, "day");
                }
            }
            else if (day3 == "昨") {
                startMoment = startMoment.add(-1, "day");
            }
            else if (day3 == "前") {
                startMoment = startMoment.add(-2, "day");
            }
            else if (day3 == "大前") {
                startMoment = startMoment.add(-3, "day");
            }
            else if (day3 == "后") {
                startMoment = startMoment.add(2, "day");
            }
            else if (day3 == "大后") {
                startMoment = startMoment.add(3, "day");
            }
            const timeString3 = match[TIME_GROUP_3];
            if (timeString3) {
                const time3 = timeString3[0];
                if (time3 == "早" || time3 == "上") {
                    result.start.imply("hour", 6);
                }
                else if (time3 == "下") {
                    result.start.imply("hour", 15);
                    result.start.imply("meridiem", 1);
                }
                else if (time3 == "中") {
                    result.start.imply("hour", 12);
                    result.start.imply("meridiem", 1);
                }
                else if (time3 == "夜" || time3 == "晚") {
                    result.start.imply("hour", 22);
                    result.start.imply("meridiem", 1);
                }
                else if (time3 == "凌") {
                    result.start.imply("hour", 0);
                }
            }
        }
        result.start.assign("day", startMoment.date());
        result.start.assign("month", startMoment.month() + 1);
        result.start.assign("year", startMoment.year());
        return result;
    }
}
ZHHansCasualDateParser$1.default = ZHHansCasualDateParser;

var ZHHansDateParser$1 = {};

var constants = {};

(function (exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.zhStringToYear = exports.zhStringToNumber = exports.WEEKDAY_OFFSET = exports.NUMBER = void 0;
exports.NUMBER = {
    "零": 0,
    "〇": 0,
    "一": 1,
    "二": 2,
    "两": 2,
    "三": 3,
    "四": 4,
    "五": 5,
    "六": 6,
    "七": 7,
    "八": 8,
    "九": 9,
    "十": 10,
};
exports.WEEKDAY_OFFSET = {
    "天": 0,
    "日": 0,
    "一": 1,
    "二": 2,
    "三": 3,
    "四": 4,
    "五": 5,
    "六": 6,
};
function zhStringToNumber(text) {
    let number = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === "十") {
            number = number === 0 ? exports.NUMBER[char] : number * exports.NUMBER[char];
        }
        else {
            number += exports.NUMBER[char];
        }
    }
    return number;
}
exports.zhStringToNumber = zhStringToNumber;
function zhStringToYear(text) {
    let string = "";
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        string = string + exports.NUMBER[char];
    }
    return parseInt(string);
}
exports.zhStringToYear = zhStringToYear;
}(constants));

var __importDefault$6 = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(ZHHansDateParser$1, "__esModule", { value: true });
const dayjs_1$4 = __importDefault$6(require$$0);
const AbstractParserWithWordBoundary_1$4 = AbstractParserWithWordBoundary;
const constants_1$4 = constants;
const YEAR_GROUP = 1;
const MONTH_GROUP = 2;
const DAY_GROUP = 3;
class ZHHansDateParser extends AbstractParserWithWordBoundary_1$4.AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return new RegExp("(" +
            "\\d{2,4}|" +
            "[" +
            Object.keys(constants_1$4.NUMBER).join("") +
            "]{4}|" +
            "[" +
            Object.keys(constants_1$4.NUMBER).join("") +
            "]{2}" +
            ")?" +
            "(?:\\s*)" +
            "(?:年)?" +
            "(?:[\\s|,|，]*)" +
            "(" +
            "\\d{1,2}|" +
            "[" +
            Object.keys(constants_1$4.NUMBER).join("") +
            "]{1,3}" +
            ")" +
            "(?:\\s*)" +
            "(?:月)" +
            "(?:\\s*)" +
            "(" +
            "\\d{1,2}|" +
            "[" +
            Object.keys(constants_1$4.NUMBER).join("") +
            "]{1,3}" +
            ")?" +
            "(?:\\s*)" +
            "(?:日|号)?");
    }
    innerExtract(context, match) {
        const startMoment = (0, dayjs_1$4.default)(context.refDate);
        const result = context.createParsingResult(match.index, match[0]);
        let month = parseInt(match[MONTH_GROUP]);
        if (isNaN(month))
            month = (0, constants_1$4.zhStringToNumber)(match[MONTH_GROUP]);
        result.start.assign("month", month);
        if (match[DAY_GROUP]) {
            let day = parseInt(match[DAY_GROUP]);
            if (isNaN(day))
                day = (0, constants_1$4.zhStringToNumber)(match[DAY_GROUP]);
            result.start.assign("day", day);
        }
        else {
            result.start.imply("day", startMoment.date());
        }
        if (match[YEAR_GROUP]) {
            let year = parseInt(match[YEAR_GROUP]);
            if (isNaN(year))
                year = (0, constants_1$4.zhStringToYear)(match[YEAR_GROUP]);
            result.start.assign("year", year);
        }
        else {
            result.start.imply("year", startMoment.year());
        }
        return result;
    }
}
ZHHansDateParser$1.default = ZHHansDateParser;

var ZHHansDeadlineFormatParser$1 = {};

var __importDefault$5 = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(ZHHansDeadlineFormatParser$1, "__esModule", { value: true });
const dayjs_1$3 = __importDefault$5(require$$0);
const AbstractParserWithWordBoundary_1$3 = AbstractParserWithWordBoundary;
const constants_1$3 = constants;
const PATTERN$2 = new RegExp("(\\d+|[" +
    Object.keys(constants_1$3.NUMBER).join("") +
    "]+|半|几)(?:\\s*)" +
    "(?:个)?" +
    "(秒(?:钟)?|分钟|小时|钟|日|天|星期|礼拜|月|年)" +
    "(?:(?:之|过)?后|(?:之)?内)", "i");
const NUMBER_GROUP = 1;
const UNIT_GROUP = 2;
class ZHHansDeadlineFormatParser extends AbstractParserWithWordBoundary_1$3.AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$2;
    }
    innerExtract(context, match) {
        const result = context.createParsingResult(match.index, match[0]);
        let number = parseInt(match[NUMBER_GROUP]);
        if (isNaN(number)) {
            number = (0, constants_1$3.zhStringToNumber)(match[NUMBER_GROUP]);
        }
        if (isNaN(number)) {
            const string = match[NUMBER_GROUP];
            if (string === "几") {
                number = 3;
            }
            else if (string === "半") {
                number = 0.5;
            }
            else {
                return null;
            }
        }
        let date = (0, dayjs_1$3.default)(context.refDate);
        const unit = match[UNIT_GROUP];
        const unitAbbr = unit[0];
        if (unitAbbr.match(/[日天星礼月年]/)) {
            if (unitAbbr == "日" || unitAbbr == "天") {
                date = date.add(number, "d");
            }
            else if (unitAbbr == "星" || unitAbbr == "礼") {
                date = date.add(number * 7, "d");
            }
            else if (unitAbbr == "月") {
                date = date.add(number, "month");
            }
            else if (unitAbbr == "年") {
                date = date.add(number, "year");
            }
            result.start.assign("year", date.year());
            result.start.assign("month", date.month() + 1);
            result.start.assign("day", date.date());
            return result;
        }
        if (unitAbbr == "秒") {
            date = date.add(number, "second");
        }
        else if (unitAbbr == "分") {
            date = date.add(number, "minute");
        }
        else if (unitAbbr == "小" || unitAbbr == "钟") {
            date = date.add(number, "hour");
        }
        result.start.imply("year", date.year());
        result.start.imply("month", date.month() + 1);
        result.start.imply("day", date.date());
        result.start.assign("hour", date.hour());
        result.start.assign("minute", date.minute());
        result.start.assign("second", date.second());
        return result;
    }
}
ZHHansDeadlineFormatParser$1.default = ZHHansDeadlineFormatParser;

var ZHHansRelationWeekdayParser$1 = {};

var __importDefault$4 = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(ZHHansRelationWeekdayParser$1, "__esModule", { value: true });
const dayjs_1$2 = __importDefault$4(require$$0);
const AbstractParserWithWordBoundary_1$2 = AbstractParserWithWordBoundary;
const constants_1$2 = constants;
const PATTERN$1 = new RegExp("(?<prefix>上|下|这)(?:个)?(?:星期|礼拜|周)(?<weekday>" + Object.keys(constants_1$2.WEEKDAY_OFFSET).join("|") + ")");
class ZHHansRelationWeekdayParser extends AbstractParserWithWordBoundary_1$2.AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN$1;
    }
    innerExtract(context, match) {
        const result = context.createParsingResult(match.index, match[0]);
        const dayOfWeek = match.groups.weekday;
        const offset = constants_1$2.WEEKDAY_OFFSET[dayOfWeek];
        if (offset === undefined)
            return null;
        let modifier = null;
        const prefix = match.groups.prefix;
        if (prefix == "上") {
            modifier = "last";
        }
        else if (prefix == "下") {
            modifier = "next";
        }
        else if (prefix == "这") {
            modifier = "this";
        }
        let startMoment = (0, dayjs_1$2.default)(context.refDate);
        let startMomentFixed = false;
        const refOffset = startMoment.day();
        if (modifier == "last" || modifier == "past") {
            startMoment = startMoment.day(offset - 7);
            startMomentFixed = true;
        }
        else if (modifier == "next") {
            startMoment = startMoment.day(offset + 7);
            startMomentFixed = true;
        }
        else if (modifier == "this") {
            startMoment = startMoment.day(offset);
        }
        else {
            if (Math.abs(offset - 7 - refOffset) < Math.abs(offset - refOffset)) {
                startMoment = startMoment.day(offset - 7);
            }
            else if (Math.abs(offset + 7 - refOffset) < Math.abs(offset - refOffset)) {
                startMoment = startMoment.day(offset + 7);
            }
            else {
                startMoment = startMoment.day(offset);
            }
        }
        result.start.assign("weekday", offset);
        if (startMomentFixed) {
            result.start.assign("day", startMoment.date());
            result.start.assign("month", startMoment.month() + 1);
            result.start.assign("year", startMoment.year());
        }
        else {
            result.start.imply("day", startMoment.date());
            result.start.imply("month", startMoment.month() + 1);
            result.start.imply("year", startMoment.year());
        }
        return result;
    }
}
ZHHansRelationWeekdayParser$1.default = ZHHansRelationWeekdayParser;

var ZHHansTimeExpressionParser$1 = {};

var __importDefault$3 = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(ZHHansTimeExpressionParser$1, "__esModule", { value: true });
const dayjs_1$1 = __importDefault$3(require$$0);
const AbstractParserWithWordBoundary_1$1 = AbstractParserWithWordBoundary;
const constants_1$1 = constants;
const FIRST_REG_PATTERN = new RegExp("(?:从|自)?" +
    "(?:" +
    "(今|明|前|大前|后|大后|昨)(早|朝|晚)|" +
    "(上(?:午)|早(?:上)|下(?:午)|晚(?:上)|夜(?:晚)?|中(?:午)|凌(?:晨))|" +
    "(今|明|前|大前|后|大后|昨)(?:日|天)" +
    "(?:[\\s,，]*)" +
    "(?:(上(?:午)|早(?:上)|下(?:午)|晚(?:上)|夜(?:晚)?|中(?:午)|凌(?:晨)))?" +
    ")?" +
    "(?:[\\s,，]*)" +
    "(?:(\\d+|[" +
    Object.keys(constants_1$1.NUMBER).join("") +
    "]+)(?:\\s*)(?:点|时|:|：)" +
    "(?:\\s*)" +
    "(\\d+|半|正|整|[" +
    Object.keys(constants_1$1.NUMBER).join("") +
    "]+)?(?:\\s*)(?:分|:|：)?" +
    "(?:\\s*)" +
    "(\\d+|[" +
    Object.keys(constants_1$1.NUMBER).join("") +
    "]+)?(?:\\s*)(?:秒)?)" +
    "(?:\\s*(A.M.|P.M.|AM?|PM?))?", "i");
const SECOND_REG_PATTERN = new RegExp("(?:^\\s*(?:到|至|\\-|\\–|\\~|\\〜)\\s*)" +
    "(?:" +
    "(今|明|前|大前|后|大后|昨)(早|朝|晚)|" +
    "(上(?:午)|早(?:上)|下(?:午)|晚(?:上)|夜(?:晚)?|中(?:午)|凌(?:晨))|" +
    "(今|明|前|大前|后|大后|昨)(?:日|天)" +
    "(?:[\\s,，]*)" +
    "(?:(上(?:午)|早(?:上)|下(?:午)|晚(?:上)|夜(?:晚)?|中(?:午)|凌(?:晨)))?" +
    ")?" +
    "(?:[\\s,，]*)" +
    "(?:(\\d+|[" +
    Object.keys(constants_1$1.NUMBER).join("") +
    "]+)(?:\\s*)(?:点|时|:|：)" +
    "(?:\\s*)" +
    "(\\d+|半|正|整|[" +
    Object.keys(constants_1$1.NUMBER).join("") +
    "]+)?(?:\\s*)(?:分|:|：)?" +
    "(?:\\s*)" +
    "(\\d+|[" +
    Object.keys(constants_1$1.NUMBER).join("") +
    "]+)?(?:\\s*)(?:秒)?)" +
    "(?:\\s*(A.M.|P.M.|AM?|PM?))?", "i");
const DAY_GROUP_1 = 1;
const ZH_AM_PM_HOUR_GROUP_1 = 2;
const ZH_AM_PM_HOUR_GROUP_2 = 3;
const DAY_GROUP_3 = 4;
const ZH_AM_PM_HOUR_GROUP_3 = 5;
const HOUR_GROUP = 6;
const MINUTE_GROUP = 7;
const SECOND_GROUP = 8;
const AM_PM_HOUR_GROUP = 9;
class ZHHansTimeExpressionParser extends AbstractParserWithWordBoundary_1$1.AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return FIRST_REG_PATTERN;
    }
    innerExtract(context, match) {
        if (match.index > 0 && context.text[match.index - 1].match(/\w/)) {
            return null;
        }
        const refMoment = (0, dayjs_1$1.default)(context.refDate);
        const result = context.createParsingResult(match.index, match[0]);
        const startMoment = refMoment.clone();
        if (match[DAY_GROUP_1]) {
            const day1 = match[DAY_GROUP_1];
            if (day1 == "明") {
                if (refMoment.hour() > 1) {
                    startMoment.add(1, "day");
                }
            }
            else if (day1 == "昨") {
                startMoment.add(-1, "day");
            }
            else if (day1 == "前") {
                startMoment.add(-2, "day");
            }
            else if (day1 == "大前") {
                startMoment.add(-3, "day");
            }
            else if (day1 == "后") {
                startMoment.add(2, "day");
            }
            else if (day1 == "大后") {
                startMoment.add(3, "day");
            }
            result.start.assign("day", startMoment.date());
            result.start.assign("month", startMoment.month() + 1);
            result.start.assign("year", startMoment.year());
        }
        else if (match[DAY_GROUP_3]) {
            const day3 = match[DAY_GROUP_3];
            if (day3 == "明") {
                startMoment.add(1, "day");
            }
            else if (day3 == "昨") {
                startMoment.add(-1, "day");
            }
            else if (day3 == "前") {
                startMoment.add(-2, "day");
            }
            else if (day3 == "大前") {
                startMoment.add(-3, "day");
            }
            else if (day3 == "后") {
                startMoment.add(2, "day");
            }
            else if (day3 == "大后") {
                startMoment.add(3, "day");
            }
            result.start.assign("day", startMoment.date());
            result.start.assign("month", startMoment.month() + 1);
            result.start.assign("year", startMoment.year());
        }
        else {
            result.start.imply("day", startMoment.date());
            result.start.imply("month", startMoment.month() + 1);
            result.start.imply("year", startMoment.year());
        }
        let hour = 0;
        let minute = 0;
        let meridiem = -1;
        if (match[SECOND_GROUP]) {
            let second = parseInt(match[SECOND_GROUP]);
            if (isNaN(second)) {
                second = (0, constants_1$1.zhStringToNumber)(match[SECOND_GROUP]);
            }
            if (second >= 60)
                return null;
            result.start.assign("second", second);
        }
        hour = parseInt(match[HOUR_GROUP]);
        if (isNaN(hour)) {
            hour = (0, constants_1$1.zhStringToNumber)(match[HOUR_GROUP]);
        }
        if (match[MINUTE_GROUP]) {
            if (match[MINUTE_GROUP] == "半") {
                minute = 30;
            }
            else if (match[MINUTE_GROUP] == "正" || match[MINUTE_GROUP] == "整") {
                minute = 0;
            }
            else {
                minute = parseInt(match[MINUTE_GROUP]);
                if (isNaN(minute)) {
                    minute = (0, constants_1$1.zhStringToNumber)(match[MINUTE_GROUP]);
                }
            }
        }
        else if (hour > 100) {
            minute = hour % 100;
            hour = Math.floor(hour / 100);
        }
        if (minute >= 60) {
            return null;
        }
        if (hour > 24) {
            return null;
        }
        if (hour >= 12) {
            meridiem = 1;
        }
        if (match[AM_PM_HOUR_GROUP]) {
            if (hour > 12)
                return null;
            const ampm = match[AM_PM_HOUR_GROUP][0].toLowerCase();
            if (ampm == "a") {
                meridiem = 0;
                if (hour == 12)
                    hour = 0;
            }
            if (ampm == "p") {
                meridiem = 1;
                if (hour != 12)
                    hour += 12;
            }
        }
        else if (match[ZH_AM_PM_HOUR_GROUP_1]) {
            const zhAMPMString1 = match[ZH_AM_PM_HOUR_GROUP_1];
            const zhAMPM1 = zhAMPMString1[0];
            if (zhAMPM1 == "早") {
                meridiem = 0;
                if (hour == 12)
                    hour = 0;
            }
            else if (zhAMPM1 == "晚") {
                meridiem = 1;
                if (hour != 12)
                    hour += 12;
            }
        }
        else if (match[ZH_AM_PM_HOUR_GROUP_2]) {
            const zhAMPMString2 = match[ZH_AM_PM_HOUR_GROUP_2];
            const zhAMPM2 = zhAMPMString2[0];
            if (zhAMPM2 == "上" || zhAMPM2 == "早" || zhAMPM2 == "凌") {
                meridiem = 0;
                if (hour == 12)
                    hour = 0;
            }
            else if (zhAMPM2 == "下" || zhAMPM2 == "晚") {
                meridiem = 1;
                if (hour != 12)
                    hour += 12;
            }
        }
        else if (match[ZH_AM_PM_HOUR_GROUP_3]) {
            const zhAMPMString3 = match[ZH_AM_PM_HOUR_GROUP_3];
            const zhAMPM3 = zhAMPMString3[0];
            if (zhAMPM3 == "上" || zhAMPM3 == "早" || zhAMPM3 == "凌") {
                meridiem = 0;
                if (hour == 12)
                    hour = 0;
            }
            else if (zhAMPM3 == "下" || zhAMPM3 == "晚") {
                meridiem = 1;
                if (hour != 12)
                    hour += 12;
            }
        }
        result.start.assign("hour", hour);
        result.start.assign("minute", minute);
        if (meridiem >= 0) {
            result.start.assign("meridiem", meridiem);
        }
        else {
            if (hour < 12) {
                result.start.imply("meridiem", 0);
            }
            else {
                result.start.imply("meridiem", 1);
            }
        }
        match = SECOND_REG_PATTERN.exec(context.text.substring(result.index + result.text.length));
        if (!match) {
            if (result.text.match(/^\d+$/)) {
                return null;
            }
            return result;
        }
        const endMoment = startMoment.clone();
        result.end = context.createParsingComponents();
        if (match[DAY_GROUP_1]) {
            const day1 = match[DAY_GROUP_1];
            if (day1 == "明") {
                if (refMoment.hour() > 1) {
                    endMoment.add(1, "day");
                }
            }
            else if (day1 == "昨") {
                endMoment.add(-1, "day");
            }
            else if (day1 == "前") {
                endMoment.add(-2, "day");
            }
            else if (day1 == "大前") {
                endMoment.add(-3, "day");
            }
            else if (day1 == "后") {
                endMoment.add(2, "day");
            }
            else if (day1 == "大后") {
                endMoment.add(3, "day");
            }
            result.end.assign("day", endMoment.date());
            result.end.assign("month", endMoment.month() + 1);
            result.end.assign("year", endMoment.year());
        }
        else if (match[DAY_GROUP_3]) {
            const day3 = match[DAY_GROUP_3];
            if (day3 == "明") {
                endMoment.add(1, "day");
            }
            else if (day3 == "昨") {
                endMoment.add(-1, "day");
            }
            else if (day3 == "前") {
                endMoment.add(-2, "day");
            }
            else if (day3 == "大前") {
                endMoment.add(-3, "day");
            }
            else if (day3 == "后") {
                endMoment.add(2, "day");
            }
            else if (day3 == "大后") {
                endMoment.add(3, "day");
            }
            result.end.assign("day", endMoment.date());
            result.end.assign("month", endMoment.month() + 1);
            result.end.assign("year", endMoment.year());
        }
        else {
            result.end.imply("day", endMoment.date());
            result.end.imply("month", endMoment.month() + 1);
            result.end.imply("year", endMoment.year());
        }
        hour = 0;
        minute = 0;
        meridiem = -1;
        if (match[SECOND_GROUP]) {
            let second = parseInt(match[SECOND_GROUP]);
            if (isNaN(second)) {
                second = (0, constants_1$1.zhStringToNumber)(match[SECOND_GROUP]);
            }
            if (second >= 60)
                return null;
            result.end.assign("second", second);
        }
        hour = parseInt(match[HOUR_GROUP]);
        if (isNaN(hour)) {
            hour = (0, constants_1$1.zhStringToNumber)(match[HOUR_GROUP]);
        }
        if (match[MINUTE_GROUP]) {
            if (match[MINUTE_GROUP] == "半") {
                minute = 30;
            }
            else if (match[MINUTE_GROUP] == "正" || match[MINUTE_GROUP] == "整") {
                minute = 0;
            }
            else {
                minute = parseInt(match[MINUTE_GROUP]);
                if (isNaN(minute)) {
                    minute = (0, constants_1$1.zhStringToNumber)(match[MINUTE_GROUP]);
                }
            }
        }
        else if (hour > 100) {
            minute = hour % 100;
            hour = Math.floor(hour / 100);
        }
        if (minute >= 60) {
            return null;
        }
        if (hour > 24) {
            return null;
        }
        if (hour >= 12) {
            meridiem = 1;
        }
        if (match[AM_PM_HOUR_GROUP]) {
            if (hour > 12)
                return null;
            const ampm = match[AM_PM_HOUR_GROUP][0].toLowerCase();
            if (ampm == "a") {
                meridiem = 0;
                if (hour == 12)
                    hour = 0;
            }
            if (ampm == "p") {
                meridiem = 1;
                if (hour != 12)
                    hour += 12;
            }
            if (!result.start.isCertain("meridiem")) {
                if (meridiem == 0) {
                    result.start.imply("meridiem", 0);
                    if (result.start.get("hour") == 12) {
                        result.start.assign("hour", 0);
                    }
                }
                else {
                    result.start.imply("meridiem", 1);
                    if (result.start.get("hour") != 12) {
                        result.start.assign("hour", result.start.get("hour") + 12);
                    }
                }
            }
        }
        else if (match[ZH_AM_PM_HOUR_GROUP_1]) {
            const zhAMPMString1 = match[ZH_AM_PM_HOUR_GROUP_1];
            const zhAMPM1 = zhAMPMString1[0];
            if (zhAMPM1 == "早") {
                meridiem = 0;
                if (hour == 12)
                    hour = 0;
            }
            else if (zhAMPM1 == "晚") {
                meridiem = 1;
                if (hour != 12)
                    hour += 12;
            }
        }
        else if (match[ZH_AM_PM_HOUR_GROUP_2]) {
            const zhAMPMString2 = match[ZH_AM_PM_HOUR_GROUP_2];
            const zhAMPM2 = zhAMPMString2[0];
            if (zhAMPM2 == "上" || zhAMPM2 == "早" || zhAMPM2 == "凌") {
                meridiem = 0;
                if (hour == 12)
                    hour = 0;
            }
            else if (zhAMPM2 == "下" || zhAMPM2 == "晚") {
                meridiem = 1;
                if (hour != 12)
                    hour += 12;
            }
        }
        else if (match[ZH_AM_PM_HOUR_GROUP_3]) {
            const zhAMPMString3 = match[ZH_AM_PM_HOUR_GROUP_3];
            const zhAMPM3 = zhAMPMString3[0];
            if (zhAMPM3 == "上" || zhAMPM3 == "早" || zhAMPM3 == "凌") {
                meridiem = 0;
                if (hour == 12)
                    hour = 0;
            }
            else if (zhAMPM3 == "下" || zhAMPM3 == "晚") {
                meridiem = 1;
                if (hour != 12)
                    hour += 12;
            }
        }
        result.text = result.text + match[0];
        result.end.assign("hour", hour);
        result.end.assign("minute", minute);
        if (meridiem >= 0) {
            result.end.assign("meridiem", meridiem);
        }
        else {
            const startAtPM = result.start.isCertain("meridiem") && result.start.get("meridiem") == 1;
            if (startAtPM && result.start.get("hour") > hour) {
                result.end.imply("meridiem", 0);
            }
            else if (hour > 12) {
                result.end.imply("meridiem", 1);
            }
        }
        if (result.end.date().getTime() < result.start.date().getTime()) {
            result.end.imply("day", result.end.get("day") + 1);
        }
        return result;
    }
}
ZHHansTimeExpressionParser$1.default = ZHHansTimeExpressionParser;

var ZHHansWeekdayParser$1 = {};

var __importDefault$2 = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(ZHHansWeekdayParser$1, "__esModule", { value: true });
const dayjs_1 = __importDefault$2(require$$0);
const AbstractParserWithWordBoundary_1 = AbstractParserWithWordBoundary;
const constants_1 = constants;
const PATTERN = new RegExp("(?:星期|礼拜|周)(?<weekday>" + Object.keys(constants_1.WEEKDAY_OFFSET).join("|") + ")");
class ZHHansWeekdayParser extends AbstractParserWithWordBoundary_1.AbstractParserWithWordBoundaryChecking {
    innerPattern() {
        return PATTERN;
    }
    innerExtract(context, match) {
        const result = context.createParsingResult(match.index, match[0]);
        const dayOfWeek = match.groups.weekday;
        const offset = constants_1.WEEKDAY_OFFSET[dayOfWeek];
        if (offset === undefined)
            return null;
        let startMoment = (0, dayjs_1.default)(context.refDate);
        const refOffset = startMoment.day();
        if (Math.abs(offset - 7 - refOffset) < Math.abs(offset - refOffset)) {
            startMoment = startMoment.day(offset - 7);
        }
        else if (Math.abs(offset + 7 - refOffset) < Math.abs(offset - refOffset)) {
            startMoment = startMoment.day(offset + 7);
        }
        else {
            startMoment = startMoment.day(offset);
        }
        result.start.assign("weekday", offset);
        {
            result.start.imply("day", startMoment.date());
            result.start.imply("month", startMoment.month() + 1);
            result.start.imply("year", startMoment.year());
        }
        return result;
    }
}
ZHHansWeekdayParser$1.default = ZHHansWeekdayParser;

var ZHHansMergeDateRangeRefiner$1 = {};

var __importDefault$1 = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(ZHHansMergeDateRangeRefiner$1, "__esModule", { value: true });
const AbstractMergeDateRangeRefiner_1 = __importDefault$1(AbstractMergeDateRangeRefiner$1);
class ZHHansMergeDateRangeRefiner extends AbstractMergeDateRangeRefiner_1.default {
    patternBetween() {
        return /^\s*(至|到|-|~|～|－|ー)\s*$/i;
    }
}
ZHHansMergeDateRangeRefiner$1.default = ZHHansMergeDateRangeRefiner;

var ZHHansMergeDateTimeRefiner$1 = {};

var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(ZHHansMergeDateTimeRefiner$1, "__esModule", { value: true });
const AbstractMergeDateTimeRefiner_1 = __importDefault(AbstractMergeDateTimeRefiner);
class ZHHansMergeDateTimeRefiner extends AbstractMergeDateTimeRefiner_1.default {
    patternBetween() {
        return /^\s*$/i;
    }
}
ZHHansMergeDateTimeRefiner$1.default = ZHHansMergeDateTimeRefiner;

(function (exports) {
var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConfiguration = exports.createCasualConfiguration = exports.parseDate = exports.parse = exports.strict = exports.casual = exports.hans = void 0;
const chrono_1 = chrono$1;
const ExtractTimezoneOffsetRefiner_1 = __importDefault(ExtractTimezoneOffsetRefiner$1);
const configurations_1 = configurations;
const ZHHansCasualDateParser_1 = __importDefault(ZHHansCasualDateParser$1);
const ZHHansDateParser_1 = __importDefault(ZHHansDateParser$1);
const ZHHansDeadlineFormatParser_1 = __importDefault(ZHHansDeadlineFormatParser$1);
const ZHHansRelationWeekdayParser_1 = __importDefault(ZHHansRelationWeekdayParser$1);
const ZHHansTimeExpressionParser_1 = __importDefault(ZHHansTimeExpressionParser$1);
const ZHHansWeekdayParser_1 = __importDefault(ZHHansWeekdayParser$1);
const ZHHansMergeDateRangeRefiner_1 = __importDefault(ZHHansMergeDateRangeRefiner$1);
const ZHHansMergeDateTimeRefiner_1 = __importDefault(ZHHansMergeDateTimeRefiner$1);
exports.hans = new chrono_1.Chrono(createCasualConfiguration());
exports.casual = new chrono_1.Chrono(createCasualConfiguration());
exports.strict = new chrono_1.Chrono(createConfiguration());
function parse(text, ref, option) {
    return exports.casual.parse(text, ref, option);
}
exports.parse = parse;
function parseDate(text, ref, option) {
    return exports.casual.parseDate(text, ref, option);
}
exports.parseDate = parseDate;
function createCasualConfiguration() {
    const option = createConfiguration();
    option.parsers.unshift(new ZHHansCasualDateParser_1.default());
    return option;
}
exports.createCasualConfiguration = createCasualConfiguration;
function createConfiguration() {
    const configuration = (0, configurations_1.includeCommonConfiguration)({
        parsers: [
            new ZHHansDateParser_1.default(),
            new ZHHansRelationWeekdayParser_1.default(),
            new ZHHansWeekdayParser_1.default(),
            new ZHHansTimeExpressionParser_1.default(),
            new ZHHansDeadlineFormatParser_1.default(),
        ],
        refiners: [new ZHHansMergeDateRangeRefiner_1.default(), new ZHHansMergeDateTimeRefiner_1.default()],
    });
    configuration.refiners = configuration.refiners.filter((refiner) => !(refiner instanceof ExtractTimezoneOffsetRefiner_1.default));
    return configuration;
}
exports.createConfiguration = createConfiguration;
}(hans));

(function (exports) {
var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hans = void 0;
__exportStar(hant, exports);
var hans_1 = hans;
Object.defineProperty(exports, "hans", { enumerable: true, get: function () { return hans_1.hans; } });
}(zh));

(function (exports) {
var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (commonjsGlobal && commonjsGlobal.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDate = exports.parse = exports.casual = exports.strict = exports.zh = exports.nl = exports.pt = exports.ja = exports.fr = exports.de = exports.Meridiem = exports.Chrono = exports.en = void 0;
const en = __importStar(en$1);
exports.en = en;
const chrono_1 = chrono$1;
Object.defineProperty(exports, "Chrono", { enumerable: true, get: function () { return chrono_1.Chrono; } });
(function (Meridiem) {
    Meridiem[Meridiem["AM"] = 0] = "AM";
    Meridiem[Meridiem["PM"] = 1] = "PM";
})(exports.Meridiem || (exports.Meridiem = {}));
const de$1 = __importStar(de);
exports.de = de$1;
const fr$1 = __importStar(fr);
exports.fr = fr$1;
const ja$1 = __importStar(ja);
exports.ja = ja$1;
const pt$1 = __importStar(pt);
exports.pt = pt$1;
const nl$1 = __importStar(nl);
exports.nl = nl$1;
const zh$1 = __importStar(zh);
exports.zh = zh$1;
exports.strict = en.strict;
exports.casual = en.casual;
function parse(text, ref, option) {
    return exports.casual.parse(text, ref, option);
}
exports.parse = parse;
function parseDate(text, ref, option) {
    return exports.casual.parseDate(text, ref, option);
}
exports.parseDate = parseDate;
}(dist));

var chrono = /*@__PURE__*/getDefaultExportFromCjs(dist);

function getLocalizedChrono() {
    const locale = window.moment.locale();
    switch (locale) {
        case "en-gb":
            return new dist.Chrono(chrono.en.createCasualConfiguration(true));
        default:
            return new dist.Chrono(chrono.en.createCasualConfiguration(false));
    }
}
function getConfiguredChrono() {
    const localizedChrono = getLocalizedChrono();
    localizedChrono.parsers.push({
        pattern: () => {
            return /\bChristmas\b/i;
        },
        extract: () => {
            return {
                day: 25,
                month: 12,
            };
        },
    });
    localizedChrono.parsers.push({
        pattern: () => new RegExp(ORDINAL_NUMBER_PATTERN),
        extract: (_context, match) => {
            return {
                day: parseOrdinalNumberPattern(match[0]),
                month: window.moment().month(),
            };
        },
    });
    return localizedChrono;
}
class NLDParser {
    constructor() {
        this.chrono = getConfiguredChrono();
    }
    getParsedDate(selectedText, weekStartPreference) {
        var _a;
        const parser = this.chrono;
        const initialParse = parser.parse(selectedText);
        const weekdayIsCertain = (_a = initialParse[0]) === null || _a === void 0 ? void 0 : _a.start.isCertain("weekday");
        const weekStart = weekStartPreference === "locale-default"
            ? getLocaleWeekStart()
            : weekStartPreference;
        const locale = {
            weekStart: getWeekNumber(weekStart),
        };
        const thisDateMatch = selectedText.match(/this\s([\w]+)/i);
        const nextDateMatch = selectedText.match(/next\s([\w]+)/i);
        const lastDayOfMatch = selectedText.match(/(last day of|end of)\s*([^\n\r]*)/i);
        const midOf = selectedText.match(/mid\s([\w]+)/i);
        const referenceDate = weekdayIsCertain
            ? window.moment().weekday(0).toDate()
            : new Date();
        if (thisDateMatch && thisDateMatch[1] === "week") {
            return parser.parseDate(`this ${weekStart}`, referenceDate);
        }
        if (nextDateMatch && nextDateMatch[1] === "week") {
            return parser.parseDate(`next ${weekStart}`, referenceDate, {
                forwardDate: true,
            });
        }
        if (nextDateMatch && nextDateMatch[1] === "month") {
            const thisMonth = parser.parseDate("this month", new Date(), {
                forwardDate: true,
            });
            return parser.parseDate(selectedText, thisMonth, {
                forwardDate: true,
            });
        }
        if (nextDateMatch && nextDateMatch[1] === "year") {
            const thisYear = parser.parseDate("this year", new Date(), {
                forwardDate: true,
            });
            return parser.parseDate(selectedText, thisYear, {
                forwardDate: true,
            });
        }
        if (lastDayOfMatch) {
            const tempDate = parser.parse(lastDayOfMatch[2]);
            const year = tempDate[0].start.get("year");
            const month = tempDate[0].start.get("month");
            const lastDay = getLastDayOfMonth(year, month);
            return parser.parseDate(`${year}-${month}-${lastDay}`, new Date(), {
                forwardDate: true,
            });
        }
        if (midOf) {
            return parser.parseDate(`${midOf[1]} 15th`, new Date(), {
                forwardDate: true,
            });
        }
        return parser.parseDate(selectedText, referenceDate, { locale });
    }
}

const DEFAULT_SETTINGS = {
    autosuggestToggleLink: true,
    autocompleteTriggerPhrase: "@",
    isAutosuggestEnabled: true,
    format: "YYYY-MM-DD",
    timeFormat: "HH:mm",
    separator: " ",
    weekStart: "locale-default",
    modalToggleTime: false,
    modalToggleLink: false,
    modalMomentFormat: "YYYY-MM-DD HH:mm",
};
const weekdays = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
];
class NLDSettingsTab extends require$$0$1.PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    display() {
        const { containerEl } = this;
        const localizedWeekdays = window.moment.weekdays();
        const localeWeekStart = getLocaleWeekStart();
        containerEl.empty();
        containerEl.createEl("h2", {
            text: "Natural Language Dates",
        });
        containerEl.createEl("h3", {
            text: "Parser settings",
        });
        new require$$0$1.Setting(containerEl)
            .setName("Date format")
            .setDesc("Output format for parsed dates")
            .addMomentFormat((text) => text
            .setDefaultFormat("YYYY-MM-DD")
            .setValue(this.plugin.settings.format)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.format = value || "YYYY-MM-DD";
            yield this.plugin.saveSettings();
        })));
        new require$$0$1.Setting(containerEl)
            .setName("Week starts on")
            .setDesc("Which day to consider as the start of the week")
            .addDropdown((dropdown) => {
            dropdown.addOption("locale-default", `Locale default (${localeWeekStart})`);
            localizedWeekdays.forEach((day, i) => {
                dropdown.addOption(weekdays[i], day);
            });
            dropdown.setValue(this.plugin.settings.weekStart.toLowerCase());
            dropdown.onChange((value) => __awaiter(this, void 0, void 0, function* () {
                this.plugin.settings.weekStart = value;
                yield this.plugin.saveSettings();
            }));
        });
        containerEl.createEl("h3", {
            text: "Hotkey formatting settings",
        });
        new require$$0$1.Setting(containerEl)
            .setName("Time format")
            .setDesc("Format for the hotkeys that include the current time")
            .addMomentFormat((text) => text
            .setDefaultFormat("HH:mm")
            .setValue(this.plugin.settings.timeFormat)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.timeFormat = value || "HH:mm";
            yield this.plugin.saveSettings();
        })));
        new require$$0$1.Setting(containerEl)
            .setName("Separator")
            .setDesc("Separator between date and time for entries that have both")
            .addText((text) => text
            .setPlaceholder("Separator is empty")
            .setValue(this.plugin.settings.separator)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.separator = value;
            yield this.plugin.saveSettings();
        })));
        containerEl.createEl("h3", {
            text: "Date Autosuggest",
        });
        new require$$0$1.Setting(containerEl)
            .setName("Enable date autosuggest")
            .setDesc(`Input dates with natural language. Open the suggest menu with ${this.plugin.settings.autocompleteTriggerPhrase}`)
            .addToggle((toggle) => toggle
            .setValue(this.plugin.settings.isAutosuggestEnabled)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.isAutosuggestEnabled = value;
            yield this.plugin.saveSettings();
        })));
        new require$$0$1.Setting(containerEl)
            .setName("Add dates as link?")
            .setDesc("If enabled, dates created via autosuggest will be wrapped in [[wikilinks]]")
            .addToggle((toggle) => toggle
            .setValue(this.plugin.settings.autosuggestToggleLink)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.autosuggestToggleLink = value;
            yield this.plugin.saveSettings();
        })));
        new require$$0$1.Setting(containerEl)
            .setName("Trigger phrase")
            .setDesc("Character(s) that will cause the date autosuggest to open")
            .addMomentFormat((text) => text
            .setPlaceholder(DEFAULT_SETTINGS.autocompleteTriggerPhrase)
            .setValue(this.plugin.settings.autocompleteTriggerPhrase || "@")
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.autocompleteTriggerPhrase = value.trim();
            yield this.plugin.saveSettings();
        })));
    }
}

class DateSuggest extends require$$0$1.EditorSuggest {
    constructor(app, plugin) {
        super(app);
        this.app = app;
        this.plugin = plugin;
        // @ts-ignore
        this.scope.register(["Shift"], "Enter", (evt) => {
            // @ts-ignore
            this.suggestions.useSelectedItem(evt);
            return false;
        });
        if (this.plugin.settings.autosuggestToggleLink) {
            this.setInstructions([{ command: "Shift", purpose: "Keep text as alias" }]);
        }
    }
    getSuggestions(context) {
        const suggestions = this.getDateSuggestions(context);
        if (suggestions.length) {
            return suggestions;
        }
        // catch-all if there are no matches
        return [{ label: context.query }];
    }
    getDateSuggestions(context) {
        if (context.query.match(/^time/)) {
            return ["now", "+15 minutes", "+1 hour", "-15 minutes", "-1 hour"]
                .map((val) => ({ label: `time:${val}` }))
                .filter((item) => item.label.toLowerCase().startsWith(context.query));
        }
        if (context.query.match(/(next|last|this)/i)) {
            const reference = context.query.match(/(next|last|this)/i)[1];
            return [
                "week",
                "month",
                "year",
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
            ]
                .map((val) => ({ label: `${reference} ${val}` }))
                .filter((items) => items.label.toLowerCase().startsWith(context.query));
        }
        const relativeDate = context.query.match(/^in ([+-]?\d+)/i) || context.query.match(/^([+-]?\d+)/i);
        if (relativeDate) {
            const timeDelta = relativeDate[1];
            return [
                { label: `in ${timeDelta} minutes` },
                { label: `in ${timeDelta} hours` },
                { label: `in ${timeDelta} days` },
                { label: `in ${timeDelta} weeks` },
                { label: `in ${timeDelta} months` },
                { label: `${timeDelta} days ago` },
                { label: `${timeDelta} weeks ago` },
                { label: `${timeDelta} months ago` },
            ].filter((items) => items.label.toLowerCase().startsWith(context.query));
        }
        return [{ label: "Today" }, { label: "Yesterday" }, { label: "Tomorrow" }].filter((items) => items.label.toLowerCase().startsWith(context.query));
    }
    renderSuggestion(suggestion, el) {
        el.setText(suggestion.label);
    }
    selectSuggestion(suggestion, event) {
        const { editor } = this.context;
        const includeAlias = event.shiftKey;
        let dateStr = "";
        let makeIntoLink = this.plugin.settings.autosuggestToggleLink;
        if (suggestion.label.startsWith("time:")) {
            const timePart = suggestion.label.substring(5);
            dateStr = this.plugin.parseTime(timePart).formattedString;
            makeIntoLink = false;
        }
        else {
            dateStr = this.plugin.parseDate(suggestion.label).formattedString;
        }
        if (makeIntoLink) {
            dateStr = generateMarkdownLink(this.app, dateStr, includeAlias ? suggestion.label : undefined);
        }
        editor.replaceRange(dateStr, this.context.start, this.context.end);
    }
    onTrigger(cursor, editor, file) {
        var _a;
        if (!this.plugin.settings.isAutosuggestEnabled) {
            return null;
        }
        const triggerPhrase = this.plugin.settings.autocompleteTriggerPhrase;
        const startPos = ((_a = this.context) === null || _a === void 0 ? void 0 : _a.start) || {
            line: cursor.line,
            ch: cursor.ch - triggerPhrase.length,
        };
        if (!editor.getRange(startPos, cursor).startsWith(triggerPhrase)) {
            return null;
        }
        const precedingChar = editor.getRange({
            line: startPos.line,
            ch: startPos.ch - 1,
        }, startPos);
        // Short-circuit if `@` as a part of a word (e.g. part of an email address)
        if (precedingChar && /[`a-zA-Z0-9]/.test(precedingChar)) {
            return null;
        }
        return {
            start: startPos,
            end: cursor,
            query: editor.getRange(startPos, cursor).substring(triggerPhrase.length),
        };
    }
}

function getParseCommand(plugin, mode) {
    const { workspace } = plugin.app;
    const activeView = workspace.getActiveViewOfType(require$$0$1.MarkdownView);
    // The active view might not be a markdown view
    if (!activeView) {
        return;
    }
    const editor = activeView.editor;
    const cursor = editor.getCursor();
    const selectedText = getSelectedText(editor);
    const date = plugin.parseDate(selectedText);
    if (!date.moment.isValid()) {
        // Do nothing
        editor.setCursor({
            line: cursor.line,
            ch: cursor.ch,
        });
        return;
    }
    //mode == "replace"
    let newStr = `[[${date.formattedString}]]`;
    if (mode == "link") {
        newStr = `[${selectedText}](${date.formattedString})`;
    }
    else if (mode == "clean") {
        newStr = `${date.formattedString}`;
    }
    else if (mode == "time") {
        const time = plugin.parseTime(selectedText);
        newStr = `${time.formattedString}`;
    }
    editor.replaceSelection(newStr);
    adjustCursor(editor, cursor, newStr, selectedText);
    editor.focus();
}
function insertMomentCommand(plugin, date, format) {
    const { workspace } = plugin.app;
    const activeView = workspace.getActiveViewOfType(require$$0$1.MarkdownView);
    if (activeView) {
        // The active view might not be a markdown view
        const editor = activeView.editor;
        editor.replaceSelection(window.moment(date).format(format));
    }
}
function getNowCommand(plugin) {
    const format = `${plugin.settings.format}${plugin.settings.separator}${plugin.settings.timeFormat}`;
    const date = new Date();
    insertMomentCommand(plugin, date, format);
}
function getCurrentDateCommand(plugin) {
    const format = plugin.settings.format;
    const date = new Date();
    insertMomentCommand(plugin, date, format);
}
function getCurrentTimeCommand(plugin) {
    const format = plugin.settings.timeFormat;
    const date = new Date();
    insertMomentCommand(plugin, date, format);
}

class NaturalLanguageDates extends require$$0$1.Plugin {
    onload() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.loadSettings();
            this.addCommand({
                id: "nlp-dates",
                name: "Parse natural language date",
                callback: () => getParseCommand(this, "replace"),
                hotkeys: [],
            });
            this.addCommand({
                id: "nlp-dates-link",
                name: "Parse natural language date (as link)",
                callback: () => getParseCommand(this, "link"),
                hotkeys: [],
            });
            this.addCommand({
                id: "nlp-date-clean",
                name: "Parse natural language date (as plain text)",
                callback: () => getParseCommand(this, "clean"),
                hotkeys: [],
            });
            this.addCommand({
                id: "nlp-parse-time",
                name: "Parse natural language time",
                callback: () => getParseCommand(this, "time"),
                hotkeys: [],
            });
            this.addCommand({
                id: "nlp-now",
                name: "Insert the current date and time",
                callback: () => getNowCommand(this),
                hotkeys: [],
            });
            this.addCommand({
                id: "nlp-today",
                name: "Insert the current date",
                callback: () => getCurrentDateCommand(this),
                hotkeys: [],
            });
            this.addCommand({
                id: "nlp-time",
                name: "Insert the current time",
                callback: () => getCurrentTimeCommand(this),
                hotkeys: [],
            });
            this.addCommand({
                id: "nlp-picker",
                name: "Date picker",
                checkCallback: (checking) => {
                    if (checking) {
                        return !!this.app.workspace.getActiveViewOfType(require$$0$1.MarkdownView);
                    }
                    new DatePickerModal(this.app, this).open();
                },
                hotkeys: [],
            });
            this.addSettingTab(new NLDSettingsTab(this.app, this));
            this.registerObsidianProtocolHandler("nldates", this.actionHandler.bind(this));
            this.registerEditorSuggest(new DateSuggest(this.app, this));
            this.app.workspace.onLayoutReady(() => {
                // initialize the parser when layout is ready so that the correct locale is used
                this.parser = new NLDParser();
            });
        });
    }
    onunload() {
        console.log("Unloading natural language date parser plugin");
    }
    loadSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            this.settings = Object.assign({}, DEFAULT_SETTINGS, yield this.loadData());
        });
    }
    saveSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.saveData(this.settings);
        });
    }
    /*
      @param dateString: A string that contains a date in natural language, e.g. today, tomorrow, next week
      @param format: A string that contains the formatting string for a Moment
      @returns NLDResult: An object containing the date, a cloned Moment and the formatted string.
    */
    parse(dateString, format) {
        const date = this.parser.getParsedDate(dateString, this.settings.weekStart);
        const formattedString = getFormattedDate(date, format);
        if (formattedString === "Invalid date") {
            console.debug("Input date " + dateString + " can't be parsed by nldates");
        }
        return {
            formattedString,
            date,
            moment: window.moment(date),
        };
    }
    /*
      @param dateString: A string that contains a date in natural language, e.g. today, tomorrow, next week
      @returns NLDResult: An object containing the date, a cloned Moment and the formatted string.
    */
    parseDate(dateString) {
        return this.parse(dateString, this.settings.format);
    }
    parseTime(dateString) {
        return this.parse(dateString, this.settings.timeFormat);
    }
    actionHandler(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { workspace } = this.app;
            const date = this.parseDate(params.day);
            const newPane = parseTruthy(params.newPane || "yes");
            if (date.moment.isValid()) {
                const dailyNote = yield getOrCreateDailyNote(date.moment);
                workspace.getLeaf(newPane).openFile(dailyNote);
            }
        });
    }
}

module.exports = NaturalLanguageDates;


/* nosourcemap */