<script lang="ts">
    import type { Task } from '../Task/Task';
    import type { NotificationHistoryEntry } from '../Notifications/NotificationHistory';

    // Passed in as props by NotificationsItemView.onOpen() / its onCacheUpdate handler ($set):
    export let upcomingTasks: Task[];
    export let history: NotificationHistoryEntry[];
    export let onOpenTask: (task: Task) => void;
    export let onClearHistory: () => void;

    $: sortedHistory = [...history].reverse(); // most-recent-first; history itself is stored oldest-first
</script>

<div class="tasks-notifications-view">
    <section>
        <h3>Upcoming</h3>
        {#if upcomingTasks.length === 0}
            <p class="tasks-notifications-empty">No upcoming reminders.</p>
        {:else}
            <ul>
                {#each upcomingTasks as task (task.path + task.lineNumber)}
                    <li>
                        <button type="button" class="tasks-notifications-row" on:click={() => onOpenTask(task)}>
                            <span class="tasks-notifications-description">{task.descriptionWithoutTags}</span>
                            <span class="tasks-notifications-time">{task.reminderDateTime?.fromNow()}</span>
                        </button>
                    </li>
                {/each}
            </ul>
        {/if}
    </section>

    <section>
        <div class="tasks-notifications-history-header">
            <h3>History</h3>
            {#if history.length > 0}
                <button type="button" on:click={onClearHistory}>Clear history</button>
            {/if}
        </div>
        {#if history.length === 0}
            <p class="tasks-notifications-empty">No notifications yet.</p>
        {:else}
            <ul>
                {#each sortedHistory as entry, i (i)}
                    <li class="tasks-notifications-row">
                        <span class="tasks-notifications-description">{entry.description}</span>
                        <span class="tasks-notifications-time">{window.moment(entry.firedAt).fromNow()}</span>
                    </li>
                {/each}
            </ul>
        {/if}
    </section>
</div>

<style>
</style>
