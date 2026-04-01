"use client";

import { useEffect, useState } from "react";

interface Activity {
  description: string;
  time: string;
}

function activityIcon(desc: string) {
  if (desc.toLowerCase().includes("case")) return { icon: "📁", bg: "bg-blue-100" };
  if (desc.toLowerCase().includes("evidence")) return { icon: "🗂️", bg: "bg-green-100" };
  if (desc.toLowerCase().includes("analysis") || desc.toLowerCase().includes("ai")) return { icon: "🤖", bg: "bg-purple-100" };
  return { icon: "🔔", bg: "bg-gray-100" };
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/activity")
      .then((r) => r.json())
      .then(setActivities)
      .catch(() => setActivities([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm">
      <h2 className="font-semibold text-gray-700 mb-4">Recent Activity</h2>
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-3xl mb-2">📭</p>
          <p className="text-sm text-gray-400">No activity yet. Create a case to get started.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {activities.map((act, i) => {
            const { icon, bg } = activityIcon(act.description);
            return (
              <li key={i} className="flex items-start gap-3">
                <span className={`${bg} w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-0.5`}>
                  {icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 leading-snug">{act.description}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{act.time}</p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
