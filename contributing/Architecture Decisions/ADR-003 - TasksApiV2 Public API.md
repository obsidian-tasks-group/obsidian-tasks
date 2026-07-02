---
publish: true
---

# ADR-003 - TasksApiV2 Public API

## Status

**PROPOSED** - Decision drafted on 2026-07-01

## Context

The Tasks plugin currently exposes `apiV1`, implemented as a TypeScript interface plus factory function. It is not a runtime class hierarchy.

`apiV1` exposes modal helpers and task-line transformations:

- `createTaskLineModal()` returns a markdown task line string and does not write to the vault.
- `editTaskLineModal(taskLine)` returns an edited markdown task line string and does not write to the vault.
- `executeToggleTaskDoneCommand(line, path)` returns an updated task line string.

This API is useful for integrations such as QuickAdd, where the other plugin chooses the destination file and insertion behavior. It does not expose a stable task data model, query execution, or vault-writing task creation and editing.

The internal plugin already has capabilities that a V2 API can reuse:

- Cached task access through the plugin cache.
- Query parsing and execution through the existing query engine.
- Task parsing and serialization through the selected task serializer.
- Global filter handling.
- Safe replacement of existing task lines in markdown files.

A public V2 API must avoid exposing internal classes such as `Task`, `Status`, `Recurrence`, `TasksFile`, `TaskLocation`, `QueryResult`, or `Moment`, because those are implementation details and are not suitable as compatibility-stable API objects.

## Decision

Add `TasksApiV2` as a new versioned public API that extends `TasksApiV1` at the TypeScript interface level:

```ts
export interface TasksApiV2 extends TasksApiV1 {
    queryTasks(query: string): TaskV1[];
    createTask(
        destination: TaskCreationDestinationV1,
        description: string,
        taskData?: Partial<TaskV1>,
    ): Promise<TaskV1>;
    editTask(taskId: string, taskData: Partial<TaskV1>): Promise<TaskV1>;
    ensureTaskHasUniqueId(task: TaskV1): TaskV1;
}
```

Expose it from the plugin through a new `apiV2` getter. Leave `apiV1` unchanged.

### Public Task DTO

Expose tasks as a stable `TaskV1` data transfer object. `TaskV1` contains primitives and strings only:

```ts
export interface TaskV1 {
    id: string;
    description: string;
    status: string;
    priority: string;
    createdDate: string | null;
    startDate: string | null;
    scheduledDate: string | null;
    dueDate: string | null;
    doneDate: string | null;
    cancelledDate: string | null;
    recurrenceRule: string;
    onCompletion: string;
    dependsOn: string[];
    tags: string[];
    blockLink: string;
    originalMarkdown: string;
    path: string;
    lineNumber: number;
}
```

Dates use `YYYY-MM-DD` strings or `null`. `status` is the status symbol. Location fields are returned for caller context, but task edits are ID-based.

### Task Creation Destination

`createTask()` writes to the vault and takes an explicit destination object:

```ts
export interface TaskCreationDestinationV1 {
    path: string;
    line?: number;
    placement?: 'before' | 'after' | 'replace' | 'append';
}
```

If `line` and `placement` are supplied, insert relative to that line:

- `before`: insert before the line.
- `after`: insert after the line.
- `replace`: replace the line.
- `append`: append to the end of the file, ignoring `line`.

If `line` and `placement` are omitted, locate an existing task list in the file and append the new task to that list. If no task list exists, append to EOF.

The task-list fallback is deterministic:

1. Read the target markdown file.
2. Use cache/list-item metadata where available to identify Tasks-recognized task lines.
3. Choose the last recognized task line in the file.
4. Insert after that task's contiguous list block so nested children are not split.
5. If no recognized task exists, append to EOF.

For created tasks, prepend the configured global filter when it is non-empty and absent from the description as a separate word. If no global filter is configured, leave the description unchanged.

### Query Behavior

`queryTasks(query: string): TaskV1[]` uses the existing `Query` engine against `plugin.getTasks()` and returns flattened `TaskV1[]`.

