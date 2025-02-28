"use client";

import { useState } from "react";
import { auth, db } from "../lib/firebase";
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState(""); // Only used for signup
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between login & signup

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    await saveUserToFirestore(result.user);
    router.push("/");
  };

  const handleEmailAuth = async () => {
    try {
      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await saveUserToFirestore(userCredential.user, name);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      router.push("/");
    } catch (error) {
      console.error("Authentication Error:", error.message);
    }
  };

  const saveUserToFirestore = async (user, userName = null) => {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      await setDoc(userRef, {
        name: userName || user.displayName || "New User",
        email: user.email,
        photoURL: user.photoURL || "/default-avatar.png",
        role: "user",
        createdAt: new Date(),
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-6">{isSignUp ? "Create an Account" : "Login"}</h1>

        {isSignUp && (
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-yellow-500 outline-none"
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-yellow-500 outline-none"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-yellow-500 outline-none"
        />

        <button
          onClick={handleEmailAuth}
          className="w-full bg-yellow-500 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-yellow-600 transition"
        >
          {isSignUp ? "Sign Up" : "Login"}
        </button>

        <p className="mt-4 text-gray-600">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <span className="text-yellow-500 font-semibold cursor-pointer hover:underline" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? "Login" : "Sign Up"}
          </span>
        </p>

        <div className="my-4 flex items-center">
          <div className="flex-1 border-b border-gray-300"></div>
          <p className="mx-2 text-gray-400">OR</p>
          <div className="flex-1 border-b border-gray-300"></div>
        </div>

        <button
          onClick={signInWithGoogle}
          className="w-full bg-red-500 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-red-600 transition flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 4.5c1.8 0 3.4.7 4.6 1.7l3.4-3.4C17.8.8 15 0 12 0 7.6 0 3.8 2.6 1.8 6.4l3.8 2.9C6.8 6.2 9.2 4.5 12 4.5zM23.6 12.2c0-.9-.1-1.6-.3-2.3H12v4.6h6.6c-.3 1.5-1.2 2.7-2.5 3.6l3.8 2.9c2.2-2 3.6-5.1 3.6-8.8zM6.2 14.6C5.7 13.5 5.5 12.3 5.5 11s.2-2.5.7-3.6L2.2 4.5C.7 7 .7 9.9 2.2 12.2l3.8 2.9c-.2-.3-.3-.6-.3-.9zm5.8 6.8c2.4 0 4.3-.8 5.7-2.2l-3.8-2.9c-.7.5-1.5.7-2.4.7-1.8 0-3.3-1.2-3.8-2.8l-3.8 2.9c1.9 3.8 6 6.3 10.1 6.3z"/>
          </svg>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
