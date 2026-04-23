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
      if (error instanceof Error) {
        if (error.message.includes("409")) {
        messageApi.error("Username already exists.");
      } else if (error.message.includes("400")) {
        messageApi.error("Invalid input. Please check your data.");
      } else if (error.message.includes("Network")) {
        messageApi.error("Network error. Please try again.");
      } else {
        messageApi.error(`Registration failed: ${error.message}`);//shows the original message to the user
      }
    } else {
      messageApi.error("An unknown error occurred.");
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
            justifyContent: "center",

            }}>

          {contextHolder}

        <div style={{ 
          width: '100%', 
          maxWidth: 600, //again similar to log in 
          padding: '30px', 
          backgroundColor: 'rgba(0, 0, 0, 0.1)', // adding the lgo in properties 
          borderRadius: '12px' 
        }}>
      
{/* <h1 style={{ 
          fontSize: '64px', 
          textAlign: 'center', 
          color: 'white', 
          margin: 0,
    
          fontFamily: '"Gabriel Weiss Friends Font", "Permanent Marker", cursive, sans-serif', // custom font for logo 
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
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <NextImage
          src={logo}
          alt="Friendler Logo"
          height={160}
          width={480}
        />
        </div>

      {/* <img src={friendlerLogo.src} alt="Friendler Logo" style={{ width: '200px', marginBottom: '20px' }} /> */}


        <p style={{ color: 'white', letterSpacing: '2px', marginBottom: '40px', textAlign: 'center', fontSize: '12px', fontWeight: 'bold' }}>
          CREATE YOUR ACCOUNT
        </p>

      <Form
        //form={form} //not really needed 
        size="large"
        variant="outlined"
        onFinish={handleRegister} // this is the key that calls the function when it want to send the data to the back end 
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
          rules={[{ required: true, message: "Please input your full name!" }]}
        >
          <Input placeholder="Enter your name" style={inputStyle} />

        </Form.Item>

        <Form.Item

          name="username"
          label={<span style={{ color: "white" }}>Username</span>}
          rules={[{ required: true, message: "Please input your username!" }]}
      >
          <Input placeholder="Enter username" style={inputStyle} />

        </Form.Item>
        
        <Form.Item
          name="password"
          label={<span style={{ color: "white" }}>Password</span>}
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password placeholder="Enter password" style={inputStyle} />
        </Form.Item>

        <Form.Item
          name="bio"
          label={<span style={{ color: "white" }}>Biography</span>}
          rules={[{ message: "Please input your bio!" }]}
        >

          <Input.TextArea rows={3} placeholder="Tell us a little about yourself..." style={inputStyle} />
        </Form.Item>

        <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" block   loading={loading} disabled={loading} style={{ backgroundColor: "white", color: 'black', fontWeight: 'bold' }}>
              Register
            </Button>
          </Form.Item>

          </div>

          <div style={{ textAlign: 'center' }}>
        
          <Form.Item>
            <Button size = "middle" block onClick={() => router.push('/login')} style={{ backgroundColor: "white", color: 'black', fontWeight: 'bold'}}>
              Already have an account? 
            </Button>
          </Form.Item>
          </div>
        </Form>


    </div>

    </div>
  
  );
};

export default Register;



