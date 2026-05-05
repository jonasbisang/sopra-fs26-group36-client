"use client"; 

import React, { useEffect, useState } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";
import type { TableProps } from "antd";
import { useRouter} from "next/navigation"; // use NextJS router for navigation
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import { Button, Table} from "antd";
import { LogoutOutlined, UserOutlined, CalendarOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import NextImage from 'next/image';
import logo from '@/friendlerLogo.png';


const Overview: React.FC = () => {
const router = useRouter();
const { value: userId } = useLocalStorage<string>("userId", "");
const { clear: clearToken } = useLocalStorage<string>("token", "");
const apiService = useApi();
const {value: token} = useLocalStorage<string>("token", "");
const [mounted, setMounted] = useState(false);
const [users, setUsers] = useState<User[]>([]);
const columns: TableProps<User>["columns"] = [
  { title: "Username", dataIndex: "username", key: "username", render: (text) => <span style={{ color: "white" }}>{text}</span> },
  { title: "Name", dataIndex: "name", key: "name", render: (text) => <span style={{ color: "white" }}>{text}</span> },];
const [groupUserIds, setGroupUserIds] = useState<Set<string>>(new Set());
const [showGroupOnly, setShowGroupOnly] = useState(false);

useEffect(() => {
    setMounted(true);
  }, []);

  
useEffect(() => {
    if (mounted && (!token || token === "")) {
      router.replace("/login");
    }
  }, [mounted, token, router]);


useEffect(() => {
    if (!userId) return;  
      const fetchUsers = async () => {
      try {
        const users: User[] = await apiService.get<User[]>("/users");
        const filteredUsers = users.filter(user=> String(user.id) !== String(userId));
        setUsers(filteredUsers);
      } catch (error) {
        if (error instanceof Error) {
          alert(`Something went wrong while fetching users:\n${error.message}`);
        } else {
          console.error("An unknown error occurred while fetching users.");
        }
      }
    };

    fetchUsers();
  }, [userId, apiService]);

const handleLogout = () => {
  clearToken();
  router.push("/login");
};

useEffect(() => {
  if (!userId || !token) return;
  const fetchGroupUsers = async () => {

    try {
      const groups = await apiService.get<{id: number}[]>(`/users/${userId}/groups`);
      const memberIds = new Set<string>();
      for (const group of groups) {
        const members = await apiService.get<{id: number}[]>(`/groups/${group.id}/members`); //Okay for now, but if we would scale our application this would be a bad impl.
        members.forEach(m => memberIds.add(String(m.id)));                                     // Might change if time later on!
      }
      memberIds.delete(String(userId));
      setGroupUserIds(memberIds);
    } catch (error) {
      console.error("Error while trying to load group members:", error);
    }
  };
  fetchGroupUsers();
}, [userId, token, apiService]);



return(
 <div style={{ backgroundColor: "#000000", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center" }}>
    
    
    <div style={{ width: "100%", padding: "10px 25px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <NextImage src={logo} alt="Friendler Logo" height={160} width={480} />
      </div>

      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        <Button type="text" icon={<CalendarOutlined />} style={{ color: "white" }} onClick={() => router.push(`/users/${userId}/calendar`)}>Calendar</Button>
        <Button type="text" icon={<UserOutlined />} onClick={() => router.push(`/users/${userId}`)} style={{ color: "white" }}>My Profile</Button>
        <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout} style={{ color: "white" }}>Logout</Button>
      </div>
    </div>

    <div style={{ width: "100%", maxWidth: "860px", padding: "50px 20px" }}>

    <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          style={{ color: "#aaa", marginBottom: "15px", padding: 0 }}
          onClick={() => router.push("/groups")}
        >
          Back to Groups
        </Button> 
        </div>


    <div style={{ width: "100%", maxWidth: "860px", padding: "10px 5px" }}>
      <h2 style={{ color: "white", fontSize: "42px", marginBottom: "15px", fontWeight: "bold" }}>
        All Users
        </h2>

            <Button 
                type={showGroupOnly ? "primary" : "default"}
                onClick={() => setShowGroupOnly(!showGroupOnly)}
                style={{ marginBottom: "20px" }}
            >
                My Group Members
            </Button>


      <div style={{ backgroundColor: "rgba(126,126,126,0.2)", borderRadius: "12px", padding: "28px 30px", border: "1px solid rgba(255,255,255,0.08)" }}>
        <Table<User>
          columns={columns}
          dataSource={showGroupOnly ? users.filter(u => groupUserIds.has(String(u.id))) : users}
          loading={!users}
          rowKey="id"
          onRow={(row) => ({
            onClick: () => {
            if (groupUserIds.has(String(row.id))) {
            router.push(`/users/overview/${row.id}`);
             }},
            style: { 
            cursor: groupUserIds.has(String(row.id)) ? "pointer" : "not-allowed",
            opacity: groupUserIds.has(String(row.id)) ? 1 : 0.5,
          },})}
        />


            </div>
        </div>
    </div>

);
};
export default Overview;