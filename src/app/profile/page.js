"use client";

import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../lib/firebase";
import { doc, getDoc, updateDoc, collection, getDocs, deleteDoc } from "firebase/firestore";
import { uploadImageToCloudinary } from "../lib/cloudinary";
import Lightbox from "../components/Lightbox";
import { useRouter, useSearchParams } from "next/navigation";

export default function Profile() {
  const [user] = useAuthState(auth);
  const [userData, setUserData] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [newPhoto, setNewPhoto] = useState(null);
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [users, setUsers] = useState([]); // Other users
  const searchParams = useSearchParams();
  const router = useRouter();
  const profileUserId = searchParams.get("id") || user?.uid;

  useEffect(() => {
    if (profileUserId) {
      const fetchUserData = async () => {
        const userDoc = await getDoc(doc(db, "users", profileUserId));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
          setBio(userDoc.data().bio || "");
          setLocation(userDoc.data().location || "");
        }
      };

      const fetchUserGallery = async () => {
        const querySnapshot = await getDocs(collection(db, "posts"));
        setGallery(querySnapshot.docs
          .filter(doc => doc.data().userId === profileUserId)
          .map(doc => doc.data().mediaURL)
          .filter(url => url) // Ensure no null values
        );
      };

      const fetchUserBookings = async () => {
        const querySnapshot = await getDocs(collection(db, "bookings"));
        setBookings(querySnapshot.docs
          .filter(doc => doc.data().userId === profileUserId)
          .map(doc => ({ id: doc.id, ...doc.data() }))
        );
      };

      fetchUserData();
      fetchUserGallery();
      fetchUserBookings();
    }
  }, [profileUserId]);

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      setUsers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchUsers();
  }, []);

  const handleUpload = async () => {
    if (!newPhoto) return;
    const imageUrl = await uploadImageToCloudinary(newPhoto);
    await updateDoc(doc(db, "users", profileUserId), { photoURL: imageUrl });
    setUserData((prev) => ({ ...prev, photoURL: imageUrl }));
  };

  const handleUpdateProfile = async () => {
    await updateDoc(doc(db, "users", profileUserId), { bio, location });
  };

  const handleCancelBooking = async (bookingId) => {
    await deleteDoc(doc(db, "bookings", bookingId));
    setBookings(bookings.filter(booking => booking.id !== bookingId));
  };

  if (!userData) return <p className="text-center mt-10 text-lg">Loading...</p>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Profile Info */}
        <div className="bg-white shadow-lg rounded-xl p-6 text-center">
          <img
            src={userData?.photoURL || "/default-avatar.png"}
            className="w-32 h-32 rounded-full mx-auto border-4 border-yellow-500 shadow-lg"
          />
          <h1 className="text-2xl font-bold mt-4">{userData?.name || "User"}</h1>
          <p className="text-gray-500">{userData?.email}</p>
          <p className="text-gray-600 mt-1">📍 {location || "Location not set"}</p>
          <p className="text-gray-600">📅 Joined: {userData?.createdAt?.toDate ? userData.createdAt.toDate().toLocaleDateString() : "N/A"}</p>

          {user?.uid === profileUserId && (
            <div className="mt-4">
              <label className="bg-blue-500 text-white px-6 py-2 rounded shadow hover:bg-blue-600 cursor-pointer">
                Choose File
                <input type="file" onChange={(e) => setNewPhoto(e.target.files[0])} className="hidden" />
              </label>
              <button onClick={handleUpload} className="ml-2 bg-green-500 text-white px-6 py-2 rounded shadow hover:bg-green-600">
                Upload
              </button>
            </div>
          )}
        </div>

        {/* Right Column - Bookings & Gallery */}
        <div>
          {/* Gallery Section */}
          <div className="bg-white shadow-lg rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4">📸 {profileUserId === user?.uid ? "Your" : `${userData?.name}'s`} Gallery</h2>
            {gallery.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {gallery.map((url, index) => (
                  <div key={index} className="rounded overflow-hidden cursor-pointer" onClick={() => setSelectedImage(url)}>
                    {url.includes(".mp4") ? (
                      <video src={url} className="w-full h-40 object-cover" controls />
                    ) : (
                      <img src={url} className="w-full h-40 object-cover" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No images or videos uploaded yet.</p>
            )}
          </div>

          {/* Bookings Section */}
          <div className="bg-white shadow-lg rounded-xl p-6 mt-6">
            <h2 className="text-xl font-bold">📅 {profileUserId === user?.uid ? "Your" : `${userData?.name}'s`} Bookings</h2>
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <div key={booking.id} className="bg-gray-50 p-4 mb-3 rounded-lg shadow">
                  <p><strong>📆 Date:</strong> {booking.date}</p>
                  <p><strong>🕒 Time:</strong> {booking.time || "N/A"}</p>
                  <p><strong>📌 Status:</strong> <span className={`font-bold ${booking.status === "approved" ? "text-green-500" : "text-orange-500"}`}>
                    {booking.status}
                  </span></p>
                  {user?.uid === profileUserId && (
                    <button onClick={() => handleCancelBooking(booking.id)} 
                      className="bg-red-500 text-white px-4 py-1 rounded mt-2 hover:bg-red-600">
                      ❌ Cancel Booking
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">No bookings made yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox for Image Viewing */}
      <Lightbox isOpen={!!selectedImage} onRequestClose={() => setSelectedImage(null)} imageUrl={selectedImage} />
    </div>
  );
}
