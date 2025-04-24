"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import PostCard from "../components/PostCard";
import { CreatePost } from "../components/CreatePost";


interface Post {
  id: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL?: string;
  content: string;
  imageUrl?: string;
  likes?: string[];
}

const HomePage = () => {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const router = useRouter();

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(
        snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            userId: data.userId,
            userDisplayName: data.userDisplayName,
            userPhotoURL: data.userPhotoURL,
            content: data.content,
            imageUrl: data.imageUrl,
            likes: data.likes || [],
          };
        })
      );
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
    <div className="md:max-w-2xl max-w-[430px] md:mt-20 md:ml-[340px]   md:rounded-t-[30px] border-[#272727] border-b-0 border-[2px] bg-[#1a1a1a] text-black ">
      <h1 className="absolute top-4  left-[200px] md:left-[650px] text-white">Home</h1>
      {!currentUser && (
        <div className="inset-0 fixed ml-[1000px] mb-[300px] hidden items-center md:flex  justify-center">
          <div className="bg-[#151515] p-6 rounded-xl shadow-xl border">
            <h2 className="text-[38px] font-bold text-white mb-4 text-center">
              Say more with Threads
            </h2>
            <p className="text-gray-300 mb-6 text-center">
              Join Threads to share thoughts, find out what&#39;s <br /> going
              on, follow your people and more.
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
      <div className="w-full">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
