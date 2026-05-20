"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import { useRouter } from "next/navigation"; // use NextJS router for navigation
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Form, Input, message} from "antd";
import React, { useState } from "react";
// Optionally, you can import a CSS module or file for additional styling:
// import styles from "@/styles/page.module.css";
import NextImage from 'next/image';
import logo from '../friendlerLogo.png';
import { ArrowRightOutlined } from "@ant-design/icons";

interface NeededFields { 
  name: string; 
  username: string; 
  password: string; 
  email: string; 
  bio?: string; 

}

const Register: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  //const [form] = Form.useForm();

  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(false);
  // useLocalStorage hook example use
  // The hook returns an object with the value and two functions
  // Simply choose what you need from the hook:
  const {
    // value: token, // is commented out because we do not need the token value
    set: setToken, // we need this method to set the value of the token to the one we receive from the POST request to the backend server API
    // clear: clearToken, // is commented out because we do not need to clear the token when logging in
  } = useLocalStorage<string>("token", ""); // note that the key we are selecting is "token" and the default value we are setting is an empty string
  // if you want to pick a different token, i.e "usertoken", the line above would look as follows: } = useLocalStorage<string>("usertoken", "");

  const { 

    set: setUserId 
  
  } = useLocalStorage<string>("userId", "");

  const inputStyle = {
    backgroundColor: '#2a2a2a', // Grey backgroufnd for input fields
    color: 'white',             // White text
    borderColor: '#434343',     // border to define the input fields
  };



  const handleRegister = async (values: NeededFields) => {
    setLoading(true);
    try {

      // Call the API service and let it handle JSON serialization and error handling
      const response = await apiService.post<User>("/users", values);

      // Use the useLocalStorage hook that returned a setter function (setToken in line 41) to store the token if available
      if (response.token) {
        setToken(response.token);
      }
      if (response.id) {
        setUserId(response.id.toString());
      }
      // Navigate to the groups dashboard overview
      messageApi.success("Account successfully created!");
      router.push("/groups");
    
    } catch (error) {
      const appError = error as { status?: number; message?: string };
      const msg = appError.message ?? "";

      if (msg.includes("username and the email")) {
        messageApi.error("This username and email are already taken.");
      } else if (msg.includes("username")) {
        messageApi.error("This username is already taken.");
      } else if (msg.includes("Email")) {
        messageApi.error("This email is already taken.");
      } else if (appError.status === 400) {
        messageApi.error("Invalid input. Please check your details.");
      } else {
        messageApi.error("Registration failed. Please try again.");
      }

    } finally {
      setLoading(false); // always stop loading
    }
  };

  

  return (
      <div style={{
            backgroundColor: '#000000', top: 0, left: 0, right: 0, bottom: 0, //https://ant.design/docs/spec/colors
            minHeight: '100vh',
            display: "flex",// by using login contianer you get the wanted structure, yet im not sur eif it will lead to problems 
            flexDirection: 'column',
            alignItems: "center",
            justifyContent: "center"
            }}>

          {contextHolder}

        <div style={{ 
          width: '100%', 
          maxWidth: 600, //again similar to log in 
          padding: '30px', 
          backgroundColor: 'rgba(0, 0, 0, 0.1)', // adding the lgo in properties 
          borderRadius: '12px' 
        }}>
      
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <NextImage
          src={logo}
          alt="Friendler Logo"
          height={160}
          width={480}
        />
        </div>

        <p style={{ color: 'white', letterSpacing: '2px', marginBottom: '40px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>
          CREATE YOUR ACCOUNT
        </p>

      <Form
        size="large"
        variant="outlined"
        onFinish={handleRegister} 
        layout="vertical"
        requiredMark={false}
        style={{ 
          maxWidth: '300px', 
          margin: '0 auto' 
        }}
      >

      <div style={{ //cointainer for log in form like in the mockups 
        width: '100%', maxWidth: 600, padding: '30px', 
        backgroundColor: 'rgba(126, 126, 126, 0.2)', borderRadius: '12px', marginBottom: '30px'
      }}>

        <Form.Item
            name="email"
            label={<span style={{ color: "white" }}>Email</span>}
            rules={[{ required: true, type: 'email', message: "Valid email required" }]}
        > 
            <Input placeholder="Email" style={inputStyle} /> 
          </Form.Item>

        <Form.Item
          name="name"
          label={<span style={{ color: "white" }}>Full name</span>}
          rules={[{ required: true, message: "Please input your full name!" },
            {pattern: /^(?=.*[a-zA-Z])[a-zA-Z ]{1,40}$/,
            message: "No special characters allowed"}
          ]}
        >
          <Input placeholder="Enter your name" style={inputStyle} />

        </Form.Item>

        <Form.Item

          name="username"
          label={<span style={{ color: "white" }}>Username</span>}
          rules={[{ required: true, message: "Please input your username!" },
                   {pattern: /^[a-zA-Z0-9 ]{1,40}$/,
            message: "Only letters and numbers allowed"}
          ]}
      >
          <Input placeholder="Enter username" style={inputStyle} />

        </Form.Item>
        
        <Form.Item
          name="password"
          label={<span style={{ color: "white" }}>Password</span>}
          rules={[{ required: true, message: "Please input your password!" },
            {pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[*_#@%^&,.+/\-!?])[^\s]{4,25}$/,
            message: "At least 4 characters. Special characters, lower and uppercase letters needed."
          }
          ]}
        >
          <Input.Password placeholder="Enter password" style={inputStyle} />
        </Form.Item>

        <Form.Item
          name="bio"
          label={<span style={{ color: "white" }}>Biography</span>}
          rules={[{ message: "Please input your bio!" }]}
        >

          <Input.TextArea rows={3} placeholder="Tell us a little about yourself..." style={inputStyle} maxLength={160} />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block   loading={loading} disabled={loading} style={{ backgroundColor: "white", color: 'black', fontWeight: 'bold' }}>
              Register
            </Button>
          </Form.Item>

          </div>

          <div style={{ textAlign: 'center' }}>
        
        <Form.Item>
        <div
          onClick={() => router.push('/login')}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            color: "rgba(255,255,255,0.5)",
            fontSize: "14px",
            cursor: "pointer",
            marginTop: "4px",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "white")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
        >
          Already have an account? Log in
          <ArrowRightOutlined style={{ fontSize: "12px" }} />
        </div>
      </Form.Item>


    </div>
    </Form>
    </div>
    </div>
  
  );
};

export default Register;
