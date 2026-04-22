"use client";
import React, { useEffect, useState } from "react";
import { Button, Typography, Space, Divider, Input, Form, Spin, message, Popconfirm } from "antd";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { apiService } from "@/api/apiService"; 
import useLocalStorage from "@/hooks/useLocalStorage";

interface UserData {
  username: string;
  bio: string;
}

const { Title } = Typography;

const EditProfile: React.FC = () => {
  const router = useRouter();
  const { id: userId } = useParams() as { id: string };
  const [form] = Form.useForm();  


  const {value: token} = useLocalStorage<string>("token", "");
  const [mounted, setMounted] = useState(false);



  //states for daten
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData>({ username: "", bio: "" });

  //Daten vom server laden beim start
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        //AUTH CHECKKKK
        const loggedInUser = localStorage.getItem("userId"); 
        if (!loggedInUser || loggedInUser != userId) {
          message.error("You are not authorized to edit this profile.");
          router.push(`/users/${userId}`);
          return;
        }

        const data = await apiService.getUserById<UserData>(userId);
        setUserData({
          username: data.username,
          bio: data.bio || "",
        });
        form.setFieldsValue(data); // Form mit den geladenen Daten füllen
      } catch (error) {
        console.error("Could not load profile data.", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchUserData();
  }, [userId, form, router]);

  // Watcher für das Passwort-Feld (für das dynamische Confirm-Feld)
  const passwordValue = Form.useWatch("password", form);

  // PUT request zum Speichern der Änderungen
  const handleSave = async (values: Record<string, string>) => {
    try {
      setLoading(true);

      const updateData: Partial<UserData & { password?: string }> = {};
      let passwordChanged = false;

      if (values.username !== userData.username) {
        updateData.username = values.username;
      }
      if (values.bio !== userData.bio) {
        updateData.bio = values.bio;
      }
      if (values.password && values.password.trim() !== "") {
        updateData.password = values.password;
        passwordChanged = true;
      }
      if (Object.keys(updateData).length === 0) {
        message.info("No changes detected.");
        return; 
      }

      await apiService.updateUserById(userId, updateData);
      if (passwordChanged) {
        message.success("Password changed! Please log in again.");
        // Session beenden
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        setTimeout(() => router.push("/login"), 1500);
      } else {
        message.success("Profile updated successfully!");
        setTimeout(() => {
        router.push(`/users/${userId}`);
      }, 1500);
    }

    } catch (error) {
      console.error("Could not save profile data.", error);
      const errorMessage = error instanceof Error ? error.message : "Update failed.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      await apiService.delete(`/users/${userId}`);
      message.success("Account permanently deleted.");
      localStorage.clear(); 
      router.push("/login");
    } catch (error) {
      message.error("Could not delete account.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  
  useEffect(() => {
    if (mounted && (!token || token === "")) {
      router.replace("/login");
    }
  }, [mounted, token, router]);

  if (loading) {
    return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#000' }}>
      <Spin size="large" />
      </div>
    );
  }

  const inputStyle = { backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' };
  const labelStyle = { color: "rgba(255,255,255,0.7)", fontSize: '12px', textTransform: 'uppercase' as const };





  if (loading) {
    return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#000' }}>
      <Spin size="large" />
      </div>
    );
  }

  const inputStyle = { backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' };
  const labelStyle = { color: "rgba(255,255,255,0.7)", fontSize: '12px', textTransform: 'uppercase' as const };


return (
    <div style={{
      backgroundColor: "#000000",
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: "20px"
    }}>

    <div style={{
        width: '100%',
        maxWidth: 600,
        padding: '40px',
        backgroundColor: 'rgba(126, 126, 126, 0.2)',
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Button
            icon={<ArrowLeftOutlined />}
            type="text"
            style={{ color: 'rgba(255,255,255,0.6)', padding: 0 }}
            onClick={() => router.push(`/users/${userId}`)}
          >
            Back to Profile
          </Button>
          
        {/* Titel */}
        <Title level={1} style={{ 
          color: 'white', 
          textAlign: 'center', 
          fontSize: '42px', 
          fontWeight: 'bold',
          marginBottom: '40px' 
        }}>
          Settings
        </Title>


          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
            onFinish={handleSave}
            initialValues={userData}
          >
            {/* Username Field */}
            <Form.Item
              label={<span style={labelStyle}>Username</span>}
              name="username"
              rules={[{ required: true, message: 'Username is required' }]}
            >
              <Input 
                size="large" 
                placeholder="Enter username" 
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </Form.Item>

            {/* Bio Field */}
            <Form.Item 
              label={<span style={labelStyle}>Bio</span>} 
              name="bio"
            >
              <Input.TextArea 
                rows={4} 
                placeholder="Tell us about yourself..." 
                style={inputStyle}/>
            </Form.Item>

            <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '24px 0' }} />

            {/* Password Field */}
            <Form.Item 
              label={<span style={labelStyle}>Change Password</span>} 
              name="password"
            >
              <Input.Password 
                placeholder="Type to set new password" 
                style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
              />
            </Form.Item>

            {/* Confirm Password Field - Erscheint nur, wenn oben etwas steht */}
            {passwordValue && passwordValue.length > 0 && (
              <Form.Item
                label={<span style={{ color: "white" }}>Confirm New Password</span>}
                name="confirm"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Please confirm your password!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) return Promise.resolve();
                      return Promise.reject(new Error('Passwords do not match!'));
                    },
                  }),
                ]}
              >
                <Input.Password 
                  placeholder="Repeat your new password" 
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid #42a2d6' }}
                />
              </Form.Item>
            )}

            <Space direction="vertical" style={{ width: '100%', marginTop: '20px' }} size="middle">
              <Button
                block
                type="primary"
                size="large"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
                style={{ backgroundColor: 'white', color: 'black', fontWeight: 'bold', border: 'none', height: '50px' }}
              >
                SAVE ALL CHANGES
              </Button>

                <Popconfirm
                  title="Delete Account?"
                  description={<span style={{ color: 'black'}}>This action is permanent. All your data will be lost.</span>}
                  onConfirm={handleDeleteAccount}
                  okText="Yes, delete"
                  cancelText="Cancel"
                  okButtonProps={{ danger: true }}
                >
                <Button danger type="text" block style={{ marginTop: '10px', opacity: 0.6 }}>
                  Delete Account
                </Button>
              </Popconfirm>
            </Space>
          </Form>
        </Space>
      </div>
    </div>
  );
};

export default EditProfile;