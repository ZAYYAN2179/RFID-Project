"use client";
import { useSocket, resetScan } from "@/hooks/useSocket";
import { useTagStore } from "@/store/tagStore";

export default function Home() {
  useSocket();
  const { tags, clearTags } = useTagStore();

  function handleReset() {
    clearTags(); // bersihkan tampilan
    resetScan(); // reset tagTerdeteksi di backend
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">UHF Monitor</h1>
            <p className="text-gray-400 text-sm mt-1">Real-time RFID Scanner</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2 text-green-400 text-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Live
            </span>
            <button onClick={handleReset} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition">
              Bersihkan
            </button>
          </div>
        </div>

        {/* Counter */}
        <div className="bg-gray-900 rounded-xl p-4 mb-6 flex items-center justify-between">
          <span className="text-gray-400 text-sm">Total terdeteksi</span>
          <span className="text-2xl font-bold text-blue-400">{tags.length}</span>
        </div>

        {/* List */}
        <div className="space-y-3">
          {tags.length === 0 ? (
            <div className="text-center text-gray-600 py-16">Menunggu scan RFID...</div>
          ) : (
            tags.map((tag, index) => (
              <div key={index} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-white">{tag.nama}</p>
                  <p className="text-xs text-gray-500 mt-1 font-mono">{tag.epc}</p>
                </div>
                <span className="text-xs text-gray-400 bg-gray-800 px-3 py-1 rounded-full">{tag.waktu}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
