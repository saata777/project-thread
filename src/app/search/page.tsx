"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  QuerySnapshot,
  DocumentData,
} from "firebase/firestore";
import { db } from ".././firebase";
import Link from "next/link";

interface User {
  id: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
}

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      let q;
      if (!searchTerm.trim()) {
        q = query(collection(db, "users"));
      } else {
        q = query(
          collection(db, "users"),
          where("displayName", ">=", searchTerm),
          where("displayName", "<=", searchTerm + "\uf8ff")
        );
      }

      const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);
      setUsers(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as User))
      );
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [searchTerm]);

  return (
    <div className="max-w-2xl flex  items-center   flex-col mx-auto ">
      <h1 className="text-2xl  font-bold mb-2">Search</h1>
      <div className="rounded-t-[30px] border-[2px] border-[#3a3a3a] max-w-2xl w-full flex  flex-col text-white bg-[#252525] h-[85.7vh] overflow-hidden pb-[50px] mx-auto py-8">
        <div className="flex w-[95%] self-center mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyUp={handleSearch}
            className="flex-grow p-3 border pl-[50px] bg-black rounded-[20px] border-none "
            placeholder="Search"
          />
        </div>

        {loading ? (
          <p></p>
        ) : (
          <div className="space-y-3   w-full flex flex-col items-start">
            {users.map((user) => (
              <Link
                key={user.id}
                href={`/userprofile?userId=${user.id}`}
                className="block   p-4  "
              >
                <div className="flex flex-col mt-8 items-center">
                  <div className="flex flex-row">
                    <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden mr-3">
                      {user.photoURL && (
                        <img
                          src={user.photoURL}
                          alt={user.displayName}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium">{user.displayName}</h3>
                      <p className="text-sm text-gray-500">{user.bio}</p>
                    </div>
                  </div>
                  <div className="w-[39%]  right-[512px] absolute mt-20 items-end bg-[#3a3a3a] h-[1.3px] "></div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
