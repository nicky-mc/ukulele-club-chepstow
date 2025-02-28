// pages/about.js
"use client";

import Link from "next/link";

export default function About() {
  return (
    <div className="ml-64 p-4">
      <h1 className="text-2xl font-bold">About Us</h1>
      <p className="mt-4">Welcome to our platform! We invite you to join us and be a part of our community.</p>
      <Link href="/signup">
        <a className="bg-blue-500 text-white px-4 py-2 mt-4 rounded">Sign Up</a>
      </Link>
    </div>
  );
}