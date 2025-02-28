"use client";

import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Sidebar({ isOpen, closeSidebar }) {
  const [user] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);

  // Fetch user role
  useEffect(() => {
    if (user) {
      const checkAdmin = async () => {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists() && userSnap.data().role === "admin") {
          setIsAdmin(true);
        }
      };
      checkAdmin();
    }
  }, [user]);

  // Close sidebar when clicking outside (for mobile)
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (isOpen && !event.target.closest("#sidebar")) {
        closeSidebar();
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, [isOpen, closeSidebar]);

  return (
    <aside
      id="sidebar"
      className={`fixed md:relative top-0 left-0 h-screen bg-gray-800 text-white p-4 transition-transform ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 md:w-64 w-3/4 shadow-lg`}
    >
      <h2 className="text-xl font-bold mb-4">Navigation</h2>
      <ul>
        <li className="py-2 hover:bg-gray-700 rounded"><a href="/">Home</a></li>
        <li className="py-2 hover:bg-gray-700 rounded"><a href="/profile">Profile</a></li>
        <li className="py-2 hover:bg-gray-700 rounded"><a href="/messages">Messages</a></li>
        <li className="py-2 hover:bg-gray-700 rounded"><a href="/bookings">Bookings</a></li>
        {isAdmin && (
          <li className="py-2 hover:bg-gray-700 rounded"><a href="/admin">Admin</a></li>
        )}
      </ul>
    </aside>
  );
}
