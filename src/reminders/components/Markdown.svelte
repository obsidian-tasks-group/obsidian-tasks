<script lang="ts">
    import { Component, MarkdownRenderer } from "obsidian";
    import { afterUpdate } from "svelte";
    export let component: Component;
    export let sourcePath: string;
    export let markdown: string;
    let span: HTMLElement;

    afterUpdate(() => {
        span.empty();
        MarkdownRenderer.renderMarkdown(markdown, span, sourcePath, component);
        span.childNodes.forEach((n) => {
            if (n instanceof HTMLElement) {
                n.style.display = "inline";
            }
        });
    });
</script>

<span>
    <span class="reminder-markdown" bind:this={span} />
</span>
