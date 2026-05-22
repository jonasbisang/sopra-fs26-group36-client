"use client";

import { useRouter, useParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Button, message, List, Avatar, Tag , Modal, Drawer, Input, DatePicker, Popconfirm } from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  LogoutOutlined,
  TeamOutlined,
  PlusOutlined,
  SettingOutlined,
  MessageOutlined,
  SendOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
}from "@ant-design/icons";
import { useEffect, useState , useRef, useCallback } from "react";
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
  role?: string;
}

interface Activity {
  id: number;
  name: string;
  status: string;
  authorId?: number;
  //isRecursive?: boolean; missing the is recursive booelan (but which has already been added by another branch)
  scheduledTime?: string;
  location?: string;
  minSize?: number;
  maxSize?: number;
  duration?: number;
  isWeatherDependent?: boolean;
  acceptVotes?: number;
  participantUsernames?: string[];
  minTemp?: number;       
  maxTemp?: number;        
  rainPreference?: string;
  isRecursive?: boolean; 
}

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  location?: string;
  isFull?: boolean;
}

interface Message {
  id: number;
  text: string;
  senderName: string;
  createdAt?: string;
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
  const [declinedActivities, setDeclinedActivities] = useState<Activity[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [calendarDate, setCalendarDate] = useState(new Date());

  const [likedActivities, setLikedActivities] = useState<Activity[]>([]);
  const [, setVotedActivityIds] = useState<Set<number>>(new Set());
  const VOTED_KEY = `voted_${groupId}_${userId}`;
  const votedActivityIdsRef = useRef<Set<number>>(new Set(
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem(`voted_${groupId}_${userId}`) ?? "[]")
      : []));

  const [totalPending, setTotalPending] = useState<number>(0);
  const [votedCount, setVotedCount] = useState<number>(
    typeof window !== "undefined" ? JSON.parse(localStorage.getItem(`voted_${groupId}_${userId}`) ?? "[]").length : 0);

