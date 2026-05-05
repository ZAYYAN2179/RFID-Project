const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { SerialPort } = require("serialport");
const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Frontend terhubung");

  // Ketika frontend kirim event reset
  socket.on("reset", () => {
    tagTerdeteksi.clear();
    console.log("🔄 Reset — semua tag bisa scan ulang");
  });

  socket.on("disconnect", () => {
    console.log("Frontend terputus");
  });
});

const port = new SerialPort({
  path: "COM6",
  baudRate: 115200,
});

let buffer = "";
const tagTerdeteksi = new Set();

// ✅ Cache users di memory — Firestore hanya dibaca SEKALI
const userCache = new Map(); // { epc => nama }

async function loadUsers() {
  try {
    const snapshot = await db.collection("users").get();
    snapshot.forEach((doc) => {
      const data = doc.data();
      userCache.set(data.Tag, data.nama);
    });
    console.log(`✅ Cache ${userCache.size} user berhasil dimuat`);
  } catch (err) {
    console.error("❌ Gagal load users:", err.message);
  }
}

function getUserName(tag) {
  return userCache.get(tag) || "Tidak dikenal"; // tidak perlu async lagi
}

port.on("data", async function (data) {
  buffer += data.toString("hex").toUpperCase();

  const tags = buffer.match(/E280[0-9A-F]{20}/g);

  if (tags) {
    for (const tag of tags) {
      if (tagTerdeteksi.has(tag)) continue;

      const nama = getUserName(tag); // langsung dari memory
      if (nama === "Tidak dikenal") continue;

      tagTerdeteksi.add(tag);

      console.log(tag, "=>", nama);

      io.emit("tag", {
        Tag: tag,
        nama: nama,
        waktu: new Date().toLocaleTimeString(),
      });
    }
  }

  buffer = buffer.slice(-200);
});

app.use(express.static("public"));

// Load users dulu, baru start server
loadUsers().then(() => {
  server.listen(3000, () => {
    console.log("Server jalan di http://localhost:3000");
  });
});
