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
export function translateHTMLElements(element: HTMLElement) {
    const elements = element.querySelectorAll('[data-i18n]');
    elements.forEach((element) => {
        const key = element.getAttribute('data-i18n');
        if (key) {
            element.textContent = i18next.t(key);
        }
    });
}
translateHTMLElements(document.body)

// Translate html string function
export function translateHTMLString(html: string): string {
    const div = document.createElement("div");
    div.innerHTML = html;
    translateHTMLElements(div);
    return div.innerHTML;
}

export default i18next;
