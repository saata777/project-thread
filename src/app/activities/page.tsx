"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from ".././firebase";
import Link from "next/link";

export default function ActivitiesPage() {
  const { currentUser }: { currentUser: { uid: string } | null } = useAuth();
  interface Activity {
    id: string;
    type: "like" | "comment" | "follow";
    byUser?: string;
    content?: string;
    createdAt?: { toDate: () => Date };
  }
  
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, "activities"),
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setActivities(
        snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            type: data.type,
            byUser: data.byUser,
            content: data.content,
            createdAt: data.createdAt,
          } as Activity;
        })
      );
    });

    return unsubscribe;
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto py-8 text-center">
        <h2 className="text-xl font-semibold mb-4">
          Please login to view your activities
        </h2>
        <div className="flex justify-center space-x-4">
          <Link
            href="/login"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Your Activities</h1>

      <div className="space-y-4">
        {activities.length === 0 ? (
          <p className="text-gray-500">No activities yet</p>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="bg-white p-4 rounded-lg shadow">
              <p className="text-gray-700">
                {activity.type === "like" && (
                  <span>Someone liked your post</span>
                )}
                {activity.type === "comment" && (
                  <span>
                    {activity.byUser} commented on your post: 
                    {activity.content}"
                  </span>
                )}
                {activity.type === "follow" && (
                  <span>{activity.byUser} started following you</span>
                )}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {activity.createdAt?.toDate()
                  ? new Date(activity.createdAt.toDate()).toLocaleString()
                  : "Recently"}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
