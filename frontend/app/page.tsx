"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-md w-full text-center">

        {/* Logo / Title */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">IoT RFID</h1>
          <p className="text-gray-400">Sistem monitoring UHF RFID real-time</p>
        </div>

        {/* Tombol */}
        <div className="flex flex-col gap-4">
          <button
            onClick={() => router.push("/input")}
            className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-semibold text-lg transition"
          >
            Input Data
          </button>

          <button
            onClick={() => router.push("/monitor")}
            className="w-full py-4 bg-gray-800 hover:bg-gray-700 rounded-xl text-white font-semibold text-lg transition"
          >
            UHF Monitor
          </button>
        </div>

      </div>
    </main>
  );
}