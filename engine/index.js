{const express = require('express');
const app = express();
const { createHtlc } = require("./htlc");
app.use(express.static('../public'));

app.get('/api/status', (req, res) => res.json({status: 'de-X-term LIVE', chains: ['BTC', 'LTC', 'DOGE', 'XMR']}));

app.get('/', (req, res) => res.send('<h1>de-X-term by ktxm999 – Atomic Swaps Node Running!</h1><p>APK: <a href="/app/de-x-term.apk">Download</a></p>'));

app.listen(8080, () => console.log('de-X-term engine running'));

// Test HTLC creation endpoint
app.post('/api/create-htlc', async (req, res) => {
  const { chain } = req.body;
  const keyPairRecipient = bitcoin.ECPair.makeRandom({ network: NETWORKS[chain] });
  const keyPairSender = bitcoin.ECPair.makeRandom({ network: NETWORKS[chain] });
  try {
    const htlc = await createHtlc(chain, keyPairRecipient.publicKey, keyPairSender.publicKey);
    res.json({
      ...htlc,
      recipientWif: keyPairRecipient.toWIF(),
      senderWif: keyPairSender.toWIF()
    });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});