  const [feedbackType, setFeedbackType] = useState<"ACCEPT" | "DECLINE" | null>(null);
  const feedbackTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false); // to check the pop up visibility
  const [newEventPopup, setNewEventPopup] = useState<Activity | null>(null);
  const [mounted, setMounted] = useState(false);

  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const lastSeenCountRef = useRef<number | null>(null);


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
      `/groups/${groupId}/activities?status=PENDING&userId=${userId}`);
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
        const events = await apiService.get<Activity[]>(
          `/groups/${groupId}/calendar`
        );
        // Convert date strings to Date objects for react-big-calendar
        const formatted = events.map((e) => ({
          id: e.id,
          title: e.name,
          start: new Date(e.scheduledTime!),
          end: new Date(
            new Date(e.scheduledTime!).getTime() + (e.duration ?? 1) * 60 * 60 * 1000
          ),
          location: e.location,
          isFull: e.maxSize !== undefined && (e.acceptVotes ?? 0) >= e.maxSize,
        }));
        setCalendarEvents(formatted);
      } catch (error) {
        console.error("Failed to fetch calendar:", error);
      }
      try {
        // Fetch rejected activities for the current user - trying again with changed backend
        const rejected = await apiService.get<Activity[]>(
          `/groups/${groupId}/activities?status=REJECTED&userId=${userId}`);

        setDeclinedActivities(rejected.filter((a) => a.status !== "FAILED"));

        const accepted = await apiService.get<Activity[]>(
          `/groups/${groupId}/activities?status=ACCEPTED&userId=${userId}`);
        setLikedActivities(accepted);

      } catch (error) {
        console.error("Failed to fetch rejected activities:", error);
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
            setNewEventPopup(newOnes[0]);
            setLikedActivities((liked) => liked.filter((a) => !newOnes.find((n) => n.id === a.id))); 
          }
          return planned;
        });


        const events = await apiService.get<Activity[]>(`/groups/${groupId}/calendar`);
        const formatted = events.map((e) => ({
          id: e.id, title: e.name,
          start: new Date(e.scheduledTime!),
          end: new Date(new Date(e.scheduledTime!).getTime() + (e.duration ?? 1) * 60 * 60 * 1000),
          location: e.location,
          isFull: e.maxSize !== undefined && (e.acceptVotes ?? 0) >= e.maxSize,
      }));

      setCalendarEvents(formatted);
      
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
        // 1. Fetch unvoted activities (Upcoming Ideas)
        const pending = await apiService.get<Activity[]>(`/groups/${groupId}/activities?status=PENDING&userId=${userId}`);
        setPendingActivities(pending); // <-- No more local storage .filter() hack needed!
        setTotalPending(pending.length);
      } catch (error) {
        console.error("Failed to fetch pending activities:", error);
      }

      try {
        // 2. Fetch liked activities (Awaiting Members)
        const accepted = await apiService.get<Activity[]>(`/groups/${groupId}/activities?status=ACCEPTED&userId=${userId}`);
        setLikedActivities(accepted);
      } catch (error) {
        console.error("Failed to fetch accepted activities:", error);
      }

      try {
        // 3. Fetch passed activities (Rejected)
        const rejected = await apiService.get<Activity[]>(`/groups/${groupId}/activities?status=REJECTED&userId=${userId}`);
        setDeclinedActivities(rejected.filter((a) => a.status !== "FAILED"));

          
       } catch (error) {
            console.error("Failed to fetch rejected activities:", error);}
          }, 2000);

        return () => clearInterval(interval);}, 
        [groupId, token, userId]);



  //conect to backend and update the list of pending activities
  const handleActivityCreated = async () => {
    setIsCreateModalVisible(false);

    if (!groupId) return;
    try {
      const pending = await apiService.get<Activity[]>(`/groups/${groupId}/activities?status=PENDING&userId=${userId}`);
      setPendingActivities(pending.filter((a) => !votedActivityIdsRef.current.has(a.id)));
     
    } catch (error) {
      console.error("Failed to fetch pending activities after creation:", error);
    }
  };

  const fetchMessages = useCallback(async () => {
  try {
     const msgs = await apiService.get<Message[]>(`/groups/${groupId}/messages`);
     const myUsername = members.find((m) => m.id.toString() === userId)?.username;
     setChatMessages((prev) => {
      if (lastSeenCountRef.current === null) {
        lastSeenCountRef.current = msgs.length;
        return msgs;
      }
       if (!chatOpen && msgs.length > lastSeenCountRef.current) {
        const newMsgs = msgs.slice(lastSeenCountRef.current);
        const otherMessages = newMsgs.filter((m) => m.senderName !== myUsername);
          if (otherMessages.length > 0) {
            setUnreadCount((u) => u + otherMessages.length);
          }
         lastSeenCountRef.current = msgs.length;
       }
       return msgs;
     });
  } catch (error) {
    console.error("Failed to fetch messages:", error);
  }
}, [groupId, apiService, chatOpen]);


// Polling für neue Messages immer
useEffect(() => {
  if (!groupId || !token) return;
  fetchMessages(); // initial laden
  const interval = setInterval(fetchMessages, 2000);
  return () => clearInterval(interval);
}, [groupId, token, fetchMessages]);

