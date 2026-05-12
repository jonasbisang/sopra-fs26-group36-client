"use client";
 
import { useRouter, useParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Button, message, Tag, Avatar } from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  LogoutOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import moment from "moment";
import NextImage from "next/image";
import logo from "@/friendlerLogo.png";
 
interface Activity {
  id: number;
  name: string;
  status: string;
  scheduledTime?: string;
  location?: string;
  minSize?: number;
  maxSize?: number;
  duration?: number;
  isWeatherDependent?: boolean;
  weatherDependent?: boolean;
  acceptVotes?: number;
  participantUsernames?: string[];
  minTemp?: number;
  maxTemp?: number;
  rainPreference?: string;
  creatorId?: number;
  isRecursive?: boolean;
}
 
const ActivityDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id;
  const activityId = params.activityId;
  const apiService = useApi();
  const [messageApi, contextHolder] = message.useMessage();
 
  const { value: userId } = useLocalStorage<string>("userId", "");
  const { value: token } = useLocalStorage<string>("token", "");
  const { clear: clearToken } = useLocalStorage<string>("token", "");
  const { clear: clearUserId } = useLocalStorage<string>("userId", "");
  const [mounted, setMounted] = useState(false);
 
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    setMounted(true);
  }, []);
 
  useEffect(() => {
    if (mounted && (!token || token === "")) {
      router.replace("/login");
    }
  }, [mounted, token, router]);
 
  useEffect(() => {
    if (!activityId || !token) return;
    const fetchActivity = async () => {
      try {
        const data = await apiService.get<Activity>(
          `/groups/${groupId}/activities/${activityId}`
        );
        setActivity(data);
      } catch (error) {
        console.error("Failed to fetch activity:", error);
        messageApi.error("Could not load activity.");
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, [activityId, token]);
 
  const handleJoin = async () => {
    try {
      await apiService.post(
        `/groups/${groupId}/activities/${activityId}/votes`,
        { wantsToJoin: true, userId: Number(userId) }
      );
      messageApi.success("Successfully joined! 🎉");
      // Reload activity
      const data = await apiService.get<Activity>(
        `/groups/${groupId}/activities/${activityId}`
      );
      setActivity(data);
    } catch {
      messageApi.error("Activity is already full.");
    }
  };
 
  const handleLogout = () => {
    clearToken();
    clearUserId();
    router.push("/login");
  };
 
  const isFull =
    activity?.maxSize !== undefined &&
    (activity.acceptVotes ?? 0) >= activity.maxSize;
 
  const alreadyJoined = activity?.participantUsernames?.includes(
    activity?.participantUsernames?.find(
      (u) => u === userId
    ) ?? ""
  );
 
  const isWeather = activity?.isWeatherDependent || activity?.weatherDependent;
 
  if (loading) {
    return (
      <div style={{ backgroundColor: "#000", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: "white" }}>Loading...</span>
      </div>
    );
  }
 
  return (
    <div style={{ backgroundColor: "#000000", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {contextHolder}
 
      {/* Header */}
      <div style={{
        width: "100%", padding: "20px 50px", display: "flex",
        justifyContent: "space-between", alignItems: "center",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}>
        <div style={{ cursor: "pointer" }} onClick={() => router.push("/groups")}>
          <NextImage src={logo} alt="Friendler Logo" height={60} width={180} />
        </div>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <Button type="text" icon={<CalendarOutlined />} style={{ color: "white" }}
            onClick={() => router.push(`/users/${userId}/calendar`)}>
            Calendar
          </Button>
          <Button type="text" icon={<UserOutlined />} style={{ color: "white" }}
            onClick={() => router.push(`/users/${userId}`)}>
            My Profile
          </Button>
          <Button type="text" icon={<LogoutOutlined />} style={{ color: "white" }}
            onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
 
      {/* Content */}
      <div style={{ padding: "40px 50px", maxWidth: "860px", width: "100%", margin: "0 auto" }}>
 
        {/* Back button */}
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          style={{ color: "rgba(255,255,255,0.5)", marginBottom: "24px", padding: 0 }}
          onClick={() => router.back()}
        >
          Back to Group
        </Button>
 
        {activity ? (
          <>
            {/* Title + Status */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
              <div>
                <h1 style={{ color: "white", fontSize: "36px", fontWeight: "bold", margin: "0 0 8px" }}>
                  {activity.name}
                </h1>
                <div style={{ display: "flex", gap: "8px" }}>
                  {isFull ? (
                    <Tag color="red">Full</Tag>
                  ) : (
                    <Tag color="green">{activity.acceptVotes ?? 0}/{activity.maxSize} joined</Tag>
                  )}
                  {activity.status && <Tag color="blue">{activity.status}</Tag>}
                  {isWeather && <Tag color="cyan">Weather-dependent</Tag>}
                  {activity.isRecursive && <Tag color="purple">Recurring</Tag>}
                </div>
              </div>
 
              {/* Join Button */}
              {!isFull && activity.status === "SCHEDULED" && (
                <Button
                  size="large"
                  onClick={handleJoin}
                  style={{
                    background: "rgba(66,214,120,0.15)",
                    color: "#42d678",
                    border: "1px solid rgba(66,214,120,0.4)",
                    borderRadius: "10px",
                    fontWeight: "bold",
                  }}
                >
                  + Join Activity
                </Button>
              )}
            </div>
 
            {/* Info Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
 
              {/* Date & Time */}
              {activity.scheduledTime && (
                <div style={{ backgroundColor: "rgba(126,126,126,0.2)", borderRadius: "12px", padding: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>
                    <CalendarOutlined /> Date & Time
                  </div>
                  <div style={{ color: "white", fontSize: "18px", fontWeight: 500 }}>
                    {moment(activity.scheduledTime).format("DD.MM.YYYY")}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>
                    {moment(activity.scheduledTime).format("HH:mm")}
                  </div>
                </div>
              )}
 
              {/* Duration */}
              {activity.duration && (
                <div style={{ backgroundColor: "rgba(126,126,126,0.2)", borderRadius: "12px", padding: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>
                    <ClockCircleOutlined /> Duration
                  </div>
                  <div style={{ color: "white", fontSize: "18px", fontWeight: 500 }}>
                    {activity.duration} hour{activity.duration !== 1 ? "s" : ""}
                  </div>
                </div>
              )}
 
              {/* Location */}
              {activity.location && (
                <div style={{ backgroundColor: "rgba(126,126,126,0.2)", borderRadius: "12px", padding: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>
                    <EnvironmentOutlined /> Location
                  </div>
                  <div style={{ color: "white", fontSize: "18px", fontWeight: 500 }}>
                    {activity.location}
                  </div>
                </div>
              )}
 
              {/* Participants */}
              <div style={{ backgroundColor: "rgba(126,126,126,0.2)", borderRadius: "12px", padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "rgba(255,255,255,0.5)", marginBottom: "8px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>
                  <TeamOutlined /> Participants
                </div>
                <div style={{ color: "white", fontSize: "18px", fontWeight: 500 }}>
                  {activity.acceptVotes ?? 0} / {activity.maxSize ?? "?"}
                </div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>
                  Min {activity.minSize ?? "?"} needed
                </div>
              </div>
            </div>
 
            {/* Weather Info */}
            {isWeather && (
              <div style={{ backgroundColor: "rgba(66,162,214,0.1)", border: "1px solid rgba(66,162,214,0.3)", borderRadius: "12px", padding: "20px", marginBottom: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#42a2d6", marginBottom: "12px", fontWeight: 500 }}>
                  <ThunderboltOutlined /> Weather Requirements
                </div>
                <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
                  {activity.minTemp != null && (
                    <span style={{ color: "rgba(255,255,255,0.7)" }}>Min temp: {activity.minTemp}°C</span>
                  )}
                  {activity.maxTemp != null && (
                    <span style={{ color: "rgba(255,255,255,0.7)" }}>Max temp: {activity.maxTemp}°C</span>
                  )}
                  {activity.rainPreference && (
                    <span style={{ color: "rgba(255,255,255,0.7)" }}>Rain: {activity.rainPreference}</span>
                  )}
                </div>
              </div>
            )}
 
            {/* Participant List */}
            {activity.participantUsernames && activity.participantUsernames.length > 0 && (
              <div style={{ backgroundColor: "rgba(126,126,126,0.2)", borderRadius: "12px", padding: "24px" }}>
                <h3 style={{ color: "white", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <TeamOutlined /> Who&apos;s joining
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                  {activity.participantUsernames.map((username) => (
                    <div key={username} style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "8px", padding: "8px 14px" }}>
                      <Avatar size="small" icon={<UserOutlined />} />
                      <span style={{ color: "white" }}>{username}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", padding: "80px 0" }}>
            Activity not found.
          </div>
        )}
      </div>
    </div>
  );
};
 
export default ActivityDetailPage;
 