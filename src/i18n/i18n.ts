import i18next from 'i18next';
import { getLanguage } from 'obsidian';

// alphabetical order:
import be from 'i18n/locales/be.json';
import de from 'i18n/locales/de.json';
import en from 'i18n/locales/en.json';
import es from 'i18n/locales/es.json';
import fr from 'i18n/locales/fr.json';
import ko from 'i18n/locales/ko.json';
import pt_br from 'i18n/locales/pt_br.json';
import ru from 'i18n/locales/ru.json';
import tr from 'i18n/locales/tr.json';
import uk from 'i18n/locales/uk.json';
import vi from 'i18n/locales/vi.json';
import zh_cn from 'i18n/locales/zh_cn.json';

let isInitialized = false;

// Get Obsidian language settings
const getObsidianLanguage = (): string => {
    const storedLanguage = getLanguage();
    return storedLanguage || 'en';
};

// Force 'yarn extract-i18n' to keep translation strings that are only used indirectly.
// i18n.t('taskFields.due')
// i18n.t('taskFields.scheduled')
// i18n.t('taskFields.start')

// Define a function to initialize i18next
export const initializeI18n = async () => {
    if (!isInitialized) {
        await i18next.init({
            lng: getObsidianLanguage(),
            fallbackLng: 'en', // Fallback language if detection fails or translation is missing
            returnEmptyString: false, // Use fallback language if i18next-parser put in empty value for untranslated text
            resources: {
                // alphabetical order:
                // key:         the Obsidian "Language code", defined in
                //              https://github.com/obsidianmd/obsidian-translations?tab=readme-ov-file#existing-languages
                // translation: the filename of the JSON file in locales subdirectory
                be: { translation: be }, // Belarusian
                de: { translation: de }, // German
                en: { translation: en }, // English
                es: { translation: es }, // Spanish
                fr: { translation: fr }, // French
                ko: { translation: ko }, // Korean
                'pt-BR': { translation: pt_br }, // Portuguese (Brazil)
                ru: { translation: ru }, // Russian
                tr: { translation: tr }, // Turkish
                uk: { translation: uk }, // Ukrainian
                vi: { translation: vi }, // Vietnamese
                zh: { translation: zh_cn }, // Chinese (Simplified)
            },
            interpolation: {
                escapeValue: false, // Disable escaping of strings, like '&' -> '&amp;'
            },
        });

        isInitialized = true;
    }
};

export const i18n = new Proxy(i18next, {
    get(target, prop): unknown {
        if (!isInitialized && prop === 't') {
            /* This should never be reached in tests, as the following is called in vitest.setup.ts:
                    beforeAll(async () => {
                        await initializeI18n();
                    });
             */
            throw new Error('i18n.t() called before initialization. Call initializeI18n() first.');
        }
        return Reflect.get(target, prop);
    },
});