// Auto-scroll nach unten wenn neue Messages kommen
useEffect(() => {
  chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
}, [chatMessages]);

  const handleJoin = async (activityId: number) => {
    try {
      await apiService.post(`/groups/${groupId}/activities/${activityId}/votes`, {
        wantsToJoin: true,
        userId: Number(userId),
      });
      messageApi.success("Successfully joined! 🎉");
      setDeclinedActivities((prev) => prev.filter((a) => a.id !== activityId)); // achtung TEST --> maybe wieder entferne
    } catch (error) {
      messageApi.error("Activity is already full.");
        } finally {
      try {
        const planned = await apiService.get<Activity[]>(
          `/groups/${groupId}/activities?status=SCHEDULED`
        );
        setPlannedActivities(planned);
      } catch {
        console.error("Failed to reload.");
      }
    }
  };

  const handleVote = async (activityId: number, voteType: "ACCEPT" | "DECLINE") => {
      setFeedbackType(voteType);
    if (feedbackTimeout.current) clearTimeout(feedbackTimeout.current);
      feedbackTimeout.current = setTimeout(() => setFeedbackType(null), 600);

    try {
      await apiService.post(`/groups/${groupId}/activities/${activityId}/votes`, {
        wantsToJoin: voteType === "ACCEPT",
        userId: Number(userId),
      });

      setVotedActivityIds((prev) => {
      const next = new Set([...prev, activityId]);
      votedActivityIdsRef.current = next;
      localStorage.setItem(VOTED_KEY, JSON.stringify([...next]));  // ← diese Zeile hinzufügen
      return next;
      });
      
      setPendingActivities((prev) => {
        const voted = prev.find((a) => a.id === activityId);
        if (voted && voteType === "ACCEPT") {
          const updated = { ...voted, acceptVotes: (voted.acceptVotes ?? 0) + 1 };
          setLikedActivities((liked) =>
            liked.find((a) => a.id === activityId) ? liked : [...liked, updated]  // ← updated, not voted; with duplicate guard
          );
        }
        if (voted && voteType === "DECLINE") {
          setDeclinedActivities((d) =>
          d.find((a) => a.id === activityId) ? d : [...d, voted]
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

  const handleDeleteActivity = async (activityId: number) => {
    try {
      await apiService.delete(`/groups/${groupId}/activities/${activityId}`);
      messageApi.success("Activity deleted.");
      
      // Optimistically update lists
      setPendingActivities((prev) => prev.filter((a) => a.id !== activityId));
      setPlannedActivities((prev) => prev.filter((a) => a.id !== activityId));
      setLikedActivities((prev) => prev.filter((a) => a.id !== activityId));
    } catch (error) {
      messageApi.error("Failed to delete activity.");
      console.error(error);
    }
  };

  //here the function for removing the recursive function should be added (will complete it once the recursive features are finished)


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

  const handleSendMessage = async () => {
  if (!newMessage.trim()) return;
  try {
    await apiService.post(`/groups/${groupId}/messages`, {
      text: newMessage,
    });
    setNewMessage("");
    await fetchMessages();
    lastSeenCountRef.current = chatMessages.length + 1; 
  } catch (error) {
    messageApi.error("Failed to send message.");
    console.error(error);
  }
};


  const progressPercent = totalPending > 0 ? Math.round((votedCount / totalPending) * 100) : 0;

  const sectionCard: React.CSSProperties = {
  backgroundColor: "rgba(126,126,126,0.2)",
  borderRadius: "12px",
  padding: "24px",
};

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
      <div style={{ color: "#111" }}>
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
      {newEventPopup?.isRecursive && (
        <p style={{ color: "#7c3aed", fontSize: "12px", marginTop: "6px" }}>
          🔁 This is a recurring activity — it has automatically re-entered the voting pool so the group can do it again!
        </p>
      )}
      </div>
      </Modal>

      {/* Group Chat Drawer */}
<Drawer
  title={<span style={{ color: "white" }}>💬 Group Chat</span>}
  placement="right"
  onClose={() => setChatOpen(false)}
  open={chatOpen}
  width={380}
  styles={{
    body: { backgroundColor: "#111", padding: "16px", display: "flex", flexDirection: "column", height: "100%" },
    header: { backgroundColor: "#111", borderBottom: "1px solid rgba(255,255,255,0.1)" },
    mask: { backdropFilter: "blur(4px)" },
  }}
>
  {/* Messages */}
  <div style={{ flex: 1, overflowY: "auto", marginBottom: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
    {chatMessages.length === 0 ? (
      <div style={{ color: "rgba(255,255,255,0.3)", textAlign: "center", marginTop: "40px" }}>
        No messages yet. Say hi! 👋
      </div>
    ) : (
      chatMessages.map((msg) => {
        const isOwn = msg.senderName === members.find((m) => m.id.toString() === userId)?.username;
        return (
          <div key={msg.id} style={{
            display: "flex",
            flexDirection: "column",
            alignItems: isOwn ? "flex-end" : "flex-start",
          }}>
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", marginBottom: "4px" }}>
              {msg.senderName}
            </span>
            <div style={{
              backgroundColor: isOwn ? "#42a2d6" : "rgba(255,255,255,0.1)",
              color: "white",
              borderRadius: isOwn ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
              padding: "10px 14px",
              maxWidth: "80%",
              fontSize: "14px",
            }}>
              {msg.text}
            </div>
            {msg.createdAt && (
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "10px", marginTop: "2px" }}>
                {moment(msg.createdAt).format("HH:mm")}
              </span>
            )}
          </div>
        );
      })
    )}
    <div ref={chatBottomRef} />
  </div>

  {/* Input */}
  <div style={{ display: "flex", gap: "8px" }}>
    <Input
      value={newMessage}
      onChange={(e) => setNewMessage(e.target.value)}
      onPressEnter={handleSendMessage}
      placeholder="Type a message..."
      style={{
        backgroundColor: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "white",
        borderRadius: "8px",
      }}
    />
    <Button
      icon={<SendOutlined />}
      onClick={handleSendMessage}
      style={{
        backgroundColor: "#42a2d6",
        border: "none",
        color: "white",
        borderRadius: "8px",
      }}
    />
  </div>
</Drawer>


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
        </div>
      {/* Left: Logo + Back Arrow */}
      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0px' }}>
          <NextImage src={logo} alt="Friendler Logo" height={160} width={480} />
        </div>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => router.push("/groups")}
          style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", alignSelf: "flex-start" }}
        >
          Back to Groups
        </Button>
      </div>   

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
          
<div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>

  {/* New Activity + History als Spalte */}
  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
    <Button 
      type="primary" 
      shape="round" 
      icon={<PlusOutlined />} 
      onClick={() => setIsCreateModalVisible(true)}
      style={{ backgroundColor: "white", color: "black", fontWeight: "bold" }}
    >
      New Activity
    </Button>
    <Button 
      type="text" 
      icon={<ClockCircleOutlined />} 
      onClick={() => router.push(`/groups/${groupId}/history`)} 
      style={{ color: "white", fontSize: "13px" }}
    >
      Activity History
    </Button>
  </div>

  <Button type="text" icon={<CalendarOutlined />} onClick={() => router.push(`/users/overview`)} style={{ color: "white" }}>User Overview</Button>
  <Button type="text" icon={<CalendarOutlined />} onClick={() => router.push(`/users/${userId}/calendar`)} style={{ color: "white" }}>Calendar</Button>
  <Button type="text" icon={<UserOutlined />} onClick={() => router.push(`/users/${userId}`)} style={{ color: "white" }}>My Profile</Button>

  {group?.adminId.toString() === userId || members.find(m => m.id.toString() === userId)?.role === "ADMIN"? (
    <Button type="primary" shape="round" icon={<SettingOutlined />} onClick={() => router.push(`/groups/${groupId}/settings`)} style={{ backgroundColor: "#42a2d6", border: "none", fontWeight: "bold" }}>
      Group Settings
    </Button>
  ) : (
    <Button danger icon={<LogoutOutlined />} onClick={handleLeaveGroup} style={{ fontWeight: "bold" }}>
      Leave Group
    </Button>
  )}

</div>
</div>
</div>
          
      

      

      {/* Main Content */}
      <div style={{ padding: "40px 50px", display: "flex", flexDirection: "column", gap: "40px" }}>

        {/* Top Row: Members + Pending Activities */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>

          {/* Group Members */}
          <div style={sectionCard}>
            <h3
              style={{
                color: "white",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <TeamOutlined /> {group?.name ? `${group.name} Members` : "Group Members"}
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
          <div style={sectionCard}>
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
                        👥 Min {pendingActivities[0].minSize ?? "?"} · Max {""} {pendingActivities[0].maxSize ?? "?"} participants
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
                      {pendingActivities[0].isRecursive && (
                        <Tag color="purple">🔁 Recurring</Tag>
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
                {pendingActivities[0].authorId?.toString() === userId && (
                    <div style={{ display: "flex", gap: "8px", marginTop: "16px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                      <Popconfirm title="Delete this activity?" onConfirm={() => handleDeleteActivity(pendingActivities[0].id)}>
                        <Button size="small" danger icon={<DeleteOutlined />} style={{ background: "transparent" }}>
                          Delete
                        </Button>
                      </Popconfirm>
                      {/*{pendingActivities[0].isRecursive && (
                        <Popconfirm title="Stop recurring?" onConfirm={() => handleStopRecursion(pendingActivities[0].id)}>
                          <Button size="small" icon={<StopOutlined />} style={{ color: "#d9d9d9", background: "transparent", borderColor: "#555" }}>
                            Stop Recursion
                          </Button>
                        </Popconfirm>
                      )}*/}
                    </div>
                    )}
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
              <List.Item 
                style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", padding: "10px 0", cursor: "pointer", borderRadius: "8px", transition: "background 0.15s" }}
                onClick={() => router.push(`/groups/${groupId}/activities/${activity.id}`)}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >

                <List.Item.Meta
                  title={<span style={{ color: "white" }}>{activity.name}</span>}
                    description={
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ color: "rgba(255,255,255,0.8)" }}>
                        {activity.scheduledTime
                        ? moment(activity.scheduledTime).format("DD.MM.YYYY HH:mm")
                        : "Time TBD"}
                        {activity.location ? ` · ${activity.location}` : ""}
                      </span>
                        {activity.participantUsernames && activity.participantUsernames.length > 0 && (
                    <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>
                      {activity.participantUsernames.join(", ")}
                    </span>
                      )}  
                     {activity.isWeatherDependent && (
                     <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>
                        Weather dependent
                        {activity.minTemp != null ? ` · min ${activity.minTemp}°C` : ""}
                        {activity.maxTemp != null ? ` · max ${activity.maxTemp}°C` : ""}
                        {activity.rainPreference ? ` · ${activity.rainPreference}` : ""}
                    </span>
                    )}
                    </div>
                  }
                />
                  {activity.maxSize &&
                  (activity.acceptVotes ?? 0) < activity.maxSize &&
                  !activity.participantUsernames?.includes(
                    members.find((m) => m.id.toString() === userId)?.username ?? ""
                  ) && (
                    <Button
                      size="small"
                      onClick={() => handleJoin(activity.id)}
                      style={{
                        background: "rgba(66,214,120,0.15)",
                        color: "#42d678",
                        border: "1px solid rgba(66,214,120,0.4)",
                        borderRadius: "8px",
                        marginLeft: "12px",
                      }}
                    >
                      + Join
                    </Button>
                  )}
                {activity.maxSize && (activity.acceptVotes ?? 0) >= activity.maxSize ? (
                  <Tag color="red">Full</Tag>
                ) : (
                  <Tag color="green">{activity.acceptVotes ?? 0}/{activity.maxSize} joined</Tag>
                )}
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
                  <List.Item 
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", padding: "12px 0", cursor: "pointer", borderRadius: "8px", transition: "background 0.15s" }}
                    onClick={() => router.push(`/groups/${groupId}/activities/${activity.id}`)}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                  >
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
                      {activity.isRecursive && (
                      <Tag color="purple">🔁 Recurring</Tag>
                    )}
                  </List.Item>
                )}
                locale={{ emptyText: <span style={{ color: "rgba(255,255,255,0.3)" }}>None waiting</span> }}
              />
            </div>
          )}

        {/* Rejected Activities */}
        {/*
          Shows activities whose status is REJECTED.
          Uses the same list style as Scheduled Activities..

        */}
        <div style={sectionCard}>
          <h3 style={{ color: "white", marginBottom: "4px" }}>❌ Rejected Activities</h3>
          <p
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: "13px",
              marginBottom: "16px",
            }}
          >
            Activities the user passed on — hit <b style={{ color: "rgba(255,255,255,0.6)" }}>+ Join</b> to change your mind and participate.
          </p>
          <List
            dataSource={declinedActivities}
            renderItem={(activity) => (
              <List.Item
                style={{
                  borderBottom: "1px solid rgba(255,255,255,0.1)",
                  padding: "10px 0",
                  cursor: "pointer",
                  borderRadius: "8px",
                  transition: "background 0.15s"
                }}
                onClick={() => router.push(`/groups/${groupId}/activities/${activity.id}`)}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <List.Item.Meta
                  title={<span style={{ color: "white" }}>{activity.name}</span>}
                  description={
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      {activity.location && (
                        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>
                          📍 {activity.location}
                        </span>
                      )}
                      {activity.participantUsernames &&
                        activity.participantUsernames.length > 0 && (
                          <span
                            style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}
                          >
                            {activity.participantUsernames.join(", ")}
                          </span>
                        )}
                      {activity.isWeatherDependent && (
                        <span
                          style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}
                        >
                          Weather dependent
                          {activity.minTemp != null ? ` · min ${activity.minTemp}°C` : ""}
                          {activity.maxTemp != null ? ` · max ${activity.maxTemp}°C` : ""}
                          {activity.rainPreference
                            ? ` · ${activity.rainPreference}`
                            : ""}
                        </span>
                      )}
                    </div>
                  }
                />
                {(!activity.maxSize || (activity.acceptVotes ?? 0) < activity.maxSize) &&
                  !activity.participantUsernames?.includes(
                     members.find((m) => m.id.toString() === userId)?.username ?? ""
                    ) && (
                     <Button
                        size="small"
                        onClick={() => handleJoin(activity.id)}
                        style={{
                            background: "rgba(66,214,120,0.15)",
                            color: "#42d678",
                            border: "1px solid rgba(66,214,120,0.4)",
                            borderRadius: "8px",
                            marginLeft: "12px",
                         }}
                         >
                           + Join
                         </Button>
                       )}
                <Tag color="red" style={{ marginLeft: "8px" }}>
                  Rejected
                </Tag>
                {activity.isRecursive && <Tag color="purple">🔁 Recurring</Tag>}
              </List.Item>
            )}
            locale={{
              emptyText: (
                <span style={{ color: "rgba(255,255,255,0.3)" }}>
                  No rejected activities
                </span>
              ),
            }}
          />
        </div>

        {/* Calendar */}
        <div style={{
          backgroundColor: "rgba(126,126,126,0.2)",
          borderRadius: "12px",
          padding: "24px",
        }}>
         <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
          <h3 style={{ color: "white", marginBottom: "16px" }}>🗓 Group Calendar</h3>
          <DatePicker
            onChange={(date) => {
              if (date) setCalendarDate(date.toDate());
            }}
            placeholder="Go to date"
            style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.3)", color: "white" }}
          />
          </div>
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
              .rbc-event { background-color: #42a2d6; cursor: pointer;}
              .rbc-event:hover { filter: brightness(1.2); transition: filter 0.15s; }

              .ant-picker {
                background-color: rgba(255,255,255,0.08) !important;
                border-color: rgba(255,255,255,0.2) !important;
              }
              .ant-picker input {
                color: white !important;
              }
              .ant-picker input::placeholder {
                color: rgba(255,255,255,0.4) !important;
              }
              .ant-picker-suffix {
                color: rgba(255,255,255,0.4) !important;
              }

              .ant-modal-body p,
              .ant-modal-body b,
              .ant-modal-body div {
              color: #111111 !important;
              }
            `}</style>
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              date={calendarDate}
              onNavigate={(date) => setCalendarDate(date)}
              style={{ height: "100%" }}
              onSelectEvent={(event) => router.push(`/groups/${groupId}/activities/${event.id}`)}
              eventPropGetter={(event) => ({
                style: {
                backgroundColor: event.isFull ? "#ff4d4f" : "#42d678",
                border: "none",
                borderRadius: "4px",
              }
            })}
            />
          </div>
        </div>
      {/* Floating Chat Button */}
<div
  style={{
    position: "fixed",
    bottom: "32px",
    right: "32px",
    zIndex: 1000,
  }}> 
  <div style={{ position: "relative" }}>
  <Button
    type="primary"
    shape="circle"
    size="large"
    icon={<MessageOutlined />}
    onClick={() => {
      setChatOpen(true); 
      setUnreadCount(0);
      lastSeenCountRef.current = chatMessages.length;
     }}
    style={{
      width: "56px",
      height: "56px",
      backgroundColor: "#42a2d6",
      border: "none",
      boxShadow: "0 4px 16px rgba(66,162,214,0.4)",
      fontSize: "20px",
    }}
  />
  {unreadCount > 0 && (
      <div style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: "12px",
        height: "12px",
        backgroundColor: "#ff4238",
        borderRadius: "50%",
        border: "2px solid #000",
      }} />
    )}
</div>
</div>
    <CreateActivityModal 
      visible={isCreateModalVisible}
      onClose={() => setIsCreateModalVisible(false)}
      groupId={groupId as string}
      userId={userId}
      onSuccess={handleActivityCreated}
      memberCount={members.length}
    />
  </div>
  </div>
  );
};

export default GroupPage;