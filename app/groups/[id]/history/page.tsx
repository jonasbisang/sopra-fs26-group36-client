"use client";

import { useRouter, useParams } from "next/navigation";
import useLocalStorage from "@/hooks/useLocalStorage";
import {
  ArrowLeftOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  RedoOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import NextImage from "next/image";
import logo from "@/friendlerLogo.png";
import { useApi } from "@/hooks/useApi";
import { Button, message, List, Tag, Popconfirm } from "antd";
import moment from "moment";


//qhat an activity looks like, we will use this to type the data we get from the backend and display it properly
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
  participantUsernames?: string[];
  isRecursive?: boolean;
}


//defining the component for the history item
const HistoryPage: React.FC = () => {
    const router = useRouter();
    const params = useParams();
    const groupId = params.id; //make sure the url knows the group id
    const apiService = useApi(); //gives access to the api service we defined in useApi.ts, this will allow us to make requests to the backend
    const [messageApi, contextHolder] = message.useMessage(); //used for showing messages to the user, like errors or success messages

    const { value: token } = useLocalStorage<string>("token", "");
    const [mounted, setMounted] = useState(false);

    const [pastActivities, setPastActivities] = useState<Activity[]>([]);
    const [pastError, setPastError] = useState(false);
    const [pastLoading, setPastLoading] = useState(true);

    const [failedActivities, setFailedActivities] = useState<Activity[]>([]);
    const [failedError, setFailedError] = useState(false);
    const [failedLoading, setFailedLoading] = useState(true);

    const [revivingIds, setRevivingIds] = useState<Set<number>>(new Set());

    useEffect(() => {
    setMounted(true);
    }, []);

    //log in protection
    useEffect(() => {
    if (mounted && (!token || token === "")) {
        router.replace("/login");
    }
    }, [mounted, token, router]);

    useEffect(() => {
        //fetch past activities
        if (!groupId || !token) return;
        const fetchPast = async () => {
            setPastError(false);

            try {
            const data = await apiService.get<Activity[]>(
                `/groups/${groupId}/activities?status=COMPLETED`
            );
            // Extra client-side guard: only show entries whose scheduledTime is in the past
            const now = new Date();
            const past = data.filter(
                (a) => a.scheduledTime && new Date(a.scheduledTime) < now
            );
            setPastActivities(past);
        }   catch (error) {
            console.error("Failed to fetch past activities:", error);
            setPastError(true);
        }   finally {
            setPastLoading(false);
        }
    };
    fetchPast();
}, [groupId, token, apiService]);   

    useEffect(() => {
        //fetch failed activities
        if (!groupId || !token) return;
        const fetchFailed = async () => {
            setFailedError(false);

            try {
            const data = await apiService.get<Activity[]>(
                `/groups/${groupId}/activities?status=REJECTED`
            );

            setFailedActivities(data);
        }   catch (error) {
            console.error("Failed to fetch failed activities:", error);
            setFailedError(true);
        }   finally {
            setFailedLoading(false);
        }
    };
    fetchFailed();
}, [groupId, token, apiService]);

    const handleRevive = async (activityId: number, source: "past" | "failed") => {
        setRevivingIds((prev) => new Set([...prev, activityId]));
        try {
            await apiService.post(`/activities/${activityId}/revive`, {}); //backend call 
            messageApi.success("Activity revived! It's back in the voting pool. 🔄");
            //remove from the list it came from
            if (source === "past") {
                setPastActivities((prev) => prev.filter((a) => a.id !== activityId));
            } else {
                setFailedActivities((prev) => prev.filter((a) => a.id !== activityId));
            }
        } catch (error) {
          messageApi.error("Failed to revive activity.");
          console.error(error);
        } finally {
          setRevivingIds((prev) => {
            const next = new Set(prev);
            next.delete(activityId);
            return next;
          });
        }
    };

    //form used for fetching failed or past activities
    const renderActivityItem = (activity: Activity, source: "past" | "failed") => (
    <List.Item
        key={activity.id}
        style={{
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        padding: "14px 0",
        }}
    >
        <List.Item.Meta
        title={
            <span style={{ color: "white", fontSize: "15px", fontWeight: 600 }}>
                {activity.name}
            </span>
        }
        description={
            <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "3px",
                marginTop: "4px",
            }}
            >
            {activity.scheduledTime && (
                <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "12px" }}>
                    📅 {moment(activity.scheduledTime).format("DD.MM.YYYY HH:mm")}
                </span>
            )}
            {activity.location && (
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "12px" }}>
                    📍 {activity.location}
                </span>
            )}
            {activity.participantUsernames &&
                activity.participantUsernames.length > 0 && (
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px" }}>
                    👥 {activity.participantUsernames.join(", ")}
                </span>
                )}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                {source === "past" ? (
                    <Tag color="default">Completed</Tag>
                ) : (
                    <Tag color="red">Failed</Tag>
                )}
                {activity.isRecursive && <Tag color="purple">🔁 Recurring</Tag>}
                {activity.isWeatherDependent && <Tag color="cyan">Weather-dependent</Tag>}
            </div>
            </div>
        }
        />

        <Popconfirm
            title="Put this activity back in the voting pool?"
            description="A fresh copy will be created so everyone can vote again."
            onConfirm={() => handleRevive(activity.id, source)}
            okText="Revive it!"
            cancelText="Cancel"
            >
            <Button
                size="small"
                icon={<RedoOutlined />}
                loading={revivingIds.has(activity.id)}
                style={{
                background: "rgba(66,162,214,0.15)",
                color: "#42a2d6",
                border: "1px solid rgba(66,162,214,0.4)",
                borderRadius: "8px",
                marginLeft: "16px",
                flexShrink: 0,
                }}
            >
                Revive
            </Button>
        </Popconfirm>
    </List.Item>
    );


