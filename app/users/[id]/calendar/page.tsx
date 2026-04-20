"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { Button, message, Spin, TimePicker } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

interface UnavailabilityPostDTO {
  startDateTime: string;
  endDateTime: string;
}

interface UnavailabilityGetDTO {
  id: number;
  startDateTime: string;
  endDateTime: string;
}

type DayStatus = "available" | "unavailable_whole_day" | "unavailable_time_slot";

interface DayState {
  date: string;
  status: DayStatus;
  startTime?: string;
  endTime?: string;
}

const CalendarPage: React.FC = () => {
  const router = useRouter();
  const { id: userId } = useParams() as { id: string };
  const apiService = useApi();



  const {value: token} = useLocalStorage<string>("token", "");
  const [mounted, setMounted] = useState(false);



  const [mode, setMode] = useState<null | "manual" | "google">(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [days, setDays] = useState<Record<string, DayState>>({});

  const next30Days = Array.from({ length: 30 }, (_, i) =>
    dayjs().add(i, "day").format("YYYY-MM-DD")
  );

  useEffect(() => {
    if (mode !== "manual") return;

    const fetchUnavailabilities = async () => {
      try {
        setLoading(true);
        const data = await apiService.get<UnavailabilityGetDTO[]>(`/users/${userId}/unavailability`);
        const map: Record<string, DayState> = {};
        data.forEach((u) => {
          const date = u.startDateTime.split("T")[0];
          const start = u.startDateTime.split("T")[1].slice(0, 5);
          const end = u.endDateTime.split("T")[1].slice(0, 5);
          const isWholeDay = start === "00:00" && end === "23:59";
          map[date] = {
            date,
            status: isWholeDay ? "unavailable_whole_day" : "unavailable_time_slot",
            startTime: isWholeDay ? undefined : start,
            endTime: isWholeDay ? undefined : end,
          };
        });
        setDays(map);
      } catch (error) {
        console.log("No unavailabilities yet", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUnavailabilities();
  }, [mode, userId, apiService]);

  const handleDayClick = (date: string) => {
    const current = days[date]?.status ?? "available";
    if (current === "available") {
      setDays((prev) => ({ ...prev, [date]: { date, status: "unavailable_whole_day" } }));
    } else if (current === "unavailable_whole_day") {
      setDays((prev) => ({ ...prev, [date]: { date, status: "unavailable_time_slot", startTime: "09:00", endTime: "17:00" } }));
    } else {
      setDays((prev) => ({ ...prev, [date]: { date, status: "available" } }));
    }
  };

  const handleTimeChange = (date: string, field: "startTime" | "endTime", value: dayjs.Dayjs | null) => {
    if (!value) return;
    setDays((prev) => ({
      ...prev,
      [date]: { ...prev[date], [field]: value.format("HH:mm") },
    }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) { message.error("Not logged in."); return; }

    try {
      setSaving(true);

      // delete all existing first to avoid duplicates
      await apiService.delete(`/users/${userId}/unavailability`);

      const unavailableDays = Object.values(days).filter((d) => d.status !== "available");
      for (const day of unavailableDays) {
        const body: UnavailabilityPostDTO = {
          startDateTime: day.status === "unavailable_whole_day" ? `${day.date}T00:00:00` : `${day.date}T${day.startTime}:00`,
          endDateTime: day.status === "unavailable_whole_day" ? `${day.date}T23:59:59` : `${day.date}T${day.endTime}:00`,
        };
        await apiService.post(`/users/${userId}/unavailability`, body);
      }

      message.success("Saved!");
    } catch (error) {
      message.error("Not able to save. Try again.");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleGoogleConnect = async () => {
    try { //deleting manual entries so it is clear what option the user wants to use 
      await apiService.delete(`/users/${userId}/unavailability`);
      const authUrl = await apiService.get<string>(`/auth/google?userId=${userId}`);
      window.location.href = authUrl;
    } catch (error) {
      message.error("Error, could not connect to Google.");
      console.error(error);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  
  useEffect(() => {
    if (mounted && (!token || token === "")) {
      router.replace("/login");
    }
  }, [mounted, token, router]);

  return (
    <div style={{ backgroundColor: "#000", minHeight: "100vh", padding: "40px 20px", color: "white" }}>
      <Button
        icon={<ArrowLeftOutlined />}
        type="text"
        style={{ color: "white", marginBottom: 24 }}
        onClick={() => router.push(`/users/${userId}`)}
      >
        Back
      </Button>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <h2 style={{ color: "white", marginBottom: 4 }}>My Calendar - Availabilities</h2>
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <p style={{ color: "gray", marginBottom: 16, fontSize: 18 }}>
          How do you want to manage your availability?
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24, justifyContent: "center" }}>
        <Button
          type={mode === "manual" ? "primary" : "default"}
          onClick={() => setMode("manual")}
          style={mode === "manual" ? { backgroundColor: "white", color: "black", border: "none" } : { backgroundColor: "transparent", color: "white", border: "1px solid gray" }}
        >
          Manual
        </Button>
        <Button
          type={mode === "google" ? "primary" : "default"}
          onClick={() => setMode("google")}
          style={mode === "google" ? { backgroundColor: "white", color: "black", border: "none" } : { backgroundColor: "transparent", color: "white", border: "1px solid gray" }}
        >
          Google Calendar
        </Button>
      </div>

      <div style={{ display: "flex", justifyContent:"center"}}>
      {mode === "google" && (
        <div style={{ marginTop: 8}}>
          <p style={{ color: "gray", fontSize: 16, marginBottom: 16}}>
            Connect your Google account to automatically sync your calendar.
          </p>
          <div style={{ display: "flex", justifyContent:"center"}}>
          <Button
            onClick={handleGoogleConnect}
            style={{ backgroundColor: "white",display:"flex", color: "black", border: "none" ,justifyContent: "center"}}
          >
            Connect to Google Account
          </Button>
          </div>
        </div>
      )}
      </div>

      {mode === "manual" && (
        <div style={{ marginTop: 8 }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "white", marginBottom: 8, fontSize: 18 }}>
              All days start off as available!
            </p>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "gray", marginBottom: 16, fontSize: 14 }}>
              Click once: whole day unavailable | Click again: specific time slot | Click again: available
            </p>
          </div>

          {loading ? (
            <Spin size="large" />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(95px, 1fr))", gap: 8, marginBottom: 24 }}>
              {next30Days.map((date) => {
                const day = days[date];
                const status = day?.status ?? "available";

                let bgColor = "#28a55a";
                let borderColor = "#27b133";
                let label = "Available";

                if (status === "unavailable_whole_day") {
                  bgColor = "#e11b1b";
                  borderColor = "#ff0000";
                  label = "Whole day";
                } else if (status === "unavailable_time_slot") {
                  bgColor = "#244b7f";
                  borderColor = "#2f4c7a";
                  label = "Time slot";
                }

                return (
                  <div key={date} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <div
                      onClick={() => handleDayClick(date)}
                      style={{ border: `1px solid ${borderColor}`, borderRadius: 8, padding: "10px 6px", backgroundColor: bgColor, cursor: "pointer", textAlign: "center" }}
                    >
                      <div style={{ color: "rgba(0,0,0,0.75)", fontSize: 11 }}>{dayjs(date).format("ddd")}</div>
                      <div style={{ color: "white", fontSize: 20, fontWeight: "bold" }}>{dayjs(date).format("D")}</div>
                      <div style={{ fontSize: 11, color: "rgba(0,0,0,0.75)" }}>{dayjs(date).format("MMM")}</div>
                      <div style={{ color: "rgba(0,0,0,0.75)", fontSize: 10, marginTop: 4 }}>{label}</div>
                    </div>

                    {status === "unavailable_time_slot" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, padding: "4px 2px" }}>
                        <div style={{ fontSize: 10, color: "gray" }}>From</div>
                        <TimePicker
                          size="small"
                          format="HH:mm"
                          minuteStep={15}
                          value={day?.startTime ? dayjs(day.startTime, "HH:mm") : null}
                          onChange={(v) => handleTimeChange(date, "startTime", v)}
                          style={{ width: "100%" }}
                        />
                        <div style={{ fontSize: 10, color: "gray" }}>To</div>
                        <TimePicker
                          size="small"
                          format="HH:mm"
                          minuteStep={15}
                          value={day?.endTime ? dayjs(day.endTime, "HH:mm") : null}
                          onChange={(v) => handleTimeChange(date, "endTime", v)}
                          style={{ width: "100%" }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <Button
            type="primary"
            size="large"
            loading={saving}
            onClick={handleSave}
            style={{ backgroundColor: "white", color: "black", fontWeight: "bold", border: "none", height: 50, width: "100%" }}
          >
            Save
          </Button>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;