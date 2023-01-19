/**
 * The type used for a single entry in bulk imports of pre-created sets of statuses, such as for Themes or CSS Snippets.
 */
export type StatusCollectionEntry = [string, string, string];

/**
 * The type used for bulk imports of pre-created sets of statuses, such as for Themes or CSS Snippets.
 */
export type StatusCollection = Array<StatusCollectionEntry>;
