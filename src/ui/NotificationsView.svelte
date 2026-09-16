<script lang="ts">
    import type { Task } from '../Task/Task';
    import {
        NOTIFICATION_BUCKET_LABELS,
        NOTIFICATION_BUCKET_ORDER,
        type NotificationBucket,
    } from '../Notifications/NotificationBuckets';
    import { ReminderMenu } from './Menus/ReminderMenu';
    import { SchedulePopover } from './Menus/SchedulePopover';
    import { defaultTaskSaver, showMenu, type TaskSaver } from './Menus/TaskEditingMenu';

    // Passed in as props by NotificationsItemView.onOpen() / its onCacheUpdate handler ($set):
    export let groups: Record<NotificationBucket, Task[]>;
    export let onOpenTask: (task: Task) => void;
    export let taskSaver: TaskSaver = defaultTaskSaver;

    $: isEmpty = NOTIFICATION_BUCKET_ORDER.every((bucket) => groups[bucket].length === 0);

    // Same right-click quick-pick menu the rendered reminder pill offers (see TaskLineRenderer.ts) - kept in
    // sync by construction, since both just build a ReminderMenu from the task.
    function onRowContextMenu(ev: MouseEvent, task: Task) {
        showMenu(ev, new ReminderMenu(task, taskSaver));
    }

    // The alarm-clock pill mirrors the rendered reminder pill's left-click behaviour - opens the same
    // Schedule popover, anchored to the pill itself.
    function onSchedulePillClick(ev: MouseEvent, task: Task) {
        ev.stopPropagation();
        new SchedulePopover(ev.currentTarget as HTMLElement, task, taskSaver);
    }

    // A bare "in 32 minutes"/"2 days ago" doesn't say which day, and a full date on a reminder that's today
    // is redundant (the "Today" bucket heading already says so) - so today's reminders get the clock time
    // plus the relative phrase underneath it (rendered with {@html} below for the <br/>), and every other
    // day gets a short day prefix instead: "tomorrow"/"yesterday", or "DD/MM" beyond that.
    //
    // Not task.reminderDateTime?.fromNow() for the relative phrase - moment diffs against the actual current
    // instant, seconds and all, so a reminder at 13:00 checked at 12:28:35 reads as "31 minutes" (31.4,
    // rounded down) instead of the 32 a clock reading "28" to "60" actually promises. Flooring 'now' to the
    // minute first removes that elapsed-seconds fraction - the same fix already applied to the
    // reminder-suggestion labels, see ReminderSuggestions.ts's own doc comment on 'now' being floored before
    // diffing.
    function formatReminderTime(task: Task): string {
        const target = task.reminderDateTime;
        if (!target) {
            return '';
        }
        const now = window.moment();
        const clock = target.format('HH:mm');
        if (target.isSame(now, 'day')) {
            return `${clock}<br />${target.from(now.clone().startOf('minute'))}`;
        }
        if (target.isSame(now.clone().add(1, 'day'), 'day')) {
            return `tomorrow, ${clock}`;
        }
        if (target.isSame(now.clone().subtract(1, 'day'), 'day')) {
            return `yesterday, ${clock}`;
        }
        return `${target.format('DD/MM')}, ${clock}`;
    }
</script>

<div class="tasks-notifications-view">
    {#if isEmpty}
        <p class="tasks-notifications-empty">No reminders set.</p>
    {:else}
        {#each NOTIFICATION_BUCKET_ORDER as bucket (bucket)}
            {#if groups[bucket].length > 0}
                <section>
                    <h3>{NOTIFICATION_BUCKET_LABELS[bucket]}</h3>
                    <ul>
                        {#each groups[bucket] as task (task.path + task.lineNumber)}
                            <li>
                                <div
                                    class="tasks-notifications-row"
                                    on:contextmenu={(ev) => onRowContextMenu(ev, task)}
                                    title="Right-click for options"
                                >
                                    <button
                                        type="button"
                                        class="tasks-notifications-open"
                                        on:click={() => onOpenTask(task)}
                                    >
                                        <span class="tasks-notifications-description">
                                            {task.descriptionWithoutTags}
                                        </span>
                                        <span class="tasks-notifications-time">{@html formatReminderTime(task)}</span>
                                    </button>
                                    <button
                                        type="button"
                                        class="tasks-notifications-schedule-pill"
                                        title="Open schedule"
                                        on:click={(ev) => onSchedulePillClick(ev, task)}
                                    >
                                        ⏰
                                    </button>
                                </div>
                            </li>
                        {/each}
                    </ul>
                </section>
            {/if}
        {/each}
    {/if}
</div>

<style>
</style>
