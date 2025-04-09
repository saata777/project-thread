"use client";

import { useAuth } from "../context/AuthContext";
import { useState, useRef, useEffect } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
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

      const docRef = await addDoc(collection(db, "posts"), postData);

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
          <button>
              <svg
                aria-label="Drafts"
                role="img"
                viewBox="0 0 24 24"
                className="h-6 w-6 mr-1 fill-white text-gray-800"
              >
                <title>Drafts</title>
                <rect
                  height="15"
                  rx="4.5"
                  stroke="currentColor"
                  stroke-width="2"
                  width="15"
                  x="7"
                  y="7"
                ></rect>
                <path
                  clip-rule="evenodd"
                  d="M15.3833 4.50007C15.0018 4.15977 14.5475 3.9045 14.05 3.75672C13.7983 3.68195 13.432 3.6357 12.7078 3.68313C11.9633 3.73189 11.0102 3.86454 9.59538 4.06338C8.18054 4.26222 7.22784 4.39741 6.4987 4.55577C5.78946 4.7098 5.45011 4.85522 5.22879 4.99646C4.51904 5.44941 3.99637 6.14302 3.7566 6.95012C3.68183 7.2018 3.63558 7.56809 3.68301 8.29232C3.73177 9.03686 3.86442 9.98992 4.06326 11.4047C4.23845 12.6513 4.36423 13.5391 4.49997 14.2313V17.5001C4.49997 17.737 4.51175 17.9713 4.53475 18.2022C4.05772 17.8249 3.64282 17.3681 3.31041 16.8473C2.66675 15.8387 2.47208 14.4535 2.08272 11.6831C1.69337 8.91269 1.49869 7.52748 1.83941 6.38057C2.21619 5.11227 3.03754 4.02231 4.15285 3.31053C5.16142 2.66688 6.54662 2.4722 9.31703 2.08284C12.0874 1.69349 13.4726 1.49881 14.6196 1.83953C15.8878 2.21631 16.9778 3.03766 17.6896 4.15297C17.7623 4.26696 17.8294 4.38577 17.8916 4.51084C17.7619 4.50369 17.6314 4.50007 17.5 4.50007H15.3833Z"
                  fill-rule="evenodd"
                ></path>
                <rect height="2" rx="1" width="9" x="10" y="12"></rect>
                <rect height="2" rx="1" width="6" x="10" y="15"></rect>
              </svg>
            </button>
            <button>
              <svg
                aria-label="More"
                role="img"
                viewBox="0 0 24 24"
                className="h-6 w-6 fill-white text-gray-800"
              >
                <title>More</title>
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="white"
                  stroke-width="1.5"
                ></circle>
                <path d="M7.5 13.5C6.67157 13.5 6 12.8284 6 12C6 11.1716 6.67157 10.5 7.5 10.5C8.32843 10.5 9 11.1716 9 12C9 12.8284 8.32843 13.5 7.5 13.5Z"></path>
                <path d="M12 13.5C11.1716 13.5 10.5 12.8284 10.5 12C10.5 11.1716 11.1716 10.5 12 10.5C12.8284 10.5 13.5 11.1716 13.5 12C13.5 12.8284 12.8284 13.5 12 13.5Z"></path>
                <path d="M16.5 13.5C15.6716 13.5 15 12.8284 15 12C15 11.1716 15.6716 10.5 16.5 10.5C17.3284 10.5 18 11.1716 18 12C18 12.8284 17.3284 13.5 16.5 13.5Z"></path>
              </svg>
            </button>
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
              <h1> {currentUser?.displayName || "User"}</h1>
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
                <svg
                  className="w-5 h-5 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>

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