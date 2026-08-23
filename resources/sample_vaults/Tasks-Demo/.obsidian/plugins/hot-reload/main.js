var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// hot-reload.ts
var hot_reload_exports = {};
__export(hot_reload_exports, {
  default: () => HotReload
});
module.exports = __toCommonJS(hot_reload_exports);
var import_obsidian = require("obsidian");

// node_modules/.pnpm/monkey-around@3.0.0/node_modules/monkey-around/dist/index.mjs
function around(obj, factories) {
  const removers = Object.keys(factories).map((key) => around1(obj, key, factories[key]));
  return removers.length === 1 ? removers[0] : function() {
    removers.forEach((r) => r());
  };
}
function around1(obj, method, createWrapper) {
  const inherited = obj[method], hadOwn = obj.hasOwnProperty(method), original = hadOwn ? inherited : function() {
    return Object.getPrototypeOf(obj)[method].apply(this, arguments);
  };
  let current = createWrapper(original);
  if (inherited)
    Object.setPrototypeOf(current, inherited);
  Object.setPrototypeOf(wrapper, current);
  obj[method] = wrapper;
  return remove;
  function wrapper(...args) {
    if (current === original && obj[method] === wrapper)
      remove();
    return current.apply(this, args);
  }
  function remove() {
    if (obj[method] === wrapper) {
      if (hadOwn)
        obj[method] = original;
      else
        delete obj[method];
    }
    if (current === original)
      return;
    current = original;
    Object.setPrototypeOf(wrapper, inherited || Function);
  }
}