return (
    <div
        style={{
            backgroundColor: "#000000",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
        }}
    >
    {contextHolder}

    {/* Header with back button and logo */}

    <div
        style={{
            width: "100%",
            padding: "20px 50px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
    >
    <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            style={{ color: "white", fontWeight: "bold" }}
            onClick={() => router.push(`/groups/${groupId}`)}
    >
        Back to Group
    </Button>

    <div style={{ display: "flex", justifyContent: "center" }}>
        <NextImage src={logo} alt="Friendler Logo" width={120} height={40} />
    </div>

    <div style={{ width: "140px" }} />
    </div>

    {/* Page title */}
    <div style={{ padding: "40px 50px 0" }}>
        <h2 style={{ color: "white", fontSize: "28px", fontWeight: 700, margin: 0 }}>
            Group History
        </h2>
        <p style={{ color: "rgba(255,255,255,0.4)", marginTop: "8px", fontSize: "14px" }}>
            Browse activities that already happened or didn&apos;t make the cut.
        </p>
    </div>

    <div
        style={{
            padding: "30px 50px 60px",
            display: "flex",
            flexDirection: "column",
            gap: "40px",
    }}
>
    <div
        style={{
            backgroundColor: "rgba(126,126,126,0.2)",
            borderRadius: "12px",
            padding: "24px",
        }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <ClockCircleOutlined style={{ color: "#42a2d6", fontSize: "18px" }} />
        <h3 style={{ color: "white", margin: 0 }}>Past Activities</h3>
    </div>

    {pastLoading ? (
    <div style={{ padding: "20px 0" }} />
        ) : pastError ? (
    <div
        style={{
        textAlign: "center",
        padding: "40px 0",
        color: "rgba(255,100,100,0.7)",
        }}
  >
    <p>Failed to load past activities.</p>
    </div>
    ) : (
  
    <List
        dataSource={pastActivities}
        renderItem={(a) => renderActivityItem(a, "past")}
        locale={{
            emptyText: (
                <span style={{ color: "rgba(255,255,255,0.4)", display: "block", padding: "40px 0", textAlign: "center" }}>
                No completed activities yet!
                </span>
            ),
        }}

        />
    )}

    </div>

    <div
    style={{
      backgroundColor: "rgba(126,126,126,0.2)",
      borderRadius: "12px",
      padding: "24px",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <CloseCircleOutlined style={{ color: "#ff4238", fontSize: "18px" }} />
        <h3 style={{ color: "white", margin: 0 }}>Failed Activities</h3>
    </div>

    {failedLoading ? (
    <div style={{ padding: "20px 0" }} />
    ) : failedError ? (
    <div
        style={{
        textAlign: "center",
        padding: "40px 0",
        color: "rgba(255,100,100,0.7)",
        }}
    >
        <p>Failed to load failed activities.</p>
    </div>
    ) : (
    <List
        dataSource={failedActivities}
        renderItem={(a) => renderActivityItem(a, "failed")}
        locale={{
            emptyText: (
                <span style={{ color: "rgba(255,255,255,0.4)", display: "block", padding: "40px 0", textAlign: "center" }}>
                No failed activities, the group has great taste ;).
                </span>
            ),
            }}
        />
    )}
    
    </div>

    </div>

    </div>

);
};

export default HistoryPage;

