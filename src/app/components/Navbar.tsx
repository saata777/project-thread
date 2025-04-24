
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useState, useRef, useEffect } from "react"; 
import CreatePostModal from "./CreatePostModal";

const AuthRequiredModal = ({
  isOpen,
  onClose,
  onLogin,
  onRegister,
}: {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  onRegister: () => void;
}) => {
  const modalRef = useRef<HTMLDivElement>(null); 

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div
        ref={modalRef} 
        className="bg-[#151515]  p-6 rounded-xl shadow-xl border "
      >
        <h2 className="text-[38px] font-bold text-white mb-4 text-center">
        Say more with Threads
        </h2>
        <p className="text-gray-300 mb-6 text-center">
        Join Threads to share thoughts, find out what&apos;s <br /> going on, follow your people and more.
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
  );
};

export default function VerticalNavbar() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  
  if (pathname === "/login") {
    return null;
  }
  if (pathname === "/register") {
    return null;
  }

  const handleAuthRequired = () => {
    setIsAuthModalOpen(true);
  };

  const handleNavigation = (path: string, authRequired: boolean = false) => {
    if (authRequired && !currentUser) {
      handleAuthRequired();
      return;
    }
    router.push(path);
  };

  const handleLogin = () => {
    setIsAuthModalOpen(false);
    router.push(`/login?redirect=${encodeURIComponent(pathname || "")}`);
  };

  const handleRegister = () => {
    setIsAuthModalOpen(false);
    router.push(`/register?redirect=${encodeURIComponent(pathname || "")}`);
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/home");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

 
  const navItems = [
    {
      name: "Home",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
      path: "/home",
      authRequired: false,
    },
    {
      name: "Search",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
      path: "/search",
      authRequired: false,
    },
    {
      name: "Create Post",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      ),
      path: "#",
      authRequired: true,
      action: () => {
        if (!currentUser) {
          handleAuthRequired();
        } else {
          setIsCreatePostOpen(true);
        }
      },
    },
    // {
    //   name: "Activities",
    //   icon: (
    //     <svg
    //       xmlns="http://www.w3.org/2000/svg"
    //       className="h-6 w-6"
    //       fill="none"
    //       viewBox="0 0 24 24"
    //       stroke="currentColor"
    //     >
    //       <path
    //         strokeLinecap="round"
    //         strokeLinejoin="round"
    //         strokeWidth={2}
    //         d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    //       />
    //     </svg>
    //   ),
    //   path: "/activities",
    //   authRequired: true,
    // },
    {
      name: "Profile",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      path: "/profile",
      authRequired: true,
    },
  ];

  return (
    <>
      <nav className="fixed left-0 w-[100%] justify-center flex top-0 md:h-full md:w-20  bg-black text-white flex-row md:flex-col items-center  z-40">
   

        <div className="flex flex-row  md:flex-col mt-0 md:mt-[90px] md:items-center items-start md:space-x-0 space-y-0 md:space-y-8 ">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() =>
                item.action
                  ? item.action()
                  : handleNavigation(item.path, item.authRequired)
              }
              className={`p-3 ml-[30px] md:ml-0 rounded-[5px]  ${
                pathname === item.path
                  ? " bg-gray-900"
                  : "hover:bg-gray-700 "
              }`}
              title={item.name}
            >
              {item.icon}
            </button>
          ))}
        </div>

        {currentUser ? (
          <button
            onClick={handleLogout}
            className="md:mt-auto md:ml-0 ml-[30px] mt-0 p-3 rounded-full hover:bg-gray-700 text-gray-300"
            title="Logout"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        ) : (
          <button
            onClick={handleLogin}
            className="md:mt-auto md:ml-0 ml-[30px] mt-0 p-3 rounded-full hover:bg-gray-700 text-gray-300"
            title="Login"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
              />
            </svg>
          </button>
        )}
      </nav>

      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
      />
    </>
  );
}