// hot-reload.ts
var watchNeeded = !import_obsidian.Platform.isMacOS && !import_obsidian.Platform.isWin;
var HotReload = class extends import_obsidian.Plugin {
  constructor() {
    super(...arguments);
    this.statCache = /* @__PURE__ */ new Map();
    // path -> Stat
    this.run = taskQueue();
    this.reindexPlugins = (0, import_obsidian.debounce)(() => void this.run(() => this.getPluginNames()), 250, true);
    this.pluginReloaders = {};
    this.pluginNames = {};
    this.enabledPlugins = /* @__PURE__ */ new Set();
    this.currentlyLoading = 0;
    this.settingReloader = new SettingReloader(this);
    this.isSymlink = (adapter, path) => {
      const realPath = [adapter.basePath, path].join("/");
      const lstat = adapter.fs.lstatSync(realPath, { throwIfNoEntry: false });
      return lstat && lstat.isSymbolicLink();
    };
    this.checkVersion = async (plugin) => {
      const { dir } = this.app.plugins.manifests[plugin] || {};
      if (dir)
        for (const file of ["main.js", "styles.css"]) {
          const path = `${dir}/${file}`;
          const stat = await this.app.vault.adapter.stat(path);
          if (stat) {
            if (this.statCache.has(path) && stat.mtime !== this.statCache.get(path).mtime) {
              this.requestReload(plugin);
            }
            this.statCache.set(path, stat);
          }
        }
      else {
        delete this.pluginNames[plugin];
      }
    };
    this.onFileChange = (filename) => {
      if (!filename.startsWith(this.app.plugins.getPluginFolder() + "/"))
        return;
      const path = filename.split("/");
      const base = path.pop(), dir = path.pop();
      if (path.length === 1 && dir === "plugins")
        return this.watch(filename);
      if (path.length != 2)
        return;
      const plugin = dir && this.pluginNames[dir];
      if (base === "manifest.json" || base === ".hotreload" || base === ".git" || !plugin)
        return this.reindexPlugins();
      if (base !== "main.js" && base !== "styles.css")
        return;
      void this.checkVersion(plugin);
    };
  }
  onload() {
    this.app.workspace.onLayoutReady(async () => {
      await this.getPluginNames();
      this.addCommand({
        id: "scan-for-changes",
        name: "Check plugins for changes and reload them",
        callback: this.reindexPlugins
      });
      this.registerEvent(this.app.vault.on("raw", this.onFileChange));
      this.watch(this.app.plugins.getPluginFolder());
    });
  }
  watch(path) {
    const { adapter } = this.app.vault;
    if (!(adapter instanceof import_obsidian.FileSystemAdapter) || hasOwnProperty(adapter.watchers, path))
      return;
    void (async () => {
      if ((await adapter.stat(path))?.type !== "folder")
        return;
      if (watchNeeded || this.isSymlink(adapter, path))
        adapter.startWatchPath(path);
    })();
  }
  checkVersions() {
    return Promise.all(Object.values(this.pluginNames).map(this.checkVersion));
  }
  async getPluginNames() {
    const plugins = {}, enabled = /* @__PURE__ */ new Set();
    for (const { id, dir } of Object.values(this.app.plugins.manifests)) {
      this.watch(dir);
      plugins[dir.split("/").pop()] = id;
      if (await this.app.vault.exists(dir + "/.git") || await this.app.vault.exists(dir + "/.hotreload"))
        enabled.add(id);
    }
    this.pluginNames = plugins;
    this.enabledPlugins = enabled;
    await this.checkVersions();
  }
  requestReload(plugin) {
    if (!this.enabledPlugins.has(plugin))
      return;
    const reloader = this.pluginReloaders[plugin] || (this.pluginReloaders[plugin] = (0, import_obsidian.debounce)(() => this.run(() => this.reload(plugin).catch(console.error)), 750, true));
    reloader();
  }
  async reload(plugin) {
    const plugins = this.app.plugins;
    if (!plugins.enabledPlugins.has(plugin))
      return;
    this.settingReloader.onPluginDisable(plugin);
    await plugins.disablePlugin(plugin);
    console.debug("disabled", plugin);
    const oldDebug = store.getItem("debug-plugin");
    store.setItem("debug-plugin", "1");
    const uninstall = preventSourcemapStripping(this.app, plugin);
    try {
      await plugins.enablePlugin(plugin);
    } finally {
      if (oldDebug === null)
        store.removeItem("debug-plugin");
      else
        store.setItem("debug-plugin", oldDebug);
      uninstall?.();
    }
    console.debug("enabled", plugin);
    new import_obsidian.Notice(`Plugin "${plugin}" has been reloaded`);
  }
};
function preventSourcemapStripping(app, pluginName) {
  if ((0, import_obsidian.requireApiVersion)("1.6"))
    return around(app.vault.adapter, {
      read(old) {
        return function(path, ...args) {
          const res = old.call(this, path, ...args);
          if (!path.endsWith(`/${pluginName}/main.js`))
            return res;
          return res.then((txt) => txt + "\n/* nosourcemap */");
        };
      }
    });
}
function taskQueue() {
  let last = Promise.resolve();
  return (action) => {
    return !action ? last : last = new Promise(
      (res, rej) => void last.finally(
        () => {
          try {
            res(action());
          } catch (e) {
            let _e = e;
            rej(_e);
          }
        }
      )
    );
  };
}
var SettingReloader = class extends import_obsidian.Component {
  constructor(plugin) {
    super();
    this.plugin = plugin;
    this.app = this.plugin.app;
    this.left = 0;
    this.top = 0;
    this.lastTab = void 0;
  }
  /**
   * Is the plugin's setting tab active and on-screen?  If so, save its scroll
   * position and set it up to refresh after load.
   */
  onPluginDisable(pluginID) {
    if (this.app.setting.activeTab?.id === pluginID && this.app.setting.containerEl.isShown()) {
      const { scrollTop: top, scrollLeft: left } = this.app.setting.activeTab.containerEl;
      this.lastTab = pluginID;
      this.left = left;
      this.top = top;
      this.load();
    }
  }
  onload() {
    const self = /* @__PURE__ */ (() => this)();
    this.plugin.addChild(this);
    this.register(around(import_obsidian.Plugin.prototype, {
      addSettingTab(next) {
        return function(tab, ...args) {
          next.call(this, tab, ...args);
          if (self.lastTab && this.manifest.id === self.lastTab) {
            const { lastTab, left, top } = self;
            self.lastTab = void 0;
            void activeWindow.sleep(100).then(() => {
              if (self.lastTab || // another state was saved
              !this.app.setting.containerEl.isShown() || // settings not open
              this.app.setting.activeTab)
                return;
              this.app.setting.openTabById(lastTab);
              tab.containerEl.scrollTo({ left, top });
            });
          }
        };
      }
    }));
  }
};
function hasOwnProperty(ob, prop) {
  return !!ob && Object.prototype.hasOwnProperty.call(ob, prop);
}
var store = window["localStorage"];

/* nosourcemap */