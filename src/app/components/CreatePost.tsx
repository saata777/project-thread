import React, { useState } from "react";
import PostModal from "./CreatePostModal";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Image from "next/image"; 

export const CreatePost = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const { currentUser } = useAuth();

  const handleClick = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="flex border-b-[2px] border-[#272727] items-center p-6">
      <Image
        src={currentUser?.photoURL || "/default-avatar.png"}
        alt="User Profile"
        width={40}
        height={40}
        className="rounded-full bg-white mr-4 object-cover cursor-pointer"
        onClick={() => router.push("/profile")}
        onError={(e) => {
          (e.target as HTMLImageElement).src = "/default-avatar.png"; 
        }}
      />
      <h1 
        className="w-[75%] cursor-pointer text-gray-300" 
        onClick={() => setIsModalOpen(true)}
      >
        What&apos;s new?
      </h1>
      <button
        onClick={handleClick}
        className="bg-[#272727] text-white rounded-[10px] h-[40px] w-[70px]  border-[0.2px] p-2 cursor-pointer hover:bg-[#333333] transition-colors"
      >
        Post
      </button>
      {isModalOpen && (
        <PostModal isOpen={true} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};