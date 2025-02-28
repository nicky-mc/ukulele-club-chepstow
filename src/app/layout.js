import "./globals.css";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { auth } from "./lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

export default function Layout ( { children } ) {
  const [ user ] = useAuthState( auth );

  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-100">
        <Navbar />
        <div className="flex">
          { user && <Sidebar /> }
          <main className={ `flex-1 ${ user ? "ml-64" : "" }` }>
            { children }
          </main>
        </div>
      </body>
    </html>
  );
}