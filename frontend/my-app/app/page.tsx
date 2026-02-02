"use client";

import Footer from "@/src/components/Footer";
import Header from "@/src/components/Header";
import { useSocket } from "@/src/context/SocketContext";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [feedItems, setFeedItems] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [timeWindow, setTimeWindow] = useState("1m");
  const [isLoading, setIsLoading] = useState(false); // New Loading State
  const socket = useSocket();

  useEffect(() => {
    const user = localStorage.getItem("current_user");
    if (user) {
      setIsLoggedIn(true);
      fetchFeed();
      fetchAnalytics();
    }
  }, []);

  const fetchFeed = async (isLoadMore = false) => {
    const userId = localStorage.getItem("current_user");
    if (!userId) return;

    setIsLoading(true); // Start Loading
    try {
      const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/events/feed?user_id=${userId}${cursor && isLoadMore ? `&cursor=${cursor}` : ""}`;
      const response = await axios.get(url);
      if (isLoadMore) {
        setFeedItems((prev) => [...prev, ...response.data.items]);
      } else {
        setFeedItems(response.data.items);
      }
      setCursor(response.data.next_cursor);
    } catch (error) {
      console.error("Error fetching feed:", error);
    } finally {
      setIsLoading(false); // Stop Loading
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/events/top?window=${timeWindow}`,
      );
      setTrending(response.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      const interval = setInterval(fetchAnalytics, 10000);
      return () => clearInterval(interval);
    }
  }, [timeWindow, isLoggedIn]);

  useEffect(() => {
    if (!socket) return;
    socket.on("notification", (data) => {
      setNotifications((prev) => [data, ...prev]);
    });
    return () => {
      socket.off("notification");
    };
  }, [socket]);

  const handleLogin = (userId: string) => {
    localStorage.setItem("current_user", userId);
    window.location.reload();
  };

  // LANDING PAGE VIEW
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 text-black">
        <div className="max-w-md w-full bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h1 className="text-4xl font-black mb-2 uppercase italic text-blue-600">
            Samurai Stream
          </h1>
          <p className="font-bold mb-8 border-b-2 border-black pb-4">
            Real-time Activity & Global Insights
          </p>
          <div className="space-y-4">
            <button
              onClick={() => handleLogin("user_a")}
              className="w-full bg-blue-600 text-white font-black py-4 uppercase border-2 border-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              Enter as User A
            </button>
            <button
              onClick={() => handleLogin("user_b")}
              className="w-full bg-white text-black font-black py-4 uppercase border-2 border-black hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              Enter as User B
            </button>
          </div>
        </div>
      </div>
    );
  }

  // MAIN DASHBOARD VIEW
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-black">
      <Header />
      <main className="flex-grow max-w-7xl mx-auto w-full p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT: Feed Section */}
        <section className="lg:col-span-7 bg-white border-2 border-black rounded-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <div className="p-4 border-b-2 border-black bg-blue-50 flex justify-between items-center">
            <h2 className="font-black uppercase italic tracking-tighter">
              Your Activity Stream
            </h2>
            <button
              onClick={() => fetchFeed()}
              disabled={isLoading}
              className={`text-xs font-black bg-black text-white px-3 py-1 rounded-full uppercase ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {isLoading ? "Fetching..." : "Refresh"}
            </button>
          </div>
          <div className="p-4 space-y-4 overflow-y-auto max-h-[700px]">
            {isLoading && feedItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-black uppercase italic animate-pulse">
                  Waking up Render backend...
                </p>
              </div>
            ) : feedItems.length === 0 ? (
              <div className="p-12 border-2 border-dashed border-black text-center font-bold italic opacity-40">
                No records found...
              </div>
            ) : (
              feedItems.map((item, i) => (
                <div
                  key={i}
                  className="p-4 border-2 border-black bg-white hover:bg-gray-50 transition-colors"
                >
                  <span className="font-black text-blue-600 uppercase underline mr-2">
                    {item.actor_id}
                  </span>
                  <span className="font-bold uppercase text-sm">
                    {item.verb}ED YOUR {item.object_type}
                  </span>
                  <p className="text-[10px] mt-2 font-black text-black opacity-60 italic">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
            {cursor && (
              <button
                onClick={() => fetchFeed(true)}
                disabled={isLoading}
                className="w-full py-4 bg-black text-white font-black uppercase hover:bg-gray-800 disabled:bg-gray-600"
              >
                {isLoading ? "Loading Data..." : "Load More History"}
              </button>
            )}
          </div>
        </section>

        {/* RIGHT: Stats & Alerts */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          {/* Real-time Alerts */}
          <section className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-h-[300px] flex flex-col">
            <div className="p-4 border-b-2 border-black bg-green-50 flex justify-between items-center">
              <h2 className="font-black uppercase italic tracking-tighter">
                Live Signals
              </h2>
              <div className="h-3 w-3 bg-green-500 rounded-full animate-ping"></div>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto max-h-[400px]">
              {notifications.length === 0 ? (
                <div className="text-xs font-bold uppercase opacity-40 italic">
                  Listening for incoming events...
                </div>
              ) : (
                notifications.map((n, i) => (
                  <div
                    key={i}
                    className="p-3 border-2 border-black bg-white animate-in slide-in-from-right-full duration-500"
                  >
                    <span className="font-black uppercase text-blue-600 underline">
                      {n.actor_id}
                    </span>
                    <span className="font-bold text-xs ml-2">
                      TRIGGERED: {n.verb}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Global Trends */}
          <section className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] h-[350px] flex flex-col">
            <div className="p-4 border-b-2 border-black bg-yellow-50 flex justify-between items-center">
              <h2 className="font-black uppercase italic tracking-tighter">
                Global Trends
              </h2>
              <select
                value={timeWindow}
                onChange={(e) => setTimeWindow(e.target.value)}
                className="text-xs font-black border-2 border-black p-1 bg-white focus:outline-none"
              >
                <option value="1m">LAST 60 SEC</option>
                <option value="5m">LAST 5 MIN</option>
                <option value="1h">LAST 1 HOUR</option>
              </select>
            </div>
            <div className="p-4 space-y-2 overflow-y-auto">
              {trending.map((t, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center border-b-2 border-gray-100 py-2 group"
                >
                  <span className="text-[11px] font-black uppercase text-black group-hover:text-blue-600 transition-colors">
                    {t.verb} » {t.object_id}
                  </span>
                  <span className="bg-black text-white text-[10px] px-3 py-1 font-black italic">
                    {t._count.object_id}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
