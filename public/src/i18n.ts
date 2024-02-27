import i18next from "i18next";
import HttpBackend, { HttpBackendOptions } from "i18next-http-backend";

import en from "./locales/en/translation.json";
import ja from "./locales/ja/translation.json";

i18next
    .use(HttpBackend)
    .init<HttpBackendOptions>({
        lng: "en",
        fallbackLng: "en",
        ns: ["translation"],
        defaultNS: "translation",
        resources: {
            "en": { translation: en },
            "ja": { translation: ja },
        },
});

// Get the language from the URL
const urlParams = new URLSearchParams(window.location.search);
const lang = urlParams.get('lang');
if (lang) {
    i18next.changeLanguage(lang);
}   

// Translate all html elements with data-i18n attribute
document.querySelector('[data-i18n="loading"]')!.textContent = i18next.t('loading');
document.querySelector('[data-i18n="masterTrack"]')!.textContent = i18next.t('masterTrack');
document.querySelector('[data-i18n="plugins"]')!.textContent = i18next.t('plugins');
document.querySelector('[data-i18n="selectSong"]')!.textContent = i18next.t('selectSong');
document.querySelector('[data-i18n="saveProject"]')!.textContent = i18next.t('saveProject');
document.querySelector('[data-i18n="switchMode"]')!.textContent = i18next.t('switchMode');
document.querySelector('[data-i18n="restart"]')!.textContent = i18next.t('restart');
document.querySelector('[data-i18n="play"]')!.textContent = i18next.t('play');
document.querySelector('[data-i18n="mute"]')!.textContent = i18next.t('mute');
document.querySelector('[data-i18n="emptyProject"]')!.textContent = i18next.t('emptyProject');
document.querySelector('[data-i18n="preset"]')!.textContent = i18next.t('preset');
document.querySelector('[data-i18n="default"]')!.textContent = i18next.t('default');
document.querySelector('[data-i18n="tracks"]')!.textContent = i18next.t('tracks');

export default i18next;
