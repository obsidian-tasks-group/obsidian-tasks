'use strict';

var obsidian = require('obsidian');

/*! *****************************************************************************
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

class CommentsSettingTab extends obsidian.PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    display() {
        let { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('h2', { text: 'Comments Plugin Settings' });
        new obsidian.Setting(containerEl)
            .setName('Default text color')
            .setDesc("Change from the style.css in the package folder")
            .addText(text => text
            .setPlaceholder("....")
            .setValue('')
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.DEFAULT_COLOR = value;
        })));
        new obsidian.Setting(containerEl)
            .setName('Default background color')
            .setDesc('Change from the style.css in the package folder')
            .addText(text => text
            .setPlaceholder("....")
            .setValue('')
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.DEFAULT_BACKGROUND_COLOR = value;
        })));
        new obsidian.Setting(containerEl)
            .setName('Hide Comment Plugin Ribbon')
            .setDesc('After changing this setting unload then reload the plugin for the change to take place')
            .addToggle((toggle) => {
            toggle.setValue(this.plugin.settings.SHOW_RIBBON);
            toggle.onChange((value) => __awaiter(this, void 0, void 0, function* () {
                this.plugin.settings.SHOW_RIBBON = value;
                yield this.plugin.saveSettings();
            }));
        });
    }
}

const VIEW_TYPE_OB_COMMENTS = 'ob_comments';
const DEFAULT_SETTINGS = {
    SHOW_RIBBON: true,
    DEFAULT_COLOR: '#b30202',
    DEFAULT_BACKGROUND_COLOR: '#FFDE5C'
};

// Delay passed function for specified timeout
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction() {
        let context = this;
        let args = arguments;
        let later = function () {
            timeout = null;
            if (!immediate)
                func.apply(context, args);
        };
        let callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = +setTimeout(later, wait);
        if (callNow)
            func.apply(context, args);
    };
}

class CommentsView extends obsidian.ItemView {
    constructor(leaf) {
        super(leaf);
        this.redraw_debounced = debounce(function () {
            this.redraw();
        }, 1000);
        this.redraw = this.redraw.bind(this);
        this.redraw_debounced = this.redraw_debounced.bind(this);
        this.containerEl = this.containerEl;
        this.registerEvent(this.app.workspace.on("layout-ready", this.redraw_debounced));
        this.registerEvent(this.app.workspace.on("file-open", this.redraw_debounced));
        this.registerEvent(this.app.workspace.on("quick-preview", this.redraw_debounced));
        this.registerEvent(this.app.vault.on("delete", this.redraw));
    }
    getViewType() {
        return VIEW_TYPE_OB_COMMENTS;
    }
    getDisplayText() {
        return "Comments";
    }
    getIcon() {
        return "lines-of-text";
    }
    onClose() {
        return Promise.resolve();
    }
    onOpen() {
        return __awaiter(this, void 0, void 0, function* () {
            this.redraw();
        });
    }
    redraw() {
        return __awaiter(this, void 0, void 0, function* () {
            let active_leaf = this.app.workspace.getActiveFile();
            this.containerEl.empty();
            this.containerEl.setAttribute('class', 'comment-panel');
            // Condition if current leaf is present
            if (active_leaf) {
                let page_content = yield this.app.vault.read(active_leaf);
                // Convert into HTML element 
                let page_html = document.createElement('Div');
                page_html.innerHTML = page_content;
                // Use HTML parser to find the desired elements
                // Get all .ob-comment elements
                let comment_list = page_html.querySelectorAll("label[class='ob-comment']");
                let El = document.createElement("h3");
                El.setAttribute('class', 'comment-count');
                this.containerEl.appendChild(El);
                El.setText('Comments: ' + comment_list.length);
                for (let i = 0; i < comment_list.length; i++) {
                    let div = document.createElement('Div');
                    div.setAttribute('class', 'comment-pannel-bubble');
                    let labelEl = document.createElement("label");
                    let pEl = document.createElement("p");
                    pEl.setAttribute('class', 'comment-pannel-p1');
                    // Check if user specified a title for this comment
                    if (!comment_list[i].title || comment_list[i].title === "") {
                        // if no title specified, use the line number
                        pEl.setText('--');
                    }
                    else {
                        // Use the given title
                        pEl.setText(comment_list[i].title);
                    }
                    labelEl.appendChild(pEl);
                    let inputEl = document.createElement("input");
                    inputEl.setAttribute('type', 'checkbox');
                    inputEl.setAttribute('style', 'display:none;');
                    labelEl.appendChild(inputEl);
                    pEl = document.createElement("p");
                    pEl.setAttribute('class', 'comment-pannel-p2');
                    pEl.setText(comment_list[i].innerHTML.substring(0, comment_list[i].innerHTML.length - comment_list[i].querySelector('input[type=checkbox]+span').outerHTML.length - comment_list[i].querySelector('input[type=checkbox]').outerHTML.length - 1));
                    labelEl.appendChild(pEl);
                    div.appendChild(labelEl);
                    labelEl = document.createElement("label");
                    inputEl = document.createElement("input");
                    inputEl.setAttribute('type', 'checkbox');
                    inputEl.setAttribute('style', 'display:none;');
                    labelEl.appendChild(inputEl);
                    pEl = document.createElement("p");
                    pEl.setAttribute('class', 'comment-pannel-p3');
                    // Check if user specified additional style for this note
                    if (!comment_list[i].style.cssText) {
                        // if no style was assigned, use default
                        pEl.setText(comment_list[i].querySelector('input[type=checkbox]+span').innerHTML);
                    }
                    else {
                        // Add the new style
                        pEl.setText(comment_list[i].querySelector('input[type=checkbox]+span').innerHTML);
                        pEl.setAttribute('style', comment_list[i].style.cssText);
                    }
                    labelEl.appendChild(pEl);
                    div.appendChild(labelEl);
                    this.containerEl.appendChild(div);
                }
            }
        });
    }
}

class CommentsPlugin extends obsidian.Plugin {
    constructor() {
        super(...arguments);
        this.showPanel = function () {
            this.app.workspace.getRightLeaf(true)
                .setViewState({ type: VIEW_TYPE_OB_COMMENTS });
        };
    }
    onload() {
        return __awaiter(this, void 0, void 0, function* () {
            // Load message
            yield this.loadSettings();
            console.log('Loaded Comments Plugin');
            this.addSettingTab(new CommentsSettingTab(this.app, this));
            this.positionComment = this.positionComment.bind(this);
            this.registerEvent(this.app.workspace.on("click", this.positionComment));
            this.registerView(VIEW_TYPE_OB_COMMENTS, (leaf) => this.view = new CommentsView(leaf));
            this.addCommand({
                id: "show-comments-panel",
                name: "Open Comments Panel",
                callback: () => this.showPanel()
            });
            this.addCommand({
                id: "add-comment",
                name: "Add Comment",
                callback: () => this.addComment()
            });
            if (this.settings.SHOW_RIBBON) {
                this.addRibbonIcon('lines-of-text', "Show Comments Panel", (e) => this.showPanel());
            }
        });
    }
    positionComment() {
        return __awaiter(this, void 0, void 0, function* () {
            let ob_elements = document.querySelectorAll('.ob-comment');
            for (let el = 0; el < ob_elements.length; el++) {
                let elements = ob_elements[el].querySelector('input');
                if (elements) {
                    elements.addEventListener('change', function () {
                        if (this.checked) {
                            let elSpan = ob_elements[el].querySelector('span');
                            if (elSpan) {
                                elSpan.style.setProperty('position', 'fixed');
                                elSpan.style.setProperty('top', `${Math.round(ob_elements[el].getBoundingClientRect().top)}px`);
                                elSpan.style.setProperty('right', '0px');
                            }
                        }
                    });
                }
            }
        });
    }
    onunload() {
        console.log('unloading plugin');
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
    addComment() {
        let editor = this.getEditor();
        const lines = this.getLines(editor);
        if (!lines)
            return;
        this.setLines(editor, ['<label class="ob-comment" title="" style=""> ' + lines + ' <input type="checkbox"> <span style=""> Comment </span></label>']);
    }
    getEditor() {
        let view = this.app.workspace.getActiveViewOfType(obsidian.MarkdownView);
        if (!view)
            return;
        let cm = view.sourceMode.cmEditor;
        return cm;
    }
    getLines(editor) {
        if (!editor)
            return;
        const selection = editor.getSelection();
        return [selection];
    }
    setLines(editor, lines) {
        const selection = editor.getSelection();
        if (selection != "") {
            editor.replaceSelection(lines.join("\n"));
        }
        else {
            editor.setValue(lines.join("\n"));
        }
    }
}

module.exports = CommentsPlugin;
//# sourceMappingURL=main.js.map
