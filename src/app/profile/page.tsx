"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";

import {
  doc,
  updateDoc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import PostCard from "../components/PostCard";
import { CreatePost } from "../components/CreatePost";
import Image from "next/image";

interface Post {
  id: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL: string;
  content: string;
  [key: string]: any;
}

// შეცვალეთ `any` კონკრეტული ტიპებით:
interface Profile {
  id: string;
  name: string;
}

const ProfilePage = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    bio: "",
    photoURL: "",
    link: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  const profile: Profile = { id: "1", name: "John Doe" };

  // შეცვალეთ `let` `const`-ით:
  const photoURL = "/path/to/photo";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setIsEditing(false);
      }
    };

    if (isEditing) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditing]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setFormData({
            displayName: currentUser.displayName || "",
            bio: userData.bio || "",
            photoURL: currentUser.photoURL || "",
            link: userData.link || "",
          });
        }
      }
    };

    fetchUserData();
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      const q = query(
        collection(db, "posts"),
        where("userId", "==", currentUser.uid),
        orderBy("createdAt", "desc")
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setPosts(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Post))
        );
      });
      return unsubscribe;
    }
  }, [currentUser]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setFormData({
            ...formData,
            photoURL: event.target.result as string,
          });
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setLoading(true);
    try {
      let photoURL = formData.photoURL;

      if (file) {
        // Handle file upload logic here
      }

      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        displayName: formData.displayName,
        bio: formData.bio,
        photoURL,
        link: formData.link,
      });

      await updateUserProfile({
        displayName: formData.displayName,
        photoURL,
        bio: formData.bio,
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return <div className="text-center py-8">გთხოვთ შეხვიდეთ სისტემაში</div>;
  }

  return (
    <div className="max-w-[600px] rounded-t-[30px]  h-[91vh] bg-[#1d1d1d] mx-auto  ">
      <div className=" rounded-lg p-6 mb-8">
        <div className="flex flex-row-reverse items-start space-x-6">
          <div className="flex flex-col items-center">
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200">
              <Image
                src={formData.photoURL || "/default-profile.png"}
                alt="Profile"
                className="w-full h-full bg-white object-cover"
                width={80}
                height={80}
              />
            </div>
            <div className="flex gap-4 flex-row mt-5 ml-7 ">
              <button>
                <svg
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  fill="currentColor"
                >
                  <path d="M12 2.982c2.937 0 3.285.011 4.445.064a6.087 6.087 0 0 1 2.042.379 3.408 3.408 0 0 1 1.265.823 3.408 3.408 0 0 1 .823 1.265 6.087 6.087 0 0 1 .379 2.042c.053 1.16.064 1.508.064 4.445s-.011 3.285-.064 4.445a6.087 6.087 0 0 1-.379 2.042 3.643 3.643 0 0 1-2.088 2.088 6.087 6.087 0 0 1-2.042.379c-1.16.053-1.508.064-4.445.064s-3.285-.011-4.445-.064a6.087 6.087 0 0 1-2.043-.379 3.408 3.408 0 0 1-1.264-.823 3.408 3.408 0 0 1-.823-1.265 6.087 6.087 0 0 1-.379-2.042c-.053-1.16-.064-1.508-.064-4.445s.011-3.285.064-4.445a6.087 6.087 0 0 1 .379-2.042 3.408 3.408 0 0 1 .823-1.265 3.408 3.408 0 0 1 1.265-.823 6.087 6.087 0 0 1 2.042-.379c1.16-.053 1.508-.064 4.445-.064M12 1c-2.987 0-3.362.013-4.535.066a8.074 8.074 0 0 0-2.67.511 5.392 5.392 0 0 0-1.949 1.27 5.392 5.392 0 0 0-1.269 1.948 8.074 8.074 0 0 0-.51 2.67C1.012 8.638 1 9.013 1 12s.013 3.362.066 4.535a8.074 8.074 0 0 0 .511 2.67 5.392 5.392 0 0 0 1.27 1.949 5.392 5.392 0 0 0 1.948 1.269 8.074 8.074 0 0 0 2.67.51C8.638 22.988 9.013 23 12 23s3.362-.013 4.535-.066a8.074 8.074 0 0 0 2.67-.511 5.625 5.625 0 0 0 3.218-3.218 8.074 8.074 0 0 0 .51-2.67C22.988 15.362 23 14.987 23 12s-.013-3.362-.066-4.535a8.074 8.074 0 0 0-.511-2.67 5.392 5.392 0 0 0-1.27-1.949 5.392 5.392 0 0 0-1.948-1.269 8.074 8.074 0 0 0-2.67-.51C15.362 1.012 14.987 1 12 1Zm0 5.351A5.649 5.649 0 1 0 17.649 12 5.649 5.649 0 0 0 12 6.351Zm0 9.316A3.667 3.667 0 1 1 15.667 12 3.667 3.667 0 0 1 12 15.667Zm5.872-10.859a1.32 1.32 0 1 0 1.32 1.32 1.32 1.32 0 0 0-1.32-1.32Z"></path>
                </svg>
              </button>
              <button>
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  fill="white"
                >
                  <rect
                    fill="none"
                    height="20"
                    rx="5"
                    stroke="currentColor"
                    stroke-width="2"
                    width="20"
                    x="2"
                    y="2"
                  ></rect>
                  <rect height="12" rx="1" width="2" x="11" y="6"></rect>
                  <rect height="9" rx="1" width="2" x="15" y="9"></rect>
                  <rect height="5" rx="1" width="2" x="7" y="13"></rect>
                </svg>
              </button>
            </div>
          </div>
          <div className="flex-1  ">
            <h1 className="text-2xl ml-[-20px] font-bold">
              {formData.displayName}
            </h1>
            <p className="text-white ml-[-20px]">{currentUser.email}</p>
            {formData.bio && (
              <p className="mt-8 mb-6 ml-[-20px] text-white">{formData.bio}</p>
            )}
            {formData.link && (
              <a
                href={formData.link}
                target="_blank"
                rel="noopener noreferrer"
                className=" ml-[-20px]  hover:underline"
              >
                {formData.link}
              </a>
            )}

            <button
              onClick={() => setIsEditing(true)}
              className="mt-[100px] ml-[-20px] bg-[#1d1d1d] border w-[127%] text-white px-4 py-1 rounded-lg transition"
            >
              Edit profile
            </button>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <CreatePost />
      </div>

      {isEditing && (
        <div className="fixed  inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            ref={modalRef}
            className="bg-[#1c1c1c] rounded-lg shadow-xl p-6 w-full max-w-[580px]"
          >
            <form onSubmit={handleSubmit}>
              <div className="flex flex-row-reverse items-center ">
                <label className="relative  w-12 cursor-pointer h-12 rounded-full mb-[35px]  overflow-hidden border-2 border-gray-200 ">
                  <Image
                    src={formData.photoURL || ""}
                    alt="Profile"
                    className="object-cover w-full  h-full"
                    width={48}
                    height={48}
                  />

                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />
                </label>
                <div className=" mb-3">
                  <label className="block  text-white ">Name</label>
                  <input
                    type="text"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleChange}
                    className="w-[481px]  border-b h-[35px]  focus:outline-none bg-[#1c1c1c]"
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-white  ">bio</label>
                <input
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full  border-b h-[35px]  focus:outline-none bg-[#1c1c1c]  "
                  placeholder="+ write bio"
                />
              </div>
              <div className="mb-3">
                <label className="block text-white  ">link</label>
                <input
                  name="link"
                  value={formData.link}
                  onChange={handleChange}
                  className="w-full  border-b h-[35px]  focus:outline-none bg-[#1c1c1c]  "
                  placeholder="+ Add link"
                />
              </div>
              <div className="flex border-b  justify-between mb-8 flex-row">
                <div className="flex   flex-col">
                  <span className=" text-sm text-[20px] font-medium  text-white">
                    Show Instagram badge
                  </span>
                  <span className="text-[12px] h-[45px] text-[#636363] mt-3">
                    When turned off, the Threads badge on your Instagram profile
                    will also disappear.
                  </span>
                </div>
                <label className=" cursor-pointer">
                  <input type="checkbox" value="" className="sr-only peer" />
                  <div className="relative w-11 h-6 bg-black peer-focus:outline-none   dark:peer-focus:ring-black rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full  after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-black   after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600  dark:peer-checked:bg-white"></div>
                </label>
              </div>
              <div className="flex border-b  justify-between mb-8 flex-row">
                <div className="flex   flex-col">
                  <span className=" text-sm text-[20px] font-medium  text-white">
                    Private profile
                  </span>
                  <span className="text-[12px] h-[45px] text-[#636363] mt-3">
                    f you switch to private, you won't be able to reply to
                    others unless they follow you.
                  </span>
                </div>
                <label className=" cursor-pointer">
                  <input type="checkbox" value="" className="sr-only peer" />
                  <div className="relative w-11 h-6 bg-black peer-focus:outline-none   dark:peer-focus:ring-black rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full  after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-black   after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600  dark:peer-checked:bg-white"></div>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black px-4 py-2 rounded-lg  transition"
              >
                {loading ? "Done" : "Done"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* მომხმარებლის პოსტები */}
      <div className="bg-[#1d1d1d] rounded-lg  p-6">
        <div className="space-y-4">
          {posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <p className="text-gray-500 text-center"></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
