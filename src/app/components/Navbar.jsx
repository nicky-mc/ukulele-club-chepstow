import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Navbar({ toggleSidebar }) {
  const [user] = useAuthState(auth);
  const router = useRouter();

  return (
    <nav className="bg-yellow-500 p-4 flex justify-between items-center">
      <button onClick={toggleSidebar} className="md:hidden text-white text-2xl">
        ☰ {/* Mobile Menu Icon */}
      </button>
      <h1 className="text-xl font-bold">🎸 Ukulele Club Chepstow</h1>
      {user ? (
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/profile")} className="bg-blue-500 text-white px-4 py-2 rounded">Profile</button>
          <button onClick={() => signOut(auth)} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
        </div>
      ) : (
        <button onClick={() => router.push("/login")} className="bg-blue-500 text-white px-4 py-2 rounded">Login</button>
      )}
    </nav>
  );
}
