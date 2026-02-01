"use client";
import axios from "axios";
import { useState } from "react";

export default function Footer() {
  const [commentText, setCommentText] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);

  const simulateAction = async (verb: string, payload?: string) => {
    const actorId = localStorage.getItem("current_user");
    const targetId = actorId === "user_a" ? "user_b" : "user_a";

    if (!actorId) return;

    let objectType = "POST";
    let objectId = "post_123";

    if (verb === "FOLLOW") {
      objectType = "USER";
      objectId = targetId;
    } else if (verb === "COMMENT") {
      objectType = "COMMENT";
      objectId = payload || "Quick Insight";
    }

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/events`, {
        actor_id: actorId,
        verb,
        object_type: objectType,
        object_id: objectId,
        target_user_id: targetId,
      });
      setCommentText("");
      setIsCommenting(false);
    } catch (error) {
      console.error("Broadcast failed:", error);
    }
  };

  return (
    <footer className="border-t-4 border-black bg-white p-6 mt-auto text-black font-black">
      <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">
        <p className="uppercase italic text-sm tracking-widest border-b-2 border-black">
          Broadcast Action
        </p>

        <div className="flex flex-col items-center gap-4 w-full">
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => simulateAction("LIKE")}
              className="bg-white border-2 border-black px-8 py-3 uppercase hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
            >
              Like
            </button>
            <button
              onClick={() => setIsCommenting(!isCommenting)}
              className="bg-white border-2 border-black px-8 py-3 uppercase hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
            >
              Comment
            </button>
            <button
              onClick={() => simulateAction("FOLLOW")}
              className="bg-white border-2 border-black px-8 py-3 uppercase hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
            >
              Follow
            </button>
          </div>

          {isCommenting && (
            <div className="flex flex-col md:flex-row gap-3 w-full max-w-lg animate-in zoom-in-95 duration-300">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Type broadcast message..."
                className="flex-grow border-2 border-black p-3 text-black font-bold outline-none focus:ring-4 focus:ring-blue-200"
              />
              <button
                onClick={() => simulateAction("COMMENT", commentText)}
                className="bg-black text-white px-8 py-3 uppercase border-2 border-black"
              >
                Transmit
              </button>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
