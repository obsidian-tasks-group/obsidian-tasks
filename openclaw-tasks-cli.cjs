#!/usr/bin/env node
"use strict";

process.env.OPENCLAW_PLUGIN_CONFIG = JSON.stringify({
  pluginId: "obsidian-tasks-plugin",
  installedId: "obsidian-tasks-plugin",
  bin: "obsidian-tasks-cli",
  domain: "tasks",
  capabilities: ["settings", "markdown-tasks"],
  commands: ["list", "create", "toggle", "complete"],
});
require("./openclaw-plugin-cli.cjs");
