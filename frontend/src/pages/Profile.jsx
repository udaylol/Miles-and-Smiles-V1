import ProfilePictureUploader from "../components/ProfilePictureUploader";
import UsernameEditor from "../components/UsernameEditor";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-gray-200 py-12">
      <div className="max-w-4xl mx-auto p-6 space-y-10">

        <div className="flex items-center gap-8">
          <ProfilePictureUploader />
          <div className="flex flex-col">
            <UsernameEditor />
            <p className="text-gray-400 text-sm mt-2">
              User ID: {user?._id}
            </p>
          </div>
        </div>

        <hr className="border-gray-800" />

        <div>
          <h2 className="text-xl font-semibold mb-4">Basic Info</h2>
          <div className="bg-gray-900 p-5 rounded-xl border border-gray-800">
            <p className="text-gray-400 text-sm">Name</p>
            <p className="text-lg mt-1">{user?.username}</p>
          </div>
        </div>

      </div>
    </div>
  );
}
