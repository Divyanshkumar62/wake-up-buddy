import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, signOut } from "../services/authService";
import {
  getWakeLogs,
  logWakeup,
  hasLoggedToday,
  getLastWake,
  calculateStreak,
} from "../services/wakeupService";
import type { WakeLog } from "../services/wakeupService";
import { getMotivationMessage } from "../services/groqService";
import { AnimatePresence, motion } from "framer-motion";
import { LocalNotifications } from "@capacitor/local-notifications";

// Card component for visual polish
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-md p-6 mb-4 w-full max-w-md mx-auto border border-zinc-200 dark:border-zinc-800">
      {children}
    </div>
  );
}

type User = {
  id: string;
  email: string;
};

const DEFAULT_HOUR = 6;
const DEFAULT_MINUTE = 30;

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [logs, setLogs] = useState<WakeLog[] | null>(null);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [marking, setMarking] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [motivation, setMotivation] = useState("");
  const [showMotivation, setShowMotivation] = useState(false);
  const [reminderTime, setReminderTime] = useState<{
    hour: number;
    minute: number;
  } | null>(null);
  const [reminderSet, setReminderSet] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const navigate = useNavigate();
  // Add state for showing change/cancel UI
  const [showChangeReminder, setShowChangeReminder] = useState(false);

  // Fetch user
  useEffect(() => {
    getCurrentUser().then(({ data }: any) => {
      if (!data?.user) navigate("/login");
      else setUser({ id: data.user.id, email: data.user.email });
      setLoadingUser(false);
    });
  }, [navigate]);

  // Fetch logs
  useEffect(() => {
    if (!user) return;
    setLoadingLogs(true);
    getWakeLogs(user.id)
      .then((data) => setLogs(data))
      .catch(() => setLogs([]))
      .finally(() => setLoadingLogs(false));
  }, [user, marking]);

  // Check if a notification is already scheduled
  useEffect(() => {
    const checkScheduled = async () => {
      const pending = await LocalNotifications.getPending();
      setReminderSet(pending.notifications.some((n) => n.id === 1));
    };
    checkScheduled();
  }, []);

  // Mark wake-up handler
  const handleWakeup = async () => {
    if (!user) return;
    setMarking(true);
    setFeedback("");
    try {
      await logWakeup(user.id);
      setFeedback("Marked! 🌅");
      // Fetch motivational message
      const now = new Date();
      const formattedTime = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const streakCount = logs ? calculateStreak(logs) + 1 : 1; // +1 for just-logged
      const message = await getMotivationMessage(streakCount, formattedTime);
      setMotivation(message);
      setShowMotivation(true);
      setTimeout(() => setShowMotivation(false), 4000);
      // Schedule reminder if not already set
      if (!reminderSet) {
        scheduleReminder();
      }
    } catch (e: any) {
      setFeedback("Error logging wake-up");
    } finally {
      setMarking(false);
    }
  };

  // Schedule daily notification
  const scheduleReminder = async (hour?: number, minute?: number) => {
    const now = new Date();
    const reminderTime = new Date();
    reminderTime.setHours(hour ?? DEFAULT_HOUR, minute ?? DEFAULT_MINUTE, 0, 0);
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }
    await LocalNotifications.schedule({
      notifications: [
        {
          title: "⏰ Wake-Up Time!",
          body: "Time to rise and shine! Don’t break your streak 🔥",
          id: 1,
          schedule: {
            at: reminderTime,
            repeats: true,
          },
          sound: undefined, // fix linter error
        },
      ],
    });
    setReminderSet(true);
    setReminderTime({
      hour: hour ?? DEFAULT_HOUR,
      minute: minute ?? DEFAULT_MINUTE,
    });
  };

  // Time picker handler
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hour, minute] = e.target.value.split(":").map(Number);
    setReminderTime({ hour, minute });
  };
  const handleSetTime = async () => {
    if (reminderTime) {
      await LocalNotifications.cancel({ notifications: [{ id: 1 }] });
      await scheduleReminder(reminderTime.hour, reminderTime.minute);
      setShowTimePicker(false);
      setShowChangeReminder(false); // Fix: exit edit mode after save
    }
  };

  // Streak, last wake, and button state
  const streak = logs ? calculateStreak(logs) : 0;
  const lastWake = logs ? getLastWake(logs) : null;
  const alreadyLogged = logs ? hasLoggedToday(logs) : false;

  // Check if it's too late to log today
  const now = new Date();
  const cutoff = new Date();
  cutoff.setHours(8, 0, 0, 0);
  const tooLate = now > cutoff;

  // Helper to format reminder time for display
  const formatTime = (hour: number, minute: number) =>
    `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;

  if (loadingUser || loadingLogs) {
    // Skeleton loading
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 p-4">
        <div className="w-full max-w-md space-y-4">
          <div className="animate-pulse h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3 mx-auto mb-4" />
          <div className="animate-pulse h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2 mx-auto mb-2" />
          <div className="animate-pulse h-12 bg-zinc-200 dark:bg-zinc-800 rounded w-full mb-2" />
          <div className="animate-pulse h-10 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2 mx-auto" />
        </div>
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 p-4">
      <div className="w-full max-w-md space-y-6">
        <Card>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
              Good Morning 🌅
            </h1>
            <button
              onClick={async () => {
                await signOut();
                navigate("/login");
              }}
              className="px-3 py-1 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-sm font-medium transition"
            >
              Log Out
            </button>
          </div>
          <p className="text-zinc-600 dark:text-zinc-300 mb-1">
            Welcome, <span className="font-semibold">{user.email}</span>
          </p>
        </Card>
        <Card>
          <p className="text-lg text-zinc-700 dark:text-zinc-200 mb-2">
            Streak:{" "}
            <span className="font-bold text-blue-600 dark:text-blue-400">
              {streak}
            </span>{" "}
            day(s)
          </p>
          {lastWake && (
            <p className="text-zinc-600 dark:text-zinc-300 mb-2">
              Last Wake-up:{" "}
              <span className="font-semibold">
                {new Date(lastWake).toLocaleString()}
              </span>
            </p>
          )}
          <button
            onClick={handleWakeup}
            disabled={alreadyLogged || tooLate || marking}
            className={`w-full py-3 rounded-lg font-semibold text-lg transition shadow-md
              ${
                alreadyLogged || tooLate || marking
                  ? "bg-zinc-300 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600 text-white"
              }
            `}
          >
            {alreadyLogged
              ? "Already marked today 👏"
              : tooLate
              ? "Too late to log today 🕗"
              : marking
              ? "Marking..."
              : "✅ Mark Today's Wake-Up"}
          </button>
          {feedback && (
            <div className="mt-2 text-center text-green-600 dark:text-green-400 font-medium">
              {feedback}
            </div>
          )}
          {/* Reminder time picker (if not set) */}
          {!reminderSet && (
            <div className="mt-4 flex flex-col items-center">
              <p className="mb-2 text-zinc-600 dark:text-zinc-300">
                Set your daily wake-up reminder time:
              </p>
              <input
                type="time"
                value={
                  reminderTime
                    ? formatTime(reminderTime.hour, reminderTime.minute)
                    : "06:30"
                }
                onChange={handleTimeChange}
                className="px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                style={{ width: 120 }}
              />
              <button
                onClick={handleSetTime}
                className="mt-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Set Reminder
              </button>
            </div>
          )}
          {/* Show current reminder and allow change/cancel if set */}
          {reminderSet && reminderTime && (
            <div className="mt-4 flex flex-col items-center">
              <p className="mb-2 text-zinc-600 dark:text-zinc-300">
                <span className="font-semibold">Wake-up reminder set for:</span>{" "}
                {formatTime(reminderTime.hour, reminderTime.minute)}
              </p>
              {!showChangeReminder ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowChangeReminder(true)}
                    className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-600 text-white font-semibold"
                  >
                    Change Time
                  </button>
                  <button
                    onClick={async () => {
                      await LocalNotifications.cancel({
                        notifications: [{ id: 1 }],
                      });
                      setReminderSet(false);
                      setReminderTime(null);
                      setShowChangeReminder(false);
                    }}
                    className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white font-semibold"
                  >
                    Cancel Reminder
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <input
                    type="time"
                    value={formatTime(reminderTime.hour, reminderTime.minute)}
                    onChange={handleTimeChange}
                    className="px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    style={{ width: 120 }}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSetTime}
                      className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setShowChangeReminder(false)}
                      className="px-4 py-2 rounded bg-zinc-400 hover:bg-zinc-500 text-white font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
      {/* Animated Toast for Motivation */}
      <AnimatePresence>
        {showMotivation && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-2xl shadow-2xl bg-gradient-to-br from-pink-400 via-yellow-300 to-green-400 text-white text-lg font-bold flex items-center gap-3 animate-bounce cursor-pointer"
            onClick={() => setShowMotivation(false)}
            style={{ minWidth: 250, maxWidth: 350 }}
          >
            <span className="text-3xl">🎉</span>
            <span className="flex-1">{motivation}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
