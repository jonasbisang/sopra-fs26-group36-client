"use client";
import React, { useEffect, useState } from "react";
import { Card, Button, Typography, Space, Divider, Input, Form, Spin, message } from "antd";
import { useRouter, useParams } from "next/navigation";
import { EditOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { apiService } from "@/api/apiService";  

const { Title, Text } = Typography;

const EditProfile: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const [form] = Form.useForm();  

  //states for daten
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    username: "",
    bio: "",
  });

  //Daten vom server laden beim start
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const data = await apiService.getUserById<any>(userId);
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
  }, [userId, form]);

  // Watcher für das Passwort-Feld (für das dynamische Confirm-Feld)
  const passwordValue = Form.useWatch("password", form);

  // PUT request zum Speichern der Änderungen
  const handleSave = async (values: any) => {
    try {
      setLoading(true);

      const updateData: any = {};

      if (values.username !== userData.username) {
        updateData.username = values.username;
      }
      if (values.bio !== userData.bio) {
        updateData.bio = values.bio;
      }
      if (values.password && values.password.trim() !== "") {
        updateData.password = values.password;
      }
      if (Object.keys(updateData).length === 0) {
        message.info("No changes detected.");
        setIsEditing(false);
        return; 
      }

      await apiService.updateUserById(userId, updateData);
      message.success("Profile updated successfully!");
      setUserData({ 
        username: values.username, 
        bio: values.bio 
      });
    
      setIsEditing(false);
    } catch (error: any) {
      console.error("Could not save profile data.", error);
      message.error(error.message || "Update failed.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isEditing) {
    return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}><Spin size="large" /></div>;
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "40px" }}>
      <Card style={{ width: 600, borderRadius: "12px" }}>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            type="text" 
            onClick={() => router.push(`/users/${userId}`)}
          >
            Back to Profile
          </Button>
          
          <Title level={2}>Settings</Title>
          <Divider />

          {!isEditing ? (
            /* --- watch mode --- */
            <div style={{ padding: "10px" }}>
              <div style={{ marginBottom: "20px" }}>
                <Text type="secondary">Username</Text>
                <div style={{ fontSize: "18px", fontWeight: "bold" }}>{userData.username}</div>
              </div>
              
              <div style={{ marginBottom: "30px" }}>
                <Text type="secondary">Bio</Text>
                <div style={{ fontSize: "16px" }}>{userData.bio || "No Bio available."}</div>
              </div>

              <Button 
                type="primary" 
                icon={<EditOutlined />} 
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            </div>
          ) : (
            /* --- edit mode --- */
            <Form
              form={form}
              layout="vertical"
              initialValues={userData}
              onFinish={handleSave}
            >
              <Form.Item 
                label="Username" 
                name="username" 
                rules={[
                  { required: true, message: 'Please input your username!'},
                  { validator: async (_, value) => {
                    if (!value || value === userData.username) {
                      return Promise.resolve();
                    }
                    try {
                      const users = await apiService.get<any[]>("/users");
                      const isTaken = users.some(u => u.username.toLowerCase() === value.toLowerCase());

                      if (isTaken) {
                        return Promise.reject(new Error('Username is already taken!'));
                      }
                      return Promise.resolve();
                    } catch (error) {
                      // Falls der Aufruf fehlschlägt (z.B. 401 oder 404)
                      return Promise.resolve(); 
                    }
                  }
                }
                ]}
                hasFeedback>
                <Input size="large" />
              </Form.Item>

              <Form.Item label="Bio" name="bio">
                <Input.TextArea rows={4} />
              </Form.Item>

              <Form.Item 
                label="Password" 
                name="password"
              >
                <Input.Password placeholder="Leave empty to keep current password" />
              </Form.Item>

            {passwordValue && (
              <Form.Item
                label="Confirm New Password"
                name="confirm"
                dependencies={['password']}
                rules={[
                    { required: true, message: 'Please confirm your password!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('The two passwords do not match!'));
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="Repeat your new password" />
                </Form.Item>
              )}

              <Space style={{ marginTop: "20px" }}>
                <Button type="primary" htmlType="submit">
                  Save Changes
                </Button>
                <Button onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </Space>
            </Form>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default EditProfile;