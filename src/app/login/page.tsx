"use client";

import { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";



const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, ] = useState(false);
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
    <div className=" flex flex-col p-8  justify-center items-center w-[100%]  md:w-[100%] h-[100vh] bg-[#0a0a0a]">
 
      <form
        onSubmit={handleSubmit}
        className="md:max-w-[390px] w-[100%] flex self-center justify-center items-center text-white rounded-lg shadow-lg"
      >
        <div className="flex flex-col w-[100%]">
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
            className={`w-full mr-2 py-3 rounded-[14px] h-[58px] ${
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
            <h1> - or -</h1>
            <br />
            <Link href="/register" className="">
              Create a new account
            </Link>

            
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
