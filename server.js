const express = require('express');
const app = express();
const port = 5002;

// Server that serv dist folder

app.use(express.static('dist', {
    setHeaders: (res, path, stat) => {
        res.set({
            "Cross-Origin-Embedder-Policy": "require-corp",
            "Cross-Origin-Opener-Policy": "same-origin"
        });
    }
}));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
