import Link from "next/link";

interface User {
  id: string;
  name: string;
  avatar: string;
}

export default function UserCard({ user }: { user: User }) {
  return (
    <Link href={`/profile/${user.id}`}>
      <div className="bg-white p-4 rounded-lg shadow mb-4 hover:bg-gray-50 transition cursor-pointer">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-300 rounded-full mr-3">
            <img
              src={user.avatar}
              alt={`${user.name}'s avatar`}
              className="w-full h-full rounded-full"
            />
          </div>
          <div>
            <h3 className="font-medium">{user.name}</h3>
          </div>
        </div>
      </div>
    </Link>
  );
}
