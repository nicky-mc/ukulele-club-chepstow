"use client";

import { useRouter } from "next/navigation";

export default function Welcome() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-4xl font-bold">🎶 Welcome to Ukulele Club Chepstow!</h1>
      <p className="mt-4 text-lg">
        Join us for fun jam sessions, learn to play, and connect with fellow ukulele enthusiasts!
      </p>
      
      <button onClick={() => router.push("/login")} className="bg-yellow-500 text-white px-6 py-3 mt-4 rounded">
        Join the Club
      </button>
    </div>
  );
}
