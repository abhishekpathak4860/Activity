"use client";
import { useState, useEffect } from "react";

export default function Header() {
  const [user, setUser] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("current_user");
    if (storedUser) setUser(storedUser);
  }, []);

  const logout = () => {
    localStorage.removeItem("current_user");
    window.location.reload();
  };

  return (
    <header className="border-b-4 border-black bg-white p-4 md:px-8 sticky top-0 z-50 text-black">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-black uppercase italic tracking-tighter text-blue-600">
          Samurai Stream
        </h1>

        {/* Mobile Toggle Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden border-2 border-black p-1"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M4 6h16M4 12h16m-7 6h7"
            ></path>
          </svg>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-6 items-center">
          <div className="flex items-center gap-2 font-black uppercase text-sm">
            <span className="bg-black text-white px-2 py-0.5 italic">Live</span>
            <span>{user || "Unauthorized"}</span>
          </div>
          <button
            onClick={logout}
            className="bg-white border-2 border-black px-4 py-1 text-xs font-black uppercase hover:bg-black hover:text-white transition-all"
          >
            Switch User
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t-2 border-black flex flex-col gap-4 animate-in fade-in slide-in-from-top-4">
          <p className="font-black uppercase text-sm">Identity: {user}</p>
          <button
            onClick={logout}
            className="w-full bg-black text-white py-3 font-black uppercase text-sm"
          >
            Switch User Identity
          </button>
        </div>
      )}
    </header>
  );
}
