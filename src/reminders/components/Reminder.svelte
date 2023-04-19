<script lang="ts">
  import type { Component } from "obsidian";
  import Icon from "./Icon.svelte";
  import Markdown from "./Markdown.svelte";
  import type { Task } from "../../Task";

  export let task: Task;
  export let component: Component;
  export let onRemindMeLater: (time: any) => void;
  export let onDone: () => void;
  export let onOpenFile: () => void;
  export let onMute: () => void;
  // Do not set initial value so that svelte can render the placeholder `Remind Me Later`.
  let selectedIndex: number;

  export let laters: Array<number> = [];//Array<Later> = [];

  function remindMeLater() {
    const selected = laters[selectedIndex];
    if (selected == null) {
      return;
    }
    onRemindMeLater(selected); // selected.later
  }
</script>

<main>
  <h1>
    <Markdown
      markdown={task.description}
      sourcePath={task.filename ?? "NO FILE"} 
      {component}
    />
  </h1>
  <span class="task-file" on:click={onOpenFile}>
    <Icon icon="link" />
    {"task.file"}
  </span>
  <div class="task-actions">
    <button class="mod-cta" on:click={onDone}>
      <Icon icon="check-small" /> Mark as Done
    </button>
    <button on:click={onMute}>
      <Icon icon="minus-with-circle" /> Mute
    </button>
    <select
      class="dropdown later-select"
      bind:value={selectedIndex}
      on:change={remindMeLater}
    >
      <!-- placeholder -->
      <option selected disabled hidden>Remind Me Later</option>
      <!-- options -->
      {#each laters as i}
        <option value={i} selected={selectedIndex === i}>{"later.label"}</option>
      {/each}
    </select>
  </div>
</main>

<style>
  main {
    padding: 1em;
    margin: 0 auto;
  }

  .task-actions {
    margin-top: 1rem;
    display: flex;
    gap: 0.5rem;
  }

  .task-file {
    color: var(--text-muted);
    cursor: pointer;
  }

  .task-file:hover {
    color: var(--text-normal);
    text-decoration: underline;
  }

  .later-select {
    font-size: 14px;
  }
</style>
