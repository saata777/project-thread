"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import Image from "next/image";

interface UserData {
  displayName: string;
  bio?: string;
  photoURL?: string;
  email?: string;
  link?: string;
}

interface Post {
  id: string;
  content: string;
  createdAt: string; // Specify the type explicitly
}

const UserProfilePage = () => {
  const searchParams = useSearchParams();
  const userId = searchParams?.get("userId") ?? "null";

  const [userData, setUserData] = useState<UserData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    if (!userId) return;

    const fetchUserData = async () => {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setUserData(userSnap.data() as UserData);
      }
    };

    const fetchUserPosts = async () => {
      const postsQuery = query(
        collection(db, "posts"),
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(postsQuery);
      const postList: Post[] = [];
      querySnapshot.forEach((doc) =>
        postList.push({ id: doc.id, ...doc.data() } as Post)
      );
      setPosts(postList);
    };

    fetchUserData();
    fetchUserPosts();
  }, [userId]);

  if (!userData) {
    return <div className="text-center py-10 text-gray-500">User not found</div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 bg-black min-h-screen text-white">
      <div className="relative bg-zinc-950 rounded-xl p-6 shadow-lg">
        <div className="absolute left-[560px] top-[7px]">
          <Image
            src={userData.photoURL || "/default-profile.png"}
            alt="Profile"
            width={96}
            height={96}
            className="w-24 h-24 rounded-full border-4 border-black object-cover"
          />
        </div>
        <div className="pl-3">
          <h1 className="text-2xl font-bold">{userData.displayName}</h1>
          {userData.email && (
            <p className="text-sm text-gray-400 mt-1">
              <a href={`mailto:${userData.email}`} className="underline">{userData.email}</a>
            </p>
          )}
          {userData.bio && <p className="text-sm mt-5 text-gray-300">{userData.bio}</p>}
          {userData.link && (
            <p className="text-sm text-blue-400 mt-3">
              🔗 <a href={userData.link} target="_blank" rel="noopener noreferrer" className="underline">{userData.link}</a>
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-around border-b border-zinc-800 mt-8">
        <button className="py-2 font-semibold border-b-2 border-white">Threads</button>
        <button className="py-2 text-gray-500">Replies</button>
        <button className="py-2 text-gray-500">Reposts</button>
      </div>

      <div className="mt-6 space-y-6">
        {posts.length === 0 ? (
          <p className="text-center text-gray-400">No posts yet</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="bg-zinc-900 p-4 rounded-xl">
              <div className="flex items-center gap-3 mb-2">
                <Image
                  src={userData.photoURL || "/default-profile.png"}
                  alt="Avatar"
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-semibold">{userData.displayName}</p>
                </div>
              </div>
              <p className="text-sm">{post.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;