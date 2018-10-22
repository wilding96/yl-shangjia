// Unique ID creation requires a high quality random # generator.  In node.js
// this is prett straight-forward - we use the crypto API.

var rb = require('../../cryptojs/cryptojs').Crypto;
function rng() {
  return rb.util.randomBytes(16)
};

module.exports = rng;
