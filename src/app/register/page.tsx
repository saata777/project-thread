"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth, UserCredential } from "firebase/auth";


interface AuthContextType {
  user: {
    uid: string;
    email?: string;
    displayName?: string;
    photoURL?: string;
  } | null;
  register: (
    email: string,
    password: string,
    displayName: string
  ) => Promise<UserCredential>;
 
}

interface FormData {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const auth = getAuth();

export default function RegisterPage() {
  const { register } = useAuth() as unknown as AuthContextType;
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("min 6 ");
      return;
    }

    setLoading(true);

    try {
      
      console.log("Registering user with email:", formData.email);
      const userCredential = await register(
        formData.email,
        formData.password,
        formData.displayName
      );

      console.log("User registered successfully", userCredential);

   
      const userDocRef = doc(db, "users", userCredential.user.uid);
      await setDoc(userDocRef, {
        displayName: formData.displayName,
        email: formData.email,
        createdAt: serverTimestamp(),
      });

     
      router.push("/home");
    } catch (error: any) {
      console.error("Registration error:", error);

      switch (error.code) {
        case "auth/email-already-in-use":
          setError("email-already-in-use");
          break;
        case "auth/invalid-email":
          setError("invalid-email");
          break;
        case "auth/weak-password":
          setError("weak-password");
          break;
        default:
          setError("registration error: " + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen absolute top-[-20px] left-[40%] flex items-center mt-0 text-white justify-center ">
      <div className="max-w-md w-full space-y-8 p-8 rounded-lg shadow">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-thin text-white">
            Create a new account
          </h2>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label
                htmlFor="displayName"
                className="block text-sm font-medium text-gray-700"
              ></label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                autoComplete="name"
                required
                value={formData.displayName}
                onChange={handleChange}
                className="block w-full rounded-[14px] h-[58px] z-3 p-3 mb-4 bg-[#1b1b1b] "
                placeholder="name"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              ></label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="block w-full rounded-[14px] h-[58px] z-3 p-3 mb-4 bg-[#1b1b1b] "
                placeholder="email"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              ></label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="block w-full rounded-[14px] h-[58px] z-3 p-3 mb-4 bg-[#1b1b1b] "
                placeholder="password ( min-6 ) "
              />
            </div>

            <div className="relative">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              ></label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={` block w-full border focus:outline-none  rounded-[14px] h-[58px] z-3 p-3 mb-4 bg-[#1b1b1b]  ${
                  formData.confirmPassword &&
                  formData.confirmPassword !== formData.password
                    ? "border-red-500"
                    : "border-green-600"
                }`}
                placeholder="confirmPassword"
              />
              {formData.confirmPassword &&
                formData.confirmPassword !== formData.password && (
                  <div className="absolute text-[red] inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    !
                  </div>
                )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938ლ3-2.647z"
                    ></path>
                  </svg>
                  loading...
                </>
              ) : (
                "registration"
              )}
            </button>
          </div>
        </form>

        <div className="text-center text-sm">
          <span className="text-gray-600">already have an account: </span>
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
