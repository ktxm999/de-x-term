const bitcoin = require('bitcoinjs-lib');
const scrypt = require('scrypt-js');
const { keccak256 } = require('keccak');

// Testnet networks
const NETWORKS = {
  bitcoin: bitcoin.networks.testnet,
  litecoin: { ...bitcoin.networks.testnet, messagePrefix: '\x19Litecoin Signed Message:\n', bip32: { public: 0x019da462, private: 0x019d9cfe }, pubKeyHash: 0x30, scriptHash: 0x32, wif: 0xb0 },
  dogecoin: { ...bitcoin.networks.testnet, messagePrefix: '\x19Dogecoin Signed Message:\n', bip32: { public: 0x02facafd, private: 0x02fac398 }, pubKeyHash: 0x1e, scriptHash: 0x16, wif: 0x9e }
};

async function getHash(preimage, chain) {
  const buf = Buffer.from(preimage);
  if (chain === 'bitcoin') return bitcoin.crypto.sha256(buf);
  if (chain === 'litecoin' || chain === 'dogecoin') return Buffer.from(await scrypt(buf, Buffer.from(''), 1024, 1, 1, 32));
  if (chain === 'monero') return Buffer.from(keccak256(buf));
  throw new Error('Unsupported chain');
}

function createHtlcScript(hash, recipientPk, senderPk, lockTimeSeconds) {
  return bitcoin.script.compile([
    bitcoin.opcodes.OP_IF,
      bitcoin.opcodes.OP_SHA256,
      hash,
      bitcoin.opcodes.OP_EQUALVERIFY,
      recipientPk,
      bitcoin.opcodes.OP_CHECKSIG,
    bitcoin.opcodes.OP_ELSE,
      bitcoin.script.number.encode(lockTimeSeconds),
      bitcoin.opcodes.OP_CHECKLOCKTIMEVERIFY,
      bitcoin.opcodes.OP_DROP,
      senderPk,
      bitcoin.opcodes.OP_CHECKSIG,
    bitcoin.opcodes.OP_ENDIF
  ]);
}

async function createHtlc(fromChain, recipientPk, senderPk, lockHours = 24) {
  const preimage = require('crypto').randomBytes(32);
  const hash = await getHash(preimage, fromChain);
  const lockTime = Math.floor(Date.now() / 1000) + lockHours * 3600;
  const script = createHtlcScript(hash, recipientPk, senderPk, lockTime);
  const p2sh = bitcoin.payments.p2sh({ redeem: { output: script, network: NETWORKS[fromChain] }, network: NETWORKS[fromChain] });

  return {
    address: p2sh.address,
    preimage: preimage.toString('hex'),
    hash: hash.toString('hex'),
    scriptHex: script.toString('hex')
  };
}

module.exports = { createHtlc };
