"use client"; // For components that need React hooks and browser APIs, SSR (server side rendering) has to be disabled. Read more here: https://nextjs.org/docs/pages/building-your-application/rendering/server-side-rendering

import { useRouter } from "next/navigation"; // use NextJS router for navigation
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { User } from "@/types/user";
import { Button, Form, Input} from "antd";
// Optionally, you can import a CSS module or file for additional styling:
// import styles from "@/styles/page.module.css";

interface NeededFields { 
  name: string; 
  username: string; 
  password: string; 
  bio: string; 

}

const Register: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  //const [form] = Form.useForm();
  
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

  const handleRegister = async (values: NeededFields) => {
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

      // Navigate to the user overview
      router.push("/users");
    } catch (error) { 
      if (error instanceof Error) {
        alert(`Something went wrong during the registration:\n${error.message}`);
      } else {
        console.error("An unknown error occurred during register.");
      }
    }
  };

  

  return (
    <div className="login-container" 
        style={{ 
            backgroundColor: '#f3e5f5', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, //https://ant.design/docs/spec/colors
            //display: "flex", by using login contianer you get the wanted structure, yet im not sur eif it will lead to problems 
            //alignItems: "center",
            //justifyContent: "center",
            }}
    >
        <div //everything inside of this beheaves in a certain way 
            style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            maxWidth: 500,
        }}
    >
        <h2 style={{ marginBottom: 20, color:"blue" }}>Create Account</h2>

      <Form
        //form={form} //not really needed 
        size="large"
        variant="outlined"
        onFinish={handleRegister} // this is the key that calls the function when it want to send the data to the back end 
        layout="vertical"
      >


        <Form.Item
          name="name"
          label={<span style={{ color: "blue" }}>Full name</span>}
          rules={[{ required: true, message: "Please input your full name!" }]}
        >
          <Input placeholder="Enter your name" />

        </Form.Item>

        <Form.Item

          name="username"
          label={<span style={{ color: "blue" }}>Username</span>}
          rules={[{ required: true, message: "Please input your username!" }]}
      >
          <Input placeholder="Enter username" />

        </Form.Item>
        
        <Form.Item
          name="password"
          label={<span style={{ color: "blue" }}>Password</span>}
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password placeholder="Enter password" />
        </Form.Item>

        <Form.Item
          name="bio"
          label={<span style={{ color: "blue" }}>Biography</span>}
          rules={[{ required: true, message: "Please input your bio!" }]}
        >

          <Input.TextArea rows={3} placeholder="Tell us a little about yourself..." />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" className="login-button">
            Register
          </Button>

        </Form.Item>


        </Form>


    </div>

    </div>
  
  );
};

export default Register;



