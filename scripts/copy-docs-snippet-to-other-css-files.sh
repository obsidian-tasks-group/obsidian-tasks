#!/usr/bin/env bash

# Script to simplify keeping the CSS snippet files synchronised.
# 1. Edit 'docs/.obsidian/snippets/publish-simulation.css' first, and testings in Obsidian.
# 2. Run script, which will copy that file to the other CSS files expected to have the same content.

set -euo pipefail

# Allow to be run from any directory:
cd "$(dirname "$0")"
cd ..

main_file=docs/.obsidian/snippets/publish-simulation.css

other_files="
    docs/publish.css
    contributing/publish.css
    contributing/.obsidian/snippets/publish-simulation.css"

for file in $other_files ; do
    cp -v $main_file $file

    # Until Publish supports Obsidian 1.13 callout colour syntax, convert the colours
    # for callouts on Publish back to the old syntax.
    # From:
    #   --callout-color: rgb(255, 23, 68);
    # back to:
    #   --callout-color: 255, 23, 68;
    if [[ "$file" == *publish.css ]]; then
        sed -E -i '' 's/(--callout-color:[[:space:]]*)rgb\((.*)\);/\1\2;/g' "$file"
    fi
done
