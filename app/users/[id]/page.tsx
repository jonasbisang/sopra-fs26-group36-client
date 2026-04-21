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
  name: string;
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
  const { value: userId } = useLocalStorage<string>("userId", "");
  const {value: token} = useLocalStorage<string>("token", "");
  const [mounted, setMounted] = useState(false);


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
        console.log("RAW USER DATA:", data); // <-- add this
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

  useEffect(() => {
    setMounted(true);
  }, []);

  
  useEffect(() => {
    if (mounted && (!token || token === "")) {
      router.replace("/login");
    }
  }, [mounted, token, router]);



  return (
    <div style={{
      backgroundColor: "#000000",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    }}>
      {contextHolder}

      {/* HEADER matching the already existign pages exactly (also eas copied form there)*/}
      <div style={{
        width: "100%",
        padding: "20px 50px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}>
        <div style={{ cursor: "pointer" }} onClick={() => router.push("/groups")}>
          <h1 style={{
            fontSize: "32px", color: "white", margin: 0,
            fontFamily: '"Gabriel Weiss Friends Font", "Permanent Marker", cursive, sans-serif',
            letterSpacing: "2px",
          }}>
            F<span style={{ color: "#ff4238" }}>·</span>
            R<span style={{ color: "#ffdc00" }}>·</span>
            I<span style={{ color: "#42a2d6" }}>·</span>
            E<span style={{ color: "#ff4238" }}>·</span>
            N<span style={{ color: "#ffdc00" }}>·</span>
            D<span style={{ color: "#42a2d6" }}>·</span>
            L<span style={{ color: "#ff4238" }}>·</span>
            E<span style={{ color: "#ffdc00" }}>·</span>R
          </h1>
        </div>

        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <Button
            type="text"
            icon={<CalendarOutlined />}
            style={{ color: "white" }}
            onClick={() => router.push(`/users/${userId}/calendar`)}
          >
            Calendar
          </Button>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{ color: "white" }}
          >
            Logout
          </Button>
        </div>
      </div>

      {/*ACTAUL PAGE CONTENT*/}
      <div style={{ width: "100%", maxWidth: "860px", padding: "50px 20px" }}>

        {/* Back button that leads to  /groups */}
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          style={{ color: "#aaa", marginBottom: "30px", padding: 0 }}
          onClick={() => router.push("/groups")}
        >
          Back to Groups
        </Button>

        {/* PAGE TITLE + EDIT BUTTON ROW*/}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "40px",
        }}>
          <div>
            <h2 style={{
              color: "white",
              fontSize: "42px",
              margin: "0 0 6px 0",
              fontWeight: "bold",
            }}>
              My Profile
            </h2>
            <p style={{ color: "#aaa", margin: 0 }}>
              Your personal information and account details.
            </p>
          </div>

          {/* Edit button that redirects to the settings page */}
          {isOwnProfile && (
            <Button
              size="large"
              icon={<EditOutlined />}
              onClick={() => router.push(`/users/${profileId}/settings`)}
              style={{
                backgroundColor: "white",
                color: "black",
                fontWeight: "bold",
                border: "none",
                marginTop: "8px",
              }}
            >
              Edit
            </Button>
          )}
        </div>

        {/* TOP ROW: Avatar card and Stats card */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          marginBottom: "20px",
        }}>

          {/* Avatar and name card */}
          <div style={glassBoxStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
              <Avatar
                size={68}
                icon={<UserOutlined />}
                style={{ backgroundColor: "rgba(255,255,255,0.15)", flexShrink: 0 }}
              />
              <div>
                <div style={{ color: "white", fontSize: "20px", fontWeight: "bold" }}>
                  {userData?.username}
                </div>
                <div style={{ color: "#777", fontSize: "13px", marginTop: "4px" }}>
                  {userData?.name}
                </div>
              </div>
            </div>
          </div>

          {/* Stats card: groups count */}
          <div style={glassBoxStyle}>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* Groups count */}
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                <div style={{
                  width: "44px", height: "44px", borderRadius: "10px",
                  backgroundColor: "rgba(66,162,214,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <TeamOutlined style={{ color: "#42a2d6", fontSize: "18px" }} />
                </div>
                <div>
                  <div style={{ color: "#aaa", fontSize: "11px", letterSpacing: "1px", textTransform: "uppercase" }}>
                    Groups
                  </div>
                  {/* The big number */}
                  <div style={{ color: "white", fontSize: "22px", fontWeight: "bold", lineHeight: 1.2 }}>
                    {userGroups.length}
                  </div>
                </div>
          </div>
        </div>
        </div> 
        </div>

        {/* PERSONAL INFORMATION CARD*/}
        <div style={glassBoxStyle}>
          <h3 style={{
            color: "white",
            margin: "0 0 24px 0",
            fontSize: "16px",
            fontWeight: "bold",
          }}>
            Personal Information
          </h3>

          {/* Username and Email side by side */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>

            {/* Username box */}
            <div>
              <span style={labelStyle}>
                <UserOutlined style={{ marginRight: "6px" }} />
                Username
              </span>
              <div style={fieldBoxStyle}>
                {userData?.username}
              </div>
            </div>

            {/* Email box */}
            <div>
              <span style={labelStyle}>
                <MailOutlined style={{ marginRight: "6px" }} />
                Email Address
              </span>
              <div style={fieldBoxStyle}>
                {userData?.email}
              </div>
            </div>
          </div>

          {/* Bio box full width */}
          <div>
            <span style={labelStyle}>
              <InfoCircleOutlined style={{ marginRight: "6px" }} />
              Bio
            </span>
            <div style={{
              ...fieldBoxStyle,
              minHeight: "90px",
              color: userData?.bio ? "white" : "#555",
            }}>
              {userData?.bio}
            </div>
          </div>
        </div>

        {/* SIGN OUT CARD */}
        {isOwnProfile && (
          <div style={{
            ...glassBoxStyle,
            marginTop: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 30px",
          }}>
            <div>
              <div style={{ color: "white", fontWeight: "bold" }}>Sign Out</div>
              <div style={{ color: "#777", fontSize: "13px" }}>
                Log out of your Friendler account.
              </div>
            </div>
            <Button
              icon={<LogoutOutlined />}
              danger
              style={{ fontWeight: "bold" }}
              onClick={handleLogout}
            >
              Sign Out
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserprofilePage;