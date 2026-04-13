// your code here for S2 to display a single user profile after having clicked on it
// each user has their own slug /[id] (/1, /2, /3, ...) and is displayed using this file
// try to leverage the component library from antd by utilizing "Card" to display the individual user
// import { Card } from "antd"; // similar to /app/users/page.tsx

"use client";
// For components that need React hooks and browser APIs,
// SSR (server side rendering) has to be disabled.
// Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import React, { useState, useEffect } from "react";
import { Button, Input, Form, Spin, message, Divider, Avatar } from "antd";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage"; //cor clearing data after logout
import {
  CalendarOutlined,
  LogoutOutlined,
  UserOutlined,
  EditOutlined,
  ArrowLeftOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  MailOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons"; // icons that ive been using lately 

interface UserProfile {//what teh user profiel should looke like 
  id: number;
  username: string;
  email: string;
  bio?: string;
}

interface Group {
  id: number;
  name: string;
}

const UserprofilePage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const profileId = params.id;
  const apiService = useApi(); //TLAKIGN TO BACKEND
  const [messageApi, contextHolder] = message.useMessage(); //for messages

  const { value: loggedInUserId } = useLocalStorage<string>("userId", ""); // for if the page refreshes and we need to check if the user is still logged in 
  const { clear: clearToken } = useLocalStorage<string>("token", "");
  const { clear: clearUserId } = useLocalStorage<string>("userId", "");

  const [userData, setUserData] = useState<UserProfile | null>(null); //state for the user data if it changes should also be changed; should alwyas pertray the current stored data 
  const [userGroups, setUserGroups] = useState<Group[]>([]);
  
  const isOwnProfile = loggedInUserId === profileId; //check if the user is looking at their own profile or someone elses
  
      //Shared style matching the already existign pages
    const fieldBoxStyle: React.CSSProperties = {
    backgroundColor: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "8px",
    padding: "14px 18px",
    color: "white",
    fontSize: "15px",
    lineHeight: "1.5",
    minHeight: "48px",
    wordBreak: "break-word",
  };

  const glassBoxStyle: React.CSSProperties = {
    backgroundColor: "rgba(126, 126, 126, 0.2)",
    borderRadius: "12px",
    padding: "28px 30px",
    width: "100%",
    border: "1px solid rgba(255,255,255,0.08)",
  };

  const labelStyle: React.CSSProperties = {
    color: "rgba(255,255,255,0.5)",
    fontSize: "11px",
    fontWeight: "bold",
    letterSpacing: "1px",
    textTransform: "uppercase",
    marginBottom: "8px",
    display: "block",
  };

  useEffect(() => { //  talking to the backend to get the user data and the groups that the user is in
    const fetchAll = async () => {
      try {
        const data = await apiService.get<UserProfile>(`/users/${profileId}`);
        setUserData(data);
      } catch (error) {
        messageApi.error("Could not load profile.");
        console.error(error);
      }

      try {
        const groups = await apiService.get<Group[]>(`/users/${profileId}/groups`);
        setUserGroups(groups);
      } catch (error) {
        console.error("Could not load groups count:", error);
        setUserGroups([]);
      }
    };

    if (profileId) fetchAll();
  }, [profileId, apiService]);

    
    const handleLogout = () => {
    clearToken();
    clearUserId();
    messageApi.success("Logged out successfully.");
    router.push("/login");
  };



  return (
    <div className="card-container" style={{ padding: "20px"}}>
      <Card 
        title = "User Profile"
        extra = {
          <Button 
            type="primary" 
            onClick={() => router.push(`/users/${profileId}/settings`)}
          >
            Edit Profile
          </Button>
        }
   >
        <p><strong>Username:</strong> SampleUser</p>
        {/* Hier kommen später die echten Daten hin */}
      </Card>
    </div>
  );
};

export default UserprofilePage;
