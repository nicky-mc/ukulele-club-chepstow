"use client";

import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db, realtimeDB } from "../lib/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { ref, push, onChildAdded, serverTimestamp } from "firebase/database";
import { useRouter } from "next/navigation";

export default function Messages() {
  const [user] = useAuthState(auth);
  const [users, setUsers] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      setUsers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchUsers();
  }, []);

  const startChat = (receiverId) => {
    const chatId = [user.uid, receiverId].sort().join("_");
    router.push(`/messages/${chatId}`);
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="ml-64 p-4">
      <h1 className="text-2xl font-bold">📬 Messages</h1>
      <ul className="mt-4">
        {users.map((u) => (
          u.id !== user.uid && (
            <li key={u.id} className="p-4 border-b flex justify-between">
              <span>{u.name}</span>
              <button onClick={() => startChat(u.id)} className="bg-blue-500 text-white px-4 py-2 rounded">Chat</button>
            </li>
          )
        ))}
      </ul>
    </div>
  );
}
