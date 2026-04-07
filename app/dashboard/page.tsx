"use client"; 


import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useRouter } from "next/navigation";  //use NextJS router for navigation
import { Button, Card, Form, Input, Layout, Typography, Space, message } from "antd";
import { 
  CalendarOutlined, 
  SettingOutlined, 
  LogoutOutlined, 
  UsergroupAddOutlined, 
  RightOutlined,
  PlusOutlined
} from "@ant-design/icons"; // Ant Design icons for the UI
import { useState } from "react";


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

    const [groups, setGroups] = useState([ // test code to be able to use for the design 
        { id: 1, name: "Weekend Warriors", members: 2 },
        { id: 2, name: "Book Club", members: 1 }
        ]);

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

    const glassBoxStyle: React.CSSProperties = { // value created of translucent boxes 
        backgroundColor: 'rgba(126, 126, 126, 0.2)',
        borderRadius: '12px',
        padding: '30px',
        width: '100%'
    };


    return (
    <div style = {{ // same as login page
        backgroundColor: "#000000",
        minHeight: '100vh', // full viewport height
        display: 'flex', //type of design 
        flexDirection:'column', //important for the design to work, fo rwhen we want to create a header adn so on 
        alignItems: 'center',
    }}>
        {contextHolder}
        
    <div style={{ //top header bar from the dashboard
        width: '100%', 
        padding: '20px 50px', //spaces of the box 
        display: 'flex', //places thing nicely in a row 
        justifyContent: 'space-between', //space in btw the items in the row
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.1)' // Subtle separator line
    }}>

    <div style={{ cursor: "pointer" }} onClick={() => router.push("/dashboard")}> 
          <h1 style={{ // the logo should take you to the dashboard when clicked
            fontSize: '32px', // Smaller than login page, suitable for header
            color: 'white', 
            margin: 0,
            fontFamily: '"Gabriel Weiss Friends Font", "Permanent Marker", cursive, sans-serif',
            letterSpacing: '2px'
          }}>
            F<span style={{ color: '#ff4238' }}>·</span>
            R<span style={{ color: '#ffdc00' }}>·</span>
            I<span style={{ color: '#42a2d6' }}>·</span>
            E<span style={{ color: '#ff4238' }}>·</span>
            N<span style={{ color: '#ffdc00' }}>·</span>
            D<span style={{ color: '#42a2d6' }}>·</span>
            L<span style={{ color: '#ff4238' }}>·</span>
            E<span style={{ color: '#ffdc00' }}>·</span>
            R
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          <Button type="text" icon={<CalendarOutlined />} style={{ color: "white" }}>Calendar</Button>
          <Button type="text" icon={<SettingOutlined />} style={{ color: "white" }}>Settings</Button>
          <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout} style={{ color: "white" }}>Logout</Button>
        </div>
    </div>
    
    <div style={{ width: '100%', padding: '50px 20px' }}> {/* padding stops it again from touchign the edges 
        
        {/* Page Titles whilst controlling the layout iwth the property margin (10px for bottom) */}
        <h2 style={{ color: 'white', fontSize: '48px', margin: '0 0 10px 0' }}>Your Groups</h2> 
        <p style={{ color: '#aaa', fontSize: '18px', marginBottom: '40px' }}>
          Select a group to view activities or join a new one.
        </p>

        {/* Grid layout to split left (My Groups) and right (Forms) columns */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '40px' 
        }}>

            {/* this is now for the left column, which is the groups that the user is in, this will be mapped through to show all the groups the user is in */}
        <div>
            <h3 style={{ color: 'white', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '10px' }}>
              My Groups
            </h3>
            {/* boarderBottom is the under line*/} 

            {/* flex direction stacks it all vertically under eachother*/}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
              
              {/* Map through the user's groups to render them one after each other (helps create a box per group); this is done with the trial run from up */}
              
              {groups.map((group) => (
                <div  // Each group gets this 
                  key={group.id} // for react to know which is which
                  onClick={() => router.push(`/groups/${group.id}`)}
                  style={{ 
                    ...glassBoxStyle, // Reusing the glass box style from Login
                    padding: '20px',
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    {/* Group info */}
                    <div>
                      <div style={{ color: 'white', fontWeight: 'bold', fontSize: '18px' }}>{group.name}</div>
                      <div style={{ color: '#aaa', fontSize: '14px' }}>{group.members} members</div>
                    </div>
                  </div>
                  <RightOutlined style={{ color: '#555' }} /> // Right arrow icon to indicate it's clickable
                </div>
              ))}
            </div>
          </div>

    </div>
    </div>
    </div>

    );
}; 

export default Dashboard;