If parsing or execution fails, throw an `Error` containing the query engine message. Do not return partial results for failed queries.

### Edit Behavior

`editTask(taskId: string, taskData: Partial<TaskV1>): Promise<TaskV1>` finds the task by ID in the current cache.

Rules:

- If no task has `taskId`, throw.
- If more than one task has `taskId`, throw.
- Merge `taskData` over the matched task.
- Preserve source location and fields not included in `taskData`.
- Serialize through the existing task serializer.
- Persist by reusing the existing safe task replacement path.
- Return the saved `TaskV1`.

Callers that need line-level writes can use `createTask()` with `placement: 'replace'`.

### Unique ID Behavior

`ensureTaskHasUniqueId(task: TaskV1): TaskV1` is pure:

- If `task.id` is non-empty, return the task unchanged.
- If `task.id` is empty, return a copy with a generated ID that does not exist in the current cache.
- Do not write to the vault.

ID generation must use the valid character set accepted by the current serializer.

## Alternatives Considered

### Expose the internal `Task` class

Rejected. The internal `Task` class contains implementation details such as `Moment`, `Status`, task location, recurrence objects, and serializer-specific behavior. Exposing it would make later refactoring much harder and create avoidable compatibility risk.

### Keep V2 as a pure transformation API

Rejected for this version. `apiV1` already covers non-writing modal and line-transformation workflows. The requested V2 use case is vault-writing task creation and editing.

### Add a Tasks-owned default destination setting

Rejected. The current convention is that Tasks does not choose a destination file for externally-created tasks. Existing integrations such as QuickAdd own file selection and insertion behavior. `TasksApiV2` should accept explicit destinations instead of introducing a new global default destination setting.

### Require exact line placement for every created task

Rejected. Requiring a line for every creation call is precise but unnecessarily awkward for inbox-style integrations. The selected design supports exact placement while providing a deterministic default that appends to an existing task list or EOF.

## Consequences

### Positive

- Preserves `apiV1` compatibility.
- Gives integrations a stable task DTO rather than internal objects.
- Adds query execution without exposing internal query result types.
- Supports vault-writing creation and editing through explicit, testable contracts.
- Keeps destination choice in the API call, matching current integration conventions.

### Negative

- `TaskV1` becomes a compatibility surface and must be versioned carefully.
- Vault-writing APIs need robust error handling for missing files, stale cache data, duplicate IDs, and write failures.
- Smart insertion into existing task lists adds implementation complexity.

### Neutral

- User-facing API documentation must be updated in `docs/Advanced/Tasks Api.md`.
- Tests should cover DTO mapping, query behavior, insertion placement, global filter handling, edit-by-ID behavior, and unique ID generation.
- The implementation may add helper modules under `src/Api/` to keep mapping, query, and persistence behavior separated.

## Implementation Notes

Required failure cases:

- Target file does not exist.
- Target file is not markdown.
- Target line is outside file bounds.
- Query parse or execution error.
- Edit target ID missing.
- Edit target ID duplicated.
- Task data cannot be converted to an internal task.
- File write fails.

Required tests:

- `TasksApiV2` preserves `TasksApiV1` methods.
- `apiV2` getter exists on the plugin.
- `TaskV1` mapping does not expose internal task objects.
- `queryTasks()` returns flattened `TaskV1[]`.
- `queryTasks()` throws on query errors.
- `createTask()` inserts before, after, replace, and append.
- `createTask()` defaults to appending to the existing task list.
- `createTask()` falls back to EOF when no task list exists.
- `createTask()` prepends the global filter only when configured and absent.
- `editTask()` updates exactly one task by ID.
- `editTask()` throws for missing or duplicate IDs.
- `ensureTaskHasUniqueId()` preserves existing IDs and generates unique missing IDs.

## Out of Scope

- New Tasks settings for a default task destination.
- Exposing internal `Task`, `QueryResult`, `Status`, or `Moment` types.
- Batch create/edit APIs.
- Rich result metadata for query grouping.
- API support for query placeholders that require a query file context.

---

**Decision made by:** George Rolfe
**Date:** 2026-07-01
**ADR Number:** 003
