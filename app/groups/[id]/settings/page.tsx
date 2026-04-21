"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, List, Form, Input, message, Modal, Popconfirm, Card, Typography, Space } from "antd";
import { 
  ExclamationCircleOutlined, 
  SettingOutlined,
  CalendarOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import NextImage from 'next/image';

// The path needs an extra '../' because we are inside the 'settings' folder now
import logo from '../../../friendlerLogo.png'; 

const { Title, Text } = Typography;
const { confirm } = Modal;

interface Member {
  id: number;
  username: string;
  role: "ADMIN" | "MEMBER"; // the role can either be admin or member
}

interface Group {
  id: number;
  name: string;
  adminId: number;
}

const GroupSettings: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;
  const apiService = useApi();
  
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  // Local storage hooks for user and token management for when deleting memembers, changing password, or deleting group (to validate that the user is an admin before allowing access to the page)
  const { value: currentUserId, clear: clearUserId } = useLocalStorage<string>("userId", "");
  const { clear: clearToken } = useLocalStorage<string>("token", "");

  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Member[]>([]);

  // Fetch data fake verisino
//   useEffect(() => {
//     const fetchGroupData = async () => {
//       try {
//         setGroup({
//           id: Number(groupId),
//           name: "Weekend Warriors",
//           adminId: 1
//         });

//         const fakeMembers: Member[] = [
//           { id: 1, username: "Ana", role: "ADMIN" },
//           { id: 2, username: "Jonas", role: "MEMBER" },
//           { id: 3, username: "Martha", role: "MEMBER" }
//         ];

//         setMembers(fakeMembers);
//       } catch (error) {
//         console.error("Error:", error);
//       } finally {
//         setLoading(false);
//       } // <- Cerramos correctamente el bloque finally
//     }; // <- Cerramos correctamente la función fetchGroupData

//     if (groupId) {
//       fetchGroupData();
//     }
//   }, [groupId]); // 

  //Fetch data
  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const groupData = await apiService.get<Group>(`/groups/${groupId}`);
        setGroup(groupData);

        //VALIDATION COMMENTED OUT FOR TESTING:
        
        if (groupData.adminId.toString() !== currentUserId) {
          messageApi.error("Access denied. Only administrators can view this page.");
          router.push(`/groups/${groupId}`);
          return;
        }
        

        // Using /users as defined in the REST specification
        const membersData = await apiService.get<Member[]>(`/groups/${groupId}/users`);
        setMembers(membersData);

       } catch (error) {
        console.error("Error fetching group details:", error);
        messageApi.error("Failed to load group information.");
      } finally {
        setLoading(false);
      }
    if (groupId && currentUserId) {
      fetchGroupData(); // makes sure we have the groupId from the URL and the currentUserId from local storage before trying to fetch data from the backend server API
    }
    }
  }, [groupId, currentUserId, apiService, router, messageApi]); // if any of these values change, the useEffect will run again to fetch the latest data
 

  // Header Handlers
  const handleLeaveGroup = async () => { // when admin preses leave group
    try {
      await apiService.delete(`/groups/${groupId}/members/${currentUserId}`);
      messageApi.success("Successfully left the group!");
      router.push("/groups");
    } catch (error) {
      if (error instanceof Error) {
        messageApi.error(`Failed to leave group: ${error.message}`);
      }
    }
  };

  const handleLogout = () => { // for when user wants to logout
    clearToken();
    clearUserId();
    router.push("/login");
  };

  // Kick member out
  const handleKickMember = async (memberId: number) => {
    try {
      await apiService.delete(`/groups/${groupId}/members/${memberId}`);
      messageApi.success("Member kicked successfully.");
      setMembers(members.filter((m) => m.id !== memberId));
    } catch (error) {
      messageApi.error("Failed to kick member.");
    }
  };

  // Promote member
  const handlePromoteMember = async (memberId: number) => {
    try {
      await apiService.put(`/groups/${groupId}/members/${memberId}/role`, {
        role: "ADMIN"
      });
      messageApi.success("Member promoted to admin.");
      router.push(`/groups/${groupId}`);
    } catch (error) {
      messageApi.error("Failed to promote member.");
    }
  };

  //Change password 
  const handleChangePassword = async (values: any) => {
    try {
      await apiService.put(`/groups/${groupId}/password`, {
        newPassword: values.newPassword,
      });
      messageApi.success("Password updated successfully.");
      form.resetFields();
    } catch (error) {
      messageApi.error("Failed to change password.");
    }
  };

  // Delete group
  const showDeleteConfirm = () => {
    confirm({
      title: 'Are you absolutely sure you want to delete this group?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action is irreversible. All group data will be lost forever.',
      okText: 'Delete Group',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await apiService.delete(`/groups/${groupId}`);
          message.success("Group deleted successfully.");
          router.push("/groups");
        } catch (error) {
          message.error("Failed to delete group.");
        }
      },
    });
            
  };


  return (
    <div style={{ backgroundColor: "#000000", minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {contextHolder}

            {/* Header */}
            <div style={{
              width: "100%",
              padding: "20px 50px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}>
              <div style={{ cursor: "pointer" }} onClick={() => router.push("/groups")}>
              </div>
      
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                      <NextImage
                        src={logo}
                        alt="Friendler Logo"
                        height={160}
                        width={480}
                      />
                      </div>
      
              <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                <Button type="text" icon={<CalendarOutlined />} style={{ color: "white" }}>
                  Calendar
                </Button>
                <Button
                  type="text"
                  icon={<UserOutlined />}
                  onClick={() => router.push(`/users/${currentUserId}`)}
                  style={{ color: "white" }}
                >
                  My Profile
                </Button>
                <Button
                  type="text"
                  icon={<LogoutOutlined />}
                  onClick={() => router.push("/groups")}
                  style={{ color: "white" }}
                >
                  Change Group
                </Button>
                <Button
                  danger
                  icon={<LogoutOutlined />}
                  onClick={handleLeaveGroup}
                  style={{ fontWeight: "bold" }}
                >
                  Leave Group
                </Button>
                <Button
                  type="text"
                  icon={<LogoutOutlined />}
                  onClick={handleLogout}
                  style={{ color: "white" }}
                >
                  Logout
                </Button>
              </div>
            </div>

      {/* Main Content */}
      <div style={{ width: '100%', maxWidth: 800, padding: '40px 20px' }}>
        <Button onClick={() => router.push(`/groups/${groupId}`)} style={{ marginBottom: 20 }}>
          ← Back to Group
        </Button>

        <Title level={2} style={{ color: 'white', marginBottom: 30 }}>
          Settings: {group?.name}
        </Title>

        <Card title="Member Management" style={{ marginBottom: 20, backgroundColor: 'rgba(126, 126, 126, 0.2)', border: 'none' }} headStyle={{ color: 'white' }}>
          <List
          dataSource={members}
            locale={{ emptyText: <span style={{ color: 'white' }}>No members found in this group.</span> }}
            renderItem={(member) => (
              <List.Item
                actions={[
                  member.id.toString() !== currentUserId && (
                    <Space key="actions">
                      <Popconfirm  //traps users in a confirmation pop-up to prevent accidental promotions or kicks of members
                            title="Promote to Admin?" 
                            description="Are you sure you want to give admin rights to this user?"
                            onConfirm={() => handlePromoteMember(member.id)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button type="primary" ghost>Promote</Button>
                        </Popconfirm>
                        <Popconfirm 
                            title="Kick Member?" 
                            description="Are you sure you want to remove this user from the group?"
                            onConfirm={() => handleKickMember(member.id)} 
                            okText="Yes, Kick"
                            cancelText="Cancel"
                            okButtonProps={{ danger: true }}
                        >
                            <Button danger>Kick</Button>
                        </Popconfirm>
                        </Space>
                    )
                ]}
              >
                <List.Item.Meta 
                  title={<span style={{ color: 'white' }}>{member.username}</span>} 
                  description={<span style={{ color: '#aaa' }}>{member.role}</span>} 
                />
              </List.Item>
            )}
          />
        </Card>

        <Card title="Change Group Password" style={{ marginBottom: 20, backgroundColor: 'rgba(126, 126, 126, 0.2)', border: 'none' }} headStyle={{ color: 'white' }}>
          <Form form={form} layout="vertical" onFinish={handleChangePassword}>
            <Form.Item 
              name="newPassword" 
              label={<span style={{ color: "white" }}>New Password</span>} 
              rules={[{ required: true, message: 'Please enter a new password' }]}
            >
              <Input.Password placeholder="Enter new password" />
            </Form.Item>
            <Button type="primary" htmlType="submit">Update Password</Button>
          </Form>
        </Card>

        <Card title="Danger Zone" style={{ border: '1px solid #ff4d4f', backgroundColor: 'rgba(255, 77, 79, 0.1)' }} headStyle={{ color: '#ff4d4f' }}>
          <Text style={{ color: '#ffaaa8', display: 'block', marginBottom: 15 }}>
            Deleting a group is permanent. There is no undo.
          </Text>
          <Button danger type="primary" onClick={showDeleteConfirm}>Delete Group Permanently</Button>
        </Card>
      </div>
    </div>
  );
};

export default GroupSettings;