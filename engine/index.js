{const express = require('express');
const app = express();
app.use(express.static('../public'));

app.get('/api/status', (req, res) => res.json({status: 'de-X-term LIVE', chains: ['BTC', 'LTC', 'DOGE', 'XMR']}));

app.get('/', (req, res) => res.send('<h1>de-X-term by ktxm999 – Atomic Swaps Node Running!</h1><p>APK: <a href="/app/de-x-term.apk">Download</a></p>'));

app.listen(8080, () => console.log('de-X-term engine running'));
