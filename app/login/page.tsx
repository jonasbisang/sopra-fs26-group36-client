"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import { useRouter } from "next/navigation"; // use NextJS router for navigation
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Form, Input, message } from "antd"; //added message as i also want the server to communicate with user 
// Optionally, you can import a CSS module or file for additional styling:
// import styles from "@/styles/page.module.css";

interface LoginValues {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [form] = Form.useForm();
  // useLocalStorage hook example use
  const [messageApi, contextHolder] = message.useMessage(); // use the message component from antd to display success or error messages

  // The hook returns an object with the value and two functions
  // Simply choose what you need from the hook:
  const {
    // value: token, // is commented out because we do not need the token value
    set: setToken, // we need this method to set the value of the token to the one we receive from the POST request to the backend server API
    // clear: clearToken, // is commented out because we do not need to clear the token when logging in
  } = useLocalStorage<string>("token", ""); // note that the key we are selecting is "token" and the default value we are setting is an empty string
  // if you want to pick a different token, i.e "usertoken", the line above would look as follows: } = useLocalStorage<string>("usertoken", "");
  
  const {set: setUserId} = useLocalStorage<string>("userId", ""); // we need this method to set the value of the userId to the one we receive from the POST request to the backend server API
 
  const handleLogin = async (values: LoginValues) => {
    try {
      // Call the API service and let it handle JSON serialization and error handling
      const response = await apiService.post<User>("/login", values);

      // Use the useLocalStorage hook that returned a setter function (setToken in line 41) to store the token if available
      if (response.token) {
        setToken(response.token);
      }

      if (response.id) {setUserId(response.id.toString());} 

      messageApi.success("Login successful! Welcome back.");

      // Navigate to the user overview
      router.push("/groups");
    } catch (error) {
      if (error instanceof Error) {
        alert(`Something went wrong during the login:\n${error.message}`);
      } else {
        console.error("An unknown error occurred during login.");
      }
    }
  };

  return (
    <div style = {{
      backgroundColor: "#000000",
      minHeight: '100vh', // full viewport height
      display: 'flex', //type of design 
      flexDirection:'column', //important for the design to work, fo rwhen we want to create a header adn so on 
      alignItems: 'center',
      justifyContent: 'center', //horizontal centering
    }}>
      
      {contextHolder} {/* This is required for the message component to work */}

      <div style={{ //cointainer for log in form like in the mockups 
        width: '100%', maxWidth: 600, padding: '30px', 
        backgroundColor: 'rgba(126, 126, 126, 0.2)', borderRadius: '12px' 
      }}>

      <h1 style={{ 
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
      </h1>

        <p style={{ color: 'white', textAlign: 'center', marginBottom: '30px', fontWeight: 'bold' }}>
          SIGN IN
        </p>

      <Form
          form={form} 
          onFinish={handleLogin}
          layout="vertical"
          requiredMark={false}
          style={{ 
            maxWidth: '300px', // Makes the inputs and buttons much shorter!
            margin: '0 auto'   // Centers the shorter form perfectly inside the wide grey box
          }} 
        >

          <Form.Item
            name="username"
            label={<span style={{ color: "white" }}>Username</span>}
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input placeholder="Enter username" />
          </Form.Item>

          <Form.Item
            name="password"
            label={<span style={{ color: "white" }}>Password</span>}
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input placeholder="Enter password" />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" size = "large" htmlType="submit" className="login-button"
              style = {{ backgroundColor: "white", color: 'black'}}>
              Login
            </Button>
          </Form.Item>
          <Form.Item>
            <Button className="login-button" size = "large" onClick = {() => router.push("/register")} 
            style = {{ backgroundColor: "white", color: 'black'}}>
              Register
            </Button>
          </Form.Item>
      </Form>
    </div>
  </div>
  );
};

export default Login;
