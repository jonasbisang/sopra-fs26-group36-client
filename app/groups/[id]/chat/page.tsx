"use client";
import { useRouter, useParams } from "next/navigation";

const ChatPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id;

  return (
    <div style={{ backgroundColor: "#000", minHeight: "100vh", color: "white", padding: "40px" }}>
      <h1>Group Chat</h1>
      <p style={{ color: "rgba(255,255,255,0.4)" }}>Coming soon...</p>
    </div>
  );
};

export default ChatPage;