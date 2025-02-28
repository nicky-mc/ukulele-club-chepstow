"use client";

import { useState, useEffect, useRef } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useParams } from "next/navigation";
import { auth, realtimeDB } from "../lib/firebase";
import { ref, push, onChildAdded, serverTimestamp } from "firebase/database";

export default function PrivateChat() {
  const { id } = useParams();
  const [user] = useAuthState(auth);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    const chatRef = ref(realtimeDB, `messages/${id}`);
    onChildAdded(chatRef, (snapshot) => {
      setMessages((prev) => [...prev, snapshot.val()]);
    });
  }, [user, id]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    const chatRef = ref(realtimeDB, `messages/${id}`);
    await push(chatRef, {
      senderId: user.uid,
      text: newMessage,
      createdAt: serverTimestamp(),
    });
    setNewMessage("");
  };

  return (
    <div className="ml-64 p-4">
      <h1 className="text-2xl font-bold">💬 Chat</h1>
      <div className="bg-gray-100 p-4 h-96 overflow-y-auto mt-4 rounded">
        {messages.map((msg, index) => (
          <p key={index} className="p-2">{msg.text}</p>
        ))}
      </div>
    </div>
  );
}
