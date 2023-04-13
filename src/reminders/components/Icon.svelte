<script lang="ts">
    import { setIcon } from "obsidian";
    import { onMount } from "svelte";
    export let icon = "";
    export let size = 16;
    let span: HTMLElement;

    onMount(() => {
        setIcon(span, icon, size);
    });
</script>

<span class="icon" bind:this={span} />

<style>
    .icon {
        vertical-align: middle;
    }
</style>
