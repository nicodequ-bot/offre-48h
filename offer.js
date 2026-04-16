const crypto = require('crypto');

const HOURS_VALID = 48;

function verifyToken(token) {
  try {
    const data = Buffer.from(token, 'base64url').toString();
    const [timestamp, sig] = data.split('.');
    const hmac = crypto.createHmac('sha256', process.env.OFFER_SECRET);
    hmac.update(String(timestamp));
    const expectedSig = hmac.digest('hex').substring(0, 16);
    if (sig !== expectedSig) return null;
    return parseInt(timestamp);
  } catch {
    return null;
  }
}

module.exports = (req, res) => {
  const { t } = req.query;

  if (!t) return res.status(400).send(expiredPage());

  const timestamp = verifyToken(t);
  if (!timestamp) return res.status(400).send(expiredPage());

  const diff = Date.now() - timestamp;
  const maxMs = HOURS_VALID * 60 * 60 * 1000;

  if (diff > maxMs) return res.status(200).send(expiredPage());

  // Tout est bon → redirige vers Podia avec le coupon
  return res.redirect(302, process.env.COUPON_URL);
};

function expiredPage() {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Offre expirée</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      display: flex; align-items: center; justify-content: center;
      min-height: 100vh; background: #f7f7f7;
    }
    .card {
      background: white; padding: 56px 48px; border-radius: 16px;
      text-align: center; max-width: 420px; width: 90%;
      box-shadow: 0 4px 24px rgba(0,0,0,0.07);
    }
    .emoji { font-size: 3rem; margin-bottom: 20px; }
    h2 { font-size: 1.5rem; color: #111; margin-bottom: 12px; }
    p { color: #666; line-height: 1.7; font-size: 1rem; }
  </style>
</head>
<body>
  <div class="card">
    <div class="emoji">⏰</div>
    <h2>Cette offre a expiré</h2>
    <p>La réduction exclusive de 48h n'est plus disponible.<br>
    Tu l'as manquée de peu !</p>
  </div>
</body>
</html>`;
}
