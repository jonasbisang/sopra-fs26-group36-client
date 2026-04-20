"use client"; 


import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { useRouter } from "next/navigation";  //use NextJS router for navigation
import { Button, Form, Input, message } from "antd";
import { 
  CalendarOutlined, 
  UserOutlined, 
  LogoutOutlined,  
  RightOutlined,
  PlusOutlined
} from "@ant-design/icons"; // Ant Design icons for the UI
import { useState } from "react";

import NextImage from 'next/image';
import logo from '../friendlerLogo.png';

interface JoinGroupValues { // creating case for joinging a group
    groupId: string;
    joinPassword: string;
}

interface CreateGroupValues { // creating case for creating a group
    newGroupName: string;
    password: string;
}

interface Group {
    id: number;
    name: string;
    members?: number;
}

const Dashboard: React.FC = () => { //creating the dashboard component
    const router = useRouter(); // to navigate to other pages
    const apiService = useApi();
    const [messageApi, contextHolder] = message.useMessage(); //shows messages to the user

    const { clear: clearToken } = useLocalStorage<string>("token", ""); // removing the token as this will be used for logging out 
    const { clear: clearUserId } = useLocalStorage<string>("userId", "");
    const { value: userId } = useLocalStorage<string>("userId", "");

    const [joinForm] = Form.useForm(); //created controlers to join groups 
    const [createForm] = Form.useForm();

    const [groups] = useState([ // test code to be able to use for the design 
        { id: 1, name: "Weekend Warriors", members: 2 },
        { id: 2, name: "Book Club", members: 1 }
        ]);

    const handleLogout = () => { // to logout the user
    clearToken(); // Remove token from local storage
    clearUserId(); // Remove userId from local storage
    messageApi.success("Logged out successfully."); // Show success message
    router.push("/login"); // Redirect to login page
    };

    const handleJoinGroup = async (values: JoinGroupValues) => {
      try {
        await apiService.post<Group>(`/groups/${values.groupId}/members`, {
          joinPassword: values.joinPassword,
        });
        messageApi.success("Successfully joined group!");
        router.push(`/groups/${values.groupId}`);
      } catch (error) {
        if (error instanceof Error) {
          alert(`Failed to join group:\n${error.message}`);
        }
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
          {/* <h1 style={{ // the logo should take you to the dashboard when clicked
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
          </h1> */}
        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                        <NextImage
                          src={logo}
                          alt="Friendler Logo"
                          height={160}
                          width={480}
                        />
                        </div>

        <div style={{ display: 'flex', gap: '20px' }}>
          <Button type="text" icon={<CalendarOutlined />} style={{ color: "white" }}>Calendar</Button>
          <Button type="text" icon={<UserOutlined />} onClick={() => router.push(`/users/${userId}`)} style={{ color: "white" }}>My Profile</Button>
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
                  <RightOutlined style={{ color: '#555' }} /> {/* Right arrow icon to indicate it's clickable */}
                </div>
              ))}
            </div>
          
          </div>{/* --- RIGHT COLUMN: FORMS --- */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            
            {/* Join group form  */}
            <div style={glassBoxStyle}>
              <h3 style={{ color: 'white', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <LogoutOutlined rotate={180} /> Join a Group
              </h3>
              <Form 
                form={joinForm} // helps control the form 
                layout="vertical" 
                onFinish={handleJoinGroup} // when form is submitted successfully thene call handleJoinGroup and then the info is passed on correctly 
                requiredMark={false}
              >
                <Form.Item 
                  name="groupId" 
                  label={<span style={{ color: "#aaa", fontSize: "12px", fontWeight: "bold" }}>GROUP ID</span>} // span is used to be able to style the label of the form item
                  rules={[{ required: true, message: "Please enter the group ID" }]}
                >
                  <Input placeholder="e.g., 42" />
                </Form.Item>

                <Form.Item 
                  name="joinPassword" 
                  label={<span style={{ color: "#aaa", fontSize: "12px", fontWeight: "bold" }}>PASSWORD (IF ANY)</span>}
                >
                  <Input.Password placeholder="Enter password"/>
                </Form.Item>

                <Form.Item style={{ marginBottom: 0 }}>
                  <Button type="primary" htmlType="submit" size="large" style={{ backgroundColor: "white", color: "black", width: '100%', fontWeight: 'bold' }}>
                    Join Group
                  </Button>
                </Form.Item>
              </Form>
            </div>

            {/* CREATE GROUP FORM */}
            <div style={glassBoxStyle}>
              <h3 style={{ color: 'white', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <PlusOutlined /> Create Group {/* PlusOutlined shows the plus icon */} 
              </h3>
              <Form 
                form={createForm} 
                layout="vertical" 
                onFinish={handleCreateGroup} 
                requiredMark={false}
              >
                <Form.Item 
                  name="newGroupName" 
                  label={<span style={{ color: "#aaa", fontSize: "12px", fontWeight: "bold" }}>NEW GROUP NAME</span>}
                  rules={[{ required: true, message: "Please enter a new group name" }]}
                >
                  <Input placeholder="My New Group"/>
                </Form.Item>

                <Form.Item 
                  name="password" 
                  label={<span style={{ color: "#aaa", fontSize: "12px", fontWeight: "bold" }}>PASSWORD (OPTIONAL)</span>}
                >
                  <Input.Password placeholder="Set a password" />
                </Form.Item>

                <Form.Item style={{ marginBottom: 0 }}>
                  <Button htmlType="submit" size="large" style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "white", border: "1px solid #555", width: '100%', fontWeight: 'bold' }}>
                    Create Group
                  </Button>
                </Form.Item>
              </Form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;