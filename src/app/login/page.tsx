"use client";

import { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Image1 from "../components/image1.png";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError(null); 
      router.push("/home");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  return (
    <div>
      <Image
        src={Image1}
        alt="Login Image"
        className=""
        layout="fill"
        objectFit="cover"
      />
      <form
        onSubmit={handleSubmit}
        className="max-w-[390px] mx-auto ml-[550px] mt-[200px] text-white rounded-lg shadow-lg"
      >
        <div className="relative">
          <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

         
          {error && (
            <div className=" text-[red] text-sm px-4 py-2 rounded mb-4 text-center">
              auth/invalid-credential
            </div>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full rounded-[14px] h-[58px] z-3 p-3 mb-4 bg-[#1b1b1b]"
          />

          <div className="relative flex flex-row items-center">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-[14px] h-[58px] z-3 p-3 mb-4 bg-[#1b1b1b]"
            />
          </div>

          <button
            type="submit"
            className={`w-full py-3 rounded-[14px] h-[58px] ${
              email && password
                ? "bg-[#fff] text-black"
                : "bg-[#fff] text-gray-200 cursor-not-allowed"
            }`}
            disabled={!email || !password}
          >
            Log in
          </button>

          <div className="mt-4 font-thin text-sm flex flex-col text-gray-400 text-center">
            <Link href="/forgot-password" className="text-gray-400">
              Forgotten password?
            </Link>
            <br />
            <h1> ---- or ----</h1>
            <br />
            <Link href="/register" className="">
              Create a new account
            </Link>

            <div className="flex font-sans w-[800px] text-gray-200 text-xs gap-[15px] h-[15px] flex-row mt-[90px]">
              <p>© 2025</p>
              <p className="hover:underline cursor-pointer">Threads Terms</p>
              <p className="hover:underline cursor-pointer">Privacy Policy</p>
              <p className="hover:underline cursor-pointer">Cookies Policy</p>
              <p className="hover:underline cursor-pointer">Report a Problem</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
