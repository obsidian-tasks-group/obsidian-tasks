# Embed File in to Note

## Scenario: Embedding whole files

- **Given** a note with a whole embedded file in, and that file has a completed task, and I am in Reading view
- **When** I toggle to **un-complete a completed task in the embedded file**
- **Then** The task is correctly un-checked and its done date removed
  - but it is not redrawn in the Reading view
  - and I have to make another edit to the embedded file, for the embedded content to be refreshed in the outer note

### The embedded file

These tasks are embedded from file [[Embed File in to Note - File to Embed]].

![[Embed File in to Note - File to Embed]]

- [ ] #task Figure out whether this is a Tasks bug or an Obsidian bug
