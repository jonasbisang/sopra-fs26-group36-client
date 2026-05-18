"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { Button, message, Spin, TimePicker, DatePicker, Modal } from "antd";
import { ArrowLeftOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import useLocalStorage from "@/hooks/useLocalStorage";
import { getApiDomain } from "@/utils/domain";

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

  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf("month"));
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [timeModalOpen, setTimeModalOpen] = useState(false);
  const [tempStart, setTempStart] = useState<dayjs.Dayjs | null>(null);
  const [tempEnd, setTempEnd] = useState<dayjs.Dayjs | null>(null);

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
    const isPast = dayjs(date).isBefore(dayjs(), "day");
    if (isPast) return;

    const current = days[date]?.status ?? "available";
    if (current === "available") {
      setDays((prev) => ({ ...prev, [date]: { date, status: "unavailable_whole_day" } }));
    } else if (current === "unavailable_whole_day") {
      setSelectedDay(date);
      setTempStart(dayjs("09:00", "HH:mm"));
      setTempEnd(dayjs("17:00", "HH:mm"));
      setTimeModalOpen(true);
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

  const handleTimeConfirm = () => {
    if (!selectedDay || !tempStart || !tempEnd) return;
    if (!tempEnd.isAfter(tempStart)) {
      message.error("End time must be after start time.");
      return;
    }
    setDays((prev) => ({
      ...prev,
      [selectedDay]: {
        date: selectedDay,
        status: "unavailable_time_slot",
        startTime: tempStart.format("HH:mm"),
        endTime: tempEnd.format("HH:mm"),
      },
    }));
    setTimeModalOpen(false);
    setSelectedDay(null);
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) { message.error("Not logged in."); return; }

    try {
      setSaving(true);

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
    try {
      const baseURL = getApiDomain();
      const response = await fetch(`${baseURL}/auth/google?userId=${userId}`);
      const authUrl = await response.text();
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

  const startDay = currentMonth.startOf("month").day();
  const daysInMonth = currentMonth.endOf("month").date();
 
  const calendarDays: (string | null)[] = [];
  for (let i = 0; i < startDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(currentMonth.date(d).format("YYYY-MM-DD"));
  }
 
  const getDayColors = (date: string) => {
    const status = days[date]?.status ?? "available";
    const isPast = dayjs(date).isBefore(dayjs(), "day");
    if (isPast) return { bg: "rgba(255,255,255,0.03)", border: "rgba(255,255,255,0.05)", text: "rgba(255,255,255,0.2)" };
    if (status === "unavailable_whole_day") return { bg: "rgba(255,66,56,0.2)", border: "rgba(255,66,56,0.5)", text: "white" };
    if (status === "unavailable_time_slot") return { bg: "rgba(66,162,214,0.2)", border: "rgba(66,162,214,0.5)", text: "white" };
    return { bg: "rgba(66,214,120,0.1)", border: "rgba(66,214,120,0.3)", text: "white" };
  };
 
  const isToday = (date: string) => dayjs(date).isSame(dayjs(), "day");

  return (
    <div style={{ backgroundColor: "#000", minHeight: "100vh", padding: "32px 40px", color: "white" }}>
      
    <style>{`
      .ant-picker { background-color: #f0f0f0 !important; border-color: #d9d9d9 !important; color: black !important; }
      .ant-picker input { color: black !important; }
    `}</style>

    <Modal
      open={timeModalOpen}
      title={<span style={{ color: "black" }}>Set unavailable time for {selectedDay && dayjs(selectedDay).format("DD. MMMM YYYY")}</span>}
      onOk={handleTimeConfirm}
      onCancel={() => { setTimeModalOpen(false); setSelectedDay(null); }}
      okText="Confirm"
      okButtonProps={{ style: { backgroundColor: "black", color: "white" } }}
      styles={{
        body: { backgroundColor: "white" },
        header: { backgroundColor: "white" },
        footer: { backgroundColor: "white" },
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "16px 0" }}>
        <div>
          <p style={{ marginBottom: 6, color: "#555", fontSize: 12 }}>FROM</p>
          <TimePicker
            format="HH:mm"
            minuteStep={15}
            value={tempStart}
            onChange={(v) => setTempStart(v)}
            style={{ width: "100%", backgroundColor: "#f5f5f5", borderColor: "#d9d9d9", color: "black" }}
            popupStyle={{ zIndex: 2000 }}
          />
        </div>
        <div>
          <p style={{ marginBottom: 6, color: "#555", fontSize: 12 }}>TO</p>
          <TimePicker
            format="HH:mm"
            minuteStep={15}
            value={tempEnd}
            onChange={(v) => setTempEnd(v)}
            disabledTime={() => ({
              disabledHours: () => tempStart ? Array.from({ length: tempStart.hour() + 1 }, (_, i) => i) : [],
            })}
            style={{ width: "100%", backgroundColor: "#f5f5f5", borderColor: "#d9d9d9", color: "black" }}
            popupStyle={{ zIndex: 2000 }}
          />
        </div>
      </div>
    </Modal>
 
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <Button icon={<ArrowLeftOutlined />} type="text" style={{ color: "white" }} onClick={() => router.push("/groups")}>
          Back
        </Button>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ color: "white", margin: 0, fontSize: 22, fontWeight: 600 }}>My Calendar - Availabilities</h2>
          <p style={{ color: "rgba(255,255,255,0.4)", margin: 0, fontSize: 13 }}>How do you want to manage your availability?</p>
        </div>
        <div style={{ width: 80 }} />
      </div>
 
      {/* Mode buttons */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 32 }}>
        <Button
          onClick={() => setMode("manual")}
          style={{
            backgroundColor: mode === "manual" ? "white" : "transparent",
            color: mode === "manual" ? "black" : "rgba(255,255,255,0.6)",
            border: mode === "manual" ? "none" : "1px solid rgba(255,255,255,0.2)",
            borderRadius: 999, fontWeight: 500,
          }}
        >
          Manual
        </Button>
        <Button
          onClick={() => setMode("google")}
          style={{
            backgroundColor: mode === "google" ? "white" : "transparent",
            color: mode === "google" ? "black" : "rgba(255,255,255,0.6)",
            border: mode === "google" ? "none" : "1px solid rgba(255,255,255,0.2)",
            borderRadius: 999, fontWeight: 500,
          }}
        >
          Google Calendar
        </Button>
      </div>
 
      {/* Google mode */}
      {mode === "google" && (
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ marginTop: 8, textAlign: "center" }}>
            <p style={{ color: "gray", fontSize: 16, marginBottom: 16 }}>
              Connect your Google account to automatically sync your calendar.
            </p>
            <Button onClick={handleGoogleConnect} style={{ backgroundColor: "white", color: "black", border: "none" }}>
              Connect to Google Account
            </Button>
          </div>
        </div>
      )}
 
      {/* Manual mode */}
      {mode === "manual" && (
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
 
          {/* Legend */}
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginBottom: 24, flexWrap: "wrap" }}>
            {[
              { color: "rgba(66,214,120,0.3)", border: "rgba(66,214,120,0.5)", label: "Available" },
              { color: "rgba(255,66,56,0.2)", border: "rgba(255,66,56,0.5)", label: "Whole day off" },
              { color: "rgba(66,162,214,0.2)", border: "rgba(66,162,214,0.5)", label: "Time slot off" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: item.color, border: `1px solid ${item.border}` }} />
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{item.label}</span>
              </div>
            ))}
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>· Click to cycle through states</span>
          </div>
 
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
              <Spin size="large" />
            </div>
          ) : (
            <>
              {/* Jump to month */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                <DatePicker
                  picker="month"
                  value={currentMonth}
                  onChange={(date) => { if (date) setCurrentMonth(date.startOf("month")); }}
                  allowClear={false}
                  style={{ backgroundColor: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.2)" }}
                />
              </div>
 
              {/* Month navigation */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <Button
                  icon={<LeftOutlined />}
                  type="text"
                  style={{ color: "white" }}
                  onClick={() => setCurrentMonth((m) => m.subtract(1, "month"))}
                  disabled={currentMonth.isSame(dayjs().startOf("month"), "month")}
                />
                <span style={{ color: "white", fontWeight: 600, fontSize: 16 }}>
                  {currentMonth.format("MMMM YYYY")}
                </span>
                <Button
                  icon={<RightOutlined />}
                  type="text"
                  style={{ color: "white" }}
                  onClick={() => setCurrentMonth((m) => m.add(1, "month"))}
                />
              </div>
 
              {/* Weekday headers */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 4 }}>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 11, fontWeight: 600, padding: "4px 0" }}>
                    {d}
                  </div>
                ))}
              </div>
 
              {/* Calendar grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
                {calendarDays.map((date, i) => {
                  if (!date) return <div key={i} />;
                  const colors = getDayColors(date);
                  const isPast = dayjs(date).isBefore(dayjs(), "day");
                  const status = days[date]?.status ?? "available";
                  const dayData = days[date];
 
                  return (
                    <div
                      key={date}
                      onClick={() => handleDayClick(date)}
                      style={{
                        backgroundColor: colors.bg,
                        border: `1px solid ${isToday(date) ? "rgba(255,255,255,0.6)" : colors.border}`,
                        borderRadius: 8,
                        padding: "10px 6px",
                        cursor: isPast ? "default" : "pointer",
                        textAlign: "center",
                        transition: "all 0.15s ease",
                        outline: isToday(date) ? "2px solid rgba(255,255,255,0.3)" : "none",
                        outlineOffset: 2,
                      }}
                    >
                      <div style={{ color: colors.text, fontSize: 16, fontWeight: isToday(date) ? 700 : 500 }}>
                        {dayjs(date).date()}
                      </div>
                      {status === "unavailable_time_slot" && dayData?.startTime && (
                        <div style={{ color: "rgba(66,162,214,0.8)", fontSize: 9, marginTop: 2 }}>
                          {dayData.startTime}–{dayData.endTime}
                        </div>
                      )}
                      {status === "unavailable_whole_day" && (
                        <div style={{ color: "rgba(255,66,56,0.8)", fontSize: 9, marginTop: 2 }}>all day</div>
                      )}
                    </div>
                  );
                })}
              </div>
 
              {/* Save button */}
              <Button
                type="primary"
                size="large"
                loading={saving}
                onClick={handleSave}
                style={{ backgroundColor: "white", color: "black", fontWeight: "bold", border: "none", height: 50, width: "100%", borderRadius: 10, marginTop: 24 }}
              >
                Save
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarPage;