"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/obsidian-daily-notes-interface/dist/main.js
var require_main = __commonJS({
  "node_modules/obsidian-daily-notes-interface/dist/main.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var obsidian = require("obsidian");
    var DEFAULT_DAILY_NOTE_FORMAT = "YYYY-MM-DD";
    var DEFAULT_WEEKLY_NOTE_FORMAT = "gggg-[W]ww";
    var DEFAULT_MONTHLY_NOTE_FORMAT = "YYYY-MM";
    var DEFAULT_QUARTERLY_NOTE_FORMAT = "YYYY-[Q]Q";
    var DEFAULT_YEARLY_NOTE_FORMAT = "YYYY";
    function shouldUsePeriodicNotesSettings(periodicity) {
      var _a, _b;
      const periodicNotes = window.app.plugins.getPlugin("periodic-notes");
      return periodicNotes && ((_b = (_a = periodicNotes.settings) == null ? void 0 : _a[periodicity]) == null ? void 0 : _b.enabled);
    }
    function getDailyNoteSettings2() {
      var _a, _b, _c, _d;
      try {
        const { internalPlugins, plugins } = window.app;
        if (shouldUsePeriodicNotesSettings("daily")) {
          const { format: format2, folder: folder2, template: template2 } = ((_b = (_a = plugins.getPlugin("periodic-notes")) == null ? void 0 : _a.settings) == null ? void 0 : _b.daily) || {};
          return {
            format: format2 || DEFAULT_DAILY_NOTE_FORMAT,
            folder: (folder2 == null ? void 0 : folder2.trim()) || "",
            template: (template2 == null ? void 0 : template2.trim()) || ""
          };
        }
        const { folder, format, template } = ((_d = (_c = internalPlugins.getPluginById("daily-notes")) == null ? void 0 : _c.instance) == null ? void 0 : _d.options) || {};
        return {
          format: format || DEFAULT_DAILY_NOTE_FORMAT,
          folder: (folder == null ? void 0 : folder.trim()) || "",
          template: (template == null ? void 0 : template.trim()) || ""
        };
      } catch (err) {
        console.info("No custom daily note settings found!", err);
      }
    }
    function getWeeklyNoteSettings() {
      var _a, _b, _c, _d, _e, _f, _g;
      try {
        const pluginManager = window.app.plugins;
        const calendarSettings = (_a = pluginManager.getPlugin("calendar")) == null ? void 0 : _a.options;
        const periodicNotesSettings = (_c = (_b = pluginManager.getPlugin("periodic-notes")) == null ? void 0 : _b.settings) == null ? void 0 : _c.weekly;
        if (shouldUsePeriodicNotesSettings("weekly")) {
          return {
            format: periodicNotesSettings.format || DEFAULT_WEEKLY_NOTE_FORMAT,
            folder: ((_d = periodicNotesSettings.folder) == null ? void 0 : _d.trim()) || "",
            template: ((_e = periodicNotesSettings.template) == null ? void 0 : _e.trim()) || ""
          };
        }
        const settings = calendarSettings || {};
        return {
          format: settings.weeklyNoteFormat || DEFAULT_WEEKLY_NOTE_FORMAT,
          folder: ((_f = settings.weeklyNoteFolder) == null ? void 0 : _f.trim()) || "",
          template: ((_g = settings.weeklyNoteTemplate) == null ? void 0 : _g.trim()) || ""
        };
      } catch (err) {
        console.info("No custom weekly note settings found!", err);
      }
    }
    function getMonthlyNoteSettings() {
      var _a, _b, _c, _d;
      const pluginManager = window.app.plugins;
      try {
        const settings = shouldUsePeriodicNotesSettings("monthly") && ((_b = (_a = pluginManager.getPlugin("periodic-notes")) == null ? void 0 : _a.settings) == null ? void 0 : _b.monthly) || {};
        return {
          format: settings.format || DEFAULT_MONTHLY_NOTE_FORMAT,
          folder: ((_c = settings.folder) == null ? void 0 : _c.trim()) || "",
          template: ((_d = settings.template) == null ? void 0 : _d.trim()) || ""
        };
      } catch (err) {
        console.info("No custom monthly note settings found!", err);
      }
    }
    function getQuarterlyNoteSettings() {
      var _a, _b, _c, _d;
      const pluginManager = window.app.plugins;
      try {
        const settings = shouldUsePeriodicNotesSettings("quarterly") && ((_b = (_a = pluginManager.getPlugin("periodic-notes")) == null ? void 0 : _a.settings) == null ? void 0 : _b.quarterly) || {};
        return {
          format: settings.format || DEFAULT_QUARTERLY_NOTE_FORMAT,
          folder: ((_c = settings.folder) == null ? void 0 : _c.trim()) || "",
          template: ((_d = settings.template) == null ? void 0 : _d.trim()) || ""
        };
      } catch (err) {
        console.info("No custom quarterly note settings found!", err);
      }
    }
    function getYearlyNoteSettings() {
      var _a, _b, _c, _d;
      const pluginManager = window.app.plugins;
      try {
        const settings = shouldUsePeriodicNotesSettings("yearly") && ((_b = (_a = pluginManager.getPlugin("periodic-notes")) == null ? void 0 : _a.settings) == null ? void 0 : _b.yearly) || {};
        return {
          format: settings.format || DEFAULT_YEARLY_NOTE_FORMAT,
          folder: ((_c = settings.folder) == null ? void 0 : _c.trim()) || "",
          template: ((_d = settings.template) == null ? void 0 : _d.trim()) || ""
        };
      } catch (err) {
        console.info("No custom yearly note settings found!", err);
      }
    }
    function join(...partSegments) {
      let parts = [];
      for (let i = 0, l = partSegments.length; i < l; i++) {
        parts = parts.concat(partSegments[i].split("/"));
      }
      const newParts = [];
      for (let i = 0, l = parts.length; i < l; i++) {
        const part = parts[i];
        if (!part || part === ".")
          continue;
        else
          newParts.push(part);
      }
      if (parts[0] === "")
        newParts.unshift("");
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
      dirs.pop();
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
        const IFoldInfo = window.app.foldManager.load(templateFile);
        return [contents, IFoldInfo];
      } catch (err) {
        console.error(`Failed to read the daily note template '${templatePath}'`, err);
        new obsidian.Notice("Failed to read the daily note template");
        return ["", null];
      }
    }
    function getDateUID(date, granularity = "day") {
      const ts = date.clone().startOf(granularity).format();
      return `${granularity}-${ts}`;
    }
    function removeEscapedCharacters(format) {
      return format.replace(/\[[^\]]*\]/g, "");
    }
    function isFormatAmbiguous(format, granularity) {
      if (granularity === "week") {
        const cleanFormat = removeEscapedCharacters(format);
        return /w{1,2}/i.test(cleanFormat) && (/M{1,4}/.test(cleanFormat) || /D{1,4}/.test(cleanFormat));
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
        day: getDailyNoteSettings2,
        week: getWeeklyNoteSettings,
        month: getMonthlyNoteSettings,
        quarter: getQuarterlyNoteSettings,
        year: getYearlyNoteSettings
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
            return window.moment(
              filename,
              // If format contains week, remove day & month formatting
              format.replace(/M{1,4}/g, "").replace(/D{1,4}/g, ""),
              false
            );
          }
        }
      }
      return noteDate;
    }
    var DailyNotesFolderMissingError = class extends Error {
    };
    async function createDailyNote(date) {
      const app = window.app;
      const { vault } = app;
      const moment2 = window.moment;
      const { template, format, folder } = getDailyNoteSettings2();
      const [templateContents, IFoldInfo] = await getTemplateInfo(template);
      const filename = date.format(format);
      const normalizedPath = await getNotePath(folder, filename);
      try {
        const createdFile = await vault.create(normalizedPath, templateContents.replace(/{{\s*date\s*}}/gi, filename).replace(/{{\s*time\s*}}/gi, moment2().format("HH:mm")).replace(/{{\s*title\s*}}/gi, filename).replace(/{{\s*(date|time)\s*(([+-]\d+)([yqmwdhs]))?\s*(:.+?)?}}/gi, (_, _timeOrDate, calc, timeDelta, unit, momentFormat) => {
          const now = moment2();
          const currentDate = date.clone().set({
            hour: now.get("hour"),
            minute: now.get("minute"),
            second: now.get("second")
          });
          if (calc) {
            currentDate.add(parseInt(timeDelta, 10), unit);
          }
          if (momentFormat) {
            return currentDate.format(momentFormat.substring(1).trim());
          }
          return currentDate.format(format);
        }).replace(/{{\s*yesterday\s*}}/gi, date.clone().subtract(1, "day").format(format)).replace(/{{\s*tomorrow\s*}}/gi, date.clone().add(1, "d").format(format)));
        app.foldManager.save(createdFile, IFoldInfo);
        return createdFile;
      } catch (err) {
        console.error(`Failed to create file: '${normalizedPath}'`, err);
        new obsidian.Notice("Unable to create new file.");
      }
    }
    function getDailyNote(date, dailyNotes) {
      var _a;
      return (_a = dailyNotes[getDateUID(date, "day")]) != null ? _a : null;
    }
    function getAllDailyNotes() {
      const { vault } = window.app;
      const { folder } = getDailyNoteSettings2();
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
    var WeeklyNotesFolderMissingError = class extends Error {
    };
    function getDaysOfWeek() {
      const { moment: moment2 } = window;
      let weekStart = moment2.localeData()._week.dow;
      const daysOfWeek = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday"
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
        const createdFile = await vault.create(normalizedPath, templateContents.replace(/{{\s*(date|time)\s*(([+-]\d+)([yqmwdhs]))?\s*(:.+?)?}}/gi, (_, _timeOrDate, calc, timeDelta, unit, momentFormat) => {
          const now = window.moment();
          const currentDate = date.clone().set({
            hour: now.get("hour"),
            minute: now.get("minute"),
            second: now.get("second")
          });
          if (calc) {
            currentDate.add(parseInt(timeDelta, 10), unit);
          }
          if (momentFormat) {
            return currentDate.format(momentFormat.substring(1).trim());
          }
          return currentDate.format(format);
        }).replace(/{{\s*title\s*}}/gi, filename).replace(/{{\s*time\s*}}/gi, window.moment().format("HH:mm")).replace(/{{\s*(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\s*:(.*?)}}/gi, (_, dayOfWeek, momentFormat) => {
          const day = getDayOfWeekNumericalValue(dayOfWeek);
          return date.weekday(day).format(momentFormat.trim());
        }));
        window.app.foldManager.save(createdFile, IFoldInfo);
        return createdFile;
      } catch (err) {
        console.error(`Failed to create file: '${normalizedPath}'`, err);
        new obsidian.Notice("Unable to create new file.");
      }
    }
    function getWeeklyNote(date, weeklyNotes) {
      var _a;
      return (_a = weeklyNotes[getDateUID(date, "week")]) != null ? _a : null;
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
    var MonthlyNotesFolderMissingError = class extends Error {
    };
    async function createMonthlyNote(date) {
      const { vault } = window.app;
      const { template, format, folder } = getMonthlyNoteSettings();
      const [templateContents, IFoldInfo] = await getTemplateInfo(template);
      const filename = date.format(format);
      const normalizedPath = await getNotePath(folder, filename);
      try {
        const createdFile = await vault.create(normalizedPath, templateContents.replace(/{{\s*(date|time)\s*(([+-]\d+)([yqmwdhs]))?\s*(:.+?)?}}/gi, (_, _timeOrDate, calc, timeDelta, unit, momentFormat) => {
          const now = window.moment();
          const currentDate = date.clone().set({
            hour: now.get("hour"),
            minute: now.get("minute"),
            second: now.get("second")
          });
          if (calc) {
            currentDate.add(parseInt(timeDelta, 10), unit);
          }
          if (momentFormat) {
            return currentDate.format(momentFormat.substring(1).trim());
          }
          return currentDate.format(format);
        }).replace(/{{\s*date\s*}}/gi, filename).replace(/{{\s*time\s*}}/gi, window.moment().format("HH:mm")).replace(/{{\s*title\s*}}/gi, filename));
        window.app.foldManager.save(createdFile, IFoldInfo);
        return createdFile;
      } catch (err) {
        console.error(`Failed to create file: '${normalizedPath}'`, err);
        new obsidian.Notice("Unable to create new file.");
      }
    }
    function getMonthlyNote(date, monthlyNotes) {
      var _a;
      return (_a = monthlyNotes[getDateUID(date, "month")]) != null ? _a : null;
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
    var QuarterlyNotesFolderMissingError = class extends Error {
    };
    async function createQuarterlyNote(date) {
      const { vault } = window.app;
      const { template, format, folder } = getQuarterlyNoteSettings();
      const [templateContents, IFoldInfo] = await getTemplateInfo(template);
      const filename = date.format(format);
      const normalizedPath = await getNotePath(folder, filename);
      try {
        const createdFile = await vault.create(normalizedPath, templateContents.replace(/{{\s*(date|time)\s*(([+-]\d+)([yqmwdhs]))?\s*(:.+?)?}}/gi, (_, _timeOrDate, calc, timeDelta, unit, momentFormat) => {
          const now = window.moment();
          const currentDate = date.clone().set({
            hour: now.get("hour"),
            minute: now.get("minute"),
            second: now.get("second")
          });
          if (calc) {
            currentDate.add(parseInt(timeDelta, 10), unit);
          }
          if (momentFormat) {
            return currentDate.format(momentFormat.substring(1).trim());
          }
          return currentDate.format(format);
        }).replace(/{{\s*date\s*}}/gi, filename).replace(/{{\s*time\s*}}/gi, window.moment().format("HH:mm")).replace(/{{\s*title\s*}}/gi, filename));
        window.app.foldManager.save(createdFile, IFoldInfo);
        return createdFile;
      } catch (err) {
        console.error(`Failed to create file: '${normalizedPath}'`, err);
        new obsidian.Notice("Unable to create new file.");
      }
    }
    function getQuarterlyNote(date, quarterly) {
      var _a;
      return (_a = quarterly[getDateUID(date, "quarter")]) != null ? _a : null;
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
    var YearlyNotesFolderMissingError = class extends Error {
    };
    async function createYearlyNote(date) {
      const { vault } = window.app;
      const { template, format, folder } = getYearlyNoteSettings();
      const [templateContents, IFoldInfo] = await getTemplateInfo(template);
      const filename = date.format(format);
      const normalizedPath = await getNotePath(folder, filename);
      try {
        const createdFile = await vault.create(normalizedPath, templateContents.replace(/{{\s*(date|time)\s*(([+-]\d+)([yqmwdhs]))?\s*(:.+?)?}}/gi, (_, _timeOrDate, calc, timeDelta, unit, momentFormat) => {
          const now = window.moment();
          const currentDate = date.clone().set({
            hour: now.get("hour"),
            minute: now.get("minute"),
            second: now.get("second")
          });
          if (calc) {
            currentDate.add(parseInt(timeDelta, 10), unit);
          }
          if (momentFormat) {
            return currentDate.format(momentFormat.substring(1).trim());
          }
          return currentDate.format(format);
        }).replace(/{{\s*date\s*}}/gi, filename).replace(/{{\s*time\s*}}/gi, window.moment().format("HH:mm")).replace(/{{\s*title\s*}}/gi, filename));
        window.app.foldManager.save(createdFile, IFoldInfo);
        return createdFile;
      } catch (err) {
        console.error(`Failed to create file: '${normalizedPath}'`, err);
        new obsidian.Notice("Unable to create new file.");
      }
    }
    function getYearlyNote(date, yearlyNotes) {
      var _a;
      return (_a = yearlyNotes[getDateUID(date, "year")]) != null ? _a : null;
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
      var _a, _b;
      const { app } = window;
      const dailyNotesPlugin = app.internalPlugins.plugins["daily-notes"];
      if (dailyNotesPlugin && dailyNotesPlugin.enabled) {
        return true;
      }
      const periodicNotes = app.plugins.getPlugin("periodic-notes");
      return periodicNotes && ((_b = (_a = periodicNotes.settings) == null ? void 0 : _a.daily) == null ? void 0 : _b.enabled);
    }
    function appHasWeeklyNotesPluginLoaded() {
      var _a, _b;
      const { app } = window;
      if (app.plugins.getPlugin("calendar")) {
        return true;
      }
      const periodicNotes = app.plugins.getPlugin("periodic-notes");
      return periodicNotes && ((_b = (_a = periodicNotes.settings) == null ? void 0 : _a.weekly) == null ? void 0 : _b.enabled);
    }
    function appHasMonthlyNotesPluginLoaded() {
      var _a, _b;
      const { app } = window;
      const periodicNotes = app.plugins.getPlugin("periodic-notes");
      return periodicNotes && ((_b = (_a = periodicNotes.settings) == null ? void 0 : _a.monthly) == null ? void 0 : _b.enabled);
    }
    function appHasQuarterlyNotesPluginLoaded() {
      var _a, _b;
      const { app } = window;
      const periodicNotes = app.plugins.getPlugin("periodic-notes");
      return periodicNotes && ((_b = (_a = periodicNotes.settings) == null ? void 0 : _a.quarterly) == null ? void 0 : _b.enabled);
    }
    function appHasYearlyNotesPluginLoaded() {
      var _a, _b;
      const { app } = window;
      const periodicNotes = app.plugins.getPlugin("periodic-notes");
      return periodicNotes && ((_b = (_a = periodicNotes.settings) == null ? void 0 : _a.yearly) == null ? void 0 : _b.enabled);
    }
    function getPeriodicNoteSettings(granularity) {
      const getSettings = {
        day: getDailyNoteSettings2,
        week: getWeeklyNoteSettings,
        month: getMonthlyNoteSettings,
        quarter: getQuarterlyNoteSettings,
        year: getYearlyNoteSettings
      }[granularity];
      return getSettings();
    }
    function createPeriodicNote(granularity, date) {
      const createFn = {
        day: createDailyNote,
        month: createMonthlyNote,
        week: createWeeklyNote
      };
      return createFn[granularity](date);
    }
    exports.DEFAULT_DAILY_NOTE_FORMAT = DEFAULT_DAILY_NOTE_FORMAT;
    exports.DEFAULT_MONTHLY_NOTE_FORMAT = DEFAULT_MONTHLY_NOTE_FORMAT;
    exports.DEFAULT_QUARTERLY_NOTE_FORMAT = DEFAULT_QUARTERLY_NOTE_FORMAT;
    exports.DEFAULT_WEEKLY_NOTE_FORMAT = DEFAULT_WEEKLY_NOTE_FORMAT;
    exports.DEFAULT_YEARLY_NOTE_FORMAT = DEFAULT_YEARLY_NOTE_FORMAT;
    exports.appHasDailyNotesPluginLoaded = appHasDailyNotesPluginLoaded;
    exports.appHasMonthlyNotesPluginLoaded = appHasMonthlyNotesPluginLoaded;
    exports.appHasQuarterlyNotesPluginLoaded = appHasQuarterlyNotesPluginLoaded;
    exports.appHasWeeklyNotesPluginLoaded = appHasWeeklyNotesPluginLoaded;
    exports.appHasYearlyNotesPluginLoaded = appHasYearlyNotesPluginLoaded;
    exports.createDailyNote = createDailyNote;
    exports.createMonthlyNote = createMonthlyNote;
    exports.createPeriodicNote = createPeriodicNote;
    exports.createQuarterlyNote = createQuarterlyNote;
    exports.createWeeklyNote = createWeeklyNote;
    exports.createYearlyNote = createYearlyNote;
    exports.getAllDailyNotes = getAllDailyNotes;
    exports.getAllMonthlyNotes = getAllMonthlyNotes;
    exports.getAllQuarterlyNotes = getAllQuarterlyNotes;
    exports.getAllWeeklyNotes = getAllWeeklyNotes;
    exports.getAllYearlyNotes = getAllYearlyNotes;
    exports.getDailyNote = getDailyNote;
    exports.getDailyNoteSettings = getDailyNoteSettings2;
    exports.getDateFromFile = getDateFromFile;
    exports.getDateFromPath = getDateFromPath;
    exports.getDateUID = getDateUID;
    exports.getMonthlyNote = getMonthlyNote;
    exports.getMonthlyNoteSettings = getMonthlyNoteSettings;
    exports.getPeriodicNoteSettings = getPeriodicNoteSettings;
    exports.getQuarterlyNote = getQuarterlyNote;
    exports.getQuarterlyNoteSettings = getQuarterlyNoteSettings;
    exports.getTemplateInfo = getTemplateInfo;
    exports.getWeeklyNote = getWeeklyNote;
    exports.getWeeklyNoteSettings = getWeeklyNoteSettings;
    exports.getYearlyNote = getYearlyNote;
    exports.getYearlyNoteSettings = getYearlyNoteSettings;
  }
});

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => ThePlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian11 = require("obsidian");

// src/ui/SettingsTab.ts
var import_obsidian5 = require("obsidian");

// src/features/themes.ts
var import_obsidian3 = require("obsidian");

// src/features/githubUtils.ts
var import_obsidian = require("obsidian");
var GITHUB_RAW_USERCONTENT_PATH = "https://raw.githubusercontent.com/";
var isPrivateRepo = async (repository, debugLogging = true, personalAccessToken = "") => {
  const URL2 = `https://api.github.com/repos/${repository}`;
  try {
    const response = await (0, import_obsidian.request)({
      url: URL2,
      headers: personalAccessToken ? {
        Authorization: `Token ${personalAccessToken}`
      } : {}
    });
    const data = await JSON.parse(response);
    return data.private;
  } catch (e) {
    if (debugLogging)
      console.log("error in isPrivateRepo", URL2, e);
    return false;
  }
};
var grabReleaseFileFromRepository = async (repository, version, fileName, debugLogging = true, personalAccessToken = "") => {
  try {
    const isPrivate = await isPrivateRepo(repository, debugLogging, personalAccessToken);
    if (isPrivate) {
      const URL2 = `https://api.github.com/repos/${repository}/releases`;
      const response = await (0, import_obsidian.request)({
        url: URL2,
        headers: {
          Authorization: `Token ${personalAccessToken}`
        }
      });
      const data = await JSON.parse(response);
      const release = data.find((release2) => release2.tag_name === version);
      if (!release) {
        return null;
      }
      const asset = release.assets.find(
        (asset2) => asset2.name === fileName
      );
      if (!asset) {
        return null;
      }
      const download = await (0, import_obsidian.request)({
        url: asset.url,
        headers: {
          Authorization: `Token ${personalAccessToken}`,
          Accept: "application/octet-stream"
        }
      });
      return download === "Not Found" || download === `{"error":"Not Found"}` ? null : download;
    } else {
      const URL2 = `https://github.com/${repository}/releases/download/${version}/${fileName}`;
      const download = await (0, import_obsidian.request)({
        url: URL2,
        headers: personalAccessToken ? {
          Authorization: `Token ${personalAccessToken}`
        } : {}
      });
      return download === "Not Found" || download === `{"error":"Not Found"}` ? null : download;
    }
  } catch (error) {
    if (debugLogging)
      console.log("error in grabReleaseFileFromRepository", URL, error);
    return null;
  }
};
var grabManifestJsonFromRepository = async (repositoryPath, rootManifest = true, debugLogging = true, personalAccessToken = "") => {
  const manifestJsonPath = GITHUB_RAW_USERCONTENT_PATH + repositoryPath + (rootManifest ? "/HEAD/manifest.json" : "/HEAD/manifest-beta.json");
  if (debugLogging)
    console.log("grabManifestJsonFromRepository manifestJsonPath", manifestJsonPath);
  try {
    const response = await (0, import_obsidian.request)({
      url: manifestJsonPath,
      headers: personalAccessToken ? {
        Authorization: `Token ${personalAccessToken}`
      } : {}
    });
    if (debugLogging)
      console.log("grabManifestJsonFromRepository response", response);
    return response === "404: Not Found" ? null : await JSON.parse(response);
  } catch (error) {
    if (error !== "Error: Request failed, status 404" && debugLogging) {
      console.log(
        `error in grabManifestJsonFromRepository for ${manifestJsonPath}`,
        error
      );
    }
    return null;
  }
};
var grabCommmunityPluginList = async (debugLogging = true) => {
  const pluginListUrl = `https://raw.githubusercontent.com/obsidianmd/obsidian-releases/HEAD/community-plugins.json`;
  try {
    const response = await (0, import_obsidian.request)({ url: pluginListUrl });
    return response === "404: Not Found" ? null : await JSON.parse(response);
  } catch (error) {
    if (debugLogging)
      console.log("error in grabCommmunityPluginList", error);
    return null;
  }
};
var grabCommmunityThemesList = async (debugLogging = true) => {
  const themesUrl = `https://raw.githubusercontent.com/obsidianmd/obsidian-releases/HEAD/community-css-themes.json`;
  try {
    const response = await (0, import_obsidian.request)({ url: themesUrl });
    return response === "404: Not Found" ? null : await JSON.parse(response);
  } catch (error) {
    if (debugLogging)
      console.log("error in grabCommmunityThemesList", error);
    return null;
  }
};
var grabCommmunityThemeCssFile = async (repositoryPath, betaVersion = false, debugLogging) => {
  const themesUrl = `https://raw.githubusercontent.com/${repositoryPath}/HEAD/theme${betaVersion ? "-beta" : ""}.css`;
  try {
    const response = await (0, import_obsidian.request)({ url: themesUrl });
    return response === "404: Not Found" ? null : response;
  } catch (error) {
    if (debugLogging)
      console.log("error in grabCommmunityThemeCssFile", error);
    return null;
  }
};
var grabCommmunityThemeManifestFile = async (repositoryPath, debugLogging = true) => {
  const themesUrl = `https://raw.githubusercontent.com/${repositoryPath}/HEAD/manifest.json`;
  try {
    const response = await (0, import_obsidian.request)({ url: themesUrl });
    return response === "404: Not Found" ? null : response;
  } catch (error) {
    if (debugLogging)
      console.log("error in grabCommmunityThemeManifestFile", error);
    return null;
  }
};
var checksum = (str) => {
  let sum = 0;
  for (let i = 0; i < str.length; i++) {
    sum += str.charCodeAt(i);
  }
  return sum;
};
var checksumForString = (str) => {
  return checksum(str).toString();
};
var grabChecksumOfThemeCssFile = async (repositoryPath, betaVersion, debugLogging) => {
  const themeCss = await grabCommmunityThemeCssFile(
    repositoryPath,
    betaVersion,
    debugLogging
  );
  return themeCss ? checksumForString(themeCss) : "0";
};
var grabLastCommitInfoForFile = async (repositoryPath, path, debugLogging = true) => {
  const url = `https://api.github.com/repos/${repositoryPath}/commits?path=${path}&page=1&per_page=1`;
  try {
    const response = await (0, import_obsidian.request)({ url });
    return response === "404: Not Found" ? null : JSON.parse(response);
  } catch (error) {
    if (debugLogging)
      console.log("error in grabLastCommitInfoForAFile", error);
    return null;
  }
};
var grabLastCommitDateForFile = async (repositoryPath, path) => {
  var _a;
  const test = await grabLastCommitInfoForFile(repositoryPath, path);
  if (test && test.length > 0 && ((_a = test[0].commit.committer) == null ? void 0 : _a.date)) {
    return test[0].commit.committer.date;
  } else {
    return "";
  }
};

// src/settings.ts
var DEFAULT_SETTINGS = {
  pluginList: [],
  pluginSubListFrozenVersion: [],
  themesList: [],
  updateAtStartup: true,
  updateThemesAtStartup: true,
  enableAfterInstall: true,
  loggingEnabled: false,
  loggingPath: "BRAT-log",
  loggingVerboseEnabled: false,
  debuggingMode: false,
  notificationsEnabled: true,
  personalAccessToken: ""
};
function addBetaPluginToList(plugin, repositoryPath, specifyVersion = "") {
  let save = false;
  if (!plugin.settings.pluginList.contains(repositoryPath)) {
    plugin.settings.pluginList.unshift(repositoryPath);
    save = true;
  }
  if (specifyVersion !== "" && plugin.settings.pluginSubListFrozenVersion.filter((x) => x.repo === repositoryPath).length === 0) {
    plugin.settings.pluginSubListFrozenVersion.unshift({
      repo: repositoryPath,
      version: specifyVersion
    });
    save = true;
  }
  if (save) {
    void plugin.saveSettings();
  }
}
function existBetaPluginInList(plugin, repositoryPath) {
  return plugin.settings.pluginList.contains(repositoryPath);
}
function addBetaThemeToList(plugin, repositoryPath, themeCss) {
  const newTheme = {
    repo: repositoryPath,
    lastUpdate: checksumForString(themeCss)
  };
  plugin.settings.themesList.unshift(newTheme);
  void plugin.saveSettings();
}
function existBetaThemeinInList(plugin, repositoryPath) {
  const testIfThemExists = plugin.settings.themesList.find(
    (t) => t.repo === repositoryPath
  );
  return testIfThemExists ? true : false;
}
function updateBetaThemeLastUpdateChecksum(plugin, repositoryPath, checksum2) {
  plugin.settings.themesList.forEach((t) => {
    if (t.repo === repositoryPath) {
      t.lastUpdate = checksum2;
      void plugin.saveSettings();
    }
  });
}

// src/utils/notifications.ts
var import_obsidian2 = require("obsidian");
function toastMessage(plugin, msg, timeoutInSeconds = 10, contextMenuCallback) {
  if (!plugin.settings.notificationsEnabled)
    return;
  const additionalInfo = contextMenuCallback ? import_obsidian2.Platform.isDesktop ? "(click=dismiss, right-click=Info)" : "(click=dismiss)" : "";
  const newNotice = new import_obsidian2.Notice(
    `BRAT
${msg}
${additionalInfo}`,
    timeoutInSeconds * 1e3
  );
  if (contextMenuCallback)
    newNotice.noticeEl.oncontextmenu = () => {
      contextMenuCallback();
    };
}

// src/utils/internetconnection.ts
async function isConnectedToInternet() {
  try {
    const online = await fetch("https://obsidian.md/?" + Math.random());
    return online.status >= 200 && online.status < 300;
  } catch (err) {
    return false;
  }
}

// src/features/themes.ts
var themeSave = async (plugin, cssGithubRepository, newInstall) => {
  let themeCss = await grabCommmunityThemeCssFile(
    cssGithubRepository,
    true,
    plugin.settings.debuggingMode
  );
  if (!themeCss)
    themeCss = await grabCommmunityThemeCssFile(
      cssGithubRepository,
      false,
      plugin.settings.debuggingMode
    );
  if (!themeCss) {
    toastMessage(
      plugin,
      "There is no theme.css or theme-beta.css file in the root path of this repository, so there is no theme to install."
    );
    return false;
  }
  const themeManifest = await grabCommmunityThemeManifestFile(
    cssGithubRepository,
    plugin.settings.debuggingMode
  );
  if (!themeManifest) {
    toastMessage(
      plugin,
      "There is no manifest.json file in the root path of this repository, so theme cannot be installed."
    );
    return false;
  }
  const manifestInfo = await JSON.parse(themeManifest);
  const themeTargetFolderPath = (0, import_obsidian3.normalizePath)(themesRootPath(plugin) + manifestInfo.name);
  const { adapter } = plugin.app.vault;
  if (!await adapter.exists(themeTargetFolderPath))
    await adapter.mkdir(themeTargetFolderPath);
  await adapter.write((0, import_obsidian3.normalizePath)(themeTargetFolderPath + "/theme.css"), themeCss);
  await adapter.write(
    (0, import_obsidian3.normalizePath)(themeTargetFolderPath + "/manifest.json"),
    themeManifest
  );
  updateBetaThemeLastUpdateChecksum(
    plugin,
    cssGithubRepository,
    checksumForString(themeCss)
  );
  let msg = ``;
  if (newInstall) {
    addBetaThemeToList(plugin, cssGithubRepository, themeCss);
    msg = `${manifestInfo.name} theme installed from ${cssGithubRepository}. `;
    setTimeout(() => {
      plugin.app.customCss.setTheme(manifestInfo.name);
    }, 500);
  } else {
    msg = `${manifestInfo.name} theme updated from ${cssGithubRepository}.`;
  }
  void plugin.log(msg + `[Theme Info](https://github.com/${cssGithubRepository})`, false);
  toastMessage(plugin, msg, 20, () => {
    window.open(`https://github.com/${cssGithubRepository}`);
  });
  return true;
};
var themesCheckAndUpdates = async (plugin, showInfo) => {
  if (!await isConnectedToInternet()) {
    console.log("BRAT: No internet detected.");
    return;
  }
  let newNotice;
  const msg1 = `Checking for beta theme updates STARTED`;
  await plugin.log(msg1, true);
  if (showInfo && plugin.settings.notificationsEnabled)
    newNotice = new import_obsidian3.Notice(`BRAT
${msg1}`, 3e4);
  for (const t of plugin.settings.themesList) {
    let lastUpdateOnline = await grabChecksumOfThemeCssFile(
      t.repo,
      true,
      plugin.settings.debuggingMode
    );
    if (lastUpdateOnline === "0")
      lastUpdateOnline = await grabChecksumOfThemeCssFile(
        t.repo,
        false,
        plugin.settings.debuggingMode
      );
    console.log("BRAT: lastUpdateOnline", lastUpdateOnline);
    if (lastUpdateOnline !== t.lastUpdate)
      await themeSave(plugin, t.repo, false);
  }
  const msg2 = `Checking for beta theme updates COMPLETED`;
  (async () => {
    await plugin.log(msg2, true);
  })();
  if (showInfo) {
    if (plugin.settings.notificationsEnabled && newNotice)
      newNotice.hide();
    toastMessage(plugin, msg2);
  }
};
var themeDelete = (plugin, cssGithubRepository) => {
  plugin.settings.themesList = plugin.settings.themesList.filter(
    (t) => t.repo !== cssGithubRepository
  );
  void plugin.saveSettings();
  const msg = `Removed ${cssGithubRepository} from BRAT themes list and will no longer be updated. However, the theme files still exist in the vault. To remove them, go into Settings > Appearance and remove the theme.`;
  void plugin.log(msg, true);
  toastMessage(plugin, msg);
};
var themesRootPath = (plugin) => {
  return (0, import_obsidian3.normalizePath)(plugin.app.vault.configDir + "/themes") + "/";
};

// src/ui/AddNewTheme.ts
var import_obsidian4 = require("obsidian");

// src/ui/Promotional.ts
var promotionalLinks = (containerEl, settingsTab = true) => {
  const linksDiv = containerEl.createEl("div");
  linksDiv.style.float = "right";
  if (!settingsTab) {
    linksDiv.style.padding = "10px";
    linksDiv.style.paddingLeft = "15px";
    linksDiv.style.paddingRight = "15px";
  } else {
    linksDiv.style.padding = "15px";
    linksDiv.style.paddingLeft = "15px";
    linksDiv.style.paddingRight = "15px";
    linksDiv.style.marginLeft = "15px";
  }
  const twitterSpan = linksDiv.createDiv("coffee");
  twitterSpan.addClass("ex-twitter-span");
  twitterSpan.style.paddingLeft = "10px";
  const captionText = twitterSpan.createDiv();
  captionText.innerText = "Learn more about my work at:";
  twitterSpan.appendChild(captionText);
  const twitterLink = twitterSpan.createEl("a", { href: "https://tfthacker.com" });
  twitterLink.innerText = "https://tfthacker.com";
  return linksDiv;
};

// src/ui/AddNewTheme.ts
var AddNewTheme = class extends import_obsidian4.Modal {
  constructor(plugin, openSettingsTabAfterwards = false) {
    super(plugin.app);
    this.plugin = plugin;
    this.address = "";
    this.openSettingsTabAfterwards = openSettingsTabAfterwards;
  }
  async submitForm() {
    if (this.address === "")
      return;
    const scrubbedAddress = this.address.replace("https://github.com/", "");
    if (existBetaThemeinInList(this.plugin, scrubbedAddress)) {
      toastMessage(this.plugin, `This theme is already in the list for beta testing`, 10);
      return;
    }
    if (await themeSave(this.plugin, scrubbedAddress, true)) {
      this.close();
    }
  }
  onOpen() {
    this.contentEl.createEl("h4", { text: "Github repository for beta theme:" });
    this.contentEl.createEl("form", {}, (formEl) => {
      formEl.addClass("brat-modal");
      new import_obsidian4.Setting(formEl).addText((textEl) => {
        textEl.setPlaceholder(
          "Repository (example: https://github.com/GitubUserName/repository-name"
        );
        textEl.setValue(this.address);
        textEl.onChange((value) => {
          this.address = value.trim();
        });
        textEl.inputEl.addEventListener("keydown", (e) => {
          if (e.key === "Enter" && this.address !== " ") {
            e.preventDefault();
            void this.submitForm();
          }
        });
        textEl.inputEl.style.width = "100%";
        window.setTimeout(() => {
          const title = document.querySelector(".setting-item-info");
          if (title)
            title.remove();
          textEl.inputEl.focus();
        }, 10);
      });
      formEl.createDiv("modal-button-container", (buttonContainerEl) => {
        buttonContainerEl.createEl("button", { attr: { type: "button" }, text: "Never mind" }).addEventListener("click", () => {
          this.close();
        });
        buttonContainerEl.createEl("button", {
          attr: { type: "submit" },
          cls: "mod-cta",
          text: "Add Theme"
        });
      });
      const newDiv = formEl.createDiv();
      newDiv.style.borderTop = "1px solid #ccc";
      newDiv.style.marginTop = "30px";
      const byTfThacker = newDiv.createSpan();
      byTfThacker.innerHTML = "BRAT by <a href='https://bit.ly/o42-twitter'>TFTHacker</a>";
      byTfThacker.style.fontStyle = "italic";
      newDiv.appendChild(byTfThacker);
      promotionalLinks(newDiv, false);
      window.setTimeout(() => {
        const title = formEl.querySelectorAll(".brat-modal .setting-item-info");
        title.forEach((titleEl) => {
          titleEl.remove();
        });
      }, 50);
      formEl.addEventListener("submit", (e) => {
        e.preventDefault();
        if (this.address !== "")
          void this.submitForm();
      });
    });
  }
  onClose() {
    if (this.openSettingsTabAfterwards) {
      this.plugin.app.setting.open();
      this.plugin.app.setting.openTabById(this.plugin.APP_ID);
    }
  }
};

// src/ui/SettingsTab.ts
var createLink = (githubResource, optionalText) => {
  const newLink = new DocumentFragment();
  const linkElement = document.createElement("a");
  linkElement.textContent = githubResource;
  linkElement.href = `https://github.com/${githubResource}`;
  newLink.appendChild(linkElement);
  if (optionalText) {
    const textNode = document.createTextNode(optionalText);
    newLink.appendChild(textNode);
  }
  return newLink;
};
var BratSettingsTab = class extends import_obsidian5.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian5.Setting(containerEl).setName("Auto-enable plugins after installation").setDesc(
      'If enabled beta plugins will be automatically enabled after installtion by default. Note: you can toggle this on and off for each plugin in the "Add Plugin" form.'
    ).addToggle((cb) => {
      cb.setValue(this.plugin.settings.enableAfterInstall);
      cb.onChange(async (value) => {
        this.plugin.settings.enableAfterInstall = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian5.Setting(containerEl).setName("Auto-update plugins at startup").setDesc(
      "If enabled all beta plugins will be checked for updates each time Obsidian starts. Note: this does not update frozen version plugins."
    ).addToggle((cb) => {
      cb.setValue(this.plugin.settings.updateAtStartup);
      cb.onChange(async (value) => {
        this.plugin.settings.updateAtStartup = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian5.Setting(containerEl).setName("Auto-update themes at startup").setDesc(
      "If enabled all beta themes will be checked for updates each time Obsidian starts."
    ).addToggle((cb) => {
      cb.setValue(this.plugin.settings.updateThemesAtStartup);
      cb.onChange(async (value) => {
        this.plugin.settings.updateThemesAtStartup = value;
        await this.plugin.saveSettings();
      });
    });
    promotionalLinks(containerEl, true);
    containerEl.createEl("hr");
    containerEl.createEl("h2", { text: "Beta Plugin List" });
    containerEl.createEl("div", {
      text: `The following is a list of beta plugins added via the command palette "Add a beta plugin for testing" or "Add a beta plugin with frozen version for testing". A frozen version is a specific release of a plugin based on its releease tag. `
    });
    containerEl.createEl("p");
    containerEl.createEl("div", {
      text: `Click the x button next to a plugin to remove it from the list.`
    });
    containerEl.createEl("p");
    containerEl.createEl("span").createEl("b", { text: "Note: " });
    containerEl.createSpan({
      text: "This does not delete the plugin, this should be done from the  Community Plugins tab in Settings."
    });
    new import_obsidian5.Setting(containerEl).addButton((cb) => {
      cb.setButtonText("Add Beta plugin");
      cb.onClick(() => {
        this.plugin.app.setting.close();
        this.plugin.betaPlugins.displayAddNewPluginModal(true, false);
      });
    });
    const pluginSubListFrozenVersionNames = new Set(
      this.plugin.settings.pluginSubListFrozenVersion.map((x) => x.repo)
    );
    for (const bp of this.plugin.settings.pluginList) {
      if (pluginSubListFrozenVersionNames.has(bp)) {
        continue;
      }
      new import_obsidian5.Setting(containerEl).setName(createLink(bp)).addButton((btn) => {
        btn.setIcon("cross");
        btn.setTooltip("Delete this beta plugin");
        btn.onClick(() => {
          if (btn.buttonEl.textContent === "")
            btn.setButtonText("Click once more to confirm removal");
          else {
            const { buttonEl } = btn;
            const { parentElement } = buttonEl;
            if (parentElement == null ? void 0 : parentElement.parentElement) {
              parentElement.parentElement.remove();
              this.plugin.betaPlugins.deletePlugin(bp);
            }
          }
        });
      });
    }
    new import_obsidian5.Setting(containerEl).addButton((cb) => {
      cb.setButtonText("Add Beta plugin with frozen version");
      cb.onClick(() => {
        this.plugin.app.setting.close();
        this.plugin.betaPlugins.displayAddNewPluginModal(true, true);
      });
    });
    for (const bp of this.plugin.settings.pluginSubListFrozenVersion) {
      new import_obsidian5.Setting(containerEl).setName(createLink(bp.repo, ` (version ${bp.version})`)).addButton((btn) => {
        btn.setIcon("cross");
        btn.setTooltip("Delete this beta plugin");
        btn.onClick(() => {
          if (btn.buttonEl.textContent === "")
            btn.setButtonText("Click once more to confirm removal");
          else {
            const { buttonEl } = btn;
            const { parentElement } = buttonEl;
            if (parentElement == null ? void 0 : parentElement.parentElement) {
              parentElement.parentElement.remove();
              this.plugin.betaPlugins.deletePlugin(bp.repo);
            }
          }
        });
      });
    }
    containerEl.createEl("h2", { text: "Beta Themes List" });
    new import_obsidian5.Setting(containerEl).addButton((cb) => {
      cb.setButtonText("Add Beta Theme");
      cb.onClick(() => {
        this.plugin.app.setting.close();
        new AddNewTheme(this.plugin).open();
      });
    });
    for (const bp of this.plugin.settings.themesList) {
      new import_obsidian5.Setting(containerEl).setName(createLink(bp.repo)).addButton((btn) => {
        btn.setIcon("cross");
        btn.setTooltip("Delete this beta theme");
        btn.onClick(() => {
          if (btn.buttonEl.textContent === "")
            btn.setButtonText("Click once more to confirm removal");
          else {
            const { buttonEl } = btn;
            const { parentElement } = buttonEl;
            if (parentElement == null ? void 0 : parentElement.parentElement) {
              parentElement.parentElement.remove();
              themeDelete(this.plugin, bp.repo);
            }
          }
        });
      });
    }
    containerEl.createEl("h2", { text: "Monitoring" });
    new import_obsidian5.Setting(containerEl).setName("Enable Notifications").setDesc(
      "BRAT will provide popup notifications for its various activities. Turn this off means  no notifications from BRAT."
    ).addToggle((cb) => {
      cb.setValue(this.plugin.settings.notificationsEnabled);
      cb.onChange(async (value) => {
        this.plugin.settings.notificationsEnabled = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian5.Setting(containerEl).setName("Enable Logging").setDesc("Plugin updates will be logged to a file in the log file.").addToggle((cb) => {
      cb.setValue(this.plugin.settings.loggingEnabled);
      cb.onChange(async (value) => {
        this.plugin.settings.loggingEnabled = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian5.Setting(this.containerEl).setName("BRAT Log File Location").setDesc("Logs will be saved to this file. Don't add .md to the file name.").addSearch((cb) => {
      cb.setPlaceholder("Example: BRAT-log").setValue(this.plugin.settings.loggingPath).onChange(async (newFolder) => {
        this.plugin.settings.loggingPath = newFolder;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian5.Setting(containerEl).setName("Enable Verbose Logging").setDesc("Get a lot  more information in  the log.").addToggle((cb) => {
      cb.setValue(this.plugin.settings.loggingVerboseEnabled);
      cb.onChange(async (value) => {
        this.plugin.settings.loggingVerboseEnabled = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian5.Setting(containerEl).setName("Debugging Mode").setDesc(
      "Atomic Bomb level console logging. Can be used for troubleshoting and development."
    ).addToggle((cb) => {
      cb.setValue(this.plugin.settings.debuggingMode);
      cb.onChange(async (value) => {
        this.plugin.settings.debuggingMode = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian5.Setting(containerEl).setName("Personal Access Token").setDesc(
      "If you need to access private repositories, enter the personal access token here."
    ).addText((text) => {
      var _a;
      text.setPlaceholder("Enter your personal access token").setValue((_a = this.plugin.settings.personalAccessToken) != null ? _a : "").onChange(async (value) => {
        this.plugin.settings.personalAccessToken = value;
        await this.plugin.saveSettings();
      });
    });
  }
};

// src/ui/AddNewPluginModal.ts
var import_obsidian6 = require("obsidian");
var AddNewPluginModal = class extends import_obsidian6.Modal {
  constructor(plugin, betaPlugins, openSettingsTabAfterwards = false, useFrozenVersion = false) {
    super(plugin.app);
    this.plugin = plugin;
    this.betaPlugins = betaPlugins;
    this.address = "";
    this.openSettingsTabAfterwards = openSettingsTabAfterwards;
    this.useFrozenVersion = useFrozenVersion;
    this.enableAfterInstall = plugin.settings.enableAfterInstall;
    this.version = "";
  }
  async submitForm() {
    if (this.address === "")
      return;
    let scrubbedAddress = this.address.replace("https://github.com/", "");
    if (scrubbedAddress.endsWith(".git"))
      scrubbedAddress = scrubbedAddress.slice(0, -4);
    if (existBetaPluginInList(this.plugin, scrubbedAddress)) {
      toastMessage(
        this.plugin,
        `This plugin is already in the list for beta testing`,
        10
      );
      return;
    }
    const result = await this.betaPlugins.addPlugin(
      scrubbedAddress,
      false,
      false,
      false,
      this.version,
      false,
      this.enableAfterInstall
    );
    if (result) {
      this.close();
    }
  }
  onOpen() {
    this.contentEl.createEl("h4", { text: "Github repository for beta plugin:" });
    this.contentEl.createEl("form", {}, (formEl) => {
      formEl.addClass("brat-modal");
      new import_obsidian6.Setting(formEl).addText((textEl) => {
        textEl.setPlaceholder(
          "Repository (example: https://github.com/GitubUserName/repository-name)"
        );
        textEl.setValue(this.address);
        textEl.onChange((value) => {
          this.address = value.trim();
        });
        textEl.inputEl.addEventListener("keydown", (e) => {
          if (e.key === "Enter" && this.address !== " ") {
            if (this.useFrozenVersion && this.version !== "" || !this.useFrozenVersion) {
              e.preventDefault();
              void this.submitForm();
            }
          }
        });
        textEl.inputEl.style.width = "100%";
      });
      if (this.useFrozenVersion) {
        new import_obsidian6.Setting(formEl).addText((textEl) => {
          textEl.setPlaceholder("Specify the release version tag (example: 1.0.0)");
          textEl.onChange((value) => {
            this.version = value.trim();
          });
          textEl.inputEl.style.width = "100%";
        });
      }
      formEl.createDiv("modal-button-container", (buttonContainerEl) => {
        buttonContainerEl.createEl(
          "label",
          {
            cls: "mod-checkbox"
          },
          (labelEl) => {
            const checkboxEl = labelEl.createEl("input", {
              attr: { tabindex: -1 },
              type: "checkbox"
            });
            checkboxEl.checked = this.enableAfterInstall;
            checkboxEl.addEventListener("click", () => {
              this.enableAfterInstall = checkboxEl.checked;
            });
            labelEl.appendText("Enable after installing the plugin");
          }
        );
        buttonContainerEl.createEl("button", { attr: { type: "button" }, text: "Never mind" }).addEventListener("click", () => {
          this.close();
        });
        buttonContainerEl.createEl("button", {
          attr: { type: "submit" },
          cls: "mod-cta",
          text: "Add Plugin"
        });
      });
      const newDiv = formEl.createDiv();
      newDiv.style.borderTop = "1px solid #ccc";
      newDiv.style.marginTop = "30px";
      const byTfThacker = newDiv.createSpan();
      byTfThacker.innerHTML = "BRAT by <a href='https://bit.ly/o42-twitter'>TFTHacker</a>";
      byTfThacker.style.fontStyle = "italic";
      newDiv.appendChild(byTfThacker);
      promotionalLinks(newDiv, false);
      window.setTimeout(() => {
        const title = formEl.querySelectorAll(".brat-modal .setting-item-info");
        title.forEach((titleEl) => {
          titleEl.remove();
        });
      }, 50);
      formEl.addEventListener("submit", (e) => {
        e.preventDefault();
        if (this.address !== "") {
          if (this.useFrozenVersion && this.version !== "" || !this.useFrozenVersion) {
            void this.submitForm();
          }
        }
      });
    });
  }
  onClose() {
    if (this.openSettingsTabAfterwards) {
      this.plugin.app.setting.open();
      this.plugin.app.setting.openTabById(this.plugin.APP_ID);
    }
  }
};

// src/features/BetaPlugins.ts
var import_obsidian7 = require("obsidian");
var BetaPlugins = class {
  constructor(plugin) {
    this.plugin = plugin;
  }
  /**
   * opens the AddNewPluginModal to get info for  a new beta plugin
   * @param openSettingsTabAfterwards - will open settings screen afterwards. Used when this command is called from settings tab
   * @param useFrozenVersion - install the plugin using frozen version.
   */
  displayAddNewPluginModal(openSettingsTabAfterwards = false, useFrozenVersion = false) {
    const newPlugin = new AddNewPluginModal(
      this.plugin,
      this,
      openSettingsTabAfterwards,
      useFrozenVersion
    );
    newPlugin.open();
  }
  /**
   * Validates that a GitHub repository is plugin
   *
   * @param repositoryPath - GithubUser/RepositoryName (example: TfThacker/obsidian42-brat)
   * @param getBetaManifest - test the beta version of the manifest, not at the root
   * @param false - [false description]
   * @param reportIssues - will display notices as it finds issues
   *
   * @returns the manifest file if found, or null if its incomplete
   */
  async validateRepository(repositoryPath, getBetaManifest = false, reportIssues = false) {
    const noticeTimeout = 15;
    const manifestJson = await grabManifestJsonFromRepository(
      repositoryPath,
      !getBetaManifest,
      this.plugin.settings.debuggingMode,
      this.plugin.settings.personalAccessToken
    );
    if (!manifestJson) {
      if (reportIssues) {
        toastMessage(
          this.plugin,
          `${repositoryPath}
This does not seem to be an obsidian plugin, as there is no manifest.json file.`,
          noticeTimeout
        );
        console.error(
          "BRAT: validateRepository",
          repositoryPath,
          getBetaManifest,
          reportIssues
        );
      }
      return null;
    }
    if (!("id" in manifestJson)) {
      if (reportIssues)
        toastMessage(
          this.plugin,
          `${repositoryPath}
The plugin id attribute for the release is missing from the manifest file`,
          noticeTimeout
        );
      return null;
    }
    if (!("version" in manifestJson)) {
      if (reportIssues)
        toastMessage(
          this.plugin,
          `${repositoryPath}
The version attribute for the release is missing from the manifest file`,
          noticeTimeout
        );
      return null;
    }
    return manifestJson;
  }
  /**
   * Gets all the release files based on the version number in the manifest
   *
   * @param repositoryPath - path to the GitHub repository
   * @param manifest       - manifest file
   * @param getManifest    - grab the remote manifest file
   * @param specifyVersion - grab the specified version if set
   *
   * @returns all relase files as strings based on the ReleaseFiles interaface
   */
  async getAllReleaseFiles(repositoryPath, manifest, getManifest, specifyVersion = "") {
    const version = specifyVersion === "" ? manifest.version : specifyVersion;
    const reallyGetManifestOrNot = getManifest || specifyVersion !== "";
    console.log({ reallyGetManifestOrNot, version });
    return {
      mainJs: await grabReleaseFileFromRepository(
        repositoryPath,
        version,
        "main.js",
        this.plugin.settings.debuggingMode,
        this.plugin.settings.personalAccessToken
      ),
      manifest: reallyGetManifestOrNot ? await grabReleaseFileFromRepository(
        repositoryPath,
        version,
        "manifest.json",
        this.plugin.settings.debuggingMode,
        this.plugin.settings.personalAccessToken
      ) : "",
      styles: await grabReleaseFileFromRepository(
        repositoryPath,
        version,
        "styles.css",
        this.plugin.settings.debuggingMode,
        this.plugin.settings.personalAccessToken
      )
    };
  }
  /**
   * Writes the plugin release files to the local obsidian .plugins folder
   *
   * @param betaPluginId - the id of the plugin (not the repository path)
   * @param relFiles     - release file as strings, based on the ReleaseFiles interface
   *
   */
  async writeReleaseFilesToPluginFolder(betaPluginId, relFiles) {
    var _a, _b;
    const pluginTargetFolderPath = (0, import_obsidian7.normalizePath)(this.plugin.app.vault.configDir + "/plugins/" + betaPluginId) + "/";
    const { adapter } = this.plugin.app.vault;
    if (!await adapter.exists(pluginTargetFolderPath) || !await adapter.exists(pluginTargetFolderPath + "manifest.json")) {
      await adapter.mkdir(pluginTargetFolderPath);
    }
    await adapter.write(pluginTargetFolderPath + "main.js", (_a = relFiles.mainJs) != null ? _a : "");
    await adapter.write(
      pluginTargetFolderPath + "manifest.json",
      (_b = relFiles.manifest) != null ? _b : ""
    );
    if (relFiles.styles)
      await adapter.write(pluginTargetFolderPath + "styles.css", relFiles.styles);
  }
  /**
   * Primary function for adding a new beta plugin to Obsidian.
   * Also this function is used for updating existing plugins.
   *
   * @param repositoryPath    - path to GitHub repository formated as USERNAME/repository
   * @param updatePluginFiles - true if this is just an update not an install
   * @param seeIfUpdatedOnly  - if true, and updatePluginFiles true, will just check for updates, but not do the update. will report to user that there is a new plugin
   * @param reportIfNotUpdted - if true, report if an update has not succed
   * @param specifyVersion    - if not empty, need to install a specified version instead of the value in manifest-beta.json
   * @param forceReinstall    - if true, will force a reinstall of the plugin, even if it is already installed
   *
   * @returns true if succeeds
   */
  async addPlugin(repositoryPath, updatePluginFiles = false, seeIfUpdatedOnly = false, reportIfNotUpdted = false, specifyVersion = "", forceReinstall = false, enableAfterInstall = this.plugin.settings.enableAfterInstall) {
    if (this.plugin.settings.debuggingMode)
      console.log(
        "BRAT: addPlugin",
        repositoryPath,
        updatePluginFiles,
        seeIfUpdatedOnly,
        reportIfNotUpdted,
        specifyVersion,
        forceReinstall,
        enableAfterInstall
      );
    const noticeTimeout = 10;
    let primaryManifest = await this.validateRepository(repositoryPath, true, false);
    const usingBetaManifest = primaryManifest ? true : false;
    if (!usingBetaManifest)
      primaryManifest = await this.validateRepository(repositoryPath, false, true);
    if (primaryManifest === null) {
      const msg = `${repositoryPath}
A manifest.json or manifest-beta.json file does not exist in the root directory of the repository. This plugin cannot be installed.`;
      await this.plugin.log(msg, true);
      toastMessage(this.plugin, msg, noticeTimeout);
      return false;
    }
    if (!Object.hasOwn(primaryManifest, "version")) {
      const msg = `${repositoryPath}
The manifest${usingBetaManifest ? "-beta" : ""}.json file in the root directory of the repository does not have a version number in the file. This plugin cannot be installed.`;
      await this.plugin.log(msg, true);
      toastMessage(this.plugin, msg, noticeTimeout);
      return false;
    }
    if (!Object.hasOwn(primaryManifest, "minAppVersion")) {
      if (!(0, import_obsidian7.requireApiVersion)(primaryManifest.minAppVersion)) {
        const msg = `Plugin: ${repositoryPath}

The manifest${usingBetaManifest ? "-beta" : ""}.json for this plugin indicates that the Obsidian version of the app needs to be ${primaryManifest.minAppVersion}, but this installation of Obsidian is ${import_obsidian7.apiVersion}. 

You will need to update your Obsidian to use this plugin or contact the plugin developer for more information.`;
        await this.plugin.log(msg, true);
        toastMessage(this.plugin, msg, 30);
        return false;
      }
    }
    const getRelease = async () => {
      const rFiles = await this.getAllReleaseFiles(
        repositoryPath,
        // @ts-expect-error typescript will complain that this can be null, but in this case it won't be
        primaryManifest,
        usingBetaManifest,
        specifyVersion
      );
      console.log("rFiles", rFiles);
      if (usingBetaManifest || rFiles.manifest === "")
        rFiles.manifest = JSON.stringify(primaryManifest);
      if (this.plugin.settings.debuggingMode)
        console.log("BRAT: rFiles.manifest", usingBetaManifest, rFiles);
      if (rFiles.mainJs === null) {
        const msg = `${repositoryPath}
The release is not complete and cannot be download. main.js is missing from the Release`;
        await this.plugin.log(msg, true);
        toastMessage(this.plugin, msg, noticeTimeout);
        return null;
      }
      return rFiles;
    };
    if (!updatePluginFiles || forceReinstall) {
      const releaseFiles = await getRelease();
      if (releaseFiles === null)
        return false;
      await this.writeReleaseFilesToPluginFolder(primaryManifest.id, releaseFiles);
      if (!forceReinstall)
        addBetaPluginToList(this.plugin, repositoryPath, specifyVersion);
      if (enableAfterInstall) {
        const { plugins } = this.plugin.app;
        const pluginTargetFolderPath = (0, import_obsidian7.normalizePath)(
          plugins.getPluginFolder() + "/" + primaryManifest.id
        );
        await plugins.loadManifest(pluginTargetFolderPath);
        await plugins.enablePluginAndSave(primaryManifest.id);
      }
      await this.plugin.app.plugins.loadManifests();
      if (forceReinstall) {
        await this.reloadPlugin(primaryManifest.id);
        await this.plugin.log(`${repositoryPath} reinstalled`, true);
        toastMessage(
          this.plugin,
          `${repositoryPath}
Plugin has been reinstalled and reloaded.`,
          noticeTimeout
        );
      } else {
        const versionText = specifyVersion === "" ? "" : ` (version: ${specifyVersion})`;
        let msg = `${repositoryPath}${versionText}
The plugin has been registered with BRAT.`;
        if (!enableAfterInstall) {
          msg += " You may still need to enable it the Community Plugin List.";
        }
        await this.plugin.log(msg, true);
        toastMessage(this.plugin, msg, noticeTimeout);
      }
    } else {
      const pluginTargetFolderPath = this.plugin.app.vault.configDir + "/plugins/" + primaryManifest.id + "/";
      let localManifestContents = "";
      try {
        localManifestContents = await this.plugin.app.vault.adapter.read(
          pluginTargetFolderPath + "manifest.json"
        );
      } catch (e) {
        if (e.errno === -4058 || e.errno === -2) {
          await this.addPlugin(
            repositoryPath,
            false,
            usingBetaManifest,
            false,
            specifyVersion
          );
          return true;
        } else
          console.log(
            "BRAT - Local Manifest Load",
            primaryManifest.id,
            JSON.stringify(e, null, 2)
          );
      }
      if (specifyVersion !== "" || this.plugin.settings.pluginSubListFrozenVersion.map((x) => x.repo).includes(repositoryPath)) {
        toastMessage(
          this.plugin,
          `The version of ${repositoryPath} is frozen, not updating.`,
          3
        );
        return false;
      }
      const localManifestJson = await JSON.parse(
        localManifestContents
      );
      if (localManifestJson.version !== primaryManifest.version) {
        const releaseFiles = await getRelease();
        if (releaseFiles === null)
          return false;
        if (seeIfUpdatedOnly) {
          const msg = `There is an update available for ${primaryManifest.id} from version ${localManifestJson.version} to ${primaryManifest.version}. `;
          await this.plugin.log(
            msg + `[Release Info](https://github.com/${repositoryPath}/releases/tag/${primaryManifest.version})`,
            true
          );
          toastMessage(this.plugin, msg, 30, () => {
            if (primaryManifest) {
              window.open(
                `https://github.com/${repositoryPath}/releases/tag/${primaryManifest.version}`
              );
            }
          });
        } else {
          await this.writeReleaseFilesToPluginFolder(primaryManifest.id, releaseFiles);
          await this.plugin.app.plugins.loadManifests();
          await this.reloadPlugin(primaryManifest.id);
          const msg = `${primaryManifest.id}
Plugin has been updated from version ${localManifestJson.version} to ${primaryManifest.version}. `;
          await this.plugin.log(
            msg + `[Release Info](https://github.com/${repositoryPath}/releases/tag/${primaryManifest.version})`,
            true
          );
          toastMessage(this.plugin, msg, 30, () => {
            if (primaryManifest) {
              window.open(
                `https://github.com/${repositoryPath}/releases/tag/${primaryManifest.version}`
              );
            }
          });
        }
      } else if (reportIfNotUpdted)
        toastMessage(this.plugin, `No update available for ${repositoryPath}`, 3);
    }
    return true;
  }
  /**
   * reloads a plugin (assuming it has been enabled by user)
   * pjeby, Thanks Bro https://github.com/pjeby/hot-reload/blob/master/main.js
   *
   * @param pluginName - name of plugin
   *
   */
  async reloadPlugin(pluginName) {
    const { plugins } = this.plugin.app;
    try {
      await plugins.disablePlugin(pluginName);
      await plugins.enablePlugin(pluginName);
    } catch (e) {
      if (this.plugin.settings.debuggingMode)
        console.log("reload plugin", e);
    }
  }
  /**
   * updates a beta plugin
   *
   * @param repositoryPath - repository path on GitHub
   * @param onlyCheckDontUpdate - only looks for update
   *
   */
  async updatePlugin(repositoryPath, onlyCheckDontUpdate = false, reportIfNotUpdted = false, forceReinstall = false) {
    const result = await this.addPlugin(
      repositoryPath,
      true,
      onlyCheckDontUpdate,
      reportIfNotUpdted,
      "",
      forceReinstall
    );
    if (!result && !onlyCheckDontUpdate)
      toastMessage(this.plugin, `${repositoryPath}
Update of plugin failed.`);
    return result;
  }
  /**
   * walks through the list of plugins without frozen version and performs an update
   *
   * @param showInfo - should this with a started/completed message - useful when ran from CP
   *
   */
  async checkForPluginUpdatesAndInstallUpdates(showInfo = false, onlyCheckDontUpdate = false) {
    if (!await isConnectedToInternet()) {
      console.log("BRAT: No internet detected.");
      return;
    }
    let newNotice;
    const msg1 = `Checking for plugin updates STARTED`;
    await this.plugin.log(msg1, true);
    if (showInfo && this.plugin.settings.notificationsEnabled)
      newNotice = new import_obsidian7.Notice(`BRAT
${msg1}`, 3e4);
    const pluginSubListFrozenVersionNames = new Set(
      this.plugin.settings.pluginSubListFrozenVersion.map((f) => f.repo)
    );
    for (const bp of this.plugin.settings.pluginList) {
      if (pluginSubListFrozenVersionNames.has(bp)) {
        continue;
      }
      await this.updatePlugin(bp, onlyCheckDontUpdate);
    }
    const msg2 = `Checking for plugin updates COMPLETED`;
    await this.plugin.log(msg2, true);
    if (showInfo) {
      if (newNotice) {
        newNotice.hide();
      }
      toastMessage(this.plugin, msg2, 10);
    }
  }
  /**
   * Removes the beta plugin from the list of beta plugins (does not delete them from disk)
   *
   * @param betaPluginID - repository path
   *
   */
  deletePlugin(repositoryPath) {
    const msg = `Removed ${repositoryPath} from BRAT plugin list`;
    void this.plugin.log(msg, true);
    this.plugin.settings.pluginList = this.plugin.settings.pluginList.filter(
      (b) => b !== repositoryPath
    );
    this.plugin.settings.pluginSubListFrozenVersion = this.plugin.settings.pluginSubListFrozenVersion.filter(
      (b) => b.repo !== repositoryPath
    );
    void this.plugin.saveSettings();
  }
  /**
   * Returns a list of plugins that are currently enabled or currently disabled
   *
   * @param enabled - true for enabled plugins, false for disabled plutings
   *
   * @returns manifests  of plugins
   */
  getEnabledDisabledPlugins(enabled) {
    const pl = this.plugin.app.plugins;
    const manifests = Object.values(pl.manifests);
    const enabledPlugins = Object.values(pl.plugins).map(
      (p) => p.manifest
    );
    return enabled ? manifests.filter(
      (manifest) => enabledPlugins.find((pluginName) => manifest.id === pluginName.id)
    ) : manifests.filter(
      (manifest) => !enabledPlugins.find((pluginName) => manifest.id === pluginName.id)
    );
  }
};

// src/ui/icons.ts
var import_obsidian8 = require("obsidian");
function addIcons() {
  (0, import_obsidian8.addIcon)(
    "BratIcon",
    `<path fill="currentColor" stroke="currentColor"  d="M 41.667969 41.667969 C 41.667969 39.367188 39.800781 37.5 37.5 37.5 C 35.199219 37.5 33.332031 39.367188 33.332031 41.667969 C 33.332031 43.96875 35.199219 45.832031 37.5 45.832031 C 39.800781 45.832031 41.667969 43.96875 41.667969 41.667969 Z M 60.417969 58.582031 C 59.460938 58.023438 58.320312 57.867188 57.25 58.148438 C 56.179688 58.429688 55.265625 59.125 54.707031 60.082031 C 53.746094 61.777344 51.949219 62.820312 50 62.820312 C 48.050781 62.820312 46.253906 61.777344 45.292969 60.082031 C 44.734375 59.125 43.820312 58.429688 42.75 58.148438 C 41.679688 57.867188 40.539062 58.023438 39.582031 58.582031 C 37.597656 59.726562 36.910156 62.257812 38.042969 64.25 C 40.5 68.53125 45.0625 71.171875 50 71.171875 C 54.9375 71.171875 59.5 68.53125 61.957031 64.25 C 63.089844 62.257812 62.402344 59.726562 60.417969 58.582031 Z M 62.5 37.5 C 60.199219 37.5 58.332031 39.367188 58.332031 41.667969 C 58.332031 43.96875 60.199219 45.832031 62.5 45.832031 C 64.800781 45.832031 66.667969 43.96875 66.667969 41.667969 C 66.667969 39.367188 64.800781 37.5 62.5 37.5 Z M 50 8.332031 C 26.988281 8.332031 8.332031 26.988281 8.332031 50 C 8.332031 73.011719 26.988281 91.667969 50 91.667969 C 73.011719 91.667969 91.667969 73.011719 91.667969 50 C 91.667969 26.988281 73.011719 8.332031 50 8.332031 Z M 50 83.332031 C 33.988281 83.402344 20.191406 72.078125 17.136719 56.363281 C 14.078125 40.644531 22.628906 24.976562 37.5 19.042969 C 37.457031 19.636719 37.457031 20.238281 37.5 20.832031 C 37.5 27.738281 43.097656 33.332031 50 33.332031 C 52.300781 33.332031 54.167969 31.46875 54.167969 29.167969 C 54.167969 26.867188 52.300781 25 50 25 C 47.699219 25 45.832031 23.132812 45.832031 20.832031 C 45.832031 18.53125 47.699219 16.667969 50 16.667969 C 68.410156 16.667969 83.332031 31.589844 83.332031 50 C 83.332031 68.410156 68.410156 83.332031 50 83.332031 Z M 50 83.332031 " />`
  );
}

// src/utils/logging.ts
var import_obsidian9 = require("obsidian");
var import_obsidian_daily_notes_interface = __toESM(require_main());
async function logger(plugin, textToLog, verboseLoggingOn = false) {
  if (plugin.settings.debuggingMode)
    console.log("BRAT: " + textToLog);
  if (plugin.settings.loggingEnabled) {
    if (!plugin.settings.loggingVerboseEnabled && verboseLoggingOn) {
      return;
    } else {
      const fileName = plugin.settings.loggingPath + ".md";
      const dateOutput = "[[" + (0, import_obsidian9.moment)().format((0, import_obsidian_daily_notes_interface.getDailyNoteSettings)().format).toString() + "]] " + (0, import_obsidian9.moment)().format("HH:mm");
      const os = window.require("os");
      const machineName = import_obsidian9.Platform.isDesktop ? os.hostname() : "MOBILE";
      let output = dateOutput + " " + machineName + " " + textToLog.replace("\n", " ") + "\n\n";
      if (await plugin.app.vault.adapter.exists(fileName)) {
        const fileContents = await plugin.app.vault.adapter.read(fileName);
        output = output + fileContents;
        const file = plugin.app.vault.getAbstractFileByPath(fileName);
        await plugin.app.vault.modify(file, output);
      } else
        await plugin.app.vault.create(fileName, output);
    }
  }
}

// src/ui/GenericFuzzySuggester.ts
var import_obsidian10 = require("obsidian");
var GenericFuzzySuggester = class extends import_obsidian10.FuzzySuggestModal {
  constructor(plugin) {
    super(plugin.app);
    this.data = [];
    this.scope.register(["Shift"], "Enter", (evt) => {
      this.enterTrigger(evt);
    });
    this.scope.register(["Ctrl"], "Enter", (evt) => {
      this.enterTrigger(evt);
    });
  }
  setSuggesterData(suggesterData) {
    this.data = suggesterData;
  }
  display(callBack) {
    this.callbackFunction = callBack;
    this.open();
  }
  getItems() {
    return this.data;
  }
  getItemText(item) {
    return item.display;
  }
  onChooseItem() {
    return;
  }
  renderSuggestion(item, el) {
    el.createEl("div", { text: item.item.display });
  }
  enterTrigger(evt) {
    var _a;
    const selectedText = (_a = document.querySelector(".suggestion-item.is-selected div")) == null ? void 0 : _a.textContent;
    const item = this.data.find((i) => i.display === selectedText);
    if (item) {
      this.invokeCallback(item, evt);
      this.close();
    }
  }
  onChooseSuggestion(item, evt) {
    this.invokeCallback(item.item, evt);
  }
  invokeCallback(item, evt) {
    if (typeof this.callbackFunction === "function") {
      this.callbackFunction(item, evt);
    }
  }
};

// src/ui/PluginCommands.ts
var PluginCommands = class {
  constructor(plugin) {
    this.bratCommands = [
      {
        id: "BRAT-AddBetaPlugin",
        icon: "BratIcon",
        name: "Plugins: Add a beta plugin for testing",
        showInRibbon: true,
        callback: () => {
          this.plugin.betaPlugins.displayAddNewPluginModal(false, false);
        }
      },
      {
        id: "BRAT-AddBetaPluginWithFrozenVersion",
        icon: "BratIcon",
        name: "Plugins: Add a beta plugin with frozen version based on a release tag",
        showInRibbon: true,
        callback: () => {
          this.plugin.betaPlugins.displayAddNewPluginModal(false, true);
        }
      },
      {
        id: "BRAT-checkForUpdatesAndUpdate",
        icon: "BratIcon",
        name: "Plugins: Check for updates to all beta plugins and UPDATE",
        showInRibbon: true,
        callback: async () => {
          await this.plugin.betaPlugins.checkForPluginUpdatesAndInstallUpdates(true, false);
        }
      },
      {
        id: "BRAT-checkForUpdatesAndDontUpdate",
        icon: "BratIcon",
        name: "Plugins: Only check for updates to beta plugins, but don't Update",
        showInRibbon: true,
        callback: async () => {
          await this.plugin.betaPlugins.checkForPluginUpdatesAndInstallUpdates(true, true);
        }
      },
      {
        id: "BRAT-updateOnePlugin",
        icon: "BratIcon",
        name: "Plugins: Choose a single plugin version to update",
        showInRibbon: true,
        callback: () => {
          const pluginSubListFrozenVersionNames = new Set(
            this.plugin.settings.pluginSubListFrozenVersion.map((f) => f.repo)
          );
          const pluginList = Object.values(this.plugin.settings.pluginList).filter((f) => !pluginSubListFrozenVersionNames.has(f)).map((m) => {
            return { display: m, info: m };
          });
          const gfs = new GenericFuzzySuggester(this.plugin);
          gfs.setSuggesterData(pluginList);
          gfs.display((results) => {
            const msg = `Checking for updates for ${results.info}`;
            void this.plugin.log(msg, true);
            toastMessage(this.plugin, `
${msg}`, 3);
            void this.plugin.betaPlugins.updatePlugin(results.info, false, true);
          });
        }
      },
      {
        id: "BRAT-reinstallOnePlugin",
        icon: "BratIcon",
        name: "Plugins: Choose a single plugin to reinstall",
        showInRibbon: true,
        callback: () => {
          const pluginSubListFrozenVersionNames = new Set(
            this.plugin.settings.pluginSubListFrozenVersion.map((f) => f.repo)
          );
          const pluginList = Object.values(this.plugin.settings.pluginList).filter((f) => !pluginSubListFrozenVersionNames.has(f)).map((m) => {
            return { display: m, info: m };
          });
          const gfs = new GenericFuzzySuggester(this.plugin);
          gfs.setSuggesterData(pluginList);
          gfs.display((results) => {
            const msg = `Reinstalling ${results.info}`;
            toastMessage(this.plugin, `
${msg}`, 3);
            void this.plugin.log(msg, true);
            void this.plugin.betaPlugins.updatePlugin(
              results.info,
              false,
              false,
              true
            );
          });
        }
      },
      {
        id: "BRAT-restartPlugin",
        icon: "BratIcon",
        name: "Plugins: Restart a plugin that is already installed",
        showInRibbon: true,
        callback: () => {
          const pluginList = Object.values(
            this.plugin.app.plugins.manifests
          ).map((m) => {
            return { display: m.id, info: m.id };
          });
          const gfs = new GenericFuzzySuggester(this.plugin);
          gfs.setSuggesterData(pluginList);
          gfs.display((results) => {
            toastMessage(
              this.plugin,
              `${results.info}
Plugin reloading .....`,
              5
            );
            void this.plugin.betaPlugins.reloadPlugin(results.info);
          });
        }
      },
      {
        id: "BRAT-disablePlugin",
        icon: "BratIcon",
        name: "Plugins: Disable a plugin - toggle it off",
        showInRibbon: true,
        callback: () => {
          const pluginList = this.plugin.betaPlugins.getEnabledDisabledPlugins(true).map((manifest) => {
            return { display: `${manifest.name} (${manifest.id})`, info: manifest.id };
          });
          const gfs = new GenericFuzzySuggester(this.plugin);
          gfs.setSuggesterData(pluginList);
          gfs.display((results) => {
            void this.plugin.log(`${results.display} plugin disabled`, false);
            if (this.plugin.settings.debuggingMode)
              console.log(results.info);
            void this.plugin.app.plugins.disablePluginAndSave(results.info);
          });
        }
      },
      {
        id: "BRAT-enablePlugin",
        icon: "BratIcon",
        name: "Plugins: Enable a plugin - toggle it on",
        showInRibbon: true,
        callback: () => {
          const pluginList = this.plugin.betaPlugins.getEnabledDisabledPlugins(false).map((manifest) => {
            return { display: `${manifest.name} (${manifest.id})`, info: manifest.id };
          });
          const gfs = new GenericFuzzySuggester(this.plugin);
          gfs.setSuggesterData(pluginList);
          gfs.display((results) => {
            void this.plugin.log(`${results.display} plugin enabled`, false);
            void this.plugin.app.plugins.enablePluginAndSave(results.info);
          });
        }
      },
      {
        id: "BRAT-openGitHubZRepository",
        icon: "BratIcon",
        name: "Plugins: Open the GitHub repository for a plugin",
        showInRibbon: true,
        callback: async () => {
          const communityPlugins = await grabCommmunityPluginList(
            this.plugin.settings.debuggingMode
          );
          if (communityPlugins) {
            const communityPluginList = Object.values(
              communityPlugins
            ).map((p) => {
              return { display: `Plugin: ${p.name}  (${p.repo})`, info: p.repo };
            });
            const bratList = Object.values(
              this.plugin.settings.pluginList
            ).map((p) => {
              return { display: "BRAT: " + p, info: p };
            });
            communityPluginList.forEach((si) => bratList.push(si));
            const gfs = new GenericFuzzySuggester(this.plugin);
            gfs.setSuggesterData(bratList);
            gfs.display((results) => {
              if (results.info)
                window.open(`https://github.com/${results.info}`);
            });
          }
        }
      },
      {
        id: "BRAT-openGitHubRepoTheme",
        icon: "BratIcon",
        name: "Themes: Open the GitHub repository for a theme (appearance)",
        showInRibbon: true,
        callback: async () => {
          const communityTheme = await grabCommmunityThemesList(
            this.plugin.settings.debuggingMode
          );
          if (communityTheme) {
            const communityThemeList = Object.values(communityTheme).map(
              (p) => {
                return { display: `Theme: ${p.name}  (${p.repo})`, info: p.repo };
              }
            );
            const gfs = new GenericFuzzySuggester(this.plugin);
            gfs.setSuggesterData(communityThemeList);
            gfs.display((results) => {
              if (results.info)
                window.open(`https://github.com/${results.info}`);
            });
          }
        }
      },
      {
        id: "BRAT-opentPluginSettings",
        icon: "BratIcon",
        name: "Plugins: Open Plugin Settings Tab",
        showInRibbon: true,
        callback: () => {
          const settings = this.plugin.app.setting;
          const listOfPluginSettingsTabs = Object.values(
            settings.pluginTabs
          ).map((t) => {
            return { display: "Plugin: " + t.name, info: t.id };
          });
          const gfs = new GenericFuzzySuggester(this.plugin);
          const listOfCoreSettingsTabs = Object.values(
            settings.settingTabs
          ).map((t) => {
            return { display: "Core: " + t.name, info: t.id };
          });
          listOfPluginSettingsTabs.forEach((si) => listOfCoreSettingsTabs.push(si));
          gfs.setSuggesterData(listOfCoreSettingsTabs);
          gfs.display((results) => {
            settings.open();
            settings.openTabById(results.info);
          });
        }
      },
      {
        id: "BRAT-GrabBetaTheme",
        icon: "BratIcon",
        name: "Themes: Grab a beta theme for testing from a Github repository",
        showInRibbon: true,
        callback: () => {
          new AddNewTheme(this.plugin).open();
        }
      },
      {
        id: "BRAT-updateBetaThemes",
        icon: "BratIcon",
        name: "Themes: Update beta themes",
        showInRibbon: true,
        callback: async () => {
          await themesCheckAndUpdates(this.plugin, true);
        }
      },
      {
        id: "BRAT-allCommands",
        icon: "BratIcon",
        name: "All Commands list",
        showInRibbon: false,
        callback: () => {
          this.ribbonDisplayCommands();
        }
      }
    ];
    this.plugin = plugin;
    this.bratCommands.forEach((item) => {
      this.plugin.addCommand({
        id: item.id,
        name: item.name,
        icon: item.icon,
        callback: () => {
          item.callback();
        }
      });
    });
  }
  ribbonDisplayCommands() {
    const bratCommandList = [];
    this.bratCommands.forEach((cmd) => {
      if (cmd.showInRibbon)
        bratCommandList.push({ display: cmd.name, info: cmd.callback });
    });
    const gfs = new GenericFuzzySuggester(this.plugin);
    const settings = this.plugin.app.setting;
    const listOfCoreSettingsTabs = Object.values(
      settings.settingTabs
    ).map((t) => {
      return {
        display: "Core: " + t.name,
        info: () => {
          settings.open();
          settings.openTabById(t.id);
        }
      };
    });
    const listOfPluginSettingsTabs = Object.values(
      settings.pluginTabs
    ).map((t) => {
      return {
        display: "Plugin: " + t.name,
        info: () => {
          settings.open();
          settings.openTabById(t.id);
        }
      };
    });
    bratCommandList.push({
      display: "---- Core Plugin Settings ----",
      info: () => {
        this.ribbonDisplayCommands();
      }
    });
    listOfCoreSettingsTabs.forEach((si) => bratCommandList.push(si));
    bratCommandList.push({
      display: "---- Plugin Settings ----",
      info: () => {
        this.ribbonDisplayCommands();
      }
    });
    listOfPluginSettingsTabs.forEach((si) => bratCommandList.push(si));
    gfs.setSuggesterData(bratCommandList);
    gfs.display((results) => {
      if (typeof results.info === "function") {
        results.info();
      }
    });
  }
};

// src/utils/BratAPI.ts
var BratAPI = class {
  constructor(plugin) {
    this.console = (logDescription, ...outputs) => {
      console.log("BRAT: " + logDescription, ...outputs);
    };
    this.themes = {
      themeseCheckAndUpates: async (showInfo) => {
        await themesCheckAndUpdates(this.plugin, showInfo);
      },
      themeInstallTheme: async (cssGithubRepository) => {
        const scrubbedAddress = cssGithubRepository.replace("https://github.com/", "");
        await themeSave(this.plugin, scrubbedAddress, true);
      },
      themesDelete: (cssGithubRepository) => {
        const scrubbedAddress = cssGithubRepository.replace("https://github.com/", "");
        themeDelete(this.plugin, scrubbedAddress);
      },
      grabCommmunityThemeCssFile: async (repositoryPath, betaVersion = false) => {
        return await grabCommmunityThemeCssFile(
          repositoryPath,
          betaVersion,
          this.plugin.settings.debuggingMode
        );
      },
      grabChecksumOfThemeCssFile: async (repositoryPath, betaVersion = false) => {
        return await grabChecksumOfThemeCssFile(
          repositoryPath,
          betaVersion,
          this.plugin.settings.debuggingMode
        );
      },
      grabLastCommitDateForFile: async (repositoryPath, path) => {
        return await grabLastCommitDateForFile(repositoryPath, path);
      }
    };
    this.plugin = plugin;
  }
};

// src/main.ts
var ThePlugin = class extends import_obsidian11.Plugin {
  constructor() {
    super(...arguments);
    this.APP_NAME = "BRAT";
    this.APP_ID = "obsidian42-brat";
    this.settings = DEFAULT_SETTINGS;
    this.betaPlugins = new BetaPlugins(this);
    this.commands = new PluginCommands(this);
    this.bratApi = new BratAPI(this);
    this.obsidianProtocolHandler = (params) => {
      if (!params.plugin && !params.theme) {
        toastMessage(this, `Could not locate the repository from the URL.`, 10);
        return;
      }
      for (const which of ["plugin", "theme"]) {
        if (params[which]) {
          const modal = which === "plugin" ? new AddNewPluginModal(this, this.betaPlugins) : new AddNewTheme(this);
          modal.address = params[which];
          modal.open();
          return;
        }
      }
    };
  }
  async onload() {
    console.log("loading " + this.APP_NAME);
    await this.loadSettings();
    this.addSettingTab(new BratSettingsTab(this.app, this));
    addIcons();
    this.showRibbonButton();
    this.registerObsidianProtocolHandler("brat", this.obsidianProtocolHandler);
    this.app.workspace.onLayoutReady(() => {
      if (this.settings.updateAtStartup) {
        setTimeout(() => {
          void this.betaPlugins.checkForPluginUpdatesAndInstallUpdates(false);
        }, 6e4);
      }
      if (this.settings.updateThemesAtStartup) {
        setTimeout(() => {
          void themesCheckAndUpdates(this, false);
        }, 12e4);
      }
      setTimeout(() => {
        window.bratAPI = this.bratApi;
      }, 500);
    });
  }
  showRibbonButton() {
    this.addRibbonIcon("BratIcon", "BRAT", () => {
      this.commands.ribbonDisplayCommands();
    });
  }
  async log(textToLog, verbose = false) {
    await logger(this, textToLog, verbose);
  }
  onunload() {
    console.log("unloading " + this.APP_NAME);
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
