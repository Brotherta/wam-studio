// I'm using fetch here, but any HTTP library will do.

const SCRIPT_URL = 'https://cdn.example.com/your-script.js';

module.exports = function () {
    return fetch(SCRIPT_URL)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Could not download ' + SCRIPT_URL);
            }
            return response.text();
        })
        .then((remoteScript) => ({ code: remoteScript }));
}