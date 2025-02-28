"use client";

import { useState } from "react";
import { auth, db } from "../lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { uploadImageToCloudinary } from "../lib/cloudinary";

export default function CreatePost() {
  const [user] = useAuthState(auth);
  const [content, setContent] = useState("");
  const [media, setMedia] = useState(null);

  const handleUploadAndPost = async () => {
    if (!content.trim() && !media) return;

    let mediaURL = "";
    if (media) mediaURL = await uploadImageToCloudinary(media);

    await addDoc(collection(db, "posts"), {
      userId: user.uid,
      userName: user.displayName,
      content,
      mediaURL,
      createdAt: serverTimestamp(),
    });

    setContent("");
    setMedia(null);
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        className="w-full p-2 border rounded mt-2"
      />
      <input type="file" onChange={(e) => setMedia(e.target.files[0])} />
      <button onClick={handleUploadAndPost} className="bg-green-500 text-white px-4 py-2 mt-2 rounded">
        Post
      </button>
    </div>
  );
}