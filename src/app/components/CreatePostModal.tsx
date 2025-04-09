"use client";

import { useAuth } from "../context/AuthContext";
import { useState, useRef, useEffect } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase"; // <--- მნიშვნელოვანია!
import { useRouter } from "next/navigation";
import Image from "next/image";

const uploadImageToImgBB = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("key", "470b365116bb9f9d9ddae69bbbc5430b");

  try {
    const response = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Image upload failed");
    }

    const data = await response.json();
    return data.data.url;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};

export default function CreatePostModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen, onClose]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;

    const file = e.target.files[0];

    if (!file.type.startsWith("image/")) {
      setError("Please upload only image files");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB");
      return;
    }

    setImage(file);
    setError(null);

    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError("Please write something in your post");
      return;
    }

    if (!currentUser) {
      setError("You need to be logged in to post");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let imageUrl = null;
      if (image) {
        imageUrl = await uploadImageToImgBB(image);
      }

      const postData = {
        content,
        userId: currentUser.uid,
        userDisplayName: currentUser.displayName,
        userPhotoURL: currentUser.photoURL,
        imageUrl,
        likes: [],
        comments: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      
      await addDoc(collection(db, "posts"), postData);

      
      setContent("");
      setImage(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      onClose();
      router.refresh();
    } catch (err) {
      console.error("Failed to create post:", err);
      setError("Failed to create post. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-[#252525] rounded-lg max-w-[520px] w-full shadow-xl"
      >
        <div className="flex flex-row-reverse justify-between items-center p-4 border-b border-[#3c3c3c]">
          <div>
          
            ...
          </div>
          <h3 className="text-xl text-white font-bold">New thread</h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-2xl text-white cursor-pointer"
          >
            close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-900/50 text-red-300 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex text-white gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden flex-shrink-0">
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || "User"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-lg">
                  {currentUser?.displayName?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
            </div>
            <div className="flex-1 flex flex-col">
              <h1>{currentUser?.displayName || "User"}</h1>
              <input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's New?"
                className="flex-1 bg-[#252525] rounded-lg focus:outline-none"
                disabled={isLoading}
              />
              <label
                htmlFor="post-image"
                className={`inline-flex w-[30px] items-center py-2 rounded-lg cursor-pointer ${
                  isLoading ? "opacity-50" : ""
                }`}
              >
               
               📷
                <input
                  type="file"
                  id="post-image"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                  disabled={isLoading}
                />
              </label>
            </div>
          </div>

          {previewUrl && (
            <div className="relative mb-4 rounded-lg overflow-hidden">
              <Image
                src={previewUrl}
                alt="Preview"
                width={800}
                height={600}
                className="w-full max-h-80 object-contain"
              />
              <button
                type="button"
                onClick={() => {
                  setImage(null);
                  setPreviewUrl(null);
                }}
                className="absolute top-2 right-2 rounded-full p-1"
                disabled={isLoading}
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-[#252525]">
            <p className="text-white">Anyone can reply and quote</p>
            <button
              type="submit"
              disabled={isLoading || !content.trim()}
              className={`px-6 py-2 rounded-lg font-medium ${
                isLoading || !content.trim()
                  ? "bg-[#252525] cursor-not-allowed border text-gray-400"
                  : "bg-[#252525] border text-white"
              }`}
            >
              {isLoading ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
