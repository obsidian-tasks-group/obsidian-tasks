import { writable } from 'svelte/store';
import { getSettings, updateSettings } from '../Config/Settings';

// This store is to be used by the UI only
export const settingsStore = writable(getSettings());

settingsStore.subscribe((settings) => {
    updateSettings(settings);
});
