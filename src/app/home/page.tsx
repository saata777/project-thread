"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import PostCard from "../components/PostCard";
import { CreatePost } from "../components/CreatePost";

const HomePage = () => {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<{ id: string; [key: string]: any }[]>([]);
  const router = useRouter();

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, []);

  const onLogin = () => {
    router.push("/login");
  };

  const onRegister = () => {
    router.push("/register");
  };

  return (
    <div className="max-w-2xl rounded-t-[30px] border-[#272727] border-b-0 border-[2px] bg-[#1a1a1a] text-black mx-auto">
      <h1 className="absolute top-4 left-[650px] text-white ">Home</h1>
      {!currentUser && (
        <div className="inset-0 fixed ml-[1000px] mb-[300px] flex items-center justify-center">
          <div className="bg-[#151515] p-6 rounded-xl shadow-xl border">
            <h2 className="text-[38px] font-bold text-white mb-4 text-center">
              Say more with Threads
            </h2>
            <p className="text-gray-300 mb-6 text-center">
              Join Threads to share thoughts, find out what&#39;s <br /> going on,
              follow your people and more.
            </p>
            <div className="flex flex-col space-y-3">
              <button
                onClick={onLogin}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                Login
              </button>
              <button
                onClick={onRegister}
                className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      )}
      {currentUser && <CreatePost />}
      <div className="">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
