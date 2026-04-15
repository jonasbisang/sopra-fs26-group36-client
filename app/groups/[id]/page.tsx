"use client";

import { useRouter, useParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Button, message, List, Avatar, Tag } from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  LogoutOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
//import "react-big-calendar/lib/css/react-big-calendar.css";

import NextImage from 'next/image';
import logo from '../friendlerLogo.png';

const localizer = momentLocalizer(moment);

interface User {
  id: number;
  username: string;
}

interface Activity {
  id: number;
  name: string;
  status: string;
  scheduledTime?: string;
  location?: string;
}

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  location?: string;
}

const GroupPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const groupId = params.id;
  const apiService = useApi();
  const [messageApi, contextHolder] = message.useMessage();

  const { value: userId } = useLocalStorage<string>("userId", "");
  const { value: token } = useLocalStorage<string>("token", "");
  const { clear: clearToken } = useLocalStorage<string>("token", "");
  const { clear: clearUserId } = useLocalStorage<string>("userId", "");

  const [members, setMembers] = useState<User[]>([]);
  const [pendingActivities, setPendingActivities] = useState<Activity[]>([]);
  const [plannedActivities, setPlannedActivities] = useState<Activity[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  //Auth check
  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token, router]);

  // Fetch all data
  useEffect(() => {
    if (!groupId || !token) return;

    const fetchData = async () => {
      try {
        // Fetch group members
        const users = await apiService.get<User[]>(`/groups/${groupId}/users`);
        setMembers(users);
      } catch (error) {
        console.error("Failed to fetch members:", error);
      }

      try {
        // Fetch pending activities
        const pending = await apiService.get<Activity[]>(
          `/groups/${groupId}/activities?status=PENDING`
        );
        setPendingActivities(pending);
      } catch (error) {
        console.error("Failed to fetch pending activities:", error);
      }

      try {
        // Fetch planned activities
        const planned = await apiService.get<Activity[]>(
          `/groups/${groupId}/activities?status=PLANNED`
        );
        setPlannedActivities(planned);
      } catch (error) {
        console.error("Failed to fetch planned activities:", error);
      }

      try {
        // Fetch calendar events
        const events = await apiService.get<CalendarEvent[]>(
          `/groups/${groupId}/calendar`
        );
        // Convert date strings to Date objects for react-big-calendar
        const formatted = events.map((e) => ({
          ...e,
          start: new Date(e.start),
          end: new Date(e.end),
        }));
        setCalendarEvents(formatted);
      } catch (error) {
        console.error("Failed to fetch calendar:", error);
      }
    };

    fetchData();
  }, [groupId, token, apiService]);

  const handleLeaveGroup = async () => {
    try {
      await apiService.delete(`/groups/${groupId}/members/${userId}`);
      messageApi.success("Successfully left the group!");
      router.push("/groups");
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
        <div style={{ cursor: "pointer" }} onClick={() => router.push("/groups")}>
          {/* <h1 style={{
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
          </h1> */}
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
      <div style={{ padding: "40px 50px", display: "flex", flexDirection: "column", gap: "40px" }}>

        {/* Top Row: Members + Pending Activities */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>

          {/* Group Members */}
          <div style={{
            backgroundColor: "rgba(126,126,126,0.2)",
            borderRadius: "12px",
            padding: "24px",
          }}>
            <h3 style={{ color: "white", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <TeamOutlined /> Group Members
            </h3>
            <List
              dataSource={members}
              renderItem={(member) => (
                <List.Item style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", padding: "10px 0" }}>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={<span style={{ color: "white" }}>{member.username}</span>}
                  />
                </List.Item>
              )}
              locale={{ emptyText: <span style={{ color: "rgba(255,255,255,0.3)" }}>No members found</span> }}
            />
          </div>

          {/* Pending Activities */}
          <div style={{
            backgroundColor: "rgba(126,126,126,0.2)",
            borderRadius: "12px",
            padding: "24px",
          }}>
            <h3 style={{ color: "white", marginBottom: "16px" }}>💡 Upcoming Ideas</h3>
            <List
              dataSource={pendingActivities}
              renderItem={(activity) => (
                <List.Item style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", padding: "10px 0" }}>
                  <List.Item.Meta
                    title={<span style={{ color: "white" }}>{activity.name}</span>}
                  />
                  <Tag color="blue">Pending</Tag>
                </List.Item>
              )}
              locale={{ emptyText: <span style={{ color: "rgba(255,255,255,0.3)" }}>No pending activities</span> }}
            />
          </div>
        </div>

        {/* Planned Activities */}
        <div style={{
          backgroundColor: "rgba(126,126,126,0.2)",
          borderRadius: "12px",
          padding: "24px",
        }}>
          <h3 style={{ color: "white", marginBottom: "16px" }}>📅 Scheduled Activities</h3>
          <List
            dataSource={plannedActivities}
            renderItem={(activity) => (
              <List.Item style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", padding: "10px 0" }}>
                <List.Item.Meta
                  title={<span style={{ color: "white" }}>{activity.name}</span>}
                  description={
                    <span style={{ color: "rgba(255,255,255,0.5)" }}>
                      {activity.scheduledTime
                        ? moment(activity.scheduledTime).format("DD.MM.YYYY HH:mm")
                        : "Time TBD"}
                      {activity.location ? ` · ${activity.location}` : ""}
                    </span>
                  }
                />
                <Tag color="green">Planned</Tag>
              </List.Item>
            )}
            locale={{ emptyText: <span style={{ color: "rgba(255,255,255,0.3)" }}>No scheduled activities</span> }}
          />
        </div>

        {/* Calendar */}
        <div style={{
          backgroundColor: "rgba(126,126,126,0.2)",
          borderRadius: "12px",
          padding: "24px",
        }}>
          <h3 style={{ color: "white", marginBottom: "16px" }}>🗓 Group Calendar</h3>
          <div style={{ height: "500px" }}>
            {/* Dark theme override for react-big-calendar */}
            <style>{`
              .rbc-calendar { background: transparent; color: white; }
              .rbc-header { color: white; border-color: rgba(255,255,255,0.1); }
              .rbc-month-view { border-color: rgba(255,255,255,0.1); }
              .rbc-day-bg { border-color: rgba(255,255,255,0.1); }
              .rbc-off-range-bg { background: rgba(0,0,0,0.3); }
              .rbc-today { background: rgba(66,162,214,0.15); }
              .rbc-toolbar button { color: white; border-color: rgba(255,255,255,0.3); background: transparent; }
              .rbc-toolbar button:hover { background: rgba(255,255,255,0.1); }
              .rbc-toolbar button.rbc-active { background: rgba(255,255,255,0.2); }
              .rbc-date-cell { color: white; }
              .rbc-event { background-color: #42a2d6; }
            `}</style>
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: "100%" }}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default GroupPage;