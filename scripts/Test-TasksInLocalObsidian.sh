#!/bin/bash

# Copy the built plugin in to the Tasks-Demo sample vault.
#
# This is an intentionally basic script, for easy running within GitHub Actions.
#
# NOTE: It must be run from the root of the project, and for now, it
#       only supports copying to the local resources/sample_vaults/Tasks-Demo/ vault.
#
# It copies the files, unlike scripts/Test-TasksInLocalObsidian.ps1 which
# creates short cuts or links, meaning the result of the PS1 script can only be
# run on the developer machine.

set -euo pipefail

# Should be run from the vault directory
cp main.js manifest.json styles.css \
    resources/sample_vaults/Tasks-Demo/.obsidian/plugins/obsidian-tasks-plugin
