var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};

// src/main.ts
__export(exports, {
  default: () => TabsPlugin
});

// src/settings.ts
var import_obsidian = __toModule(require("obsidian"));
var DEFAULT_SETTINGS = {
  split: "tab: ",
  defaultTabNavItem: "New tab",
  defaultTabContent: "New tab content",
  actionButtonType: "action-add",
  ignoreNotice: false,
  autorefreshMarkdownView: true,
  dragAndDrop: false,
  doubleClickToEdit: false,
  showToolbar: true,
  tabSize: 4,
  editorAutoSaveInterval: 5e3,
  defaultTabsBorder: "border-hover",
  defaultTabsBorderColor: "#e0e0e0",
  hideTabsEditBlockButton: true,
  defaultTitleLineClamp: "one",
  defaultTitlePosition: "top",
  defaultTitleLimited: false,
  defaultTabsContentsPadding: "1em 2em",
  defaultTabsContentsMaxHeight: "none"
};
var TabsSettingsTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.needRefresh = false;
    this.plugin = plugin;
    app.setting.onClose = () => {
      this.plugin.settings.autorefreshMarkdownView && this.needRefresh && this.plugin.refreshOpenViews() && (this.needRefresh = false);
      app.setting.closeActiveTab();
    };
  }
  display() {
    let { containerEl } = this;
    containerEl.empty();
    this.displayNormalSetting(containerEl);
    this.displayEditorSetting(containerEl);
    this.displayAppearanceSetting(containerEl);
  }
  displayNormalSetting(containerEl) {
    new import_obsidian.Setting(containerEl).setName("Separator").setDesc("The symbols to split each tab").addText((text) => text.setValue(this.plugin.settings.split).setPlaceholder("tab:").onChange((value) => {
      if (value == "") {
        value = "tab:";
      }
      this.plugin.settings.split = value;
      this.plugin.saveSettings();
      this.needRefresh = true;
    })).then((setting) => this.addResetButton(setting, "defaultTabContent"));
    new import_obsidian.Setting(containerEl).setName("Default tabs nav item").setDesc("The default tabs nav item").addText((text) => text.setValue(this.plugin.settings.defaultTabNavItem).setPlaceholder("New tab").onChange((value) => {
      if (value == "") {
        value = "New tab";
      }
      this.plugin.settings.defaultTabNavItem = value;
      this.plugin.saveSettings();
    })).then((setting) => this.addResetButton(setting, "defaultTabNavItem"));
    new import_obsidian.Setting(containerEl).setName("Default tabs content").setDesc("The default tabs content").addTextArea((text) => text.setValue(this.plugin.settings.defaultTabContent).setPlaceholder("New tab content").onChange((value) => {
      if (value == "") {
        value = "New tab content";
      }
      this.plugin.settings.defaultTabContent = value;
    })).then((setting) => this.addResetButton(setting, "defaultTabContent"));
    new import_obsidian.Setting(containerEl).setName("Action button").setDesc("Function of top right button. Select 'None' if you don't need it.").addDropdown((dropdown) => dropdown.addOptions({
      "action-none": "None",
      "action-add": "Add new tab",
      "action-edit": "Edit tab"
    }).setValue(this.plugin.settings.actionButtonType).onChange((value) => {
      this.plugin.settings.actionButtonType = value;
      this.needRefresh = true;
      this.plugin.saveSettings();
      this.sampleTabs.refresh();
    }));
    new import_obsidian.Setting(containerEl).setName("Ignore notice").setDesc("Ignore notice when adding, deleting tabs and so on.").addToggle((toggle) => toggle.setValue(this.plugin.settings.ignoreNotice).onChange((value) => {
      this.plugin.settings.ignoreNotice = value;
      this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName("Autorefresh markdown view").setDesc("When enabled, after you modify the settings of the tabs, all markdown files that opened will automatically refresh when you close the settings panel. If disabled, the changes will not take effect immediately on the Tabs in opened markdown file, and you will need to re-render them matually.").addToggle((toggle) => toggle.setValue(this.plugin.settings.autorefreshMarkdownView).onChange((value) => {
      this.plugin.settings.autorefreshMarkdownView = value;
      this.needRefresh = true;
      this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName("Drag and drop").setDesc("You can drag and drop tabs to reorder them in the same file.").addToggle((toggle) => toggle.setValue(this.plugin.settings.dragAndDrop).onChange((value) => {
      this.plugin.settings.dragAndDrop = value;
      this.needRefresh = true;
      this.plugin.saveSettings();
    }));
  }
  displayEditorSetting(containerEl) {
    new import_obsidian.Setting(containerEl).setName("Editor").setHeading();
    new import_obsidian.Setting(containerEl).setName("Double click to edit").setDesc("Double click tab content to edit").addToggle((toggle) => toggle.setValue(this.plugin.settings.doubleClickToEdit).onChange((value) => {
      this.plugin.settings.doubleClickToEdit = value;
      this.needRefresh = true;
      this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName("Show toolbar").setDesc("Show toolbar in tabs editor").addToggle((toggle) => toggle.setValue(this.plugin.settings.showToolbar).onChange((value) => {
      this.plugin.settings.showToolbar = value;
      this.needRefresh = true;
      this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName("Tab size").setDesc("Tab size in tabs editor").addSlider((slider) => {
      slider.setLimits(1, 8, 1);
      slider.setValue(this.plugin.settings.tabSize);
      slider.onChange((value) => {
        this.plugin.settings.tabSize = value;
        this.needRefresh = true;
        this.plugin.saveSettings();
      });
      slider.setDynamicTooltip();
    }).then((setting) => this.addResetButton(setting, "defaultTabContent"));
    new import_obsidian.Setting(containerEl).setName("Auto save interval").setDesc("Set the duration of inactivity after which the editor will automatically save your work. (default: 5000ms)").addText((text) => text.setValue(this.plugin.settings.editorAutoSaveInterval.toString()).setPlaceholder(DEFAULT_SETTINGS.editorAutoSaveInterval.toString()).onChange((value) => {
      const interval = parseInt(value);
      if (isNaN(interval)) {
        return;
      }
      this.plugin.settings.editorAutoSaveInterval = interval;
      this.needRefresh = true;
      this.plugin.saveSettings();
    })).then((setting) => this.addResetButton(setting, "defaultTabContent"));
  }
  displayAppearanceSetting(containerEl) {
    new import_obsidian.Setting(containerEl).setName("Appearance").setHeading();
    this.sampleTabs = new SampleTabs(this.plugin, this, containerEl.createDiv());
  }
  addResetButton(settingElement, settingKey, refreshView = true) {
    settingElement.addExtraButton((button) => button.setIcon("reset").setTooltip("Reset to default").onClick(() => {
      this.plugin.settings[settingKey] = DEFAULT_SETTINGS[settingKey];
      this.needRefresh = true;
      this.plugin.saveSettings();
      if (refreshView) {
        this.display();
      }
    }));
  }
};
var SampleTabs = class {
  constructor(plugin, settingsTab, containerEl) {
    this.tabsnavItems = [];
    this.tabscontentsItems = [];
    this.plugin = plugin;
    this.settingsTab = settingsTab;
    this.containerEl = containerEl;
    this.createTabsContainer();
    this.createSampleTabNav(this.tabscontainerEl);
    this.createSampleTabContent(this.tabscontainerEl);
  }
  createTabsContainer() {
    this.containerEl.addClass("sample-tabs-container");
    this.tabscontainerEl = this.containerEl.createDiv("tabs-container");
    this.tabscontainerEl.classList.add("tabs-" + this.plugin.settings.defaultTabsBorder);
    this.tabscontainerEl.style.setProperty("--tabs-border-color", this.plugin.settings.defaultTabsBorderColor);
    this.tabscontainerEl.style.setProperty("--tabs-max-height", this.plugin.settings.defaultTabsContentsMaxHeight);
    this.tabscontainerEl.classList.add("tabs-nav-" + this.plugin.settings.defaultTitlePosition);
    if (this.plugin.settings.defaultTitlePosition === "top" || this.plugin.settings.defaultTitlePosition === "bottom") {
      this.tabscontainerEl.classList.add("tabs-nav-line-clamp-" + this.plugin.settings.defaultTitleLineClamp);
    }
    this.tabscontainerEl.style.setProperty("--tabs-contents-padding", this.plugin.settings.defaultTabsContentsPadding);
    const codeblockEditButton = this.containerEl.createDiv("edit-block-button");
    codeblockEditButton.setAttribute("aria-label", "Edit this block");
    (0, import_obsidian.setIcon)(codeblockEditButton, "lucide-code-2");
  }
  createSampleTabNav(tabsContainerEl) {
    this.tabsnavEl = tabsContainerEl.createEl("div");
    this.tabsnavEl.className = "tabs-nav";
    const wrapper = this.tabsnavEl.createEl("div");
    wrapper.className = "tabs-nav-item-wrapper";
    const navitems = ["Tabs", "Tabs nav", "Tabs contents", "Lorem ipsum"];
    this.currentIndex = 0;
    navitems.forEach((tab, index) => {
      const tabitem = wrapper.createEl("div");
      tabitem.classList.add("tabs-nav-item");
      tabitem.textContent = tab;
      if (index === 0) {
        tabitem.classList.add("tabs-nav-item-active");
      }
      tabitem.addEventListener("click", () => {
        wrapper.children[this.currentIndex].classList.remove("tabs-nav-item-active");
        this.tabscontentsItems[this.currentIndex].classList.remove("tabs-content-active");
        this.currentIndex = index;
        wrapper.children[index].classList.add("tabs-nav-item-active");
        this.tabscontentsItems[index].classList.add("tabs-content-active");
      });
    });
    if (this.plugin.settings.actionButtonType !== "action-none") {
      const button = this.tabsnavEl.createEl("div");
      button.className = "tabs-nav-button";
      if (this.plugin.settings.actionButtonType === "action-add") {
        (0, import_obsidian.setIcon)(button, "plus");
      } else if (this.plugin.settings.actionButtonType === "action-edit") {
        (0, import_obsidian.setIcon)(button, "lucide-pencil");
      }
    }
  }
  createSampleTabContent(tabsContainerEl) {
    this.tabscontentsEl = tabsContainerEl.createDiv("tabs-contents");
    const TABS_Tabs = this.tabscontentsEl.createDiv("tabs-content");
    this.generateTabsStyleSettings(TABS_Tabs);
    TABS_Tabs.classList.add("tabs-content-active");
    const TABS_TabsNav = this.tabscontentsEl.createDiv("tabs-content");
    this.generateTabsNavStyleSettings(TABS_TabsNav);
    const TABS_TabsContents = this.tabscontentsEl.createDiv("tabs-content");
    this.generateTabsContentStyleSettings(TABS_TabsContents);
    const TABS_LoremIpsum = this.tabscontentsEl.createDiv("tabs-content");
    const loremIpsum = TABS_LoremIpsum.createEl("p");
    loremIpsum.style.userSelect = "text";
    loremIpsum.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
    this.tabscontentsItems = [TABS_Tabs, TABS_TabsNav, TABS_TabsContents, TABS_LoremIpsum];
  }
  generateTabsStyleSettings(containerEl) {
    new import_obsidian.Setting(containerEl).setName("Tabs border").setDesc("Show tabs border when hover or always.").addDropdown((dropdown) => dropdown.addOptions({
      "border-none": "None",
      "border-hover": "Hover",
      "border-always": "Always"
    }).setValue(this.plugin.settings.defaultTabsBorder).onChange((value) => {
      if (value === this.plugin.settings.defaultTabsBorder) {
        return;
      }
      this.tabscontainerEl.removeClass("tabs-" + this.plugin.settings.defaultTabsBorder);
      this.plugin.settings.defaultTabsBorder = value;
      this.settingsTab.needRefresh = true;
      this.tabscontainerEl.addClass("tabs-" + value);
      this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName("Tabs border color").setDesc("Takes effect when 'Tabs border' set 'Hover' or 'Always").addColorPicker((colorPicker) => colorPicker.setValue(this.plugin.settings.defaultTabsBorderColor).onChange((value) => {
      this.tabscontainerEl.style.setProperty("--tabs-border-color", value);
      this.plugin.settings.defaultTabsBorderColor = value;
      this.settingsTab.needRefresh = true;
      this.plugin.saveSettings();
    })).then((setting) => this.settingsTab.addResetButton(setting, "defaultTabsBorderColor"));
    new import_obsidian.Setting(containerEl).setName("Hide tabs code block edit block button").setDesc("It's just a decorative setting. If you turn on it, you can still control the cursor into tabs to edit the source code.").addToggle((toggel) => toggel.setValue(this.plugin.settings.hideTabsEditBlockButton).onChange((value) => {
      if (value) {
        document.body.addClass("hide-tabs-edit-block-button");
      } else {
        document.body.removeClass("hide-tabs-edit-block-button");
      }
      this.plugin.settings.hideTabsEditBlockButton = value;
      this.plugin.saveSettings();
    }));
  }
  generateTabsNavStyleSettings(containerEl) {
    new import_obsidian.Setting(containerEl).setName("Tabs nav item default position").setDesc("Show tabs nav items at the top, bottom, left or right.").addDropdown((dropdown) => dropdown.addOptions({
      "top": "Top",
      "bottom": "Bottom",
      "left": "Left",
      "right": "Right"
    }).setValue(this.plugin.settings.defaultTitlePosition).onChange((value) => {
      this.refreshNavPosition(this.plugin.settings.defaultTitlePosition, value);
      this.plugin.settings.defaultTitlePosition = value;
      this.settingsTab.needRefresh = true;
      this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName("Tabs nav item line clamp").setDesc("Show tabs nav items in one line or multiple lines. Only works when the position is 'top' or 'bottom'").addDropdown((dropdown) => dropdown.addOptions({
      "one": "One line",
      "multi": "Multiple lines"
    }).setValue(this.plugin.settings.defaultTitleLineClamp === "one" || this.plugin.settings.defaultTitleLineClamp === "multi" ? this.plugin.settings.defaultTitleLineClamp : "one").onChange((value) => {
      this.plugin.settings.defaultTitleLineClamp = value;
      this.settingsTab.needRefresh = true;
      this.plugin.saveSettings();
    }));
    new import_obsidian.Setting(containerEl).setName("Limit tab title width").setDesc("If set true, tab title will be limited to the width of the tab. Otherwise, the tab title will be displayed the full width.").addToggle((toggle) => toggle.setValue(this.plugin.settings.defaultTitleLimited).onChange((value) => {
      if (value) {
        this.tabsnavEl.addClass("tabs-nav-title-limited");
      } else {
        this.tabsnavEl.removeClass("tabs-nav-title-limited");
      }
      this.plugin.settings.defaultTitleLimited = value;
      this.settingsTab.needRefresh = true;
      this.plugin.saveSettings();
    }));
  }
  generateTabsContentStyleSettings(containerEl) {
    new import_obsidian.Setting(containerEl).setName("Tabs contents padding").setDesc('The padding of tabs contents. You can set one to four values(same as css padding). For example, "0" means no padding. "10px" means 10 pixels on all sides. "10px 20px" means 10 pixels on top and bottom, 20 pixels on left and right.Not only "px" but also "em", "rem" and other units are supported.').addText((text) => text.setValue(this.plugin.settings.defaultTabsContentsPadding).setPlaceholder("1em 2em").onChange((value) => {
      this.tabscontainerEl.style.setProperty("--tabs-contents-padding", value);
      this.plugin.settings.defaultTabsContentsPadding = value;
      this.settingsTab.needRefresh = true;
      this.plugin.saveSettings();
    })).then((setting) => this.settingsTab.addResetButton(setting, "defaultTabsContentsPadding"));
    new import_obsidian.Setting(containerEl).setName("Tabs contents max height").setDesc("If a feasible CSS size is set (for example, 250px, 15em, 50vh, etc.), then when the height of the tabs reaches this size, the excess part can be scrolled. Note that the value should not be set too small, otherwise the tabs will not display properly.").addText((text) => text.setValue(this.plugin.settings.defaultTabsContentsMaxHeight).setPlaceholder("none").onChange((value) => {
      if (value !== "none") {
        this.tabscontainerEl.addClass("tabs-height-limited");
        this.tabscontainerEl.setAttribute("style", "--tabs-max-height: none;");
      } else {
        this.tabscontainerEl.removeClass("tabs-height-limited");
        this.tabscontainerEl.style.removeProperty("--tabs-max-height");
      }
      this.plugin.settings.defaultTabsContentsMaxHeight = value;
      this.settingsTab.needRefresh = true;
      this.plugin.saveSettings();
    })).then((setting) => this.settingsTab.addResetButton(setting, "defaultTabsMaxHeight"));
  }
  refreshNavPosition(originPosition, newPositon) {
    if (this.tabscontainerEl) {
      this.tabscontainerEl.classList.remove("tabs-nav-" + originPosition);
      this.tabscontainerEl.classList.add("tabs-nav-" + newPositon);
    }
  }
  refresh() {
    this.clear();
    this.createTabsContainer();
    this.createSampleTabNav(this.tabscontainerEl);
    this.createSampleTabContent(this.tabscontainerEl);
  }
  clear() {
    this.containerEl.empty();
  }
};

// src/main.ts
var import_obsidian10 = __toModule(require("obsidian"));

// src/components/tabs/tabs.ts
var import_obsidian6 = __toModule(require("obsidian"));

// src/components/tabs/tabcontent.ts
var import_obsidian2 = __toModule(require("obsidian"));
var TabContent = class {
  constructor(index, title, content2, app, context) {
    this.isActiveed = false;
    this.index = index;
    this.title = title;
    this.content = content2;
    this.createTabContentEl(content2, app, context);
  }
  createTabContentEl(content2, app, context) {
    this.contentEl = createDiv();
    this.contentEl.className = "tabs-content";
    const tabComponent = new import_obsidian2.MarkdownRenderChild(this.contentEl);
    import_obsidian2.MarkdownRenderer.render(app, content2, this.contentEl, context == null ? void 0 : context.sourcePath, tabComponent);
  }
};

// src/components/tabs/tabcontents.ts
var TabContents = class {
  constructor(plugin, tabcontents) {
    this.currentTab = 0;
    this.plugin = plugin;
    this.tabcontents = tabcontents;
    this.tabcontentsEl = this.createTabContentsEl();
    this.tabcontents[0].isActiveed = true;
    this.tabcontents[0].contentEl.classList.add("tabs-content-active");
  }
  createTabContentsEl() {
    const element = document.createElement("div");
    element.className = "tabs-contents";
    this.tabcontents.forEach((tab) => {
      element.appendChild(tab.contentEl);
    });
    return element;
  }
  refreshActiveTabContent(index) {
    this.tabcontents[this.currentTab].isActiveed = false;
    this.tabcontents[this.currentTab].contentEl.classList.remove("tabs-content-active");
    this.tabcontents[index].isActiveed = true;
    this.tabcontents[index].contentEl.classList.add("tabs-content-active");
    this.currentTab = index;
  }
};

// src/components/tabs/tabmenu.ts
var import_obsidian3 = __toModule(require("obsidian"));
var TabMenu = class extends import_obsidian3.Menu {
  constructor(tabs, e) {
    super();
    this.addItem((item) => {
      item.setTitle("Add new tab");
      item.setIcon("plus");
      item.onClick(() => {
        const activeView = tabs.app.workspace.getActiveViewOfType(import_obsidian3.MarkdownView);
        const activeEditor = activeView.editor;
        activeEditor.setLine(tabs.sectionInfo.lineEnd, tabs.split + tabs.plugin.settings.defaultTabNavItem + "\n" + tabs.plugin.settings.defaultTabContent + "\n" + activeEditor.getLine(tabs.sectionInfo.lineEnd));
        !tabs.plugin.settings.ignoreNotice && new import_obsidian3.Notice("\u{1F7E2} Add new tab successfully");
      });
    });
    this.addItem((item) => {
      item.setTitle("Delete tab");
      item.setIcon("trash");
      item.onClick(() => {
        var _a2, _b;
        let deleteIndex = -1;
        for (let i = 0; i < tabs.tabsNav.navItems.length; i++) {
          if (tabs.tabsNav.navItems[i].tabitemEl === e.target) {
            deleteIndex = i;
            break;
          }
        }
        if (deleteIndex === -1) {
          !tabs.plugin.settings.ignoreNotice && new import_obsidian3.Notice("\u{1F534} Not a valid tab.");
          return;
        }
        const deleteTabTitle = tabs.tabsNav.navItems[deleteIndex].title;
        let newDoc = "";
        for (let i = 0; i < tabs.tabsNav.navItems.length; i++) {
          if (i !== deleteIndex) {
            newDoc += tabs.split + tabs.tabsNav.navItems[i].title.trim() + "\n" + tabs.tabsContents.tabcontents[i].content.trim() + "\n";
          }
        }
        newDoc = tabs.backquote.repeat(tabs.backquoteCount) + "tabs\n" + tabs.tabsConfig.rawConfig + "\n" + newDoc + tabs.backquote.repeat(tabs.backquoteCount);
        (_b = tabs.activeView) == null ? void 0 : _b.editor.replaceRange(newDoc, { line: tabs.sectionInfo.lineStart, ch: 0 }, { line: tabs.sectionInfo.lineEnd, ch: (_a2 = tabs.activeView) == null ? void 0 : _a2.editor.getLine(tabs.sectionInfo.lineEnd).length });
        !tabs.plugin.settings.ignoreNotice && new import_obsidian3.Notice("\u{1F7E2} Delete " + deleteTabTitle + " successfully");
      });
    });
    this.addItem((item) => {
      item.setTitle("Copy tab");
      item.setIcon("copy");
      item.onClick(() => {
        let copyIndex = -1;
        let copyContent = "";
        for (let i = 0; i < tabs.tabsNav.navItems.length; i++) {
          if (tabs.tabsNav.navItems[i].tabitemEl == e.target) {
            copyIndex = i;
            copyContent = tabs.split + tabs.tabsNav.navItems[i].title + "\n" + tabs.tabsContents.tabcontents[i].content;
            break;
          }
        }
        if (copyIndex === -1) {
          !tabs.plugin.settings.ignoreNotice && new import_obsidian3.Notice("\u{1F534} Not a valid tab.");
          return;
        }
        navigator.clipboard.writeText(copyContent).then(() => {
          !tabs.plugin.settings.ignoreNotice && new import_obsidian3.Notice("\u{1F7E2} Copied to clipboard successfully.");
        }).catch((err) => {
          !tabs.plugin.settings.ignoreNotice && new import_obsidian3.Notice("\u{1F534} Failed to copy to clipboard");
          console.error(err);
        });
      });
    });
    this.addItem((item) => {
      item.setTitle("Paste tab");
      item.setIcon("paste");
      item.onClick(() => {
        navigator.clipboard.readText().then((text) => {
          var _a2;
          if (!text || text.trim() === "" || text.trim() == tabs.split) {
            !tabs.plugin.settings.ignoreNotice && new import_obsidian3.Notice("\u{1F7E0} No content in clipboard.");
            return;
          }
          let title = tabs.plugin.settings.defaultTabNavItem + "\n";
          let content2 = text.trim();
          if (text.startsWith(tabs.split)) {
            title = text.substring(tabs.split.length, text.indexOf("\n"));
            content2 = content2.substring(text.indexOf("\n"));
          }
          const activeEditor = (_a2 = tabs.activeView) == null ? void 0 : _a2.editor;
          activeEditor.setLine(tabs.sectionInfo.lineEnd, tabs.split + title.trim() + "\n" + content2.trim() + "\n" + activeEditor.getLine(tabs.sectionInfo.lineEnd));
        }).catch((err) => {
          !tabs.plugin.settings.ignoreNotice && new import_obsidian3.Notice("\u{1F534} Failed to paste from clipboard");
          console.error(err);
        });
      });
    });
  }
};

// src/components/tabs/tabsconfig.ts
var TabsConfig = class {
  constructor(config, tabsEl, settings) {
    this.rawConfig = config.trim();
    this.tabsborder = settings.defaultTabsBorder;
    this.tabsBorderColor = settings.defaultTabsBorderColor;
    this.hideTabsEditBlockButton = settings.hideTabsEditBlockButton;
    this.titlePosition = settings.defaultTitlePosition;
    this.titleLineClamp = settings.defaultTitleLineClamp;
    this.actionButton = settings.actionButtonType;
    this.titleLimited = settings.defaultTitleLimited;
    this.tabsMaxHeight = settings.defaultTabsContentsMaxHeight;
    this.tabsContentsPadding = settings.defaultTabsContentsPadding;
    this.parseConfig(config);
  }
  parseConfig(configs) {
    configs.trim().toLowerCase().split("\n").forEach((line) => {
      line.split(",").forEach((config) => {
        switch (config.trim()) {
          case "top":
            this.titlePosition = "top";
            break;
          case "bottom":
            this.titlePosition = "bottom";
            break;
          case "left":
            this.titlePosition = "left";
            break;
          case "right":
            this.titlePosition = "right";
            break;
          case "action-add":
            this.actionButton = "action-add";
            break;
          case "action-edit":
            this.actionButton = "action-edit";
            break;
          case "action-none":
            this.actionButton = "action-none";
            break;
          case "one":
            this.titleLineClamp = "one";
            break;
          case "multi":
            this.titleLineClamp = "multi";
            break;
          default:
            break;
        }
      });
    });
  }
  decorate(tabsEl, tabsNavEl, tabsContentsEl) {
    tabsEl.classList.add("tabs-" + this.tabsborder);
    tabsEl.style.setProperty("--tabs-border-color", this.tabsBorderColor);
    tabsEl.style.setProperty("--tabs-max-height", this.tabsMaxHeight);
    if (this.hideTabsEditBlockButton) {
      document.body.classList.add("hide-tabs-edit-block-button");
    }
    tabsEl.classList.add("tabs-nav-" + (this.titlePosition || "top"));
    tabsEl.classList.add("tabs-nav-" + (this.titleLineClamp || "one"));
    if (this.titleLimited) {
      tabsNavEl.classList.add("tabs-nav-title-limited");
    }
    tabsContentsEl.style.setProperty("--tabs-contents-padding", this.tabsContentsPadding);
  }
};

// src/components/tabs/tabnavbutton.ts
var import_obsidian4 = __toModule(require("obsidian"));
var TabNavButton = class {
  constructor(tabnav, actionbuttontype, sectioninfo) {
    this.tabnav = tabnav;
    this.sectioninfo = sectioninfo;
    this.buttonEl = this.createTabNavButtonEl(actionbuttontype);
  }
  createTabNavButtonEl(actionbuttontype) {
    if (actionbuttontype === "action-none") {
      return null;
    }
    const actionButtonEl = document.createElement("div");
    actionButtonEl.className = "tabs-nav-button";
    if (actionbuttontype === "action-add") {
      (0, import_obsidian4.setIcon)(actionButtonEl, "plus");
    } else if (actionbuttontype === "action-edit") {
      (0, import_obsidian4.setIcon)(actionButtonEl, "lucide-pencil");
    }
    return actionButtonEl;
  }
};

// src/components/tabs/tabnavitem.ts
var import_obsidian5 = __toModule(require("obsidian"));
var TabNavItem = class {
  constructor(tabnav, index, title, draggable = true) {
    this.isActiveed = false;
    this.index = index;
    this.title = title.trim();
    this.tabnav = tabnav;
    this.tabs = tabnav.tabs;
    this.tabitemEl = createDiv();
    this.tabitemEl.className = "tabs-nav-item";
    draggable && this.tabitemEl.setAttr("draggable", "true");
    this.tabitemMDEl = this.tabitemEl.createDiv();
    this.tabitemMDEl.className = "tabs-nav-item-md";
    const tabComponent = new import_obsidian5.MarkdownRenderChild(this.tabitemMDEl);
    import_obsidian5.MarkdownRenderer.render(this.tabs.app, this.title, this.tabitemMDEl, this.tabs.context.sourcePath, tabComponent);
  }
  registerdndEvents() {
    this.tabs.plugin.registerDomEvent(this.tabitemEl, "dragstart", (e) => {
      const index = this.tabs.tabsNav.navItems.indexOf(this);
      const tabText = this.title + "\n" + this.tabs.tabsContents.tabcontents[index].content;
      e.dataTransfer.setData("text/plain", tabText);
      e.dataTransfer.effectAllowed = "copy";
      this.tabs.plugin.tabDragger = {
        fromTabs: this.tabnav.tabs,
        draggedTab: this,
        draggedContent: this.tabs.tabsContents.tabcontents[index],
        draggedContentLineCount: this.tabs.tabsContents.tabcontents[index].content.split("\n").length,
        draggedIndex: index
      };
      this.tabitemEl.style.opacity = "0.9";
    });
    this.tabs.plugin.registerDomEvent(this.tabitemEl, "drag", (e) => {
      e.preventDefault();
    });
    this.tabs.plugin.registerDomEvent(this.tabitemEl, "dragenter", (e) => {
      e.preventDefault();
      if (this.tabs.plugin.tabDragger.draggedTab === this || this.tabs.plugin.tabDragger.draggedTab.tabs.activeView !== this.tabs.activeView || this.tabs.plugin.tabDragger.draggedTab.tabs.context.sourcePath !== this.tabs.context.sourcePath) {
        return;
      }
      this.tabitemEl.classList.add("tabs-nav-item-dragover");
    });
    this.tabs.plugin.registerDomEvent(this.tabitemEl, "dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
      if (this.tabs.plugin.tabDragger.draggedTab === this || this.tabs.plugin.tabDragger.draggedTab.tabs.activeView !== this.tabs.activeView || this.tabs.plugin.tabDragger.draggedTab.tabs.context.sourcePath !== this.tabs.context.sourcePath) {
        return;
      }
      this.tabitemEl.classList.add("tabs-nav-item-dragover");
      if (this.tabs.tabsConfig.titlePosition === "top" || this.tabs.tabsConfig.titlePosition === "bottom") {
        if (e.clientX - this.tabitemEl.getBoundingClientRect().left > this.tabitemEl.clientWidth * 0.5) {
          this.tabitemEl.classList.remove("tabs-nav-item-dragover-before");
          this.tabitemEl.classList.add("tabs-nav-item-dragover-after");
        } else if (e.clientX - this.tabitemEl.getBoundingClientRect().left < this.tabitemEl.clientWidth * 0.5) {
          this.tabitemEl.classList.remove("tabs-nav-item-dragover-after");
          this.tabitemEl.classList.add("tabs-nav-item-dragover-before");
        }
      } else {
        if (e.clientY - this.tabitemEl.getBoundingClientRect().top > this.tabitemEl.clientHeight * 0.5) {
          this.tabitemEl.classList.remove("tabs-nav-item-dragover-before");
          this.tabitemEl.classList.add("tabs-nav-item-dragover-after");
        } else if (e.clientY - this.tabitemEl.getBoundingClientRect().top < this.tabitemEl.clientHeight * 0.5) {
          this.tabitemEl.classList.remove("tabs-nav-item-dragover-after");
          this.tabitemEl.classList.add("tabs-nav-item-dragover-before");
        }
      }
    });
    this.tabs.plugin.registerDomEvent(this.tabitemEl, "dragleave", (e) => {
      this.tabitemEl.classList.remove("tabs-nav-item-dragover");
      this.tabitemEl.classList.remove("tabs-nav-item-dragover-before");
      this.tabitemEl.classList.remove("tabs-nav-item-dragover-after");
    });
    this.tabs.plugin.registerDomEvent(this.tabitemEl, "drop", (e) => {
      var _a2, _b, _c, _d, _e, _f;
      e.preventDefault();
      this.tabitemEl.classList.remove("tabs-nav-item-dragover");
      this.tabitemEl.classList.remove("tabs-nav-item-dragover-before");
      this.tabitemEl.classList.remove("tabs-nav-item-dragover-after");
      this.tabitemEl.style.opacity = "";
      if (this.tabs.plugin.tabDragger.draggedTab === this) {
        return;
      }
      this.tabs.plugin.tabDragger.toTabs = this.tabnav.tabs;
      const tabDragger = this.tabs.plugin.tabDragger;
      const dragIndex = this.tabs.plugin.tabDragger.draggedIndex;
      let dropIndex = this.tabs.tabsConfig.titlePosition === "top" || this.tabs.tabsConfig.titlePosition === "bottom" ? e.clientX - this.tabitemEl.getBoundingClientRect().left < this.tabitemEl.clientWidth / 2 ? this.index : this.index + 1 : e.clientY - this.tabitemEl.getBoundingClientRect().top < this.tabitemEl.clientHeight / 2 ? this.index : this.index + 1;
      this.tabs.plugin.tabDragger.dropIndex = dropIndex;
      if (tabDragger.fromTabs.context.sourcePath === tabDragger.toTabs.context.sourcePath && tabDragger.fromTabs.activeView === tabDragger.toTabs.activeView) {
        if (tabDragger.fromTabs === tabDragger.toTabs) {
          if (this.index > tabDragger.draggedTab.index) {
            dropIndex -= 1;
          }
          tabDragger.dropIndex = dropIndex;
          if (dragIndex === dropIndex) {
            return;
          }
          let newDoc = "";
          const tabnavitem = this.tabs.tabsNav.navItems.splice(dragIndex, 1)[0];
          this.tabs.tabsNav.navItems.splice(dropIndex, 0, tabnavitem);
          const tabcontent = this.tabs.tabsContents.tabcontents.splice(dragIndex, 1)[0];
          this.tabs.tabsContents.tabcontents.splice(dropIndex, 0, tabcontent);
          if (dragIndex < dropIndex) {
            for (let i = dragIndex; i <= dropIndex; i++) {
              this.tabs.tabsNav.navItems[i].index = i;
              this.tabs.tabsContents.tabcontents[i].index = i;
              if (this.tabs.tabsNav.navItems[i].isActiveed) {
                this.tabs.tabsNav.currentTab = i;
                this.tabs.tabsContents.currentTab = i;
                let key = "/";
                if (this.tabs.context && this.tabs.sectionInfo) {
                  key = this.tabs.context.sourcePath + this.tabs.sectionInfo.lineStart;
                }
                this.tabs.plugin.lastTabsCache.set(key, i);
              }
            }
          } else {
            for (let i = dropIndex; i <= dragIndex; i++) {
              this.tabs.tabsNav.navItems[i].index = i;
              this.tabs.tabsContents.tabcontents[i].index = i;
              if (this.tabs.tabsNav.navItems[i].isActiveed) {
                this.tabs.tabsNav.currentTab = i;
                this.tabs.tabsContents.currentTab = i;
                this.tabs.plugin.lastTabsCache.set(this.tabs.tabsId, i);
              }
            }
          }
          for (let i = 0; i < this.tabs.tabsNav.navItems.length; i++) {
            newDoc += this.tabs.split + this.tabs.tabsNav.navItems[i].title + "\n" + this.tabs.tabsContents.tabcontents[i].content;
          }
          newDoc = this.tabs.backquote.repeat(this.tabs.backquoteCount) + "tabs\n" + this.tabs.tabsConfig.rawConfig + "\n" + newDoc + this.tabs.backquote.repeat(this.tabs.backquoteCount);
          this.tabs.tabsNav.navWrapperEl.removeChild(tabnavitem.tabitemEl);
          this.tabs.tabsContents.tabcontentsEl.removeChild(tabcontent.contentEl);
          if (dropIndex === this.tabs.tabsNav.navItems.length - 1) {
            this.tabs.tabsNav.navWrapperEl.appendChild(tabnavitem.tabitemEl);
            this.tabs.tabsContents.tabcontentsEl.appendChild(tabcontent.contentEl);
          } else {
            this.tabs.tabsNav.navWrapperEl.insertBefore(tabnavitem.tabitemEl, this.tabs.tabsNav.navItems[dropIndex + 1].tabitemEl);
            this.tabs.tabsContents.tabcontentsEl.insertBefore(tabcontent.contentEl, this.tabs.tabsContents.tabcontents[dropIndex + 1].contentEl);
          }
          (_b = this.tabs.activeView) == null ? void 0 : _b.editor.replaceRange(newDoc, { line: this.tabs.sectionInfo.lineStart, ch: 0 }, { line: this.tabs.sectionInfo.lineEnd, ch: (_a2 = this.tabs.activeView) == null ? void 0 : _a2.editor.getLine(this.tabs.sectionInfo.lineEnd).length });
        } else {
          const tabDragger2 = this.tabs.plugin.tabDragger;
          tabDragger2.draggedTab = new TabNavItem(tabDragger2.toTabs.tabsNav, tabDragger2.dropIndex, tabDragger2.draggedTab.title);
          tabDragger2.draggedContent = new TabContent(tabDragger2 == null ? void 0 : tabDragger2.dropIndex, tabDragger2.draggedTab.title, tabDragger2.draggedContent.content, tabDragger2.toTabs.app, tabDragger2.toTabs.context);
          tabDragger2.toTabs.tabsNav.navItems.splice(tabDragger2.dropIndex, 0, tabDragger2.draggedTab);
          tabDragger2.toTabs.tabsContents.tabcontents.splice(tabDragger2.dropIndex, 0, tabDragger2.draggedContent);
          if (dropIndex <= tabDragger2.toTabs.currentIndex) {
            tabDragger2.toTabs.currentIndex += 1;
            this.tabs.plugin.lastTabsCache.set(tabDragger2.toTabs.tabsId, tabDragger2.toTabs.currentIndex);
          }
          for (let i = tabDragger2.dropIndex; i < tabDragger2.toTabs.tabsNav.navItems.length; i++) {
            tabDragger2.toTabs.tabsNav.navItems[i].index = i;
            tabDragger2.toTabs.tabsContents.tabcontents[i].index = i;
          }
          if (dropIndex === tabDragger2.toTabs.tabsNav.navItems.length - 1) {
            tabDragger2.toTabs.tabsNav.navWrapperEl.appendChild(tabDragger2.draggedTab.tabitemEl);
            tabDragger2.toTabs.tabsContents.tabcontentsEl.appendChild(tabDragger2.draggedContent.contentEl);
          } else {
            tabDragger2.toTabs.tabsNav.navWrapperEl.insertBefore(tabDragger2.draggedTab.tabitemEl, tabDragger2.toTabs.tabsNav.navItems[this.tabs.plugin.tabDragger.dropIndex + 1].tabitemEl);
            tabDragger2.toTabs.tabsContents.tabcontentsEl.insertBefore(tabDragger2.draggedContent.contentEl, tabDragger2.toTabs.tabsContents.tabcontents[tabDragger2.dropIndex + 1].contentEl);
          }
          tabDragger2.toTabs.plugin.registerDomEvent(tabDragger2.draggedTab.tabitemEl, "click", () => {
            const index = tabDragger2.toTabs.tabsNav.navItems.indexOf(tabDragger2.draggedTab);
            tabDragger2.toTabs.tabsNav.refreshActiveTabNav(index);
            tabDragger2.toTabs.tabsContents.refreshActiveTabContent(index);
            tabDragger2.toTabs.currentIndex = index;
          });
          if (this.tabs.plugin.settings.doubleClickToEdit) {
            tabDragger2.toTabs.plugin.registerDomEvent(tabDragger2.draggedContent.contentEl, "dblclick", (e2) => {
              e2.preventDefault();
              if (!tabDragger2.toTabs.activeView || tabDragger2.toTabs.isPreviewMode()) {
                return;
              }
              tabDragger2.toTabs.plugin.tabsEditorModal.startEditing(tabDragger2.toTabs);
            });
          }
          tabDragger2.draggedTab.registerdndEvents();
          let toTabsNewDoc = "";
          for (let i = 0; i < tabDragger2.toTabs.tabsNav.navItems.length; i++) {
            toTabsNewDoc += tabDragger2.toTabs.split + tabDragger2.toTabs.tabsNav.navItems[i].title + "\n" + tabDragger2.toTabs.tabsContents.tabcontents[i].content;
          }
          tabDragger2.toTabs.updateBackquote(tabDragger2.draggedContent.content);
          toTabsNewDoc = this.tabs.backquote.repeat(tabDragger2.toTabs.backquoteCount) + "tabs\n" + tabDragger2.toTabs.tabsConfig.rawConfig + "\n" + toTabsNewDoc + this.tabs.backquote.repeat(tabDragger2.toTabs.backquoteCount);
          if (tabDragger2.fromTabs.currentIndex === tabDragger2.draggedIndex) {
            if (tabDragger2.fromTabs.currentIndex > 0) {
              tabDragger2.fromTabs.currentIndex -= 1;
            }
            tabDragger2.fromTabs.tabsNav.refreshActiveTabNav(tabDragger2.fromTabs.currentIndex);
            tabDragger2.fromTabs.tabsContents.refreshActiveTabContent(tabDragger2.fromTabs.currentIndex);
            this.tabs.plugin.lastTabsCache.set(tabDragger2.fromTabs.tabsId, tabDragger2.fromTabs.currentIndex);
          }
          tabDragger2.fromTabs.tabsNav.navWrapperEl.removeChild(tabDragger2.fromTabs.tabsNav.navItems[dragIndex].tabitemEl);
          tabDragger2.fromTabs.tabsContents.tabcontentsEl.removeChild(tabDragger2.fromTabs.tabsContents.tabcontents[dragIndex].contentEl);
          tabDragger2.fromTabs.tabsNav.navItems.splice(dragIndex, 1);
          tabDragger2.fromTabs.tabsContents.tabcontents.splice(dragIndex, 1);
          for (let i = 0; i < tabDragger2.fromTabs.tabsNav.navItems.length; i++) {
            tabDragger2.fromTabs.tabsNav.navItems[i].index = i;
            tabDragger2.fromTabs.tabsContents.tabcontents[i].index = i;
          }
          let fromTabsNewDoc = "";
          for (let i = 0; i < tabDragger2.fromTabs.tabsNav.navItems.length; i++) {
            fromTabsNewDoc += tabDragger2.fromTabs.split + tabDragger2.fromTabs.tabsNav.navItems[i].title + "\n" + tabDragger2.fromTabs.tabsContents.tabcontents[i].content;
          }
          fromTabsNewDoc = tabDragger2.fromTabs.backquote.repeat(this.tabs.backquoteCount) + "tabs\n" + tabDragger2.fromTabs.tabsConfig.rawConfig + "\n" + fromTabsNewDoc + tabDragger2.fromTabs.backquote.repeat(tabDragger2.fromTabs.backquoteCount);
          if (this.tabs.plugin.tabDragger.fromTabs.context.sourcePath === this.tabs.plugin.tabDragger.toTabs.context.sourcePath) {
            const activeView = this.tabs.app.workspace.getActiveViewOfType(import_obsidian5.MarkdownView);
            if (tabDragger2.toTabs.sectionInfo.lineStart > tabDragger2.fromTabs.sectionInfo.lineEnd) {
              activeView.editor.replaceRange(toTabsNewDoc, { line: tabDragger2.toTabs.sectionInfo.lineStart, ch: 0 }, { line: tabDragger2.toTabs.sectionInfo.lineEnd, ch: (_c = tabDragger2.toTabs.activeView) == null ? void 0 : _c.editor.getLine(tabDragger2.toTabs.sectionInfo.lineEnd).length });
              activeView.editor.replaceRange(fromTabsNewDoc, { line: tabDragger2.fromTabs.sectionInfo.lineStart, ch: 0 }, { line: tabDragger2.fromTabs.sectionInfo.lineEnd, ch: (_d = tabDragger2.fromTabs.activeView) == null ? void 0 : _d.editor.getLine(tabDragger2.fromTabs.sectionInfo.lineEnd).length });
              tabDragger2.toTabs.sectionInfo.lineStart = tabDragger2.toTabs.sectionInfo.lineStart - tabDragger2.draggedContentLineCount;
              tabDragger2.fromTabs.sectionInfo.lineEnd = tabDragger2.fromTabs.sectionInfo.lineEnd - tabDragger2.draggedContentLineCount;
            } else if (tabDragger2.toTabs.sectionInfo.lineEnd < tabDragger2.fromTabs.sectionInfo.lineStart) {
              activeView.editor.replaceRange(fromTabsNewDoc, { line: tabDragger2.fromTabs.sectionInfo.lineStart, ch: 0 }, { line: tabDragger2.fromTabs.sectionInfo.lineEnd, ch: (_e = tabDragger2.fromTabs.activeView) == null ? void 0 : _e.editor.getLine(tabDragger2.fromTabs.sectionInfo.lineEnd).length });
              activeView.editor.replaceRange(toTabsNewDoc, { line: tabDragger2.toTabs.sectionInfo.lineStart, ch: 0 }, { line: tabDragger2.toTabs.sectionInfo.lineEnd, ch: (_f = tabDragger2.toTabs.activeView) == null ? void 0 : _f.editor.getLine(tabDragger2.toTabs.sectionInfo.lineEnd).length });
              tabDragger2.fromTabs.sectionInfo.lineStart = tabDragger2.fromTabs.sectionInfo.lineStart + tabDragger2.draggedContentLineCount;
              tabDragger2.toTabs.sectionInfo.lineEnd = tabDragger2.toTabs.sectionInfo.lineEnd + tabDragger2.draggedContentLineCount;
            }
          }
          this.tabs.plugin.tabDragger = null;
        }
      }
    });
  }
};

// src/components/tabs/tabsnav.ts
var TabsNav = class {
  constructor(tabs, tabsNav, actionbuttontype, sectioninfo) {
    this.currentTab = 0;
    this.tabs = tabs;
    this.navItems = new Array();
    if (tabsNav.length > 0) {
      this.navItems = new Array(tabsNav.length);
      this.tabsButton = new TabNavButton(this, actionbuttontype, sectioninfo);
      this.createTabNavEl(tabsNav);
      this.currentTab = 0;
    }
  }
  createTabNavEl(tabsNav) {
    for (let i = 0; i < tabsNav.length; i++) {
      this.navItems[i] = new TabNavItem(this, i, tabsNav[i]);
    }
    this.navItems[0].isActiveed = true;
    this.navItems[0].tabitemEl.classList.add("tabs-nav-item-active");
    this.navEl = document.createElement("div");
    this.navEl.classList.add("tabs-nav");
    this.navWrapperEl = this.navEl.createDiv("tabs-nav-item-wrapper");
    this.navItems.length > 0 && this.navItems.forEach((tab) => {
      this.navWrapperEl.appendChild(tab.tabitemEl);
    });
    this.tabsButton.buttonEl && this.navEl.appendChild(this.tabsButton.buttonEl);
  }
  refreshActiveTabNav(index) {
    this.navItems[this.currentTab].isActiveed = false;
    this.navItems[this.currentTab].tabitemEl.classList.remove("tabs-nav-item-active");
    this.navItems[index].isActiveed = true;
    this.navItems[index].tabitemEl.classList.add("tabs-nav-item-active");
    this.currentTab = index;
  }
  registerDragEvents() {
    this.navItems.forEach((tab) => {
      tab.registerdndEvents();
    });
  }
};

// src/components/tabs/tabs.ts
var Tabs = class {
  constructor(source, element, context, app, plugin) {
    this.currentIndex = 0;
    this.tabsType = "outertabs";
    this.backquote = "`";
    this.backquoteCount = 3;
    element.className = "tabs-container";
    this.plugin = plugin;
    this.tabsEl = element;
    this.split = this.plugin.settings.split;
    this.app = app;
    this.activeView = app.workspace.getActiveViewOfType(import_obsidian6.MarkdownView);
    this.sectionInfo = context == null ? void 0 : context.getSectionInfo(element);
    this.context = context;
    this.updateBackquote(source);
    if (!this.sectionInfo) {
      this.tabsType = "innertabs";
      this.tabsEl.classList.add("tabs-innertabs");
    }
    const [tabnavitemtitle, tabcontent] = this.parseTabs(source, this.plugin.settings.defaultTabNavItem, this.plugin.settings.defaultTabContent);
    this.tabsConfig = new TabsConfig(tabcontent[0], this.tabsEl, this.plugin.settings);
    this.tabsNav = new TabsNav(this, tabnavitemtitle.slice(1), this.tabsType === "innertabs" ? "action-none" : this.tabsConfig.actionButton, this.sectionInfo);
    this.tabsContents = new TabContents(plugin, tabcontent.map((content2, index) => {
      return new TabContent(index, tabnavitemtitle[index], content2, app, context);
    }).slice(1));
    this.registerEventHandlers();
    element.appendChild(this.tabsNav.navEl);
    element.appendChild(this.tabsContents.tabcontentsEl);
    this.tabsConfig.decorate(this.tabsEl, this.tabsNav.navEl, this.tabsContents.tabcontentsEl);
    this.tabsId = "/";
    if (this.context && this.sectionInfo) {
      this.tabsId = this.context.sourcePath + this.sectionInfo.lineStart;
    }
    if (!this.plugin.lastTabsCache.has(this.tabsId)) {
      this.plugin.lastTabsCache.set(this.tabsId, 0);
    }
    this.currentIndex = this.plugin.lastTabsCache.get(this.tabsId);
    this.tabsNav.refreshActiveTabNav(this.currentIndex);
    this.tabsContents.refreshActiveTabContent(this.currentIndex);
  }
  parseTabs(source, defaultTabNavItem, defaultTabContent) {
    const tabnavitemtitle = [];
    const tabcontent = [];
    let title = "";
    let content2 = "";
    if (!source.contains(this.split)) {
      tabnavitemtitle.push("");
      tabcontent.push("");
      tabnavitemtitle.push(defaultTabNavItem);
      tabcontent.push(source.trim() === "" ? defaultTabContent : source);
    } else {
      let lines = source.split("\n");
      for (let i = 0, innerTabs = 0; i < lines.length; i++) {
        if (!innerTabs && lines[i].startsWith(this.split)) {
          tabnavitemtitle.push(title);
          tabcontent.push(content2);
          title = lines[i].substring(this.split.length);
          content2 = "";
        } else {
          content2 += lines[i] + "\n";
          if (lines[i].trim().startsWith("```")) {
            if (!innerTabs && lines[i].trim().endsWith("tabs")) {
              innerTabs = lines[i].trim().length - 4;
            } else if (innerTabs && lines[i].trim().endsWith("`".repeat(innerTabs))) {
              innerTabs = 0;
            }
          } else if (lines[i].trim().startsWith("~~~")) {
            if (!innerTabs && lines[i].trim().endsWith("tabs")) {
              innerTabs = lines[i].trim().length - 4;
            } else if (innerTabs && lines[i].trim().endsWith("~".repeat(innerTabs))) {
              innerTabs = 0;
            }
          }
        }
      }
      tabnavitemtitle.push(title);
      tabcontent.push(content2);
    }
    return [tabnavitemtitle, tabcontent];
  }
  async registerEventHandlers() {
    this.tabsNav.navItems.forEach((tab) => {
      this.plugin.registerDomEvent(tab.tabitemEl, "click", () => {
        const index = this.tabsNav.navItems.indexOf(tab);
        this.tabsNav.refreshActiveTabNav(index);
        this.tabsContents.refreshActiveTabContent(index);
        this.currentIndex = index;
        this.plugin.lastTabsCache.set(this.context.sourcePath + this.sectionInfo.lineStart, index);
      });
    });
    this.tabsType === "outertabs" && this.plugin.settings.doubleClickToEdit && this.plugin.registerDomEvent(this.tabsContents.tabcontentsEl, "dblclick", (e) => {
      e.preventDefault();
      if (!this.activeView || this.isPreviewMode()) {
        return;
      }
      this.plugin.tabsEditorModal.startEditing(this);
    });
    switch (this.tabsConfig.actionButton) {
      case "action-none":
        break;
      case "action-edit":
        if (this.activeView && !this.isPreviewMode() && this.tabsType !== "innertabs" && this.tabsNav.tabsButton.buttonEl) {
          this.plugin.registerDomEvent(this.tabsNav.tabsButton.buttonEl, "click", () => {
            this.plugin.tabsEditorModal.startEditing(this);
          });
        }
        break;
      case "action-add":
        if (this.activeView && !this.isPreviewMode() && this.tabsType !== "innertabs" && this.tabsNav.tabsButton.buttonEl) {
          this.plugin.registerDomEvent(this.tabsNav.tabsButton.buttonEl, "click", () => {
            var _a2;
            this.plugin.lastTabsCache[this.context.sourcePath + this.sectionInfo.lineStart] = this.tabsNav.navItems.length;
            const activeEditor = (_a2 = this.activeView) == null ? void 0 : _a2.editor;
            activeEditor.setLine(this.sectionInfo.lineEnd, this.split + this.plugin.settings.defaultTabNavItem + "\n" + this.plugin.settings.defaultTabContent + "\n" + activeEditor.getLine(this.sectionInfo.lineEnd));
          });
        }
        break;
      default:
        this.plugin.settings.actionButtonType = "action-none";
        this.plugin.saveSettings();
        new import_obsidian6.Notice("Invalid action button type. Set to 'None'.");
    }
    if (this.activeView && !this.isPreviewMode() && this.tabsType !== "innertabs") {
      this.plugin.registerDomEvent(this.tabsNav.navEl, "contextmenu", (e) => {
        e.preventDefault();
        const tabmenu = new TabMenu(this, e);
        tabmenu.showAtMouseEvent(e);
      });
    }
    this.tabsType !== "innertabs" && this.plugin.settings.dragAndDrop && this.tabsNav.registerDragEvents();
  }
  isPreviewMode() {
    var _a2;
    return ((_a2 = this.activeView) == null ? void 0 : _a2.leaf.getViewState().state.mode) === "preview";
  }
  updateBackquote(doc2) {
    var _a2, _b, _c, _d, _e;
    if (this.activeView && this.sectionInfo) {
      const startLine = (_b = this.activeView) == null ? void 0 : _b.editor.getLine((_a2 = this.sectionInfo) == null ? void 0 : _a2.lineStart).trim();
      if (startLine.contains("```tabs")) {
        this.backquote = "`";
      } else if (startLine.contains("~~~tabs")) {
        this.backquote = "~";
      }
    }
    let count2 = this.sectionInfo ? (_e = (_d = this.activeView) == null ? void 0 : _d.editor.getLine((_c = this.sectionInfo) == null ? void 0 : _c.lineStart).trim().replace("tabs", "")) == null ? void 0 : _e.length : 0;
    this.backquoteCount = Math.max(this.backquoteCount, count2);
    if (doc2.contains("```") || doc2.contains("~~~")) {
      count2 = 0;
      for (let i = 0; i < doc2.length; i++) {
        if ((doc2[i] === "`" || doc2[i] === "~") && (doc2[i + 1] === doc2[i] || doc2[i - 1] === doc2[i])) {
          count2++;
          this.backquoteCount = Math.max(this.backquoteCount, count2 + 1);
        } else {
          count2 = 0;
        }
      }
      this.backquoteCount = Math.max(this.backquoteCount, count2 + 1);
    }
  }
};

// src/components/editor/tabeditormodal.ts
var import_obsidian9 = __toModule(require("obsidian"));

// node_modules/@codemirror/state/dist/index.js
var Text = class {
  lineAt(pos) {
    if (pos < 0 || pos > this.length)
      throw new RangeError(`Invalid position ${pos} in document of length ${this.length}`);
    return this.lineInner(pos, false, 1, 0);
  }
  line(n) {
    if (n < 1 || n > this.lines)
      throw new RangeError(`Invalid line number ${n} in ${this.lines}-line document`);
    return this.lineInner(n, true, 1, 0);
  }
  replace(from, to, text) {
    [from, to] = clip(this, from, to);
    let parts = [];
    this.decompose(0, from, parts, 2);
    if (text.length)
      text.decompose(0, text.length, parts, 1 | 2);
    this.decompose(to, this.length, parts, 1);
    return TextNode.from(parts, this.length - (to - from) + text.length);
  }
  append(other) {
    return this.replace(this.length, this.length, other);
  }
  slice(from, to = this.length) {
    [from, to] = clip(this, from, to);
    let parts = [];
    this.decompose(from, to, parts, 0);
    return TextNode.from(parts, to - from);
  }
  eq(other) {
    if (other == this)
      return true;
    if (other.length != this.length || other.lines != this.lines)
      return false;
    let start = this.scanIdentical(other, 1), end = this.length - this.scanIdentical(other, -1);
    let a = new RawTextCursor(this), b = new RawTextCursor(other);
    for (let skip = start, pos = start; ; ) {
      a.next(skip);
      b.next(skip);
      skip = 0;
      if (a.lineBreak != b.lineBreak || a.done != b.done || a.value != b.value)
        return false;
      pos += a.value.length;
      if (a.done || pos >= end)
        return true;
    }
  }
  iter(dir = 1) {
    return new RawTextCursor(this, dir);
  }
  iterRange(from, to = this.length) {
    return new PartialTextCursor(this, from, to);
  }
  iterLines(from, to) {
    let inner;
    if (from == null) {
      inner = this.iter();
    } else {
      if (to == null)
        to = this.lines + 1;
      let start = this.line(from).from;
      inner = this.iterRange(start, Math.max(start, to == this.lines + 1 ? this.length : to <= 1 ? 0 : this.line(to - 1).to));
    }
    return new LineCursor(inner);
  }
  toString() {
    return this.sliceString(0);
  }
  toJSON() {
    let lines = [];
    this.flatten(lines);
    return lines;
  }
  constructor() {
  }
  static of(text) {
    if (text.length == 0)
      throw new RangeError("A document must have at least one line");
    if (text.length == 1 && !text[0])
      return Text.empty;
    return text.length <= 32 ? new TextLeaf(text) : TextNode.from(TextLeaf.split(text, []));
  }
};
var TextLeaf = class extends Text {
  constructor(text, length = textLength(text)) {
    super();
    this.text = text;
    this.length = length;
  }
  get lines() {
    return this.text.length;
  }
  get children() {
    return null;
  }
  lineInner(target, isLine, line, offset) {
    for (let i = 0; ; i++) {
      let string2 = this.text[i], end = offset + string2.length;
      if ((isLine ? line : end) >= target)
        return new Line(offset, end, line, string2);
      offset = end + 1;
      line++;
    }
  }
  decompose(from, to, target, open) {
    let text = from <= 0 && to >= this.length ? this : new TextLeaf(sliceText(this.text, from, to), Math.min(to, this.length) - Math.max(0, from));
    if (open & 1) {
      let prev = target.pop();
      let joined = appendText(text.text, prev.text.slice(), 0, text.length);
      if (joined.length <= 32) {
        target.push(new TextLeaf(joined, prev.length + text.length));
      } else {
        let mid = joined.length >> 1;
        target.push(new TextLeaf(joined.slice(0, mid)), new TextLeaf(joined.slice(mid)));
      }
    } else {
      target.push(text);
    }
  }
  replace(from, to, text) {
    if (!(text instanceof TextLeaf))
      return super.replace(from, to, text);
    [from, to] = clip(this, from, to);
    let lines = appendText(this.text, appendText(text.text, sliceText(this.text, 0, from)), to);
    let newLen = this.length + text.length - (to - from);
    if (lines.length <= 32)
      return new TextLeaf(lines, newLen);
    return TextNode.from(TextLeaf.split(lines, []), newLen);
  }
  sliceString(from, to = this.length, lineSep = "\n") {
    [from, to] = clip(this, from, to);
    let result = "";
    for (let pos = 0, i = 0; pos <= to && i < this.text.length; i++) {
      let line = this.text[i], end = pos + line.length;
      if (pos > from && i)
        result += lineSep;
      if (from < end && to > pos)
        result += line.slice(Math.max(0, from - pos), to - pos);
      pos = end + 1;
    }
    return result;
  }
  flatten(target) {
    for (let line of this.text)
      target.push(line);
  }
  scanIdentical() {
    return 0;
  }
  static split(text, target) {
    let part = [], len = -1;
    for (let line of text) {
      part.push(line);
      len += line.length + 1;
      if (part.length == 32) {
        target.push(new TextLeaf(part, len));
        part = [];
        len = -1;
      }
    }
    if (len > -1)
      target.push(new TextLeaf(part, len));
    return target;
  }
};
var TextNode = class extends Text {
  constructor(children, length) {
    super();
    this.children = children;
    this.length = length;
    this.lines = 0;
    for (let child of children)
      this.lines += child.lines;
  }
  lineInner(target, isLine, line, offset) {
    for (let i = 0; ; i++) {
      let child = this.children[i], end = offset + child.length, endLine = line + child.lines - 1;
      if ((isLine ? endLine : end) >= target)
        return child.lineInner(target, isLine, line, offset);
      offset = end + 1;
      line = endLine + 1;
    }
  }
  decompose(from, to, target, open) {
    for (let i = 0, pos = 0; pos <= to && i < this.children.length; i++) {
      let child = this.children[i], end = pos + child.length;
      if (from <= end && to >= pos) {
        let childOpen = open & ((pos <= from ? 1 : 0) | (end >= to ? 2 : 0));
        if (pos >= from && end <= to && !childOpen)
          target.push(child);
        else
          child.decompose(from - pos, to - pos, target, childOpen);
      }
      pos = end + 1;
    }
  }
  replace(from, to, text) {
    [from, to] = clip(this, from, to);
    if (text.lines < this.lines)
      for (let i = 0, pos = 0; i < this.children.length; i++) {
        let child = this.children[i], end = pos + child.length;
        if (from >= pos && to <= end) {
          let updated = child.replace(from - pos, to - pos, text);
          let totalLines = this.lines - child.lines + updated.lines;
          if (updated.lines < totalLines >> 5 - 1 && updated.lines > totalLines >> 5 + 1) {
            let copy = this.children.slice();
            copy[i] = updated;
            return new TextNode(copy, this.length - (to - from) + text.length);
          }
          return super.replace(pos, end, updated);
        }
        pos = end + 1;
      }
    return super.replace(from, to, text);
  }
  sliceString(from, to = this.length, lineSep = "\n") {
    [from, to] = clip(this, from, to);
    let result = "";
    for (let i = 0, pos = 0; i < this.children.length && pos <= to; i++) {
      let child = this.children[i], end = pos + child.length;
      if (pos > from && i)
        result += lineSep;
      if (from < end && to > pos)
        result += child.sliceString(from - pos, to - pos, lineSep);
      pos = end + 1;
    }
    return result;
  }
  flatten(target) {
    for (let child of this.children)
      child.flatten(target);
  }
  scanIdentical(other, dir) {
    if (!(other instanceof TextNode))
      return 0;
    let length = 0;
    let [iA, iB, eA, eB] = dir > 0 ? [0, 0, this.children.length, other.children.length] : [this.children.length - 1, other.children.length - 1, -1, -1];
    for (; ; iA += dir, iB += dir) {
      if (iA == eA || iB == eB)
        return length;
      let chA = this.children[iA], chB = other.children[iB];
      if (chA != chB)
        return length + chA.scanIdentical(chB, dir);
      length += chA.length + 1;
    }
  }
  static from(children, length = children.reduce((l, ch) => l + ch.length + 1, -1)) {
    let lines = 0;
    for (let ch of children)
      lines += ch.lines;
    if (lines < 32) {
      let flat = [];
      for (let ch of children)
        ch.flatten(flat);
      return new TextLeaf(flat, length);
    }
    let chunk = Math.max(32, lines >> 5), maxChunk = chunk << 1, minChunk = chunk >> 1;
    let chunked = [], currentLines = 0, currentLen = -1, currentChunk = [];
    function add(child) {
      let last;
      if (child.lines > maxChunk && child instanceof TextNode) {
        for (let node of child.children)
          add(node);
      } else if (child.lines > minChunk && (currentLines > minChunk || !currentLines)) {
        flush();
        chunked.push(child);
      } else if (child instanceof TextLeaf && currentLines && (last = currentChunk[currentChunk.length - 1]) instanceof TextLeaf && child.lines + last.lines <= 32) {
        currentLines += child.lines;
        currentLen += child.length + 1;
        currentChunk[currentChunk.length - 1] = new TextLeaf(last.text.concat(child.text), last.length + 1 + child.length);
      } else {
        if (currentLines + child.lines > chunk)
          flush();
        currentLines += child.lines;
        currentLen += child.length + 1;
        currentChunk.push(child);
      }
    }
    function flush() {
      if (currentLines == 0)
        return;
      chunked.push(currentChunk.length == 1 ? currentChunk[0] : TextNode.from(currentChunk, currentLen));
      currentLen = -1;
      currentLines = currentChunk.length = 0;
    }
    for (let child of children)
      add(child);
    flush();
    return chunked.length == 1 ? chunked[0] : new TextNode(chunked, length);
  }
};
Text.empty = /* @__PURE__ */ new TextLeaf([""], 0);
function textLength(text) {
  let length = -1;
  for (let line of text)
    length += line.length + 1;
  return length;
}
function appendText(text, target, from = 0, to = 1e9) {
  for (let pos = 0, i = 0, first = true; i < text.length && pos <= to; i++) {
    let line = text[i], end = pos + line.length;
    if (end >= from) {
      if (end > to)
        line = line.slice(0, to - pos);
      if (pos < from)
        line = line.slice(from - pos);
      if (first) {
        target[target.length - 1] += line;
        first = false;
      } else
        target.push(line);
    }
    pos = end + 1;
  }
  return target;
}
function sliceText(text, from, to) {
  return appendText(text, [""], from, to);
}
var RawTextCursor = class {
  constructor(text, dir = 1) {
    this.dir = dir;
    this.done = false;
    this.lineBreak = false;
    this.value = "";
    this.nodes = [text];
    this.offsets = [dir > 0 ? 1 : (text instanceof TextLeaf ? text.text.length : text.children.length) << 1];
  }
  nextInner(skip, dir) {
    this.done = this.lineBreak = false;
    for (; ; ) {
      let last = this.nodes.length - 1;
      let top2 = this.nodes[last], offsetValue = this.offsets[last], offset = offsetValue >> 1;
      let size = top2 instanceof TextLeaf ? top2.text.length : top2.children.length;
      if (offset == (dir > 0 ? size : 0)) {
        if (last == 0) {
          this.done = true;
          this.value = "";
          return this;
        }
        if (dir > 0)
          this.offsets[last - 1]++;
        this.nodes.pop();
        this.offsets.pop();
      } else if ((offsetValue & 1) == (dir > 0 ? 0 : 1)) {
        this.offsets[last] += dir;
        if (skip == 0) {
          this.lineBreak = true;
          this.value = "\n";
          return this;
        }
        skip--;
      } else if (top2 instanceof TextLeaf) {
        let next = top2.text[offset + (dir < 0 ? -1 : 0)];
        this.offsets[last] += dir;
        if (next.length > Math.max(0, skip)) {
          this.value = skip == 0 ? next : dir > 0 ? next.slice(skip) : next.slice(0, next.length - skip);
          return this;
        }
        skip -= next.length;
      } else {
        let next = top2.children[offset + (dir < 0 ? -1 : 0)];
        if (skip > next.length) {
          skip -= next.length;
          this.offsets[last] += dir;
        } else {
          if (dir < 0)
            this.offsets[last]--;
          this.nodes.push(next);
          this.offsets.push(dir > 0 ? 1 : (next instanceof TextLeaf ? next.text.length : next.children.length) << 1);
        }
      }
    }
  }
  next(skip = 0) {
    if (skip < 0) {
      this.nextInner(-skip, -this.dir);
      skip = this.value.length;
    }
    return this.nextInner(skip, this.dir);
  }
};
var PartialTextCursor = class {
  constructor(text, start, end) {
    this.value = "";
    this.done = false;
    this.cursor = new RawTextCursor(text, start > end ? -1 : 1);
    this.pos = start > end ? text.length : 0;
    this.from = Math.min(start, end);
    this.to = Math.max(start, end);
  }
  nextInner(skip, dir) {
    if (dir < 0 ? this.pos <= this.from : this.pos >= this.to) {
      this.value = "";
      this.done = true;
      return this;
    }
    skip += Math.max(0, dir < 0 ? this.pos - this.to : this.from - this.pos);
    let limit = dir < 0 ? this.pos - this.from : this.to - this.pos;
    if (skip > limit)
      skip = limit;
    limit -= skip;
    let { value } = this.cursor.next(skip);
    this.pos += (value.length + skip) * dir;
    this.value = value.length <= limit ? value : dir < 0 ? value.slice(value.length - limit) : value.slice(0, limit);
    this.done = !this.value;
    return this;
  }
  next(skip = 0) {
    if (skip < 0)
      skip = Math.max(skip, this.from - this.pos);
    else if (skip > 0)
      skip = Math.min(skip, this.to - this.pos);
    return this.nextInner(skip, this.cursor.dir);
  }
  get lineBreak() {
    return this.cursor.lineBreak && this.value != "";
  }
};
var LineCursor = class {
  constructor(inner) {
    this.inner = inner;
    this.afterBreak = true;
    this.value = "";
    this.done = false;
  }
  next(skip = 0) {
    let { done, lineBreak, value } = this.inner.next(skip);
    if (done && this.afterBreak) {
      this.value = "";
      this.afterBreak = false;
    } else if (done) {
      this.done = true;
      this.value = "";
    } else if (lineBreak) {
      if (this.afterBreak) {
        this.value = "";
      } else {
        this.afterBreak = true;
        this.next();
      }
    } else {
      this.value = value;
      this.afterBreak = false;
    }
    return this;
  }
  get lineBreak() {
    return false;
  }
};
if (typeof Symbol != "undefined") {
  Text.prototype[Symbol.iterator] = function() {
    return this.iter();
  };
  RawTextCursor.prototype[Symbol.iterator] = PartialTextCursor.prototype[Symbol.iterator] = LineCursor.prototype[Symbol.iterator] = function() {
    return this;
  };
}
var Line = class {
  constructor(from, to, number2, text) {
    this.from = from;
    this.to = to;
    this.number = number2;
    this.text = text;
  }
  get length() {
    return this.to - this.from;
  }
};
function clip(text, from, to) {
  from = Math.max(0, Math.min(text.length, from));
  return [from, Math.max(from, Math.min(text.length, to))];
}
var extend = /* @__PURE__ */ "lc,34,7n,7,7b,19,,,,2,,2,,,20,b,1c,l,g,,2t,7,2,6,2,2,,4,z,,u,r,2j,b,1m,9,9,,o,4,,9,,3,,5,17,3,3b,f,,w,1j,,,,4,8,4,,3,7,a,2,t,,1m,,,,2,4,8,,9,,a,2,q,,2,2,1l,,4,2,4,2,2,3,3,,u,2,3,,b,2,1l,,4,5,,2,4,,k,2,m,6,,,1m,,,2,,4,8,,7,3,a,2,u,,1n,,,,c,,9,,14,,3,,1l,3,5,3,,4,7,2,b,2,t,,1m,,2,,2,,3,,5,2,7,2,b,2,s,2,1l,2,,,2,4,8,,9,,a,2,t,,20,,4,,2,3,,,8,,29,,2,7,c,8,2q,,2,9,b,6,22,2,r,,,,,,1j,e,,5,,2,5,b,,10,9,,2u,4,,6,,2,2,2,p,2,4,3,g,4,d,,2,2,6,,f,,jj,3,qa,3,t,3,t,2,u,2,1s,2,,7,8,,2,b,9,,19,3,3b,2,y,,3a,3,4,2,9,,6,3,63,2,2,,1m,,,7,,,,,2,8,6,a,2,,1c,h,1r,4,1c,7,,,5,,14,9,c,2,w,4,2,2,,3,1k,,,2,3,,,3,1m,8,2,2,48,3,,d,,7,4,,6,,3,2,5i,1m,,5,ek,,5f,x,2da,3,3x,,2o,w,fe,6,2x,2,n9w,4,,a,w,2,28,2,7k,,3,,4,,p,2,5,,47,2,q,i,d,,12,8,p,b,1a,3,1c,,2,4,2,2,13,,1v,6,2,2,2,2,c,,8,,1b,,1f,,,3,2,2,5,2,,,16,2,8,,6m,,2,,4,,fn4,,kh,g,g,g,a6,2,gt,,6a,,45,5,1ae,3,,2,5,4,14,3,4,,4l,2,fx,4,ar,2,49,b,4w,,1i,f,1k,3,1d,4,2,2,1x,3,10,5,,8,1q,,c,2,1g,9,a,4,2,,2n,3,2,,,2,6,,4g,,3,8,l,2,1l,2,,,,,m,,e,7,3,5,5f,8,2,3,,,n,,29,,2,6,,,2,,,2,,2,6j,,2,4,6,2,,2,r,2,2d,8,2,,,2,2y,,,,2,6,,,2t,3,2,4,,5,77,9,,2,6t,,a,2,,,4,,40,4,2,2,4,,w,a,14,6,2,4,8,,9,6,2,3,1a,d,,2,ba,7,,6,,,2a,m,2,7,,2,,2,3e,6,3,,,2,,7,,,20,2,3,,,,9n,2,f0b,5,1n,7,t4,,1r,4,29,,f5k,2,43q,,,3,4,5,8,8,2,7,u,4,44,3,1iz,1j,4,1e,8,,e,,m,5,,f,11s,7,,h,2,7,,2,,5,79,7,c5,4,15s,7,31,7,240,5,gx7k,2o,3k,6o".split(",").map((s) => s ? parseInt(s, 36) : 1);
for (let i = 1; i < extend.length; i++)
  extend[i] += extend[i - 1];
function isExtendingChar(code) {
  for (let i = 1; i < extend.length; i += 2)
    if (extend[i] > code)
      return extend[i - 1] <= code;
  return false;
}
function isRegionalIndicator(code) {
  return code >= 127462 && code <= 127487;
}
var ZWJ = 8205;
function findClusterBreak(str, pos, forward = true, includeExtending = true) {
  return (forward ? nextClusterBreak : prevClusterBreak)(str, pos, includeExtending);
}
function nextClusterBreak(str, pos, includeExtending) {
  if (pos == str.length)
    return pos;
  if (pos && surrogateLow(str.charCodeAt(pos)) && surrogateHigh(str.charCodeAt(pos - 1)))
    pos--;
  let prev = codePointAt(str, pos);
  pos += codePointSize(prev);
  while (pos < str.length) {
    let next = codePointAt(str, pos);
    if (prev == ZWJ || next == ZWJ || includeExtending && isExtendingChar(next)) {
      pos += codePointSize(next);
      prev = next;
    } else if (isRegionalIndicator(next)) {
      let countBefore = 0, i = pos - 2;
      while (i >= 0 && isRegionalIndicator(codePointAt(str, i))) {
        countBefore++;
        i -= 2;
      }
      if (countBefore % 2 == 0)
        break;
      else
        pos += 2;
    } else {
      break;
    }
  }
  return pos;
}
function prevClusterBreak(str, pos, includeExtending) {
  while (pos > 0) {
    let found = nextClusterBreak(str, pos - 2, includeExtending);
    if (found < pos)
      return found;
    pos--;
  }
  return 0;
}
function surrogateLow(ch) {
  return ch >= 56320 && ch < 57344;
}
function surrogateHigh(ch) {
  return ch >= 55296 && ch < 56320;
}
function codePointAt(str, pos) {
  let code0 = str.charCodeAt(pos);
  if (!surrogateHigh(code0) || pos + 1 == str.length)
    return code0;
  let code1 = str.charCodeAt(pos + 1);
  if (!surrogateLow(code1))
    return code0;
  return (code0 - 55296 << 10) + (code1 - 56320) + 65536;
}
function codePointSize(code) {
  return code < 65536 ? 1 : 2;
}
var DefaultSplit = /\r\n?|\n/;
var MapMode = /* @__PURE__ */ function(MapMode2) {
  MapMode2[MapMode2["Simple"] = 0] = "Simple";
  MapMode2[MapMode2["TrackDel"] = 1] = "TrackDel";
  MapMode2[MapMode2["TrackBefore"] = 2] = "TrackBefore";
  MapMode2[MapMode2["TrackAfter"] = 3] = "TrackAfter";
  return MapMode2;
}(MapMode || (MapMode = {}));
var ChangeDesc = class {
  constructor(sections) {
    this.sections = sections;
  }
  get length() {
    let result = 0;
    for (let i = 0; i < this.sections.length; i += 2)
      result += this.sections[i];
    return result;
  }
  get newLength() {
    let result = 0;
    for (let i = 0; i < this.sections.length; i += 2) {
      let ins = this.sections[i + 1];
      result += ins < 0 ? this.sections[i] : ins;
    }
    return result;
  }
  get empty() {
    return this.sections.length == 0 || this.sections.length == 2 && this.sections[1] < 0;
  }
  iterGaps(f) {
    for (let i = 0, posA = 0, posB = 0; i < this.sections.length; ) {
      let len = this.sections[i++], ins = this.sections[i++];
      if (ins < 0) {
        f(posA, posB, len);
        posB += len;
      } else {
        posB += ins;
      }
      posA += len;
    }
  }
  iterChangedRanges(f, individual = false) {
    iterChanges(this, f, individual);
  }
  get invertedDesc() {
    let sections = [];
    for (let i = 0; i < this.sections.length; ) {
      let len = this.sections[i++], ins = this.sections[i++];
      if (ins < 0)
        sections.push(len, ins);
      else
        sections.push(ins, len);
    }
    return new ChangeDesc(sections);
  }
  composeDesc(other) {
    return this.empty ? other : other.empty ? this : composeSets(this, other);
  }
  mapDesc(other, before = false) {
    return other.empty ? this : mapSet(this, other, before);
  }
  mapPos(pos, assoc = -1, mode = MapMode.Simple) {
    let posA = 0, posB = 0;
    for (let i = 0; i < this.sections.length; ) {
      let len = this.sections[i++], ins = this.sections[i++], endA = posA + len;
      if (ins < 0) {
        if (endA > pos)
          return posB + (pos - posA);
        posB += len;
      } else {
        if (mode != MapMode.Simple && endA >= pos && (mode == MapMode.TrackDel && posA < pos && endA > pos || mode == MapMode.TrackBefore && posA < pos || mode == MapMode.TrackAfter && endA > pos))
          return null;
        if (endA > pos || endA == pos && assoc < 0 && !len)
          return pos == posA || assoc < 0 ? posB : posB + ins;
        posB += ins;
      }
      posA = endA;
    }
    if (pos > posA)
      throw new RangeError(`Position ${pos} is out of range for changeset of length ${posA}`);
    return posB;
  }
  touchesRange(from, to = from) {
    for (let i = 0, pos = 0; i < this.sections.length && pos <= to; ) {
      let len = this.sections[i++], ins = this.sections[i++], end = pos + len;
      if (ins >= 0 && pos <= to && end >= from)
        return pos < from && end > to ? "cover" : true;
      pos = end;
    }
    return false;
  }
  toString() {
    let result = "";
    for (let i = 0; i < this.sections.length; ) {
      let len = this.sections[i++], ins = this.sections[i++];
      result += (result ? " " : "") + len + (ins >= 0 ? ":" + ins : "");
    }
    return result;
  }
  toJSON() {
    return this.sections;
  }
  static fromJSON(json) {
    if (!Array.isArray(json) || json.length % 2 || json.some((a) => typeof a != "number"))
      throw new RangeError("Invalid JSON representation of ChangeDesc");
    return new ChangeDesc(json);
  }
  static create(sections) {
    return new ChangeDesc(sections);
  }
};
var ChangeSet = class extends ChangeDesc {
  constructor(sections, inserted) {
    super(sections);
    this.inserted = inserted;
  }
  apply(doc2) {
    if (this.length != doc2.length)
      throw new RangeError("Applying change set to a document with the wrong length");
    iterChanges(this, (fromA, toA, fromB, _toB, text) => doc2 = doc2.replace(fromB, fromB + (toA - fromA), text), false);
    return doc2;
  }
  mapDesc(other, before = false) {
    return mapSet(this, other, before, true);
  }
  invert(doc2) {
    let sections = this.sections.slice(), inserted = [];
    for (let i = 0, pos = 0; i < sections.length; i += 2) {
      let len = sections[i], ins = sections[i + 1];
      if (ins >= 0) {
        sections[i] = ins;
        sections[i + 1] = len;
        let index = i >> 1;
        while (inserted.length < index)
          inserted.push(Text.empty);
        inserted.push(len ? doc2.slice(pos, pos + len) : Text.empty);
      }
      pos += len;
    }
    return new ChangeSet(sections, inserted);
  }
  compose(other) {
    return this.empty ? other : other.empty ? this : composeSets(this, other, true);
  }
  map(other, before = false) {
    return other.empty ? this : mapSet(this, other, before, true);
  }
  iterChanges(f, individual = false) {
    iterChanges(this, f, individual);
  }
  get desc() {
    return ChangeDesc.create(this.sections);
  }
  filter(ranges) {
    let resultSections = [], resultInserted = [], filteredSections = [];
    let iter = new SectionIter(this);
    done:
      for (let i = 0, pos = 0; ; ) {
        let next = i == ranges.length ? 1e9 : ranges[i++];
        while (pos < next || pos == next && iter.len == 0) {
          if (iter.done)
            break done;
          let len = Math.min(iter.len, next - pos);
          addSection(filteredSections, len, -1);
          let ins = iter.ins == -1 ? -1 : iter.off == 0 ? iter.ins : 0;
          addSection(resultSections, len, ins);
          if (ins > 0)
            addInsert(resultInserted, resultSections, iter.text);
          iter.forward(len);
          pos += len;
        }
        let end = ranges[i++];
        while (pos < end) {
          if (iter.done)
            break done;
          let len = Math.min(iter.len, end - pos);
          addSection(resultSections, len, -1);
          addSection(filteredSections, len, iter.ins == -1 ? -1 : iter.off == 0 ? iter.ins : 0);
          iter.forward(len);
          pos += len;
        }
      }
    return {
      changes: new ChangeSet(resultSections, resultInserted),
      filtered: ChangeDesc.create(filteredSections)
    };
  }
  toJSON() {
    let parts = [];
    for (let i = 0; i < this.sections.length; i += 2) {
      let len = this.sections[i], ins = this.sections[i + 1];
      if (ins < 0)
        parts.push(len);
      else if (ins == 0)
        parts.push([len]);
      else
        parts.push([len].concat(this.inserted[i >> 1].toJSON()));
    }
    return parts;
  }
  static of(changes, length, lineSep) {
    let sections = [], inserted = [], pos = 0;
    let total = null;
    function flush(force = false) {
      if (!force && !sections.length)
        return;
      if (pos < length)
        addSection(sections, length - pos, -1);
      let set = new ChangeSet(sections, inserted);
      total = total ? total.compose(set.map(total)) : set;
      sections = [];
      inserted = [];
      pos = 0;
    }
    function process2(spec) {
      if (Array.isArray(spec)) {
        for (let sub of spec)
          process2(sub);
      } else if (spec instanceof ChangeSet) {
        if (spec.length != length)
          throw new RangeError(`Mismatched change set length (got ${spec.length}, expected ${length})`);
        flush();
        total = total ? total.compose(spec.map(total)) : spec;
      } else {
        let { from, to = from, insert: insert2 } = spec;
        if (from > to || from < 0 || to > length)
          throw new RangeError(`Invalid change range ${from} to ${to} (in doc of length ${length})`);
        let insText = !insert2 ? Text.empty : typeof insert2 == "string" ? Text.of(insert2.split(lineSep || DefaultSplit)) : insert2;
        let insLen = insText.length;
        if (from == to && insLen == 0)
          return;
        if (from < pos)
          flush();
        if (from > pos)
          addSection(sections, from - pos, -1);
        addSection(sections, to - from, insLen);
        addInsert(inserted, sections, insText);
        pos = to;
      }
    }
    process2(changes);
    flush(!total);
    return total;
  }
  static empty(length) {
    return new ChangeSet(length ? [length, -1] : [], []);
  }
  static fromJSON(json) {
    if (!Array.isArray(json))
      throw new RangeError("Invalid JSON representation of ChangeSet");
    let sections = [], inserted = [];
    for (let i = 0; i < json.length; i++) {
      let part = json[i];
      if (typeof part == "number") {
        sections.push(part, -1);
      } else if (!Array.isArray(part) || typeof part[0] != "number" || part.some((e, i2) => i2 && typeof e != "string")) {
        throw new RangeError("Invalid JSON representation of ChangeSet");
      } else if (part.length == 1) {
        sections.push(part[0], 0);
      } else {
        while (inserted.length < i)
          inserted.push(Text.empty);
        inserted[i] = Text.of(part.slice(1));
        sections.push(part[0], inserted[i].length);
      }
    }
    return new ChangeSet(sections, inserted);
  }
  static createSet(sections, inserted) {
    return new ChangeSet(sections, inserted);
  }
};
function addSection(sections, len, ins, forceJoin = false) {
  if (len == 0 && ins <= 0)
    return;
  let last = sections.length - 2;
  if (last >= 0 && ins <= 0 && ins == sections[last + 1])
    sections[last] += len;
  else if (len == 0 && sections[last] == 0)
    sections[last + 1] += ins;
  else if (forceJoin) {
    sections[last] += len;
    sections[last + 1] += ins;
  } else
    sections.push(len, ins);
}
function addInsert(values2, sections, value) {
  if (value.length == 0)
    return;
  let index = sections.length - 2 >> 1;
  if (index < values2.length) {
    values2[values2.length - 1] = values2[values2.length - 1].append(value);
  } else {
    while (values2.length < index)
      values2.push(Text.empty);
    values2.push(value);
  }
}
function iterChanges(desc, f, individual) {
  let inserted = desc.inserted;
  for (let posA = 0, posB = 0, i = 0; i < desc.sections.length; ) {
    let len = desc.sections[i++], ins = desc.sections[i++];
    if (ins < 0) {
      posA += len;
      posB += len;
    } else {
      let endA = posA, endB = posB, text = Text.empty;
      for (; ; ) {
        endA += len;
        endB += ins;
        if (ins && inserted)
          text = text.append(inserted[i - 2 >> 1]);
        if (individual || i == desc.sections.length || desc.sections[i + 1] < 0)
          break;
        len = desc.sections[i++];
        ins = desc.sections[i++];
      }
      f(posA, endA, posB, endB, text);
      posA = endA;
      posB = endB;
    }
  }
}
function mapSet(setA, setB, before, mkSet = false) {
  let sections = [], insert2 = mkSet ? [] : null;
  let a = new SectionIter(setA), b = new SectionIter(setB);
  for (let inserted = -1; ; ) {
    if (a.ins == -1 && b.ins == -1) {
      let len = Math.min(a.len, b.len);
      addSection(sections, len, -1);
      a.forward(len);
      b.forward(len);
    } else if (b.ins >= 0 && (a.ins < 0 || inserted == a.i || a.off == 0 && (b.len < a.len || b.len == a.len && !before))) {
      let len = b.len;
      addSection(sections, b.ins, -1);
      while (len) {
        let piece = Math.min(a.len, len);
        if (a.ins >= 0 && inserted < a.i && a.len <= piece) {
          addSection(sections, 0, a.ins);
          if (insert2)
            addInsert(insert2, sections, a.text);
          inserted = a.i;
        }
        a.forward(piece);
        len -= piece;
      }
      b.next();
    } else if (a.ins >= 0) {
      let len = 0, left = a.len;
      while (left) {
        if (b.ins == -1) {
          let piece = Math.min(left, b.len);
          len += piece;
          left -= piece;
          b.forward(piece);
        } else if (b.ins == 0 && b.len < left) {
          left -= b.len;
          b.next();
        } else {
          break;
        }
      }
      addSection(sections, len, inserted < a.i ? a.ins : 0);
      if (insert2 && inserted < a.i)
        addInsert(insert2, sections, a.text);
      inserted = a.i;
      a.forward(a.len - left);
    } else if (a.done && b.done) {
      return insert2 ? ChangeSet.createSet(sections, insert2) : ChangeDesc.create(sections);
    } else {
      throw new Error("Mismatched change set lengths");
    }
  }
}
function composeSets(setA, setB, mkSet = false) {
  let sections = [];
  let insert2 = mkSet ? [] : null;
  let a = new SectionIter(setA), b = new SectionIter(setB);
  for (let open = false; ; ) {
    if (a.done && b.done) {
      return insert2 ? ChangeSet.createSet(sections, insert2) : ChangeDesc.create(sections);
    } else if (a.ins == 0) {
      addSection(sections, a.len, 0, open);
      a.next();
    } else if (b.len == 0 && !b.done) {
      addSection(sections, 0, b.ins, open);
      if (insert2)
        addInsert(insert2, sections, b.text);
      b.next();
    } else if (a.done || b.done) {
      throw new Error("Mismatched change set lengths");
    } else {
      let len = Math.min(a.len2, b.len), sectionLen = sections.length;
      if (a.ins == -1) {
        let insB = b.ins == -1 ? -1 : b.off ? 0 : b.ins;
        addSection(sections, len, insB, open);
        if (insert2 && insB)
          addInsert(insert2, sections, b.text);
      } else if (b.ins == -1) {
        addSection(sections, a.off ? 0 : a.len, len, open);
        if (insert2)
          addInsert(insert2, sections, a.textBit(len));
      } else {
        addSection(sections, a.off ? 0 : a.len, b.off ? 0 : b.ins, open);
        if (insert2 && !b.off)
          addInsert(insert2, sections, b.text);
      }
      open = (a.ins > len || b.ins >= 0 && b.len > len) && (open || sections.length > sectionLen);
      a.forward2(len);
      b.forward(len);
    }
  }
}
var SectionIter = class {
  constructor(set) {
    this.set = set;
    this.i = 0;
    this.next();
  }
  next() {
    let { sections } = this.set;
    if (this.i < sections.length) {
      this.len = sections[this.i++];
      this.ins = sections[this.i++];
    } else {
      this.len = 0;
      this.ins = -2;
    }
    this.off = 0;
  }
  get done() {
    return this.ins == -2;
  }
  get len2() {
    return this.ins < 0 ? this.len : this.ins;
  }
  get text() {
    let { inserted } = this.set, index = this.i - 2 >> 1;
    return index >= inserted.length ? Text.empty : inserted[index];
  }
  textBit(len) {
    let { inserted } = this.set, index = this.i - 2 >> 1;
    return index >= inserted.length && !len ? Text.empty : inserted[index].slice(this.off, len == null ? void 0 : this.off + len);
  }
  forward(len) {
    if (len == this.len)
      this.next();
    else {
      this.len -= len;
      this.off += len;
    }
  }
  forward2(len) {
    if (this.ins == -1)
      this.forward(len);
    else if (len == this.ins)
      this.next();
    else {
      this.ins -= len;
      this.off += len;
    }
  }
};
var SelectionRange = class {
  constructor(from, to, flags) {
    this.from = from;
    this.to = to;
    this.flags = flags;
  }
  get anchor() {
    return this.flags & 32 ? this.to : this.from;
  }
  get head() {
    return this.flags & 32 ? this.from : this.to;
  }
  get empty() {
    return this.from == this.to;
  }
  get assoc() {
    return this.flags & 8 ? -1 : this.flags & 16 ? 1 : 0;
  }
  get bidiLevel() {
    let level = this.flags & 7;
    return level == 7 ? null : level;
  }
  get goalColumn() {
    let value = this.flags >> 6;
    return value == 16777215 ? void 0 : value;
  }
  map(change, assoc = -1) {
    let from, to;
    if (this.empty) {
      from = to = change.mapPos(this.from, assoc);
    } else {
      from = change.mapPos(this.from, 1);
      to = change.mapPos(this.to, -1);
    }
    return from == this.from && to == this.to ? this : new SelectionRange(from, to, this.flags);
  }
  extend(from, to = from) {
    if (from <= this.anchor && to >= this.anchor)
      return EditorSelection.range(from, to);
    let head = Math.abs(from - this.anchor) > Math.abs(to - this.anchor) ? from : to;
    return EditorSelection.range(this.anchor, head);
  }
  eq(other, includeAssoc = false) {
    return this.anchor == other.anchor && this.head == other.head && (!includeAssoc || !this.empty || this.assoc == other.assoc);
  }
  toJSON() {
    return { anchor: this.anchor, head: this.head };
  }
  static fromJSON(json) {
    if (!json || typeof json.anchor != "number" || typeof json.head != "number")
      throw new RangeError("Invalid JSON representation for SelectionRange");
    return EditorSelection.range(json.anchor, json.head);
  }
  static create(from, to, flags) {
    return new SelectionRange(from, to, flags);
  }
};
var EditorSelection = class {
  constructor(ranges, mainIndex) {
    this.ranges = ranges;
    this.mainIndex = mainIndex;
  }
  map(change, assoc = -1) {
    if (change.empty)
      return this;
    return EditorSelection.create(this.ranges.map((r) => r.map(change, assoc)), this.mainIndex);
  }
  eq(other, includeAssoc = false) {
    if (this.ranges.length != other.ranges.length || this.mainIndex != other.mainIndex)
      return false;
    for (let i = 0; i < this.ranges.length; i++)
      if (!this.ranges[i].eq(other.ranges[i], includeAssoc))
        return false;
    return true;
  }
  get main() {
    return this.ranges[this.mainIndex];
  }
  asSingle() {
    return this.ranges.length == 1 ? this : new EditorSelection([this.main], 0);
  }
  addRange(range, main = true) {
    return EditorSelection.create([range].concat(this.ranges), main ? 0 : this.mainIndex + 1);
  }
  replaceRange(range, which = this.mainIndex) {
    let ranges = this.ranges.slice();
    ranges[which] = range;
    return EditorSelection.create(ranges, this.mainIndex);
  }
  toJSON() {
    return { ranges: this.ranges.map((r) => r.toJSON()), main: this.mainIndex };
  }
  static fromJSON(json) {
    if (!json || !Array.isArray(json.ranges) || typeof json.main != "number" || json.main >= json.ranges.length)
      throw new RangeError("Invalid JSON representation for EditorSelection");
    return new EditorSelection(json.ranges.map((r) => SelectionRange.fromJSON(r)), json.main);
  }
  static single(anchor, head = anchor) {
    return new EditorSelection([EditorSelection.range(anchor, head)], 0);
  }
  static create(ranges, mainIndex = 0) {
    if (ranges.length == 0)
      throw new RangeError("A selection needs at least one range");
    for (let pos = 0, i = 0; i < ranges.length; i++) {
      let range = ranges[i];
      if (range.empty ? range.from <= pos : range.from < pos)
        return EditorSelection.normalized(ranges.slice(), mainIndex);
      pos = range.to;
    }
    return new EditorSelection(ranges, mainIndex);
  }
  static cursor(pos, assoc = 0, bidiLevel, goalColumn) {
    return SelectionRange.create(pos, pos, (assoc == 0 ? 0 : assoc < 0 ? 8 : 16) | (bidiLevel == null ? 7 : Math.min(6, bidiLevel)) | (goalColumn !== null && goalColumn !== void 0 ? goalColumn : 16777215) << 6);
  }
  static range(anchor, head, goalColumn, bidiLevel) {
    let flags = (goalColumn !== null && goalColumn !== void 0 ? goalColumn : 16777215) << 6 | (bidiLevel == null ? 7 : Math.min(6, bidiLevel));
    return head < anchor ? SelectionRange.create(head, anchor, 32 | 16 | flags) : SelectionRange.create(anchor, head, (head > anchor ? 8 : 0) | flags);
  }
  static normalized(ranges, mainIndex = 0) {
    let main = ranges[mainIndex];
    ranges.sort((a, b) => a.from - b.from);
    mainIndex = ranges.indexOf(main);
    for (let i = 1; i < ranges.length; i++) {
      let range = ranges[i], prev = ranges[i - 1];
      if (range.empty ? range.from <= prev.to : range.from < prev.to) {
        let from = prev.from, to = Math.max(range.to, prev.to);
        if (i <= mainIndex)
          mainIndex--;
        ranges.splice(--i, 2, range.anchor > range.head ? EditorSelection.range(to, from) : EditorSelection.range(from, to));
      }
    }
    return new EditorSelection(ranges, mainIndex);
  }
};
function checkSelection(selection, docLength) {
  for (let range of selection.ranges)
    if (range.to > docLength)
      throw new RangeError("Selection points outside of document");
}
var nextID = 0;
var Facet = class {
  constructor(combine, compareInput, compare2, isStatic, enables) {
    this.combine = combine;
    this.compareInput = compareInput;
    this.compare = compare2;
    this.isStatic = isStatic;
    this.id = nextID++;
    this.default = combine([]);
    this.extensions = typeof enables == "function" ? enables(this) : enables;
  }
  get reader() {
    return this;
  }
  static define(config = {}) {
    return new Facet(config.combine || ((a) => a), config.compareInput || ((a, b) => a === b), config.compare || (!config.combine ? sameArray : (a, b) => a === b), !!config.static, config.enables);
  }
  of(value) {
    return new FacetProvider([], this, 0, value);
  }
  compute(deps, get) {
    if (this.isStatic)
      throw new Error("Can't compute a static facet");
    return new FacetProvider(deps, this, 1, get);
  }
  computeN(deps, get) {
    if (this.isStatic)
      throw new Error("Can't compute a static facet");
    return new FacetProvider(deps, this, 2, get);
  }
  from(field, get) {
    if (!get)
      get = (x) => x;
    return this.compute([field], (state) => get(state.field(field)));
  }
};
function sameArray(a, b) {
  return a == b || a.length == b.length && a.every((e, i) => e === b[i]);
}
var FacetProvider = class {
  constructor(dependencies, facet, type, value) {
    this.dependencies = dependencies;
    this.facet = facet;
    this.type = type;
    this.value = value;
    this.id = nextID++;
  }
  dynamicSlot(addresses) {
    var _a2;
    let getter = this.value;
    let compare2 = this.facet.compareInput;
    let id2 = this.id, idx = addresses[id2] >> 1, multi = this.type == 2;
    let depDoc = false, depSel = false, depAddrs = [];
    for (let dep of this.dependencies) {
      if (dep == "doc")
        depDoc = true;
      else if (dep == "selection")
        depSel = true;
      else if ((((_a2 = addresses[dep.id]) !== null && _a2 !== void 0 ? _a2 : 1) & 1) == 0)
        depAddrs.push(addresses[dep.id]);
    }
    return {
      create(state) {
        state.values[idx] = getter(state);
        return 1;
      },
      update(state, tr) {
        if (depDoc && tr.docChanged || depSel && (tr.docChanged || tr.selection) || ensureAll(state, depAddrs)) {
          let newVal = getter(state);
          if (multi ? !compareArray(newVal, state.values[idx], compare2) : !compare2(newVal, state.values[idx])) {
            state.values[idx] = newVal;
            return 1;
          }
        }
        return 0;
      },
      reconfigure: (state, oldState) => {
        let newVal, oldAddr = oldState.config.address[id2];
        if (oldAddr != null) {
          let oldVal = getAddr(oldState, oldAddr);
          if (this.dependencies.every((dep) => {
            return dep instanceof Facet ? oldState.facet(dep) === state.facet(dep) : dep instanceof StateField ? oldState.field(dep, false) == state.field(dep, false) : true;
          }) || (multi ? compareArray(newVal = getter(state), oldVal, compare2) : compare2(newVal = getter(state), oldVal))) {
            state.values[idx] = oldVal;
            return 0;
          }
        } else {
          newVal = getter(state);
        }
        state.values[idx] = newVal;
        return 1;
      }
    };
  }
};
function compareArray(a, b, compare2) {
  if (a.length != b.length)
    return false;
  for (let i = 0; i < a.length; i++)
    if (!compare2(a[i], b[i]))
      return false;
  return true;
}
function ensureAll(state, addrs) {
  let changed = false;
  for (let addr of addrs)
    if (ensureAddr(state, addr) & 1)
      changed = true;
  return changed;
}
function dynamicFacetSlot(addresses, facet, providers) {
  let providerAddrs = providers.map((p) => addresses[p.id]);
  let providerTypes = providers.map((p) => p.type);
  let dynamic = providerAddrs.filter((p) => !(p & 1));
  let idx = addresses[facet.id] >> 1;
  function get(state) {
    let values2 = [];
    for (let i = 0; i < providerAddrs.length; i++) {
      let value = getAddr(state, providerAddrs[i]);
      if (providerTypes[i] == 2)
        for (let val of value)
          values2.push(val);
      else
        values2.push(value);
    }
    return facet.combine(values2);
  }
  return {
    create(state) {
      for (let addr of providerAddrs)
        ensureAddr(state, addr);
      state.values[idx] = get(state);
      return 1;
    },
    update(state, tr) {
      if (!ensureAll(state, dynamic))
        return 0;
      let value = get(state);
      if (facet.compare(value, state.values[idx]))
        return 0;
      state.values[idx] = value;
      return 1;
    },
    reconfigure(state, oldState) {
      let depChanged = ensureAll(state, providerAddrs);
      let oldProviders = oldState.config.facets[facet.id], oldValue = oldState.facet(facet);
      if (oldProviders && !depChanged && sameArray(providers, oldProviders)) {
        state.values[idx] = oldValue;
        return 0;
      }
      let value = get(state);
      if (facet.compare(value, oldValue)) {
        state.values[idx] = oldValue;
        return 0;
      }
      state.values[idx] = value;
      return 1;
    }
  };
}
var initField = /* @__PURE__ */ Facet.define({ static: true });
var StateField = class {
  constructor(id2, createF, updateF, compareF, spec) {
    this.id = id2;
    this.createF = createF;
    this.updateF = updateF;
    this.compareF = compareF;
    this.spec = spec;
    this.provides = void 0;
  }
  static define(config) {
    let field = new StateField(nextID++, config.create, config.update, config.compare || ((a, b) => a === b), config);
    if (config.provide)
      field.provides = config.provide(field);
    return field;
  }
  create(state) {
    let init = state.facet(initField).find((i) => i.field == this);
    return ((init === null || init === void 0 ? void 0 : init.create) || this.createF)(state);
  }
  slot(addresses) {
    let idx = addresses[this.id] >> 1;
    return {
      create: (state) => {
        state.values[idx] = this.create(state);
        return 1;
      },
      update: (state, tr) => {
        let oldVal = state.values[idx];
        let value = this.updateF(oldVal, tr);
        if (this.compareF(oldVal, value))
          return 0;
        state.values[idx] = value;
        return 1;
      },
      reconfigure: (state, oldState) => {
        if (oldState.config.address[this.id] != null) {
          state.values[idx] = oldState.field(this);
          return 0;
        }
        state.values[idx] = this.create(state);
        return 1;
      }
    };
  }
  init(create) {
    return [this, initField.of({ field: this, create })];
  }
  get extension() {
    return this;
  }
};
var Prec_ = { lowest: 4, low: 3, default: 2, high: 1, highest: 0 };
function prec(value) {
  return (ext) => new PrecExtension(ext, value);
}
var Prec = {
  highest: /* @__PURE__ */ prec(Prec_.highest),
  high: /* @__PURE__ */ prec(Prec_.high),
  default: /* @__PURE__ */ prec(Prec_.default),
  low: /* @__PURE__ */ prec(Prec_.low),
  lowest: /* @__PURE__ */ prec(Prec_.lowest)
};
var PrecExtension = class {
  constructor(inner, prec2) {
    this.inner = inner;
    this.prec = prec2;
  }
};
var Compartment = class {
  of(ext) {
    return new CompartmentInstance(this, ext);
  }
  reconfigure(content2) {
    return Compartment.reconfigure.of({ compartment: this, extension: content2 });
  }
  get(state) {
    return state.config.compartments.get(this);
  }
};
var CompartmentInstance = class {
  constructor(compartment, inner) {
    this.compartment = compartment;
    this.inner = inner;
  }
};
var Configuration = class {
  constructor(base2, compartments, dynamicSlots, address, staticValues, facets) {
    this.base = base2;
    this.compartments = compartments;
    this.dynamicSlots = dynamicSlots;
    this.address = address;
    this.staticValues = staticValues;
    this.facets = facets;
    this.statusTemplate = [];
    while (this.statusTemplate.length < dynamicSlots.length)
      this.statusTemplate.push(0);
  }
  staticFacet(facet) {
    let addr = this.address[facet.id];
    return addr == null ? facet.default : this.staticValues[addr >> 1];
  }
  static resolve(base2, compartments, oldState) {
    let fields = [];
    let facets = Object.create(null);
    let newCompartments = new Map();
    for (let ext of flatten(base2, compartments, newCompartments)) {
      if (ext instanceof StateField)
        fields.push(ext);
      else
        (facets[ext.facet.id] || (facets[ext.facet.id] = [])).push(ext);
    }
    let address = Object.create(null);
    let staticValues = [];
    let dynamicSlots = [];
    for (let field of fields) {
      address[field.id] = dynamicSlots.length << 1;
      dynamicSlots.push((a) => field.slot(a));
    }
    let oldFacets = oldState === null || oldState === void 0 ? void 0 : oldState.config.facets;
    for (let id2 in facets) {
      let providers = facets[id2], facet = providers[0].facet;
      let oldProviders = oldFacets && oldFacets[id2] || [];
      if (providers.every((p) => p.type == 0)) {
        address[facet.id] = staticValues.length << 1 | 1;
        if (sameArray(oldProviders, providers)) {
          staticValues.push(oldState.facet(facet));
        } else {
          let value = facet.combine(providers.map((p) => p.value));
          staticValues.push(oldState && facet.compare(value, oldState.facet(facet)) ? oldState.facet(facet) : value);
        }
      } else {
        for (let p of providers) {
          if (p.type == 0) {
            address[p.id] = staticValues.length << 1 | 1;
            staticValues.push(p.value);
          } else {
            address[p.id] = dynamicSlots.length << 1;
            dynamicSlots.push((a) => p.dynamicSlot(a));
          }
        }
        address[facet.id] = dynamicSlots.length << 1;
        dynamicSlots.push((a) => dynamicFacetSlot(a, facet, providers));
      }
    }
    let dynamic = dynamicSlots.map((f) => f(address));
    return new Configuration(base2, newCompartments, dynamic, address, staticValues, facets);
  }
};
function flatten(extension, compartments, newCompartments) {
  let result = [[], [], [], [], []];
  let seen = new Map();
  function inner(ext, prec2) {
    let known = seen.get(ext);
    if (known != null) {
      if (known <= prec2)
        return;
      let found = result[known].indexOf(ext);
      if (found > -1)
        result[known].splice(found, 1);
      if (ext instanceof CompartmentInstance)
        newCompartments.delete(ext.compartment);
    }
    seen.set(ext, prec2);
    if (Array.isArray(ext)) {
      for (let e of ext)
        inner(e, prec2);
    } else if (ext instanceof CompartmentInstance) {
      if (newCompartments.has(ext.compartment))
        throw new RangeError(`Duplicate use of compartment in extensions`);
      let content2 = compartments.get(ext.compartment) || ext.inner;
      newCompartments.set(ext.compartment, content2);
      inner(content2, prec2);
    } else if (ext instanceof PrecExtension) {
      inner(ext.inner, ext.prec);
    } else if (ext instanceof StateField) {
      result[prec2].push(ext);
      if (ext.provides)
        inner(ext.provides, prec2);
    } else if (ext instanceof FacetProvider) {
      result[prec2].push(ext);
      if (ext.facet.extensions)
        inner(ext.facet.extensions, Prec_.default);
    } else {
      let content2 = ext.extension;
      if (!content2)
        throw new Error(`Unrecognized extension value in extension set (${ext}). This sometimes happens because multiple instances of @codemirror/state are loaded, breaking instanceof checks.`);
      inner(content2, prec2);
    }
  }
  inner(extension, Prec_.default);
  return result.reduce((a, b) => a.concat(b));
}
function ensureAddr(state, addr) {
  if (addr & 1)
    return 2;
  let idx = addr >> 1;
  let status = state.status[idx];
  if (status == 4)
    throw new Error("Cyclic dependency between fields and/or facets");
  if (status & 2)
    return status;
  state.status[idx] = 4;
  let changed = state.computeSlot(state, state.config.dynamicSlots[idx]);
  return state.status[idx] = 2 | changed;
}
function getAddr(state, addr) {
  return addr & 1 ? state.config.staticValues[addr >> 1] : state.values[addr >> 1];
}
var languageData = /* @__PURE__ */ Facet.define();
var allowMultipleSelections = /* @__PURE__ */ Facet.define({
  combine: (values2) => values2.some((v) => v),
  static: true
});
var lineSeparator = /* @__PURE__ */ Facet.define({
  combine: (values2) => values2.length ? values2[0] : void 0,
  static: true
});
var changeFilter = /* @__PURE__ */ Facet.define();
var transactionFilter = /* @__PURE__ */ Facet.define();
var transactionExtender = /* @__PURE__ */ Facet.define();
var readOnly = /* @__PURE__ */ Facet.define({
  combine: (values2) => values2.length ? values2[0] : false
});
var Annotation = class {
  constructor(type, value) {
    this.type = type;
    this.value = value;
  }
  static define() {
    return new AnnotationType();
  }
};
var AnnotationType = class {
  of(value) {
    return new Annotation(this, value);
  }
};
var StateEffectType = class {
  constructor(map) {
    this.map = map;
  }
  of(value) {
    return new StateEffect(this, value);
  }
};
var StateEffect = class {
  constructor(type, value) {
    this.type = type;
    this.value = value;
  }
  map(mapping) {
    let mapped = this.type.map(this.value, mapping);
    return mapped === void 0 ? void 0 : mapped == this.value ? this : new StateEffect(this.type, mapped);
  }
  is(type) {
    return this.type == type;
  }
  static define(spec = {}) {
    return new StateEffectType(spec.map || ((v) => v));
  }
  static mapEffects(effects, mapping) {
    if (!effects.length)
      return effects;
    let result = [];
    for (let effect of effects) {
      let mapped = effect.map(mapping);
      if (mapped)
        result.push(mapped);
    }
    return result;
  }
};
StateEffect.reconfigure = /* @__PURE__ */ StateEffect.define();
StateEffect.appendConfig = /* @__PURE__ */ StateEffect.define();
var Transaction = class {
  constructor(startState, changes, selection, effects, annotations, scrollIntoView2) {
    this.startState = startState;
    this.changes = changes;
    this.selection = selection;
    this.effects = effects;
    this.annotations = annotations;
    this.scrollIntoView = scrollIntoView2;
    this._doc = null;
    this._state = null;
    if (selection)
      checkSelection(selection, changes.newLength);
    if (!annotations.some((a) => a.type == Transaction.time))
      this.annotations = annotations.concat(Transaction.time.of(Date.now()));
  }
  static create(startState, changes, selection, effects, annotations, scrollIntoView2) {
    return new Transaction(startState, changes, selection, effects, annotations, scrollIntoView2);
  }
  get newDoc() {
    return this._doc || (this._doc = this.changes.apply(this.startState.doc));
  }
  get newSelection() {
    return this.selection || this.startState.selection.map(this.changes);
  }
  get state() {
    if (!this._state)
      this.startState.applyTransaction(this);
    return this._state;
  }
  annotation(type) {
    for (let ann of this.annotations)
      if (ann.type == type)
        return ann.value;
    return void 0;
  }
  get docChanged() {
    return !this.changes.empty;
  }
  get reconfigured() {
    return this.startState.config != this.state.config;
  }
  isUserEvent(event) {
    let e = this.annotation(Transaction.userEvent);
    return !!(e && (e == event || e.length > event.length && e.slice(0, event.length) == event && e[event.length] == "."));
  }
};
Transaction.time = /* @__PURE__ */ Annotation.define();
Transaction.userEvent = /* @__PURE__ */ Annotation.define();
Transaction.addToHistory = /* @__PURE__ */ Annotation.define();
Transaction.remote = /* @__PURE__ */ Annotation.define();
function joinRanges(a, b) {
  let result = [];
  for (let iA = 0, iB = 0; ; ) {
    let from, to;
    if (iA < a.length && (iB == b.length || b[iB] >= a[iA])) {
      from = a[iA++];
      to = a[iA++];
    } else if (iB < b.length) {
      from = b[iB++];
      to = b[iB++];
    } else
      return result;
    if (!result.length || result[result.length - 1] < from)
      result.push(from, to);
    else if (result[result.length - 1] < to)
      result[result.length - 1] = to;
  }
}
function mergeTransaction(a, b, sequential) {
  var _a2;
  let mapForA, mapForB, changes;
  if (sequential) {
    mapForA = b.changes;
    mapForB = ChangeSet.empty(b.changes.length);
    changes = a.changes.compose(b.changes);
  } else {
    mapForA = b.changes.map(a.changes);
    mapForB = a.changes.mapDesc(b.changes, true);
    changes = a.changes.compose(mapForA);
  }
  return {
    changes,
    selection: b.selection ? b.selection.map(mapForB) : (_a2 = a.selection) === null || _a2 === void 0 ? void 0 : _a2.map(mapForA),
    effects: StateEffect.mapEffects(a.effects, mapForA).concat(StateEffect.mapEffects(b.effects, mapForB)),
    annotations: a.annotations.length ? a.annotations.concat(b.annotations) : b.annotations,
    scrollIntoView: a.scrollIntoView || b.scrollIntoView
  };
}
function resolveTransactionInner(state, spec, docSize) {
  let sel = spec.selection, annotations = asArray(spec.annotations);
  if (spec.userEvent)
    annotations = annotations.concat(Transaction.userEvent.of(spec.userEvent));
  return {
    changes: spec.changes instanceof ChangeSet ? spec.changes : ChangeSet.of(spec.changes || [], docSize, state.facet(lineSeparator)),
    selection: sel && (sel instanceof EditorSelection ? sel : EditorSelection.single(sel.anchor, sel.head)),
    effects: asArray(spec.effects),
    annotations,
    scrollIntoView: !!spec.scrollIntoView
  };
}
function resolveTransaction(state, specs, filter) {
  let s = resolveTransactionInner(state, specs.length ? specs[0] : {}, state.doc.length);
  if (specs.length && specs[0].filter === false)
    filter = false;
  for (let i = 1; i < specs.length; i++) {
    if (specs[i].filter === false)
      filter = false;
    let seq = !!specs[i].sequential;
    s = mergeTransaction(s, resolveTransactionInner(state, specs[i], seq ? s.changes.newLength : state.doc.length), seq);
  }
  let tr = Transaction.create(state, s.changes, s.selection, s.effects, s.annotations, s.scrollIntoView);
  return extendTransaction(filter ? filterTransaction(tr) : tr);
}
function filterTransaction(tr) {
  let state = tr.startState;
  let result = true;
  for (let filter of state.facet(changeFilter)) {
    let value = filter(tr);
    if (value === false) {
      result = false;
      break;
    }
    if (Array.isArray(value))
      result = result === true ? value : joinRanges(result, value);
  }
  if (result !== true) {
    let changes, back;
    if (result === false) {
      back = tr.changes.invertedDesc;
      changes = ChangeSet.empty(state.doc.length);
    } else {
      let filtered = tr.changes.filter(result);
      changes = filtered.changes;
      back = filtered.filtered.mapDesc(filtered.changes).invertedDesc;
    }
    tr = Transaction.create(state, changes, tr.selection && tr.selection.map(back), StateEffect.mapEffects(tr.effects, back), tr.annotations, tr.scrollIntoView);
  }
  let filters = state.facet(transactionFilter);
  for (let i = filters.length - 1; i >= 0; i--) {
    let filtered = filters[i](tr);
    if (filtered instanceof Transaction)
      tr = filtered;
    else if (Array.isArray(filtered) && filtered.length == 1 && filtered[0] instanceof Transaction)
      tr = filtered[0];
    else
      tr = resolveTransaction(state, asArray(filtered), false);
  }
  return tr;
}
function extendTransaction(tr) {
  let state = tr.startState, extenders = state.facet(transactionExtender), spec = tr;
  for (let i = extenders.length - 1; i >= 0; i--) {
    let extension = extenders[i](tr);
    if (extension && Object.keys(extension).length)
      spec = mergeTransaction(spec, resolveTransactionInner(state, extension, tr.changes.newLength), true);
  }
  return spec == tr ? tr : Transaction.create(state, tr.changes, tr.selection, spec.effects, spec.annotations, spec.scrollIntoView);
}
var none = [];
function asArray(value) {
  return value == null ? none : Array.isArray(value) ? value : [value];
}
var CharCategory = /* @__PURE__ */ function(CharCategory2) {
  CharCategory2[CharCategory2["Word"] = 0] = "Word";
  CharCategory2[CharCategory2["Space"] = 1] = "Space";
  CharCategory2[CharCategory2["Other"] = 2] = "Other";
  return CharCategory2;
}(CharCategory || (CharCategory = {}));
var nonASCIISingleCaseWordChar = /[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;
var wordChar;
try {
  wordChar = /* @__PURE__ */ new RegExp("[\\p{Alphabetic}\\p{Number}_]", "u");
} catch (_) {
}
function hasWordChar(str) {
  if (wordChar)
    return wordChar.test(str);
  for (let i = 0; i < str.length; i++) {
    let ch = str[i];
    if (/\w/.test(ch) || ch > "\x80" && (ch.toUpperCase() != ch.toLowerCase() || nonASCIISingleCaseWordChar.test(ch)))
      return true;
  }
  return false;
}
function makeCategorizer(wordChars) {
  return (char) => {
    if (!/\S/.test(char))
      return CharCategory.Space;
    if (hasWordChar(char))
      return CharCategory.Word;
    for (let i = 0; i < wordChars.length; i++)
      if (char.indexOf(wordChars[i]) > -1)
        return CharCategory.Word;
    return CharCategory.Other;
  };
}
var EditorState = class {
  constructor(config, doc2, selection, values2, computeSlot, tr) {
    this.config = config;
    this.doc = doc2;
    this.selection = selection;
    this.values = values2;
    this.status = config.statusTemplate.slice();
    this.computeSlot = computeSlot;
    if (tr)
      tr._state = this;
    for (let i = 0; i < this.config.dynamicSlots.length; i++)
      ensureAddr(this, i << 1);
    this.computeSlot = null;
  }
  field(field, require2 = true) {
    let addr = this.config.address[field.id];
    if (addr == null) {
      if (require2)
        throw new RangeError("Field is not present in this state");
      return void 0;
    }
    ensureAddr(this, addr);
    return getAddr(this, addr);
  }
  update(...specs) {
    return resolveTransaction(this, specs, true);
  }
  applyTransaction(tr) {
    let conf = this.config, { base: base2, compartments } = conf;
    for (let effect of tr.effects) {
      if (effect.is(Compartment.reconfigure)) {
        if (conf) {
          compartments = new Map();
          conf.compartments.forEach((val, key) => compartments.set(key, val));
          conf = null;
        }
        compartments.set(effect.value.compartment, effect.value.extension);
      } else if (effect.is(StateEffect.reconfigure)) {
        conf = null;
        base2 = effect.value;
      } else if (effect.is(StateEffect.appendConfig)) {
        conf = null;
        base2 = asArray(base2).concat(effect.value);
      }
    }
    let startValues;
    if (!conf) {
      conf = Configuration.resolve(base2, compartments, this);
      let intermediateState = new EditorState(conf, this.doc, this.selection, conf.dynamicSlots.map(() => null), (state, slot) => slot.reconfigure(state, this), null);
      startValues = intermediateState.values;
    } else {
      startValues = tr.startState.values.slice();
    }
    let selection = tr.startState.facet(allowMultipleSelections) ? tr.newSelection : tr.newSelection.asSingle();
    new EditorState(conf, tr.newDoc, selection, startValues, (state, slot) => slot.update(state, tr), tr);
  }
  replaceSelection(text) {
    if (typeof text == "string")
      text = this.toText(text);
    return this.changeByRange((range) => ({
      changes: { from: range.from, to: range.to, insert: text },
      range: EditorSelection.cursor(range.from + text.length)
    }));
  }
  changeByRange(f) {
    let sel = this.selection;
    let result1 = f(sel.ranges[0]);
    let changes = this.changes(result1.changes), ranges = [result1.range];
    let effects = asArray(result1.effects);
    for (let i = 1; i < sel.ranges.length; i++) {
      let result = f(sel.ranges[i]);
      let newChanges = this.changes(result.changes), newMapped = newChanges.map(changes);
      for (let j = 0; j < i; j++)
        ranges[j] = ranges[j].map(newMapped);
      let mapBy = changes.mapDesc(newChanges, true);
      ranges.push(result.range.map(mapBy));
      changes = changes.compose(newMapped);
      effects = StateEffect.mapEffects(effects, newMapped).concat(StateEffect.mapEffects(asArray(result.effects), mapBy));
    }
    return {
      changes,
      selection: EditorSelection.create(ranges, sel.mainIndex),
      effects
    };
  }
  changes(spec = []) {
    if (spec instanceof ChangeSet)
      return spec;
    return ChangeSet.of(spec, this.doc.length, this.facet(EditorState.lineSeparator));
  }
  toText(string2) {
    return Text.of(string2.split(this.facet(EditorState.lineSeparator) || DefaultSplit));
  }
  sliceDoc(from = 0, to = this.doc.length) {
    return this.doc.sliceString(from, to, this.lineBreak);
  }
  facet(facet) {
    let addr = this.config.address[facet.id];
    if (addr == null)
      return facet.default;
    ensureAddr(this, addr);
    return getAddr(this, addr);
  }
  toJSON(fields) {
    let result = {
      doc: this.sliceDoc(),
      selection: this.selection.toJSON()
    };
    if (fields)
      for (let prop in fields) {
        let value = fields[prop];
        if (value instanceof StateField && this.config.address[value.id] != null)
          result[prop] = value.spec.toJSON(this.field(fields[prop]), this);
      }
    return result;
  }
  static fromJSON(json, config = {}, fields) {
    if (!json || typeof json.doc != "string")
      throw new RangeError("Invalid JSON representation for EditorState");
    let fieldInit = [];
    if (fields)
      for (let prop in fields) {
        if (Object.prototype.hasOwnProperty.call(json, prop)) {
          let field = fields[prop], value = json[prop];
          fieldInit.push(field.init((state) => field.spec.fromJSON(value, state)));
        }
      }
    return EditorState.create({
      doc: json.doc,
      selection: EditorSelection.fromJSON(json.selection),
      extensions: config.extensions ? fieldInit.concat([config.extensions]) : fieldInit
    });
  }
  static create(config = {}) {
    let configuration = Configuration.resolve(config.extensions || [], new Map());
    let doc2 = config.doc instanceof Text ? config.doc : Text.of((config.doc || "").split(configuration.staticFacet(EditorState.lineSeparator) || DefaultSplit));
    let selection = !config.selection ? EditorSelection.single(0) : config.selection instanceof EditorSelection ? config.selection : EditorSelection.single(config.selection.anchor, config.selection.head);
    checkSelection(selection, doc2.length);
    if (!configuration.staticFacet(allowMultipleSelections))
      selection = selection.asSingle();
    return new EditorState(configuration, doc2, selection, configuration.dynamicSlots.map(() => null), (state, slot) => slot.create(state), null);
  }
  get tabSize() {
    return this.facet(EditorState.tabSize);
  }
  get lineBreak() {
    return this.facet(EditorState.lineSeparator) || "\n";
  }
  get readOnly() {
    return this.facet(readOnly);
  }
  phrase(phrase, ...insert2) {
    for (let map of this.facet(EditorState.phrases))
      if (Object.prototype.hasOwnProperty.call(map, phrase)) {
        phrase = map[phrase];
        break;
      }
    if (insert2.length)
      phrase = phrase.replace(/\$(\$|\d*)/g, (m, i) => {
        if (i == "$")
          return "$";
        let n = +(i || 1);
        return !n || n > insert2.length ? m : insert2[n - 1];
      });
    return phrase;
  }
  languageDataAt(name2, pos, side = -1) {
    let values2 = [];
    for (let provider of this.facet(languageData)) {
      for (let result of provider(this, pos, side)) {
        if (Object.prototype.hasOwnProperty.call(result, name2))
          values2.push(result[name2]);
      }
    }
    return values2;
  }
  charCategorizer(at) {
    return makeCategorizer(this.languageDataAt("wordChars", at).join(""));
  }
  wordAt(pos) {
    let { text, from, length } = this.doc.lineAt(pos);
    let cat = this.charCategorizer(pos);
    let start = pos - from, end = pos - from;
    while (start > 0) {
      let prev = findClusterBreak(text, start, false);
      if (cat(text.slice(prev, start)) != CharCategory.Word)
        break;
      start = prev;
    }
    while (end < length) {
      let next = findClusterBreak(text, end);
      if (cat(text.slice(end, next)) != CharCategory.Word)
        break;
      end = next;
    }
    return start == end ? null : EditorSelection.range(start + from, end + from);
  }
};
EditorState.allowMultipleSelections = allowMultipleSelections;
EditorState.tabSize = /* @__PURE__ */ Facet.define({
  combine: (values2) => values2.length ? values2[0] : 4
});
EditorState.lineSeparator = lineSeparator;
EditorState.readOnly = readOnly;
EditorState.phrases = /* @__PURE__ */ Facet.define({
  compare(a, b) {
    let kA = Object.keys(a), kB = Object.keys(b);
    return kA.length == kB.length && kA.every((k) => a[k] == b[k]);
  }
});
EditorState.languageData = languageData;
EditorState.changeFilter = changeFilter;
EditorState.transactionFilter = transactionFilter;
EditorState.transactionExtender = transactionExtender;
Compartment.reconfigure = /* @__PURE__ */ StateEffect.define();
function combineConfig(configs, defaults, combine = {}) {
  let result = {};
  for (let config of configs)
    for (let key of Object.keys(config)) {
      let value = config[key], current = result[key];
      if (current === void 0)
        result[key] = value;
      else if (current === value || value === void 0)
        ;
      else if (Object.hasOwnProperty.call(combine, key))
        result[key] = combine[key](current, value);
      else
        throw new Error("Config merge conflict for field " + key);
    }
  for (let key in defaults)
    if (result[key] === void 0)
      result[key] = defaults[key];
  return result;
}
var RangeValue = class {
  eq(other) {
    return this == other;
  }
  range(from, to = from) {
    return Range.create(from, to, this);
  }
};
RangeValue.prototype.startSide = RangeValue.prototype.endSide = 0;
RangeValue.prototype.point = false;
RangeValue.prototype.mapMode = MapMode.TrackDel;
var Range = class {
  constructor(from, to, value) {
    this.from = from;
    this.to = to;
    this.value = value;
  }
  static create(from, to, value) {
    return new Range(from, to, value);
  }
};
function cmpRange(a, b) {
  return a.from - b.from || a.value.startSide - b.value.startSide;
}
var Chunk = class {
  constructor(from, to, value, maxPoint) {
    this.from = from;
    this.to = to;
    this.value = value;
    this.maxPoint = maxPoint;
  }
  get length() {
    return this.to[this.to.length - 1];
  }
  findIndex(pos, side, end, startAt = 0) {
    let arr = end ? this.to : this.from;
    for (let lo = startAt, hi = arr.length; ; ) {
      if (lo == hi)
        return lo;
      let mid = lo + hi >> 1;
      let diff = arr[mid] - pos || (end ? this.value[mid].endSide : this.value[mid].startSide) - side;
      if (mid == lo)
        return diff >= 0 ? lo : hi;
      if (diff >= 0)
        hi = mid;
      else
        lo = mid + 1;
    }
  }
  between(offset, from, to, f) {
    for (let i = this.findIndex(from, -1e9, true), e = this.findIndex(to, 1e9, false, i); i < e; i++)
      if (f(this.from[i] + offset, this.to[i] + offset, this.value[i]) === false)
        return false;
  }
  map(offset, changes) {
    let value = [], from = [], to = [], newPos = -1, maxPoint = -1;
    for (let i = 0; i < this.value.length; i++) {
      let val = this.value[i], curFrom = this.from[i] + offset, curTo = this.to[i] + offset, newFrom, newTo;
      if (curFrom == curTo) {
        let mapped = changes.mapPos(curFrom, val.startSide, val.mapMode);
        if (mapped == null)
          continue;
        newFrom = newTo = mapped;
        if (val.startSide != val.endSide) {
          newTo = changes.mapPos(curFrom, val.endSide);
          if (newTo < newFrom)
            continue;
        }
      } else {
        newFrom = changes.mapPos(curFrom, val.startSide);
        newTo = changes.mapPos(curTo, val.endSide);
        if (newFrom > newTo || newFrom == newTo && val.startSide > 0 && val.endSide <= 0)
          continue;
      }
      if ((newTo - newFrom || val.endSide - val.startSide) < 0)
        continue;
      if (newPos < 0)
        newPos = newFrom;
      if (val.point)
        maxPoint = Math.max(maxPoint, newTo - newFrom);
      value.push(val);
      from.push(newFrom - newPos);
      to.push(newTo - newPos);
    }
    return { mapped: value.length ? new Chunk(from, to, value, maxPoint) : null, pos: newPos };
  }
};
var RangeSet = class {
  constructor(chunkPos, chunk, nextLayer, maxPoint) {
    this.chunkPos = chunkPos;
    this.chunk = chunk;
    this.nextLayer = nextLayer;
    this.maxPoint = maxPoint;
  }
  static create(chunkPos, chunk, nextLayer, maxPoint) {
    return new RangeSet(chunkPos, chunk, nextLayer, maxPoint);
  }
  get length() {
    let last = this.chunk.length - 1;
    return last < 0 ? 0 : Math.max(this.chunkEnd(last), this.nextLayer.length);
  }
  get size() {
    if (this.isEmpty)
      return 0;
    let size = this.nextLayer.size;
    for (let chunk of this.chunk)
      size += chunk.value.length;
    return size;
  }
  chunkEnd(index) {
    return this.chunkPos[index] + this.chunk[index].length;
  }
  update(updateSpec) {
    let { add = [], sort = false, filterFrom = 0, filterTo = this.length } = updateSpec;
    let filter = updateSpec.filter;
    if (add.length == 0 && !filter)
      return this;
    if (sort)
      add = add.slice().sort(cmpRange);
    if (this.isEmpty)
      return add.length ? RangeSet.of(add) : this;
    let cur = new LayerCursor(this, null, -1).goto(0), i = 0, spill = [];
    let builder = new RangeSetBuilder();
    while (cur.value || i < add.length) {
      if (i < add.length && (cur.from - add[i].from || cur.startSide - add[i].value.startSide) >= 0) {
        let range = add[i++];
        if (!builder.addInner(range.from, range.to, range.value))
          spill.push(range);
      } else if (cur.rangeIndex == 1 && cur.chunkIndex < this.chunk.length && (i == add.length || this.chunkEnd(cur.chunkIndex) < add[i].from) && (!filter || filterFrom > this.chunkEnd(cur.chunkIndex) || filterTo < this.chunkPos[cur.chunkIndex]) && builder.addChunk(this.chunkPos[cur.chunkIndex], this.chunk[cur.chunkIndex])) {
        cur.nextChunk();
      } else {
        if (!filter || filterFrom > cur.to || filterTo < cur.from || filter(cur.from, cur.to, cur.value)) {
          if (!builder.addInner(cur.from, cur.to, cur.value))
            spill.push(Range.create(cur.from, cur.to, cur.value));
        }
        cur.next();
      }
    }
    return builder.finishInner(this.nextLayer.isEmpty && !spill.length ? RangeSet.empty : this.nextLayer.update({ add: spill, filter, filterFrom, filterTo }));
  }
  map(changes) {
    if (changes.empty || this.isEmpty)
      return this;
    let chunks = [], chunkPos = [], maxPoint = -1;
    for (let i = 0; i < this.chunk.length; i++) {
      let start = this.chunkPos[i], chunk = this.chunk[i];
      let touch = changes.touchesRange(start, start + chunk.length);
      if (touch === false) {
        maxPoint = Math.max(maxPoint, chunk.maxPoint);
        chunks.push(chunk);
        chunkPos.push(changes.mapPos(start));
      } else if (touch === true) {
        let { mapped, pos } = chunk.map(start, changes);
        if (mapped) {
          maxPoint = Math.max(maxPoint, mapped.maxPoint);
          chunks.push(mapped);
          chunkPos.push(pos);
        }
      }
    }
    let next = this.nextLayer.map(changes);
    return chunks.length == 0 ? next : new RangeSet(chunkPos, chunks, next || RangeSet.empty, maxPoint);
  }
  between(from, to, f) {
    if (this.isEmpty)
      return;
    for (let i = 0; i < this.chunk.length; i++) {
      let start = this.chunkPos[i], chunk = this.chunk[i];
      if (to >= start && from <= start + chunk.length && chunk.between(start, from - start, to - start, f) === false)
        return;
    }
    this.nextLayer.between(from, to, f);
  }
  iter(from = 0) {
    return HeapCursor.from([this]).goto(from);
  }
  get isEmpty() {
    return this.nextLayer == this;
  }
  static iter(sets, from = 0) {
    return HeapCursor.from(sets).goto(from);
  }
  static compare(oldSets, newSets, textDiff, comparator, minPointSize = -1) {
    let a = oldSets.filter((set) => set.maxPoint > 0 || !set.isEmpty && set.maxPoint >= minPointSize);
    let b = newSets.filter((set) => set.maxPoint > 0 || !set.isEmpty && set.maxPoint >= minPointSize);
    let sharedChunks = findSharedChunks(a, b, textDiff);
    let sideA = new SpanCursor(a, sharedChunks, minPointSize);
    let sideB = new SpanCursor(b, sharedChunks, minPointSize);
    textDiff.iterGaps((fromA, fromB, length) => compare(sideA, fromA, sideB, fromB, length, comparator));
    if (textDiff.empty && textDiff.length == 0)
      compare(sideA, 0, sideB, 0, 0, comparator);
  }
  static eq(oldSets, newSets, from = 0, to) {
    if (to == null)
      to = 1e9 - 1;
    let a = oldSets.filter((set) => !set.isEmpty && newSets.indexOf(set) < 0);
    let b = newSets.filter((set) => !set.isEmpty && oldSets.indexOf(set) < 0);
    if (a.length != b.length)
      return false;
    if (!a.length)
      return true;
    let sharedChunks = findSharedChunks(a, b);
    let sideA = new SpanCursor(a, sharedChunks, 0).goto(from), sideB = new SpanCursor(b, sharedChunks, 0).goto(from);
    for (; ; ) {
      if (sideA.to != sideB.to || !sameValues(sideA.active, sideB.active) || sideA.point && (!sideB.point || !sideA.point.eq(sideB.point)))
        return false;
      if (sideA.to > to)
        return true;
      sideA.next();
      sideB.next();
    }
  }
  static spans(sets, from, to, iterator, minPointSize = -1) {
    let cursor = new SpanCursor(sets, null, minPointSize).goto(from), pos = from;
    let openRanges = cursor.openStart;
    for (; ; ) {
      let curTo = Math.min(cursor.to, to);
      if (cursor.point) {
        let active = cursor.activeForPoint(cursor.to);
        let openCount = cursor.pointFrom < from ? active.length + 1 : cursor.point.startSide < 0 ? active.length : Math.min(active.length, openRanges);
        iterator.point(pos, curTo, cursor.point, active, openCount, cursor.pointRank);
        openRanges = Math.min(cursor.openEnd(curTo), active.length);
      } else if (curTo > pos) {
        iterator.span(pos, curTo, cursor.active, openRanges);
        openRanges = cursor.openEnd(curTo);
      }
      if (cursor.to > to)
        return openRanges + (cursor.point && cursor.to > to ? 1 : 0);
      pos = cursor.to;
      cursor.next();
    }
  }
  static of(ranges, sort = false) {
    let build = new RangeSetBuilder();
    for (let range of ranges instanceof Range ? [ranges] : sort ? lazySort(ranges) : ranges)
      build.add(range.from, range.to, range.value);
    return build.finish();
  }
  static join(sets) {
    if (!sets.length)
      return RangeSet.empty;
    let result = sets[sets.length - 1];
    for (let i = sets.length - 2; i >= 0; i--) {
      for (let layer2 = sets[i]; layer2 != RangeSet.empty; layer2 = layer2.nextLayer)
        result = new RangeSet(layer2.chunkPos, layer2.chunk, result, Math.max(layer2.maxPoint, result.maxPoint));
    }
    return result;
  }
};
RangeSet.empty = /* @__PURE__ */ new RangeSet([], [], null, -1);
function lazySort(ranges) {
  if (ranges.length > 1)
    for (let prev = ranges[0], i = 1; i < ranges.length; i++) {
      let cur = ranges[i];
      if (cmpRange(prev, cur) > 0)
        return ranges.slice().sort(cmpRange);
      prev = cur;
    }
  return ranges;
}
RangeSet.empty.nextLayer = RangeSet.empty;
var RangeSetBuilder = class {
  finishChunk(newArrays) {
    this.chunks.push(new Chunk(this.from, this.to, this.value, this.maxPoint));
    this.chunkPos.push(this.chunkStart);
    this.chunkStart = -1;
    this.setMaxPoint = Math.max(this.setMaxPoint, this.maxPoint);
    this.maxPoint = -1;
    if (newArrays) {
      this.from = [];
      this.to = [];
      this.value = [];
    }
  }
  constructor() {
    this.chunks = [];
    this.chunkPos = [];
    this.chunkStart = -1;
    this.last = null;
    this.lastFrom = -1e9;
    this.lastTo = -1e9;
    this.from = [];
    this.to = [];
    this.value = [];
    this.maxPoint = -1;
    this.setMaxPoint = -1;
    this.nextLayer = null;
  }
  add(from, to, value) {
    if (!this.addInner(from, to, value))
      (this.nextLayer || (this.nextLayer = new RangeSetBuilder())).add(from, to, value);
  }
  addInner(from, to, value) {
    let diff = from - this.lastTo || value.startSide - this.last.endSide;
    if (diff <= 0 && (from - this.lastFrom || value.startSide - this.last.startSide) < 0)
      throw new Error("Ranges must be added sorted by `from` position and `startSide`");
    if (diff < 0)
      return false;
    if (this.from.length == 250)
      this.finishChunk(true);
    if (this.chunkStart < 0)
      this.chunkStart = from;
    this.from.push(from - this.chunkStart);
    this.to.push(to - this.chunkStart);
    this.last = value;
    this.lastFrom = from;
    this.lastTo = to;
    this.value.push(value);
    if (value.point)
      this.maxPoint = Math.max(this.maxPoint, to - from);
    return true;
  }
  addChunk(from, chunk) {
    if ((from - this.lastTo || chunk.value[0].startSide - this.last.endSide) < 0)
      return false;
    if (this.from.length)
      this.finishChunk(true);
    this.setMaxPoint = Math.max(this.setMaxPoint, chunk.maxPoint);
    this.chunks.push(chunk);
    this.chunkPos.push(from);
    let last = chunk.value.length - 1;
    this.last = chunk.value[last];
    this.lastFrom = chunk.from[last] + from;
    this.lastTo = chunk.to[last] + from;
    return true;
  }
  finish() {
    return this.finishInner(RangeSet.empty);
  }
  finishInner(next) {
    if (this.from.length)
      this.finishChunk(false);
    if (this.chunks.length == 0)
      return next;
    let result = RangeSet.create(this.chunkPos, this.chunks, this.nextLayer ? this.nextLayer.finishInner(next) : next, this.setMaxPoint);
    this.from = null;
    return result;
  }
};
function findSharedChunks(a, b, textDiff) {
  let inA = new Map();
  for (let set of a)
    for (let i = 0; i < set.chunk.length; i++)
      if (set.chunk[i].maxPoint <= 0)
        inA.set(set.chunk[i], set.chunkPos[i]);
  let shared = new Set();
  for (let set of b)
    for (let i = 0; i < set.chunk.length; i++) {
      let known = inA.get(set.chunk[i]);
      if (known != null && (textDiff ? textDiff.mapPos(known) : known) == set.chunkPos[i] && !(textDiff === null || textDiff === void 0 ? void 0 : textDiff.touchesRange(known, known + set.chunk[i].length)))
        shared.add(set.chunk[i]);
    }
  return shared;
}
var LayerCursor = class {
  constructor(layer2, skip, minPoint, rank = 0) {
    this.layer = layer2;
    this.skip = skip;
    this.minPoint = minPoint;
    this.rank = rank;
  }
  get startSide() {
    return this.value ? this.value.startSide : 0;
  }
  get endSide() {
    return this.value ? this.value.endSide : 0;
  }
  goto(pos, side = -1e9) {
    this.chunkIndex = this.rangeIndex = 0;
    this.gotoInner(pos, side, false);
    return this;
  }
  gotoInner(pos, side, forward) {
    while (this.chunkIndex < this.layer.chunk.length) {
      let next = this.layer.chunk[this.chunkIndex];
      if (!(this.skip && this.skip.has(next) || this.layer.chunkEnd(this.chunkIndex) < pos || next.maxPoint < this.minPoint))
        break;
      this.chunkIndex++;
      forward = false;
    }
    if (this.chunkIndex < this.layer.chunk.length) {
      let rangeIndex = this.layer.chunk[this.chunkIndex].findIndex(pos - this.layer.chunkPos[this.chunkIndex], side, true);
      if (!forward || this.rangeIndex < rangeIndex)
        this.setRangeIndex(rangeIndex);
    }
    this.next();
  }
  forward(pos, side) {
    if ((this.to - pos || this.endSide - side) < 0)
      this.gotoInner(pos, side, true);
  }
  next() {
    for (; ; ) {
      if (this.chunkIndex == this.layer.chunk.length) {
        this.from = this.to = 1e9;
        this.value = null;
        break;
      } else {
        let chunkPos = this.layer.chunkPos[this.chunkIndex], chunk = this.layer.chunk[this.chunkIndex];
        let from = chunkPos + chunk.from[this.rangeIndex];
        this.from = from;
        this.to = chunkPos + chunk.to[this.rangeIndex];
        this.value = chunk.value[this.rangeIndex];
        this.setRangeIndex(this.rangeIndex + 1);
        if (this.minPoint < 0 || this.value.point && this.to - this.from >= this.minPoint)
          break;
      }
    }
  }
  setRangeIndex(index) {
    if (index == this.layer.chunk[this.chunkIndex].value.length) {
      this.chunkIndex++;
      if (this.skip) {
        while (this.chunkIndex < this.layer.chunk.length && this.skip.has(this.layer.chunk[this.chunkIndex]))
          this.chunkIndex++;
      }
      this.rangeIndex = 0;
    } else {
      this.rangeIndex = index;
    }
  }
  nextChunk() {
    this.chunkIndex++;
    this.rangeIndex = 0;
    this.next();
  }
  compare(other) {
    return this.from - other.from || this.startSide - other.startSide || this.rank - other.rank || this.to - other.to || this.endSide - other.endSide;
  }
};
var HeapCursor = class {
  constructor(heap) {
    this.heap = heap;
  }
  static from(sets, skip = null, minPoint = -1) {
    let heap = [];
    for (let i = 0; i < sets.length; i++) {
      for (let cur = sets[i]; !cur.isEmpty; cur = cur.nextLayer) {
        if (cur.maxPoint >= minPoint)
          heap.push(new LayerCursor(cur, skip, minPoint, i));
      }
    }
    return heap.length == 1 ? heap[0] : new HeapCursor(heap);
  }
  get startSide() {
    return this.value ? this.value.startSide : 0;
  }
  goto(pos, side = -1e9) {
    for (let cur of this.heap)
      cur.goto(pos, side);
    for (let i = this.heap.length >> 1; i >= 0; i--)
      heapBubble(this.heap, i);
    this.next();
    return this;
  }
  forward(pos, side) {
    for (let cur of this.heap)
      cur.forward(pos, side);
    for (let i = this.heap.length >> 1; i >= 0; i--)
      heapBubble(this.heap, i);
    if ((this.to - pos || this.value.endSide - side) < 0)
      this.next();
  }
  next() {
    if (this.heap.length == 0) {
      this.from = this.to = 1e9;
      this.value = null;
      this.rank = -1;
    } else {
      let top2 = this.heap[0];
      this.from = top2.from;
      this.to = top2.to;
      this.value = top2.value;
      this.rank = top2.rank;
      if (top2.value)
        top2.next();
      heapBubble(this.heap, 0);
    }
  }
};
function heapBubble(heap, index) {
  for (let cur = heap[index]; ; ) {
    let childIndex = (index << 1) + 1;
    if (childIndex >= heap.length)
      break;
    let child = heap[childIndex];
    if (childIndex + 1 < heap.length && child.compare(heap[childIndex + 1]) >= 0) {
      child = heap[childIndex + 1];
      childIndex++;
    }
    if (cur.compare(child) < 0)
      break;
    heap[childIndex] = cur;
    heap[index] = child;
    index = childIndex;
  }
}
var SpanCursor = class {
  constructor(sets, skip, minPoint) {
    this.minPoint = minPoint;
    this.active = [];
    this.activeTo = [];
    this.activeRank = [];
    this.minActive = -1;
    this.point = null;
    this.pointFrom = 0;
    this.pointRank = 0;
    this.to = -1e9;
    this.endSide = 0;
    this.openStart = -1;
    this.cursor = HeapCursor.from(sets, skip, minPoint);
  }
  goto(pos, side = -1e9) {
    this.cursor.goto(pos, side);
    this.active.length = this.activeTo.length = this.activeRank.length = 0;
    this.minActive = -1;
    this.to = pos;
    this.endSide = side;
    this.openStart = -1;
    this.next();
    return this;
  }
  forward(pos, side) {
    while (this.minActive > -1 && (this.activeTo[this.minActive] - pos || this.active[this.minActive].endSide - side) < 0)
      this.removeActive(this.minActive);
    this.cursor.forward(pos, side);
  }
  removeActive(index) {
    remove(this.active, index);
    remove(this.activeTo, index);
    remove(this.activeRank, index);
    this.minActive = findMinIndex(this.active, this.activeTo);
  }
  addActive(trackOpen) {
    let i = 0, { value, to, rank } = this.cursor;
    while (i < this.activeRank.length && (rank - this.activeRank[i] || to - this.activeTo[i]) > 0)
      i++;
    insert(this.active, i, value);
    insert(this.activeTo, i, to);
    insert(this.activeRank, i, rank);
    if (trackOpen)
      insert(trackOpen, i, this.cursor.from);
    this.minActive = findMinIndex(this.active, this.activeTo);
  }
  next() {
    let from = this.to, wasPoint = this.point;
    this.point = null;
    let trackOpen = this.openStart < 0 ? [] : null;
    for (; ; ) {
      let a = this.minActive;
      if (a > -1 && (this.activeTo[a] - this.cursor.from || this.active[a].endSide - this.cursor.startSide) < 0) {
        if (this.activeTo[a] > from) {
          this.to = this.activeTo[a];
          this.endSide = this.active[a].endSide;
          break;
        }
        this.removeActive(a);
        if (trackOpen)
          remove(trackOpen, a);
      } else if (!this.cursor.value) {
        this.to = this.endSide = 1e9;
        break;
      } else if (this.cursor.from > from) {
        this.to = this.cursor.from;
        this.endSide = this.cursor.startSide;
        break;
      } else {
        let nextVal = this.cursor.value;
        if (!nextVal.point) {
          this.addActive(trackOpen);
          this.cursor.next();
        } else if (wasPoint && this.cursor.to == this.to && this.cursor.from < this.cursor.to) {
          this.cursor.next();
        } else {
          this.point = nextVal;
          this.pointFrom = this.cursor.from;
          this.pointRank = this.cursor.rank;
          this.to = this.cursor.to;
          this.endSide = nextVal.endSide;
          this.cursor.next();
          this.forward(this.to, this.endSide);
          break;
        }
      }
    }
    if (trackOpen) {
      this.openStart = 0;
      for (let i = trackOpen.length - 1; i >= 0 && trackOpen[i] < from; i--)
        this.openStart++;
    }
  }
  activeForPoint(to) {
    if (!this.active.length)
      return this.active;
    let active = [];
    for (let i = this.active.length - 1; i >= 0; i--) {
      if (this.activeRank[i] < this.pointRank)
        break;
      if (this.activeTo[i] > to || this.activeTo[i] == to && this.active[i].endSide >= this.point.endSide)
        active.push(this.active[i]);
    }
    return active.reverse();
  }
  openEnd(to) {
    let open = 0;
    for (let i = this.activeTo.length - 1; i >= 0 && this.activeTo[i] > to; i--)
      open++;
    return open;
  }
};
function compare(a, startA, b, startB, length, comparator) {
  a.goto(startA);
  b.goto(startB);
  let endB = startB + length;
  let pos = startB, dPos = startB - startA;
  for (; ; ) {
    let diff = a.to + dPos - b.to || a.endSide - b.endSide;
    let end = diff < 0 ? a.to + dPos : b.to, clipEnd = Math.min(end, endB);
    if (a.point || b.point) {
      if (!(a.point && b.point && (a.point == b.point || a.point.eq(b.point)) && sameValues(a.activeForPoint(a.to), b.activeForPoint(b.to))))
        comparator.comparePoint(pos, clipEnd, a.point, b.point);
    } else {
      if (clipEnd > pos && !sameValues(a.active, b.active))
        comparator.compareRange(pos, clipEnd, a.active, b.active);
    }
    if (end > endB)
      break;
    pos = end;
    if (diff <= 0)
      a.next();
    if (diff >= 0)
      b.next();
  }
}
function sameValues(a, b) {
  if (a.length != b.length)
    return false;
  for (let i = 0; i < a.length; i++)
    if (a[i] != b[i] && !a[i].eq(b[i]))
      return false;
  return true;
}
function remove(array, index) {
  for (let i = index, e = array.length - 1; i < e; i++)
    array[i] = array[i + 1];
  array.pop();
}
function insert(array, index, value) {
  for (let i = array.length - 1; i >= index; i--)
    array[i + 1] = array[i];
  array[index] = value;
}
function findMinIndex(value, array) {
  let found = -1, foundPos = 1e9;
  for (let i = 0; i < array.length; i++)
    if ((array[i] - foundPos || value[i].endSide - value[found].endSide) < 0) {
      found = i;
      foundPos = array[i];
    }
  return found;
}
function countColumn(string2, tabSize, to = string2.length) {
  let n = 0;
  for (let i = 0; i < to; ) {
    if (string2.charCodeAt(i) == 9) {
      n += tabSize - n % tabSize;
      i++;
    } else {
      n++;
      i = findClusterBreak(string2, i);
    }
  }
  return n;
}
function findColumn(string2, col, tabSize, strict) {
  for (let i = 0, n = 0; ; ) {
    if (n >= col)
      return i;
    if (i == string2.length)
      break;
    n += string2.charCodeAt(i) == 9 ? tabSize - n % tabSize : 1;
    i = findClusterBreak(string2, i);
  }
  return strict === true ? -1 : string2.length;
}

// node_modules/style-mod/src/style-mod.js
var C = "\u037C";
var COUNT = typeof Symbol == "undefined" ? "__" + C : Symbol.for(C);
var SET = typeof Symbol == "undefined" ? "__styleSet" + Math.floor(Math.random() * 1e8) : Symbol("styleSet");
var top = typeof globalThis != "undefined" ? globalThis : typeof window != "undefined" ? window : {};
var StyleModule = class {
  constructor(spec, options) {
    this.rules = [];
    let { finish } = options || {};
    function splitSelector(selector) {
      return /^@/.test(selector) ? [selector] : selector.split(/,\s*/);
    }
    function render(selectors, spec2, target, isKeyframes) {
      let local = [], isAt = /^@(\w+)\b/.exec(selectors[0]), keyframes = isAt && isAt[1] == "keyframes";
      if (isAt && spec2 == null)
        return target.push(selectors[0] + ";");
      for (let prop in spec2) {
        let value = spec2[prop];
        if (/&/.test(prop)) {
          render(prop.split(/,\s*/).map((part) => selectors.map((sel) => part.replace(/&/, sel))).reduce((a, b) => a.concat(b)), value, target);
        } else if (value && typeof value == "object") {
          if (!isAt)
            throw new RangeError("The value of a property (" + prop + ") should be a primitive value.");
          render(splitSelector(prop), value, local, keyframes);
        } else if (value != null) {
          local.push(prop.replace(/_.*/, "").replace(/[A-Z]/g, (l) => "-" + l.toLowerCase()) + ": " + value + ";");
        }
      }
      if (local.length || keyframes) {
        target.push((finish && !isAt && !isKeyframes ? selectors.map(finish) : selectors).join(", ") + " {" + local.join(" ") + "}");
      }
    }
    for (let prop in spec)
      render(splitSelector(prop), spec[prop], this.rules);
  }
  getRules() {
    return this.rules.join("\n");
  }
  static newName() {
    let id2 = top[COUNT] || 1;
    top[COUNT] = id2 + 1;
    return C + id2.toString(36);
  }
  static mount(root, modules, options) {
    let set = root[SET], nonce = options && options.nonce;
    if (!set)
      set = new StyleSet(root, nonce);
    else if (nonce)
      set.setNonce(nonce);
    set.mount(Array.isArray(modules) ? modules : [modules], root);
  }
};
var adoptedSet = new Map();
var StyleSet = class {
  constructor(root, nonce) {
    let doc2 = root.ownerDocument || root, win = doc2.defaultView;
    if (!root.head && root.adoptedStyleSheets && win.CSSStyleSheet) {
      let adopted = adoptedSet.get(doc2);
      if (adopted)
        return root[SET] = adopted;
      this.sheet = new win.CSSStyleSheet();
      adoptedSet.set(doc2, this);
    } else {
      this.styleTag = doc2.createElement("style");
      if (nonce)
        this.styleTag.setAttribute("nonce", nonce);
    }
    this.modules = [];
    root[SET] = this;
  }
  mount(modules, root) {
    let sheet = this.sheet;
    let pos = 0, j = 0;
    for (let i = 0; i < modules.length; i++) {
      let mod = modules[i], index = this.modules.indexOf(mod);
      if (index < j && index > -1) {
        this.modules.splice(index, 1);
        j--;
        index = -1;
      }
      if (index == -1) {
        this.modules.splice(j++, 0, mod);
        if (sheet)
          for (let k = 0; k < mod.rules.length; k++)
            sheet.insertRule(mod.rules[k], pos++);
      } else {
        while (j < index)
          pos += this.modules[j++].rules.length;
        pos += mod.rules.length;
        j++;
      }
    }
    if (sheet) {
      if (root.adoptedStyleSheets.indexOf(this.sheet) < 0)
        root.adoptedStyleSheets = [this.sheet, ...root.adoptedStyleSheets];
    } else {
      let text = "";
      for (let i = 0; i < this.modules.length; i++)
        text += this.modules[i].getRules() + "\n";
      this.styleTag.textContent = text;
      let target = root.head || root;
      if (this.styleTag.parentNode != target)
        target.insertBefore(this.styleTag, target.firstChild);
    }
  }
  setNonce(nonce) {
    if (this.styleTag && this.styleTag.getAttribute("nonce") != nonce)
      this.styleTag.setAttribute("nonce", nonce);
  }
};

// node_modules/w3c-keyname/index.es.js
var base = {
  8: "Backspace",
  9: "Tab",
  10: "Enter",
  12: "NumLock",
  13: "Enter",
  16: "Shift",
  17: "Control",
  18: "Alt",
  20: "CapsLock",
  27: "Escape",
  32: " ",
  33: "PageUp",
  34: "PageDown",
  35: "End",
  36: "Home",
  37: "ArrowLeft",
  38: "ArrowUp",
  39: "ArrowRight",
  40: "ArrowDown",
  44: "PrintScreen",
  45: "Insert",
  46: "Delete",
  59: ";",
  61: "=",
  91: "Meta",
  92: "Meta",
  106: "*",
  107: "+",
  108: ",",
  109: "-",
  110: ".",
  111: "/",
  144: "NumLock",
  145: "ScrollLock",
  160: "Shift",
  161: "Shift",
  162: "Control",
  163: "Control",
  164: "Alt",
  165: "Alt",
  173: "-",
  186: ";",
  187: "=",
  188: ",",
  189: "-",
  190: ".",
  191: "/",
  192: "`",
  219: "[",
  220: "\\",
  221: "]",
  222: "'"
};
var shift = {
  48: ")",
  49: "!",
  50: "@",
  51: "#",
  52: "$",
  53: "%",
  54: "^",
  55: "&",
  56: "*",
  57: "(",
  59: ":",
  61: "+",
  173: "_",
  186: ":",
  187: "+",
  188: "<",
  189: "_",
  190: ">",
  191: "?",
  192: "~",
  219: "{",
  220: "|",
  221: "}",
  222: '"'
};
var chrome = typeof navigator != "undefined" && /Chrome\/(\d+)/.exec(navigator.userAgent);
var gecko = typeof navigator != "undefined" && /Gecko\/\d+/.test(navigator.userAgent);
var mac = typeof navigator != "undefined" && /Mac/.test(navigator.platform);
var ie = typeof navigator != "undefined" && /MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent);
var brokenModifierNames = mac || chrome && +chrome[1] < 57;
for (i = 0; i < 10; i++)
  base[48 + i] = base[96 + i] = String(i);
var i;
for (i = 1; i <= 24; i++)
  base[i + 111] = "F" + i;
var i;
for (i = 65; i <= 90; i++) {
  base[i] = String.fromCharCode(i + 32);
  shift[i] = String.fromCharCode(i);
}
var i;
for (code in base)
  if (!shift.hasOwnProperty(code))
    shift[code] = base[code];
var code;
function keyName(event) {
  var ignoreKey = brokenModifierNames && (event.ctrlKey || event.altKey || event.metaKey) || ie && event.shiftKey && event.key && event.key.length == 1 || event.key == "Unidentified";
  var name2 = !ignoreKey && event.key || (event.shiftKey ? shift : base)[event.keyCode] || event.key || "Unidentified";
  if (name2 == "Esc")
    name2 = "Escape";
  if (name2 == "Del")
    name2 = "Delete";
  if (name2 == "Left")
    name2 = "ArrowLeft";
  if (name2 == "Up")
    name2 = "ArrowUp";
  if (name2 == "Right")
    name2 = "ArrowRight";
  if (name2 == "Down")
    name2 = "ArrowDown";
  return name2;
}

// node_modules/@codemirror/view/dist/index.js
function getSelection(root) {
  let target;
  if (root.nodeType == 11) {
    target = root.getSelection ? root : root.ownerDocument;
  } else {
    target = root;
  }
  return target.getSelection();
}
function contains(dom, node) {
  return node ? dom == node || dom.contains(node.nodeType != 1 ? node.parentNode : node) : false;
}
function deepActiveElement(doc2) {
  let elt2 = doc2.activeElement;
  while (elt2 && elt2.shadowRoot)
    elt2 = elt2.shadowRoot.activeElement;
  return elt2;
}
function hasSelection(dom, selection) {
  if (!selection.anchorNode)
    return false;
  try {
    return contains(dom, selection.anchorNode);
  } catch (_) {
    return false;
  }
}
function clientRectsFor(dom) {
  if (dom.nodeType == 3)
    return textRange(dom, 0, dom.nodeValue.length).getClientRects();
  else if (dom.nodeType == 1)
    return dom.getClientRects();
  else
    return [];
}
function isEquivalentPosition(node, off, targetNode, targetOff) {
  return targetNode ? scanFor(node, off, targetNode, targetOff, -1) || scanFor(node, off, targetNode, targetOff, 1) : false;
}
function domIndex(node) {
  for (var index = 0; ; index++) {
    node = node.previousSibling;
    if (!node)
      return index;
  }
}
function isBlockElement(node) {
  return node.nodeType == 1 && /^(DIV|P|LI|UL|OL|BLOCKQUOTE|DD|DT|H\d|SECTION|PRE)$/.test(node.nodeName);
}
function scanFor(node, off, targetNode, targetOff, dir) {
  for (; ; ) {
    if (node == targetNode && off == targetOff)
      return true;
    if (off == (dir < 0 ? 0 : maxOffset(node))) {
      if (node.nodeName == "DIV")
        return false;
      let parent = node.parentNode;
      if (!parent || parent.nodeType != 1)
        return false;
      off = domIndex(node) + (dir < 0 ? 0 : 1);
      node = parent;
    } else if (node.nodeType == 1) {
      node = node.childNodes[off + (dir < 0 ? -1 : 0)];
      if (node.nodeType == 1 && node.contentEditable == "false")
        return false;
      off = dir < 0 ? maxOffset(node) : 0;
    } else {
      return false;
    }
  }
}
function maxOffset(node) {
  return node.nodeType == 3 ? node.nodeValue.length : node.childNodes.length;
}
function flattenRect(rect, left) {
  let x = left ? rect.left : rect.right;
  return { left: x, right: x, top: rect.top, bottom: rect.bottom };
}
function windowRect(win) {
  let vp = win.visualViewport;
  if (vp)
    return {
      left: 0,
      right: vp.width,
      top: 0,
      bottom: vp.height
    };
  return {
    left: 0,
    right: win.innerWidth,
    top: 0,
    bottom: win.innerHeight
  };
}
function getScale(elt2, rect) {
  let scaleX = rect.width / elt2.offsetWidth;
  let scaleY = rect.height / elt2.offsetHeight;
  if (scaleX > 0.995 && scaleX < 1.005 || !isFinite(scaleX) || Math.abs(rect.width - elt2.offsetWidth) < 1)
    scaleX = 1;
  if (scaleY > 0.995 && scaleY < 1.005 || !isFinite(scaleY) || Math.abs(rect.height - elt2.offsetHeight) < 1)
    scaleY = 1;
  return { scaleX, scaleY };
}
function scrollRectIntoView(dom, rect, side, x, y, xMargin, yMargin, ltr) {
  let doc2 = dom.ownerDocument, win = doc2.defaultView || window;
  for (let cur = dom, stop = false; cur && !stop; ) {
    if (cur.nodeType == 1) {
      let bounding, top2 = cur == doc2.body;
      let scaleX = 1, scaleY = 1;
      if (top2) {
        bounding = windowRect(win);
      } else {
        if (/^(fixed|sticky)$/.test(getComputedStyle(cur).position))
          stop = true;
        if (cur.scrollHeight <= cur.clientHeight && cur.scrollWidth <= cur.clientWidth) {
          cur = cur.assignedSlot || cur.parentNode;
          continue;
        }
        let rect2 = cur.getBoundingClientRect();
        ({ scaleX, scaleY } = getScale(cur, rect2));
        bounding = {
          left: rect2.left,
          right: rect2.left + cur.clientWidth * scaleX,
          top: rect2.top,
          bottom: rect2.top + cur.clientHeight * scaleY
        };
      }
      let moveX = 0, moveY = 0;
      if (y == "nearest") {
        if (rect.top < bounding.top) {
          moveY = -(bounding.top - rect.top + yMargin);
          if (side > 0 && rect.bottom > bounding.bottom + moveY)
            moveY = rect.bottom - bounding.bottom + moveY + yMargin;
        } else if (rect.bottom > bounding.bottom) {
          moveY = rect.bottom - bounding.bottom + yMargin;
          if (side < 0 && rect.top - moveY < bounding.top)
            moveY = -(bounding.top + moveY - rect.top + yMargin);
        }
      } else {
        let rectHeight = rect.bottom - rect.top, boundingHeight = bounding.bottom - bounding.top;
        let targetTop = y == "center" && rectHeight <= boundingHeight ? rect.top + rectHeight / 2 - boundingHeight / 2 : y == "start" || y == "center" && side < 0 ? rect.top - yMargin : rect.bottom - boundingHeight + yMargin;
        moveY = targetTop - bounding.top;
      }
      if (x == "nearest") {
        if (rect.left < bounding.left) {
          moveX = -(bounding.left - rect.left + xMargin);
          if (side > 0 && rect.right > bounding.right + moveX)
            moveX = rect.right - bounding.right + moveX + xMargin;
        } else if (rect.right > bounding.right) {
          moveX = rect.right - bounding.right + xMargin;
          if (side < 0 && rect.left < bounding.left + moveX)
            moveX = -(bounding.left + moveX - rect.left + xMargin);
        }
      } else {
        let targetLeft = x == "center" ? rect.left + (rect.right - rect.left) / 2 - (bounding.right - bounding.left) / 2 : x == "start" == ltr ? rect.left - xMargin : rect.right - (bounding.right - bounding.left) + xMargin;
        moveX = targetLeft - bounding.left;
      }
      if (moveX || moveY) {
        if (top2) {
          win.scrollBy(moveX, moveY);
        } else {
          let movedX = 0, movedY = 0;
          if (moveY) {
            let start = cur.scrollTop;
            cur.scrollTop += moveY / scaleY;
            movedY = (cur.scrollTop - start) * scaleY;
          }
          if (moveX) {
            let start = cur.scrollLeft;
            cur.scrollLeft += moveX / scaleX;
            movedX = (cur.scrollLeft - start) * scaleX;
          }
          rect = {
            left: rect.left - movedX,
            top: rect.top - movedY,
            right: rect.right - movedX,
            bottom: rect.bottom - movedY
          };
          if (movedX && Math.abs(movedX - moveX) < 1)
            x = "nearest";
          if (movedY && Math.abs(movedY - moveY) < 1)
            y = "nearest";
        }
      }
      if (top2)
        break;
      cur = cur.assignedSlot || cur.parentNode;
    } else if (cur.nodeType == 11) {
      cur = cur.host;
    } else {
      break;
    }
  }
}
function scrollableParent(dom) {
  let doc2 = dom.ownerDocument;
  for (let cur = dom.parentNode; cur; ) {
    if (cur == doc2.body) {
      break;
    } else if (cur.nodeType == 1) {
      if (cur.scrollHeight > cur.clientHeight || cur.scrollWidth > cur.clientWidth)
        return cur;
      cur = cur.assignedSlot || cur.parentNode;
    } else if (cur.nodeType == 11) {
      cur = cur.host;
    } else {
      break;
    }
  }
  return null;
}
var DOMSelectionState = class {
  constructor() {
    this.anchorNode = null;
    this.anchorOffset = 0;
    this.focusNode = null;
    this.focusOffset = 0;
  }
  eq(domSel) {
    return this.anchorNode == domSel.anchorNode && this.anchorOffset == domSel.anchorOffset && this.focusNode == domSel.focusNode && this.focusOffset == domSel.focusOffset;
  }
  setRange(range) {
    let { anchorNode, focusNode } = range;
    this.set(anchorNode, Math.min(range.anchorOffset, anchorNode ? maxOffset(anchorNode) : 0), focusNode, Math.min(range.focusOffset, focusNode ? maxOffset(focusNode) : 0));
  }
  set(anchorNode, anchorOffset, focusNode, focusOffset) {
    this.anchorNode = anchorNode;
    this.anchorOffset = anchorOffset;
    this.focusNode = focusNode;
    this.focusOffset = focusOffset;
  }
};
var preventScrollSupported = null;
function focusPreventScroll(dom) {
  if (dom.setActive)
    return dom.setActive();
  if (preventScrollSupported)
    return dom.focus(preventScrollSupported);
  let stack = [];
  for (let cur = dom; cur; cur = cur.parentNode) {
    stack.push(cur, cur.scrollTop, cur.scrollLeft);
    if (cur == cur.ownerDocument)
      break;
  }
  dom.focus(preventScrollSupported == null ? {
    get preventScroll() {
      preventScrollSupported = { preventScroll: true };
      return true;
    }
  } : void 0);
  if (!preventScrollSupported) {
    preventScrollSupported = false;
    for (let i = 0; i < stack.length; ) {
      let elt2 = stack[i++], top2 = stack[i++], left = stack[i++];
      if (elt2.scrollTop != top2)
        elt2.scrollTop = top2;
      if (elt2.scrollLeft != left)
        elt2.scrollLeft = left;
    }
  }
}
var scratchRange;
function textRange(node, from, to = from) {
  let range = scratchRange || (scratchRange = document.createRange());
  range.setEnd(node, to);
  range.setStart(node, from);
  return range;
}
function dispatchKey(elt2, name2, code, mods) {
  let options = { key: name2, code: name2, keyCode: code, which: code, cancelable: true };
  if (mods)
    ({ altKey: options.altKey, ctrlKey: options.ctrlKey, shiftKey: options.shiftKey, metaKey: options.metaKey } = mods);
  let down = new KeyboardEvent("keydown", options);
  down.synthetic = true;
  elt2.dispatchEvent(down);
  let up = new KeyboardEvent("keyup", options);
  up.synthetic = true;
  elt2.dispatchEvent(up);
  return down.defaultPrevented || up.defaultPrevented;
}
function getRoot(node) {
  while (node) {
    if (node && (node.nodeType == 9 || node.nodeType == 11 && node.host))
      return node;
    node = node.assignedSlot || node.parentNode;
  }
  return null;
}
function clearAttributes(node) {
  while (node.attributes.length)
    node.removeAttributeNode(node.attributes[0]);
}
function atElementStart(doc2, selection) {
  let node = selection.focusNode, offset = selection.focusOffset;
  if (!node || selection.anchorNode != node || selection.anchorOffset != offset)
    return false;
  offset = Math.min(offset, maxOffset(node));
  for (; ; ) {
    if (offset) {
      if (node.nodeType != 1)
        return false;
      let prev = node.childNodes[offset - 1];
      if (prev.contentEditable == "false")
        offset--;
      else {
        node = prev;
        offset = maxOffset(node);
      }
    } else if (node == doc2) {
      return true;
    } else {
      offset = domIndex(node);
      node = node.parentNode;
    }
  }
}
function isScrolledToBottom(elt2) {
  return elt2.scrollTop > Math.max(1, elt2.scrollHeight - elt2.clientHeight - 4);
}
function textNodeBefore(startNode, startOffset) {
  for (let node = startNode, offset = startOffset; ; ) {
    if (node.nodeType == 3 && offset > 0) {
      return { node, offset };
    } else if (node.nodeType == 1 && offset > 0) {
      if (node.contentEditable == "false")
        return null;
      node = node.childNodes[offset - 1];
      offset = maxOffset(node);
    } else if (node.parentNode && !isBlockElement(node)) {
      offset = domIndex(node);
      node = node.parentNode;
    } else {
      return null;
    }
  }
}
function textNodeAfter(startNode, startOffset) {
  for (let node = startNode, offset = startOffset; ; ) {
    if (node.nodeType == 3 && offset < node.nodeValue.length) {
      return { node, offset };
    } else if (node.nodeType == 1 && offset < node.childNodes.length) {
      if (node.contentEditable == "false")
        return null;
      node = node.childNodes[offset];
      offset = 0;
    } else if (node.parentNode && !isBlockElement(node)) {
      offset = domIndex(node) + 1;
      node = node.parentNode;
    } else {
      return null;
    }
  }
}
var DOMPos = class {
  constructor(node, offset, precise = true) {
    this.node = node;
    this.offset = offset;
    this.precise = precise;
  }
  static before(dom, precise) {
    return new DOMPos(dom.parentNode, domIndex(dom), precise);
  }
  static after(dom, precise) {
    return new DOMPos(dom.parentNode, domIndex(dom) + 1, precise);
  }
};
var noChildren = [];
var ContentView = class {
  constructor() {
    this.parent = null;
    this.dom = null;
    this.flags = 2;
  }
  get overrideDOMText() {
    return null;
  }
  get posAtStart() {
    return this.parent ? this.parent.posBefore(this) : 0;
  }
  get posAtEnd() {
    return this.posAtStart + this.length;
  }
  posBefore(view) {
    let pos = this.posAtStart;
    for (let child of this.children) {
      if (child == view)
        return pos;
      pos += child.length + child.breakAfter;
    }
    throw new RangeError("Invalid child in posBefore");
  }
  posAfter(view) {
    return this.posBefore(view) + view.length;
  }
  sync(view, track) {
    if (this.flags & 2) {
      let parent = this.dom;
      let prev = null, next;
      for (let child of this.children) {
        if (child.flags & 7) {
          if (!child.dom && (next = prev ? prev.nextSibling : parent.firstChild)) {
            let contentView = ContentView.get(next);
            if (!contentView || !contentView.parent && contentView.canReuseDOM(child))
              child.reuseDOM(next);
          }
          child.sync(view, track);
          child.flags &= ~7;
        }
        next = prev ? prev.nextSibling : parent.firstChild;
        if (track && !track.written && track.node == parent && next != child.dom)
          track.written = true;
        if (child.dom.parentNode == parent) {
          while (next && next != child.dom)
            next = rm$1(next);
        } else {
          parent.insertBefore(child.dom, next);
        }
        prev = child.dom;
      }
      next = prev ? prev.nextSibling : parent.firstChild;
      if (next && track && track.node == parent)
        track.written = true;
      while (next)
        next = rm$1(next);
    } else if (this.flags & 1) {
      for (let child of this.children)
        if (child.flags & 7) {
          child.sync(view, track);
          child.flags &= ~7;
        }
    }
  }
  reuseDOM(_dom) {
  }
  localPosFromDOM(node, offset) {
    let after;
    if (node == this.dom) {
      after = this.dom.childNodes[offset];
    } else {
      let bias = maxOffset(node) == 0 ? 0 : offset == 0 ? -1 : 1;
      for (; ; ) {
        let parent = node.parentNode;
        if (parent == this.dom)
          break;
        if (bias == 0 && parent.firstChild != parent.lastChild) {
          if (node == parent.firstChild)
            bias = -1;
          else
            bias = 1;
        }
        node = parent;
      }
      if (bias < 0)
        after = node;
      else
        after = node.nextSibling;
    }
    if (after == this.dom.firstChild)
      return 0;
    while (after && !ContentView.get(after))
      after = after.nextSibling;
    if (!after)
      return this.length;
    for (let i = 0, pos = 0; ; i++) {
      let child = this.children[i];
      if (child.dom == after)
        return pos;
      pos += child.length + child.breakAfter;
    }
  }
  domBoundsAround(from, to, offset = 0) {
    let fromI = -1, fromStart = -1, toI = -1, toEnd = -1;
    for (let i = 0, pos = offset, prevEnd = offset; i < this.children.length; i++) {
      let child = this.children[i], end = pos + child.length;
      if (pos < from && end > to)
        return child.domBoundsAround(from, to, pos);
      if (end >= from && fromI == -1) {
        fromI = i;
        fromStart = pos;
      }
      if (pos > to && child.dom.parentNode == this.dom) {
        toI = i;
        toEnd = prevEnd;
        break;
      }
      prevEnd = end;
      pos = end + child.breakAfter;
    }
    return {
      from: fromStart,
      to: toEnd < 0 ? offset + this.length : toEnd,
      startDOM: (fromI ? this.children[fromI - 1].dom.nextSibling : null) || this.dom.firstChild,
      endDOM: toI < this.children.length && toI >= 0 ? this.children[toI].dom : null
    };
  }
  markDirty(andParent = false) {
    this.flags |= 2;
    this.markParentsDirty(andParent);
  }
  markParentsDirty(childList) {
    for (let parent = this.parent; parent; parent = parent.parent) {
      if (childList)
        parent.flags |= 2;
      if (parent.flags & 1)
        return;
      parent.flags |= 1;
      childList = false;
    }
  }
  setParent(parent) {
    if (this.parent != parent) {
      this.parent = parent;
      if (this.flags & 7)
        this.markParentsDirty(true);
    }
  }
  setDOM(dom) {
    if (this.dom == dom)
      return;
    if (this.dom)
      this.dom.cmView = null;
    this.dom = dom;
    dom.cmView = this;
  }
  get rootView() {
    for (let v = this; ; ) {
      let parent = v.parent;
      if (!parent)
        return v;
      v = parent;
    }
  }
  replaceChildren(from, to, children = noChildren) {
    this.markDirty();
    for (let i = from; i < to; i++) {
      let child = this.children[i];
      if (child.parent == this && children.indexOf(child) < 0)
        child.destroy();
    }
    this.children.splice(from, to - from, ...children);
    for (let i = 0; i < children.length; i++)
      children[i].setParent(this);
  }
  ignoreMutation(_rec) {
    return false;
  }
  ignoreEvent(_event) {
    return false;
  }
  childCursor(pos = this.length) {
    return new ChildCursor(this.children, pos, this.children.length);
  }
  childPos(pos, bias = 1) {
    return this.childCursor().findPos(pos, bias);
  }
  toString() {
    let name2 = this.constructor.name.replace("View", "");
    return name2 + (this.children.length ? "(" + this.children.join() + ")" : this.length ? "[" + (name2 == "Text" ? this.text : this.length) + "]" : "") + (this.breakAfter ? "#" : "");
  }
  static get(node) {
    return node.cmView;
  }
  get isEditable() {
    return true;
  }
  get isWidget() {
    return false;
  }
  get isHidden() {
    return false;
  }
  merge(from, to, source, hasStart, openStart, openEnd) {
    return false;
  }
  become(other) {
    return false;
  }
  canReuseDOM(other) {
    return other.constructor == this.constructor && !((this.flags | other.flags) & 8);
  }
  getSide() {
    return 0;
  }
  destroy() {
    for (let child of this.children)
      if (child.parent == this)
        child.destroy();
    this.parent = null;
  }
};
ContentView.prototype.breakAfter = 0;
function rm$1(dom) {
  let next = dom.nextSibling;
  dom.parentNode.removeChild(dom);
  return next;
}
var ChildCursor = class {
  constructor(children, pos, i) {
    this.children = children;
    this.pos = pos;
    this.i = i;
    this.off = 0;
  }
  findPos(pos, bias = 1) {
    for (; ; ) {
      if (pos > this.pos || pos == this.pos && (bias > 0 || this.i == 0 || this.children[this.i - 1].breakAfter)) {
        this.off = pos - this.pos;
        return this;
      }
      let next = this.children[--this.i];
      this.pos -= next.length + next.breakAfter;
    }
  }
};
function replaceRange(parent, fromI, fromOff, toI, toOff, insert2, breakAtStart, openStart, openEnd) {
  let { children } = parent;
  let before = children.length ? children[fromI] : null;
  let last = insert2.length ? insert2[insert2.length - 1] : null;
  let breakAtEnd = last ? last.breakAfter : breakAtStart;
  if (fromI == toI && before && !breakAtStart && !breakAtEnd && insert2.length < 2 && before.merge(fromOff, toOff, insert2.length ? last : null, fromOff == 0, openStart, openEnd))
    return;
  if (toI < children.length) {
    let after = children[toI];
    if (after && (toOff < after.length || after.breakAfter && (last === null || last === void 0 ? void 0 : last.breakAfter))) {
      if (fromI == toI) {
        after = after.split(toOff);
        toOff = 0;
      }
      if (!breakAtEnd && last && after.merge(0, toOff, last, true, 0, openEnd)) {
        insert2[insert2.length - 1] = after;
      } else {
        if (toOff || after.children.length && !after.children[0].length)
          after.merge(0, toOff, null, false, 0, openEnd);
        insert2.push(after);
      }
    } else if (after === null || after === void 0 ? void 0 : after.breakAfter) {
      if (last)
        last.breakAfter = 1;
      else
        breakAtStart = 1;
    }
    toI++;
  }
  if (before) {
    before.breakAfter = breakAtStart;
    if (fromOff > 0) {
      if (!breakAtStart && insert2.length && before.merge(fromOff, before.length, insert2[0], false, openStart, 0)) {
        before.breakAfter = insert2.shift().breakAfter;
      } else if (fromOff < before.length || before.children.length && before.children[before.children.length - 1].length == 0) {
        before.merge(fromOff, before.length, null, false, openStart, 0);
      }
      fromI++;
    }
  }
  while (fromI < toI && insert2.length) {
    if (children[toI - 1].become(insert2[insert2.length - 1])) {
      toI--;
      insert2.pop();
      openEnd = insert2.length ? 0 : openStart;
    } else if (children[fromI].become(insert2[0])) {
      fromI++;
      insert2.shift();
      openStart = insert2.length ? 0 : openEnd;
    } else {
      break;
    }
  }
  if (!insert2.length && fromI && toI < children.length && !children[fromI - 1].breakAfter && children[toI].merge(0, 0, children[fromI - 1], false, openStart, openEnd))
    fromI--;
  if (fromI < toI || insert2.length)
    parent.replaceChildren(fromI, toI, insert2);
}
function mergeChildrenInto(parent, from, to, insert2, openStart, openEnd) {
  let cur = parent.childCursor();
  let { i: toI, off: toOff } = cur.findPos(to, 1);
  let { i: fromI, off: fromOff } = cur.findPos(from, -1);
  let dLen = from - to;
  for (let view of insert2)
    dLen += view.length;
  parent.length += dLen;
  replaceRange(parent, fromI, fromOff, toI, toOff, insert2, 0, openStart, openEnd);
}
var nav = typeof navigator != "undefined" ? navigator : { userAgent: "", vendor: "", platform: "" };
var doc = typeof document != "undefined" ? document : { documentElement: { style: {} } };
var ie_edge = /* @__PURE__ */ /Edge\/(\d+)/.exec(nav.userAgent);
var ie_upto10 = /* @__PURE__ */ /MSIE \d/.test(nav.userAgent);
var ie_11up = /* @__PURE__ */ /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(nav.userAgent);
var ie2 = !!(ie_upto10 || ie_11up || ie_edge);
var gecko2 = !ie2 && /* @__PURE__ */ /gecko\/(\d+)/i.test(nav.userAgent);
var chrome2 = !ie2 && /* @__PURE__ */ /Chrome\/(\d+)/.exec(nav.userAgent);
var webkit = "webkitFontSmoothing" in doc.documentElement.style;
var safari = !ie2 && /* @__PURE__ */ /Apple Computer/.test(nav.vendor);
var ios = safari && (/* @__PURE__ */ /Mobile\/\w+/.test(nav.userAgent) || nav.maxTouchPoints > 2);
var browser = {
  mac: ios || /* @__PURE__ */ /Mac/.test(nav.platform),
  windows: /* @__PURE__ */ /Win/.test(nav.platform),
  linux: /* @__PURE__ */ /Linux|X11/.test(nav.platform),
  ie: ie2,
  ie_version: ie_upto10 ? doc.documentMode || 6 : ie_11up ? +ie_11up[1] : ie_edge ? +ie_edge[1] : 0,
  gecko: gecko2,
  gecko_version: gecko2 ? +(/* @__PURE__ */ /Firefox\/(\d+)/.exec(nav.userAgent) || [0, 0])[1] : 0,
  chrome: !!chrome2,
  chrome_version: chrome2 ? +chrome2[1] : 0,
  ios,
  android: /* @__PURE__ */ /Android\b/.test(nav.userAgent),
  webkit,
  safari,
  webkit_version: webkit ? +(/* @__PURE__ */ /\bAppleWebKit\/(\d+)/.exec(navigator.userAgent) || [0, 0])[1] : 0,
  tabSize: doc.documentElement.style.tabSize != null ? "tab-size" : "-moz-tab-size"
};
var MaxJoinLen = 256;
var TextView = class extends ContentView {
  constructor(text) {
    super();
    this.text = text;
  }
  get length() {
    return this.text.length;
  }
  createDOM(textDOM) {
    this.setDOM(textDOM || document.createTextNode(this.text));
  }
  sync(view, track) {
    if (!this.dom)
      this.createDOM();
    if (this.dom.nodeValue != this.text) {
      if (track && track.node == this.dom)
        track.written = true;
      this.dom.nodeValue = this.text;
    }
  }
  reuseDOM(dom) {
    if (dom.nodeType == 3)
      this.createDOM(dom);
  }
  merge(from, to, source) {
    if (this.flags & 8 || source && (!(source instanceof TextView) || this.length - (to - from) + source.length > MaxJoinLen || source.flags & 8))
      return false;
    this.text = this.text.slice(0, from) + (source ? source.text : "") + this.text.slice(to);
    this.markDirty();
    return true;
  }
  split(from) {
    let result = new TextView(this.text.slice(from));
    this.text = this.text.slice(0, from);
    this.markDirty();
    result.flags |= this.flags & 8;
    return result;
  }
  localPosFromDOM(node, offset) {
    return node == this.dom ? offset : offset ? this.text.length : 0;
  }
  domAtPos(pos) {
    return new DOMPos(this.dom, pos);
  }
  domBoundsAround(_from, _to, offset) {
    return { from: offset, to: offset + this.length, startDOM: this.dom, endDOM: this.dom.nextSibling };
  }
  coordsAt(pos, side) {
    return textCoords(this.dom, pos, side);
  }
};
var MarkView = class extends ContentView {
  constructor(mark, children = [], length = 0) {
    super();
    this.mark = mark;
    this.children = children;
    this.length = length;
    for (let ch of children)
      ch.setParent(this);
  }
  setAttrs(dom) {
    clearAttributes(dom);
    if (this.mark.class)
      dom.className = this.mark.class;
    if (this.mark.attrs)
      for (let name2 in this.mark.attrs)
        dom.setAttribute(name2, this.mark.attrs[name2]);
    return dom;
  }
  canReuseDOM(other) {
    return super.canReuseDOM(other) && !((this.flags | other.flags) & 8);
  }
  reuseDOM(node) {
    if (node.nodeName == this.mark.tagName.toUpperCase()) {
      this.setDOM(node);
      this.flags |= 4 | 2;
    }
  }
  sync(view, track) {
    if (!this.dom)
      this.setDOM(this.setAttrs(document.createElement(this.mark.tagName)));
    else if (this.flags & 4)
      this.setAttrs(this.dom);
    super.sync(view, track);
  }
  merge(from, to, source, _hasStart, openStart, openEnd) {
    if (source && (!(source instanceof MarkView && source.mark.eq(this.mark)) || from && openStart <= 0 || to < this.length && openEnd <= 0))
      return false;
    mergeChildrenInto(this, from, to, source ? source.children.slice() : [], openStart - 1, openEnd - 1);
    this.markDirty();
    return true;
  }
  split(from) {
    let result = [], off = 0, detachFrom = -1, i = 0;
    for (let elt2 of this.children) {
      let end = off + elt2.length;
      if (end > from)
        result.push(off < from ? elt2.split(from - off) : elt2);
      if (detachFrom < 0 && off >= from)
        detachFrom = i;
      off = end;
      i++;
    }
    let length = this.length - from;
    this.length = from;
    if (detachFrom > -1) {
      this.children.length = detachFrom;
      this.markDirty();
    }
    return new MarkView(this.mark, result, length);
  }
  domAtPos(pos) {
    return inlineDOMAtPos(this, pos);
  }
  coordsAt(pos, side) {
    return coordsInChildren(this, pos, side);
  }
};
function textCoords(text, pos, side) {
  let length = text.nodeValue.length;
  if (pos > length)
    pos = length;
  let from = pos, to = pos, flatten2 = 0;
  if (pos == 0 && side < 0 || pos == length && side >= 0) {
    if (!(browser.chrome || browser.gecko)) {
      if (pos) {
        from--;
        flatten2 = 1;
      } else if (to < length) {
        to++;
        flatten2 = -1;
      }
    }
  } else {
    if (side < 0)
      from--;
    else if (to < length)
      to++;
  }
  let rects = textRange(text, from, to).getClientRects();
  if (!rects.length)
    return null;
  let rect = rects[(flatten2 ? flatten2 < 0 : side >= 0) ? 0 : rects.length - 1];
  if (browser.safari && !flatten2 && rect.width == 0)
    rect = Array.prototype.find.call(rects, (r) => r.width) || rect;
  return flatten2 ? flattenRect(rect, flatten2 < 0) : rect || null;
}
var WidgetView = class extends ContentView {
  static create(widget, length, side) {
    return new WidgetView(widget, length, side);
  }
  constructor(widget, length, side) {
    super();
    this.widget = widget;
    this.length = length;
    this.side = side;
    this.prevWidget = null;
  }
  split(from) {
    let result = WidgetView.create(this.widget, this.length - from, this.side);
    this.length -= from;
    return result;
  }
  sync(view) {
    if (!this.dom || !this.widget.updateDOM(this.dom, view)) {
      if (this.dom && this.prevWidget)
        this.prevWidget.destroy(this.dom);
      this.prevWidget = null;
      this.setDOM(this.widget.toDOM(view));
      if (!this.widget.editable)
        this.dom.contentEditable = "false";
    }
  }
  getSide() {
    return this.side;
  }
  merge(from, to, source, hasStart, openStart, openEnd) {
    if (source && (!(source instanceof WidgetView) || !this.widget.compare(source.widget) || from > 0 && openStart <= 0 || to < this.length && openEnd <= 0))
      return false;
    this.length = from + (source ? source.length : 0) + (this.length - to);
    return true;
  }
  become(other) {
    if (other instanceof WidgetView && other.side == this.side && this.widget.constructor == other.widget.constructor) {
      if (!this.widget.compare(other.widget))
        this.markDirty(true);
      if (this.dom && !this.prevWidget)
        this.prevWidget = this.widget;
      this.widget = other.widget;
      this.length = other.length;
      return true;
    }
    return false;
  }
  ignoreMutation() {
    return true;
  }
  ignoreEvent(event) {
    return this.widget.ignoreEvent(event);
  }
  get overrideDOMText() {
    if (this.length == 0)
      return Text.empty;
    let top2 = this;
    while (top2.parent)
      top2 = top2.parent;
    let { view } = top2, text = view && view.state.doc, start = this.posAtStart;
    return text ? text.slice(start, start + this.length) : Text.empty;
  }
  domAtPos(pos) {
    return (this.length ? pos == 0 : this.side > 0) ? DOMPos.before(this.dom) : DOMPos.after(this.dom, pos == this.length);
  }
  domBoundsAround() {
    return null;
  }
  coordsAt(pos, side) {
    let custom = this.widget.coordsAt(this.dom, pos, side);
    if (custom)
      return custom;
    let rects = this.dom.getClientRects(), rect = null;
    if (!rects.length)
      return null;
    let fromBack = this.side ? this.side < 0 : pos > 0;
    for (let i = fromBack ? rects.length - 1 : 0; ; i += fromBack ? -1 : 1) {
      rect = rects[i];
      if (pos > 0 ? i == 0 : i == rects.length - 1 || rect.top < rect.bottom)
        break;
    }
    return flattenRect(rect, !fromBack);
  }
  get isEditable() {
    return false;
  }
  get isWidget() {
    return true;
  }
  get isHidden() {
    return this.widget.isHidden;
  }
  destroy() {
    super.destroy();
    if (this.dom)
      this.widget.destroy(this.dom);
  }
};
var WidgetBufferView = class extends ContentView {
  constructor(side) {
    super();
    this.side = side;
  }
  get length() {
    return 0;
  }
  merge() {
    return false;
  }
  become(other) {
    return other instanceof WidgetBufferView && other.side == this.side;
  }
  split() {
    return new WidgetBufferView(this.side);
  }
  sync() {
    if (!this.dom) {
      let dom = document.createElement("img");
      dom.className = "cm-widgetBuffer";
      dom.setAttribute("aria-hidden", "true");
      this.setDOM(dom);
    }
  }
  getSide() {
    return this.side;
  }
  domAtPos(pos) {
    return this.side > 0 ? DOMPos.before(this.dom) : DOMPos.after(this.dom);
  }
  localPosFromDOM() {
    return 0;
  }
  domBoundsAround() {
    return null;
  }
  coordsAt(pos) {
    return this.dom.getBoundingClientRect();
  }
  get overrideDOMText() {
    return Text.empty;
  }
  get isHidden() {
    return true;
  }
};
TextView.prototype.children = WidgetView.prototype.children = WidgetBufferView.prototype.children = noChildren;
function inlineDOMAtPos(parent, pos) {
  let dom = parent.dom, { children } = parent, i = 0;
  for (let off = 0; i < children.length; i++) {
    let child = children[i], end = off + child.length;
    if (end == off && child.getSide() <= 0)
      continue;
    if (pos > off && pos < end && child.dom.parentNode == dom)
      return child.domAtPos(pos - off);
    if (pos <= off)
      break;
    off = end;
  }
  for (let j = i; j > 0; j--) {
    let prev = children[j - 1];
    if (prev.dom.parentNode == dom)
      return prev.domAtPos(prev.length);
  }
  for (let j = i; j < children.length; j++) {
    let next = children[j];
    if (next.dom.parentNode == dom)
      return next.domAtPos(0);
  }
  return new DOMPos(dom, 0);
}
function joinInlineInto(parent, view, open) {
  let last, { children } = parent;
  if (open > 0 && view instanceof MarkView && children.length && (last = children[children.length - 1]) instanceof MarkView && last.mark.eq(view.mark)) {
    joinInlineInto(last, view.children[0], open - 1);
  } else {
    children.push(view);
    view.setParent(parent);
  }
  parent.length += view.length;
}
function coordsInChildren(view, pos, side) {
  let before = null, beforePos = -1, after = null, afterPos = -1;
  function scan(view2, pos2) {
    for (let i = 0, off = 0; i < view2.children.length && off <= pos2; i++) {
      let child = view2.children[i], end = off + child.length;
      if (end >= pos2) {
        if (child.children.length) {
          scan(child, pos2 - off);
        } else if ((!after || after.isHidden && side > 0) && (end > pos2 || off == end && child.getSide() > 0)) {
          after = child;
          afterPos = pos2 - off;
        } else if (off < pos2 || off == end && child.getSide() < 0 && !child.isHidden) {
          before = child;
          beforePos = pos2 - off;
        }
      }
      off = end;
    }
  }
  scan(view, pos);
  let target = (side < 0 ? before : after) || before || after;
  if (target)
    return target.coordsAt(Math.max(0, target == before ? beforePos : afterPos), side);
  return fallbackRect(view);
}
function fallbackRect(view) {
  let last = view.dom.lastChild;
  if (!last)
    return view.dom.getBoundingClientRect();
  let rects = clientRectsFor(last);
  return rects[rects.length - 1] || null;
}
function combineAttrs(source, target) {
  for (let name2 in source) {
    if (name2 == "class" && target.class)
      target.class += " " + source.class;
    else if (name2 == "style" && target.style)
      target.style += ";" + source.style;
    else
      target[name2] = source[name2];
  }
  return target;
}
var noAttrs = /* @__PURE__ */ Object.create(null);
function attrsEq(a, b, ignore) {
  if (a == b)
    return true;
  if (!a)
    a = noAttrs;
  if (!b)
    b = noAttrs;
  let keysA = Object.keys(a), keysB = Object.keys(b);
  if (keysA.length - (ignore && keysA.indexOf(ignore) > -1 ? 1 : 0) != keysB.length - (ignore && keysB.indexOf(ignore) > -1 ? 1 : 0))
    return false;
  for (let key of keysA) {
    if (key != ignore && (keysB.indexOf(key) == -1 || a[key] !== b[key]))
      return false;
  }
  return true;
}
function updateAttrs(dom, prev, attrs) {
  let changed = false;
  if (prev) {
    for (let name2 in prev)
      if (!(attrs && name2 in attrs)) {
        changed = true;
        if (name2 == "style")
          dom.style.cssText = "";
        else
          dom.removeAttribute(name2);
      }
  }
  if (attrs) {
    for (let name2 in attrs)
      if (!(prev && prev[name2] == attrs[name2])) {
        changed = true;
        if (name2 == "style")
          dom.style.cssText = attrs[name2];
        else
          dom.setAttribute(name2, attrs[name2]);
      }
  }
  return changed;
}
function getAttrs(dom) {
  let attrs = Object.create(null);
  for (let i = 0; i < dom.attributes.length; i++) {
    let attr = dom.attributes[i];
    attrs[attr.name] = attr.value;
  }
  return attrs;
}
var LineView = class extends ContentView {
  constructor() {
    super(...arguments);
    this.children = [];
    this.length = 0;
    this.prevAttrs = void 0;
    this.attrs = null;
    this.breakAfter = 0;
  }
  merge(from, to, source, hasStart, openStart, openEnd) {
    if (source) {
      if (!(source instanceof LineView))
        return false;
      if (!this.dom)
        source.transferDOM(this);
    }
    if (hasStart)
      this.setDeco(source ? source.attrs : null);
    mergeChildrenInto(this, from, to, source ? source.children.slice() : [], openStart, openEnd);
    return true;
  }
  split(at) {
    let end = new LineView();
    end.breakAfter = this.breakAfter;
    if (this.length == 0)
      return end;
    let { i, off } = this.childPos(at);
    if (off) {
      end.append(this.children[i].split(off), 0);
      this.children[i].merge(off, this.children[i].length, null, false, 0, 0);
      i++;
    }
    for (let j = i; j < this.children.length; j++)
      end.append(this.children[j], 0);
    while (i > 0 && this.children[i - 1].length == 0)
      this.children[--i].destroy();
    this.children.length = i;
    this.markDirty();
    this.length = at;
    return end;
  }
  transferDOM(other) {
    if (!this.dom)
      return;
    this.markDirty();
    other.setDOM(this.dom);
    other.prevAttrs = this.prevAttrs === void 0 ? this.attrs : this.prevAttrs;
    this.prevAttrs = void 0;
    this.dom = null;
  }
  setDeco(attrs) {
    if (!attrsEq(this.attrs, attrs)) {
      if (this.dom) {
        this.prevAttrs = this.attrs;
        this.markDirty();
      }
      this.attrs = attrs;
    }
  }
  append(child, openStart) {
    joinInlineInto(this, child, openStart);
  }
  addLineDeco(deco) {
    let attrs = deco.spec.attributes, cls = deco.spec.class;
    if (attrs)
      this.attrs = combineAttrs(attrs, this.attrs || {});
    if (cls)
      this.attrs = combineAttrs({ class: cls }, this.attrs || {});
  }
  domAtPos(pos) {
    return inlineDOMAtPos(this, pos);
  }
  reuseDOM(node) {
    if (node.nodeName == "DIV") {
      this.setDOM(node);
      this.flags |= 4 | 2;
    }
  }
  sync(view, track) {
    var _a2;
    if (!this.dom) {
      this.setDOM(document.createElement("div"));
      this.dom.className = "cm-line";
      this.prevAttrs = this.attrs ? null : void 0;
    } else if (this.flags & 4) {
      clearAttributes(this.dom);
      this.dom.className = "cm-line";
      this.prevAttrs = this.attrs ? null : void 0;
    }
    if (this.prevAttrs !== void 0) {
      updateAttrs(this.dom, this.prevAttrs, this.attrs);
      this.dom.classList.add("cm-line");
      this.prevAttrs = void 0;
    }
    super.sync(view, track);
    let last = this.dom.lastChild;
    while (last && ContentView.get(last) instanceof MarkView)
      last = last.lastChild;
    if (!last || !this.length || last.nodeName != "BR" && ((_a2 = ContentView.get(last)) === null || _a2 === void 0 ? void 0 : _a2.isEditable) == false && (!browser.ios || !this.children.some((ch) => ch instanceof TextView))) {
      let hack = document.createElement("BR");
      hack.cmIgnore = true;
      this.dom.appendChild(hack);
    }
  }
  measureTextSize() {
    if (this.children.length == 0 || this.length > 20)
      return null;
    let totalWidth = 0, textHeight;
    for (let child of this.children) {
      if (!(child instanceof TextView) || /[^ -~]/.test(child.text))
        return null;
      let rects = clientRectsFor(child.dom);
      if (rects.length != 1)
        return null;
      totalWidth += rects[0].width;
      textHeight = rects[0].height;
    }
    return !totalWidth ? null : {
      lineHeight: this.dom.getBoundingClientRect().height,
      charWidth: totalWidth / this.length,
      textHeight
    };
  }
  coordsAt(pos, side) {
    let rect = coordsInChildren(this, pos, side);
    if (!this.children.length && rect && this.parent) {
      let { heightOracle } = this.parent.view.viewState, height = rect.bottom - rect.top;
      if (Math.abs(height - heightOracle.lineHeight) < 2 && heightOracle.textHeight < height) {
        let dist2 = (height - heightOracle.textHeight) / 2;
        return { top: rect.top + dist2, bottom: rect.bottom - dist2, left: rect.left, right: rect.left };
      }
    }
    return rect;
  }
  become(_other) {
    return false;
  }
  covers() {
    return true;
  }
  static find(docView, pos) {
    for (let i = 0, off = 0; i < docView.children.length; i++) {
      let block = docView.children[i], end = off + block.length;
      if (end >= pos) {
        if (block instanceof LineView)
          return block;
        if (end > pos)
          break;
      }
      off = end + block.breakAfter;
    }
    return null;
  }
};
var BlockWidgetView = class extends ContentView {
  constructor(widget, length, deco) {
    super();
    this.widget = widget;
    this.length = length;
    this.deco = deco;
    this.breakAfter = 0;
    this.prevWidget = null;
  }
  merge(from, to, source, _takeDeco, openStart, openEnd) {
    if (source && (!(source instanceof BlockWidgetView) || !this.widget.compare(source.widget) || from > 0 && openStart <= 0 || to < this.length && openEnd <= 0))
      return false;
    this.length = from + (source ? source.length : 0) + (this.length - to);
    return true;
  }
  domAtPos(pos) {
    return pos == 0 ? DOMPos.before(this.dom) : DOMPos.after(this.dom, pos == this.length);
  }
  split(at) {
    let len = this.length - at;
    this.length = at;
    let end = new BlockWidgetView(this.widget, len, this.deco);
    end.breakAfter = this.breakAfter;
    return end;
  }
  get children() {
    return noChildren;
  }
  sync(view) {
    if (!this.dom || !this.widget.updateDOM(this.dom, view)) {
      if (this.dom && this.prevWidget)
        this.prevWidget.destroy(this.dom);
      this.prevWidget = null;
      this.setDOM(this.widget.toDOM(view));
      if (!this.widget.editable)
        this.dom.contentEditable = "false";
    }
  }
  get overrideDOMText() {
    return this.parent ? this.parent.view.state.doc.slice(this.posAtStart, this.posAtEnd) : Text.empty;
  }
  domBoundsAround() {
    return null;
  }
  become(other) {
    if (other instanceof BlockWidgetView && other.widget.constructor == this.widget.constructor) {
      if (!other.widget.compare(this.widget))
        this.markDirty(true);
      if (this.dom && !this.prevWidget)
        this.prevWidget = this.widget;
      this.widget = other.widget;
      this.length = other.length;
      this.deco = other.deco;
      this.breakAfter = other.breakAfter;
      return true;
    }
    return false;
  }
  ignoreMutation() {
    return true;
  }
  ignoreEvent(event) {
    return this.widget.ignoreEvent(event);
  }
  get isEditable() {
    return false;
  }
  get isWidget() {
    return true;
  }
  coordsAt(pos, side) {
    return this.widget.coordsAt(this.dom, pos, side);
  }
  destroy() {
    super.destroy();
    if (this.dom)
      this.widget.destroy(this.dom);
  }
  covers(side) {
    let { startSide, endSide } = this.deco;
    return startSide == endSide ? false : side < 0 ? startSide < 0 : endSide > 0;
  }
};
var WidgetType = class {
  eq(widget) {
    return false;
  }
  updateDOM(dom, view) {
    return false;
  }
  compare(other) {
    return this == other || this.constructor == other.constructor && this.eq(other);
  }
  get estimatedHeight() {
    return -1;
  }
  get lineBreaks() {
    return 0;
  }
  ignoreEvent(event) {
    return true;
  }
  coordsAt(dom, pos, side) {
    return null;
  }
  get isHidden() {
    return false;
  }
  get editable() {
    return false;
  }
  destroy(dom) {
  }
};
var BlockType = /* @__PURE__ */ function(BlockType2) {
  BlockType2[BlockType2["Text"] = 0] = "Text";
  BlockType2[BlockType2["WidgetBefore"] = 1] = "WidgetBefore";
  BlockType2[BlockType2["WidgetAfter"] = 2] = "WidgetAfter";
  BlockType2[BlockType2["WidgetRange"] = 3] = "WidgetRange";
  return BlockType2;
}(BlockType || (BlockType = {}));
var Decoration = class extends RangeValue {
  constructor(startSide, endSide, widget, spec) {
    super();
    this.startSide = startSide;
    this.endSide = endSide;
    this.widget = widget;
    this.spec = spec;
  }
  get heightRelevant() {
    return false;
  }
  static mark(spec) {
    return new MarkDecoration(spec);
  }
  static widget(spec) {
    let side = Math.max(-1e4, Math.min(1e4, spec.side || 0)), block = !!spec.block;
    side += block && !spec.inlineOrder ? side > 0 ? 3e8 : -4e8 : side > 0 ? 1e8 : -1e8;
    return new PointDecoration(spec, side, side, block, spec.widget || null, false);
  }
  static replace(spec) {
    let block = !!spec.block, startSide, endSide;
    if (spec.isBlockGap) {
      startSide = -5e8;
      endSide = 4e8;
    } else {
      let { start, end } = getInclusive(spec, block);
      startSide = (start ? block ? -3e8 : -1 : 5e8) - 1;
      endSide = (end ? block ? 2e8 : 1 : -6e8) + 1;
    }
    return new PointDecoration(spec, startSide, endSide, block, spec.widget || null, true);
  }
  static line(spec) {
    return new LineDecoration(spec);
  }
  static set(of, sort = false) {
    return RangeSet.of(of, sort);
  }
  hasHeight() {
    return this.widget ? this.widget.estimatedHeight > -1 : false;
  }
};
Decoration.none = RangeSet.empty;
var MarkDecoration = class extends Decoration {
  constructor(spec) {
    let { start, end } = getInclusive(spec);
    super(start ? -1 : 5e8, end ? 1 : -6e8, null, spec);
    this.tagName = spec.tagName || "span";
    this.class = spec.class || "";
    this.attrs = spec.attributes || null;
  }
  eq(other) {
    var _a2, _b;
    return this == other || other instanceof MarkDecoration && this.tagName == other.tagName && (this.class || ((_a2 = this.attrs) === null || _a2 === void 0 ? void 0 : _a2.class)) == (other.class || ((_b = other.attrs) === null || _b === void 0 ? void 0 : _b.class)) && attrsEq(this.attrs, other.attrs, "class");
  }
  range(from, to = from) {
    if (from >= to)
      throw new RangeError("Mark decorations may not be empty");
    return super.range(from, to);
  }
};
MarkDecoration.prototype.point = false;
var LineDecoration = class extends Decoration {
  constructor(spec) {
    super(-2e8, -2e8, null, spec);
  }
  eq(other) {
    return other instanceof LineDecoration && this.spec.class == other.spec.class && attrsEq(this.spec.attributes, other.spec.attributes);
  }
  range(from, to = from) {
    if (to != from)
      throw new RangeError("Line decoration ranges must be zero-length");
    return super.range(from, to);
  }
};
LineDecoration.prototype.mapMode = MapMode.TrackBefore;
LineDecoration.prototype.point = true;
var PointDecoration = class extends Decoration {
  constructor(spec, startSide, endSide, block, widget, isReplace) {
    super(startSide, endSide, widget, spec);
    this.block = block;
    this.isReplace = isReplace;
    this.mapMode = !block ? MapMode.TrackDel : startSide <= 0 ? MapMode.TrackBefore : MapMode.TrackAfter;
  }
  get type() {
    return this.startSide != this.endSide ? BlockType.WidgetRange : this.startSide <= 0 ? BlockType.WidgetBefore : BlockType.WidgetAfter;
  }
  get heightRelevant() {
    return this.block || !!this.widget && (this.widget.estimatedHeight >= 5 || this.widget.lineBreaks > 0);
  }
  eq(other) {
    return other instanceof PointDecoration && widgetsEq(this.widget, other.widget) && this.block == other.block && this.startSide == other.startSide && this.endSide == other.endSide;
  }
  range(from, to = from) {
    if (this.isReplace && (from > to || from == to && this.startSide > 0 && this.endSide <= 0))
      throw new RangeError("Invalid range for replacement decoration");
    if (!this.isReplace && to != from)
      throw new RangeError("Widget decorations can only have zero-length ranges");
    return super.range(from, to);
  }
};
PointDecoration.prototype.point = true;
function getInclusive(spec, block = false) {
  let { inclusiveStart: start, inclusiveEnd: end } = spec;
  if (start == null)
    start = spec.inclusive;
  if (end == null)
    end = spec.inclusive;
  return { start: start !== null && start !== void 0 ? start : block, end: end !== null && end !== void 0 ? end : block };
}
function widgetsEq(a, b) {
  return a == b || !!(a && b && a.compare(b));
}
function addRange(from, to, ranges, margin = 0) {
  let last = ranges.length - 1;
  if (last >= 0 && ranges[last] + margin >= from)
    ranges[last] = Math.max(ranges[last], to);
  else
    ranges.push(from, to);
}
var ContentBuilder = class {
  constructor(doc2, pos, end, disallowBlockEffectsFor) {
    this.doc = doc2;
    this.pos = pos;
    this.end = end;
    this.disallowBlockEffectsFor = disallowBlockEffectsFor;
    this.content = [];
    this.curLine = null;
    this.breakAtStart = 0;
    this.pendingBuffer = 0;
    this.bufferMarks = [];
    this.atCursorPos = true;
    this.openStart = -1;
    this.openEnd = -1;
    this.text = "";
    this.textOff = 0;
    this.cursor = doc2.iter();
    this.skip = pos;
  }
  posCovered() {
    if (this.content.length == 0)
      return !this.breakAtStart && this.doc.lineAt(this.pos).from != this.pos;
    let last = this.content[this.content.length - 1];
    return !(last.breakAfter || last instanceof BlockWidgetView && last.deco.endSide < 0);
  }
  getLine() {
    if (!this.curLine) {
      this.content.push(this.curLine = new LineView());
      this.atCursorPos = true;
    }
    return this.curLine;
  }
  flushBuffer(active = this.bufferMarks) {
    if (this.pendingBuffer) {
      this.curLine.append(wrapMarks(new WidgetBufferView(-1), active), active.length);
      this.pendingBuffer = 0;
    }
  }
  addBlockWidget(view) {
    this.flushBuffer();
    this.curLine = null;
    this.content.push(view);
  }
  finish(openEnd) {
    if (this.pendingBuffer && openEnd <= this.bufferMarks.length)
      this.flushBuffer();
    else
      this.pendingBuffer = 0;
    if (!this.posCovered() && !(openEnd && this.content.length && this.content[this.content.length - 1] instanceof BlockWidgetView))
      this.getLine();
  }
  buildText(length, active, openStart) {
    while (length > 0) {
      if (this.textOff == this.text.length) {
        let { value, lineBreak, done } = this.cursor.next(this.skip);
        this.skip = 0;
        if (done)
          throw new Error("Ran out of text content when drawing inline views");
        if (lineBreak) {
          if (!this.posCovered())
            this.getLine();
          if (this.content.length)
            this.content[this.content.length - 1].breakAfter = 1;
          else
            this.breakAtStart = 1;
          this.flushBuffer();
          this.curLine = null;
          this.atCursorPos = true;
          length--;
          continue;
        } else {
          this.text = value;
          this.textOff = 0;
        }
      }
      let take = Math.min(this.text.length - this.textOff, length, 512);
      this.flushBuffer(active.slice(active.length - openStart));
      this.getLine().append(wrapMarks(new TextView(this.text.slice(this.textOff, this.textOff + take)), active), openStart);
      this.atCursorPos = true;
      this.textOff += take;
      length -= take;
      openStart = 0;
    }
  }
  span(from, to, active, openStart) {
    this.buildText(to - from, active, openStart);
    this.pos = to;
    if (this.openStart < 0)
      this.openStart = openStart;
  }
  point(from, to, deco, active, openStart, index) {
    if (this.disallowBlockEffectsFor[index] && deco instanceof PointDecoration) {
      if (deco.block)
        throw new RangeError("Block decorations may not be specified via plugins");
      if (to > this.doc.lineAt(this.pos).to)
        throw new RangeError("Decorations that replace line breaks may not be specified via plugins");
    }
    let len = to - from;
    if (deco instanceof PointDecoration) {
      if (deco.block) {
        if (deco.startSide > 0 && !this.posCovered())
          this.getLine();
        this.addBlockWidget(new BlockWidgetView(deco.widget || NullWidget.block, len, deco));
      } else {
        let view = WidgetView.create(deco.widget || NullWidget.inline, len, len ? 0 : deco.startSide);
        let cursorBefore = this.atCursorPos && !view.isEditable && openStart <= active.length && (from < to || deco.startSide > 0);
        let cursorAfter = !view.isEditable && (from < to || openStart > active.length || deco.startSide <= 0);
        let line = this.getLine();
        if (this.pendingBuffer == 2 && !cursorBefore && !view.isEditable)
          this.pendingBuffer = 0;
        this.flushBuffer(active);
        if (cursorBefore) {
          line.append(wrapMarks(new WidgetBufferView(1), active), openStart);
          openStart = active.length + Math.max(0, openStart - active.length);
        }
        line.append(wrapMarks(view, active), openStart);
        this.atCursorPos = cursorAfter;
        this.pendingBuffer = !cursorAfter ? 0 : from < to || openStart > active.length ? 1 : 2;
        if (this.pendingBuffer)
          this.bufferMarks = active.slice();
      }
    } else if (this.doc.lineAt(this.pos).from == this.pos) {
      this.getLine().addLineDeco(deco);
    }
    if (len) {
      if (this.textOff + len <= this.text.length) {
        this.textOff += len;
      } else {
        this.skip += len - (this.text.length - this.textOff);
        this.text = "";
        this.textOff = 0;
      }
      this.pos = to;
    }
    if (this.openStart < 0)
      this.openStart = openStart;
  }
  static build(text, from, to, decorations2, dynamicDecorationMap) {
    let builder = new ContentBuilder(text, from, to, dynamicDecorationMap);
    builder.openEnd = RangeSet.spans(decorations2, from, to, builder);
    if (builder.openStart < 0)
      builder.openStart = builder.openEnd;
    builder.finish(builder.openEnd);
    return builder;
  }
};
function wrapMarks(view, active) {
  for (let mark of active)
    view = new MarkView(mark, [view], view.length);
  return view;
}
var NullWidget = class extends WidgetType {
  constructor(tag) {
    super();
    this.tag = tag;
  }
  eq(other) {
    return other.tag == this.tag;
  }
  toDOM() {
    return document.createElement(this.tag);
  }
  updateDOM(elt2) {
    return elt2.nodeName.toLowerCase() == this.tag;
  }
  get isHidden() {
    return true;
  }
};
NullWidget.inline = /* @__PURE__ */ new NullWidget("span");
NullWidget.block = /* @__PURE__ */ new NullWidget("div");
var Direction = /* @__PURE__ */ function(Direction2) {
  Direction2[Direction2["LTR"] = 0] = "LTR";
  Direction2[Direction2["RTL"] = 1] = "RTL";
  return Direction2;
}(Direction || (Direction = {}));
var LTR = Direction.LTR;
var RTL = Direction.RTL;
function dec(str) {
  let result = [];
  for (let i = 0; i < str.length; i++)
    result.push(1 << +str[i]);
  return result;
}
var LowTypes = /* @__PURE__ */ dec("88888888888888888888888888888888888666888888787833333333337888888000000000000000000000000008888880000000000000000000000000088888888888888888888888888888888888887866668888088888663380888308888800000000000000000000000800000000000000000000000000000008");
var ArabicTypes = /* @__PURE__ */ dec("4444448826627288999999999992222222222222222222222222222222222222222222222229999999999999999999994444444444644222822222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222999999949999999229989999223333333333");
var Brackets = /* @__PURE__ */ Object.create(null);
var BracketStack = [];
for (let p of ["()", "[]", "{}"]) {
  let l = /* @__PURE__ */ p.charCodeAt(0), r = /* @__PURE__ */ p.charCodeAt(1);
  Brackets[l] = r;
  Brackets[r] = -l;
}
function charType(ch) {
  return ch <= 247 ? LowTypes[ch] : 1424 <= ch && ch <= 1524 ? 2 : 1536 <= ch && ch <= 1785 ? ArabicTypes[ch - 1536] : 1774 <= ch && ch <= 2220 ? 4 : 8192 <= ch && ch <= 8204 ? 256 : 64336 <= ch && ch <= 65023 ? 4 : 1;
}
var BidiRE = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac\ufb50-\ufdff]/;
var BidiSpan = class {
  get dir() {
    return this.level % 2 ? RTL : LTR;
  }
  constructor(from, to, level) {
    this.from = from;
    this.to = to;
    this.level = level;
  }
  side(end, dir) {
    return this.dir == dir == end ? this.to : this.from;
  }
  forward(forward, dir) {
    return forward == (this.dir == dir);
  }
  static find(order, index, level, assoc) {
    let maybe = -1;
    for (let i = 0; i < order.length; i++) {
      let span = order[i];
      if (span.from <= index && span.to >= index) {
        if (span.level == level)
          return i;
        if (maybe < 0 || (assoc != 0 ? assoc < 0 ? span.from < index : span.to > index : order[maybe].level > span.level))
          maybe = i;
      }
    }
    if (maybe < 0)
      throw new RangeError("Index out of range");
    return maybe;
  }
};
function isolatesEq(a, b) {
  if (a.length != b.length)
    return false;
  for (let i = 0; i < a.length; i++) {
    let iA = a[i], iB = b[i];
    if (iA.from != iB.from || iA.to != iB.to || iA.direction != iB.direction || !isolatesEq(iA.inner, iB.inner))
      return false;
  }
  return true;
}
var types = [];
function computeCharTypes(line, rFrom, rTo, isolates, outerType) {
  for (let iI = 0; iI <= isolates.length; iI++) {
    let from = iI ? isolates[iI - 1].to : rFrom, to = iI < isolates.length ? isolates[iI].from : rTo;
    let prevType = iI ? 256 : outerType;
    for (let i = from, prev = prevType, prevStrong = prevType; i < to; i++) {
      let type = charType(line.charCodeAt(i));
      if (type == 512)
        type = prev;
      else if (type == 8 && prevStrong == 4)
        type = 16;
      types[i] = type == 4 ? 2 : type;
      if (type & 7)
        prevStrong = type;
      prev = type;
    }
    for (let i = from, prev = prevType, prevStrong = prevType; i < to; i++) {
      let type = types[i];
      if (type == 128) {
        if (i < to - 1 && prev == types[i + 1] && prev & 24)
          type = types[i] = prev;
        else
          types[i] = 256;
      } else if (type == 64) {
        let end = i + 1;
        while (end < to && types[end] == 64)
          end++;
        let replace = i && prev == 8 || end < rTo && types[end] == 8 ? prevStrong == 1 ? 1 : 8 : 256;
        for (let j = i; j < end; j++)
          types[j] = replace;
        i = end - 1;
      } else if (type == 8 && prevStrong == 1) {
        types[i] = 1;
      }
      prev = type;
      if (type & 7)
        prevStrong = type;
    }
  }
}
function processBracketPairs(line, rFrom, rTo, isolates, outerType) {
  let oppositeType = outerType == 1 ? 2 : 1;
  for (let iI = 0, sI = 0, context = 0; iI <= isolates.length; iI++) {
    let from = iI ? isolates[iI - 1].to : rFrom, to = iI < isolates.length ? isolates[iI].from : rTo;
    for (let i = from, ch, br, type; i < to; i++) {
      if (br = Brackets[ch = line.charCodeAt(i)]) {
        if (br < 0) {
          for (let sJ = sI - 3; sJ >= 0; sJ -= 3) {
            if (BracketStack[sJ + 1] == -br) {
              let flags = BracketStack[sJ + 2];
              let type2 = flags & 2 ? outerType : !(flags & 4) ? 0 : flags & 1 ? oppositeType : outerType;
              if (type2)
                types[i] = types[BracketStack[sJ]] = type2;
              sI = sJ;
              break;
            }
          }
        } else if (BracketStack.length == 189) {
          break;
        } else {
          BracketStack[sI++] = i;
          BracketStack[sI++] = ch;
          BracketStack[sI++] = context;
        }
      } else if ((type = types[i]) == 2 || type == 1) {
        let embed = type == outerType;
        context = embed ? 0 : 1;
        for (let sJ = sI - 3; sJ >= 0; sJ -= 3) {
          let cur = BracketStack[sJ + 2];
          if (cur & 2)
            break;
          if (embed) {
            BracketStack[sJ + 2] |= 2;
          } else {
            if (cur & 4)
              break;
            BracketStack[sJ + 2] |= 4;
          }
        }
      }
    }
  }
}
function processNeutrals(rFrom, rTo, isolates, outerType) {
  for (let iI = 0, prev = outerType; iI <= isolates.length; iI++) {
    let from = iI ? isolates[iI - 1].to : rFrom, to = iI < isolates.length ? isolates[iI].from : rTo;
    for (let i = from; i < to; ) {
      let type = types[i];
      if (type == 256) {
        let end = i + 1;
        for (; ; ) {
          if (end == to) {
            if (iI == isolates.length)
              break;
            end = isolates[iI++].to;
            to = iI < isolates.length ? isolates[iI].from : rTo;
          } else if (types[end] == 256) {
            end++;
          } else {
            break;
          }
        }
        let beforeL = prev == 1;
        let afterL = (end < rTo ? types[end] : outerType) == 1;
        let replace = beforeL == afterL ? beforeL ? 1 : 2 : outerType;
        for (let j = end, jI = iI, fromJ = jI ? isolates[jI - 1].to : rFrom; j > i; ) {
          if (j == fromJ) {
            j = isolates[--jI].from;
            fromJ = jI ? isolates[jI - 1].to : rFrom;
          }
          types[--j] = replace;
        }
        i = end;
      } else {
        prev = type;
        i++;
      }
    }
  }
}
function emitSpans(line, from, to, level, baseLevel, isolates, order) {
  let ourType = level % 2 ? 2 : 1;
  if (level % 2 == baseLevel % 2) {
    for (let iCh = from, iI = 0; iCh < to; ) {
      let sameDir = true, isNum = false;
      if (iI == isolates.length || iCh < isolates[iI].from) {
        let next = types[iCh];
        if (next != ourType) {
          sameDir = false;
          isNum = next == 16;
        }
      }
      let recurse = !sameDir && ourType == 1 ? [] : null;
      let localLevel = sameDir ? level : level + 1;
      let iScan = iCh;
      run:
        for (; ; ) {
          if (iI < isolates.length && iScan == isolates[iI].from) {
            if (isNum)
              break run;
            let iso = isolates[iI];
            if (!sameDir)
              for (let upto = iso.to, jI = iI + 1; ; ) {
                if (upto == to)
                  break run;
                if (jI < isolates.length && isolates[jI].from == upto)
                  upto = isolates[jI++].to;
                else if (types[upto] == ourType)
                  break run;
                else
                  break;
              }
            iI++;
            if (recurse) {
              recurse.push(iso);
            } else {
              if (iso.from > iCh)
                order.push(new BidiSpan(iCh, iso.from, localLevel));
              let dirSwap = iso.direction == LTR != !(localLevel % 2);
              computeSectionOrder(line, dirSwap ? level + 1 : level, baseLevel, iso.inner, iso.from, iso.to, order);
              iCh = iso.to;
            }
            iScan = iso.to;
          } else if (iScan == to || (sameDir ? types[iScan] != ourType : types[iScan] == ourType)) {
            break;
          } else {
            iScan++;
          }
        }
      if (recurse)
        emitSpans(line, iCh, iScan, level + 1, baseLevel, recurse, order);
      else if (iCh < iScan)
        order.push(new BidiSpan(iCh, iScan, localLevel));
      iCh = iScan;
    }
  } else {
    for (let iCh = to, iI = isolates.length; iCh > from; ) {
      let sameDir = true, isNum = false;
      if (!iI || iCh > isolates[iI - 1].to) {
        let next = types[iCh - 1];
        if (next != ourType) {
          sameDir = false;
          isNum = next == 16;
        }
      }
      let recurse = !sameDir && ourType == 1 ? [] : null;
      let localLevel = sameDir ? level : level + 1;
      let iScan = iCh;
      run:
        for (; ; ) {
          if (iI && iScan == isolates[iI - 1].to) {
            if (isNum)
              break run;
            let iso = isolates[--iI];
            if (!sameDir)
              for (let upto = iso.from, jI = iI; ; ) {
                if (upto == from)
                  break run;
                if (jI && isolates[jI - 1].to == upto)
                  upto = isolates[--jI].from;
                else if (types[upto - 1] == ourType)
                  break run;
                else
                  break;
              }
            if (recurse) {
              recurse.push(iso);
            } else {
              if (iso.to < iCh)
                order.push(new BidiSpan(iso.to, iCh, localLevel));
              let dirSwap = iso.direction == LTR != !(localLevel % 2);
              computeSectionOrder(line, dirSwap ? level + 1 : level, baseLevel, iso.inner, iso.from, iso.to, order);
              iCh = iso.from;
            }
            iScan = iso.from;
          } else if (iScan == from || (sameDir ? types[iScan - 1] != ourType : types[iScan - 1] == ourType)) {
            break;
          } else {
            iScan--;
          }
        }
      if (recurse)
        emitSpans(line, iScan, iCh, level + 1, baseLevel, recurse, order);
      else if (iScan < iCh)
        order.push(new BidiSpan(iScan, iCh, localLevel));
      iCh = iScan;
    }
  }
}
function computeSectionOrder(line, level, baseLevel, isolates, from, to, order) {
  let outerType = level % 2 ? 2 : 1;
  computeCharTypes(line, from, to, isolates, outerType);
  processBracketPairs(line, from, to, isolates, outerType);
  processNeutrals(from, to, isolates, outerType);
  emitSpans(line, from, to, level, baseLevel, isolates, order);
}
function computeOrder(line, direction, isolates) {
  if (!line)
    return [new BidiSpan(0, 0, direction == RTL ? 1 : 0)];
  if (direction == LTR && !isolates.length && !BidiRE.test(line))
    return trivialOrder(line.length);
  if (isolates.length)
    while (line.length > types.length)
      types[types.length] = 256;
  let order = [], level = direction == LTR ? 0 : 1;
  computeSectionOrder(line, level, level, isolates, 0, line.length, order);
  return order;
}
function trivialOrder(length) {
  return [new BidiSpan(0, length, 0)];
}
var movedOver = "";
function moveVisually(line, order, dir, start, forward) {
  var _a2;
  let startIndex = start.head - line.from;
  let spanI = BidiSpan.find(order, startIndex, (_a2 = start.bidiLevel) !== null && _a2 !== void 0 ? _a2 : -1, start.assoc);
  let span = order[spanI], spanEnd = span.side(forward, dir);
  if (startIndex == spanEnd) {
    let nextI = spanI += forward ? 1 : -1;
    if (nextI < 0 || nextI >= order.length)
      return null;
    span = order[spanI = nextI];
    startIndex = span.side(!forward, dir);
    spanEnd = span.side(forward, dir);
  }
  let nextIndex = findClusterBreak(line.text, startIndex, span.forward(forward, dir));
  if (nextIndex < span.from || nextIndex > span.to)
    nextIndex = spanEnd;
  movedOver = line.text.slice(Math.min(startIndex, nextIndex), Math.max(startIndex, nextIndex));
  let nextSpan = spanI == (forward ? order.length - 1 : 0) ? null : order[spanI + (forward ? 1 : -1)];
  if (nextSpan && nextIndex == spanEnd && nextSpan.level + (forward ? 0 : 1) < span.level)
    return EditorSelection.cursor(nextSpan.side(!forward, dir) + line.from, nextSpan.forward(forward, dir) ? 1 : -1, nextSpan.level);
  return EditorSelection.cursor(nextIndex + line.from, span.forward(forward, dir) ? -1 : 1, span.level);
}
function autoDirection(text, from, to) {
  for (let i = from; i < to; i++) {
    let type = charType(text.charCodeAt(i));
    if (type == 1)
      return LTR;
    if (type == 2 || type == 4)
      return RTL;
  }
  return LTR;
}
var clickAddsSelectionRange = /* @__PURE__ */ Facet.define();
var dragMovesSelection$1 = /* @__PURE__ */ Facet.define();
var mouseSelectionStyle = /* @__PURE__ */ Facet.define();
var exceptionSink = /* @__PURE__ */ Facet.define();
var updateListener = /* @__PURE__ */ Facet.define();
var inputHandler = /* @__PURE__ */ Facet.define();
var focusChangeEffect = /* @__PURE__ */ Facet.define();
var perLineTextDirection = /* @__PURE__ */ Facet.define({
  combine: (values2) => values2.some((x) => x)
});
var nativeSelectionHidden = /* @__PURE__ */ Facet.define({
  combine: (values2) => values2.some((x) => x)
});
var scrollHandler = /* @__PURE__ */ Facet.define();
var ScrollTarget = class {
  constructor(range, y = "nearest", x = "nearest", yMargin = 5, xMargin = 5, isSnapshot = false) {
    this.range = range;
    this.y = y;
    this.x = x;
    this.yMargin = yMargin;
    this.xMargin = xMargin;
    this.isSnapshot = isSnapshot;
  }
  map(changes) {
    return changes.empty ? this : new ScrollTarget(this.range.map(changes), this.y, this.x, this.yMargin, this.xMargin, this.isSnapshot);
  }
  clip(state) {
    return this.range.to <= state.doc.length ? this : new ScrollTarget(EditorSelection.cursor(state.doc.length), this.y, this.x, this.yMargin, this.xMargin, this.isSnapshot);
  }
};
var scrollIntoView = /* @__PURE__ */ StateEffect.define({ map: (t2, ch) => t2.map(ch) });
function logException(state, exception, context) {
  let handler = state.facet(exceptionSink);
  if (handler.length)
    handler[0](exception);
  else if (window.onerror)
    window.onerror(String(exception), context, void 0, void 0, exception);
  else if (context)
    console.error(context + ":", exception);
  else
    console.error(exception);
}
var editable = /* @__PURE__ */ Facet.define({ combine: (values2) => values2.length ? values2[0] : true });
var nextPluginID = 0;
var viewPlugin = /* @__PURE__ */ Facet.define();
var ViewPlugin = class {
  constructor(id2, create, domEventHandlers, domEventObservers, buildExtensions) {
    this.id = id2;
    this.create = create;
    this.domEventHandlers = domEventHandlers;
    this.domEventObservers = domEventObservers;
    this.extension = buildExtensions(this);
  }
  static define(create, spec) {
    const { eventHandlers, eventObservers, provide, decorations: deco } = spec || {};
    return new ViewPlugin(nextPluginID++, create, eventHandlers, eventObservers, (plugin) => {
      let ext = [viewPlugin.of(plugin)];
      if (deco)
        ext.push(decorations.of((view) => {
          let pluginInst = view.plugin(plugin);
          return pluginInst ? deco(pluginInst) : Decoration.none;
        }));
      if (provide)
        ext.push(provide(plugin));
      return ext;
    });
  }
  static fromClass(cls, spec) {
    return ViewPlugin.define((view) => new cls(view), spec);
  }
};
var PluginInstance = class {
  constructor(spec) {
    this.spec = spec;
    this.mustUpdate = null;
    this.value = null;
  }
  update(view) {
    if (!this.value) {
      if (this.spec) {
        try {
          this.value = this.spec.create(view);
        } catch (e) {
          logException(view.state, e, "CodeMirror plugin crashed");
          this.deactivate();
        }
      }
    } else if (this.mustUpdate) {
      let update = this.mustUpdate;
      this.mustUpdate = null;
      if (this.value.update) {
        try {
          this.value.update(update);
        } catch (e) {
          logException(update.state, e, "CodeMirror plugin crashed");
          if (this.value.destroy)
            try {
              this.value.destroy();
            } catch (_) {
            }
          this.deactivate();
        }
      }
    }
    return this;
  }
  destroy(view) {
    var _a2;
    if ((_a2 = this.value) === null || _a2 === void 0 ? void 0 : _a2.destroy) {
      try {
        this.value.destroy();
      } catch (e) {
        logException(view.state, e, "CodeMirror plugin crashed");
      }
    }
  }
  deactivate() {
    this.spec = this.value = null;
  }
};
var editorAttributes = /* @__PURE__ */ Facet.define();
var contentAttributes = /* @__PURE__ */ Facet.define();
var decorations = /* @__PURE__ */ Facet.define();
var outerDecorations = /* @__PURE__ */ Facet.define();
var atomicRanges = /* @__PURE__ */ Facet.define();
var bidiIsolatedRanges = /* @__PURE__ */ Facet.define();
function getIsolatedRanges(view, line) {
  let isolates = view.state.facet(bidiIsolatedRanges);
  if (!isolates.length)
    return isolates;
  let sets = isolates.map((i) => i instanceof Function ? i(view) : i);
  let result = [];
  RangeSet.spans(sets, line.from, line.to, {
    point() {
    },
    span(fromDoc, toDoc, active, open) {
      let from = fromDoc - line.from, to = toDoc - line.from;
      let level = result;
      for (let i = active.length - 1; i >= 0; i--, open--) {
        let direction = active[i].spec.bidiIsolate, update;
        if (direction == null)
          direction = autoDirection(line.text, from, to);
        if (open > 0 && level.length && (update = level[level.length - 1]).to == from && update.direction == direction) {
          update.to = to;
          level = update.inner;
        } else {
          let add = { from, to, direction, inner: [] };
          level.push(add);
          level = add.inner;
        }
      }
    }
  });
  return result;
}
var scrollMargins = /* @__PURE__ */ Facet.define();
function getScrollMargins(view) {
  let left = 0, right = 0, top2 = 0, bottom = 0;
  for (let source of view.state.facet(scrollMargins)) {
    let m = source(view);
    if (m) {
      if (m.left != null)
        left = Math.max(left, m.left);
      if (m.right != null)
        right = Math.max(right, m.right);
      if (m.top != null)
        top2 = Math.max(top2, m.top);
      if (m.bottom != null)
        bottom = Math.max(bottom, m.bottom);
    }
  }
  return { left, right, top: top2, bottom };
}
var styleModule = /* @__PURE__ */ Facet.define();
var ChangedRange = class {
  constructor(fromA, toA, fromB, toB) {
    this.fromA = fromA;
    this.toA = toA;
    this.fromB = fromB;
    this.toB = toB;
  }
  join(other) {
    return new ChangedRange(Math.min(this.fromA, other.fromA), Math.max(this.toA, other.toA), Math.min(this.fromB, other.fromB), Math.max(this.toB, other.toB));
  }
  addToSet(set) {
    let i = set.length, me = this;
    for (; i > 0; i--) {
      let range = set[i - 1];
      if (range.fromA > me.toA)
        continue;
      if (range.toA < me.fromA)
        break;
      me = me.join(range);
      set.splice(i - 1, 1);
    }
    set.splice(i, 0, me);
    return set;
  }
  static extendWithRanges(diff, ranges) {
    if (ranges.length == 0)
      return diff;
    let result = [];
    for (let dI = 0, rI = 0, posA = 0, posB = 0; ; dI++) {
      let next = dI == diff.length ? null : diff[dI], off = posA - posB;
      let end = next ? next.fromB : 1e9;
      while (rI < ranges.length && ranges[rI] < end) {
        let from = ranges[rI], to = ranges[rI + 1];
        let fromB = Math.max(posB, from), toB = Math.min(end, to);
        if (fromB <= toB)
          new ChangedRange(fromB + off, toB + off, fromB, toB).addToSet(result);
        if (to > end)
          break;
        else
          rI += 2;
      }
      if (!next)
        return result;
      new ChangedRange(next.fromA, next.toA, next.fromB, next.toB).addToSet(result);
      posA = next.toA;
      posB = next.toB;
    }
  }
};
var ViewUpdate = class {
  constructor(view, state, transactions) {
    this.view = view;
    this.state = state;
    this.transactions = transactions;
    this.flags = 0;
    this.startState = view.state;
    this.changes = ChangeSet.empty(this.startState.doc.length);
    for (let tr of transactions)
      this.changes = this.changes.compose(tr.changes);
    let changedRanges = [];
    this.changes.iterChangedRanges((fromA, toA, fromB, toB) => changedRanges.push(new ChangedRange(fromA, toA, fromB, toB)));
    this.changedRanges = changedRanges;
  }
  static create(view, state, transactions) {
    return new ViewUpdate(view, state, transactions);
  }
  get viewportChanged() {
    return (this.flags & 4) > 0;
  }
  get heightChanged() {
    return (this.flags & 2) > 0;
  }
  get geometryChanged() {
    return this.docChanged || (this.flags & (8 | 2)) > 0;
  }
  get focusChanged() {
    return (this.flags & 1) > 0;
  }
  get docChanged() {
    return !this.changes.empty;
  }
  get selectionSet() {
    return this.transactions.some((tr) => tr.selection);
  }
  get empty() {
    return this.flags == 0 && this.transactions.length == 0;
  }
};
var DocView = class extends ContentView {
  get length() {
    return this.view.state.doc.length;
  }
  constructor(view) {
    super();
    this.view = view;
    this.decorations = [];
    this.dynamicDecorationMap = [false];
    this.domChanged = null;
    this.hasComposition = null;
    this.markedForComposition = new Set();
    this.compositionBarrier = Decoration.none;
    this.lastCompositionAfterCursor = false;
    this.minWidth = 0;
    this.minWidthFrom = 0;
    this.minWidthTo = 0;
    this.impreciseAnchor = null;
    this.impreciseHead = null;
    this.forceSelection = false;
    this.lastUpdate = Date.now();
    this.setDOM(view.contentDOM);
    this.children = [new LineView()];
    this.children[0].setParent(this);
    this.updateDeco();
    this.updateInner([new ChangedRange(0, 0, 0, view.state.doc.length)], 0, null);
  }
  update(update) {
    var _a2;
    let changedRanges = update.changedRanges;
    if (this.minWidth > 0 && changedRanges.length) {
      if (!changedRanges.every(({ fromA, toA }) => toA < this.minWidthFrom || fromA > this.minWidthTo)) {
        this.minWidth = this.minWidthFrom = this.minWidthTo = 0;
      } else {
        this.minWidthFrom = update.changes.mapPos(this.minWidthFrom, 1);
        this.minWidthTo = update.changes.mapPos(this.minWidthTo, 1);
      }
    }
    let readCompositionAt = -1;
    if (this.view.inputState.composing >= 0) {
      if ((_a2 = this.domChanged) === null || _a2 === void 0 ? void 0 : _a2.newSel)
        readCompositionAt = this.domChanged.newSel.head;
      else if (!touchesComposition(update.changes, this.hasComposition) && !update.selectionSet)
        readCompositionAt = update.state.selection.main.head;
    }
    let composition = readCompositionAt > -1 ? findCompositionRange(this.view, update.changes, readCompositionAt) : null;
    this.domChanged = null;
    if (this.hasComposition) {
      this.markedForComposition.clear();
      let { from, to } = this.hasComposition;
      changedRanges = new ChangedRange(from, to, update.changes.mapPos(from, -1), update.changes.mapPos(to, 1)).addToSet(changedRanges.slice());
    }
    this.hasComposition = composition ? { from: composition.range.fromB, to: composition.range.toB } : null;
    if ((browser.ie || browser.chrome) && !composition && update && update.state.doc.lines != update.startState.doc.lines)
      this.forceSelection = true;
    let prevDeco = this.decorations, deco = this.updateDeco();
    let decoDiff = findChangedDeco(prevDeco, deco, update.changes);
    changedRanges = ChangedRange.extendWithRanges(changedRanges, decoDiff);
    if (!(this.flags & 7) && changedRanges.length == 0) {
      return false;
    } else {
      this.updateInner(changedRanges, update.startState.doc.length, composition);
      if (update.transactions.length)
        this.lastUpdate = Date.now();
      return true;
    }
  }
  updateInner(changes, oldLength, composition) {
    this.view.viewState.mustMeasureContent = true;
    this.updateChildren(changes, oldLength, composition);
    let { observer } = this.view;
    observer.ignore(() => {
      this.dom.style.height = this.view.viewState.contentHeight / this.view.scaleY + "px";
      this.dom.style.flexBasis = this.minWidth ? this.minWidth + "px" : "";
      let track = browser.chrome || browser.ios ? { node: observer.selectionRange.focusNode, written: false } : void 0;
      this.sync(this.view, track);
      this.flags &= ~7;
      if (track && (track.written || observer.selectionRange.focusNode != track.node))
        this.forceSelection = true;
      this.dom.style.height = "";
    });
    this.markedForComposition.forEach((cView) => cView.flags &= ~8);
    let gaps = [];
    if (this.view.viewport.from || this.view.viewport.to < this.view.state.doc.length) {
      for (let child of this.children)
        if (child instanceof BlockWidgetView && child.widget instanceof BlockGapWidget)
          gaps.push(child.dom);
    }
    observer.updateGaps(gaps);
  }
  updateChildren(changes, oldLength, composition) {
    let ranges = composition ? composition.range.addToSet(changes.slice()) : changes;
    let cursor = this.childCursor(oldLength);
    for (let i = ranges.length - 1; ; i--) {
      let next = i >= 0 ? ranges[i] : null;
      if (!next)
        break;
      let { fromA, toA, fromB, toB } = next, content2, breakAtStart, openStart, openEnd;
      if (composition && composition.range.fromB < toB && composition.range.toB > fromB) {
        let before = ContentBuilder.build(this.view.state.doc, fromB, composition.range.fromB, this.decorations, this.dynamicDecorationMap);
        let after = ContentBuilder.build(this.view.state.doc, composition.range.toB, toB, this.decorations, this.dynamicDecorationMap);
        breakAtStart = before.breakAtStart;
        openStart = before.openStart;
        openEnd = after.openEnd;
        let compLine = this.compositionView(composition);
        if (after.breakAtStart) {
          compLine.breakAfter = 1;
        } else if (after.content.length && compLine.merge(compLine.length, compLine.length, after.content[0], false, after.openStart, 0)) {
          compLine.breakAfter = after.content[0].breakAfter;
          after.content.shift();
        }
        if (before.content.length && compLine.merge(0, 0, before.content[before.content.length - 1], true, 0, before.openEnd)) {
          before.content.pop();
        }
        content2 = before.content.concat(compLine).concat(after.content);
      } else {
        ({ content: content2, breakAtStart, openStart, openEnd } = ContentBuilder.build(this.view.state.doc, fromB, toB, this.decorations, this.dynamicDecorationMap));
      }
      let { i: toI, off: toOff } = cursor.findPos(toA, 1);
      let { i: fromI, off: fromOff } = cursor.findPos(fromA, -1);
      replaceRange(this, fromI, fromOff, toI, toOff, content2, breakAtStart, openStart, openEnd);
    }
    if (composition)
      this.fixCompositionDOM(composition);
  }
  compositionView(composition) {
    let cur = new TextView(composition.text.nodeValue);
    cur.flags |= 8;
    for (let { deco } of composition.marks)
      cur = new MarkView(deco, [cur], cur.length);
    let line = new LineView();
    line.append(cur, 0);
    return line;
  }
  fixCompositionDOM(composition) {
    let fix = (dom, cView2) => {
      cView2.flags |= 8 | (cView2.children.some((c) => c.flags & 7) ? 1 : 0);
      this.markedForComposition.add(cView2);
      let prev = ContentView.get(dom);
      if (prev && prev != cView2)
        prev.dom = null;
      cView2.setDOM(dom);
    };
    let pos = this.childPos(composition.range.fromB, 1);
    let cView = this.children[pos.i];
    fix(composition.line, cView);
    for (let i = composition.marks.length - 1; i >= -1; i--) {
      pos = cView.childPos(pos.off, 1);
      cView = cView.children[pos.i];
      fix(i >= 0 ? composition.marks[i].node : composition.text, cView);
    }
  }
  updateSelection(mustRead = false, fromPointer = false) {
    if (mustRead || !this.view.observer.selectionRange.focusNode)
      this.view.observer.readSelectionRange();
    let activeElt = this.view.root.activeElement, focused = activeElt == this.dom;
    let selectionNotFocus = !focused && hasSelection(this.dom, this.view.observer.selectionRange) && !(activeElt && this.dom.contains(activeElt));
    if (!(focused || fromPointer || selectionNotFocus))
      return;
    let force = this.forceSelection;
    this.forceSelection = false;
    let main = this.view.state.selection.main;
    let anchor = this.moveToLine(this.domAtPos(main.anchor));
    let head = main.empty ? anchor : this.moveToLine(this.domAtPos(main.head));
    if (browser.gecko && main.empty && !this.hasComposition && betweenUneditable(anchor)) {
      let dummy = document.createTextNode("");
      this.view.observer.ignore(() => anchor.node.insertBefore(dummy, anchor.node.childNodes[anchor.offset] || null));
      anchor = head = new DOMPos(dummy, 0);
      force = true;
    }
    let domSel = this.view.observer.selectionRange;
    if (force || !domSel.focusNode || (!isEquivalentPosition(anchor.node, anchor.offset, domSel.anchorNode, domSel.anchorOffset) || !isEquivalentPosition(head.node, head.offset, domSel.focusNode, domSel.focusOffset)) && !this.suppressWidgetCursorChange(domSel, main)) {
      this.view.observer.ignore(() => {
        if (browser.android && browser.chrome && this.dom.contains(domSel.focusNode) && inUneditable(domSel.focusNode, this.dom)) {
          this.dom.blur();
          this.dom.focus({ preventScroll: true });
        }
        let rawSel = getSelection(this.view.root);
        if (!rawSel)
          ;
        else if (main.empty) {
          if (browser.gecko) {
            let nextTo = nextToUneditable(anchor.node, anchor.offset);
            if (nextTo && nextTo != (1 | 2)) {
              let text = (nextTo == 1 ? textNodeBefore : textNodeAfter)(anchor.node, anchor.offset);
              if (text)
                anchor = new DOMPos(text.node, text.offset);
            }
          }
          rawSel.collapse(anchor.node, anchor.offset);
          if (main.bidiLevel != null && rawSel.caretBidiLevel !== void 0)
            rawSel.caretBidiLevel = main.bidiLevel;
        } else if (rawSel.extend) {
          rawSel.collapse(anchor.node, anchor.offset);
          try {
            rawSel.extend(head.node, head.offset);
          } catch (_) {
          }
        } else {
          let range = document.createRange();
          if (main.anchor > main.head)
            [anchor, head] = [head, anchor];
          range.setEnd(head.node, head.offset);
          range.setStart(anchor.node, anchor.offset);
          rawSel.removeAllRanges();
          rawSel.addRange(range);
        }
        if (selectionNotFocus && this.view.root.activeElement == this.dom) {
          this.dom.blur();
          if (activeElt)
            activeElt.focus();
        }
      });
      this.view.observer.setSelectionRange(anchor, head);
    }
    this.impreciseAnchor = anchor.precise ? null : new DOMPos(domSel.anchorNode, domSel.anchorOffset);
    this.impreciseHead = head.precise ? null : new DOMPos(domSel.focusNode, domSel.focusOffset);
  }
  suppressWidgetCursorChange(sel, cursor) {
    return this.hasComposition && cursor.empty && !this.compositionBarrier.size && isEquivalentPosition(sel.focusNode, sel.focusOffset, sel.anchorNode, sel.anchorOffset) && this.posFromDOM(sel.focusNode, sel.focusOffset) == cursor.head;
  }
  enforceCursorAssoc() {
    if (this.hasComposition)
      return;
    let { view } = this, cursor = view.state.selection.main;
    let sel = getSelection(view.root);
    let { anchorNode, anchorOffset } = view.observer.selectionRange;
    if (!sel || !cursor.empty || !cursor.assoc || !sel.modify)
      return;
    let line = LineView.find(this, cursor.head);
    if (!line)
      return;
    let lineStart = line.posAtStart;
    if (cursor.head == lineStart || cursor.head == lineStart + line.length)
      return;
    let before = this.coordsAt(cursor.head, -1), after = this.coordsAt(cursor.head, 1);
    if (!before || !after || before.bottom > after.top)
      return;
    let dom = this.domAtPos(cursor.head + cursor.assoc);
    sel.collapse(dom.node, dom.offset);
    sel.modify("move", cursor.assoc < 0 ? "forward" : "backward", "lineboundary");
    view.observer.readSelectionRange();
    let newRange = view.observer.selectionRange;
    if (view.docView.posFromDOM(newRange.anchorNode, newRange.anchorOffset) != cursor.from)
      sel.collapse(anchorNode, anchorOffset);
  }
  moveToLine(pos) {
    let dom = this.dom, newPos;
    if (pos.node != dom)
      return pos;
    for (let i = pos.offset; !newPos && i < dom.childNodes.length; i++) {
      let view = ContentView.get(dom.childNodes[i]);
      if (view instanceof LineView)
        newPos = view.domAtPos(0);
    }
    for (let i = pos.offset - 1; !newPos && i >= 0; i--) {
      let view = ContentView.get(dom.childNodes[i]);
      if (view instanceof LineView)
        newPos = view.domAtPos(view.length);
    }
    return newPos ? new DOMPos(newPos.node, newPos.offset, true) : pos;
  }
  nearest(dom) {
    for (let cur = dom; cur; ) {
      let domView = ContentView.get(cur);
      if (domView && domView.rootView == this)
        return domView;
      cur = cur.parentNode;
    }
    return null;
  }
  posFromDOM(node, offset) {
    let view = this.nearest(node);
    if (!view)
      throw new RangeError("Trying to find position for a DOM position outside of the document");
    return view.localPosFromDOM(node, offset) + view.posAtStart;
  }
  domAtPos(pos) {
    let { i, off } = this.childCursor().findPos(pos, -1);
    for (; i < this.children.length - 1; ) {
      let child = this.children[i];
      if (off < child.length || child instanceof LineView)
        break;
      i++;
      off = 0;
    }
    return this.children[i].domAtPos(off);
  }
  coordsAt(pos, side) {
    let best = null, bestPos = 0;
    for (let off = this.length, i = this.children.length - 1; i >= 0; i--) {
      let child = this.children[i], end = off - child.breakAfter, start = end - child.length;
      if (end < pos)
        break;
      if (start <= pos && (start < pos || child.covers(-1)) && (end > pos || child.covers(1)) && (!best || child instanceof LineView && !(best instanceof LineView && side >= 0))) {
        best = child;
        bestPos = start;
      }
      off = start;
    }
    return best ? best.coordsAt(pos - bestPos, side) : null;
  }
  coordsForChar(pos) {
    let { i, off } = this.childPos(pos, 1), child = this.children[i];
    if (!(child instanceof LineView))
      return null;
    while (child.children.length) {
      let { i: i2, off: childOff } = child.childPos(off, 1);
      for (; ; i2++) {
        if (i2 == child.children.length)
          return null;
        if ((child = child.children[i2]).length)
          break;
      }
      off = childOff;
    }
    if (!(child instanceof TextView))
      return null;
    let end = findClusterBreak(child.text, off);
    if (end == off)
      return null;
    let rects = textRange(child.dom, off, end).getClientRects();
    for (let i2 = 0; i2 < rects.length; i2++) {
      let rect = rects[i2];
      if (i2 == rects.length - 1 || rect.top < rect.bottom && rect.left < rect.right)
        return rect;
    }
    return null;
  }
  measureVisibleLineHeights(viewport) {
    let result = [], { from, to } = viewport;
    let contentWidth = this.view.contentDOM.clientWidth;
    let isWider = contentWidth > Math.max(this.view.scrollDOM.clientWidth, this.minWidth) + 1;
    let widest = -1, ltr = this.view.textDirection == Direction.LTR;
    for (let pos = 0, i = 0; i < this.children.length; i++) {
      let child = this.children[i], end = pos + child.length;
      if (end > to)
        break;
      if (pos >= from) {
        let childRect = child.dom.getBoundingClientRect();
        result.push(childRect.height);
        if (isWider) {
          let last = child.dom.lastChild;
          let rects = last ? clientRectsFor(last) : [];
          if (rects.length) {
            let rect = rects[rects.length - 1];
            let width = ltr ? rect.right - childRect.left : childRect.right - rect.left;
            if (width > widest) {
              widest = width;
              this.minWidth = contentWidth;
              this.minWidthFrom = pos;
              this.minWidthTo = end;
            }
          }
        }
      }
      pos = end + child.breakAfter;
    }
    return result;
  }
  textDirectionAt(pos) {
    let { i } = this.childPos(pos, 1);
    return getComputedStyle(this.children[i].dom).direction == "rtl" ? Direction.RTL : Direction.LTR;
  }
  measureTextSize() {
    for (let child of this.children) {
      if (child instanceof LineView) {
        let measure = child.measureTextSize();
        if (measure)
          return measure;
      }
    }
    let dummy = document.createElement("div"), lineHeight, charWidth, textHeight;
    dummy.className = "cm-line";
    dummy.style.width = "99999px";
    dummy.style.position = "absolute";
    dummy.textContent = "abc def ghi jkl mno pqr stu";
    this.view.observer.ignore(() => {
      this.dom.appendChild(dummy);
      let rect = clientRectsFor(dummy.firstChild)[0];
      lineHeight = dummy.getBoundingClientRect().height;
      charWidth = rect ? rect.width / 27 : 7;
      textHeight = rect ? rect.height : lineHeight;
      dummy.remove();
    });
    return { lineHeight, charWidth, textHeight };
  }
  childCursor(pos = this.length) {
    let i = this.children.length;
    if (i)
      pos -= this.children[--i].length;
    return new ChildCursor(this.children, pos, i);
  }
  computeBlockGapDeco() {
    let deco = [], vs = this.view.viewState;
    for (let pos = 0, i = 0; ; i++) {
      let next = i == vs.viewports.length ? null : vs.viewports[i];
      let end = next ? next.from - 1 : this.length;
      if (end > pos) {
        let height = (vs.lineBlockAt(end).bottom - vs.lineBlockAt(pos).top) / this.view.scaleY;
        deco.push(Decoration.replace({
          widget: new BlockGapWidget(height),
          block: true,
          inclusive: true,
          isBlockGap: true
        }).range(pos, end));
      }
      if (!next)
        break;
      pos = next.to + 1;
    }
    return Decoration.set(deco);
  }
  updateDeco() {
    let i = 1;
    let allDeco = this.view.state.facet(decorations).map((d) => {
      let dynamic = this.dynamicDecorationMap[i++] = typeof d == "function";
      return dynamic ? d(this.view) : d;
    });
    let dynamicOuter = false, outerDeco = this.view.state.facet(outerDecorations).map((d, i2) => {
      let dynamic = typeof d == "function";
      if (dynamic)
        dynamicOuter = true;
      return dynamic ? d(this.view) : d;
    });
    if (outerDeco.length) {
      this.dynamicDecorationMap[i++] = dynamicOuter;
      allDeco.push(RangeSet.join(outerDeco));
    }
    this.decorations = [
      this.compositionBarrier,
      ...allDeco,
      this.computeBlockGapDeco(),
      this.view.viewState.lineGapDeco
    ];
    while (i < this.decorations.length)
      this.dynamicDecorationMap[i++] = false;
    return this.decorations;
  }
  maybeCreateCompositionBarrier() {
    let { main: { head, empty } } = this.view.state.selection;
    if (!empty)
      return false;
    let found = null;
    for (let set of this.decorations) {
      set.between(head, head, (from, to, value) => {
        if (value.point)
          found = false;
        else if (value.endSide < 0 && from < head && to == head)
          found = true;
      });
      if (found === false)
        break;
    }
    this.compositionBarrier = found ? Decoration.set(compositionBarrierWidget.range(head)) : Decoration.none;
    return !!found;
  }
  clearCompositionBarrier() {
    this.compositionBarrier = Decoration.none;
  }
  scrollIntoView(target) {
    if (target.isSnapshot) {
      let ref = this.view.viewState.lineBlockAt(target.range.head);
      this.view.scrollDOM.scrollTop = ref.top - target.yMargin;
      this.view.scrollDOM.scrollLeft = target.xMargin;
      return;
    }
    for (let handler of this.view.state.facet(scrollHandler)) {
      try {
        if (handler(this.view, target.range, target))
          return true;
      } catch (e) {
        logException(this.view.state, e, "scroll handler");
      }
    }
    let { range } = target;
    let rect = this.coordsAt(range.head, range.empty ? range.assoc : range.head > range.anchor ? -1 : 1), other;
    if (!rect)
      return;
    if (!range.empty && (other = this.coordsAt(range.anchor, range.anchor > range.head ? -1 : 1)))
      rect = {
        left: Math.min(rect.left, other.left),
        top: Math.min(rect.top, other.top),
        right: Math.max(rect.right, other.right),
        bottom: Math.max(rect.bottom, other.bottom)
      };
    let margins = getScrollMargins(this.view);
    let targetRect = {
      left: rect.left - margins.left,
      top: rect.top - margins.top,
      right: rect.right + margins.right,
      bottom: rect.bottom + margins.bottom
    };
    let { offsetWidth, offsetHeight } = this.view.scrollDOM;
    scrollRectIntoView(this.view.scrollDOM, targetRect, range.head < range.anchor ? -1 : 1, target.x, target.y, Math.max(Math.min(target.xMargin, offsetWidth), -offsetWidth), Math.max(Math.min(target.yMargin, offsetHeight), -offsetHeight), this.view.textDirection == Direction.LTR);
  }
};
var compositionBarrierWidget = /* @__PURE__ */ Decoration.widget({ side: -1, widget: NullWidget.inline });
function betweenUneditable(pos) {
  return pos.node.nodeType == 1 && pos.node.firstChild && (pos.offset == 0 || pos.node.childNodes[pos.offset - 1].contentEditable == "false") && (pos.offset == pos.node.childNodes.length || pos.node.childNodes[pos.offset].contentEditable == "false");
}
var BlockGapWidget = class extends WidgetType {
  constructor(height) {
    super();
    this.height = height;
  }
  toDOM() {
    let elt2 = document.createElement("div");
    elt2.className = "cm-gap";
    this.updateDOM(elt2);
    return elt2;
  }
  eq(other) {
    return other.height == this.height;
  }
  updateDOM(elt2) {
    elt2.style.height = this.height + "px";
    return true;
  }
  get editable() {
    return true;
  }
  get estimatedHeight() {
    return this.height;
  }
  ignoreEvent() {
    return false;
  }
};
function findCompositionNode(view, headPos) {
  let sel = view.observer.selectionRange;
  if (!sel.focusNode)
    return null;
  let textBefore = textNodeBefore(sel.focusNode, sel.focusOffset);
  let textAfter = textNodeAfter(sel.focusNode, sel.focusOffset);
  let textNode = textBefore || textAfter;
  if (textAfter && textBefore && textAfter.node != textBefore.node) {
    let descAfter = ContentView.get(textAfter.node);
    if (!descAfter || descAfter instanceof TextView && descAfter.text != textAfter.node.nodeValue) {
      textNode = textAfter;
    } else if (view.docView.lastCompositionAfterCursor) {
      let descBefore = ContentView.get(textBefore.node);
      if (!(!descBefore || descBefore instanceof TextView && descBefore.text != textBefore.node.nodeValue))
        textNode = textAfter;
    }
  }
  view.docView.lastCompositionAfterCursor = textNode != textBefore;
  if (!textNode)
    return null;
  let from = headPos - textNode.offset;
  return { from, to: from + textNode.node.nodeValue.length, node: textNode.node };
}
function findCompositionRange(view, changes, headPos) {
  let found = findCompositionNode(view, headPos);
  if (!found)
    return null;
  let { node: textNode, from, to } = found, text = textNode.nodeValue;
  if (/[\n\r]/.test(text))
    return null;
  if (view.state.doc.sliceString(found.from, found.to) != text)
    return null;
  let inv = changes.invertedDesc;
  let range = new ChangedRange(inv.mapPos(from), inv.mapPos(to), from, to);
  let marks2 = [];
  for (let parent = textNode.parentNode; ; parent = parent.parentNode) {
    let parentView = ContentView.get(parent);
    if (parentView instanceof MarkView)
      marks2.push({ node: parent, deco: parentView.mark });
    else if (parentView instanceof LineView || parent.nodeName == "DIV" && parent.parentNode == view.contentDOM)
      return { range, text: textNode, marks: marks2, line: parent };
    else if (parent != view.contentDOM)
      marks2.push({ node: parent, deco: new MarkDecoration({
        inclusive: true,
        attributes: getAttrs(parent),
        tagName: parent.tagName.toLowerCase()
      }) });
    else
      return null;
  }
}
function nextToUneditable(node, offset) {
  if (node.nodeType != 1)
    return 0;
  return (offset && node.childNodes[offset - 1].contentEditable == "false" ? 1 : 0) | (offset < node.childNodes.length && node.childNodes[offset].contentEditable == "false" ? 2 : 0);
}
var DecorationComparator$1 = class DecorationComparator {
  constructor() {
    this.changes = [];
  }
  compareRange(from, to) {
    addRange(from, to, this.changes);
  }
  comparePoint(from, to) {
    addRange(from, to, this.changes);
  }
};
function findChangedDeco(a, b, diff) {
  let comp = new DecorationComparator$1();
  RangeSet.compare(a, b, diff, comp);
  return comp.changes;
}
function inUneditable(node, inside2) {
  for (let cur = node; cur && cur != inside2; cur = cur.assignedSlot || cur.parentNode) {
    if (cur.nodeType == 1 && cur.contentEditable == "false") {
      return true;
    }
  }
  return false;
}
function touchesComposition(changes, composition) {
  let touched = false;
  if (composition)
    changes.iterChangedRanges((from, to) => {
      if (from < composition.to && to > composition.from)
        touched = true;
    });
  return touched;
}
function groupAt(state, pos, bias = 1) {
  let categorize = state.charCategorizer(pos);
  let line = state.doc.lineAt(pos), linePos = pos - line.from;
  if (line.length == 0)
    return EditorSelection.cursor(pos);
  if (linePos == 0)
    bias = 1;
  else if (linePos == line.length)
    bias = -1;
  let from = linePos, to = linePos;
  if (bias < 0)
    from = findClusterBreak(line.text, linePos, false);
  else
    to = findClusterBreak(line.text, linePos);
  let cat = categorize(line.text.slice(from, to));
  while (from > 0) {
    let prev = findClusterBreak(line.text, from, false);
    if (categorize(line.text.slice(prev, from)) != cat)
      break;
    from = prev;
  }
  while (to < line.length) {
    let next = findClusterBreak(line.text, to);
    if (categorize(line.text.slice(to, next)) != cat)
      break;
    to = next;
  }
  return EditorSelection.range(from + line.from, to + line.from);
}
function getdx(x, rect) {
  return rect.left > x ? rect.left - x : Math.max(0, x - rect.right);
}
function getdy(y, rect) {
  return rect.top > y ? rect.top - y : Math.max(0, y - rect.bottom);
}
function yOverlap(a, b) {
  return a.top < b.bottom - 1 && a.bottom > b.top + 1;
}
function upTop(rect, top2) {
  return top2 < rect.top ? { top: top2, left: rect.left, right: rect.right, bottom: rect.bottom } : rect;
}
function upBot(rect, bottom) {
  return bottom > rect.bottom ? { top: rect.top, left: rect.left, right: rect.right, bottom } : rect;
}
function domPosAtCoords(parent, x, y) {
  let closest, closestRect, closestX, closestY, closestOverlap = false;
  let above, below, aboveRect, belowRect;
  for (let child = parent.firstChild; child; child = child.nextSibling) {
    let rects = clientRectsFor(child);
    for (let i = 0; i < rects.length; i++) {
      let rect = rects[i];
      if (closestRect && yOverlap(closestRect, rect))
        rect = upTop(upBot(rect, closestRect.bottom), closestRect.top);
      let dx = getdx(x, rect), dy = getdy(y, rect);
      if (dx == 0 && dy == 0)
        return child.nodeType == 3 ? domPosInText(child, x, y) : domPosAtCoords(child, x, y);
      if (!closest || closestY > dy || closestY == dy && closestX > dx) {
        closest = child;
        closestRect = rect;
        closestX = dx;
        closestY = dy;
        let side = dy ? y < rect.top ? -1 : 1 : dx ? x < rect.left ? -1 : 1 : 0;
        closestOverlap = !side || (side > 0 ? i < rects.length - 1 : i > 0);
      }
      if (dx == 0) {
        if (y > rect.bottom && (!aboveRect || aboveRect.bottom < rect.bottom)) {
          above = child;
          aboveRect = rect;
        } else if (y < rect.top && (!belowRect || belowRect.top > rect.top)) {
          below = child;
          belowRect = rect;
        }
      } else if (aboveRect && yOverlap(aboveRect, rect)) {
        aboveRect = upBot(aboveRect, rect.bottom);
      } else if (belowRect && yOverlap(belowRect, rect)) {
        belowRect = upTop(belowRect, rect.top);
      }
    }
  }
  if (aboveRect && aboveRect.bottom >= y) {
    closest = above;
    closestRect = aboveRect;
  } else if (belowRect && belowRect.top <= y) {
    closest = below;
    closestRect = belowRect;
  }
  if (!closest)
    return { node: parent, offset: 0 };
  let clipX = Math.max(closestRect.left, Math.min(closestRect.right, x));
  if (closest.nodeType == 3)
    return domPosInText(closest, clipX, y);
  if (closestOverlap && closest.contentEditable != "false")
    return domPosAtCoords(closest, clipX, y);
  let offset = Array.prototype.indexOf.call(parent.childNodes, closest) + (x >= (closestRect.left + closestRect.right) / 2 ? 1 : 0);
  return { node: parent, offset };
}
function domPosInText(node, x, y) {
  let len = node.nodeValue.length;
  let closestOffset = -1, closestDY = 1e9, generalSide = 0;
  for (let i = 0; i < len; i++) {
    let rects = textRange(node, i, i + 1).getClientRects();
    for (let j = 0; j < rects.length; j++) {
      let rect = rects[j];
      if (rect.top == rect.bottom)
        continue;
      if (!generalSide)
        generalSide = x - rect.left;
      let dy = (rect.top > y ? rect.top - y : y - rect.bottom) - 1;
      if (rect.left - 1 <= x && rect.right + 1 >= x && dy < closestDY) {
        let right = x >= (rect.left + rect.right) / 2, after = right;
        if (browser.chrome || browser.gecko) {
          let rectBefore = textRange(node, i).getBoundingClientRect();
          if (rectBefore.left == rect.right)
            after = !right;
        }
        if (dy <= 0)
          return { node, offset: i + (after ? 1 : 0) };
        closestOffset = i + (after ? 1 : 0);
        closestDY = dy;
      }
    }
  }
  return { node, offset: closestOffset > -1 ? closestOffset : generalSide > 0 ? node.nodeValue.length : 0 };
}
function posAtCoords(view, coords, precise, bias = -1) {
  var _a2, _b;
  let content2 = view.contentDOM.getBoundingClientRect(), docTop = content2.top + view.viewState.paddingTop;
  let block, { docHeight } = view.viewState;
  let { x, y } = coords, yOffset = y - docTop;
  if (yOffset < 0)
    return 0;
  if (yOffset > docHeight)
    return view.state.doc.length;
  for (let halfLine = view.viewState.heightOracle.textHeight / 2, bounced = false; ; ) {
    block = view.elementAtHeight(yOffset);
    if (block.type == BlockType.Text)
      break;
    for (; ; ) {
      yOffset = bias > 0 ? block.bottom + halfLine : block.top - halfLine;
      if (yOffset >= 0 && yOffset <= docHeight)
        break;
      if (bounced)
        return precise ? null : 0;
      bounced = true;
      bias = -bias;
    }
  }
  y = docTop + yOffset;
  let lineStart = block.from;
  if (lineStart < view.viewport.from)
    return view.viewport.from == 0 ? 0 : precise ? null : posAtCoordsImprecise(view, content2, block, x, y);
  if (lineStart > view.viewport.to)
    return view.viewport.to == view.state.doc.length ? view.state.doc.length : precise ? null : posAtCoordsImprecise(view, content2, block, x, y);
  let doc2 = view.dom.ownerDocument;
  let root = view.root.elementFromPoint ? view.root : doc2;
  let element = root.elementFromPoint(x, y);
  if (element && !view.contentDOM.contains(element))
    element = null;
  if (!element) {
    x = Math.max(content2.left + 1, Math.min(content2.right - 1, x));
    element = root.elementFromPoint(x, y);
    if (element && !view.contentDOM.contains(element))
      element = null;
  }
  let node, offset = -1;
  if (element && ((_a2 = view.docView.nearest(element)) === null || _a2 === void 0 ? void 0 : _a2.isEditable) != false) {
    if (doc2.caretPositionFromPoint) {
      let pos = doc2.caretPositionFromPoint(x, y);
      if (pos)
        ({ offsetNode: node, offset } = pos);
    } else if (doc2.caretRangeFromPoint) {
      let range = doc2.caretRangeFromPoint(x, y);
      if (range) {
        ({ startContainer: node, startOffset: offset } = range);
        if (!view.contentDOM.contains(node) || browser.safari && isSuspiciousSafariCaretResult(node, offset, x) || browser.chrome && isSuspiciousChromeCaretResult(node, offset, x))
          node = void 0;
      }
    }
  }
  if (!node || !view.docView.dom.contains(node)) {
    let line = LineView.find(view.docView, lineStart);
    if (!line)
      return yOffset > block.top + block.height / 2 ? block.to : block.from;
    ({ node, offset } = domPosAtCoords(line.dom, x, y));
  }
  let nearest = view.docView.nearest(node);
  if (!nearest)
    return null;
  if (nearest.isWidget && ((_b = nearest.dom) === null || _b === void 0 ? void 0 : _b.nodeType) == 1) {
    let rect = nearest.dom.getBoundingClientRect();
    return coords.y < rect.top || coords.y <= rect.bottom && coords.x <= (rect.left + rect.right) / 2 ? nearest.posAtStart : nearest.posAtEnd;
  } else {
    return nearest.localPosFromDOM(node, offset) + nearest.posAtStart;
  }
}
function posAtCoordsImprecise(view, contentRect, block, x, y) {
  let into = Math.round((x - contentRect.left) * view.defaultCharacterWidth);
  if (view.lineWrapping && block.height > view.defaultLineHeight * 1.5) {
    let textHeight = view.viewState.heightOracle.textHeight;
    let line = Math.floor((y - block.top - (view.defaultLineHeight - textHeight) * 0.5) / textHeight);
    into += line * view.viewState.heightOracle.lineLength;
  }
  let content2 = view.state.sliceDoc(block.from, block.to);
  return block.from + findColumn(content2, into, view.state.tabSize);
}
function isSuspiciousSafariCaretResult(node, offset, x) {
  let len;
  if (node.nodeType != 3 || offset != (len = node.nodeValue.length))
    return false;
  for (let next = node.nextSibling; next; next = next.nextSibling)
    if (next.nodeType != 1 || next.nodeName != "BR")
      return false;
  return textRange(node, len - 1, len).getBoundingClientRect().left > x;
}
function isSuspiciousChromeCaretResult(node, offset, x) {
  if (offset != 0)
    return false;
  for (let cur = node; ; ) {
    let parent = cur.parentNode;
    if (!parent || parent.nodeType != 1 || parent.firstChild != cur)
      return false;
    if (parent.classList.contains("cm-line"))
      break;
    cur = parent;
  }
  let rect = node.nodeType == 1 ? node.getBoundingClientRect() : textRange(node, 0, Math.max(node.nodeValue.length, 1)).getBoundingClientRect();
  return x - rect.left > 5;
}
function blockAt(view, pos) {
  let line = view.lineBlockAt(pos);
  if (Array.isArray(line.type))
    for (let l of line.type) {
      if (l.to > pos || l.to == pos && (l.to == line.to || l.type == BlockType.Text))
        return l;
    }
  return line;
}
function moveToLineBoundary(view, start, forward, includeWrap) {
  let line = blockAt(view, start.head);
  let coords = !includeWrap || line.type != BlockType.Text || !(view.lineWrapping || line.widgetLineBreaks) ? null : view.coordsAtPos(start.assoc < 0 && start.head > line.from ? start.head - 1 : start.head);
  if (coords) {
    let editorRect = view.dom.getBoundingClientRect();
    let direction = view.textDirectionAt(line.from);
    let pos = view.posAtCoords({
      x: forward == (direction == Direction.LTR) ? editorRect.right - 1 : editorRect.left + 1,
      y: (coords.top + coords.bottom) / 2
    });
    if (pos != null)
      return EditorSelection.cursor(pos, forward ? -1 : 1);
  }
  return EditorSelection.cursor(forward ? line.to : line.from, forward ? -1 : 1);
}
function moveByChar(view, start, forward, by) {
  let line = view.state.doc.lineAt(start.head), spans = view.bidiSpans(line);
  let direction = view.textDirectionAt(line.from);
  for (let cur = start, check = null; ; ) {
    let next = moveVisually(line, spans, direction, cur, forward), char = movedOver;
    if (!next) {
      if (line.number == (forward ? view.state.doc.lines : 1))
        return cur;
      char = "\n";
      line = view.state.doc.line(line.number + (forward ? 1 : -1));
      spans = view.bidiSpans(line);
      next = view.visualLineSide(line, !forward);
    }
    if (!check) {
      if (!by)
        return next;
      check = by(char);
    } else if (!check(char)) {
      return cur;
    }
    cur = next;
  }
}
function byGroup(view, pos, start) {
  let categorize = view.state.charCategorizer(pos);
  let cat = categorize(start);
  return (next) => {
    let nextCat = categorize(next);
    if (cat == CharCategory.Space)
      cat = nextCat;
    return cat == nextCat;
  };
}
function moveVertically(view, start, forward, distance) {
  let startPos = start.head, dir = forward ? 1 : -1;
  if (startPos == (forward ? view.state.doc.length : 0))
    return EditorSelection.cursor(startPos, start.assoc);
  let goal = start.goalColumn, startY;
  let rect = view.contentDOM.getBoundingClientRect();
  let startCoords = view.coordsAtPos(startPos, start.assoc || -1), docTop = view.documentTop;
  if (startCoords) {
    if (goal == null)
      goal = startCoords.left - rect.left;
    startY = dir < 0 ? startCoords.top : startCoords.bottom;
  } else {
    let line = view.viewState.lineBlockAt(startPos);
    if (goal == null)
      goal = Math.min(rect.right - rect.left, view.defaultCharacterWidth * (startPos - line.from));
    startY = (dir < 0 ? line.top : line.bottom) + docTop;
  }
  let resolvedGoal = rect.left + goal;
  let dist2 = distance !== null && distance !== void 0 ? distance : view.viewState.heightOracle.textHeight >> 1;
  for (let extra = 0; ; extra += 10) {
    let curY = startY + (dist2 + extra) * dir;
    let pos = posAtCoords(view, { x: resolvedGoal, y: curY }, false, dir);
    if (curY < rect.top || curY > rect.bottom || (dir < 0 ? pos < startPos : pos > startPos)) {
      let charRect = view.docView.coordsForChar(pos);
      let assoc = !charRect || curY < charRect.top ? -1 : 1;
      return EditorSelection.cursor(pos, assoc, void 0, goal);
    }
  }
}
function skipAtomicRanges(atoms, pos, bias) {
  for (; ; ) {
    let moved = 0;
    for (let set of atoms) {
      set.between(pos - 1, pos + 1, (from, to, value) => {
        if (pos > from && pos < to) {
          let side = moved || bias || (pos - from < to - pos ? -1 : 1);
          pos = side < 0 ? from : to;
          moved = side;
        }
      });
    }
    if (!moved)
      return pos;
  }
}
function skipAtoms(view, oldPos, pos) {
  let newPos = skipAtomicRanges(view.state.facet(atomicRanges).map((f) => f(view)), pos.from, oldPos.head > pos.from ? -1 : 1);
  return newPos == pos.from ? pos : EditorSelection.cursor(newPos, newPos < pos.from ? 1 : -1);
}
var InputState = class {
  setSelectionOrigin(origin) {
    this.lastSelectionOrigin = origin;
    this.lastSelectionTime = Date.now();
  }
  constructor(view) {
    this.view = view;
    this.lastKeyCode = 0;
    this.lastKeyTime = 0;
    this.lastTouchTime = 0;
    this.lastFocusTime = 0;
    this.lastScrollTop = 0;
    this.lastScrollLeft = 0;
    this.pendingIOSKey = void 0;
    this.lastSelectionOrigin = null;
    this.lastSelectionTime = 0;
    this.lastEscPress = 0;
    this.lastContextMenu = 0;
    this.scrollHandlers = [];
    this.handlers = Object.create(null);
    this.composing = -1;
    this.compositionFirstChange = null;
    this.compositionEndedAt = 0;
    this.compositionPendingKey = false;
    this.compositionPendingChange = false;
    this.mouseSelection = null;
    this.draggedContent = null;
    this.handleEvent = this.handleEvent.bind(this);
    this.notifiedFocused = view.hasFocus;
    if (browser.safari)
      view.contentDOM.addEventListener("input", () => null);
    if (browser.gecko)
      firefoxCopyCutHack(view.contentDOM.ownerDocument);
  }
  handleEvent(event) {
    if (!eventBelongsToEditor(this.view, event) || this.ignoreDuringComposition(event))
      return;
    if (event.type == "keydown" && this.keydown(event))
      return;
    this.runHandlers(event.type, event);
  }
  runHandlers(type, event) {
    let handlers2 = this.handlers[type];
    if (handlers2) {
      for (let observer of handlers2.observers)
        observer(this.view, event);
      for (let handler of handlers2.handlers) {
        if (event.defaultPrevented)
          break;
        if (handler(this.view, event)) {
          event.preventDefault();
          break;
        }
      }
    }
  }
  ensureHandlers(plugins) {
    let handlers2 = computeHandlers(plugins), prev = this.handlers, dom = this.view.contentDOM;
    for (let type in handlers2)
      if (type != "scroll") {
        let passive = !handlers2[type].handlers.length;
        let exists = prev[type];
        if (exists && passive != !exists.handlers.length) {
          dom.removeEventListener(type, this.handleEvent);
          exists = null;
        }
        if (!exists)
          dom.addEventListener(type, this.handleEvent, { passive });
      }
    for (let type in prev)
      if (type != "scroll" && !handlers2[type])
        dom.removeEventListener(type, this.handleEvent);
    this.handlers = handlers2;
  }
  keydown(event) {
    this.lastKeyCode = event.keyCode;
    this.lastKeyTime = Date.now();
    if (event.keyCode == 9 && Date.now() < this.lastEscPress + 2e3)
      return true;
    if (event.keyCode != 27 && modifierCodes.indexOf(event.keyCode) < 0)
      this.view.inputState.lastEscPress = 0;
    if (browser.android && browser.chrome && !event.synthetic && (event.keyCode == 13 || event.keyCode == 8)) {
      this.view.observer.delayAndroidKey(event.key, event.keyCode);
      return true;
    }
    let pending;
    if (browser.ios && !event.synthetic && !event.altKey && !event.metaKey && ((pending = PendingKeys.find((key) => key.keyCode == event.keyCode)) && !event.ctrlKey || EmacsyPendingKeys.indexOf(event.key) > -1 && event.ctrlKey && !event.shiftKey)) {
      this.pendingIOSKey = pending || event;
      setTimeout(() => this.flushIOSKey(), 250);
      return true;
    }
    if (event.keyCode != 229)
      this.view.observer.forceFlush();
    return false;
  }
  flushIOSKey(change) {
    let key = this.pendingIOSKey;
    if (!key)
      return false;
    if (key.key == "Enter" && change && change.from < change.to && /^\S+$/.test(change.insert.toString()))
      return false;
    this.pendingIOSKey = void 0;
    return dispatchKey(this.view.contentDOM, key.key, key.keyCode, key instanceof KeyboardEvent ? key : void 0);
  }
  ignoreDuringComposition(event) {
    if (!/^key/.test(event.type))
      return false;
    if (this.composing > 0)
      return true;
    if (browser.safari && !browser.ios && this.compositionPendingKey && Date.now() - this.compositionEndedAt < 100) {
      this.compositionPendingKey = false;
      return true;
    }
    return false;
  }
  startMouseSelection(mouseSelection) {
    if (this.mouseSelection)
      this.mouseSelection.destroy();
    this.mouseSelection = mouseSelection;
  }
  update(update) {
    if (this.mouseSelection)
      this.mouseSelection.update(update);
    if (this.draggedContent && update.docChanged)
      this.draggedContent = this.draggedContent.map(update.changes);
    if (update.transactions.length)
      this.lastKeyCode = this.lastSelectionTime = 0;
  }
  destroy() {
    if (this.mouseSelection)
      this.mouseSelection.destroy();
  }
};
function bindHandler(plugin, handler) {
  return (view, event) => {
    try {
      return handler.call(plugin, event, view);
    } catch (e) {
      logException(view.state, e);
    }
  };
}
function computeHandlers(plugins) {
  let result = Object.create(null);
  function record(type) {
    return result[type] || (result[type] = { observers: [], handlers: [] });
  }
  for (let plugin of plugins) {
    let spec = plugin.spec;
    if (spec && spec.domEventHandlers)
      for (let type in spec.domEventHandlers) {
        let f = spec.domEventHandlers[type];
        if (f)
          record(type).handlers.push(bindHandler(plugin.value, f));
      }
    if (spec && spec.domEventObservers)
      for (let type in spec.domEventObservers) {
        let f = spec.domEventObservers[type];
        if (f)
          record(type).observers.push(bindHandler(plugin.value, f));
      }
  }
  for (let type in handlers)
    record(type).handlers.push(handlers[type]);
  for (let type in observers)
    record(type).observers.push(observers[type]);
  return result;
}
var PendingKeys = [
  { key: "Backspace", keyCode: 8, inputType: "deleteContentBackward" },
  { key: "Enter", keyCode: 13, inputType: "insertParagraph" },
  { key: "Enter", keyCode: 13, inputType: "insertLineBreak" },
  { key: "Delete", keyCode: 46, inputType: "deleteContentForward" }
];
var EmacsyPendingKeys = "dthko";
var modifierCodes = [16, 17, 18, 20, 91, 92, 224, 225];
var dragScrollMargin = 6;
function dragScrollSpeed(dist2) {
  return Math.max(0, dist2) * 0.7 + 8;
}
function dist(a, b) {
  return Math.max(Math.abs(a.clientX - b.clientX), Math.abs(a.clientY - b.clientY));
}
var MouseSelection = class {
  constructor(view, startEvent, style, mustSelect) {
    this.view = view;
    this.startEvent = startEvent;
    this.style = style;
    this.mustSelect = mustSelect;
    this.scrollSpeed = { x: 0, y: 0 };
    this.scrolling = -1;
    this.lastEvent = startEvent;
    this.scrollParent = scrollableParent(view.contentDOM);
    this.atoms = view.state.facet(atomicRanges).map((f) => f(view));
    let doc2 = view.contentDOM.ownerDocument;
    doc2.addEventListener("mousemove", this.move = this.move.bind(this));
    doc2.addEventListener("mouseup", this.up = this.up.bind(this));
    this.extend = startEvent.shiftKey;
    this.multiple = view.state.facet(EditorState.allowMultipleSelections) && addsSelectionRange(view, startEvent);
    this.dragging = isInPrimarySelection(view, startEvent) && getClickType(startEvent) == 1 ? null : false;
  }
  start(event) {
    if (this.dragging === false)
      this.select(event);
  }
  move(event) {
    var _a2;
    if (event.buttons == 0)
      return this.destroy();
    if (this.dragging || this.dragging == null && dist(this.startEvent, event) < 10)
      return;
    this.select(this.lastEvent = event);
    let sx = 0, sy = 0;
    let rect = ((_a2 = this.scrollParent) === null || _a2 === void 0 ? void 0 : _a2.getBoundingClientRect()) || { left: 0, top: 0, right: this.view.win.innerWidth, bottom: this.view.win.innerHeight };
    let margins = getScrollMargins(this.view);
    if (event.clientX - margins.left <= rect.left + dragScrollMargin)
      sx = -dragScrollSpeed(rect.left - event.clientX);
    else if (event.clientX + margins.right >= rect.right - dragScrollMargin)
      sx = dragScrollSpeed(event.clientX - rect.right);
    if (event.clientY - margins.top <= rect.top + dragScrollMargin)
      sy = -dragScrollSpeed(rect.top - event.clientY);
    else if (event.clientY + margins.bottom >= rect.bottom - dragScrollMargin)
      sy = dragScrollSpeed(event.clientY - rect.bottom);
    this.setScrollSpeed(sx, sy);
  }
  up(event) {
    if (this.dragging == null)
      this.select(this.lastEvent);
    if (!this.dragging)
      event.preventDefault();
    this.destroy();
  }
  destroy() {
    this.setScrollSpeed(0, 0);
    let doc2 = this.view.contentDOM.ownerDocument;
    doc2.removeEventListener("mousemove", this.move);
    doc2.removeEventListener("mouseup", this.up);
    this.view.inputState.mouseSelection = this.view.inputState.draggedContent = null;
  }
  setScrollSpeed(sx, sy) {
    this.scrollSpeed = { x: sx, y: sy };
    if (sx || sy) {
      if (this.scrolling < 0)
        this.scrolling = setInterval(() => this.scroll(), 50);
    } else if (this.scrolling > -1) {
      clearInterval(this.scrolling);
      this.scrolling = -1;
    }
  }
  scroll() {
    if (this.scrollParent) {
      this.scrollParent.scrollLeft += this.scrollSpeed.x;
      this.scrollParent.scrollTop += this.scrollSpeed.y;
    } else {
      this.view.win.scrollBy(this.scrollSpeed.x, this.scrollSpeed.y);
    }
    if (this.dragging === false)
      this.select(this.lastEvent);
  }
  skipAtoms(sel) {
    let ranges = null;
    for (let i = 0; i < sel.ranges.length; i++) {
      let range = sel.ranges[i], updated = null;
      if (range.empty) {
        let pos = skipAtomicRanges(this.atoms, range.from, 0);
        if (pos != range.from)
          updated = EditorSelection.cursor(pos, -1);
      } else {
        let from = skipAtomicRanges(this.atoms, range.from, -1);
        let to = skipAtomicRanges(this.atoms, range.to, 1);
        if (from != range.from || to != range.to)
          updated = EditorSelection.range(range.from == range.anchor ? from : to, range.from == range.head ? from : to);
      }
      if (updated) {
        if (!ranges)
          ranges = sel.ranges.slice();
        ranges[i] = updated;
      }
    }
    return ranges ? EditorSelection.create(ranges, sel.mainIndex) : sel;
  }
  select(event) {
    let { view } = this, selection = this.skipAtoms(this.style.get(event, this.extend, this.multiple));
    if (this.mustSelect || !selection.eq(view.state.selection, this.dragging === false))
      this.view.dispatch({
        selection,
        userEvent: "select.pointer"
      });
    this.mustSelect = false;
  }
  update(update) {
    if (this.style.update(update))
      setTimeout(() => this.select(this.lastEvent), 20);
  }
};
function addsSelectionRange(view, event) {
  let facet = view.state.facet(clickAddsSelectionRange);
  return facet.length ? facet[0](event) : browser.mac ? event.metaKey : event.ctrlKey;
}
function dragMovesSelection(view, event) {
  let facet = view.state.facet(dragMovesSelection$1);
  return facet.length ? facet[0](event) : browser.mac ? !event.altKey : !event.ctrlKey;
}
function isInPrimarySelection(view, event) {
  let { main } = view.state.selection;
  if (main.empty)
    return false;
  let sel = getSelection(view.root);
  if (!sel || sel.rangeCount == 0)
    return true;
  let rects = sel.getRangeAt(0).getClientRects();
  for (let i = 0; i < rects.length; i++) {
    let rect = rects[i];
    if (rect.left <= event.clientX && rect.right >= event.clientX && rect.top <= event.clientY && rect.bottom >= event.clientY)
      return true;
  }
  return false;
}
function eventBelongsToEditor(view, event) {
  if (!event.bubbles)
    return true;
  if (event.defaultPrevented)
    return false;
  for (let node = event.target, cView; node != view.contentDOM; node = node.parentNode)
    if (!node || node.nodeType == 11 || (cView = ContentView.get(node)) && cView.ignoreEvent(event))
      return false;
  return true;
}
var handlers = /* @__PURE__ */ Object.create(null);
var observers = /* @__PURE__ */ Object.create(null);
var brokenClipboardAPI = browser.ie && browser.ie_version < 15 || browser.ios && browser.webkit_version < 604;
function capturePaste(view) {
  let parent = view.dom.parentNode;
  if (!parent)
    return;
  let target = parent.appendChild(document.createElement("textarea"));
  target.style.cssText = "position: fixed; left: -10000px; top: 10px";
  target.focus();
  setTimeout(() => {
    view.focus();
    target.remove();
    doPaste(view, target.value);
  }, 50);
}
function doPaste(view, input) {
  let { state } = view, changes, i = 1, text = state.toText(input);
  let byLine = text.lines == state.selection.ranges.length;
  let linewise = lastLinewiseCopy != null && state.selection.ranges.every((r) => r.empty) && lastLinewiseCopy == text.toString();
  if (linewise) {
    let lastLine = -1;
    changes = state.changeByRange((range) => {
      let line = state.doc.lineAt(range.from);
      if (line.from == lastLine)
        return { range };
      lastLine = line.from;
      let insert2 = state.toText((byLine ? text.line(i++).text : input) + state.lineBreak);
      return {
        changes: { from: line.from, insert: insert2 },
        range: EditorSelection.cursor(range.from + insert2.length)
      };
    });
  } else if (byLine) {
    changes = state.changeByRange((range) => {
      let line = text.line(i++);
      return {
        changes: { from: range.from, to: range.to, insert: line.text },
        range: EditorSelection.cursor(range.from + line.length)
      };
    });
  } else {
    changes = state.replaceSelection(text);
  }
  view.dispatch(changes, {
    userEvent: "input.paste",
    scrollIntoView: true
  });
}
observers.scroll = (view) => {
  view.inputState.lastScrollTop = view.scrollDOM.scrollTop;
  view.inputState.lastScrollLeft = view.scrollDOM.scrollLeft;
};
handlers.keydown = (view, event) => {
  view.inputState.setSelectionOrigin("select");
  if (event.keyCode == 27)
    view.inputState.lastEscPress = Date.now();
  return false;
};
observers.touchstart = (view, e) => {
  view.inputState.lastTouchTime = Date.now();
  view.inputState.setSelectionOrigin("select.pointer");
};
observers.touchmove = (view) => {
  view.inputState.setSelectionOrigin("select.pointer");
};
handlers.mousedown = (view, event) => {
  view.observer.flush();
  if (view.inputState.lastTouchTime > Date.now() - 2e3)
    return false;
  let style = null;
  for (let makeStyle of view.state.facet(mouseSelectionStyle)) {
    style = makeStyle(view, event);
    if (style)
      break;
  }
  if (!style && event.button == 0)
    style = basicMouseSelection(view, event);
  if (style) {
    let mustFocus = !view.hasFocus;
    view.inputState.startMouseSelection(new MouseSelection(view, event, style, mustFocus));
    if (mustFocus)
      view.observer.ignore(() => focusPreventScroll(view.contentDOM));
    let mouseSel = view.inputState.mouseSelection;
    if (mouseSel) {
      mouseSel.start(event);
      return mouseSel.dragging === false;
    }
  }
  return false;
};
function rangeForClick(view, pos, bias, type) {
  if (type == 1) {
    return EditorSelection.cursor(pos, bias);
  } else if (type == 2) {
    return groupAt(view.state, pos, bias);
  } else {
    let visual = LineView.find(view.docView, pos), line = view.state.doc.lineAt(visual ? visual.posAtEnd : pos);
    let from = visual ? visual.posAtStart : line.from, to = visual ? visual.posAtEnd : line.to;
    if (to < view.state.doc.length && to == line.to)
      to++;
    return EditorSelection.range(from, to);
  }
}
var insideY = (y, rect) => y >= rect.top && y <= rect.bottom;
var inside = (x, y, rect) => insideY(y, rect) && x >= rect.left && x <= rect.right;
function findPositionSide(view, pos, x, y) {
  let line = LineView.find(view.docView, pos);
  if (!line)
    return 1;
  let off = pos - line.posAtStart;
  if (off == 0)
    return 1;
  if (off == line.length)
    return -1;
  let before = line.coordsAt(off, -1);
  if (before && inside(x, y, before))
    return -1;
  let after = line.coordsAt(off, 1);
  if (after && inside(x, y, after))
    return 1;
  return before && insideY(y, before) ? -1 : 1;
}
function queryPos(view, event) {
  let pos = view.posAtCoords({ x: event.clientX, y: event.clientY }, false);
  return { pos, bias: findPositionSide(view, pos, event.clientX, event.clientY) };
}
var BadMouseDetail = browser.ie && browser.ie_version <= 11;
var lastMouseDown = null;
var lastMouseDownCount = 0;
var lastMouseDownTime = 0;
function getClickType(event) {
  if (!BadMouseDetail)
    return event.detail;
  let last = lastMouseDown, lastTime = lastMouseDownTime;
  lastMouseDown = event;
  lastMouseDownTime = Date.now();
  return lastMouseDownCount = !last || lastTime > Date.now() - 400 && Math.abs(last.clientX - event.clientX) < 2 && Math.abs(last.clientY - event.clientY) < 2 ? (lastMouseDownCount + 1) % 3 : 1;
}
function basicMouseSelection(view, event) {
  let start = queryPos(view, event), type = getClickType(event);
  let startSel = view.state.selection;
  return {
    update(update) {
      if (update.docChanged) {
        start.pos = update.changes.mapPos(start.pos);
        startSel = startSel.map(update.changes);
      }
    },
    get(event2, extend2, multiple) {
      let cur = queryPos(view, event2), removed;
      let range = rangeForClick(view, cur.pos, cur.bias, type);
      if (start.pos != cur.pos && !extend2) {
        let startRange = rangeForClick(view, start.pos, start.bias, type);
        let from = Math.min(startRange.from, range.from), to = Math.max(startRange.to, range.to);
        range = from < range.from ? EditorSelection.range(from, to) : EditorSelection.range(to, from);
      }
      if (extend2)
        return startSel.replaceRange(startSel.main.extend(range.from, range.to));
      else if (multiple && type == 1 && startSel.ranges.length > 1 && (removed = removeRangeAround(startSel, cur.pos)))
        return removed;
      else if (multiple)
        return startSel.addRange(range);
      else
        return EditorSelection.create([range]);
    }
  };
}
function removeRangeAround(sel, pos) {
  for (let i = 0; i < sel.ranges.length; i++) {
    let { from, to } = sel.ranges[i];
    if (from <= pos && to >= pos)
      return EditorSelection.create(sel.ranges.slice(0, i).concat(sel.ranges.slice(i + 1)), sel.mainIndex == i ? 0 : sel.mainIndex - (sel.mainIndex > i ? 1 : 0));
  }
  return null;
}
handlers.dragstart = (view, event) => {
  let { selection: { main: range } } = view.state;
  if (event.target.draggable) {
    let cView = view.docView.nearest(event.target);
    if (cView && cView.isWidget) {
      let from = cView.posAtStart, to = from + cView.length;
      if (from >= range.to || to <= range.from)
        range = EditorSelection.range(from, to);
    }
  }
  let { inputState } = view;
  if (inputState.mouseSelection)
    inputState.mouseSelection.dragging = true;
  inputState.draggedContent = range;
  if (event.dataTransfer) {
    event.dataTransfer.setData("Text", view.state.sliceDoc(range.from, range.to));
    event.dataTransfer.effectAllowed = "copyMove";
  }
  return false;
};
handlers.dragend = (view) => {
  view.inputState.draggedContent = null;
  return false;
};
function dropText(view, event, text, direct) {
  if (!text)
    return;
  let dropPos = view.posAtCoords({ x: event.clientX, y: event.clientY }, false);
  let { draggedContent } = view.inputState;
  let del = direct && draggedContent && dragMovesSelection(view, event) ? { from: draggedContent.from, to: draggedContent.to } : null;
  let ins = { from: dropPos, insert: text };
  let changes = view.state.changes(del ? [del, ins] : ins);
  view.focus();
  view.dispatch({
    changes,
    selection: { anchor: changes.mapPos(dropPos, -1), head: changes.mapPos(dropPos, 1) },
    userEvent: del ? "move.drop" : "input.drop"
  });
  view.inputState.draggedContent = null;
}
handlers.drop = (view, event) => {
  if (!event.dataTransfer)
    return false;
  if (view.state.readOnly)
    return true;
  let files = event.dataTransfer.files;
  if (files && files.length) {
    let text = Array(files.length), read = 0;
    let finishFile = () => {
      if (++read == files.length)
        dropText(view, event, text.filter((s) => s != null).join(view.state.lineBreak), false);
    };
    for (let i = 0; i < files.length; i++) {
      let reader = new FileReader();
      reader.onerror = finishFile;
      reader.onload = () => {
        if (!/[\x00-\x08\x0e-\x1f]{2}/.test(reader.result))
          text[i] = reader.result;
        finishFile();
      };
      reader.readAsText(files[i]);
    }
    return true;
  } else {
    let text = event.dataTransfer.getData("Text");
    if (text) {
      dropText(view, event, text, true);
      return true;
    }
  }
  return false;
};
handlers.paste = (view, event) => {
  if (view.state.readOnly)
    return true;
  view.observer.flush();
  let data2 = brokenClipboardAPI ? null : event.clipboardData;
  if (data2) {
    doPaste(view, data2.getData("text/plain") || data2.getData("text/uri-list"));
    return true;
  } else {
    capturePaste(view);
    return false;
  }
};
function captureCopy(view, text) {
  let parent = view.dom.parentNode;
  if (!parent)
    return;
  let target = parent.appendChild(document.createElement("textarea"));
  target.style.cssText = "position: fixed; left: -10000px; top: 10px";
  target.value = text;
  target.focus();
  target.selectionEnd = text.length;
  target.selectionStart = 0;
  setTimeout(() => {
    target.remove();
    view.focus();
  }, 50);
}
function copiedRange(state) {
  let content2 = [], ranges = [], linewise = false;
  for (let range of state.selection.ranges)
    if (!range.empty) {
      content2.push(state.sliceDoc(range.from, range.to));
      ranges.push(range);
    }
  if (!content2.length) {
    let upto = -1;
    for (let { from } of state.selection.ranges) {
      let line = state.doc.lineAt(from);
      if (line.number > upto) {
        content2.push(line.text);
        ranges.push({ from: line.from, to: Math.min(state.doc.length, line.to + 1) });
      }
      upto = line.number;
    }
    linewise = true;
  }
  return { text: content2.join(state.lineBreak), ranges, linewise };
}
var lastLinewiseCopy = null;
handlers.copy = handlers.cut = (view, event) => {
  let { text, ranges, linewise } = copiedRange(view.state);
  if (!text && !linewise)
    return false;
  lastLinewiseCopy = linewise ? text : null;
  if (event.type == "cut" && !view.state.readOnly)
    view.dispatch({
      changes: ranges,
      scrollIntoView: true,
      userEvent: "delete.cut"
    });
  let data2 = brokenClipboardAPI ? null : event.clipboardData;
  if (data2) {
    data2.clearData();
    data2.setData("text/plain", text);
    return true;
  } else {
    captureCopy(view, text);
    return false;
  }
};
var isFocusChange = /* @__PURE__ */ Annotation.define();
function focusChangeTransaction(state, focus) {
  let effects = [];
  for (let getEffect of state.facet(focusChangeEffect)) {
    let effect = getEffect(state, focus);
    if (effect)
      effects.push(effect);
  }
  return effects ? state.update({ effects, annotations: isFocusChange.of(true) }) : null;
}
function updateForFocusChange(view) {
  setTimeout(() => {
    let focus = view.hasFocus;
    if (focus != view.inputState.notifiedFocused) {
      let tr = focusChangeTransaction(view.state, focus);
      if (tr)
        view.dispatch(tr);
      else
        view.update([]);
    }
  }, 10);
}
observers.focus = (view) => {
  view.inputState.lastFocusTime = Date.now();
  if (!view.scrollDOM.scrollTop && (view.inputState.lastScrollTop || view.inputState.lastScrollLeft)) {
    view.scrollDOM.scrollTop = view.inputState.lastScrollTop;
    view.scrollDOM.scrollLeft = view.inputState.lastScrollLeft;
  }
  updateForFocusChange(view);
};
observers.blur = (view) => {
  view.observer.clearSelectionRange();
  updateForFocusChange(view);
};
observers.compositionstart = observers.compositionupdate = (view) => {
  if (view.inputState.compositionFirstChange == null)
    view.inputState.compositionFirstChange = true;
  if (view.inputState.composing < 0) {
    view.inputState.composing = 0;
    if (view.docView.maybeCreateCompositionBarrier()) {
      view.update([]);
      view.docView.clearCompositionBarrier();
    }
  }
};
observers.compositionend = (view) => {
  view.inputState.composing = -1;
  view.inputState.compositionEndedAt = Date.now();
  view.inputState.compositionPendingKey = true;
  view.inputState.compositionPendingChange = view.observer.pendingRecords().length > 0;
  view.inputState.compositionFirstChange = null;
  if (browser.chrome && browser.android) {
    view.observer.flushSoon();
  } else if (view.inputState.compositionPendingChange) {
    Promise.resolve().then(() => view.observer.flush());
  } else {
    setTimeout(() => {
      if (view.inputState.composing < 0 && view.docView.hasComposition)
        view.update([]);
    }, 50);
  }
};
observers.contextmenu = (view) => {
  view.inputState.lastContextMenu = Date.now();
};
handlers.beforeinput = (view, event) => {
  var _a2;
  let pending;
  if (browser.chrome && browser.android && (pending = PendingKeys.find((key) => key.inputType == event.inputType))) {
    view.observer.delayAndroidKey(pending.key, pending.keyCode);
    if (pending.key == "Backspace" || pending.key == "Delete") {
      let startViewHeight = ((_a2 = window.visualViewport) === null || _a2 === void 0 ? void 0 : _a2.height) || 0;
      setTimeout(() => {
        var _a3;
        if ((((_a3 = window.visualViewport) === null || _a3 === void 0 ? void 0 : _a3.height) || 0) > startViewHeight + 10 && view.hasFocus) {
          view.contentDOM.blur();
          view.focus();
        }
      }, 100);
    }
  }
  if (browser.ios && event.inputType == "deleteContentForward") {
    view.observer.flushSoon();
  }
  if (browser.safari && event.inputType == "insertText" && view.inputState.composing >= 0) {
    setTimeout(() => observers.compositionend(view, event), 20);
  }
  return false;
};
var appliedFirefoxHack = /* @__PURE__ */ new Set();
function firefoxCopyCutHack(doc2) {
  if (!appliedFirefoxHack.has(doc2)) {
    appliedFirefoxHack.add(doc2);
    doc2.addEventListener("copy", () => {
    });
    doc2.addEventListener("cut", () => {
    });
  }
}
var wrappingWhiteSpace = ["pre-wrap", "normal", "pre-line", "break-spaces"];
var HeightOracle = class {
  constructor(lineWrapping) {
    this.lineWrapping = lineWrapping;
    this.doc = Text.empty;
    this.heightSamples = {};
    this.lineHeight = 14;
    this.charWidth = 7;
    this.textHeight = 14;
    this.lineLength = 30;
    this.heightChanged = false;
  }
  heightForGap(from, to) {
    let lines = this.doc.lineAt(to).number - this.doc.lineAt(from).number + 1;
    if (this.lineWrapping)
      lines += Math.max(0, Math.ceil((to - from - lines * this.lineLength * 0.5) / this.lineLength));
    return this.lineHeight * lines;
  }
  heightForLine(length) {
    if (!this.lineWrapping)
      return this.lineHeight;
    let lines = 1 + Math.max(0, Math.ceil((length - this.lineLength) / (this.lineLength - 5)));
    return lines * this.lineHeight;
  }
  setDoc(doc2) {
    this.doc = doc2;
    return this;
  }
  mustRefreshForWrapping(whiteSpace) {
    return wrappingWhiteSpace.indexOf(whiteSpace) > -1 != this.lineWrapping;
  }
  mustRefreshForHeights(lineHeights) {
    let newHeight = false;
    for (let i = 0; i < lineHeights.length; i++) {
      let h = lineHeights[i];
      if (h < 0) {
        i++;
      } else if (!this.heightSamples[Math.floor(h * 10)]) {
        newHeight = true;
        this.heightSamples[Math.floor(h * 10)] = true;
      }
    }
    return newHeight;
  }
  refresh(whiteSpace, lineHeight, charWidth, textHeight, lineLength, knownHeights) {
    let lineWrapping = wrappingWhiteSpace.indexOf(whiteSpace) > -1;
    let changed = Math.round(lineHeight) != Math.round(this.lineHeight) || this.lineWrapping != lineWrapping;
    this.lineWrapping = lineWrapping;
    this.lineHeight = lineHeight;
    this.charWidth = charWidth;
    this.textHeight = textHeight;
    this.lineLength = lineLength;
    if (changed) {
      this.heightSamples = {};
      for (let i = 0; i < knownHeights.length; i++) {
        let h = knownHeights[i];
        if (h < 0)
          i++;
        else
          this.heightSamples[Math.floor(h * 10)] = true;
      }
    }
    return changed;
  }
};
var MeasuredHeights = class {
  constructor(from, heights) {
    this.from = from;
    this.heights = heights;
    this.index = 0;
  }
  get more() {
    return this.index < this.heights.length;
  }
};
var BlockInfo = class {
  constructor(from, length, top2, height, _content) {
    this.from = from;
    this.length = length;
    this.top = top2;
    this.height = height;
    this._content = _content;
  }
  get type() {
    return typeof this._content == "number" ? BlockType.Text : Array.isArray(this._content) ? this._content : this._content.type;
  }
  get to() {
    return this.from + this.length;
  }
  get bottom() {
    return this.top + this.height;
  }
  get widget() {
    return this._content instanceof PointDecoration ? this._content.widget : null;
  }
  get widgetLineBreaks() {
    return typeof this._content == "number" ? this._content : 0;
  }
  join(other) {
    let content2 = (Array.isArray(this._content) ? this._content : [this]).concat(Array.isArray(other._content) ? other._content : [other]);
    return new BlockInfo(this.from, this.length + other.length, this.top, this.height + other.height, content2);
  }
};
var QueryType = /* @__PURE__ */ function(QueryType2) {
  QueryType2[QueryType2["ByPos"] = 0] = "ByPos";
  QueryType2[QueryType2["ByHeight"] = 1] = "ByHeight";
  QueryType2[QueryType2["ByPosNoHeight"] = 2] = "ByPosNoHeight";
  return QueryType2;
}(QueryType || (QueryType = {}));
var Epsilon = 1e-3;
var HeightMap = class {
  constructor(length, height, flags = 2) {
    this.length = length;
    this.height = height;
    this.flags = flags;
  }
  get outdated() {
    return (this.flags & 2) > 0;
  }
  set outdated(value) {
    this.flags = (value ? 2 : 0) | this.flags & ~2;
  }
  setHeight(oracle, height) {
    if (this.height != height) {
      if (Math.abs(this.height - height) > Epsilon)
        oracle.heightChanged = true;
      this.height = height;
    }
  }
  replace(_from, _to, nodes) {
    return HeightMap.of(nodes);
  }
  decomposeLeft(_to, result) {
    result.push(this);
  }
  decomposeRight(_from, result) {
    result.push(this);
  }
  applyChanges(decorations2, oldDoc, oracle, changes) {
    let me = this, doc2 = oracle.doc;
    for (let i = changes.length - 1; i >= 0; i--) {
      let { fromA, toA, fromB, toB } = changes[i];
      let start = me.lineAt(fromA, QueryType.ByPosNoHeight, oracle.setDoc(oldDoc), 0, 0);
      let end = start.to >= toA ? start : me.lineAt(toA, QueryType.ByPosNoHeight, oracle, 0, 0);
      toB += end.to - toA;
      toA = end.to;
      while (i > 0 && start.from <= changes[i - 1].toA) {
        fromA = changes[i - 1].fromA;
        fromB = changes[i - 1].fromB;
        i--;
        if (fromA < start.from)
          start = me.lineAt(fromA, QueryType.ByPosNoHeight, oracle, 0, 0);
      }
      fromB += start.from - fromA;
      fromA = start.from;
      let nodes = NodeBuilder.build(oracle.setDoc(doc2), decorations2, fromB, toB);
      me = me.replace(fromA, toA, nodes);
    }
    return me.updateHeight(oracle, 0);
  }
  static empty() {
    return new HeightMapText(0, 0);
  }
  static of(nodes) {
    if (nodes.length == 1)
      return nodes[0];
    let i = 0, j = nodes.length, before = 0, after = 0;
    for (; ; ) {
      if (i == j) {
        if (before > after * 2) {
          let split = nodes[i - 1];
          if (split.break)
            nodes.splice(--i, 1, split.left, null, split.right);
          else
            nodes.splice(--i, 1, split.left, split.right);
          j += 1 + split.break;
          before -= split.size;
        } else if (after > before * 2) {
          let split = nodes[j];
          if (split.break)
            nodes.splice(j, 1, split.left, null, split.right);
          else
            nodes.splice(j, 1, split.left, split.right);
          j += 2 + split.break;
          after -= split.size;
        } else {
          break;
        }
      } else if (before < after) {
        let next = nodes[i++];
        if (next)
          before += next.size;
      } else {
        let next = nodes[--j];
        if (next)
          after += next.size;
      }
    }
    let brk = 0;
    if (nodes[i - 1] == null) {
      brk = 1;
      i--;
    } else if (nodes[i] == null) {
      brk = 1;
      j++;
    }
    return new HeightMapBranch(HeightMap.of(nodes.slice(0, i)), brk, HeightMap.of(nodes.slice(j)));
  }
};
HeightMap.prototype.size = 1;
var HeightMapBlock = class extends HeightMap {
  constructor(length, height, deco) {
    super(length, height);
    this.deco = deco;
  }
  blockAt(_height, _oracle, top2, offset) {
    return new BlockInfo(offset, this.length, top2, this.height, this.deco || 0);
  }
  lineAt(_value, _type, oracle, top2, offset) {
    return this.blockAt(0, oracle, top2, offset);
  }
  forEachLine(from, to, oracle, top2, offset, f) {
    if (from <= offset + this.length && to >= offset)
      f(this.blockAt(0, oracle, top2, offset));
  }
  updateHeight(oracle, offset = 0, _force = false, measured) {
    if (measured && measured.from <= offset && measured.more)
      this.setHeight(oracle, measured.heights[measured.index++]);
    this.outdated = false;
    return this;
  }
  toString() {
    return `block(${this.length})`;
  }
};
var HeightMapText = class extends HeightMapBlock {
  constructor(length, height) {
    super(length, height, null);
    this.collapsed = 0;
    this.widgetHeight = 0;
    this.breaks = 0;
  }
  blockAt(_height, _oracle, top2, offset) {
    return new BlockInfo(offset, this.length, top2, this.height, this.breaks);
  }
  replace(_from, _to, nodes) {
    let node = nodes[0];
    if (nodes.length == 1 && (node instanceof HeightMapText || node instanceof HeightMapGap && node.flags & 4) && Math.abs(this.length - node.length) < 10) {
      if (node instanceof HeightMapGap)
        node = new HeightMapText(node.length, this.height);
      else
        node.height = this.height;
      if (!this.outdated)
        node.outdated = false;
      return node;
    } else {
      return HeightMap.of(nodes);
    }
  }
  updateHeight(oracle, offset = 0, force = false, measured) {
    if (measured && measured.from <= offset && measured.more)
      this.setHeight(oracle, measured.heights[measured.index++]);
    else if (force || this.outdated)
      this.setHeight(oracle, Math.max(this.widgetHeight, oracle.heightForLine(this.length - this.collapsed)) + this.breaks * oracle.lineHeight);
    this.outdated = false;
    return this;
  }
  toString() {
    return `line(${this.length}${this.collapsed ? -this.collapsed : ""}${this.widgetHeight ? ":" + this.widgetHeight : ""})`;
  }
};
var HeightMapGap = class extends HeightMap {
  constructor(length) {
    super(length, 0);
  }
  heightMetrics(oracle, offset) {
    let firstLine = oracle.doc.lineAt(offset).number, lastLine = oracle.doc.lineAt(offset + this.length).number;
    let lines = lastLine - firstLine + 1;
    let perLine, perChar = 0;
    if (oracle.lineWrapping) {
      let totalPerLine = Math.min(this.height, oracle.lineHeight * lines);
      perLine = totalPerLine / lines;
      if (this.length > lines + 1)
        perChar = (this.height - totalPerLine) / (this.length - lines - 1);
    } else {
      perLine = this.height / lines;
    }
    return { firstLine, lastLine, perLine, perChar };
  }
  blockAt(height, oracle, top2, offset) {
    let { firstLine, lastLine, perLine, perChar } = this.heightMetrics(oracle, offset);
    if (oracle.lineWrapping) {
      let guess = offset + (height < oracle.lineHeight ? 0 : Math.round(Math.max(0, Math.min(1, (height - top2) / this.height)) * this.length));
      let line = oracle.doc.lineAt(guess), lineHeight = perLine + line.length * perChar;
      let lineTop = Math.max(top2, height - lineHeight / 2);
      return new BlockInfo(line.from, line.length, lineTop, lineHeight, 0);
    } else {
      let line = Math.max(0, Math.min(lastLine - firstLine, Math.floor((height - top2) / perLine)));
      let { from, length } = oracle.doc.line(firstLine + line);
      return new BlockInfo(from, length, top2 + perLine * line, perLine, 0);
    }
  }
  lineAt(value, type, oracle, top2, offset) {
    if (type == QueryType.ByHeight)
      return this.blockAt(value, oracle, top2, offset);
    if (type == QueryType.ByPosNoHeight) {
      let { from, to } = oracle.doc.lineAt(value);
      return new BlockInfo(from, to - from, 0, 0, 0);
    }
    let { firstLine, perLine, perChar } = this.heightMetrics(oracle, offset);
    let line = oracle.doc.lineAt(value), lineHeight = perLine + line.length * perChar;
    let linesAbove = line.number - firstLine;
    let lineTop = top2 + perLine * linesAbove + perChar * (line.from - offset - linesAbove);
    return new BlockInfo(line.from, line.length, Math.max(top2, Math.min(lineTop, top2 + this.height - lineHeight)), lineHeight, 0);
  }
  forEachLine(from, to, oracle, top2, offset, f) {
    from = Math.max(from, offset);
    to = Math.min(to, offset + this.length);
    let { firstLine, perLine, perChar } = this.heightMetrics(oracle, offset);
    for (let pos = from, lineTop = top2; pos <= to; ) {
      let line = oracle.doc.lineAt(pos);
      if (pos == from) {
        let linesAbove = line.number - firstLine;
        lineTop += perLine * linesAbove + perChar * (from - offset - linesAbove);
      }
      let lineHeight = perLine + perChar * line.length;
      f(new BlockInfo(line.from, line.length, lineTop, lineHeight, 0));
      lineTop += lineHeight;
      pos = line.to + 1;
    }
  }
  replace(from, to, nodes) {
    let after = this.length - to;
    if (after > 0) {
      let last = nodes[nodes.length - 1];
      if (last instanceof HeightMapGap)
        nodes[nodes.length - 1] = new HeightMapGap(last.length + after);
      else
        nodes.push(null, new HeightMapGap(after - 1));
    }
    if (from > 0) {
      let first = nodes[0];
      if (first instanceof HeightMapGap)
        nodes[0] = new HeightMapGap(from + first.length);
      else
        nodes.unshift(new HeightMapGap(from - 1), null);
    }
    return HeightMap.of(nodes);
  }
  decomposeLeft(to, result) {
    result.push(new HeightMapGap(to - 1), null);
  }
  decomposeRight(from, result) {
    result.push(null, new HeightMapGap(this.length - from - 1));
  }
  updateHeight(oracle, offset = 0, force = false, measured) {
    let end = offset + this.length;
    if (measured && measured.from <= offset + this.length && measured.more) {
      let nodes = [], pos = Math.max(offset, measured.from), singleHeight = -1;
      if (measured.from > offset)
        nodes.push(new HeightMapGap(measured.from - offset - 1).updateHeight(oracle, offset));
      while (pos <= end && measured.more) {
        let len = oracle.doc.lineAt(pos).length;
        if (nodes.length)
          nodes.push(null);
        let height = measured.heights[measured.index++];
        if (singleHeight == -1)
          singleHeight = height;
        else if (Math.abs(height - singleHeight) >= Epsilon)
          singleHeight = -2;
        let line = new HeightMapText(len, height);
        line.outdated = false;
        nodes.push(line);
        pos += len + 1;
      }
      if (pos <= end)
        nodes.push(null, new HeightMapGap(end - pos).updateHeight(oracle, pos));
      let result = HeightMap.of(nodes);
      if (singleHeight < 0 || Math.abs(result.height - this.height) >= Epsilon || Math.abs(singleHeight - this.heightMetrics(oracle, offset).perLine) >= Epsilon)
        oracle.heightChanged = true;
      return result;
    } else if (force || this.outdated) {
      this.setHeight(oracle, oracle.heightForGap(offset, offset + this.length));
      this.outdated = false;
    }
    return this;
  }
  toString() {
    return `gap(${this.length})`;
  }
};
var HeightMapBranch = class extends HeightMap {
  constructor(left, brk, right) {
    super(left.length + brk + right.length, left.height + right.height, brk | (left.outdated || right.outdated ? 2 : 0));
    this.left = left;
    this.right = right;
    this.size = left.size + right.size;
  }
  get break() {
    return this.flags & 1;
  }
  blockAt(height, oracle, top2, offset) {
    let mid = top2 + this.left.height;
    return height < mid ? this.left.blockAt(height, oracle, top2, offset) : this.right.blockAt(height, oracle, mid, offset + this.left.length + this.break);
  }
  lineAt(value, type, oracle, top2, offset) {
    let rightTop = top2 + this.left.height, rightOffset = offset + this.left.length + this.break;
    let left = type == QueryType.ByHeight ? value < rightTop : value < rightOffset;
    let base2 = left ? this.left.lineAt(value, type, oracle, top2, offset) : this.right.lineAt(value, type, oracle, rightTop, rightOffset);
    if (this.break || (left ? base2.to < rightOffset : base2.from > rightOffset))
      return base2;
    let subQuery = type == QueryType.ByPosNoHeight ? QueryType.ByPosNoHeight : QueryType.ByPos;
    if (left)
      return base2.join(this.right.lineAt(rightOffset, subQuery, oracle, rightTop, rightOffset));
    else
      return this.left.lineAt(rightOffset, subQuery, oracle, top2, offset).join(base2);
  }
  forEachLine(from, to, oracle, top2, offset, f) {
    let rightTop = top2 + this.left.height, rightOffset = offset + this.left.length + this.break;
    if (this.break) {
      if (from < rightOffset)
        this.left.forEachLine(from, to, oracle, top2, offset, f);
      if (to >= rightOffset)
        this.right.forEachLine(from, to, oracle, rightTop, rightOffset, f);
    } else {
      let mid = this.lineAt(rightOffset, QueryType.ByPos, oracle, top2, offset);
      if (from < mid.from)
        this.left.forEachLine(from, mid.from - 1, oracle, top2, offset, f);
      if (mid.to >= from && mid.from <= to)
        f(mid);
      if (to > mid.to)
        this.right.forEachLine(mid.to + 1, to, oracle, rightTop, rightOffset, f);
    }
  }
  replace(from, to, nodes) {
    let rightStart = this.left.length + this.break;
    if (to < rightStart)
      return this.balanced(this.left.replace(from, to, nodes), this.right);
    if (from > this.left.length)
      return this.balanced(this.left, this.right.replace(from - rightStart, to - rightStart, nodes));
    let result = [];
    if (from > 0)
      this.decomposeLeft(from, result);
    let left = result.length;
    for (let node of nodes)
      result.push(node);
    if (from > 0)
      mergeGaps(result, left - 1);
    if (to < this.length) {
      let right = result.length;
      this.decomposeRight(to, result);
      mergeGaps(result, right);
    }
    return HeightMap.of(result);
  }
  decomposeLeft(to, result) {
    let left = this.left.length;
    if (to <= left)
      return this.left.decomposeLeft(to, result);
    result.push(this.left);
    if (this.break) {
      left++;
      if (to >= left)
        result.push(null);
    }
    if (to > left)
      this.right.decomposeLeft(to - left, result);
  }
  decomposeRight(from, result) {
    let left = this.left.length, right = left + this.break;
    if (from >= right)
      return this.right.decomposeRight(from - right, result);
    if (from < left)
      this.left.decomposeRight(from, result);
    if (this.break && from < right)
      result.push(null);
    result.push(this.right);
  }
  balanced(left, right) {
    if (left.size > 2 * right.size || right.size > 2 * left.size)
      return HeightMap.of(this.break ? [left, null, right] : [left, right]);
    this.left = left;
    this.right = right;
    this.height = left.height + right.height;
    this.outdated = left.outdated || right.outdated;
    this.size = left.size + right.size;
    this.length = left.length + this.break + right.length;
    return this;
  }
  updateHeight(oracle, offset = 0, force = false, measured) {
    let { left, right } = this, rightStart = offset + left.length + this.break, rebalance = null;
    if (measured && measured.from <= offset + left.length && measured.more)
      rebalance = left = left.updateHeight(oracle, offset, force, measured);
    else
      left.updateHeight(oracle, offset, force);
    if (measured && measured.from <= rightStart + right.length && measured.more)
      rebalance = right = right.updateHeight(oracle, rightStart, force, measured);
    else
      right.updateHeight(oracle, rightStart, force);
    if (rebalance)
      return this.balanced(left, right);
    this.height = this.left.height + this.right.height;
    this.outdated = false;
    return this;
  }
  toString() {
    return this.left + (this.break ? " " : "-") + this.right;
  }
};
function mergeGaps(nodes, around) {
  let before, after;
  if (nodes[around] == null && (before = nodes[around - 1]) instanceof HeightMapGap && (after = nodes[around + 1]) instanceof HeightMapGap)
    nodes.splice(around - 1, 3, new HeightMapGap(before.length + 1 + after.length));
}
var relevantWidgetHeight = 5;
var NodeBuilder = class {
  constructor(pos, oracle) {
    this.pos = pos;
    this.oracle = oracle;
    this.nodes = [];
    this.lineStart = -1;
    this.lineEnd = -1;
    this.covering = null;
    this.writtenTo = pos;
  }
  get isCovered() {
    return this.covering && this.nodes[this.nodes.length - 1] == this.covering;
  }
  span(_from, to) {
    if (this.lineStart > -1) {
      let end = Math.min(to, this.lineEnd), last = this.nodes[this.nodes.length - 1];
      if (last instanceof HeightMapText)
        last.length += end - this.pos;
      else if (end > this.pos || !this.isCovered)
        this.nodes.push(new HeightMapText(end - this.pos, -1));
      this.writtenTo = end;
      if (to > end) {
        this.nodes.push(null);
        this.writtenTo++;
        this.lineStart = -1;
      }
    }
    this.pos = to;
  }
  point(from, to, deco) {
    if (from < to || deco.heightRelevant) {
      let height = deco.widget ? deco.widget.estimatedHeight : 0;
      let breaks = deco.widget ? deco.widget.lineBreaks : 0;
      if (height < 0)
        height = this.oracle.lineHeight;
      let len = to - from;
      if (deco.block) {
        this.addBlock(new HeightMapBlock(len, height, deco));
      } else if (len || breaks || height >= relevantWidgetHeight) {
        this.addLineDeco(height, breaks, len);
      }
    } else if (to > from) {
      this.span(from, to);
    }
    if (this.lineEnd > -1 && this.lineEnd < this.pos)
      this.lineEnd = this.oracle.doc.lineAt(this.pos).to;
  }
  enterLine() {
    if (this.lineStart > -1)
      return;
    let { from, to } = this.oracle.doc.lineAt(this.pos);
    this.lineStart = from;
    this.lineEnd = to;
    if (this.writtenTo < from) {
      if (this.writtenTo < from - 1 || this.nodes[this.nodes.length - 1] == null)
        this.nodes.push(this.blankContent(this.writtenTo, from - 1));
      this.nodes.push(null);
    }
    if (this.pos > from)
      this.nodes.push(new HeightMapText(this.pos - from, -1));
    this.writtenTo = this.pos;
  }
  blankContent(from, to) {
    let gap = new HeightMapGap(to - from);
    if (this.oracle.doc.lineAt(from).to == to)
      gap.flags |= 4;
    return gap;
  }
  ensureLine() {
    this.enterLine();
    let last = this.nodes.length ? this.nodes[this.nodes.length - 1] : null;
    if (last instanceof HeightMapText)
      return last;
    let line = new HeightMapText(0, -1);
    this.nodes.push(line);
    return line;
  }
  addBlock(block) {
    this.enterLine();
    let deco = block.deco;
    if (deco && deco.startSide > 0 && !this.isCovered)
      this.ensureLine();
    this.nodes.push(block);
    this.writtenTo = this.pos = this.pos + block.length;
    if (deco && deco.endSide > 0)
      this.covering = block;
  }
  addLineDeco(height, breaks, length) {
    let line = this.ensureLine();
    line.length += length;
    line.collapsed += length;
    line.widgetHeight = Math.max(line.widgetHeight, height);
    line.breaks += breaks;
    this.writtenTo = this.pos = this.pos + length;
  }
  finish(from) {
    let last = this.nodes.length == 0 ? null : this.nodes[this.nodes.length - 1];
    if (this.lineStart > -1 && !(last instanceof HeightMapText) && !this.isCovered)
      this.nodes.push(new HeightMapText(0, -1));
    else if (this.writtenTo < this.pos || last == null)
      this.nodes.push(this.blankContent(this.writtenTo, this.pos));
    let pos = from;
    for (let node of this.nodes) {
      if (node instanceof HeightMapText)
        node.updateHeight(this.oracle, pos);
      pos += node ? node.length : 1;
    }
    return this.nodes;
  }
  static build(oracle, decorations2, from, to) {
    let builder = new NodeBuilder(from, oracle);
    RangeSet.spans(decorations2, from, to, builder, 0);
    return builder.finish(from);
  }
};
function heightRelevantDecoChanges(a, b, diff) {
  let comp = new DecorationComparator2();
  RangeSet.compare(a, b, diff, comp, 0);
  return comp.changes;
}
var DecorationComparator2 = class {
  constructor() {
    this.changes = [];
  }
  compareRange() {
  }
  comparePoint(from, to, a, b) {
    if (from < to || a && a.heightRelevant || b && b.heightRelevant)
      addRange(from, to, this.changes, 5);
  }
};
function visiblePixelRange(dom, paddingTop) {
  let rect = dom.getBoundingClientRect();
  let doc2 = dom.ownerDocument, win = doc2.defaultView || window;
  let left = Math.max(0, rect.left), right = Math.min(win.innerWidth, rect.right);
  let top2 = Math.max(0, rect.top), bottom = Math.min(win.innerHeight, rect.bottom);
  for (let parent = dom.parentNode; parent && parent != doc2.body; ) {
    if (parent.nodeType == 1) {
      let elt2 = parent;
      let style = window.getComputedStyle(elt2);
      if ((elt2.scrollHeight > elt2.clientHeight || elt2.scrollWidth > elt2.clientWidth) && style.overflow != "visible") {
        let parentRect = elt2.getBoundingClientRect();
        left = Math.max(left, parentRect.left);
        right = Math.min(right, parentRect.right);
        top2 = Math.max(top2, parentRect.top);
        bottom = parent == dom.parentNode ? parentRect.bottom : Math.min(bottom, parentRect.bottom);
      }
      parent = style.position == "absolute" || style.position == "fixed" ? elt2.offsetParent : elt2.parentNode;
    } else if (parent.nodeType == 11) {
      parent = parent.host;
    } else {
      break;
    }
  }
  return {
    left: left - rect.left,
    right: Math.max(left, right) - rect.left,
    top: top2 - (rect.top + paddingTop),
    bottom: Math.max(top2, bottom) - (rect.top + paddingTop)
  };
}
function fullPixelRange(dom, paddingTop) {
  let rect = dom.getBoundingClientRect();
  return {
    left: 0,
    right: rect.right - rect.left,
    top: paddingTop,
    bottom: rect.bottom - (rect.top + paddingTop)
  };
}
var LineGap = class {
  constructor(from, to, size) {
    this.from = from;
    this.to = to;
    this.size = size;
  }
  static same(a, b) {
    if (a.length != b.length)
      return false;
    for (let i = 0; i < a.length; i++) {
      let gA = a[i], gB = b[i];
      if (gA.from != gB.from || gA.to != gB.to || gA.size != gB.size)
        return false;
    }
    return true;
  }
  draw(viewState, wrapping) {
    return Decoration.replace({
      widget: new LineGapWidget(this.size * (wrapping ? viewState.scaleY : viewState.scaleX), wrapping)
    }).range(this.from, this.to);
  }
};
var LineGapWidget = class extends WidgetType {
  constructor(size, vertical) {
    super();
    this.size = size;
    this.vertical = vertical;
  }
  eq(other) {
    return other.size == this.size && other.vertical == this.vertical;
  }
  toDOM() {
    let elt2 = document.createElement("div");
    if (this.vertical) {
      elt2.style.height = this.size + "px";
    } else {
      elt2.style.width = this.size + "px";
      elt2.style.height = "2px";
      elt2.style.display = "inline-block";
    }
    return elt2;
  }
  get estimatedHeight() {
    return this.vertical ? this.size : -1;
  }
};
var ViewState = class {
  constructor(state) {
    this.state = state;
    this.pixelViewport = { left: 0, right: window.innerWidth, top: 0, bottom: 0 };
    this.inView = true;
    this.paddingTop = 0;
    this.paddingBottom = 0;
    this.contentDOMWidth = 0;
    this.contentDOMHeight = 0;
    this.editorHeight = 0;
    this.editorWidth = 0;
    this.scrollTop = 0;
    this.scrolledToBottom = true;
    this.scaleX = 1;
    this.scaleY = 1;
    this.scrollAnchorPos = 0;
    this.scrollAnchorHeight = -1;
    this.scaler = IdScaler;
    this.scrollTarget = null;
    this.printing = false;
    this.mustMeasureContent = true;
    this.defaultTextDirection = Direction.LTR;
    this.visibleRanges = [];
    this.mustEnforceCursorAssoc = false;
    let guessWrapping = state.facet(contentAttributes).some((v) => typeof v != "function" && v.class == "cm-lineWrapping");
    this.heightOracle = new HeightOracle(guessWrapping);
    this.stateDeco = state.facet(decorations).filter((d) => typeof d != "function");
    this.heightMap = HeightMap.empty().applyChanges(this.stateDeco, Text.empty, this.heightOracle.setDoc(state.doc), [new ChangedRange(0, 0, 0, state.doc.length)]);
    this.viewport = this.getViewport(0, null);
    this.updateViewportLines();
    this.updateForViewport();
    this.lineGaps = this.ensureLineGaps([]);
    this.lineGapDeco = Decoration.set(this.lineGaps.map((gap) => gap.draw(this, false)));
    this.computeVisibleRanges();
  }
  updateForViewport() {
    let viewports = [this.viewport], { main } = this.state.selection;
    for (let i = 0; i <= 1; i++) {
      let pos = i ? main.head : main.anchor;
      if (!viewports.some(({ from, to }) => pos >= from && pos <= to)) {
        let { from, to } = this.lineBlockAt(pos);
        viewports.push(new Viewport(from, to));
      }
    }
    this.viewports = viewports.sort((a, b) => a.from - b.from);
    this.scaler = this.heightMap.height <= 7e6 ? IdScaler : new BigScaler(this.heightOracle, this.heightMap, this.viewports);
  }
  updateViewportLines() {
    this.viewportLines = [];
    this.heightMap.forEachLine(this.viewport.from, this.viewport.to, this.heightOracle.setDoc(this.state.doc), 0, 0, (block) => {
      this.viewportLines.push(this.scaler.scale == 1 ? block : scaleBlock(block, this.scaler));
    });
  }
  update(update, scrollTarget = null) {
    this.state = update.state;
    let prevDeco = this.stateDeco;
    this.stateDeco = this.state.facet(decorations).filter((d) => typeof d != "function");
    let contentChanges = update.changedRanges;
    let heightChanges = ChangedRange.extendWithRanges(contentChanges, heightRelevantDecoChanges(prevDeco, this.stateDeco, update ? update.changes : ChangeSet.empty(this.state.doc.length)));
    let prevHeight = this.heightMap.height;
    let scrollAnchor = this.scrolledToBottom ? null : this.scrollAnchorAt(this.scrollTop);
    this.heightMap = this.heightMap.applyChanges(this.stateDeco, update.startState.doc, this.heightOracle.setDoc(this.state.doc), heightChanges);
    if (this.heightMap.height != prevHeight)
      update.flags |= 2;
    if (scrollAnchor) {
      this.scrollAnchorPos = update.changes.mapPos(scrollAnchor.from, -1);
      this.scrollAnchorHeight = scrollAnchor.top;
    } else {
      this.scrollAnchorPos = -1;
      this.scrollAnchorHeight = this.heightMap.height;
    }
    let viewport = heightChanges.length ? this.mapViewport(this.viewport, update.changes) : this.viewport;
    if (scrollTarget && (scrollTarget.range.head < viewport.from || scrollTarget.range.head > viewport.to) || !this.viewportIsAppropriate(viewport))
      viewport = this.getViewport(0, scrollTarget);
    let updateLines = !update.changes.empty || update.flags & 2 || viewport.from != this.viewport.from || viewport.to != this.viewport.to;
    this.viewport = viewport;
    this.updateForViewport();
    if (updateLines)
      this.updateViewportLines();
    if (this.lineGaps.length || this.viewport.to - this.viewport.from > 2e3 << 1)
      this.updateLineGaps(this.ensureLineGaps(this.mapLineGaps(this.lineGaps, update.changes)));
    update.flags |= this.computeVisibleRanges();
    if (scrollTarget)
      this.scrollTarget = scrollTarget;
    if (!this.mustEnforceCursorAssoc && update.selectionSet && update.view.lineWrapping && update.state.selection.main.empty && update.state.selection.main.assoc && !update.state.facet(nativeSelectionHidden))
      this.mustEnforceCursorAssoc = true;
  }
  measure(view) {
    let dom = view.contentDOM, style = window.getComputedStyle(dom);
    let oracle = this.heightOracle;
    let whiteSpace = style.whiteSpace;
    this.defaultTextDirection = style.direction == "rtl" ? Direction.RTL : Direction.LTR;
    let refresh = this.heightOracle.mustRefreshForWrapping(whiteSpace);
    let domRect = dom.getBoundingClientRect();
    let measureContent = refresh || this.mustMeasureContent || this.contentDOMHeight != domRect.height;
    this.contentDOMHeight = domRect.height;
    this.mustMeasureContent = false;
    let result = 0, bias = 0;
    if (domRect.width && domRect.height) {
      let { scaleX, scaleY } = getScale(dom, domRect);
      if (scaleX > 5e-3 && Math.abs(this.scaleX - scaleX) > 5e-3 || scaleY > 5e-3 && Math.abs(this.scaleY - scaleY) > 5e-3) {
        this.scaleX = scaleX;
        this.scaleY = scaleY;
        result |= 8;
        refresh = measureContent = true;
      }
    }
    let paddingTop = (parseInt(style.paddingTop) || 0) * this.scaleY;
    let paddingBottom = (parseInt(style.paddingBottom) || 0) * this.scaleY;
    if (this.paddingTop != paddingTop || this.paddingBottom != paddingBottom) {
      this.paddingTop = paddingTop;
      this.paddingBottom = paddingBottom;
      result |= 8 | 2;
    }
    if (this.editorWidth != view.scrollDOM.clientWidth) {
      if (oracle.lineWrapping)
        measureContent = true;
      this.editorWidth = view.scrollDOM.clientWidth;
      result |= 8;
    }
    let scrollTop = view.scrollDOM.scrollTop * this.scaleY;
    if (this.scrollTop != scrollTop) {
      this.scrollAnchorHeight = -1;
      this.scrollTop = scrollTop;
    }
    this.scrolledToBottom = isScrolledToBottom(view.scrollDOM);
    let pixelViewport = (this.printing ? fullPixelRange : visiblePixelRange)(dom, this.paddingTop);
    let dTop = pixelViewport.top - this.pixelViewport.top, dBottom = pixelViewport.bottom - this.pixelViewport.bottom;
    this.pixelViewport = pixelViewport;
    let inView = this.pixelViewport.bottom > this.pixelViewport.top && this.pixelViewport.right > this.pixelViewport.left;
    if (inView != this.inView) {
      this.inView = inView;
      if (inView)
        measureContent = true;
    }
    if (!this.inView && !this.scrollTarget)
      return 0;
    let contentWidth = domRect.width;
    if (this.contentDOMWidth != contentWidth || this.editorHeight != view.scrollDOM.clientHeight) {
      this.contentDOMWidth = domRect.width;
      this.editorHeight = view.scrollDOM.clientHeight;
      result |= 8;
    }
    if (measureContent) {
      let lineHeights = view.docView.measureVisibleLineHeights(this.viewport);
      if (oracle.mustRefreshForHeights(lineHeights))
        refresh = true;
      if (refresh || oracle.lineWrapping && Math.abs(contentWidth - this.contentDOMWidth) > oracle.charWidth) {
        let { lineHeight, charWidth, textHeight } = view.docView.measureTextSize();
        refresh = lineHeight > 0 && oracle.refresh(whiteSpace, lineHeight, charWidth, textHeight, contentWidth / charWidth, lineHeights);
        if (refresh) {
          view.docView.minWidth = 0;
          result |= 8;
        }
      }
      if (dTop > 0 && dBottom > 0)
        bias = Math.max(dTop, dBottom);
      else if (dTop < 0 && dBottom < 0)
        bias = Math.min(dTop, dBottom);
      oracle.heightChanged = false;
      for (let vp of this.viewports) {
        let heights = vp.from == this.viewport.from ? lineHeights : view.docView.measureVisibleLineHeights(vp);
        this.heightMap = (refresh ? HeightMap.empty().applyChanges(this.stateDeco, Text.empty, this.heightOracle, [new ChangedRange(0, 0, 0, view.state.doc.length)]) : this.heightMap).updateHeight(oracle, 0, refresh, new MeasuredHeights(vp.from, heights));
      }
      if (oracle.heightChanged)
        result |= 2;
    }
    let viewportChange = !this.viewportIsAppropriate(this.viewport, bias) || this.scrollTarget && (this.scrollTarget.range.head < this.viewport.from || this.scrollTarget.range.head > this.viewport.to);
    if (viewportChange)
      this.viewport = this.getViewport(bias, this.scrollTarget);
    this.updateForViewport();
    if (result & 2 || viewportChange)
      this.updateViewportLines();
    if (this.lineGaps.length || this.viewport.to - this.viewport.from > 2e3 << 1)
      this.updateLineGaps(this.ensureLineGaps(refresh ? [] : this.lineGaps, view));
    result |= this.computeVisibleRanges();
    if (this.mustEnforceCursorAssoc) {
      this.mustEnforceCursorAssoc = false;
      view.docView.enforceCursorAssoc();
    }
    return result;
  }
  get visibleTop() {
    return this.scaler.fromDOM(this.pixelViewport.top);
  }
  get visibleBottom() {
    return this.scaler.fromDOM(this.pixelViewport.bottom);
  }
  getViewport(bias, scrollTarget) {
    let marginTop = 0.5 - Math.max(-0.5, Math.min(0.5, bias / 1e3 / 2));
    let map = this.heightMap, oracle = this.heightOracle;
    let { visibleTop, visibleBottom } = this;
    let viewport = new Viewport(map.lineAt(visibleTop - marginTop * 1e3, QueryType.ByHeight, oracle, 0, 0).from, map.lineAt(visibleBottom + (1 - marginTop) * 1e3, QueryType.ByHeight, oracle, 0, 0).to);
    if (scrollTarget) {
      let { head } = scrollTarget.range;
      if (head < viewport.from || head > viewport.to) {
        let viewHeight = Math.min(this.editorHeight, this.pixelViewport.bottom - this.pixelViewport.top);
        let block = map.lineAt(head, QueryType.ByPos, oracle, 0, 0), topPos;
        if (scrollTarget.y == "center")
          topPos = (block.top + block.bottom) / 2 - viewHeight / 2;
        else if (scrollTarget.y == "start" || scrollTarget.y == "nearest" && head < viewport.from)
          topPos = block.top;
        else
          topPos = block.bottom - viewHeight;
        viewport = new Viewport(map.lineAt(topPos - 1e3 / 2, QueryType.ByHeight, oracle, 0, 0).from, map.lineAt(topPos + viewHeight + 1e3 / 2, QueryType.ByHeight, oracle, 0, 0).to);
      }
    }
    return viewport;
  }
  mapViewport(viewport, changes) {
    let from = changes.mapPos(viewport.from, -1), to = changes.mapPos(viewport.to, 1);
    return new Viewport(this.heightMap.lineAt(from, QueryType.ByPos, this.heightOracle, 0, 0).from, this.heightMap.lineAt(to, QueryType.ByPos, this.heightOracle, 0, 0).to);
  }
  viewportIsAppropriate({ from, to }, bias = 0) {
    if (!this.inView)
      return true;
    let { top: top2 } = this.heightMap.lineAt(from, QueryType.ByPos, this.heightOracle, 0, 0);
    let { bottom } = this.heightMap.lineAt(to, QueryType.ByPos, this.heightOracle, 0, 0);
    let { visibleTop, visibleBottom } = this;
    return (from == 0 || top2 <= visibleTop - Math.max(10, Math.min(-bias, 250))) && (to == this.state.doc.length || bottom >= visibleBottom + Math.max(10, Math.min(bias, 250))) && (top2 > visibleTop - 2 * 1e3 && bottom < visibleBottom + 2 * 1e3);
  }
  mapLineGaps(gaps, changes) {
    if (!gaps.length || changes.empty)
      return gaps;
    let mapped = [];
    for (let gap of gaps)
      if (!changes.touchesRange(gap.from, gap.to))
        mapped.push(new LineGap(changes.mapPos(gap.from), changes.mapPos(gap.to), gap.size));
    return mapped;
  }
  ensureLineGaps(current, mayMeasure) {
    let wrapping = this.heightOracle.lineWrapping;
    let margin = wrapping ? 1e4 : 2e3, halfMargin = margin >> 1, doubleMargin = margin << 1;
    if (this.defaultTextDirection != Direction.LTR && !wrapping)
      return [];
    let gaps = [];
    let addGap = (from, to, line, structure) => {
      if (to - from < halfMargin)
        return;
      let sel = this.state.selection.main, avoid = [sel.from];
      if (!sel.empty)
        avoid.push(sel.to);
      for (let pos of avoid) {
        if (pos > from && pos < to) {
          addGap(from, pos - 10, line, structure);
          addGap(pos + 10, to, line, structure);
          return;
        }
      }
      let gap = find(current, (gap2) => gap2.from >= line.from && gap2.to <= line.to && Math.abs(gap2.from - from) < halfMargin && Math.abs(gap2.to - to) < halfMargin && !avoid.some((pos) => gap2.from < pos && gap2.to > pos));
      if (!gap) {
        if (to < line.to && mayMeasure && wrapping && mayMeasure.visibleRanges.some((r) => r.from <= to && r.to >= to)) {
          let lineStart = mayMeasure.moveToLineBoundary(EditorSelection.cursor(to), false, true).head;
          if (lineStart > from)
            to = lineStart;
        }
        gap = new LineGap(from, to, this.gapSize(line, from, to, structure));
      }
      gaps.push(gap);
    };
    for (let line of this.viewportLines) {
      if (line.length < doubleMargin)
        continue;
      let structure = lineStructure(line.from, line.to, this.stateDeco);
      if (structure.total < doubleMargin)
        continue;
      let target = this.scrollTarget ? this.scrollTarget.range.head : null;
      let viewFrom, viewTo;
      if (wrapping) {
        let marginHeight = margin / this.heightOracle.lineLength * this.heightOracle.lineHeight;
        let top2, bot;
        if (target != null) {
          let targetFrac = findFraction(structure, target);
          let spaceFrac = ((this.visibleBottom - this.visibleTop) / 2 + marginHeight) / line.height;
          top2 = targetFrac - spaceFrac;
          bot = targetFrac + spaceFrac;
        } else {
          top2 = (this.visibleTop - line.top - marginHeight) / line.height;
          bot = (this.visibleBottom - line.top + marginHeight) / line.height;
        }
        viewFrom = findPosition(structure, top2);
        viewTo = findPosition(structure, bot);
      } else {
        let totalWidth = structure.total * this.heightOracle.charWidth;
        let marginWidth = margin * this.heightOracle.charWidth;
        let left, right;
        if (target != null) {
          let targetFrac = findFraction(structure, target);
          let spaceFrac = ((this.pixelViewport.right - this.pixelViewport.left) / 2 + marginWidth) / totalWidth;
          left = targetFrac - spaceFrac;
          right = targetFrac + spaceFrac;
        } else {
          left = (this.pixelViewport.left - marginWidth) / totalWidth;
          right = (this.pixelViewport.right + marginWidth) / totalWidth;
        }
        viewFrom = findPosition(structure, left);
        viewTo = findPosition(structure, right);
      }
      if (viewFrom > line.from)
        addGap(line.from, viewFrom, line, structure);
      if (viewTo < line.to)
        addGap(viewTo, line.to, line, structure);
    }
    return gaps;
  }
  gapSize(line, from, to, structure) {
    let fraction = findFraction(structure, to) - findFraction(structure, from);
    if (this.heightOracle.lineWrapping) {
      return line.height * fraction;
    } else {
      return structure.total * this.heightOracle.charWidth * fraction;
    }
  }
  updateLineGaps(gaps) {
    if (!LineGap.same(gaps, this.lineGaps)) {
      this.lineGaps = gaps;
      this.lineGapDeco = Decoration.set(gaps.map((gap) => gap.draw(this, this.heightOracle.lineWrapping)));
    }
  }
  computeVisibleRanges() {
    let deco = this.stateDeco;
    if (this.lineGaps.length)
      deco = deco.concat(this.lineGapDeco);
    let ranges = [];
    RangeSet.spans(deco, this.viewport.from, this.viewport.to, {
      span(from, to) {
        ranges.push({ from, to });
      },
      point() {
      }
    }, 20);
    let changed = ranges.length != this.visibleRanges.length || this.visibleRanges.some((r, i) => r.from != ranges[i].from || r.to != ranges[i].to);
    this.visibleRanges = ranges;
    return changed ? 4 : 0;
  }
  lineBlockAt(pos) {
    return pos >= this.viewport.from && pos <= this.viewport.to && this.viewportLines.find((b) => b.from <= pos && b.to >= pos) || scaleBlock(this.heightMap.lineAt(pos, QueryType.ByPos, this.heightOracle, 0, 0), this.scaler);
  }
  lineBlockAtHeight(height) {
    return scaleBlock(this.heightMap.lineAt(this.scaler.fromDOM(height), QueryType.ByHeight, this.heightOracle, 0, 0), this.scaler);
  }
  scrollAnchorAt(scrollTop) {
    let block = this.lineBlockAtHeight(scrollTop + 8);
    return block.from >= this.viewport.from || this.viewportLines[0].top - scrollTop > 200 ? block : this.viewportLines[0];
  }
  elementAtHeight(height) {
    return scaleBlock(this.heightMap.blockAt(this.scaler.fromDOM(height), this.heightOracle, 0, 0), this.scaler);
  }
  get docHeight() {
    return this.scaler.toDOM(this.heightMap.height);
  }
  get contentHeight() {
    return this.docHeight + this.paddingTop + this.paddingBottom;
  }
};
var Viewport = class {
  constructor(from, to) {
    this.from = from;
    this.to = to;
  }
};
function lineStructure(from, to, stateDeco) {
  let ranges = [], pos = from, total = 0;
  RangeSet.spans(stateDeco, from, to, {
    span() {
    },
    point(from2, to2) {
      if (from2 > pos) {
        ranges.push({ from: pos, to: from2 });
        total += from2 - pos;
      }
      pos = to2;
    }
  }, 20);
  if (pos < to) {
    ranges.push({ from: pos, to });
    total += to - pos;
  }
  return { total, ranges };
}
function findPosition({ total, ranges }, ratio) {
  if (ratio <= 0)
    return ranges[0].from;
  if (ratio >= 1)
    return ranges[ranges.length - 1].to;
  let dist2 = Math.floor(total * ratio);
  for (let i = 0; ; i++) {
    let { from, to } = ranges[i], size = to - from;
    if (dist2 <= size)
      return from + dist2;
    dist2 -= size;
  }
}
function findFraction(structure, pos) {
  let counted = 0;
  for (let { from, to } of structure.ranges) {
    if (pos <= to) {
      counted += pos - from;
      break;
    }
    counted += to - from;
  }
  return counted / structure.total;
}
function find(array, f) {
  for (let val of array)
    if (f(val))
      return val;
  return void 0;
}
var IdScaler = {
  toDOM(n) {
    return n;
  },
  fromDOM(n) {
    return n;
  },
  scale: 1
};
var BigScaler = class {
  constructor(oracle, heightMap, viewports) {
    let vpHeight = 0, base2 = 0, domBase = 0;
    this.viewports = viewports.map(({ from, to }) => {
      let top2 = heightMap.lineAt(from, QueryType.ByPos, oracle, 0, 0).top;
      let bottom = heightMap.lineAt(to, QueryType.ByPos, oracle, 0, 0).bottom;
      vpHeight += bottom - top2;
      return { from, to, top: top2, bottom, domTop: 0, domBottom: 0 };
    });
    this.scale = (7e6 - vpHeight) / (heightMap.height - vpHeight);
    for (let obj of this.viewports) {
      obj.domTop = domBase + (obj.top - base2) * this.scale;
      domBase = obj.domBottom = obj.domTop + (obj.bottom - obj.top);
      base2 = obj.bottom;
    }
  }
  toDOM(n) {
    for (let i = 0, base2 = 0, domBase = 0; ; i++) {
      let vp = i < this.viewports.length ? this.viewports[i] : null;
      if (!vp || n < vp.top)
        return domBase + (n - base2) * this.scale;
      if (n <= vp.bottom)
        return vp.domTop + (n - vp.top);
      base2 = vp.bottom;
      domBase = vp.domBottom;
    }
  }
  fromDOM(n) {
    for (let i = 0, base2 = 0, domBase = 0; ; i++) {
      let vp = i < this.viewports.length ? this.viewports[i] : null;
      if (!vp || n < vp.domTop)
        return base2 + (n - domBase) / this.scale;
      if (n <= vp.domBottom)
        return vp.top + (n - vp.domTop);
      base2 = vp.bottom;
      domBase = vp.domBottom;
    }
  }
};
function scaleBlock(block, scaler) {
  if (scaler.scale == 1)
    return block;
  let bTop = scaler.toDOM(block.top), bBottom = scaler.toDOM(block.bottom);
  return new BlockInfo(block.from, block.length, bTop, bBottom - bTop, Array.isArray(block._content) ? block._content.map((b) => scaleBlock(b, scaler)) : block._content);
}
var theme = /* @__PURE__ */ Facet.define({ combine: (strs) => strs.join(" ") });
var darkTheme = /* @__PURE__ */ Facet.define({ combine: (values2) => values2.indexOf(true) > -1 });
var baseThemeID = /* @__PURE__ */ StyleModule.newName();
var baseLightID = /* @__PURE__ */ StyleModule.newName();
var baseDarkID = /* @__PURE__ */ StyleModule.newName();
var lightDarkIDs = { "&light": "." + baseLightID, "&dark": "." + baseDarkID };
function buildTheme(main, spec, scopes) {
  return new StyleModule(spec, {
    finish(sel) {
      return /&/.test(sel) ? sel.replace(/&\w*/, (m) => {
        if (m == "&")
          return main;
        if (!scopes || !scopes[m])
          throw new RangeError(`Unsupported selector: ${m}`);
        return scopes[m];
      }) : main + " " + sel;
    }
  });
}
var baseTheme$1 = /* @__PURE__ */ buildTheme("." + baseThemeID, {
  "&": {
    position: "relative !important",
    boxSizing: "border-box",
    "&.cm-focused": {
      outline: "1px dotted #212121"
    },
    display: "flex !important",
    flexDirection: "column"
  },
  ".cm-scroller": {
    display: "flex !important",
    alignItems: "flex-start !important",
    fontFamily: "monospace",
    lineHeight: 1.4,
    height: "100%",
    overflowX: "auto",
    position: "relative",
    zIndex: 0
  },
  ".cm-content": {
    margin: 0,
    flexGrow: 2,
    flexShrink: 0,
    display: "block",
    whiteSpace: "pre",
    wordWrap: "normal",
    boxSizing: "border-box",
    minHeight: "100%",
    padding: "4px 0",
    outline: "none",
    "&[contenteditable=true]": {
      WebkitUserModify: "read-write-plaintext-only"
    }
  },
  ".cm-lineWrapping": {
    whiteSpace_fallback: "pre-wrap",
    whiteSpace: "break-spaces",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
    flexShrink: 1
  },
  "&light .cm-content": { caretColor: "black" },
  "&dark .cm-content": { caretColor: "white" },
  ".cm-line": {
    display: "block",
    padding: "0 2px 0 6px"
  },
  ".cm-layer": {
    position: "absolute",
    left: 0,
    top: 0,
    contain: "size style",
    "& > *": {
      position: "absolute"
    }
  },
  "&light .cm-selectionBackground": {
    background: "#d9d9d9"
  },
  "&dark .cm-selectionBackground": {
    background: "#222"
  },
  "&light.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground": {
    background: "#d7d4f0"
  },
  "&dark.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground": {
    background: "#233"
  },
  ".cm-cursorLayer": {
    pointerEvents: "none"
  },
  "&.cm-focused > .cm-scroller > .cm-cursorLayer": {
    animation: "steps(1) cm-blink 1.2s infinite"
  },
  "@keyframes cm-blink": { "0%": {}, "50%": { opacity: 0 }, "100%": {} },
  "@keyframes cm-blink2": { "0%": {}, "50%": { opacity: 0 }, "100%": {} },
  ".cm-cursor, .cm-dropCursor": {
    borderLeft: "1.2px solid black",
    marginLeft: "-0.6px",
    pointerEvents: "none"
  },
  ".cm-cursor": {
    display: "none"
  },
  "&dark .cm-cursor": {
    borderLeftColor: "#444"
  },
  ".cm-dropCursor": {
    position: "absolute"
  },
  "&.cm-focused > .cm-scroller > .cm-cursorLayer .cm-cursor": {
    display: "block"
  },
  ".cm-iso": {
    unicodeBidi: "isolate"
  },
  ".cm-announced": {
    position: "fixed",
    top: "-10000px"
  },
  "@media print": {
    ".cm-announced": { display: "none" }
  },
  "&light .cm-activeLine": { backgroundColor: "#cceeff44" },
  "&dark .cm-activeLine": { backgroundColor: "#99eeff33" },
  "&light .cm-specialChar": { color: "red" },
  "&dark .cm-specialChar": { color: "#f78" },
  ".cm-gutters": {
    flexShrink: 0,
    display: "flex",
    height: "100%",
    boxSizing: "border-box",
    insetInlineStart: 0,
    zIndex: 200
  },
  "&light .cm-gutters": {
    backgroundColor: "#f5f5f5",
    color: "#6c6c6c",
    borderRight: "1px solid #ddd"
  },
  "&dark .cm-gutters": {
    backgroundColor: "#333338",
    color: "#ccc"
  },
  ".cm-gutter": {
    display: "flex !important",
    flexDirection: "column",
    flexShrink: 0,
    boxSizing: "border-box",
    minHeight: "100%",
    overflow: "hidden"
  },
  ".cm-gutterElement": {
    boxSizing: "border-box"
  },
  ".cm-lineNumbers .cm-gutterElement": {
    padding: "0 3px 0 5px",
    minWidth: "20px",
    textAlign: "right",
    whiteSpace: "nowrap"
  },
  "&light .cm-activeLineGutter": {
    backgroundColor: "#e2f2ff"
  },
  "&dark .cm-activeLineGutter": {
    backgroundColor: "#222227"
  },
  ".cm-panels": {
    boxSizing: "border-box",
    position: "sticky",
    left: 0,
    right: 0
  },
  "&light .cm-panels": {
    backgroundColor: "#f5f5f5",
    color: "black"
  },
  "&light .cm-panels-top": {
    borderBottom: "1px solid #ddd"
  },
  "&light .cm-panels-bottom": {
    borderTop: "1px solid #ddd"
  },
  "&dark .cm-panels": {
    backgroundColor: "#333338",
    color: "white"
  },
  ".cm-tab": {
    display: "inline-block",
    overflow: "hidden",
    verticalAlign: "bottom"
  },
  ".cm-widgetBuffer": {
    verticalAlign: "text-top",
    height: "1em",
    width: 0,
    display: "inline"
  },
  ".cm-placeholder": {
    color: "#888",
    display: "inline-block",
    verticalAlign: "top"
  },
  ".cm-highlightSpace:before": {
    content: "attr(data-display)",
    position: "absolute",
    pointerEvents: "none",
    color: "#888"
  },
  ".cm-highlightTab": {
    backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="20"><path stroke="%23888" stroke-width="1" fill="none" d="M1 10H196L190 5M190 15L196 10M197 4L197 16"/></svg>')`,
    backgroundSize: "auto 100%",
    backgroundPosition: "right 90%",
    backgroundRepeat: "no-repeat"
  },
  ".cm-trailingSpace": {
    backgroundColor: "#ff332255"
  },
  ".cm-button": {
    verticalAlign: "middle",
    color: "inherit",
    fontSize: "70%",
    padding: ".2em 1em",
    borderRadius: "1px"
  },
  "&light .cm-button": {
    backgroundImage: "linear-gradient(#eff1f5, #d9d9df)",
    border: "1px solid #888",
    "&:active": {
      backgroundImage: "linear-gradient(#b4b4b4, #d0d3d6)"
    }
  },
  "&dark .cm-button": {
    backgroundImage: "linear-gradient(#393939, #111)",
    border: "1px solid #888",
    "&:active": {
      backgroundImage: "linear-gradient(#111, #333)"
    }
  },
  ".cm-textfield": {
    verticalAlign: "middle",
    color: "inherit",
    fontSize: "70%",
    border: "1px solid silver",
    padding: ".2em .5em"
  },
  "&light .cm-textfield": {
    backgroundColor: "white"
  },
  "&dark .cm-textfield": {
    border: "1px solid #555",
    backgroundColor: "inherit"
  }
}, lightDarkIDs);
var LineBreakPlaceholder = "\uFFFF";
var DOMReader = class {
  constructor(points, state) {
    this.points = points;
    this.text = "";
    this.lineSeparator = state.facet(EditorState.lineSeparator);
  }
  append(text) {
    this.text += text;
  }
  lineBreak() {
    this.text += LineBreakPlaceholder;
  }
  readRange(start, end) {
    if (!start)
      return this;
    let parent = start.parentNode;
    for (let cur = start; ; ) {
      this.findPointBefore(parent, cur);
      let oldLen = this.text.length;
      this.readNode(cur);
      let next = cur.nextSibling;
      if (next == end)
        break;
      let view = ContentView.get(cur), nextView = ContentView.get(next);
      if (view && nextView ? view.breakAfter : (view ? view.breakAfter : isBlockElement(cur)) || isBlockElement(next) && (cur.nodeName != "BR" || cur.cmIgnore) && this.text.length > oldLen)
        this.lineBreak();
      cur = next;
    }
    this.findPointBefore(parent, end);
    return this;
  }
  readTextNode(node) {
    let text = node.nodeValue;
    for (let point of this.points)
      if (point.node == node)
        point.pos = this.text.length + Math.min(point.offset, text.length);
    for (let off = 0, re = this.lineSeparator ? null : /\r\n?|\n/g; ; ) {
      let nextBreak = -1, breakSize = 1, m;
      if (this.lineSeparator) {
        nextBreak = text.indexOf(this.lineSeparator, off);
        breakSize = this.lineSeparator.length;
      } else if (m = re.exec(text)) {
        nextBreak = m.index;
        breakSize = m[0].length;
      }
      this.append(text.slice(off, nextBreak < 0 ? text.length : nextBreak));
      if (nextBreak < 0)
        break;
      this.lineBreak();
      if (breakSize > 1) {
        for (let point of this.points)
          if (point.node == node && point.pos > this.text.length)
            point.pos -= breakSize - 1;
      }
      off = nextBreak + breakSize;
    }
  }
  readNode(node) {
    if (node.cmIgnore)
      return;
    let view = ContentView.get(node);
    let fromView = view && view.overrideDOMText;
    if (fromView != null) {
      this.findPointInside(node, fromView.length);
      for (let i = fromView.iter(); !i.next().done; ) {
        if (i.lineBreak)
          this.lineBreak();
        else
          this.append(i.value);
      }
    } else if (node.nodeType == 3) {
      this.readTextNode(node);
    } else if (node.nodeName == "BR") {
      if (node.nextSibling)
        this.lineBreak();
    } else if (node.nodeType == 1) {
      this.readRange(node.firstChild, null);
    }
  }
  findPointBefore(node, next) {
    for (let point of this.points)
      if (point.node == node && node.childNodes[point.offset] == next)
        point.pos = this.text.length;
  }
  findPointInside(node, length) {
    for (let point of this.points)
      if (node.nodeType == 3 ? point.node == node : node.contains(point.node))
        point.pos = this.text.length + (isAtEnd(node, point.node, point.offset) ? length : 0);
  }
};
function isAtEnd(parent, node, offset) {
  for (; ; ) {
    if (!node || offset < maxOffset(node))
      return false;
    if (node == parent)
      return true;
    offset = domIndex(node) + 1;
    node = node.parentNode;
  }
}
var DOMPoint = class {
  constructor(node, offset) {
    this.node = node;
    this.offset = offset;
    this.pos = -1;
  }
};
var DOMChange = class {
  constructor(view, start, end, typeOver) {
    this.typeOver = typeOver;
    this.bounds = null;
    this.text = "";
    let { impreciseHead: iHead, impreciseAnchor: iAnchor } = view.docView;
    if (view.state.readOnly && start > -1) {
      this.newSel = null;
    } else if (start > -1 && (this.bounds = view.docView.domBoundsAround(start, end, 0))) {
      let selPoints = iHead || iAnchor ? [] : selectionPoints(view);
      let reader = new DOMReader(selPoints, view.state);
      reader.readRange(this.bounds.startDOM, this.bounds.endDOM);
      this.text = reader.text;
      this.newSel = selectionFromPoints(selPoints, this.bounds.from);
    } else {
      let domSel = view.observer.selectionRange;
      let head = iHead && iHead.node == domSel.focusNode && iHead.offset == domSel.focusOffset || !contains(view.contentDOM, domSel.focusNode) ? view.state.selection.main.head : view.docView.posFromDOM(domSel.focusNode, domSel.focusOffset);
      let anchor = iAnchor && iAnchor.node == domSel.anchorNode && iAnchor.offset == domSel.anchorOffset || !contains(view.contentDOM, domSel.anchorNode) ? view.state.selection.main.anchor : view.docView.posFromDOM(domSel.anchorNode, domSel.anchorOffset);
      let vp = view.viewport;
      if ((browser.ios || browser.chrome) && view.state.selection.main.empty && head != anchor && (vp.from > 0 || vp.to < view.state.doc.length)) {
        let from = Math.min(head, anchor), to = Math.max(head, anchor);
        let offFrom = vp.from - from, offTo = vp.to - to;
        if ((offFrom == 0 || offFrom == 1 || from == 0) && (offTo == 0 || offTo == -1 || to == view.state.doc.length)) {
          head = 0;
          anchor = view.state.doc.length;
        }
      }
      this.newSel = EditorSelection.single(anchor, head);
    }
  }
};
function applyDOMChange(view, domChange) {
  let change;
  let { newSel } = domChange, sel = view.state.selection.main;
  let lastKey = view.inputState.lastKeyTime > Date.now() - 100 ? view.inputState.lastKeyCode : -1;
  if (domChange.bounds) {
    let { from, to } = domChange.bounds;
    let preferredPos = sel.from, preferredSide = null;
    if (lastKey === 8 || browser.android && domChange.text.length < to - from) {
      preferredPos = sel.to;
      preferredSide = "end";
    }
    let diff = findDiff(view.state.doc.sliceString(from, to, LineBreakPlaceholder), domChange.text, preferredPos - from, preferredSide);
    if (diff) {
      if (browser.chrome && lastKey == 13 && diff.toB == diff.from + 2 && domChange.text.slice(diff.from, diff.toB) == LineBreakPlaceholder + LineBreakPlaceholder)
        diff.toB--;
      change = {
        from: from + diff.from,
        to: from + diff.toA,
        insert: Text.of(domChange.text.slice(diff.from, diff.toB).split(LineBreakPlaceholder))
      };
    }
  } else if (newSel && (!view.hasFocus && view.state.facet(editable) || newSel.main.eq(sel))) {
    newSel = null;
  }
  if (!change && !newSel)
    return false;
  if (!change && domChange.typeOver && !sel.empty && newSel && newSel.main.empty) {
    change = { from: sel.from, to: sel.to, insert: view.state.doc.slice(sel.from, sel.to) };
  } else if (change && change.from >= sel.from && change.to <= sel.to && (change.from != sel.from || change.to != sel.to) && sel.to - sel.from - (change.to - change.from) <= 4) {
    change = {
      from: sel.from,
      to: sel.to,
      insert: view.state.doc.slice(sel.from, change.from).append(change.insert).append(view.state.doc.slice(change.to, sel.to))
    };
  } else if ((browser.mac || browser.android) && change && change.from == change.to && change.from == sel.head - 1 && /^\. ?$/.test(change.insert.toString()) && view.contentDOM.getAttribute("autocorrect") == "off") {
    if (newSel && change.insert.length == 2)
      newSel = EditorSelection.single(newSel.main.anchor - 1, newSel.main.head - 1);
    change = { from: sel.from, to: sel.to, insert: Text.of([" "]) };
  } else if (browser.chrome && change && change.from == change.to && change.from == sel.head && change.insert.toString() == "\n " && view.lineWrapping) {
    if (newSel)
      newSel = EditorSelection.single(newSel.main.anchor - 1, newSel.main.head - 1);
    change = { from: sel.from, to: sel.to, insert: Text.of([" "]) };
  }
  if (change) {
    if (browser.ios && view.inputState.flushIOSKey(change))
      return true;
    if (browser.android && (change.to == sel.to && (change.from == sel.from || change.from == sel.from - 1 && view.state.sliceDoc(change.from, sel.from) == " ") && change.insert.length == 1 && change.insert.lines == 2 && dispatchKey(view.contentDOM, "Enter", 13) || (change.from == sel.from - 1 && change.to == sel.to && change.insert.length == 0 || lastKey == 8 && change.insert.length < change.to - change.from && change.to > sel.head) && dispatchKey(view.contentDOM, "Backspace", 8) || change.from == sel.from && change.to == sel.to + 1 && change.insert.length == 0 && dispatchKey(view.contentDOM, "Delete", 46)))
      return true;
    let text = change.insert.toString();
    if (view.inputState.composing >= 0)
      view.inputState.composing++;
    let defaultTr;
    let defaultInsert = () => defaultTr || (defaultTr = applyDefaultInsert(view, change, newSel));
    if (!view.state.facet(inputHandler).some((h) => h(view, change.from, change.to, text, defaultInsert)))
      view.dispatch(defaultInsert());
    return true;
  } else if (newSel && !newSel.main.eq(sel)) {
    let scrollIntoView2 = false, userEvent = "select";
    if (view.inputState.lastSelectionTime > Date.now() - 50) {
      if (view.inputState.lastSelectionOrigin == "select")
        scrollIntoView2 = true;
      userEvent = view.inputState.lastSelectionOrigin;
    }
    view.dispatch({ selection: newSel, scrollIntoView: scrollIntoView2, userEvent });
    return true;
  } else {
    return false;
  }
}
function applyDefaultInsert(view, change, newSel) {
  let tr, startState = view.state, sel = startState.selection.main;
  if (change.from >= sel.from && change.to <= sel.to && change.to - change.from >= (sel.to - sel.from) / 3 && (!newSel || newSel.main.empty && newSel.main.from == change.from + change.insert.length) && view.inputState.composing < 0) {
    let before = sel.from < change.from ? startState.sliceDoc(sel.from, change.from) : "";
    let after = sel.to > change.to ? startState.sliceDoc(change.to, sel.to) : "";
    tr = startState.replaceSelection(view.state.toText(before + change.insert.sliceString(0, void 0, view.state.lineBreak) + after));
  } else {
    let changes = startState.changes(change);
    let mainSel = newSel && newSel.main.to <= changes.newLength ? newSel.main : void 0;
    if (startState.selection.ranges.length > 1 && view.inputState.composing >= 0 && change.to <= sel.to && change.to >= sel.to - 10) {
      let replaced = view.state.sliceDoc(change.from, change.to);
      let compositionRange, composition = newSel && findCompositionNode(view, newSel.main.head);
      if (composition) {
        let dLen = change.insert.length - (change.to - change.from);
        compositionRange = { from: composition.from, to: composition.to - dLen };
      } else {
        compositionRange = view.state.doc.lineAt(sel.head);
      }
      let offset = sel.to - change.to, size = sel.to - sel.from;
      tr = startState.changeByRange((range) => {
        if (range.from == sel.from && range.to == sel.to)
          return { changes, range: mainSel || range.map(changes) };
        let to = range.to - offset, from = to - replaced.length;
        if (range.to - range.from != size || view.state.sliceDoc(from, to) != replaced || range.to >= compositionRange.from && range.from <= compositionRange.to)
          return { range };
        let rangeChanges = startState.changes({ from, to, insert: change.insert }), selOff = range.to - sel.to;
        return {
          changes: rangeChanges,
          range: !mainSel ? range.map(rangeChanges) : EditorSelection.range(Math.max(0, mainSel.anchor + selOff), Math.max(0, mainSel.head + selOff))
        };
      });
    } else {
      tr = {
        changes,
        selection: mainSel && startState.selection.replaceRange(mainSel)
      };
    }
  }
  let userEvent = "input.type";
  if (view.composing || view.inputState.compositionPendingChange && view.inputState.compositionEndedAt > Date.now() - 50) {
    view.inputState.compositionPendingChange = false;
    userEvent += ".compose";
    if (view.inputState.compositionFirstChange) {
      userEvent += ".start";
      view.inputState.compositionFirstChange = false;
    }
  }
  return startState.update(tr, { userEvent, scrollIntoView: true });
}
function findDiff(a, b, preferredPos, preferredSide) {
  let minLen = Math.min(a.length, b.length);
  let from = 0;
  while (from < minLen && a.charCodeAt(from) == b.charCodeAt(from))
    from++;
  if (from == minLen && a.length == b.length)
    return null;
  let toA = a.length, toB = b.length;
  while (toA > 0 && toB > 0 && a.charCodeAt(toA - 1) == b.charCodeAt(toB - 1)) {
    toA--;
    toB--;
  }
  if (preferredSide == "end") {
    let adjust = Math.max(0, from - Math.min(toA, toB));
    preferredPos -= toA + adjust - from;
  }
  if (toA < from && a.length < b.length) {
    let move = preferredPos <= from && preferredPos >= toA ? from - preferredPos : 0;
    from -= move;
    toB = from + (toB - toA);
    toA = from;
  } else if (toB < from) {
    let move = preferredPos <= from && preferredPos >= toB ? from - preferredPos : 0;
    from -= move;
    toA = from + (toA - toB);
    toB = from;
  }
  return { from, toA, toB };
}
function selectionPoints(view) {
  let result = [];
  if (view.root.activeElement != view.contentDOM)
    return result;
  let { anchorNode, anchorOffset, focusNode, focusOffset } = view.observer.selectionRange;
  if (anchorNode) {
    result.push(new DOMPoint(anchorNode, anchorOffset));
    if (focusNode != anchorNode || focusOffset != anchorOffset)
      result.push(new DOMPoint(focusNode, focusOffset));
  }
  return result;
}
function selectionFromPoints(points, base2) {
  if (points.length == 0)
    return null;
  let anchor = points[0].pos, head = points.length == 2 ? points[1].pos : anchor;
  return anchor > -1 && head > -1 ? EditorSelection.single(anchor + base2, head + base2) : null;
}
var observeOptions = {
  childList: true,
  characterData: true,
  subtree: true,
  attributes: true,
  characterDataOldValue: true
};
var useCharData = browser.ie && browser.ie_version <= 11;
var DOMObserver = class {
  constructor(view) {
    this.view = view;
    this.active = false;
    this.selectionRange = new DOMSelectionState();
    this.selectionChanged = false;
    this.delayedFlush = -1;
    this.resizeTimeout = -1;
    this.queue = [];
    this.delayedAndroidKey = null;
    this.flushingAndroidKey = -1;
    this.lastChange = 0;
    this.scrollTargets = [];
    this.intersection = null;
    this.resizeScroll = null;
    this.intersecting = false;
    this.gapIntersection = null;
    this.gaps = [];
    this.printQuery = null;
    this.parentCheck = -1;
    this.dom = view.contentDOM;
    this.observer = new MutationObserver((mutations) => {
      for (let mut of mutations)
        this.queue.push(mut);
      if ((browser.ie && browser.ie_version <= 11 || browser.ios && view.composing) && mutations.some((m) => m.type == "childList" && m.removedNodes.length || m.type == "characterData" && m.oldValue.length > m.target.nodeValue.length))
        this.flushSoon();
      else
        this.flush();
    });
    if (useCharData)
      this.onCharData = (event) => {
        this.queue.push({
          target: event.target,
          type: "characterData",
          oldValue: event.prevValue
        });
        this.flushSoon();
      };
    this.onSelectionChange = this.onSelectionChange.bind(this);
    this.onResize = this.onResize.bind(this);
    this.onPrint = this.onPrint.bind(this);
    this.onScroll = this.onScroll.bind(this);
    if (window.matchMedia)
      this.printQuery = window.matchMedia("print");
    if (typeof ResizeObserver == "function") {
      this.resizeScroll = new ResizeObserver(() => {
        var _a2;
        if (((_a2 = this.view.docView) === null || _a2 === void 0 ? void 0 : _a2.lastUpdate) < Date.now() - 75)
          this.onResize();
      });
      this.resizeScroll.observe(view.scrollDOM);
    }
    this.addWindowListeners(this.win = view.win);
    this.start();
    if (typeof IntersectionObserver == "function") {
      this.intersection = new IntersectionObserver((entries) => {
        if (this.parentCheck < 0)
          this.parentCheck = setTimeout(this.listenForScroll.bind(this), 1e3);
        if (entries.length > 0 && entries[entries.length - 1].intersectionRatio > 0 != this.intersecting) {
          this.intersecting = !this.intersecting;
          if (this.intersecting != this.view.inView)
            this.onScrollChanged(document.createEvent("Event"));
        }
      }, { threshold: [0, 1e-3] });
      this.intersection.observe(this.dom);
      this.gapIntersection = new IntersectionObserver((entries) => {
        if (entries.length > 0 && entries[entries.length - 1].intersectionRatio > 0)
          this.onScrollChanged(document.createEvent("Event"));
      }, {});
    }
    this.listenForScroll();
    this.readSelectionRange();
  }
  onScrollChanged(e) {
    this.view.inputState.runHandlers("scroll", e);
    if (this.intersecting)
      this.view.measure();
  }
  onScroll(e) {
    if (this.intersecting)
      this.flush(false);
    this.onScrollChanged(e);
  }
  onResize() {
    if (this.resizeTimeout < 0)
      this.resizeTimeout = setTimeout(() => {
        this.resizeTimeout = -1;
        this.view.requestMeasure();
      }, 50);
  }
  onPrint(event) {
    if (event.type == "change" && !event.matches)
      return;
    this.view.viewState.printing = true;
    this.view.measure();
    setTimeout(() => {
      this.view.viewState.printing = false;
      this.view.requestMeasure();
    }, 500);
  }
  updateGaps(gaps) {
    if (this.gapIntersection && (gaps.length != this.gaps.length || this.gaps.some((g, i) => g != gaps[i]))) {
      this.gapIntersection.disconnect();
      for (let gap of gaps)
        this.gapIntersection.observe(gap);
      this.gaps = gaps;
    }
  }
  onSelectionChange(event) {
    let wasChanged = this.selectionChanged;
    if (!this.readSelectionRange() || this.delayedAndroidKey)
      return;
    let { view } = this, sel = this.selectionRange;
    if (view.state.facet(editable) ? view.root.activeElement != this.dom : !hasSelection(view.dom, sel))
      return;
    let context = sel.anchorNode && view.docView.nearest(sel.anchorNode);
    if (context && context.ignoreEvent(event)) {
      if (!wasChanged)
        this.selectionChanged = false;
      return;
    }
    if ((browser.ie && browser.ie_version <= 11 || browser.android && browser.chrome) && !view.state.selection.main.empty && sel.focusNode && isEquivalentPosition(sel.focusNode, sel.focusOffset, sel.anchorNode, sel.anchorOffset))
      this.flushSoon();
    else
      this.flush(false);
  }
  readSelectionRange() {
    let { view } = this;
    let range = browser.safari && view.root.nodeType == 11 && deepActiveElement(this.dom.ownerDocument) == this.dom && safariSelectionRangeHack(this.view) || getSelection(view.root);
    if (!range || this.selectionRange.eq(range))
      return false;
    let local = hasSelection(this.dom, range);
    if (local && !this.selectionChanged && view.inputState.lastFocusTime > Date.now() - 200 && view.inputState.lastTouchTime < Date.now() - 300 && atElementStart(this.dom, range)) {
      this.view.inputState.lastFocusTime = 0;
      view.docView.updateSelection();
      return false;
    }
    this.selectionRange.setRange(range);
    if (local)
      this.selectionChanged = true;
    return true;
  }
  setSelectionRange(anchor, head) {
    this.selectionRange.set(anchor.node, anchor.offset, head.node, head.offset);
    this.selectionChanged = false;
  }
  clearSelectionRange() {
    this.selectionRange.set(null, 0, null, 0);
  }
  listenForScroll() {
    this.parentCheck = -1;
    let i = 0, changed = null;
    for (let dom = this.dom; dom; ) {
      if (dom.nodeType == 1) {
        if (!changed && i < this.scrollTargets.length && this.scrollTargets[i] == dom)
          i++;
        else if (!changed)
          changed = this.scrollTargets.slice(0, i);
        if (changed)
          changed.push(dom);
        dom = dom.assignedSlot || dom.parentNode;
      } else if (dom.nodeType == 11) {
        dom = dom.host;
      } else {
        break;
      }
    }
    if (i < this.scrollTargets.length && !changed)
      changed = this.scrollTargets.slice(0, i);
    if (changed) {
      for (let dom of this.scrollTargets)
        dom.removeEventListener("scroll", this.onScroll);
      for (let dom of this.scrollTargets = changed)
        dom.addEventListener("scroll", this.onScroll);
    }
  }
  ignore(f) {
    if (!this.active)
      return f();
    try {
      this.stop();
      return f();
    } finally {
      this.start();
      this.clear();
    }
  }
  start() {
    if (this.active)
      return;
    this.observer.observe(this.dom, observeOptions);
    if (useCharData)
      this.dom.addEventListener("DOMCharacterDataModified", this.onCharData);
    this.active = true;
  }
  stop() {
    if (!this.active)
      return;
    this.active = false;
    this.observer.disconnect();
    if (useCharData)
      this.dom.removeEventListener("DOMCharacterDataModified", this.onCharData);
  }
  clear() {
    this.processRecords();
    this.queue.length = 0;
    this.selectionChanged = false;
  }
  delayAndroidKey(key, keyCode) {
    var _a2;
    if (!this.delayedAndroidKey) {
      let flush = () => {
        let key2 = this.delayedAndroidKey;
        if (key2) {
          this.clearDelayedAndroidKey();
          this.view.inputState.lastKeyCode = key2.keyCode;
          this.view.inputState.lastKeyTime = Date.now();
          let flushed = this.flush();
          if (!flushed && key2.force)
            dispatchKey(this.dom, key2.key, key2.keyCode);
        }
      };
      this.flushingAndroidKey = this.view.win.requestAnimationFrame(flush);
    }
    if (!this.delayedAndroidKey || key == "Enter")
      this.delayedAndroidKey = {
        key,
        keyCode,
        force: this.lastChange < Date.now() - 50 || !!((_a2 = this.delayedAndroidKey) === null || _a2 === void 0 ? void 0 : _a2.force)
      };
  }
  clearDelayedAndroidKey() {
    this.win.cancelAnimationFrame(this.flushingAndroidKey);
    this.delayedAndroidKey = null;
    this.flushingAndroidKey = -1;
  }
  flushSoon() {
    if (this.delayedFlush < 0)
      this.delayedFlush = this.view.win.requestAnimationFrame(() => {
        this.delayedFlush = -1;
        this.flush();
      });
  }
  forceFlush() {
    if (this.delayedFlush >= 0) {
      this.view.win.cancelAnimationFrame(this.delayedFlush);
      this.delayedFlush = -1;
    }
    this.flush();
  }
  pendingRecords() {
    for (let mut of this.observer.takeRecords())
      this.queue.push(mut);
    return this.queue;
  }
  processRecords() {
    let records = this.pendingRecords();
    if (records.length)
      this.queue = [];
    let from = -1, to = -1, typeOver = false;
    for (let record of records) {
      let range = this.readMutation(record);
      if (!range)
        continue;
      if (range.typeOver)
        typeOver = true;
      if (from == -1) {
        ({ from, to } = range);
      } else {
        from = Math.min(range.from, from);
        to = Math.max(range.to, to);
      }
    }
    return { from, to, typeOver };
  }
  readChange() {
    let { from, to, typeOver } = this.processRecords();
    let newSel = this.selectionChanged && hasSelection(this.dom, this.selectionRange);
    if (from < 0 && !newSel)
      return null;
    if (from > -1)
      this.lastChange = Date.now();
    this.view.inputState.lastFocusTime = 0;
    this.selectionChanged = false;
    let change = new DOMChange(this.view, from, to, typeOver);
    this.view.docView.domChanged = { newSel: change.newSel ? change.newSel.main : null };
    return change;
  }
  flush(readSelection = true) {
    if (this.delayedFlush >= 0 || this.delayedAndroidKey)
      return false;
    if (readSelection)
      this.readSelectionRange();
    let domChange = this.readChange();
    if (!domChange) {
      this.view.requestMeasure();
      return false;
    }
    let startState = this.view.state;
    let handled = applyDOMChange(this.view, domChange);
    if (this.view.state == startState)
      this.view.update([]);
    return handled;
  }
  readMutation(rec) {
    let cView = this.view.docView.nearest(rec.target);
    if (!cView || cView.ignoreMutation(rec))
      return null;
    cView.markDirty(rec.type == "attributes");
    if (rec.type == "attributes")
      cView.flags |= 4;
    if (rec.type == "childList") {
      let childBefore = findChild(cView, rec.previousSibling || rec.target.previousSibling, -1);
      let childAfter = findChild(cView, rec.nextSibling || rec.target.nextSibling, 1);
      return {
        from: childBefore ? cView.posAfter(childBefore) : cView.posAtStart,
        to: childAfter ? cView.posBefore(childAfter) : cView.posAtEnd,
        typeOver: false
      };
    } else if (rec.type == "characterData") {
      return { from: cView.posAtStart, to: cView.posAtEnd, typeOver: rec.target.nodeValue == rec.oldValue };
    } else {
      return null;
    }
  }
  setWindow(win) {
    if (win != this.win) {
      this.removeWindowListeners(this.win);
      this.win = win;
      this.addWindowListeners(this.win);
    }
  }
  addWindowListeners(win) {
    win.addEventListener("resize", this.onResize);
    if (this.printQuery)
      this.printQuery.addEventListener("change", this.onPrint);
    else
      win.addEventListener("beforeprint", this.onPrint);
    win.addEventListener("scroll", this.onScroll);
    win.document.addEventListener("selectionchange", this.onSelectionChange);
  }
  removeWindowListeners(win) {
    win.removeEventListener("scroll", this.onScroll);
    win.removeEventListener("resize", this.onResize);
    if (this.printQuery)
      this.printQuery.removeEventListener("change", this.onPrint);
    else
      win.removeEventListener("beforeprint", this.onPrint);
    win.document.removeEventListener("selectionchange", this.onSelectionChange);
  }
  destroy() {
    var _a2, _b, _c;
    this.stop();
    (_a2 = this.intersection) === null || _a2 === void 0 ? void 0 : _a2.disconnect();
    (_b = this.gapIntersection) === null || _b === void 0 ? void 0 : _b.disconnect();
    (_c = this.resizeScroll) === null || _c === void 0 ? void 0 : _c.disconnect();
    for (let dom of this.scrollTargets)
      dom.removeEventListener("scroll", this.onScroll);
    this.removeWindowListeners(this.win);
    clearTimeout(this.parentCheck);
    clearTimeout(this.resizeTimeout);
    this.win.cancelAnimationFrame(this.delayedFlush);
    this.win.cancelAnimationFrame(this.flushingAndroidKey);
  }
};
function findChild(cView, dom, dir) {
  while (dom) {
    let curView = ContentView.get(dom);
    if (curView && curView.parent == cView)
      return curView;
    let parent = dom.parentNode;
    dom = parent != cView.dom ? parent : dir > 0 ? dom.nextSibling : dom.previousSibling;
  }
  return null;
}
function safariSelectionRangeHack(view) {
  let found = null;
  function read(event) {
    event.preventDefault();
    event.stopImmediatePropagation();
    found = event.getTargetRanges()[0];
  }
  view.contentDOM.addEventListener("beforeinput", read, true);
  view.dom.ownerDocument.execCommand("indent");
  view.contentDOM.removeEventListener("beforeinput", read, true);
  if (!found)
    return null;
  let anchorNode = found.startContainer, anchorOffset = found.startOffset;
  let focusNode = found.endContainer, focusOffset = found.endOffset;
  let curAnchor = view.docView.domAtPos(view.state.selection.main.anchor);
  if (isEquivalentPosition(curAnchor.node, curAnchor.offset, focusNode, focusOffset))
    [anchorNode, anchorOffset, focusNode, focusOffset] = [focusNode, focusOffset, anchorNode, anchorOffset];
  return { anchorNode, anchorOffset, focusNode, focusOffset };
}
var EditorView = class {
  get state() {
    return this.viewState.state;
  }
  get viewport() {
    return this.viewState.viewport;
  }
  get visibleRanges() {
    return this.viewState.visibleRanges;
  }
  get inView() {
    return this.viewState.inView;
  }
  get composing() {
    return this.inputState.composing > 0;
  }
  get compositionStarted() {
    return this.inputState.composing >= 0;
  }
  get root() {
    return this._root;
  }
  get win() {
    return this.dom.ownerDocument.defaultView || window;
  }
  constructor(config = {}) {
    this.plugins = [];
    this.pluginMap = new Map();
    this.editorAttrs = {};
    this.contentAttrs = {};
    this.bidiCache = [];
    this.destroyed = false;
    this.updateState = 2;
    this.measureScheduled = -1;
    this.measureRequests = [];
    this.contentDOM = document.createElement("div");
    this.scrollDOM = document.createElement("div");
    this.scrollDOM.tabIndex = -1;
    this.scrollDOM.className = "cm-scroller";
    this.scrollDOM.appendChild(this.contentDOM);
    this.announceDOM = document.createElement("div");
    this.announceDOM.className = "cm-announced";
    this.announceDOM.setAttribute("aria-live", "polite");
    this.dom = document.createElement("div");
    this.dom.appendChild(this.announceDOM);
    this.dom.appendChild(this.scrollDOM);
    if (config.parent)
      config.parent.appendChild(this.dom);
    let { dispatch } = config;
    this.dispatchTransactions = config.dispatchTransactions || dispatch && ((trs) => trs.forEach((tr) => dispatch(tr, this))) || ((trs) => this.update(trs));
    this.dispatch = this.dispatch.bind(this);
    this._root = config.root || getRoot(config.parent) || document;
    this.viewState = new ViewState(config.state || EditorState.create(config));
    if (config.scrollTo && config.scrollTo.is(scrollIntoView))
      this.viewState.scrollTarget = config.scrollTo.value.clip(this.viewState.state);
    this.plugins = this.state.facet(viewPlugin).map((spec) => new PluginInstance(spec));
    for (let plugin of this.plugins)
      plugin.update(this);
    this.observer = new DOMObserver(this);
    this.inputState = new InputState(this);
    this.inputState.ensureHandlers(this.plugins);
    this.docView = new DocView(this);
    this.mountStyles();
    this.updateAttrs();
    this.updateState = 0;
    this.requestMeasure();
  }
  dispatch(...input) {
    let trs = input.length == 1 && input[0] instanceof Transaction ? input : input.length == 1 && Array.isArray(input[0]) ? input[0] : [this.state.update(...input)];
    this.dispatchTransactions(trs, this);
  }
  update(transactions) {
    if (this.updateState != 0)
      throw new Error("Calls to EditorView.update are not allowed while an update is in progress");
    let redrawn = false, attrsChanged = false, update;
    let state = this.state;
    for (let tr of transactions) {
      if (tr.startState != state)
        throw new RangeError("Trying to update state with a transaction that doesn't start from the previous state.");
      state = tr.state;
    }
    if (this.destroyed) {
      this.viewState.state = state;
      return;
    }
    let focus = this.hasFocus, focusFlag = 0, dispatchFocus = null;
    if (transactions.some((tr) => tr.annotation(isFocusChange))) {
      this.inputState.notifiedFocused = focus;
      focusFlag = 1;
    } else if (focus != this.inputState.notifiedFocused) {
      this.inputState.notifiedFocused = focus;
      dispatchFocus = focusChangeTransaction(state, focus);
      if (!dispatchFocus)
        focusFlag = 1;
    }
    let pendingKey = this.observer.delayedAndroidKey, domChange = null;
    if (pendingKey) {
      this.observer.clearDelayedAndroidKey();
      domChange = this.observer.readChange();
      if (domChange && !this.state.doc.eq(state.doc) || !this.state.selection.eq(state.selection))
        domChange = null;
    } else {
      this.observer.clear();
    }
    if (state.facet(EditorState.phrases) != this.state.facet(EditorState.phrases))
      return this.setState(state);
    update = ViewUpdate.create(this, state, transactions);
    update.flags |= focusFlag;
    let scrollTarget = this.viewState.scrollTarget;
    try {
      this.updateState = 2;
      for (let tr of transactions) {
        if (scrollTarget)
          scrollTarget = scrollTarget.map(tr.changes);
        if (tr.scrollIntoView) {
          let { main } = tr.state.selection;
          scrollTarget = new ScrollTarget(main.empty ? main : EditorSelection.cursor(main.head, main.head > main.anchor ? -1 : 1));
        }
        for (let e of tr.effects)
          if (e.is(scrollIntoView))
            scrollTarget = e.value.clip(this.state);
      }
      this.viewState.update(update, scrollTarget);
      this.bidiCache = CachedOrder.update(this.bidiCache, update.changes);
      if (!update.empty) {
        this.updatePlugins(update);
        this.inputState.update(update);
      }
      redrawn = this.docView.update(update);
      if (this.state.facet(styleModule) != this.styleModules)
        this.mountStyles();
      attrsChanged = this.updateAttrs();
      this.showAnnouncements(transactions);
      this.docView.updateSelection(redrawn, transactions.some((tr) => tr.isUserEvent("select.pointer")));
    } finally {
      this.updateState = 0;
    }
    if (update.startState.facet(theme) != update.state.facet(theme))
      this.viewState.mustMeasureContent = true;
    if (redrawn || attrsChanged || scrollTarget || this.viewState.mustEnforceCursorAssoc || this.viewState.mustMeasureContent)
      this.requestMeasure();
    if (redrawn)
      this.docViewUpdate();
    if (!update.empty)
      for (let listener of this.state.facet(updateListener)) {
        try {
          listener(update);
        } catch (e) {
          logException(this.state, e, "update listener");
        }
      }
    if (dispatchFocus || domChange)
      Promise.resolve().then(() => {
        if (dispatchFocus && this.state == dispatchFocus.startState)
          this.dispatch(dispatchFocus);
        if (domChange) {
          if (!applyDOMChange(this, domChange) && pendingKey.force)
            dispatchKey(this.contentDOM, pendingKey.key, pendingKey.keyCode);
        }
      });
  }
  setState(newState) {
    if (this.updateState != 0)
      throw new Error("Calls to EditorView.setState are not allowed while an update is in progress");
    if (this.destroyed) {
      this.viewState.state = newState;
      return;
    }
    this.updateState = 2;
    let hadFocus = this.hasFocus;
    try {
      for (let plugin of this.plugins)
        plugin.destroy(this);
      this.viewState = new ViewState(newState);
      this.plugins = newState.facet(viewPlugin).map((spec) => new PluginInstance(spec));
      this.pluginMap.clear();
      for (let plugin of this.plugins)
        plugin.update(this);
      this.docView.destroy();
      this.docView = new DocView(this);
      this.inputState.ensureHandlers(this.plugins);
      this.mountStyles();
      this.updateAttrs();
      this.bidiCache = [];
    } finally {
      this.updateState = 0;
    }
    if (hadFocus)
      this.focus();
    this.requestMeasure();
  }
  updatePlugins(update) {
    let prevSpecs = update.startState.facet(viewPlugin), specs = update.state.facet(viewPlugin);
    if (prevSpecs != specs) {
      let newPlugins = [];
      for (let spec of specs) {
        let found = prevSpecs.indexOf(spec);
        if (found < 0) {
          newPlugins.push(new PluginInstance(spec));
        } else {
          let plugin = this.plugins[found];
          plugin.mustUpdate = update;
          newPlugins.push(plugin);
        }
      }
      for (let plugin of this.plugins)
        if (plugin.mustUpdate != update)
          plugin.destroy(this);
      this.plugins = newPlugins;
      this.pluginMap.clear();
    } else {
      for (let p of this.plugins)
        p.mustUpdate = update;
    }
    for (let i = 0; i < this.plugins.length; i++)
      this.plugins[i].update(this);
    if (prevSpecs != specs)
      this.inputState.ensureHandlers(this.plugins);
  }
  docViewUpdate() {
    for (let plugin of this.plugins) {
      let val = plugin.value;
      if (val && val.docViewUpdate) {
        try {
          val.docViewUpdate(this);
        } catch (e) {
          logException(this.state, e, "doc view update listener");
        }
      }
    }
  }
  measure(flush = true) {
    if (this.destroyed)
      return;
    if (this.measureScheduled > -1)
      this.win.cancelAnimationFrame(this.measureScheduled);
    if (this.observer.delayedAndroidKey) {
      this.measureScheduled = -1;
      this.requestMeasure();
      return;
    }
    this.measureScheduled = 0;
    if (flush)
      this.observer.forceFlush();
    let updated = null;
    let sDOM = this.scrollDOM, scrollTop = sDOM.scrollTop * this.scaleY;
    let { scrollAnchorPos, scrollAnchorHeight } = this.viewState;
    if (Math.abs(scrollTop - this.viewState.scrollTop) > 1)
      scrollAnchorHeight = -1;
    this.viewState.scrollAnchorHeight = -1;
    try {
      for (let i = 0; ; i++) {
        if (scrollAnchorHeight < 0) {
          if (isScrolledToBottom(sDOM)) {
            scrollAnchorPos = -1;
            scrollAnchorHeight = this.viewState.heightMap.height;
          } else {
            let block = this.viewState.scrollAnchorAt(scrollTop);
            scrollAnchorPos = block.from;
            scrollAnchorHeight = block.top;
          }
        }
        this.updateState = 1;
        let changed = this.viewState.measure(this);
        if (!changed && !this.measureRequests.length && this.viewState.scrollTarget == null)
          break;
        if (i > 5) {
          console.warn(this.measureRequests.length ? "Measure loop restarted more than 5 times" : "Viewport failed to stabilize");
          break;
        }
        let measuring = [];
        if (!(changed & 4))
          [this.measureRequests, measuring] = [measuring, this.measureRequests];
        let measured = measuring.map((m) => {
          try {
            return m.read(this);
          } catch (e) {
            logException(this.state, e);
            return BadMeasure;
          }
        });
        let update = ViewUpdate.create(this, this.state, []), redrawn = false;
        update.flags |= changed;
        if (!updated)
          updated = update;
        else
          updated.flags |= changed;
        this.updateState = 2;
        if (!update.empty) {
          this.updatePlugins(update);
          this.inputState.update(update);
          this.updateAttrs();
          redrawn = this.docView.update(update);
          if (redrawn)
            this.docViewUpdate();
        }
        for (let i2 = 0; i2 < measuring.length; i2++)
          if (measured[i2] != BadMeasure) {
            try {
              let m = measuring[i2];
              if (m.write)
                m.write(measured[i2], this);
            } catch (e) {
              logException(this.state, e);
            }
          }
        if (redrawn)
          this.docView.updateSelection(true);
        if (!update.viewportChanged && this.measureRequests.length == 0) {
          if (this.viewState.editorHeight) {
            if (this.viewState.scrollTarget) {
              this.docView.scrollIntoView(this.viewState.scrollTarget);
              this.viewState.scrollTarget = null;
              scrollAnchorHeight = -1;
              continue;
            } else {
              let newAnchorHeight = scrollAnchorPos < 0 ? this.viewState.heightMap.height : this.viewState.lineBlockAt(scrollAnchorPos).top;
              let diff = newAnchorHeight - scrollAnchorHeight;
              if (diff > 1 || diff < -1) {
                scrollTop = scrollTop + diff;
                sDOM.scrollTop = scrollTop / this.scaleY;
                scrollAnchorHeight = -1;
                continue;
              }
            }
          }
          break;
        }
      }
    } finally {
      this.updateState = 0;
      this.measureScheduled = -1;
    }
    if (updated && !updated.empty)
      for (let listener of this.state.facet(updateListener))
        listener(updated);
  }
  get themeClasses() {
    return baseThemeID + " " + (this.state.facet(darkTheme) ? baseDarkID : baseLightID) + " " + this.state.facet(theme);
  }
  updateAttrs() {
    let editorAttrs = attrsFromFacet(this, editorAttributes, {
      class: "cm-editor" + (this.hasFocus ? " cm-focused " : " ") + this.themeClasses
    });
    let contentAttrs = {
      spellcheck: "false",
      autocorrect: "off",
      autocapitalize: "off",
      translate: "no",
      contenteditable: !this.state.facet(editable) ? "false" : "true",
      class: "cm-content",
      style: `${browser.tabSize}: ${this.state.tabSize}`,
      role: "textbox",
      "aria-multiline": "true"
    };
    if (this.state.readOnly)
      contentAttrs["aria-readonly"] = "true";
    attrsFromFacet(this, contentAttributes, contentAttrs);
    let changed = this.observer.ignore(() => {
      let changedContent = updateAttrs(this.contentDOM, this.contentAttrs, contentAttrs);
      let changedEditor = updateAttrs(this.dom, this.editorAttrs, editorAttrs);
      return changedContent || changedEditor;
    });
    this.editorAttrs = editorAttrs;
    this.contentAttrs = contentAttrs;
    return changed;
  }
  showAnnouncements(trs) {
    let first = true;
    for (let tr of trs)
      for (let effect of tr.effects)
        if (effect.is(EditorView.announce)) {
          if (first)
            this.announceDOM.textContent = "";
          first = false;
          let div = this.announceDOM.appendChild(document.createElement("div"));
          div.textContent = effect.value;
        }
  }
  mountStyles() {
    this.styleModules = this.state.facet(styleModule);
    let nonce = this.state.facet(EditorView.cspNonce);
    StyleModule.mount(this.root, this.styleModules.concat(baseTheme$1).reverse(), nonce ? { nonce } : void 0);
  }
  readMeasured() {
    if (this.updateState == 2)
      throw new Error("Reading the editor layout isn't allowed during an update");
    if (this.updateState == 0 && this.measureScheduled > -1)
      this.measure(false);
  }
  requestMeasure(request) {
    if (this.measureScheduled < 0)
      this.measureScheduled = this.win.requestAnimationFrame(() => this.measure());
    if (request) {
      if (this.measureRequests.indexOf(request) > -1)
        return;
      if (request.key != null)
        for (let i = 0; i < this.measureRequests.length; i++) {
          if (this.measureRequests[i].key === request.key) {
            this.measureRequests[i] = request;
            return;
          }
        }
      this.measureRequests.push(request);
    }
  }
  plugin(plugin) {
    let known = this.pluginMap.get(plugin);
    if (known === void 0 || known && known.spec != plugin)
      this.pluginMap.set(plugin, known = this.plugins.find((p) => p.spec == plugin) || null);
    return known && known.update(this).value;
  }
  get documentTop() {
    return this.contentDOM.getBoundingClientRect().top + this.viewState.paddingTop;
  }
  get documentPadding() {
    return { top: this.viewState.paddingTop, bottom: this.viewState.paddingBottom };
  }
  get scaleX() {
    return this.viewState.scaleX;
  }
  get scaleY() {
    return this.viewState.scaleY;
  }
  elementAtHeight(height) {
    this.readMeasured();
    return this.viewState.elementAtHeight(height);
  }
  lineBlockAtHeight(height) {
    this.readMeasured();
    return this.viewState.lineBlockAtHeight(height);
  }
  get viewportLineBlocks() {
    return this.viewState.viewportLines;
  }
  lineBlockAt(pos) {
    return this.viewState.lineBlockAt(pos);
  }
  get contentHeight() {
    return this.viewState.contentHeight;
  }
  moveByChar(start, forward, by) {
    return skipAtoms(this, start, moveByChar(this, start, forward, by));
  }
  moveByGroup(start, forward) {
    return skipAtoms(this, start, moveByChar(this, start, forward, (initial) => byGroup(this, start.head, initial)));
  }
  visualLineSide(line, end) {
    let order = this.bidiSpans(line), dir = this.textDirectionAt(line.from);
    let span = order[end ? order.length - 1 : 0];
    return EditorSelection.cursor(span.side(end, dir) + line.from, span.forward(!end, dir) ? 1 : -1);
  }
  moveToLineBoundary(start, forward, includeWrap = true) {
    return moveToLineBoundary(this, start, forward, includeWrap);
  }
  moveVertically(start, forward, distance) {
    return skipAtoms(this, start, moveVertically(this, start, forward, distance));
  }
  domAtPos(pos) {
    return this.docView.domAtPos(pos);
  }
  posAtDOM(node, offset = 0) {
    return this.docView.posFromDOM(node, offset);
  }
  posAtCoords(coords, precise = true) {
    this.readMeasured();
    return posAtCoords(this, coords, precise);
  }
  coordsAtPos(pos, side = 1) {
    this.readMeasured();
    let rect = this.docView.coordsAt(pos, side);
    if (!rect || rect.left == rect.right)
      return rect;
    let line = this.state.doc.lineAt(pos), order = this.bidiSpans(line);
    let span = order[BidiSpan.find(order, pos - line.from, -1, side)];
    return flattenRect(rect, span.dir == Direction.LTR == side > 0);
  }
  coordsForChar(pos) {
    this.readMeasured();
    return this.docView.coordsForChar(pos);
  }
  get defaultCharacterWidth() {
    return this.viewState.heightOracle.charWidth;
  }
  get defaultLineHeight() {
    return this.viewState.heightOracle.lineHeight;
  }
  get textDirection() {
    return this.viewState.defaultTextDirection;
  }
  textDirectionAt(pos) {
    let perLine = this.state.facet(perLineTextDirection);
    if (!perLine || pos < this.viewport.from || pos > this.viewport.to)
      return this.textDirection;
    this.readMeasured();
    return this.docView.textDirectionAt(pos);
  }
  get lineWrapping() {
    return this.viewState.heightOracle.lineWrapping;
  }
  bidiSpans(line) {
    if (line.length > MaxBidiLine)
      return trivialOrder(line.length);
    let dir = this.textDirectionAt(line.from), isolates;
    for (let entry of this.bidiCache) {
      if (entry.from == line.from && entry.dir == dir && (entry.fresh || isolatesEq(entry.isolates, isolates = getIsolatedRanges(this, line))))
        return entry.order;
    }
    if (!isolates)
      isolates = getIsolatedRanges(this, line);
    let order = computeOrder(line.text, dir, isolates);
    this.bidiCache.push(new CachedOrder(line.from, line.to, dir, isolates, true, order));
    return order;
  }
  get hasFocus() {
    var _a2;
    return (this.dom.ownerDocument.hasFocus() || browser.safari && ((_a2 = this.inputState) === null || _a2 === void 0 ? void 0 : _a2.lastContextMenu) > Date.now() - 3e4) && this.root.activeElement == this.contentDOM;
  }
  focus() {
    this.observer.ignore(() => {
      focusPreventScroll(this.contentDOM);
      this.docView.updateSelection();
    });
  }
  setRoot(root) {
    if (this._root != root) {
      this._root = root;
      this.observer.setWindow((root.nodeType == 9 ? root : root.ownerDocument).defaultView || window);
      this.mountStyles();
    }
  }
  destroy() {
    for (let plugin of this.plugins)
      plugin.destroy(this);
    this.plugins = [];
    this.inputState.destroy();
    this.docView.destroy();
    this.dom.remove();
    this.observer.destroy();
    if (this.measureScheduled > -1)
      this.win.cancelAnimationFrame(this.measureScheduled);
    this.destroyed = true;
  }
  static scrollIntoView(pos, options = {}) {
    return scrollIntoView.of(new ScrollTarget(typeof pos == "number" ? EditorSelection.cursor(pos) : pos, options.y, options.x, options.yMargin, options.xMargin));
  }
  scrollSnapshot() {
    let { scrollTop, scrollLeft } = this.scrollDOM;
    let ref = this.viewState.scrollAnchorAt(scrollTop);
    return scrollIntoView.of(new ScrollTarget(EditorSelection.cursor(ref.from), "start", "start", ref.top - scrollTop, scrollLeft, true));
  }
  static domEventHandlers(handlers2) {
    return ViewPlugin.define(() => ({}), { eventHandlers: handlers2 });
  }
  static domEventObservers(observers2) {
    return ViewPlugin.define(() => ({}), { eventObservers: observers2 });
  }
  static theme(spec, options) {
    let prefix = StyleModule.newName();
    let result = [theme.of(prefix), styleModule.of(buildTheme(`.${prefix}`, spec))];
    if (options && options.dark)
      result.push(darkTheme.of(true));
    return result;
  }
  static baseTheme(spec) {
    return Prec.lowest(styleModule.of(buildTheme("." + baseThemeID, spec, lightDarkIDs)));
  }
  static findFromDOM(dom) {
    var _a2;
    let content2 = dom.querySelector(".cm-content");
    let cView = content2 && ContentView.get(content2) || ContentView.get(dom);
    return ((_a2 = cView === null || cView === void 0 ? void 0 : cView.rootView) === null || _a2 === void 0 ? void 0 : _a2.view) || null;
  }
};
EditorView.styleModule = styleModule;
EditorView.inputHandler = inputHandler;
EditorView.scrollHandler = scrollHandler;
EditorView.focusChangeEffect = focusChangeEffect;
EditorView.perLineTextDirection = perLineTextDirection;
EditorView.exceptionSink = exceptionSink;
EditorView.updateListener = updateListener;
EditorView.editable = editable;
EditorView.mouseSelectionStyle = mouseSelectionStyle;
EditorView.dragMovesSelection = dragMovesSelection$1;
EditorView.clickAddsSelectionRange = clickAddsSelectionRange;
EditorView.decorations = decorations;
EditorView.outerDecorations = outerDecorations;
EditorView.atomicRanges = atomicRanges;
EditorView.bidiIsolatedRanges = bidiIsolatedRanges;
EditorView.scrollMargins = scrollMargins;
EditorView.darkTheme = darkTheme;
EditorView.cspNonce = /* @__PURE__ */ Facet.define({ combine: (values2) => values2.length ? values2[0] : "" });
EditorView.contentAttributes = contentAttributes;
EditorView.editorAttributes = editorAttributes;
EditorView.lineWrapping = /* @__PURE__ */ EditorView.contentAttributes.of({ "class": "cm-lineWrapping" });
EditorView.announce = /* @__PURE__ */ StateEffect.define();
var MaxBidiLine = 4096;
var BadMeasure = {};
var CachedOrder = class {
  constructor(from, to, dir, isolates, fresh, order) {
    this.from = from;
    this.to = to;
    this.dir = dir;
    this.isolates = isolates;
    this.fresh = fresh;
    this.order = order;
  }
  static update(cache2, changes) {
    if (changes.empty && !cache2.some((c) => c.fresh))
      return cache2;
    let result = [], lastDir = cache2.length ? cache2[cache2.length - 1].dir : Direction.LTR;
    for (let i = Math.max(0, cache2.length - 10); i < cache2.length; i++) {
      let entry = cache2[i];
      if (entry.dir == lastDir && !changes.touchesRange(entry.from, entry.to))
        result.push(new CachedOrder(changes.mapPos(entry.from, 1), changes.mapPos(entry.to, -1), entry.dir, entry.isolates, false, entry.order));
    }
    return result;
  }
};
function attrsFromFacet(view, facet, base2) {
  for (let sources = view.state.facet(facet), i = sources.length - 1; i >= 0; i--) {
    let source = sources[i], value = typeof source == "function" ? source(view) : source;
    if (value)
      combineAttrs(value, base2);
  }
  return base2;
}
var currentPlatform = browser.mac ? "mac" : browser.windows ? "win" : browser.linux ? "linux" : "key";
function normalizeKeyName(name2, platform) {
  const parts = name2.split(/-(?!$)/);
  let result = parts[parts.length - 1];
  if (result == "Space")
    result = " ";
  let alt, ctrl, shift2, meta2;
  for (let i = 0; i < parts.length - 1; ++i) {
    const mod = parts[i];
    if (/^(cmd|meta|m)$/i.test(mod))
      meta2 = true;
    else if (/^a(lt)?$/i.test(mod))
      alt = true;
    else if (/^(c|ctrl|control)$/i.test(mod))
      ctrl = true;
    else if (/^s(hift)?$/i.test(mod))
      shift2 = true;
    else if (/^mod$/i.test(mod)) {
      if (platform == "mac")
        meta2 = true;
      else
        ctrl = true;
    } else
      throw new Error("Unrecognized modifier name: " + mod);
  }
  if (alt)
    result = "Alt-" + result;
  if (ctrl)
    result = "Ctrl-" + result;
  if (meta2)
    result = "Meta-" + result;
  if (shift2)
    result = "Shift-" + result;
  return result;
}
function modifiers(name2, event, shift2) {
  if (event.altKey)
    name2 = "Alt-" + name2;
  if (event.ctrlKey)
    name2 = "Ctrl-" + name2;
  if (event.metaKey)
    name2 = "Meta-" + name2;
  if (shift2 !== false && event.shiftKey)
    name2 = "Shift-" + name2;
  return name2;
}
var handleKeyEvents = /* @__PURE__ */ Prec.default(/* @__PURE__ */ EditorView.domEventHandlers({
  keydown(event, view) {
    return runHandlers(getKeymap(view.state), event, view, "editor");
  }
}));
var keymap = /* @__PURE__ */ Facet.define({ enables: handleKeyEvents });
var Keymaps = /* @__PURE__ */ new WeakMap();
function getKeymap(state) {
  let bindings = state.facet(keymap);
  let map = Keymaps.get(bindings);
  if (!map)
    Keymaps.set(bindings, map = buildKeymap(bindings.reduce((a, b) => a.concat(b), [])));
  return map;
}
var storedPrefix = null;
var PrefixTimeout = 4e3;
function buildKeymap(bindings, platform = currentPlatform) {
  let bound = Object.create(null);
  let isPrefix = Object.create(null);
  let checkPrefix = (name2, is) => {
    let current = isPrefix[name2];
    if (current == null)
      isPrefix[name2] = is;
    else if (current != is)
      throw new Error("Key binding " + name2 + " is used both as a regular binding and as a multi-stroke prefix");
  };
  let add = (scope, key, command2, preventDefault, stopPropagation) => {
    var _a2, _b;
    let scopeObj = bound[scope] || (bound[scope] = Object.create(null));
    let parts = key.split(/ (?!$)/).map((k) => normalizeKeyName(k, platform));
    for (let i = 1; i < parts.length; i++) {
      let prefix = parts.slice(0, i).join(" ");
      checkPrefix(prefix, true);
      if (!scopeObj[prefix])
        scopeObj[prefix] = {
          preventDefault: true,
          stopPropagation: false,
          run: [(view) => {
            let ourObj = storedPrefix = { view, prefix, scope };
            setTimeout(() => {
              if (storedPrefix == ourObj)
                storedPrefix = null;
            }, PrefixTimeout);
            return true;
          }]
        };
    }
    let full = parts.join(" ");
    checkPrefix(full, false);
    let binding = scopeObj[full] || (scopeObj[full] = {
      preventDefault: false,
      stopPropagation: false,
      run: ((_b = (_a2 = scopeObj._any) === null || _a2 === void 0 ? void 0 : _a2.run) === null || _b === void 0 ? void 0 : _b.slice()) || []
    });
    if (command2)
      binding.run.push(command2);
    if (preventDefault)
      binding.preventDefault = true;
    if (stopPropagation)
      binding.stopPropagation = true;
  };
  for (let b of bindings) {
    let scopes = b.scope ? b.scope.split(" ") : ["editor"];
    if (b.any)
      for (let scope of scopes) {
        let scopeObj = bound[scope] || (bound[scope] = Object.create(null));
        if (!scopeObj._any)
          scopeObj._any = { preventDefault: false, stopPropagation: false, run: [] };
        for (let key in scopeObj)
          scopeObj[key].run.push(b.any);
      }
    let name2 = b[platform] || b.key;
    if (!name2)
      continue;
    for (let scope of scopes) {
      add(scope, name2, b.run, b.preventDefault, b.stopPropagation);
      if (b.shift)
        add(scope, "Shift-" + name2, b.shift, b.preventDefault, b.stopPropagation);
    }
  }
  return bound;
}
function runHandlers(map, event, view, scope) {
  let name2 = keyName(event);
  let charCode = codePointAt(name2, 0), isChar = codePointSize(charCode) == name2.length && name2 != " ";
  let prefix = "", handled = false, prevented = false, stopPropagation = false;
  if (storedPrefix && storedPrefix.view == view && storedPrefix.scope == scope) {
    prefix = storedPrefix.prefix + " ";
    if (modifierCodes.indexOf(event.keyCode) < 0) {
      prevented = true;
      storedPrefix = null;
    }
  }
  let ran = new Set();
  let runFor = (binding) => {
    if (binding) {
      for (let cmd2 of binding.run)
        if (!ran.has(cmd2)) {
          ran.add(cmd2);
          if (cmd2(view, event)) {
            if (binding.stopPropagation)
              stopPropagation = true;
            return true;
          }
        }
      if (binding.preventDefault) {
        if (binding.stopPropagation)
          stopPropagation = true;
        prevented = true;
      }
    }
    return false;
  };
  let scopeObj = map[scope], baseName, shiftName;
  if (scopeObj) {
    if (runFor(scopeObj[prefix + modifiers(name2, event, !isChar)])) {
      handled = true;
    } else if (isChar && (event.altKey || event.metaKey || event.ctrlKey) && !(browser.windows && event.ctrlKey && event.altKey) && (baseName = base[event.keyCode]) && baseName != name2) {
      if (runFor(scopeObj[prefix + modifiers(baseName, event, true)])) {
        handled = true;
      } else if (event.shiftKey && (shiftName = shift[event.keyCode]) != name2 && shiftName != baseName && runFor(scopeObj[prefix + modifiers(shiftName, event, false)])) {
        handled = true;
      }
    } else if (isChar && event.shiftKey && runFor(scopeObj[prefix + modifiers(name2, event, true)])) {
      handled = true;
    }
    if (!handled && runFor(scopeObj._any))
      handled = true;
  }
  if (prevented)
    handled = true;
  if (handled && stopPropagation)
    event.stopPropagation();
  return handled;
}
var RectangleMarker = class {
  constructor(className, left, top2, width, height) {
    this.className = className;
    this.left = left;
    this.top = top2;
    this.width = width;
    this.height = height;
  }
  draw() {
    let elt2 = document.createElement("div");
    elt2.className = this.className;
    this.adjust(elt2);
    return elt2;
  }
  update(elt2, prev) {
    if (prev.className != this.className)
      return false;
    this.adjust(elt2);
    return true;
  }
  adjust(elt2) {
    elt2.style.left = this.left + "px";
    elt2.style.top = this.top + "px";
    if (this.width != null)
      elt2.style.width = this.width + "px";
    elt2.style.height = this.height + "px";
  }
  eq(p) {
    return this.left == p.left && this.top == p.top && this.width == p.width && this.height == p.height && this.className == p.className;
  }
  static forRange(view, className, range) {
    if (range.empty) {
      let pos = view.coordsAtPos(range.head, range.assoc || 1);
      if (!pos)
        return [];
      let base2 = getBase(view);
      return [new RectangleMarker(className, pos.left - base2.left, pos.top - base2.top, null, pos.bottom - pos.top)];
    } else {
      return rectanglesForRange(view, className, range);
    }
  }
};
function getBase(view) {
  let rect = view.scrollDOM.getBoundingClientRect();
  let left = view.textDirection == Direction.LTR ? rect.left : rect.right - view.scrollDOM.clientWidth * view.scaleX;
  return { left: left - view.scrollDOM.scrollLeft * view.scaleX, top: rect.top - view.scrollDOM.scrollTop * view.scaleY };
}
function wrappedLine(view, pos, inside2) {
  let range = EditorSelection.cursor(pos);
  return {
    from: Math.max(inside2.from, view.moveToLineBoundary(range, false, true).from),
    to: Math.min(inside2.to, view.moveToLineBoundary(range, true, true).from),
    type: BlockType.Text
  };
}
function rectanglesForRange(view, className, range) {
  if (range.to <= view.viewport.from || range.from >= view.viewport.to)
    return [];
  let from = Math.max(range.from, view.viewport.from), to = Math.min(range.to, view.viewport.to);
  let ltr = view.textDirection == Direction.LTR;
  let content2 = view.contentDOM, contentRect = content2.getBoundingClientRect(), base2 = getBase(view);
  let lineElt = content2.querySelector(".cm-line"), lineStyle = lineElt && window.getComputedStyle(lineElt);
  let leftSide = contentRect.left + (lineStyle ? parseInt(lineStyle.paddingLeft) + Math.min(0, parseInt(lineStyle.textIndent)) : 0);
  let rightSide = contentRect.right - (lineStyle ? parseInt(lineStyle.paddingRight) : 0);
  let startBlock = blockAt(view, from), endBlock = blockAt(view, to);
  let visualStart = startBlock.type == BlockType.Text ? startBlock : null;
  let visualEnd = endBlock.type == BlockType.Text ? endBlock : null;
  if (visualStart && (view.lineWrapping || startBlock.widgetLineBreaks))
    visualStart = wrappedLine(view, from, visualStart);
  if (visualEnd && (view.lineWrapping || endBlock.widgetLineBreaks))
    visualEnd = wrappedLine(view, to, visualEnd);
  if (visualStart && visualEnd && visualStart.from == visualEnd.from) {
    return pieces(drawForLine(range.from, range.to, visualStart));
  } else {
    let top2 = visualStart ? drawForLine(range.from, null, visualStart) : drawForWidget(startBlock, false);
    let bottom = visualEnd ? drawForLine(null, range.to, visualEnd) : drawForWidget(endBlock, true);
    let between = [];
    if ((visualStart || startBlock).to < (visualEnd || endBlock).from - (visualStart && visualEnd ? 1 : 0) || startBlock.widgetLineBreaks > 1 && top2.bottom + view.defaultLineHeight / 2 < bottom.top)
      between.push(piece(leftSide, top2.bottom, rightSide, bottom.top));
    else if (top2.bottom < bottom.top && view.elementAtHeight((top2.bottom + bottom.top) / 2).type == BlockType.Text)
      top2.bottom = bottom.top = (top2.bottom + bottom.top) / 2;
    return pieces(top2).concat(between).concat(pieces(bottom));
  }
  function piece(left, top2, right, bottom) {
    return new RectangleMarker(className, left - base2.left, top2 - base2.top - 0.01, right - left, bottom - top2 + 0.01);
  }
  function pieces({ top: top2, bottom, horizontal }) {
    let pieces2 = [];
    for (let i = 0; i < horizontal.length; i += 2)
      pieces2.push(piece(horizontal[i], top2, horizontal[i + 1], bottom));
    return pieces2;
  }
  function drawForLine(from2, to2, line) {
    let top2 = 1e9, bottom = -1e9, horizontal = [];
    function addSpan(from3, fromOpen, to3, toOpen, dir) {
      let fromCoords = view.coordsAtPos(from3, from3 == line.to ? -2 : 2);
      let toCoords = view.coordsAtPos(to3, to3 == line.from ? 2 : -2);
      if (!fromCoords || !toCoords)
        return;
      top2 = Math.min(fromCoords.top, toCoords.top, top2);
      bottom = Math.max(fromCoords.bottom, toCoords.bottom, bottom);
      if (dir == Direction.LTR)
        horizontal.push(ltr && fromOpen ? leftSide : fromCoords.left, ltr && toOpen ? rightSide : toCoords.right);
      else
        horizontal.push(!ltr && toOpen ? leftSide : toCoords.left, !ltr && fromOpen ? rightSide : fromCoords.right);
    }
    let start = from2 !== null && from2 !== void 0 ? from2 : line.from, end = to2 !== null && to2 !== void 0 ? to2 : line.to;
    for (let r of view.visibleRanges)
      if (r.to > start && r.from < end) {
        for (let pos = Math.max(r.from, start), endPos = Math.min(r.to, end); ; ) {
          let docLine = view.state.doc.lineAt(pos);
          for (let span of view.bidiSpans(docLine)) {
            let spanFrom = span.from + docLine.from, spanTo = span.to + docLine.from;
            if (spanFrom >= endPos)
              break;
            if (spanTo > pos)
              addSpan(Math.max(spanFrom, pos), from2 == null && spanFrom <= start, Math.min(spanTo, endPos), to2 == null && spanTo >= end, span.dir);
          }
          pos = docLine.to + 1;
          if (pos >= endPos)
            break;
        }
      }
    if (horizontal.length == 0)
      addSpan(start, from2 == null, end, to2 == null, view.textDirection);
    return { top: top2, bottom, horizontal };
  }
  function drawForWidget(block, top2) {
    let y = contentRect.top + (top2 ? block.top : block.bottom);
    return { top: y, bottom: y, horizontal: [] };
  }
}
function sameMarker(a, b) {
  return a.constructor == b.constructor && a.eq(b);
}
var LayerView = class {
  constructor(view, layer2) {
    this.view = view;
    this.layer = layer2;
    this.drawn = [];
    this.scaleX = 1;
    this.scaleY = 1;
    this.measureReq = { read: this.measure.bind(this), write: this.draw.bind(this) };
    this.dom = view.scrollDOM.appendChild(document.createElement("div"));
    this.dom.classList.add("cm-layer");
    if (layer2.above)
      this.dom.classList.add("cm-layer-above");
    if (layer2.class)
      this.dom.classList.add(layer2.class);
    this.scale();
    this.dom.setAttribute("aria-hidden", "true");
    this.setOrder(view.state);
    view.requestMeasure(this.measureReq);
    if (layer2.mount)
      layer2.mount(this.dom, view);
  }
  update(update) {
    if (update.startState.facet(layerOrder) != update.state.facet(layerOrder))
      this.setOrder(update.state);
    if (this.layer.update(update, this.dom) || update.geometryChanged) {
      this.scale();
      update.view.requestMeasure(this.measureReq);
    }
  }
  docViewUpdate(view) {
    if (this.layer.updateOnDocViewUpdate !== false)
      view.requestMeasure(this.measureReq);
  }
  setOrder(state) {
    let pos = 0, order = state.facet(layerOrder);
    while (pos < order.length && order[pos] != this.layer)
      pos++;
    this.dom.style.zIndex = String((this.layer.above ? 150 : -1) - pos);
  }
  measure() {
    return this.layer.markers(this.view);
  }
  scale() {
    let { scaleX, scaleY } = this.view;
    if (scaleX != this.scaleX || scaleY != this.scaleY) {
      this.scaleX = scaleX;
      this.scaleY = scaleY;
      this.dom.style.transform = `scale(${1 / scaleX}, ${1 / scaleY})`;
    }
  }
  draw(markers) {
    if (markers.length != this.drawn.length || markers.some((p, i) => !sameMarker(p, this.drawn[i]))) {
      let old = this.dom.firstChild, oldI = 0;
      for (let marker of markers) {
        if (marker.update && old && marker.constructor && this.drawn[oldI].constructor && marker.update(old, this.drawn[oldI])) {
          old = old.nextSibling;
          oldI++;
        } else {
          this.dom.insertBefore(marker.draw(), old);
        }
      }
      while (old) {
        let next = old.nextSibling;
        old.remove();
        old = next;
      }
      this.drawn = markers;
    }
  }
  destroy() {
    if (this.layer.destroy)
      this.layer.destroy(this.dom, this.view);
    this.dom.remove();
  }
};
var layerOrder = /* @__PURE__ */ Facet.define();
function layer(config) {
  return [
    ViewPlugin.define((v) => new LayerView(v, config)),
    layerOrder.of(config)
  ];
}
var CanHidePrimary = !browser.ios;
var selectionConfig = /* @__PURE__ */ Facet.define({
  combine(configs) {
    return combineConfig(configs, {
      cursorBlinkRate: 1200,
      drawRangeCursor: true
    }, {
      cursorBlinkRate: (a, b) => Math.min(a, b),
      drawRangeCursor: (a, b) => a || b
    });
  }
});
function drawSelection(config = {}) {
  return [
    selectionConfig.of(config),
    cursorLayer,
    selectionLayer,
    hideNativeSelection,
    nativeSelectionHidden.of(true)
  ];
}
function configChanged(update) {
  return update.startState.facet(selectionConfig) != update.state.facet(selectionConfig);
}
var cursorLayer = /* @__PURE__ */ layer({
  above: true,
  markers(view) {
    let { state } = view, conf = state.facet(selectionConfig);
    let cursors = [];
    for (let r of state.selection.ranges) {
      let prim = r == state.selection.main;
      if (r.empty ? !prim || CanHidePrimary : conf.drawRangeCursor) {
        let className = prim ? "cm-cursor cm-cursor-primary" : "cm-cursor cm-cursor-secondary";
        let cursor = r.empty ? r : EditorSelection.cursor(r.head, r.head > r.anchor ? -1 : 1);
        for (let piece of RectangleMarker.forRange(view, className, cursor))
          cursors.push(piece);
      }
    }
    return cursors;
  },
  update(update, dom) {
    if (update.transactions.some((tr) => tr.selection))
      dom.style.animationName = dom.style.animationName == "cm-blink" ? "cm-blink2" : "cm-blink";
    let confChange = configChanged(update);
    if (confChange)
      setBlinkRate(update.state, dom);
    return update.docChanged || update.selectionSet || confChange;
  },
  mount(dom, view) {
    setBlinkRate(view.state, dom);
  },
  class: "cm-cursorLayer"
});
function setBlinkRate(state, dom) {
  dom.style.animationDuration = state.facet(selectionConfig).cursorBlinkRate + "ms";
}
var selectionLayer = /* @__PURE__ */ layer({
  above: false,
  markers(view) {
    return view.state.selection.ranges.map((r) => r.empty ? [] : RectangleMarker.forRange(view, "cm-selectionBackground", r)).reduce((a, b) => a.concat(b));
  },
  update(update, dom) {
    return update.docChanged || update.selectionSet || update.viewportChanged || configChanged(update);
  },
  class: "cm-selectionLayer"
});
var themeSpec = {
  ".cm-line": {
    "& ::selection": { backgroundColor: "transparent !important" },
    "&::selection": { backgroundColor: "transparent !important" }
  }
};
if (CanHidePrimary) {
  themeSpec[".cm-line"].caretColor = "transparent !important";
  themeSpec[".cm-content"] = { caretColor: "transparent !important" };
}
var hideNativeSelection = /* @__PURE__ */ Prec.highest(/* @__PURE__ */ EditorView.theme(themeSpec));
function iterMatches(doc2, re, from, to, f) {
  re.lastIndex = 0;
  for (let cursor = doc2.iterRange(from, to), pos = from, m; !cursor.next().done; pos += cursor.value.length) {
    if (!cursor.lineBreak)
      while (m = re.exec(cursor.value))
        f(pos + m.index, m);
  }
}
function matchRanges(view, maxLength) {
  let visible = view.visibleRanges;
  if (visible.length == 1 && visible[0].from == view.viewport.from && visible[0].to == view.viewport.to)
    return visible;
  let result = [];
  for (let { from, to } of visible) {
    from = Math.max(view.state.doc.lineAt(from).from, from - maxLength);
    to = Math.min(view.state.doc.lineAt(to).to, to + maxLength);
    if (result.length && result[result.length - 1].to >= from)
      result[result.length - 1].to = to;
    else
      result.push({ from, to });
  }
  return result;
}
var MatchDecorator = class {
  constructor(config) {
    const { regexp, decoration, decorate, boundary, maxLength = 1e3 } = config;
    if (!regexp.global)
      throw new RangeError("The regular expression given to MatchDecorator should have its 'g' flag set");
    this.regexp = regexp;
    if (decorate) {
      this.addMatch = (match, view, from, add) => decorate(add, from, from + match[0].length, match, view);
    } else if (typeof decoration == "function") {
      this.addMatch = (match, view, from, add) => {
        let deco = decoration(match, view, from);
        if (deco)
          add(from, from + match[0].length, deco);
      };
    } else if (decoration) {
      this.addMatch = (match, _view, from, add) => add(from, from + match[0].length, decoration);
    } else {
      throw new RangeError("Either 'decorate' or 'decoration' should be provided to MatchDecorator");
    }
    this.boundary = boundary;
    this.maxLength = maxLength;
  }
  createDeco(view) {
    let build = new RangeSetBuilder(), add = build.add.bind(build);
    for (let { from, to } of matchRanges(view, this.maxLength))
      iterMatches(view.state.doc, this.regexp, from, to, (from2, m) => this.addMatch(m, view, from2, add));
    return build.finish();
  }
  updateDeco(update, deco) {
    let changeFrom = 1e9, changeTo = -1;
    if (update.docChanged)
      update.changes.iterChanges((_f, _t, from, to) => {
        if (to > update.view.viewport.from && from < update.view.viewport.to) {
          changeFrom = Math.min(from, changeFrom);
          changeTo = Math.max(to, changeTo);
        }
      });
    if (update.viewportChanged || changeTo - changeFrom > 1e3)
      return this.createDeco(update.view);
    if (changeTo > -1)
      return this.updateRange(update.view, deco.map(update.changes), changeFrom, changeTo);
    return deco;
  }
  updateRange(view, deco, updateFrom, updateTo) {
    for (let r of view.visibleRanges) {
      let from = Math.max(r.from, updateFrom), to = Math.min(r.to, updateTo);
      if (to > from) {
        let fromLine = view.state.doc.lineAt(from), toLine = fromLine.to < to ? view.state.doc.lineAt(to) : fromLine;
        let start = Math.max(r.from, fromLine.from), end = Math.min(r.to, toLine.to);
        if (this.boundary) {
          for (; from > fromLine.from; from--)
            if (this.boundary.test(fromLine.text[from - 1 - fromLine.from])) {
              start = from;
              break;
            }
          for (; to < toLine.to; to++)
            if (this.boundary.test(toLine.text[to - toLine.from])) {
              end = to;
              break;
            }
        }
        let ranges = [], m;
        let add = (from2, to2, deco2) => ranges.push(deco2.range(from2, to2));
        if (fromLine == toLine) {
          this.regexp.lastIndex = start - fromLine.from;
          while ((m = this.regexp.exec(fromLine.text)) && m.index < end - fromLine.from)
            this.addMatch(m, view, m.index + fromLine.from, add);
        } else {
          iterMatches(view.state.doc, this.regexp, start, end, (from2, m2) => this.addMatch(m2, view, from2, add));
        }
        deco = deco.update({ filterFrom: start, filterTo: end, filter: (from2, to2) => from2 < start || to2 > end, add: ranges });
      }
    }
    return deco;
  }
};
var UnicodeRegexpSupport = /x/.unicode != null ? "gu" : "g";
var Specials = /* @__PURE__ */ new RegExp("[\0-\b\n-\x7F-\x9F\xAD\u061C\u200B\u200E\u200F\u2028\u2029\u202D\u202E\u2066\u2067\u2069\uFEFF\uFFF9-\uFFFC]", UnicodeRegexpSupport);
var Names = {
  0: "null",
  7: "bell",
  8: "backspace",
  10: "newline",
  11: "vertical tab",
  13: "carriage return",
  27: "escape",
  8203: "zero width space",
  8204: "zero width non-joiner",
  8205: "zero width joiner",
  8206: "left-to-right mark",
  8207: "right-to-left mark",
  8232: "line separator",
  8237: "left-to-right override",
  8238: "right-to-left override",
  8294: "left-to-right isolate",
  8295: "right-to-left isolate",
  8297: "pop directional isolate",
  8233: "paragraph separator",
  65279: "zero width no-break space",
  65532: "object replacement"
};
var _supportsTabSize = null;
function supportsTabSize() {
  var _a2;
  if (_supportsTabSize == null && typeof document != "undefined" && document.body) {
    let styles = document.body.style;
    _supportsTabSize = ((_a2 = styles.tabSize) !== null && _a2 !== void 0 ? _a2 : styles.MozTabSize) != null;
  }
  return _supportsTabSize || false;
}
var specialCharConfig = /* @__PURE__ */ Facet.define({
  combine(configs) {
    let config = combineConfig(configs, {
      render: null,
      specialChars: Specials,
      addSpecialChars: null
    });
    if (config.replaceTabs = !supportsTabSize())
      config.specialChars = new RegExp("	|" + config.specialChars.source, UnicodeRegexpSupport);
    if (config.addSpecialChars)
      config.specialChars = new RegExp(config.specialChars.source + "|" + config.addSpecialChars.source, UnicodeRegexpSupport);
    return config;
  }
});
function highlightSpecialChars(config = {}) {
  return [specialCharConfig.of(config), specialCharPlugin()];
}
var _plugin = null;
function specialCharPlugin() {
  return _plugin || (_plugin = ViewPlugin.fromClass(class {
    constructor(view) {
      this.view = view;
      this.decorations = Decoration.none;
      this.decorationCache = Object.create(null);
      this.decorator = this.makeDecorator(view.state.facet(specialCharConfig));
      this.decorations = this.decorator.createDeco(view);
    }
    makeDecorator(conf) {
      return new MatchDecorator({
        regexp: conf.specialChars,
        decoration: (m, view, pos) => {
          let { doc: doc2 } = view.state;
          let code = codePointAt(m[0], 0);
          if (code == 9) {
            let line = doc2.lineAt(pos);
            let size = view.state.tabSize, col = countColumn(line.text, size, pos - line.from);
            return Decoration.replace({
              widget: new TabWidget((size - col % size) * this.view.defaultCharacterWidth / this.view.scaleX)
            });
          }
          return this.decorationCache[code] || (this.decorationCache[code] = Decoration.replace({ widget: new SpecialCharWidget(conf, code) }));
        },
        boundary: conf.replaceTabs ? void 0 : /[^]/
      });
    }
    update(update) {
      let conf = update.state.facet(specialCharConfig);
      if (update.startState.facet(specialCharConfig) != conf) {
        this.decorator = this.makeDecorator(conf);
        this.decorations = this.decorator.createDeco(update.view);
      } else {
        this.decorations = this.decorator.updateDeco(update, this.decorations);
      }
    }
  }, {
    decorations: (v) => v.decorations
  }));
}
var DefaultPlaceholder = "\u2022";
function placeholder$1(code) {
  if (code >= 32)
    return DefaultPlaceholder;
  if (code == 10)
    return "\u2424";
  return String.fromCharCode(9216 + code);
}
var SpecialCharWidget = class extends WidgetType {
  constructor(options, code) {
    super();
    this.options = options;
    this.code = code;
  }
  eq(other) {
    return other.code == this.code;
  }
  toDOM(view) {
    let ph = placeholder$1(this.code);
    let desc = view.state.phrase("Control character") + " " + (Names[this.code] || "0x" + this.code.toString(16));
    let custom = this.options.render && this.options.render(this.code, desc, ph);
    if (custom)
      return custom;
    let span = document.createElement("span");
    span.textContent = ph;
    span.title = desc;
    span.setAttribute("aria-label", desc);
    span.className = "cm-specialChar";
    return span;
  }
  ignoreEvent() {
    return false;
  }
};
var TabWidget = class extends WidgetType {
  constructor(width) {
    super();
    this.width = width;
  }
  eq(other) {
    return other.width == this.width;
  }
  toDOM() {
    let span = document.createElement("span");
    span.textContent = "	";
    span.className = "cm-tab";
    span.style.width = this.width + "px";
    return span;
  }
  ignoreEvent() {
    return false;
  }
};
var baseTheme = /* @__PURE__ */ EditorView.baseTheme({
  ".cm-tooltip": {
    zIndex: 100,
    boxSizing: "border-box"
  },
  "&light .cm-tooltip": {
    border: "1px solid #bbb",
    backgroundColor: "#f5f5f5"
  },
  "&light .cm-tooltip-section:not(:first-child)": {
    borderTop: "1px solid #bbb"
  },
  "&dark .cm-tooltip": {
    backgroundColor: "#333338",
    color: "white"
  },
  ".cm-tooltip-arrow": {
    height: `${7}px`,
    width: `${7 * 2}px`,
    position: "absolute",
    zIndex: -1,
    overflow: "hidden",
    "&:before, &:after": {
      content: "''",
      position: "absolute",
      width: 0,
      height: 0,
      borderLeft: `${7}px solid transparent`,
      borderRight: `${7}px solid transparent`
    },
    ".cm-tooltip-above &": {
      bottom: `-${7}px`,
      "&:before": {
        borderTop: `${7}px solid #bbb`
      },
      "&:after": {
        borderTop: `${7}px solid #f5f5f5`,
        bottom: "1px"
      }
    },
    ".cm-tooltip-below &": {
      top: `-${7}px`,
      "&:before": {
        borderBottom: `${7}px solid #bbb`
      },
      "&:after": {
        borderBottom: `${7}px solid #f5f5f5`,
        top: "1px"
      }
    }
  },
  "&dark .cm-tooltip .cm-tooltip-arrow": {
    "&:before": {
      borderTopColor: "#333338",
      borderBottomColor: "#333338"
    },
    "&:after": {
      borderTopColor: "transparent",
      borderBottomColor: "transparent"
    }
  }
});
var GutterMarker = class extends RangeValue {
  compare(other) {
    return this == other || this.constructor == other.constructor && this.eq(other);
  }
  eq(other) {
    return false;
  }
  destroy(dom) {
  }
};
GutterMarker.prototype.elementClass = "";
GutterMarker.prototype.toDOM = void 0;
GutterMarker.prototype.mapMode = MapMode.TrackBefore;
GutterMarker.prototype.startSide = GutterMarker.prototype.endSide = -1;
GutterMarker.prototype.point = true;

// node_modules/@lezer/common/dist/index.js
var DefaultBufferLength = 1024;
var nextPropID = 0;
var Range2 = class {
  constructor(from, to) {
    this.from = from;
    this.to = to;
  }
};
var NodeProp = class {
  constructor(config = {}) {
    this.id = nextPropID++;
    this.perNode = !!config.perNode;
    this.deserialize = config.deserialize || (() => {
      throw new Error("This node type doesn't define a deserialize function");
    });
  }
  add(match) {
    if (this.perNode)
      throw new RangeError("Can't add per-node props to node types");
    if (typeof match != "function")
      match = NodeType.match(match);
    return (type) => {
      let result = match(type);
      return result === void 0 ? null : [this, result];
    };
  }
};
NodeProp.closedBy = new NodeProp({ deserialize: (str) => str.split(" ") });
NodeProp.openedBy = new NodeProp({ deserialize: (str) => str.split(" ") });
NodeProp.group = new NodeProp({ deserialize: (str) => str.split(" ") });
NodeProp.isolate = new NodeProp({ deserialize: (value) => {
  if (value && value != "rtl" && value != "ltr" && value != "auto")
    throw new RangeError("Invalid value for isolate: " + value);
  return value || "auto";
} });
NodeProp.contextHash = new NodeProp({ perNode: true });
NodeProp.lookAhead = new NodeProp({ perNode: true });
NodeProp.mounted = new NodeProp({ perNode: true });
var MountedTree = class {
  constructor(tree, overlay, parser5) {
    this.tree = tree;
    this.overlay = overlay;
    this.parser = parser5;
  }
  static get(tree) {
    return tree && tree.props && tree.props[NodeProp.mounted.id];
  }
};
var noProps = Object.create(null);
var NodeType = class {
  constructor(name2, props, id2, flags = 0) {
    this.name = name2;
    this.props = props;
    this.id = id2;
    this.flags = flags;
  }
  static define(spec) {
    let props = spec.props && spec.props.length ? Object.create(null) : noProps;
    let flags = (spec.top ? 1 : 0) | (spec.skipped ? 2 : 0) | (spec.error ? 4 : 0) | (spec.name == null ? 8 : 0);
    let type = new NodeType(spec.name || "", props, spec.id, flags);
    if (spec.props)
      for (let src of spec.props) {
        if (!Array.isArray(src))
          src = src(type);
        if (src) {
          if (src[0].perNode)
            throw new RangeError("Can't store a per-node prop on a node type");
          props[src[0].id] = src[1];
        }
      }
    return type;
  }
  prop(prop) {
    return this.props[prop.id];
  }
  get isTop() {
    return (this.flags & 1) > 0;
  }
  get isSkipped() {
    return (this.flags & 2) > 0;
  }
  get isError() {
    return (this.flags & 4) > 0;
  }
  get isAnonymous() {
    return (this.flags & 8) > 0;
  }
  is(name2) {
    if (typeof name2 == "string") {
      if (this.name == name2)
        return true;
      let group = this.prop(NodeProp.group);
      return group ? group.indexOf(name2) > -1 : false;
    }
    return this.id == name2;
  }
  static match(map) {
    let direct = Object.create(null);
    for (let prop in map)
      for (let name2 of prop.split(" "))
        direct[name2] = map[prop];
    return (node) => {
      for (let groups = node.prop(NodeProp.group), i = -1; i < (groups ? groups.length : 0); i++) {
        let found = direct[i < 0 ? node.name : groups[i]];
        if (found)
          return found;
      }
    };
  }
};
NodeType.none = new NodeType("", Object.create(null), 0, 8);
var NodeSet = class {
  constructor(types2) {
    this.types = types2;
    for (let i = 0; i < types2.length; i++)
      if (types2[i].id != i)
        throw new RangeError("Node type ids should correspond to array positions when creating a node set");
  }
  extend(...props) {
    let newTypes = [];
    for (let type of this.types) {
      let newProps = null;
      for (let source of props) {
        let add = source(type);
        if (add) {
          if (!newProps)
            newProps = Object.assign({}, type.props);
          newProps[add[0].id] = add[1];
        }
      }
      newTypes.push(newProps ? new NodeType(type.name, newProps, type.id, type.flags) : type);
    }
    return new NodeSet(newTypes);
  }
};
var CachedNode = new WeakMap();
var CachedInnerNode = new WeakMap();
var IterMode;
(function(IterMode2) {
  IterMode2[IterMode2["ExcludeBuffers"] = 1] = "ExcludeBuffers";
  IterMode2[IterMode2["IncludeAnonymous"] = 2] = "IncludeAnonymous";
  IterMode2[IterMode2["IgnoreMounts"] = 4] = "IgnoreMounts";
  IterMode2[IterMode2["IgnoreOverlays"] = 8] = "IgnoreOverlays";
})(IterMode || (IterMode = {}));
var Tree = class {
  constructor(type, children, positions, length, props) {
    this.type = type;
    this.children = children;
    this.positions = positions;
    this.length = length;
    this.props = null;
    if (props && props.length) {
      this.props = Object.create(null);
      for (let [prop, value] of props)
        this.props[typeof prop == "number" ? prop : prop.id] = value;
    }
  }
  toString() {
    let mounted = MountedTree.get(this);
    if (mounted && !mounted.overlay)
      return mounted.tree.toString();
    let children = "";
    for (let ch of this.children) {
      let str = ch.toString();
      if (str) {
        if (children)
          children += ",";
        children += str;
      }
    }
    return !this.type.name ? children : (/\W/.test(this.type.name) && !this.type.isError ? JSON.stringify(this.type.name) : this.type.name) + (children.length ? "(" + children + ")" : "");
  }
  cursor(mode = 0) {
    return new TreeCursor(this.topNode, mode);
  }
  cursorAt(pos, side = 0, mode = 0) {
    let scope = CachedNode.get(this) || this.topNode;
    let cursor = new TreeCursor(scope);
    cursor.moveTo(pos, side);
    CachedNode.set(this, cursor._tree);
    return cursor;
  }
  get topNode() {
    return new TreeNode(this, 0, 0, null);
  }
  resolve(pos, side = 0) {
    let node = resolveNode(CachedNode.get(this) || this.topNode, pos, side, false);
    CachedNode.set(this, node);
    return node;
  }
  resolveInner(pos, side = 0) {
    let node = resolveNode(CachedInnerNode.get(this) || this.topNode, pos, side, true);
    CachedInnerNode.set(this, node);
    return node;
  }
  resolveStack(pos, side = 0) {
    return stackIterator(this, pos, side);
  }
  iterate(spec) {
    let { enter, leave, from = 0, to = this.length } = spec;
    let mode = spec.mode || 0, anon = (mode & IterMode.IncludeAnonymous) > 0;
    for (let c = this.cursor(mode | IterMode.IncludeAnonymous); ; ) {
      let entered = false;
      if (c.from <= to && c.to >= from && (!anon && c.type.isAnonymous || enter(c) !== false)) {
        if (c.firstChild())
          continue;
        entered = true;
      }
      for (; ; ) {
        if (entered && leave && (anon || !c.type.isAnonymous))
          leave(c);
        if (c.nextSibling())
          break;
        if (!c.parent())
          return;
        entered = true;
      }
    }
  }
  prop(prop) {
    return !prop.perNode ? this.type.prop(prop) : this.props ? this.props[prop.id] : void 0;
  }
  get propValues() {
    let result = [];
    if (this.props)
      for (let id2 in this.props)
        result.push([+id2, this.props[id2]]);
    return result;
  }
  balance(config = {}) {
    return this.children.length <= 8 ? this : balanceRange(NodeType.none, this.children, this.positions, 0, this.children.length, 0, this.length, (children, positions, length) => new Tree(this.type, children, positions, length, this.propValues), config.makeTree || ((children, positions, length) => new Tree(NodeType.none, children, positions, length)));
  }
  static build(data2) {
    return buildTree(data2);
  }
};
Tree.empty = new Tree(NodeType.none, [], [], 0);
var FlatBufferCursor = class {
  constructor(buffer, index) {
    this.buffer = buffer;
    this.index = index;
  }
  get id() {
    return this.buffer[this.index - 4];
  }
  get start() {
    return this.buffer[this.index - 3];
  }
  get end() {
    return this.buffer[this.index - 2];
  }
  get size() {
    return this.buffer[this.index - 1];
  }
  get pos() {
    return this.index;
  }
  next() {
    this.index -= 4;
  }
  fork() {
    return new FlatBufferCursor(this.buffer, this.index);
  }
};
var TreeBuffer = class {
  constructor(buffer, length, set) {
    this.buffer = buffer;
    this.length = length;
    this.set = set;
  }
  get type() {
    return NodeType.none;
  }
  toString() {
    let result = [];
    for (let index = 0; index < this.buffer.length; ) {
      result.push(this.childString(index));
      index = this.buffer[index + 3];
    }
    return result.join(",");
  }
  childString(index) {
    let id2 = this.buffer[index], endIndex = this.buffer[index + 3];
    let type = this.set.types[id2], result = type.name;
    if (/\W/.test(result) && !type.isError)
      result = JSON.stringify(result);
    index += 4;
    if (endIndex == index)
      return result;
    let children = [];
    while (index < endIndex) {
      children.push(this.childString(index));
      index = this.buffer[index + 3];
    }
    return result + "(" + children.join(",") + ")";
  }
  findChild(startIndex, endIndex, dir, pos, side) {
    let { buffer } = this, pick = -1;
    for (let i = startIndex; i != endIndex; i = buffer[i + 3]) {
      if (checkSide(side, pos, buffer[i + 1], buffer[i + 2])) {
        pick = i;
        if (dir > 0)
          break;
      }
    }
    return pick;
  }
  slice(startI, endI, from) {
    let b = this.buffer;
    let copy = new Uint16Array(endI - startI), len = 0;
    for (let i = startI, j = 0; i < endI; ) {
      copy[j++] = b[i++];
      copy[j++] = b[i++] - from;
      let to = copy[j++] = b[i++] - from;
      copy[j++] = b[i++] - startI;
      len = Math.max(len, to);
    }
    return new TreeBuffer(copy, len, this.set);
  }
};
function checkSide(side, pos, from, to) {
  switch (side) {
    case -2:
      return from < pos;
    case -1:
      return to >= pos && from < pos;
    case 0:
      return from < pos && to > pos;
    case 1:
      return from <= pos && to > pos;
    case 2:
      return to > pos;
    case 4:
      return true;
  }
}
function resolveNode(node, pos, side, overlays) {
  var _a2;
  while (node.from == node.to || (side < 1 ? node.from >= pos : node.from > pos) || (side > -1 ? node.to <= pos : node.to < pos)) {
    let parent = !overlays && node instanceof TreeNode && node.index < 0 ? null : node.parent;
    if (!parent)
      return node;
    node = parent;
  }
  let mode = overlays ? 0 : IterMode.IgnoreOverlays;
  if (overlays)
    for (let scan = node, parent = scan.parent; parent; scan = parent, parent = scan.parent) {
      if (scan instanceof TreeNode && scan.index < 0 && ((_a2 = parent.enter(pos, side, mode)) === null || _a2 === void 0 ? void 0 : _a2.from) != scan.from)
        node = parent;
    }
  for (; ; ) {
    let inner = node.enter(pos, side, mode);
    if (!inner)
      return node;
    node = inner;
  }
}
var BaseNode = class {
  cursor(mode = 0) {
    return new TreeCursor(this, mode);
  }
  getChild(type, before = null, after = null) {
    let r = getChildren(this, type, before, after);
    return r.length ? r[0] : null;
  }
  getChildren(type, before = null, after = null) {
    return getChildren(this, type, before, after);
  }
  resolve(pos, side = 0) {
    return resolveNode(this, pos, side, false);
  }
  resolveInner(pos, side = 0) {
    return resolveNode(this, pos, side, true);
  }
  matchContext(context) {
    return matchNodeContext(this, context);
  }
  enterUnfinishedNodesBefore(pos) {
    let scan = this.childBefore(pos), node = this;
    while (scan) {
      let last = scan.lastChild;
      if (!last || last.to != scan.to)
        break;
      if (last.type.isError && last.from == last.to) {
        node = scan;
        scan = last.prevSibling;
      } else {
        scan = last;
      }
    }
    return node;
  }
  get node() {
    return this;
  }
  get next() {
    return this.parent;
  }
};
var TreeNode = class extends BaseNode {
  constructor(_tree, from, index, _parent) {
    super();
    this._tree = _tree;
    this.from = from;
    this.index = index;
    this._parent = _parent;
  }
  get type() {
    return this._tree.type;
  }
  get name() {
    return this._tree.type.name;
  }
  get to() {
    return this.from + this._tree.length;
  }
  nextChild(i, dir, pos, side, mode = 0) {
    for (let parent = this; ; ) {
      for (let { children, positions } = parent._tree, e = dir > 0 ? children.length : -1; i != e; i += dir) {
        let next = children[i], start = positions[i] + parent.from;
        if (!checkSide(side, pos, start, start + next.length))
          continue;
        if (next instanceof TreeBuffer) {
          if (mode & IterMode.ExcludeBuffers)
            continue;
          let index = next.findChild(0, next.buffer.length, dir, pos - start, side);
          if (index > -1)
            return new BufferNode(new BufferContext(parent, next, i, start), null, index);
        } else if (mode & IterMode.IncludeAnonymous || (!next.type.isAnonymous || hasChild(next))) {
          let mounted;
          if (!(mode & IterMode.IgnoreMounts) && (mounted = MountedTree.get(next)) && !mounted.overlay)
            return new TreeNode(mounted.tree, start, i, parent);
          let inner = new TreeNode(next, start, i, parent);
          return mode & IterMode.IncludeAnonymous || !inner.type.isAnonymous ? inner : inner.nextChild(dir < 0 ? next.children.length - 1 : 0, dir, pos, side);
        }
      }
      if (mode & IterMode.IncludeAnonymous || !parent.type.isAnonymous)
        return null;
      if (parent.index >= 0)
        i = parent.index + dir;
      else
        i = dir < 0 ? -1 : parent._parent._tree.children.length;
      parent = parent._parent;
      if (!parent)
        return null;
    }
  }
  get firstChild() {
    return this.nextChild(0, 1, 0, 4);
  }
  get lastChild() {
    return this.nextChild(this._tree.children.length - 1, -1, 0, 4);
  }
  childAfter(pos) {
    return this.nextChild(0, 1, pos, 2);
  }
  childBefore(pos) {
    return this.nextChild(this._tree.children.length - 1, -1, pos, -2);
  }
  enter(pos, side, mode = 0) {
    let mounted;
    if (!(mode & IterMode.IgnoreOverlays) && (mounted = MountedTree.get(this._tree)) && mounted.overlay) {
      let rPos = pos - this.from;
      for (let { from, to } of mounted.overlay) {
        if ((side > 0 ? from <= rPos : from < rPos) && (side < 0 ? to >= rPos : to > rPos))
          return new TreeNode(mounted.tree, mounted.overlay[0].from + this.from, -1, this);
      }
    }
    return this.nextChild(0, 1, pos, side, mode);
  }
  nextSignificantParent() {
    let val = this;
    while (val.type.isAnonymous && val._parent)
      val = val._parent;
    return val;
  }
  get parent() {
    return this._parent ? this._parent.nextSignificantParent() : null;
  }
  get nextSibling() {
    return this._parent && this.index >= 0 ? this._parent.nextChild(this.index + 1, 1, 0, 4) : null;
  }
  get prevSibling() {
    return this._parent && this.index >= 0 ? this._parent.nextChild(this.index - 1, -1, 0, 4) : null;
  }
  get tree() {
    return this._tree;
  }
  toTree() {
    return this._tree;
  }
  toString() {
    return this._tree.toString();
  }
};
function getChildren(node, type, before, after) {
  let cur = node.cursor(), result = [];
  if (!cur.firstChild())
    return result;
  if (before != null)
    for (let found = false; !found; ) {
      found = cur.type.is(before);
      if (!cur.nextSibling())
        return result;
    }
  for (; ; ) {
    if (after != null && cur.type.is(after))
      return result;
    if (cur.type.is(type))
      result.push(cur.node);
    if (!cur.nextSibling())
      return after == null ? result : [];
  }
}
function matchNodeContext(node, context, i = context.length - 1) {
  for (let p = node.parent; i >= 0; p = p.parent) {
    if (!p)
      return false;
    if (!p.type.isAnonymous) {
      if (context[i] && context[i] != p.name)
        return false;
      i--;
    }
  }
  return true;
}
var BufferContext = class {
  constructor(parent, buffer, index, start) {
    this.parent = parent;
    this.buffer = buffer;
    this.index = index;
    this.start = start;
  }
};
var BufferNode = class extends BaseNode {
  get name() {
    return this.type.name;
  }
  get from() {
    return this.context.start + this.context.buffer.buffer[this.index + 1];
  }
  get to() {
    return this.context.start + this.context.buffer.buffer[this.index + 2];
  }
  constructor(context, _parent, index) {
    super();
    this.context = context;
    this._parent = _parent;
    this.index = index;
    this.type = context.buffer.set.types[context.buffer.buffer[index]];
  }
  child(dir, pos, side) {
    let { buffer } = this.context;
    let index = buffer.findChild(this.index + 4, buffer.buffer[this.index + 3], dir, pos - this.context.start, side);
    return index < 0 ? null : new BufferNode(this.context, this, index);
  }
  get firstChild() {
    return this.child(1, 0, 4);
  }
  get lastChild() {
    return this.child(-1, 0, 4);
  }
  childAfter(pos) {
    return this.child(1, pos, 2);
  }
  childBefore(pos) {
    return this.child(-1, pos, -2);
  }
  enter(pos, side, mode = 0) {
    if (mode & IterMode.ExcludeBuffers)
      return null;
    let { buffer } = this.context;
    let index = buffer.findChild(this.index + 4, buffer.buffer[this.index + 3], side > 0 ? 1 : -1, pos - this.context.start, side);
    return index < 0 ? null : new BufferNode(this.context, this, index);
  }
  get parent() {
    return this._parent || this.context.parent.nextSignificantParent();
  }
  externalSibling(dir) {
    return this._parent ? null : this.context.parent.nextChild(this.context.index + dir, dir, 0, 4);
  }
  get nextSibling() {
    let { buffer } = this.context;
    let after = buffer.buffer[this.index + 3];
    if (after < (this._parent ? buffer.buffer[this._parent.index + 3] : buffer.buffer.length))
      return new BufferNode(this.context, this._parent, after);
    return this.externalSibling(1);
  }
  get prevSibling() {
    let { buffer } = this.context;
    let parentStart = this._parent ? this._parent.index + 4 : 0;
    if (this.index == parentStart)
      return this.externalSibling(-1);
    return new BufferNode(this.context, this._parent, buffer.findChild(parentStart, this.index, -1, 0, 4));
  }
  get tree() {
    return null;
  }
  toTree() {
    let children = [], positions = [];
    let { buffer } = this.context;
    let startI = this.index + 4, endI = buffer.buffer[this.index + 3];
    if (endI > startI) {
      let from = buffer.buffer[this.index + 1];
      children.push(buffer.slice(startI, endI, from));
      positions.push(0);
    }
    return new Tree(this.type, children, positions, this.to - this.from);
  }
  toString() {
    return this.context.buffer.childString(this.index);
  }
};
function iterStack(heads) {
  if (!heads.length)
    return null;
  let pick = 0, picked = heads[0];
  for (let i = 1; i < heads.length; i++) {
    let node = heads[i];
    if (node.from > picked.from || node.to < picked.to) {
      picked = node;
      pick = i;
    }
  }
  let next = picked instanceof TreeNode && picked.index < 0 ? null : picked.parent;
  let newHeads = heads.slice();
  if (next)
    newHeads[pick] = next;
  else
    newHeads.splice(pick, 1);
  return new StackIterator(newHeads, picked);
}
var StackIterator = class {
  constructor(heads, node) {
    this.heads = heads;
    this.node = node;
  }
  get next() {
    return iterStack(this.heads);
  }
};
function stackIterator(tree, pos, side) {
  let inner = tree.resolveInner(pos, side), layers = null;
  for (let scan = inner instanceof TreeNode ? inner : inner.context.parent; scan; scan = scan.parent) {
    if (scan.index < 0) {
      let parent = scan.parent;
      (layers || (layers = [inner])).push(parent.resolve(pos, side));
      scan = parent;
    } else {
      let mount = MountedTree.get(scan.tree);
      if (mount && mount.overlay && mount.overlay[0].from <= pos && mount.overlay[mount.overlay.length - 1].to >= pos) {
        let root = new TreeNode(mount.tree, mount.overlay[0].from + scan.from, -1, scan);
        (layers || (layers = [inner])).push(resolveNode(root, pos, side, false));
      }
    }
  }
  return layers ? iterStack(layers) : inner;
}
var TreeCursor = class {
  get name() {
    return this.type.name;
  }
  constructor(node, mode = 0) {
    this.mode = mode;
    this.buffer = null;
    this.stack = [];
    this.index = 0;
    this.bufferNode = null;
    if (node instanceof TreeNode) {
      this.yieldNode(node);
    } else {
      this._tree = node.context.parent;
      this.buffer = node.context;
      for (let n = node._parent; n; n = n._parent)
        this.stack.unshift(n.index);
      this.bufferNode = node;
      this.yieldBuf(node.index);
    }
  }
  yieldNode(node) {
    if (!node)
      return false;
    this._tree = node;
    this.type = node.type;
    this.from = node.from;
    this.to = node.to;
    return true;
  }
  yieldBuf(index, type) {
    this.index = index;
    let { start, buffer } = this.buffer;
    this.type = type || buffer.set.types[buffer.buffer[index]];
    this.from = start + buffer.buffer[index + 1];
    this.to = start + buffer.buffer[index + 2];
    return true;
  }
  yield(node) {
    if (!node)
      return false;
    if (node instanceof TreeNode) {
      this.buffer = null;
      return this.yieldNode(node);
    }
    this.buffer = node.context;
    return this.yieldBuf(node.index, node.type);
  }
  toString() {
    return this.buffer ? this.buffer.buffer.childString(this.index) : this._tree.toString();
  }
  enterChild(dir, pos, side) {
    if (!this.buffer)
      return this.yield(this._tree.nextChild(dir < 0 ? this._tree._tree.children.length - 1 : 0, dir, pos, side, this.mode));
    let { buffer } = this.buffer;
    let index = buffer.findChild(this.index + 4, buffer.buffer[this.index + 3], dir, pos - this.buffer.start, side);
    if (index < 0)
      return false;
    this.stack.push(this.index);
    return this.yieldBuf(index);
  }
  firstChild() {
    return this.enterChild(1, 0, 4);
  }
  lastChild() {
    return this.enterChild(-1, 0, 4);
  }
  childAfter(pos) {
    return this.enterChild(1, pos, 2);
  }
  childBefore(pos) {
    return this.enterChild(-1, pos, -2);
  }
  enter(pos, side, mode = this.mode) {
    if (!this.buffer)
      return this.yield(this._tree.enter(pos, side, mode));
    return mode & IterMode.ExcludeBuffers ? false : this.enterChild(1, pos, side);
  }
  parent() {
    if (!this.buffer)
      return this.yieldNode(this.mode & IterMode.IncludeAnonymous ? this._tree._parent : this._tree.parent);
    if (this.stack.length)
      return this.yieldBuf(this.stack.pop());
    let parent = this.mode & IterMode.IncludeAnonymous ? this.buffer.parent : this.buffer.parent.nextSignificantParent();
    this.buffer = null;
    return this.yieldNode(parent);
  }
  sibling(dir) {
    if (!this.buffer)
      return !this._tree._parent ? false : this.yield(this._tree.index < 0 ? null : this._tree._parent.nextChild(this._tree.index + dir, dir, 0, 4, this.mode));
    let { buffer } = this.buffer, d = this.stack.length - 1;
    if (dir < 0) {
      let parentStart = d < 0 ? 0 : this.stack[d] + 4;
      if (this.index != parentStart)
        return this.yieldBuf(buffer.findChild(parentStart, this.index, -1, 0, 4));
    } else {
      let after = buffer.buffer[this.index + 3];
      if (after < (d < 0 ? buffer.buffer.length : buffer.buffer[this.stack[d] + 3]))
        return this.yieldBuf(after);
    }
    return d < 0 ? this.yield(this.buffer.parent.nextChild(this.buffer.index + dir, dir, 0, 4, this.mode)) : false;
  }
  nextSibling() {
    return this.sibling(1);
  }
  prevSibling() {
    return this.sibling(-1);
  }
  atLastNode(dir) {
    let index, parent, { buffer } = this;
    if (buffer) {
      if (dir > 0) {
        if (this.index < buffer.buffer.buffer.length)
          return false;
      } else {
        for (let i = 0; i < this.index; i++)
          if (buffer.buffer.buffer[i + 3] < this.index)
            return false;
      }
      ({ index, parent } = buffer);
    } else {
      ({ index, _parent: parent } = this._tree);
    }
    for (; parent; { index, _parent: parent } = parent) {
      if (index > -1)
        for (let i = index + dir, e = dir < 0 ? -1 : parent._tree.children.length; i != e; i += dir) {
          let child = parent._tree.children[i];
          if (this.mode & IterMode.IncludeAnonymous || child instanceof TreeBuffer || !child.type.isAnonymous || hasChild(child))
            return false;
        }
    }
    return true;
  }
  move(dir, enter) {
    if (enter && this.enterChild(dir, 0, 4))
      return true;
    for (; ; ) {
      if (this.sibling(dir))
        return true;
      if (this.atLastNode(dir) || !this.parent())
        return false;
    }
  }
  next(enter = true) {
    return this.move(1, enter);
  }
  prev(enter = true) {
    return this.move(-1, enter);
  }
  moveTo(pos, side = 0) {
    while (this.from == this.to || (side < 1 ? this.from >= pos : this.from > pos) || (side > -1 ? this.to <= pos : this.to < pos))
      if (!this.parent())
        break;
    while (this.enterChild(1, pos, side)) {
    }
    return this;
  }
  get node() {
    if (!this.buffer)
      return this._tree;
    let cache2 = this.bufferNode, result = null, depth = 0;
    if (cache2 && cache2.context == this.buffer) {
      scan:
        for (let index = this.index, d = this.stack.length; d >= 0; ) {
          for (let c = cache2; c; c = c._parent)
            if (c.index == index) {
              if (index == this.index)
                return c;
              result = c;
              depth = d + 1;
              break scan;
            }
          index = this.stack[--d];
        }
    }
    for (let i = depth; i < this.stack.length; i++)
      result = new BufferNode(this.buffer, result, this.stack[i]);
    return this.bufferNode = new BufferNode(this.buffer, result, this.index);
  }
  get tree() {
    return this.buffer ? null : this._tree._tree;
  }
  iterate(enter, leave) {
    for (let depth = 0; ; ) {
      let mustLeave = false;
      if (this.type.isAnonymous || enter(this) !== false) {
        if (this.firstChild()) {
          depth++;
          continue;
        }
        if (!this.type.isAnonymous)
          mustLeave = true;
      }
      for (; ; ) {
        if (mustLeave && leave)
          leave(this);
        mustLeave = this.type.isAnonymous;
        if (this.nextSibling())
          break;
        if (!depth)
          return;
        this.parent();
        depth--;
        mustLeave = true;
      }
    }
  }
  matchContext(context) {
    if (!this.buffer)
      return matchNodeContext(this.node, context);
    let { buffer } = this.buffer, { types: types2 } = buffer.set;
    for (let i = context.length - 1, d = this.stack.length - 1; i >= 0; d--) {
      if (d < 0)
        return matchNodeContext(this.node, context, i);
      let type = types2[buffer.buffer[this.stack[d]]];
      if (!type.isAnonymous) {
        if (context[i] && context[i] != type.name)
          return false;
        i--;
      }
    }
    return true;
  }
};
function hasChild(tree) {
  return tree.children.some((ch) => ch instanceof TreeBuffer || !ch.type.isAnonymous || hasChild(ch));
}
function buildTree(data2) {
  var _a2;
  let { buffer, nodeSet, maxBufferLength = DefaultBufferLength, reused = [], minRepeatType = nodeSet.types.length } = data2;
  let cursor = Array.isArray(buffer) ? new FlatBufferCursor(buffer, buffer.length) : buffer;
  let types2 = nodeSet.types;
  let contextHash = 0, lookAhead = 0;
  function takeNode(parentStart, minPos, children2, positions2, inRepeat, depth) {
    let { id: id2, start, end, size } = cursor;
    let lookAheadAtStart = lookAhead;
    while (size < 0) {
      cursor.next();
      if (size == -1) {
        let node2 = reused[id2];
        children2.push(node2);
        positions2.push(start - parentStart);
        return;
      } else if (size == -3) {
        contextHash = id2;
        return;
      } else if (size == -4) {
        lookAhead = id2;
        return;
      } else {
        throw new RangeError(`Unrecognized record size: ${size}`);
      }
    }
    let type = types2[id2], node, buffer2;
    let startPos = start - parentStart;
    if (end - start <= maxBufferLength && (buffer2 = findBufferSize(cursor.pos - minPos, inRepeat))) {
      let data3 = new Uint16Array(buffer2.size - buffer2.skip);
      let endPos = cursor.pos - buffer2.size, index = data3.length;
      while (cursor.pos > endPos)
        index = copyToBuffer(buffer2.start, data3, index);
      node = new TreeBuffer(data3, end - buffer2.start, nodeSet);
      startPos = buffer2.start - parentStart;
    } else {
      let endPos = cursor.pos - size;
      cursor.next();
      let localChildren = [], localPositions = [];
      let localInRepeat = id2 >= minRepeatType ? id2 : -1;
      let lastGroup = 0, lastEnd = end;
      while (cursor.pos > endPos) {
        if (localInRepeat >= 0 && cursor.id == localInRepeat && cursor.size >= 0) {
          if (cursor.end <= lastEnd - maxBufferLength) {
            makeRepeatLeaf(localChildren, localPositions, start, lastGroup, cursor.end, lastEnd, localInRepeat, lookAheadAtStart);
            lastGroup = localChildren.length;
            lastEnd = cursor.end;
          }
          cursor.next();
        } else if (depth > 2500) {
          takeFlatNode(start, endPos, localChildren, localPositions);
        } else {
          takeNode(start, endPos, localChildren, localPositions, localInRepeat, depth + 1);
        }
      }
      if (localInRepeat >= 0 && lastGroup > 0 && lastGroup < localChildren.length)
        makeRepeatLeaf(localChildren, localPositions, start, lastGroup, start, lastEnd, localInRepeat, lookAheadAtStart);
      localChildren.reverse();
      localPositions.reverse();
      if (localInRepeat > -1 && lastGroup > 0) {
        let make = makeBalanced(type);
        node = balanceRange(type, localChildren, localPositions, 0, localChildren.length, 0, end - start, make, make);
      } else {
        node = makeTree(type, localChildren, localPositions, end - start, lookAheadAtStart - end);
      }
    }
    children2.push(node);
    positions2.push(startPos);
  }
  function takeFlatNode(parentStart, minPos, children2, positions2) {
    let nodes = [];
    let nodeCount = 0, stopAt = -1;
    while (cursor.pos > minPos) {
      let { id: id2, start, end, size } = cursor;
      if (size > 4) {
        cursor.next();
      } else if (stopAt > -1 && start < stopAt) {
        break;
      } else {
        if (stopAt < 0)
          stopAt = end - maxBufferLength;
        nodes.push(id2, start, end);
        nodeCount++;
        cursor.next();
      }
    }
    if (nodeCount) {
      let buffer2 = new Uint16Array(nodeCount * 4);
      let start = nodes[nodes.length - 2];
      for (let i = nodes.length - 3, j = 0; i >= 0; i -= 3) {
        buffer2[j++] = nodes[i];
        buffer2[j++] = nodes[i + 1] - start;
        buffer2[j++] = nodes[i + 2] - start;
        buffer2[j++] = j;
      }
      children2.push(new TreeBuffer(buffer2, nodes[2] - start, nodeSet));
      positions2.push(start - parentStart);
    }
  }
  function makeBalanced(type) {
    return (children2, positions2, length2) => {
      let lookAhead2 = 0, lastI = children2.length - 1, last, lookAheadProp;
      if (lastI >= 0 && (last = children2[lastI]) instanceof Tree) {
        if (!lastI && last.type == type && last.length == length2)
          return last;
        if (lookAheadProp = last.prop(NodeProp.lookAhead))
          lookAhead2 = positions2[lastI] + last.length + lookAheadProp;
      }
      return makeTree(type, children2, positions2, length2, lookAhead2);
    };
  }
  function makeRepeatLeaf(children2, positions2, base2, i, from, to, type, lookAhead2) {
    let localChildren = [], localPositions = [];
    while (children2.length > i) {
      localChildren.push(children2.pop());
      localPositions.push(positions2.pop() + base2 - from);
    }
    children2.push(makeTree(nodeSet.types[type], localChildren, localPositions, to - from, lookAhead2 - to));
    positions2.push(from - base2);
  }
  function makeTree(type, children2, positions2, length2, lookAhead2 = 0, props) {
    if (contextHash) {
      let pair2 = [NodeProp.contextHash, contextHash];
      props = props ? [pair2].concat(props) : [pair2];
    }
    if (lookAhead2 > 25) {
      let pair2 = [NodeProp.lookAhead, lookAhead2];
      props = props ? [pair2].concat(props) : [pair2];
    }
    return new Tree(type, children2, positions2, length2, props);
  }
  function findBufferSize(maxSize, inRepeat) {
    let fork = cursor.fork();
    let size = 0, start = 0, skip = 0, minStart = fork.end - maxBufferLength;
    let result = { size: 0, start: 0, skip: 0 };
    scan:
      for (let minPos = fork.pos - maxSize; fork.pos > minPos; ) {
        let nodeSize2 = fork.size;
        if (fork.id == inRepeat && nodeSize2 >= 0) {
          result.size = size;
          result.start = start;
          result.skip = skip;
          skip += 4;
          size += 4;
          fork.next();
          continue;
        }
        let startPos = fork.pos - nodeSize2;
        if (nodeSize2 < 0 || startPos < minPos || fork.start < minStart)
          break;
        let localSkipped = fork.id >= minRepeatType ? 4 : 0;
        let nodeStart = fork.start;
        fork.next();
        while (fork.pos > startPos) {
          if (fork.size < 0) {
            if (fork.size == -3)
              localSkipped += 4;
            else
              break scan;
          } else if (fork.id >= minRepeatType) {
            localSkipped += 4;
          }
          fork.next();
        }
        start = nodeStart;
        size += nodeSize2;
        skip += localSkipped;
      }
    if (inRepeat < 0 || size == maxSize) {
      result.size = size;
      result.start = start;
      result.skip = skip;
    }
    return result.size > 4 ? result : void 0;
  }
  function copyToBuffer(bufferStart, buffer2, index) {
    let { id: id2, start, end, size } = cursor;
    cursor.next();
    if (size >= 0 && id2 < minRepeatType) {
      let startIndex = index;
      if (size > 4) {
        let endPos = cursor.pos - (size - 4);
        while (cursor.pos > endPos)
          index = copyToBuffer(bufferStart, buffer2, index);
      }
      buffer2[--index] = startIndex;
      buffer2[--index] = end - bufferStart;
      buffer2[--index] = start - bufferStart;
      buffer2[--index] = id2;
    } else if (size == -3) {
      contextHash = id2;
    } else if (size == -4) {
      lookAhead = id2;
    }
    return index;
  }
  let children = [], positions = [];
  while (cursor.pos > 0)
    takeNode(data2.start || 0, data2.bufferStart || 0, children, positions, -1, 0);
  let length = (_a2 = data2.length) !== null && _a2 !== void 0 ? _a2 : children.length ? positions[0] + children[0].length : 0;
  return new Tree(types2[data2.topID], children.reverse(), positions.reverse(), length);
}
var nodeSizeCache = new WeakMap();
function nodeSize(balanceType, node) {
  if (!balanceType.isAnonymous || node instanceof TreeBuffer || node.type != balanceType)
    return 1;
  let size = nodeSizeCache.get(node);
  if (size == null) {
    size = 1;
    for (let child of node.children) {
      if (child.type != balanceType || !(child instanceof Tree)) {
        size = 1;
        break;
      }
      size += nodeSize(balanceType, child);
    }
    nodeSizeCache.set(node, size);
  }
  return size;
}
function balanceRange(balanceType, children, positions, from, to, start, length, mkTop, mkTree) {
  let total = 0;
  for (let i = from; i < to; i++)
    total += nodeSize(balanceType, children[i]);
  let maxChild = Math.ceil(total * 1.5 / 8);
  let localChildren = [], localPositions = [];
  function divide(children2, positions2, from2, to2, offset) {
    for (let i = from2; i < to2; ) {
      let groupFrom = i, groupStart = positions2[i], groupSize = nodeSize(balanceType, children2[i]);
      i++;
      for (; i < to2; i++) {
        let nextSize = nodeSize(balanceType, children2[i]);
        if (groupSize + nextSize >= maxChild)
          break;
        groupSize += nextSize;
      }
      if (i == groupFrom + 1) {
        if (groupSize > maxChild) {
          let only = children2[groupFrom];
          divide(only.children, only.positions, 0, only.children.length, positions2[groupFrom] + offset);
          continue;
        }
        localChildren.push(children2[groupFrom]);
      } else {
        let length2 = positions2[i - 1] + children2[i - 1].length - groupStart;
        localChildren.push(balanceRange(balanceType, children2, positions2, groupFrom, i, groupStart, length2, null, mkTree));
      }
      localPositions.push(groupStart + offset - start);
    }
  }
  divide(children, positions, from, to, 0);
  return (mkTop || mkTree)(localChildren, localPositions, length);
}
var NodeWeakMap = class {
  constructor() {
    this.map = new WeakMap();
  }
  setBuffer(buffer, index, value) {
    let inner = this.map.get(buffer);
    if (!inner)
      this.map.set(buffer, inner = new Map());
    inner.set(index, value);
  }
  getBuffer(buffer, index) {
    let inner = this.map.get(buffer);
    return inner && inner.get(index);
  }
  set(node, value) {
    if (node instanceof BufferNode)
      this.setBuffer(node.context.buffer, node.index, value);
    else if (node instanceof TreeNode)
      this.map.set(node.tree, value);
  }
  get(node) {
    return node instanceof BufferNode ? this.getBuffer(node.context.buffer, node.index) : node instanceof TreeNode ? this.map.get(node.tree) : void 0;
  }
  cursorSet(cursor, value) {
    if (cursor.buffer)
      this.setBuffer(cursor.buffer.buffer, cursor.index, value);
    else
      this.map.set(cursor.tree, value);
  }
  cursorGet(cursor) {
    return cursor.buffer ? this.getBuffer(cursor.buffer.buffer, cursor.index) : this.map.get(cursor.tree);
  }
};
var TreeFragment = class {
  constructor(from, to, tree, offset, openStart = false, openEnd = false) {
    this.from = from;
    this.to = to;
    this.tree = tree;
    this.offset = offset;
    this.open = (openStart ? 1 : 0) | (openEnd ? 2 : 0);
  }
  get openStart() {
    return (this.open & 1) > 0;
  }
  get openEnd() {
    return (this.open & 2) > 0;
  }
  static addTree(tree, fragments = [], partial = false) {
    let result = [new TreeFragment(0, tree.length, tree, 0, false, partial)];
    for (let f of fragments)
      if (f.to > tree.length)
        result.push(f);
    return result;
  }
  static applyChanges(fragments, changes, minGap = 128) {
    if (!changes.length)
      return fragments;
    let result = [];
    let fI = 1, nextF = fragments.length ? fragments[0] : null;
    for (let cI = 0, pos = 0, off = 0; ; cI++) {
      let nextC = cI < changes.length ? changes[cI] : null;
      let nextPos = nextC ? nextC.fromA : 1e9;
      if (nextPos - pos >= minGap)
        while (nextF && nextF.from < nextPos) {
          let cut = nextF;
          if (pos >= cut.from || nextPos <= cut.to || off) {
            let fFrom = Math.max(cut.from, pos) - off, fTo = Math.min(cut.to, nextPos) - off;
            cut = fFrom >= fTo ? null : new TreeFragment(fFrom, fTo, cut.tree, cut.offset + off, cI > 0, !!nextC);
          }
          if (cut)
            result.push(cut);
          if (nextF.to > nextPos)
            break;
          nextF = fI < fragments.length ? fragments[fI++] : null;
        }
      if (!nextC)
        break;
      pos = nextC.toA;
      off = nextC.toA - nextC.toB;
    }
    return result;
  }
};
var Parser = class {
  startParse(input, fragments, ranges) {
    if (typeof input == "string")
      input = new StringInput(input);
    ranges = !ranges ? [new Range2(0, input.length)] : ranges.length ? ranges.map((r) => new Range2(r.from, r.to)) : [new Range2(0, 0)];
    return this.createParse(input, fragments || [], ranges);
  }
  parse(input, fragments, ranges) {
    let parse = this.startParse(input, fragments, ranges);
    for (; ; ) {
      let done = parse.advance();
      if (done)
        return done;
    }
  }
};
var StringInput = class {
  constructor(string2) {
    this.string = string2;
  }
  get length() {
    return this.string.length;
  }
  chunk(from) {
    return this.string.slice(from);
  }
  get lineChunks() {
    return false;
  }
  read(from, to) {
    return this.string.slice(from, to);
  }
};
function parseMixed(nest) {
  return (parse, input, fragments, ranges) => new MixedParse(parse, nest, input, fragments, ranges);
}
var InnerParse = class {
  constructor(parser5, parse, overlay, target, from) {
    this.parser = parser5;
    this.parse = parse;
    this.overlay = overlay;
    this.target = target;
    this.from = from;
  }
};
function checkRanges(ranges) {
  if (!ranges.length || ranges.some((r) => r.from >= r.to))
    throw new RangeError("Invalid inner parse ranges given: " + JSON.stringify(ranges));
}
var ActiveOverlay = class {
  constructor(parser5, predicate, mounts, index, start, target, prev) {
    this.parser = parser5;
    this.predicate = predicate;
    this.mounts = mounts;
    this.index = index;
    this.start = start;
    this.target = target;
    this.prev = prev;
    this.depth = 0;
    this.ranges = [];
  }
};
var stoppedInner = new NodeProp({ perNode: true });
var MixedParse = class {
  constructor(base2, nest, input, fragments, ranges) {
    this.nest = nest;
    this.input = input;
    this.fragments = fragments;
    this.ranges = ranges;
    this.inner = [];
    this.innerDone = 0;
    this.baseTree = null;
    this.stoppedAt = null;
    this.baseParse = base2;
  }
  advance() {
    if (this.baseParse) {
      let done2 = this.baseParse.advance();
      if (!done2)
        return null;
      this.baseParse = null;
      this.baseTree = done2;
      this.startInner();
      if (this.stoppedAt != null)
        for (let inner2 of this.inner)
          inner2.parse.stopAt(this.stoppedAt);
    }
    if (this.innerDone == this.inner.length) {
      let result = this.baseTree;
      if (this.stoppedAt != null)
        result = new Tree(result.type, result.children, result.positions, result.length, result.propValues.concat([[stoppedInner, this.stoppedAt]]));
      return result;
    }
    let inner = this.inner[this.innerDone], done = inner.parse.advance();
    if (done) {
      this.innerDone++;
      let props = Object.assign(Object.create(null), inner.target.props);
      props[NodeProp.mounted.id] = new MountedTree(done, inner.overlay, inner.parser);
      inner.target.props = props;
    }
    return null;
  }
  get parsedPos() {
    if (this.baseParse)
      return 0;
    let pos = this.input.length;
    for (let i = this.innerDone; i < this.inner.length; i++) {
      if (this.inner[i].from < pos)
        pos = Math.min(pos, this.inner[i].parse.parsedPos);
    }
    return pos;
  }
  stopAt(pos) {
    this.stoppedAt = pos;
    if (this.baseParse)
      this.baseParse.stopAt(pos);
    else
      for (let i = this.innerDone; i < this.inner.length; i++)
        this.inner[i].parse.stopAt(pos);
  }
  startInner() {
    let fragmentCursor = new FragmentCursor(this.fragments);
    let overlay = null;
    let covered = null;
    let cursor = new TreeCursor(new TreeNode(this.baseTree, this.ranges[0].from, 0, null), IterMode.IncludeAnonymous | IterMode.IgnoreMounts);
    scan:
      for (let nest, isCovered; ; ) {
        let enter = true, range;
        if (this.stoppedAt != null && cursor.from >= this.stoppedAt) {
          enter = false;
        } else if (fragmentCursor.hasNode(cursor)) {
          if (overlay) {
            let match = overlay.mounts.find((m) => m.frag.from <= cursor.from && m.frag.to >= cursor.to && m.mount.overlay);
            if (match)
              for (let r of match.mount.overlay) {
                let from = r.from + match.pos, to = r.to + match.pos;
                if (from >= cursor.from && to <= cursor.to && !overlay.ranges.some((r2) => r2.from < to && r2.to > from))
                  overlay.ranges.push({ from, to });
              }
          }
          enter = false;
        } else if (covered && (isCovered = checkCover(covered.ranges, cursor.from, cursor.to))) {
          enter = isCovered != 2;
        } else if (!cursor.type.isAnonymous && (nest = this.nest(cursor, this.input)) && (cursor.from < cursor.to || !nest.overlay)) {
          if (!cursor.tree)
            materialize(cursor);
          let oldMounts = fragmentCursor.findMounts(cursor.from, nest.parser);
          if (typeof nest.overlay == "function") {
            overlay = new ActiveOverlay(nest.parser, nest.overlay, oldMounts, this.inner.length, cursor.from, cursor.tree, overlay);
          } else {
            let ranges = punchRanges(this.ranges, nest.overlay || (cursor.from < cursor.to ? [new Range2(cursor.from, cursor.to)] : []));
            if (ranges.length)
              checkRanges(ranges);
            if (ranges.length || !nest.overlay)
              this.inner.push(new InnerParse(nest.parser, ranges.length ? nest.parser.startParse(this.input, enterFragments(oldMounts, ranges), ranges) : nest.parser.startParse(""), nest.overlay ? nest.overlay.map((r) => new Range2(r.from - cursor.from, r.to - cursor.from)) : null, cursor.tree, ranges.length ? ranges[0].from : cursor.from));
            if (!nest.overlay)
              enter = false;
            else if (ranges.length)
              covered = { ranges, depth: 0, prev: covered };
          }
        } else if (overlay && (range = overlay.predicate(cursor))) {
          if (range === true)
            range = new Range2(cursor.from, cursor.to);
          if (range.from < range.to)
            overlay.ranges.push(range);
        }
        if (enter && cursor.firstChild()) {
          if (overlay)
            overlay.depth++;
          if (covered)
            covered.depth++;
        } else {
          for (; ; ) {
            if (cursor.nextSibling())
              break;
            if (!cursor.parent())
              break scan;
            if (overlay && !--overlay.depth) {
              let ranges = punchRanges(this.ranges, overlay.ranges);
              if (ranges.length) {
                checkRanges(ranges);
                this.inner.splice(overlay.index, 0, new InnerParse(overlay.parser, overlay.parser.startParse(this.input, enterFragments(overlay.mounts, ranges), ranges), overlay.ranges.map((r) => new Range2(r.from - overlay.start, r.to - overlay.start)), overlay.target, ranges[0].from));
              }
              overlay = overlay.prev;
            }
            if (covered && !--covered.depth)
              covered = covered.prev;
          }
        }
      }
  }
};
function checkCover(covered, from, to) {
  for (let range of covered) {
    if (range.from >= to)
      break;
    if (range.to > from)
      return range.from <= from && range.to >= to ? 2 : 1;
  }
  return 0;
}
function sliceBuf(buf, startI, endI, nodes, positions, off) {
  if (startI < endI) {
    let from = buf.buffer[startI + 1];
    nodes.push(buf.slice(startI, endI, from));
    positions.push(from - off);
  }
}
function materialize(cursor) {
  let { node } = cursor, stack = [];
  let buffer = node.context.buffer;
  do {
    stack.push(cursor.index);
    cursor.parent();
  } while (!cursor.tree);
  let base2 = cursor.tree, i = base2.children.indexOf(buffer);
  let buf = base2.children[i], b = buf.buffer, newStack = [i];
  function split(startI, endI, type, innerOffset, length, stackPos) {
    let targetI = stack[stackPos];
    let children = [], positions = [];
    sliceBuf(buf, startI, targetI, children, positions, innerOffset);
    let from = b[targetI + 1], to = b[targetI + 2];
    newStack.push(children.length);
    let child = stackPos ? split(targetI + 4, b[targetI + 3], buf.set.types[b[targetI]], from, to - from, stackPos - 1) : node.toTree();
    children.push(child);
    positions.push(from - innerOffset);
    sliceBuf(buf, b[targetI + 3], endI, children, positions, innerOffset);
    return new Tree(type, children, positions, length);
  }
  base2.children[i] = split(0, b.length, NodeType.none, 0, buf.length, stack.length - 1);
  for (let index of newStack) {
    let tree = cursor.tree.children[index], pos = cursor.tree.positions[index];
    cursor.yield(new TreeNode(tree, pos + cursor.from, index, cursor._tree));
  }
}
var StructureCursor = class {
  constructor(root, offset) {
    this.offset = offset;
    this.done = false;
    this.cursor = root.cursor(IterMode.IncludeAnonymous | IterMode.IgnoreMounts);
  }
  moveTo(pos) {
    let { cursor } = this, p = pos - this.offset;
    while (!this.done && cursor.from < p) {
      if (cursor.to >= pos && cursor.enter(p, 1, IterMode.IgnoreOverlays | IterMode.ExcludeBuffers))
        ;
      else if (!cursor.next(false))
        this.done = true;
    }
  }
  hasNode(cursor) {
    this.moveTo(cursor.from);
    if (!this.done && this.cursor.from + this.offset == cursor.from && this.cursor.tree) {
      for (let tree = this.cursor.tree; ; ) {
        if (tree == cursor.tree)
          return true;
        if (tree.children.length && tree.positions[0] == 0 && tree.children[0] instanceof Tree)
          tree = tree.children[0];
        else
          break;
      }
    }
    return false;
  }
};
var FragmentCursor = class {
  constructor(fragments) {
    var _a2;
    this.fragments = fragments;
    this.curTo = 0;
    this.fragI = 0;
    if (fragments.length) {
      let first = this.curFrag = fragments[0];
      this.curTo = (_a2 = first.tree.prop(stoppedInner)) !== null && _a2 !== void 0 ? _a2 : first.to;
      this.inner = new StructureCursor(first.tree, -first.offset);
    } else {
      this.curFrag = this.inner = null;
    }
  }
  hasNode(node) {
    while (this.curFrag && node.from >= this.curTo)
      this.nextFrag();
    return this.curFrag && this.curFrag.from <= node.from && this.curTo >= node.to && this.inner.hasNode(node);
  }
  nextFrag() {
    var _a2;
    this.fragI++;
    if (this.fragI == this.fragments.length) {
      this.curFrag = this.inner = null;
    } else {
      let frag = this.curFrag = this.fragments[this.fragI];
      this.curTo = (_a2 = frag.tree.prop(stoppedInner)) !== null && _a2 !== void 0 ? _a2 : frag.to;
      this.inner = new StructureCursor(frag.tree, -frag.offset);
    }
  }
  findMounts(pos, parser5) {
    var _a2;
    let result = [];
    if (this.inner) {
      this.inner.cursor.moveTo(pos, 1);
      for (let pos2 = this.inner.cursor.node; pos2; pos2 = pos2.parent) {
        let mount = (_a2 = pos2.tree) === null || _a2 === void 0 ? void 0 : _a2.prop(NodeProp.mounted);
        if (mount && mount.parser == parser5) {
          for (let i = this.fragI; i < this.fragments.length; i++) {
            let frag = this.fragments[i];
            if (frag.from >= pos2.to)
              break;
            if (frag.tree == this.curFrag.tree)
              result.push({
                frag,
                pos: pos2.from - frag.offset,
                mount
              });
          }
        }
      }
    }
    return result;
  }
};
function punchRanges(outer, ranges) {
  let copy = null, current = ranges;
  for (let i = 1, j = 0; i < outer.length; i++) {
    let gapFrom = outer[i - 1].to, gapTo = outer[i].from;
    for (; j < current.length; j++) {
      let r = current[j];
      if (r.from >= gapTo)
        break;
      if (r.to <= gapFrom)
        continue;
      if (!copy)
        current = copy = ranges.slice();
      if (r.from < gapFrom) {
        copy[j] = new Range2(r.from, gapFrom);
        if (r.to > gapTo)
          copy.splice(j + 1, 0, new Range2(gapTo, r.to));
      } else if (r.to > gapTo) {
        copy[j--] = new Range2(gapTo, r.to);
      } else {
        copy.splice(j--, 1);
      }
    }
  }
  return current;
}
function findCoverChanges(a, b, from, to) {
  let iA = 0, iB = 0, inA = false, inB = false, pos = -1e9;
  let result = [];
  for (; ; ) {
    let nextA = iA == a.length ? 1e9 : inA ? a[iA].to : a[iA].from;
    let nextB = iB == b.length ? 1e9 : inB ? b[iB].to : b[iB].from;
    if (inA != inB) {
      let start = Math.max(pos, from), end = Math.min(nextA, nextB, to);
      if (start < end)
        result.push(new Range2(start, end));
    }
    pos = Math.min(nextA, nextB);
    if (pos == 1e9)
      break;
    if (nextA == pos) {
      if (!inA)
        inA = true;
      else {
        inA = false;
        iA++;
      }
    }
    if (nextB == pos) {
      if (!inB)
        inB = true;
      else {
        inB = false;
        iB++;
      }
    }
  }
  return result;
}
function enterFragments(mounts, ranges) {
  let result = [];
  for (let { pos, mount, frag } of mounts) {
    let startPos = pos + (mount.overlay ? mount.overlay[0].from : 0), endPos = startPos + mount.tree.length;
    let from = Math.max(frag.from, startPos), to = Math.min(frag.to, endPos);
    if (mount.overlay) {
      let overlay = mount.overlay.map((r) => new Range2(r.from + pos, r.to + pos));
      let changes = findCoverChanges(ranges, overlay, from, to);
      for (let i = 0, pos2 = from; ; i++) {
        let last = i == changes.length, end = last ? to : changes[i].from;
        if (end > pos2)
          result.push(new TreeFragment(pos2, end, mount.tree, -startPos, frag.from >= pos2 || frag.openStart, frag.to <= end || frag.openEnd));
        if (last)
          break;
        pos2 = changes[i].to;
      }
    } else {
      result.push(new TreeFragment(from, to, mount.tree, -startPos, frag.from >= startPos || frag.openStart, frag.to <= endPos || frag.openEnd));
    }
  }
  return result;
}

// node_modules/@lezer/highlight/dist/index.js
var nextTagID = 0;
var Tag = class {
  constructor(set, base2, modified) {
    this.set = set;
    this.base = base2;
    this.modified = modified;
    this.id = nextTagID++;
  }
  static define(parent) {
    if (parent === null || parent === void 0 ? void 0 : parent.base)
      throw new Error("Can not derive from a modified tag");
    let tag = new Tag([], null, []);
    tag.set.push(tag);
    if (parent)
      for (let t2 of parent.set)
        tag.set.push(t2);
    return tag;
  }
  static defineModifier() {
    let mod = new Modifier();
    return (tag) => {
      if (tag.modified.indexOf(mod) > -1)
        return tag;
      return Modifier.get(tag.base || tag, tag.modified.concat(mod).sort((a, b) => a.id - b.id));
    };
  }
};
var nextModifierID = 0;
var Modifier = class {
  constructor() {
    this.instances = [];
    this.id = nextModifierID++;
  }
  static get(base2, mods) {
    if (!mods.length)
      return base2;
    let exists = mods[0].instances.find((t2) => t2.base == base2 && sameArray2(mods, t2.modified));
    if (exists)
      return exists;
    let set = [], tag = new Tag(set, base2, mods);
    for (let m of mods)
      m.instances.push(tag);
    let configs = powerSet(mods);
    for (let parent of base2.set)
      if (!parent.modified.length)
        for (let config of configs)
          set.push(Modifier.get(parent, config));
    return tag;
  }
};
function sameArray2(a, b) {
  return a.length == b.length && a.every((x, i) => x == b[i]);
}
function powerSet(array) {
  let sets = [[]];
  for (let i = 0; i < array.length; i++) {
    for (let j = 0, e = sets.length; j < e; j++) {
      sets.push(sets[j].concat(array[i]));
    }
  }
  return sets.sort((a, b) => b.length - a.length);
}
function styleTags(spec) {
  let byName = Object.create(null);
  for (let prop in spec) {
    let tags3 = spec[prop];
    if (!Array.isArray(tags3))
      tags3 = [tags3];
    for (let part of prop.split(" "))
      if (part) {
        let pieces = [], mode = 2, rest = part;
        for (let pos = 0; ; ) {
          if (rest == "..." && pos > 0 && pos + 3 == part.length) {
            mode = 1;
            break;
          }
          let m = /^"(?:[^"\\]|\\.)*?"|[^\/!]+/.exec(rest);
          if (!m)
            throw new RangeError("Invalid path: " + part);
          pieces.push(m[0] == "*" ? "" : m[0][0] == '"' ? JSON.parse(m[0]) : m[0]);
          pos += m[0].length;
          if (pos == part.length)
            break;
          let next = part[pos++];
          if (pos == part.length && next == "!") {
            mode = 0;
            break;
          }
          if (next != "/")
            throw new RangeError("Invalid path: " + part);
          rest = part.slice(pos);
        }
        let last = pieces.length - 1, inner = pieces[last];
        if (!inner)
          throw new RangeError("Invalid path: " + part);
        let rule = new Rule(tags3, mode, last > 0 ? pieces.slice(0, last) : null);
        byName[inner] = rule.sort(byName[inner]);
      }
  }
  return ruleNodeProp.add(byName);
}
var ruleNodeProp = new NodeProp();
var Rule = class {
  constructor(tags3, mode, context, next) {
    this.tags = tags3;
    this.mode = mode;
    this.context = context;
    this.next = next;
  }
  get opaque() {
    return this.mode == 0;
  }
  get inherit() {
    return this.mode == 1;
  }
  sort(other) {
    if (!other || other.depth < this.depth) {
      this.next = other;
      return this;
    }
    other.next = this.sort(other.next);
    return other;
  }
  get depth() {
    return this.context ? this.context.length : 0;
  }
};
Rule.empty = new Rule([], 2, null);
function tagHighlighter(tags3, options) {
  let map = Object.create(null);
  for (let style of tags3) {
    if (!Array.isArray(style.tag))
      map[style.tag.id] = style.class;
    else
      for (let tag of style.tag)
        map[tag.id] = style.class;
  }
  let { scope, all = null } = options || {};
  return {
    style: (tags4) => {
      let cls = all;
      for (let tag of tags4) {
        for (let sub of tag.set) {
          let tagClass = map[sub.id];
          if (tagClass) {
            cls = cls ? cls + " " + tagClass : tagClass;
            break;
          }
        }
      }
      return cls;
    },
    scope
  };
}
function highlightTags(highlighters, tags3) {
  let result = null;
  for (let highlighter of highlighters) {
    let value = highlighter.style(tags3);
    if (value)
      result = result ? result + " " + value : value;
  }
  return result;
}
function highlightTree(tree, highlighter, putStyle, from = 0, to = tree.length) {
  let builder = new HighlightBuilder(from, Array.isArray(highlighter) ? highlighter : [highlighter], putStyle);
  builder.highlightRange(tree.cursor(), from, to, "", builder.highlighters);
  builder.flush(to);
}
var HighlightBuilder = class {
  constructor(at, highlighters, span) {
    this.at = at;
    this.highlighters = highlighters;
    this.span = span;
    this.class = "";
  }
  startSpan(at, cls) {
    if (cls != this.class) {
      this.flush(at);
      if (at > this.at)
        this.at = at;
      this.class = cls;
    }
  }
  flush(to) {
    if (to > this.at && this.class)
      this.span(this.at, to, this.class);
  }
  highlightRange(cursor, from, to, inheritedClass, highlighters) {
    let { type, from: start, to: end } = cursor;
    if (start >= to || end <= from)
      return;
    if (type.isTop)
      highlighters = this.highlighters.filter((h) => !h.scope || h.scope(type));
    let cls = inheritedClass;
    let rule = getStyleTags(cursor) || Rule.empty;
    let tagCls = highlightTags(highlighters, rule.tags);
    if (tagCls) {
      if (cls)
        cls += " ";
      cls += tagCls;
      if (rule.mode == 1)
        inheritedClass += (inheritedClass ? " " : "") + tagCls;
    }
    this.startSpan(Math.max(from, start), cls);
    if (rule.opaque)
      return;
    let mounted = cursor.tree && cursor.tree.prop(NodeProp.mounted);
    if (mounted && mounted.overlay) {
      let inner = cursor.node.enter(mounted.overlay[0].from + start, 1);
      let innerHighlighters = this.highlighters.filter((h) => !h.scope || h.scope(mounted.tree.type));
      let hasChild2 = cursor.firstChild();
      for (let i = 0, pos = start; ; i++) {
        let next = i < mounted.overlay.length ? mounted.overlay[i] : null;
        let nextPos = next ? next.from + start : end;
        let rangeFrom = Math.max(from, pos), rangeTo = Math.min(to, nextPos);
        if (rangeFrom < rangeTo && hasChild2) {
          while (cursor.from < rangeTo) {
            this.highlightRange(cursor, rangeFrom, rangeTo, inheritedClass, highlighters);
            this.startSpan(Math.min(rangeTo, cursor.to), cls);
            if (cursor.to >= nextPos || !cursor.nextSibling())
              break;
          }
        }
        if (!next || nextPos > to)
          break;
        pos = next.to + start;
        if (pos > from) {
          this.highlightRange(inner.cursor(), Math.max(from, next.from + start), Math.min(to, pos), "", innerHighlighters);
          this.startSpan(Math.min(to, pos), cls);
        }
      }
      if (hasChild2)
        cursor.parent();
    } else if (cursor.firstChild()) {
      if (mounted)
        inheritedClass = "";
      do {
        if (cursor.to <= from)
          continue;
        if (cursor.from >= to)
          break;
        this.highlightRange(cursor, from, to, inheritedClass, highlighters);
        this.startSpan(Math.min(to, cursor.to), cls);
      } while (cursor.nextSibling());
      cursor.parent();
    }
  }
};
function getStyleTags(node) {
  let rule = node.type.prop(ruleNodeProp);
  while (rule && rule.context && !node.matchContext(rule.context))
    rule = rule.next;
  return rule || null;
}
var t = Tag.define;
var comment = t();
var name = t();
var typeName = t(name);
var propertyName = t(name);
var literal = t();
var string = t(literal);
var number = t(literal);
var content = t();
var heading = t(content);
var keyword = t();
var operator = t();
var punctuation = t();
var bracket = t(punctuation);
var meta = t();
var tags = {
  comment,
  lineComment: t(comment),
  blockComment: t(comment),
  docComment: t(comment),
  name,
  variableName: t(name),
  typeName,
  tagName: t(typeName),
  propertyName,
  attributeName: t(propertyName),
  className: t(name),
  labelName: t(name),
  namespace: t(name),
  macroName: t(name),
  literal,
  string,
  docString: t(string),
  character: t(string),
  attributeValue: t(string),
  number,
  integer: t(number),
  float: t(number),
  bool: t(literal),
  regexp: t(literal),
  escape: t(literal),
  color: t(literal),
  url: t(literal),
  keyword,
  self: t(keyword),
  null: t(keyword),
  atom: t(keyword),
  unit: t(keyword),
  modifier: t(keyword),
  operatorKeyword: t(keyword),
  controlKeyword: t(keyword),
  definitionKeyword: t(keyword),
  moduleKeyword: t(keyword),
  operator,
  derefOperator: t(operator),
  arithmeticOperator: t(operator),
  logicOperator: t(operator),
  bitwiseOperator: t(operator),
  compareOperator: t(operator),
  updateOperator: t(operator),
  definitionOperator: t(operator),
  typeOperator: t(operator),
  controlOperator: t(operator),
  punctuation,
  separator: t(punctuation),
  bracket,
  angleBracket: t(bracket),
  squareBracket: t(bracket),
  paren: t(bracket),
  brace: t(bracket),
  content,
  heading,
  heading1: t(heading),
  heading2: t(heading),
  heading3: t(heading),
  heading4: t(heading),
  heading5: t(heading),
  heading6: t(heading),
  contentSeparator: t(content),
  list: t(content),
  quote: t(content),
  emphasis: t(content),
  strong: t(content),
  link: t(content),
  monospace: t(content),
  strikethrough: t(content),
  inserted: t(),
  deleted: t(),
  changed: t(),
  invalid: t(),
  meta,
  documentMeta: t(meta),
  annotation: t(meta),
  processingInstruction: t(meta),
  definition: Tag.defineModifier(),
  constant: Tag.defineModifier(),
  function: Tag.defineModifier(),
  standard: Tag.defineModifier(),
  local: Tag.defineModifier(),
  special: Tag.defineModifier()
};
var classHighlighter = tagHighlighter([
  { tag: tags.link, class: "tok-link" },
  { tag: tags.heading, class: "tok-heading" },
  { tag: tags.emphasis, class: "tok-emphasis" },
  { tag: tags.strong, class: "tok-strong" },
  { tag: tags.keyword, class: "tok-keyword" },
  { tag: tags.atom, class: "tok-atom" },
  { tag: tags.bool, class: "tok-bool" },
  { tag: tags.url, class: "tok-url" },
  { tag: tags.labelName, class: "tok-labelName" },
  { tag: tags.inserted, class: "tok-inserted" },
  { tag: tags.deleted, class: "tok-deleted" },
  { tag: tags.literal, class: "tok-literal" },
  { tag: tags.string, class: "tok-string" },
  { tag: tags.number, class: "tok-number" },
  { tag: [tags.regexp, tags.escape, tags.special(tags.string)], class: "tok-string2" },
  { tag: tags.variableName, class: "tok-variableName" },
  { tag: tags.local(tags.variableName), class: "tok-variableName tok-local" },
  { tag: tags.definition(tags.variableName), class: "tok-variableName tok-definition" },
  { tag: tags.special(tags.variableName), class: "tok-variableName2" },
  { tag: tags.definition(tags.propertyName), class: "tok-propertyName tok-definition" },
  { tag: tags.typeName, class: "tok-typeName" },
  { tag: tags.namespace, class: "tok-namespace" },
  { tag: tags.className, class: "tok-className" },
  { tag: tags.macroName, class: "tok-macroName" },
  { tag: tags.propertyName, class: "tok-propertyName" },
  { tag: tags.operator, class: "tok-operator" },
  { tag: tags.comment, class: "tok-comment" },
  { tag: tags.meta, class: "tok-meta" },
  { tag: tags.invalid, class: "tok-invalid" },
  { tag: tags.punctuation, class: "tok-punctuation" }
]);

// node_modules/@codemirror/language/dist/index.js
var _a;
var languageDataProp = /* @__PURE__ */ new NodeProp();
function defineLanguageFacet(baseData) {
  return Facet.define({
    combine: baseData ? (values2) => values2.concat(baseData) : void 0
  });
}
var sublanguageProp = /* @__PURE__ */ new NodeProp();
var Language = class {
  constructor(data2, parser5, extraExtensions = [], name2 = "") {
    this.data = data2;
    this.name = name2;
    if (!EditorState.prototype.hasOwnProperty("tree"))
      Object.defineProperty(EditorState.prototype, "tree", { get() {
        return syntaxTree(this);
      } });
    this.parser = parser5;
    this.extension = [
      language.of(this),
      EditorState.languageData.of((state, pos, side) => {
        let top2 = topNodeAt(state, pos, side), data3 = top2.type.prop(languageDataProp);
        if (!data3)
          return [];
        let base2 = state.facet(data3), sub = top2.type.prop(sublanguageProp);
        if (sub) {
          let innerNode = top2.resolve(pos - top2.from, side);
          for (let sublang of sub)
            if (sublang.test(innerNode, state)) {
              let data4 = state.facet(sublang.facet);
              return sublang.type == "replace" ? data4 : data4.concat(base2);
            }
        }
        return base2;
      })
    ].concat(extraExtensions);
  }
  isActiveAt(state, pos, side = -1) {
    return topNodeAt(state, pos, side).type.prop(languageDataProp) == this.data;
  }
  findRegions(state) {
    let lang = state.facet(language);
    if ((lang === null || lang === void 0 ? void 0 : lang.data) == this.data)
      return [{ from: 0, to: state.doc.length }];
    if (!lang || !lang.allowsNesting)
      return [];
    let result = [];
    let explore = (tree, from) => {
      if (tree.prop(languageDataProp) == this.data) {
        result.push({ from, to: from + tree.length });
        return;
      }
      let mount = tree.prop(NodeProp.mounted);
      if (mount) {
        if (mount.tree.prop(languageDataProp) == this.data) {
          if (mount.overlay)
            for (let r of mount.overlay)
              result.push({ from: r.from + from, to: r.to + from });
          else
            result.push({ from, to: from + tree.length });
          return;
        } else if (mount.overlay) {
          let size = result.length;
          explore(mount.tree, mount.overlay[0].from + from);
          if (result.length > size)
            return;
        }
      }
      for (let i = 0; i < tree.children.length; i++) {
        let ch = tree.children[i];
        if (ch instanceof Tree)
          explore(ch, tree.positions[i] + from);
      }
    };
    explore(syntaxTree(state), 0);
    return result;
  }
  get allowsNesting() {
    return true;
  }
};
Language.setState = /* @__PURE__ */ StateEffect.define();
function topNodeAt(state, pos, side) {
  let topLang = state.facet(language), tree = syntaxTree(state).topNode;
  if (!topLang || topLang.allowsNesting) {
    for (let node = tree; node; node = node.enter(pos, side, IterMode.ExcludeBuffers))
      if (node.type.isTop)
        tree = node;
  }
  return tree;
}
var LRLanguage = class extends Language {
  constructor(data2, parser5, name2) {
    super(data2, parser5, [], name2);
    this.parser = parser5;
  }
  static define(spec) {
    let data2 = defineLanguageFacet(spec.languageData);
    return new LRLanguage(data2, spec.parser.configure({
      props: [languageDataProp.add((type) => type.isTop ? data2 : void 0)]
    }), spec.name);
  }
  configure(options, name2) {
    return new LRLanguage(this.data, this.parser.configure(options), name2 || this.name);
  }
  get allowsNesting() {
    return this.parser.hasWrappers();
  }
};
function syntaxTree(state) {
  let field = state.field(Language.state, false);
  return field ? field.tree : Tree.empty;
}
var DocInput = class {
  constructor(doc2) {
    this.doc = doc2;
    this.cursorPos = 0;
    this.string = "";
    this.cursor = doc2.iter();
  }
  get length() {
    return this.doc.length;
  }
  syncTo(pos) {
    this.string = this.cursor.next(pos - this.cursorPos).value;
    this.cursorPos = pos + this.string.length;
    return this.cursorPos - this.string.length;
  }
  chunk(pos) {
    this.syncTo(pos);
    return this.string;
  }
  get lineChunks() {
    return true;
  }
  read(from, to) {
    let stringStart = this.cursorPos - this.string.length;
    if (from < stringStart || to >= this.cursorPos)
      return this.doc.sliceString(from, to);
    else
      return this.string.slice(from - stringStart, to - stringStart);
  }
};
var currentContext = null;
var ParseContext = class {
  constructor(parser5, state, fragments = [], tree, treeLen, viewport, skipped, scheduleOn) {
    this.parser = parser5;
    this.state = state;
    this.fragments = fragments;
    this.tree = tree;
    this.treeLen = treeLen;
    this.viewport = viewport;
    this.skipped = skipped;
    this.scheduleOn = scheduleOn;
    this.parse = null;
    this.tempSkipped = [];
  }
  static create(parser5, state, viewport) {
    return new ParseContext(parser5, state, [], Tree.empty, 0, viewport, [], null);
  }
  startParse() {
    return this.parser.startParse(new DocInput(this.state.doc), this.fragments);
  }
  work(until, upto) {
    if (upto != null && upto >= this.state.doc.length)
      upto = void 0;
    if (this.tree != Tree.empty && this.isDone(upto !== null && upto !== void 0 ? upto : this.state.doc.length)) {
      this.takeTree();
      return true;
    }
    return this.withContext(() => {
      var _a2;
      if (typeof until == "number") {
        let endTime = Date.now() + until;
        until = () => Date.now() > endTime;
      }
      if (!this.parse)
        this.parse = this.startParse();
      if (upto != null && (this.parse.stoppedAt == null || this.parse.stoppedAt > upto) && upto < this.state.doc.length)
        this.parse.stopAt(upto);
      for (; ; ) {
        let done = this.parse.advance();
        if (done) {
          this.fragments = this.withoutTempSkipped(TreeFragment.addTree(done, this.fragments, this.parse.stoppedAt != null));
          this.treeLen = (_a2 = this.parse.stoppedAt) !== null && _a2 !== void 0 ? _a2 : this.state.doc.length;
          this.tree = done;
          this.parse = null;
          if (this.treeLen < (upto !== null && upto !== void 0 ? upto : this.state.doc.length))
            this.parse = this.startParse();
          else
            return true;
        }
        if (until())
          return false;
      }
    });
  }
  takeTree() {
    let pos, tree;
    if (this.parse && (pos = this.parse.parsedPos) >= this.treeLen) {
      if (this.parse.stoppedAt == null || this.parse.stoppedAt > pos)
        this.parse.stopAt(pos);
      this.withContext(() => {
        while (!(tree = this.parse.advance())) {
        }
      });
      this.treeLen = pos;
      this.tree = tree;
      this.fragments = this.withoutTempSkipped(TreeFragment.addTree(this.tree, this.fragments, true));
      this.parse = null;
    }
  }
  withContext(f) {
    let prev = currentContext;
    currentContext = this;
    try {
      return f();
    } finally {
      currentContext = prev;
    }
  }
  withoutTempSkipped(fragments) {
    for (let r; r = this.tempSkipped.pop(); )
      fragments = cutFragments(fragments, r.from, r.to);
    return fragments;
  }
  changes(changes, newState) {
    let { fragments, tree, treeLen, viewport, skipped } = this;
    this.takeTree();
    if (!changes.empty) {
      let ranges = [];
      changes.iterChangedRanges((fromA, toA, fromB, toB) => ranges.push({ fromA, toA, fromB, toB }));
      fragments = TreeFragment.applyChanges(fragments, ranges);
      tree = Tree.empty;
      treeLen = 0;
      viewport = { from: changes.mapPos(viewport.from, -1), to: changes.mapPos(viewport.to, 1) };
      if (this.skipped.length) {
        skipped = [];
        for (let r of this.skipped) {
          let from = changes.mapPos(r.from, 1), to = changes.mapPos(r.to, -1);
          if (from < to)
            skipped.push({ from, to });
        }
      }
    }
    return new ParseContext(this.parser, newState, fragments, tree, treeLen, viewport, skipped, this.scheduleOn);
  }
  updateViewport(viewport) {
    if (this.viewport.from == viewport.from && this.viewport.to == viewport.to)
      return false;
    this.viewport = viewport;
    let startLen = this.skipped.length;
    for (let i = 0; i < this.skipped.length; i++) {
      let { from, to } = this.skipped[i];
      if (from < viewport.to && to > viewport.from) {
        this.fragments = cutFragments(this.fragments, from, to);
        this.skipped.splice(i--, 1);
      }
    }
    if (this.skipped.length >= startLen)
      return false;
    this.reset();
    return true;
  }
  reset() {
    if (this.parse) {
      this.takeTree();
      this.parse = null;
    }
  }
  skipUntilInView(from, to) {
    this.skipped.push({ from, to });
  }
  static getSkippingParser(until) {
    return new class extends Parser {
      createParse(input, fragments, ranges) {
        let from = ranges[0].from, to = ranges[ranges.length - 1].to;
        let parser5 = {
          parsedPos: from,
          advance() {
            let cx = currentContext;
            if (cx) {
              for (let r of ranges)
                cx.tempSkipped.push(r);
              if (until)
                cx.scheduleOn = cx.scheduleOn ? Promise.all([cx.scheduleOn, until]) : until;
            }
            this.parsedPos = to;
            return new Tree(NodeType.none, [], [], to - from);
          },
          stoppedAt: null,
          stopAt() {
          }
        };
        return parser5;
      }
    }();
  }
  isDone(upto) {
    upto = Math.min(upto, this.state.doc.length);
    let frags = this.fragments;
    return this.treeLen >= upto && frags.length && frags[0].from == 0 && frags[0].to >= upto;
  }
  static get() {
    return currentContext;
  }
};
function cutFragments(fragments, from, to) {
  return TreeFragment.applyChanges(fragments, [{ fromA: from, toA: to, fromB: from, toB: to }]);
}
var LanguageState = class {
  constructor(context) {
    this.context = context;
    this.tree = context.tree;
  }
  apply(tr) {
    if (!tr.docChanged && this.tree == this.context.tree)
      return this;
    let newCx = this.context.changes(tr.changes, tr.state);
    let upto = this.context.treeLen == tr.startState.doc.length ? void 0 : Math.max(tr.changes.mapPos(this.context.treeLen), newCx.viewport.to);
    if (!newCx.work(20, upto))
      newCx.takeTree();
    return new LanguageState(newCx);
  }
  static init(state) {
    let vpTo = Math.min(3e3, state.doc.length);
    let parseState = ParseContext.create(state.facet(language).parser, state, { from: 0, to: vpTo });
    if (!parseState.work(20, vpTo))
      parseState.takeTree();
    return new LanguageState(parseState);
  }
};
Language.state = /* @__PURE__ */ StateField.define({
  create: LanguageState.init,
  update(value, tr) {
    for (let e of tr.effects)
      if (e.is(Language.setState))
        return e.value;
    if (tr.startState.facet(language) != tr.state.facet(language))
      return LanguageState.init(tr.state);
    return value.apply(tr);
  }
});
var requestIdle = (callback) => {
  let timeout = setTimeout(() => callback(), 500);
  return () => clearTimeout(timeout);
};
if (typeof requestIdleCallback != "undefined")
  requestIdle = (callback) => {
    let idle = -1, timeout = setTimeout(() => {
      idle = requestIdleCallback(callback, { timeout: 500 - 100 });
    }, 100);
    return () => idle < 0 ? clearTimeout(timeout) : cancelIdleCallback(idle);
  };
var isInputPending = typeof navigator != "undefined" && ((_a = navigator.scheduling) === null || _a === void 0 ? void 0 : _a.isInputPending) ? () => navigator.scheduling.isInputPending() : null;
var parseWorker = /* @__PURE__ */ ViewPlugin.fromClass(class ParseWorker {
  constructor(view) {
    this.view = view;
    this.working = null;
    this.workScheduled = 0;
    this.chunkEnd = -1;
    this.chunkBudget = -1;
    this.work = this.work.bind(this);
    this.scheduleWork();
  }
  update(update) {
    let cx = this.view.state.field(Language.state).context;
    if (cx.updateViewport(update.view.viewport) || this.view.viewport.to > cx.treeLen)
      this.scheduleWork();
    if (update.docChanged || update.selectionSet) {
      if (this.view.hasFocus)
        this.chunkBudget += 50;
      this.scheduleWork();
    }
    this.checkAsyncSchedule(cx);
  }
  scheduleWork() {
    if (this.working)
      return;
    let { state } = this.view, field = state.field(Language.state);
    if (field.tree != field.context.tree || !field.context.isDone(state.doc.length))
      this.working = requestIdle(this.work);
  }
  work(deadline) {
    this.working = null;
    let now = Date.now();
    if (this.chunkEnd < now && (this.chunkEnd < 0 || this.view.hasFocus)) {
      this.chunkEnd = now + 3e4;
      this.chunkBudget = 3e3;
    }
    if (this.chunkBudget <= 0)
      return;
    let { state, viewport: { to: vpTo } } = this.view, field = state.field(Language.state);
    if (field.tree == field.context.tree && field.context.isDone(vpTo + 1e5))
      return;
    let endTime = Date.now() + Math.min(this.chunkBudget, 100, deadline && !isInputPending ? Math.max(25, deadline.timeRemaining() - 5) : 1e9);
    let viewportFirst = field.context.treeLen < vpTo && state.doc.length > vpTo + 1e3;
    let done = field.context.work(() => {
      return isInputPending && isInputPending() || Date.now() > endTime;
    }, vpTo + (viewportFirst ? 0 : 1e5));
    this.chunkBudget -= Date.now() - now;
    if (done || this.chunkBudget <= 0) {
      field.context.takeTree();
      this.view.dispatch({ effects: Language.setState.of(new LanguageState(field.context)) });
    }
    if (this.chunkBudget > 0 && !(done && !viewportFirst))
      this.scheduleWork();
    this.checkAsyncSchedule(field.context);
  }
  checkAsyncSchedule(cx) {
    if (cx.scheduleOn) {
      this.workScheduled++;
      cx.scheduleOn.then(() => this.scheduleWork()).catch((err) => logException(this.view.state, err)).then(() => this.workScheduled--);
      cx.scheduleOn = null;
    }
  }
  destroy() {
    if (this.working)
      this.working();
  }
  isWorking() {
    return !!(this.working || this.workScheduled > 0);
  }
}, {
  eventHandlers: { focus() {
    this.scheduleWork();
  } }
});
var language = /* @__PURE__ */ Facet.define({
  combine(languages) {
    return languages.length ? languages[0] : null;
  },
  enables: (language2) => [
    Language.state,
    parseWorker,
    EditorView.contentAttributes.compute([language2], (state) => {
      let lang = state.facet(language2);
      return lang && lang.name ? { "data-language": lang.name } : {};
    })
  ]
});
var LanguageSupport = class {
  constructor(language2, support = []) {
    this.language = language2;
    this.support = support;
    this.extension = [language2, support];
  }
};
var LanguageDescription = class {
  constructor(name2, alias, extensions, filename, loadFunc, support = void 0) {
    this.name = name2;
    this.alias = alias;
    this.extensions = extensions;
    this.filename = filename;
    this.loadFunc = loadFunc;
    this.support = support;
    this.loading = null;
  }
  load() {
    return this.loading || (this.loading = this.loadFunc().then((support) => this.support = support, (err) => {
      this.loading = null;
      throw err;
    }));
  }
  static of(spec) {
    let { load, support } = spec;
    if (!load) {
      if (!support)
        throw new RangeError("Must pass either 'load' or 'support' to LanguageDescription.of");
      load = () => Promise.resolve(support);
    }
    return new LanguageDescription(spec.name, (spec.alias || []).concat(spec.name).map((s) => s.toLowerCase()), spec.extensions || [], spec.filename, load, support);
  }
  static matchFilename(descs, filename) {
    for (let d of descs)
      if (d.filename && d.filename.test(filename))
        return d;
    let ext = /\.([^.]+)$/.exec(filename);
    if (ext) {
      for (let d of descs)
        if (d.extensions.indexOf(ext[1]) > -1)
          return d;
    }
    return null;
  }
  static matchLanguageName(descs, name2, fuzzy = true) {
    name2 = name2.toLowerCase();
    for (let d of descs)
      if (d.alias.some((a) => a == name2))
        return d;
    if (fuzzy)
      for (let d of descs)
        for (let a of d.alias) {
          let found = name2.indexOf(a);
          if (found > -1 && (a.length > 2 || !/\w/.test(name2[found - 1]) && !/\w/.test(name2[found + a.length])))
            return d;
        }
    return null;
  }
};
var indentService = /* @__PURE__ */ Facet.define();
var indentUnit = /* @__PURE__ */ Facet.define({
  combine: (values2) => {
    if (!values2.length)
      return "  ";
    let unit = values2[0];
    if (!unit || /\S/.test(unit) || Array.from(unit).some((e) => e != unit[0]))
      throw new Error("Invalid indent unit: " + JSON.stringify(values2[0]));
    return unit;
  }
});
function getIndentUnit(state) {
  let unit = state.facet(indentUnit);
  return unit.charCodeAt(0) == 9 ? state.tabSize * unit.length : unit.length;
}
function indentString(state, cols) {
  let result = "", ts = state.tabSize, ch = state.facet(indentUnit)[0];
  if (ch == "	") {
    while (cols >= ts) {
      result += "	";
      cols -= ts;
    }
    ch = " ";
  }
  for (let i = 0; i < cols; i++)
    result += ch;
  return result;
}
function getIndentation(context, pos) {
  if (context instanceof EditorState)
    context = new IndentContext(context);
  for (let service of context.state.facet(indentService)) {
    let result = service(context, pos);
    if (result !== void 0)
      return result;
  }
  let tree = syntaxTree(context.state);
  return tree.length >= pos ? syntaxIndentation(context, tree, pos) : null;
}
var IndentContext = class {
  constructor(state, options = {}) {
    this.state = state;
    this.options = options;
    this.unit = getIndentUnit(state);
  }
  lineAt(pos, bias = 1) {
    let line = this.state.doc.lineAt(pos);
    let { simulateBreak, simulateDoubleBreak } = this.options;
    if (simulateBreak != null && simulateBreak >= line.from && simulateBreak <= line.to) {
      if (simulateDoubleBreak && simulateBreak == pos)
        return { text: "", from: pos };
      else if (bias < 0 ? simulateBreak < pos : simulateBreak <= pos)
        return { text: line.text.slice(simulateBreak - line.from), from: simulateBreak };
      else
        return { text: line.text.slice(0, simulateBreak - line.from), from: line.from };
    }
    return line;
  }
  textAfterPos(pos, bias = 1) {
    if (this.options.simulateDoubleBreak && pos == this.options.simulateBreak)
      return "";
    let { text, from } = this.lineAt(pos, bias);
    return text.slice(pos - from, Math.min(text.length, pos + 100 - from));
  }
  column(pos, bias = 1) {
    let { text, from } = this.lineAt(pos, bias);
    let result = this.countColumn(text, pos - from);
    let override = this.options.overrideIndentation ? this.options.overrideIndentation(from) : -1;
    if (override > -1)
      result += override - this.countColumn(text, text.search(/\S|$/));
    return result;
  }
  countColumn(line, pos = line.length) {
    return countColumn(line, this.state.tabSize, pos);
  }
  lineIndent(pos, bias = 1) {
    let { text, from } = this.lineAt(pos, bias);
    let override = this.options.overrideIndentation;
    if (override) {
      let overriden = override(from);
      if (overriden > -1)
        return overriden;
    }
    return this.countColumn(text, text.search(/\S|$/));
  }
  get simulatedBreak() {
    return this.options.simulateBreak || null;
  }
};
var indentNodeProp = /* @__PURE__ */ new NodeProp();
function syntaxIndentation(cx, ast, pos) {
  let stack = ast.resolveStack(pos);
  let inner = stack.node.enterUnfinishedNodesBefore(pos);
  if (inner != stack.node) {
    let add = [];
    for (let cur = inner; cur != stack.node; cur = cur.parent)
      add.push(cur);
    for (let i = add.length - 1; i >= 0; i--)
      stack = { node: add[i], next: stack };
  }
  return indentFor(stack, cx, pos);
}
function indentFor(stack, cx, pos) {
  for (let cur = stack; cur; cur = cur.next) {
    let strategy = indentStrategy(cur.node);
    if (strategy)
      return strategy(TreeIndentContext.create(cx, pos, cur));
  }
  return 0;
}
function ignoreClosed(cx) {
  return cx.pos == cx.options.simulateBreak && cx.options.simulateDoubleBreak;
}
function indentStrategy(tree) {
  let strategy = tree.type.prop(indentNodeProp);
  if (strategy)
    return strategy;
  let first = tree.firstChild, close;
  if (first && (close = first.type.prop(NodeProp.closedBy))) {
    let last = tree.lastChild, closed = last && close.indexOf(last.name) > -1;
    return (cx) => delimitedStrategy(cx, true, 1, void 0, closed && !ignoreClosed(cx) ? last.from : void 0);
  }
  return tree.parent == null ? topIndent : null;
}
function topIndent() {
  return 0;
}
var TreeIndentContext = class extends IndentContext {
  constructor(base2, pos, context) {
    super(base2.state, base2.options);
    this.base = base2;
    this.pos = pos;
    this.context = context;
  }
  get node() {
    return this.context.node;
  }
  static create(base2, pos, context) {
    return new TreeIndentContext(base2, pos, context);
  }
  get textAfter() {
    return this.textAfterPos(this.pos);
  }
  get baseIndent() {
    return this.baseIndentFor(this.node);
  }
  baseIndentFor(node) {
    let line = this.state.doc.lineAt(node.from);
    for (; ; ) {
      let atBreak = node.resolve(line.from);
      while (atBreak.parent && atBreak.parent.from == atBreak.from)
        atBreak = atBreak.parent;
      if (isParent(atBreak, node))
        break;
      line = this.state.doc.lineAt(atBreak.from);
    }
    return this.lineIndent(line.from);
  }
  continue() {
    return indentFor(this.context.next, this.base, this.pos);
  }
};
function isParent(parent, of) {
  for (let cur = of; cur; cur = cur.parent)
    if (parent == cur)
      return true;
  return false;
}
function bracketedAligned(context) {
  let tree = context.node;
  let openToken = tree.childAfter(tree.from), last = tree.lastChild;
  if (!openToken)
    return null;
  let sim = context.options.simulateBreak;
  let openLine = context.state.doc.lineAt(openToken.from);
  let lineEnd2 = sim == null || sim <= openLine.from ? openLine.to : Math.min(openLine.to, sim);
  for (let pos = openToken.to; ; ) {
    let next = tree.childAfter(pos);
    if (!next || next == last)
      return null;
    if (!next.type.isSkipped)
      return next.from < lineEnd2 ? openToken : null;
    pos = next.to;
  }
}
function delimitedIndent({ closing, align = true, units = 1 }) {
  return (context) => delimitedStrategy(context, align, units, closing);
}
function delimitedStrategy(context, align, units, closing, closedAt) {
  let after = context.textAfter, space4 = after.match(/^\s*/)[0].length;
  let closed = closing && after.slice(space4, space4 + closing.length) == closing || closedAt == context.pos + space4;
  let aligned = align ? bracketedAligned(context) : null;
  if (aligned)
    return closed ? context.column(aligned.from) : context.column(aligned.to);
  return context.baseIndent + (closed ? 0 : context.unit * units);
}
var flatIndent = (context) => context.baseIndent;
function continuedIndent({ except, units = 1 } = {}) {
  return (context) => {
    let matchExcept = except && except.test(context.textAfter);
    return context.baseIndent + (matchExcept ? 0 : units * context.unit);
  };
}
var foldService = /* @__PURE__ */ Facet.define();
var foldNodeProp = /* @__PURE__ */ new NodeProp();
function foldInside(node) {
  let first = node.firstChild, last = node.lastChild;
  return first && first.to < last.from ? { from: first.to, to: last.type.isError ? node.to : last.from } : null;
}
var HighlightStyle = class {
  constructor(specs, options) {
    this.specs = specs;
    let modSpec;
    function def(spec) {
      let cls = StyleModule.newName();
      (modSpec || (modSpec = Object.create(null)))["." + cls] = spec;
      return cls;
    }
    const all = typeof options.all == "string" ? options.all : options.all ? def(options.all) : void 0;
    const scopeOpt = options.scope;
    this.scope = scopeOpt instanceof Language ? (type) => type.prop(languageDataProp) == scopeOpt.data : scopeOpt ? (type) => type == scopeOpt : void 0;
    this.style = tagHighlighter(specs.map((style) => ({
      tag: style.tag,
      class: style.class || def(Object.assign({}, style, { tag: null }))
    })), {
      all
    }).style;
    this.module = modSpec ? new StyleModule(modSpec) : null;
    this.themeType = options.themeType;
  }
  static define(specs, options) {
    return new HighlightStyle(specs, options || {});
  }
};
var highlighterFacet = /* @__PURE__ */ Facet.define();
var fallbackHighlighter = /* @__PURE__ */ Facet.define({
  combine(values2) {
    return values2.length ? [values2[0]] : null;
  }
});
function getHighlighters(state) {
  let main = state.facet(highlighterFacet);
  return main.length ? main : state.facet(fallbackHighlighter);
}
function syntaxHighlighting(highlighter, options) {
  let ext = [treeHighlighter], themeType;
  if (highlighter instanceof HighlightStyle) {
    if (highlighter.module)
      ext.push(EditorView.styleModule.of(highlighter.module));
    themeType = highlighter.themeType;
  }
  if (options === null || options === void 0 ? void 0 : options.fallback)
    ext.push(fallbackHighlighter.of(highlighter));
  else if (themeType)
    ext.push(highlighterFacet.computeN([EditorView.darkTheme], (state) => {
      return state.facet(EditorView.darkTheme) == (themeType == "dark") ? [highlighter] : [];
    }));
  else
    ext.push(highlighterFacet.of(highlighter));
  return ext;
}
var TreeHighlighter = class {
  constructor(view) {
    this.markCache = Object.create(null);
    this.tree = syntaxTree(view.state);
    this.decorations = this.buildDeco(view, getHighlighters(view.state));
    this.decoratedTo = view.viewport.to;
  }
  update(update) {
    let tree = syntaxTree(update.state), highlighters = getHighlighters(update.state);
    let styleChange = highlighters != getHighlighters(update.startState);
    let { viewport } = update.view, decoratedToMapped = update.changes.mapPos(this.decoratedTo, 1);
    if (tree.length < viewport.to && !styleChange && tree.type == this.tree.type && decoratedToMapped >= viewport.to) {
      this.decorations = this.decorations.map(update.changes);
      this.decoratedTo = decoratedToMapped;
    } else if (tree != this.tree || update.viewportChanged || styleChange) {
      this.tree = tree;
      this.decorations = this.buildDeco(update.view, highlighters);
      this.decoratedTo = viewport.to;
    }
  }
  buildDeco(view, highlighters) {
    if (!highlighters || !this.tree.length)
      return Decoration.none;
    let builder = new RangeSetBuilder();
    for (let { from, to } of view.visibleRanges) {
      highlightTree(this.tree, highlighters, (from2, to2, style) => {
        builder.add(from2, to2, this.markCache[style] || (this.markCache[style] = Decoration.mark({ class: style })));
      }, from, to);
    }
    return builder.finish();
  }
};
var treeHighlighter = /* @__PURE__ */ Prec.high(/* @__PURE__ */ ViewPlugin.fromClass(TreeHighlighter, {
  decorations: (v) => v.decorations
}));
var defaultHighlightStyle = /* @__PURE__ */ HighlightStyle.define([
  {
    tag: tags.meta,
    color: "#404740"
  },
  {
    tag: tags.link,
    textDecoration: "underline"
  },
  {
    tag: tags.heading,
    textDecoration: "underline",
    fontWeight: "bold"
  },
  {
    tag: tags.emphasis,
    fontStyle: "italic"
  },
  {
    tag: tags.strong,
    fontWeight: "bold"
  },
  {
    tag: tags.strikethrough,
    textDecoration: "line-through"
  },
  {
    tag: tags.keyword,
    color: "#708"
  },
  {
    tag: [tags.atom, tags.bool, tags.url, tags.contentSeparator, tags.labelName],
    color: "#219"
  },
  {
    tag: [tags.literal, tags.inserted],
    color: "#164"
  },
  {
    tag: [tags.string, tags.deleted],
    color: "#a11"
  },
  {
    tag: [tags.regexp, tags.escape, /* @__PURE__ */ tags.special(tags.string)],
    color: "#e40"
  },
  {
    tag: /* @__PURE__ */ tags.definition(tags.variableName),
    color: "#00f"
  },
  {
    tag: /* @__PURE__ */ tags.local(tags.variableName),
    color: "#30a"
  },
  {
    tag: [tags.typeName, tags.namespace],
    color: "#085"
  },
  {
    tag: tags.className,
    color: "#167"
  },
  {
    tag: [/* @__PURE__ */ tags.special(tags.variableName), tags.macroName],
    color: "#256"
  },
  {
    tag: /* @__PURE__ */ tags.definition(tags.propertyName),
    color: "#00c"
  },
  {
    tag: tags.comment,
    color: "#940"
  },
  {
    tag: tags.invalid,
    color: "#f00"
  }
]);
var DefaultScanDist = 1e4;
var DefaultBrackets = "()[]{}";
var bracketMatchingHandle = /* @__PURE__ */ new NodeProp();
function matchingNodes(node, dir, brackets) {
  let byProp = node.prop(dir < 0 ? NodeProp.openedBy : NodeProp.closedBy);
  if (byProp)
    return byProp;
  if (node.name.length == 1) {
    let index = brackets.indexOf(node.name);
    if (index > -1 && index % 2 == (dir < 0 ? 1 : 0))
      return [brackets[index + dir]];
  }
  return null;
}
function findHandle(node) {
  let hasHandle = node.type.prop(bracketMatchingHandle);
  return hasHandle ? hasHandle(node.node) : node;
}
function matchBrackets(state, pos, dir, config = {}) {
  let maxScanDistance = config.maxScanDistance || DefaultScanDist, brackets = config.brackets || DefaultBrackets;
  let tree = syntaxTree(state), node = tree.resolveInner(pos, dir);
  for (let cur = node; cur; cur = cur.parent) {
    let matches = matchingNodes(cur.type, dir, brackets);
    if (matches && cur.from < cur.to) {
      let handle = findHandle(cur);
      if (handle && (dir > 0 ? pos >= handle.from && pos < handle.to : pos > handle.from && pos <= handle.to))
        return matchMarkedBrackets(state, pos, dir, cur, handle, matches, brackets);
    }
  }
  return matchPlainBrackets(state, pos, dir, tree, node.type, maxScanDistance, brackets);
}
function matchMarkedBrackets(_state, _pos, dir, token, handle, matching, brackets) {
  let parent = token.parent, firstToken = { from: handle.from, to: handle.to };
  let depth = 0, cursor = parent === null || parent === void 0 ? void 0 : parent.cursor();
  if (cursor && (dir < 0 ? cursor.childBefore(token.from) : cursor.childAfter(token.to)))
    do {
      if (dir < 0 ? cursor.to <= token.from : cursor.from >= token.to) {
        if (depth == 0 && matching.indexOf(cursor.type.name) > -1 && cursor.from < cursor.to) {
          let endHandle = findHandle(cursor);
          return { start: firstToken, end: endHandle ? { from: endHandle.from, to: endHandle.to } : void 0, matched: true };
        } else if (matchingNodes(cursor.type, dir, brackets)) {
          depth++;
        } else if (matchingNodes(cursor.type, -dir, brackets)) {
          if (depth == 0) {
            let endHandle = findHandle(cursor);
            return {
              start: firstToken,
              end: endHandle && endHandle.from < endHandle.to ? { from: endHandle.from, to: endHandle.to } : void 0,
              matched: false
            };
          }
          depth--;
        }
      }
    } while (dir < 0 ? cursor.prevSibling() : cursor.nextSibling());
  return { start: firstToken, matched: false };
}
function matchPlainBrackets(state, pos, dir, tree, tokenType, maxScanDistance, brackets) {
  let startCh = dir < 0 ? state.sliceDoc(pos - 1, pos) : state.sliceDoc(pos, pos + 1);
  let bracket2 = brackets.indexOf(startCh);
  if (bracket2 < 0 || bracket2 % 2 == 0 != dir > 0)
    return null;
  let startToken = { from: dir < 0 ? pos - 1 : pos, to: dir > 0 ? pos + 1 : pos };
  let iter = state.doc.iterRange(pos, dir > 0 ? state.doc.length : 0), depth = 0;
  for (let distance = 0; !iter.next().done && distance <= maxScanDistance; ) {
    let text = iter.value;
    if (dir < 0)
      distance += text.length;
    let basePos = pos + distance * dir;
    for (let pos2 = dir > 0 ? 0 : text.length - 1, end = dir > 0 ? text.length : -1; pos2 != end; pos2 += dir) {
      let found = brackets.indexOf(text[pos2]);
      if (found < 0 || tree.resolveInner(basePos + pos2, 1).type != tokenType)
        continue;
      if (found % 2 == 0 == dir > 0) {
        depth++;
      } else if (depth == 1) {
        return { start: startToken, end: { from: basePos + pos2, to: basePos + pos2 + 1 }, matched: found >> 1 == bracket2 >> 1 };
      } else {
        depth--;
      }
    }
    if (dir > 0)
      distance += text.length;
  }
  return iter.done ? { start: startToken, matched: false } : null;
}
var noTokens = /* @__PURE__ */ Object.create(null);
var typeArray = [NodeType.none];
var warned = [];
var byTag = /* @__PURE__ */ Object.create(null);
var defaultTable = /* @__PURE__ */ Object.create(null);
for (let [legacyName, name2] of [
  ["variable", "variableName"],
  ["variable-2", "variableName.special"],
  ["string-2", "string.special"],
  ["def", "variableName.definition"],
  ["tag", "tagName"],
  ["attribute", "attributeName"],
  ["type", "typeName"],
  ["builtin", "variableName.standard"],
  ["qualifier", "modifier"],
  ["error", "invalid"],
  ["header", "heading"],
  ["property", "propertyName"]
])
  defaultTable[legacyName] = /* @__PURE__ */ createTokenType(noTokens, name2);
function warnForPart(part, msg) {
  if (warned.indexOf(part) > -1)
    return;
  warned.push(part);
  console.warn(msg);
}
function createTokenType(extra, tagStr) {
  let tags$1 = [];
  for (let name3 of tagStr.split(" ")) {
    let found = [];
    for (let part of name3.split(".")) {
      let value = extra[part] || tags[part];
      if (!value) {
        warnForPart(part, `Unknown highlighting tag ${part}`);
      } else if (typeof value == "function") {
        if (!found.length)
          warnForPart(part, `Modifier ${part} used at start of tag`);
        else
          found = found.map(value);
      } else {
        if (found.length)
          warnForPart(part, `Tag ${part} used as modifier`);
        else
          found = Array.isArray(value) ? value : [value];
      }
    }
    for (let tag of found)
      tags$1.push(tag);
  }
  if (!tags$1.length)
    return 0;
  let name2 = tagStr.replace(/ /g, "_"), key = name2 + " " + tags$1.map((t2) => t2.id);
  let known = byTag[key];
  if (known)
    return known.id;
  let type = byTag[key] = NodeType.define({
    id: typeArray.length,
    name: name2,
    props: [styleTags({ [name2]: tags$1 })]
  });
  typeArray.push(type);
  return type.id;
}
var marks = {
  rtl: /* @__PURE__ */ Decoration.mark({ class: "cm-iso", inclusive: true, attributes: { dir: "rtl" }, bidiIsolate: Direction.RTL }),
  ltr: /* @__PURE__ */ Decoration.mark({ class: "cm-iso", inclusive: true, attributes: { dir: "ltr" }, bidiIsolate: Direction.LTR }),
  auto: /* @__PURE__ */ Decoration.mark({ class: "cm-iso", inclusive: true, attributes: { dir: "auto" }, bidiIsolate: null })
};

// node_modules/@codemirror/commands/dist/index.js
var toggleComment = (target) => {
  let { state } = target, line = state.doc.lineAt(state.selection.main.from), config = getConfig(target.state, line.from);
  return config.line ? toggleLineComment(target) : config.block ? toggleBlockCommentByLine(target) : false;
};
function command(f, option) {
  return ({ state, dispatch }) => {
    if (state.readOnly)
      return false;
    let tr = f(option, state);
    if (!tr)
      return false;
    dispatch(state.update(tr));
    return true;
  };
}
var toggleLineComment = /* @__PURE__ */ command(changeLineComment, 0);
var toggleBlockComment = /* @__PURE__ */ command(changeBlockComment, 0);
var toggleBlockCommentByLine = /* @__PURE__ */ command((o, s) => changeBlockComment(o, s, selectedLineRanges(s)), 0);
function getConfig(state, pos) {
  let data2 = state.languageDataAt("commentTokens", pos);
  return data2.length ? data2[0] : {};
}
var SearchMargin = 50;
function findBlockComment(state, { open, close }, from, to) {
  let textBefore = state.sliceDoc(from - SearchMargin, from);
  let textAfter = state.sliceDoc(to, to + SearchMargin);
  let spaceBefore = /\s*$/.exec(textBefore)[0].length, spaceAfter = /^\s*/.exec(textAfter)[0].length;
  let beforeOff = textBefore.length - spaceBefore;
  if (textBefore.slice(beforeOff - open.length, beforeOff) == open && textAfter.slice(spaceAfter, spaceAfter + close.length) == close) {
    return {
      open: { pos: from - spaceBefore, margin: spaceBefore && 1 },
      close: { pos: to + spaceAfter, margin: spaceAfter && 1 }
    };
  }
  let startText, endText;
  if (to - from <= 2 * SearchMargin) {
    startText = endText = state.sliceDoc(from, to);
  } else {
    startText = state.sliceDoc(from, from + SearchMargin);
    endText = state.sliceDoc(to - SearchMargin, to);
  }
  let startSpace = /^\s*/.exec(startText)[0].length, endSpace = /\s*$/.exec(endText)[0].length;
  let endOff = endText.length - endSpace - close.length;
  if (startText.slice(startSpace, startSpace + open.length) == open && endText.slice(endOff, endOff + close.length) == close) {
    return {
      open: {
        pos: from + startSpace + open.length,
        margin: /\s/.test(startText.charAt(startSpace + open.length)) ? 1 : 0
      },
      close: {
        pos: to - endSpace - close.length,
        margin: /\s/.test(endText.charAt(endOff - 1)) ? 1 : 0
      }
    };
  }
  return null;
}
function selectedLineRanges(state) {
  let ranges = [];
  for (let r of state.selection.ranges) {
    let fromLine = state.doc.lineAt(r.from);
    let toLine = r.to <= fromLine.to ? fromLine : state.doc.lineAt(r.to);
    let last = ranges.length - 1;
    if (last >= 0 && ranges[last].to > fromLine.from)
      ranges[last].to = toLine.to;
    else
      ranges.push({ from: fromLine.from + /^\s*/.exec(fromLine.text)[0].length, to: toLine.to });
  }
  return ranges;
}
function changeBlockComment(option, state, ranges = state.selection.ranges) {
  let tokens = ranges.map((r) => getConfig(state, r.from).block);
  if (!tokens.every((c) => c))
    return null;
  let comments = ranges.map((r, i) => findBlockComment(state, tokens[i], r.from, r.to));
  if (option != 2 && !comments.every((c) => c)) {
    return { changes: state.changes(ranges.map((range, i) => {
      if (comments[i])
        return [];
      return [{ from: range.from, insert: tokens[i].open + " " }, { from: range.to, insert: " " + tokens[i].close }];
    })) };
  } else if (option != 1 && comments.some((c) => c)) {
    let changes = [];
    for (let i = 0, comment2; i < comments.length; i++)
      if (comment2 = comments[i]) {
        let token = tokens[i], { open, close } = comment2;
        changes.push({ from: open.pos - token.open.length, to: open.pos + open.margin }, { from: close.pos - close.margin, to: close.pos + token.close.length });
      }
    return { changes };
  }
  return null;
}
function changeLineComment(option, state, ranges = state.selection.ranges) {
  let lines = [];
  let prevLine = -1;
  for (let { from, to } of ranges) {
    let startI = lines.length, minIndent = 1e9;
    let token = getConfig(state, from).line;
    if (!token)
      continue;
    for (let pos = from; pos <= to; ) {
      let line = state.doc.lineAt(pos);
      if (line.from > prevLine && (from == to || to > line.from)) {
        prevLine = line.from;
        let indent = /^\s*/.exec(line.text)[0].length;
        let empty = indent == line.length;
        let comment2 = line.text.slice(indent, indent + token.length) == token ? indent : -1;
        if (indent < line.text.length && indent < minIndent)
          minIndent = indent;
        lines.push({ line, comment: comment2, token, indent, empty, single: false });
      }
      pos = line.to + 1;
    }
    if (minIndent < 1e9) {
      for (let i = startI; i < lines.length; i++)
        if (lines[i].indent < lines[i].line.text.length)
          lines[i].indent = minIndent;
    }
    if (lines.length == startI + 1)
      lines[startI].single = true;
  }
  if (option != 2 && lines.some((l) => l.comment < 0 && (!l.empty || l.single))) {
    let changes = [];
    for (let { line, token, indent, empty, single } of lines)
      if (single || !empty)
        changes.push({ from: line.from + indent, insert: token + " " });
    let changeSet = state.changes(changes);
    return { changes: changeSet, selection: state.selection.map(changeSet, 1) };
  } else if (option != 1 && lines.some((l) => l.comment >= 0)) {
    let changes = [];
    for (let { line, comment: comment2, token } of lines)
      if (comment2 >= 0) {
        let from = line.from + comment2, to = from + token.length;
        if (line.text[to - line.from] == " ")
          to++;
        changes.push({ from, to });
      }
    return { changes };
  }
  return null;
}
var fromHistory = /* @__PURE__ */ Annotation.define();
var isolateHistory = /* @__PURE__ */ Annotation.define();
var invertedEffects = /* @__PURE__ */ Facet.define();
var historyConfig = /* @__PURE__ */ Facet.define({
  combine(configs) {
    return combineConfig(configs, {
      minDepth: 100,
      newGroupDelay: 500,
      joinToEvent: (_t, isAdjacent2) => isAdjacent2
    }, {
      minDepth: Math.max,
      newGroupDelay: Math.min,
      joinToEvent: (a, b) => (tr, adj) => a(tr, adj) || b(tr, adj)
    });
  }
});
var historyField_ = /* @__PURE__ */ StateField.define({
  create() {
    return HistoryState.empty;
  },
  update(state, tr) {
    let config = tr.state.facet(historyConfig);
    let fromHist = tr.annotation(fromHistory);
    if (fromHist) {
      let item = HistEvent.fromTransaction(tr, fromHist.selection), from = fromHist.side;
      let other = from == 0 ? state.undone : state.done;
      if (item)
        other = updateBranch(other, other.length, config.minDepth, item);
      else
        other = addSelection(other, tr.startState.selection);
      return new HistoryState(from == 0 ? fromHist.rest : other, from == 0 ? other : fromHist.rest);
    }
    let isolate = tr.annotation(isolateHistory);
    if (isolate == "full" || isolate == "before")
      state = state.isolate();
    if (tr.annotation(Transaction.addToHistory) === false)
      return !tr.changes.empty ? state.addMapping(tr.changes.desc) : state;
    let event = HistEvent.fromTransaction(tr);
    let time = tr.annotation(Transaction.time), userEvent = tr.annotation(Transaction.userEvent);
    if (event)
      state = state.addChanges(event, time, userEvent, config, tr);
    else if (tr.selection)
      state = state.addSelection(tr.startState.selection, time, userEvent, config.newGroupDelay);
    if (isolate == "full" || isolate == "after")
      state = state.isolate();
    return state;
  },
  toJSON(value) {
    return { done: value.done.map((e) => e.toJSON()), undone: value.undone.map((e) => e.toJSON()) };
  },
  fromJSON(json) {
    return new HistoryState(json.done.map(HistEvent.fromJSON), json.undone.map(HistEvent.fromJSON));
  }
});
function history(config = {}) {
  return [
    historyField_,
    historyConfig.of(config),
    EditorView.domEventHandlers({
      beforeinput(e, view) {
        let command2 = e.inputType == "historyUndo" ? undo : e.inputType == "historyRedo" ? redo : null;
        if (!command2)
          return false;
        e.preventDefault();
        return command2(view);
      }
    })
  ];
}
function cmd(side, selection) {
  return function({ state, dispatch }) {
    if (!selection && state.readOnly)
      return false;
    let historyState = state.field(historyField_, false);
    if (!historyState)
      return false;
    let tr = historyState.pop(side, state, selection);
    if (!tr)
      return false;
    dispatch(tr);
    return true;
  };
}
var undo = /* @__PURE__ */ cmd(0, false);
var redo = /* @__PURE__ */ cmd(1, false);
var undoSelection = /* @__PURE__ */ cmd(0, true);
var redoSelection = /* @__PURE__ */ cmd(1, true);
var HistEvent = class {
  constructor(changes, effects, mapped, startSelection, selectionsAfter) {
    this.changes = changes;
    this.effects = effects;
    this.mapped = mapped;
    this.startSelection = startSelection;
    this.selectionsAfter = selectionsAfter;
  }
  setSelAfter(after) {
    return new HistEvent(this.changes, this.effects, this.mapped, this.startSelection, after);
  }
  toJSON() {
    var _a2, _b, _c;
    return {
      changes: (_a2 = this.changes) === null || _a2 === void 0 ? void 0 : _a2.toJSON(),
      mapped: (_b = this.mapped) === null || _b === void 0 ? void 0 : _b.toJSON(),
      startSelection: (_c = this.startSelection) === null || _c === void 0 ? void 0 : _c.toJSON(),
      selectionsAfter: this.selectionsAfter.map((s) => s.toJSON())
    };
  }
  static fromJSON(json) {
    return new HistEvent(json.changes && ChangeSet.fromJSON(json.changes), [], json.mapped && ChangeDesc.fromJSON(json.mapped), json.startSelection && EditorSelection.fromJSON(json.startSelection), json.selectionsAfter.map(EditorSelection.fromJSON));
  }
  static fromTransaction(tr, selection) {
    let effects = none2;
    for (let invert of tr.startState.facet(invertedEffects)) {
      let result = invert(tr);
      if (result.length)
        effects = effects.concat(result);
    }
    if (!effects.length && tr.changes.empty)
      return null;
    return new HistEvent(tr.changes.invert(tr.startState.doc), effects, void 0, selection || tr.startState.selection, none2);
  }
  static selection(selections) {
    return new HistEvent(void 0, none2, void 0, void 0, selections);
  }
};
function updateBranch(branch, to, maxLen, newEvent) {
  let start = to + 1 > maxLen + 20 ? to - maxLen - 1 : 0;
  let newBranch = branch.slice(start, to);
  newBranch.push(newEvent);
  return newBranch;
}
function isAdjacent(a, b) {
  let ranges = [], isAdjacent2 = false;
  a.iterChangedRanges((f, t2) => ranges.push(f, t2));
  b.iterChangedRanges((_f, _t, f, t2) => {
    for (let i = 0; i < ranges.length; ) {
      let from = ranges[i++], to = ranges[i++];
      if (t2 >= from && f <= to)
        isAdjacent2 = true;
    }
  });
  return isAdjacent2;
}
function eqSelectionShape(a, b) {
  return a.ranges.length == b.ranges.length && a.ranges.filter((r, i) => r.empty != b.ranges[i].empty).length === 0;
}
function conc(a, b) {
  return !a.length ? b : !b.length ? a : a.concat(b);
}
var none2 = [];
var MaxSelectionsPerEvent = 200;
function addSelection(branch, selection) {
  if (!branch.length) {
    return [HistEvent.selection([selection])];
  } else {
    let lastEvent = branch[branch.length - 1];
    let sels = lastEvent.selectionsAfter.slice(Math.max(0, lastEvent.selectionsAfter.length - MaxSelectionsPerEvent));
    if (sels.length && sels[sels.length - 1].eq(selection))
      return branch;
    sels.push(selection);
    return updateBranch(branch, branch.length - 1, 1e9, lastEvent.setSelAfter(sels));
  }
}
function popSelection(branch) {
  let last = branch[branch.length - 1];
  let newBranch = branch.slice();
  newBranch[branch.length - 1] = last.setSelAfter(last.selectionsAfter.slice(0, last.selectionsAfter.length - 1));
  return newBranch;
}
function addMappingToBranch(branch, mapping) {
  if (!branch.length)
    return branch;
  let length = branch.length, selections = none2;
  while (length) {
    let event = mapEvent(branch[length - 1], mapping, selections);
    if (event.changes && !event.changes.empty || event.effects.length) {
      let result = branch.slice(0, length);
      result[length - 1] = event;
      return result;
    } else {
      mapping = event.mapped;
      length--;
      selections = event.selectionsAfter;
    }
  }
  return selections.length ? [HistEvent.selection(selections)] : none2;
}
function mapEvent(event, mapping, extraSelections) {
  let selections = conc(event.selectionsAfter.length ? event.selectionsAfter.map((s) => s.map(mapping)) : none2, extraSelections);
  if (!event.changes)
    return HistEvent.selection(selections);
  let mappedChanges = event.changes.map(mapping), before = mapping.mapDesc(event.changes, true);
  let fullMapping = event.mapped ? event.mapped.composeDesc(before) : before;
  return new HistEvent(mappedChanges, StateEffect.mapEffects(event.effects, mapping), fullMapping, event.startSelection.map(before), selections);
}
var joinableUserEvent = /^(input\.type|delete)($|\.)/;
var HistoryState = class {
  constructor(done, undone, prevTime = 0, prevUserEvent = void 0) {
    this.done = done;
    this.undone = undone;
    this.prevTime = prevTime;
    this.prevUserEvent = prevUserEvent;
  }
  isolate() {
    return this.prevTime ? new HistoryState(this.done, this.undone) : this;
  }
  addChanges(event, time, userEvent, config, tr) {
    let done = this.done, lastEvent = done[done.length - 1];
    if (lastEvent && lastEvent.changes && !lastEvent.changes.empty && event.changes && (!userEvent || joinableUserEvent.test(userEvent)) && (!lastEvent.selectionsAfter.length && time - this.prevTime < config.newGroupDelay && config.joinToEvent(tr, isAdjacent(lastEvent.changes, event.changes)) || userEvent == "input.type.compose")) {
      done = updateBranch(done, done.length - 1, config.minDepth, new HistEvent(event.changes.compose(lastEvent.changes), conc(event.effects, lastEvent.effects), lastEvent.mapped, lastEvent.startSelection, none2));
    } else {
      done = updateBranch(done, done.length, config.minDepth, event);
    }
    return new HistoryState(done, none2, time, userEvent);
  }
  addSelection(selection, time, userEvent, newGroupDelay) {
    let last = this.done.length ? this.done[this.done.length - 1].selectionsAfter : none2;
    if (last.length > 0 && time - this.prevTime < newGroupDelay && userEvent == this.prevUserEvent && userEvent && /^select($|\.)/.test(userEvent) && eqSelectionShape(last[last.length - 1], selection))
      return this;
    return new HistoryState(addSelection(this.done, selection), this.undone, time, userEvent);
  }
  addMapping(mapping) {
    return new HistoryState(addMappingToBranch(this.done, mapping), addMappingToBranch(this.undone, mapping), this.prevTime, this.prevUserEvent);
  }
  pop(side, state, onlySelection) {
    let branch = side == 0 ? this.done : this.undone;
    if (branch.length == 0)
      return null;
    let event = branch[branch.length - 1], selection = event.selectionsAfter[0] || state.selection;
    if (onlySelection && event.selectionsAfter.length) {
      return state.update({
        selection: event.selectionsAfter[event.selectionsAfter.length - 1],
        annotations: fromHistory.of({ side, rest: popSelection(branch), selection }),
        userEvent: side == 0 ? "select.undo" : "select.redo",
        scrollIntoView: true
      });
    } else if (!event.changes) {
      return null;
    } else {
      let rest = branch.length == 1 ? none2 : branch.slice(0, branch.length - 1);
      if (event.mapped)
        rest = addMappingToBranch(rest, event.mapped);
      return state.update({
        changes: event.changes,
        selection: event.startSelection,
        effects: event.effects,
        annotations: fromHistory.of({ side, rest, selection }),
        filter: false,
        userEvent: side == 0 ? "undo" : "redo",
        scrollIntoView: true
      });
    }
  }
};
HistoryState.empty = /* @__PURE__ */ new HistoryState(none2, none2);
var historyKeymap = [
  { key: "Mod-z", run: undo, preventDefault: true },
  { key: "Mod-y", mac: "Mod-Shift-z", run: redo, preventDefault: true },
  { linux: "Ctrl-Shift-z", run: redo, preventDefault: true },
  { key: "Mod-u", run: undoSelection, preventDefault: true },
  { key: "Alt-u", mac: "Mod-Shift-u", run: redoSelection, preventDefault: true }
];
function updateSel(sel, by) {
  return EditorSelection.create(sel.ranges.map(by), sel.mainIndex);
}
function setSel(state, selection) {
  return state.update({ selection, scrollIntoView: true, userEvent: "select" });
}
function moveSel({ state, dispatch }, how) {
  let selection = updateSel(state.selection, how);
  if (selection.eq(state.selection, true))
    return false;
  dispatch(setSel(state, selection));
  return true;
}
function rangeEnd(range, forward) {
  return EditorSelection.cursor(forward ? range.to : range.from);
}
function cursorByChar(view, forward) {
  return moveSel(view, (range) => range.empty ? view.moveByChar(range, forward) : rangeEnd(range, forward));
}
function ltrAtCursor(view) {
  return view.textDirectionAt(view.state.selection.main.head) == Direction.LTR;
}
var cursorCharLeft = (view) => cursorByChar(view, !ltrAtCursor(view));
var cursorCharRight = (view) => cursorByChar(view, ltrAtCursor(view));
function cursorByGroup(view, forward) {
  return moveSel(view, (range) => range.empty ? view.moveByGroup(range, forward) : rangeEnd(range, forward));
}
var cursorGroupLeft = (view) => cursorByGroup(view, !ltrAtCursor(view));
var cursorGroupRight = (view) => cursorByGroup(view, ltrAtCursor(view));
var segmenter = typeof Intl != "undefined" && Intl.Segmenter ? /* @__PURE__ */ new Intl.Segmenter(void 0, { granularity: "word" }) : null;
function interestingNode(state, node, bracketProp) {
  if (node.type.prop(bracketProp))
    return true;
  let len = node.to - node.from;
  return len && (len > 2 || /[^\s,.;:]/.test(state.sliceDoc(node.from, node.to))) || node.firstChild;
}
function moveBySyntax(state, start, forward) {
  let pos = syntaxTree(state).resolveInner(start.head);
  let bracketProp = forward ? NodeProp.closedBy : NodeProp.openedBy;
  for (let at = start.head; ; ) {
    let next = forward ? pos.childAfter(at) : pos.childBefore(at);
    if (!next)
      break;
    if (interestingNode(state, next, bracketProp))
      pos = next;
    else
      at = forward ? next.to : next.from;
  }
  let bracket2 = pos.type.prop(bracketProp), match, newPos;
  if (bracket2 && (match = forward ? matchBrackets(state, pos.from, 1) : matchBrackets(state, pos.to, -1)) && match.matched)
    newPos = forward ? match.end.to : match.end.from;
  else
    newPos = forward ? pos.to : pos.from;
  return EditorSelection.cursor(newPos, forward ? -1 : 1);
}
var cursorSyntaxLeft = (view) => moveSel(view, (range) => moveBySyntax(view.state, range, !ltrAtCursor(view)));
var cursorSyntaxRight = (view) => moveSel(view, (range) => moveBySyntax(view.state, range, ltrAtCursor(view)));
function cursorByLine(view, forward) {
  return moveSel(view, (range) => {
    if (!range.empty)
      return rangeEnd(range, forward);
    let moved = view.moveVertically(range, forward);
    return moved.head != range.head ? moved : view.moveToLineBoundary(range, forward);
  });
}
var cursorLineUp = (view) => cursorByLine(view, false);
var cursorLineDown = (view) => cursorByLine(view, true);
function pageInfo(view) {
  let selfScroll = view.scrollDOM.clientHeight < view.scrollDOM.scrollHeight - 2;
  let marginTop = 0, marginBottom = 0, height;
  if (selfScroll) {
    for (let source of view.state.facet(EditorView.scrollMargins)) {
      let margins = source(view);
      if (margins === null || margins === void 0 ? void 0 : margins.top)
        marginTop = Math.max(margins === null || margins === void 0 ? void 0 : margins.top, marginTop);
      if (margins === null || margins === void 0 ? void 0 : margins.bottom)
        marginBottom = Math.max(margins === null || margins === void 0 ? void 0 : margins.bottom, marginBottom);
    }
    height = view.scrollDOM.clientHeight - marginTop - marginBottom;
  } else {
    height = (view.dom.ownerDocument.defaultView || window).innerHeight;
  }
  return {
    marginTop,
    marginBottom,
    selfScroll,
    height: Math.max(view.defaultLineHeight, height - 5)
  };
}
function cursorByPage(view, forward) {
  let page = pageInfo(view);
  let { state } = view, selection = updateSel(state.selection, (range) => {
    return range.empty ? view.moveVertically(range, forward, page.height) : rangeEnd(range, forward);
  });
  if (selection.eq(state.selection))
    return false;
  let effect;
  if (page.selfScroll) {
    let startPos = view.coordsAtPos(state.selection.main.head);
    let scrollRect = view.scrollDOM.getBoundingClientRect();
    let scrollTop = scrollRect.top + page.marginTop, scrollBottom = scrollRect.bottom - page.marginBottom;
    if (startPos && startPos.top > scrollTop && startPos.bottom < scrollBottom)
      effect = EditorView.scrollIntoView(selection.main.head, { y: "start", yMargin: startPos.top - scrollTop });
  }
  view.dispatch(setSel(state, selection), { effects: effect });
  return true;
}
var cursorPageUp = (view) => cursorByPage(view, false);
var cursorPageDown = (view) => cursorByPage(view, true);
function moveByLineBoundary(view, start, forward) {
  let line = view.lineBlockAt(start.head), moved = view.moveToLineBoundary(start, forward);
  if (moved.head == start.head && moved.head != (forward ? line.to : line.from))
    moved = view.moveToLineBoundary(start, forward, false);
  if (!forward && moved.head == line.from && line.length) {
    let space4 = /^\s*/.exec(view.state.sliceDoc(line.from, Math.min(line.from + 100, line.to)))[0].length;
    if (space4 && start.head != line.from + space4)
      moved = EditorSelection.cursor(line.from + space4);
  }
  return moved;
}
var cursorLineBoundaryForward = (view) => moveSel(view, (range) => moveByLineBoundary(view, range, true));
var cursorLineBoundaryBackward = (view) => moveSel(view, (range) => moveByLineBoundary(view, range, false));
var cursorLineBoundaryLeft = (view) => moveSel(view, (range) => moveByLineBoundary(view, range, !ltrAtCursor(view)));
var cursorLineBoundaryRight = (view) => moveSel(view, (range) => moveByLineBoundary(view, range, ltrAtCursor(view)));
var cursorLineStart = (view) => moveSel(view, (range) => EditorSelection.cursor(view.lineBlockAt(range.head).from, 1));
var cursorLineEnd = (view) => moveSel(view, (range) => EditorSelection.cursor(view.lineBlockAt(range.head).to, -1));
function toMatchingBracket(state, dispatch, extend2) {
  let found = false, selection = updateSel(state.selection, (range) => {
    let matching = matchBrackets(state, range.head, -1) || matchBrackets(state, range.head, 1) || range.head > 0 && matchBrackets(state, range.head - 1, 1) || range.head < state.doc.length && matchBrackets(state, range.head + 1, -1);
    if (!matching || !matching.end)
      return range;
    found = true;
    let head = matching.start.from == range.head ? matching.end.to : matching.end.from;
    return extend2 ? EditorSelection.range(range.anchor, head) : EditorSelection.cursor(head);
  });
  if (!found)
    return false;
  dispatch(setSel(state, selection));
  return true;
}
var cursorMatchingBracket = ({ state, dispatch }) => toMatchingBracket(state, dispatch, false);
function extendSel(view, how) {
  let selection = updateSel(view.state.selection, (range) => {
    let head = how(range);
    return EditorSelection.range(range.anchor, head.head, head.goalColumn, head.bidiLevel || void 0);
  });
  if (selection.eq(view.state.selection))
    return false;
  view.dispatch(setSel(view.state, selection));
  return true;
}
function selectByChar(view, forward) {
  return extendSel(view, (range) => view.moveByChar(range, forward));
}
var selectCharLeft = (view) => selectByChar(view, !ltrAtCursor(view));
var selectCharRight = (view) => selectByChar(view, ltrAtCursor(view));
function selectByGroup(view, forward) {
  return extendSel(view, (range) => view.moveByGroup(range, forward));
}
var selectGroupLeft = (view) => selectByGroup(view, !ltrAtCursor(view));
var selectGroupRight = (view) => selectByGroup(view, ltrAtCursor(view));
var selectSyntaxLeft = (view) => extendSel(view, (range) => moveBySyntax(view.state, range, !ltrAtCursor(view)));
var selectSyntaxRight = (view) => extendSel(view, (range) => moveBySyntax(view.state, range, ltrAtCursor(view)));
function selectByLine(view, forward) {
  return extendSel(view, (range) => view.moveVertically(range, forward));
}
var selectLineUp = (view) => selectByLine(view, false);
var selectLineDown = (view) => selectByLine(view, true);
function selectByPage(view, forward) {
  return extendSel(view, (range) => view.moveVertically(range, forward, pageInfo(view).height));
}
var selectPageUp = (view) => selectByPage(view, false);
var selectPageDown = (view) => selectByPage(view, true);
var selectLineBoundaryForward = (view) => extendSel(view, (range) => moveByLineBoundary(view, range, true));
var selectLineBoundaryBackward = (view) => extendSel(view, (range) => moveByLineBoundary(view, range, false));
var selectLineBoundaryLeft = (view) => extendSel(view, (range) => moveByLineBoundary(view, range, !ltrAtCursor(view)));
var selectLineBoundaryRight = (view) => extendSel(view, (range) => moveByLineBoundary(view, range, ltrAtCursor(view)));
var selectLineStart = (view) => extendSel(view, (range) => EditorSelection.cursor(view.lineBlockAt(range.head).from));
var selectLineEnd = (view) => extendSel(view, (range) => EditorSelection.cursor(view.lineBlockAt(range.head).to));
var cursorDocStart = ({ state, dispatch }) => {
  dispatch(setSel(state, { anchor: 0 }));
  return true;
};
var cursorDocEnd = ({ state, dispatch }) => {
  dispatch(setSel(state, { anchor: state.doc.length }));
  return true;
};
var selectDocStart = ({ state, dispatch }) => {
  dispatch(setSel(state, { anchor: state.selection.main.anchor, head: 0 }));
  return true;
};
var selectDocEnd = ({ state, dispatch }) => {
  dispatch(setSel(state, { anchor: state.selection.main.anchor, head: state.doc.length }));
  return true;
};
var selectAll = ({ state, dispatch }) => {
  dispatch(state.update({ selection: { anchor: 0, head: state.doc.length }, userEvent: "select" }));
  return true;
};
var selectLine = ({ state, dispatch }) => {
  let ranges = selectedLineBlocks(state).map(({ from, to }) => EditorSelection.range(from, Math.min(to + 1, state.doc.length)));
  dispatch(state.update({ selection: EditorSelection.create(ranges), userEvent: "select" }));
  return true;
};
var selectParentSyntax = ({ state, dispatch }) => {
  let selection = updateSel(state.selection, (range) => {
    var _a2;
    let stack = syntaxTree(state).resolveStack(range.from, 1);
    for (let cur = stack; cur; cur = cur.next) {
      let { node } = cur;
      if ((node.from < range.from && node.to >= range.to || node.to > range.to && node.from <= range.from) && ((_a2 = node.parent) === null || _a2 === void 0 ? void 0 : _a2.parent))
        return EditorSelection.range(node.to, node.from);
    }
    return range;
  });
  dispatch(setSel(state, selection));
  return true;
};
var simplifySelection = ({ state, dispatch }) => {
  let cur = state.selection, selection = null;
  if (cur.ranges.length > 1)
    selection = EditorSelection.create([cur.main]);
  else if (!cur.main.empty)
    selection = EditorSelection.create([EditorSelection.cursor(cur.main.head)]);
  if (!selection)
    return false;
  dispatch(setSel(state, selection));
  return true;
};
function deleteBy(target, by) {
  if (target.state.readOnly)
    return false;
  let event = "delete.selection", { state } = target;
  let changes = state.changeByRange((range) => {
    let { from, to } = range;
    if (from == to) {
      let towards = by(range);
      if (towards < from) {
        event = "delete.backward";
        towards = skipAtomic(target, towards, false);
      } else if (towards > from) {
        event = "delete.forward";
        towards = skipAtomic(target, towards, true);
      }
      from = Math.min(from, towards);
      to = Math.max(to, towards);
    } else {
      from = skipAtomic(target, from, false);
      to = skipAtomic(target, to, true);
    }
    return from == to ? { range } : { changes: { from, to }, range: EditorSelection.cursor(from, from < range.head ? -1 : 1) };
  });
  if (changes.changes.empty)
    return false;
  target.dispatch(state.update(changes, {
    scrollIntoView: true,
    userEvent: event,
    effects: event == "delete.selection" ? EditorView.announce.of(state.phrase("Selection deleted")) : void 0
  }));
  return true;
}
function skipAtomic(target, pos, forward) {
  if (target instanceof EditorView)
    for (let ranges of target.state.facet(EditorView.atomicRanges).map((f) => f(target)))
      ranges.between(pos, pos, (from, to) => {
        if (from < pos && to > pos)
          pos = forward ? to : from;
      });
  return pos;
}
var deleteByChar = (target, forward) => deleteBy(target, (range) => {
  let pos = range.from, { state } = target, line = state.doc.lineAt(pos), before, targetPos;
  if (!forward && pos > line.from && pos < line.from + 200 && !/[^ \t]/.test(before = line.text.slice(0, pos - line.from))) {
    if (before[before.length - 1] == "	")
      return pos - 1;
    let col = countColumn(before, state.tabSize), drop = col % getIndentUnit(state) || getIndentUnit(state);
    for (let i = 0; i < drop && before[before.length - 1 - i] == " "; i++)
      pos--;
    targetPos = pos;
  } else {
    targetPos = findClusterBreak(line.text, pos - line.from, forward, forward) + line.from;
    if (targetPos == pos && line.number != (forward ? state.doc.lines : 1))
      targetPos += forward ? 1 : -1;
    else if (!forward && /[\ufe00-\ufe0f]/.test(line.text.slice(targetPos - line.from, pos - line.from)))
      targetPos = findClusterBreak(line.text, targetPos - line.from, false, false) + line.from;
  }
  return targetPos;
});
var deleteCharBackward = (view) => deleteByChar(view, false);
var deleteCharForward = (view) => deleteByChar(view, true);
var deleteByGroup = (target, forward) => deleteBy(target, (range) => {
  let pos = range.head, { state } = target, line = state.doc.lineAt(pos);
  let categorize = state.charCategorizer(pos);
  for (let cat = null; ; ) {
    if (pos == (forward ? line.to : line.from)) {
      if (pos == range.head && line.number != (forward ? state.doc.lines : 1))
        pos += forward ? 1 : -1;
      break;
    }
    let next = findClusterBreak(line.text, pos - line.from, forward) + line.from;
    let nextChar = line.text.slice(Math.min(pos, next) - line.from, Math.max(pos, next) - line.from);
    let nextCat = categorize(nextChar);
    if (cat != null && nextCat != cat)
      break;
    if (nextChar != " " || pos != range.head)
      cat = nextCat;
    pos = next;
  }
  return pos;
});
var deleteGroupBackward = (target) => deleteByGroup(target, false);
var deleteGroupForward = (target) => deleteByGroup(target, true);
var deleteToLineEnd = (view) => deleteBy(view, (range) => {
  let lineEnd2 = view.lineBlockAt(range.head).to;
  return range.head < lineEnd2 ? lineEnd2 : Math.min(view.state.doc.length, range.head + 1);
});
var deleteLineBoundaryBackward = (view) => deleteBy(view, (range) => {
  let lineStart = view.moveToLineBoundary(range, false).head;
  return range.head > lineStart ? lineStart : Math.max(0, range.head - 1);
});
var deleteLineBoundaryForward = (view) => deleteBy(view, (range) => {
  let lineStart = view.moveToLineBoundary(range, true).head;
  return range.head < lineStart ? lineStart : Math.min(view.state.doc.length, range.head + 1);
});
var splitLine = ({ state, dispatch }) => {
  if (state.readOnly)
    return false;
  let changes = state.changeByRange((range) => {
    return {
      changes: { from: range.from, to: range.to, insert: Text.of(["", ""]) },
      range: EditorSelection.cursor(range.from)
    };
  });
  dispatch(state.update(changes, { scrollIntoView: true, userEvent: "input" }));
  return true;
};
var transposeChars = ({ state, dispatch }) => {
  if (state.readOnly)
    return false;
  let changes = state.changeByRange((range) => {
    if (!range.empty || range.from == 0 || range.from == state.doc.length)
      return { range };
    let pos = range.from, line = state.doc.lineAt(pos);
    let from = pos == line.from ? pos - 1 : findClusterBreak(line.text, pos - line.from, false) + line.from;
    let to = pos == line.to ? pos + 1 : findClusterBreak(line.text, pos - line.from, true) + line.from;
    return {
      changes: { from, to, insert: state.doc.slice(pos, to).append(state.doc.slice(from, pos)) },
      range: EditorSelection.cursor(to)
    };
  });
  if (changes.changes.empty)
    return false;
  dispatch(state.update(changes, { scrollIntoView: true, userEvent: "move.character" }));
  return true;
};
function selectedLineBlocks(state) {
  let blocks = [], upto = -1;
  for (let range of state.selection.ranges) {
    let startLine = state.doc.lineAt(range.from), endLine = state.doc.lineAt(range.to);
    if (!range.empty && range.to == endLine.from)
      endLine = state.doc.lineAt(range.to - 1);
    if (upto >= startLine.number) {
      let prev = blocks[blocks.length - 1];
      prev.to = endLine.to;
      prev.ranges.push(range);
    } else {
      blocks.push({ from: startLine.from, to: endLine.to, ranges: [range] });
    }
    upto = endLine.number + 1;
  }
  return blocks;
}
function moveLine(state, dispatch, forward) {
  if (state.readOnly)
    return false;
  let changes = [], ranges = [];
  for (let block of selectedLineBlocks(state)) {
    if (forward ? block.to == state.doc.length : block.from == 0)
      continue;
    let nextLine = state.doc.lineAt(forward ? block.to + 1 : block.from - 1);
    let size = nextLine.length + 1;
    if (forward) {
      changes.push({ from: block.to, to: nextLine.to }, { from: block.from, insert: nextLine.text + state.lineBreak });
      for (let r of block.ranges)
        ranges.push(EditorSelection.range(Math.min(state.doc.length, r.anchor + size), Math.min(state.doc.length, r.head + size)));
    } else {
      changes.push({ from: nextLine.from, to: block.from }, { from: block.to, insert: state.lineBreak + nextLine.text });
      for (let r of block.ranges)
        ranges.push(EditorSelection.range(r.anchor - size, r.head - size));
    }
  }
  if (!changes.length)
    return false;
  dispatch(state.update({
    changes,
    scrollIntoView: true,
    selection: EditorSelection.create(ranges, state.selection.mainIndex),
    userEvent: "move.line"
  }));
  return true;
}
var moveLineUp = ({ state, dispatch }) => moveLine(state, dispatch, false);
var moveLineDown = ({ state, dispatch }) => moveLine(state, dispatch, true);
function copyLine(state, dispatch, forward) {
  if (state.readOnly)
    return false;
  let changes = [];
  for (let block of selectedLineBlocks(state)) {
    if (forward)
      changes.push({ from: block.from, insert: state.doc.slice(block.from, block.to) + state.lineBreak });
    else
      changes.push({ from: block.to, insert: state.lineBreak + state.doc.slice(block.from, block.to) });
  }
  dispatch(state.update({ changes, scrollIntoView: true, userEvent: "input.copyline" }));
  return true;
}
var copyLineUp = ({ state, dispatch }) => copyLine(state, dispatch, false);
var copyLineDown = ({ state, dispatch }) => copyLine(state, dispatch, true);
var deleteLine = (view) => {
  if (view.state.readOnly)
    return false;
  let { state } = view, changes = state.changes(selectedLineBlocks(state).map(({ from, to }) => {
    if (from > 0)
      from--;
    else if (to < state.doc.length)
      to++;
    return { from, to };
  }));
  let selection = updateSel(state.selection, (range) => view.moveVertically(range, true)).map(changes);
  view.dispatch({ changes, selection, scrollIntoView: true, userEvent: "delete.line" });
  return true;
};
function isBetweenBrackets(state, pos) {
  if (/\(\)|\[\]|\{\}/.test(state.sliceDoc(pos - 1, pos + 1)))
    return { from: pos, to: pos };
  let context = syntaxTree(state).resolveInner(pos);
  let before = context.childBefore(pos), after = context.childAfter(pos), closedBy;
  if (before && after && before.to <= pos && after.from >= pos && (closedBy = before.type.prop(NodeProp.closedBy)) && closedBy.indexOf(after.name) > -1 && state.doc.lineAt(before.to).from == state.doc.lineAt(after.from).from && !/\S/.test(state.sliceDoc(before.to, after.from)))
    return { from: before.to, to: after.from };
  return null;
}
var insertNewlineAndIndent = /* @__PURE__ */ newlineAndIndent(false);
var insertBlankLine = /* @__PURE__ */ newlineAndIndent(true);
function newlineAndIndent(atEof) {
  return ({ state, dispatch }) => {
    if (state.readOnly)
      return false;
    let changes = state.changeByRange((range) => {
      let { from, to } = range, line = state.doc.lineAt(from);
      let explode = !atEof && from == to && isBetweenBrackets(state, from);
      if (atEof)
        from = to = (to <= line.to ? line : state.doc.lineAt(to)).to;
      let cx = new IndentContext(state, { simulateBreak: from, simulateDoubleBreak: !!explode });
      let indent = getIndentation(cx, from);
      if (indent == null)
        indent = countColumn(/^\s*/.exec(state.doc.lineAt(from).text)[0], state.tabSize);
      while (to < line.to && /\s/.test(line.text[to - line.from]))
        to++;
      if (explode)
        ({ from, to } = explode);
      else if (from > line.from && from < line.from + 100 && !/\S/.test(line.text.slice(0, from)))
        from = line.from;
      let insert2 = ["", indentString(state, indent)];
      if (explode)
        insert2.push(indentString(state, cx.lineIndent(line.from, -1)));
      return {
        changes: { from, to, insert: Text.of(insert2) },
        range: EditorSelection.cursor(from + 1 + insert2[1].length)
      };
    });
    dispatch(state.update(changes, { scrollIntoView: true, userEvent: "input" }));
    return true;
  };
}
function changeBySelectedLine(state, f) {
  let atLine = -1;
  return state.changeByRange((range) => {
    let changes = [];
    for (let pos = range.from; pos <= range.to; ) {
      let line = state.doc.lineAt(pos);
      if (line.number > atLine && (range.empty || range.to > line.from)) {
        f(line, changes, range);
        atLine = line.number;
      }
      pos = line.to + 1;
    }
    let changeSet = state.changes(changes);
    return {
      changes,
      range: EditorSelection.range(changeSet.mapPos(range.anchor, 1), changeSet.mapPos(range.head, 1))
    };
  });
}
var indentSelection = ({ state, dispatch }) => {
  if (state.readOnly)
    return false;
  let updated = Object.create(null);
  let context = new IndentContext(state, { overrideIndentation: (start) => {
    let found = updated[start];
    return found == null ? -1 : found;
  } });
  let changes = changeBySelectedLine(state, (line, changes2, range) => {
    let indent = getIndentation(context, line.from);
    if (indent == null)
      return;
    if (!/\S/.test(line.text))
      indent = 0;
    let cur = /^\s*/.exec(line.text)[0];
    let norm = indentString(state, indent);
    if (cur != norm || range.from < line.from + cur.length) {
      updated[line.from] = indent;
      changes2.push({ from: line.from, to: line.from + cur.length, insert: norm });
    }
  });
  if (!changes.changes.empty)
    dispatch(state.update(changes, { userEvent: "indent" }));
  return true;
};
var indentMore = ({ state, dispatch }) => {
  if (state.readOnly)
    return false;
  dispatch(state.update(changeBySelectedLine(state, (line, changes) => {
    changes.push({ from: line.from, insert: state.facet(indentUnit) });
  }), { userEvent: "input.indent" }));
  return true;
};
var indentLess = ({ state, dispatch }) => {
  if (state.readOnly)
    return false;
  dispatch(state.update(changeBySelectedLine(state, (line, changes) => {
    let space4 = /^\s*/.exec(line.text)[0];
    if (!space4)
      return;
    let col = countColumn(space4, state.tabSize), keep = 0;
    let insert2 = indentString(state, Math.max(0, col - getIndentUnit(state)));
    while (keep < space4.length && keep < insert2.length && space4.charCodeAt(keep) == insert2.charCodeAt(keep))
      keep++;
    changes.push({ from: line.from + keep, to: line.from + space4.length, insert: insert2.slice(keep) });
  }), { userEvent: "delete.dedent" }));
  return true;
};
var emacsStyleKeymap = [
  { key: "Ctrl-b", run: cursorCharLeft, shift: selectCharLeft, preventDefault: true },
  { key: "Ctrl-f", run: cursorCharRight, shift: selectCharRight },
  { key: "Ctrl-p", run: cursorLineUp, shift: selectLineUp },
  { key: "Ctrl-n", run: cursorLineDown, shift: selectLineDown },
  { key: "Ctrl-a", run: cursorLineStart, shift: selectLineStart },
  { key: "Ctrl-e", run: cursorLineEnd, shift: selectLineEnd },
  { key: "Ctrl-d", run: deleteCharForward },
  { key: "Ctrl-h", run: deleteCharBackward },
  { key: "Ctrl-k", run: deleteToLineEnd },
  { key: "Ctrl-Alt-h", run: deleteGroupBackward },
  { key: "Ctrl-o", run: splitLine },
  { key: "Ctrl-t", run: transposeChars },
  { key: "Ctrl-v", run: cursorPageDown }
];
var standardKeymap = /* @__PURE__ */ [
  { key: "ArrowLeft", run: cursorCharLeft, shift: selectCharLeft, preventDefault: true },
  { key: "Mod-ArrowLeft", mac: "Alt-ArrowLeft", run: cursorGroupLeft, shift: selectGroupLeft, preventDefault: true },
  { mac: "Cmd-ArrowLeft", run: cursorLineBoundaryLeft, shift: selectLineBoundaryLeft, preventDefault: true },
  { key: "ArrowRight", run: cursorCharRight, shift: selectCharRight, preventDefault: true },
  { key: "Mod-ArrowRight", mac: "Alt-ArrowRight", run: cursorGroupRight, shift: selectGroupRight, preventDefault: true },
  { mac: "Cmd-ArrowRight", run: cursorLineBoundaryRight, shift: selectLineBoundaryRight, preventDefault: true },
  { key: "ArrowUp", run: cursorLineUp, shift: selectLineUp, preventDefault: true },
  { mac: "Cmd-ArrowUp", run: cursorDocStart, shift: selectDocStart },
  { mac: "Ctrl-ArrowUp", run: cursorPageUp, shift: selectPageUp },
  { key: "ArrowDown", run: cursorLineDown, shift: selectLineDown, preventDefault: true },
  { mac: "Cmd-ArrowDown", run: cursorDocEnd, shift: selectDocEnd },
  { mac: "Ctrl-ArrowDown", run: cursorPageDown, shift: selectPageDown },
  { key: "PageUp", run: cursorPageUp, shift: selectPageUp },
  { key: "PageDown", run: cursorPageDown, shift: selectPageDown },
  { key: "Home", run: cursorLineBoundaryBackward, shift: selectLineBoundaryBackward, preventDefault: true },
  { key: "Mod-Home", run: cursorDocStart, shift: selectDocStart },
  { key: "End", run: cursorLineBoundaryForward, shift: selectLineBoundaryForward, preventDefault: true },
  { key: "Mod-End", run: cursorDocEnd, shift: selectDocEnd },
  { key: "Enter", run: insertNewlineAndIndent },
  { key: "Mod-a", run: selectAll },
  { key: "Backspace", run: deleteCharBackward, shift: deleteCharBackward },
  { key: "Delete", run: deleteCharForward },
  { key: "Mod-Backspace", mac: "Alt-Backspace", run: deleteGroupBackward },
  { key: "Mod-Delete", mac: "Alt-Delete", run: deleteGroupForward },
  { mac: "Mod-Backspace", run: deleteLineBoundaryBackward },
  { mac: "Mod-Delete", run: deleteLineBoundaryForward }
].concat(/* @__PURE__ */ emacsStyleKeymap.map((b) => ({ mac: b.key, run: b.run, shift: b.shift })));
var defaultKeymap = /* @__PURE__ */ [
  { key: "Alt-ArrowLeft", mac: "Ctrl-ArrowLeft", run: cursorSyntaxLeft, shift: selectSyntaxLeft },
  { key: "Alt-ArrowRight", mac: "Ctrl-ArrowRight", run: cursorSyntaxRight, shift: selectSyntaxRight },
  { key: "Alt-ArrowUp", run: moveLineUp },
  { key: "Shift-Alt-ArrowUp", run: copyLineUp },
  { key: "Alt-ArrowDown", run: moveLineDown },
  { key: "Shift-Alt-ArrowDown", run: copyLineDown },
  { key: "Escape", run: simplifySelection },
  { key: "Mod-Enter", run: insertBlankLine },
  { key: "Alt-l", mac: "Ctrl-l", run: selectLine },
  { key: "Mod-i", run: selectParentSyntax, preventDefault: true },
  { key: "Mod-[", run: indentLess },
  { key: "Mod-]", run: indentMore },
  { key: "Mod-Alt-\\", run: indentSelection },
  { key: "Shift-Mod-k", run: deleteLine },
  { key: "Shift-Mod-\\", run: cursorMatchingBracket },
  { key: "Mod-/", run: toggleComment },
  { key: "Alt-A", run: toggleBlockComment }
].concat(standardKeymap);

// node_modules/@codemirror/autocomplete/dist/index.js
var CompletionContext = class {
  constructor(state, pos, explicit) {
    this.state = state;
    this.pos = pos;
    this.explicit = explicit;
    this.abortListeners = [];
  }
  tokenBefore(types2) {
    let token = syntaxTree(this.state).resolveInner(this.pos, -1);
    while (token && types2.indexOf(token.name) < 0)
      token = token.parent;
    return token ? {
      from: token.from,
      to: this.pos,
      text: this.state.sliceDoc(token.from, this.pos),
      type: token.type
    } : null;
  }
  matchBefore(expr) {
    let line = this.state.doc.lineAt(this.pos);
    let start = Math.max(line.from, this.pos - 250);
    let str = line.text.slice(start - line.from, this.pos - line.from);
    let found = str.search(ensureAnchor(expr, false));
    return found < 0 ? null : { from: start + found, to: this.pos, text: str.slice(found) };
  }
  get aborted() {
    return this.abortListeners == null;
  }
  addEventListener(type, listener) {
    if (type == "abort" && this.abortListeners)
      this.abortListeners.push(listener);
  }
};
function toSet(chars) {
  let flat = Object.keys(chars).join("");
  let words = /\w/.test(flat);
  if (words)
    flat = flat.replace(/\w/g, "");
  return `[${words ? "\\w" : ""}${flat.replace(/[^\w\s]/g, "\\$&")}]`;
}
function prefixMatch(options) {
  let first = Object.create(null), rest = Object.create(null);
  for (let { label } of options) {
    first[label[0]] = true;
    for (let i = 1; i < label.length; i++)
      rest[label[i]] = true;
  }
  let source = toSet(first) + toSet(rest) + "*$";
  return [new RegExp("^" + source), new RegExp(source)];
}
function completeFromList(list) {
  let options = list.map((o) => typeof o == "string" ? { label: o } : o);
  let [validFor, match] = options.every((o) => /^\w+$/.test(o.label)) ? [/\w*$/, /\w+$/] : prefixMatch(options);
  return (context) => {
    let token = context.matchBefore(match);
    return token || context.explicit ? { from: token ? token.from : context.pos, options, validFor } : null;
  };
}
function ifNotIn(nodes, source) {
  return (context) => {
    for (let pos = syntaxTree(context.state).resolveInner(context.pos, -1); pos; pos = pos.parent) {
      if (nodes.indexOf(pos.name) > -1)
        return null;
      if (pos.type.isTop)
        break;
    }
    return source(context);
  };
}
function ensureAnchor(expr, start) {
  var _a2;
  let { source } = expr;
  let addStart = start && source[0] != "^", addEnd = source[source.length - 1] != "$";
  if (!addStart && !addEnd)
    return expr;
  return new RegExp(`${addStart ? "^" : ""}(?:${source})${addEnd ? "$" : ""}`, (_a2 = expr.flags) !== null && _a2 !== void 0 ? _a2 : expr.ignoreCase ? "i" : "");
}
var pickedCompletion = /* @__PURE__ */ Annotation.define();
var windows = typeof navigator == "object" && /* @__PURE__ */ /Win/.test(navigator.platform);
var baseTheme2 = /* @__PURE__ */ EditorView.baseTheme({
  ".cm-tooltip.cm-tooltip-autocomplete": {
    "& > ul": {
      fontFamily: "monospace",
      whiteSpace: "nowrap",
      overflow: "hidden auto",
      maxWidth_fallback: "700px",
      maxWidth: "min(700px, 95vw)",
      minWidth: "250px",
      maxHeight: "10em",
      height: "100%",
      listStyle: "none",
      margin: 0,
      padding: 0,
      "& > li, & > completion-section": {
        padding: "1px 3px",
        lineHeight: 1.2
      },
      "& > li": {
        overflowX: "hidden",
        textOverflow: "ellipsis",
        cursor: "pointer"
      },
      "& > completion-section": {
        display: "list-item",
        borderBottom: "1px solid silver",
        paddingLeft: "0.5em",
        opacity: 0.7
      }
    }
  },
  "&light .cm-tooltip-autocomplete ul li[aria-selected]": {
    background: "#17c",
    color: "white"
  },
  "&light .cm-tooltip-autocomplete-disabled ul li[aria-selected]": {
    background: "#777"
  },
  "&dark .cm-tooltip-autocomplete ul li[aria-selected]": {
    background: "#347",
    color: "white"
  },
  "&dark .cm-tooltip-autocomplete-disabled ul li[aria-selected]": {
    background: "#444"
  },
  ".cm-completionListIncompleteTop:before, .cm-completionListIncompleteBottom:after": {
    content: '"\xB7\xB7\xB7"',
    opacity: 0.5,
    display: "block",
    textAlign: "center"
  },
  ".cm-tooltip.cm-completionInfo": {
    position: "absolute",
    padding: "3px 9px",
    width: "max-content",
    maxWidth: `${400}px`,
    boxSizing: "border-box"
  },
  ".cm-completionInfo.cm-completionInfo-left": { right: "100%" },
  ".cm-completionInfo.cm-completionInfo-right": { left: "100%" },
  ".cm-completionInfo.cm-completionInfo-left-narrow": { right: `${30}px` },
  ".cm-completionInfo.cm-completionInfo-right-narrow": { left: `${30}px` },
  "&light .cm-snippetField": { backgroundColor: "#00000022" },
  "&dark .cm-snippetField": { backgroundColor: "#ffffff22" },
  ".cm-snippetFieldPosition": {
    verticalAlign: "text-top",
    width: 0,
    height: "1.15em",
    display: "inline-block",
    margin: "0 -0.7px -.7em",
    borderLeft: "1.4px dotted #888"
  },
  ".cm-completionMatchedText": {
    textDecoration: "underline"
  },
  ".cm-completionDetail": {
    marginLeft: "0.5em",
    fontStyle: "italic"
  },
  ".cm-completionIcon": {
    fontSize: "90%",
    width: ".8em",
    display: "inline-block",
    textAlign: "center",
    paddingRight: ".6em",
    opacity: "0.6",
    boxSizing: "content-box"
  },
  ".cm-completionIcon-function, .cm-completionIcon-method": {
    "&:after": { content: "'\u0192'" }
  },
  ".cm-completionIcon-class": {
    "&:after": { content: "'\u25CB'" }
  },
  ".cm-completionIcon-interface": {
    "&:after": { content: "'\u25CC'" }
  },
  ".cm-completionIcon-variable": {
    "&:after": { content: "'\u{1D465}'" }
  },
  ".cm-completionIcon-constant": {
    "&:after": { content: "'\u{1D436}'" }
  },
  ".cm-completionIcon-type": {
    "&:after": { content: "'\u{1D461}'" }
  },
  ".cm-completionIcon-enum": {
    "&:after": { content: "'\u222A'" }
  },
  ".cm-completionIcon-property": {
    "&:after": { content: "'\u25A1'" }
  },
  ".cm-completionIcon-keyword": {
    "&:after": { content: "'\u{1F511}\uFE0E'" }
  },
  ".cm-completionIcon-namespace": {
    "&:after": { content: "'\u25A2'" }
  },
  ".cm-completionIcon-text": {
    "&:after": { content: "'abc'", fontSize: "50%", verticalAlign: "middle" }
  }
});
var FieldPos = class {
  constructor(field, line, from, to) {
    this.field = field;
    this.line = line;
    this.from = from;
    this.to = to;
  }
};
var FieldRange = class {
  constructor(field, from, to) {
    this.field = field;
    this.from = from;
    this.to = to;
  }
  map(changes) {
    let from = changes.mapPos(this.from, -1, MapMode.TrackDel);
    let to = changes.mapPos(this.to, 1, MapMode.TrackDel);
    return from == null || to == null ? null : new FieldRange(this.field, from, to);
  }
};
var Snippet = class {
  constructor(lines, fieldPositions) {
    this.lines = lines;
    this.fieldPositions = fieldPositions;
  }
  instantiate(state, pos) {
    let text = [], lineStart = [pos];
    let lineObj = state.doc.lineAt(pos), baseIndent = /^\s*/.exec(lineObj.text)[0];
    for (let line of this.lines) {
      if (text.length) {
        let indent = baseIndent, tabs = /^\t*/.exec(line)[0].length;
        for (let i = 0; i < tabs; i++)
          indent += state.facet(indentUnit);
        lineStart.push(pos + indent.length - tabs);
        line = indent + line.slice(tabs);
      }
      text.push(line);
      pos += line.length + 1;
    }
    let ranges = this.fieldPositions.map((pos2) => new FieldRange(pos2.field, lineStart[pos2.line] + pos2.from, lineStart[pos2.line] + pos2.to));
    return { text, ranges };
  }
  static parse(template) {
    let fields = [];
    let lines = [], positions = [], m;
    for (let line of template.split(/\r\n?|\n/)) {
      while (m = /[#$]\{(?:(\d+)(?::([^}]*))?|([^}]*))\}/.exec(line)) {
        let seq = m[1] ? +m[1] : null, name2 = m[2] || m[3] || "", found = -1;
        for (let i = 0; i < fields.length; i++) {
          if (seq != null ? fields[i].seq == seq : name2 ? fields[i].name == name2 : false)
            found = i;
        }
        if (found < 0) {
          let i = 0;
          while (i < fields.length && (seq == null || fields[i].seq != null && fields[i].seq < seq))
            i++;
          fields.splice(i, 0, { seq, name: name2 });
          found = i;
          for (let pos of positions)
            if (pos.field >= found)
              pos.field++;
        }
        positions.push(new FieldPos(found, lines.length, m.index, m.index + name2.length));
        line = line.slice(0, m.index) + name2 + line.slice(m.index + m[0].length);
      }
      for (let esc; esc = /\\([{}])/.exec(line); ) {
        line = line.slice(0, esc.index) + esc[1] + line.slice(esc.index + esc[0].length);
        for (let pos of positions)
          if (pos.line == lines.length && pos.from > esc.index) {
            pos.from--;
            pos.to--;
          }
      }
      lines.push(line);
    }
    return new Snippet(lines, positions);
  }
};
var fieldMarker = /* @__PURE__ */ Decoration.widget({ widget: /* @__PURE__ */ new class extends WidgetType {
  toDOM() {
    let span = document.createElement("span");
    span.className = "cm-snippetFieldPosition";
    return span;
  }
  ignoreEvent() {
    return false;
  }
}() });
var fieldRange = /* @__PURE__ */ Decoration.mark({ class: "cm-snippetField" });
var ActiveSnippet = class {
  constructor(ranges, active) {
    this.ranges = ranges;
    this.active = active;
    this.deco = Decoration.set(ranges.map((r) => (r.from == r.to ? fieldMarker : fieldRange).range(r.from, r.to)));
  }
  map(changes) {
    let ranges = [];
    for (let r of this.ranges) {
      let mapped = r.map(changes);
      if (!mapped)
        return null;
      ranges.push(mapped);
    }
    return new ActiveSnippet(ranges, this.active);
  }
  selectionInsideField(sel) {
    return sel.ranges.every((range) => this.ranges.some((r) => r.field == this.active && r.from <= range.from && r.to >= range.to));
  }
};
var setActive = /* @__PURE__ */ StateEffect.define({
  map(value, changes) {
    return value && value.map(changes);
  }
});
var moveToField = /* @__PURE__ */ StateEffect.define();
var snippetState = /* @__PURE__ */ StateField.define({
  create() {
    return null;
  },
  update(value, tr) {
    for (let effect of tr.effects) {
      if (effect.is(setActive))
        return effect.value;
      if (effect.is(moveToField) && value)
        return new ActiveSnippet(value.ranges, effect.value);
    }
    if (value && tr.docChanged)
      value = value.map(tr.changes);
    if (value && tr.selection && !value.selectionInsideField(tr.selection))
      value = null;
    return value;
  },
  provide: (f) => EditorView.decorations.from(f, (val) => val ? val.deco : Decoration.none)
});
function fieldSelection(ranges, field) {
  return EditorSelection.create(ranges.filter((r) => r.field == field).map((r) => EditorSelection.range(r.from, r.to)));
}
function snippet(template) {
  let snippet2 = Snippet.parse(template);
  return (editor, completion, from, to) => {
    let { text, ranges } = snippet2.instantiate(editor.state, from);
    let spec = {
      changes: { from, to, insert: Text.of(text) },
      scrollIntoView: true,
      annotations: completion ? [pickedCompletion.of(completion), Transaction.userEvent.of("input.complete")] : void 0
    };
    if (ranges.length)
      spec.selection = fieldSelection(ranges, 0);
    if (ranges.some((r) => r.field > 0)) {
      let active = new ActiveSnippet(ranges, 0);
      let effects = spec.effects = [setActive.of(active)];
      if (editor.state.field(snippetState, false) === void 0)
        effects.push(StateEffect.appendConfig.of([snippetState, addSnippetKeymap, snippetPointerHandler, baseTheme2]));
    }
    editor.dispatch(editor.state.update(spec));
  };
}
function moveField(dir) {
  return ({ state, dispatch }) => {
    let active = state.field(snippetState, false);
    if (!active || dir < 0 && active.active == 0)
      return false;
    let next = active.active + dir, last = dir > 0 && !active.ranges.some((r) => r.field == next + dir);
    dispatch(state.update({
      selection: fieldSelection(active.ranges, next),
      effects: setActive.of(last ? null : new ActiveSnippet(active.ranges, next)),
      scrollIntoView: true
    }));
    return true;
  };
}
var clearSnippet = ({ state, dispatch }) => {
  let active = state.field(snippetState, false);
  if (!active)
    return false;
  dispatch(state.update({ effects: setActive.of(null) }));
  return true;
};
var nextSnippetField = /* @__PURE__ */ moveField(1);
var prevSnippetField = /* @__PURE__ */ moveField(-1);
var defaultSnippetKeymap = [
  { key: "Tab", run: nextSnippetField, shift: prevSnippetField },
  { key: "Escape", run: clearSnippet }
];
var snippetKeymap = /* @__PURE__ */ Facet.define({
  combine(maps) {
    return maps.length ? maps[0] : defaultSnippetKeymap;
  }
});
var addSnippetKeymap = /* @__PURE__ */ Prec.highest(/* @__PURE__ */ keymap.compute([snippetKeymap], (state) => state.facet(snippetKeymap)));
function snippetCompletion(template, completion) {
  return Object.assign(Object.assign({}, completion), { apply: snippet(template) });
}
var snippetPointerHandler = /* @__PURE__ */ EditorView.domEventHandlers({
  mousedown(event, view) {
    let active = view.state.field(snippetState, false), pos;
    if (!active || (pos = view.posAtCoords({ x: event.clientX, y: event.clientY })) == null)
      return false;
    let match = active.ranges.find((r) => r.from <= pos && r.to >= pos);
    if (!match || match.field == active.active)
      return false;
    view.dispatch({
      selection: fieldSelection(active.ranges, match.field),
      effects: setActive.of(active.ranges.some((r) => r.field > match.field) ? new ActiveSnippet(active.ranges, match.field) : null),
      scrollIntoView: true
    });
    return true;
  }
});
var closedBracket = /* @__PURE__ */ new class extends RangeValue {
}();
closedBracket.startSide = 1;
closedBracket.endSide = -1;
var android = typeof navigator == "object" && /* @__PURE__ */ /Android\b/.test(navigator.userAgent);

// node_modules/codemirror/dist/index.js
var minimalSetup = /* @__PURE__ */ (() => [
  highlightSpecialChars(),
  history(),
  drawSelection(),
  syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
  keymap.of([
    ...defaultKeymap,
    ...historyKeymap
  ])
])();

// src/components/editor/tabeditorstyle.ts
var baseTheme3 = EditorView.baseTheme({
  "&": {
    color: "var(--text-normal)",
    backgroundColor: "var(--background-primary)",
    outline: "none",
    height: "100%"
  },
  "&.cm-focused": {
    outline: "none"
  },
  ".cm-content": {
    "max-width": "100%",
    "text-wrap": "wrap",
    outline: "none",
    "caret-color": "var(--caret-color)"
  },
  ".cm-content .cm-line": {
    "padding": "0 1px",
    "font-family": "var(--font-text)",
    "line-height": "var(--line-height-normal)",
    "scroll-padding-block-end": "var(--status-bar-scroll-padding)",
    "scrollbar-gutter": "stable",
    "overflow-wrap": "break-word"
  },
  ".cm-content .cm-header-1": {
    "--font-weight": "var(--h1-weight)",
    "font-variant": "var(--h1-variant)",
    "letter-spacing": "-0.015em",
    "line-height": "var(--h1-line-height)",
    "font-size": "var(--h1-size)",
    color: "var(--h1-color)",
    "font-weight": "var(--font-weight)",
    "font-style": "var(--h1-style)",
    "font-family": "var(--h1-font)"
  },
  ".cm-content .cm-header-2": {
    "--font-weight": "var(--h2-weight)",
    "font-variant": "var(--h2-variant)",
    "letter-spacing": "-0.015em",
    "line-height": "var(--h2-line-height)",
    "font-size": "var(--h2-size)",
    color: "var(--h2-color)",
    "font-weight": "var(--font-weight)",
    "font-style": "var(--h2-style)",
    "font-family": "var(--h2-font)"
  },
  ".cm-content .cm-header-3": {
    "--font-weight": "var(--h3-weight)",
    "font-variant": "var(--h3-variant)",
    "letter-spacing": "-0.015em",
    "line-height": "var(--h3-line-height)",
    "font-size": "var(--h3-size)",
    color: "var(--h3-color)",
    "font-weight": "var(--font-weight)",
    "font-style": "var(--h3-style)",
    "font-family": "var(--h3-font)"
  },
  ".cm-content .cm-header-4": {
    "--font-weight": "var(--h4-weight)",
    "font-variant": "var(--h4-variant)",
    "letter-spacing": "-0.015em",
    "line-height": "var(--h4-line-height)",
    "font-size": "var(--h4-size)",
    color: "var(--h4-color)",
    "font-weight": "var(--font-weight)",
    "font-style": "var(--h4-style)",
    "font-family": "var(--h4-font)"
  },
  ".cm-content .cm-header-5": {
    "--font-weight": "var(--h5-weight)",
    "font-variant": "var(--h5-variant)",
    "letter-spacing": "-0.015em",
    "line-height": "var(--h5-line-height)",
    "font-size": "var(--h5-size)",
    color: "var(--h5-color)",
    "font-weight": "var(--font-weight)",
    "font-style": "var(--h5-style)",
    "font-family": "var(--h5-font)"
  },
  ".cm-content .cm-header-6": {
    "--font-weight": "var(--h6-weight)",
    "font-variant": "var(--h6-variant)",
    "letter-spacing": "-0.015em",
    "line-height": "var(--h6-line-height)",
    "font-size": "var(--h6-size)",
    color: "var(--h6-color)",
    "font-weight": "var(--font-weight)",
    "font-style": "var(--h6-style)",
    "font-family": "var(--h6-font)"
  },
  ".cm-em": {
    "font-style": "italic",
    color: "var(--italic-color)",
    "font-weight": "var(--italic-weight)"
  },
  ".cm-strong": {
    "font-weight": "bold",
    color: "var(--bold-color)"
  },
  ".cm-strikethrough": {
    "text-decoration": "line-through",
    color: "var(--strikethrough-color)"
  },
  ".cm-quote": {
    "border-left": "2px solid var(--blockquote-border-color)",
    "padding-left": "10px"
  }
});
var baseHighlightStyle = HighlightStyle.define([
  { tag: tags.heading1, class: "cm-header cm-header-1" },
  { tag: tags.heading2, class: "cm-header cm-header-2" },
  { tag: tags.heading3, class: "cm-header cm-header-3" },
  { tag: tags.heading4, class: "cm-header cm-header-4" },
  { tag: tags.heading5, class: "cm-header cm-header-5" },
  { tag: tags.heading6, class: "cm-header cm-header-6" },
  { tag: tags.angleBracket, class: "cm-html-embed cm-embed-block" },
  { tag: tags.squareBracket, class: "cm-hmd-barelink cm-link" },
  { tag: tags.paren, class: "cm-inline-code" },
  { tag: tags.emphasis, class: "cm-em" },
  { tag: tags.strong, class: "cm-strong" },
  { tag: tags.quote, class: "cm-formatting cm-formatting-quote cm-quote" }
]);
var baseHighlight = syntaxHighlighting(baseHighlightStyle);

// src/util.ts
function createCodeBlock(code, language2 = "") {
  let backquoteNum = 3;
  if (code.includes("```")) {
    for (let i = 0, count2 = 0; i < code.length; i++) {
      if (code[i] === "`") {
        count2++;
        backquoteNum = Math.max(backquoteNum, count2);
      } else {
        count2 = 0;
      }
    }
  }
  if (code.contains("~~~")) {
    for (let i = 0, count2 = 0; i < code.length; i++) {
      if (code[i] === "~") {
        count2++;
        backquoteNum = Math.max(backquoteNum, count2);
      } else {
        count2 = 0;
      }
    }
  }
  return "`".repeat(backquoteNum) + language2 + "\n" + code + "\n" + "`".repeat(backquoteNum);
}
function getFormattedContent(rowStr, format, tail) {
  tail = tail || format;
  if (rowStr.length <= format.length + tail.length) {
    return format + rowStr + tail;
  }
  if (rowStr.substring(0, format.length) == format && rowStr.substring(rowStr.length - tail.length) == tail) {
    return rowStr.substring(format.length, rowStr.length - tail.length);
  }
  return format + rowStr + tail;
}

// src/components/editor/tabeditor.ts
var import_obsidian8 = __toModule(require("obsidian"));

// src/components/editor/tablemenu.ts
var import_obsidian7 = __toModule(require("obsidian"));
var TableMenu = class extends import_obsidian7.Menu {
  constructor(editor) {
    super();
    this.editor = editor;
    this.addItem((item) => item.setDisabled(true));
  }
  onload() {
    super.onload();
    const menuDom = this.dom;
    const frag = activeDocument.createDocumentFragment();
    const containerEl = frag.createDiv({ cls: "table-generator-container" });
    const counter = frag.createDiv({ cls: ["table-generator-counter", "menu-item"] });
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        const gridEl = createDiv({ cls: "table-generator-grid" });
        gridEl.setAttr("i", i);
        gridEl.setAttr("j", j);
        gridEl.addEventListener("click", async () => {
          await this.editor.createEmptyTable(i + 1, j + 1);
        });
        this.editor.plugin.registerDomEvent(gridEl, "mouseenter", async () => {
          containerEl.querySelectorAll(".table-generator-grid").forEach((gridEl2) => {
            const i2 = parseInt(gridEl2.getAttr("i"));
            const j2 = parseInt(gridEl2.getAttr("j"));
            if (i2 > i || j2 > j)
              gridEl2.removeClass("select");
            else
              gridEl2.addClass("select");
          });
          counter.innerText = `${i + 1} rows ${j + 1} columns`;
        });
        containerEl.append(gridEl);
      }
    }
    menuDom.append(frag);
  }
};

// node_modules/@lezer/lr/dist/index.js
var Stack = class {
  constructor(p, stack, state, reducePos, pos, score, buffer, bufferBase, curContext, lookAhead = 0, parent) {
    this.p = p;
    this.stack = stack;
    this.state = state;
    this.reducePos = reducePos;
    this.pos = pos;
    this.score = score;
    this.buffer = buffer;
    this.bufferBase = bufferBase;
    this.curContext = curContext;
    this.lookAhead = lookAhead;
    this.parent = parent;
  }
  toString() {
    return `[${this.stack.filter((_, i) => i % 3 == 0).concat(this.state)}]@${this.pos}${this.score ? "!" + this.score : ""}`;
  }
  static start(p, state, pos = 0) {
    let cx = p.parser.context;
    return new Stack(p, [], state, pos, pos, 0, [], 0, cx ? new StackContext(cx, cx.start) : null, 0, null);
  }
  get context() {
    return this.curContext ? this.curContext.context : null;
  }
  pushState(state, start) {
    this.stack.push(this.state, start, this.bufferBase + this.buffer.length);
    this.state = state;
  }
  reduce(action) {
    var _a2;
    let depth = action >> 19, type = action & 65535;
    let { parser: parser5 } = this.p;
    let dPrec = parser5.dynamicPrecedence(type);
    if (dPrec)
      this.score += dPrec;
    if (depth == 0) {
      this.pushState(parser5.getGoto(this.state, type, true), this.reducePos);
      if (type < parser5.minRepeatTerm)
        this.storeNode(type, this.reducePos, this.reducePos, 4, true);
      this.reduceContext(type, this.reducePos);
      return;
    }
    let base2 = this.stack.length - (depth - 1) * 3 - (action & 262144 ? 6 : 0);
    let start = base2 ? this.stack[base2 - 2] : this.p.ranges[0].from, size = this.reducePos - start;
    if (size >= 2e3 && !((_a2 = this.p.parser.nodeSet.types[type]) === null || _a2 === void 0 ? void 0 : _a2.isAnonymous)) {
      if (start == this.p.lastBigReductionStart) {
        this.p.bigReductionCount++;
        this.p.lastBigReductionSize = size;
      } else if (this.p.lastBigReductionSize < size) {
        this.p.bigReductionCount = 1;
        this.p.lastBigReductionStart = start;
        this.p.lastBigReductionSize = size;
      }
    }
    let bufferBase = base2 ? this.stack[base2 - 1] : 0, count2 = this.bufferBase + this.buffer.length - bufferBase;
    if (type < parser5.minRepeatTerm || action & 131072) {
      let pos = parser5.stateFlag(this.state, 1) ? this.pos : this.reducePos;
      this.storeNode(type, start, pos, count2 + 4, true);
    }
    if (action & 262144) {
      this.state = this.stack[base2];
    } else {
      let baseStateID = this.stack[base2 - 3];
      this.state = parser5.getGoto(baseStateID, type, true);
    }
    while (this.stack.length > base2)
      this.stack.pop();
    this.reduceContext(type, start);
  }
  storeNode(term, start, end, size = 4, isReduce = false) {
    if (term == 0 && (!this.stack.length || this.stack[this.stack.length - 1] < this.buffer.length + this.bufferBase)) {
      let cur = this, top2 = this.buffer.length;
      if (top2 == 0 && cur.parent) {
        top2 = cur.bufferBase - cur.parent.bufferBase;
        cur = cur.parent;
      }
      if (top2 > 0 && cur.buffer[top2 - 4] == 0 && cur.buffer[top2 - 1] > -1) {
        if (start == end)
          return;
        if (cur.buffer[top2 - 2] >= start) {
          cur.buffer[top2 - 2] = end;
          return;
        }
      }
    }
    if (!isReduce || this.pos == end) {
      this.buffer.push(term, start, end, size);
    } else {
      let index = this.buffer.length;
      if (index > 0 && this.buffer[index - 4] != 0)
        while (index > 0 && this.buffer[index - 2] > end) {
          this.buffer[index] = this.buffer[index - 4];
          this.buffer[index + 1] = this.buffer[index - 3];
          this.buffer[index + 2] = this.buffer[index - 2];
          this.buffer[index + 3] = this.buffer[index - 1];
          index -= 4;
          if (size > 4)
            size -= 4;
        }
      this.buffer[index] = term;
      this.buffer[index + 1] = start;
      this.buffer[index + 2] = end;
      this.buffer[index + 3] = size;
    }
  }
  shift(action, type, start, end) {
    if (action & 131072) {
      this.pushState(action & 65535, this.pos);
    } else if ((action & 262144) == 0) {
      let nextState = action, { parser: parser5 } = this.p;
      if (end > this.pos || type <= parser5.maxNode) {
        this.pos = end;
        if (!parser5.stateFlag(nextState, 1))
          this.reducePos = end;
      }
      this.pushState(nextState, start);
      this.shiftContext(type, start);
      if (type <= parser5.maxNode)
        this.buffer.push(type, start, end, 4);
    } else {
      this.pos = end;
      this.shiftContext(type, start);
      if (type <= this.p.parser.maxNode)
        this.buffer.push(type, start, end, 4);
    }
  }
  apply(action, next, nextStart, nextEnd) {
    if (action & 65536)
      this.reduce(action);
    else
      this.shift(action, next, nextStart, nextEnd);
  }
  useNode(value, next) {
    let index = this.p.reused.length - 1;
    if (index < 0 || this.p.reused[index] != value) {
      this.p.reused.push(value);
      index++;
    }
    let start = this.pos;
    this.reducePos = this.pos = start + value.length;
    this.pushState(next, start);
    this.buffer.push(index, start, this.reducePos, -1);
    if (this.curContext)
      this.updateContext(this.curContext.tracker.reuse(this.curContext.context, value, this, this.p.stream.reset(this.pos - value.length)));
  }
  split() {
    let parent = this;
    let off = parent.buffer.length;
    while (off > 0 && parent.buffer[off - 2] > parent.reducePos)
      off -= 4;
    let buffer = parent.buffer.slice(off), base2 = parent.bufferBase + off;
    while (parent && base2 == parent.bufferBase)
      parent = parent.parent;
    return new Stack(this.p, this.stack.slice(), this.state, this.reducePos, this.pos, this.score, buffer, base2, this.curContext, this.lookAhead, parent);
  }
  recoverByDelete(next, nextEnd) {
    let isNode = next <= this.p.parser.maxNode;
    if (isNode)
      this.storeNode(next, this.pos, nextEnd, 4);
    this.storeNode(0, this.pos, nextEnd, isNode ? 8 : 4);
    this.pos = this.reducePos = nextEnd;
    this.score -= 190;
  }
  canShift(term) {
    for (let sim = new SimulatedStack(this); ; ) {
      let action = this.p.parser.stateSlot(sim.state, 4) || this.p.parser.hasAction(sim.state, term);
      if (action == 0)
        return false;
      if ((action & 65536) == 0)
        return true;
      sim.reduce(action);
    }
  }
  recoverByInsert(next) {
    if (this.stack.length >= 300)
      return [];
    let nextStates = this.p.parser.nextStates(this.state);
    if (nextStates.length > 4 << 1 || this.stack.length >= 120) {
      let best = [];
      for (let i = 0, s; i < nextStates.length; i += 2) {
        if ((s = nextStates[i + 1]) != this.state && this.p.parser.hasAction(s, next))
          best.push(nextStates[i], s);
      }
      if (this.stack.length < 120)
        for (let i = 0; best.length < 4 << 1 && i < nextStates.length; i += 2) {
          let s = nextStates[i + 1];
          if (!best.some((v, i2) => i2 & 1 && v == s))
            best.push(nextStates[i], s);
        }
      nextStates = best;
    }
    let result = [];
    for (let i = 0; i < nextStates.length && result.length < 4; i += 2) {
      let s = nextStates[i + 1];
      if (s == this.state)
        continue;
      let stack = this.split();
      stack.pushState(s, this.pos);
      stack.storeNode(0, stack.pos, stack.pos, 4, true);
      stack.shiftContext(nextStates[i], this.pos);
      stack.reducePos = this.pos;
      stack.score -= 200;
      result.push(stack);
    }
    return result;
  }
  forceReduce() {
    let { parser: parser5 } = this.p;
    let reduce = parser5.stateSlot(this.state, 5);
    if ((reduce & 65536) == 0)
      return false;
    if (!parser5.validAction(this.state, reduce)) {
      let depth = reduce >> 19, term = reduce & 65535;
      let target = this.stack.length - depth * 3;
      if (target < 0 || parser5.getGoto(this.stack[target], term, false) < 0) {
        let backup = this.findForcedReduction();
        if (backup == null)
          return false;
        reduce = backup;
      }
      this.storeNode(0, this.pos, this.pos, 4, true);
      this.score -= 100;
    }
    this.reducePos = this.pos;
    this.reduce(reduce);
    return true;
  }
  findForcedReduction() {
    let { parser: parser5 } = this.p, seen = [];
    let explore = (state, depth) => {
      if (seen.includes(state))
        return;
      seen.push(state);
      return parser5.allActions(state, (action) => {
        if (action & (262144 | 131072))
          ;
        else if (action & 65536) {
          let rDepth = (action >> 19) - depth;
          if (rDepth > 1) {
            let term = action & 65535, target = this.stack.length - rDepth * 3;
            if (target >= 0 && parser5.getGoto(this.stack[target], term, false) >= 0)
              return rDepth << 19 | 65536 | term;
          }
        } else {
          let found = explore(action, depth + 1);
          if (found != null)
            return found;
        }
      });
    };
    return explore(this.state, 0);
  }
  forceAll() {
    while (!this.p.parser.stateFlag(this.state, 2)) {
      if (!this.forceReduce()) {
        this.storeNode(0, this.pos, this.pos, 4, true);
        break;
      }
    }
    return this;
  }
  get deadEnd() {
    if (this.stack.length != 3)
      return false;
    let { parser: parser5 } = this.p;
    return parser5.data[parser5.stateSlot(this.state, 1)] == 65535 && !parser5.stateSlot(this.state, 4);
  }
  restart() {
    this.storeNode(0, this.pos, this.pos, 4, true);
    this.state = this.stack[0];
    this.stack.length = 0;
  }
  sameState(other) {
    if (this.state != other.state || this.stack.length != other.stack.length)
      return false;
    for (let i = 0; i < this.stack.length; i += 3)
      if (this.stack[i] != other.stack[i])
        return false;
    return true;
  }
  get parser() {
    return this.p.parser;
  }
  dialectEnabled(dialectID) {
    return this.p.parser.dialect.flags[dialectID];
  }
  shiftContext(term, start) {
    if (this.curContext)
      this.updateContext(this.curContext.tracker.shift(this.curContext.context, term, this, this.p.stream.reset(start)));
  }
  reduceContext(term, start) {
    if (this.curContext)
      this.updateContext(this.curContext.tracker.reduce(this.curContext.context, term, this, this.p.stream.reset(start)));
  }
  emitContext() {
    let last = this.buffer.length - 1;
    if (last < 0 || this.buffer[last] != -3)
      this.buffer.push(this.curContext.hash, this.pos, this.pos, -3);
  }
  emitLookAhead() {
    let last = this.buffer.length - 1;
    if (last < 0 || this.buffer[last] != -4)
      this.buffer.push(this.lookAhead, this.pos, this.pos, -4);
  }
  updateContext(context) {
    if (context != this.curContext.context) {
      let newCx = new StackContext(this.curContext.tracker, context);
      if (newCx.hash != this.curContext.hash)
        this.emitContext();
      this.curContext = newCx;
    }
  }
  setLookAhead(lookAhead) {
    if (lookAhead > this.lookAhead) {
      this.emitLookAhead();
      this.lookAhead = lookAhead;
    }
  }
  close() {
    if (this.curContext && this.curContext.tracker.strict)
      this.emitContext();
    if (this.lookAhead > 0)
      this.emitLookAhead();
  }
};
var StackContext = class {
  constructor(tracker, context) {
    this.tracker = tracker;
    this.context = context;
    this.hash = tracker.strict ? tracker.hash(context) : 0;
  }
};
var SimulatedStack = class {
  constructor(start) {
    this.start = start;
    this.state = start.state;
    this.stack = start.stack;
    this.base = this.stack.length;
  }
  reduce(action) {
    let term = action & 65535, depth = action >> 19;
    if (depth == 0) {
      if (this.stack == this.start.stack)
        this.stack = this.stack.slice();
      this.stack.push(this.state, 0, 0);
      this.base += 3;
    } else {
      this.base -= (depth - 1) * 3;
    }
    let goto = this.start.p.parser.getGoto(this.stack[this.base - 3], term, true);
    this.state = goto;
  }
};
var StackBufferCursor = class {
  constructor(stack, pos, index) {
    this.stack = stack;
    this.pos = pos;
    this.index = index;
    this.buffer = stack.buffer;
    if (this.index == 0)
      this.maybeNext();
  }
  static create(stack, pos = stack.bufferBase + stack.buffer.length) {
    return new StackBufferCursor(stack, pos, pos - stack.bufferBase);
  }
  maybeNext() {
    let next = this.stack.parent;
    if (next != null) {
      this.index = this.stack.bufferBase - next.bufferBase;
      this.stack = next;
      this.buffer = next.buffer;
    }
  }
  get id() {
    return this.buffer[this.index - 4];
  }
  get start() {
    return this.buffer[this.index - 3];
  }
  get end() {
    return this.buffer[this.index - 2];
  }
  get size() {
    return this.buffer[this.index - 1];
  }
  next() {
    this.index -= 4;
    this.pos -= 4;
    if (this.index == 0)
      this.maybeNext();
  }
  fork() {
    return new StackBufferCursor(this.stack, this.pos, this.index);
  }
};
function decodeArray(input, Type2 = Uint16Array) {
  if (typeof input != "string")
    return input;
  let array = null;
  for (let pos = 0, out = 0; pos < input.length; ) {
    let value = 0;
    for (; ; ) {
      let next = input.charCodeAt(pos++), stop = false;
      if (next == 126) {
        value = 65535;
        break;
      }
      if (next >= 92)
        next--;
      if (next >= 34)
        next--;
      let digit = next - 32;
      if (digit >= 46) {
        digit -= 46;
        stop = true;
      }
      value += digit;
      if (stop)
        break;
      value *= 46;
    }
    if (array)
      array[out++] = value;
    else
      array = new Type2(value);
  }
  return array;
}
var CachedToken = class {
  constructor() {
    this.start = -1;
    this.value = -1;
    this.end = -1;
    this.extended = -1;
    this.lookAhead = 0;
    this.mask = 0;
    this.context = 0;
  }
};
var nullToken = new CachedToken();
var InputStream = class {
  constructor(input, ranges) {
    this.input = input;
    this.ranges = ranges;
    this.chunk = "";
    this.chunkOff = 0;
    this.chunk2 = "";
    this.chunk2Pos = 0;
    this.next = -1;
    this.token = nullToken;
    this.rangeIndex = 0;
    this.pos = this.chunkPos = ranges[0].from;
    this.range = ranges[0];
    this.end = ranges[ranges.length - 1].to;
    this.readNext();
  }
  resolveOffset(offset, assoc) {
    let range = this.range, index = this.rangeIndex;
    let pos = this.pos + offset;
    while (pos < range.from) {
      if (!index)
        return null;
      let next = this.ranges[--index];
      pos -= range.from - next.to;
      range = next;
    }
    while (assoc < 0 ? pos > range.to : pos >= range.to) {
      if (index == this.ranges.length - 1)
        return null;
      let next = this.ranges[++index];
      pos += next.from - range.to;
      range = next;
    }
    return pos;
  }
  clipPos(pos) {
    if (pos >= this.range.from && pos < this.range.to)
      return pos;
    for (let range of this.ranges)
      if (range.to > pos)
        return Math.max(pos, range.from);
    return this.end;
  }
  peek(offset) {
    let idx = this.chunkOff + offset, pos, result;
    if (idx >= 0 && idx < this.chunk.length) {
      pos = this.pos + offset;
      result = this.chunk.charCodeAt(idx);
    } else {
      let resolved = this.resolveOffset(offset, 1);
      if (resolved == null)
        return -1;
      pos = resolved;
      if (pos >= this.chunk2Pos && pos < this.chunk2Pos + this.chunk2.length) {
        result = this.chunk2.charCodeAt(pos - this.chunk2Pos);
      } else {
        let i = this.rangeIndex, range = this.range;
        while (range.to <= pos)
          range = this.ranges[++i];
        this.chunk2 = this.input.chunk(this.chunk2Pos = pos);
        if (pos + this.chunk2.length > range.to)
          this.chunk2 = this.chunk2.slice(0, range.to - pos);
        result = this.chunk2.charCodeAt(0);
      }
    }
    if (pos >= this.token.lookAhead)
      this.token.lookAhead = pos + 1;
    return result;
  }
  acceptToken(token, endOffset = 0) {
    let end = endOffset ? this.resolveOffset(endOffset, -1) : this.pos;
    if (end == null || end < this.token.start)
      throw new RangeError("Token end out of bounds");
    this.token.value = token;
    this.token.end = end;
  }
  acceptTokenTo(token, endPos) {
    this.token.value = token;
    this.token.end = endPos;
  }
  getChunk() {
    if (this.pos >= this.chunk2Pos && this.pos < this.chunk2Pos + this.chunk2.length) {
      let { chunk, chunkPos } = this;
      this.chunk = this.chunk2;
      this.chunkPos = this.chunk2Pos;
      this.chunk2 = chunk;
      this.chunk2Pos = chunkPos;
      this.chunkOff = this.pos - this.chunkPos;
    } else {
      this.chunk2 = this.chunk;
      this.chunk2Pos = this.chunkPos;
      let nextChunk = this.input.chunk(this.pos);
      let end = this.pos + nextChunk.length;
      this.chunk = end > this.range.to ? nextChunk.slice(0, this.range.to - this.pos) : nextChunk;
      this.chunkPos = this.pos;
      this.chunkOff = 0;
    }
  }
  readNext() {
    if (this.chunkOff >= this.chunk.length) {
      this.getChunk();
      if (this.chunkOff == this.chunk.length)
        return this.next = -1;
    }
    return this.next = this.chunk.charCodeAt(this.chunkOff);
  }
  advance(n = 1) {
    this.chunkOff += n;
    while (this.pos + n >= this.range.to) {
      if (this.rangeIndex == this.ranges.length - 1)
        return this.setDone();
      n -= this.range.to - this.pos;
      this.range = this.ranges[++this.rangeIndex];
      this.pos = this.range.from;
    }
    this.pos += n;
    if (this.pos >= this.token.lookAhead)
      this.token.lookAhead = this.pos + 1;
    return this.readNext();
  }
  setDone() {
    this.pos = this.chunkPos = this.end;
    this.range = this.ranges[this.rangeIndex = this.ranges.length - 1];
    this.chunk = "";
    return this.next = -1;
  }
  reset(pos, token) {
    if (token) {
      this.token = token;
      token.start = pos;
      token.lookAhead = pos + 1;
      token.value = token.extended = -1;
    } else {
      this.token = nullToken;
    }
    if (this.pos != pos) {
      this.pos = pos;
      if (pos == this.end) {
        this.setDone();
        return this;
      }
      while (pos < this.range.from)
        this.range = this.ranges[--this.rangeIndex];
      while (pos >= this.range.to)
        this.range = this.ranges[++this.rangeIndex];
      if (pos >= this.chunkPos && pos < this.chunkPos + this.chunk.length) {
        this.chunkOff = pos - this.chunkPos;
      } else {
        this.chunk = "";
        this.chunkOff = 0;
      }
      this.readNext();
    }
    return this;
  }
  read(from, to) {
    if (from >= this.chunkPos && to <= this.chunkPos + this.chunk.length)
      return this.chunk.slice(from - this.chunkPos, to - this.chunkPos);
    if (from >= this.chunk2Pos && to <= this.chunk2Pos + this.chunk2.length)
      return this.chunk2.slice(from - this.chunk2Pos, to - this.chunk2Pos);
    if (from >= this.range.from && to <= this.range.to)
      return this.input.read(from, to);
    let result = "";
    for (let r of this.ranges) {
      if (r.from >= to)
        break;
      if (r.to > from)
        result += this.input.read(Math.max(r.from, from), Math.min(r.to, to));
    }
    return result;
  }
};
var TokenGroup = class {
  constructor(data2, id2) {
    this.data = data2;
    this.id = id2;
  }
  token(input, stack) {
    let { parser: parser5 } = stack.p;
    readToken(this.data, input, stack, this.id, parser5.data, parser5.tokenPrecTable);
  }
};
TokenGroup.prototype.contextual = TokenGroup.prototype.fallback = TokenGroup.prototype.extend = false;
var LocalTokenGroup = class {
  constructor(data2, precTable, elseToken) {
    this.precTable = precTable;
    this.elseToken = elseToken;
    this.data = typeof data2 == "string" ? decodeArray(data2) : data2;
  }
  token(input, stack) {
    let start = input.pos, skipped = 0;
    for (; ; ) {
      let atEof = input.next < 0, nextPos = input.resolveOffset(1, 1);
      readToken(this.data, input, stack, 0, this.data, this.precTable);
      if (input.token.value > -1)
        break;
      if (this.elseToken == null)
        return;
      if (!atEof)
        skipped++;
      if (nextPos == null)
        break;
      input.reset(nextPos, input.token);
    }
    if (skipped) {
      input.reset(start, input.token);
      input.acceptToken(this.elseToken, skipped);
    }
  }
};
LocalTokenGroup.prototype.contextual = TokenGroup.prototype.fallback = TokenGroup.prototype.extend = false;
var ExternalTokenizer = class {
  constructor(token, options = {}) {
    this.token = token;
    this.contextual = !!options.contextual;
    this.fallback = !!options.fallback;
    this.extend = !!options.extend;
  }
};
function readToken(data2, input, stack, group, precTable, precOffset) {
  let state = 0, groupMask = 1 << group, { dialect } = stack.p.parser;
  scan:
    for (; ; ) {
      if ((groupMask & data2[state]) == 0)
        break;
      let accEnd = data2[state + 1];
      for (let i = state + 3; i < accEnd; i += 2)
        if ((data2[i + 1] & groupMask) > 0) {
          let term = data2[i];
          if (dialect.allows(term) && (input.token.value == -1 || input.token.value == term || overrides(term, input.token.value, precTable, precOffset))) {
            input.acceptToken(term);
            break;
          }
        }
      let next = input.next, low = 0, high = data2[state + 2];
      if (input.next < 0 && high > low && data2[accEnd + high * 3 - 3] == 65535) {
        state = data2[accEnd + high * 3 - 1];
        continue scan;
      }
      for (; low < high; ) {
        let mid = low + high >> 1;
        let index = accEnd + mid + (mid << 1);
        let from = data2[index], to = data2[index + 1] || 65536;
        if (next < from)
          high = mid;
        else if (next >= to)
          low = mid + 1;
        else {
          state = data2[index + 2];
          input.advance();
          continue scan;
        }
      }
      break;
    }
}
function findOffset(data2, start, term) {
  for (let i = start, next; (next = data2[i]) != 65535; i++)
    if (next == term)
      return i - start;
  return -1;
}
function overrides(token, prev, tableData, tableOffset) {
  let iPrev = findOffset(tableData, tableOffset, prev);
  return iPrev < 0 || findOffset(tableData, tableOffset, token) < iPrev;
}
var verbose = typeof process != "undefined" && process.env && /\bparse\b/.test(process.env.LOG);
var stackIDs = null;
function cutAt(tree, pos, side) {
  let cursor = tree.cursor(IterMode.IncludeAnonymous);
  cursor.moveTo(pos);
  for (; ; ) {
    if (!(side < 0 ? cursor.childBefore(pos) : cursor.childAfter(pos)))
      for (; ; ) {
        if ((side < 0 ? cursor.to < pos : cursor.from > pos) && !cursor.type.isError)
          return side < 0 ? Math.max(0, Math.min(cursor.to - 1, pos - 25)) : Math.min(tree.length, Math.max(cursor.from + 1, pos + 25));
        if (side < 0 ? cursor.prevSibling() : cursor.nextSibling())
          break;
        if (!cursor.parent())
          return side < 0 ? 0 : tree.length;
      }
  }
}
var FragmentCursor2 = class {
  constructor(fragments, nodeSet) {
    this.fragments = fragments;
    this.nodeSet = nodeSet;
    this.i = 0;
    this.fragment = null;
    this.safeFrom = -1;
    this.safeTo = -1;
    this.trees = [];
    this.start = [];
    this.index = [];
    this.nextFragment();
  }
  nextFragment() {
    let fr = this.fragment = this.i == this.fragments.length ? null : this.fragments[this.i++];
    if (fr) {
      this.safeFrom = fr.openStart ? cutAt(fr.tree, fr.from + fr.offset, 1) - fr.offset : fr.from;
      this.safeTo = fr.openEnd ? cutAt(fr.tree, fr.to + fr.offset, -1) - fr.offset : fr.to;
      while (this.trees.length) {
        this.trees.pop();
        this.start.pop();
        this.index.pop();
      }
      this.trees.push(fr.tree);
      this.start.push(-fr.offset);
      this.index.push(0);
      this.nextStart = this.safeFrom;
    } else {
      this.nextStart = 1e9;
    }
  }
  nodeAt(pos) {
    if (pos < this.nextStart)
      return null;
    while (this.fragment && this.safeTo <= pos)
      this.nextFragment();
    if (!this.fragment)
      return null;
    for (; ; ) {
      let last = this.trees.length - 1;
      if (last < 0) {
        this.nextFragment();
        return null;
      }
      let top2 = this.trees[last], index = this.index[last];
      if (index == top2.children.length) {
        this.trees.pop();
        this.start.pop();
        this.index.pop();
        continue;
      }
      let next = top2.children[index];
      let start = this.start[last] + top2.positions[index];
      if (start > pos) {
        this.nextStart = start;
        return null;
      }
      if (next instanceof Tree) {
        if (start == pos) {
          if (start < this.safeFrom)
            return null;
          let end = start + next.length;
          if (end <= this.safeTo) {
            let lookAhead = next.prop(NodeProp.lookAhead);
            if (!lookAhead || end + lookAhead < this.fragment.to)
              return next;
          }
        }
        this.index[last]++;
        if (start + next.length >= Math.max(this.safeFrom, pos)) {
          this.trees.push(next);
          this.start.push(start);
          this.index.push(0);
        }
      } else {
        this.index[last]++;
        this.nextStart = start + next.length;
      }
    }
  }
};
var TokenCache = class {
  constructor(parser5, stream) {
    this.stream = stream;
    this.tokens = [];
    this.mainToken = null;
    this.actions = [];
    this.tokens = parser5.tokenizers.map((_) => new CachedToken());
  }
  getActions(stack) {
    let actionIndex = 0;
    let main = null;
    let { parser: parser5 } = stack.p, { tokenizers } = parser5;
    let mask = parser5.stateSlot(stack.state, 3);
    let context = stack.curContext ? stack.curContext.hash : 0;
    let lookAhead = 0;
    for (let i = 0; i < tokenizers.length; i++) {
      if ((1 << i & mask) == 0)
        continue;
      let tokenizer = tokenizers[i], token = this.tokens[i];
      if (main && !tokenizer.fallback)
        continue;
      if (tokenizer.contextual || token.start != stack.pos || token.mask != mask || token.context != context) {
        this.updateCachedToken(token, tokenizer, stack);
        token.mask = mask;
        token.context = context;
      }
      if (token.lookAhead > token.end + 25)
        lookAhead = Math.max(token.lookAhead, lookAhead);
      if (token.value != 0) {
        let startIndex = actionIndex;
        if (token.extended > -1)
          actionIndex = this.addActions(stack, token.extended, token.end, actionIndex);
        actionIndex = this.addActions(stack, token.value, token.end, actionIndex);
        if (!tokenizer.extend) {
          main = token;
          if (actionIndex > startIndex)
            break;
        }
      }
    }
    while (this.actions.length > actionIndex)
      this.actions.pop();
    if (lookAhead)
      stack.setLookAhead(lookAhead);
    if (!main && stack.pos == this.stream.end) {
      main = new CachedToken();
      main.value = stack.p.parser.eofTerm;
      main.start = main.end = stack.pos;
      actionIndex = this.addActions(stack, main.value, main.end, actionIndex);
    }
    this.mainToken = main;
    return this.actions;
  }
  getMainToken(stack) {
    if (this.mainToken)
      return this.mainToken;
    let main = new CachedToken(), { pos, p } = stack;
    main.start = pos;
    main.end = Math.min(pos + 1, p.stream.end);
    main.value = pos == p.stream.end ? p.parser.eofTerm : 0;
    return main;
  }
  updateCachedToken(token, tokenizer, stack) {
    let start = this.stream.clipPos(stack.pos);
    tokenizer.token(this.stream.reset(start, token), stack);
    if (token.value > -1) {
      let { parser: parser5 } = stack.p;
      for (let i = 0; i < parser5.specialized.length; i++)
        if (parser5.specialized[i] == token.value) {
          let result = parser5.specializers[i](this.stream.read(token.start, token.end), stack);
          if (result >= 0 && stack.p.parser.dialect.allows(result >> 1)) {
            if ((result & 1) == 0)
              token.value = result >> 1;
            else
              token.extended = result >> 1;
            break;
          }
        }
    } else {
      token.value = 0;
      token.end = this.stream.clipPos(start + 1);
    }
  }
  putAction(action, token, end, index) {
    for (let i = 0; i < index; i += 3)
      if (this.actions[i] == action)
        return index;
    this.actions[index++] = action;
    this.actions[index++] = token;
    this.actions[index++] = end;
    return index;
  }
  addActions(stack, token, end, index) {
    let { state } = stack, { parser: parser5 } = stack.p, { data: data2 } = parser5;
    for (let set = 0; set < 2; set++) {
      for (let i = parser5.stateSlot(state, set ? 2 : 1); ; i += 3) {
        if (data2[i] == 65535) {
          if (data2[i + 1] == 1) {
            i = pair(data2, i + 2);
          } else {
            if (index == 0 && data2[i + 1] == 2)
              index = this.putAction(pair(data2, i + 2), token, end, index);
            break;
          }
        }
        if (data2[i] == token)
          index = this.putAction(pair(data2, i + 1), token, end, index);
      }
    }
    return index;
  }
};
var Parse = class {
  constructor(parser5, input, fragments, ranges) {
    this.parser = parser5;
    this.input = input;
    this.ranges = ranges;
    this.recovering = 0;
    this.nextStackID = 9812;
    this.minStackPos = 0;
    this.reused = [];
    this.stoppedAt = null;
    this.lastBigReductionStart = -1;
    this.lastBigReductionSize = 0;
    this.bigReductionCount = 0;
    this.stream = new InputStream(input, ranges);
    this.tokens = new TokenCache(parser5, this.stream);
    this.topTerm = parser5.top[1];
    let { from } = ranges[0];
    this.stacks = [Stack.start(this, parser5.top[0], from)];
    this.fragments = fragments.length && this.stream.end - from > parser5.bufferLength * 4 ? new FragmentCursor2(fragments, parser5.nodeSet) : null;
  }
  get parsedPos() {
    return this.minStackPos;
  }
  advance() {
    let stacks = this.stacks, pos = this.minStackPos;
    let newStacks = this.stacks = [];
    let stopped, stoppedTokens;
    if (this.bigReductionCount > 300 && stacks.length == 1) {
      let [s] = stacks;
      while (s.forceReduce() && s.stack.length && s.stack[s.stack.length - 2] >= this.lastBigReductionStart) {
      }
      this.bigReductionCount = this.lastBigReductionSize = 0;
    }
    for (let i = 0; i < stacks.length; i++) {
      let stack = stacks[i];
      for (; ; ) {
        this.tokens.mainToken = null;
        if (stack.pos > pos) {
          newStacks.push(stack);
        } else if (this.advanceStack(stack, newStacks, stacks)) {
          continue;
        } else {
          if (!stopped) {
            stopped = [];
            stoppedTokens = [];
          }
          stopped.push(stack);
          let tok = this.tokens.getMainToken(stack);
          stoppedTokens.push(tok.value, tok.end);
        }
        break;
      }
    }
    if (!newStacks.length) {
      let finished = stopped && findFinished(stopped);
      if (finished) {
        if (verbose)
          console.log("Finish with " + this.stackID(finished));
        return this.stackToTree(finished);
      }
      if (this.parser.strict) {
        if (verbose && stopped)
          console.log("Stuck with token " + (this.tokens.mainToken ? this.parser.getName(this.tokens.mainToken.value) : "none"));
        throw new SyntaxError("No parse at " + pos);
      }
      if (!this.recovering)
        this.recovering = 5;
    }
    if (this.recovering && stopped) {
      let finished = this.stoppedAt != null && stopped[0].pos > this.stoppedAt ? stopped[0] : this.runRecovery(stopped, stoppedTokens, newStacks);
      if (finished) {
        if (verbose)
          console.log("Force-finish " + this.stackID(finished));
        return this.stackToTree(finished.forceAll());
      }
    }
    if (this.recovering) {
      let maxRemaining = this.recovering == 1 ? 1 : this.recovering * 3;
      if (newStacks.length > maxRemaining) {
        newStacks.sort((a, b) => b.score - a.score);
        while (newStacks.length > maxRemaining)
          newStacks.pop();
      }
      if (newStacks.some((s) => s.reducePos > pos))
        this.recovering--;
    } else if (newStacks.length > 1) {
      outer:
        for (let i = 0; i < newStacks.length - 1; i++) {
          let stack = newStacks[i];
          for (let j = i + 1; j < newStacks.length; j++) {
            let other = newStacks[j];
            if (stack.sameState(other) || stack.buffer.length > 500 && other.buffer.length > 500) {
              if ((stack.score - other.score || stack.buffer.length - other.buffer.length) > 0) {
                newStacks.splice(j--, 1);
              } else {
                newStacks.splice(i--, 1);
                continue outer;
              }
            }
          }
        }
      if (newStacks.length > 12)
        newStacks.splice(12, newStacks.length - 12);
    }
    this.minStackPos = newStacks[0].pos;
    for (let i = 1; i < newStacks.length; i++)
      if (newStacks[i].pos < this.minStackPos)
        this.minStackPos = newStacks[i].pos;
    return null;
  }
  stopAt(pos) {
    if (this.stoppedAt != null && this.stoppedAt < pos)
      throw new RangeError("Can't move stoppedAt forward");
    this.stoppedAt = pos;
  }
  advanceStack(stack, stacks, split) {
    let start = stack.pos, { parser: parser5 } = this;
    let base2 = verbose ? this.stackID(stack) + " -> " : "";
    if (this.stoppedAt != null && start > this.stoppedAt)
      return stack.forceReduce() ? stack : null;
    if (this.fragments) {
      let strictCx = stack.curContext && stack.curContext.tracker.strict, cxHash = strictCx ? stack.curContext.hash : 0;
      for (let cached = this.fragments.nodeAt(start); cached; ) {
        let match = this.parser.nodeSet.types[cached.type.id] == cached.type ? parser5.getGoto(stack.state, cached.type.id) : -1;
        if (match > -1 && cached.length && (!strictCx || (cached.prop(NodeProp.contextHash) || 0) == cxHash)) {
          stack.useNode(cached, match);
          if (verbose)
            console.log(base2 + this.stackID(stack) + ` (via reuse of ${parser5.getName(cached.type.id)})`);
          return true;
        }
        if (!(cached instanceof Tree) || cached.children.length == 0 || cached.positions[0] > 0)
          break;
        let inner = cached.children[0];
        if (inner instanceof Tree && cached.positions[0] == 0)
          cached = inner;
        else
          break;
      }
    }
    let defaultReduce = parser5.stateSlot(stack.state, 4);
    if (defaultReduce > 0) {
      stack.reduce(defaultReduce);
      if (verbose)
        console.log(base2 + this.stackID(stack) + ` (via always-reduce ${parser5.getName(defaultReduce & 65535)})`);
      return true;
    }
    if (stack.stack.length >= 8400) {
      while (stack.stack.length > 6e3 && stack.forceReduce()) {
      }
    }
    let actions = this.tokens.getActions(stack);
    for (let i = 0; i < actions.length; ) {
      let action = actions[i++], term = actions[i++], end = actions[i++];
      let last = i == actions.length || !split;
      let localStack = last ? stack : stack.split();
      let main = this.tokens.mainToken;
      localStack.apply(action, term, main ? main.start : localStack.pos, end);
      if (verbose)
        console.log(base2 + this.stackID(localStack) + ` (via ${(action & 65536) == 0 ? "shift" : `reduce of ${parser5.getName(action & 65535)}`} for ${parser5.getName(term)} @ ${start}${localStack == stack ? "" : ", split"})`);
      if (last)
        return true;
      else if (localStack.pos > start)
        stacks.push(localStack);
      else
        split.push(localStack);
    }
    return false;
  }
  advanceFully(stack, newStacks) {
    let pos = stack.pos;
    for (; ; ) {
      if (!this.advanceStack(stack, null, null))
        return false;
      if (stack.pos > pos) {
        pushStackDedup(stack, newStacks);
        return true;
      }
    }
  }
  runRecovery(stacks, tokens, newStacks) {
    let finished = null, restarted = false;
    for (let i = 0; i < stacks.length; i++) {
      let stack = stacks[i], token = tokens[i << 1], tokenEnd = tokens[(i << 1) + 1];
      let base2 = verbose ? this.stackID(stack) + " -> " : "";
      if (stack.deadEnd) {
        if (restarted)
          continue;
        restarted = true;
        stack.restart();
        if (verbose)
          console.log(base2 + this.stackID(stack) + " (restarted)");
        let done = this.advanceFully(stack, newStacks);
        if (done)
          continue;
      }
      let force = stack.split(), forceBase = base2;
      for (let j = 0; force.forceReduce() && j < 10; j++) {
        if (verbose)
          console.log(forceBase + this.stackID(force) + " (via force-reduce)");
        let done = this.advanceFully(force, newStacks);
        if (done)
          break;
        if (verbose)
          forceBase = this.stackID(force) + " -> ";
      }
      for (let insert2 of stack.recoverByInsert(token)) {
        if (verbose)
          console.log(base2 + this.stackID(insert2) + " (via recover-insert)");
        this.advanceFully(insert2, newStacks);
      }
      if (this.stream.end > stack.pos) {
        if (tokenEnd == stack.pos) {
          tokenEnd++;
          token = 0;
        }
        stack.recoverByDelete(token, tokenEnd);
        if (verbose)
          console.log(base2 + this.stackID(stack) + ` (via recover-delete ${this.parser.getName(token)})`);
        pushStackDedup(stack, newStacks);
      } else if (!finished || finished.score < stack.score) {
        finished = stack;
      }
    }
    return finished;
  }
  stackToTree(stack) {
    stack.close();
    return Tree.build({
      buffer: StackBufferCursor.create(stack),
      nodeSet: this.parser.nodeSet,
      topID: this.topTerm,
      maxBufferLength: this.parser.bufferLength,
      reused: this.reused,
      start: this.ranges[0].from,
      length: stack.pos - this.ranges[0].from,
      minRepeatType: this.parser.minRepeatTerm
    });
  }
  stackID(stack) {
    let id2 = (stackIDs || (stackIDs = new WeakMap())).get(stack);
    if (!id2)
      stackIDs.set(stack, id2 = String.fromCodePoint(this.nextStackID++));
    return id2 + stack;
  }
};
function pushStackDedup(stack, newStacks) {
  for (let i = 0; i < newStacks.length; i++) {
    let other = newStacks[i];
    if (other.pos == stack.pos && other.sameState(stack)) {
      if (newStacks[i].score < stack.score)
        newStacks[i] = stack;
      return;
    }
  }
  newStacks.push(stack);
}
var Dialect = class {
  constructor(source, flags, disabled) {
    this.source = source;
    this.flags = flags;
    this.disabled = disabled;
  }
  allows(term) {
    return !this.disabled || this.disabled[term] == 0;
  }
};
var id = (x) => x;
var ContextTracker = class {
  constructor(spec) {
    this.start = spec.start;
    this.shift = spec.shift || id;
    this.reduce = spec.reduce || id;
    this.reuse = spec.reuse || id;
    this.hash = spec.hash || (() => 0);
    this.strict = spec.strict !== false;
  }
};
var LRParser = class extends Parser {
  constructor(spec) {
    super();
    this.wrappers = [];
    if (spec.version != 14)
      throw new RangeError(`Parser version (${spec.version}) doesn't match runtime version (${14})`);
    let nodeNames = spec.nodeNames.split(" ");
    this.minRepeatTerm = nodeNames.length;
    for (let i = 0; i < spec.repeatNodeCount; i++)
      nodeNames.push("");
    let topTerms = Object.keys(spec.topRules).map((r) => spec.topRules[r][1]);
    let nodeProps = [];
    for (let i = 0; i < nodeNames.length; i++)
      nodeProps.push([]);
    function setProp(nodeID, prop, value) {
      nodeProps[nodeID].push([prop, prop.deserialize(String(value))]);
    }
    if (spec.nodeProps)
      for (let propSpec of spec.nodeProps) {
        let prop = propSpec[0];
        if (typeof prop == "string")
          prop = NodeProp[prop];
        for (let i = 1; i < propSpec.length; ) {
          let next = propSpec[i++];
          if (next >= 0) {
            setProp(next, prop, propSpec[i++]);
          } else {
            let value = propSpec[i + -next];
            for (let j = -next; j > 0; j--)
              setProp(propSpec[i++], prop, value);
            i++;
          }
        }
      }
    this.nodeSet = new NodeSet(nodeNames.map((name2, i) => NodeType.define({
      name: i >= this.minRepeatTerm ? void 0 : name2,
      id: i,
      props: nodeProps[i],
      top: topTerms.indexOf(i) > -1,
      error: i == 0,
      skipped: spec.skippedNodes && spec.skippedNodes.indexOf(i) > -1
    })));
    if (spec.propSources)
      this.nodeSet = this.nodeSet.extend(...spec.propSources);
    this.strict = false;
    this.bufferLength = DefaultBufferLength;
    let tokenArray = decodeArray(spec.tokenData);
    this.context = spec.context;
    this.specializerSpecs = spec.specialized || [];
    this.specialized = new Uint16Array(this.specializerSpecs.length);
    for (let i = 0; i < this.specializerSpecs.length; i++)
      this.specialized[i] = this.specializerSpecs[i].term;
    this.specializers = this.specializerSpecs.map(getSpecializer);
    this.states = decodeArray(spec.states, Uint32Array);
    this.data = decodeArray(spec.stateData);
    this.goto = decodeArray(spec.goto);
    this.maxTerm = spec.maxTerm;
    this.tokenizers = spec.tokenizers.map((value) => typeof value == "number" ? new TokenGroup(tokenArray, value) : value);
    this.topRules = spec.topRules;
    this.dialects = spec.dialects || {};
    this.dynamicPrecedences = spec.dynamicPrecedences || null;
    this.tokenPrecTable = spec.tokenPrec;
    this.termNames = spec.termNames || null;
    this.maxNode = this.nodeSet.types.length - 1;
    this.dialect = this.parseDialect();
    this.top = this.topRules[Object.keys(this.topRules)[0]];
  }
  createParse(input, fragments, ranges) {
    let parse = new Parse(this, input, fragments, ranges);
    for (let w of this.wrappers)
      parse = w(parse, input, fragments, ranges);
    return parse;
  }
  getGoto(state, term, loose = false) {
    let table = this.goto;
    if (term >= table[0])
      return -1;
    for (let pos = table[term + 1]; ; ) {
      let groupTag = table[pos++], last = groupTag & 1;
      let target = table[pos++];
      if (last && loose)
        return target;
      for (let end = pos + (groupTag >> 1); pos < end; pos++)
        if (table[pos] == state)
          return target;
      if (last)
        return -1;
    }
  }
  hasAction(state, terminal) {
    let data2 = this.data;
    for (let set = 0; set < 2; set++) {
      for (let i = this.stateSlot(state, set ? 2 : 1), next; ; i += 3) {
        if ((next = data2[i]) == 65535) {
          if (data2[i + 1] == 1)
            next = data2[i = pair(data2, i + 2)];
          else if (data2[i + 1] == 2)
            return pair(data2, i + 2);
          else
            break;
        }
        if (next == terminal || next == 0)
          return pair(data2, i + 1);
      }
    }
    return 0;
  }
  stateSlot(state, slot) {
    return this.states[state * 6 + slot];
  }
  stateFlag(state, flag) {
    return (this.stateSlot(state, 0) & flag) > 0;
  }
  validAction(state, action) {
    return !!this.allActions(state, (a) => a == action ? true : null);
  }
  allActions(state, action) {
    let deflt = this.stateSlot(state, 4);
    let result = deflt ? action(deflt) : void 0;
    for (let i = this.stateSlot(state, 1); result == null; i += 3) {
      if (this.data[i] == 65535) {
        if (this.data[i + 1] == 1)
          i = pair(this.data, i + 2);
        else
          break;
      }
      result = action(pair(this.data, i + 1));
    }
    return result;
  }
  nextStates(state) {
    let result = [];
    for (let i = this.stateSlot(state, 1); ; i += 3) {
      if (this.data[i] == 65535) {
        if (this.data[i + 1] == 1)
          i = pair(this.data, i + 2);
        else
          break;
      }
      if ((this.data[i + 2] & 65536 >> 16) == 0) {
        let value = this.data[i + 1];
        if (!result.some((v, i2) => i2 & 1 && v == value))
          result.push(this.data[i], value);
      }
    }
    return result;
  }
  configure(config) {
    let copy = Object.assign(Object.create(LRParser.prototype), this);
    if (config.props)
      copy.nodeSet = this.nodeSet.extend(...config.props);
    if (config.top) {
      let info = this.topRules[config.top];
      if (!info)
        throw new RangeError(`Invalid top rule name ${config.top}`);
      copy.top = info;
    }
    if (config.tokenizers)
      copy.tokenizers = this.tokenizers.map((t2) => {
        let found = config.tokenizers.find((r) => r.from == t2);
        return found ? found.to : t2;
      });
    if (config.specializers) {
      copy.specializers = this.specializers.slice();
      copy.specializerSpecs = this.specializerSpecs.map((s, i) => {
        let found = config.specializers.find((r) => r.from == s.external);
        if (!found)
          return s;
        let spec = Object.assign(Object.assign({}, s), { external: found.to });
        copy.specializers[i] = getSpecializer(spec);
        return spec;
      });
    }
    if (config.contextTracker)
      copy.context = config.contextTracker;
    if (config.dialect)
      copy.dialect = this.parseDialect(config.dialect);
    if (config.strict != null)
      copy.strict = config.strict;
    if (config.wrap)
      copy.wrappers = copy.wrappers.concat(config.wrap);
    if (config.bufferLength != null)
      copy.bufferLength = config.bufferLength;
    return copy;
  }
  hasWrappers() {
    return this.wrappers.length > 0;
  }
  getName(term) {
    return this.termNames ? this.termNames[term] : String(term <= this.maxNode && this.nodeSet.types[term].name || term);
  }
  get eofTerm() {
    return this.maxNode + 1;
  }
  get topNode() {
    return this.nodeSet.types[this.top[1]];
  }
  dynamicPrecedence(term) {
    let prec2 = this.dynamicPrecedences;
    return prec2 == null ? 0 : prec2[term] || 0;
  }
  parseDialect(dialect) {
    let values2 = Object.keys(this.dialects), flags = values2.map(() => false);
    if (dialect)
      for (let part of dialect.split(" ")) {
        let id2 = values2.indexOf(part);
        if (id2 >= 0)
          flags[id2] = true;
      }
    let disabled = null;
    for (let i = 0; i < values2.length; i++)
      if (!flags[i]) {
        for (let j = this.dialects[values2[i]], id2; (id2 = this.data[j++]) != 65535; )
          (disabled || (disabled = new Uint8Array(this.maxTerm + 1)))[id2] = 1;
      }
    return new Dialect(dialect, flags, disabled);
  }
  static deserialize(spec) {
    return new LRParser(spec);
  }
};
function pair(data2, off) {
  return data2[off] | data2[off + 1] << 16;
}
function findFinished(stacks) {
  let best = null;
  for (let stack of stacks) {
    let stopped = stack.p.stoppedAt;
    if ((stack.pos == stack.p.stream.end || stopped != null && stack.pos > stopped) && stack.p.parser.stateFlag(stack.state, 2) && (!best || best.score < stack.score))
      best = stack;
  }
  return best;
}
function getSpecializer(spec) {
  if (spec.external) {
    let mask = spec.extend ? 1 : 0;
    return (value, stack) => spec.external(value, stack) << 1 | mask;
  }
  return spec.get;
}

// node_modules/@lezer/html/dist/index.js
var scriptText = 54;
var StartCloseScriptTag = 1;
var styleText = 55;
var StartCloseStyleTag = 2;
var textareaText = 56;
var StartCloseTextareaTag = 3;
var EndTag = 4;
var SelfClosingEndTag = 5;
var StartTag = 6;
var StartScriptTag = 7;
var StartStyleTag = 8;
var StartTextareaTag = 9;
var StartSelfClosingTag = 10;
var StartCloseTag = 11;
var NoMatchStartCloseTag = 12;
var MismatchedStartCloseTag = 13;
var missingCloseTag = 57;
var IncompleteCloseTag = 14;
var commentContent$1 = 58;
var Element = 20;
var TagName = 22;
var Attribute = 23;
var AttributeName = 24;
var AttributeValue = 26;
var UnquotedAttributeValue = 27;
var ScriptText = 28;
var StyleText = 31;
var TextareaText = 34;
var OpenTag = 36;
var CloseTag = 37;
var Dialect_noMatch = 0;
var Dialect_selfClosing = 1;
var selfClosers = {
  area: true,
  base: true,
  br: true,
  col: true,
  command: true,
  embed: true,
  frame: true,
  hr: true,
  img: true,
  input: true,
  keygen: true,
  link: true,
  meta: true,
  param: true,
  source: true,
  track: true,
  wbr: true,
  menuitem: true
};
var implicitlyClosed = {
  dd: true,
  li: true,
  optgroup: true,
  option: true,
  p: true,
  rp: true,
  rt: true,
  tbody: true,
  td: true,
  tfoot: true,
  th: true,
  tr: true
};
var closeOnOpen = {
  dd: { dd: true, dt: true },
  dt: { dd: true, dt: true },
  li: { li: true },
  option: { option: true, optgroup: true },
  optgroup: { optgroup: true },
  p: {
    address: true,
    article: true,
    aside: true,
    blockquote: true,
    dir: true,
    div: true,
    dl: true,
    fieldset: true,
    footer: true,
    form: true,
    h1: true,
    h2: true,
    h3: true,
    h4: true,
    h5: true,
    h6: true,
    header: true,
    hgroup: true,
    hr: true,
    menu: true,
    nav: true,
    ol: true,
    p: true,
    pre: true,
    section: true,
    table: true,
    ul: true
  },
  rp: { rp: true, rt: true },
  rt: { rp: true, rt: true },
  tbody: { tbody: true, tfoot: true },
  td: { td: true, th: true },
  tfoot: { tbody: true },
  th: { td: true, th: true },
  thead: { tbody: true, tfoot: true },
  tr: { tr: true }
};
function nameChar(ch) {
  return ch == 45 || ch == 46 || ch == 58 || ch >= 65 && ch <= 90 || ch == 95 || ch >= 97 && ch <= 122 || ch >= 161;
}
function isSpace(ch) {
  return ch == 9 || ch == 10 || ch == 13 || ch == 32;
}
var cachedName = null;
var cachedInput = null;
var cachedPos = 0;
function tagNameAfter(input, offset) {
  let pos = input.pos + offset;
  if (cachedPos == pos && cachedInput == input)
    return cachedName;
  let next = input.peek(offset);
  while (isSpace(next))
    next = input.peek(++offset);
  let name2 = "";
  for (; ; ) {
    if (!nameChar(next))
      break;
    name2 += String.fromCharCode(next);
    next = input.peek(++offset);
  }
  cachedInput = input;
  cachedPos = pos;
  return cachedName = name2 ? name2.toLowerCase() : next == question || next == bang ? void 0 : null;
}
var lessThan = 60;
var greaterThan = 62;
var slash = 47;
var question = 63;
var bang = 33;
var dash = 45;
function ElementContext(name2, parent) {
  this.name = name2;
  this.parent = parent;
  this.hash = parent ? parent.hash : 0;
  for (let i = 0; i < name2.length; i++)
    this.hash += (this.hash << 4) + name2.charCodeAt(i) + (name2.charCodeAt(i) << 8);
}
var startTagTerms = [StartTag, StartSelfClosingTag, StartScriptTag, StartStyleTag, StartTextareaTag];
var elementContext = new ContextTracker({
  start: null,
  shift(context, term, stack, input) {
    return startTagTerms.indexOf(term) > -1 ? new ElementContext(tagNameAfter(input, 1) || "", context) : context;
  },
  reduce(context, term) {
    return term == Element && context ? context.parent : context;
  },
  reuse(context, node, stack, input) {
    let type = node.type.id;
    return type == StartTag || type == OpenTag ? new ElementContext(tagNameAfter(input, 1) || "", context) : context;
  },
  hash(context) {
    return context ? context.hash : 0;
  },
  strict: false
});
var tagStart = new ExternalTokenizer((input, stack) => {
  if (input.next != lessThan) {
    if (input.next < 0 && stack.context)
      input.acceptToken(missingCloseTag);
    return;
  }
  input.advance();
  let close = input.next == slash;
  if (close)
    input.advance();
  let name2 = tagNameAfter(input, 0);
  if (name2 === void 0)
    return;
  if (!name2)
    return input.acceptToken(close ? IncompleteCloseTag : StartTag);
  let parent = stack.context ? stack.context.name : null;
  if (close) {
    if (name2 == parent)
      return input.acceptToken(StartCloseTag);
    if (parent && implicitlyClosed[parent])
      return input.acceptToken(missingCloseTag, -2);
    if (stack.dialectEnabled(Dialect_noMatch))
      return input.acceptToken(NoMatchStartCloseTag);
    for (let cx = stack.context; cx; cx = cx.parent)
      if (cx.name == name2)
        return;
    input.acceptToken(MismatchedStartCloseTag);
  } else {
    if (name2 == "script")
      return input.acceptToken(StartScriptTag);
    if (name2 == "style")
      return input.acceptToken(StartStyleTag);
    if (name2 == "textarea")
      return input.acceptToken(StartTextareaTag);
    if (selfClosers.hasOwnProperty(name2))
      return input.acceptToken(StartSelfClosingTag);
    if (parent && closeOnOpen[parent] && closeOnOpen[parent][name2])
      input.acceptToken(missingCloseTag, -1);
    else
      input.acceptToken(StartTag);
  }
}, { contextual: true });
var commentContent = new ExternalTokenizer((input) => {
  for (let dashes = 0, i = 0; ; i++) {
    if (input.next < 0) {
      if (i)
        input.acceptToken(commentContent$1);
      break;
    }
    if (input.next == dash) {
      dashes++;
    } else if (input.next == greaterThan && dashes >= 2) {
      if (i >= 3)
        input.acceptToken(commentContent$1, -2);
      break;
    } else {
      dashes = 0;
    }
    input.advance();
  }
});
function inForeignElement(context) {
  for (; context; context = context.parent)
    if (context.name == "svg" || context.name == "math")
      return true;
  return false;
}
var endTag = new ExternalTokenizer((input, stack) => {
  if (input.next == slash && input.peek(1) == greaterThan) {
    let selfClosing = stack.dialectEnabled(Dialect_selfClosing) || inForeignElement(stack.context);
    input.acceptToken(selfClosing ? SelfClosingEndTag : EndTag, 2);
  } else if (input.next == greaterThan) {
    input.acceptToken(EndTag, 1);
  }
});
function contentTokenizer(tag, textToken, endToken) {
  let lastState = 2 + tag.length;
  return new ExternalTokenizer((input) => {
    for (let state = 0, matchedLen = 0, i = 0; ; i++) {
      if (input.next < 0) {
        if (i)
          input.acceptToken(textToken);
        break;
      }
      if (state == 0 && input.next == lessThan || state == 1 && input.next == slash || state >= 2 && state < lastState && input.next == tag.charCodeAt(state - 2)) {
        state++;
        matchedLen++;
      } else if ((state == 2 || state == lastState) && isSpace(input.next)) {
        matchedLen++;
      } else if (state == lastState && input.next == greaterThan) {
        if (i > matchedLen)
          input.acceptToken(textToken, -matchedLen);
        else
          input.acceptToken(endToken, -(matchedLen - 2));
        break;
      } else if ((input.next == 10 || input.next == 13) && i) {
        input.acceptToken(textToken, 1);
        break;
      } else {
        state = matchedLen = 0;
      }
      input.advance();
    }
  });
}
var scriptTokens = contentTokenizer("script", scriptText, StartCloseScriptTag);
var styleTokens = contentTokenizer("style", styleText, StartCloseStyleTag);
var textareaTokens = contentTokenizer("textarea", textareaText, StartCloseTextareaTag);
var htmlHighlighting = styleTags({
  "Text RawText": tags.content,
  "StartTag StartCloseTag SelfClosingEndTag EndTag": tags.angleBracket,
  TagName: tags.tagName,
  "MismatchedCloseTag/TagName": [tags.tagName, tags.invalid],
  AttributeName: tags.attributeName,
  "AttributeValue UnquotedAttributeValue": tags.attributeValue,
  Is: tags.definitionOperator,
  "EntityReference CharacterReference": tags.character,
  Comment: tags.blockComment,
  ProcessingInst: tags.processingInstruction,
  DoctypeDecl: tags.documentMeta
});
var parser = LRParser.deserialize({
  version: 14,
  states: ",xOVO!rOOO!WQ#tO'#CqO!]Q#tO'#CzO!bQ#tO'#C}O!gQ#tO'#DQO!lQ#tO'#DSO!qOaO'#CpO!|ObO'#CpO#XOdO'#CpO$eO!rO'#CpOOO`'#Cp'#CpO$lO$fO'#DTO$tQ#tO'#DVO$yQ#tO'#DWOOO`'#Dk'#DkOOO`'#DY'#DYQVO!rOOO%OQ&rO,59]O%ZQ&rO,59fO%fQ&rO,59iO%qQ&rO,59lO%|Q&rO,59nOOOa'#D^'#D^O&XOaO'#CxO&dOaO,59[OOOb'#D_'#D_O&lObO'#C{O&wObO,59[OOOd'#D`'#D`O'POdO'#DOO'[OdO,59[OOO`'#Da'#DaO'dO!rO,59[O'kQ#tO'#DROOO`,59[,59[OOOp'#Db'#DbO'pO$fO,59oOOO`,59o,59oO'xQ#|O,59qO'}Q#|O,59rOOO`-E7W-E7WO(SQ&rO'#CsOOQW'#DZ'#DZO(bQ&rO1G.wOOOa1G.w1G.wOOO`1G/Y1G/YO(mQ&rO1G/QOOOb1G/Q1G/QO(xQ&rO1G/TOOOd1G/T1G/TO)TQ&rO1G/WOOO`1G/W1G/WO)`Q&rO1G/YOOOa-E7[-E7[O)kQ#tO'#CyOOO`1G.v1G.vOOOb-E7]-E7]O)pQ#tO'#C|OOOd-E7^-E7^O)uQ#tO'#DPOOO`-E7_-E7_O)zQ#|O,59mOOOp-E7`-E7`OOO`1G/Z1G/ZOOO`1G/]1G/]OOO`1G/^1G/^O*PQ,UO,59_OOQW-E7X-E7XOOOa7+$c7+$cOOO`7+$t7+$tOOOb7+$l7+$lOOOd7+$o7+$oOOO`7+$r7+$rO*[Q#|O,59eO*aQ#|O,59hO*fQ#|O,59kOOO`1G/X1G/XO*kO7[O'#CvO*|OMhO'#CvOOQW1G.y1G.yOOO`1G/P1G/POOO`1G/S1G/SOOO`1G/V1G/VOOOO'#D['#D[O+_O7[O,59bOOQW,59b,59bOOOO'#D]'#D]O+pOMhO,59bOOOO-E7Y-E7YOOQW1G.|1G.|OOOO-E7Z-E7Z",
  stateData: ",]~O!^OS~OUSOVPOWQOXROYTO[]O][O^^O`^Oa^Ob^Oc^Ox^O{_O!dZO~OfaO~OfbO~OfcO~OfdO~OfeO~O!WfOPlP!ZlP~O!XiOQoP!ZoP~O!YlORrP!ZrP~OUSOVPOWQOXROYTOZqO[]O][O^^O`^Oa^Ob^Oc^Ox^O!dZO~O!ZrO~P#dO![sO!euO~OfvO~OfwO~OS|OT}OhyO~OS!POT}OhyO~OS!ROT}OhyO~OS!TOT}OhyO~OS}OT}OhyO~O!WfOPlX!ZlX~OP!WO!Z!XO~O!XiOQoX!ZoX~OQ!ZO!Z!XO~O!YlORrX!ZrX~OR!]O!Z!XO~O!Z!XO~P#dOf!_O~O![sO!e!aO~OS!bO~OS!cO~Oi!dOSgXTgXhgX~OS!fOT!gOhyO~OS!hOT!gOhyO~OS!iOT!gOhyO~OS!jOT!gOhyO~OS!gOT!gOhyO~Of!kO~Of!lO~Of!mO~OS!nO~Ok!qO!`!oO!b!pO~OS!rO~OS!sO~OS!tO~Oa!uOb!uOc!uO!`!wO!a!uO~Oa!xOb!xOc!xO!b!wO!c!xO~Oa!uOb!uOc!uO!`!{O!a!uO~Oa!xOb!xOc!xO!b!{O!c!xO~OT~bac!dx{!d~",
  goto: "%p!`PPPPPPPPPPPPPPPPPPPP!a!gP!mPP!yP!|#P#S#Y#]#`#f#i#l#r#x!aP!a!aP$O$U$l$r$x%O%U%[%bPPPPPPPP%hX^OX`pXUOX`pezabcde{!O!Q!S!UR!q!dRhUR!XhXVOX`pRkVR!XkXWOX`pRnWR!XnXXOX`pQrXR!XpXYOX`pQ`ORx`Q{aQ!ObQ!QcQ!SdQ!UeZ!e{!O!Q!S!UQ!v!oR!z!vQ!y!pR!|!yQgUR!VgQjVR!YjQmWR![mQpXR!^pQtZR!`tS_O`ToXp",
  nodeNames: "\u26A0 StartCloseTag StartCloseTag StartCloseTag EndTag SelfClosingEndTag StartTag StartTag StartTag StartTag StartTag StartCloseTag StartCloseTag StartCloseTag IncompleteCloseTag Document Text EntityReference CharacterReference InvalidEntity Element OpenTag TagName Attribute AttributeName Is AttributeValue UnquotedAttributeValue ScriptText CloseTag OpenTag StyleText CloseTag OpenTag TextareaText CloseTag OpenTag CloseTag SelfClosingTag Comment ProcessingInst MismatchedCloseTag CloseTag DoctypeDecl",
  maxTerm: 67,
  context: elementContext,
  nodeProps: [
    ["closedBy", -10, 1, 2, 3, 7, 8, 9, 10, 11, 12, 13, "EndTag", 6, "EndTag SelfClosingEndTag", -4, 21, 30, 33, 36, "CloseTag"],
    ["openedBy", 4, "StartTag StartCloseTag", 5, "StartTag", -4, 29, 32, 35, 37, "OpenTag"],
    ["group", -9, 14, 17, 18, 19, 20, 39, 40, 41, 42, "Entity", 16, "Entity TextContent", -3, 28, 31, 34, "TextContent Entity"],
    ["isolate", -11, 21, 29, 30, 32, 33, 35, 36, 37, 38, 41, 42, "ltr", -3, 26, 27, 39, ""]
  ],
  propSources: [htmlHighlighting],
  skippedNodes: [0],
  repeatNodeCount: 9,
  tokenData: "!<p!aR!YOX$qXY,QYZ,QZ[$q[]&X]^,Q^p$qpq,Qqr-_rs3_sv-_vw3}wxHYx}-_}!OH{!O!P-_!P!Q$q!Q![-_![!]Mz!]!^-_!^!_!$S!_!`!;x!`!a&X!a!c-_!c!}Mz!}#R-_#R#SMz#S#T1k#T#oMz#o#s-_#s$f$q$f%W-_%W%oMz%o%p-_%p&aMz&a&b-_&b1pMz1p4U-_4U4dMz4d4e-_4e$ISMz$IS$I`-_$I`$IbMz$Ib$Kh-_$Kh%#tMz%#t&/x-_&/x&EtMz&Et&FV-_&FV;'SMz;'S;:j!#|;:j;=`3X<%l?&r-_?&r?AhMz?Ah?BY$q?BY?MnMz?MnO$q!Z$|c`PkW!a`!cpOX$qXZ&XZ[$q[^&X^p$qpq&Xqr$qrs&}sv$qvw+Pwx(tx!^$q!^!_*V!_!a&X!a#S$q#S#T&X#T;'S$q;'S;=`+z<%lO$q!R&bX`P!a`!cpOr&Xrs&}sv&Xwx(tx!^&X!^!_*V!_;'S&X;'S;=`*y<%lO&Xq'UV`P!cpOv&}wx'kx!^&}!^!_(V!_;'S&};'S;=`(n<%lO&}P'pT`POv'kw!^'k!_;'S'k;'S;=`(P<%lO'kP(SP;=`<%l'kp([S!cpOv(Vx;'S(V;'S;=`(h<%lO(Vp(kP;=`<%l(Vq(qP;=`<%l&}a({W`P!a`Or(trs'ksv(tw!^(t!^!_)e!_;'S(t;'S;=`*P<%lO(t`)jT!a`Or)esv)ew;'S)e;'S;=`)y<%lO)e`)|P;=`<%l)ea*SP;=`<%l(t!Q*^V!a`!cpOr*Vrs(Vsv*Vwx)ex;'S*V;'S;=`*s<%lO*V!Q*vP;=`<%l*V!R*|P;=`<%l&XW+UYkWOX+PZ[+P^p+Pqr+Psw+Px!^+P!a#S+P#T;'S+P;'S;=`+t<%lO+PW+wP;=`<%l+P!Z+}P;=`<%l$q!a,]``P!a`!cp!^^OX&XXY,QYZ,QZ]&X]^,Q^p&Xpq,Qqr&Xrs&}sv&Xwx(tx!^&X!^!_*V!_;'S&X;'S;=`*y<%lO&X!_-ljhS`PkW!a`!cpOX$qXZ&XZ[$q[^&X^p$qpq&Xqr-_rs&}sv-_vw/^wx(tx!P-_!P!Q$q!Q!^-_!^!_*V!_!a&X!a#S-_#S#T1k#T#s-_#s$f$q$f;'S-_;'S;=`3X<%l?Ah-_?Ah?BY$q?BY?Mn-_?MnO$q[/ebhSkWOX+PZ[+P^p+Pqr/^sw/^x!P/^!P!Q+P!Q!^/^!a#S/^#S#T0m#T#s/^#s$f+P$f;'S/^;'S;=`1e<%l?Ah/^?Ah?BY+P?BY?Mn/^?MnO+PS0rXhSqr0msw0mx!P0m!Q!^0m!a#s0m$f;'S0m;'S;=`1_<%l?Ah0m?BY?Mn0mS1bP;=`<%l0m[1hP;=`<%l/^!V1vchS`P!a`!cpOq&Xqr1krs&}sv1kvw0mwx(tx!P1k!P!Q&X!Q!^1k!^!_*V!_!a&X!a#s1k#s$f&X$f;'S1k;'S;=`3R<%l?Ah1k?Ah?BY&X?BY?Mn1k?MnO&X!V3UP;=`<%l1k!_3[P;=`<%l-_!Z3hV!`h`P!cpOv&}wx'kx!^&}!^!_(V!_;'S&};'S;=`(n<%lO&}!_4WihSkWc!ROX5uXZ7SZ[5u[^7S^p5uqr8trs7Sst>]tw8twx7Sx!P8t!P!Q5u!Q!]8t!]!^/^!^!a7S!a#S8t#S#T;{#T#s8t#s$f5u$f;'S8t;'S;=`>V<%l?Ah8t?Ah?BY5u?BY?Mn8t?MnO5u!Z5zbkWOX5uXZ7SZ[5u[^7S^p5uqr5urs7Sst+Ptw5uwx7Sx!]5u!]!^7w!^!a7S!a#S5u#S#T7S#T;'S5u;'S;=`8n<%lO5u!R7VVOp7Sqs7St!]7S!]!^7l!^;'S7S;'S;=`7q<%lO7S!R7qOa!R!R7tP;=`<%l7S!Z8OYkWa!ROX+PZ[+P^p+Pqr+Psw+Px!^+P!a#S+P#T;'S+P;'S;=`+t<%lO+P!Z8qP;=`<%l5u!_8{ihSkWOX5uXZ7SZ[5u[^7S^p5uqr8trs7Sst/^tw8twx7Sx!P8t!P!Q5u!Q!]8t!]!^:j!^!a7S!a#S8t#S#T;{#T#s8t#s$f5u$f;'S8t;'S;=`>V<%l?Ah8t?Ah?BY5u?BY?Mn8t?MnO5u!_:sbhSkWa!ROX+PZ[+P^p+Pqr/^sw/^x!P/^!P!Q+P!Q!^/^!a#S/^#S#T0m#T#s/^#s$f+P$f;'S/^;'S;=`1e<%l?Ah/^?Ah?BY+P?BY?Mn/^?MnO+P!V<QchSOp7Sqr;{rs7Sst0mtw;{wx7Sx!P;{!P!Q7S!Q!];{!]!^=]!^!a7S!a#s;{#s$f7S$f;'S;{;'S;=`>P<%l?Ah;{?Ah?BY7S?BY?Mn;{?MnO7S!V=dXhSa!Rqr0msw0mx!P0m!Q!^0m!a#s0m$f;'S0m;'S;=`1_<%l?Ah0m?BY?Mn0m!V>SP;=`<%l;{!_>YP;=`<%l8t!_>dhhSkWOX@OXZAYZ[@O[^AY^p@OqrBwrsAYswBwwxAYx!PBw!P!Q@O!Q!]Bw!]!^/^!^!aAY!a#SBw#S#TE{#T#sBw#s$f@O$f;'SBw;'S;=`HS<%l?AhBw?Ah?BY@O?BY?MnBw?MnO@O!Z@TakWOX@OXZAYZ[@O[^AY^p@Oqr@OrsAYsw@OwxAYx!]@O!]!^Az!^!aAY!a#S@O#S#TAY#T;'S@O;'S;=`Bq<%lO@O!RA]UOpAYq!]AY!]!^Ao!^;'SAY;'S;=`At<%lOAY!RAtOb!R!RAwP;=`<%lAY!ZBRYkWb!ROX+PZ[+P^p+Pqr+Psw+Px!^+P!a#S+P#T;'S+P;'S;=`+t<%lO+P!ZBtP;=`<%l@O!_COhhSkWOX@OXZAYZ[@O[^AY^p@OqrBwrsAYswBwwxAYx!PBw!P!Q@O!Q!]Bw!]!^Dj!^!aAY!a#SBw#S#TE{#T#sBw#s$f@O$f;'SBw;'S;=`HS<%l?AhBw?Ah?BY@O?BY?MnBw?MnO@O!_DsbhSkWb!ROX+PZ[+P^p+Pqr/^sw/^x!P/^!P!Q+P!Q!^/^!a#S/^#S#T0m#T#s/^#s$f+P$f;'S/^;'S;=`1e<%l?Ah/^?Ah?BY+P?BY?Mn/^?MnO+P!VFQbhSOpAYqrE{rsAYswE{wxAYx!PE{!P!QAY!Q!]E{!]!^GY!^!aAY!a#sE{#s$fAY$f;'SE{;'S;=`G|<%l?AhE{?Ah?BYAY?BY?MnE{?MnOAY!VGaXhSb!Rqr0msw0mx!P0m!Q!^0m!a#s0m$f;'S0m;'S;=`1_<%l?Ah0m?BY?Mn0m!VHPP;=`<%lE{!_HVP;=`<%lBw!ZHcW!bx`P!a`Or(trs'ksv(tw!^(t!^!_)e!_;'S(t;'S;=`*P<%lO(t!aIYlhS`PkW!a`!cpOX$qXZ&XZ[$q[^&X^p$qpq&Xqr-_rs&}sv-_vw/^wx(tx}-_}!OKQ!O!P-_!P!Q$q!Q!^-_!^!_*V!_!a&X!a#S-_#S#T1k#T#s-_#s$f$q$f;'S-_;'S;=`3X<%l?Ah-_?Ah?BY$q?BY?Mn-_?MnO$q!aK_khS`PkW!a`!cpOX$qXZ&XZ[$q[^&X^p$qpq&Xqr-_rs&}sv-_vw/^wx(tx!P-_!P!Q$q!Q!^-_!^!_*V!_!`&X!`!aMS!a#S-_#S#T1k#T#s-_#s$f$q$f;'S-_;'S;=`3X<%l?Ah-_?Ah?BY$q?BY?Mn-_?MnO$q!TM_X`P!a`!cp!eQOr&Xrs&}sv&Xwx(tx!^&X!^!_*V!_;'S&X;'S;=`*y<%lO&X!aNZ!ZhSfQ`PkW!a`!cpOX$qXZ&XZ[$q[^&X^p$qpq&Xqr-_rs&}sv-_vw/^wx(tx}-_}!OMz!O!PMz!P!Q$q!Q![Mz![!]Mz!]!^-_!^!_*V!_!a&X!a!c-_!c!}Mz!}#R-_#R#SMz#S#T1k#T#oMz#o#s-_#s$f$q$f$}-_$}%OMz%O%W-_%W%oMz%o%p-_%p&aMz&a&b-_&b1pMz1p4UMz4U4dMz4d4e-_4e$ISMz$IS$I`-_$I`$IbMz$Ib$Je-_$Je$JgMz$Jg$Kh-_$Kh%#tMz%#t&/x-_&/x&EtMz&Et&FV-_&FV;'SMz;'S;:j!#|;:j;=`3X<%l?&r-_?&r?AhMz?Ah?BY$q?BY?MnMz?MnO$q!a!$PP;=`<%lMz!R!$ZY!a`!cpOq*Vqr!$yrs(Vsv*Vwx)ex!a*V!a!b!4t!b;'S*V;'S;=`*s<%lO*V!R!%Q]!a`!cpOr*Vrs(Vsv*Vwx)ex}*V}!O!%y!O!f*V!f!g!']!g#W*V#W#X!0`#X;'S*V;'S;=`*s<%lO*V!R!&QX!a`!cpOr*Vrs(Vsv*Vwx)ex}*V}!O!&m!O;'S*V;'S;=`*s<%lO*V!R!&vV!a`!cp!dPOr*Vrs(Vsv*Vwx)ex;'S*V;'S;=`*s<%lO*V!R!'dX!a`!cpOr*Vrs(Vsv*Vwx)ex!q*V!q!r!(P!r;'S*V;'S;=`*s<%lO*V!R!(WX!a`!cpOr*Vrs(Vsv*Vwx)ex!e*V!e!f!(s!f;'S*V;'S;=`*s<%lO*V!R!(zX!a`!cpOr*Vrs(Vsv*Vwx)ex!v*V!v!w!)g!w;'S*V;'S;=`*s<%lO*V!R!)nX!a`!cpOr*Vrs(Vsv*Vwx)ex!{*V!{!|!*Z!|;'S*V;'S;=`*s<%lO*V!R!*bX!a`!cpOr*Vrs(Vsv*Vwx)ex!r*V!r!s!*}!s;'S*V;'S;=`*s<%lO*V!R!+UX!a`!cpOr*Vrs(Vsv*Vwx)ex!g*V!g!h!+q!h;'S*V;'S;=`*s<%lO*V!R!+xY!a`!cpOr!+qrs!,hsv!+qvw!-Swx!.[x!`!+q!`!a!/j!a;'S!+q;'S;=`!0Y<%lO!+qq!,mV!cpOv!,hvx!-Sx!`!,h!`!a!-q!a;'S!,h;'S;=`!.U<%lO!,hP!-VTO!`!-S!`!a!-f!a;'S!-S;'S;=`!-k<%lO!-SP!-kO{PP!-nP;=`<%l!-Sq!-xS!cp{POv(Vx;'S(V;'S;=`(h<%lO(Vq!.XP;=`<%l!,ha!.aX!a`Or!.[rs!-Ssv!.[vw!-Sw!`!.[!`!a!.|!a;'S!.[;'S;=`!/d<%lO!.[a!/TT!a`{POr)esv)ew;'S)e;'S;=`)y<%lO)ea!/gP;=`<%l!.[!R!/sV!a`!cp{POr*Vrs(Vsv*Vwx)ex;'S*V;'S;=`*s<%lO*V!R!0]P;=`<%l!+q!R!0gX!a`!cpOr*Vrs(Vsv*Vwx)ex#c*V#c#d!1S#d;'S*V;'S;=`*s<%lO*V!R!1ZX!a`!cpOr*Vrs(Vsv*Vwx)ex#V*V#V#W!1v#W;'S*V;'S;=`*s<%lO*V!R!1}X!a`!cpOr*Vrs(Vsv*Vwx)ex#h*V#h#i!2j#i;'S*V;'S;=`*s<%lO*V!R!2qX!a`!cpOr*Vrs(Vsv*Vwx)ex#m*V#m#n!3^#n;'S*V;'S;=`*s<%lO*V!R!3eX!a`!cpOr*Vrs(Vsv*Vwx)ex#d*V#d#e!4Q#e;'S*V;'S;=`*s<%lO*V!R!4XX!a`!cpOr*Vrs(Vsv*Vwx)ex#X*V#X#Y!+q#Y;'S*V;'S;=`*s<%lO*V!R!4{Y!a`!cpOr!4trs!5ksv!4tvw!6Vwx!8]x!a!4t!a!b!:]!b;'S!4t;'S;=`!;r<%lO!4tq!5pV!cpOv!5kvx!6Vx!a!5k!a!b!7W!b;'S!5k;'S;=`!8V<%lO!5kP!6YTO!a!6V!a!b!6i!b;'S!6V;'S;=`!7Q<%lO!6VP!6lTO!`!6V!`!a!6{!a;'S!6V;'S;=`!7Q<%lO!6VP!7QOxPP!7TP;=`<%l!6Vq!7]V!cpOv!5kvx!6Vx!`!5k!`!a!7r!a;'S!5k;'S;=`!8V<%lO!5kq!7yS!cpxPOv(Vx;'S(V;'S;=`(h<%lO(Vq!8YP;=`<%l!5ka!8bX!a`Or!8]rs!6Vsv!8]vw!6Vw!a!8]!a!b!8}!b;'S!8];'S;=`!:V<%lO!8]a!9SX!a`Or!8]rs!6Vsv!8]vw!6Vw!`!8]!`!a!9o!a;'S!8];'S;=`!:V<%lO!8]a!9vT!a`xPOr)esv)ew;'S)e;'S;=`)y<%lO)ea!:YP;=`<%l!8]!R!:dY!a`!cpOr!4trs!5ksv!4tvw!6Vwx!8]x!`!4t!`!a!;S!a;'S!4t;'S;=`!;r<%lO!4t!R!;]V!a`!cpxPOr*Vrs(Vsv*Vwx)ex;'S*V;'S;=`*s<%lO*V!R!;uP;=`<%l!4t!V!<TXiS`P!a`!cpOr&Xrs&}sv&Xwx(tx!^&X!^!_*V!_;'S&X;'S;=`*y<%lO&X",
  tokenizers: [scriptTokens, styleTokens, textareaTokens, endTag, tagStart, commentContent, 0, 1, 2, 3, 4, 5],
  topRules: { "Document": [0, 15] },
  dialects: { noMatch: 0, selfClosing: 509 },
  tokenPrec: 511
});
function getAttrs2(openTag, input) {
  let attrs = Object.create(null);
  for (let att of openTag.getChildren(Attribute)) {
    let name2 = att.getChild(AttributeName), value = att.getChild(AttributeValue) || att.getChild(UnquotedAttributeValue);
    if (name2)
      attrs[input.read(name2.from, name2.to)] = !value ? "" : value.type.id == AttributeValue ? input.read(value.from + 1, value.to - 1) : input.read(value.from, value.to);
  }
  return attrs;
}
function findTagName(openTag, input) {
  let tagNameNode = openTag.getChild(TagName);
  return tagNameNode ? input.read(tagNameNode.from, tagNameNode.to) : " ";
}
function maybeNest(node, input, tags3) {
  let attrs;
  for (let tag of tags3) {
    if (!tag.attrs || tag.attrs(attrs || (attrs = getAttrs2(node.node.parent.firstChild, input))))
      return { parser: tag.parser };
  }
  return null;
}
function configureNesting(tags3 = [], attributes = []) {
  let script = [], style = [], textarea = [], other = [];
  for (let tag of tags3) {
    let array = tag.tag == "script" ? script : tag.tag == "style" ? style : tag.tag == "textarea" ? textarea : other;
    array.push(tag);
  }
  let attrs = attributes.length ? Object.create(null) : null;
  for (let attr of attributes)
    (attrs[attr.name] || (attrs[attr.name] = [])).push(attr);
  return parseMixed((node, input) => {
    let id2 = node.type.id;
    if (id2 == ScriptText)
      return maybeNest(node, input, script);
    if (id2 == StyleText)
      return maybeNest(node, input, style);
    if (id2 == TextareaText)
      return maybeNest(node, input, textarea);
    if (id2 == Element && other.length) {
      let n = node.node, open = n.firstChild, tagName = open && findTagName(open, input), attrs2;
      if (tagName)
        for (let tag of other) {
          if (tag.tag == tagName && (!tag.attrs || tag.attrs(attrs2 || (attrs2 = getAttrs2(n, input))))) {
            let close = n.lastChild;
            let to = close.type.id == CloseTag ? close.from : n.to;
            if (to > open.to)
              return { parser: tag.parser, overlay: [{ from: open.to, to }] };
          }
        }
    }
    if (attrs && id2 == Attribute) {
      let n = node.node, nameNode;
      if (nameNode = n.firstChild) {
        let matches = attrs[input.read(nameNode.from, nameNode.to)];
        if (matches)
          for (let attr of matches) {
            if (attr.tagName && attr.tagName != findTagName(n.parent, input))
              continue;
            let value = n.lastChild;
            if (value.type.id == AttributeValue) {
              let from = value.from + 1;
              let last = value.lastChild, to = value.to - (last && last.isError ? 0 : 1);
              if (to > from)
                return { parser: attr.parser, overlay: [{ from, to }] };
            } else if (value.type.id == UnquotedAttributeValue) {
              return { parser: attr.parser, overlay: [{ from: value.from, to: value.to }] };
            }
          }
      }
    }
    return null;
  });
}

// node_modules/@lezer/css/dist/index.js
var descendantOp = 99;
var Unit = 1;
var callee = 100;
var identifier = 101;
var VariableName = 2;
var space = [
  9,
  10,
  11,
  12,
  13,
  32,
  133,
  160,
  5760,
  8192,
  8193,
  8194,
  8195,
  8196,
  8197,
  8198,
  8199,
  8200,
  8201,
  8202,
  8232,
  8233,
  8239,
  8287,
  12288
];
var colon = 58;
var parenL = 40;
var underscore = 95;
var bracketL = 91;
var dash2 = 45;
var period = 46;
var hash = 35;
var percent = 37;
var ampersand = 38;
var backslash = 92;
var newline = 10;
function isAlpha(ch) {
  return ch >= 65 && ch <= 90 || ch >= 97 && ch <= 122 || ch >= 161;
}
function isDigit(ch) {
  return ch >= 48 && ch <= 57;
}
var identifiers = new ExternalTokenizer((input, stack) => {
  for (let inside2 = false, dashes = 0, i = 0; ; i++) {
    let { next } = input;
    if (isAlpha(next) || next == dash2 || next == underscore || inside2 && isDigit(next)) {
      if (!inside2 && (next != dash2 || i > 0))
        inside2 = true;
      if (dashes === i && next == dash2)
        dashes++;
      input.advance();
    } else if (next == backslash && input.peek(1) != newline) {
      input.advance();
      if (input.next > -1)
        input.advance();
      inside2 = true;
    } else {
      if (inside2)
        input.acceptToken(next == parenL ? callee : dashes == 2 && stack.canShift(VariableName) ? VariableName : identifier);
      break;
    }
  }
});
var descendant = new ExternalTokenizer((input) => {
  if (space.includes(input.peek(-1))) {
    let { next } = input;
    if (isAlpha(next) || next == underscore || next == hash || next == period || next == bracketL || next == colon && isAlpha(input.peek(1)) || next == dash2 || next == ampersand)
      input.acceptToken(descendantOp);
  }
});
var unitToken = new ExternalTokenizer((input) => {
  if (!space.includes(input.peek(-1))) {
    let { next } = input;
    if (next == percent) {
      input.advance();
      input.acceptToken(Unit);
    }
    if (isAlpha(next)) {
      do {
        input.advance();
      } while (isAlpha(input.next) || isDigit(input.next));
      input.acceptToken(Unit);
    }
  }
});
var cssHighlighting = styleTags({
  "AtKeyword import charset namespace keyframes media supports": tags.definitionKeyword,
  "from to selector": tags.keyword,
  NamespaceName: tags.namespace,
  KeyframeName: tags.labelName,
  KeyframeRangeName: tags.operatorKeyword,
  TagName: tags.tagName,
  ClassName: tags.className,
  PseudoClassName: tags.constant(tags.className),
  IdName: tags.labelName,
  "FeatureName PropertyName": tags.propertyName,
  AttributeName: tags.attributeName,
  NumberLiteral: tags.number,
  KeywordQuery: tags.keyword,
  UnaryQueryOp: tags.operatorKeyword,
  "CallTag ValueName": tags.atom,
  VariableName: tags.variableName,
  Callee: tags.operatorKeyword,
  Unit: tags.unit,
  "UniversalSelector NestingSelector": tags.definitionOperator,
  MatchOp: tags.compareOperator,
  "ChildOp SiblingOp, LogicOp": tags.logicOperator,
  BinOp: tags.arithmeticOperator,
  Important: tags.modifier,
  Comment: tags.blockComment,
  ColorLiteral: tags.color,
  "ParenthesizedContent StringLiteral": tags.string,
  ":": tags.punctuation,
  "PseudoOp #": tags.derefOperator,
  "; ,": tags.separator,
  "( )": tags.paren,
  "[ ]": tags.squareBracket,
  "{ }": tags.brace
});
var spec_callee = { __proto__: null, lang: 32, "nth-child": 32, "nth-last-child": 32, "nth-of-type": 32, "nth-last-of-type": 32, dir: 32, "host-context": 32, url: 60, "url-prefix": 60, domain: 60, regexp: 60, selector: 138 };
var spec_AtKeyword = { __proto__: null, "@import": 118, "@media": 142, "@charset": 146, "@namespace": 150, "@keyframes": 156, "@supports": 168 };
var spec_identifier = { __proto__: null, not: 132, only: 132 };
var parser2 = LRParser.deserialize({
  version: 14,
  states: ":^QYQ[OOO#_Q[OOP#fOWOOOOQP'#Cd'#CdOOQP'#Cc'#CcO#kQ[O'#CfO$_QXO'#CaO$fQ[O'#ChO$qQ[O'#DTO$vQ[O'#DWOOQP'#Em'#EmO${QdO'#DgO%jQ[O'#DtO${QdO'#DvO%{Q[O'#DxO&WQ[O'#D{O&`Q[O'#ERO&nQ[O'#ETOOQS'#El'#ElOOQS'#EW'#EWQYQ[OOO&uQXO'#CdO'jQWO'#DcO'oQWO'#EsO'zQ[O'#EsQOQWOOP(UO#tO'#C_POOO)C@[)C@[OOQP'#Cg'#CgOOQP,59Q,59QO#kQ[O,59QO(aQ[O'#E[O({QWO,58{O)TQ[O,59SO$qQ[O,59oO$vQ[O,59rO(aQ[O,59uO(aQ[O,59wO(aQ[O,59xO)`Q[O'#DbOOQS,58{,58{OOQP'#Ck'#CkOOQO'#DR'#DROOQP,59S,59SO)gQWO,59SO)lQWO,59SOOQP'#DV'#DVOOQP,59o,59oOOQO'#DX'#DXO)qQ`O,59rOOQS'#Cp'#CpO${QdO'#CqO)yQvO'#CsO+ZQtO,5:ROOQO'#Cx'#CxO)lQWO'#CwO+oQWO'#CyO+tQ[O'#DOOOQS'#Ep'#EpOOQO'#Dj'#DjO+|Q[O'#DqO,[QWO'#EtO&`Q[O'#DoO,jQWO'#DrOOQO'#Eu'#EuO)OQWO,5:`O,oQpO,5:bOOQS'#Dz'#DzO,wQWO,5:dO,|Q[O,5:dOOQO'#D}'#D}O-UQWO,5:gO-ZQWO,5:mO-cQWO,5:oOOQS-E8U-E8UO${QdO,59}O-kQ[O'#E^O-xQWO,5;_O-xQWO,5;_POOO'#EV'#EVP.TO#tO,58yPOOO,58y,58yOOQP1G.l1G.lO.zQXO,5:vOOQO-E8Y-E8YOOQS1G.g1G.gOOQP1G.n1G.nO)gQWO1G.nO)lQWO1G.nOOQP1G/Z1G/ZO/XQ`O1G/^O/rQXO1G/aO0YQXO1G/cO0pQXO1G/dO1WQWO,59|O1]Q[O'#DSO1dQdO'#CoOOQP1G/^1G/^O${QdO1G/^O1kQpO,59]OOQS,59_,59_O${QdO,59aO1sQWO1G/mOOQS,59c,59cO1xQ!bO,59eOOQS'#DP'#DPOOQS'#EY'#EYO2QQ[O,59jOOQS,59j,59jO2YQWO'#DjO2eQWO,5:VO2jQWO,5:]O&`Q[O,5:XO&`Q[O'#E_O2rQWO,5;`O2}QWO,5:ZO(aQ[O,5:^OOQS1G/z1G/zOOQS1G/|1G/|OOQS1G0O1G0OO3`QWO1G0OO3eQdO'#EOOOQS1G0R1G0ROOQS1G0X1G0XOOQS1G0Z1G0ZO3pQtO1G/iOOQO,5:x,5:xO4WQ[O,5:xOOQO-E8[-E8[O4eQWO1G0yPOOO-E8T-E8TPOOO1G.e1G.eOOQP7+$Y7+$YOOQP7+$x7+$xO${QdO7+$xOOQS1G/h1G/hO4pQXO'#ErO4wQWO,59nO4|QtO'#EXO5tQdO'#EoO6OQWO,59ZO6TQpO7+$xOOQS1G.w1G.wOOQS1G.{1G.{OOQS7+%X7+%XO6]QWO1G/POOQS-E8W-E8WOOQS1G/U1G/UO${QdO1G/qOOQO1G/w1G/wOOQO1G/s1G/sO6bQWO,5:yOOQO-E8]-E8]O6pQXO1G/xOOQS7+%j7+%jO6wQYO'#CsOOQO'#EQ'#EQO7SQ`O'#EPOOQO'#EP'#EPO7_QWO'#E`O7gQdO,5:jOOQS,5:j,5:jO7rQtO'#E]O${QdO'#E]O8sQdO7+%TOOQO7+%T7+%TOOQO1G0d1G0dO9WQpO<<HdO9`QWO,5;^OOQP1G/Y1G/YOOQS-E8V-E8VO${QdO'#EZO9hQWO,5;ZOOQT1G.u1G.uOOQP<<Hd<<HdOOQS7+$k7+$kO9pQdO7+%]OOQO7+%d7+%dOOQO,5:k,5:kO3hQdO'#EaO7_QWO,5:zOOQS,5:z,5:zOOQS-E8^-E8^OOQS1G0U1G0UO9wQtO,5:wOOQS-E8Z-E8ZOOQO<<Ho<<HoOOQPAN>OAN>OO:xQdO,5:uOOQO-E8X-E8XOOQO<<Hw<<HwOOQO,5:{,5:{OOQO-E8_-E8_OOQS1G0f1G0f",
  stateData: ";[~O#ZOS#[QQ~OUYOXYO]VO^VOqXOxWO![aO!]ZO!i[O!k]O!m^O!p_O!v`O#XRO#bTO~OQfOUYOXYO]VO^VOqXOxWO![aO!]ZO!i[O!k]O!m^O!p_O!v`O#XeO#bTO~O#U#gP~P!ZO#[jO~O#XlO~O]qO^qOqsOtoOxrO!OtO!RvO#VuO#bnO~O!TwO~P#pO`}O#WzO#XyO~O#X!OO~O#X!QO~OQ![Ob!TOf![Oh![On!YOq!ZO#W!WO#X!SO#e!UO~Ob!^O!d!`O!g!aO#X!]O!T#hP~Oh!fOn!YO#X!eO~Oh!hO#X!hO~Ob!^O!d!`O!g!aO#X!]O~O!Y#hP~P%jO]WX]!WX^WXqWXtWXxWX!OWX!RWX!TWX#VWX#bWX~O]!mO~O!Y!nO#U#gX!S#gX~O#U#gX!S#gX~P!ZO#]!qO#^!qO#_!sO~OUYOXYO]VO^VOqXOxWO#XRO#bTO~OtoO!TwO~O`!zO#WzO#XyO~O!S#gP~P!ZOb#RO~Ob#SO~Op#TO|#UO~OP#WObgXjgX!YgX!dgX!ggX#XgXagXQgXfgXhgXngXqgXtgX!XgX#UgX#WgX#egXpgX!SgX~Ob!^Oj#XO!d!`O!g!aO#X!]O!Y#hP~Ob#[O~Op#`O#X#]O~Ob!^O!d!`O!g!aO#X#aO~Ot#eO!b#dO!T#hX!Y#hX~Ob#hO~Oj#XO!Y#jO~O!Y#kO~Oh#lOn!YO~O!T#mO~O!TwO!b#dO~O!TwO!Y#pO~O!Y#QX#U#QX!S#QX~P!ZO!Y!nO#U#ga!S#ga~O#]!qO#^!qO#_#wO~O]qO^qOqsOxrO!OtO!RvO#VuO#bnO~Ot#Oa!T#Oaa#Oa~P.`Op#yO|#zO~O]qO^qOqsOxrO#bnO~Ot}i!O}i!R}i!T}i#V}ia}i~P/aOt!Pi!O!Pi!R!Pi!T!Pi#V!Pia!Pi~P/aOt!Qi!O!Qi!R!Qi!T!Qi#V!Qia!Qi~P/aO!S#{O~Oa#fP~P(aOa#cP~P${Oa$SOj#XO~O!Y$UO~Oh$VOo$VO~Op$XO#X#]O~O]!`Xa!^X!b!^X~O]$YO~Oa$ZO!b#dO~Ot#eO!T#ha!Y#ha~O!b#dOt!ca!T!ca!Y!caa!ca~O!Y$`O~O!S$gO#X$bO#e$aO~Oj#XOt$iO!X$kO!Y!Vi#U!Vi!S!Vi~P${O!Y#Qa#U#Qa!S#Qa~P!ZO!Y!nO#U#gi!S#gi~Oa#fX~P#pOa$oO~Oj#XOQ!{Xa!{Xb!{Xf!{Xh!{Xn!{Xq!{Xt!{X#W!{X#X!{X#e!{X~Ot$qOa#cX~P${Oa$sO~Oj#XOp$tO~Oa$uO~O!b#dOt#Ra!T#Ra!Y#Ra~Oa$wO~P.`OP#WOtgX!TgX~O#e$aOt!sX!T!sX~Ot$yO!TwO~O!S$}O#X$bO#e$aO~Oj#XOQ#PXb#PXf#PXh#PXn#PXq#PXt#PX!X#PX!Y#PX#U#PX#W#PX#X#PX#e#PX!S#PX~Ot$iO!X%QO!Y!Vq#U!Vq!S!Vq~P${Oj#XOp%RO~OtoOa#fa~Ot$qOa#ca~Oa%UO~P${Oj#XOQ#Pab#Paf#Pah#Pan#Paq#Pat#Pa!X#Pa!Y#Pa#U#Pa#W#Pa#X#Pa#e#Pa!S#Pa~Oa!}at!}a~P${O#Zo#[#ej!R#e~",
  goto: "-g#jPPP#kP#nP#w$WP#w$g#wPP$mPPP$s$|$|P%`P$|P$|%z&^PPPP$|&vP&z'Q#wP'W#w'^P#wP#w#wPPP'd'y(WPP#nPP(_(_(i(_P(_P(_(_P#nP#nP#nP(l#nP(o(r(u(|#nP#nP)R)X)h)v)|*S*^*d*n*t*zPPPPPPPPPP+Q+ZP+v+yP,o,r,x-RRkQ_bOPdhw!n#skYOPdhotuvw!n#R#h#skSOPdhotuvw!n#R#h#sQmTR!tnQ{VR!xqQ!x}Q#Z!XR#x!zq![Z]!T!m#S#U#X#q#z$P$Y$i$j$q$v%Sp![Z]!T!m#S#U#X#q#z$P$Y$i$j$q$v%SU$d#m$f$yR$x$cq!XZ]!T!m#S#U#X#q#z$P$Y$i$j$q$v%Sp![Z]!T!m#S#U#X#q#z$P$Y$i$j$q$v%SQ!f^R#l!gT#^!Z#_Q|VR!yqQ!x|R#x!yQ!PWR!{rQ!RXR!|sQxUQ!wpQ#i!cQ#o!jQ#p!kQ${$eR%X$zSgPwQ!phQ#r!nR$l#sZfPhw!n#sa!b[`a!V!^!`#d#eR#b!^R!g^R!i_R#n!iS$e#m$fR%V$yV$c#m$f$yQ!rjR#v!rQdOShPwU!ldh#sR#s!nQ$P#SU$p$P$v%SQ$v$YR%S$qQ#_!ZR$W#_Q$r$PR%T$rQpUS!vp$nR$n#|Q$j#qR%P$jQ!ogS#t!o#uR#u!pQ#f!_R$^#fQ$f#mR$|$fQ$z$eR%W$z_cOPdhw!n#s^UOPdhw!n#sQ!uoQ!}tQ#OuQ#PvQ#|#RR$_#hR$Q#SQ!VZQ!d]Q#V!TQ#q!m[$O#S$P$Y$q$v%SQ$R#UQ$T#XS$h#q$jQ$m#zR%O$iR#}#RQiPR#QwQ!c[Q!kaR#Y!VU!_[a!VQ!j`Q#c!^Q#g!`Q$[#dR$]#e",
  nodeNames: "\u26A0 Unit VariableName Comment StyleSheet RuleSet UniversalSelector TagSelector TagName NestingSelector ClassSelector ClassName PseudoClassSelector : :: PseudoClassName PseudoClassName ) ( ArgList ValueName ParenthesizedValue ColorLiteral NumberLiteral StringLiteral BinaryExpression BinOp CallExpression Callee CallLiteral CallTag ParenthesizedContent ] [ LineNames LineName , PseudoClassName ArgList IdSelector # IdName AttributeSelector AttributeName MatchOp ChildSelector ChildOp DescendantSelector SiblingSelector SiblingOp } { Block Declaration PropertyName Important ; ImportStatement AtKeyword import KeywordQuery FeatureQuery FeatureName BinaryQuery LogicOp UnaryQuery UnaryQueryOp ParenthesizedQuery SelectorQuery selector MediaStatement media CharsetStatement charset NamespaceStatement namespace NamespaceName KeyframesStatement keyframes KeyframeName KeyframeList KeyframeSelector KeyframeRangeName SupportsStatement supports AtRule Styles",
  maxTerm: 117,
  nodeProps: [
    ["isolate", -2, 3, 24, ""],
    ["openedBy", 17, "(", 32, "[", 50, "{"],
    ["closedBy", 18, ")", 33, "]", 51, "}"]
  ],
  propSources: [cssHighlighting],
  skippedNodes: [0, 3, 87],
  repeatNodeCount: 11,
  tokenData: "J^~R!^OX$}X^%u^p$}pq%uqr)Xrs.Rst/utu6duv$}vw7^wx7oxy9^yz9oz{9t{|:_|}?Q}!O?c!O!P@Q!P!Q@i!Q![Ab![!]B]!]!^CX!^!_$}!_!`Cj!`!aC{!a!b$}!b!cDw!c!}$}!}#OFa#O#P$}#P#QFr#Q#R6d#R#T$}#T#UGT#U#c$}#c#dHf#d#o$}#o#pH{#p#q6d#q#rI^#r#sIo#s#y$}#y#z%u#z$f$}$f$g%u$g#BY$}#BY#BZ%u#BZ$IS$}$IS$I_%u$I_$I|$}$I|$JO%u$JO$JT$}$JT$JU%u$JU$KV$}$KV$KW%u$KW&FU$}&FU&FV%u&FV;'S$};'S;=`JW<%lO$}`%QSOy%^z;'S%^;'S;=`%o<%lO%^`%cSo`Oy%^z;'S%^;'S;=`%o<%lO%^`%rP;=`<%l%^~%zh#Z~OX%^X^'f^p%^pq'fqy%^z#y%^#y#z'f#z$f%^$f$g'f$g#BY%^#BY#BZ'f#BZ$IS%^$IS$I_'f$I_$I|%^$I|$JO'f$JO$JT%^$JT$JU'f$JU$KV%^$KV$KW'f$KW&FU%^&FU&FV'f&FV;'S%^;'S;=`%o<%lO%^~'mh#Z~o`OX%^X^'f^p%^pq'fqy%^z#y%^#y#z'f#z$f%^$f$g'f$g#BY%^#BY#BZ'f#BZ$IS%^$IS$I_'f$I_$I|%^$I|$JO'f$JO$JT%^$JT$JU'f$JU$KV%^$KV$KW'f$KW&FU%^&FU&FV'f&FV;'S%^;'S;=`%o<%lO%^l)[UOy%^z#]%^#]#^)n#^;'S%^;'S;=`%o<%lO%^l)sUo`Oy%^z#a%^#a#b*V#b;'S%^;'S;=`%o<%lO%^l*[Uo`Oy%^z#d%^#d#e*n#e;'S%^;'S;=`%o<%lO%^l*sUo`Oy%^z#c%^#c#d+V#d;'S%^;'S;=`%o<%lO%^l+[Uo`Oy%^z#f%^#f#g+n#g;'S%^;'S;=`%o<%lO%^l+sUo`Oy%^z#h%^#h#i,V#i;'S%^;'S;=`%o<%lO%^l,[Uo`Oy%^z#T%^#T#U,n#U;'S%^;'S;=`%o<%lO%^l,sUo`Oy%^z#b%^#b#c-V#c;'S%^;'S;=`%o<%lO%^l-[Uo`Oy%^z#h%^#h#i-n#i;'S%^;'S;=`%o<%lO%^l-uS!X[o`Oy%^z;'S%^;'S;=`%o<%lO%^~.UWOY.RZr.Rrs.ns#O.R#O#P.s#P;'S.R;'S;=`/o<%lO.R~.sOh~~.vRO;'S.R;'S;=`/P;=`O.R~/SXOY.RZr.Rrs.ns#O.R#O#P.s#P;'S.R;'S;=`/o;=`<%l.R<%lO.R~/rP;=`<%l.Rn/zYxQOy%^z!Q%^!Q![0j![!c%^!c!i0j!i#T%^#T#Z0j#Z;'S%^;'S;=`%o<%lO%^l0oYo`Oy%^z!Q%^!Q![1_![!c%^!c!i1_!i#T%^#T#Z1_#Z;'S%^;'S;=`%o<%lO%^l1dYo`Oy%^z!Q%^!Q![2S![!c%^!c!i2S!i#T%^#T#Z2S#Z;'S%^;'S;=`%o<%lO%^l2ZYf[o`Oy%^z!Q%^!Q![2y![!c%^!c!i2y!i#T%^#T#Z2y#Z;'S%^;'S;=`%o<%lO%^l3QYf[o`Oy%^z!Q%^!Q![3p![!c%^!c!i3p!i#T%^#T#Z3p#Z;'S%^;'S;=`%o<%lO%^l3uYo`Oy%^z!Q%^!Q![4e![!c%^!c!i4e!i#T%^#T#Z4e#Z;'S%^;'S;=`%o<%lO%^l4lYf[o`Oy%^z!Q%^!Q![5[![!c%^!c!i5[!i#T%^#T#Z5[#Z;'S%^;'S;=`%o<%lO%^l5aYo`Oy%^z!Q%^!Q![6P![!c%^!c!i6P!i#T%^#T#Z6P#Z;'S%^;'S;=`%o<%lO%^l6WSf[o`Oy%^z;'S%^;'S;=`%o<%lO%^d6gUOy%^z!_%^!_!`6y!`;'S%^;'S;=`%o<%lO%^d7QS|So`Oy%^z;'S%^;'S;=`%o<%lO%^b7cSXQOy%^z;'S%^;'S;=`%o<%lO%^~7rWOY7oZw7owx.nx#O7o#O#P8[#P;'S7o;'S;=`9W<%lO7o~8_RO;'S7o;'S;=`8h;=`O7o~8kXOY7oZw7owx.nx#O7o#O#P8[#P;'S7o;'S;=`9W;=`<%l7o<%lO7o~9ZP;=`<%l7on9cSb^Oy%^z;'S%^;'S;=`%o<%lO%^~9tOa~n9{UUQjWOy%^z!_%^!_!`6y!`;'S%^;'S;=`%o<%lO%^n:fWjW!RQOy%^z!O%^!O!P;O!P!Q%^!Q![>T![;'S%^;'S;=`%o<%lO%^l;TUo`Oy%^z!Q%^!Q![;g![;'S%^;'S;=`%o<%lO%^l;nYo`#e[Oy%^z!Q%^!Q![;g![!g%^!g!h<^!h#X%^#X#Y<^#Y;'S%^;'S;=`%o<%lO%^l<cYo`Oy%^z{%^{|=R|}%^}!O=R!O!Q%^!Q![=j![;'S%^;'S;=`%o<%lO%^l=WUo`Oy%^z!Q%^!Q![=j![;'S%^;'S;=`%o<%lO%^l=qUo`#e[Oy%^z!Q%^!Q![=j![;'S%^;'S;=`%o<%lO%^l>[[o`#e[Oy%^z!O%^!O!P;g!P!Q%^!Q![>T![!g%^!g!h<^!h#X%^#X#Y<^#Y;'S%^;'S;=`%o<%lO%^n?VSt^Oy%^z;'S%^;'S;=`%o<%lO%^l?hWjWOy%^z!O%^!O!P;O!P!Q%^!Q![>T![;'S%^;'S;=`%o<%lO%^n@VU#bQOy%^z!Q%^!Q![;g![;'S%^;'S;=`%o<%lO%^~@nTjWOy%^z{@}{;'S%^;'S;=`%o<%lO%^~AUSo`#[~Oy%^z;'S%^;'S;=`%o<%lO%^lAg[#e[Oy%^z!O%^!O!P;g!P!Q%^!Q![>T![!g%^!g!h<^!h#X%^#X#Y<^#Y;'S%^;'S;=`%o<%lO%^bBbU]QOy%^z![%^![!]Bt!];'S%^;'S;=`%o<%lO%^bB{S^Qo`Oy%^z;'S%^;'S;=`%o<%lO%^nC^S!Y^Oy%^z;'S%^;'S;=`%o<%lO%^dCoS|SOy%^z;'S%^;'S;=`%o<%lO%^bDQU!OQOy%^z!`%^!`!aDd!a;'S%^;'S;=`%o<%lO%^bDkS!OQo`Oy%^z;'S%^;'S;=`%o<%lO%^bDzWOy%^z!c%^!c!}Ed!}#T%^#T#oEd#o;'S%^;'S;=`%o<%lO%^bEk[![Qo`Oy%^z}%^}!OEd!O!Q%^!Q![Ed![!c%^!c!}Ed!}#T%^#T#oEd#o;'S%^;'S;=`%o<%lO%^nFfSq^Oy%^z;'S%^;'S;=`%o<%lO%^nFwSp^Oy%^z;'S%^;'S;=`%o<%lO%^bGWUOy%^z#b%^#b#cGj#c;'S%^;'S;=`%o<%lO%^bGoUo`Oy%^z#W%^#W#XHR#X;'S%^;'S;=`%o<%lO%^bHYS!bQo`Oy%^z;'S%^;'S;=`%o<%lO%^bHiUOy%^z#f%^#f#gHR#g;'S%^;'S;=`%o<%lO%^fIQS!TUOy%^z;'S%^;'S;=`%o<%lO%^nIcS!S^Oy%^z;'S%^;'S;=`%o<%lO%^fItU!RQOy%^z!_%^!_!`6y!`;'S%^;'S;=`%o<%lO%^`JZP;=`<%l$}",
  tokenizers: [descendant, unitToken, identifiers, 1, 2, 3, 4, new LocalTokenGroup("m~RRYZ[z{a~~g~aO#^~~dP!P!Qg~lO#_~~", 28, 105)],
  topRules: { "StyleSheet": [0, 4], "Styles": [1, 86] },
  specialized: [{ term: 100, get: (value) => spec_callee[value] || -1 }, { term: 58, get: (value) => spec_AtKeyword[value] || -1 }, { term: 101, get: (value) => spec_identifier[value] || -1 }],
  tokenPrec: 1200
});

// node_modules/@codemirror/lang-css/dist/index.js
var _properties = null;
function properties() {
  if (!_properties && typeof document == "object" && document.body) {
    let { style } = document.body, names = [], seen = new Set();
    for (let prop in style)
      if (prop != "cssText" && prop != "cssFloat") {
        if (typeof style[prop] == "string") {
          if (/[A-Z]/.test(prop))
            prop = prop.replace(/[A-Z]/g, (ch) => "-" + ch.toLowerCase());
          if (!seen.has(prop)) {
            names.push(prop);
            seen.add(prop);
          }
        }
      }
    _properties = names.sort().map((name2) => ({ type: "property", label: name2 }));
  }
  return _properties || [];
}
var pseudoClasses = /* @__PURE__ */ [
  "active",
  "after",
  "any-link",
  "autofill",
  "backdrop",
  "before",
  "checked",
  "cue",
  "default",
  "defined",
  "disabled",
  "empty",
  "enabled",
  "file-selector-button",
  "first",
  "first-child",
  "first-letter",
  "first-line",
  "first-of-type",
  "focus",
  "focus-visible",
  "focus-within",
  "fullscreen",
  "has",
  "host",
  "host-context",
  "hover",
  "in-range",
  "indeterminate",
  "invalid",
  "is",
  "lang",
  "last-child",
  "last-of-type",
  "left",
  "link",
  "marker",
  "modal",
  "not",
  "nth-child",
  "nth-last-child",
  "nth-last-of-type",
  "nth-of-type",
  "only-child",
  "only-of-type",
  "optional",
  "out-of-range",
  "part",
  "placeholder",
  "placeholder-shown",
  "read-only",
  "read-write",
  "required",
  "right",
  "root",
  "scope",
  "selection",
  "slotted",
  "target",
  "target-text",
  "valid",
  "visited",
  "where"
].map((name2) => ({ type: "class", label: name2 }));
var values = /* @__PURE__ */ [
  "above",
  "absolute",
  "activeborder",
  "additive",
  "activecaption",
  "after-white-space",
  "ahead",
  "alias",
  "all",
  "all-scroll",
  "alphabetic",
  "alternate",
  "always",
  "antialiased",
  "appworkspace",
  "asterisks",
  "attr",
  "auto",
  "auto-flow",
  "avoid",
  "avoid-column",
  "avoid-page",
  "avoid-region",
  "axis-pan",
  "background",
  "backwards",
  "baseline",
  "below",
  "bidi-override",
  "blink",
  "block",
  "block-axis",
  "bold",
  "bolder",
  "border",
  "border-box",
  "both",
  "bottom",
  "break",
  "break-all",
  "break-word",
  "bullets",
  "button",
  "button-bevel",
  "buttonface",
  "buttonhighlight",
  "buttonshadow",
  "buttontext",
  "calc",
  "capitalize",
  "caps-lock-indicator",
  "caption",
  "captiontext",
  "caret",
  "cell",
  "center",
  "checkbox",
  "circle",
  "cjk-decimal",
  "clear",
  "clip",
  "close-quote",
  "col-resize",
  "collapse",
  "color",
  "color-burn",
  "color-dodge",
  "column",
  "column-reverse",
  "compact",
  "condensed",
  "contain",
  "content",
  "contents",
  "content-box",
  "context-menu",
  "continuous",
  "copy",
  "counter",
  "counters",
  "cover",
  "crop",
  "cross",
  "crosshair",
  "currentcolor",
  "cursive",
  "cyclic",
  "darken",
  "dashed",
  "decimal",
  "decimal-leading-zero",
  "default",
  "default-button",
  "dense",
  "destination-atop",
  "destination-in",
  "destination-out",
  "destination-over",
  "difference",
  "disc",
  "discard",
  "disclosure-closed",
  "disclosure-open",
  "document",
  "dot-dash",
  "dot-dot-dash",
  "dotted",
  "double",
  "down",
  "e-resize",
  "ease",
  "ease-in",
  "ease-in-out",
  "ease-out",
  "element",
  "ellipse",
  "ellipsis",
  "embed",
  "end",
  "ethiopic-abegede-gez",
  "ethiopic-halehame-aa-er",
  "ethiopic-halehame-gez",
  "ew-resize",
  "exclusion",
  "expanded",
  "extends",
  "extra-condensed",
  "extra-expanded",
  "fantasy",
  "fast",
  "fill",
  "fill-box",
  "fixed",
  "flat",
  "flex",
  "flex-end",
  "flex-start",
  "footnotes",
  "forwards",
  "from",
  "geometricPrecision",
  "graytext",
  "grid",
  "groove",
  "hand",
  "hard-light",
  "help",
  "hidden",
  "hide",
  "higher",
  "highlight",
  "highlighttext",
  "horizontal",
  "hsl",
  "hsla",
  "hue",
  "icon",
  "ignore",
  "inactiveborder",
  "inactivecaption",
  "inactivecaptiontext",
  "infinite",
  "infobackground",
  "infotext",
  "inherit",
  "initial",
  "inline",
  "inline-axis",
  "inline-block",
  "inline-flex",
  "inline-grid",
  "inline-table",
  "inset",
  "inside",
  "intrinsic",
  "invert",
  "italic",
  "justify",
  "keep-all",
  "landscape",
  "large",
  "larger",
  "left",
  "level",
  "lighter",
  "lighten",
  "line-through",
  "linear",
  "linear-gradient",
  "lines",
  "list-item",
  "listbox",
  "listitem",
  "local",
  "logical",
  "loud",
  "lower",
  "lower-hexadecimal",
  "lower-latin",
  "lower-norwegian",
  "lowercase",
  "ltr",
  "luminosity",
  "manipulation",
  "match",
  "matrix",
  "matrix3d",
  "medium",
  "menu",
  "menutext",
  "message-box",
  "middle",
  "min-intrinsic",
  "mix",
  "monospace",
  "move",
  "multiple",
  "multiple_mask_images",
  "multiply",
  "n-resize",
  "narrower",
  "ne-resize",
  "nesw-resize",
  "no-close-quote",
  "no-drop",
  "no-open-quote",
  "no-repeat",
  "none",
  "normal",
  "not-allowed",
  "nowrap",
  "ns-resize",
  "numbers",
  "numeric",
  "nw-resize",
  "nwse-resize",
  "oblique",
  "opacity",
  "open-quote",
  "optimizeLegibility",
  "optimizeSpeed",
  "outset",
  "outside",
  "outside-shape",
  "overlay",
  "overline",
  "padding",
  "padding-box",
  "painted",
  "page",
  "paused",
  "perspective",
  "pinch-zoom",
  "plus-darker",
  "plus-lighter",
  "pointer",
  "polygon",
  "portrait",
  "pre",
  "pre-line",
  "pre-wrap",
  "preserve-3d",
  "progress",
  "push-button",
  "radial-gradient",
  "radio",
  "read-only",
  "read-write",
  "read-write-plaintext-only",
  "rectangle",
  "region",
  "relative",
  "repeat",
  "repeating-linear-gradient",
  "repeating-radial-gradient",
  "repeat-x",
  "repeat-y",
  "reset",
  "reverse",
  "rgb",
  "rgba",
  "ridge",
  "right",
  "rotate",
  "rotate3d",
  "rotateX",
  "rotateY",
  "rotateZ",
  "round",
  "row",
  "row-resize",
  "row-reverse",
  "rtl",
  "run-in",
  "running",
  "s-resize",
  "sans-serif",
  "saturation",
  "scale",
  "scale3d",
  "scaleX",
  "scaleY",
  "scaleZ",
  "screen",
  "scroll",
  "scrollbar",
  "scroll-position",
  "se-resize",
  "self-start",
  "self-end",
  "semi-condensed",
  "semi-expanded",
  "separate",
  "serif",
  "show",
  "single",
  "skew",
  "skewX",
  "skewY",
  "skip-white-space",
  "slide",
  "slider-horizontal",
  "slider-vertical",
  "sliderthumb-horizontal",
  "sliderthumb-vertical",
  "slow",
  "small",
  "small-caps",
  "small-caption",
  "smaller",
  "soft-light",
  "solid",
  "source-atop",
  "source-in",
  "source-out",
  "source-over",
  "space",
  "space-around",
  "space-between",
  "space-evenly",
  "spell-out",
  "square",
  "start",
  "static",
  "status-bar",
  "stretch",
  "stroke",
  "stroke-box",
  "sub",
  "subpixel-antialiased",
  "svg_masks",
  "super",
  "sw-resize",
  "symbolic",
  "symbols",
  "system-ui",
  "table",
  "table-caption",
  "table-cell",
  "table-column",
  "table-column-group",
  "table-footer-group",
  "table-header-group",
  "table-row",
  "table-row-group",
  "text",
  "text-bottom",
  "text-top",
  "textarea",
  "textfield",
  "thick",
  "thin",
  "threeddarkshadow",
  "threedface",
  "threedhighlight",
  "threedlightshadow",
  "threedshadow",
  "to",
  "top",
  "transform",
  "translate",
  "translate3d",
  "translateX",
  "translateY",
  "translateZ",
  "transparent",
  "ultra-condensed",
  "ultra-expanded",
  "underline",
  "unidirectional-pan",
  "unset",
  "up",
  "upper-latin",
  "uppercase",
  "url",
  "var",
  "vertical",
  "vertical-text",
  "view-box",
  "visible",
  "visibleFill",
  "visiblePainted",
  "visibleStroke",
  "visual",
  "w-resize",
  "wait",
  "wave",
  "wider",
  "window",
  "windowframe",
  "windowtext",
  "words",
  "wrap",
  "wrap-reverse",
  "x-large",
  "x-small",
  "xor",
  "xx-large",
  "xx-small"
].map((name2) => ({ type: "keyword", label: name2 })).concat(/* @__PURE__ */ [
  "aliceblue",
  "antiquewhite",
  "aqua",
  "aquamarine",
  "azure",
  "beige",
  "bisque",
  "black",
  "blanchedalmond",
  "blue",
  "blueviolet",
  "brown",
  "burlywood",
  "cadetblue",
  "chartreuse",
  "chocolate",
  "coral",
  "cornflowerblue",
  "cornsilk",
  "crimson",
  "cyan",
  "darkblue",
  "darkcyan",
  "darkgoldenrod",
  "darkgray",
  "darkgreen",
  "darkkhaki",
  "darkmagenta",
  "darkolivegreen",
  "darkorange",
  "darkorchid",
  "darkred",
  "darksalmon",
  "darkseagreen",
  "darkslateblue",
  "darkslategray",
  "darkturquoise",
  "darkviolet",
  "deeppink",
  "deepskyblue",
  "dimgray",
  "dodgerblue",
  "firebrick",
  "floralwhite",
  "forestgreen",
  "fuchsia",
  "gainsboro",
  "ghostwhite",
  "gold",
  "goldenrod",
  "gray",
  "grey",
  "green",
  "greenyellow",
  "honeydew",
  "hotpink",
  "indianred",
  "indigo",
  "ivory",
  "khaki",
  "lavender",
  "lavenderblush",
  "lawngreen",
  "lemonchiffon",
  "lightblue",
  "lightcoral",
  "lightcyan",
  "lightgoldenrodyellow",
  "lightgray",
  "lightgreen",
  "lightpink",
  "lightsalmon",
  "lightseagreen",
  "lightskyblue",
  "lightslategray",
  "lightsteelblue",
  "lightyellow",
  "lime",
  "limegreen",
  "linen",
  "magenta",
  "maroon",
  "mediumaquamarine",
  "mediumblue",
  "mediumorchid",
  "mediumpurple",
  "mediumseagreen",
  "mediumslateblue",
  "mediumspringgreen",
  "mediumturquoise",
  "mediumvioletred",
  "midnightblue",
  "mintcream",
  "mistyrose",
  "moccasin",
  "navajowhite",
  "navy",
  "oldlace",
  "olive",
  "olivedrab",
  "orange",
  "orangered",
  "orchid",
  "palegoldenrod",
  "palegreen",
  "paleturquoise",
  "palevioletred",
  "papayawhip",
  "peachpuff",
  "peru",
  "pink",
  "plum",
  "powderblue",
  "purple",
  "rebeccapurple",
  "red",
  "rosybrown",
  "royalblue",
  "saddlebrown",
  "salmon",
  "sandybrown",
  "seagreen",
  "seashell",
  "sienna",
  "silver",
  "skyblue",
  "slateblue",
  "slategray",
  "snow",
  "springgreen",
  "steelblue",
  "tan",
  "teal",
  "thistle",
  "tomato",
  "turquoise",
  "violet",
  "wheat",
  "white",
  "whitesmoke",
  "yellow",
  "yellowgreen"
].map((name2) => ({ type: "constant", label: name2 })));
var tags2 = /* @__PURE__ */ [
  "a",
  "abbr",
  "address",
  "article",
  "aside",
  "b",
  "bdi",
  "bdo",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "col",
  "colgroup",
  "dd",
  "del",
  "details",
  "dfn",
  "dialog",
  "div",
  "dl",
  "dt",
  "em",
  "figcaption",
  "figure",
  "footer",
  "form",
  "header",
  "hgroup",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "main",
  "meter",
  "nav",
  "ol",
  "output",
  "p",
  "pre",
  "ruby",
  "section",
  "select",
  "small",
  "source",
  "span",
  "strong",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "template",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "tr",
  "u",
  "ul"
].map((name2) => ({ type: "type", label: name2 }));
var identifier2 = /^(\w[\w-]*|-\w[\w-]*|)$/;
var variable = /^-(-[\w-]*)?$/;
function isVarArg(node, doc2) {
  var _a2;
  if (node.name == "(" || node.type.isError)
    node = node.parent || node;
  if (node.name != "ArgList")
    return false;
  let callee2 = (_a2 = node.parent) === null || _a2 === void 0 ? void 0 : _a2.firstChild;
  if ((callee2 === null || callee2 === void 0 ? void 0 : callee2.name) != "Callee")
    return false;
  return doc2.sliceString(callee2.from, callee2.to) == "var";
}
var VariablesByNode = /* @__PURE__ */ new NodeWeakMap();
var declSelector = ["Declaration"];
function astTop(node) {
  for (let cur = node; ; ) {
    if (cur.type.isTop)
      return cur;
    if (!(cur = cur.parent))
      return node;
  }
}
function variableNames(doc2, node, isVariable) {
  if (node.to - node.from > 4096) {
    let known = VariablesByNode.get(node);
    if (known)
      return known;
    let result = [], seen = new Set(), cursor = node.cursor(IterMode.IncludeAnonymous);
    if (cursor.firstChild())
      do {
        for (let option of variableNames(doc2, cursor.node, isVariable))
          if (!seen.has(option.label)) {
            seen.add(option.label);
            result.push(option);
          }
      } while (cursor.nextSibling());
    VariablesByNode.set(node, result);
    return result;
  } else {
    let result = [], seen = new Set();
    node.cursor().iterate((node2) => {
      var _a2;
      if (isVariable(node2) && node2.matchContext(declSelector) && ((_a2 = node2.node.nextSibling) === null || _a2 === void 0 ? void 0 : _a2.name) == ":") {
        let name2 = doc2.sliceString(node2.from, node2.to);
        if (!seen.has(name2)) {
          seen.add(name2);
          result.push({ label: name2, type: "variable" });
        }
      }
    });
    return result;
  }
}
var defineCSSCompletionSource = (isVariable) => (context) => {
  let { state, pos } = context, node = syntaxTree(state).resolveInner(pos, -1);
  let isDash = node.type.isError && node.from == node.to - 1 && state.doc.sliceString(node.from, node.to) == "-";
  if (node.name == "PropertyName" || (isDash || node.name == "TagName") && /^(Block|Styles)$/.test(node.resolve(node.to).name))
    return { from: node.from, options: properties(), validFor: identifier2 };
  if (node.name == "ValueName")
    return { from: node.from, options: values, validFor: identifier2 };
  if (node.name == "PseudoClassName")
    return { from: node.from, options: pseudoClasses, validFor: identifier2 };
  if (isVariable(node) || (context.explicit || isDash) && isVarArg(node, state.doc))
    return {
      from: isVariable(node) || isDash ? node.from : pos,
      options: variableNames(state.doc, astTop(node), isVariable),
      validFor: variable
    };
  if (node.name == "TagName") {
    for (let { parent } = node; parent; parent = parent.parent)
      if (parent.name == "Block")
        return { from: node.from, options: properties(), validFor: identifier2 };
    return { from: node.from, options: tags2, validFor: identifier2 };
  }
  if (!context.explicit)
    return null;
  let above = node.resolve(pos), before = above.childBefore(pos);
  if (before && before.name == ":" && above.name == "PseudoClassSelector")
    return { from: pos, options: pseudoClasses, validFor: identifier2 };
  if (before && before.name == ":" && above.name == "Declaration" || above.name == "ArgList")
    return { from: pos, options: values, validFor: identifier2 };
  if (above.name == "Block" || above.name == "Styles")
    return { from: pos, options: properties(), validFor: identifier2 };
  return null;
};
var cssCompletionSource = /* @__PURE__ */ defineCSSCompletionSource((n) => n.name == "VariableName");
var cssLanguage = /* @__PURE__ */ LRLanguage.define({
  name: "css",
  parser: /* @__PURE__ */ parser2.configure({
    props: [
      /* @__PURE__ */ indentNodeProp.add({
        Declaration: /* @__PURE__ */ continuedIndent()
      }),
      /* @__PURE__ */ foldNodeProp.add({
        "Block KeyframeList": foldInside
      })
    ]
  }),
  languageData: {
    commentTokens: { block: { open: "/*", close: "*/" } },
    indentOnInput: /^\s*\}$/,
    wordChars: "-"
  }
});
function css() {
  return new LanguageSupport(cssLanguage, cssLanguage.data.of({ autocomplete: cssCompletionSource }));
}

// node_modules/@lezer/javascript/dist/index.js
var noSemi = 309;
var incdec = 1;
var incdecPrefix = 2;
var JSXStartTag = 3;
var insertSemi = 310;
var spaces = 312;
var newline2 = 313;
var LineComment = 4;
var BlockComment = 5;
var Dialect_jsx = 0;
var space2 = [
  9,
  10,
  11,
  12,
  13,
  32,
  133,
  160,
  5760,
  8192,
  8193,
  8194,
  8195,
  8196,
  8197,
  8198,
  8199,
  8200,
  8201,
  8202,
  8232,
  8233,
  8239,
  8287,
  12288
];
var braceR = 125;
var semicolon = 59;
var slash2 = 47;
var star = 42;
var plus = 43;
var minus = 45;
var lt = 60;
var comma = 44;
var trackNewline = new ContextTracker({
  start: false,
  shift(context, term) {
    return term == LineComment || term == BlockComment || term == spaces ? context : term == newline2;
  },
  strict: false
});
var insertSemicolon = new ExternalTokenizer((input, stack) => {
  let { next } = input;
  if (next == braceR || next == -1 || stack.context)
    input.acceptToken(insertSemi);
}, { contextual: true, fallback: true });
var noSemicolon = new ExternalTokenizer((input, stack) => {
  let { next } = input, after;
  if (space2.indexOf(next) > -1)
    return;
  if (next == slash2 && ((after = input.peek(1)) == slash2 || after == star))
    return;
  if (next != braceR && next != semicolon && next != -1 && !stack.context)
    input.acceptToken(noSemi);
}, { contextual: true });
var incdecToken = new ExternalTokenizer((input, stack) => {
  let { next } = input;
  if (next == plus || next == minus) {
    input.advance();
    if (next == input.next) {
      input.advance();
      let mayPostfix = !stack.context && stack.canShift(incdec);
      input.acceptToken(mayPostfix ? incdec : incdecPrefix);
    }
  }
}, { contextual: true });
function identifierChar(ch, start) {
  return ch >= 65 && ch <= 90 || ch >= 97 && ch <= 122 || ch == 95 || ch >= 192 || !start && ch >= 48 && ch <= 57;
}
var jsx = new ExternalTokenizer((input, stack) => {
  if (input.next != lt || !stack.dialectEnabled(Dialect_jsx))
    return;
  input.advance();
  if (input.next == slash2)
    return;
  let back = 0;
  while (space2.indexOf(input.next) > -1) {
    input.advance();
    back++;
  }
  if (identifierChar(input.next, true)) {
    input.advance();
    back++;
    while (identifierChar(input.next, false)) {
      input.advance();
      back++;
    }
    while (space2.indexOf(input.next) > -1) {
      input.advance();
      back++;
    }
    if (input.next == comma)
      return;
    for (let i = 0; ; i++) {
      if (i == 7) {
        if (!identifierChar(input.next, true))
          return;
        break;
      }
      if (input.next != "extends".charCodeAt(i))
        break;
      input.advance();
      back++;
    }
  }
  input.acceptToken(JSXStartTag, -back);
});
var jsHighlight = styleTags({
  "get set async static": tags.modifier,
  "for while do if else switch try catch finally return throw break continue default case": tags.controlKeyword,
  "in of await yield void typeof delete instanceof": tags.operatorKeyword,
  "let var const using function class extends": tags.definitionKeyword,
  "import export from": tags.moduleKeyword,
  "with debugger as new": tags.keyword,
  TemplateString: tags.special(tags.string),
  super: tags.atom,
  BooleanLiteral: tags.bool,
  this: tags.self,
  null: tags.null,
  Star: tags.modifier,
  VariableName: tags.variableName,
  "CallExpression/VariableName TaggedTemplateExpression/VariableName": tags.function(tags.variableName),
  VariableDefinition: tags.definition(tags.variableName),
  Label: tags.labelName,
  PropertyName: tags.propertyName,
  PrivatePropertyName: tags.special(tags.propertyName),
  "CallExpression/MemberExpression/PropertyName": tags.function(tags.propertyName),
  "FunctionDeclaration/VariableDefinition": tags.function(tags.definition(tags.variableName)),
  "ClassDeclaration/VariableDefinition": tags.definition(tags.className),
  PropertyDefinition: tags.definition(tags.propertyName),
  PrivatePropertyDefinition: tags.definition(tags.special(tags.propertyName)),
  UpdateOp: tags.updateOperator,
  "LineComment Hashbang": tags.lineComment,
  BlockComment: tags.blockComment,
  Number: tags.number,
  String: tags.string,
  Escape: tags.escape,
  ArithOp: tags.arithmeticOperator,
  LogicOp: tags.logicOperator,
  BitOp: tags.bitwiseOperator,
  CompareOp: tags.compareOperator,
  RegExp: tags.regexp,
  Equals: tags.definitionOperator,
  Arrow: tags.function(tags.punctuation),
  ": Spread": tags.punctuation,
  "( )": tags.paren,
  "[ ]": tags.squareBracket,
  "{ }": tags.brace,
  "InterpolationStart InterpolationEnd": tags.special(tags.brace),
  ".": tags.derefOperator,
  ", ;": tags.separator,
  "@": tags.meta,
  TypeName: tags.typeName,
  TypeDefinition: tags.definition(tags.typeName),
  "type enum interface implements namespace module declare": tags.definitionKeyword,
  "abstract global Privacy readonly override": tags.modifier,
  "is keyof unique infer": tags.operatorKeyword,
  JSXAttributeValue: tags.attributeValue,
  JSXText: tags.content,
  "JSXStartTag JSXStartCloseTag JSXSelfCloseEndTag JSXEndTag": tags.angleBracket,
  "JSXIdentifier JSXNameSpacedName": tags.tagName,
  "JSXAttribute/JSXIdentifier JSXAttribute/JSXNameSpacedName": tags.attributeName,
  "JSXBuiltin/JSXIdentifier": tags.standard(tags.tagName)
});
var spec_identifier2 = { __proto__: null, export: 18, as: 23, from: 31, default: 34, async: 39, function: 40, extends: 52, this: 56, true: 64, false: 64, null: 76, void: 80, typeof: 84, super: 102, new: 136, delete: 152, yield: 161, await: 165, class: 170, public: 227, private: 227, protected: 227, readonly: 229, instanceof: 248, satisfies: 251, in: 252, const: 254, import: 286, keyof: 339, unique: 343, infer: 349, is: 385, abstract: 405, implements: 407, type: 409, let: 412, var: 414, using: 417, interface: 423, enum: 427, namespace: 433, module: 435, declare: 439, global: 443, for: 462, of: 471, while: 474, with: 478, do: 482, if: 486, else: 488, switch: 492, case: 498, try: 504, catch: 508, finally: 512, return: 516, throw: 520, break: 524, continue: 528, debugger: 532 };
var spec_word = { __proto__: null, async: 123, get: 125, set: 127, declare: 187, public: 189, private: 189, protected: 189, static: 191, abstract: 193, override: 195, readonly: 201, accessor: 203, new: 389 };
var spec_LessThan = { __proto__: null, "<": 143 };
var parser3 = LRParser.deserialize({
  version: 14,
  states: "$=WO%TQ^OOO%[Q^OOO'_Q`OOP(lOWOOO*zQ08SO'#ChO+RO!bO'#CiO+aO#tO'#CiO+oO?MpO'#D^O.QQ^O'#DdO.bQ^O'#DoO%[Q^O'#DyO0fQ^O'#EROOQ07b'#EZ'#EZO1PQWO'#EWOOQO'#El'#ElOOQO'#Ie'#IeO1XQWO'#GmO1dQWO'#EkO1iQWO'#EkO3kQ08SO'#JiO6[Q08SO'#JjO6xQWO'#FZO6}Q&jO'#FqOOQ07b'#Fc'#FcO7YO,YO'#FcO7hQ7[O'#FxO9UQWO'#FwOOQ07b'#Jj'#JjOOQ07`'#Ji'#JiO9ZQWO'#GqOOQU'#KV'#KVO9fQWO'#IRO9kQ07hO'#ISOOQU'#JW'#JWOOQU'#IW'#IWQ`Q^OOO`Q^OOO%[Q^O'#DqO9sQ^O'#D}O9zQ^O'#EPO9aQWO'#GmO:RQ7[O'#CnO:aQWO'#EjO:lQWO'#EuO:qQ7[O'#FbO;`QWO'#GmOOQO'#KW'#KWO;eQWO'#KWO;sQWO'#GuO;sQWO'#GvO;sQWO'#GxO9aQWO'#G{O<jQWO'#HOO>RQWO'#CdO>cQWO'#H[O>kQWO'#HbO>kQWO'#HdO`Q^O'#HfO>kQWO'#HhO>kQWO'#HkO>pQWO'#HqO>uQ07iO'#HwO%[Q^O'#HyO?QQ07iO'#H{O?]Q07iO'#H}O9kQ07hO'#IPO?hQ08SO'#ChO@jQ`O'#DiQOQWOOO%[Q^O'#EPOAQQWO'#ESO:RQ7[O'#EjOA]QWO'#EjOAhQpO'#FbOOQU'#Cf'#CfOOQ07`'#Dn'#DnOOQ07`'#Jm'#JmO%[Q^O'#JmOOQO'#Jq'#JqOOQO'#Ib'#IbOBhQ`O'#EcOOQ07`'#Eb'#EbOOQ07`'#Jt'#JtOCdQ07pO'#EcOCnQ`O'#EVOOQO'#Jp'#JpODSQ`O'#JqOEaQ`O'#EVOCnQ`O'#EcPEnO!0LbO'#CaPOOO)CDu)CDuOOOO'#IX'#IXOEyO!bO,59TOOQ07b,59T,59TOOOO'#IY'#IYOFXO#tO,59TO%[Q^O'#D`OOOO'#I['#I[OFgO?MpO,59xOOQ07b,59x,59xOFuQ^O'#I]OGYQWO'#JkOI[QrO'#JkO+}Q^O'#JkOIcQWO,5:OOIyQWO'#ElOJWQWO'#JzOJcQWO'#JyOJcQWO'#JyOJkQWO,5;YOJpQWO'#JxOOQ07f,5:Z,5:ZOJwQ^O,5:ZOLxQ08SO,5:eOMiQWO,5:mONSQ07hO'#JwONZQWO'#JvO9ZQWO'#JvONoQWO'#JvONwQWO,5;XON|QWO'#JvO!#UQrO'#JjOOQ07b'#Ch'#ChO%[Q^O'#ERO!#tQpO,5:rOOQO'#Jr'#JrOOQO-E<c-E<cO9aQWO,5=XO!$[QWO,5=XO!$aQ^O,5;VO!&dQ7[O'#EgO!'}QWO,5;VO!)mQ7[O'#DsO!)tQ^O'#DxO!*OQ`O,5;`O!*WQ`O,5;`O%[Q^O,5;`OOQU'#FR'#FROOQU'#FT'#FTO%[Q^O,5;aO%[Q^O,5;aO%[Q^O,5;aO%[Q^O,5;aO%[Q^O,5;aO%[Q^O,5;aO%[Q^O,5;aO%[Q^O,5;aO%[Q^O,5;aO%[Q^O,5;aO%[Q^O,5;aOOQU'#FX'#FXO!*fQ^O,5;rOOQ07b,5;w,5;wOOQ07b,5;x,5;xO!,iQWO,5;xOOQ07b,5;y,5;yO%[Q^O'#IiO!,qQ07hO,5<eO!&dQ7[O,5;aO!-`Q7[O,5;aO%[Q^O,5;uO!-gQ&jO'#FgO!.dQ&jO'#KOO!.OQ&jO'#KOO!.kQ&jO'#KOOOQO'#KO'#KOO!/PQ&jO,5<POOOS,5<],5<]O!/bQ^O'#FsOOOS'#Ih'#IhO7YO,YO,5;}O!/iQ&jO'#FuOOQ07b,5;},5;}O!0YQMhO'#CuOOQ07b'#Cy'#CyO!0mQWO'#CyO!0rO?MpO'#C}O!1`Q7[O,5<bO!1gQWO,5<dO!3SQ!LQO'#GSO!3aQWO'#GTO!3fQWO'#GTO!5UQ!LQO'#GXO!6QQ`O'#G]OOQO'#Gh'#GhO!(SQ7[O'#GgOOQO'#Gj'#GjO!(SQ7[O'#GiO!6sQMhO'#JdOOQ07b'#Jd'#JdO!6}QWO'#JcO!7]QWO'#JbO!7eQWO'#CtOOQ07b'#Cw'#CwOOQ07b'#DR'#DROOQ07b'#DT'#DTO1SQWO'#DVO!(SQ7[O'#FzO!(SQ7[O'#F|O!7mQWO'#GOO!7rQWO'#GPO!3fQWO'#GVO!(SQ7[O'#G[O!7wQWO'#EmO!8fQWO,5<cOOQ07`'#Cq'#CqO!8nQWO'#EnO!9hQ`O'#EoOOQ07`'#Jx'#JxO!9oQ07hO'#KXO9kQ07hO,5=]O`Q^O,5>mOOQU'#J`'#J`OOQU,5>n,5>nOOQU-E<U-E<UO!;qQ08SO,5:]O!>_Q08SO,5:iO%[Q^O,5:iO!@xQ08SO,5:kOOQO,5@r,5@rO!AiQ7[O,5=XO!AwQ07hO'#JaO9UQWO'#JaO!BYQ07hO,59YO!BeQ`O,59YO!BmQ7[O,59YO:RQ7[O,59YO!BxQWO,5;VO!CQQWO'#HZO!CfQWO'#K[O%[Q^O,5;zO!9cQ`O,5;|O!CnQWO,5=tO!CsQWO,5=tO!CxQWO,5=tO9kQ07hO,5=tO;sQWO,5=dOOQO'#Cu'#CuO!DWQ`O,5=aO!D`Q7[O,5=bO!DkQWO,5=dO!DpQpO,5=gO!DxQWO'#KWO>pQWO'#HQO9aQWO'#HSO!D}QWO'#HSO:RQ7[O'#HUO!ESQWO'#HUOOQU,5=j,5=jO!EXQWO'#HVO!EjQWO'#CnO!EoQWO,59OO!EyQWO,59OO!HOQ^O,59OOOQU,59O,59OO!H`Q07hO,59OO%[Q^O,59OO!JkQ^O'#H^OOQU'#H_'#H_OOQU'#H`'#H`O`Q^O,5=vO!KRQWO,5=vO`Q^O,5=|O`Q^O,5>OO!KWQWO,5>QO`Q^O,5>SO!K]QWO,5>VO!KbQ^O,5>]OOQU,5>c,5>cO%[Q^O,5>cO9kQ07hO,5>eOOQU,5>g,5>gO# lQWO,5>gOOQU,5>i,5>iO# lQWO,5>iOOQU,5>k,5>kO#!YQ`O'#D[O%[Q^O'#JmO#!dQ`O'#JmO##RQ`O'#DjO##dQ`O'#DjO#%uQ^O'#DjO#%|QWO'#JlO#&UQWO,5:TO#&ZQWO'#EpO#&iQWO'#J{O#&qQWO,5;ZO#&vQ`O'#DjO#'TQ`O'#EUOOQ07b,5:n,5:nO%[Q^O,5:nO#'[QWO,5:nO>pQWO,5;UO!BeQ`O,5;UO!BmQ7[O,5;UO:RQ7[O,5;UO#'dQWO,5@XO#'iQ$ISO,5:rOOQO-E<`-E<`O#(oQ07pO,5:}OCnQ`O,5:qO#(yQ`O,5:qOCnQ`O,5:}O!BYQ07hO,5:qOOQ07`'#Ef'#EfOOQO,5:},5:}O%[Q^O,5:}O#)WQ07hO,5:}O#)cQ07hO,5:}O!BeQ`O,5:qOOQO,5;T,5;TO#)qQ07hO,5:}POOO'#IV'#IVP#*VO!0LbO,58{POOO,58{,58{OOOO-E<V-E<VOOQ07b1G.o1G.oOOOO-E<W-E<WO#*bQpO,59zOOOO-E<Y-E<YOOQ07b1G/d1G/dO#*gQrO,5>wO+}Q^O,5>wOOQO,5>},5>}O#*qQ^O'#I]OOQO-E<Z-E<ZO#+OQWO,5@VO#+WQrO,5@VO#+_QWO,5@eOOQ07b1G/j1G/jO%[Q^O,5@fO#+gQWO'#IcOOQO-E<a-E<aO#+_QWO,5@eOOQ07`1G0t1G0tOOQ07f1G/u1G/uOOQ07f1G0X1G0XO%[Q^O,5@cO#+{Q07hO,5@cO#,^Q07hO,5@cO#,eQWO,5@bO9ZQWO,5@bO#,mQWO,5@bO#,{QWO'#IfO#,eQWO,5@bOOQ07`1G0s1G0sO!*OQ`O,5:tO!*ZQ`O,5:tOOQO,5:v,5:vO#-mQWO,5:vO#-uQ7[O1G2sO9aQWO1G2sOOQ07b1G0q1G0qO#.TQ08SO1G0qO#/YQ08QO,5;ROOQ07b'#GR'#GRO#/vQ08SO'#JdO!$aQ^O1G0qO#2OQ7[O'#JnO#2YQWO,5:_O#2_QrO'#JoO%[Q^O'#JoO#2iQWO,5:dOOQ07b'#D['#D[OOQ07b1G0z1G0zO%[Q^O1G0zOOQ07b1G1d1G1dO#2nQWO1G0zO#5VQ08SO1G0{O#5^Q08SO1G0{O#7wQ08SO1G0{O#8OQ08SO1G0{O#:YQ08SO1G0{O#:pQ08SO1G0{O#=jQ08SO1G0{O#=qQ08SO1G0{O#@UQ08SO1G0{O#@cQ08SO1G0{O#BaQ08SO1G0{O#EaQ(CYO'#ChO#G_Q(CYO1G1^O#GfQ(CYO'#JjO!,lQWO1G1dO#GvQ08SO,5?TOOQ07`-E<g-E<gO#HjQ08SO1G0{OOQ07b1G0{1G0{O#JuQ08SO1G1aO#KiQ&jO,5<TO#KqQ&jO,5<UO#KyQ&jO'#FlO#LbQWO'#FkOOQO'#KP'#KPOOQO'#Ig'#IgO#LgQ&jO1G1kOOQ07b1G1k1G1kOOOS1G1v1G1vO#LxQ(CYO'#JiO#MSQWO,5<_O!*fQ^O,5<_OOOS-E<f-E<fOOQ07b1G1i1G1iO#MXQ`O'#KOOOQ07b,5<a,5<aO#MaQ`O,5<aOOQ07b,59e,59eO!&dQ7[O'#DPOOOO'#IZ'#IZO#MfO?MpO,59iOOQ07b,59i,59iO%[Q^O1G1|O!7rQWO'#IkO#MqQ7[O,5<uOOQ07b,5<r,5<rO!(SQ7[O'#InO#NaQ7[O,5=RO!(SQ7[O'#IpO$ SQ7[O,5=TO!&dQ7[O,5=VOOQO1G2O1G2OO$ ^QpO'#CqO$ qQ!LQO'#EnO$!pQ`O'#G]O$#^QpO,5<nO$#eQWO'#KSO9ZQWO'#KSO$#sQWO,5<pO!(SQ7[O,5<oO$#xQWO'#GUO$$ZQWO,5<oO$$`QpO'#GRO$$mQpO'#KTO$$wQWO'#KTO!&dQ7[O'#KTO$$|QWO,5<sO$%RQ`O'#G^O!5{Q`O'#G^O$%dQWO'#G`O$%iQWO'#GbO!3fQWO'#GeO$%nQ07hO'#ImO$%yQ`O,5<wOOQ07f,5<w,5<wO$&QQ`O'#G^O$&`Q`O'#G_O$&hQ`O'#G_O$&mQ7[O,5=RO$&}Q7[O,5=TOOQ07b,5=W,5=WO!(SQ7[O,5?}O!(SQ7[O,5?}O$'_QWO'#IrO$'jQWO,5?|O$'rQWO,59`O$(cQ7[O,59qOOQ07b,59q,59qO$)UQ7[O,5<fO$)wQ7[O,5<hO@bQWO,5<jOOQ07b,5<k,5<kO$*RQWO,5<qO$*WQ7[O,5<vO$*hQWO'#JvO!$aQ^O1G1}O$*mQWO1G1}O9ZQWO'#JyO9ZQWO'#EpO%[Q^O'#EpO9ZQWO'#ItO$*rQ07hO,5@sOOQU1G2w1G2wOOQU1G4X1G4XOOQ07b1G/w1G/wO!,iQWO1G/wO$,wQ08SO1G0TOOQU1G2s1G2sO!&dQ7[O1G2sO%[Q^O1G2sO#-xQWO1G2sO$.{Q7[O'#EgOOQ07`,5?{,5?{O$/VQ07hO,5?{OOQU1G.t1G.tO!BYQ07hO1G.tO!BeQ`O1G.tO!BmQ7[O1G.tO$/hQWO1G0qO$/mQWO'#ChO$/xQWO'#K]O$0QQWO,5=uO$0VQWO'#K]O$0[QWO'#K]O$0jQWO'#IzO$0xQWO,5@vO$1QQrO1G1fOOQ07b1G1h1G1hO9aQWO1G3`O@bQWO1G3`O$1XQWO1G3`O$1^QWO1G3`OOQU1G3`1G3`O!DkQWO1G3OO!&dQ7[O1G2{O$1cQWO1G2{OOQU1G2|1G2|O!&dQ7[O1G2|O$1hQWO1G2|O$1pQ`O'#GzOOQU1G3O1G3OO!5{Q`O'#IvO!DpQpO1G3ROOQU1G3R1G3ROOQU,5=l,5=lO$1xQ7[O,5=nO9aQWO,5=nO$%iQWO,5=pO9UQWO,5=pO!BeQ`O,5=pO!BmQ7[O,5=pO:RQ7[O,5=pO$2WQWO'#KZO$2cQWO,5=qOOQU1G.j1G.jO$2hQ07hO1G.jO@bQWO1G.jO$2sQWO1G.jO9kQ07hO1G.jO$4xQrO,5@xO$5YQWO,5@xO9ZQWO,5@xO$5eQ^O,5=xO$5lQWO,5=xOOQU1G3b1G3bO`Q^O1G3bOOQU1G3h1G3hOOQU1G3j1G3jO>kQWO1G3lO$5qQ^O1G3nO$9uQ^O'#HmOOQU1G3q1G3qO$:SQWO'#HsO>pQWO'#HuOOQU1G3w1G3wO$:[Q^O1G3wO9kQ07hO1G3}OOQU1G4P1G4POOQ07`'#GY'#GYO9kQ07hO1G4RO9kQ07hO1G4TO$>cQWO,5@XO!*fQ^O,5;[O9ZQWO,5;[O>pQWO,5:UO!*fQ^O,5:UO!BeQ`O,5:UO$>hQ(CYO,5:UOOQO,5;[,5;[O$>rQ`O'#I^O$?YQWO,5@WOOQ07b1G/o1G/oO$?bQ`O'#IdO$?lQWO,5@gOOQ07`1G0u1G0uO##dQ`O,5:UOOQO'#Ia'#IaO$?tQ`O,5:pOOQ07f,5:p,5:pO#'_QWO1G0YOOQ07b1G0Y1G0YO%[Q^O1G0YOOQ07b1G0p1G0pO>pQWO1G0pO!BeQ`O1G0pO!BmQ7[O1G0pOOQ07`1G5s1G5sO!BYQ07hO1G0]OOQO1G0i1G0iO%[Q^O1G0iO$?{Q07hO1G0iO$@WQ07hO1G0iO!BeQ`O1G0]OCnQ`O1G0]O$@fQ07hO1G0iOOQO1G0]1G0]O$@zQ08SO1G0iPOOO-E<T-E<TPOOO1G.g1G.gOOOO1G/f1G/fO$AUQpO,5<eO$A^QrO1G4cOOQO1G4i1G4iO%[Q^O,5>wO$AhQWO1G5qO$ApQWO1G6PO$AxQrO1G6QO9ZQWO,5>}O$BSQ08SO1G5}O%[Q^O1G5}O$BdQ07hO1G5}O$BuQWO1G5|O$BuQWO1G5|O9ZQWO1G5|O$B}QWO,5?QO9ZQWO,5?QOOQO,5?Q,5?QO$CcQWO,5?QO$*hQWO,5?QOOQO-E<d-E<dOOQO1G0`1G0`OOQO1G0b1G0bO!,lQWO1G0bOOQU7+(_7+(_O!&dQ7[O7+(_O%[Q^O7+(_O$CqQWO7+(_O$C|Q7[O7+(_O$D[Q08SO,5=RO$FgQ08SO,5=TO$HrQ08SO,5=RO$KTQ08SO,5=TO$MfQ08SO,59qO% nQ08SO,5<fO%#yQ08SO,5<hO%&UQ08SO,5<vOOQ07b7+&]7+&]O%(gQ08SO7+&]O%)ZQ7[O'#I_O%)eQWO,5@YOOQ07b1G/y1G/yO%)mQ^O'#I`O%)zQWO,5@ZO%*SQrO,5@ZOOQ07b1G0O1G0OO%*^QWO7+&fOOQ07b7+&f7+&fO%*cQ(CYO,5:eO%[Q^O7+&xO%*mQ(CYO,5:]O%*zQ(CYO,5:iO%+UQ(CYO,5:kOOQ07b7+'O7+'OOOQO1G1o1G1oOOQO1G1p1G1pO%+`QtO,5<WO!*fQ^O,5<VOOQO-E<e-E<eOOQ07b7+'V7+'VOOOS7+'b7+'bOOOS1G1y1G1yO%+kQWO1G1yOOQ07b1G1{1G1{O%+pQpO,59kOOOO-E<X-E<XOOQ07b1G/T1G/TO%+wQ08SO7+'hOOQ07b,5?V,5?VO%,kQpO,5?VOOQ07b1G2a1G2aP!&dQ7[O'#IkPOQ07b-E<i-E<iO%-ZQ7[O,5?YOOQ07b-E<l-E<lO%-|Q7[O,5?[OOQ07b-E<n-E<nO%.WQpO1G2qO%._QpO'#CqO%.uQ7[O'#JyO%.|Q^O'#EpOOQ07b1G2Y1G2YO%/WQWO'#IjO%/lQWO,5@nO%/lQWO,5@nO%/tQWO,5@nO%0PQWO,5@nOOQO1G2[1G2[O%0_Q7[O1G2ZO!(SQ7[O1G2ZO%0oQ!LQO'#IlO%0|QWO,5@oO!&dQ7[O,5@oO%1UQpO,5@oOOQ07b1G2_1G2_OOQ07`,5<x,5<xOOQ07`,5<y,5<yO$*hQWO,5<yOC_QWO,5<yO!BeQ`O,5<xOOQO'#Ga'#GaO%1`QWO,5<zOOQ07`,5<|,5<|O$*hQWO,5=POOQO,5?X,5?XOOQO-E<k-E<kOOQ07f1G2c1G2cO!5{Q`O,5<xO%1hQWO,5<yO$%dQWO,5<zO!5{Q`O,5<yO!(SQ7[O'#InO%2[Q7[O1G2mO!(SQ7[O'#IpO%2}Q7[O1G2oO%3XQ7[O1G5iO%3cQ7[O1G5iOOQO,5?^,5?^OOQO-E<p-E<pOOQO1G.z1G.zO!9cQ`O,59sO%[Q^O,59sO%3pQWO1G2UO!(SQ7[O1G2]O%3uQ08SO7+'iOOQ07b7+'i7+'iO!$aQ^O7+'iO%4iQWO,5;[OOQ07`,5?`,5?`OOQ07`-E<r-E<rOOQ07b7+%c7+%cO%4nQpO'#KUO#'_QWO7+(_O%4xQrO7+(_O$CtQWO7+(_O%5PQ08QO'#ChO%5dQ08QO,5<}O%6UQWO,5<}OOQ07`1G5g1G5gOOQU7+$`7+$`O!BYQ07hO7+$`O!BeQ`O7+$`O!$aQ^O7+&]O%6ZQWO'#IyO%6rQWO,5@wOOQO1G3a1G3aO9aQWO,5@wO%6rQWO,5@wO%6zQWO,5@wOOQO,5?f,5?fOOQO-E<x-E<xOOQ07b7+'Q7+'QO%7PQWO7+(zO9kQ07hO7+(zO9aQWO7+(zO@bQWO7+(zOOQU7+(j7+(jO%7UQ08QO7+(gO!&dQ7[O7+(gO%7`QpO7+(hOOQU7+(h7+(hO!&dQ7[O7+(hO%7gQWO'#KYO%7rQWO,5=fOOQO,5?b,5?bOOQO-E<t-E<tOOQU7+(m7+(mO%9RQ`O'#HTOOQU1G3Y1G3YO!&dQ7[O1G3YO%[Q^O1G3YO%9YQWO1G3YO%9eQ7[O1G3YO9kQ07hO1G3[O$%iQWO1G3[O9UQWO1G3[O!BeQ`O1G3[O!BmQ7[O1G3[O%9sQWO'#IxO%:XQWO,5@uO%:aQ`O,5@uOOQ07`1G3]1G3]OOQU7+$U7+$UO@bQWO7+$UO9kQ07hO7+$UO%:lQWO7+$UO%[Q^O1G6dO%[Q^O1G6eO%:qQ07hO1G6dO%:{Q^O1G3dO%;SQWO1G3dO%;XQ^O1G3dOOQU7+(|7+(|O9kQ07hO7+)WO`Q^O7+)YOOQU'#K`'#K`OOQU'#I{'#I{O%;`Q^O,5>XOOQU,5>X,5>XO%[Q^O'#HnO%;mQWO'#HpOOQU,5>_,5>_O9ZQWO,5>_OOQU,5>a,5>aOOQU7+)c7+)cOOQU7+)i7+)iOOQU7+)m7+)mOOQU7+)o7+)oO%;rQ`O1G5sO%<WQ(CYO1G0vO%<bQWO1G0vOOQO1G/p1G/pO%<mQ(CYO1G/pO>pQWO1G/pO!*fQ^O'#DjOOQO,5>x,5>xOOQO-E<[-E<[OOQO,5?O,5?OOOQO-E<b-E<bO!BeQ`O1G/pOOQO-E<_-E<_OOQ07f1G0[1G0[OOQ07b7+%t7+%tO#'_QWO7+%tOOQ07b7+&[7+&[O>pQWO7+&[O!BeQ`O7+&[OOQO7+%w7+%wO$@zQ08SO7+&TOOQO7+&T7+&TO%[Q^O7+&TO%<wQ07hO7+&TO!BYQ07hO7+%wO!BeQ`O7+%wO%=SQ07hO7+&TO%=bQ08SO7++iO%[Q^O7++iO%=rQWO7++hO%=rQWO7++hOOQO1G4l1G4lO9ZQWO1G4lO%=zQWO1G4lOOQO7+%|7+%|O#'_QWO<<KyO%4xQrO<<KyO%>YQWO<<KyOOQU<<Ky<<KyO!&dQ7[O<<KyO%[Q^O<<KyO%>bQWO<<KyO%>mQ08SO,5?YO%@xQ08SO,5?[O%CTQ08SO1G2ZO%EfQ08SO1G2mO%GqQ08SO1G2oO%I|Q7[O,5>yOOQO-E<]-E<]O%JWQrO,5>zO%[Q^O,5>zOOQO-E<^-E<^O%JbQWO1G5uOOQ07b<<JQ<<JQO%JjQ(CYO1G0qO%LtQ(CYO1G0{O%L{Q(CYO1G0{O& PQ(CYO1G0{O& WQ(CYO1G0{O&!{Q(CYO1G0{O&#cQ(CYO1G0{O&%vQ(CYO1G0{O&%}Q(CYO1G0{O&'{Q(CYO1G0{O&(YQ(CYO1G0{O&*WQ(CYO1G0{O&*kQ08SO<<JdO&+pQ(CYO1G0{O&-fQ(CYO'#JdO&/iQ(CYO1G1aO&/vQ(CYO1G0TO!*fQ^O'#FnOOQO'#KQ'#KQOOQO1G1r1G1rO&0QQWO1G1qO&0VQ(CYO,5?TOOOS7+'e7+'eOOOO1G/V1G/VOOQ07b1G4q1G4qO!(SQ7[O7+(]O&2gQrO'#ChO&2qQWO,5?UO9ZQWO,5?UOOQO-E<h-E<hO&3PQWO1G6YO&3PQWO1G6YO&3XQWO1G6YO&3dQ7[O7+'uO&3tQpO,5?WO&4OQWO,5?WO!&dQ7[O,5?WOOQO-E<j-E<jO&4TQpO1G6ZO&4_QWO1G6ZOOQ07`1G2e1G2eO$*hQWO1G2eOOQ07`1G2d1G2dO&4gQWO1G2fO!&dQ7[O1G2fOOQ07`1G2k1G2kO!BeQ`O1G2dOC_QWO1G2eO&4lQWO1G2fO&4tQWO1G2eO&5hQ7[O,5?YOOQ07b-E<m-E<mO&6ZQ7[O,5?[OOQ07b-E<o-E<oO!(SQ7[O7++TOOQ07b1G/_1G/_O&6eQWO1G/_OOQ07b7+'p7+'pO&6jQ7[O7+'wO&6zQ08SO<<KTOOQ07b<<KT<<KTO&7nQWO1G0vO!&dQ7[O'#IsO&7sQWO,5@pO!&dQ7[O1G2iOOQU<<Gz<<GzO!BYQ07hO<<GzO&7{Q08SO<<IwOOQ07b<<Iw<<IwOOQO,5?e,5?eO&8oQWO,5?eO&8tQWO,5?eOOQO-E<w-E<wO&9SQWO1G6cO&9SQWO1G6cO9aQWO1G6cO@bQWO<<LfOOQU<<Lf<<LfO&9[QWO<<LfO9kQ07hO<<LfOOQU<<LR<<LRO%7UQ08QO<<LROOQU<<LS<<LSO%7`QpO<<LSO&9aQ`O'#IuO&9lQWO,5@tO!*fQ^O,5@tOOQU1G3Q1G3QO%.|Q^O'#JmOOQO'#Iw'#IwO9kQ07hO'#IwO&9tQ`O,5=oOOQU,5=o,5=oO&9{Q`O'#EcO&:aQWO7+(tO&:fQWO7+(tOOQU7+(t7+(tO!&dQ7[O7+(tO%[Q^O7+(tO&:nQWO7+(tOOQU7+(v7+(vO9kQ07hO7+(vO$%iQWO7+(vO9UQWO7+(vO!BeQ`O7+(vO&:yQWO,5?dOOQO-E<v-E<vOOQO'#HW'#HWO&;UQWO1G6aO9kQ07hO<<GpOOQU<<Gp<<GpO@bQWO<<GpO&;^QWO7+,OO&;cQWO7+,PO%[Q^O7+,OO%[Q^O7+,POOQU7+)O7+)OO&;hQWO7+)OO&;mQ^O7+)OO&;tQWO7+)OOOQU<<Lr<<LrOOQU<<Lt<<LtOOQU-E<y-E<yOOQU1G3s1G3sO&;yQWO,5>YOOQU,5>[,5>[O&<OQWO1G3yO9ZQWO7+&bO!*fQ^O7+&bOOQO7+%[7+%[O&<TQ(CYO1G6QO>pQWO7+%[OOQ07b<<I`<<I`OOQ07b<<Iv<<IvO>pQWO<<IvOOQO<<Io<<IoO$@zQ08SO<<IoO%[Q^O<<IoOOQO<<Ic<<IcO!BYQ07hO<<IcO&<_Q07hO<<IoO&<jQ08SO<= TO&<zQWO<= SOOQO7+*W7+*WO9ZQWO7+*WOOQUANAeANAeO&=SQWOANAeO!&dQ7[OANAeO#'_QWOANAeO%4xQrOANAeO%[Q^OANAeO&=[Q08SO7+'uO&?mQ08SO,5?YO&AxQ08SO,5?[O&DTQ08SO7+'wO&FfQrO1G4fO&FpQ(CYO7+&]O&HtQ(CYO,5=RO&J{Q(CYO,5=TO&K]Q(CYO,5=RO&KmQ(CYO,5=TO&K}Q(CYO,59qO&NQQ(CYO,5<fO'!TQ(CYO,5<hO'$WQ(CYO,5<vO'%|Q(CYO7+'hO'&ZQ(CYO7+'iO'&hQWO,5<YOOQO7+']7+']O'&mQ7[O<<KwOOQO1G4p1G4pO'&tQWO1G4pO''PQWO1G4pO''_QWO7++tO''_QWO7++tO!&dQ7[O1G4rO''gQpO1G4rO''qQWO7++uOOQ07`7+(P7+(PO$*hQWO7+(QO''yQpO7+(QOOQ07`7+(O7+(OO$*hQWO7+(PO'(QQWO7+(QO!&dQ7[O7+(QOC_QWO7+(PO'(VQ7[O<<NoOOQ07b7+$y7+$yO'(aQpO,5?_OOQO-E<q-E<qO'(kQ08QO7+(TOOQUAN=fAN=fO9aQWO1G5POOQO1G5P1G5PO'({QWO1G5PO')QQWO7++}O')QQWO7++}O9kQ07hOANBQO@bQWOANBQOOQUANBQANBQOOQUANAmANAmOOQUANAnANAnO')YQWO,5?aOOQO-E<s-E<sO')eQ(CYO1G6`OOQO,5?c,5?cOOQO-E<u-E<uOOQU1G3Z1G3ZO%.|Q^O,5<zOOQU<<L`<<L`O!&dQ7[O<<L`O&:aQWO<<L`O')oQWO<<L`O%[Q^O<<L`OOQU<<Lb<<LbO9kQ07hO<<LbO$%iQWO<<LbO9UQWO<<LbO')wQ`O1G5OO'*SQWO7++{OOQUAN=[AN=[O9kQ07hOAN=[OOQU<= j<= jOOQU<= k<= kO'*[QWO<= jO'*aQWO<= kOOQU<<Lj<<LjO'*fQWO<<LjO'*kQ^O<<LjOOQU1G3t1G3tO>pQWO7+)eO'*rQWO<<I|O'*}Q(CYO<<I|OOQO<<Hv<<HvOOQ07bAN?bAN?bOOQOAN?ZAN?ZO$@zQ08SOAN?ZOOQOAN>}AN>}O%[Q^OAN?ZOOQO<<Mr<<MrOOQUG27PG27PO!&dQ7[OG27PO#'_QWOG27PO'+XQWOG27PO%4xQrOG27PO'+aQ(CYO<<JdO'+nQ(CYO1G2ZO'-dQ(CYO,5?YO'/gQ(CYO,5?[O'1jQ(CYO1G2mO'3mQ(CYO1G2oO'5pQ(CYO<<KTO'5}Q(CYO<<IwOOQO1G1t1G1tO!(SQ7[OANAcOOQO7+*[7+*[O'6[QWO7+*[O'6gQWO<= `O'6oQpO7+*^OOQ07`<<Kl<<KlO$*hQWO<<KlOOQ07`<<Kk<<KkO'6yQpO<<KlO$*hQWO<<KkOOQO7+*k7+*kO9aQWO7+*kO'7QQWO<= iOOQUG27lG27lO9kQ07hOG27lO!*fQ^O1G4{O'7YQWO7++zO&:aQWOANAzOOQUANAzANAzO!&dQ7[OANAzO'7bQWOANAzOOQUANA|ANA|O9kQ07hOANA|O$%iQWOANA|OOQO'#HX'#HXOOQO7+*j7+*jOOQUG22vG22vOOQUANEUANEUOOQUANEVANEVOOQUANBUANBUO'7jQWOANBUOOQU<<MP<<MPO!*fQ^OAN?hOOQOG24uG24uO$@zQ08SOG24uO#'_QWOLD,kOOQULD,kLD,kO!&dQ7[OLD,kO'7oQWOLD,kO'7wQ(CYO7+'uO'9mQ(CYO,5?YO';pQ(CYO,5?[O'=sQ(CYO7+'wO'?iQ7[OG26}OOQO<<Mv<<MvOOQ07`ANAWANAWO$*hQWOANAWOOQ07`ANAVANAVOOQO<<NV<<NVOOQULD-WLD-WO'?yQ(CYO7+*gOOQUG27fG27fO&:aQWOG27fO!&dQ7[OG27fOOQUG27hG27hO9kQ07hOG27hOOQUG27pG27pO'@TQ(CYOG25SOOQOLD*aLD*aOOQU!$(!V!$(!VO#'_QWO!$(!VO!&dQ7[O!$(!VO'@_Q08SOG26}OOQ07`G26rG26rOOQULD-QLD-QO&:aQWOLD-QOOQULD-SLD-SOOQU!)9Eq!)9EqO#'_QWO!)9EqOOQU!$(!l!$(!lOOQU!.K;]!.K;]O'BpQ(CYOG26}O!*fQ^O'#DyO1PQWO'#EWO'DfQrO'#JiO!*fQ^O'#DqO'DmQ^O'#D}O'DtQrO'#ChO'G[QrO'#ChO!*fQ^O'#EPO'GlQ^O,5;VO!*fQ^O,5;aO!*fQ^O,5;aO!*fQ^O,5;aO!*fQ^O,5;aO!*fQ^O,5;aO!*fQ^O,5;aO!*fQ^O,5;aO!*fQ^O,5;aO!*fQ^O,5;aO!*fQ^O,5;aO!*fQ^O,5;aO!*fQ^O'#IiO'IoQWO,5<eO'IwQ7[O,5;aO'KbQ7[O,5;aO!*fQ^O,5;uO!&dQ7[O'#GgO'IwQ7[O'#GgO!&dQ7[O'#GiO'IwQ7[O'#GiO1SQWO'#DVO1SQWO'#DVO!&dQ7[O'#FzO'IwQ7[O'#FzO!&dQ7[O'#F|O'IwQ7[O'#F|O!&dQ7[O'#G[O'IwQ7[O'#G[O!*fQ^O,5:iO'KiQ`O'#D[O!*fQ^O,5@fO'GlQ^O1G0qO'KsQ(CYO'#ChO!*fQ^O1G1|O!&dQ7[O'#InO'IwQ7[O'#InO!&dQ7[O'#IpO'IwQ7[O'#IpO'K}QpO'#CqO!&dQ7[O,5<oO'IwQ7[O,5<oO'GlQ^O1G1}O!*fQ^O7+&xO!&dQ7[O1G2ZO'IwQ7[O1G2ZO!&dQ7[O'#InO'IwQ7[O'#InO!&dQ7[O'#IpO'IwQ7[O'#IpO!&dQ7[O1G2]O'IwQ7[O1G2]O'GlQ^O7+'iO'GlQ^O7+&]O!&dQ7[OANAcO'IwQ7[OANAcO'LbQWO'#EkO'LgQWO'#EkO'LoQWO'#FZO'LtQWO'#EuO'LyQWO'#JzO'MUQWO'#JxO'MaQWO,5;VO'MfQ7[O,5<bO'MmQWO'#GTO'MrQWO'#GTO'MwQWO,5<cO'NPQWO,5;VO'NXQ(CYO1G1^O'N`QWO,5<oO'NeQWO,5<oO'NjQWO,5<qO'NoQWO,5<qO'NtQWO1G1}O'NyQWO1G0qO( OQ7[O<<KwO( VQ7[O<<KwO7hQ7[O'#FxO9UQWO'#FwOA]QWO'#EjO!*fQ^O,5;rO!3fQWO'#GTO!3fQWO'#GTO!3fQWO'#GVO!3fQWO'#GVO!(SQ7[O7+(]O!(SQ7[O7+(]O%.WQpO1G2qO%.WQpO1G2qO!&dQ7[O,5=VO!&dQ7[O,5=V",
  stateData: "(!Z~O'tOS'uOSSOS'vRQ~OPYOQYORfOX!VO`qOczOdyOlkOnYOokOpkOvkOxYOzYO!PWO!TkO!UkO![XO!fuO!kZO!nYO!oYO!pYO!rvO!twO!wxO!{]O#s!PO$T|O%b}O%d!QO%f!OO%g!OO%h!OO%k!RO%m!SO%p!TO%q!TO%s!UO&P!WO&V!XO&X!YO&Z!ZO&]![O&`!]O&f!^O&l!_O&n!`O&p!aO&r!bO&t!cO'{SO'}TO(QUO(XVO(g[O(uiO~OVtO~P`OPYOQYORfOc!jOd!iOlkOnYOokOpkOvkOxYOzYO!PWO!TkO!UkO![!eO!fuO!kZO!nYO!oYO!pYO!rvO!t!gO!w!hO$T!kO'{!dO'}TO(QUO(XVO(g[O(uiO~O`!wOo!nO!P!oO!_!yO!`!vO!a!vO!{:jO#P!pO#Q!pO#R!xO#S!pO#T!pO#W!zO#X!zO'|!lO'}TO(QUO([!mO(g!sO~O'v!{O~OP[XZ[X`[Xn[X|[X}[X!P[X!Y[X!h[X!i[X!k[X!o[X#[[X#geX#j[X#k[X#l[X#m[X#n[X#o[X#p[X#q[X#r[X#t[X#v[X#x[X#y[X$O[X'r[X(X[X(i[X(p[X(q[X~O!d$|X~P(qO^!}O'}#PO(O!}O(P#PO~O^#QO(P#PO(Q#PO(R#QO~Ot#SO!R#TO(Y#TO(Z#VO~OPYOQYORfOc!jOd!iOlkOnYOokOpkOvkOxYOzYO!PWO!TkO!UkO![!eO!fuO!kZO!nYO!oYO!pYO!rvO!t!gO!w!hO$T!kO'{:nO'}TO(QUO(XVO(g[O(uiO~O!X#ZO!Y#WO!V(_P!V(mP~P+}O!Z#cO~P`OPYOQYORfOc!jOd!iOnYOokOpkOvkOxYOzYO!PWO!TkO!UkO![!eO!fuO!kZO!nYO!oYO!pYO!rvO!t!gO!w!hO$T!kO'}TO(QUO(XVO(g[O(uiO~Ol#mO!X#iO!{]O#e#lO#f#iO'{:oO!j(jP~P.iO!k#oO'{#nO~O!w#sO!{]O%b#tO~O#g#uO~O!d#vO#g#uO~OP$^OZ$eOn$RO|#zO}#{O!P#|O!Y$bO!h$TO!i#xO!k#yO!o$^O#j$PO#k$QO#l$QO#m$QO#n$SO#o$TO#p$TO#q$dO#r$TO#t$UO#v$WO#x$YO#y$ZO(XVO(i$[O(p#}O(q$OO~O`(]X'r(]X'p(]X!j(]X!V(]X![(]X%c(]X!d(]X~P1qO#[$fO$O$fOP(^XZ(^Xn(^X|(^X}(^X!P(^X!Y(^X!h(^X!k(^X!o(^X#j(^X#k(^X#l(^X#m(^X#n(^X#o(^X#p(^X#q(^X#r(^X#t(^X#v(^X#x(^X#y(^X(X(^X(i(^X(p(^X(q(^X![(^X%c(^X~O`(^X!i(^X'r(^X'p(^X!V(^X!j(^Xr(^X!d(^X~P4XO#[$fO~O$Y$hO$[$gO$c$mO~ORfO![$nO$f$oO$h$qO~Og%WOl%XOn$uOo$tOp$tOv%YOx%ZOz%[O!P$|O![$}O!f%aO!k$yO#f%bO$T%_O$o%]O$q%^O$t%`O'{$sO'}TO(QUO(X$vO(p%OO(q%QOf(UP~O!k%cO~O!P%fO![%gO'{%eO~O!d%kO~O`%lO'r%lO~O'|!lO~P%[O%h%sO~P%[Og%WO!k%cO'{%eO'|!lO~Od%zO!k%cO'{%eO~O#r$TO~O|&PO![%|O!k&OO%d&SO'{%eO'|!lO'}TO(QUO_)OP~O!w#sO~O%m&UO!P(zX![(zX'{(zX~O'{&VO~O!t&[O#s!PO%d!QO%f!OO%g!OO%h!OO%k!RO%m!SO%p!TO%q!TO~Oc&aOd&`O!w&^O%b&_O%u&]O~P;xOc&dOdyO![&cO!t&[O!wxO!{]O#s!PO%b}O%f!OO%g!OO%h!OO%k!RO%m!SO%p!TO%q!TO%s!UO~Oa&gO#[&jO%d&eO'|!lO~P<}O!k&kO!t&oO~O!k#oO~O![XO~O`%lO'q&wO'r%lO~O`%lO'q&zO'r%lO~O`%lO'q&|O'r%lO~O'p[X!V[Xr[X!j[X&T[X![[X%c[X!d[X~P(qO!_'ZO!`'SO!a'SO'|!lO'}TO(QUO~Oo'QO!P'PO!X'TO(['OO!Z(`P!Z(oP~P@UOj'^O!['[O'{%eO~Od'cO!k%cO'{%eO~O|&PO!k&OO~Oo!nO!P!oO!{:jO#P!pO#Q!pO#S!pO#T!pO'|!lO'}TO(QUO([!mO(g!sO~O!_'iO!`'hO!a'hO#R!pO#W'jO#X'jO~PApO`%lOg%WO!d#vO!k%cO'r%lO(i'lO~O!o'pO#['nO~PCOOo!nO!P!oO'}TO(QUO([!mO(g!sO~O![XOo(eX!P(eX!_(eX!`(eX!a(eX!{(eX#P(eX#Q(eX#R(eX#S(eX#T(eX#W(eX#X(eX'|(eX'}(eX(Q(eX([(eX(g(eX~O!`'hO!a'hO'|!lO~PCnO'w'tO'x'tO'y'vO~O^!}O'}'xO(O!}O(P'xO~O^#QO(P'xO(Q'xO(R#QO~Ot#SO!R#TO(Y#TO(Z'|O~O!X(OO!V'PX!V'VX!Y'PX!Y'VX~P+}O!Y(QO!V(_X~OP$^OZ$eOn$RO|#zO}#{O!P#|O!Y(QO!h$TO!i#xO!k#yO!o$^O#j$PO#k$QO#l$QO#m$QO#n$SO#o$TO#p$TO#q$dO#r$TO#t$UO#v$WO#x$YO#y$ZO(XVO(i$[O(p#}O(q$OO~O!V(_X~PGbO!V(VO~O!V(lX!Y(lX!d(lX!j(lX(i(lX~O#[(lX#g#`X!Z(lX~PIhO#[(WO!V(nX!Y(nX~O!Y(XO!V(mX~O!V([O~O#[$fO~PIhO!Z(]O~P`O|#zO}#{O!P#|O!i#xO!k#yO(XVOP!maZ!man!ma!Y!ma!h!ma!o!ma#j!ma#k!ma#l!ma#m!ma#n!ma#o!ma#p!ma#q!ma#r!ma#t!ma#v!ma#x!ma#y!ma(i!ma(p!ma(q!ma~O`!ma'r!ma'p!ma!V!ma!j!mar!ma![!ma%c!ma!d!ma~PKOO!j(^O~O!d#vO#[(_O(i'lO!Y(kX`(kX'r(kX~O!j(kX~PMnO!P%fO![%gO!{]O#e(dO#f(cO'{%eO~O!Y(eO!j(jX~O!j(gO~O!P%fO![%gO#f(cO'{%eO~OP(^XZ(^Xn(^X|(^X}(^X!P(^X!Y(^X!h(^X!i(^X!k(^X!o(^X#j(^X#k(^X#l(^X#m(^X#n(^X#o(^X#p(^X#q(^X#r(^X#t(^X#v(^X#x(^X#y(^X(X(^X(i(^X(p(^X(q(^X~O!d#vO!j(^X~P! [O|(hO}(iO!i#xO!k#yO!{!za!P!za~O!w!za%b!za![!za#e!za#f!za'{!za~P!#`O!w(mO~OPYOQYORfOc!jOd!iOlkOnYOokOpkOvkOxYOzYO!PWO!TkO!UkO![XO!fuO!kZO!nYO!oYO!pYO!rvO!t!gO!w!hO$T!kO'{!dO'}TO(QUO(XVO(g[O(uiO~Og%WOl%XOn$uOo$tOp$tOv%YOx%ZOz;WO!P$|O![$}O!f<hO!k$yO#f;^O$T%_O$o;YO$q;[O$t%`O'{(qO'}TO(QUO(X$vO(p%OO(q%QO~O#g(sO~Og%WOl%XOn$uOo$tOp$tOv%YOx%ZOz%[O!P$|O![$}O!f%aO!k$yO#f%bO$T%_O$o%]O$q%^O$t%`O'{(qO'}TO(QUO(X$vO(p%OO(q%QO~Of(bP~P!(SO!X(wO!j(cP~P%[O([(yO(g[O~O!P({O!k#yO([(yO(g[O~OP:iOQ:iORfOc<dOd!iOlkOn:iOokOpkOvkOx:iOz:iO!PWO!TkO!UkO![!eO!f:lO!kZO!n:iO!o:iO!p:iO!r:mO!t:pO!w!hO$T!kO'{)ZO'}TO(QUO(XVO(g[O(u<bO~O})^O!k#yO~O!Y$bO`$ma'r$ma'p$ma!j$ma!V$ma![$ma%c$ma!d$ma~O#s)bO~P!&dO|)eO!d)dO![$ZX$W$ZX$Y$ZX$[$ZX$c$ZX~O!d)dO![(rX$W(rX$Y(rX$[(rX$c(rX~O|)eO~P!.OO|)eO![(rX$W(rX$Y(rX$[(rX$c(rX~O![)gO$W)kO$Y)fO$[)fO$c)lO~O!X)oO~P!*fO$Y$hO$[$gO$c)sO~Oj$uX|$uX!P$uX!i$uX(p$uX(q$uX~OfiXf$uXjiX!YiX#[iX~P!/tOo)uO~Ot)vO(Y)wO(Z)yO~Oj*SO|){O!P)|O(p%OO(q%QO~Of)zO~P!0}Of*TO~Og%WOl%XOn$uOo$tOp$tOv%YOx%ZOz;WO!P*VO![*WO!f<hO!k$yO#f;^O$T%_O$o;YO$q;[O$t%`O'}TO(QUO(X$vO(p%OO(q%QO~O!X*ZO'{*UO!j(vP~P!1lO#g*]O~O!k*^O~Og%WOl%XOn$uOo$tOp$tOv%YOx%ZOz;WO!P$|O![$}O!f<hO!k$yO#f;^O$T%_O$o;YO$q;[O$t%`O'{*`O'}TO(QUO(X$vO(p%OO(q%QO~O!X*cO!V(wP~P!3kOn*oO!P*gO!_*mO!`*fO!a*fO!k*^O#W*nO%Y*iO'|!lO([!mO~O!Z*lO~P!5`O!i#xOj(WX|(WX!P(WX(p(WX(q(WX!Y(WX#[(WX~Of(WX#|(WX~P!6XOj*tO#[*sOf(VX!Y(VX~O!Y*uOf(UX~O'{&VOf(UP~O!k*|O~O'{(qO~Ol+QO!P%fO!X#iO![%gO!{]O#e#lO#f#iO'{%eO!j(jP~O!d#vO#g+RO~O!P%fO!X+TO!Y(XO![%gO'{%eO!V(mP~Oo'WO!P+VO!X+UO'}TO(QUO([(yO~O!Z(oP~P!9SO!Y+WO`({X'r({X~OP$^OZ$eOn$RO|#zO}#{O!P#|O!h$TO!i#xO!k#yO!o$^O#j$PO#k$QO#l$QO#m$QO#n$SO#o$TO#p$TO#q$dO#r$TO#t$UO#v$WO#x$YO#y$ZO(XVO(i$[O(p#}O(q$OO~O`!ea!Y!ea'r!ea'p!ea!V!ea!j!ear!ea![!ea%c!ea!d!ea~P!9zO|#zO}#{O!P#|O!i#xO!k#yO(XVOP!qaZ!qan!qa!Y!qa!h!qa!o!qa#j!qa#k!qa#l!qa#m!qa#n!qa#o!qa#p!qa#q!qa#r!qa#t!qa#v!qa#x!qa#y!qa(i!qa(p!qa(q!qa~O`!qa'r!qa'p!qa!V!qa!j!qar!qa![!qa%c!qa!d!qa~P!<eO|#zO}#{O!P#|O!i#xO!k#yO(XVOP!saZ!san!sa!Y!sa!h!sa!o!sa#j!sa#k!sa#l!sa#m!sa#n!sa#o!sa#p!sa#q!sa#r!sa#t!sa#v!sa#x!sa#y!sa(i!sa(p!sa(q!sa~O`!sa'r!sa'p!sa!V!sa!j!sar!sa![!sa%c!sa!d!sa~P!?OOg%WOj+aO!['[O%c+`O~O!d+cO`(TX![(TX'r(TX!Y(TX~O`%lO![XO'r%lO~Og%WO!k%cO~Og%WO!k%cO'{%eO~O!d#vO#g(sO~Oa+nO%d+oO'{+kO'}TO(QUO!Z)PP~O!Y+pO_)OX~OZ+tO~O_+uO~O![%|O'{%eO'|!lO_)OP~Og%WO#[+zO~Og%WOj+}O![$}O~O![,PO~O|,RO![XO~O%h%sO~O!w,WO~Od,]O~Oa,^O'{#nO'}TO(QUO!Z(}P~Od%zO~O%d!QO'{&VO~P<}OZ,cO_,bO~OPYOQYORfOczOdyOlkOnYOokOpkOvkOxYOzYO!PWO!TkO!UkO!fuO!kZO!nYO!oYO!pYO!rvO!wxO!{]O%b}O'}TO(QUO(XVO(g[O(uiO~O![!eO!t!gO$T!kO'{!dO~P!FRO_,bO`%lO'r%lO~OPYOQYORfOc!jOd!iOlkOnYOokOpkOvkOxYOzYO!PWO!TkO!UkO![!eO!fuO!kZO!nYO!oYO!pYO!rvO!w!hO$T!kO'{!dO'}TO(QUO(XVO(g[O(uiO~O`,hO!twO#s!OO%f!OO%g!OO%h!OO~P!HkO!k&kO~O&V,nO~O![,pO~O&h,rO&j,sOP&eaQ&eaR&eaX&ea`&eac&ead&eal&ean&eao&eap&eav&eax&eaz&ea!P&ea!T&ea!U&ea![&ea!f&ea!k&ea!n&ea!o&ea!p&ea!r&ea!t&ea!w&ea!{&ea#s&ea$T&ea%b&ea%d&ea%f&ea%g&ea%h&ea%k&ea%m&ea%p&ea%q&ea%s&ea&P&ea&V&ea&X&ea&Z&ea&]&ea&`&ea&f&ea&l&ea&n&ea&p&ea&r&ea&t&ea'p&ea'{&ea'}&ea(Q&ea(X&ea(g&ea(u&ea!Z&ea&^&eaa&ea&c&ea~O'{,xO~Og!bX!Y!OX!Z!OX!d!OX!d!bX!k!bX#[!OX~O!Y!bX!Z!bX~P# qO!d,}O#[,|Og(aX!Y#dX!Y(aX!Z#dX!Z(aX!d(aX!k(aX~Og%WO!d-PO!k%cO!Y!^X!Z!^X~Oo!nO!P!oO'}TO(QUO([!mO~OP:iOQ:iORfOc<dOd!iOlkOn:iOokOpkOvkOx:iOz:iO!PWO!TkO!UkO![!eO!f:lO!kZO!n:iO!o:iO!p:iO!r:mO!t:pO!w!hO$T!kO'}TO(QUO(XVO(g[O(u<bO~O'{;dO~P##uO!Y-TO!Z(`X~O!Z-VO~O!d,}O#[,|O!Y#dX!Z#dX~O!Y-WO!Z(oX~O!Z-YO~O!`-ZO!a-ZO'|!lO~P##dO!Z-^O~P'_Oj-aO!['[O~O!V-fO~Oo!za!_!za!`!za!a!za#P!za#Q!za#R!za#S!za#T!za#W!za#X!za'|!za'}!za(Q!za([!za(g!za~P!#`O!o-kO#[-iO~PCOO!`-mO!a-mO'|!lO~PCnO`%lO#[-iO'r%lO~O`%lO!d#vO#[-iO'r%lO~O`%lO!d#vO!o-kO#[-iO'r%lO(i'lO~O'w'tO'x'tO'y-rO~Or-sO~O!V'Pa!Y'Pa~P!9zO!X-wO!V'PX!Y'PX~P%[O!Y(QO!V(_a~O!V(_a~PGbO!Y(XO!V(ma~O!P%fO!X-{O![%gO'{%eO!V'VX!Y'VX~O#[-}O!Y(ka!j(ka`(ka'r(ka~O!d#vO~P#+{O!Y(eO!j(ja~O!P%fO![%gO#f.RO'{%eO~Ol.WO!P%fO!X.TO![%gO!{]O#e.VO#f.TO'{%eO!Y'YX!j'YX~O}.[O!k#yO~Og%WOj._O!['[O%c.^O~O`#_i!Y#_i'r#_i'p#_i!V#_i!j#_ir#_i![#_i%c#_i!d#_i~P!9zOj<nO|){O!P)|O(p%OO(q%QO~O#g#Za`#Za#[#Za'r#Za!Y#Za!j#Za![#Za!V#Za~P#.wO#g(WXP(WXZ(WX`(WXn(WX}(WX!h(WX!k(WX!o(WX#j(WX#k(WX#l(WX#m(WX#n(WX#o(WX#p(WX#q(WX#r(WX#t(WX#v(WX#x(WX#y(WX'r(WX(X(WX(i(WX!j(WX!V(WX'p(WXr(WX![(WX%c(WX!d(WX~P!6XO!Y.lOf(bX~P!0}Of.nO~O!Y.oO!j(cX~P!9zO!j.rO~O!V.tO~OP$^O|#zO}#{O!P#|O!i#xO!k#yO!o$^O(XVOZ#ii`#iin#ii!Y#ii!h#ii#k#ii#l#ii#m#ii#n#ii#o#ii#p#ii#q#ii#r#ii#t#ii#v#ii#x#ii#y#ii'r#ii(i#ii(p#ii(q#ii'p#ii!V#ii!j#iir#ii![#ii%c#ii!d#ii~O#j#ii~P#2sO#j$PO~P#2sOP$^O|#zO}#{O!P#|O!i#xO!k#yO!o$^O#j$PO#k$QO#l$QO#m$QO(XVOZ#ii`#ii!Y#ii!h#ii#n#ii#o#ii#p#ii#q#ii#r#ii#t#ii#v#ii#x#ii#y#ii'r#ii(i#ii(p#ii(q#ii'p#ii!V#ii!j#iir#ii![#ii%c#ii!d#ii~On#ii~P#5eOn$RO~P#5eOP$^On$RO|#zO}#{O!P#|O!i#xO!k#yO!o$^O#j$PO#k$QO#l$QO#m$QO#n$SO(XVO`#ii!Y#ii#t#ii#v#ii#x#ii#y#ii'r#ii(i#ii(p#ii(q#ii'p#ii!V#ii!j#iir#ii![#ii%c#ii!d#ii~OZ#ii!h#ii#o#ii#p#ii#q#ii#r#ii~P#8VOZ$eO!h$TO#o$TO#p$TO#q$dO#r$TO~P#8VOP$^OZ$eOn$RO|#zO}#{O!P#|O!h$TO!i#xO!k#yO!o$^O#j$PO#k$QO#l$QO#m$QO#n$SO#o$TO#p$TO#q$dO#r$TO#t$UO(XVO(q$OO`#ii!Y#ii#x#ii#y#ii'r#ii(i#ii(p#ii'p#ii!V#ii!j#iir#ii![#ii%c#ii!d#ii~O#v$WO~P#;WO#v#ii~P#;WOP$^OZ$eOn$RO|#zO}#{O!P#|O!h$TO!i#xO!k#yO!o$^O#j$PO#k$QO#l$QO#m$QO#n$SO#o$TO#p$TO#q$dO#r$TO#t$UO(XVO`#ii!Y#ii#x#ii#y#ii'r#ii(i#ii'p#ii!V#ii!j#iir#ii![#ii%c#ii!d#ii~O#v#ii(p#ii(q#ii~P#=xO#v$WO(p#}O(q$OO~P#=xOP$^OZ$eOn$RO|#zO}#{O!P#|O!h$TO!i#xO!k#yO!o$^O#j$PO#k$QO#l$QO#m$QO#n$SO#o$TO#p$TO#q$dO#r$TO#t$UO#v$WO#x$YO(XVO(p#}O(q$OO~O`#ii!Y#ii#y#ii'r#ii(i#ii'p#ii!V#ii!j#iir#ii![#ii%c#ii!d#ii~P#@pOP[XZ[Xn[X|[X}[X!P[X!h[X!i[X!k[X!o[X#[[X#geX#j[X#k[X#l[X#m[X#n[X#o[X#p[X#q[X#r[X#t[X#v[X#x[X#y[X$O[X(X[X(i[X(p[X(q[X!Y[X!Z[X~O#|[X~P#CZOP$^OZ;QOn:tO|#zO}#{O!P#|O!h:vO!i#xO!k#yO!o$^O#j:rO#k:sO#l:sO#m:sO#n:uO#o:vO#p:vO#q;PO#r:vO#t:wO#v:yO#x:{O#y:|O(XVO(i$[O(p#}O(q$OO~O#|.vO~P#EhO#[;RO$O;RO#|(^X!Z(^X~P! [O`']a!Y']a'r']a'p']a!j']a!V']ar']a![']a%c']a!d']a~P!9zOP#iiZ#ii`#iin#ii}#ii!Y#ii!h#ii!i#ii!k#ii!o#ii#j#ii#k#ii#l#ii#m#ii#n#ii#o#ii#p#ii#q#ii#r#ii#t#ii#v#ii#x#ii#y#ii'r#ii(X#ii(i#ii'p#ii!V#ii!j#iir#ii![#ii%c#ii!d#ii~P#.wO`#}i!Y#}i'r#}i'p#}i!V#}i!j#}ir#}i![#}i%c#}i!d#}i~P!9zO$Y.{O$[.{O~O$Y.|O$[.|O~O!d)dO#[.}O![$`X$W$`X$Y$`X$[$`X$c$`X~O!X/OO~O![)gO$W/QO$Y)fO$[)fO$c/RO~O!Y:}O!Z(]X~P#EhO!Z/SO~O!d)dO$c(rX~O$c/UO~Ot)vO(Y)wO(Z/XO~O!V/]O~P!&dO(p%OOj%Za|%Za!P%Za(q%Za!Y%Za#[%Za~Of%Za#|%Za~P#MxO(q%QOj%]a|%]a!P%]a(p%]a!Y%]a#[%]a~Of%]a#|%]a~P#NkO!YeX!deX!jeX!j$uX(ieX~P!/tO!X/fO!Y(XO'{/eO!V(mP!V(wP~P!1lOn*oO!_*mO!`*fO!a*fO!k*^O#W*nO%Y*iO'|!lO~Oo'WO!P/gO!X+UO!Z*lO'}TO(QUO([;aO!Z(oP~P$!UO!j/hO~P#.wO!Y/iO!d#vO(i'lO!j(vX~O!j/nO~O!P%fO!X*ZO![%gO'{%eO!j(vP~O#g/pO~O!V$uX!Y$uX!d$|X~P!/tO!Y/qO!V(wX~P#.wO!d/sO~O!V/uO~Og%WOn/yO!d#vO!k%cO(i'lO~O'{/{O~O!d+cO~O`%lO!Y0PO'r%lO~O!Z0RO~P!5`O!`0SO!a0SO'|!lO([!mO~O!P0UO([!mO~O#W0VO~Of%Za!Y%Za#[%Za#|%Za~P!0}Of%]a!Y%]a#[%]a#|%]a~P!0}O'{&VOf'fX!Y'fX~O!Y*uOf(Ua~Of0`O~O|0aO}0aO!P0bOjya(pya(qya!Yya#[ya~Ofya#|ya~P$'wO|){O!P)|Oj$na(p$na(q$na!Y$na#[$na~Of$na#|$na~P$(mO|){O!P)|Oj$pa(p$pa(q$pa!Y$pa#[$pa~Of$pa#|$pa~P$)`O#g0dO~Of%Oa!Y%Oa#[%Oa#|%Oa~P!0}O!d#vO~O#g0gO~O!Y+WO`({a'r({a~O|#zO}#{O!P#|O!i#xO!k#yO(XVOP!qiZ!qin!qi!Y!qi!h!qi!o!qi#j!qi#k!qi#l!qi#m!qi#n!qi#o!qi#p!qi#q!qi#r!qi#t!qi#v!qi#x!qi#y!qi(i!qi(p!qi(q!qi~O`!qi'r!qi'p!qi!V!qi!j!qir!qi![!qi%c!qi!d!qi~P$*}Og%WOn$uOo$tOp$tOv%YOx%ZOz;WO!P$|O![$}O!f<hO!k$yO#f;^O$T%_O$o;YO$q;[O$t%`O'}TO(QUO(X$vO(p%OO(q%QO~Ol0qO'{0pO~P$-hO!d+cO`(Ta![(Ta'r(Ta!Y(Ta~O#g0wO~OZ[X!YeX!ZeX~O!Y0xO!Z)PX~O!Z0zO~OZ0{O~Oa0}O'{+kO'}TO(QUO~O![%|O'{%eO_'nX!Y'nX~O!Y+pO_)Oa~O!j1QO~P!9zOZ1TO~O_1UO~O#[1XO~Oj1[O![$}O~O([(yO!Z(|P~Og%WOj1eO![1bO%c1dO~OZ1oO!Y1mO!Z(}X~O!Z1pO~O_1rO`%lO'r%lO~O'{#nO'}TO(QUO~O#[$fO$O$fOP(^XZ(^Xn(^X|(^X}(^X!P(^X!Y(^X!h(^X!k(^X!o(^X#j(^X#k(^X#l(^X#m(^X#n(^X#o(^X#p(^X#q(^X#t(^X#v(^X#x(^X#y(^X(X(^X(i(^X(p(^X(q(^X~O#r1uO&T1vO`(^X!i(^X~P$3OO#[$fO#r1uO&T1vO~O`1xO~P%[O`1zO~O&^1}OP&[iQ&[iR&[iX&[i`&[ic&[id&[il&[in&[io&[ip&[iv&[ix&[iz&[i!P&[i!T&[i!U&[i![&[i!f&[i!k&[i!n&[i!o&[i!p&[i!r&[i!t&[i!w&[i!{&[i#s&[i$T&[i%b&[i%d&[i%f&[i%g&[i%h&[i%k&[i%m&[i%p&[i%q&[i%s&[i&P&[i&V&[i&X&[i&Z&[i&]&[i&`&[i&f&[i&l&[i&n&[i&p&[i&r&[i&t&[i'p&[i'{&[i'}&[i(Q&[i(X&[i(g&[i(u&[i!Z&[ia&[i&c&[i~Oa2TO!Z2RO&c2SO~P`O![XO!k2VO~O&j,sOP&eiQ&eiR&eiX&ei`&eic&eid&eil&ein&eio&eip&eiv&eix&eiz&ei!P&ei!T&ei!U&ei![&ei!f&ei!k&ei!n&ei!o&ei!p&ei!r&ei!t&ei!w&ei!{&ei#s&ei$T&ei%b&ei%d&ei%f&ei%g&ei%h&ei%k&ei%m&ei%p&ei%q&ei%s&ei&P&ei&V&ei&X&ei&Z&ei&]&ei&`&ei&f&ei&l&ei&n&ei&p&ei&r&ei&t&ei'p&ei'{&ei'}&ei(Q&ei(X&ei(g&ei(u&ei!Z&ei&^&eia&ei&c&ei~O!V2]O~O!Y!^a!Z!^a~P#EhOo!nO!P!oO!X2cO([!mO!Y'QX!Z'QX~P@UO!Y-TO!Z(`a~O!Y'WX!Z'WX~P!9SO!Y-WO!Z(oa~O!Z2jO~P'_O`%lO#[2sO'r%lO~O`%lO!d#vO#[2sO'r%lO~O`%lO!d#vO!o2wO#[2sO'r%lO(i'lO~O`%lO'r%lO~P!9zO!Y$bOr$ma~O!V'Pi!Y'Pi~P!9zO!Y(QO!V(_i~O!Y(XO!V(mi~O!V(ni!Y(ni~P!9zO!Y(ki!j(ki`(ki'r(ki~P!9zO#[2yO!Y(ki!j(ki`(ki'r(ki~O!Y(eO!j(ji~O!P%fO![%gO!{]O#e3OO#f2}O'{%eO~O!P%fO![%gO#f2}O'{%eO~Oj3VO!['[O%c3UO~Og%WOj3VO!['[O%c3UO~O#g%ZaP%ZaZ%Za`%Zan%Za}%Za!h%Za!i%Za!k%Za!o%Za#j%Za#k%Za#l%Za#m%Za#n%Za#o%Za#p%Za#q%Za#r%Za#t%Za#v%Za#x%Za#y%Za'r%Za(X%Za(i%Za!j%Za!V%Za'p%Zar%Za![%Za%c%Za!d%Za~P#MxO#g%]aP%]aZ%]a`%]an%]a}%]a!h%]a!i%]a!k%]a!o%]a#j%]a#k%]a#l%]a#m%]a#n%]a#o%]a#p%]a#q%]a#r%]a#t%]a#v%]a#x%]a#y%]a'r%]a(X%]a(i%]a!j%]a!V%]a'p%]ar%]a![%]a%c%]a!d%]a~P#NkO#g%ZaP%ZaZ%Za`%Zan%Za}%Za!Y%Za!h%Za!i%Za!k%Za!o%Za#j%Za#k%Za#l%Za#m%Za#n%Za#o%Za#p%Za#q%Za#r%Za#t%Za#v%Za#x%Za#y%Za'r%Za(X%Za(i%Za!j%Za!V%Za'p%Za#[%Zar%Za![%Za%c%Za!d%Za~P#.wO#g%]aP%]aZ%]a`%]an%]a}%]a!Y%]a!h%]a!i%]a!k%]a!o%]a#j%]a#k%]a#l%]a#m%]a#n%]a#o%]a#p%]a#q%]a#r%]a#t%]a#v%]a#x%]a#y%]a'r%]a(X%]a(i%]a!j%]a!V%]a'p%]a#[%]ar%]a![%]a%c%]a!d%]a~P#.wO#gyaPyaZya`yanya!hya!iya!kya!oya#jya#kya#lya#mya#nya#oya#pya#qya#rya#tya#vya#xya#yya'rya(Xya(iya!jya!Vya'pyarya![ya%cya!dya~P$'wO#g$naP$naZ$na`$nan$na}$na!h$na!i$na!k$na!o$na#j$na#k$na#l$na#m$na#n$na#o$na#p$na#q$na#r$na#t$na#v$na#x$na#y$na'r$na(X$na(i$na!j$na!V$na'p$nar$na![$na%c$na!d$na~P$(mO#g$paP$paZ$pa`$pan$pa}$pa!h$pa!i$pa!k$pa!o$pa#j$pa#k$pa#l$pa#m$pa#n$pa#o$pa#p$pa#q$pa#r$pa#t$pa#v$pa#x$pa#y$pa'r$pa(X$pa(i$pa!j$pa!V$pa'p$par$pa![$pa%c$pa!d$pa~P$)`O#g%OaP%OaZ%Oa`%Oan%Oa}%Oa!Y%Oa!h%Oa!i%Oa!k%Oa!o%Oa#j%Oa#k%Oa#l%Oa#m%Oa#n%Oa#o%Oa#p%Oa#q%Oa#r%Oa#t%Oa#v%Oa#x%Oa#y%Oa'r%Oa(X%Oa(i%Oa!j%Oa!V%Oa'p%Oa#[%Oar%Oa![%Oa%c%Oa!d%Oa~P#.wO`#_q!Y#_q'r#_q'p#_q!V#_q!j#_qr#_q![#_q%c#_q!d#_q~P!9zOf'RX!Y'RX~P!(SO!Y.lOf(ba~O!X3aO!Y'SX!j'SX~P%[O!Y.oO!j(ca~O!Y.oO!j(ca~P!9zO!V3dO~O#|!ma!Z!ma~PKOO#|!ea!Y!ea!Z!ea~P#EhO#|!qa!Z!qa~P!<eO#|!sa!Z!sa~P!?OORfO![3vO$a3wO~O!Z3{O~Or3|O~P#.wO`$jq!Y$jq'r$jq'p$jq!V$jq!j$jqr$jq![$jq%c$jq!d$jq~P!9zO!V3}O~P#.wO|){O!P)|O(q%QOj'ba(p'ba!Y'ba#['ba~Of'ba#|'ba~P%,rO|){O!P)|Oj'da(p'da(q'da!Y'da#['da~Of'da#|'da~P%-eO(i$[O~P#.wO!VeX!V$uX!YeX!Y$uX!d$|X#[eX~P!/tO'{;jO~P!1lOlkO'{4PO~P.iO!P%fO!X4RO![%gO'{%eO!Y'^X!j'^X~O!Y/iO!j(va~O!Y/iO!d#vO!j(va~O!Y/iO!d#vO(i'lO!j(va~Of$wi!Y$wi#[$wi#|$wi~P!0}O!X4ZO!V'`X!Y'`X~P!3kO!Y/qO!V(wa~O!Y/qO!V(wa~P#.wO!d#vO#r4cO~On4fO!d#vO(i'lO~O(p%OOj%Zi|%Zi!P%Zi(q%Zi!Y%Zi#[%Zi~Of%Zi#|%Zi~P%1sO(q%QOj%]i|%]i!P%]i(p%]i!Y%]i#[%]i~Of%]i#|%]i~P%2fOf(Vi!Y(Vi~P!0}O#[4mOf(Vi!Y(Vi~P!0}O!j4pO~O`$kq!Y$kq'r$kq'p$kq!V$kq!j$kqr$kq![$kq%c$kq!d$kq~P!9zO!V4tO~O!Y4uO![(xX~P#.wO!i#xO~P4XO`$uX![$uX%W[X'r$uX!Y$uX~P!/tO%W4wO`kXjkX|kX!PkX![kX'rkX(pkX(qkX!YkX~O%W4wO~Oa4}O%d5OO'{+kO'}TO(QUO!Y'mX!Z'mX~O!Y0xO!Z)Pa~OZ5SO~O_5TO~O`%lO'r%lO~P#.wO![$}O~P#.wO!Y5]O#[5_O!Z(|X~O!Z5`O~Oo!nO!P5aO!_!yO!`!vO!a!vO!{:jO#P!pO#Q!pO#R!pO#S!pO#T!pO#W5fO#X!zO'|!lO'}TO(QUO([!mO(g!sO~O!Z5eO~P%7wOj5kO![1bO%c5jO~Og%WOj5kO![1bO%c5jO~Oa5rO'{#nO'}TO(QUO!Y'lX!Z'lX~O!Y1mO!Z(}a~O'}TO(QUO([5tO~O_5xO~O#r5{O&T5|O~PMnO!j5}O~P%[O`6PO~O`6PO~P%[Oa2TO!Z6UO&c2SO~P`O!d6WO~O!d6YOg(ai!Y(ai!Z(ai!d(ai!k(ai~O!Y#di!Z#di~P#EhO#[6ZO!Y#di!Z#di~O!Y!^i!Z!^i~P#EhO`%lO#[6dO'r%lO~O`%lO!d#vO#[6dO'r%lO~O!Y(kq!j(kq`(kq'r(kq~P!9zO!Y(eO!j(jq~O!P%fO![%gO#f6kO'{%eO~O!['[O%c6nO~Oj6qO!['[O%c6nO~O#g'baP'baZ'ba`'ban'ba}'ba!h'ba!i'ba!k'ba!o'ba#j'ba#k'ba#l'ba#m'ba#n'ba#o'ba#p'ba#q'ba#r'ba#t'ba#v'ba#x'ba#y'ba'r'ba(X'ba(i'ba!j'ba!V'ba'p'bar'ba!['ba%c'ba!d'ba~P%,rO#g'daP'daZ'da`'dan'da}'da!h'da!i'da!k'da!o'da#j'da#k'da#l'da#m'da#n'da#o'da#p'da#q'da#r'da#t'da#v'da#x'da#y'da'r'da(X'da(i'da!j'da!V'da'p'dar'da!['da%c'da!d'da~P%-eO#g$wiP$wiZ$wi`$win$wi}$wi!Y$wi!h$wi!i$wi!k$wi!o$wi#j$wi#k$wi#l$wi#m$wi#n$wi#o$wi#p$wi#q$wi#r$wi#t$wi#v$wi#x$wi#y$wi'r$wi(X$wi(i$wi!j$wi!V$wi'p$wi#[$wir$wi![$wi%c$wi!d$wi~P#.wO#g%ZiP%ZiZ%Zi`%Zin%Zi}%Zi!h%Zi!i%Zi!k%Zi!o%Zi#j%Zi#k%Zi#l%Zi#m%Zi#n%Zi#o%Zi#p%Zi#q%Zi#r%Zi#t%Zi#v%Zi#x%Zi#y%Zi'r%Zi(X%Zi(i%Zi!j%Zi!V%Zi'p%Zir%Zi![%Zi%c%Zi!d%Zi~P%1sO#g%]iP%]iZ%]i`%]in%]i}%]i!h%]i!i%]i!k%]i!o%]i#j%]i#k%]i#l%]i#m%]i#n%]i#o%]i#p%]i#q%]i#r%]i#t%]i#v%]i#x%]i#y%]i'r%]i(X%]i(i%]i!j%]i!V%]i'p%]ir%]i![%]i%c%]i!d%]i~P%2fOf'Ra!Y'Ra~P!0}O!Y'Sa!j'Sa~P!9zO!Y.oO!j(ci~O#|#_i!Y#_i!Z#_i~P#EhOP$^O|#zO}#{O!P#|O!i#xO!k#yO!o$^O(XVOZ#iin#ii!h#ii#k#ii#l#ii#m#ii#n#ii#o#ii#p#ii#q#ii#r#ii#t#ii#v#ii#x#ii#y#ii#|#ii(i#ii(p#ii(q#ii!Y#ii!Z#ii~O#j#ii~P%JwO#j:rO~P%JwOP$^O|#zO}#{O!P#|O!i#xO!k#yO!o$^O#j:rO#k:sO#l:sO#m:sO(XVOZ#ii!h#ii#n#ii#o#ii#p#ii#q#ii#r#ii#t#ii#v#ii#x#ii#y#ii#|#ii(i#ii(p#ii(q#ii!Y#ii!Z#ii~On#ii~P%MSOn:tO~P%MSOP$^On:tO|#zO}#{O!P#|O!i#xO!k#yO!o$^O#j:rO#k:sO#l:sO#m:sO#n:uO(XVO#t#ii#v#ii#x#ii#y#ii#|#ii(i#ii(p#ii(q#ii!Y#ii!Z#ii~OZ#ii!h#ii#o#ii#p#ii#q#ii#r#ii~P& _OZ;QO!h:vO#o:vO#p:vO#q;PO#r:vO~P& _OP$^OZ;QOn:tO|#zO}#{O!P#|O!h:vO!i#xO!k#yO!o$^O#j:rO#k:sO#l:sO#m:sO#n:uO#o:vO#p:vO#q;PO#r:vO#t:wO(XVO(q$OO#x#ii#y#ii#|#ii(i#ii(p#ii!Y#ii!Z#ii~O#v:yO~P&#yO#v#ii~P&#yOP$^OZ;QOn:tO|#zO}#{O!P#|O!h:vO!i#xO!k#yO!o$^O#j:rO#k:sO#l:sO#m:sO#n:uO#o:vO#p:vO#q;PO#r:vO#t:wO(XVO#x#ii#y#ii#|#ii(i#ii!Y#ii!Z#ii~O#v#ii(p#ii(q#ii~P&&UO#v:yO(p#}O(q$OO~P&&UOP$^OZ;QOn:tO|#zO}#{O!P#|O!h:vO!i#xO!k#yO!o$^O#j:rO#k:sO#l:sO#m:sO#n:uO#o:vO#p:vO#q;PO#r:vO#t:wO#v:yO#x:{O(XVO(p#}O(q$OO~O#y#ii#|#ii(i#ii!Y#ii!Z#ii~P&(gO`#zy!Y#zy'r#zy'p#zy!V#zy!j#zyr#zy![#zy%c#zy!d#zy~P!9zOj<oO|){O!P)|O(p%OO(q%QO~OP#iiZ#iin#ii}#ii!h#ii!i#ii!k#ii!o#ii#j#ii#k#ii#l#ii#m#ii#n#ii#o#ii#p#ii#q#ii#r#ii#t#ii#v#ii#x#ii#y#ii#|#ii(X#ii(i#ii!Y#ii!Z#ii~P&+_O!i#xOP(WXZ(WXj(WXn(WX|(WX}(WX!P(WX!h(WX!k(WX!o(WX#j(WX#k(WX#l(WX#m(WX#n(WX#o(WX#p(WX#q(WX#r(WX#t(WX#v(WX#x(WX#y(WX#|(WX(X(WX(i(WX(p(WX(q(WX!Y(WX!Z(WX~O#|#}i!Y#}i!Z#}i~P#EhO#|!qi!Z!qi~P$*}O!Z7TO~O!Y']a!Z']a~P#EhOP[XZ[Xn[X|[X}[X!P[X!V[X!Y[X!h[X!i[X!k[X!o[X#[[X#geX#j[X#k[X#l[X#m[X#n[X#o[X#p[X#q[X#r[X#t[X#v[X#x[X#y[X$O[X(X[X(i[X(p[X(q[X~O!d%TX#r%TX~P&0aO!d#vO(i'lO!Y'^a!j'^a~O!Y/iO!j(vi~O!Y/iO!d#vO!j(vi~Of$wq!Y$wq#[$wq#|$wq~P!0}O!V'`a!Y'`a~P#.wO!d7[O~O!Y/qO!V(wi~P#.wO!Y/qO!V(wi~O!V7`O~O!d#vO#r7eO~On7fO!d#vO(i'lO~O|){O!P)|O(q%QOj'ca(p'ca!Y'ca#['ca~Of'ca#|'ca~P&5PO|){O!P)|Oj'ea(p'ea(q'ea!Y'ea#['ea~Of'ea#|'ea~P&5rO!V7hO~Of$yq!Y$yq#[$yq#|$yq~P!0}O`$ky!Y$ky'r$ky'p$ky!V$ky!j$kyr$ky![$ky%c$ky!d$ky~P!9zO!d6YO~O!Y4uO![(xa~O`#_y!Y#_y'r#_y'p#_y!V#_y!j#_yr#_y![#_y%c#_y!d#_y~P!9zOZ7mO~Oa7oO'{+kO'}TO(QUO~O!Y0xO!Z)Pi~O_7sO~O([(yO!Y'iX!Z'iX~O!Y5]O!Z(|a~O!Z7|O~P%7wOo!nO!P7}O'}TO(QUO([!mO(g!sO~O![1bO~O![1bO%c8PO~Oj8SO![1bO%c8PO~OZ8XO!Y'la!Z'la~O!Y1mO!Z(}i~O!j8]O~O!j8^O~O!j8aO~O!j8aO~P%[O`8cO~O!d8dO~O!j8eO~O!Y(ni!Z(ni~P#EhO`%lO#[8mO'r%lO~O!Y(ky!j(ky`(ky'r(ky~P!9zO!Y(eO!j(jy~O!['[O%c8pO~O#g$wqP$wqZ$wq`$wqn$wq}$wq!Y$wq!h$wq!i$wq!k$wq!o$wq#j$wq#k$wq#l$wq#m$wq#n$wq#o$wq#p$wq#q$wq#r$wq#t$wq#v$wq#x$wq#y$wq'r$wq(X$wq(i$wq!j$wq!V$wq'p$wq#[$wqr$wq![$wq%c$wq!d$wq~P#.wO#g'caP'caZ'ca`'can'ca}'ca!h'ca!i'ca!k'ca!o'ca#j'ca#k'ca#l'ca#m'ca#n'ca#o'ca#p'ca#q'ca#r'ca#t'ca#v'ca#x'ca#y'ca'r'ca(X'ca(i'ca!j'ca!V'ca'p'car'ca!['ca%c'ca!d'ca~P&5PO#g'eaP'eaZ'ea`'ean'ea}'ea!h'ea!i'ea!k'ea!o'ea#j'ea#k'ea#l'ea#m'ea#n'ea#o'ea#p'ea#q'ea#r'ea#t'ea#v'ea#x'ea#y'ea'r'ea(X'ea(i'ea!j'ea!V'ea'p'ear'ea!['ea%c'ea!d'ea~P&5rO#g$yqP$yqZ$yq`$yqn$yq}$yq!Y$yq!h$yq!i$yq!k$yq!o$yq#j$yq#k$yq#l$yq#m$yq#n$yq#o$yq#p$yq#q$yq#r$yq#t$yq#v$yq#x$yq#y$yq'r$yq(X$yq(i$yq!j$yq!V$yq'p$yq#[$yqr$yq![$yq%c$yq!d$yq~P#.wO!Y'Si!j'Si~P!9zO#|#_q!Y#_q!Z#_q~P#EhO(p%OOP%ZaZ%Zan%Za}%Za!h%Za!i%Za!k%Za!o%Za#j%Za#k%Za#l%Za#m%Za#n%Za#o%Za#p%Za#q%Za#r%Za#t%Za#v%Za#x%Za#y%Za#|%Za(X%Za(i%Za!Y%Za!Z%Za~Oj%Za|%Za!P%Za(q%Za~P&F}O(q%QOP%]aZ%]an%]a}%]a!h%]a!i%]a!k%]a!o%]a#j%]a#k%]a#l%]a#m%]a#n%]a#o%]a#p%]a#q%]a#r%]a#t%]a#v%]a#x%]a#y%]a#|%]a(X%]a(i%]a!Y%]a!Z%]a~Oj%]a|%]a!P%]a(p%]a~P&IUOj<oO|){O!P)|O(q%QO~P&F}Oj<oO|){O!P)|O(p%OO~P&IUO|0aO}0aO!P0bOPyaZyajyanya!hya!iya!kya!oya#jya#kya#lya#mya#nya#oya#pya#qya#rya#tya#vya#xya#yya#|ya(Xya(iya(pya(qya!Yya!Zya~O|){O!P)|OP$naZ$naj$nan$na}$na!h$na!i$na!k$na!o$na#j$na#k$na#l$na#m$na#n$na#o$na#p$na#q$na#r$na#t$na#v$na#x$na#y$na#|$na(X$na(i$na(p$na(q$na!Y$na!Z$na~O|){O!P)|OP$paZ$paj$pan$pa}$pa!h$pa!i$pa!k$pa!o$pa#j$pa#k$pa#l$pa#m$pa#n$pa#o$pa#p$pa#q$pa#r$pa#t$pa#v$pa#x$pa#y$pa#|$pa(X$pa(i$pa(p$pa(q$pa!Y$pa!Z$pa~OP%OaZ%Oan%Oa}%Oa!h%Oa!i%Oa!k%Oa!o%Oa#j%Oa#k%Oa#l%Oa#m%Oa#n%Oa#o%Oa#p%Oa#q%Oa#r%Oa#t%Oa#v%Oa#x%Oa#y%Oa#|%Oa(X%Oa(i%Oa!Y%Oa!Z%Oa~P&+_O#|$jq!Y$jq!Z$jq~P#EhO#|$kq!Y$kq!Z$kq~P#EhO!Z8|O~O#|8}O~P!0}O!d#vO!Y'^i!j'^i~O!d#vO(i'lO!Y'^i!j'^i~O!Y/iO!j(vq~O!V'`i!Y'`i~P#.wO!Y/qO!V(wq~O!V9TO~P#.wO!V9TO~Of(Vy!Y(Vy~P!0}O!Y'ga!['ga~P#.wO`%Vq![%Vq'r%Vq!Y%Vq~P#.wOZ9YO~O!Y0xO!Z)Pq~O#[9^O!Y'ia!Z'ia~O!Y5]O!Z(|i~P#EhO![1bO%c9bO~O'}TO(QUO([9gO~O!Y1mO!Z(}q~O!j9jO~O!j9kO~O!j9lO~O!j9lO~P%[O#[9oO!Y#dy!Z#dy~O!Y#dy!Z#dy~P#EhO!['[O%c9tO~O#|#zy!Y#zy!Z#zy~P#EhOP$wiZ$win$wi}$wi!h$wi!i$wi!k$wi!o$wi#j$wi#k$wi#l$wi#m$wi#n$wi#o$wi#p$wi#q$wi#r$wi#t$wi#v$wi#x$wi#y$wi#|$wi(X$wi(i$wi!Y$wi!Z$wi~P&+_O|){O!P)|O(q%QOP'baZ'baj'ban'ba}'ba!h'ba!i'ba!k'ba!o'ba#j'ba#k'ba#l'ba#m'ba#n'ba#o'ba#p'ba#q'ba#r'ba#t'ba#v'ba#x'ba#y'ba#|'ba(X'ba(i'ba(p'ba!Y'ba!Z'ba~O|){O!P)|OP'daZ'daj'dan'da}'da!h'da!i'da!k'da!o'da#j'da#k'da#l'da#m'da#n'da#o'da#p'da#q'da#r'da#t'da#v'da#x'da#y'da#|'da(X'da(i'da(p'da(q'da!Y'da!Z'da~O(p%OOP%ZiZ%Zij%Zin%Zi|%Zi}%Zi!P%Zi!h%Zi!i%Zi!k%Zi!o%Zi#j%Zi#k%Zi#l%Zi#m%Zi#n%Zi#o%Zi#p%Zi#q%Zi#r%Zi#t%Zi#v%Zi#x%Zi#y%Zi#|%Zi(X%Zi(i%Zi(q%Zi!Y%Zi!Z%Zi~O(q%QOP%]iZ%]ij%]in%]i|%]i}%]i!P%]i!h%]i!i%]i!k%]i!o%]i#j%]i#k%]i#l%]i#m%]i#n%]i#o%]i#p%]i#q%]i#r%]i#t%]i#v%]i#x%]i#y%]i#|%]i(X%]i(i%]i(p%]i!Y%]i!Z%]i~O#|$ky!Y$ky!Z$ky~P#EhO#|#_y!Y#_y!Z#_y~P#EhO!d#vO!Y'^q!j'^q~O!Y/iO!j(vy~O!V'`q!Y'`q~P#.wO!V9}O~P#.wO!Y0xO!Z)Py~O!Y5]O!Z(|q~O![1bO%c:UO~O!j:XO~O!['[O%c:^O~OP$wqZ$wqn$wq}$wq!h$wq!i$wq!k$wq!o$wq#j$wq#k$wq#l$wq#m$wq#n$wq#o$wq#p$wq#q$wq#r$wq#t$wq#v$wq#x$wq#y$wq#|$wq(X$wq(i$wq!Y$wq!Z$wq~P&+_O|){O!P)|O(q%QOP'caZ'caj'can'ca}'ca!h'ca!i'ca!k'ca!o'ca#j'ca#k'ca#l'ca#m'ca#n'ca#o'ca#p'ca#q'ca#r'ca#t'ca#v'ca#x'ca#y'ca#|'ca(X'ca(i'ca(p'ca!Y'ca!Z'ca~O|){O!P)|OP'eaZ'eaj'ean'ea}'ea!h'ea!i'ea!k'ea!o'ea#j'ea#k'ea#l'ea#m'ea#n'ea#o'ea#p'ea#q'ea#r'ea#t'ea#v'ea#x'ea#y'ea#|'ea(X'ea(i'ea(p'ea(q'ea!Y'ea!Z'ea~OP$yqZ$yqn$yq}$yq!h$yq!i$yq!k$yq!o$yq#j$yq#k$yq#l$yq#m$yq#n$yq#o$yq#p$yq#q$yq#r$yq#t$yq#v$yq#x$yq#y$yq#|$yq(X$yq(i$yq!Y$yq!Z$yq~P&+_Of%_!Z!Y%_!Z#[%_!Z#|%_!Z~P!0}O!Y'iq!Z'iq~P#EhO!Y#d!Z!Z#d!Z~P#EhO#g%_!ZP%_!ZZ%_!Z`%_!Zn%_!Z}%_!Z!Y%_!Z!h%_!Z!i%_!Z!k%_!Z!o%_!Z#j%_!Z#k%_!Z#l%_!Z#m%_!Z#n%_!Z#o%_!Z#p%_!Z#q%_!Z#r%_!Z#t%_!Z#v%_!Z#x%_!Z#y%_!Z'r%_!Z(X%_!Z(i%_!Z!j%_!Z!V%_!Z'p%_!Z#[%_!Zr%_!Z![%_!Z%c%_!Z!d%_!Z~P#.wOP%_!ZZ%_!Zn%_!Z}%_!Z!h%_!Z!i%_!Z!k%_!Z!o%_!Z#j%_!Z#k%_!Z#l%_!Z#m%_!Z#n%_!Z#o%_!Z#p%_!Z#q%_!Z#r%_!Z#t%_!Z#v%_!Z#x%_!Z#y%_!Z#|%_!Z(X%_!Z(i%_!Z!Y%_!Z!Z%_!Z~P&+_Or(]X~P1qO'|!lO~P!*fO!VeX!YeX#[eX~P&0aOP[XZ[Xn[X|[X}[X!P[X!Y[X!YeX!h[X!i[X!k[X!o[X#[[X#[eX#geX#j[X#k[X#l[X#m[X#n[X#o[X#p[X#q[X#r[X#t[X#v[X#x[X#y[X$O[X(X[X(i[X(p[X(q[X~O!deX!j[X!jeX(ieX~P'EROP:iOQ:iORfOc<dOd!iOlkOn:iOokOpkOvkOx:iOz:iO!PWO!TkO!UkO![XO!f:lO!kZO!n:iO!o:iO!p:iO!r:mO!t:pO!w!hO$T!kO'{)ZO'}TO(QUO(XVO(g[O(u<bO~O!Y:}O!Z$ma~Og%WOl%XOn$uOo$tOp$tOv%YOx%ZOz;XO!P$|O![$}O!f<iO!k$yO#f;_O$T%_O$o;ZO$q;]O$t%`O'{(qO'}TO(QUO(X$vO(p%OO(q%QO~O#s)bO~P'IwOn!bX(i!bX~P# qO!Z[X!ZeX~P'ERO!VeX!V$uX!YeX!Y$uX#[eX~P!/tO#g:qO~O!d#vO#g:qO~O#[;RO~O#r:vO~O#[;bO!Y(nX!Z(nX~O#[;RO!Y(lX!Z(lX~O#g;cO~Of;eO~P!0}O#g;kO~O#g;lO~O!d#vO#g;mO~O!d#vO#g;cO~O#|;nO~P#EhO#g;oO~O#g;pO~O#g;uO~O#g;vO~O#g;wO~O#g;xO~O#|;yO~P!0}O#|;zO~P!0}O!i#P#Q#S#T#W#e#f#q(u$o$q$t%W%b%c%d%k%m%p%q%s%u~'vS#k!U't'|#lo#j#mn|'u$Y'u'{$[([~",
  goto: "$4`)TPPPPP)UPP)XP)jP*z/PPPPP5wPP6_PP<U?kP@OP@OPPP@OPBOP@OP@OP@OPBSPPBXPBsPGlPPPGpPPPPGpJrPPPJxKtPGpPNSPPPP!!bGpPPPGpPGpP!$pGpP!(V!)X!)bP!*U!*Y!*UPPPPP!-f!)XPP!-v!.pP!1dGpGp!1i!4t!9[!9[!=YPPP!=bGpPPPPPPPPPPP!@pP!A}PPGp!C`PGpPGpGpGpGpPGp!DrP!G{P!KQP!KU!K`!Kd!KdP!GxP!Kh!KhP!NmP!NqGpGp!Nw##{@OP@OP@O@OP#%X@O@O#'c@O#*R@O#,V@O@O#,u#/R#/R#/W#/a#/R#/jP#/RP@O#0S@O#3s@O@O5wPPP#7jPPP#8T#8TP#8TP#8k#8TPP#8qP#8hP#8h#9U#8h#9p#9v5t)X#9y)XP#:Q#:Q#:QP)XP)XP)XP)XPP)XP#:W#:ZP#:Z)XP#:_P#:bP)XP)XP)XP)XP)XP)X)XPP#:h#:n#:y#;P#;V#;]#;c#;q#;w#;}#<X#<_#<i#<y#=P#=q#>T#>Z#>a#>o#?U#@s#AR#AY#Bn#B|#Dh#Dv#D|#ES#EY#Ed#Ej#Ep#Ez#F^#FdPPPPPPPPPP#FjPPPPPPP#G_#Jf#Ku#K|#LUPPPP$#[$&S$,l$,o$,r$-_$-b$-e$-l$-tP$-zP$.h$.l$/d$0r$0w$1_PP$1d$1j$1nP$1q$1u$1y$2o$3W$3o$3s$3v$3y$4P$4S$4W$4[R!|RoqOXst!Z#d%k&n&p&q&s,k,p1}2QY!vQ'[-]1b5dQ%qvQ%yyQ&Q|Q&f!VS'S!e-TQ'b!iS'h!r!yU*f$}*W*kQ+i%zQ+v&SQ,[&`Q-Z'ZQ-e'cQ-m'iQ0S*mQ1l,]R;`:m%QdOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#y#|$P$Q$R$S$T$U$V$W$X$Y$Z$b$f%k%q&O&g&j&n&p&q&s&w'P'^'n(O(Q(W(_(s(w({)z+R+V,h,k,p-a-i-w-}.o.v/g0b0g0w1e1u1v1x1z1}2Q2S2s2y3a5a5k5{5|6P6d7}8S8c8mS#q]:j!r)]$]$n'T)o,|-P/O2c3v5_6Z9^9o:i:l:m:p:q:r:s:t:u:v:w:x:y:z:{:|:};R;`;b;c;e;m;n;w;x<eQ*x%[Q+n%|Q,^&cQ,e&kQ.f;WQ0n+aQ0r+cQ0}+oQ1t,cQ3R._Q4}0xQ5r1mQ6p3VQ6|;XQ7o5OR8s6q'OkOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#y#|$P$Q$R$S$T$U$V$W$X$Y$Z$]$b$f$n%k%q&O&g&j&k&n&p&q&s&w'P'T'^'n(O(Q(W(_(s(w({)o)z+R+V+a,h,k,p,|-P-a-i-w-}._.o.v/O/g0b0g0w1e1u1v1x1z1}2Q2S2c2s2y3V3a3v5_5a5k5{5|6P6Z6d6q7}8S8c8m9^9o:i:l:m:p:q:r:s:t:u:v:w:x:y:z:{:|:};R;`;b;c;e;m;n;w;x<et!nQ!r!v!y!z'S'Z'['h'i'j-T-Z-]-m1b5d5f$z$ti#v#x$d$e$y$|%P%R%]%^%b)v)|*O*Q*S*V*]*c*s*t+`+c+z+}.^.l/^/f/p/q/s0W0Y0d1X1[1d3U4O4Z4c4m4u4w5j6n7[7e8P8p8}9b9t:U:^;P;Q;S;T;U;V;Y;Z;[;];^;_;f;g;h;i;k;l;o;p;q;r;s;t;u;v;y;z<b<j<k<n<oQ&T|Q'Q!eU'W%g*W-WQ+n%|Q,^&cQ0c*|Q0}+oQ1S+uQ1s,bQ1t,cQ4}0xQ5W1UQ5r1mQ5u1oQ5v1rQ7o5OQ7r5TQ8[5xQ9]7sR9h8XrnOXst!V!Z#d%k&e&n&p&q&s,k,p1}2QR,`&g&x^OPXYstuvwz!Z!`!g!j!o#S#d#o#u#y#|$P$Q$R$S$T$U$V$W$X$Y$Z$]$b$f$n%k%q&O&g&j&k&n&p&q&s&w'P'^'n(Q(W(_(s(w({)o)z+R+V+a,h,k,p,|-P-a-i-w-}._.o.v/O/g0b0g0w1e1u1v1x1z1}2Q2S2c2s2y3V3a3v5_5a5k5{5|6P6Z6d6q7}8S8c8m9^9o:i:l:m:p:q:r:s:t:u:v:w:x:y:z:{:|:};R;`;b;c;e;m;n;w;x<d<e[#]WZ#W#Z'T(O!b%hm#h#i#l$y%c%f(X(c(d(e*V*Z*^+T+U+W,g,}-{.R.S.T.V/f/i2V2}3O4R6Y6kQ%txQ%xyS%}|&SQ&Z!TQ'_!hQ'a!iQ(l#sS+h%y%zQ+l%|Q,V&^Q,Z&`S-d'b'cQ.a(mQ0v+iQ0|+oQ1O+pQ1R+tQ1g,WS1k,[,]Q2o-eQ4|0xQ5Q0{Q5V1TQ5q1lQ7n5OQ7q5SQ9X7mR:P9Y!O${i#x%P%R%]%^%b*O*Q*]*s*t.l/p0W0Y0d4O4m8}<b<j<k!S%vy!i!u%x%y%z'R'a'b'c'g'q*e+h+i-Q-d-e-l/z0v2h2o2v4eQ+b%tQ+{&WQ,O&XQ,Y&`Q.`(lQ1f,VU1j,Z,[,]Q3W.aQ5l1gS5p1k1lQ8W5q#[<f#v$d$e$y$|)v)|*S*V*c+`+c+z+}.^/^/f/q/s1X1[1d3U4Z4c4u4w5j6n7[7e8P8p9b9t:U:^;S;U;Y;[;^;f;h;k;o;q;s;u;y<n<oo<g;P;Q;T;V;Z;];_;g;i;l;p;r;t;v;zW%Ui%W*u<bS&W!Q&eQ&X!RQ&Y!SR+y&U${%Ti#v#x$d$e$y$|%P%R%]%^%b)v)|*O*Q*S*V*]*c*s*t+`+c+z+}.^.l/^/f/p/q/s0W0Y0d1X1[1d3U4O4Z4c4m4u4w5j6n7[7e8P8p8}9b9t:U:^;P;Q;S;T;U;V;Y;Z;[;];^;_;f;g;h;i;k;l;o;p;q;r;s;t;u;v;y;z<b<j<k<n<oT)w$v)xV*y%[;W;XW'W!e%g*W-WS(z#z#{Q+s&PS.Y(h(iQ1],PQ4n0aR7w5]'OkOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#y#|$P$Q$R$S$T$U$V$W$X$Y$Z$]$b$f$n%k%q&O&g&j&k&n&p&q&s&w'P'T'^'n(O(Q(W(_(s(w({)o)z+R+V+a,h,k,p,|-P-a-i-w-}._.o.v/O/g0b0g0w1e1u1v1x1z1}2Q2S2c2s2y3V3a3v5_5a5k5{5|6P6Z6d6q7}8S8c8m9^9o:i:l:m:p:q:r:s:t:u:v:w:x:y:z:{:|:};R;`;b;c;e;m;n;w;x<e$i$ac#Y#e%o%p%r'}(T(o(v)O)P)Q)R)S)T)U)V)W)X)Y)[)_)c)m+^+r-R-p-u-z-|.k.q.u.w.x.y/Y0e2^2a2q2x3`3e3f3g3h3i3j3k3l3m3n3o3p3q3t3u3z4r4z6]6c6h6v6w7Q7R7y8g8k8t8z8{9q:R:Y:k<XT#TV#U'PkOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#y#|$P$Q$R$S$T$U$V$W$X$Y$Z$]$b$f$n%k%q&O&g&j&k&n&p&q&s&w'P'T'^'n(O(Q(W(_(s(w({)o)z+R+V+a,h,k,p,|-P-a-i-w-}._.o.v/O/g0b0g0w1e1u1v1x1z1}2Q2S2c2s2y3V3a3v5_5a5k5{5|6P6Z6d6q7}8S8c8m9^9o:i:l:m:p:q:r:s:t:u:v:w:x:y:z:{:|:};R;`;b;c;e;m;n;w;x<eQ'U!eR2d-Tv!nQ!e!r!v!y!z'S'Z'['h'i'j-T-Z-]-m1b5d5fU*e$}*W*kS/z*f*mQ0T*nQ1_,RQ4e0SR4h0VnqOXst!Z#d%k&n&p&q&s,k,p1}2QQ&u!^Q'r!xS(n#u:qQ+f%wQ,T&ZQ,U&]Q-b'`Q-o'kS.j(s;cS0f+R;mQ0t+gQ1a,SQ2U,rQ2W,sQ2`-OQ2m-cQ2p-gS4s0g;wQ4x0uS4{0w;xQ6[2bQ6`2nQ6e2uQ7l4yQ8h6^Q8i6aQ8l6fR9n8e$d$`c#Y#e%p%r'}(T(o(v)O)P)Q)R)S)T)U)V)W)X)Y)[)_)c)m+^+r-R-p-u-z-|.k.q.u.x.y/Y0e2^2a2q2x3`3e3f3g3h3i3j3k3l3m3n3o3p3q3t3u3z4r4z6]6c6h6v6w7Q7R7y8g8k8t8z8{9q:R:Y:k<XS(k#p'eU*r%S(r3sS+]%o.wQ3S0nQ6m3RQ8r6pR9u8s$d$_c#Y#e%p%r'}(T(o(v)O)P)Q)R)S)T)U)V)W)X)Y)[)_)c)m+^+r-R-p-u-z-|.k.q.u.x.y/Y0e2^2a2q2x3`3e3f3g3h3i3j3k3l3m3n3o3p3q3t3u3z4r4z6]6c6h6v6w7Q7R7y8g8k8t8z8{9q:R:Y:k<XS(j#p'eS(|#{$`S+[%o.wS.Z(i(kQ.z)^Q0k+]R3P.['OkOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#y#|$P$Q$R$S$T$U$V$W$X$Y$Z$]$b$f$n%k%q&O&g&j&k&n&p&q&s&w'P'T'^'n(O(Q(W(_(s(w({)o)z+R+V+a,h,k,p,|-P-a-i-w-}._.o.v/O/g0b0g0w1e1u1v1x1z1}2Q2S2c2s2y3V3a3v5_5a5k5{5|6P6Z6d6q7}8S8c8m9^9o:i:l:m:p:q:r:s:t:u:v:w:x:y:z:{:|:};R;`;b;c;e;m;n;w;x<eS#q]:jQ&p!XQ&q!YQ&s![Q&t!]R1|,nQ']!hQ+_%tQ-`'_S.](l+bQ2k-_W3T.`.a0m0oQ6_2lU6l3Q3S3WS8o6m6oS9s8q8rS:[9r9uQ:d:]R:g:eU!wQ'[-]T5b1b5d!Q_OXZ`st!V!Z#d#h%c%k&e&g&n&p&q&s(e,k,p.S1}2Q]!pQ!r'[-]1b5dT#q]:j%[{OPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#y#|$P$Q$R$S$T$U$V$W$X$Y$Z$b$f%k%q&O&g&j&k&n&p&q&s&w'P'^'n(O(Q(W(_(s(w({)z+R+V+a,h,k,p-a-i-w-}._.o.v/g0b0g0w1e1u1v1x1z1}2Q2S2s2y3V3a5a5k5{5|6P6d6q7}8S8c8mS(z#z#{S.Y(h(i!s<O$]$n'T)o,|-P/O2c3v5_6Z9^9o:i:l:m:p:q:r:s:t:u:v:w:x:y:z:{:|:};R;`;b;c;e;m;n;w;x<em!tQ!r!v!y!z'['h'i'j-]-m1b5d5fQ'p!uS(a#g1wS-k'g'sQ/l*YQ/x*eQ2w-nQ4V/mS4`/y0TQ7W4QS7c4f4hQ9P7XR9W7fQ#wbQ'o!uS(`#g1wS(b#m+QQ+S%dQ+d%uQ+j%{U-j'g'p'sQ.O(aQ/k*YQ/w*eQ/}*hQ0s+eQ1h,XS2t-k-nQ2|.WS4U/l/mS4_/x0TQ4b/|Q4d0OQ5n1iQ6g2wQ7V4QQ7Z4VS7_4`4hQ7d4gQ8U5oS9O7W7XQ9S7`Q9U7cQ9e8VQ9{9PQ9|9TQ:O9WQ:W9fQ:`9}Q<R;|Q<^<VR<_<WV!wQ'[-]%[aOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#y#|$P$Q$R$S$T$U$V$W$X$Y$Z$b$f%k%q&O&g&j&k&n&p&q&s&w'P'^'n(O(Q(W(_(s(w({)z+R+V+a,h,k,p-a-i-w-}._.o.v/g0b0g0w1e1u1v1x1z1}2Q2S2s2y3V3a5a5k5{5|6P6d6q7}8S8c8mS#wz!j!r;{$]$n'T)o,|-P/O2c3v5_6Z9^9o:i:l:m:p:q:r:s:t:u:v:w:x:y:z:{:|:};R;`;b;c;e;m;n;w;x<eR<R<d%[bOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#y#|$P$Q$R$S$T$U$V$W$X$Y$Z$b$f%k%q&O&g&j&k&n&p&q&s&w'P'^'n(O(Q(W(_(s(w({)z+R+V+a,h,k,p-a-i-w-}._.o.v/g0b0g0w1e1u1v1x1z1}2Q2S2s2y3V3a5a5k5{5|6P6d6q7}8S8c8mQ%dj!S%uy!i!u%x%y%z'R'a'b'c'g'q*e+h+i-Q-d-e-l/z0v2h2o2v4eS%{z!jQ+e%vQ,X&`W1i,Y,Z,[,]U5o1j1k1lS8V5p5qQ9f8W!r;|$]$n'T)o,|-P/O2c3v5_6Z9^9o:i:l:m:p:q:r:s:t:u:v:w:x:y:z:{:|:};R;`;b;c;e;m;n;w;x<eQ<V<cR<W<d%OeOPXYstuvw!Z!`!g!o#S#d#o#u#y#|$P$Q$R$S$T$U$V$W$X$Y$Z$b$f%k%q&O&g&j&n&p&q&s&w'P'^'n(Q(W(_(s(w({)z+R+V+a,h,k,p-a-i-w-}._.o.v/g0b0g0w1e1u1v1x1z1}2Q2S2s2y3V3a5a5k5{5|6P6d6q7}8S8c8mY#bWZ#W#Z(O!b%hm#h#i#l$y%c%f(X(c(d(e*V*Z*^+T+U+W,g,}-{.R.S.T.V/f/i2V2}3O4R6Y6kQ,f&k!p;}$]$n)o,|-P/O2c3v5_6Z9^9o:i:l:m:p:q:r:s:t:u:v:w:x:y:z:{:|:};R;`;b;c;e;m;n;w;x<eR<Q'TU'X!e%g*WR2f-W%QdOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#y#|$P$Q$R$S$T$U$V$W$X$Y$Z$b$f%k%q&O&g&j&n&p&q&s&w'P'^'n(O(Q(W(_(s(w({)z+R+V,h,k,p-a-i-w-}.o.v/g0b0g0w1e1u1v1x1z1}2Q2S2s2y3a5a5k5{5|6P6d7}8S8c8m!r)]$]$n'T)o,|-P/O2c3v5_6Z9^9o:i:l:m:p:q:r:s:t:u:v:w:x:y:z:{:|:};R;`;b;c;e;m;n;w;x<eQ,e&kQ0n+aQ3R._Q6p3VR8s6q!b$Vc#Y%o'}(T(o(v)X)Y)_)c+r-p-u-z-|.k.q/Y0e2q2x3`3q4r4z6c6h6v8k9q:k!P:x)[)m-R.w2^2a3e3o3p3t3z6]6w7Q7R7y8g8t8z8{:R:Y<X!f$Xc#Y%o'}(T(o(v)U)V)X)Y)_)c+r-p-u-z-|.k.q/Y0e2q2x3`3q4r4z6c6h6v8k9q:k!T:z)[)m-R.w2^2a3e3l3m3o3p3t3z6]6w7Q7R7y8g8t8z8{:R:Y<X!^$]c#Y%o'}(T(o(v)_)c+r-p-u-z-|.k.q/Y0e2q2x3`3q4r4z6c6h6v8k9q:kQ4O/dz<e)[)m-R.w2^2a3e3t3z6]6w7Q7R7y8g8t8z8{:R:Y<XQ<j<lR<k<m'OkOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#y#|$P$Q$R$S$T$U$V$W$X$Y$Z$]$b$f$n%k%q&O&g&j&k&n&p&q&s&w'P'T'^'n(O(Q(W(_(s(w({)o)z+R+V+a,h,k,p,|-P-a-i-w-}._.o.v/O/g0b0g0w1e1u1v1x1z1}2Q2S2c2s2y3V3a3v5_5a5k5{5|6P6Z6d6q7}8S8c8m9^9o:i:l:m:p:q:r:s:t:u:v:w:x:y:z:{:|:};R;`;b;c;e;m;n;w;x<eS$oh$pR3w.}'VgOPWXYZhstuvw!Z!`!g!o#S#W#Z#d#o#u#y#|$P$Q$R$S$T$U$V$W$X$Y$Z$]$b$f$n$p%k%q&O&g&j&k&n&p&q&s&w'P'T'^'n(O(Q(W(_(s(w({)o)z+R+V+a,h,k,p,|-P-a-i-w-}._.o.v.}/O/g0b0g0w1e1u1v1x1z1}2Q2S2c2s2y3V3a3v5_5a5k5{5|6P6Z6d6q7}8S8c8m9^9o:i:l:m:p:q:r:s:t:u:v:w:x:y:z:{:|:};R;`;b;c;e;m;n;w;x<eT$kf$qQ$ifS)f$l)jR)r$qT$jf$qT)h$l)j'VhOPWXYZhstuvw!Z!`!g!o#S#W#Z#d#o#u#y#|$P$Q$R$S$T$U$V$W$X$Y$Z$]$b$f$n$p%k%q&O&g&j&k&n&p&q&s&w'P'T'^'n(O(Q(W(_(s(w({)o)z+R+V+a,h,k,p,|-P-a-i-w-}._.o.v.}/O/g0b0g0w1e1u1v1x1z1}2Q2S2c2s2y3V3a3v5_5a5k5{5|6P6Z6d6q7}8S8c8m9^9o:i:l:m:p:q:r:s:t:u:v:w:x:y:z:{:|:};R;`;b;c;e;m;n;w;x<eT$oh$pQ$rhR)q$p%[jOPWXYZstuvw!Z!`!g!o#S#W#Z#d#o#u#y#|$P$Q$R$S$T$U$V$W$X$Y$Z$b$f%k%q&O&g&j&k&n&p&q&s&w'P'^'n(O(Q(W(_(s(w({)z+R+V+a,h,k,p-a-i-w-}._.o.v/g0b0g0w1e1u1v1x1z1}2Q2S2s2y3V3a5a5k5{5|6P6d6q7}8S8c8m!s<c$]$n'T)o,|-P/O2c3v5_6Z9^9o:i:l:m:p:q:r:s:t:u:v:w:x:y:z:{:|:};R;`;b;c;e;m;n;w;x<e#elOPXZst!Z!`!o#S#d#o#|$n%k&g&j&k&n&p&q&s&w'P'^({)o+V+a,h,k,p-a._/O/g0b1e1u1v1x1z1}2Q2S3V3v5a5k5{5|6P6q7}8S8c!O%Si#x%P%R%]%^%b*O*Q*]*s*t.l/p0W0Y0d4O4m8}<b<j<k#[(r#v$d$e$y$|)v)|*S*V*c+`+c+z+}.^/^/f/q/s1X1[1d3U4Z4c4u4w5j6n7[7e8P8p9b9t:U:^;S;U;Y;[;^;f;h;k;o;q;s;u;y<n<oQ*}%`Q/Z){o3s;P;Q;T;V;Z;];_;g;i;l;p;r;t;v;z!O$zi#x%P%R%]%^%b*O*Q*]*s*t.l/p0W0Y0d4O4m8}<b<j<kQ*_${U*h$}*W*kQ+O%aQ0O*i#[<T#v$d$e$y$|)v)|*S*V*c+`+c+z+}.^/^/f/q/s1X1[1d3U4Z4c4u4w5j6n7[7e8P8p9b9t:U:^;S;U;Y;[;^;f;h;k;o;q;s;u;y<n<on<U;P;Q;T;V;Z;];_;g;i;l;p;r;t;v;zQ<Y<fQ<Z<gQ<[<hR<]<i!O%Si#x%P%R%]%^%b*O*Q*]*s*t.l/p0W0Y0d4O4m8}<b<j<k#[(r#v$d$e$y$|)v)|*S*V*c+`+c+z+}.^/^/f/q/s1X1[1d3U4Z4c4u4w5j6n7[7e8P8p9b9t:U:^;S;U;Y;[;^;f;h;k;o;q;s;u;y<n<oo3s;P;Q;T;V;Z;];_;g;i;l;p;r;t;v;znoOXst!Z#d%k&n&p&q&s,k,p1}2QS*b$|*VQ,y&zQ,z&|R4Y/q$z%Ti#v#x$d$e$y$|%P%R%]%^%b)v)|*O*Q*S*V*]*c*s*t+`+c+z+}.^.l/^/f/p/q/s0W0Y0d1X1[1d3U4O4Z4c4m4u4w5j6n7[7e8P8p8}9b9t:U:^;P;Q;S;T;U;V;Y;Z;[;];^;_;f;g;h;i;k;l;o;p;q;r;s;t;u;v;y;z<b<j<k<n<oQ+|&XQ1Z,OQ5Z1YR7v5[V*j$}*W*kU*j$}*W*kT5c1b5dU/|*g/g5aT4g0U7}Q+d%uQ/}*hQ0s+eQ1h,XQ5n1iQ8U5oQ9e8VR:W9f!O%Pi#x%P%R%]%^%b*O*Q*]*s*t.l/p0W0Y0d4O4m8}<b<j<kr*O$w(t*P*q+P/o0[0]3^4W4q7U7g9z<S<`<aS0W*p0X#[;S#v$d$e$y$|)v)|*S*V*c+`+c+z+}.^/^/f/q/s1X1[1d3U4Z4c4u4w5j6n7[7e8P8p9b9t:U:^;S;U;Y;[;^;f;h;k;o;q;s;u;y<n<on;T;P;Q;T;V;Z;];_;g;i;l;p;r;t;v;z!^;f(p)a*X*a.b.e.i/V/[/d/t0l1W1Y3Z4X4]5Y5[6r6u7]7a7i7k9R9V:_<l<m`;g3r6x6{7P8u9v9y:hS;q.d3[T;r6z8x!O%Ri#x%P%R%]%^%b*O*Q*]*s*t.l/p0W0Y0d4O4m8}<b<j<kv*Q$w(t*R*p+P/`/o0[0]3^4W4i4q7U7g9z<S<`<aS0Y*q0Z#[;U#v$d$e$y$|)v)|*S*V*c+`+c+z+}.^/^/f/q/s1X1[1d3U4Z4c4u4w5j6n7[7e8P8p9b9t:U:^;S;U;Y;[;^;f;h;k;o;q;s;u;y<n<on;V;P;Q;T;V;Z;];_;g;i;l;p;r;t;v;z!b;h(p)a*X*a.c.d.i/V/[/d/t0l1W1Y3X3Z4X4]5Y5[6r6s6u7]7a7i7k9R9V:_<l<md;i3r6y6z7P8u8v9v9w9y:hS;s.e3]T;t6{8yrnOXst!V!Z#d%k&e&n&p&q&s,k,p1}2QQ&b!UR,h&krnOXst!V!Z#d%k&e&n&p&q&s,k,p1}2QR&b!UQ,Q&YR1V+ysnOXst!V!Z#d%k&e&n&p&q&s,k,p1}2QQ1c,VS5i1f1gU8O5g5h5lS9a8Q8RS:S9`9cQ:a:TR:f:bQ&i!VR,a&eR5u1oS%}|&SR1O+pQ&n!WR,k&oR,q&tT2O,p2QR,u&uQ,t&uR2X,uQ'u!{R-q'uSsOtQ#dXT%ns#dQ#OTR'w#OQ#RUR'y#RQ)x$vR/W)xQ#UVR'{#UQ#XWU(R#X(S-xQ(S#YR-x(TQ-U'UR2e-UQ.m(tR3_.mQ.p(vS3b.p3cR3c.qQ-]'[R2i-]Y!rQ'[-]1b5dR'f!rU#_W%f*VU(Y#_(Z-yQ(Z#`R-y(UQ-X'XR2g-Xt`OXst!V!Z#d%k&e&g&n&p&q&s,k,p1}2QS#hZ%cU#r`#h.SR.S(eQ(f#jQ.P(bW.X(f.P2z6iQ2z.QR6i2{Q)j$lR/P)jQ$phR)p$pQ$ccU)`$c-t;OQ-t:kR;O)mQ/j*YW4S/j4T7Y9QU4T/k/l/mS7Y4U4VR9Q7Z$X)}$w(p(t)a*X*a*p*q*z*{+P.d.e.g.h.i/V/[/`/b/d/o/t0[0]0l1W1Y3X3Y3Z3^3r4W4X4]4i4k4q5Y5[6r6s6t6u6z6{6}7O7P7U7]7a7g7i7k8u8v8w9R9V9v9w9x9y9z:_:h<S<`<a<l<mQ/r*aU4[/r4^7^Q4^/tR7^4]S*k$}*WR0Q*kr*P$w(t*p*q+P/o0[0]3^4W4q7U7g9z<S<`<a!^.b(p)a*X*a.d.e.i/V/[/d/t0l1W1Y3Z4X4]5Y5[6r6u7]7a7i7k9R9V:_<l<mU/a*P.b6xa6x3r6z6{7P8u9v9y:hQ0X*pQ3[.dU4j0X3[8xR8x6zv*R$w(t*p*q+P/`/o0[0]3^4W4i4q7U7g9z<S<`<a!b.c(p)a*X*a.d.e.i/V/[/d/t0l1W1Y3X3Z4X4]5Y5[6r6s6u7]7a7i7k9R9V:_<l<mU/c*R.c6ye6y3r6z6{7P8u8v9v9w9y:hQ0Z*qQ3].eU4l0Z3]8yR8y6{Q*v%VR0_*vQ4v0lR7j4vQ+X%iR0j+XQ5^1]S7x5^9_R9_7yQ,S&ZR1`,SQ5d1bR7{5dQ1n,^S5s1n8YR8Y5uQ0y+lW5P0y5R7p9ZQ5R0|Q7p5QR9Z7qQ+q%}R1P+qQ2Q,pR6T2QYrOXst#dQ&r!ZQ+Z%kQ,j&nQ,l&pQ,m&qQ,o&sQ1{,kS2O,p2QR6S1}Q%mpQ&v!_Q&y!aQ&{!bQ&}!cQ'm!uQ+Y%jQ+f%wQ+x&TQ,`&iQ,w&xW-h'g'o'p'sQ-o'kQ0P*jQ0t+gS1q,a,dQ2Y,vQ2Z,yQ2[,zQ2p-gW2r-j-k-n-pQ4x0uQ5U1SQ5X1WQ5m1hQ5w1sQ6R1|U6b2q2t2wQ6e2uQ7l4yQ7t5WQ7u5YQ7z5cQ8T5nQ8Z5vS8j6c6gQ8l6fQ9[7rQ9d8UQ9i8[Q9p8kQ:Q9]Q:V9eQ:Z9qR:c:WQ%wyQ'`!iQ'k!uU+g%x%y%zQ-O'RU-c'a'b'cS-g'g'qQ/v*eS0u+h+iQ2b-QS2n-d-eQ2u-lQ4a/zQ4y0vQ6^2hQ6a2oQ6f2vR7b4eS$xi<bR*w%WU%Vi%W<bR0^*uQ$wiS(p#v+cQ(t#xS)a$d$eQ*X$yS*a$|*VQ*p%PQ*q%RQ*z%]Q*{%^Q+P%bQ.d;SQ.e;UQ.g;YQ.h;[Q.i;^Q/V)vS/[)|/^Q/`*OQ/b*QQ/d*SQ/o*]S/t*c/fQ0[*sQ0]*th0l+`.^1d3U5j6n8P8p9b9t:U:^Q1W+zQ1Y+}Q3X;fQ3Y;hQ3Z;kQ3^.lS3r;P;QQ4W/pQ4X/qQ4]/sQ4i0WQ4k0YQ4q0dQ5Y1XQ5[1[Q6r;oQ6s;qQ6t;sQ6u;uQ6z;TQ6{;VQ6};ZQ7O;]Q7P;_Q7U4OQ7]4ZQ7a4cQ7g4mQ7i4uQ7k4wQ8u;lQ8v;gQ8w;iQ9R7[Q9V7eQ9v;pQ9w;rQ9x;tQ9y;vQ9z8}Q:_;yQ:h;zQ<S<bQ<`<jQ<a<kQ<l<nR<m<onpOXst!Z#d%k&n&p&q&s,k,p1}2QQ!fPS#fZ#oQ&x!`U'd!o5a7}Q'z#SQ(}#|Q)n$nS,d&g&jQ,i&kQ,v&wQ,{'PQ-_'^Q.s({Q/T)oS0h+V/gQ0o+aQ1y,hQ2l-aQ3S._Q3y/OQ4o0bQ5h1eQ5y1uQ5z1vQ6O1xQ6Q1zQ6V2SQ6m3VQ7S3vQ8R5kQ8_5{Q8`5|Q8b6PQ8r6qQ9c8SR9m8c#YcOPXZst!Z!`!o#d#o#|%k&g&j&k&n&p&q&s&w'P'^({+V+a,h,k,p-a._/g0b1e1u1v1x1z1}2Q2S3V5a5k5{5|6P6q7}8S8cQ#YWQ#eYQ%ouQ%pvS%rw!gS'}#W(QQ(T#ZQ(o#uQ(v#yQ)O$PQ)P$QQ)Q$RQ)R$SQ)S$TQ)T$UQ)U$VQ)V$WQ)W$XQ)X$YQ)Y$ZQ)[$]Q)_$bQ)c$fW)m$n)o/O3vQ+^%qQ+r&OS-R'T2cQ-p'nS-u(O-wQ-z(WQ-|(_Q.k(sQ.q(wQ.u:iQ.w:lQ.x:mQ.y:pQ/Y)zQ0e+RQ2^,|Q2a-PQ2q-iQ2x-}Q3`.oQ3e:qQ3f:rQ3g:sQ3h:tQ3i:uQ3j:vQ3k:wQ3l:xQ3m:yQ3n:zQ3o:{Q3p:|Q3q.vQ3t;RQ3u;`Q3z:}Q4r0gQ4z0wQ6];bQ6c2sQ6h2yQ6v3aQ6w;cQ7Q;eQ7R;mQ7y5_Q8g6ZQ8k6dQ8t;nQ8z;wQ8{;xQ9q8mQ:R9^Q:Y9oQ:k#SR<X<eR#[WR'V!el!tQ!r!v!y!z'['h'i'j-]-m1b5d5fS'R!e-TS-Q'S'ZR2h-ZR(u#xR(x#yQ!fQT-['[-]]!qQ!r'[-]1b5dQ#p]R'e:jY!uQ'[-]1b5dQ'g!rS'q!v!yS's!z5fS-l'h'iQ-n'jR2v-mT#kZ%cS#jZ%cS%im,gU(b#h#i#lS.Q(c(dQ.U(eQ0i+WQ2{.RU2|.S.T.VS6j2}3OR8n6kd#^W#W#Z%f(O(X*V+T-{/fr#gZm#h#i#l%c(c(d(e+W.R.S.T.V2}3O6kS*Y$y*^Q/m*ZQ1w,gQ2_,}Q4Q/iQ6X2VQ7X4RQ8f6YT<P'T+UV#aW%f*VU#`W%f*VS(P#W(XU(U#Z+T/fS-S'T+UT-v(O-{V'Y!e%g*WQ$lfR)t$qT)i$l)jR3x.}T*[$y*^T*d$|*VQ0m+`Q3Q.^Q5g1dQ6o3UQ8Q5jQ8q6nQ9`8PQ9r8pQ:T9bQ:]9tQ:b:UR:e:^nqOXst!Z#d%k&n&p&q&s,k,p1}2QQ&h!VR,`&etmOXst!U!V!Z#d%k&e&n&p&q&s,k,p1}2QR,g&kT%jm,gR1^,PR,_&cQ&R|R+w&SR+m%|T&l!W&oT&m!W&oT2P,p2Q",
  nodeNames: "\u26A0 ArithOp ArithOp JSXStartTag LineComment BlockComment Script Hashbang ExportDeclaration export Star as VariableName String Escape from ; default FunctionDeclaration async function VariableDefinition > < TypeParamList TypeDefinition extends ThisType this LiteralType ArithOp Number BooleanLiteral TemplateType InterpolationEnd Interpolation InterpolationStart NullType null VoidType void TypeofType typeof MemberExpression . ?. PropertyName [ TemplateString Escape Interpolation super RegExp ] ArrayExpression Spread , } { ObjectExpression Property async get set PropertyDefinition Block : NewExpression new TypeArgList CompareOp < ) ( ArgList UnaryExpression delete LogicOp BitOp YieldExpression yield AwaitExpression await ParenthesizedExpression ClassExpression class ClassBody MethodDeclaration Decorator @ MemberExpression PrivatePropertyName CallExpression declare Privacy static abstract override PrivatePropertyDefinition PropertyDeclaration readonly accessor Optional TypeAnnotation Equals StaticBlock FunctionExpression ArrowFunction ParamList ParamList ArrayPattern ObjectPattern PatternProperty Privacy readonly Arrow MemberExpression BinaryExpression ArithOp ArithOp ArithOp ArithOp BitOp CompareOp instanceof satisfies in const CompareOp BitOp BitOp BitOp LogicOp LogicOp ConditionalExpression LogicOp LogicOp AssignmentExpression UpdateOp PostfixExpression CallExpression TaggedTemplateExpression DynamicImport import ImportMeta JSXElement JSXSelfCloseEndTag JSXSelfClosingTag JSXIdentifier JSXBuiltin JSXIdentifier JSXNamespacedName JSXMemberExpression JSXSpreadAttribute JSXAttribute JSXAttributeValue JSXEscape JSXEndTag JSXOpenTag JSXFragmentTag JSXText JSXEscape JSXStartCloseTag JSXCloseTag PrefixCast ArrowFunction TypeParamList SequenceExpression KeyofType keyof UniqueType unique ImportType InferredType infer TypeName ParenthesizedType FunctionSignature ParamList NewSignature IndexedType TupleType Label ArrayType ReadonlyType ObjectType MethodType PropertyType IndexSignature PropertyDefinition CallSignature TypePredicate is NewSignature new UnionType LogicOp IntersectionType LogicOp ConditionalType ParameterizedType ClassDeclaration abstract implements type VariableDeclaration let var using TypeAliasDeclaration InterfaceDeclaration interface EnumDeclaration enum EnumBody NamespaceDeclaration namespace module AmbientDeclaration declare GlobalDeclaration global ClassDeclaration ClassBody AmbientFunctionDeclaration ExportGroup VariableName VariableName ImportDeclaration ImportGroup ForStatement for ForSpec ForInSpec ForOfSpec of WhileStatement while WithStatement with DoStatement do IfStatement if else SwitchStatement switch SwitchBody CaseLabel case DefaultLabel TryStatement try CatchClause catch FinallyClause finally ReturnStatement return ThrowStatement throw BreakStatement break ContinueStatement continue DebuggerStatement debugger LabeledStatement ExpressionStatement SingleExpression SingleClassItem",
  maxTerm: 372,
  context: trackNewline,
  nodeProps: [
    ["isolate", -8, 4, 5, 13, 33, 35, 48, 50, 52, ""],
    ["group", -26, 8, 16, 18, 65, 201, 205, 209, 210, 212, 215, 218, 228, 230, 236, 238, 240, 242, 245, 251, 257, 259, 261, 263, 265, 267, 268, "Statement", -32, 12, 13, 28, 31, 32, 38, 48, 51, 52, 54, 59, 67, 75, 79, 81, 83, 84, 106, 107, 116, 117, 134, 137, 139, 140, 141, 142, 144, 145, 164, 165, 167, "Expression", -23, 27, 29, 33, 37, 39, 41, 168, 170, 172, 173, 175, 176, 177, 179, 180, 181, 183, 184, 185, 195, 197, 199, 200, "Type", -3, 87, 99, 105, "ClassItem"],
    ["openedBy", 22, "<", 34, "InterpolationStart", 53, "[", 57, "{", 72, "(", 157, "JSXStartCloseTag"],
    ["closedBy", 23, ">", 36, "InterpolationEnd", 47, "]", 58, "}", 73, ")", 162, "JSXEndTag"]
  ],
  propSources: [jsHighlight],
  skippedNodes: [0, 4, 5, 271],
  repeatNodeCount: 37,
  tokenData: "$HR(CSR!bOX%ZXY+gYZ-yZ[+g[]%Z]^.c^p%Zpq+gqr/mrs3cst:_tuEruvJSvwLkwx! Yxy!'iyz!(sz{!)}{|!,q|}!.O}!O!,q!O!P!/Y!P!Q!9j!Q!R#:O!R![#<_![!]#I_!]!^#Jk!^!_#Ku!_!`$![!`!a$$v!a!b$*T!b!c$.S!c!}Er!}#O$/^#O#P$0h#P#Q$6P#Q#R$7Z#R#SEr#S#T$8h#T#o$9r#o#p$>S#p#q$>x#q#r$@Y#r#s$Af#s$f%Z$f$g+g$g#BYEr#BY#BZ$Bp#BZ$ISEr$IS$I_$Bp$I_$I|Er$I|$I}$E{$I}$JO$E{$JO$JTEr$JT$JU$Bp$JU$KVEr$KV$KW$Bp$KW&FUEr&FU&FV$Bp&FV;'SEr;'S;=`I|<%l?HTEr?HT?HU$Bp?HUOEr(n%d_$f&j(Op(R!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z&j&hT$f&jO!^&c!_#o&c#p;'S&c;'S;=`&w<%lO&c&j&zP;=`<%l&c'|'U]$f&j(R!bOY&}YZ&cZw&}wx&cx!^&}!^!_'}!_#O&}#O#P&c#P#o&}#o#p'}#p;'S&};'S;=`(l<%lO&}!b(SU(R!bOY'}Zw'}x#O'}#P;'S'};'S;=`(f<%lO'}!b(iP;=`<%l'}'|(oP;=`<%l&}'[(y]$f&j(OpOY(rYZ&cZr(rrs&cs!^(r!^!_)r!_#O(r#O#P&c#P#o(r#o#p)r#p;'S(r;'S;=`*a<%lO(rp)wU(OpOY)rZr)rs#O)r#P;'S)r;'S;=`*Z<%lO)rp*^P;=`<%l)r'[*dP;=`<%l(r#S*nX(Op(R!bOY*gZr*grs'}sw*gwx)rx#O*g#P;'S*g;'S;=`+Z<%lO*g#S+^P;=`<%l*g(n+dP;=`<%l%Z(CS+rq$f&j(Op(R!b't(;dOX%ZXY+gYZ&cZ[+g[p%Zpq+gqr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p$f%Z$f$g+g$g#BY%Z#BY#BZ+g#BZ$IS%Z$IS$I_+g$I_$JT%Z$JT$JU+g$JU$KV%Z$KV$KW+g$KW&FU%Z&FU&FV+g&FV;'S%Z;'S;=`+a<%l?HT%Z?HT?HU+g?HUO%Z(CS.ST(P#S$f&j'u(;dO!^&c!_#o&c#p;'S&c;'S;=`&w<%lO&c(CS.n_$f&j(Op(R!b'u(;dOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%#`/x`$f&j!o$Ip(Op(R!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`0z!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%#S1V`#t$Id$f&j(Op(R!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`2X!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%#S2d_#t$Id$f&j(Op(R!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z$/|3l_'}$(n$f&j(R!bOY4kYZ5qZr4krs7nsw4kwx5qx!^4k!^!_8p!_#O4k#O#P5q#P#o4k#o#p8p#p;'S4k;'S;=`:X<%lO4k(^4r_$f&j(R!bOY4kYZ5qZr4krs7nsw4kwx5qx!^4k!^!_8p!_#O4k#O#P5q#P#o4k#o#p8p#p;'S4k;'S;=`:X<%lO4k&z5vX$f&jOr5qrs6cs!^5q!^!_6y!_#o5q#o#p6y#p;'S5q;'S;=`7h<%lO5q&z6jT$a`$f&jO!^&c!_#o&c#p;'S&c;'S;=`&w<%lO&c`6|TOr6yrs7]s;'S6y;'S;=`7b<%lO6y`7bO$a``7eP;=`<%l6y&z7kP;=`<%l5q(^7w]$a`$f&j(R!bOY&}YZ&cZw&}wx&cx!^&}!^!_'}!_#O&}#O#P&c#P#o&}#o#p'}#p;'S&};'S;=`(l<%lO&}!r8uZ(R!bOY8pYZ6yZr8prs9hsw8pwx6yx#O8p#O#P6y#P;'S8p;'S;=`:R<%lO8p!r9oU$a`(R!bOY'}Zw'}x#O'}#P;'S'};'S;=`(f<%lO'}!r:UP;=`<%l8p(^:[P;=`<%l4k#%|:hh$f&j(Op(R!bOY%ZYZ&cZq%Zqr<Srs&}st%ZtuCruw%Zwx(rx!^%Z!^!_*g!_!c%Z!c!}Cr!}#O%Z#O#P&c#P#R%Z#R#SCr#S#T%Z#T#oCr#o#p*g#p$g%Z$g;'SCr;'S;=`El<%lOCr(r<__VS$f&j(Op(R!bOY<SYZ&cZr<Srs=^sw<Swx@nx!^<S!^!_Bm!_#O<S#O#P>`#P#o<S#o#pBm#p;'S<S;'S;=`Cl<%lO<S(Q=g]VS$f&j(R!bOY=^YZ&cZw=^wx>`x!^=^!^!_?q!_#O=^#O#P>`#P#o=^#o#p?q#p;'S=^;'S;=`@h<%lO=^&n>gXVS$f&jOY>`YZ&cZ!^>`!^!_?S!_#o>`#o#p?S#p;'S>`;'S;=`?k<%lO>`S?XSVSOY?SZ;'S?S;'S;=`?e<%lO?SS?hP;=`<%l?S&n?nP;=`<%l>`!f?xWVS(R!bOY?qZw?qwx?Sx#O?q#O#P?S#P;'S?q;'S;=`@b<%lO?q!f@eP;=`<%l?q(Q@kP;=`<%l=^'`@w]VS$f&j(OpOY@nYZ&cZr@nrs>`s!^@n!^!_Ap!_#O@n#O#P>`#P#o@n#o#pAp#p;'S@n;'S;=`Bg<%lO@ntAwWVS(OpOYApZrAprs?Ss#OAp#O#P?S#P;'SAp;'S;=`Ba<%lOAptBdP;=`<%lAp'`BjP;=`<%l@n#WBvYVS(Op(R!bOYBmZrBmrs?qswBmwxApx#OBm#O#P?S#P;'SBm;'S;=`Cf<%lOBm#WCiP;=`<%lBm(rCoP;=`<%l<S#%|C}i$f&j(g!L^(Op(R!bOY%ZYZ&cZr%Zrs&}st%ZtuCruw%Zwx(rx!Q%Z!Q![Cr![!^%Z!^!_*g!_!c%Z!c!}Cr!}#O%Z#O#P&c#P#R%Z#R#SCr#S#T%Z#T#oCr#o#p*g#p$g%Z$g;'SCr;'S;=`El<%lOCr#%|EoP;=`<%lCr(CSFRk$f&j(Op(R!b$Y#t'{&;d([!LYOY%ZYZ&cZr%Zrs&}st%ZtuEruw%Zwx(rx}%Z}!OGv!O!Q%Z!Q![Er![!^%Z!^!_*g!_!c%Z!c!}Er!}#O%Z#O#P&c#P#R%Z#R#SEr#S#T%Z#T#oEr#o#p*g#p$g%Z$g;'SEr;'S;=`I|<%lOEr+dHRk$f&j(Op(R!b$Y#tOY%ZYZ&cZr%Zrs&}st%ZtuGvuw%Zwx(rx}%Z}!OGv!O!Q%Z!Q![Gv![!^%Z!^!_*g!_!c%Z!c!}Gv!}#O%Z#O#P&c#P#R%Z#R#SGv#S#T%Z#T#oGv#o#p*g#p$g%Z$g;'SGv;'S;=`Iv<%lOGv+dIyP;=`<%lGv(CSJPP;=`<%lEr%#SJ_`$f&j(Op(R!b#l$IdOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%#SKl_$f&j$O$Id(Op(R!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z&COLva(q&;`$f&j(Op(R!bOY%ZYZ&cZr%Zrs&}sv%ZvwM{wx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%#SNW`$f&j#x$Id(Op(R!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z$/|! c_(Q$)`$f&j(OpOY!!bYZ!#hZr!!brs!#hsw!!bwx!$xx!^!!b!^!_!%z!_#O!!b#O#P!#h#P#o!!b#o#p!%z#p;'S!!b;'S;=`!'c<%lO!!b'l!!i_$f&j(OpOY!!bYZ!#hZr!!brs!#hsw!!bwx!$xx!^!!b!^!_!%z!_#O!!b#O#P!#h#P#o!!b#o#p!%z#p;'S!!b;'S;=`!'c<%lO!!b&z!#mX$f&jOw!#hwx6cx!^!#h!^!_!$Y!_#o!#h#o#p!$Y#p;'S!#h;'S;=`!$r<%lO!#h`!$]TOw!$Ywx7]x;'S!$Y;'S;=`!$l<%lO!$Y`!$oP;=`<%l!$Y&z!$uP;=`<%l!#h'l!%R]$a`$f&j(OpOY(rYZ&cZr(rrs&cs!^(r!^!_)r!_#O(r#O#P&c#P#o(r#o#p)r#p;'S(r;'S;=`*a<%lO(r!Q!&PZ(OpOY!%zYZ!$YZr!%zrs!$Ysw!%zwx!&rx#O!%z#O#P!$Y#P;'S!%z;'S;=`!']<%lO!%z!Q!&yU$a`(OpOY)rZr)rs#O)r#P;'S)r;'S;=`*Z<%lO)r!Q!'`P;=`<%l!%z'l!'fP;=`<%l!!b(*Q!'t_!k(!b$f&j(Op(R!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z!'l!)O_!jM|$f&j(Op(R!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'+h!*[b$f&j(Op(R!b'|#)d#m$IdOY%ZYZ&cZr%Zrs&}sw%Zwx(rxz%Zz{!+d{!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%#S!+o`$f&j(Op(R!b#j$IdOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z&-O!,|`$f&j(Op(R!bn&%`OY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z&C[!.Z_!Y&;l$f&j(Op(R!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(CS!/ec$f&j(Op(R!b|'<nOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!O%Z!O!P!0p!P!Q%Z!Q![!3Y![!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z!'d!0ya$f&j(Op(R!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!O%Z!O!P!2O!P!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z!'d!2Z_!XMt$f&j(Op(R!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z$/l!3eg$f&j(Op(R!bo$'|OY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q![!3Y![!^%Z!^!_*g!_!g%Z!g!h!4|!h#O%Z#O#P&c#P#R%Z#R#S!3Y#S#X%Z#X#Y!4|#Y#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z$/l!5Vg$f&j(Op(R!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx{%Z{|!6n|}%Z}!O!6n!O!Q%Z!Q![!8S![!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S!8S#S#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z$/l!6wc$f&j(Op(R!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q![!8S![!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S!8S#S#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z$/l!8_c$f&j(Op(R!bo$'|OY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q![!8S![!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S!8S#S#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(CS!9uf$f&j(Op(R!b#k$IdOY!;ZYZ&cZr!;Zrs!<nsw!;Zwx!Lcxz!;Zz{#-}{!P!;Z!P!Q#/d!Q!^!;Z!^!_#(i!_!`#7S!`!a#8i!a!}!;Z!}#O#,f#O#P!Dy#P#o!;Z#o#p#(i#p;'S!;Z;'S;=`#-w<%lO!;Z(r!;fb$f&j(Op(R!b!USOY!;ZYZ&cZr!;Zrs!<nsw!;Zwx!Lcx!P!;Z!P!Q#&`!Q!^!;Z!^!_#(i!_!}!;Z!}#O#,f#O#P!Dy#P#o!;Z#o#p#(i#p;'S!;Z;'S;=`#-w<%lO!;Z(Q!<w`$f&j(R!b!USOY!<nYZ&cZw!<nwx!=yx!P!<n!P!Q!Eq!Q!^!<n!^!_!Gr!_!}!<n!}#O!KS#O#P!Dy#P#o!<n#o#p!Gr#p;'S!<n;'S;=`!L]<%lO!<n&n!>Q^$f&j!USOY!=yYZ&cZ!P!=y!P!Q!>|!Q!^!=y!^!_!@c!_!}!=y!}#O!CW#O#P!Dy#P#o!=y#o#p!@c#p;'S!=y;'S;=`!Ek<%lO!=y&n!?Td$f&j!USO!^&c!_#W&c#W#X!>|#X#Z&c#Z#[!>|#[#]&c#]#^!>|#^#a&c#a#b!>|#b#g&c#g#h!>|#h#i&c#i#j!>|#j#k!>|#k#m&c#m#n!>|#n#o&c#p;'S&c;'S;=`&w<%lO&cS!@hX!USOY!@cZ!P!@c!P!Q!AT!Q!}!@c!}#O!Ar#O#P!Bq#P;'S!@c;'S;=`!CQ<%lO!@cS!AYW!US#W#X!AT#Z#[!AT#]#^!AT#a#b!AT#g#h!AT#i#j!AT#j#k!AT#m#n!ATS!AuVOY!ArZ#O!Ar#O#P!B[#P#Q!@c#Q;'S!Ar;'S;=`!Bk<%lO!ArS!B_SOY!ArZ;'S!Ar;'S;=`!Bk<%lO!ArS!BnP;=`<%l!ArS!BtSOY!@cZ;'S!@c;'S;=`!CQ<%lO!@cS!CTP;=`<%l!@c&n!C][$f&jOY!CWYZ&cZ!^!CW!^!_!Ar!_#O!CW#O#P!DR#P#Q!=y#Q#o!CW#o#p!Ar#p;'S!CW;'S;=`!Ds<%lO!CW&n!DWX$f&jOY!CWYZ&cZ!^!CW!^!_!Ar!_#o!CW#o#p!Ar#p;'S!CW;'S;=`!Ds<%lO!CW&n!DvP;=`<%l!CW&n!EOX$f&jOY!=yYZ&cZ!^!=y!^!_!@c!_#o!=y#o#p!@c#p;'S!=y;'S;=`!Ek<%lO!=y&n!EnP;=`<%l!=y(Q!Ezl$f&j(R!b!USOY&}YZ&cZw&}wx&cx!^&}!^!_'}!_#O&}#O#P&c#P#W&}#W#X!Eq#X#Z&}#Z#[!Eq#[#]&}#]#^!Eq#^#a&}#a#b!Eq#b#g&}#g#h!Eq#h#i&}#i#j!Eq#j#k!Eq#k#m&}#m#n!Eq#n#o&}#o#p'}#p;'S&};'S;=`(l<%lO&}!f!GyZ(R!b!USOY!GrZw!Grwx!@cx!P!Gr!P!Q!Hl!Q!}!Gr!}#O!JU#O#P!Bq#P;'S!Gr;'S;=`!J|<%lO!Gr!f!Hse(R!b!USOY'}Zw'}x#O'}#P#W'}#W#X!Hl#X#Z'}#Z#[!Hl#[#]'}#]#^!Hl#^#a'}#a#b!Hl#b#g'}#g#h!Hl#h#i'}#i#j!Hl#j#k!Hl#k#m'}#m#n!Hl#n;'S'};'S;=`(f<%lO'}!f!JZX(R!bOY!JUZw!JUwx!Arx#O!JU#O#P!B[#P#Q!Gr#Q;'S!JU;'S;=`!Jv<%lO!JU!f!JyP;=`<%l!JU!f!KPP;=`<%l!Gr(Q!KZ^$f&j(R!bOY!KSYZ&cZw!KSwx!CWx!^!KS!^!_!JU!_#O!KS#O#P!DR#P#Q!<n#Q#o!KS#o#p!JU#p;'S!KS;'S;=`!LV<%lO!KS(Q!LYP;=`<%l!KS(Q!L`P;=`<%l!<n'`!Ll`$f&j(Op!USOY!LcYZ&cZr!Lcrs!=ys!P!Lc!P!Q!Mn!Q!^!Lc!^!_# o!_!}!Lc!}#O#%P#O#P!Dy#P#o!Lc#o#p# o#p;'S!Lc;'S;=`#&Y<%lO!Lc'`!Mwl$f&j(Op!USOY(rYZ&cZr(rrs&cs!^(r!^!_)r!_#O(r#O#P&c#P#W(r#W#X!Mn#X#Z(r#Z#[!Mn#[#](r#]#^!Mn#^#a(r#a#b!Mn#b#g(r#g#h!Mn#h#i(r#i#j!Mn#j#k!Mn#k#m(r#m#n!Mn#n#o(r#o#p)r#p;'S(r;'S;=`*a<%lO(rt# vZ(Op!USOY# oZr# ors!@cs!P# o!P!Q#!i!Q!}# o!}#O#$R#O#P!Bq#P;'S# o;'S;=`#$y<%lO# ot#!pe(Op!USOY)rZr)rs#O)r#P#W)r#W#X#!i#X#Z)r#Z#[#!i#[#])r#]#^#!i#^#a)r#a#b#!i#b#g)r#g#h#!i#h#i)r#i#j#!i#j#k#!i#k#m)r#m#n#!i#n;'S)r;'S;=`*Z<%lO)rt#$WX(OpOY#$RZr#$Rrs!Ars#O#$R#O#P!B[#P#Q# o#Q;'S#$R;'S;=`#$s<%lO#$Rt#$vP;=`<%l#$Rt#$|P;=`<%l# o'`#%W^$f&j(OpOY#%PYZ&cZr#%Prs!CWs!^#%P!^!_#$R!_#O#%P#O#P!DR#P#Q!Lc#Q#o#%P#o#p#$R#p;'S#%P;'S;=`#&S<%lO#%P'`#&VP;=`<%l#%P'`#&]P;=`<%l!Lc(r#&kn$f&j(Op(R!b!USOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#W%Z#W#X#&`#X#Z%Z#Z#[#&`#[#]%Z#]#^#&`#^#a%Z#a#b#&`#b#g%Z#g#h#&`#h#i%Z#i#j#&`#j#k#&`#k#m%Z#m#n#&`#n#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z#W#(r](Op(R!b!USOY#(iZr#(irs!Grsw#(iwx# ox!P#(i!P!Q#)k!Q!}#(i!}#O#+`#O#P!Bq#P;'S#(i;'S;=`#,`<%lO#(i#W#)th(Op(R!b!USOY*gZr*grs'}sw*gwx)rx#O*g#P#W*g#W#X#)k#X#Z*g#Z#[#)k#[#]*g#]#^#)k#^#a*g#a#b#)k#b#g*g#g#h#)k#h#i*g#i#j#)k#j#k#)k#k#m*g#m#n#)k#n;'S*g;'S;=`+Z<%lO*g#W#+gZ(Op(R!bOY#+`Zr#+`rs!JUsw#+`wx#$Rx#O#+`#O#P!B[#P#Q#(i#Q;'S#+`;'S;=`#,Y<%lO#+`#W#,]P;=`<%l#+`#W#,cP;=`<%l#(i(r#,o`$f&j(Op(R!bOY#,fYZ&cZr#,frs!KSsw#,fwx#%Px!^#,f!^!_#+`!_#O#,f#O#P!DR#P#Q!;Z#Q#o#,f#o#p#+`#p;'S#,f;'S;=`#-q<%lO#,f(r#-tP;=`<%l#,f(r#-zP;=`<%l!;Z(CS#.[b$f&j(Op(R!b'v(;d!USOY!;ZYZ&cZr!;Zrs!<nsw!;Zwx!Lcx!P!;Z!P!Q#&`!Q!^!;Z!^!_#(i!_!}!;Z!}#O#,f#O#P!Dy#P#o!;Z#o#p#(i#p;'S!;Z;'S;=`#-w<%lO!;Z(CS#/o_$f&j(Op(R!bS(;dOY#/dYZ&cZr#/drs#0nsw#/dwx#4Ox!^#/d!^!_#5}!_#O#/d#O#P#1p#P#o#/d#o#p#5}#p;'S#/d;'S;=`#6|<%lO#/d(Bb#0w]$f&j(R!bS(;dOY#0nYZ&cZw#0nwx#1px!^#0n!^!_#3R!_#O#0n#O#P#1p#P#o#0n#o#p#3R#p;'S#0n;'S;=`#3x<%lO#0n(AO#1wX$f&jS(;dOY#1pYZ&cZ!^#1p!^!_#2d!_#o#1p#o#p#2d#p;'S#1p;'S;=`#2{<%lO#1p(;d#2iSS(;dOY#2dZ;'S#2d;'S;=`#2u<%lO#2d(;d#2xP;=`<%l#2d(AO#3OP;=`<%l#1p(<v#3YW(R!bS(;dOY#3RZw#3Rwx#2dx#O#3R#O#P#2d#P;'S#3R;'S;=`#3r<%lO#3R(<v#3uP;=`<%l#3R(Bb#3{P;=`<%l#0n(Ap#4X]$f&j(OpS(;dOY#4OYZ&cZr#4Ors#1ps!^#4O!^!_#5Q!_#O#4O#O#P#1p#P#o#4O#o#p#5Q#p;'S#4O;'S;=`#5w<%lO#4O(<U#5XW(OpS(;dOY#5QZr#5Qrs#2ds#O#5Q#O#P#2d#P;'S#5Q;'S;=`#5q<%lO#5Q(<U#5tP;=`<%l#5Q(Ap#5zP;=`<%l#4O(=h#6WY(Op(R!bS(;dOY#5}Zr#5}rs#3Rsw#5}wx#5Qx#O#5}#O#P#2d#P;'S#5};'S;=`#6v<%lO#5}(=h#6yP;=`<%l#5}(CS#7PP;=`<%l#/d%#W#7ab$f&j$O$Id(Op(R!b!USOY!;ZYZ&cZr!;Zrs!<nsw!;Zwx!Lcx!P!;Z!P!Q#&`!Q!^!;Z!^!_#(i!_!}!;Z!}#O#,f#O#P!Dy#P#o!;Z#o#p#(i#p;'S!;Z;'S;=`#-w<%lO!;Z+h#8vb$W#t$f&j(Op(R!b!USOY!;ZYZ&cZr!;Zrs!<nsw!;Zwx!Lcx!P!;Z!P!Q#&`!Q!^!;Z!^!_#(i!_!}!;Z!}#O#,f#O#P!Dy#P#o!;Z#o#p#(i#p;'S!;Z;'S;=`#-w<%lO!;Z$/l#:Zp$f&j(Op(R!bo$'|OY%ZYZ&cZr%Zrs&}sw%Zwx(rx!O%Z!O!P!3Y!P!Q%Z!Q![#<_![!^%Z!^!_*g!_!g%Z!g!h!4|!h#O%Z#O#P&c#P#R%Z#R#S#<_#S#U%Z#U#V#?i#V#X%Z#X#Y!4|#Y#b%Z#b#c#>_#c#d#Bq#d#l%Z#l#m#Es#m#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z$/l#<jk$f&j(Op(R!bo$'|OY%ZYZ&cZr%Zrs&}sw%Zwx(rx!O%Z!O!P!3Y!P!Q%Z!Q![#<_![!^%Z!^!_*g!_!g%Z!g!h!4|!h#O%Z#O#P&c#P#R%Z#R#S#<_#S#X%Z#X#Y!4|#Y#b%Z#b#c#>_#c#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z$/l#>j_$f&j(Op(R!bo$'|OY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z$/l#?rd$f&j(Op(R!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q!R#AQ!R!S#AQ!S!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S#AQ#S#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z$/l#A]f$f&j(Op(R!bo$'|OY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q!R#AQ!R!S#AQ!S!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S#AQ#S#b%Z#b#c#>_#c#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z$/l#Bzc$f&j(Op(R!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q!Y#DV!Y!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S#DV#S#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z$/l#Dbe$f&j(Op(R!bo$'|OY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q!Y#DV!Y!^%Z!^!_*g!_#O%Z#O#P&c#P#R%Z#R#S#DV#S#b%Z#b#c#>_#c#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z$/l#E|g$f&j(Op(R!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q![#Ge![!^%Z!^!_*g!_!c%Z!c!i#Ge!i#O%Z#O#P&c#P#R%Z#R#S#Ge#S#T%Z#T#Z#Ge#Z#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z$/l#Gpi$f&j(Op(R!bo$'|OY%ZYZ&cZr%Zrs&}sw%Zwx(rx!Q%Z!Q![#Ge![!^%Z!^!_*g!_!c%Z!c!i#Ge!i#O%Z#O#P&c#P#R%Z#R#S#Ge#S#T%Z#T#Z#Ge#Z#b%Z#b#c#>_#c#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%Gh#Il_!d$b$f&j#|%<f(Op(R!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z)[#Jv_`l$f&j(Op(R!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(@^#LS^g!*v!h'.r(Op(R!b(uSOY*gZr*grs'}sw*gwx)rx!P*g!P!Q#MO!Q!^*g!^!_#Mt!_!`$ f!`#O*g#P;'S*g;'S;=`+Z<%lO*g(n#MXX$h&j(Op(R!bOY*gZr*grs'}sw*gwx)rx#O*g#P;'S*g;'S;=`+Z<%lO*g$Kh#M}Z#n$Id(Op(R!bOY*gZr*grs'}sw*gwx)rx!_*g!_!`#Np!`#O*g#P;'S*g;'S;=`+Z<%lO*g$Kh#NyX$O$Id(Op(R!bOY*gZr*grs'}sw*gwx)rx#O*g#P;'S*g;'S;=`+Z<%lO*g$Kh$ oX#o$Id(Op(R!bOY*gZr*grs'}sw*gwx)rx#O*g#P;'S*g;'S;=`+Z<%lO*g%Gh$!ga#[%?x$f&j(Op(R!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`0z!`!a$#l!a#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%#W$#w_#g$Ih$f&j(Op(R!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%Gh$%VafBf#o$Id$c#|$f&j(Op(R!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`$&[!`!a$'f!a#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%#S$&g_#o$Id$f&j(Op(R!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%#S$'qa#n$Id$f&j(Op(R!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`!a$(v!a#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%#S$)R`#n$Id$f&j(Op(R!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'+h$*`c(i$Ip$f&j(Op(R!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!O%Z!O!P$+k!P!^%Z!^!_*g!_!a%Z!a!b$,u!b#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z'+`$+v_}'#p$f&j(Op(R!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%#S$-Q`$f&j#y$Id(Op(R!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z#&^$.__!{!Ln$f&j(Op(R!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(@^$/i_!P(8n$f&j(Op(R!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(n$0mZ$f&jO!^$1`!^!_$1v!_#i$1`#i#j$1{#j#l$1`#l#m$3n#m#o$1`#o#p$1v#p;'S$1`;'S;=`$5y<%lO$1`(n$1gT^#S$f&jO!^&c!_#o&c#p;'S&c;'S;=`&w<%lO&c#S$1{O^#S(n$2Q[$f&jO!Q&c!Q![$2v![!^&c!_!c&c!c!i$2v!i#T&c#T#Z$2v#Z#o&c#o#p$5^#p;'S&c;'S;=`&w<%lO&c(n$2{Z$f&jO!Q&c!Q![$3n![!^&c!_!c&c!c!i$3n!i#T&c#T#Z$3n#Z#o&c#p;'S&c;'S;=`&w<%lO&c(n$3sZ$f&jO!Q&c!Q![$4f![!^&c!_!c&c!c!i$4f!i#T&c#T#Z$4f#Z#o&c#p;'S&c;'S;=`&w<%lO&c(n$4kZ$f&jO!Q&c!Q![$1`![!^&c!_!c&c!c!i$1`!i#T&c#T#Z$1`#Z#o&c#p;'S&c;'S;=`&w<%lO&c#S$5aR!Q![$5j!c!i$5j#T#Z$5j#S$5mS!Q![$5j!c!i$5j#T#Z$5j#q#r$1v(n$5|P;=`<%l$1`!2r$6[_!V!+S$f&j(Op(R!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z%#S$7f`#v$Id$f&j(Op(R!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z&,v$8s_$f&j(Op(R!b(X&%WOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(CS$:Rk$f&j(Op(R!b'{&;d$[#t([!LYOY%ZYZ&cZr%Zrs&}st%Ztu$9ruw%Zwx(rx}%Z}!O$;v!O!Q%Z!Q![$9r![!^%Z!^!_*g!_!c%Z!c!}$9r!}#O%Z#O#P&c#P#R%Z#R#S$9r#S#T%Z#T#o$9r#o#p*g#p$g%Z$g;'S$9r;'S;=`$=|<%lO$9r+d$<Rk$f&j(Op(R!b$[#tOY%ZYZ&cZr%Zrs&}st%Ztu$;vuw%Zwx(rx}%Z}!O$;v!O!Q%Z!Q![$;v![!^%Z!^!_*g!_!c%Z!c!}$;v!}#O%Z#O#P&c#P#R%Z#R#S$;v#S#T%Z#T#o$;v#o#p*g#p$g%Z$g;'S$;v;'S;=`$=v<%lO$;v+d$=yP;=`<%l$;v(CS$>PP;=`<%l$9r!5p$>]X![!3l(Op(R!bOY*gZr*grs'}sw*gwx)rx#O*g#P;'S*g;'S;=`+Z<%lO*g&CO$?Ta(p&;`$f&j(Op(R!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_!`Ka!`#O%Z#O#P&c#P#o%Z#o#p*g#p#q$,u#q;'S%Z;'S;=`+a<%lO%Z%#`$@g_!Z$I`r`$f&j(Op(R!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(r$Aq_!pS$f&j(Op(R!bOY%ZYZ&cZr%Zrs&}sw%Zwx(rx!^%Z!^!_*g!_#O%Z#O#P&c#P#o%Z#o#p*g#p;'S%Z;'S;=`+a<%lO%Z(CS$CR|$f&j(Op(R!b't(;d$Y#t'{&;d([!LYOX%ZXY+gYZ&cZ[+g[p%Zpq+gqr%Zrs&}st%ZtuEruw%Zwx(rx}%Z}!OGv!O!Q%Z!Q![Er![!^%Z!^!_*g!_!c%Z!c!}Er!}#O%Z#O#P&c#P#R%Z#R#SEr#S#T%Z#T#oEr#o#p*g#p$f%Z$f$g+g$g#BYEr#BY#BZ$Bp#BZ$ISEr$IS$I_$Bp$I_$JTEr$JT$JU$Bp$JU$KVEr$KV$KW$Bp$KW&FUEr&FU&FV$Bp&FV;'SEr;'S;=`I|<%l?HTEr?HT?HU$Bp?HUOEr(CS$F^k$f&j(Op(R!b'u(;d$Y#t'{&;d([!LYOY%ZYZ&cZr%Zrs&}st%ZtuEruw%Zwx(rx}%Z}!OGv!O!Q%Z!Q![Er![!^%Z!^!_*g!_!c%Z!c!}Er!}#O%Z#O#P&c#P#R%Z#R#SEr#S#T%Z#T#oEr#o#p*g#p$g%Z$g;'SEr;'S;=`I|<%lOEr",
  tokenizers: [noSemicolon, incdecToken, jsx, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, insertSemicolon, new LocalTokenGroup("$S~RRtu[#O#Pg#S#T#|~_P#o#pb~gOt~~jVO#i!P#i#j!U#j#l!P#l#m!q#m;'S!P;'S;=`#v<%lO!P~!UO!R~~!XS!Q![!e!c!i!e#T#Z!e#o#p#Z~!hR!Q![!q!c!i!q#T#Z!q~!tR!Q![!}!c!i!}#T#Z!}~#QR!Q![!P!c!i!P#T#Z!P~#^R!Q![#g!c!i#g#T#Z#g~#jS!Q![#g!c!i#g#T#Z#g#q#r!P~#yP;=`<%l!P~$RO(Z~~", 141, 332), new LocalTokenGroup("j~RQYZXz{^~^O'x~~aP!P!Qd~iO'y~~", 25, 315)],
  topRules: { "Script": [0, 6], "SingleExpression": [1, 269], "SingleClassItem": [2, 270] },
  dialects: { jsx: 0, ts: 14826 },
  dynamicPrecedences: { "69": 1, "79": 1, "81": 1, "165": 1, "193": 1 },
  specialized: [{ term: 319, get: (value) => spec_identifier2[value] || -1 }, { term: 334, get: (value) => spec_word[value] || -1 }, { term: 70, get: (value) => spec_LessThan[value] || -1 }],
  tokenPrec: 14850
});

// node_modules/@codemirror/lang-javascript/dist/index.js
var snippets = [
  /* @__PURE__ */ snippetCompletion("function ${name}(${params}) {\n	${}\n}", {
    label: "function",
    detail: "definition",
    type: "keyword"
  }),
  /* @__PURE__ */ snippetCompletion("for (let ${index} = 0; ${index} < ${bound}; ${index}++) {\n	${}\n}", {
    label: "for",
    detail: "loop",
    type: "keyword"
  }),
  /* @__PURE__ */ snippetCompletion("for (let ${name} of ${collection}) {\n	${}\n}", {
    label: "for",
    detail: "of loop",
    type: "keyword"
  }),
  /* @__PURE__ */ snippetCompletion("do {\n	${}\n} while (${})", {
    label: "do",
    detail: "loop",
    type: "keyword"
  }),
  /* @__PURE__ */ snippetCompletion("while (${}) {\n	${}\n}", {
    label: "while",
    detail: "loop",
    type: "keyword"
  }),
  /* @__PURE__ */ snippetCompletion("try {\n	${}\n} catch (${error}) {\n	${}\n}", {
    label: "try",
    detail: "/ catch block",
    type: "keyword"
  }),
  /* @__PURE__ */ snippetCompletion("if (${}) {\n	${}\n}", {
    label: "if",
    detail: "block",
    type: "keyword"
  }),
  /* @__PURE__ */ snippetCompletion("if (${}) {\n	${}\n} else {\n	${}\n}", {
    label: "if",
    detail: "/ else block",
    type: "keyword"
  }),
  /* @__PURE__ */ snippetCompletion("class ${name} {\n	constructor(${params}) {\n		${}\n	}\n}", {
    label: "class",
    detail: "definition",
    type: "keyword"
  }),
  /* @__PURE__ */ snippetCompletion('import {${names}} from "${module}"\n${}', {
    label: "import",
    detail: "named",
    type: "keyword"
  }),
  /* @__PURE__ */ snippetCompletion('import ${name} from "${module}"\n${}', {
    label: "import",
    detail: "default",
    type: "keyword"
  })
];
var typescriptSnippets = /* @__PURE__ */ snippets.concat([
  /* @__PURE__ */ snippetCompletion("interface ${name} {\n	${}\n}", {
    label: "interface",
    detail: "definition",
    type: "keyword"
  }),
  /* @__PURE__ */ snippetCompletion("type ${name} = ${type}", {
    label: "type",
    detail: "definition",
    type: "keyword"
  }),
  /* @__PURE__ */ snippetCompletion("enum ${name} {\n	${}\n}", {
    label: "enum",
    detail: "definition",
    type: "keyword"
  })
]);
var cache = /* @__PURE__ */ new NodeWeakMap();
var ScopeNodes = /* @__PURE__ */ new Set([
  "Script",
  "Block",
  "FunctionExpression",
  "FunctionDeclaration",
  "ArrowFunction",
  "MethodDeclaration",
  "ForStatement"
]);
function defID(type) {
  return (node, def) => {
    let id2 = node.node.getChild("VariableDefinition");
    if (id2)
      def(id2, type);
    return true;
  };
}
var functionContext = ["FunctionDeclaration"];
var gatherCompletions = {
  FunctionDeclaration: /* @__PURE__ */ defID("function"),
  ClassDeclaration: /* @__PURE__ */ defID("class"),
  ClassExpression: () => true,
  EnumDeclaration: /* @__PURE__ */ defID("constant"),
  TypeAliasDeclaration: /* @__PURE__ */ defID("type"),
  NamespaceDeclaration: /* @__PURE__ */ defID("namespace"),
  VariableDefinition(node, def) {
    if (!node.matchContext(functionContext))
      def(node, "variable");
  },
  TypeDefinition(node, def) {
    def(node, "type");
  },
  __proto__: null
};
function getScope(doc2, node) {
  let cached = cache.get(node);
  if (cached)
    return cached;
  let completions = [], top2 = true;
  function def(node2, type) {
    let name2 = doc2.sliceString(node2.from, node2.to);
    completions.push({ label: name2, type });
  }
  node.cursor(IterMode.IncludeAnonymous).iterate((node2) => {
    if (top2) {
      top2 = false;
    } else if (node2.name) {
      let gather = gatherCompletions[node2.name];
      if (gather && gather(node2, def) || ScopeNodes.has(node2.name))
        return false;
    } else if (node2.to - node2.from > 8192) {
      for (let c of getScope(doc2, node2.node))
        completions.push(c);
      return false;
    }
  });
  cache.set(node, completions);
  return completions;
}
var Identifier = /^[\w$\xa1-\uffff][\w$\d\xa1-\uffff]*$/;
var dontComplete = [
  "TemplateString",
  "String",
  "RegExp",
  "LineComment",
  "BlockComment",
  "VariableDefinition",
  "TypeDefinition",
  "Label",
  "PropertyDefinition",
  "PropertyName",
  "PrivatePropertyDefinition",
  "PrivatePropertyName",
  ".",
  "?."
];
function localCompletionSource(context) {
  let inner = syntaxTree(context.state).resolveInner(context.pos, -1);
  if (dontComplete.indexOf(inner.name) > -1)
    return null;
  let isWord = inner.name == "VariableName" || inner.to - inner.from < 20 && Identifier.test(context.state.sliceDoc(inner.from, inner.to));
  if (!isWord && !context.explicit)
    return null;
  let options = [];
  for (let pos = inner; pos; pos = pos.parent) {
    if (ScopeNodes.has(pos.name))
      options = options.concat(getScope(context.state.doc, pos));
  }
  return {
    options,
    from: isWord ? inner.from : context.pos,
    validFor: Identifier
  };
}
var javascriptLanguage = /* @__PURE__ */ LRLanguage.define({
  name: "javascript",
  parser: /* @__PURE__ */ parser3.configure({
    props: [
      /* @__PURE__ */ indentNodeProp.add({
        IfStatement: /* @__PURE__ */ continuedIndent({ except: /^\s*({|else\b)/ }),
        TryStatement: /* @__PURE__ */ continuedIndent({ except: /^\s*({|catch\b|finally\b)/ }),
        LabeledStatement: flatIndent,
        SwitchBody: (context) => {
          let after = context.textAfter, closed = /^\s*\}/.test(after), isCase = /^\s*(case|default)\b/.test(after);
          return context.baseIndent + (closed ? 0 : isCase ? 1 : 2) * context.unit;
        },
        Block: /* @__PURE__ */ delimitedIndent({ closing: "}" }),
        ArrowFunction: (cx) => cx.baseIndent + cx.unit,
        "TemplateString BlockComment": () => null,
        "Statement Property": /* @__PURE__ */ continuedIndent({ except: /^{/ }),
        JSXElement(context) {
          let closed = /^\s*<\//.test(context.textAfter);
          return context.lineIndent(context.node.from) + (closed ? 0 : context.unit);
        },
        JSXEscape(context) {
          let closed = /\s*\}/.test(context.textAfter);
          return context.lineIndent(context.node.from) + (closed ? 0 : context.unit);
        },
        "JSXOpenTag JSXSelfClosingTag"(context) {
          return context.column(context.node.from) + context.unit;
        }
      }),
      /* @__PURE__ */ foldNodeProp.add({
        "Block ClassBody SwitchBody EnumBody ObjectExpression ArrayExpression ObjectType": foldInside,
        BlockComment(tree) {
          return { from: tree.from + 2, to: tree.to - 2 };
        }
      })
    ]
  }),
  languageData: {
    closeBrackets: { brackets: ["(", "[", "{", "'", '"', "`"] },
    commentTokens: { line: "//", block: { open: "/*", close: "*/" } },
    indentOnInput: /^\s*(?:case |default:|\{|\}|<\/)$/,
    wordChars: "$"
  }
});
var jsxSublanguage = {
  test: (node) => /^JSX/.test(node.name),
  facet: /* @__PURE__ */ defineLanguageFacet({ commentTokens: { block: { open: "{/*", close: "*/}" } } })
};
var typescriptLanguage = /* @__PURE__ */ javascriptLanguage.configure({ dialect: "ts" }, "typescript");
var jsxLanguage = /* @__PURE__ */ javascriptLanguage.configure({
  dialect: "jsx",
  props: [/* @__PURE__ */ sublanguageProp.add((n) => n.isTop ? [jsxSublanguage] : void 0)]
});
var tsxLanguage = /* @__PURE__ */ javascriptLanguage.configure({
  dialect: "jsx ts",
  props: [/* @__PURE__ */ sublanguageProp.add((n) => n.isTop ? [jsxSublanguage] : void 0)]
}, "typescript");
var kwCompletion = (name2) => ({ label: name2, type: "keyword" });
var keywords = /* @__PURE__ */ "break case const continue default delete export extends false finally in instanceof let new return static super switch this throw true typeof var yield".split(" ").map(kwCompletion);
var typescriptKeywords = /* @__PURE__ */ keywords.concat(/* @__PURE__ */ ["declare", "implements", "private", "protected", "public"].map(kwCompletion));
function javascript(config = {}) {
  let lang = config.jsx ? config.typescript ? tsxLanguage : jsxLanguage : config.typescript ? typescriptLanguage : javascriptLanguage;
  let completions = config.typescript ? typescriptSnippets.concat(typescriptKeywords) : snippets.concat(keywords);
  return new LanguageSupport(lang, [
    javascriptLanguage.data.of({
      autocomplete: ifNotIn(dontComplete, completeFromList(completions))
    }),
    javascriptLanguage.data.of({
      autocomplete: localCompletionSource
    }),
    config.jsx ? autoCloseTags : []
  ]);
}
function findOpenTag(node) {
  for (; ; ) {
    if (node.name == "JSXOpenTag" || node.name == "JSXSelfClosingTag" || node.name == "JSXFragmentTag")
      return node;
    if (node.name == "JSXEscape" || !node.parent)
      return null;
    node = node.parent;
  }
}
function elementName(doc2, tree, max = doc2.length) {
  for (let ch = tree === null || tree === void 0 ? void 0 : tree.firstChild; ch; ch = ch.nextSibling) {
    if (ch.name == "JSXIdentifier" || ch.name == "JSXBuiltin" || ch.name == "JSXNamespacedName" || ch.name == "JSXMemberExpression")
      return doc2.sliceString(ch.from, Math.min(ch.to, max));
  }
  return "";
}
var android2 = typeof navigator == "object" && /* @__PURE__ */ /Android\b/.test(navigator.userAgent);
var autoCloseTags = /* @__PURE__ */ EditorView.inputHandler.of((view, from, to, text, defaultInsert) => {
  if ((android2 ? view.composing : view.compositionStarted) || view.state.readOnly || from != to || text != ">" && text != "/" || !javascriptLanguage.isActiveAt(view.state, from, -1))
    return false;
  let base2 = defaultInsert(), { state } = base2;
  let closeTags = state.changeByRange((range) => {
    var _a2;
    let { head } = range, around = syntaxTree(state).resolveInner(head - 1, -1), name2;
    if (around.name == "JSXStartTag")
      around = around.parent;
    if (state.doc.sliceString(head - 1, head) != text || around.name == "JSXAttributeValue" && around.to > head)
      ;
    else if (text == ">" && around.name == "JSXFragmentTag") {
      return { range, changes: { from: head, insert: `</>` } };
    } else if (text == "/" && around.name == "JSXStartCloseTag") {
      let empty = around.parent, base3 = empty.parent;
      if (base3 && empty.from == head - 2 && ((name2 = elementName(state.doc, base3.firstChild, head)) || ((_a2 = base3.firstChild) === null || _a2 === void 0 ? void 0 : _a2.name) == "JSXFragmentTag")) {
        let insert2 = `${name2}>`;
        return { range: EditorSelection.cursor(head + insert2.length, -1), changes: { from: head, insert: insert2 } };
      }
    } else if (text == ">") {
      let openTag = findOpenTag(around);
      if (openTag && openTag.name == "JSXOpenTag" && !/^\/?>|^<\//.test(state.doc.sliceString(head, head + 2)) && (name2 = elementName(state.doc, openTag, head)))
        return { range, changes: { from: head, insert: `</${name2}>` } };
    }
    return { range };
  });
  if (closeTags.changes.empty)
    return false;
  view.dispatch([
    base2,
    state.update(closeTags, { userEvent: "input.complete", scrollIntoView: true })
  ]);
  return true;
});

// node_modules/@codemirror/lang-html/dist/index.js
var Targets = ["_blank", "_self", "_top", "_parent"];
var Charsets = ["ascii", "utf-8", "utf-16", "latin1", "latin1"];
var Methods = ["get", "post", "put", "delete"];
var Encs = ["application/x-www-form-urlencoded", "multipart/form-data", "text/plain"];
var Bool = ["true", "false"];
var S = {};
var Tags = {
  a: {
    attrs: {
      href: null,
      ping: null,
      type: null,
      media: null,
      target: Targets,
      hreflang: null
    }
  },
  abbr: S,
  address: S,
  area: {
    attrs: {
      alt: null,
      coords: null,
      href: null,
      target: null,
      ping: null,
      media: null,
      hreflang: null,
      type: null,
      shape: ["default", "rect", "circle", "poly"]
    }
  },
  article: S,
  aside: S,
  audio: {
    attrs: {
      src: null,
      mediagroup: null,
      crossorigin: ["anonymous", "use-credentials"],
      preload: ["none", "metadata", "auto"],
      autoplay: ["autoplay"],
      loop: ["loop"],
      controls: ["controls"]
    }
  },
  b: S,
  base: { attrs: { href: null, target: Targets } },
  bdi: S,
  bdo: S,
  blockquote: { attrs: { cite: null } },
  body: S,
  br: S,
  button: {
    attrs: {
      form: null,
      formaction: null,
      name: null,
      value: null,
      autofocus: ["autofocus"],
      disabled: ["autofocus"],
      formenctype: Encs,
      formmethod: Methods,
      formnovalidate: ["novalidate"],
      formtarget: Targets,
      type: ["submit", "reset", "button"]
    }
  },
  canvas: { attrs: { width: null, height: null } },
  caption: S,
  center: S,
  cite: S,
  code: S,
  col: { attrs: { span: null } },
  colgroup: { attrs: { span: null } },
  command: {
    attrs: {
      type: ["command", "checkbox", "radio"],
      label: null,
      icon: null,
      radiogroup: null,
      command: null,
      title: null,
      disabled: ["disabled"],
      checked: ["checked"]
    }
  },
  data: { attrs: { value: null } },
  datagrid: { attrs: { disabled: ["disabled"], multiple: ["multiple"] } },
  datalist: { attrs: { data: null } },
  dd: S,
  del: { attrs: { cite: null, datetime: null } },
  details: { attrs: { open: ["open"] } },
  dfn: S,
  div: S,
  dl: S,
  dt: S,
  em: S,
  embed: { attrs: { src: null, type: null, width: null, height: null } },
  eventsource: { attrs: { src: null } },
  fieldset: { attrs: { disabled: ["disabled"], form: null, name: null } },
  figcaption: S,
  figure: S,
  footer: S,
  form: {
    attrs: {
      action: null,
      name: null,
      "accept-charset": Charsets,
      autocomplete: ["on", "off"],
      enctype: Encs,
      method: Methods,
      novalidate: ["novalidate"],
      target: Targets
    }
  },
  h1: S,
  h2: S,
  h3: S,
  h4: S,
  h5: S,
  h6: S,
  head: {
    children: ["title", "base", "link", "style", "meta", "script", "noscript", "command"]
  },
  header: S,
  hgroup: S,
  hr: S,
  html: {
    attrs: { manifest: null }
  },
  i: S,
  iframe: {
    attrs: {
      src: null,
      srcdoc: null,
      name: null,
      width: null,
      height: null,
      sandbox: ["allow-top-navigation", "allow-same-origin", "allow-forms", "allow-scripts"],
      seamless: ["seamless"]
    }
  },
  img: {
    attrs: {
      alt: null,
      src: null,
      ismap: null,
      usemap: null,
      width: null,
      height: null,
      crossorigin: ["anonymous", "use-credentials"]
    }
  },
  input: {
    attrs: {
      alt: null,
      dirname: null,
      form: null,
      formaction: null,
      height: null,
      list: null,
      max: null,
      maxlength: null,
      min: null,
      name: null,
      pattern: null,
      placeholder: null,
      size: null,
      src: null,
      step: null,
      value: null,
      width: null,
      accept: ["audio/*", "video/*", "image/*"],
      autocomplete: ["on", "off"],
      autofocus: ["autofocus"],
      checked: ["checked"],
      disabled: ["disabled"],
      formenctype: Encs,
      formmethod: Methods,
      formnovalidate: ["novalidate"],
      formtarget: Targets,
      multiple: ["multiple"],
      readonly: ["readonly"],
      required: ["required"],
      type: [
        "hidden",
        "text",
        "search",
        "tel",
        "url",
        "email",
        "password",
        "datetime",
        "date",
        "month",
        "week",
        "time",
        "datetime-local",
        "number",
        "range",
        "color",
        "checkbox",
        "radio",
        "file",
        "submit",
        "image",
        "reset",
        "button"
      ]
    }
  },
  ins: { attrs: { cite: null, datetime: null } },
  kbd: S,
  keygen: {
    attrs: {
      challenge: null,
      form: null,
      name: null,
      autofocus: ["autofocus"],
      disabled: ["disabled"],
      keytype: ["RSA"]
    }
  },
  label: { attrs: { for: null, form: null } },
  legend: S,
  li: { attrs: { value: null } },
  link: {
    attrs: {
      href: null,
      type: null,
      hreflang: null,
      media: null,
      sizes: ["all", "16x16", "16x16 32x32", "16x16 32x32 64x64"]
    }
  },
  map: { attrs: { name: null } },
  mark: S,
  menu: { attrs: { label: null, type: ["list", "context", "toolbar"] } },
  meta: {
    attrs: {
      content: null,
      charset: Charsets,
      name: ["viewport", "application-name", "author", "description", "generator", "keywords"],
      "http-equiv": ["content-language", "content-type", "default-style", "refresh"]
    }
  },
  meter: { attrs: { value: null, min: null, low: null, high: null, max: null, optimum: null } },
  nav: S,
  noscript: S,
  object: {
    attrs: {
      data: null,
      type: null,
      name: null,
      usemap: null,
      form: null,
      width: null,
      height: null,
      typemustmatch: ["typemustmatch"]
    }
  },
  ol: {
    attrs: { reversed: ["reversed"], start: null, type: ["1", "a", "A", "i", "I"] },
    children: ["li", "script", "template", "ul", "ol"]
  },
  optgroup: { attrs: { disabled: ["disabled"], label: null } },
  option: { attrs: { disabled: ["disabled"], label: null, selected: ["selected"], value: null } },
  output: { attrs: { for: null, form: null, name: null } },
  p: S,
  param: { attrs: { name: null, value: null } },
  pre: S,
  progress: { attrs: { value: null, max: null } },
  q: { attrs: { cite: null } },
  rp: S,
  rt: S,
  ruby: S,
  samp: S,
  script: {
    attrs: {
      type: ["text/javascript"],
      src: null,
      async: ["async"],
      defer: ["defer"],
      charset: Charsets
    }
  },
  section: S,
  select: {
    attrs: {
      form: null,
      name: null,
      size: null,
      autofocus: ["autofocus"],
      disabled: ["disabled"],
      multiple: ["multiple"]
    }
  },
  slot: { attrs: { name: null } },
  small: S,
  source: { attrs: { src: null, type: null, media: null } },
  span: S,
  strong: S,
  style: {
    attrs: {
      type: ["text/css"],
      media: null,
      scoped: null
    }
  },
  sub: S,
  summary: S,
  sup: S,
  table: S,
  tbody: S,
  td: { attrs: { colspan: null, rowspan: null, headers: null } },
  template: S,
  textarea: {
    attrs: {
      dirname: null,
      form: null,
      maxlength: null,
      name: null,
      placeholder: null,
      rows: null,
      cols: null,
      autofocus: ["autofocus"],
      disabled: ["disabled"],
      readonly: ["readonly"],
      required: ["required"],
      wrap: ["soft", "hard"]
    }
  },
  tfoot: S,
  th: { attrs: { colspan: null, rowspan: null, headers: null, scope: ["row", "col", "rowgroup", "colgroup"] } },
  thead: S,
  time: { attrs: { datetime: null } },
  title: S,
  tr: S,
  track: {
    attrs: {
      src: null,
      label: null,
      default: null,
      kind: ["subtitles", "captions", "descriptions", "chapters", "metadata"],
      srclang: null
    }
  },
  ul: { children: ["li", "script", "template", "ul", "ol"] },
  var: S,
  video: {
    attrs: {
      src: null,
      poster: null,
      width: null,
      height: null,
      crossorigin: ["anonymous", "use-credentials"],
      preload: ["auto", "metadata", "none"],
      autoplay: ["autoplay"],
      mediagroup: ["movie"],
      muted: ["muted"],
      controls: ["controls"]
    }
  },
  wbr: S
};
var GlobalAttrs = {
  accesskey: null,
  class: null,
  contenteditable: Bool,
  contextmenu: null,
  dir: ["ltr", "rtl", "auto"],
  draggable: ["true", "false", "auto"],
  dropzone: ["copy", "move", "link", "string:", "file:"],
  hidden: ["hidden"],
  id: null,
  inert: ["inert"],
  itemid: null,
  itemprop: null,
  itemref: null,
  itemscope: ["itemscope"],
  itemtype: null,
  lang: ["ar", "bn", "de", "en-GB", "en-US", "es", "fr", "hi", "id", "ja", "pa", "pt", "ru", "tr", "zh"],
  spellcheck: Bool,
  autocorrect: Bool,
  autocapitalize: Bool,
  style: null,
  tabindex: null,
  title: null,
  translate: ["yes", "no"],
  rel: ["stylesheet", "alternate", "author", "bookmark", "help", "license", "next", "nofollow", "noreferrer", "prefetch", "prev", "search", "tag"],
  role: /* @__PURE__ */ "alert application article banner button cell checkbox complementary contentinfo dialog document feed figure form grid gridcell heading img list listbox listitem main navigation region row rowgroup search switch tab table tabpanel textbox timer".split(" "),
  "aria-activedescendant": null,
  "aria-atomic": Bool,
  "aria-autocomplete": ["inline", "list", "both", "none"],
  "aria-busy": Bool,
  "aria-checked": ["true", "false", "mixed", "undefined"],
  "aria-controls": null,
  "aria-describedby": null,
  "aria-disabled": Bool,
  "aria-dropeffect": null,
  "aria-expanded": ["true", "false", "undefined"],
  "aria-flowto": null,
  "aria-grabbed": ["true", "false", "undefined"],
  "aria-haspopup": Bool,
  "aria-hidden": Bool,
  "aria-invalid": ["true", "false", "grammar", "spelling"],
  "aria-label": null,
  "aria-labelledby": null,
  "aria-level": null,
  "aria-live": ["off", "polite", "assertive"],
  "aria-multiline": Bool,
  "aria-multiselectable": Bool,
  "aria-owns": null,
  "aria-posinset": null,
  "aria-pressed": ["true", "false", "mixed", "undefined"],
  "aria-readonly": Bool,
  "aria-relevant": null,
  "aria-required": Bool,
  "aria-selected": ["true", "false", "undefined"],
  "aria-setsize": null,
  "aria-sort": ["ascending", "descending", "none", "other"],
  "aria-valuemax": null,
  "aria-valuemin": null,
  "aria-valuenow": null,
  "aria-valuetext": null
};
var eventAttributes = /* @__PURE__ */ "beforeunload copy cut dragstart dragover dragleave dragenter dragend drag paste focus blur change click load mousedown mouseenter mouseleave mouseup keydown keyup resize scroll unload".split(" ").map((n) => "on" + n);
for (let a of eventAttributes)
  GlobalAttrs[a] = null;
var Schema = class {
  constructor(extraTags, extraAttrs) {
    this.tags = Object.assign(Object.assign({}, Tags), extraTags);
    this.globalAttrs = Object.assign(Object.assign({}, GlobalAttrs), extraAttrs);
    this.allTags = Object.keys(this.tags);
    this.globalAttrNames = Object.keys(this.globalAttrs);
  }
};
Schema.default = /* @__PURE__ */ new Schema();
function elementName2(doc2, tree, max = doc2.length) {
  if (!tree)
    return "";
  let tag = tree.firstChild;
  let name2 = tag && tag.getChild("TagName");
  return name2 ? doc2.sliceString(name2.from, Math.min(name2.to, max)) : "";
}
function findParentElement(tree, skip = false) {
  for (; tree; tree = tree.parent)
    if (tree.name == "Element") {
      if (skip)
        skip = false;
      else
        return tree;
    }
  return null;
}
function allowedChildren(doc2, tree, schema) {
  let parentInfo = schema.tags[elementName2(doc2, findParentElement(tree))];
  return (parentInfo === null || parentInfo === void 0 ? void 0 : parentInfo.children) || schema.allTags;
}
function openTags(doc2, tree) {
  let open = [];
  for (let parent = findParentElement(tree); parent && !parent.type.isTop; parent = findParentElement(parent.parent)) {
    let tagName = elementName2(doc2, parent);
    if (tagName && parent.lastChild.name == "CloseTag")
      break;
    if (tagName && open.indexOf(tagName) < 0 && (tree.name == "EndTag" || tree.from >= parent.firstChild.to))
      open.push(tagName);
  }
  return open;
}
var identifier3 = /^[:\-\.\w\u00b7-\uffff]*$/;
function completeTag(state, schema, tree, from, to) {
  let end = /\s*>/.test(state.sliceDoc(to, to + 5)) ? "" : ">";
  let parent = findParentElement(tree, true);
  return {
    from,
    to,
    options: allowedChildren(state.doc, parent, schema).map((tagName) => ({ label: tagName, type: "type" })).concat(openTags(state.doc, tree).map((tag, i) => ({
      label: "/" + tag,
      apply: "/" + tag + end,
      type: "type",
      boost: 99 - i
    }))),
    validFor: /^\/?[:\-\.\w\u00b7-\uffff]*$/
  };
}
function completeCloseTag(state, tree, from, to) {
  let end = /\s*>/.test(state.sliceDoc(to, to + 5)) ? "" : ">";
  return {
    from,
    to,
    options: openTags(state.doc, tree).map((tag, i) => ({ label: tag, apply: tag + end, type: "type", boost: 99 - i })),
    validFor: identifier3
  };
}
function completeStartTag(state, schema, tree, pos) {
  let options = [], level = 0;
  for (let tagName of allowedChildren(state.doc, tree, schema))
    options.push({ label: "<" + tagName, type: "type" });
  for (let open of openTags(state.doc, tree))
    options.push({ label: "</" + open + ">", type: "type", boost: 99 - level++ });
  return { from: pos, to: pos, options, validFor: /^<\/?[:\-\.\w\u00b7-\uffff]*$/ };
}
function completeAttrName(state, schema, tree, from, to) {
  let elt2 = findParentElement(tree), info = elt2 ? schema.tags[elementName2(state.doc, elt2)] : null;
  let localAttrs = info && info.attrs ? Object.keys(info.attrs) : [];
  let names = info && info.globalAttrs === false ? localAttrs : localAttrs.length ? localAttrs.concat(schema.globalAttrNames) : schema.globalAttrNames;
  return {
    from,
    to,
    options: names.map((attrName) => ({ label: attrName, type: "property" })),
    validFor: identifier3
  };
}
function completeAttrValue(state, schema, tree, from, to) {
  var _a2;
  let nameNode = (_a2 = tree.parent) === null || _a2 === void 0 ? void 0 : _a2.getChild("AttributeName");
  let options = [], token = void 0;
  if (nameNode) {
    let attrName = state.sliceDoc(nameNode.from, nameNode.to);
    let attrs = schema.globalAttrs[attrName];
    if (!attrs) {
      let elt2 = findParentElement(tree), info = elt2 ? schema.tags[elementName2(state.doc, elt2)] : null;
      attrs = (info === null || info === void 0 ? void 0 : info.attrs) && info.attrs[attrName];
    }
    if (attrs) {
      let base2 = state.sliceDoc(from, to).toLowerCase(), quoteStart = '"', quoteEnd = '"';
      if (/^['"]/.test(base2)) {
        token = base2[0] == '"' ? /^[^"]*$/ : /^[^']*$/;
        quoteStart = "";
        quoteEnd = state.sliceDoc(to, to + 1) == base2[0] ? "" : base2[0];
        base2 = base2.slice(1);
        from++;
      } else {
        token = /^[^\s<>='"]*$/;
      }
      for (let value of attrs)
        options.push({ label: value, apply: quoteStart + value + quoteEnd, type: "constant" });
    }
  }
  return { from, to, options, validFor: token };
}
function htmlCompletionFor(schema, context) {
  let { state, pos } = context, tree = syntaxTree(state).resolveInner(pos, -1), around = tree.resolve(pos);
  for (let scan = pos, before; around == tree && (before = tree.childBefore(scan)); ) {
    let last = before.lastChild;
    if (!last || !last.type.isError || last.from < last.to)
      break;
    around = tree = before;
    scan = last.from;
  }
  if (tree.name == "TagName") {
    return tree.parent && /CloseTag$/.test(tree.parent.name) ? completeCloseTag(state, tree, tree.from, pos) : completeTag(state, schema, tree, tree.from, pos);
  } else if (tree.name == "StartTag") {
    return completeTag(state, schema, tree, pos, pos);
  } else if (tree.name == "StartCloseTag" || tree.name == "IncompleteCloseTag") {
    return completeCloseTag(state, tree, pos, pos);
  } else if (tree.name == "OpenTag" || tree.name == "SelfClosingTag" || tree.name == "AttributeName") {
    return completeAttrName(state, schema, tree, tree.name == "AttributeName" ? tree.from : pos, pos);
  } else if (tree.name == "Is" || tree.name == "AttributeValue" || tree.name == "UnquotedAttributeValue") {
    return completeAttrValue(state, schema, tree, tree.name == "Is" ? pos : tree.from, pos);
  } else if (context.explicit && (around.name == "Element" || around.name == "Text" || around.name == "Document")) {
    return completeStartTag(state, schema, tree, pos);
  } else {
    return null;
  }
}
function htmlCompletionSource(context) {
  return htmlCompletionFor(Schema.default, context);
}
function htmlCompletionSourceWith(config) {
  let { extraTags, extraGlobalAttributes: extraAttrs } = config;
  let schema = extraAttrs || extraTags ? new Schema(extraTags, extraAttrs) : Schema.default;
  return (context) => htmlCompletionFor(schema, context);
}
var jsonParser = /* @__PURE__ */ javascriptLanguage.parser.configure({ top: "SingleExpression" });
var defaultNesting = [
  {
    tag: "script",
    attrs: (attrs) => attrs.type == "text/typescript" || attrs.lang == "ts",
    parser: typescriptLanguage.parser
  },
  {
    tag: "script",
    attrs: (attrs) => attrs.type == "text/babel" || attrs.type == "text/jsx",
    parser: jsxLanguage.parser
  },
  {
    tag: "script",
    attrs: (attrs) => attrs.type == "text/typescript-jsx",
    parser: tsxLanguage.parser
  },
  {
    tag: "script",
    attrs(attrs) {
      return /^(importmap|speculationrules|application\/(.+\+)?json)$/i.test(attrs.type);
    },
    parser: jsonParser
  },
  {
    tag: "script",
    attrs(attrs) {
      return !attrs.type || /^(?:text|application)\/(?:x-)?(?:java|ecma)script$|^module$|^$/i.test(attrs.type);
    },
    parser: javascriptLanguage.parser
  },
  {
    tag: "style",
    attrs(attrs) {
      return (!attrs.lang || attrs.lang == "css") && (!attrs.type || /^(text\/)?(x-)?(stylesheet|css)$/i.test(attrs.type));
    },
    parser: cssLanguage.parser
  }
];
var defaultAttrs = /* @__PURE__ */ [
  {
    name: "style",
    parser: /* @__PURE__ */ cssLanguage.parser.configure({ top: "Styles" })
  }
].concat(/* @__PURE__ */ eventAttributes.map((name2) => ({ name: name2, parser: javascriptLanguage.parser })));
var htmlPlain = /* @__PURE__ */ LRLanguage.define({
  name: "html",
  parser: /* @__PURE__ */ parser.configure({
    props: [
      /* @__PURE__ */ indentNodeProp.add({
        Element(context) {
          let after = /^(\s*)(<\/)?/.exec(context.textAfter);
          if (context.node.to <= context.pos + after[0].length)
            return context.continue();
          return context.lineIndent(context.node.from) + (after[2] ? 0 : context.unit);
        },
        "OpenTag CloseTag SelfClosingTag"(context) {
          return context.column(context.node.from) + context.unit;
        },
        Document(context) {
          if (context.pos + /\s*/.exec(context.textAfter)[0].length < context.node.to)
            return context.continue();
          let endElt = null, close;
          for (let cur = context.node; ; ) {
            let last = cur.lastChild;
            if (!last || last.name != "Element" || last.to != cur.to)
              break;
            endElt = cur = last;
          }
          if (endElt && !((close = endElt.lastChild) && (close.name == "CloseTag" || close.name == "SelfClosingTag")))
            return context.lineIndent(endElt.from) + context.unit;
          return null;
        }
      }),
      /* @__PURE__ */ foldNodeProp.add({
        Element(node) {
          let first = node.firstChild, last = node.lastChild;
          if (!first || first.name != "OpenTag")
            return null;
          return { from: first.to, to: last.name == "CloseTag" ? last.from : node.to };
        }
      }),
      /* @__PURE__ */ bracketMatchingHandle.add({
        "OpenTag CloseTag": (node) => node.getChild("TagName")
      })
    ]
  }),
  languageData: {
    commentTokens: { block: { open: "<!--", close: "-->" } },
    indentOnInput: /^\s*<\/\w+\W$/,
    wordChars: "-._"
  }
});
var htmlLanguage = /* @__PURE__ */ htmlPlain.configure({
  wrap: /* @__PURE__ */ configureNesting(defaultNesting, defaultAttrs)
});
function html(config = {}) {
  let dialect = "", wrap;
  if (config.matchClosingTags === false)
    dialect = "noMatch";
  if (config.selfClosingTags === true)
    dialect = (dialect ? dialect + " " : "") + "selfClosing";
  if (config.nestedLanguages && config.nestedLanguages.length || config.nestedAttributes && config.nestedAttributes.length)
    wrap = configureNesting((config.nestedLanguages || []).concat(defaultNesting), (config.nestedAttributes || []).concat(defaultAttrs));
  let lang = wrap ? htmlPlain.configure({ wrap, dialect }) : dialect ? htmlLanguage.configure({ dialect }) : htmlLanguage;
  return new LanguageSupport(lang, [
    htmlLanguage.data.of({ autocomplete: htmlCompletionSourceWith(config) }),
    config.autoCloseTags !== false ? autoCloseTags2 : [],
    javascript().support,
    css().support
  ]);
}
var selfClosers2 = /* @__PURE__ */ new Set(/* @__PURE__ */ "area base br col command embed frame hr img input keygen link meta param source track wbr menuitem".split(" "));
var autoCloseTags2 = /* @__PURE__ */ EditorView.inputHandler.of((view, from, to, text, insertTransaction) => {
  if (view.composing || view.state.readOnly || from != to || text != ">" && text != "/" || !htmlLanguage.isActiveAt(view.state, from, -1))
    return false;
  let base2 = insertTransaction(), { state } = base2;
  let closeTags = state.changeByRange((range) => {
    var _a2, _b, _c;
    let didType = state.doc.sliceString(range.from - 1, range.to) == text;
    let { head } = range, around = syntaxTree(state).resolveInner(head - 1, -1), name2;
    if (around.name == "TagName" || around.name == "StartTag")
      around = around.parent;
    if (didType && text == ">" && around.name == "OpenTag") {
      if (((_b = (_a2 = around.parent) === null || _a2 === void 0 ? void 0 : _a2.lastChild) === null || _b === void 0 ? void 0 : _b.name) != "CloseTag" && (name2 = elementName2(state.doc, around.parent, head)) && !selfClosers2.has(name2)) {
        let to2 = head + (state.doc.sliceString(head, head + 1) === ">" ? 1 : 0);
        let insert2 = `</${name2}>`;
        return { range, changes: { from: head, to: to2, insert: insert2 } };
      }
    } else if (didType && text == "/" && around.name == "IncompleteCloseTag") {
      let base3 = around.parent;
      if (around.from == head - 2 && ((_c = base3.lastChild) === null || _c === void 0 ? void 0 : _c.name) != "CloseTag" && (name2 = elementName2(state.doc, base3, head)) && !selfClosers2.has(name2)) {
        let to2 = head + (state.doc.sliceString(head, head + 1) === ">" ? 1 : 0);
        let insert2 = `${name2}>`;
        return {
          range: EditorSelection.cursor(head + insert2.length, -1),
          changes: { from: head, to: to2, insert: insert2 }
        };
      }
    }
    return { range };
  });
  if (closeTags.changes.empty)
    return false;
  view.dispatch([
    base2,
    state.update(closeTags, {
      userEvent: "input.complete",
      scrollIntoView: true
    })
  ]);
  return true;
});

// node_modules/@lezer/markdown/dist/index.js
var CompositeBlock = class {
  static create(type, value, from, parentHash, end) {
    let hash2 = parentHash + (parentHash << 8) + type + (value << 4) | 0;
    return new CompositeBlock(type, value, from, hash2, end, [], []);
  }
  constructor(type, value, from, hash2, end, children, positions) {
    this.type = type;
    this.value = value;
    this.from = from;
    this.hash = hash2;
    this.end = end;
    this.children = children;
    this.positions = positions;
    this.hashProp = [[NodeProp.contextHash, hash2]];
  }
  addChild(child, pos) {
    if (child.prop(NodeProp.contextHash) != this.hash)
      child = new Tree(child.type, child.children, child.positions, child.length, this.hashProp);
    this.children.push(child);
    this.positions.push(pos);
  }
  toTree(nodeSet, end = this.end) {
    let last = this.children.length - 1;
    if (last >= 0)
      end = Math.max(end, this.positions[last] + this.children[last].length + this.from);
    return new Tree(nodeSet.types[this.type], this.children, this.positions, end - this.from).balance({
      makeTree: (children, positions, length) => new Tree(NodeType.none, children, positions, length, this.hashProp)
    });
  }
};
var Type;
(function(Type2) {
  Type2[Type2["Document"] = 1] = "Document";
  Type2[Type2["CodeBlock"] = 2] = "CodeBlock";
  Type2[Type2["FencedCode"] = 3] = "FencedCode";
  Type2[Type2["Blockquote"] = 4] = "Blockquote";
  Type2[Type2["HorizontalRule"] = 5] = "HorizontalRule";
  Type2[Type2["BulletList"] = 6] = "BulletList";
  Type2[Type2["OrderedList"] = 7] = "OrderedList";
  Type2[Type2["ListItem"] = 8] = "ListItem";
  Type2[Type2["ATXHeading1"] = 9] = "ATXHeading1";
  Type2[Type2["ATXHeading2"] = 10] = "ATXHeading2";
  Type2[Type2["ATXHeading3"] = 11] = "ATXHeading3";
  Type2[Type2["ATXHeading4"] = 12] = "ATXHeading4";
  Type2[Type2["ATXHeading5"] = 13] = "ATXHeading5";
  Type2[Type2["ATXHeading6"] = 14] = "ATXHeading6";
  Type2[Type2["SetextHeading1"] = 15] = "SetextHeading1";
  Type2[Type2["SetextHeading2"] = 16] = "SetextHeading2";
  Type2[Type2["HTMLBlock"] = 17] = "HTMLBlock";
  Type2[Type2["LinkReference"] = 18] = "LinkReference";
  Type2[Type2["Paragraph"] = 19] = "Paragraph";
  Type2[Type2["CommentBlock"] = 20] = "CommentBlock";
  Type2[Type2["ProcessingInstructionBlock"] = 21] = "ProcessingInstructionBlock";
  Type2[Type2["Escape"] = 22] = "Escape";
  Type2[Type2["Entity"] = 23] = "Entity";
  Type2[Type2["HardBreak"] = 24] = "HardBreak";
  Type2[Type2["Emphasis"] = 25] = "Emphasis";
  Type2[Type2["StrongEmphasis"] = 26] = "StrongEmphasis";
  Type2[Type2["Link"] = 27] = "Link";
  Type2[Type2["Image"] = 28] = "Image";
  Type2[Type2["InlineCode"] = 29] = "InlineCode";
  Type2[Type2["HTMLTag"] = 30] = "HTMLTag";
  Type2[Type2["Comment"] = 31] = "Comment";
  Type2[Type2["ProcessingInstruction"] = 32] = "ProcessingInstruction";
  Type2[Type2["Autolink"] = 33] = "Autolink";
  Type2[Type2["HeaderMark"] = 34] = "HeaderMark";
  Type2[Type2["QuoteMark"] = 35] = "QuoteMark";
  Type2[Type2["ListMark"] = 36] = "ListMark";
  Type2[Type2["LinkMark"] = 37] = "LinkMark";
  Type2[Type2["EmphasisMark"] = 38] = "EmphasisMark";
  Type2[Type2["CodeMark"] = 39] = "CodeMark";
  Type2[Type2["CodeText"] = 40] = "CodeText";
  Type2[Type2["CodeInfo"] = 41] = "CodeInfo";
  Type2[Type2["LinkTitle"] = 42] = "LinkTitle";
  Type2[Type2["LinkLabel"] = 43] = "LinkLabel";
  Type2[Type2["URL"] = 44] = "URL";
})(Type || (Type = {}));
var LeafBlock = class {
  constructor(start, content2) {
    this.start = start;
    this.content = content2;
    this.marks = [];
    this.parsers = [];
  }
};
var Line2 = class {
  constructor() {
    this.text = "";
    this.baseIndent = 0;
    this.basePos = 0;
    this.depth = 0;
    this.markers = [];
    this.pos = 0;
    this.indent = 0;
    this.next = -1;
  }
  forward() {
    if (this.basePos > this.pos)
      this.forwardInner();
  }
  forwardInner() {
    let newPos = this.skipSpace(this.basePos);
    this.indent = this.countIndent(newPos, this.pos, this.indent);
    this.pos = newPos;
    this.next = newPos == this.text.length ? -1 : this.text.charCodeAt(newPos);
  }
  skipSpace(from) {
    return skipSpace(this.text, from);
  }
  reset(text) {
    this.text = text;
    this.baseIndent = this.basePos = this.pos = this.indent = 0;
    this.forwardInner();
    this.depth = 1;
    while (this.markers.length)
      this.markers.pop();
  }
  moveBase(to) {
    this.basePos = to;
    this.baseIndent = this.countIndent(to, this.pos, this.indent);
  }
  moveBaseColumn(indent) {
    this.baseIndent = indent;
    this.basePos = this.findColumn(indent);
  }
  addMarker(elt2) {
    this.markers.push(elt2);
  }
  countIndent(to, from = 0, indent = 0) {
    for (let i = from; i < to; i++)
      indent += this.text.charCodeAt(i) == 9 ? 4 - indent % 4 : 1;
    return indent;
  }
  findColumn(goal) {
    let i = 0;
    for (let indent = 0; i < this.text.length && indent < goal; i++)
      indent += this.text.charCodeAt(i) == 9 ? 4 - indent % 4 : 1;
    return i;
  }
  scrub() {
    if (!this.baseIndent)
      return this.text;
    let result = "";
    for (let i = 0; i < this.basePos; i++)
      result += " ";
    return result + this.text.slice(this.basePos);
  }
};
function skipForList(bl, cx, line) {
  if (line.pos == line.text.length || bl != cx.block && line.indent >= cx.stack[line.depth + 1].value + line.baseIndent)
    return true;
  if (line.indent >= line.baseIndent + 4)
    return false;
  let size = (bl.type == Type.OrderedList ? isOrderedList : isBulletList)(line, cx, false);
  return size > 0 && (bl.type != Type.BulletList || isHorizontalRule(line, cx, false) < 0) && line.text.charCodeAt(line.pos + size - 1) == bl.value;
}
var DefaultSkipMarkup = {
  [Type.Blockquote](bl, cx, line) {
    if (line.next != 62)
      return false;
    line.markers.push(elt(Type.QuoteMark, cx.lineStart + line.pos, cx.lineStart + line.pos + 1));
    line.moveBase(line.pos + (space3(line.text.charCodeAt(line.pos + 1)) ? 2 : 1));
    bl.end = cx.lineStart + line.text.length;
    return true;
  },
  [Type.ListItem](bl, _cx, line) {
    if (line.indent < line.baseIndent + bl.value && line.next > -1)
      return false;
    line.moveBaseColumn(line.baseIndent + bl.value);
    return true;
  },
  [Type.OrderedList]: skipForList,
  [Type.BulletList]: skipForList,
  [Type.Document]() {
    return true;
  }
};
function space3(ch) {
  return ch == 32 || ch == 9 || ch == 10 || ch == 13;
}
function skipSpace(line, i = 0) {
  while (i < line.length && space3(line.charCodeAt(i)))
    i++;
  return i;
}
function skipSpaceBack(line, i, to) {
  while (i > to && space3(line.charCodeAt(i - 1)))
    i--;
  return i;
}
function isFencedCode(line) {
  if (line.next != 96 && line.next != 126)
    return -1;
  let pos = line.pos + 1;
  while (pos < line.text.length && line.text.charCodeAt(pos) == line.next)
    pos++;
  if (pos < line.pos + 3)
    return -1;
  if (line.next == 96) {
    for (let i = pos; i < line.text.length; i++)
      if (line.text.charCodeAt(i) == 96)
        return -1;
  }
  return pos;
}
function isBlockquote(line) {
  return line.next != 62 ? -1 : line.text.charCodeAt(line.pos + 1) == 32 ? 2 : 1;
}
function isHorizontalRule(line, cx, breaking) {
  if (line.next != 42 && line.next != 45 && line.next != 95)
    return -1;
  let count2 = 1;
  for (let pos = line.pos + 1; pos < line.text.length; pos++) {
    let ch = line.text.charCodeAt(pos);
    if (ch == line.next)
      count2++;
    else if (!space3(ch))
      return -1;
  }
  if (breaking && line.next == 45 && isSetextUnderline(line) > -1 && line.depth == cx.stack.length)
    return -1;
  return count2 < 3 ? -1 : 1;
}
function inList(cx, type) {
  for (let i = cx.stack.length - 1; i >= 0; i--)
    if (cx.stack[i].type == type)
      return true;
  return false;
}
function isBulletList(line, cx, breaking) {
  return (line.next == 45 || line.next == 43 || line.next == 42) && (line.pos == line.text.length - 1 || space3(line.text.charCodeAt(line.pos + 1))) && (!breaking || inList(cx, Type.BulletList) || line.skipSpace(line.pos + 2) < line.text.length) ? 1 : -1;
}
function isOrderedList(line, cx, breaking) {
  let pos = line.pos, next = line.next;
  for (; ; ) {
    if (next >= 48 && next <= 57)
      pos++;
    else
      break;
    if (pos == line.text.length)
      return -1;
    next = line.text.charCodeAt(pos);
  }
  if (pos == line.pos || pos > line.pos + 9 || next != 46 && next != 41 || pos < line.text.length - 1 && !space3(line.text.charCodeAt(pos + 1)) || breaking && !inList(cx, Type.OrderedList) && (line.skipSpace(pos + 1) == line.text.length || pos > line.pos + 1 || line.next != 49))
    return -1;
  return pos + 1 - line.pos;
}
function isAtxHeading(line) {
  if (line.next != 35)
    return -1;
  let pos = line.pos + 1;
  while (pos < line.text.length && line.text.charCodeAt(pos) == 35)
    pos++;
  if (pos < line.text.length && line.text.charCodeAt(pos) != 32)
    return -1;
  let size = pos - line.pos;
  return size > 6 ? -1 : size;
}
function isSetextUnderline(line) {
  if (line.next != 45 && line.next != 61 || line.indent >= line.baseIndent + 4)
    return -1;
  let pos = line.pos + 1;
  while (pos < line.text.length && line.text.charCodeAt(pos) == line.next)
    pos++;
  let end = pos;
  while (pos < line.text.length && space3(line.text.charCodeAt(pos)))
    pos++;
  return pos == line.text.length ? end : -1;
}
var EmptyLine = /^[ \t]*$/;
var CommentEnd = /-->/;
var ProcessingEnd = /\?>/;
var HTMLBlockStyle = [
  [/^<(?:script|pre|style)(?:\s|>|$)/i, /<\/(?:script|pre|style)>/i],
  [/^\s*<!--/, CommentEnd],
  [/^\s*<\?/, ProcessingEnd],
  [/^\s*<![A-Z]/, />/],
  [/^\s*<!\[CDATA\[/, /\]\]>/],
  [/^\s*<\/?(?:address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h1|h2|h3|h4|h5|h6|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|nav|noframes|ol|optgroup|option|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul)(?:\s|\/?>|$)/i, EmptyLine],
  [/^\s*(?:<\/[a-z][\w-]*\s*>|<[a-z][\w-]*(\s+[a-z:_][\w-.]*(?:\s*=\s*(?:[^\s"'=<>`]+|'[^']*'|"[^"]*"))?)*\s*>)\s*$/i, EmptyLine]
];
function isHTMLBlock(line, _cx, breaking) {
  if (line.next != 60)
    return -1;
  let rest = line.text.slice(line.pos);
  for (let i = 0, e = HTMLBlockStyle.length - (breaking ? 1 : 0); i < e; i++)
    if (HTMLBlockStyle[i][0].test(rest))
      return i;
  return -1;
}
function getListIndent(line, pos) {
  let indentAfter = line.countIndent(pos, line.pos, line.indent);
  let indented = line.countIndent(line.skipSpace(pos), pos, indentAfter);
  return indented >= indentAfter + 5 ? indentAfter + 1 : indented;
}
function addCodeText(marks2, from, to) {
  let last = marks2.length - 1;
  if (last >= 0 && marks2[last].to == from && marks2[last].type == Type.CodeText)
    marks2[last].to = to;
  else
    marks2.push(elt(Type.CodeText, from, to));
}
var DefaultBlockParsers = {
  LinkReference: void 0,
  IndentedCode(cx, line) {
    let base2 = line.baseIndent + 4;
    if (line.indent < base2)
      return false;
    let start = line.findColumn(base2);
    let from = cx.lineStart + start, to = cx.lineStart + line.text.length;
    let marks2 = [], pendingMarks = [];
    addCodeText(marks2, from, to);
    while (cx.nextLine() && line.depth >= cx.stack.length) {
      if (line.pos == line.text.length) {
        addCodeText(pendingMarks, cx.lineStart - 1, cx.lineStart);
        for (let m of line.markers)
          pendingMarks.push(m);
      } else if (line.indent < base2) {
        break;
      } else {
        if (pendingMarks.length) {
          for (let m of pendingMarks) {
            if (m.type == Type.CodeText)
              addCodeText(marks2, m.from, m.to);
            else
              marks2.push(m);
          }
          pendingMarks = [];
        }
        addCodeText(marks2, cx.lineStart - 1, cx.lineStart);
        for (let m of line.markers)
          marks2.push(m);
        to = cx.lineStart + line.text.length;
        let codeStart = cx.lineStart + line.findColumn(line.baseIndent + 4);
        if (codeStart < to)
          addCodeText(marks2, codeStart, to);
      }
    }
    if (pendingMarks.length) {
      pendingMarks = pendingMarks.filter((m) => m.type != Type.CodeText);
      if (pendingMarks.length)
        line.markers = pendingMarks.concat(line.markers);
    }
    cx.addNode(cx.buffer.writeElements(marks2, -from).finish(Type.CodeBlock, to - from), from);
    return true;
  },
  FencedCode(cx, line) {
    let fenceEnd = isFencedCode(line);
    if (fenceEnd < 0)
      return false;
    let from = cx.lineStart + line.pos, ch = line.next, len = fenceEnd - line.pos;
    let infoFrom = line.skipSpace(fenceEnd), infoTo = skipSpaceBack(line.text, line.text.length, infoFrom);
    let marks2 = [elt(Type.CodeMark, from, from + len)];
    if (infoFrom < infoTo)
      marks2.push(elt(Type.CodeInfo, cx.lineStart + infoFrom, cx.lineStart + infoTo));
    for (let first = true; cx.nextLine() && line.depth >= cx.stack.length; first = false) {
      let i = line.pos;
      if (line.indent - line.baseIndent < 4)
        while (i < line.text.length && line.text.charCodeAt(i) == ch)
          i++;
      if (i - line.pos >= len && line.skipSpace(i) == line.text.length) {
        for (let m of line.markers)
          marks2.push(m);
        marks2.push(elt(Type.CodeMark, cx.lineStart + line.pos, cx.lineStart + i));
        cx.nextLine();
        break;
      } else {
        if (!first)
          addCodeText(marks2, cx.lineStart - 1, cx.lineStart);
        for (let m of line.markers)
          marks2.push(m);
        let textStart = cx.lineStart + line.basePos, textEnd = cx.lineStart + line.text.length;
        if (textStart < textEnd)
          addCodeText(marks2, textStart, textEnd);
      }
    }
    cx.addNode(cx.buffer.writeElements(marks2, -from).finish(Type.FencedCode, cx.prevLineEnd() - from), from);
    return true;
  },
  Blockquote(cx, line) {
    let size = isBlockquote(line);
    if (size < 0)
      return false;
    cx.startContext(Type.Blockquote, line.pos);
    cx.addNode(Type.QuoteMark, cx.lineStart + line.pos, cx.lineStart + line.pos + 1);
    line.moveBase(line.pos + size);
    return null;
  },
  HorizontalRule(cx, line) {
    if (isHorizontalRule(line, cx, false) < 0)
      return false;
    let from = cx.lineStart + line.pos;
    cx.nextLine();
    cx.addNode(Type.HorizontalRule, from);
    return true;
  },
  BulletList(cx, line) {
    let size = isBulletList(line, cx, false);
    if (size < 0)
      return false;
    if (cx.block.type != Type.BulletList)
      cx.startContext(Type.BulletList, line.basePos, line.next);
    let newBase = getListIndent(line, line.pos + 1);
    cx.startContext(Type.ListItem, line.basePos, newBase - line.baseIndent);
    cx.addNode(Type.ListMark, cx.lineStart + line.pos, cx.lineStart + line.pos + size);
    line.moveBaseColumn(newBase);
    return null;
  },
  OrderedList(cx, line) {
    let size = isOrderedList(line, cx, false);
    if (size < 0)
      return false;
    if (cx.block.type != Type.OrderedList)
      cx.startContext(Type.OrderedList, line.basePos, line.text.charCodeAt(line.pos + size - 1));
    let newBase = getListIndent(line, line.pos + size);
    cx.startContext(Type.ListItem, line.basePos, newBase - line.baseIndent);
    cx.addNode(Type.ListMark, cx.lineStart + line.pos, cx.lineStart + line.pos + size);
    line.moveBaseColumn(newBase);
    return null;
  },
  ATXHeading(cx, line) {
    let size = isAtxHeading(line);
    if (size < 0)
      return false;
    let off = line.pos, from = cx.lineStart + off;
    let endOfSpace = skipSpaceBack(line.text, line.text.length, off), after = endOfSpace;
    while (after > off && line.text.charCodeAt(after - 1) == line.next)
      after--;
    if (after == endOfSpace || after == off || !space3(line.text.charCodeAt(after - 1)))
      after = line.text.length;
    let buf = cx.buffer.write(Type.HeaderMark, 0, size).writeElements(cx.parser.parseInline(line.text.slice(off + size + 1, after), from + size + 1), -from);
    if (after < line.text.length)
      buf.write(Type.HeaderMark, after - off, endOfSpace - off);
    let node = buf.finish(Type.ATXHeading1 - 1 + size, line.text.length - off);
    cx.nextLine();
    cx.addNode(node, from);
    return true;
  },
  HTMLBlock(cx, line) {
    let type = isHTMLBlock(line, cx, false);
    if (type < 0)
      return false;
    let from = cx.lineStart + line.pos, end = HTMLBlockStyle[type][1];
    let marks2 = [], trailing = end != EmptyLine;
    while (!end.test(line.text) && cx.nextLine()) {
      if (line.depth < cx.stack.length) {
        trailing = false;
        break;
      }
      for (let m of line.markers)
        marks2.push(m);
    }
    if (trailing)
      cx.nextLine();
    let nodeType = end == CommentEnd ? Type.CommentBlock : end == ProcessingEnd ? Type.ProcessingInstructionBlock : Type.HTMLBlock;
    let to = cx.prevLineEnd();
    cx.addNode(cx.buffer.writeElements(marks2, -from).finish(nodeType, to - from), from);
    return true;
  },
  SetextHeading: void 0
};
var LinkReferenceParser = class {
  constructor(leaf) {
    this.stage = 0;
    this.elts = [];
    this.pos = 0;
    this.start = leaf.start;
    this.advance(leaf.content);
  }
  nextLine(cx, line, leaf) {
    if (this.stage == -1)
      return false;
    let content2 = leaf.content + "\n" + line.scrub();
    let finish = this.advance(content2);
    if (finish > -1 && finish < content2.length)
      return this.complete(cx, leaf, finish);
    return false;
  }
  finish(cx, leaf) {
    if ((this.stage == 2 || this.stage == 3) && skipSpace(leaf.content, this.pos) == leaf.content.length)
      return this.complete(cx, leaf, leaf.content.length);
    return false;
  }
  complete(cx, leaf, len) {
    cx.addLeafElement(leaf, elt(Type.LinkReference, this.start, this.start + len, this.elts));
    return true;
  }
  nextStage(elt2) {
    if (elt2) {
      this.pos = elt2.to - this.start;
      this.elts.push(elt2);
      this.stage++;
      return true;
    }
    if (elt2 === false)
      this.stage = -1;
    return false;
  }
  advance(content2) {
    for (; ; ) {
      if (this.stage == -1) {
        return -1;
      } else if (this.stage == 0) {
        if (!this.nextStage(parseLinkLabel(content2, this.pos, this.start, true)))
          return -1;
        if (content2.charCodeAt(this.pos) != 58)
          return this.stage = -1;
        this.elts.push(elt(Type.LinkMark, this.pos + this.start, this.pos + this.start + 1));
        this.pos++;
      } else if (this.stage == 1) {
        if (!this.nextStage(parseURL(content2, skipSpace(content2, this.pos), this.start)))
          return -1;
      } else if (this.stage == 2) {
        let skip = skipSpace(content2, this.pos), end = 0;
        if (skip > this.pos) {
          let title = parseLinkTitle(content2, skip, this.start);
          if (title) {
            let titleEnd = lineEnd(content2, title.to - this.start);
            if (titleEnd > 0) {
              this.nextStage(title);
              end = titleEnd;
            }
          }
        }
        if (!end)
          end = lineEnd(content2, this.pos);
        return end > 0 && end < content2.length ? end : -1;
      } else {
        return lineEnd(content2, this.pos);
      }
    }
  }
};
function lineEnd(text, pos) {
  for (; pos < text.length; pos++) {
    let next = text.charCodeAt(pos);
    if (next == 10)
      break;
    if (!space3(next))
      return -1;
  }
  return pos;
}
var SetextHeadingParser = class {
  nextLine(cx, line, leaf) {
    let underline = line.depth < cx.stack.length ? -1 : isSetextUnderline(line);
    let next = line.next;
    if (underline < 0)
      return false;
    let underlineMark = elt(Type.HeaderMark, cx.lineStart + line.pos, cx.lineStart + underline);
    cx.nextLine();
    cx.addLeafElement(leaf, elt(next == 61 ? Type.SetextHeading1 : Type.SetextHeading2, leaf.start, cx.prevLineEnd(), [
      ...cx.parser.parseInline(leaf.content, leaf.start),
      underlineMark
    ]));
    return true;
  }
  finish() {
    return false;
  }
};
var DefaultLeafBlocks = {
  LinkReference(_, leaf) {
    return leaf.content.charCodeAt(0) == 91 ? new LinkReferenceParser(leaf) : null;
  },
  SetextHeading() {
    return new SetextHeadingParser();
  }
};
var DefaultEndLeaf = [
  (_, line) => isAtxHeading(line) >= 0,
  (_, line) => isFencedCode(line) >= 0,
  (_, line) => isBlockquote(line) >= 0,
  (p, line) => isBulletList(line, p, true) >= 0,
  (p, line) => isOrderedList(line, p, true) >= 0,
  (p, line) => isHorizontalRule(line, p, true) >= 0,
  (p, line) => isHTMLBlock(line, p, true) >= 0
];
var scanLineResult = { text: "", end: 0 };
var BlockContext = class {
  constructor(parser5, input, fragments, ranges) {
    this.parser = parser5;
    this.input = input;
    this.ranges = ranges;
    this.line = new Line2();
    this.atEnd = false;
    this.reusePlaceholders = new Map();
    this.stoppedAt = null;
    this.rangeI = 0;
    this.to = ranges[ranges.length - 1].to;
    this.lineStart = this.absoluteLineStart = this.absoluteLineEnd = ranges[0].from;
    this.block = CompositeBlock.create(Type.Document, 0, this.lineStart, 0, 0);
    this.stack = [this.block];
    this.fragments = fragments.length ? new FragmentCursor3(fragments, input) : null;
    this.readLine();
  }
  get parsedPos() {
    return this.absoluteLineStart;
  }
  advance() {
    if (this.stoppedAt != null && this.absoluteLineStart > this.stoppedAt)
      return this.finish();
    let { line } = this;
    for (; ; ) {
      for (let markI = 0; ; ) {
        let next = line.depth < this.stack.length ? this.stack[this.stack.length - 1] : null;
        while (markI < line.markers.length && (!next || line.markers[markI].from < next.end)) {
          let mark = line.markers[markI++];
          this.addNode(mark.type, mark.from, mark.to);
        }
        if (!next)
          break;
        this.finishContext();
      }
      if (line.pos < line.text.length)
        break;
      if (!this.nextLine())
        return this.finish();
    }
    if (this.fragments && this.reuseFragment(line.basePos))
      return null;
    start:
      for (; ; ) {
        for (let type of this.parser.blockParsers)
          if (type) {
            let result = type(this, line);
            if (result != false) {
              if (result == true)
                return null;
              line.forward();
              continue start;
            }
          }
        break;
      }
    let leaf = new LeafBlock(this.lineStart + line.pos, line.text.slice(line.pos));
    for (let parse of this.parser.leafBlockParsers)
      if (parse) {
        let parser5 = parse(this, leaf);
        if (parser5)
          leaf.parsers.push(parser5);
      }
    lines:
      while (this.nextLine()) {
        if (line.pos == line.text.length)
          break;
        if (line.indent < line.baseIndent + 4) {
          for (let stop of this.parser.endLeafBlock)
            if (stop(this, line, leaf))
              break lines;
        }
        for (let parser5 of leaf.parsers)
          if (parser5.nextLine(this, line, leaf))
            return null;
        leaf.content += "\n" + line.scrub();
        for (let m of line.markers)
          leaf.marks.push(m);
      }
    this.finishLeaf(leaf);
    return null;
  }
  stopAt(pos) {
    if (this.stoppedAt != null && this.stoppedAt < pos)
      throw new RangeError("Can't move stoppedAt forward");
    this.stoppedAt = pos;
  }
  reuseFragment(start) {
    if (!this.fragments.moveTo(this.absoluteLineStart + start, this.absoluteLineStart) || !this.fragments.matches(this.block.hash))
      return false;
    let taken = this.fragments.takeNodes(this);
    if (!taken)
      return false;
    this.absoluteLineStart += taken;
    this.lineStart = toRelative(this.absoluteLineStart, this.ranges);
    this.moveRangeI();
    if (this.absoluteLineStart < this.to) {
      this.lineStart++;
      this.absoluteLineStart++;
      this.readLine();
    } else {
      this.atEnd = true;
      this.readLine();
    }
    return true;
  }
  get depth() {
    return this.stack.length;
  }
  parentType(depth = this.depth - 1) {
    return this.parser.nodeSet.types[this.stack[depth].type];
  }
  nextLine() {
    this.lineStart += this.line.text.length;
    if (this.absoluteLineEnd >= this.to) {
      this.absoluteLineStart = this.absoluteLineEnd;
      this.atEnd = true;
      this.readLine();
      return false;
    } else {
      this.lineStart++;
      this.absoluteLineStart = this.absoluteLineEnd + 1;
      this.moveRangeI();
      this.readLine();
      return true;
    }
  }
  moveRangeI() {
    while (this.rangeI < this.ranges.length - 1 && this.absoluteLineStart >= this.ranges[this.rangeI].to) {
      this.rangeI++;
      this.absoluteLineStart = Math.max(this.absoluteLineStart, this.ranges[this.rangeI].from);
    }
  }
  scanLine(start) {
    let r = scanLineResult;
    r.end = start;
    if (start >= this.to) {
      r.text = "";
    } else {
      r.text = this.lineChunkAt(start);
      r.end += r.text.length;
      if (this.ranges.length > 1) {
        let textOffset = this.absoluteLineStart, rangeI = this.rangeI;
        while (this.ranges[rangeI].to < r.end) {
          rangeI++;
          let nextFrom = this.ranges[rangeI].from;
          let after = this.lineChunkAt(nextFrom);
          r.end = nextFrom + after.length;
          r.text = r.text.slice(0, this.ranges[rangeI - 1].to - textOffset) + after;
          textOffset = r.end - r.text.length;
        }
      }
    }
    return r;
  }
  readLine() {
    let { line } = this, { text, end } = this.scanLine(this.absoluteLineStart);
    this.absoluteLineEnd = end;
    line.reset(text);
    for (; line.depth < this.stack.length; line.depth++) {
      let cx = this.stack[line.depth], handler = this.parser.skipContextMarkup[cx.type];
      if (!handler)
        throw new Error("Unhandled block context " + Type[cx.type]);
      if (!handler(cx, this, line))
        break;
      line.forward();
    }
  }
  lineChunkAt(pos) {
    let next = this.input.chunk(pos), text;
    if (!this.input.lineChunks) {
      let eol = next.indexOf("\n");
      text = eol < 0 ? next : next.slice(0, eol);
    } else {
      text = next == "\n" ? "" : next;
    }
    return pos + text.length > this.to ? text.slice(0, this.to - pos) : text;
  }
  prevLineEnd() {
    return this.atEnd ? this.lineStart : this.lineStart - 1;
  }
  startContext(type, start, value = 0) {
    this.block = CompositeBlock.create(type, value, this.lineStart + start, this.block.hash, this.lineStart + this.line.text.length);
    this.stack.push(this.block);
  }
  startComposite(type, start, value = 0) {
    this.startContext(this.parser.getNodeType(type), start, value);
  }
  addNode(block, from, to) {
    if (typeof block == "number")
      block = new Tree(this.parser.nodeSet.types[block], none3, none3, (to !== null && to !== void 0 ? to : this.prevLineEnd()) - from);
    this.block.addChild(block, from - this.block.from);
  }
  addElement(elt2) {
    this.block.addChild(elt2.toTree(this.parser.nodeSet), elt2.from - this.block.from);
  }
  addLeafElement(leaf, elt2) {
    this.addNode(this.buffer.writeElements(injectMarks(elt2.children, leaf.marks), -elt2.from).finish(elt2.type, elt2.to - elt2.from), elt2.from);
  }
  finishContext() {
    let cx = this.stack.pop();
    let top2 = this.stack[this.stack.length - 1];
    top2.addChild(cx.toTree(this.parser.nodeSet), cx.from - top2.from);
    this.block = top2;
  }
  finish() {
    while (this.stack.length > 1)
      this.finishContext();
    return this.addGaps(this.block.toTree(this.parser.nodeSet, this.lineStart));
  }
  addGaps(tree) {
    return this.ranges.length > 1 ? injectGaps(this.ranges, 0, tree.topNode, this.ranges[0].from, this.reusePlaceholders) : tree;
  }
  finishLeaf(leaf) {
    for (let parser5 of leaf.parsers)
      if (parser5.finish(this, leaf))
        return;
    let inline = injectMarks(this.parser.parseInline(leaf.content, leaf.start), leaf.marks);
    this.addNode(this.buffer.writeElements(inline, -leaf.start).finish(Type.Paragraph, leaf.content.length), leaf.start);
  }
  elt(type, from, to, children) {
    if (typeof type == "string")
      return elt(this.parser.getNodeType(type), from, to, children);
    return new TreeElement(type, from);
  }
  get buffer() {
    return new Buffer2(this.parser.nodeSet);
  }
};
function injectGaps(ranges, rangeI, tree, offset, dummies) {
  let rangeEnd2 = ranges[rangeI].to;
  let children = [], positions = [], start = tree.from + offset;
  function movePastNext(upto, inclusive) {
    while (inclusive ? upto >= rangeEnd2 : upto > rangeEnd2) {
      let size = ranges[rangeI + 1].from - rangeEnd2;
      offset += size;
      upto += size;
      rangeI++;
      rangeEnd2 = ranges[rangeI].to;
    }
  }
  for (let ch = tree.firstChild; ch; ch = ch.nextSibling) {
    movePastNext(ch.from + offset, true);
    let from = ch.from + offset, node, reuse = dummies.get(ch.tree);
    if (reuse) {
      node = reuse;
    } else if (ch.to + offset > rangeEnd2) {
      node = injectGaps(ranges, rangeI, ch, offset, dummies);
      movePastNext(ch.to + offset, false);
    } else {
      node = ch.toTree();
    }
    children.push(node);
    positions.push(from - start);
  }
  movePastNext(tree.to + offset, false);
  return new Tree(tree.type, children, positions, tree.to + offset - start, tree.tree ? tree.tree.propValues : void 0);
}
var MarkdownParser = class extends Parser {
  constructor(nodeSet, blockParsers, leafBlockParsers, blockNames, endLeafBlock, skipContextMarkup, inlineParsers, inlineNames, wrappers) {
    super();
    this.nodeSet = nodeSet;
    this.blockParsers = blockParsers;
    this.leafBlockParsers = leafBlockParsers;
    this.blockNames = blockNames;
    this.endLeafBlock = endLeafBlock;
    this.skipContextMarkup = skipContextMarkup;
    this.inlineParsers = inlineParsers;
    this.inlineNames = inlineNames;
    this.wrappers = wrappers;
    this.nodeTypes = Object.create(null);
    for (let t2 of nodeSet.types)
      this.nodeTypes[t2.name] = t2.id;
  }
  createParse(input, fragments, ranges) {
    let parse = new BlockContext(this, input, fragments, ranges);
    for (let w of this.wrappers)
      parse = w(parse, input, fragments, ranges);
    return parse;
  }
  configure(spec) {
    let config = resolveConfig(spec);
    if (!config)
      return this;
    let { nodeSet, skipContextMarkup } = this;
    let blockParsers = this.blockParsers.slice(), leafBlockParsers = this.leafBlockParsers.slice(), blockNames = this.blockNames.slice(), inlineParsers = this.inlineParsers.slice(), inlineNames = this.inlineNames.slice(), endLeafBlock = this.endLeafBlock.slice(), wrappers = this.wrappers;
    if (nonEmpty(config.defineNodes)) {
      skipContextMarkup = Object.assign({}, skipContextMarkup);
      let nodeTypes2 = nodeSet.types.slice(), styles;
      for (let s of config.defineNodes) {
        let { name: name2, block, composite, style } = typeof s == "string" ? { name: s } : s;
        if (nodeTypes2.some((t2) => t2.name == name2))
          continue;
        if (composite)
          skipContextMarkup[nodeTypes2.length] = (bl, cx, line) => composite(cx, line, bl.value);
        let id2 = nodeTypes2.length;
        let group = composite ? ["Block", "BlockContext"] : !block ? void 0 : id2 >= Type.ATXHeading1 && id2 <= Type.SetextHeading2 ? ["Block", "LeafBlock", "Heading"] : ["Block", "LeafBlock"];
        nodeTypes2.push(NodeType.define({
          id: id2,
          name: name2,
          props: group && [[NodeProp.group, group]]
        }));
        if (style) {
          if (!styles)
            styles = {};
          if (Array.isArray(style) || style instanceof Tag)
            styles[name2] = style;
          else
            Object.assign(styles, style);
        }
      }
      nodeSet = new NodeSet(nodeTypes2);
      if (styles)
        nodeSet = nodeSet.extend(styleTags(styles));
    }
    if (nonEmpty(config.props))
      nodeSet = nodeSet.extend(...config.props);
    if (nonEmpty(config.remove)) {
      for (let rm of config.remove) {
        let block = this.blockNames.indexOf(rm), inline = this.inlineNames.indexOf(rm);
        if (block > -1)
          blockParsers[block] = leafBlockParsers[block] = void 0;
        if (inline > -1)
          inlineParsers[inline] = void 0;
      }
    }
    if (nonEmpty(config.parseBlock)) {
      for (let spec2 of config.parseBlock) {
        let found = blockNames.indexOf(spec2.name);
        if (found > -1) {
          blockParsers[found] = spec2.parse;
          leafBlockParsers[found] = spec2.leaf;
        } else {
          let pos = spec2.before ? findName(blockNames, spec2.before) : spec2.after ? findName(blockNames, spec2.after) + 1 : blockNames.length - 1;
          blockParsers.splice(pos, 0, spec2.parse);
          leafBlockParsers.splice(pos, 0, spec2.leaf);
          blockNames.splice(pos, 0, spec2.name);
        }
        if (spec2.endLeaf)
          endLeafBlock.push(spec2.endLeaf);
      }
    }
    if (nonEmpty(config.parseInline)) {
      for (let spec2 of config.parseInline) {
        let found = inlineNames.indexOf(spec2.name);
        if (found > -1) {
          inlineParsers[found] = spec2.parse;
        } else {
          let pos = spec2.before ? findName(inlineNames, spec2.before) : spec2.after ? findName(inlineNames, spec2.after) + 1 : inlineNames.length - 1;
          inlineParsers.splice(pos, 0, spec2.parse);
          inlineNames.splice(pos, 0, spec2.name);
        }
      }
    }
    if (config.wrap)
      wrappers = wrappers.concat(config.wrap);
    return new MarkdownParser(nodeSet, blockParsers, leafBlockParsers, blockNames, endLeafBlock, skipContextMarkup, inlineParsers, inlineNames, wrappers);
  }
  getNodeType(name2) {
    let found = this.nodeTypes[name2];
    if (found == null)
      throw new RangeError(`Unknown node type '${name2}'`);
    return found;
  }
  parseInline(text, offset) {
    let cx = new InlineContext(this, text, offset);
    outer:
      for (let pos = offset; pos < cx.end; ) {
        let next = cx.char(pos);
        for (let token of this.inlineParsers)
          if (token) {
            let result = token(cx, next, pos);
            if (result >= 0) {
              pos = result;
              continue outer;
            }
          }
        pos++;
      }
    return cx.resolveMarkers(0);
  }
};
function nonEmpty(a) {
  return a != null && a.length > 0;
}
function resolveConfig(spec) {
  if (!Array.isArray(spec))
    return spec;
  if (spec.length == 0)
    return null;
  let conf = resolveConfig(spec[0]);
  if (spec.length == 1)
    return conf;
  let rest = resolveConfig(spec.slice(1));
  if (!rest || !conf)
    return conf || rest;
  let conc2 = (a, b) => (a || none3).concat(b || none3);
  let wrapA = conf.wrap, wrapB = rest.wrap;
  return {
    props: conc2(conf.props, rest.props),
    defineNodes: conc2(conf.defineNodes, rest.defineNodes),
    parseBlock: conc2(conf.parseBlock, rest.parseBlock),
    parseInline: conc2(conf.parseInline, rest.parseInline),
    remove: conc2(conf.remove, rest.remove),
    wrap: !wrapA ? wrapB : !wrapB ? wrapA : (inner, input, fragments, ranges) => wrapA(wrapB(inner, input, fragments, ranges), input, fragments, ranges)
  };
}
function findName(names, name2) {
  let found = names.indexOf(name2);
  if (found < 0)
    throw new RangeError(`Position specified relative to unknown parser ${name2}`);
  return found;
}
var nodeTypes = [NodeType.none];
for (let i = 1, name2; name2 = Type[i]; i++) {
  nodeTypes[i] = NodeType.define({
    id: i,
    name: name2,
    props: i >= Type.Escape ? [] : [[NodeProp.group, i in DefaultSkipMarkup ? ["Block", "BlockContext"] : ["Block", "LeafBlock"]]],
    top: name2 == "Document"
  });
}
var none3 = [];
var Buffer2 = class {
  constructor(nodeSet) {
    this.nodeSet = nodeSet;
    this.content = [];
    this.nodes = [];
  }
  write(type, from, to, children = 0) {
    this.content.push(type, from, to, 4 + children * 4);
    return this;
  }
  writeElements(elts, offset = 0) {
    for (let e of elts)
      e.writeTo(this, offset);
    return this;
  }
  finish(type, length) {
    return Tree.build({
      buffer: this.content,
      nodeSet: this.nodeSet,
      reused: this.nodes,
      topID: type,
      length
    });
  }
};
var Element2 = class {
  constructor(type, from, to, children = none3) {
    this.type = type;
    this.from = from;
    this.to = to;
    this.children = children;
  }
  writeTo(buf, offset) {
    let startOff = buf.content.length;
    buf.writeElements(this.children, offset);
    buf.content.push(this.type, this.from + offset, this.to + offset, buf.content.length + 4 - startOff);
  }
  toTree(nodeSet) {
    return new Buffer2(nodeSet).writeElements(this.children, -this.from).finish(this.type, this.to - this.from);
  }
};
var TreeElement = class {
  constructor(tree, from) {
    this.tree = tree;
    this.from = from;
  }
  get to() {
    return this.from + this.tree.length;
  }
  get type() {
    return this.tree.type.id;
  }
  get children() {
    return none3;
  }
  writeTo(buf, offset) {
    buf.nodes.push(this.tree);
    buf.content.push(buf.nodes.length - 1, this.from + offset, this.to + offset, -1);
  }
  toTree() {
    return this.tree;
  }
};
function elt(type, from, to, children) {
  return new Element2(type, from, to, children);
}
var EmphasisUnderscore = { resolve: "Emphasis", mark: "EmphasisMark" };
var EmphasisAsterisk = { resolve: "Emphasis", mark: "EmphasisMark" };
var LinkStart = {};
var ImageStart = {};
var InlineDelimiter = class {
  constructor(type, from, to, side) {
    this.type = type;
    this.from = from;
    this.to = to;
    this.side = side;
  }
};
var Escapable = "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";
var Punctuation = /[!"#$%&'()*+,\-.\/:;<=>?@\[\\\]^_`{|}~\xA1\u2010-\u2027]/;
try {
  Punctuation = new RegExp("[\\p{Pc}|\\p{Pd}|\\p{Pe}|\\p{Pf}|\\p{Pi}|\\p{Po}|\\p{Ps}]", "u");
} catch (_) {
}
var DefaultInline = {
  Escape(cx, next, start) {
    if (next != 92 || start == cx.end - 1)
      return -1;
    let escaped = cx.char(start + 1);
    for (let i = 0; i < Escapable.length; i++)
      if (Escapable.charCodeAt(i) == escaped)
        return cx.append(elt(Type.Escape, start, start + 2));
    return -1;
  },
  Entity(cx, next, start) {
    if (next != 38)
      return -1;
    let m = /^(?:#\d+|#x[a-f\d]+|\w+);/i.exec(cx.slice(start + 1, start + 31));
    return m ? cx.append(elt(Type.Entity, start, start + 1 + m[0].length)) : -1;
  },
  InlineCode(cx, next, start) {
    if (next != 96 || start && cx.char(start - 1) == 96)
      return -1;
    let pos = start + 1;
    while (pos < cx.end && cx.char(pos) == 96)
      pos++;
    let size = pos - start, curSize = 0;
    for (; pos < cx.end; pos++) {
      if (cx.char(pos) == 96) {
        curSize++;
        if (curSize == size && cx.char(pos + 1) != 96)
          return cx.append(elt(Type.InlineCode, start, pos + 1, [
            elt(Type.CodeMark, start, start + size),
            elt(Type.CodeMark, pos + 1 - size, pos + 1)
          ]));
      } else {
        curSize = 0;
      }
    }
    return -1;
  },
  HTMLTag(cx, next, start) {
    if (next != 60 || start == cx.end - 1)
      return -1;
    let after = cx.slice(start + 1, cx.end);
    let url = /^(?:[a-z][-\w+.]+:[^\s>]+|[a-z\d.!#$%&'*+/=?^_`{|}~-]+@[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?(?:\.[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?)*)>/i.exec(after);
    if (url) {
      return cx.append(elt(Type.Autolink, start, start + 1 + url[0].length, [
        elt(Type.LinkMark, start, start + 1),
        elt(Type.URL, start + 1, start + url[0].length),
        elt(Type.LinkMark, start + url[0].length, start + 1 + url[0].length)
      ]));
    }
    let comment2 = /^!--[^>](?:-[^-]|[^-])*?-->/i.exec(after);
    if (comment2)
      return cx.append(elt(Type.Comment, start, start + 1 + comment2[0].length));
    let procInst = /^\?[^]*?\?>/.exec(after);
    if (procInst)
      return cx.append(elt(Type.ProcessingInstruction, start, start + 1 + procInst[0].length));
    let m = /^(?:![A-Z][^]*?>|!\[CDATA\[[^]*?\]\]>|\/\s*[a-zA-Z][\w-]*\s*>|\s*[a-zA-Z][\w-]*(\s+[a-zA-Z:_][\w-.:]*(?:\s*=\s*(?:[^\s"'=<>`]+|'[^']*'|"[^"]*"))?)*\s*(\/\s*)?>)/.exec(after);
    if (!m)
      return -1;
    return cx.append(elt(Type.HTMLTag, start, start + 1 + m[0].length));
  },
  Emphasis(cx, next, start) {
    if (next != 95 && next != 42)
      return -1;
    let pos = start + 1;
    while (cx.char(pos) == next)
      pos++;
    let before = cx.slice(start - 1, start), after = cx.slice(pos, pos + 1);
    let pBefore = Punctuation.test(before), pAfter = Punctuation.test(after);
    let sBefore = /\s|^$/.test(before), sAfter = /\s|^$/.test(after);
    let leftFlanking = !sAfter && (!pAfter || sBefore || pBefore);
    let rightFlanking = !sBefore && (!pBefore || sAfter || pAfter);
    let canOpen = leftFlanking && (next == 42 || !rightFlanking || pBefore);
    let canClose = rightFlanking && (next == 42 || !leftFlanking || pAfter);
    return cx.append(new InlineDelimiter(next == 95 ? EmphasisUnderscore : EmphasisAsterisk, start, pos, (canOpen ? 1 : 0) | (canClose ? 2 : 0)));
  },
  HardBreak(cx, next, start) {
    if (next == 92 && cx.char(start + 1) == 10)
      return cx.append(elt(Type.HardBreak, start, start + 2));
    if (next == 32) {
      let pos = start + 1;
      while (cx.char(pos) == 32)
        pos++;
      if (cx.char(pos) == 10 && pos >= start + 2)
        return cx.append(elt(Type.HardBreak, start, pos + 1));
    }
    return -1;
  },
  Link(cx, next, start) {
    return next == 91 ? cx.append(new InlineDelimiter(LinkStart, start, start + 1, 1)) : -1;
  },
  Image(cx, next, start) {
    return next == 33 && cx.char(start + 1) == 91 ? cx.append(new InlineDelimiter(ImageStart, start, start + 2, 1)) : -1;
  },
  LinkEnd(cx, next, start) {
    if (next != 93)
      return -1;
    for (let i = cx.parts.length - 1; i >= 0; i--) {
      let part = cx.parts[i];
      if (part instanceof InlineDelimiter && (part.type == LinkStart || part.type == ImageStart)) {
        if (!part.side || cx.skipSpace(part.to) == start && !/[(\[]/.test(cx.slice(start + 1, start + 2))) {
          cx.parts[i] = null;
          return -1;
        }
        let content2 = cx.takeContent(i);
        let link = cx.parts[i] = finishLink(cx, content2, part.type == LinkStart ? Type.Link : Type.Image, part.from, start + 1);
        if (part.type == LinkStart)
          for (let j = 0; j < i; j++) {
            let p = cx.parts[j];
            if (p instanceof InlineDelimiter && p.type == LinkStart)
              p.side = 0;
          }
        return link.to;
      }
    }
    return -1;
  }
};
function finishLink(cx, content2, type, start, startPos) {
  let { text } = cx, next = cx.char(startPos), endPos = startPos;
  content2.unshift(elt(Type.LinkMark, start, start + (type == Type.Image ? 2 : 1)));
  content2.push(elt(Type.LinkMark, startPos - 1, startPos));
  if (next == 40) {
    let pos = cx.skipSpace(startPos + 1);
    let dest = parseURL(text, pos - cx.offset, cx.offset), title;
    if (dest) {
      pos = cx.skipSpace(dest.to);
      if (pos != dest.to) {
        title = parseLinkTitle(text, pos - cx.offset, cx.offset);
        if (title)
          pos = cx.skipSpace(title.to);
      }
    }
    if (cx.char(pos) == 41) {
      content2.push(elt(Type.LinkMark, startPos, startPos + 1));
      endPos = pos + 1;
      if (dest)
        content2.push(dest);
      if (title)
        content2.push(title);
      content2.push(elt(Type.LinkMark, pos, endPos));
    }
  } else if (next == 91) {
    let label = parseLinkLabel(text, startPos - cx.offset, cx.offset, false);
    if (label) {
      content2.push(label);
      endPos = label.to;
    }
  }
  return elt(type, start, endPos, content2);
}
function parseURL(text, start, offset) {
  let next = text.charCodeAt(start);
  if (next == 60) {
    for (let pos = start + 1; pos < text.length; pos++) {
      let ch = text.charCodeAt(pos);
      if (ch == 62)
        return elt(Type.URL, start + offset, pos + 1 + offset);
      if (ch == 60 || ch == 10)
        return false;
    }
    return null;
  } else {
    let depth = 0, pos = start;
    for (let escaped = false; pos < text.length; pos++) {
      let ch = text.charCodeAt(pos);
      if (space3(ch)) {
        break;
      } else if (escaped) {
        escaped = false;
      } else if (ch == 40) {
        depth++;
      } else if (ch == 41) {
        if (!depth)
          break;
        depth--;
      } else if (ch == 92) {
        escaped = true;
      }
    }
    return pos > start ? elt(Type.URL, start + offset, pos + offset) : pos == text.length ? null : false;
  }
}
function parseLinkTitle(text, start, offset) {
  let next = text.charCodeAt(start);
  if (next != 39 && next != 34 && next != 40)
    return false;
  let end = next == 40 ? 41 : next;
  for (let pos = start + 1, escaped = false; pos < text.length; pos++) {
    let ch = text.charCodeAt(pos);
    if (escaped)
      escaped = false;
    else if (ch == end)
      return elt(Type.LinkTitle, start + offset, pos + 1 + offset);
    else if (ch == 92)
      escaped = true;
  }
  return null;
}
function parseLinkLabel(text, start, offset, requireNonWS) {
  for (let escaped = false, pos = start + 1, end = Math.min(text.length, pos + 999); pos < end; pos++) {
    let ch = text.charCodeAt(pos);
    if (escaped)
      escaped = false;
    else if (ch == 93)
      return requireNonWS ? false : elt(Type.LinkLabel, start + offset, pos + 1 + offset);
    else {
      if (requireNonWS && !space3(ch))
        requireNonWS = false;
      if (ch == 91)
        return false;
      else if (ch == 92)
        escaped = true;
    }
  }
  return null;
}
var InlineContext = class {
  constructor(parser5, text, offset) {
    this.parser = parser5;
    this.text = text;
    this.offset = offset;
    this.parts = [];
  }
  char(pos) {
    return pos >= this.end ? -1 : this.text.charCodeAt(pos - this.offset);
  }
  get end() {
    return this.offset + this.text.length;
  }
  slice(from, to) {
    return this.text.slice(from - this.offset, to - this.offset);
  }
  append(elt2) {
    this.parts.push(elt2);
    return elt2.to;
  }
  addDelimiter(type, from, to, open, close) {
    return this.append(new InlineDelimiter(type, from, to, (open ? 1 : 0) | (close ? 2 : 0)));
  }
  get hasOpenLink() {
    for (let i = this.parts.length - 1; i >= 0; i--) {
      let part = this.parts[i];
      if (part instanceof InlineDelimiter && (part.type == LinkStart || part.type == ImageStart))
        return true;
    }
    return false;
  }
  addElement(elt2) {
    return this.append(elt2);
  }
  resolveMarkers(from) {
    for (let i = from; i < this.parts.length; i++) {
      let close = this.parts[i];
      if (!(close instanceof InlineDelimiter && close.type.resolve && close.side & 2))
        continue;
      let emp = close.type == EmphasisUnderscore || close.type == EmphasisAsterisk;
      let closeSize = close.to - close.from;
      let open, j = i - 1;
      for (; j >= from; j--) {
        let part = this.parts[j];
        if (part instanceof InlineDelimiter && part.side & 1 && part.type == close.type && !(emp && (close.side & 1 || part.side & 2) && (part.to - part.from + closeSize) % 3 == 0 && ((part.to - part.from) % 3 || closeSize % 3))) {
          open = part;
          break;
        }
      }
      if (!open)
        continue;
      let type = close.type.resolve, content2 = [];
      let start = open.from, end = close.to;
      if (emp) {
        let size = Math.min(2, open.to - open.from, closeSize);
        start = open.to - size;
        end = close.from + size;
        type = size == 1 ? "Emphasis" : "StrongEmphasis";
      }
      if (open.type.mark)
        content2.push(this.elt(open.type.mark, start, open.to));
      for (let k = j + 1; k < i; k++) {
        if (this.parts[k] instanceof Element2)
          content2.push(this.parts[k]);
        this.parts[k] = null;
      }
      if (close.type.mark)
        content2.push(this.elt(close.type.mark, close.from, end));
      let element = this.elt(type, start, end, content2);
      this.parts[j] = emp && open.from != start ? new InlineDelimiter(open.type, open.from, start, open.side) : null;
      let keep = this.parts[i] = emp && close.to != end ? new InlineDelimiter(close.type, end, close.to, close.side) : null;
      if (keep)
        this.parts.splice(i, 0, element);
      else
        this.parts[i] = element;
    }
    let result = [];
    for (let i = from; i < this.parts.length; i++) {
      let part = this.parts[i];
      if (part instanceof Element2)
        result.push(part);
    }
    return result;
  }
  findOpeningDelimiter(type) {
    for (let i = this.parts.length - 1; i >= 0; i--) {
      let part = this.parts[i];
      if (part instanceof InlineDelimiter && part.type == type)
        return i;
    }
    return null;
  }
  takeContent(startIndex) {
    let content2 = this.resolveMarkers(startIndex);
    this.parts.length = startIndex;
    return content2;
  }
  skipSpace(from) {
    return skipSpace(this.text, from - this.offset) + this.offset;
  }
  elt(type, from, to, children) {
    if (typeof type == "string")
      return elt(this.parser.getNodeType(type), from, to, children);
    return new TreeElement(type, from);
  }
};
function injectMarks(elements, marks2) {
  if (!marks2.length)
    return elements;
  if (!elements.length)
    return marks2;
  let elts = elements.slice(), eI = 0;
  for (let mark of marks2) {
    while (eI < elts.length && elts[eI].to < mark.to)
      eI++;
    if (eI < elts.length && elts[eI].from < mark.from) {
      let e = elts[eI];
      if (e instanceof Element2)
        elts[eI] = new Element2(e.type, e.from, e.to, injectMarks(e.children, [mark]));
    } else {
      elts.splice(eI++, 0, mark);
    }
  }
  return elts;
}
var NotLast = [Type.CodeBlock, Type.ListItem, Type.OrderedList, Type.BulletList];
var FragmentCursor3 = class {
  constructor(fragments, input) {
    this.fragments = fragments;
    this.input = input;
    this.i = 0;
    this.fragment = null;
    this.fragmentEnd = -1;
    this.cursor = null;
    if (fragments.length)
      this.fragment = fragments[this.i++];
  }
  nextFragment() {
    this.fragment = this.i < this.fragments.length ? this.fragments[this.i++] : null;
    this.cursor = null;
    this.fragmentEnd = -1;
  }
  moveTo(pos, lineStart) {
    while (this.fragment && this.fragment.to <= pos)
      this.nextFragment();
    if (!this.fragment || this.fragment.from > (pos ? pos - 1 : 0))
      return false;
    if (this.fragmentEnd < 0) {
      let end = this.fragment.to;
      while (end > 0 && this.input.read(end - 1, end) != "\n")
        end--;
      this.fragmentEnd = end ? end - 1 : 0;
    }
    let c = this.cursor;
    if (!c) {
      c = this.cursor = this.fragment.tree.cursor();
      c.firstChild();
    }
    let rPos = pos + this.fragment.offset;
    while (c.to <= rPos)
      if (!c.parent())
        return false;
    for (; ; ) {
      if (c.from >= rPos)
        return this.fragment.from <= lineStart;
      if (!c.childAfter(rPos))
        return false;
    }
  }
  matches(hash2) {
    let tree = this.cursor.tree;
    return tree && tree.prop(NodeProp.contextHash) == hash2;
  }
  takeNodes(cx) {
    let cur = this.cursor, off = this.fragment.offset, fragEnd = this.fragmentEnd - (this.fragment.openEnd ? 1 : 0);
    let start = cx.absoluteLineStart, end = start, blockI = cx.block.children.length;
    let prevEnd = end, prevI = blockI;
    for (; ; ) {
      if (cur.to - off > fragEnd) {
        if (cur.type.isAnonymous && cur.firstChild())
          continue;
        break;
      }
      let pos = toRelative(cur.from - off, cx.ranges);
      if (cur.to - off <= cx.ranges[cx.rangeI].to) {
        cx.addNode(cur.tree, pos);
      } else {
        let dummy = new Tree(cx.parser.nodeSet.types[Type.Paragraph], [], [], 0, cx.block.hashProp);
        cx.reusePlaceholders.set(dummy, cur.tree);
        cx.addNode(dummy, pos);
      }
      if (cur.type.is("Block")) {
        if (NotLast.indexOf(cur.type.id) < 0) {
          end = cur.to - off;
          blockI = cx.block.children.length;
        } else {
          end = prevEnd;
          blockI = prevI;
          prevEnd = cur.to - off;
          prevI = cx.block.children.length;
        }
      }
      if (!cur.nextSibling())
        break;
    }
    while (cx.block.children.length > blockI) {
      cx.block.children.pop();
      cx.block.positions.pop();
    }
    return end - start;
  }
};
function toRelative(abs, ranges) {
  let pos = abs;
  for (let i = 1; i < ranges.length; i++) {
    let gapFrom = ranges[i - 1].to, gapTo = ranges[i].from;
    if (gapFrom < abs)
      pos -= gapTo - gapFrom;
  }
  return pos;
}
var markdownHighlighting = styleTags({
  "Blockquote/...": tags.quote,
  HorizontalRule: tags.contentSeparator,
  "ATXHeading1/... SetextHeading1/...": tags.heading1,
  "ATXHeading2/... SetextHeading2/...": tags.heading2,
  "ATXHeading3/...": tags.heading3,
  "ATXHeading4/...": tags.heading4,
  "ATXHeading5/...": tags.heading5,
  "ATXHeading6/...": tags.heading6,
  "Comment CommentBlock": tags.comment,
  Escape: tags.escape,
  Entity: tags.character,
  "Emphasis/...": tags.emphasis,
  "StrongEmphasis/...": tags.strong,
  "Link/... Image/...": tags.link,
  "OrderedList/... BulletList/...": tags.list,
  "BlockQuote/...": tags.quote,
  "InlineCode CodeText": tags.monospace,
  "URL Autolink": tags.url,
  "HeaderMark HardBreak QuoteMark ListMark LinkMark EmphasisMark CodeMark": tags.processingInstruction,
  "CodeInfo LinkLabel": tags.labelName,
  LinkTitle: tags.string,
  Paragraph: tags.content
});
var parser4 = new MarkdownParser(new NodeSet(nodeTypes).extend(markdownHighlighting), Object.keys(DefaultBlockParsers).map((n) => DefaultBlockParsers[n]), Object.keys(DefaultBlockParsers).map((n) => DefaultLeafBlocks[n]), Object.keys(DefaultBlockParsers), DefaultEndLeaf, DefaultSkipMarkup, Object.keys(DefaultInline).map((n) => DefaultInline[n]), Object.keys(DefaultInline), []);
function leftOverSpace(node, from, to) {
  let ranges = [];
  for (let n = node.firstChild, pos = from; ; n = n.nextSibling) {
    let nextPos = n ? n.from : to;
    if (nextPos > pos)
      ranges.push({ from: pos, to: nextPos });
    if (!n)
      break;
    pos = n.to;
  }
  return ranges;
}
function parseCode(config) {
  let { codeParser, htmlParser } = config;
  let wrap = parseMixed((node, input) => {
    let id2 = node.type.id;
    if (codeParser && (id2 == Type.CodeBlock || id2 == Type.FencedCode)) {
      let info = "";
      if (id2 == Type.FencedCode) {
        let infoNode = node.node.getChild(Type.CodeInfo);
        if (infoNode)
          info = input.read(infoNode.from, infoNode.to);
      }
      let parser5 = codeParser(info);
      if (parser5)
        return { parser: parser5, overlay: (node2) => node2.type.id == Type.CodeText };
    } else if (htmlParser && (id2 == Type.HTMLBlock || id2 == Type.HTMLTag)) {
      return { parser: htmlParser, overlay: leftOverSpace(node.node, node.from, node.to) };
    }
    return null;
  });
  return { wrap };
}
var StrikethroughDelim = { resolve: "Strikethrough", mark: "StrikethroughMark" };
var Strikethrough = {
  defineNodes: [{
    name: "Strikethrough",
    style: { "Strikethrough/...": tags.strikethrough }
  }, {
    name: "StrikethroughMark",
    style: tags.processingInstruction
  }],
  parseInline: [{
    name: "Strikethrough",
    parse(cx, next, pos) {
      if (next != 126 || cx.char(pos + 1) != 126 || cx.char(pos + 2) == 126)
        return -1;
      let before = cx.slice(pos - 1, pos), after = cx.slice(pos + 2, pos + 3);
      let sBefore = /\s|^$/.test(before), sAfter = /\s|^$/.test(after);
      let pBefore = Punctuation.test(before), pAfter = Punctuation.test(after);
      return cx.addDelimiter(StrikethroughDelim, pos, pos + 2, !sAfter && (!pAfter || sBefore || pBefore), !sBefore && (!pBefore || sAfter || pAfter));
    },
    after: "Emphasis"
  }]
};
function parseRow(cx, line, startI = 0, elts, offset = 0) {
  let count2 = 0, first = true, cellStart = -1, cellEnd = -1, esc = false;
  let parseCell = () => {
    elts.push(cx.elt("TableCell", offset + cellStart, offset + cellEnd, cx.parser.parseInline(line.slice(cellStart, cellEnd), offset + cellStart)));
  };
  for (let i = startI; i < line.length; i++) {
    let next = line.charCodeAt(i);
    if (next == 124 && !esc) {
      if (!first || cellStart > -1)
        count2++;
      first = false;
      if (elts) {
        if (cellStart > -1)
          parseCell();
        elts.push(cx.elt("TableDelimiter", i + offset, i + offset + 1));
      }
      cellStart = cellEnd = -1;
    } else if (esc || next != 32 && next != 9) {
      if (cellStart < 0)
        cellStart = i;
      cellEnd = i + 1;
    }
    esc = !esc && next == 92;
  }
  if (cellStart > -1) {
    count2++;
    if (elts)
      parseCell();
  }
  return count2;
}
function hasPipe(str, start) {
  for (let i = start; i < str.length; i++) {
    let next = str.charCodeAt(i);
    if (next == 124)
      return true;
    if (next == 92)
      i++;
  }
  return false;
}
var delimiterLine = /^\|?(\s*:?-+:?\s*\|)+(\s*:?-+:?\s*)?$/;
var TableParser = class {
  constructor() {
    this.rows = null;
  }
  nextLine(cx, line, leaf) {
    if (this.rows == null) {
      this.rows = false;
      let lineText;
      if ((line.next == 45 || line.next == 58 || line.next == 124) && delimiterLine.test(lineText = line.text.slice(line.pos))) {
        let firstRow = [], firstCount = parseRow(cx, leaf.content, 0, firstRow, leaf.start);
        if (firstCount == parseRow(cx, lineText, line.pos))
          this.rows = [
            cx.elt("TableHeader", leaf.start, leaf.start + leaf.content.length, firstRow),
            cx.elt("TableDelimiter", cx.lineStart + line.pos, cx.lineStart + line.text.length)
          ];
      }
    } else if (this.rows) {
      let content2 = [];
      parseRow(cx, line.text, line.pos, content2, cx.lineStart);
      this.rows.push(cx.elt("TableRow", cx.lineStart + line.pos, cx.lineStart + line.text.length, content2));
    }
    return false;
  }
  finish(cx, leaf) {
    if (!this.rows)
      return false;
    cx.addLeafElement(leaf, cx.elt("Table", leaf.start, leaf.start + leaf.content.length, this.rows));
    return true;
  }
};
var Table = {
  defineNodes: [
    { name: "Table", block: true },
    { name: "TableHeader", style: { "TableHeader/...": tags.heading } },
    "TableRow",
    { name: "TableCell", style: tags.content },
    { name: "TableDelimiter", style: tags.processingInstruction }
  ],
  parseBlock: [{
    name: "Table",
    leaf(_, leaf) {
      return hasPipe(leaf.content, 0) ? new TableParser() : null;
    },
    endLeaf(cx, line, leaf) {
      if (leaf.parsers.some((p) => p instanceof TableParser) || !hasPipe(line.text, line.basePos))
        return false;
      let next = cx.scanLine(cx.absoluteLineEnd + 1).text;
      return delimiterLine.test(next) && parseRow(cx, line.text, line.basePos) == parseRow(cx, next, line.basePos);
    },
    before: "SetextHeading"
  }]
};
var TaskParser = class {
  nextLine() {
    return false;
  }
  finish(cx, leaf) {
    cx.addLeafElement(leaf, cx.elt("Task", leaf.start, leaf.start + leaf.content.length, [
      cx.elt("TaskMarker", leaf.start, leaf.start + 3),
      ...cx.parser.parseInline(leaf.content.slice(3), leaf.start + 3)
    ]));
    return true;
  }
};
var TaskList = {
  defineNodes: [
    { name: "Task", block: true, style: tags.list },
    { name: "TaskMarker", style: tags.atom }
  ],
  parseBlock: [{
    name: "TaskList",
    leaf(cx, leaf) {
      return /^\[[ xX]\][ \t]/.test(leaf.content) && cx.parentType().name == "ListItem" ? new TaskParser() : null;
    },
    after: "SetextHeading"
  }]
};
var autolinkRE = /(www\.)|(https?:\/\/)|([\w.+-]+@)|(mailto:|xmpp:)/gy;
var urlRE = /[\w-]+(\.[\w-]+)+(\/[^\s<]*)?/gy;
var lastTwoDomainWords = /[\w-]+\.[\w-]+($|\/)/;
var emailRE = /[\w.+-]+@[\w-]+(\.[\w.-]+)+/gy;
var xmppResourceRE = /\/[a-zA-Z\d@.]+/gy;
function count(str, from, to, ch) {
  let result = 0;
  for (let i = from; i < to; i++)
    if (str[i] == ch)
      result++;
  return result;
}
function autolinkURLEnd(text, from) {
  urlRE.lastIndex = from;
  let m = urlRE.exec(text);
  if (!m || lastTwoDomainWords.exec(m[0])[0].indexOf("_") > -1)
    return -1;
  let end = from + m[0].length;
  for (; ; ) {
    let last = text[end - 1], m2;
    if (/[?!.,:*_~]/.test(last) || last == ")" && count(text, from, end, ")") > count(text, from, end, "("))
      end--;
    else if (last == ";" && (m2 = /&(?:#\d+|#x[a-f\d]+|\w+);$/.exec(text.slice(from, end))))
      end = from + m2.index;
    else
      break;
  }
  return end;
}
function autolinkEmailEnd(text, from) {
  emailRE.lastIndex = from;
  let m = emailRE.exec(text);
  if (!m)
    return -1;
  let last = m[0][m[0].length - 1];
  return last == "_" || last == "-" ? -1 : from + m[0].length - (last == "." ? 1 : 0);
}
var Autolink = {
  parseInline: [{
    name: "Autolink",
    parse(cx, next, absPos) {
      let pos = absPos - cx.offset;
      autolinkRE.lastIndex = pos;
      let m = autolinkRE.exec(cx.text), end = -1;
      if (!m)
        return -1;
      if (m[1] || m[2]) {
        end = autolinkURLEnd(cx.text, pos + m[0].length);
        if (end > -1 && cx.hasOpenLink) {
          let noBracket = /([^\[\]]|\[[^\]]*\])*/.exec(cx.text.slice(pos, end));
          end = pos + noBracket[0].length;
        }
      } else if (m[3]) {
        end = autolinkEmailEnd(cx.text, pos);
      } else {
        end = autolinkEmailEnd(cx.text, pos + m[0].length);
        if (end > -1 && m[0] == "xmpp:") {
          xmppResourceRE.lastIndex = end;
          m = xmppResourceRE.exec(cx.text);
          if (m)
            end = m.index + m[0].length;
        }
      }
      if (end < 0)
        return -1;
      cx.addElement(cx.elt("URL", absPos, end + cx.offset));
      return end + cx.offset;
    }
  }]
};
var GFM = [Table, TaskList, Strikethrough, Autolink];
function parseSubSuper(ch, node, mark) {
  return (cx, next, pos) => {
    if (next != ch || cx.char(pos + 1) == ch)
      return -1;
    let elts = [cx.elt(mark, pos, pos + 1)];
    for (let i = pos + 1; i < cx.end; i++) {
      let next2 = cx.char(i);
      if (next2 == ch)
        return cx.addElement(cx.elt(node, pos, i + 1, elts.concat(cx.elt(mark, i, i + 1))));
      if (next2 == 92)
        elts.push(cx.elt("Escape", i, i++ + 2));
      if (space3(next2))
        break;
    }
    return -1;
  };
}
var Superscript = {
  defineNodes: [
    { name: "Superscript", style: tags.special(tags.content) },
    { name: "SuperscriptMark", style: tags.processingInstruction }
  ],
  parseInline: [{
    name: "Superscript",
    parse: parseSubSuper(94, "Superscript", "SuperscriptMark")
  }]
};
var Subscript = {
  defineNodes: [
    { name: "Subscript", style: tags.special(tags.content) },
    { name: "SubscriptMark", style: tags.processingInstruction }
  ],
  parseInline: [{
    name: "Subscript",
    parse: parseSubSuper(126, "Subscript", "SubscriptMark")
  }]
};
var Emoji = {
  defineNodes: [{ name: "Emoji", style: tags.character }],
  parseInline: [{
    name: "Emoji",
    parse(cx, next, pos) {
      let match;
      if (next != 58 || !(match = /^[a-zA-Z_0-9]+:/.exec(cx.slice(pos + 1, cx.end))))
        return -1;
      return cx.addElement(cx.elt("Emoji", pos, pos + 1 + match[0].length));
    }
  }]
};

// node_modules/@codemirror/lang-markdown/dist/index.js
var data = /* @__PURE__ */ defineLanguageFacet({ commentTokens: { block: { open: "<!--", close: "-->" } } });
var headingProp = /* @__PURE__ */ new NodeProp();
var commonmark = /* @__PURE__ */ parser4.configure({
  props: [
    /* @__PURE__ */ foldNodeProp.add((type) => {
      return !type.is("Block") || type.is("Document") || isHeading(type) != null ? void 0 : (tree, state) => ({ from: state.doc.lineAt(tree.from).to, to: tree.to });
    }),
    /* @__PURE__ */ headingProp.add(isHeading),
    /* @__PURE__ */ indentNodeProp.add({
      Document: () => null
    }),
    /* @__PURE__ */ languageDataProp.add({
      Document: data
    })
  ]
});
function isHeading(type) {
  let match = /^(?:ATX|Setext)Heading(\d)$/.exec(type.name);
  return match ? +match[1] : void 0;
}
function findSectionEnd(headerNode, level) {
  let last = headerNode;
  for (; ; ) {
    let next = last.nextSibling, heading2;
    if (!next || (heading2 = isHeading(next.type)) != null && heading2 <= level)
      break;
    last = next;
  }
  return last.to;
}
var headerIndent = /* @__PURE__ */ foldService.of((state, start, end) => {
  for (let node = syntaxTree(state).resolveInner(end, -1); node; node = node.parent) {
    if (node.from < start)
      break;
    let heading2 = node.type.prop(headingProp);
    if (heading2 == null)
      continue;
    let upto = findSectionEnd(node, heading2);
    if (upto > end)
      return { from: end, to: upto };
  }
  return null;
});
function mkLang(parser5) {
  return new Language(data, parser5, [headerIndent], "markdown");
}
var commonmarkLanguage = /* @__PURE__ */ mkLang(commonmark);
var extended = /* @__PURE__ */ commonmark.configure([GFM, Subscript, Superscript, Emoji, {
  props: [
    /* @__PURE__ */ foldNodeProp.add({
      Table: (tree, state) => ({ from: state.doc.lineAt(tree.from).to, to: tree.to })
    })
  ]
}]);
var markdownLanguage = /* @__PURE__ */ mkLang(extended);
function getCodeParser(languages, defaultLanguage) {
  return (info) => {
    if (info && languages) {
      let found = null;
      info = /\S*/.exec(info)[0];
      if (typeof languages == "function")
        found = languages(info);
      else
        found = LanguageDescription.matchLanguageName(languages, info, true);
      if (found instanceof LanguageDescription)
        return found.support ? found.support.language.parser : ParseContext.getSkippingParser(found.load());
      else if (found)
        return found.parser;
    }
    return defaultLanguage ? defaultLanguage.parser : null;
  };
}
var Context = class {
  constructor(node, from, to, spaceBefore, spaceAfter, type, item) {
    this.node = node;
    this.from = from;
    this.to = to;
    this.spaceBefore = spaceBefore;
    this.spaceAfter = spaceAfter;
    this.type = type;
    this.item = item;
  }
  blank(maxWidth, trailing = true) {
    let result = this.spaceBefore + (this.node.name == "Blockquote" ? ">" : "");
    if (maxWidth != null) {
      while (result.length < maxWidth)
        result += " ";
      return result;
    } else {
      for (let i = this.to - this.from - result.length - this.spaceAfter.length; i > 0; i--)
        result += " ";
      return result + (trailing ? this.spaceAfter : "");
    }
  }
  marker(doc2, add) {
    let number2 = this.node.name == "OrderedList" ? String(+itemNumber(this.item, doc2)[2] + add) : "";
    return this.spaceBefore + number2 + this.type + this.spaceAfter;
  }
};
function getContext(node, doc2) {
  let nodes = [];
  for (let cur = node; cur && cur.name != "Document"; cur = cur.parent) {
    if (cur.name == "ListItem" || cur.name == "Blockquote" || cur.name == "FencedCode")
      nodes.push(cur);
  }
  let context = [];
  for (let i = nodes.length - 1; i >= 0; i--) {
    let node2 = nodes[i], match;
    let line = doc2.lineAt(node2.from), startPos = node2.from - line.from;
    if (node2.name == "FencedCode") {
      context.push(new Context(node2, startPos, startPos, "", "", "", null));
    } else if (node2.name == "Blockquote" && (match = /^ *>( ?)/.exec(line.text.slice(startPos)))) {
      context.push(new Context(node2, startPos, startPos + match[0].length, "", match[1], ">", null));
    } else if (node2.name == "ListItem" && node2.parent.name == "OrderedList" && (match = /^( *)\d+([.)])( *)/.exec(line.text.slice(startPos)))) {
      let after = match[3], len = match[0].length;
      if (after.length >= 4) {
        after = after.slice(0, after.length - 4);
        len -= 4;
      }
      context.push(new Context(node2.parent, startPos, startPos + len, match[1], after, match[2], node2));
    } else if (node2.name == "ListItem" && node2.parent.name == "BulletList" && (match = /^( *)([-+*])( {1,4}\[[ xX]\])?( +)/.exec(line.text.slice(startPos)))) {
      let after = match[4], len = match[0].length;
      if (after.length > 4) {
        after = after.slice(0, after.length - 4);
        len -= 4;
      }
      let type = match[2];
      if (match[3])
        type += match[3].replace(/[xX]/, " ");
      context.push(new Context(node2.parent, startPos, startPos + len, match[1], after, type, node2));
    }
  }
  return context;
}
function itemNumber(item, doc2) {
  return /^(\s*)(\d+)(?=[.)])/.exec(doc2.sliceString(item.from, item.from + 10));
}
function renumberList(after, doc2, changes, offset = 0) {
  for (let prev = -1, node = after; ; ) {
    if (node.name == "ListItem") {
      let m = itemNumber(node, doc2);
      let number2 = +m[2];
      if (prev >= 0) {
        if (number2 != prev + 1)
          return;
        changes.push({ from: node.from + m[1].length, to: node.from + m[0].length, insert: String(prev + 2 + offset) });
      }
      prev = number2;
    }
    let next = node.nextSibling;
    if (!next)
      break;
    node = next;
  }
}
function normalizeIndent(content2, state) {
  let blank = /^[ \t]*/.exec(content2)[0].length;
  if (!blank || state.facet(indentUnit) != "	")
    return content2;
  let col = countColumn(content2, 4, blank);
  let space4 = "";
  for (let i = col; i > 0; ) {
    if (i >= 4) {
      space4 += "	";
      i -= 4;
    } else {
      space4 += " ";
      i--;
    }
  }
  return space4 + content2.slice(blank);
}
var insertNewlineContinueMarkup = ({ state, dispatch }) => {
  let tree = syntaxTree(state), { doc: doc2 } = state;
  let dont = null, changes = state.changeByRange((range) => {
    if (!range.empty || !markdownLanguage.isActiveAt(state, range.from))
      return dont = { range };
    let pos = range.from, line = doc2.lineAt(pos);
    let context = getContext(tree.resolveInner(pos, -1), doc2);
    while (context.length && context[context.length - 1].from > pos - line.from)
      context.pop();
    if (!context.length)
      return dont = { range };
    let inner = context[context.length - 1];
    if (inner.to - inner.spaceAfter.length > pos - line.from)
      return dont = { range };
    let emptyLine = pos >= inner.to - inner.spaceAfter.length && !/\S/.test(line.text.slice(inner.to));
    if (inner.item && emptyLine) {
      let first = inner.node.firstChild, second = inner.node.getChild("ListItem", "ListItem");
      if (first.to >= pos || second && second.to < pos || line.from > 0 && !/[^\s>]/.test(doc2.lineAt(line.from - 1).text)) {
        let next = context.length > 1 ? context[context.length - 2] : null;
        let delTo, insert3 = "";
        if (next && next.item) {
          delTo = line.from + next.from;
          insert3 = next.marker(doc2, 1);
        } else {
          delTo = line.from + (next ? next.to : 0);
        }
        let changes3 = [{ from: delTo, to: pos, insert: insert3 }];
        if (inner.node.name == "OrderedList")
          renumberList(inner.item, doc2, changes3, -2);
        if (next && next.node.name == "OrderedList")
          renumberList(next.item, doc2, changes3);
        return { range: EditorSelection.cursor(delTo + insert3.length), changes: changes3 };
      } else {
        let insert3 = blankLine(context, state, line);
        return {
          range: EditorSelection.cursor(pos + insert3.length + 1),
          changes: { from: line.from, insert: insert3 + state.lineBreak }
        };
      }
    }
    if (inner.node.name == "Blockquote" && emptyLine && line.from) {
      let prevLine = doc2.lineAt(line.from - 1), quoted = />\s*$/.exec(prevLine.text);
      if (quoted && quoted.index == inner.from) {
        let changes3 = state.changes([
          { from: prevLine.from + quoted.index, to: prevLine.to },
          { from: line.from + inner.from, to: line.to }
        ]);
        return { range: range.map(changes3), changes: changes3 };
      }
    }
    let changes2 = [];
    if (inner.node.name == "OrderedList")
      renumberList(inner.item, doc2, changes2);
    let continued = inner.item && inner.item.from < line.from;
    let insert2 = "";
    if (!continued || /^[\s\d.)\-+*>]*/.exec(line.text)[0].length >= inner.to) {
      for (let i = 0, e = context.length - 1; i <= e; i++) {
        insert2 += i == e && !continued ? context[i].marker(doc2, 1) : context[i].blank(i < e ? countColumn(line.text, 4, context[i + 1].from) - insert2.length : null);
      }
    }
    let from = pos;
    while (from > line.from && /\s/.test(line.text.charAt(from - line.from - 1)))
      from--;
    insert2 = normalizeIndent(insert2, state);
    if (nonTightList(inner.node, state.doc))
      insert2 = blankLine(context, state, line) + state.lineBreak + insert2;
    changes2.push({ from, to: pos, insert: state.lineBreak + insert2 });
    return { range: EditorSelection.cursor(from + insert2.length + 1), changes: changes2 };
  });
  if (dont)
    return false;
  dispatch(state.update(changes, { scrollIntoView: true, userEvent: "input" }));
  return true;
};
function isMark(node) {
  return node.name == "QuoteMark" || node.name == "ListMark";
}
function nonTightList(node, doc2) {
  if (node.name != "OrderedList" && node.name != "BulletList")
    return false;
  let first = node.firstChild, second = node.getChild("ListItem", "ListItem");
  if (!second)
    return false;
  let line1 = doc2.lineAt(first.to), line2 = doc2.lineAt(second.from);
  let empty = /^[\s>]*$/.test(line1.text);
  return line1.number + (empty ? 0 : 1) < line2.number;
}
function blankLine(context, state, line) {
  let insert2 = "";
  for (let i = 0, e = context.length - 2; i <= e; i++) {
    insert2 += context[i].blank(i < e ? countColumn(line.text, 4, context[i + 1].from) - insert2.length : null, i < e);
  }
  return normalizeIndent(insert2, state);
}
function contextNodeForDelete(tree, pos) {
  let node = tree.resolveInner(pos, -1), scan = pos;
  if (isMark(node)) {
    scan = node.from;
    node = node.parent;
  }
  for (let prev; prev = node.childBefore(scan); ) {
    if (isMark(prev)) {
      scan = prev.from;
    } else if (prev.name == "OrderedList" || prev.name == "BulletList") {
      node = prev.lastChild;
      scan = node.to;
    } else {
      break;
    }
  }
  return node;
}
var deleteMarkupBackward = ({ state, dispatch }) => {
  let tree = syntaxTree(state);
  let dont = null, changes = state.changeByRange((range) => {
    let pos = range.from, { doc: doc2 } = state;
    if (range.empty && markdownLanguage.isActiveAt(state, range.from)) {
      let line = doc2.lineAt(pos);
      let context = getContext(contextNodeForDelete(tree, pos), doc2);
      if (context.length) {
        let inner = context[context.length - 1];
        let spaceEnd = inner.to - inner.spaceAfter.length + (inner.spaceAfter ? 1 : 0);
        if (pos - line.from > spaceEnd && !/\S/.test(line.text.slice(spaceEnd, pos - line.from)))
          return {
            range: EditorSelection.cursor(line.from + spaceEnd),
            changes: { from: line.from + spaceEnd, to: pos }
          };
        if (pos - line.from == spaceEnd && (!inner.item || line.from <= inner.item.from || !/\S/.test(line.text.slice(0, inner.to)))) {
          let start = line.from + inner.from;
          if (inner.item && inner.node.from < inner.item.from && /\S/.test(line.text.slice(inner.from, inner.to))) {
            let insert2 = inner.blank(countColumn(line.text, 4, inner.to) - countColumn(line.text, 4, inner.from));
            if (start == line.from)
              insert2 = normalizeIndent(insert2, state);
            return {
              range: EditorSelection.cursor(start + insert2.length),
              changes: { from: start, to: line.from + inner.to, insert: insert2 }
            };
          }
          if (start < pos)
            return { range: EditorSelection.cursor(start), changes: { from: start, to: pos } };
        }
      }
    }
    return dont = { range };
  });
  if (dont)
    return false;
  dispatch(state.update(changes, { scrollIntoView: true, userEvent: "delete" }));
  return true;
};
var markdownKeymap = [
  { key: "Enter", run: insertNewlineContinueMarkup },
  { key: "Backspace", run: deleteMarkupBackward }
];
var htmlNoMatch = /* @__PURE__ */ html({ matchClosingTags: false });
function markdown(config = {}) {
  let { codeLanguages, defaultCodeLanguage, addKeymap = true, base: { parser: parser5 } = commonmarkLanguage, completeHTMLTags = true } = config;
  if (!(parser5 instanceof MarkdownParser))
    throw new RangeError("Base parser provided to `markdown` should be a Markdown parser");
  let extensions = config.extensions ? [config.extensions] : [];
  let support = [htmlNoMatch.support], defaultCode;
  if (defaultCodeLanguage instanceof LanguageSupport) {
    support.push(defaultCodeLanguage.support);
    defaultCode = defaultCodeLanguage.language;
  } else if (defaultCodeLanguage) {
    defaultCode = defaultCodeLanguage;
  }
  let codeParser = codeLanguages || defaultCode ? getCodeParser(codeLanguages, defaultCode) : void 0;
  extensions.push(parseCode({ codeParser, htmlParser: htmlNoMatch.language.parser }));
  if (addKeymap)
    support.push(Prec.high(keymap.of(markdownKeymap)));
  let lang = mkLang(parser5.configure(extensions));
  if (completeHTMLTags)
    support.push(lang.data.of({ autocomplete: htmlTagCompletion }));
  return new LanguageSupport(lang, support);
}
function htmlTagCompletion(context) {
  let { state, pos } = context, m = /<[:\-\.\w\u00b7-\uffff]*$/.exec(state.sliceDoc(pos - 25, pos));
  if (!m)
    return null;
  let tree = syntaxTree(state).resolveInner(pos, -1);
  while (tree && !tree.type.isTop) {
    if (tree.name == "CodeBlock" || tree.name == "FencedCode" || tree.name == "ProcessingInstructionBlock" || tree.name == "CommentBlock" || tree.name == "Link" || tree.name == "Image")
      return null;
    tree = tree.parent;
  }
  return {
    from: pos - m[0].length,
    to: pos,
    options: htmlTagCompletions(),
    validFor: /^<[:\-\.\w\u00b7-\uffff]*$/
  };
}
var _tagCompletions = null;
function htmlTagCompletions() {
  if (_tagCompletions)
    return _tagCompletions;
  let result = htmlCompletionSource(new CompletionContext(EditorState.create({ extensions: htmlNoMatch }), 0, true));
  return _tagCompletions = result ? result.options : [];
}

// src/components/editor/tabeditor.ts
var TabEditor = class {
  constructor(plugin, containerEl, doc2 = "") {
    this.historyTools = [];
    this.formatTools = [];
    this.paragraphTools = [];
    this.insertTools = [];
    this.lastEditTime = 0;
    this.docChange = false;
    this.activeLineHighlighter = ViewPlugin.fromClass(class {
      constructor(view) {
        this.decorations = this.getDeco(view);
      }
      update(update) {
        if (update.docChanged || update.selectionSet)
          this.decorations = this.getDeco(update.view);
      }
      getDeco(view) {
        let lastLineStart = -1, deco = [];
        for (let r of view.state.selection.ranges) {
          let line = view.lineBlockAt(r.head);
          if (line.from > lastLineStart) {
            deco.push(Decoration.line({ class: "cm-active" }).range(line.from));
            lastLineStart = line.from;
          }
        }
        return Decoration.set(deco);
      }
    }, {
      decorations: (v) => v.decorations
    });
    this.basicMDKeymap = [
      {
        key: "Mod-b",
        run: (editor) => {
          editor.dispatch({
            changes: {
              from: editor.state.selection.main.from,
              to: editor.state.selection.main.to,
              insert: getFormattedContent(editor.state.doc.sliceString(editor.state.selection.main.from, editor.state.selection.main.to), "**")
            }
          });
          return true;
        }
      },
      {
        key: "*",
        run: (editor) => {
          editor.dispatch({
            changes: {
              from: editor.state.selection.main.from,
              to: editor.state.selection.main.to,
              insert: "*" + editor.state.doc.sliceString(editor.state.selection.main.from, editor.state.selection.main.to) + "*"
            }
          });
          return true;
        }
      },
      {
        key: "=",
        run: (editor) => {
          editor.dispatch({
            changes: {
              from: editor.state.selection.main.from,
              to: editor.state.selection.main.to,
              insert: "=" + editor.state.doc.sliceString(editor.state.selection.main.from, editor.state.selection.main.to) + "="
            }
          });
          return true;
        }
      },
      {
        key: "Mod-i",
        run: (editor) => {
          editor.dispatch({
            changes: {
              from: editor.state.selection.main.from,
              to: editor.state.selection.main.to,
              insert: getFormattedContent(editor.state.doc.sliceString(editor.state.selection.main.from, editor.state.selection.main.to), "*")
            }
          });
          return true;
        }
      },
      {
        key: "Mod-u",
        run: (editor) => {
          editor.dispatch({
            changes: {
              from: editor.state.selection.main.from,
              to: editor.state.selection.main.to,
              insert: getFormattedContent(editor.state.doc.sliceString(editor.state.selection.main.from, editor.state.selection.main.to), "<u>", "</u>")
            }
          });
          return true;
        }
      },
      {
        key: "Ctrl-l",
        run: (editor) => {
          const { from, to } = editor.state.selection.main;
          const line = editor.state.doc.lineAt(from);
          const text = line.text;
          if (text.length < 2) {
            editor.dispatch({
              changes: { from, to, insert: "- " + text }
            });
            return true;
          }
          if (text.startsWith("- [ ] ")) {
            editor.dispatch({
              changes: { from: line.from, to: line.to, insert: "- [x] " + text.slice(6) }
            });
          } else if (text.startsWith("* [ ] ")) {
            editor.dispatch({
              changes: { from: line.from, to: line.to, insert: "* [x]" + text.slice(6) }
            });
          } else if (text.startsWith("- [x] ")) {
            editor.dispatch({
              changes: { from: line.from, to: line.to, insert: "- " + text.slice(6) }
            });
          } else if (text.startsWith("* [x] ")) {
            editor.dispatch({
              changes: { from: line.from, to: line.to, insert: "* " + text.slice(6) }
            });
          } else if (text.startsWith("* ")) {
            editor.dispatch({
              changes: { from: line.from, to: line.to, insert: "* [ ] " + text.slice(2) }
            });
            return true;
          } else if (text.startsWith("- ")) {
            editor.dispatch({
              changes: { from: line.from, to: line.to, insert: "- [ ] " + text.slice(2) }
            });
            return true;
          } else {
            editor.dispatch({
              changes: { from: line.from, to: line.to, insert: "- " + text }
            });
          }
          return true;
        }
      },
      {
        key: "$",
        run: (editor) => {
          editor.dispatch({
            changes: {
              from: editor.state.selection.main.from,
              to: editor.state.selection.main.to,
              insert: "$" + editor.state.doc.sliceString(editor.state.selection.main.from, editor.state.selection.main.to) + "$"
            }
          });
          return true;
        }
      },
      {
        key: "[",
        run: (editor) => {
          editor.dispatch({
            changes: {
              from: editor.state.selection.main.from,
              to: editor.state.selection.main.to,
              insert: "[" + editor.state.doc.sliceString(editor.state.selection.main.from, editor.state.selection.main.to) + "]"
            }
          });
          editor.dispatch({
            selection: { anchor: editor.state.selection.main.anchor + 1, head: editor.state.selection.main.head + 1 }
          });
          return true;
        }
      },
      {
        key: "{",
        run: (editor) => {
          editor.dispatch({
            changes: {
              from: editor.state.selection.main.from,
              to: editor.state.selection.main.to,
              insert: "{" + editor.state.doc.sliceString(editor.state.selection.main.from, editor.state.selection.main.to) + "}"
            }
          });
          editor.dispatch({
            selection: { anchor: editor.state.selection.main.anchor + 1, head: editor.state.selection.main.head + 1 }
          });
          return true;
        }
      },
      {
        key: "Tab",
        run: (editor) => {
          const selection = editor.state.selection.main;
          const fromLine = editor.state.doc.lineAt(selection.from);
          const toLine = editor.state.doc.lineAt(selection.to);
          let newText = " ".repeat(this.plugin.settings.tabSize) + fromLine.text;
          for (let i = fromLine.number + 1; i <= toLine.number; i++) {
            const line = editor.state.doc.line(i);
            newText += "\n" + " ".repeat(this.plugin.settings.tabSize) + line.text;
          }
          editor.dispatch({
            changes: {
              from: fromLine.from,
              to: toLine.to,
              insert: newText
            }
          });
          if (selection.from === selection.to) {
            editor.dispatch({
              selection: { anchor: selection.from + this.plugin.settings.tabSize, head: selection.to + this.plugin.settings.tabSize }
            });
          }
          return true;
        }
      },
      {
        key: "Shift-Tab",
        run: (editor) => {
          const selection = editor.state.selection.main;
          const fromLine = editor.state.doc.lineAt(selection.from);
          const toLine = editor.state.doc.lineAt(selection.to);
          let newText = fromLine.text.startsWith(" ".repeat(this.plugin.settings.tabSize)) ? fromLine.text.slice(this.plugin.settings.tabSize) : fromLine.text;
          for (let i = fromLine.number + 1; i <= toLine.number; i++) {
            const line = editor.state.doc.line(i);
            if (!line.text.startsWith(" ")) {
              newText += "\n" + line.text;
            } else if (line.text.length - line.text.trimStart().length >= this.plugin.settings.tabSize) {
              newText += "\n" + line.text.slice(this.plugin.settings.tabSize);
            } else {
              newText += "\n" + line.text.trimStart();
            }
          }
          editor.dispatch({
            changes: {
              from: fromLine.from,
              to: toLine.to,
              insert: newText
            }
          });
          return true;
        }
      },
      {
        key: "Ctrl-s",
        run: (editor) => {
          this.plugin.tabsEditorModal.saveEditorData();
          return true;
        }
      }
    ];
    this.plugin = plugin;
    plugin.settings.showToolbar && this.initToolbar(containerEl);
    this.initEditor(containerEl, doc2);
    plugin.settings.showToolbar && this.registerToolbarEvents();
  }
  addButton(icon, tooltip, buttonclass) {
    const button = new import_obsidian8.ButtonComponent(this.editToolbarEl).setIcon(icon).setTooltip(tooltip).setClass("toolbar-button").setClass(buttonclass);
    return button;
  }
  addSplitLine() {
    const splitLine2 = this.editToolbarEl.createEl("span");
    splitLine2.addClass("split-line");
  }
  initToolbar(containerEl) {
    this.editToolbarEl = containerEl.createEl("div");
    this.editToolbarEl.addClass("toolbar");
    this.initHistoryTool();
    this.addSplitLine();
    this.initFormatTool();
    this.addSplitLine();
    this.initParagraphTool();
    this.addSplitLine();
    this.initInsertTool();
  }
  initEditor(containerEl, doc2 = "") {
    this.tabseditorEl = containerEl.createEl("div");
    this.tabseditorEl.addClass("tabs-editor");
    const lastTimeExtension = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        this.lastEditTime = Date.now();
        this.docChange = true;
      }
    });
    this.state = EditorState.create({
      doc: doc2,
      extensions: [
        minimalSetup,
        baseTheme3,
        markdown(),
        html(),
        keymap.of(this.basicMDKeymap),
        this.activeLineHighlighter,
        baseHighlight,
        lastTimeExtension
      ]
    });
    this.view = new EditorView({
      state: this.state,
      parent: this.tabseditorEl,
      extensions: [
        EditorView.lineWrapping
      ]
    });
  }
  initHistoryTool() {
    this.historyTools.push(this.addButton("undo", "Undo (Ctrl+Z)", "undo-button"), this.addButton("redo", "Redo (Ctrl+Shift+Z)", "redo-button"));
  }
  initFormatTool() {
    this.formatTools = [
      this.addButton("bold", "Bold (Ctrl+B)", "bold-button"),
      this.addButton("italic", "Italic (Ctrl+I)", "italic-button"),
      this.addButton("underline", "Underline (Ctrl+U)", "underline-button"),
      this.addButton("strikethrough", "Strike (Ctrl+Shift+S)", "strike-button")
    ];
  }
  initParagraphTool() {
    this.paragraphTools = [
      this.addButton("lucide-list", "Unordered List", "unordered-list-button"),
      this.addButton("lucide-list-ordered", "Ordered List", "ordered-list-button"),
      this.addButton("quote", "Quote", "quote-button")
    ];
  }
  initInsertTool() {
    this.insertTools = [
      this.addButton("code", "Code", "code-button"),
      this.addButton("lucide-quote", "Callout", "callout-button"),
      this.addButton("table", "Table", "table-button")
    ];
  }
  registerToolbarEvents() {
    this.registerHistoryToolEvents();
    this.registerFormatToolEvents();
    this.registerPragraphToolEvents();
    this.registerInsertToolEvents();
  }
  registerHistoryToolEvents() {
    this.historyTools[0].onClick(() => {
      undo({
        state: this.view.state,
        dispatch: this.view.dispatch
      });
    });
    this.historyTools[1].onClick(() => {
      redo({
        state: this.view.state,
        dispatch: this.view.dispatch
      });
    });
  }
  registerFormatToolEvents() {
    this.formatTools[0].onClick(() => {
      const { from, to } = this.view.state.selection.main;
      const fromLine = this.view.state.doc.lineAt(from);
      const toLine = this.view.state.doc.lineAt(to);
      if (fromLine.number === toLine.number) {
        this.view.dispatch({
          changes: {
            from,
            to,
            insert: getFormattedContent(this.view.state.doc.sliceString(this.view.state.selection.main.from, this.view.state.selection.main.to), "**")
          }
        });
      } else {
        let newText = getFormattedContent(this.view.state.doc.sliceString(this.view.state.selection.main.from, fromLine.to), "**");
        for (let i = fromLine.number; i < toLine.number; i++) {
          const line = this.view.state.doc.line(i);
          newText += "\n" + getFormattedContent(line.text, "**");
        }
        newText += "\n" + getFormattedContent(this.view.state.doc.sliceString(toLine.from, this.view.state.selection.main.to), "**");
        this.view.dispatch({
          changes: {
            from,
            to,
            insert: newText
          }
        });
      }
    });
    this.formatTools[1].onClick(() => {
      const { from, to } = this.view.state.selection.main;
      const fromLine = this.view.state.doc.lineAt(from);
      const toLine = this.view.state.doc.lineAt(to);
      if (fromLine.number === toLine.number) {
        this.view.dispatch({
          changes: {
            from,
            to,
            insert: getFormattedContent(this.view.state.doc.sliceString(this.view.state.selection.main.from, this.view.state.selection.main.to), "*")
          }
        });
      } else {
        let newText = getFormattedContent(this.view.state.doc.sliceString(this.view.state.selection.main.from, fromLine.to), "*");
        for (let i = fromLine.number; i < toLine.number; i++) {
          const line = this.view.state.doc.line(i);
          newText += "\n" + getFormattedContent(line.text, "*");
        }
        newText += "\n" + getFormattedContent(this.view.state.doc.sliceString(toLine.from, this.view.state.selection.main.to), "*");
        this.view.dispatch({
          changes: {
            from,
            to,
            insert: newText
          }
        });
      }
    });
    this.formatTools[2].onClick(() => {
      this.view.dispatch({
        changes: {
          from: this.view.state.selection.main.from,
          to: this.view.state.selection.main.to,
          insert: getFormattedContent(this.view.state.doc.sliceString(this.view.state.selection.main.from, this.view.state.selection.main.to), "<u>", "</u>")
        }
      });
    });
    this.formatTools[3].onClick(() => {
      this.view.dispatch({
        changes: {
          from: this.view.state.selection.main.from,
          to: this.view.state.selection.main.to,
          insert: getFormattedContent(this.view.state.doc.sliceString(this.view.state.selection.main.from, this.view.state.selection.main.to), "~~")
        }
      });
    });
  }
  registerPragraphToolEvents() {
    this.paragraphTools[0].onClick(() => {
      const selection = this.view.state.selection.main;
      const fromLine = this.view.state.doc.lineAt(selection.from);
      const toLine = this.view.state.doc.lineAt(selection.to);
      let toList = false;
      for (let i = fromLine.number; i <= toLine.number; i++) {
        const line = this.view.state.doc.line(i);
        if (!line.text.trimStart().startsWith("- ")) {
          toList = true;
          break;
        }
      }
      if (toList) {
        for (let i = fromLine.number; i <= toLine.number; i++) {
          const line = this.view.state.doc.line(i);
          if (line.text.trimStart().startsWith("- ")) {
            continue;
          }
          this.view.dispatch({
            changes: {
              from: line.from,
              to: line.to,
              insert: " ".repeat(line.text.length - line.text.trimStart().length) + "- " + line.text.trimStart()
            }
          });
        }
      } else {
        for (let i = fromLine.number; i <= toLine.number; i++) {
          const line = this.view.state.doc.line(i);
          if (!line.text.trimStart().startsWith("- ")) {
            continue;
          }
          this.view.dispatch({
            changes: {
              from: line.from,
              to: line.to,
              insert: line.text.slice(0, line.text.indexOf("- ")) + line.text.slice(line.text.indexOf("- ") + 2)
            }
          });
        }
      }
    });
    this.paragraphTools[1].onClick(() => {
      const selection = this.view.state.selection.main;
      const fromLine = this.view.state.doc.lineAt(selection.from);
      const toLine = this.view.state.doc.lineAt(selection.to);
      let toList = false;
      const isList = (line) => {
        const split = line.indexOf(". ");
        return split > 0 && !isNaN(parseInt(line.slice(0, split)));
      };
      for (let i = fromLine.number; i <= toLine.number; i++) {
        const line = this.view.state.doc.line(i);
        if (!isList(line.text.trimStart())) {
          toList = true;
          break;
        }
      }
      const nextNum = {};
      let indent = fromLine.text.length - fromLine.text.trimStart().length;
      if (fromLine.number > 1) {
        for (let i = fromLine.number - 1; i > 0; i--) {
          if (!isList(this.view.state.doc.line(i).text.trimStart())) {
            break;
          }
          const text = this.view.state.doc.line(i).text;
          const lastIndent = text.length - text.trimStart().length;
          if (lastIndent > indent) {
            nextNum[lastIndent] = 1;
            continue;
          } else if (lastIndent === indent) {
            const lastNum = parseInt(text.slice(0, text.indexOf(". ")));
            if (!nextNum[indent]) {
              nextNum[indent] = lastNum + 1;
            }
          } else {
            indent = lastIndent;
            nextNum[indent] = parseInt(text.slice(0, text.indexOf(". "))) + 1;
          }
        }
      }
      if (toList) {
        for (let i = fromLine.number; i <= toLine.number; i++) {
          const line = this.view.state.doc.line(i);
          let newline3 = line.text;
          const lineIndent = line.text.length - line.text.trimStart().length;
          if (nextNum[lineIndent] === void 0) {
            nextNum[lineIndent] = 1;
          }
          newline3 = isList(line.text.trimStart()) ? nextNum[lineIndent].toString() + line.text.slice(line.text.indexOf(". ") + 2) : newline3 = nextNum[lineIndent].toString() + ". " + line.text.trimStart();
          nextNum[lineIndent]++;
          for (let indent2 in nextNum) {
            if (parseInt(indent2) > lineIndent) {
              nextNum[indent2] = 1;
            }
          }
          this.view.dispatch({
            changes: {
              from: line.from,
              to: line.to,
              insert: " ".repeat(lineIndent) + newline3
            }
          });
        }
      } else {
        for (let i = fromLine.number; i <= toLine.number; i++) {
          const line = this.view.state.doc.line(i);
          const indent2 = line.text.length - line.text.trimStart().length;
          this.view.dispatch({
            changes: {
              from: line.from,
              to: line.to,
              insert: " ".repeat(indent2) + line.text.slice(line.text.indexOf(". ") + 2)
            }
          });
        }
      }
    });
    this.paragraphTools[2].onClick(() => {
      const selection = this.view.state.selection.main;
      const fromLine = this.view.state.doc.lineAt(selection.from);
      const toLine = this.view.state.doc.lineAt(selection.to);
      let toQuote = false;
      for (let i = fromLine.number; i <= toLine.number; i++) {
        const line = this.view.state.doc.line(i);
        if (!line.text.trimStart().startsWith("> ")) {
          toQuote = true;
          break;
        }
      }
      if (toQuote) {
        for (let i = fromLine.number; i <= toLine.number; i++) {
          const line = this.view.state.doc.line(i);
          this.view.dispatch({
            changes: {
              from: line.from,
              to: line.to,
              insert: "> " + line.text
            }
          });
        }
      } else {
        for (let i = fromLine.number; i <= toLine.number; i++) {
          const line = this.view.state.doc.line(i);
          this.view.dispatch({
            changes: {
              from: line.from,
              to: line.to,
              insert: line.text.slice(2)
            }
          });
        }
      }
    });
  }
  registerInsertToolEvents() {
    this.insertTools[0].onClick(() => {
      const selection = this.view.state.selection.main;
      const newText = createCodeBlock(this.view.state.doc.sliceString(selection.from, selection.to));
      this.view.dispatch({
        changes: {
          from: selection.from,
          to: selection.to,
          insert: newText
        }
      });
    });
    this.insertTools[1].onClick(() => {
      const selection = this.view.state.selection.main;
      const fromLine = this.view.state.doc.lineAt(selection.from);
      const toLine = this.view.state.doc.lineAt(selection.to);
      for (let i = fromLine.number; i <= toLine.number; i++) {
        const line = this.view.state.doc.line(i);
        this.view.dispatch({
          changes: {
            from: line.from,
            to: line.to,
            insert: "> " + line.text
          }
        });
      }
      this.view.dispatch({
        changes: {
          from: fromLine.from,
          to: fromLine.from,
          insert: "> [!NOTE] Title\n"
        }
      });
    });
    this.insertTools[2].onClick(() => {
      const tablemenu = new TableMenu(this);
      const x = this.insertTools[2].buttonEl.getBoundingClientRect().left;
      const y = this.insertTools[2].buttonEl.getBoundingClientRect().bottom;
      tablemenu.showAtPosition({ x, y });
    });
  }
  createEmptyTable(row, col) {
    const table = [];
    table.push(Array(col).fill("   "));
    table.push(Array(col).fill(":-:"));
    for (let i = 0; i < row; i++) {
      const row2 = [];
      for (let j = 0; j < col; j++) {
        row2.push("   ");
      }
      table.push(row2);
    }
    const tableStr = table.map((row2) => "| " + row2.join(" | ") + " |").join("\n");
    const selection = this.view.state.selection;
    const hasSelection2 = selection.ranges.some((range) => range.empty === false);
    if (!hasSelection2) {
      this.view.dispatch({
        changes: {
          from: this.view.state.doc.length,
          to: this.view.state.doc.length,
          insert: "\n\n" + tableStr
        }
      });
      return;
    } else {
      if (this.view.state.doc.lineAt(selection.main.from).from !== selection.main.from) {
        this.view.dispatch({
          changes: {
            from: this.view.state.selection.main.from,
            to: this.view.state.selection.main.to,
            insert: "\n\n" + tableStr
          }
        });
      } else {
        this.view.dispatch({
          changes: {
            from: this.view.state.selection.main.from,
            to: this.view.state.selection.main.to,
            insert: tableStr
          }
        });
      }
    }
  }
};

// src/components/editor/tabeditormodal.ts
var TabsEditorModal = class extends import_obsidian9.Modal {
  constructor(plugin, app) {
    super(app);
    this.app = app;
    this.plugin = plugin;
    this.modalEl.addClass("tabs-editor-modal");
  }
  startEditing(tabs) {
    this.contentEl.empty();
    this.tabs = tabs;
    const newDoc = tabs.split + tabs.tabsNav.navItems[tabs.currentIndex].title + "\n" + tabs.tabsContents.tabcontents[tabs.currentIndex].content.trim();
    this.editor = new TabEditor(this.plugin, this.contentEl, newDoc);
    this.open();
  }
  onOpen() {
    this.timer = setInterval(() => {
      if (this.editor.docChange && this.editor.lastEditTime && Date.now() - this.editor.lastEditTime > 1e4) {
        this.saveEditorData();
      }
    }, 1e3);
  }
  onClose() {
    this.saveEditorData();
    clearInterval(this.timer);
  }
  saveEditorData() {
    var _a2, _b;
    this.editor.docChange = false;
    const newTabs = this.getUpdatedTabsByIndex(this.tabs.currentIndex);
    (_b = this.tabs.activeView) == null ? void 0 : _b.editor.replaceRange(newTabs, { line: this.tabs.sectionInfo.lineStart, ch: 0 }, { line: this.tabs.sectionInfo.lineEnd, ch: (_a2 = this.tabs.activeView) == null ? void 0 : _a2.editor.getLine(this.tabs.sectionInfo.lineEnd).length });
  }
  getUpdatedTabsByIndex(index) {
    const doc2 = this.editor.view.state.doc.toString();
    let newTabs = "";
    for (let i = 0; i < this.tabs.tabsNav.navItems.length; i++) {
      if (i !== index) {
        newTabs += this.tabs.split + this.tabs.tabsNav.navItems[i].title.trim() + "\n" + this.tabs.tabsContents.tabcontents[i].content.trim() + "\n";
      } else {
        newTabs += doc2 + "\n";
        if (doc2.includes("```") || doc2.includes("~~~")) {
          this.tabs.updateBackquote(doc2);
        }
      }
    }
    newTabs = this.tabs.backquote.repeat(this.tabs.backquoteCount) + "tabs\n" + this.tabs.tabsConfig.rawConfig + "\n" + newTabs + this.tabs.backquote.repeat(this.tabs.backquoteCount);
    return newTabs;
  }
};

// src/main.ts
var TabsPlugin = class extends import_obsidian10.Plugin {
  async onload() {
    await this.loadSettings();
    this.addSettingTab(new TabsSettingsTab(this.app, this));
    this.registerMarkdownCodeBlockProcessor("tabs", (source, el, ctx) => {
      new Tabs(source, el, ctx, this.app, this);
    });
    this.registerCommands();
    this.tabsEditorModal = new TabsEditorModal(this, this.app);
    this.app.workspace.onLayoutReady(() => {
      this.settings.autorefreshMarkdownView && this.refreshActiveView();
    });
    this.lastTabsCache = new Map();
    this.lastTabsCache.set("/", 0);
    this.app.workspace.on("active-leaf-change", () => {
      this.lastTabsCache = new Map();
      this.lastTabsCache.set("/", 0);
    });
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  async registerCommands() {
    this.addCommand({
      id: "convert-to-tabs",
      name: "Convert selected text to tabs",
      editorCallback: (editor, view) => {
        const selectedText = editor.getSelection();
        if (selectedText.trim() === "") {
          editor.replaceSelection("```tabs\n" + this.settings.split + this.settings.defaultTabNavItem + "\n" + this.settings.defaultTabContent + "\n```");
        } else if (selectedText.includes("```")) {
          let maxCount = 0;
          for (let i = 0, count2 = 0; i < selectedText.length; i++) {
            if (selectedText[i] === "`") {
              count2++;
              maxCount = Math.max(maxCount, count2);
            } else {
              count2 = 0;
            }
          }
          if (selectedText.startsWith(this.settings.split)) {
            editor.replaceSelection("`".repeat(maxCount + 1) + "tabs\n" + selectedText + "\n" + "`".repeat(maxCount + 1));
          } else {
            editor.replaceSelection("`".repeat(maxCount + 1) + "tabs\n" + this.settings.split + this.settings.defaultTabNavItem + "\n" + selectedText + "\n" + "`".repeat(maxCount + 1));
          }
        } else {
          if (selectedText.startsWith(this.settings.split)) {
            editor.replaceSelection("```tabs\n" + selectedText + "\n```");
          } else {
            editor.replaceSelection("```tabs\n" + this.settings.split + this.settings.defaultTabNavItem + "\n" + selectedText + "\n```");
          }
        }
      }
    });
    this.addCommand({
      id: "refresh-all-tabs",
      name: "Refresh all tabs in opened files",
      callback: () => {
        this.refreshOpenViews();
      }
    });
  }
  refreshOpenViews() {
    try {
      this.app.workspace.getLeavesOfType("markdown").forEach((leaf) => leaf.rebuildView());
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
  refreshActiveView() {
    try {
      const activeView = this.app.workspace.getActiveViewOfType(import_obsidian10.MarkdownView);
      activeView && activeView.leaf.rebuildView();
      console.log(activeView);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});

/* nosourcemap */
