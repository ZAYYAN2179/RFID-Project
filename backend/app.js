const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  // Buka CORS untuk semua — frontend (localhost:3001) & ESP32
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

const io = new Server(server, {
  cors: {
    origin: "*",
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

// Tag yang sudah dikirim ESP32 (reset lewat socket event)
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
  return userCache.get(tag) || "Tidak dikenal";
}

app.use(express.static("public"));

// ─── REST API ─────────────────────────────────────────────

// POST /api/scan — terima EPC dari ESP32 via HTTP, lalu emit ke frontend
app.post("/api/scan", (req, res) => {
  const { Tag } = req.body;
  if (!Tag) return res.status(400).json({ error: "Tag wajib diisi" });

  const epc = Tag.trim().toUpperCase();

  // Cegah duplikat dalam satu sesi scan
  if (tagTerdeteksi.has(epc)) {
    return res.json({ status: "duplicate", epc });
  }

  const nama = getUserName(epc);
  if (nama === "Tidak dikenal") {
    console.log(`⚠️  Tag tidak terdaftar: ${epc}`);
    return res.json({ status: "unknown", epc });
  }

  tagTerdeteksi.add(epc);
  console.log(`📡 ESP32 => ${epc} => ${nama}`);

  // Emit ke semua frontend yang terhubung
  io.emit("tag", {
    Tag: epc,
    nama: nama,
    waktu: new Date().toLocaleTimeString(),
  });

  res.json({ status: "ok", epc, nama });
});

// GET /api/users — ambil semua user dari Firestore
app.get("/api/users", async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();
    const users = [];
    snapshot.forEach((doc) => users.push({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users — tambah user baru
app.post("/api/users", async (req, res) => {
  const { Tag, nama } = req.body;
  if (!Tag || !nama) return res.status(400).json({ error: "Tag dan nama wajib diisi" });

  try {
    // Cek apakah Tag sudah ada
    const existing = await db.collection("users").where("Tag", "==", Tag).get();
    if (!existing.empty) return res.status(409).json({ error: "Tag sudah terdaftar" });

    const docRef = await db.collection("users").add({ Tag, nama });
    // Update cache langsung
    userCache.set(Tag, nama);
    console.log(`✅ User ditambahkan: ${Tag} => ${nama}`);
    res.status(201).json({ id: docRef.id, Tag, nama });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/users/:id — hapus user berdasarkan doc ID
app.delete("/api/users/:id", async (req, res) => {
  try {
    const docRef = db.collection("users").doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: "User tidak ditemukan" });

    const { Tag } = doc.data();
    await docRef.delete();
    // Hapus dari cache
    userCache.delete(Tag);
    console.log(`🗑️ User dihapus: ${Tag}`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Load users dulu, baru start server
loadUsers().then(() => {
  server.listen(3000, () => {
    console.log("Server jalan di http://localhost:3000");
  });
});


//node app.js
//npm run dev -- --port 3001