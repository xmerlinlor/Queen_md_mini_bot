const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");

const express = require("express");
const QRCode = require("qrcode");
const P = require("pino");
const fs = require("fs");
const path = require("path");

const config = require("./config");
const commands = require("./commands");

const app = express();
const PORT = process.env.PORT || 3000;

let sock;
let qrCode = null;
let botStatus = "Starting...";
let startTime = Date.now();

const sessionPath = path.join(__dirname, "session");

if (!fs.existsSync(sessionPath)) {
  fs.mkdirSync(sessionPath, { recursive: true });
}

/* =========================
   WEB SERVER
========================= */

app.get("/", async (req, res) => {
  let qr = "";

  if (qrCode) {
    qr = await QRCode.toDataURL(qrCode);
  }

  res.send(`
<!DOCTYPE html>
<html>
<head>
<title>${config.BOT_NAME}</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{
  background:#111;
  color:white;
  font-family:Arial;
  text-align:center;
  padding:40px;
}
.card{
  max-width:400px;
  margin:auto;
  background:#1d1d1d;
  padding:25px;
  border-radius:15px;
}
img{
  width:280px;
  max-width:100%;
}
.online{color:#00ff88}
</style>
</head>
<body>
<div class="card">
<h1>👑 ${config.BOT_NAME}</h1>
<p>Status:
<span class="online">${botStatus}</span>
</p>

${
  qr
    ? `<img src="${qr}">
       <p>📱 Scan this QR with WhatsApp</p>`
    : `<p>Waiting for WhatsApp pairing...</p>`
}

</div>
</body>
</html>
`);
});

app.get("/status", (req, res) => {
  res.json({
    bot: config.BOT_NAME,
    status: botStatus,
    uptime: Math.floor((Date.now() - startTime) / 1000)
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🌐 Queen MD Web: http://0.0.0.0:${PORT}`);
});

/* =========================
   HELPERS
========================= */

function getNumber(jid) {
  return jid
    ? jid.split("@")[0].split(":")[0]
    : "";
}

function isOwner(jid) {
  return getNumber(jid) === getNumber(config.OWNER_NUMBER);
}

function getText(message) {
  const msg = message.message;
  if (!msg) return "";

  return (
    msg.conversation ||
    msg.extendedTextMessage?.text ||
    msg.imageMessage?.caption ||
    msg.videoMessage?.caption ||
    ""
  );
}

async function reply(jid, text, quoted) {
  return sock.sendMessage(
    jid,
    { text },
    { quoted }
  );
}

/* =========================
   WHATSAPP CONNECTION
========================= */

async function startQueen() {
  const { state, saveCreds } =
    await useMultiFileAuthState(sessionPath);

  const { version } =
    await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    auth: state,
    logger: P({ level: "silent" }),
    printQRInTerminal: false,
    browser: ["Queen MD", "Chrome", "1.0.0"],
    generateHighQualityLinkPreview: false
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const {
      connection,
      lastDisconnect,
      qr
    } = update;

    if (qr) {
      qrCode = qr;
      botStatus = "Waiting for QR scan";
      console.log("📱 QR CODE READY");
    }

    if (connection === "open") {
      qrCode = null;
      botStatus = "ONLINE";
      console.log("👑 QUEEN MD CONNECTED");
    }

    if (connection === "close") {
      botStatus = "Disconnected";

      const statusCode =
        lastDisconnect?.error?.output?.statusCode;

      if (statusCode !== DisconnectReason.loggedOut) {
        console.log("🔄 Reconnecting...");
        setTimeout(startQueen, 3000);
      } else {
        console.log("❌ WhatsApp session logged out.");
      }
    }
  });

  /* =========================
     MESSAGE HANDLER
  ========================= */

  sock.ev.on("messages.upsert", async ({ messages }) => {
    try {
      const msg = messages[0];

      if (!msg || !msg.message) return;
      if (msg.key.fromMe) return;

      const jid = msg.key.remoteJid;

      if (!jid || jid === "status@broadcast") return;

      const text = getText(msg).trim();

      if (!text.startsWith(config.PREFIX)) return;

      const withoutPrefix =
        text.slice(config.PREFIX.length).trim();

      if (!withoutPrefix) return;

      const parts = withoutPrefix.split(/\s+/);

      const commandName =
        parts.shift().toLowerCase();

      const args = parts;

      const command =
        commands[commandName];

      if (!command) return;

      const sender =
        msg.key.participant ||
        msg.key.remoteJid;

      const isGroup =
        jid.endsWith("@g.us");

      let groupMetadata = null;

      if (isGroup) {
        try {
          groupMetadata =
            await sock.groupMetadata(jid);
        } catch {}
      }

      const participants =
        groupMetadata?.participants || [];

      const senderNumber =
        getNumber(sender);

      const botNumber =
        getNumber(sock.user?.id);

      const senderParticipant =
        participants.find(
          p => getNumber(p.id) === senderNumber
        );

      const botParticipant =
        participants.find(
          p => getNumber(p.id) === botNumber
        );

      const isAdmin =
        !!senderParticipant?.admin;

      const isBotAdmin =
        !!botParticipant?.admin;

      const ctx = {
        sock,
        msg,
        jid,
        sender,
        text,
        command: commandName,
        args,

        isGroup,
        groupMetadata,
        participants,

        isOwner: isOwner(sender),
        isAdmin,
        isBotAdmin,

        botName: config.BOT_NAME,
        prefix: config.PREFIX,

        reply: (text) =>
          reply(jid, text, msg),

        send: (text) =>
          sock.sendMessage(jid, { text }),

        getNumber
      };

      await command(ctx);

    } catch (error) {
      console.error("CMD ERROR:", error);
    }
  });
}

startQueen().catch(console.error);
