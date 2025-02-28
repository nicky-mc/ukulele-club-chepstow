"use client";

import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../lib/firebase";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";

export default function Bookings() {
  const [user] = useAuthState(auth);
  const [bookings, setBookings] = useState([]);
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");

  useEffect(() => {
    const fetchBookings = async () => {
      const querySnapshot = await getDocs(collection(db, "bookings"));
      setBookings(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchBookings();
  }, []);

  const requestBooking = async () => {
    if (!eventDate || !eventTime) return;

    await addDoc(collection(db, "bookings"), {
      userId: user.uid,
      userName: user.displayName,
      date: eventDate,
      time: eventTime,
      status: "pending",
      createdAt: serverTimestamp(),
    });

    setEventDate("");
    setEventTime("");
  };

  if (!user) return <p>Please log in to book events.</p>;

  return (
    <div className="ml-64 p-4">
      <h1 className="text-2xl font-bold">📅 Book an Event</h1>
      <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="p-2 border rounded mt-2" />
      <input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} className="p-2 border rounded mt-2" />
      <button onClick={requestBooking} className="bg-green-500 text-white px-4 py-2 mt-2 rounded">Request Booking</button>
    </div>
  );
}
