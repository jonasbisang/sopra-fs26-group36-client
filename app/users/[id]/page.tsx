// your code here for S2 to display a single user profile after having clicked on it
// each user has their own slug /[id] (/1, /2, /3, ...) and is displayed using this file
// try to leverage the component library from antd by utilizing "Card" to display the individual user
// import { Card } from "antd"; // similar to /app/users/page.tsx

"use client";
// For components that need React hooks and browser APIs,
// SSR (server side rendering) has to be disabled.
// Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import React, { useState } from "react";
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

export default Profile;