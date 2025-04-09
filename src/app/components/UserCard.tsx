import Link from 'next/link'

export default function UserCard({ user }: { user: any }) {
  return (
    <Link href={`/profile/${user.username}`}>
      <div className="bg-white p-4 rounded-lg shadow mb-4 hover:bg-gray-50 transition cursor-pointer">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
          <div>
            <h3 className="font-medium">{user.username}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      </div>
    </Link>
  )
}