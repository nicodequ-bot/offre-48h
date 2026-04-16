const crypto = require('crypto');

// Variables d'environnement à configurer sur Vercel :
// OFFER_SECRET  → une longue chaîne aléatoire (ex: "monSecret123XYZ")
// MAKE_SECRET   → un mot de passe pour protéger cet endpoint (ex: "makeSecret456")
// APP_URL       → l'URL de ton projet Vercel (ex: "https://mon-offre.vercel.app")
// COUPON_URL    → l'URL Podia avec le coupon (ex: "https://monsite.podia.com/checkout?coupon=PROMO48")

module.exports = (req, res) => {
  // Vérifie que c'est bien Make.com qui appelle (et pas n'importe qui)
  if (req.query.secret !== process.env.MAKE_SECRET) {
    return res.status(401).json({ error: 'Non autorisé' });
  }

  // Génère un token signé avec l'heure actuelle
  const timestamp = Date.now();
  const hmac = crypto.createHmac('sha256', process.env.OFFER_SECRET);
  hmac.update(String(timestamp));
  const sig = hmac.digest('hex').substring(0, 16);
  const token = Buffer.from(`${timestamp}.${sig}`).toString('base64url');

  const url = `${process.env.APP_URL}/api/offer?t=${token}`;

  return res.status(200).send(url);
};
