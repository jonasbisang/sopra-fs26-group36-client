"use client";

import { useRouter, useParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Button, message, List, Avatar, Tag , Modal} from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  LogoutOutlined,
  TeamOutlined,
  PlusOutlined,
  SettingOutlined
}from "@ant-design/icons";
import { useEffect, useState , useRef } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

import CreateActivityModal from "@/forms/CreateActivityModal";
import NextImage from 'next/image';
import logo from '@/friendlerLogo.png';

const localizer = momentLocalizer(moment);

interface Group { // needed to check if current user is admin
  id: number;
  name: string;
  adminId: number;
}

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
  minSize?: number;
  maxSize?: number;
  duration?: number;
  isWeatherDependent?: boolean;
  acceptVotes?: number;
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

  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [pendingActivities, setPendingActivities] = useState<Activity[]>([]);
  const [plannedActivities, setPlannedActivities] = useState<Activity[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  const [likedActivities, setLikedActivities] = useState<Activity[]>([]);
  const [votedActivityIds, setVotedActivityIds] = useState<Set<number>>(new Set());
  const votedActivityIdsRef = useRef<Set<number>>(new Set());

  const [totalPending, setTotalPending] = useState<number>(0);
  const [votedCount, setVotedCount] = useState<number>(0);
  const [feedbackType, setFeedbackType] = useState<"ACCEPT" | "DECLINE" | null>(null);
  const feedbackTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false); // to check the pop up visibility
  const [newEventPopup, setNewEventPopup] = useState<Activity | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
  if (mounted && (!token || token === "")) {
    router.replace("/login");
  }
}, [mounted, token, router]);

  //Fetch all data (OG BLOCK) REVIVE WHEN BACKEND READY
  useEffect(() => {
    if (!groupId || !token) return;

    const fetchData = async () => {

      // Fetch group information 
      try {
        const groupData = await apiService.get<Group>(`/groups/${groupId}`);
        setGroup(groupData);
      } catch (error) {
        console.error("Failed to fetch group details:", error);
      }

      try {
        // Fetch group members
        const users = await apiService.get<User[]>(`/groups/${groupId}/members`);
        setMembers(users);
      } catch (error) {
        console.error("Failed to fetch members:", error);
      }

    try {
    // Fetch pending activities
    const pending = await apiService.get<Activity[]>(
      `/groups/${groupId}/activities?status=PENDING`);
      setPendingActivities(pending.filter((a) => !votedActivityIdsRef.current.has(a.id)));
      setTotalPending(pending.length);
      } catch (error) {
        console.error("Failed to fetch pending activities:", error);
    }
      try {
        //Fetch planned activities
        const planned = await apiService.get<Activity[]>(
          `/groups/${groupId}/activities?status=SCHEDULED`
        );
        setPlannedActivities(planned);
      } catch (error) {
        console.error("Failed to fetch planned activities:", error);
      }
      

      try {
        //Fetch calendar events
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

  


  useEffect(() => {
    if (!groupId || !token) return;
    const interval = setInterval(async () => {
      try {
        const planned = await apiService.get<Activity[]>(
          `/groups/${groupId}/activities?status=SCHEDULED`
        );
        setPlannedActivities((prev) => {
          const newOnes = planned.filter(
            (a) => !prev.find((p) => p.id === a.id)
          );
          if (newOnes.length > 0) {
            setNewEventPopup(newOnes[0]); // ← triggert Modal
          }
          return planned;
        });
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 10000); // alle 10 Sekunden

    return () => clearInterval(interval);
  }, [groupId, token]);


  useEffect(() => {
    if (!groupId || !token) return;
    const interval = setInterval(async () => {
    try {
      const pending = await apiService.get<Activity[]>(
        `/groups/${groupId}/activities?status=PENDING`
      );
      setPendingActivities(pending.filter((a) => !votedActivityIdsRef.current.has(a.id)));
    } catch (error) {
      console.error("Polling error:", error);
    }
  }, 10000);
  return () => clearInterval(interval);
    }, [groupId, token]);

  //conect to backend and update the list of pending activities
  const handleActivityCreated = async () => {
    setIsCreateModalVisible(false);

    if (!groupId) return;
    try {
      const pending = await apiService.get<Activity[]>(`/groups/${groupId}/activities?status=PENDING`);
      setPendingActivities(pending.filter((a) => !votedActivityIdsRef.current.has(a.id)));
     
    } catch (error) {
      console.error("Failed to fetch pending activities after creation:", error);
    }
    
  };

  const handleVote = async (activityId: number, voteType: "ACCEPT" | "DECLINE") => {
      setFeedbackType(voteType);
    if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
      feedbackTimeout.current = setTimeout(() => setFeedbackType(null), 600);

    setVotedActivityIds((prev) => {
      const next = new Set([...prev, activityId]);
      votedActivityIdsRef.current = next;
      return next;
      });

    try {
      await apiService.post(`/groups/${groupId}/activities/${activityId}/votes`, {
        wantsToJoin: voteType === "ACCEPT",
        userId: Number(userId),
      });
      
      setPendingActivities((prev) => {
        const voted = prev.find((a) => a.id === activityId);
        if (voted && voteType === "ACCEPT") {
          const updated = { ...voted, acceptVotes: (voted.acceptVotes ?? 0) + 1 };
          setLikedActivities((liked) =>
            liked.find((a) => a.id === activityId) ? liked : [...liked, updated]  // ← updated, not voted; with duplicate guard
          );
        }
        return prev.filter((a) => a.id !== activityId);
      });

      setVotedCount((prev) => prev + 1);
      if (voteType === "DECLINE") {
        messageApi.success("Passed.");
      } else {
        messageApi.success("Liked! 👍");
      }
      } catch (error) {
      messageApi.error("Failed to submit vote.");
      console.error(error);
      }
    };


  const handleLeaveGroup = async () => {
    try {
      await apiService.delete(`/groups/${groupId}/members/${userId}`);
      messageApi.success("Left the group!");
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

  const progressPercent = totalPending > 0 ? Math.round((votedCount / totalPending) * 100) : 0;


  return (
    <div style={{
      backgroundColor: "#000000",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
    }}>
      {contextHolder}
     
    {/* MODAL NOTIFICATION FOR NEW EVENT */}
    <Modal
      open={!!newEventPopup}
      onOk={() => setNewEventPopup(null)}
      onCancel={() => setNewEventPopup(null)}
      okText="Let's go! 🎉"
      cancelText="Close"
      okButtonProps={{ style: { backgroundColor: "black", border: "none" } }}
      title="🎉 New Event Confirmed!"
    >
      <p><b>{newEventPopup?.name}</b></p>
      {newEventPopup?.scheduledTime && (
        <p>📅 {moment(newEventPopup.scheduledTime).format("DD.MM.YYYY HH:mm")}</p>
      )}
      {newEventPopup?.location && (
      <p>📍 {newEventPopup.location}</p>
      )}
      {newEventPopup?.duration && (
      <p>⏱ {newEventPopup.duration} hours</p>
      )}
      <p style={{ color: "#999", fontSize: "12px" }}>The event has been added to the group calendar.</p>
      </Modal>

       {/* Feedback Flash Overlay */}
      {feedbackType && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 999,
          pointerEvents: "none",
          backgroundColor: feedbackType === "ACCEPT" ? "rgba(66,214,120,0.12)" : "rgba(255,66,56,0.12)",
          animation: "flashFade 0.6s ease-out forwards",
        }} />
      )}
      <style>{`
        @keyframes flashFade {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>

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
          
          <Button 
            type="primary" 
            shape="round" 
            icon={<PlusOutlined />} 
            onClick={() => setIsCreateModalVisible(true)}
            style={{ backgroundColor: "white", color: "black", fontWeight: "bold" }}
          >
            New Activity
          </Button>
          
          
          {group?.adminId.toString() === userId && ( 
          <Button
          type="primary"
          icon={<SettingOutlined />}
          onClick={() => router.push(`/groups/${groupId}/settings`)}
            >
          Admin Group Settings
        </Button>
        )}

        <Button type="text" icon={<CalendarOutlined />} style={{ color: "white" }} onClick={() => router.push(`/users/${userId}/calendar`)}>
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
            
            {totalPending > 0 && (
             <div style={{ marginBottom: "16px" }}>
               <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                 <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>Voting progress</span>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>{votedCount} / {totalPending}</span>
              </div>
              <div style={{ height: "4px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${progressPercent}%`,                    
                  backgroundColor: progressPercent === 100 ? "#42d678" : "#42a2d6",
                  borderRadius: "2px",
                  transition: "width 0.4s ease",
                }} />
              </div>
            </div>
          )}

          {pendingActivities.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "50px 20px", gap: "12px" }}>                
            <span style={{ fontSize: "48px" }}></span>
               <p style={{ color: "white", fontSize: "18px", fontWeight: 600, margin: 0, textAlign: "center" }}>
                {votedCount > 0 ? "You're all caught up!" : "No proposals yet"}
              </p>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", margin: 0, textAlign: "center" }}>
                {votedCount > 0
                  ? `You voted on all ${votedCount} activit${votedCount === 1 ? "y" : "ies"}. Check back later for new proposals.`                    
                  : "No one has proposed an activity yet. Be the first!"}
              </p>
            </div>
          ) : (
            <>

                {/* Card */}
                <div 
                  key={pendingActivities[0].id}
                  style={{
                  backgroundColor: "rgba(60,60,60,0.6)",
                  borderRadius: "12px",
                  padding: "20px",
                }}>
                  <h4 style={{ color: "white", margin: "0 0 12px", fontSize: "20px", fontWeight: 600 }}>
                    {pendingActivities[0].name}
                  </h4>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {pendingActivities[0].location && (
                      <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px" }}>
                        📍 {pendingActivities[0].location}
                      </span>
                    )}
                    {(pendingActivities[0].minSize || pendingActivities[0].maxSize) && (
                      <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px" }}>
                        👥 Min {pendingActivities[0].minSize ?? "?"} · Max {pendingActivities[0].maxSize ?? "?"} participants
                      </span>
                    )}
                    {pendingActivities[0].duration && (
                      <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px" }}>
                        ⏱ {pendingActivities[0].duration} hours
                      </span>
                    )}
                    <div style={{ marginTop: "8px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      <Tag color="blue">Pending votes</Tag>
                      {pendingActivities[0].isWeatherDependent && (
                        <Tag color="cyan">Weather-dependent</Tag>
                      )}
                    </div>
                    {pendingActivities[0].minSize && (
                      <div style={{ marginTop: "10px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>Interest</span>
                          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>
                            {pendingActivities[0].acceptVotes ?? 0} / {pendingActivities[0].minSize} needed
                          </span>
                        </div>
                      <div style={{ height: "4px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "2px", overflow: "hidden" }}>
                      <div style={{
                        height: "100%",
                        width: `${Math.min(((pendingActivities[0].acceptVotes ?? 0) / pendingActivities[0].minSize) * 100, 100)}%`,
                        backgroundColor: (pendingActivities[0].acceptVotes ?? 0) >= pendingActivities[0].minSize
                          ? "#42d678" : "#ff9f43",
                        borderRadius: "2px",
                        transition: "width 0.4s ease",
                      }} />
                    </div>
                  </div>
                )}
                  </div>
                </div>

                {/* Vote buttons */}
                <div style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
                  <Button
                    block
                    size="large"
                    onClick={() => handleVote(pendingActivities[0].id, "DECLINE")}
                    style={{
                      background: "rgba(255,66,56,0.15)",
                      color: "#ff4238",
                      border: "1px solid rgba(255,66,56,0.4)",
                      borderRadius: "10px",
                      fontWeight: "bold",
                    }}
                  >
                    ✕ Pass
                  </Button>
                  <Button
                    block
                    size="large"
                    onClick={() => handleVote(pendingActivities[0].id, "ACCEPT")}
                    style={{
                      background: "rgba(66,214,120,0.15)",
                      color: "#42d678",
                      border: "1px solid rgba(66,214,120,0.4)",
                      borderRadius: "10px",
                      fontWeight: "bold",
                    }}
                  >
                    ♥ Like
                  </Button>
                </div>

                {/* Counter */}
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "12px", textAlign: "center", marginTop: "10px" }}>
                  {pendingActivities.length} activit{pendingActivities.length === 1 ? "y" : "ies"} remaining
                </div>
              </>
            )}
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

        {/* Awaiting Members */}
          {likedActivities.length > 0 && (
            <div style={{
              backgroundColor: "rgba(126,126,126,0.2)",
              borderRadius: "12px",
              padding: "24px",
            }}>
              <h3 style={{ color: "white", marginBottom: "16px" }}>⏳ Awaiting Members</h3>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "13px", marginBottom: "16px" }}>
                Activities you liked — waiting for enough people to join.
              </p>
              <List
                dataSource={likedActivities.filter(
                  (a) => (a.acceptVotes ?? 0) < (a.minSize ?? Infinity)
                )}
                renderItem={(activity) => (
                  <List.Item style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", padding: "12px 0" }}>
                    <List.Item.Meta
                      title={<span style={{ color: "white" }}>{activity.name}</span>}
                      description={
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                          {activity.location && (
                            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>
                              📍 {activity.location}
                            </span>
                          )}
                          {activity.minSize && (
                            <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>
                              👥 {activity.acceptVotes ?? 0} / {activity.minSize} people needed
                            </span>
                          )}
                        </div>
                      }
                    />
                    <Tag color="orange">Waiting</Tag>
                  </List.Item>
                )}
                locale={{ emptyText: <span style={{ color: "rgba(255,255,255,0.3)" }}>None waiting</span> }}
              />
            </div>
          )}

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
    <CreateActivityModal 
      visible={isCreateModalVisible}
      onClose={() => setIsCreateModalVisible(false)}
      groupId={groupId as string}
      userId={userId}
      onSuccess={handleActivityCreated}
    />
    </div>
  );
};

export default GroupPage;