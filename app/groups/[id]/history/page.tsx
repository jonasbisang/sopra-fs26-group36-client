"use client";

import { useRouter, useParams } from "next/navigation";
import useLocalStorage from "@/hooks/useLocalStorage";
import { Button } from "antd";
import {
  ArrowLeftOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import NextImage from "next/image";
import logo from "@/friendlerLogo.png";


//defining the component for the history item
const HistoryPage: React.FC = () => {
    const router = useRouter();
    const params = useParams();
    const groupId = params.id; //make sure the url knows the group id

    const { value: token } = useLocalStorage<string>("token", "");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
    setMounted(true);
    }, []);

    //log in protection
    useEffect(() => {
    if (mounted && (!token || token === "")) {
        router.replace("/login");
    }
    }, [mounted, token, router]);


return (
    <div
        style={{
            backgroundColor: "#000000",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
        }}
    >

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
            Browse activities that already happened or didn't make the cut.
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
    
    </div>

    </div>

    </div>

);
};

export default HistoryPage;

