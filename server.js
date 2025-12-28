// server.js (project root)

import express from "express";
import dotenv from 'dotenv'
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

const DIST_DIR = path.join(__dirname, "dist");

const COMPUTOP_PAYGATE_URL =
    process.env.COMPUTOP_PAYGATE_URL ||
    "https://test.computop-paygate.com/paymentpage.aspx";

// Required secrets (NEVER expose to frontend)
const COMPUTOP_MERCHANT_ID = process.env.COMPUTOP_MERCHANT_ID; // e.g. "npesic_test"
const COMPUTOP_AES_PASSWORD = process.env.COMPUTOP_AES_PASSWORD; // 16/24/32 bytes recommended

// ----- middleware -----
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(DIST_DIR, { index: false }));

function generateTransId12() {
    const time = Date.now().toString().slice(-8);
    const rand = Math.floor(Math.random() * 1e4)
        .toString()
        .padStart(4, "0");
    return time + rand;
}

function encryptAesCbcPkcs7Hex(plainKvp, aesKeyUtf8) {
    const key = Buffer.from(aesKeyUtf8, "utf8");

    if (![16, 24, 32].includes(key.length)) {
        throw new Error(
            `COMPUTOP_AES_PASSWORD must be 16/24/32 bytes in UTF-8. Got ${key.length}.`
        );
    }

    const algo =
        key.length === 16
            ? "aes-128-cbc"
            : key.length === 24
                ? "aes-192-cbc"
                : "aes-256-cbc";

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algo, key, iv);
    cipher.setAutoPadding(true);

    const ciphertext = Buffer.concat([
        cipher.update(plainKvp, "utf8"),
        cipher.final(),
    ]);

    const Data = `${iv.toString("hex")}-${ciphertext.toString("hex")}`;
    const Len = Buffer.byteLength(plainKvp, "utf8");

    return { Data, Len };
}

function buildPlainKvp(params) {
    const {
        merchantId,
        transId,
        refNr,
        amount,
        currency,
        urlSuccess,
        urlFailure,
        urlNotify,
        msgVer = "2.0",
        response = "encrypt",
        language = "en",
        mac, // if you compute HMAC separately, include it here
    } = params;

    const parts = [
        `MerchantID=${encodeURIComponent(merchantId)}`,
        `MsgVer=${encodeURIComponent(msgVer)}`,
        `TransID=${encodeURIComponent(transId)}`,
        refNr ? `RefNr=${encodeURIComponent(refNr)}` : null,
        amount ? `Amount=${encodeURIComponent(amount)}` : null,
        currency ? `Currency=${encodeURIComponent(currency)}` : null,
        urlSuccess ? `URLSuccess=${encodeURIComponent(urlSuccess)}` : null,
        urlFailure ? `URLFailure=${encodeURIComponent(urlFailure)}` : null,
        urlNotify ? `URLNotify=${encodeURIComponent(urlNotify)}` : null,
        response ? `Response=${encodeURIComponent(response)}` : null,
        mac ? `MAC=${encodeURIComponent(mac)}` : null,
        language ? `Language=${encodeURIComponent(language)}` : null,
    ].filter(Boolean);

    return parts.join("&");
}

// ----- API: create payment request and auto-post to Computop -----
app.post('/pay/prepare', async (req, res) => {
  try {
    // 1) Validate request
    const { amount, currency, refNr, urlsuccess, failureUrl, notifyUrl, language, msgver } = req.body;

    // 2) Build plaintext string exactly per Computop spec
    const plaintext =
      `MerchantID=${process.env.CT_MERCHANT_ID}` +
      `&MsgVer=2.0` +
      `&TransID=${makeTransId()}` +
      `&RefNr=${encodeURIComponent(refNr)}` +
      `&Amount=${amount}` +
      `&Currency=${currency}` +
      `&URLSuccess=${encodeURIComponent(urlsuccess)}` +
      `&URLFailure=${encodeURIComponent(failureUrl)}` +
      `&URLNotify=${encodeURIComponent(notifyUrl)}` +
      `&Language=${language || 'en'}` +
      `&Response=encrypt`;

    // 3) Encrypt + MAC (your existing AES/HMAC code)
    const { Data, Len, MAC } = encryptForComputop(plaintext, process.env.CT_SECRET);

    // 4) Return what the frontend needs to POST to HPP
    res.status(200).json({
      hppUrl: process.env.CT_HPP_URL, // test/prod
      fields: {
        MerchantID: process.env.CT_MERCHANT_ID,
        Data,
        Len,
        MAC,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to prepare payment.' });
  }
});

app.post("/api/webhooks/computop", (req, res) => {
    // TODO: verify + decrypt response
    res.status(200).send("OK");
});

app.get("*root", (req, res) => {
    res.sendFile(path.join(DIST_DIR, "index.html"));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

function escapeHtml(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
