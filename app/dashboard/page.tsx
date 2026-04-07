"use client"; 


import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useRouter } from "next/navigation";  //use NextJS router for navigation
import { Button, Card, Form, Input, Layout, Typography, Space, message } from "antd";

interface JoinGroupValues { // creating case for joinging a group 
    groupName: string;
    password: string;
}

interface CreateGroupValues { // creating case for creating a group
    newGroupName: string;
    password: string;
}

const Dashboard: React.FC = () => { //creating the dashboard component
    const router = useRouter(); // to navigate to other pages
    const apiService = useApi();
    const [messageApi, contextHolder] = message.useMessage(); //shows messages to the user

    const { clear: clearToken } = useLocalStorage<string>("token", ""); // removing the token as this will be used for logging out 
    const { clear: clearUserId } = useLocalStorage<string>("userId", "");

    const [joinForm] = Form.useForm(); //created controlers to join groups 
    const [createForm] = Form.useForm();

    const handleLogout = () => { // to logout the user
    clearToken(); // Remove token from local storage
    clearUserId(); // Remove userId from local storage
    messageApi.success("Logged out successfully."); // Show success message
    router.push("/login"); // Redirect to login page
    };

    const handleJoinGroup = async (values: JoinGroupValues) => { // for handling the join group form 
    try {
      //!!!!!!!!!!!!!!!!!// LOOK AT AGAIN FOR WHEN THE BACKEND GROUP JOINING GETS CREATED
      // Example: await apiService.post("/groups/join", values);
      console.log("Joining group with values:", values);
      messageApi.success(`Successfully requested to join: ${values.groupName}`);
      joinForm.resetFields(); // Clear the form after success
    } catch (error) {
      messageApi.error("Failed to join the group.");
    }
  };

    const handleCreateGroup = async (values: CreateGroupValues) => {
        try {
        // //!!!!!!!!!!!!!!!!!// LOOK AT AGAIN FOR WHEN THE BACKEND GROUP CREATE GETS CREATED
        // Example: await apiService.post("/groups", values);
        console.log("Creating group with values:", values);
        messageApi.success(`Successfully created group: ${values.newGroupName}`);
        createForm.resetFields(); // Clear the form after success
        } catch (error) {
        messageApi.error("Failed to create the group.");
        }
    };

    return (
    <div>
        {contextHolder}
        Dashboard
    </div>
    );
} 
