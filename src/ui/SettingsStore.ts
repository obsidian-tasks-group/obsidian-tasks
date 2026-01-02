import { writable } from 'svelte/store';
import { getSettings } from '../Config/Settings';

// This store is to be used by the UI only
export const settingsStore = writable(getSettings());
