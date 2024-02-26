import i18next from "i18next";
import HttpBackend, { HttpBackendOptions } from "i18next-http-backend";

import en from "./locales/en/translation.json";
import ja from "./locales/ja/translation.json";

i18next.use(HttpBackend).init<HttpBackendOptions>({
    lng: "en",
    fallbackLng: "en",
    ns: ["translation"],
    defaultNS: "translation",
    resources: {
        "en": { translation: en },
        "ja": { translation: ja },
    }
});

export default i18next;
