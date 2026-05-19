"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import { Button, message, Spin, TimePicker } from "antd";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
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

interface Group {
  id: number;
  name: string;
  members: number;
}

interface GroupActivity {
  id: number;
  name: string;
  status: string;
  scheduledTime?: string;
  location?: string;
  duration?: number;
  acceptVotes?: number;
  maxSize?: number;
  isWeatherDependent?: boolean;
  weatherDependent?: boolean;
  isRecursive?: boolean;
  groupId?: number;
  groupName?: string;
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

  const [groupEvents, setGroupEvents] = useState<GroupActivity[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);


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
  
  // Fetch all scheduled activities from all groups 
  const fetchGroupEvents = useCallback(async () => {
    if (!userId) return;
    try {
      setEventsLoading(true);
      const groups = await apiService.get<Group[]>(`/users/${userId}/groups`);
      const allEvents: GroupActivity[] = [];

      await Promise.all(
        groups.map(async (group) => {
          try {
            const scheduled = await apiService.get<GroupActivity[]>(
              `/groups/${group.id}/activities?status=SCHEDULED`
            );
            scheduled.forEach((a) => allEvents.push({ ...a, groupName: group.name, groupId: group.id }));
          } catch {
            // group may have no scheduled activities — skip silently
          }
        })
      );

      allEvents.sort((a, b) => {
        if (!a.scheduledTime) return 1;
        if (!b.scheduledTime) return -1;
        return dayjs(a.scheduledTime).isBefore(dayjs(b.scheduledTime)) ? -1 : 1;
      });

      setGroupEvents(allEvents);
    } catch (error) {
      console.error("Failed to fetch group events:", error);
    } finally {
      setEventsLoading(false);
    }
  }, [userId, apiService]);

  useEffect(() => {
    if (mounted && token) fetchGroupEvents();
  }, [mounted, token, fetchGroupEvents]);

  useEffect(() => {
    setMounted(true);
  }, []);

  
  useEffect(() => {
    if (mounted && (!token || token === "")) {
      router.replace("/login");
    }
  }, [mounted, token, router]);

  // Group events keyed by date for the calendar tiles
  const eventsByDate: Record<string, GroupActivity[]> = {};
  groupEvents.forEach((ev) => {
    if (!ev.scheduledTime) return;
    const date = ev.scheduledTime.split("T")[0];
    if (!eventsByDate[date]) eventsByDate[date] = [];
    eventsByDate[date].push(ev);
  });

  const upcomingEvents = groupEvents.filter(
    (ev) => ev.scheduledTime && dayjs(ev.scheduledTime).isAfter(dayjs().subtract(1, "day"))
  );

  return (
    <div style={{ backgroundColor: "#000", minHeight: "100vh", padding: "40px 20px", color: "white" }}>
      <Button
        icon={<ArrowLeftOutlined />}
        type="text"
        style={{ color: "white", marginBottom: 24 }}
        onClick={() => router.push("/groups")}
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

      {/* ═══ SECTION 1: GROUP EVENTS ═══════════════════════════════════════ */}
      <div style={{ maxWidth: 900, margin: "0 auto 56px" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10, marginBottom: 20,
          borderBottom: "1px solid rgba(255,255,255,0.15)", paddingBottom: 12,
        }}>
          <CalendarOutlined style={{ color: "white", fontSize: 18 }} />
          <h3 style={{ color: "white", margin: 0, fontSize: 20 }}>Upcoming Group Activities</h3>
        </div>

        {eventsLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "40px 0" }}>
            <Spin size="large" />
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div style={{
            backgroundColor: "rgba(126,126,126,0.12)",
            borderRadius: 12, padding: "32px 20px", textAlign: "center",
          }}>
            <CalendarOutlined style={{ fontSize: 32, color: "rgba(255,255,255,0.2)", marginBottom: 12, display: "block" }} />
            <p style={{ color: "rgba(255,255,255,0.35)", margin: 0 }}>
              No upcoming scheduled activities across your groups yet.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {upcomingEvents.map((ev) => {
              const isWeather = ev.isWeatherDependent || ev.weatherDependent;
              const dt = ev.scheduledTime ? dayjs(ev.scheduledTime) : null;
              const isToday = dt?.format("YYYY-MM-DD") === dayjs().format("YYYY-MM-DD");
              const isTomorrow = dt?.format("YYYY-MM-DD") === dayjs().add(1, "day").format("YYYY-MM-DD");

              return (
                <div
                  key={`${ev.groupId}-${ev.id}`}
                  onClick={() => router.push(`/groups/${ev.groupId}/activities/${ev.id}`)}
                  style={{
                    backgroundColor: "rgba(126,126,126,0.15)",
                    border: isToday
                      ? "1px solid rgba(255,255,255,0.3)"
                      : "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 12, padding: "16px 20px",
                    display: "flex", alignItems: "center",
                    cursor: "pointer", gap: 16, transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(126,126,126,0.25)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(126,126,126,0.15)")}
                >
                  {/* Date block */}
                  <div style={{
                    minWidth: 54, textAlign: "center",
                    backgroundColor: "rgba(255,255,255,0.07)",
                    borderRadius: 8, padding: "8px 4px", flexShrink: 0,
                  }}>
                    <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, textTransform: "uppercase", letterSpacing: 1 }}>
                      {dt?.format("MMM")}
                    </div>
                    <div style={{ color: "white", fontSize: 24, fontWeight: "bold", lineHeight: 1.1 }}>
                      {dt?.format("D")}
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 10 }}>
                      {dt?.format("ddd")}
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                      <span style={{ color: "white", fontWeight: 600, fontSize: 15 }}>{ev.name}</span>
                      {isToday && <Tag color="gold" style={{ fontSize: 10, margin: 0 }}>Today</Tag>}
                      {isTomorrow && <Tag color="cyan" style={{ fontSize: 10, margin: 0 }}>Tomorrow</Tag>}
                      {isWeather && <Tag color="blue" style={{ fontSize: 10, margin: 0 }}>Weather</Tag>}
                      {ev.isRecursive && <Tag color="purple" style={{ fontSize: 10, margin: 0 }}>Recurring</Tag>}
                    </div>

                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                      <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                        <TeamOutlined /> {ev.groupName ?? `Group ${ev.groupId}`}
                      </span>
                      {dt && (
                        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                          <ClockCircleOutlined /> {dt.format("HH:mm")}{ev.duration ? ` · ${ev.duration}h` : ""}
                        </span>
                      )}
                      {ev.location && (
                        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                          <EnvironmentOutlined /> {ev.location}
                        </span>
                      )}
                      {ev.maxSize != null && (
                        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                          <TeamOutlined /> {ev.acceptVotes ?? 0}/{ev.maxSize}
                        </span>
                      )}
                    </div>
                  </div>

                  <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 20, flexShrink: 0 }}>›</span>
                </div>
              );
            })}
          </div>
        )}
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
                          style={{ width: "100%",color: "rgba(255, 255, 255, 0.75)" }}
                        />
                        <div style={{ fontSize: 10, color: "gray" }}>To</div>
                        <TimePicker
                          size="small"
                          format="HH:mm"
                          minuteStep={15}
                          value={day?.endTime ? dayjs(day.endTime, "HH:mm") : null}
                          onChange={(v) => handleTimeChange(date, "endTime", v)}
                          style={{ width: "100%", color: "rgba(255, 255, 255, 0.75)" }}
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