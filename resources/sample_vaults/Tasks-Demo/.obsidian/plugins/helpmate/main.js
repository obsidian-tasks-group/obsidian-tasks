"use strict";
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

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => HelpMatePlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian6 = require("obsidian");

// src/UI/settingsTab/SettingsTab.tsx
var import_obsidian = require("obsidian");

// src/settings.ts
var DEFAULT_SETTINGS = {
  acknowledgedWebUse: false,
  includeObsidianHelp: true,
  obsidianHelpUrl: "https://help.obsidian.md",
  includeObsidianDevHelp: true,
  obsidianDevHelpUrl: "https://docs.obsidian.md/Home",
  includeHelpMateHelp: true,
  userResources: "",
  forceIframe: false
};

// src/resources.ts
var isValidUrl = (url) => {
  const urlPattern = new RegExp(
    "^(https?:\\/\\/)?((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|((\\d{1,3}\\.){3}\\d{1,3}))(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*(\\?[;&a-z\\d%_.~+=-]*)?(\\#[-a-z\\d_]*)?$",
    "i"
  );
  return !!urlPattern.test(url.trim());
};
var getPluginHelpList = (plugin) => {
  const initialHelpList = Object.values(plugin.app.plugins.manifests).filter((p3) => p3.helpUrl && p3.id !== plugin.APP_ID).map((p3) => {
    var _a;
    return { id: p3.id, name: p3.name, url: (_a = p3.helpUrl) != null ? _a : "" };
  });
  const customPluginList = plugin.settings.userResources.split("\n");
  customPluginList.forEach((p3) => {
    if (p3.trim() !== "") {
      const [name, url] = p3.split("|");
      if (name && url && isValidUrl(url))
        initialHelpList.push({ id: name, name, url });
    }
  });
  const themeList = Object.values(plugin.app.customCss.themes).filter((p3) => p3.helpUrl).map(
    (p3) => ({
      id: p3.name,
      name: p3.name,
      url: p3.helpUrl ? p3.helpUrl : ""
    })
  );
  themeList.forEach((p3) => {
    if (p3.name && p3.url && isValidUrl(p3.url))
      initialHelpList.push({ id: p3.name, name: p3.name, url: p3.url });
  });
  const pattern = /\[helpUrl:(.+?)\|(.+?)\]/;
  Array.from(plugin.app.customCss.csscache.entries()).forEach(([_2, value]) => {
    const matches = value.match(pattern);
    if (matches) {
      const resourceName = matches[1].trim();
      const url = matches[2].trim();
      if (resourceName && url && isValidUrl(url))
        initialHelpList.push({ id: resourceName, name: resourceName, url });
    }
  });
  const sortedHelpForPluginList = initialHelpList.sort(
    (a3, b3) => a3.name.localeCompare(b3.name)
  );
  if (plugin.settings.includeObsidianDevHelp && plugin.settings.obsidianDevHelpUrl && isValidUrl(plugin.settings.obsidianDevHelpUrl))
    sortedHelpForPluginList.unshift({
      id: "obsidian-dev",
      name: "Obsidian Developer Help",
      url: plugin.settings.obsidianDevHelpUrl
    });
  if (plugin.settings.includeObsidianHelp && plugin.settings.obsidianHelpUrl && isValidUrl(plugin.settings.obsidianHelpUrl))
    sortedHelpForPluginList.unshift({
      id: "obsidian",
      name: "Obsidian Help",
      url: plugin.settings.obsidianHelpUrl
    });
  if (plugin.settings.includeHelpMateHelp)
    sortedHelpForPluginList.push({
      id: "helpmate",
      name: "HelpMate Help",
      url: "https://tfthacker.com/HelpMate"
    });
  return sortedHelpForPluginList;
};

// src/commands.ts
var initializeCommands = (plugin) => {
  plugin.addCommand({
    id: "open-helpmate",
    name: "Open sidepane",
    callback: () => plugin.activateView()
  });
  addHelpMateResourcesToCommandPalette(plugin);
};
var addHelpMateResourcesToCommandPalette = (plugin) => {
  for (const command of Object.values(plugin.app.commands.commands))
    if (command.helpmate)
      plugin.app.commands.removeCommand(command.id);
  getPluginHelpList(plugin).forEach((help) => {
    plugin.addCommand({
      id: help.id,
      name: `view: ${help.name}`,
      callback: () => plugin.activateView(help.url),
      helpmate: true
    });
  });
};

// src/UI/settingsTab/SettingsTab.tsx
var HelpMateSettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian.Setting(containerEl).setName(`Enable Obsidian's help in HelpMate`).setDesc(`Show Obsidian's native help.`).addToggle((cb) => {
      cb.setValue(this.plugin.settings.includeObsidianHelp);
      cb.onChange(async (value) => {
        this.plugin.settings.includeObsidianHelp = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName(`Obsidian Help URL`).setDesc(
      `URL to use for Obsidian help. This can be changed to a different URL for other languages.`
    ).addText(
      (text) => text.setValue(this.plugin.settings.obsidianHelpUrl).onChange(async (value) => {
        if (value.trim() === "")
          value = DEFAULT_SETTINGS.obsidianHelpUrl;
        this.plugin.settings.obsidianHelpUrl = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName(`Enable Obsidian's help for developers in HelpMate`).setDesc(`Show Obsidian's developer help.`).addToggle((cb) => {
      cb.setValue(this.plugin.settings.includeObsidianDevHelp);
      cb.onChange(async (value) => {
        this.plugin.settings.includeObsidianDevHelp = value;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian.Setting(containerEl).setName(`Obsidian developer help URL`).setDesc(`URL to use for Obsidian's Developer help.`).addText(
      (text) => text.setValue(this.plugin.settings.obsidianDevHelpUrl).onChange(async (value) => {
        if (value.trim() === "")
          value = DEFAULT_SETTINGS.obsidianDevHelpUrl;
        this.plugin.settings.obsidianDevHelpUrl = value;
        await this.plugin.saveSettings();
      })
    );
    new import_obsidian.Setting(containerEl).setName(`Enable HelpMate's help in HelpMate`).setDesc(`Show the deocumentation for HelpMate.`).addToggle((cb) => {
      cb.setValue(this.plugin.settings.includeHelpMateHelp);
      cb.onChange(async (value) => {
        this.plugin.settings.includeHelpMateHelp = value;
        await this.plugin.saveSettings();
      });
    });
    containerEl.createEl("div", { text: "List of custom help resources" }).addClass("setting-item");
    containerEl.createEl("div", {
      text: `Add custom help resources to be displayed in HelpMate. Input a list of URLs, one per line. 
							 using the following format: "Title | URL". Title is the name of the resources, and URL is the the website. For example: `
    }).addClass("setting-item-description");
    containerEl.createEl("div", { text: `Example Help | https://help.example.com` }).addClass("setting-item-description");
    const helpUrlList = new import_obsidian.TextAreaComponent(containerEl);
    helpUrlList.inputEl.style.marginTop = "12px";
    helpUrlList.inputEl.style.width = "100%";
    helpUrlList.inputEl.style.height = "32vh";
    helpUrlList.setPlaceholder("Title | URL");
    helpUrlList.setValue(this.plugin.settings.userResources).onChange(async (value) => {
      this.plugin.settings.userResources = value;
      addHelpMateResourcesToCommandPalette(this.plugin);
      await this.plugin.saveSettings();
    });
    new import_obsidian.Setting(containerEl).setName(`Use IFRAME`).setDesc(
      `On some devices the browser component of HelpMate may not display properly. This setting forces use of IFRAME 
						 which is more compatible across devices, but has less functionality. Only use this if you are having issues. Mobile
						 devices always use IFRAME, since this is the only supported option on mobile. So this setting does not apply to mobile.
						 (This setting will require a restart of Obsidian to take effect).`
    ).addToggle((cb) => {
      cb.setValue(this.plugin.settings.forceIframe);
      cb.onChange(async (value) => {
        this.plugin.settings.forceIframe = value;
        await this.plugin.saveSettings();
      });
    });
  }
};

// src/UI/sidepane/HelpMateView.tsx
var import_obsidian5 = require("obsidian");

// node_modules/preact/dist/preact.module.js
var n;
var l;
var u;
var t;
var i;
var o;
var r;
var f;
var e;
var c = {};
var s = [];
var a = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
var h = Array.isArray;
function v(n2, l3) {
  for (var u4 in l3)
    n2[u4] = l3[u4];
  return n2;
}
function p(n2) {
  var l3 = n2.parentNode;
  l3 && l3.removeChild(n2);
}
function y(l3, u4, t3) {
  var i4, o3, r3, f4 = {};
  for (r3 in u4)
    "key" == r3 ? i4 = u4[r3] : "ref" == r3 ? o3 = u4[r3] : f4[r3] = u4[r3];
  if (arguments.length > 2 && (f4.children = arguments.length > 3 ? n.call(arguments, 2) : t3), "function" == typeof l3 && null != l3.defaultProps)
    for (r3 in l3.defaultProps)
      void 0 === f4[r3] && (f4[r3] = l3.defaultProps[r3]);
  return d(l3, f4, i4, o3, null);
}
function d(n2, t3, i4, o3, r3) {
  var f4 = { type: n2, props: t3, key: i4, ref: o3, __k: null, __: null, __b: 0, __e: null, __d: void 0, __c: null, constructor: void 0, __v: null == r3 ? ++u : r3, __i: -1, __u: 0 };
  return null == r3 && null != l.vnode && l.vnode(f4), f4;
}
function g(n2) {
  return n2.children;
}
function b(n2, l3) {
  this.props = n2, this.context = l3;
}
function m(n2, l3) {
  if (null == l3)
    return n2.__ ? m(n2.__, n2.__i + 1) : null;
  for (var u4; l3 < n2.__k.length; l3++)
    if (null != (u4 = n2.__k[l3]) && null != u4.__e)
      return u4.__e;
  return "function" == typeof n2.type ? m(n2) : null;
}
function k(n2) {
  var l3, u4;
  if (null != (n2 = n2.__) && null != n2.__c) {
    for (n2.__e = n2.__c.base = null, l3 = 0; l3 < n2.__k.length; l3++)
      if (null != (u4 = n2.__k[l3]) && null != u4.__e) {
        n2.__e = n2.__c.base = u4.__e;
        break;
      }
    return k(n2);
  }
}
function w(n2) {
  (!n2.__d && (n2.__d = true) && i.push(n2) && !x.__r++ || o !== l.debounceRendering) && ((o = l.debounceRendering) || r)(x);
}
function x() {
  var n2, u4, t3, o3, r3, e3, c3, s3, a3;
  for (i.sort(f); n2 = i.shift(); )
    n2.__d && (u4 = i.length, o3 = void 0, e3 = (r3 = (t3 = n2).__v).__e, s3 = [], a3 = [], (c3 = t3.__P) && ((o3 = v({}, r3)).__v = r3.__v + 1, l.vnode && l.vnode(o3), L(c3, o3, r3, t3.__n, void 0 !== c3.ownerSVGElement, 32 & r3.__u ? [e3] : null, s3, null == e3 ? m(r3) : e3, !!(32 & r3.__u), a3), o3.__.__k[o3.__i] = o3, M(s3, o3, a3), o3.__e != e3 && k(o3)), i.length > u4 && i.sort(f));
  x.__r = 0;
}
function C(n2, l3, u4, t3, i4, o3, r3, f4, e3, a3, h3) {
  var v3, p3, y2, d3, _2, g3 = t3 && t3.__k || s, b3 = l3.length;
  for (u4.__d = e3, P(u4, l3, g3), e3 = u4.__d, v3 = 0; v3 < b3; v3++)
    null != (y2 = u4.__k[v3]) && "boolean" != typeof y2 && "function" != typeof y2 && (p3 = -1 === y2.__i ? c : g3[y2.__i] || c, y2.__i = v3, L(n2, y2, p3, i4, o3, r3, f4, e3, a3, h3), d3 = y2.__e, y2.ref && p3.ref != y2.ref && (p3.ref && z(p3.ref, null, y2), h3.push(y2.ref, y2.__c || d3, y2)), null == _2 && null != d3 && (_2 = d3), 65536 & y2.__u || p3.__k === y2.__k ? e3 = S(y2, e3, n2) : "function" == typeof y2.type && void 0 !== y2.__d ? e3 = y2.__d : d3 && (e3 = d3.nextSibling), y2.__d = void 0, y2.__u &= -196609);
  u4.__d = e3, u4.__e = _2;
}
function P(n2, l3, u4) {
  var t3, i4, o3, r3, f4, e3 = l3.length, c3 = u4.length, s3 = c3, a3 = 0;
  for (n2.__k = [], t3 = 0; t3 < e3; t3++)
    null != (i4 = n2.__k[t3] = null == (i4 = l3[t3]) || "boolean" == typeof i4 || "function" == typeof i4 ? null : "string" == typeof i4 || "number" == typeof i4 || "bigint" == typeof i4 || i4.constructor == String ? d(null, i4, null, null, i4) : h(i4) ? d(g, { children: i4 }, null, null, null) : i4.__b > 0 ? d(i4.type, i4.props, i4.key, i4.ref ? i4.ref : null, i4.__v) : i4) ? (i4.__ = n2, i4.__b = n2.__b + 1, f4 = H(i4, u4, r3 = t3 + a3, s3), i4.__i = f4, o3 = null, -1 !== f4 && (s3--, (o3 = u4[f4]) && (o3.__u |= 131072)), null == o3 || null === o3.__v ? (-1 == f4 && a3--, "function" != typeof i4.type && (i4.__u |= 65536)) : f4 !== r3 && (f4 === r3 + 1 ? a3++ : f4 > r3 ? s3 > e3 - r3 ? a3 += f4 - r3 : a3-- : a3 = f4 < r3 && f4 == r3 - 1 ? f4 - r3 : 0, f4 !== t3 + a3 && (i4.__u |= 65536))) : (o3 = u4[t3]) && null == o3.key && o3.__e && (o3.__e == n2.__d && (n2.__d = m(o3)), N(o3, o3, false), u4[t3] = null, s3--);
  if (s3)
    for (t3 = 0; t3 < c3; t3++)
      null != (o3 = u4[t3]) && 0 == (131072 & o3.__u) && (o3.__e == n2.__d && (n2.__d = m(o3)), N(o3, o3));
}
function S(n2, l3, u4) {
  var t3, i4;
  if ("function" == typeof n2.type) {
    for (t3 = n2.__k, i4 = 0; t3 && i4 < t3.length; i4++)
      t3[i4] && (t3[i4].__ = n2, l3 = S(t3[i4], l3, u4));
    return l3;
  }
  return n2.__e != l3 && (u4.insertBefore(n2.__e, l3 || null), l3 = n2.__e), l3 && l3.nextSibling;
}
function H(n2, l3, u4, t3) {
  var i4 = n2.key, o3 = n2.type, r3 = u4 - 1, f4 = u4 + 1, e3 = l3[u4];
  if (null === e3 || e3 && i4 == e3.key && o3 === e3.type)
    return u4;
  if (t3 > (null != e3 && 0 == (131072 & e3.__u) ? 1 : 0))
    for (; r3 >= 0 || f4 < l3.length; ) {
      if (r3 >= 0) {
        if ((e3 = l3[r3]) && 0 == (131072 & e3.__u) && i4 == e3.key && o3 === e3.type)
          return r3;
        r3--;
      }
      if (f4 < l3.length) {
        if ((e3 = l3[f4]) && 0 == (131072 & e3.__u) && i4 == e3.key && o3 === e3.type)
          return f4;
        f4++;
      }
    }
  return -1;
}
function I(n2, l3, u4) {
  "-" === l3[0] ? n2.setProperty(l3, null == u4 ? "" : u4) : n2[l3] = null == u4 ? "" : "number" != typeof u4 || a.test(l3) ? u4 : u4 + "px";
}
function T(n2, l3, u4, t3, i4) {
  var o3;
  n:
    if ("style" === l3)
      if ("string" == typeof u4)
        n2.style.cssText = u4;
      else {
        if ("string" == typeof t3 && (n2.style.cssText = t3 = ""), t3)
          for (l3 in t3)
            u4 && l3 in u4 || I(n2.style, l3, "");
        if (u4)
          for (l3 in u4)
            t3 && u4[l3] === t3[l3] || I(n2.style, l3, u4[l3]);
      }
    else if ("o" === l3[0] && "n" === l3[1])
      o3 = l3 !== (l3 = l3.replace(/(PointerCapture)$|Capture$/, "$1")), l3 = l3.toLowerCase() in n2 ? l3.toLowerCase().slice(2) : l3.slice(2), n2.l || (n2.l = {}), n2.l[l3 + o3] = u4, u4 ? t3 ? u4.u = t3.u : (u4.u = Date.now(), n2.addEventListener(l3, o3 ? D : A, o3)) : n2.removeEventListener(l3, o3 ? D : A, o3);
    else {
      if (i4)
        l3 = l3.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
      else if ("width" !== l3 && "height" !== l3 && "href" !== l3 && "list" !== l3 && "form" !== l3 && "tabIndex" !== l3 && "download" !== l3 && "rowSpan" !== l3 && "colSpan" !== l3 && "role" !== l3 && l3 in n2)
        try {
          n2[l3] = null == u4 ? "" : u4;
          break n;
        } catch (n3) {
        }
      "function" == typeof u4 || (null == u4 || false === u4 && "-" !== l3[4] ? n2.removeAttribute(l3) : n2.setAttribute(l3, u4));
    }
}
function A(n2) {
  var u4 = this.l[n2.type + false];
  if (n2.t) {
    if (n2.t <= u4.u)
      return;
  } else
    n2.t = Date.now();
  return u4(l.event ? l.event(n2) : n2);
}
function D(n2) {
  return this.l[n2.type + true](l.event ? l.event(n2) : n2);
}
function L(n2, u4, t3, i4, o3, r3, f4, e3, c3, s3) {
  var a3, p3, y2, d3, _2, m3, k3, w3, x2, P2, S2, $, H2, I2, T2, A2 = u4.type;
  if (void 0 !== u4.constructor)
    return null;
  128 & t3.__u && (c3 = !!(32 & t3.__u), r3 = [e3 = u4.__e = t3.__e]), (a3 = l.__b) && a3(u4);
  n:
    if ("function" == typeof A2)
      try {
        if (w3 = u4.props, x2 = (a3 = A2.contextType) && i4[a3.__c], P2 = a3 ? x2 ? x2.props.value : a3.__ : i4, t3.__c ? k3 = (p3 = u4.__c = t3.__c).__ = p3.__E : ("prototype" in A2 && A2.prototype.render ? u4.__c = p3 = new A2(w3, P2) : (u4.__c = p3 = new b(w3, P2), p3.constructor = A2, p3.render = O), x2 && x2.sub(p3), p3.props = w3, p3.state || (p3.state = {}), p3.context = P2, p3.__n = i4, y2 = p3.__d = true, p3.__h = [], p3._sb = []), null == p3.__s && (p3.__s = p3.state), null != A2.getDerivedStateFromProps && (p3.__s == p3.state && (p3.__s = v({}, p3.__s)), v(p3.__s, A2.getDerivedStateFromProps(w3, p3.__s))), d3 = p3.props, _2 = p3.state, p3.__v = u4, y2)
          null == A2.getDerivedStateFromProps && null != p3.componentWillMount && p3.componentWillMount(), null != p3.componentDidMount && p3.__h.push(p3.componentDidMount);
        else {
          if (null == A2.getDerivedStateFromProps && w3 !== d3 && null != p3.componentWillReceiveProps && p3.componentWillReceiveProps(w3, P2), !p3.__e && (null != p3.shouldComponentUpdate && false === p3.shouldComponentUpdate(w3, p3.__s, P2) || u4.__v === t3.__v)) {
            for (u4.__v !== t3.__v && (p3.props = w3, p3.state = p3.__s, p3.__d = false), u4.__e = t3.__e, u4.__k = t3.__k, u4.__k.forEach(function(n3) {
              n3 && (n3.__ = u4);
            }), S2 = 0; S2 < p3._sb.length; S2++)
              p3.__h.push(p3._sb[S2]);
            p3._sb = [], p3.__h.length && f4.push(p3);
            break n;
          }
          null != p3.componentWillUpdate && p3.componentWillUpdate(w3, p3.__s, P2), null != p3.componentDidUpdate && p3.__h.push(function() {
            p3.componentDidUpdate(d3, _2, m3);
          });
        }
        if (p3.context = P2, p3.props = w3, p3.__P = n2, p3.__e = false, $ = l.__r, H2 = 0, "prototype" in A2 && A2.prototype.render) {
          for (p3.state = p3.__s, p3.__d = false, $ && $(u4), a3 = p3.render(p3.props, p3.state, p3.context), I2 = 0; I2 < p3._sb.length; I2++)
            p3.__h.push(p3._sb[I2]);
          p3._sb = [];
        } else
          do {
            p3.__d = false, $ && $(u4), a3 = p3.render(p3.props, p3.state, p3.context), p3.state = p3.__s;
          } while (p3.__d && ++H2 < 25);
        p3.state = p3.__s, null != p3.getChildContext && (i4 = v(v({}, i4), p3.getChildContext())), y2 || null == p3.getSnapshotBeforeUpdate || (m3 = p3.getSnapshotBeforeUpdate(d3, _2)), C(n2, h(T2 = null != a3 && a3.type === g && null == a3.key ? a3.props.children : a3) ? T2 : [T2], u4, t3, i4, o3, r3, f4, e3, c3, s3), p3.base = u4.__e, u4.__u &= -161, p3.__h.length && f4.push(p3), k3 && (p3.__E = p3.__ = null);
      } catch (n3) {
        u4.__v = null, c3 || null != r3 ? (u4.__e = e3, u4.__u |= c3 ? 160 : 32, r3[r3.indexOf(e3)] = null) : (u4.__e = t3.__e, u4.__k = t3.__k), l.__e(n3, u4, t3);
      }
    else
      null == r3 && u4.__v === t3.__v ? (u4.__k = t3.__k, u4.__e = t3.__e) : u4.__e = j(t3.__e, u4, t3, i4, o3, r3, f4, c3, s3);
  (a3 = l.diffed) && a3(u4);
}
function M(n2, u4, t3) {
  u4.__d = void 0;
  for (var i4 = 0; i4 < t3.length; i4++)
    z(t3[i4], t3[++i4], t3[++i4]);
  l.__c && l.__c(u4, n2), n2.some(function(u5) {
    try {
      n2 = u5.__h, u5.__h = [], n2.some(function(n3) {
        n3.call(u5);
      });
    } catch (n3) {
      l.__e(n3, u5.__v);
    }
  });
}
function j(l3, u4, t3, i4, o3, r3, f4, e3, s3) {
  var a3, v3, y2, d3, _2, g3, b3, k3 = t3.props, w3 = u4.props, x2 = u4.type;
  if ("svg" === x2 && (o3 = true), null != r3) {
    for (a3 = 0; a3 < r3.length; a3++)
      if ((_2 = r3[a3]) && "setAttribute" in _2 == !!x2 && (x2 ? _2.localName === x2 : 3 === _2.nodeType)) {
        l3 = _2, r3[a3] = null;
        break;
      }
  }
  if (null == l3) {
    if (null === x2)
      return document.createTextNode(w3);
    l3 = o3 ? document.createElementNS("http://www.w3.org/2000/svg", x2) : document.createElement(x2, w3.is && w3), r3 = null, e3 = false;
  }
  if (null === x2)
    k3 === w3 || e3 && l3.data === w3 || (l3.data = w3);
  else {
    if (r3 = r3 && n.call(l3.childNodes), k3 = t3.props || c, !e3 && null != r3)
      for (k3 = {}, a3 = 0; a3 < l3.attributes.length; a3++)
        k3[(_2 = l3.attributes[a3]).name] = _2.value;
    for (a3 in k3)
      _2 = k3[a3], "children" == a3 || ("dangerouslySetInnerHTML" == a3 ? y2 = _2 : "key" === a3 || a3 in w3 || T(l3, a3, null, _2, o3));
    for (a3 in w3)
      _2 = w3[a3], "children" == a3 ? d3 = _2 : "dangerouslySetInnerHTML" == a3 ? v3 = _2 : "value" == a3 ? g3 = _2 : "checked" == a3 ? b3 = _2 : "key" === a3 || e3 && "function" != typeof _2 || k3[a3] === _2 || T(l3, a3, _2, k3[a3], o3);
    if (v3)
      e3 || y2 && (v3.__html === y2.__html || v3.__html === l3.innerHTML) || (l3.innerHTML = v3.__html), u4.__k = [];
    else if (y2 && (l3.innerHTML = ""), C(l3, h(d3) ? d3 : [d3], u4, t3, i4, o3 && "foreignObject" !== x2, r3, f4, r3 ? r3[0] : t3.__k && m(t3, 0), e3, s3), null != r3)
      for (a3 = r3.length; a3--; )
        null != r3[a3] && p(r3[a3]);
    e3 || (a3 = "value", void 0 !== g3 && (g3 !== l3[a3] || "progress" === x2 && !g3 || "option" === x2 && g3 !== k3[a3]) && T(l3, a3, g3, k3[a3], false), a3 = "checked", void 0 !== b3 && b3 !== l3[a3] && T(l3, a3, b3, k3[a3], false));
  }
  return l3;
}
function z(n2, u4, t3) {
  try {
    "function" == typeof n2 ? n2(u4) : n2.current = u4;
  } catch (n3) {
    l.__e(n3, t3);
  }
}
function N(n2, u4, t3) {
  var i4, o3;
  if (l.unmount && l.unmount(n2), (i4 = n2.ref) && (i4.current && i4.current !== n2.__e || z(i4, null, u4)), null != (i4 = n2.__c)) {
    if (i4.componentWillUnmount)
      try {
        i4.componentWillUnmount();
      } catch (n3) {
        l.__e(n3, u4);
      }
    i4.base = i4.__P = null, n2.__c = void 0;
  }
  if (i4 = n2.__k)
    for (o3 = 0; o3 < i4.length; o3++)
      i4[o3] && N(i4[o3], u4, t3 || "function" != typeof n2.type);
  t3 || null == n2.__e || p(n2.__e), n2.__ = n2.__e = n2.__d = void 0;
}
function O(n2, l3, u4) {
  return this.constructor(n2, u4);
}
function q(u4, t3, i4) {
  var o3, r3, f4, e3;
  l.__ && l.__(u4, t3), r3 = (o3 = "function" == typeof i4) ? null : i4 && i4.__k || t3.__k, f4 = [], e3 = [], L(t3, u4 = (!o3 && i4 || t3).__k = y(g, null, [u4]), r3 || c, c, void 0 !== t3.ownerSVGElement, !o3 && i4 ? [i4] : r3 ? null : t3.firstChild ? n.call(t3.childNodes) : null, f4, !o3 && i4 ? i4 : r3 ? r3.__e : t3.firstChild, o3, e3), M(f4, u4, e3);
}
n = s.slice, l = { __e: function(n2, l3, u4, t3) {
  for (var i4, o3, r3; l3 = l3.__; )
    if ((i4 = l3.__c) && !i4.__)
      try {
        if ((o3 = i4.constructor) && null != o3.getDerivedStateFromError && (i4.setState(o3.getDerivedStateFromError(n2)), r3 = i4.__d), null != i4.componentDidCatch && (i4.componentDidCatch(n2, t3 || {}), r3 = i4.__d), r3)
          return i4.__E = i4;
      } catch (l4) {
        n2 = l4;
      }
  throw n2;
} }, u = 0, t = function(n2) {
  return null != n2 && null == n2.constructor;
}, b.prototype.setState = function(n2, l3) {
  var u4;
  u4 = null != this.__s && this.__s !== this.state ? this.__s : this.__s = v({}, this.state), "function" == typeof n2 && (n2 = n2(v({}, u4), this.props)), n2 && v(u4, n2), null != n2 && this.__v && (l3 && this._sb.push(l3), w(this));
}, b.prototype.forceUpdate = function(n2) {
  this.__v && (this.__e = true, n2 && this.__h.push(n2), w(this));
}, b.prototype.render = g, i = [], r = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, f = function(n2, l3) {
  return n2.__v.__b - l3.__v.__b;
}, x.__r = 0, e = 0;

// src/HelpMateAPI.ts
var HelpMateAPI = class {
  constructor(plugin) {
    this.enableDebugging = {
      webViewBrowser: false,
      iFrameBrowser: true
    };
    this.log = (logDescription, ...outputs) => {
      console.log("HelpMate: " + logDescription, outputs);
    };
    this.activateSidePane = async (url) => {
      url ? await this.plugin.activateView(url) : await this.plugin.activateView();
    };
    this.getPluginHelpList = () => {
      return getPluginHelpList(this.plugin);
    };
    this.plugin = plugin;
    this.settings = plugin.settings;
  }
};

// node_modules/preact/hooks/dist/hooks.module.js
var t2;
var r2;
var u2;
var i2;
var o2 = 0;
var f2 = [];
var c2 = [];
var e2 = l.__b;
var a2 = l.__r;
var v2 = l.diffed;
var l2 = l.__c;
var m2 = l.unmount;
function d2(t3, u4) {
  l.__h && l.__h(r2, t3, o2 || u4), o2 = 0;
  var i4 = r2.__H || (r2.__H = { __: [], __h: [] });
  return t3 >= i4.__.length && i4.__.push({ __V: c2 }), i4.__[t3];
}
function h2(n2) {
  return o2 = 1, s2(B, n2);
}
function s2(n2, u4, i4) {
  var o3 = d2(t2++, 2);
  if (o3.t = n2, !o3.__c && (o3.__ = [i4 ? i4(u4) : B(void 0, u4), function(n3) {
    var t3 = o3.__N ? o3.__N[0] : o3.__[0], r3 = o3.t(t3, n3);
    t3 !== r3 && (o3.__N = [r3, o3.__[1]], o3.__c.setState({}));
  }], o3.__c = r2, !r2.u)) {
    var f4 = function(n3, t3, r3) {
      if (!o3.__c.__H)
        return true;
      var u5 = o3.__c.__H.__.filter(function(n4) {
        return n4.__c;
      });
      if (u5.every(function(n4) {
        return !n4.__N;
      }))
        return !c3 || c3.call(this, n3, t3, r3);
      var i5 = false;
      return u5.forEach(function(n4) {
        if (n4.__N) {
          var t4 = n4.__[0];
          n4.__ = n4.__N, n4.__N = void 0, t4 !== n4.__[0] && (i5 = true);
        }
      }), !(!i5 && o3.__c.props === n3) && (!c3 || c3.call(this, n3, t3, r3));
    };
    r2.u = true;
    var c3 = r2.shouldComponentUpdate, e3 = r2.componentWillUpdate;
    r2.componentWillUpdate = function(n3, t3, r3) {
      if (this.__e) {
        var u5 = c3;
        c3 = void 0, f4(n3, t3, r3), c3 = u5;
      }
      e3 && e3.call(this, n3, t3, r3);
    }, r2.shouldComponentUpdate = f4;
  }
  return o3.__N || o3.__;
}
function p2(u4, i4) {
  var o3 = d2(t2++, 3);
  !l.__s && z2(o3.__H, i4) && (o3.__ = u4, o3.i = i4, r2.__H.__h.push(o3));
}
function _(n2) {
  return o2 = 5, F(function() {
    return { current: n2 };
  }, []);
}
function F(n2, r3) {
  var u4 = d2(t2++, 7);
  return z2(u4.__H, r3) ? (u4.__V = n2(), u4.i = r3, u4.__h = n2, u4.__V) : u4.__;
}
function b2() {
  for (var t3; t3 = f2.shift(); )
    if (t3.__P && t3.__H)
      try {
        t3.__H.__h.forEach(k2), t3.__H.__h.forEach(w2), t3.__H.__h = [];
      } catch (r3) {
        t3.__H.__h = [], l.__e(r3, t3.__v);
      }
}
l.__b = function(n2) {
  r2 = null, e2 && e2(n2);
}, l.__r = function(n2) {
  a2 && a2(n2), t2 = 0;
  var i4 = (r2 = n2.__c).__H;
  i4 && (u2 === r2 ? (i4.__h = [], r2.__h = [], i4.__.forEach(function(n3) {
    n3.__N && (n3.__ = n3.__N), n3.__V = c2, n3.__N = n3.i = void 0;
  })) : (i4.__h.forEach(k2), i4.__h.forEach(w2), i4.__h = [], t2 = 0)), u2 = r2;
}, l.diffed = function(t3) {
  v2 && v2(t3);
  var o3 = t3.__c;
  o3 && o3.__H && (o3.__H.__h.length && (1 !== f2.push(o3) && i2 === l.requestAnimationFrame || ((i2 = l.requestAnimationFrame) || j2)(b2)), o3.__H.__.forEach(function(n2) {
    n2.i && (n2.__H = n2.i), n2.__V !== c2 && (n2.__ = n2.__V), n2.i = void 0, n2.__V = c2;
  })), u2 = r2 = null;
}, l.__c = function(t3, r3) {
  r3.some(function(t4) {
    try {
      t4.__h.forEach(k2), t4.__h = t4.__h.filter(function(n2) {
        return !n2.__ || w2(n2);
      });
    } catch (u4) {
      r3.some(function(n2) {
        n2.__h && (n2.__h = []);
      }), r3 = [], l.__e(u4, t4.__v);
    }
  }), l2 && l2(t3, r3);
}, l.unmount = function(t3) {
  m2 && m2(t3);
  var r3, u4 = t3.__c;
  u4 && u4.__H && (u4.__H.__.forEach(function(n2) {
    try {
      k2(n2);
    } catch (n3) {
      r3 = n3;
    }
  }), u4.__H = void 0, r3 && l.__e(r3, u4.__v));
};
var g2 = "function" == typeof requestAnimationFrame;
function j2(n2) {
  var t3, r3 = function() {
    clearTimeout(u4), g2 && cancelAnimationFrame(t3), setTimeout(n2);
  }, u4 = setTimeout(r3, 100);
  g2 && (t3 = requestAnimationFrame(r3));
}
function k2(n2) {
  var t3 = r2, u4 = n2.__c;
  "function" == typeof u4 && (n2.__c = void 0, u4()), r2 = t3;
}
function w2(n2) {
  var t3 = r2;
  n2.__c = n2.__(), r2 = t3;
}
function z2(n2, t3) {
  return !n2 || n2.length !== t3.length || t3.some(function(t4, r3) {
    return t4 !== n2[r3];
  });
}
function B(n2, t3) {
  return "function" == typeof t3 ? t3(n2) : t3;
}

// node_modules/preact/jsx-runtime/dist/jsxRuntime.module.js
var f3 = 0;
var i3 = Array.isArray;
function u3(e3, t3, n2, o3, i4, u4) {
  var a3, c3, p3 = {};
  for (c3 in t3)
    "ref" == c3 ? a3 = t3[c3] : p3[c3] = t3[c3];
  var l3 = { type: e3, props: p3, key: n2, ref: a3, __k: null, __: null, __b: 0, __e: null, __d: void 0, __c: null, constructor: void 0, __v: --f3, __i: -1, __u: 0, __source: i4, __self: u4 };
  if ("function" == typeof e3 && (a3 = e3.defaultProps))
    for (c3 in a3)
      void 0 === p3[c3] && (p3[c3] = a3[c3]);
  return l.vnode && l.vnode(l3), l3;
}

// src/UI/sidepane/HelpSourceButton.tsx
var HelpSourceButton = ({
  setSelectedUrl,
  plugin
}) => {
  const [isOpen, setIsOpen] = h2(false);
  const menuRef = _(null);
  const helpUrls = getPluginHelpList(plugin);
  const handleButtonClick = () => {
    setIsOpen(!isOpen);
  };
  const handleOptionClick = (index) => {
    setIsOpen(false);
    setSelectedUrl(helpUrls[index].url);
  };
  p2(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return /* @__PURE__ */ u3("div", { className: "hm-source-button", ref: menuRef, children: [
    /* @__PURE__ */ u3("button", { onClick: handleButtonClick, class: "hm-view-browser-toolbar-button", children: /* @__PURE__ */ u3(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        width: "24",
        height: "24",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "2",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        class: "lucide lucide-bookmark-check",
        children: [
          /* @__PURE__ */ u3("path", { d: "m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z" }),
          /* @__PURE__ */ u3("path", { d: "m9 10 2 2 4-4" })
        ]
      }
    ) }),
    isOpen && /* @__PURE__ */ u3("ul", { className: "hm-source-button-dropdown-menu hm-button-dropdown-menu", children: helpUrls.map((url, index) => /* @__PURE__ */ u3(
      "li",
      {
        onClick: () => {
          handleOptionClick(index);
        },
        class: "hm-source-button-list-item",
        children: url.name
      },
      index
    )) })
  ] });
};
var HelpSourceButton_default = HelpSourceButton;

// src/UI/sidepane/HelpMoreButton.tsx
var HelpMoreButton = ({
  currentUrl,
  plugin
}) => {
  const [isOpen, setIsOpen] = h2(false);
  const menuRef = _(null);
  const commands = [
    {
      name: "Open site in browser",
      index: 0,
      command: () => {
        window.open(currentUrl);
      }
    },
    {
      name: "Code block from site",
      index: 1,
      command: async () => {
        const newFile = "```helpmate\nurl: " + currentUrl + "\nheight: 800px\ntoolbar: false\n```\n\n\n";
        const randomInt = Math.floor(Math.random() * (1e4 - 1e3 + 1)) + 100;
        const fileName = `codeblock ${randomInt}.md`;
        await plugin.app.vault.create(fileName, newFile).then(async (file) => {
          await plugin.app.workspace.getLeaf().openFile(file);
        });
      }
    },
    {
      name: "Plugin settings",
      index: 2,
      command: () => {
        const settings = plugin.app.setting;
        settings.open();
        settings.openTabById(plugin.APP_ID);
      }
    }
  ];
  const handleOptionClick = (index) => {
    setIsOpen(false);
    commands[index].command();
  };
  const handleButtonClick = () => {
    setIsOpen(!isOpen);
  };
  p2(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return /* @__PURE__ */ u3("div", { className: "hm-more-button", ref: menuRef, children: [
    /* @__PURE__ */ u3("button", { onClick: handleButtonClick, class: "hm-view-browser-toolbar-button", children: /* @__PURE__ */ u3(
      "svg",
      {
        xmlns: "http://www.w3.org/2000/svg",
        width: "24",
        height: "24",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "2",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        class: "lucide lucide-cog",
        children: [
          /* @__PURE__ */ u3("path", { d: "M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" }),
          /* @__PURE__ */ u3("path", { d: "M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" }),
          /* @__PURE__ */ u3("path", { d: "M12 2v2" }),
          /* @__PURE__ */ u3("path", { d: "M12 22v-2" }),
          /* @__PURE__ */ u3("path", { d: "m17 20.66-1-1.73" }),
          /* @__PURE__ */ u3("path", { d: "M11 10.27 7 3.34" }),
          /* @__PURE__ */ u3("path", { d: "m20.66 17-1.73-1" }),
          /* @__PURE__ */ u3("path", { d: "m3.34 7 1.73 1" }),
          /* @__PURE__ */ u3("path", { d: "M14 12h8" }),
          /* @__PURE__ */ u3("path", { d: "M2 12h2" }),
          /* @__PURE__ */ u3("path", { d: "m20.66 7-1.73 1" }),
          /* @__PURE__ */ u3("path", { d: "m3.34 17 1.73-1" }),
          /* @__PURE__ */ u3("path", { d: "m17 3.34-1 1.73" }),
          /* @__PURE__ */ u3("path", { d: "m11 13.73-4 6.93" })
        ]
      }
    ) }),
    isOpen && /* @__PURE__ */ u3("ul", { className: "hm-more-button-dropdown-menu hm-button-dropdown-menu", children: commands.map((command) => /* @__PURE__ */ u3(
      "li",
      {
        onClick: () => {
          handleOptionClick(command.index);
        },
        class: "hm-source-button-list-item",
        children: command.name
      },
      command.index
    )) })
  ] });
};
var HelpMoreButton_default = HelpMoreButton;

// src/UI/browsers/WebViewBrowser.tsx
var import_obsidian2 = require("obsidian");
var iconHeight = 18;
var WebViewBrowser = ({
  urlAddress,
  plugin,
  showToolbar = true
}) => {
  const [url, setUrl] = h2(urlAddress || "");
  const api = plugin.HELPMATE_API;
  const debug = api.enableDebugging.webViewBrowser;
  const webviewRef = _(null);
  const executeWebViewMethod = (method, logMessage) => {
    if (webviewRef.current) {
      debug && api.log(`WebViewBrowser: ${logMessage}`, webviewRef.current.getURL());
      webviewRef.current[method]();
    }
  };
  const goBack = () => {
    executeWebViewMethod("goBack", "goBack");
  };
  const goForward = () => {
    executeWebViewMethod("goForward", "goForward");
  };
  const navigateTo = () => {
    var _a;
    debug && api.log("WebViewBrowser: navigateTo", url);
    if (!(url.startsWith("http://") || url.startsWith("https://"))) {
      const newUrl = `https://${url}`;
      if (isValidUrl(newUrl))
        setUrl(newUrl);
    }
    if (isValidUrl(url))
      (_a = webviewRef.current) == null ? void 0 : _a.loadURL(url);
    else
      new import_obsidian2.Notice("Invalid URL");
  };
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      navigateTo();
    }
  };
  const handleChange = (event) => {
    setUrl(event.target.value);
  };
  p2(() => {
    var _a;
    const handleDomReady = () => {
      debug && api.log("WebViewBrowser: dom-ready", webviewRef.current);
      const addEventListener = (eventName) => {
        var _a2;
        (_a2 = webviewRef.current) == null ? void 0 : _a2.addEventListener(eventName, () => {
          var _a3, _b, _c;
          debug && api.log(`WebViewBrowser: ${eventName}`, (_a3 = webviewRef.current) == null ? void 0 : _a3.getURL());
          setUrl((_c = (_b = webviewRef.current) == null ? void 0 : _b.getURL()) != null ? _c : "");
        });
      };
      addEventListener("did-navigate-in-page");
      addEventListener("did-navigate");
    };
    (_a = webviewRef.current) == null ? void 0 : _a.addEventListener("dom-ready", handleDomReady);
    return () => {
      var _a2;
      return (_a2 = webviewRef.current) == null ? void 0 : _a2.removeEventListener("dom-ready", handleDomReady);
    };
  }, []);
  return /* @__PURE__ */ u3("div", { class: "hm-view-browser", children: [
    showToolbar && /* @__PURE__ */ u3("div", { class: "hm-view-browser-toolbar", children: [
      /* @__PURE__ */ u3(HelpSourceButton_default, { setSelectedUrl: setUrl, plugin }),
      /* @__PURE__ */ u3(
        "input",
        {
          type: "text",
          value: url,
          onChange: handleChange,
          onKeyUp: handleKeyPress,
          placeholder: "Enter URL",
          class: "hm-view-browser-toolbar-input"
        }
      ),
      /* @__PURE__ */ u3(
        "button",
        {
          onClick: navigateTo,
          class: "hm-view-browser-toolbar-button",
          "aria-label": "Navigate To",
          children: /* @__PURE__ */ u3(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              width: "24",
              height: "24",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              "stroke-width": "2",
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
              class: "lucide lucide-arrow-right-square",
              children: [
                /* @__PURE__ */ u3("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2" }),
                /* @__PURE__ */ u3("path", { d: "M8 12h8" }),
                /* @__PURE__ */ u3("path", { d: "m12 16 4-4-4-4" })
              ]
            }
          )
        }
      ),
      /* @__PURE__ */ u3(
        "button",
        {
          onClick: goBack,
          class: "hm-view-browser-toolbar-button",
          "aria-label": "Go Back",
          children: /* @__PURE__ */ u3(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              width: iconHeight,
              height: iconHeight,
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              "stroke-width": "2",
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
              class: "lucide lucide-chevron-left",
              children: /* @__PURE__ */ u3("path", { d: "m15 18-6-6 6-6" })
            }
          )
        }
      ),
      /* @__PURE__ */ u3(
        "button",
        {
          onClick: goForward,
          class: "hm-view-browser-toolbar-button",
          "aria-label": "Go Forward",
          children: /* @__PURE__ */ u3(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              width: iconHeight,
              height: iconHeight,
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              "stroke-width": "2",
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
              class: "lucide lucide-chevron-right",
              children: /* @__PURE__ */ u3("path", { d: "m9 18 6-6-6-6" })
            }
          )
        }
      ),
      /* @__PURE__ */ u3(HelpMoreButton_default, { currentUrl: url, plugin })
    ] }),
    /* @__PURE__ */ u3(
      "webview",
      {
        ref: webviewRef,
        src: url,
        class: "hm-view-browser-webframe",
        enableblinkfeatures: "AutoDarkMode"
      }
    )
  ] });
};
var WebViewBrowser_default = WebViewBrowser;

// src/UI/browsers/IFrameBrowser.tsx
var import_obsidian3 = require("obsidian");
var IFrameBrowser = ({
  urlAddress,
  plugin,
  showToolbar = true
}) => {
  const api = plugin.HELPMATE_API;
  const debug = api.enableDebugging.iFrameBrowser;
  const iframeRef = _(null);
  const [inputUrl, setInputUrl] = h2(urlAddress || "");
  const [iframeUrl, setIframeUrl] = h2(urlAddress || "");
  const updateUrl = (url) => {
    let newUrl = url;
    if (!(url.startsWith("http://") || url.startsWith("https://"))) {
      newUrl = `https://${url}`;
    }
    if (isValidUrl(newUrl)) {
      setInputUrl(newUrl);
      setIframeUrl(newUrl);
    } else {
      new import_obsidian3.Notice("Invalid URL");
    }
  };
  const navigateTo = () => {
    if (iframeRef.current) {
      debug && api.log("IFrameBrowser: navigateTo", inputUrl);
      updateUrl(inputUrl);
    }
  };
  const handleKeyPress = (e3) => {
    if (e3.key === "Enter") {
      const newUrl = e3.target.value;
      updateUrl(newUrl);
    }
  };
  return /* @__PURE__ */ u3("div", { class: "hm-view-browser", children: [
    showToolbar && /* @__PURE__ */ u3("div", { class: "hm-view-browser-toolbar", children: [
      /* @__PURE__ */ u3(HelpSourceButton_default, { setSelectedUrl: updateUrl, plugin }),
      /* @__PURE__ */ u3(
        "input",
        {
          class: "hm-view-browser-toolbar-input",
          type: "text",
          value: inputUrl,
          onKeyPress: handleKeyPress,
          onChange: (e3) => {
            setInputUrl(e3.target.value);
          },
          placeholder: "Enter URL"
        }
      ),
      /* @__PURE__ */ u3(
        "button",
        {
          onClick: navigateTo,
          class: "hm-view-browser-toolbar-button",
          "aria-label": "Navigate To",
          children: /* @__PURE__ */ u3(
            "svg",
            {
              xmlns: "http://www.w3.org/2000/svg",
              width: "24",
              height: "24",
              viewBox: "0 0 24 24",
              fill: "none",
              stroke: "currentColor",
              "stroke-width": "2",
              "stroke-linecap": "round",
              "stroke-linejoin": "round",
              class: "lucide lucide-arrow-right-square",
              children: [
                /* @__PURE__ */ u3("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2" }),
                /* @__PURE__ */ u3("path", { d: "M8 12h8" }),
                /* @__PURE__ */ u3("path", { d: "m12 16 4-4-4-4" })
              ]
            }
          )
        }
      ),
      /* @__PURE__ */ u3(HelpMoreButton_default, { currentUrl: iframeUrl, plugin })
    ] }),
    /* @__PURE__ */ u3("iframe", { ref: iframeRef, src: iframeUrl, class: "hm-view-browser-iframe" })
  ] });
};
var IFrameBrowser_default = IFrameBrowser;

// src/UI/browsers/EmbeddedBrowser.tsx
var import_obsidian4 = require("obsidian");

// src/UI/sidepane/AcknowledgeWebUse.tsx
var AcknowledgeWebUse = ({
  onAcknowledge,
  plugin
}) => {
  const [isChecked, setIsChecked] = h2(false);
  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };
  const handleButtonClick = () => {
    if (isChecked) {
      plugin.settings.acknowledgedWebUse = true;
      void plugin.saveSettings();
      onAcknowledge(true);
    } else {
      alert("Please check the Acknowledge checkbox to proceed");
    }
  };
  return /* @__PURE__ */ u3("div", { class: "hm-acknowledge-message", children: [
    /* @__PURE__ */ u3("p", { children: [
      " ",
      "HelpMate displays the help content from websites in the sidepane. Please keep in mind that this help content is coming from the web and you are responsible to verify that the sites are safe."
    ] }),
    /* @__PURE__ */ u3("p", { children: "Please check the Acknowledge checkbox to proceed." }),
    /* @__PURE__ */ u3("input", { type: "checkbox", checked: isChecked, onChange: handleCheckboxChange }),
    /* @__PURE__ */ u3("label", { children: "Acknowledge this message" }),
    /* @__PURE__ */ u3("br", {}),
    /* @__PURE__ */ u3("br", {}),
    /* @__PURE__ */ u3("button", { onClick: handleButtonClick, children: "Proceed" })
  ] });
};
var AcknowledgeWebUse_default = AcknowledgeWebUse;

// src/UI/browsers/EmbeddedBrowser.tsx
var EmbeddedBrowser = ({
  urlAddress,
  plugin,
  showToolbar = true
}) => {
  const browseMode = plugin.settings.forceIframe ? "IFrame" /* iFrame */ : import_obsidian4.Platform.isDesktop ? "WebView" /* webView */ : "IFrame" /* iFrame */;
  const [isAcknowledged, setIsAcknowledged] = h2(
    plugin.settings.acknowledgedWebUse
  );
  if (!isAcknowledged) {
    return /* @__PURE__ */ u3(AcknowledgeWebUse_default, { onAcknowledge: setIsAcknowledged, plugin });
  } else {
    return browseMode === "WebView" /* webView */ ? /* @__PURE__ */ u3(
      WebViewBrowser_default,
      {
        urlAddress,
        plugin,
        showToolbar
      }
    ) : /* @__PURE__ */ u3(
      IFrameBrowser_default,
      {
        urlAddress,
        plugin,
        showToolbar
      }
    );
  }
};
var EmbeddedBrowser_default = EmbeddedBrowser;

// src/UI/sidepane/HelpMateViewContainer.tsx
var HelpMateViewContainer = ({
  plugin,
  initialUrlAddress
}) => {
  const helpForPluginsList = getPluginHelpList(plugin);
  const url = initialUrlAddress && initialUrlAddress !== "" ? initialUrlAddress : helpForPluginsList[0].url;
  return /* @__PURE__ */ u3("div", { style: { height: "100%", width: "100%" }, class: "hm-view-container", children: /* @__PURE__ */ u3(EmbeddedBrowser_default, { urlAddress: url, plugin }) });
};
var HelpMateViewContainer_default = HelpMateViewContainer;

// src/UI/sidepane/HelpMateView.tsx
var VIEW_TYPE_HELPMATE = "help-mate";
var HelpMateView = class extends import_obsidian5.ItemView {
  constructor(leaf, helpMatePlugin) {
    super(leaf);
    this.plugin = helpMatePlugin;
  }
  async onOpen() {
    const container = this.containerEl.children[1];
    const browserDiv = container.createDiv();
    browserDiv.style.height = "100%";
    browserDiv.style.width = "100%";
    browserDiv.classList.add("hm-view-parent");
    q(/* @__PURE__ */ u3(HelpMateViewContainer_default, { plugin: this.plugin }), browserDiv);
    return Promise.resolve();
  }
  updateView(url) {
    const container = this.containerEl.children[1];
    const browserDiv = container.querySelector(".hm-view-parent");
    if (browserDiv) {
      q(null, browserDiv);
      q(
        /* @__PURE__ */ u3(HelpMateViewContainer_default, { plugin: this.plugin, initialUrlAddress: url }),
        browserDiv
      );
    }
  }
  getIcon() {
    return this.plugin.icon;
  }
  getViewType() {
    return VIEW_TYPE_HELPMATE;
  }
  getDisplayText() {
    return "HelpMate";
  }
  async onClose() {
  }
};

// src/UI/codeblock.tsx
function createCodeBlock(plugin, source, element, _2) {
  let controlHeight = 400;
  let controlUrl = getPluginHelpList(plugin)[0].url;
  let controlToolbar = true;
  const lines = source.split("\n");
  lines.forEach((line) => {
    const [key, value] = line.split(": ");
    switch (key) {
      case "url":
        controlUrl = value;
        break;
      case "height":
        controlHeight = parseInt(value);
        break;
      case "toolbar":
        controlToolbar = value.toLowerCase() === "true";
        break;
      default:
        break;
    }
  });
  q(
    /* @__PURE__ */ u3("div", { style: { height: controlHeight }, children: /* @__PURE__ */ u3(
      EmbeddedBrowser_default,
      {
        plugin,
        urlAddress: controlUrl,
        showToolbar: controlToolbar
      }
    ) }),
    element
  );
}

// src/UI/settingsTab/integrationWithSettings.ts
var integrateIntoSettingsForm = (plugin, setting, manifest, _2) => {
  const extendedManifest = manifest;
  if (extendedManifest.helpUrl) {
    setting.addExtraButton((btn) => {
      btn.setIcon(plugin.icon).setTooltip("HelpMate").onClick(async () => {
        await plugin.activateView();
        await plugin.activateView(extendedManifest.helpUrl);
        const div = document.querySelector(".modal-close-button");
        if (div)
          div.click();
      });
    });
  }
};
var integrationWithSettings_default = integrateIntoSettingsForm;

// src/main.ts
var HelpMatePlugin = class extends import_obsidian6.Plugin {
  constructor() {
    super(...arguments);
    this.APP_NAME = this.manifest.name;
    this.APP_ID = this.manifest.id;
    this.HELPMATE_API = new HelpMateAPI(this);
    this.settings = DEFAULT_SETTINGS;
    this.icon = "life-buoy";
  }
  async onload() {
    console.log("loading " + this.APP_NAME);
    await this.loadSettings();
    this.addSettingTab(new HelpMateSettingTab(this.app, this));
    this.registerView(VIEW_TYPE_HELPMATE, (leaf) => new HelpMateView(leaf, this));
    window.helpMateAPI = this.HELPMATE_API;
    this.registerMarkdownCodeBlockProcessor("helpmate", (source, el, ctx) => {
      createCodeBlock(this, source, el, ctx);
    });
    this.showRibbonButton();
    initializeCommands(this);
    this.registerEvent(
      // based on plugin from https://github.com/pjeby/hotkey-helper
      this.app.workspace.on(
        "plugin-settings:plugin-control",
        (setting, manifest, enabled) => {
          if (manifest.helpUrl) {
            integrationWithSettings_default(this, setting, manifest, enabled);
          }
        }
      )
    );
  }
  async activateView(url) {
    const { workspace } = this.app;
    let leaf = null;
    const leaves = workspace.getLeavesOfType(VIEW_TYPE_HELPMATE);
    if (leaves.length > 0) {
      leaf = leaves[0];
      if (url)
        leaves[0].view.updateView(url);
    } else {
      const leaf2 = workspace.getRightLeaf(false);
      await leaf2.setViewState({ type: VIEW_TYPE_HELPMATE, active: true });
    }
    if (leaf)
      workspace.revealLeaf(leaf);
  }
  showRibbonButton() {
    this.ribbonIcon = this.addRibbonIcon(this.icon, "HelpMate", async () => {
      await this.activateView();
    });
  }
  onunload() {
    console.log("unloading " + this.APP_NAME);
    try {
      delete window.helpMateAPI;
    } catch (error) {
      console.log(error);
    }
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
};
