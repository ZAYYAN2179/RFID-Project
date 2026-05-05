"use client";
import { useRouter } from "next/navigation";

export default function Input() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-2xl mx-auto">

        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push("/")}
            className="text-gray-400 hover:text-white transition text-sm"
          >
            ← Kembali
          </button>
          <h1 className="text-3xl font-bold">Input Data</h1>
        </div>

        <div className="text-center text-gray-600 py-16">
          Halaman input data (segera hadir)
        </div>

      </div>
    </main>
  );
}