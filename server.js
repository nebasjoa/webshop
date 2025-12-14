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
app.post("/pay", (req, res) => {
    try {
        console.log("POST /pay body:", req.body);

        if (!COMPUTOP_MERCHANT_ID || !COMPUTOP_AES_PASSWORD) {
            return res.status(500).json({
                error: "Missing COMPUTOP_MERCHANT_ID or COMPUTOP_AES_PASSWORD in env.",
            });
        }

        const amount = req.body.amount != null ? String(req.body.amount) : "";
        const currency = req.body.currency ? String(req.body.currency) : "EUR";
        const refNr = req.body.refNr ? String(req.body.refNr) : "";

        // Important: your frontend sent transid/transId inconsistently. Decide one.
        const transId = req.body.transId
            ? String(req.body.transId)
            : generateTransId12();

        const APP_ORIGIN = process.env.APP_ORIGIN || "http://localhost:3000";
        const API_ORIGIN = process.env.API_ORIGIN || `http://localhost:${PORT}`;

        const urlSuccess = `${APP_ORIGIN}/payment/success`;
        const urlFailure = `${APP_ORIGIN}/payment/failure`;
        const urlNotify = `${API_ORIGIN}/webhooks`; // better as API origin, not APP origin

        // If you have an HMAC/MAC step, compute it server-side and pass here
        const mac = req.body.mac ? String(req.body.mac) : "";

        const plain = buildPlainKvp({
            merchantId: COMPUTOP_MERCHANT_ID,
            transId,
            refNr,
            amount,
            currency,
            urlSuccess,
            urlFailure,
            urlNotify,
            response: "encrypt",
            language: "en",
            mac,
        });

        const { Data, Len } = encryptAesCbcPkcs7Hex(plain, COMPUTOP_AES_PASSWORD);

        const token = crypto.randomBytes(24).toString("base64url");
        payIntents.set(token, {
            MerchantID: COMPUTOP_MERCHANT_ID,
            Len,
            Data,
            expiresAt: Date.now() + INTENT_TTL_MS,
            used: false,
        });

        // Frontend will do: window.location.assign(redirectUrl)
        return res.status(201).json({
            redirectUrl: `/pay/redirect/${token}`,
            transId,
        });
    } catch (err) {
        console.error("Computop payment init failed:", err);
        return res.status(500).json({ error: "Failed to create Computop payment intent." });
    }
});

// 2) Redirect endpoint (browser navigation): marks token used, then 302 to post page
app.get("/pay/redirect/:token", (req, res) => {
    const token = req.params.token;
    const it = payIntents.get(token);

    if (!it) return res.status(404).send("Payment intent not found.");
    if (it.expiresAt <= Date.now()) {
        payIntents.delete(token);
        return res.status(410).send("Payment intent expired.");
    }
    if (it.used) return res.status(409).send("Payment intent already used.");

    it.used = true;
    return res.redirect(302, `/pay/post/${token}`);
});

// 3) HTML auto-post page (browser renders this): posts to Computop
app.get("/pay/post/:token", (req, res) => {
    const token = req.params.token;
    const it = payIntents.get(token);

    if (!it) return res.status(404).send("Payment intent not found.");
    if (it.expiresAt <= Date.now()) {
        payIntents.delete(token);
        return res.status(410).send("Payment intent expired.");
    }

    // One-shot: delete now so it can't be replayed
    payIntents.delete(token);

    res.type("html").send(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Redirecting…</title>
    <meta name="referrer" content="no-referrer" />
  </head>
  <body>
    <form id="pay" action="https://test.computop-paygate.com/paymentpage.aspx" method="post">
      <input type="hidden" name="MerchantID" value="${escapeHtml(it.MerchantID)}" />
      <input type="hidden" name="Len" value="${it.Len}" />
      <input type="hidden" name="Data" value="${escapeHtml(it.Data)}" />
    </form>
    <script>document.getElementById('pay').submit();</script>
  </body>
</html>`);
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
