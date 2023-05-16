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
  <h1 class="task-reminder-description">
    <Markdown
      markdown={task.description}
      sourcePath={task.filename ?? "filename was null"}
      {component}
    />
  </h1>
  <span class="task-file" on:click={onOpenFile}>
    <Icon icon="link" />
    {task.filename ?? "filename was null"}
  </span>
  <div class="task-actions">
    <button class="mod-cta" on:click={onDone}>
      <Icon icon="check-small" /> Mark as Done
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
        <option value={i} selected={selectedIndex === i}>{"later.label"}</option> <!-- TODO the string later.label is what is added to the dropdown -->
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
