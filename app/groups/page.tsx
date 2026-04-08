"use client";

import { useRouter } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { Button, Form, Input, message } from "antd";

interface JoinGroupValues {
  groupId: string;
  joinPassword: string;
}

interface Group {
  id: number;
  name: string;
}

const GroupsDashboard: React.FC = () => {
  const router = useRouter();
  const apiService = useApi();
  const [joinForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const handleJoinGroup = async (values: JoinGroupValues) => {
    try {
      // POST /groups/{groupId}/members mit joinPassword im Body
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

  return (
    <div style={{
      backgroundColor: "#000000",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px",
    }}>
      {contextHolder}

      <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: "40px" }}>
        Enter a Group ID and password to join a group.
      </p>

      {/* Join Group Form */}
      <div style={{
        width: "100%",
        maxWidth: "400px",
        backgroundColor: "rgba(126, 126, 126, 0.2)",
        borderRadius: "12px",
        padding: "30px",
      }}>
        <h3 style={{ color: "white", marginBottom: "20px" }}>→ Join a Group</h3>

        <Form
          form={joinForm}
          onFinish={handleJoinGroup}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="groupId"
            label={<span style={{ color: "white" }}>Group ID</span>}
            rules={[{ required: true, message: "Please enter the Group ID!" }]}
          >
            <Input placeholder="e.g., 42" />
          </Form.Item>

          <Form.Item
            name="joinPassword"
            label={<span style={{ color: "white" }}>Password</span>}
            rules={[{ required: true, message: "Please enter the password!" }]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              style={{ backgroundColor: "white", color: "black", width: "100%" }}
            >
              Join Group
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default GroupsDashboard;