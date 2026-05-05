"use client";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { useTagStore } from "@/store/tagStore";

const socket = io("http://localhost:3000");

export function useSocket() {
  const addTag = useTagStore((state) => state.addTag);

  useEffect(() => {
    socket.on("tag", (data) => {
      addTag(data);
    });

    return () => {
      socket.off("tag");
    };
  }, [addTag]);

  return socket;
}

// Fungsi reset — kirim event ke backend
export function resetScan() {
  socket.emit("reset");
}
