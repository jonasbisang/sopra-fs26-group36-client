// your code here for S2 to display a single user profile after having clicked on it
// each user has their own slug /[id] (/1, /2, /3, ...) and is displayed using this file
// try to leverage the component library from antd by utilizing "Card" to display the individual user
// import { Card } from "antd"; // similar to /app/users/page.tsx
"use client";
import { useRouter, useParams } from "next/navigation"; // use NextJS router for navigation
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/user";
import { Button } from "antd";
import { useEffect, useState } from "react"
import { Card } from "antd";
import React from "react";
import useLocalStorage from "@/hooks/useLocalStorage";

// For components that need React hooks and browser APIs,
// SSR (server side rendering) has to be disabled.
// Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

const UserProfile: React.FC = () => {
const params = useParams();
const router = useRouter();
const userId = params.id;

const apiService = useApi();
const [user, setUser] = useState<User | null>(null);
const [loading, setLoading] = useState(true);
const {value: token} = useLocalStorage<string>("token", "");
const [mounted, setMounted] = useState(false);

useEffect(() => {
    setMounted(true);
  }, []);

  
useEffect(() => {
    if (mounted && (!token || token === "")) {
      router.replace("/login");
    }
  }, [mounted, token, router]);


useEffect(() => {
    const fetchUser = async () =>{
        if (mounted && userId){
            try{
              const response= await apiService.get<User>(`/users/${userId}`);
            setUser(response);
            }catch (error){
              console.error("Failed to load username;", error);
            }
        }
    };
    fetchUser();
}, [mounted, userId]);
useEffect(() =>{
  if (!userId) return;
  const fetchUser = async () => {
    try{
      const response = await apiService.get<User>(`/users/${userId}`);
      setUser(response);
    } catch(error) {
      console.error("Error fetching this user!:",error);
    } finally{
      setLoading(false);
    }
  };
  fetchUser();
}, [userId, apiService]);

if (loading) return <p>Loading user profile...</p>;
if (!user) return <p>User could not be found</p>;
return(
  <div style={{display: "flex", justifyContent:"center", overflowWrap: "break-word",marginTop: "100px"}}>
<Card title="User Profile" style={{width: 350}}>
<p><strong>Name:</strong> {user.name}</p>
<p><strong>Username:</strong> {user.username}</p>
<p><strong>Biography:</strong>  {user.biography || "No biography available!"}</p>
<p><strong>Creation date:</strong>  {user.creationDate}</p>
<p><strong>Status:</strong> {user.status}</p>
<Button style={{marginTop:"50px"}} onClick={() => router.back()}>
  Back
</Button>
</Card>
</div>
);
};
export default UserProfile;