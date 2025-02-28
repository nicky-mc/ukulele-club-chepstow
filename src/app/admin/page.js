"use client";

import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, collection, getDocs, updateDoc, addDoc, deleteDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function Admin() {
  const [user] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      const checkAdmin = async () => {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists() && userSnap.data().role === "admin") {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      };

      checkAdmin();
    }
  }, [user]);

  useEffect(() => {
    if (isAdmin === true) {
      const fetchBookings = async () => {
        const querySnapshot = await getDocs(collection(db, "bookings"));
        setBookings(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      };

      const fetchNotifications = async () => {
        const querySnapshot = await getDocs(collection(db, "notifications"));
        setNotifications(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      };

      fetchBookings();
      fetchNotifications();
    }
  }, [isAdmin]);

  if (isAdmin === false) return <p className="text-center text-lg mt-10">🚫 Access Denied</p>;

  const approveBooking = async (bookingId, userId) => {
    try {
      const bookingRef = doc(db, "bookings", bookingId);
      await updateDoc(bookingRef, { status: "approved" });

      await addDoc(collection(db, "notifications"), {
        userId,
        message: "✅ Your booking has been approved!",
        createdAt: new Date(),
      });

      setBookings(bookings.map(b => (b.id === bookingId ? { ...b, status: "approved" } : b)));
    } catch (error) {
      console.error("Error approving booking:", error);
    }
  };

  const rejectBooking = async (bookingId, userId) => {
    try {
      const bookingRef = doc(db, "bookings", bookingId);
      await deleteDoc(bookingRef);

      await addDoc(collection(db, "notifications"), {
        userId,
        message: "❌ Your booking has been rejected.",
        createdAt: new Date(),
      });

      setBookings(bookings.filter(b => b.id !== bookingId));
    } catch (error) {
      console.error("Error rejecting booking:", error);
    }
  };

  return (
    <div className="ml-64 p-4">
      <h1 className="text-2xl font-bold mb-6">📅 Manage Bookings</h1>

      {bookings.length === 0 ? (
        <p className="text-gray-500">No bookings found.</p>
      ) : (
        bookings.map((booking) => (
          <div key={booking.id} className="bg-white p-4 mb-4 rounded shadow">
            <p className="font-semibold">📆 Booking Date: {booking.date}</p>
            <p className="text-gray-600">Status: {booking.status}</p>

            {booking.status === "pending" && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => approveBooking(booking.id, booking.userId)}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  ✅ Approve
                </button>
                <button
                  onClick={() => rejectBooking(booking.id, booking.userId)}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  ❌ Reject
                </button>
              </div>
            )}
          </div>
        ))
      )}

      <h1 className="text-2xl font-bold mb-4 mt-8">🔔 Notifications</h1>

      {notifications.length === 0 ? (
        <p className="text-gray-500">No notifications available.</p>
      ) : (
        notifications.map((notification) => (
          <div key={notification.id} className="bg-white p-4 mb-4 rounded shadow">
            <p>{notification.message}</p>
            <p className="text-gray-500 text-sm">
              {notification.createdAt?.seconds ? 
                new Date(notification.createdAt.seconds * 1000).toLocaleString() : 
                "Recently"
              }
            </p>
          </div>
        ))
      )}
    </div>
  );
}
