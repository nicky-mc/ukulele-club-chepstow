"use client";

import "./globals.css";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { auth } from "./lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Layout({ children }) {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!user && !loading && pathname === "/") {
      router.push("/welcome"); // Redirect new visitors to the welcome page
    }
  }, [user, loading, pathname]);

  return (
    <html lang="en">
      <head>
        <title>Ukulele Club Chepstow</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-gray-100 text-gray-900 flex flex-col min-h-screen">
        {/* Navbar at the top */}
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Sidebar + Content Wrapper */}
        <div className="flex flex-1">
          {user && (
            <Sidebar isOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
          )}

          {/* Main Content */}
          <main className="flex-1 p-6">{children}</main>
        </div>
      </body>
    </html>
  );
}
