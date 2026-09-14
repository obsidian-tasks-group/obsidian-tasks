<script lang="ts">
    import type { Task } from '../Task/Task';
    import {
        NOTIFICATION_BUCKET_LABELS,
        NOTIFICATION_BUCKET_ORDER,
        type NotificationBucket,
    } from '../Notifications/NotificationBuckets';

    // Passed in as props by NotificationsItemView.onOpen() / its onCacheUpdate handler ($set):
    export let groups: Record<NotificationBucket, Task[]>;
    export let onOpenTask: (task: Task) => void;

    $: isEmpty = NOTIFICATION_BUCKET_ORDER.every((bucket) => groups[bucket].length === 0);
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
                                <button
                                    type="button"
                                    class="tasks-notifications-row"
                                    on:click={() => onOpenTask(task)}
                                >
                                    <span class="tasks-notifications-description">
                                        {task.descriptionWithoutTags}
                                    </span>
                                    <span class="tasks-notifications-time">{task.reminderDateTime?.fromNow()}</span>
                                </button>
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
