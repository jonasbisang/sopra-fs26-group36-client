"use client";

import { useRouter, useParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Button, message } from "antd";
import { 
  CalendarOutlined, 
  UserOutlined, 
  LogoutOutlined 
} from "@ant-design/icons";

const GroupPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id;
  const apiService = useApi();
  const [messageApi, contextHolder] = message.useMessage();

  const { value: userId } = useLocalStorage<string>("userId", "");
  const { clear: clearToken } = useLocalStorage<string>("token", "");
  const { clear: clearUserId } = useLocalStorage<string>("userId", "");

  const handleLeaveGroup = async () => {
    try {
      // DELETE /groups/{groupId}/members/{userId}
      await apiService.delete(`/groups/${groupId}/members/${userId}`);
      messageApi.success("Successfully left the group!");
      router.push("/groups"); // redirect back to dashboard
    } catch (error) {
      if (error instanceof Error) {
        alert(`Failed to leave group:\n${error.message}`);
      }
    }
  };

  const handleLogout = () => {
    clearToken();
    clearUserId();
    router.push("/login");
  };

  return (
    <div style={{
      backgroundColor: "#000000",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
    }}>
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
        {/* Logo */}
        <div style={{ cursor: "pointer" }} onClick={() => router.push("/groups")}>
          <h1 style={{
            fontSize: "32px",
            color: "white",
            margin: 0,
            fontFamily: '"Gabriel Weiss Friends Font", "Permanent Marker", cursive, sans-serif',
            letterSpacing: "2px",
          }}>
            F<span style={{ color: "#ff4238" }}>·</span>
            R<span style={{ color: "#ffdc00" }}>·</span>
            I<span style={{ color: "#42a2d6" }}>·</span>
            E<span style={{ color: "#ff4238" }}>·</span>
            N<span style={{ color: "#ffdc00" }}>·</span>
            D<span style={{ color: "#42a2d6" }}>·</span>
            L<span style={{ color: "#ff4238" }}>·</span>
            E<span style={{ color: "#ffdc00" }}>·</span>
            R
          </h1>
        </div>

        {/* Header Buttons */}
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <Button
            type="text"
            icon={<CalendarOutlined />}
            onClick={() => router.push("/calendar")}
            style={{ color: "white" }}
          >
            Calendar
          </Button>

          <Button
            type="text"
            icon={<UserOutlined />}
            onClick={() => router.push(`/users/${userId}`)}
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

          {/* Leave Group Button */}
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

      {/* Placeholder Content */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "18px" }}>
          Activity board coming soon...
        </p>
      </div>

    </div>
  );
};

export default GroupPage;