"use client";

import { useEffect, useState } from "react";
import { auth, db } from "./lib/firebase";
import { collection, query, orderBy, getDocs, doc, updateDoc, deleteDoc, addDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import CreatePost from "./components/CreatePost";

export default function Home() {
  const [user] = useAuthState(auth);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      setPosts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchPosts();
  }, []);

  const likePost = async (postId) => {
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, { likes: (posts.find(post => post.id === postId).likes || 0) + 1 });

    if (user) {
      await addDoc(collection(db, "notifications"), {
        userId: postId,
        message: `${user.displayName} liked your post.`,
        createdAt: new Date(),
      });
    }
  };

  const deletePost = async (postId, userId) => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.exists() ? userSnap.data() : {};

    if (user.uid === userId || userData.role === "admin") {
      await deleteDoc(doc(db, "posts", postId));
      setPosts(posts.filter(post => post.id !== postId));
    } else {
      alert("You don't have permission to delete this post.");
    }
  };

  return (
    <div className="ml-64 p-4">
      <CreatePost />
      <h1 className="text-2xl font-bold">🎵 News Feed</h1>
      {posts.map((post) => (
        <div key={post.id} className="bg-white p-4 mb-4 rounded shadow">
          <h3 className="font-semibold">{post.userName}</h3>
          <p>{post.content}</p>
          {post.mediaURL && <img src={post.mediaURL} className="w-full rounded mt-2" />}
          <div className="flex gap-2 mt-2">
            <button onClick={() => likePost(post.id)} className="bg-blue-500 text-white px-4 py-2 rounded">👍 Like</button>
            {(user?.uid === post.userId || user?.role === "admin") && (
              <button onClick={() => deletePost(post.id, post.userId)} className="bg-red-500 text-white px-4 py-2 rounded">🗑 Delete</button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
