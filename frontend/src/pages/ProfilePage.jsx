import ProfilePictureEditor from "../components/ProfilePictureEditor.jsx";
import EditableField from "../components/EditableField.jsx";
import { useAuth } from "../context/AuthContext";
import axiosClient from "../axiosClient";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const updateField = async (field, value) => {
    const res = await axiosClient.put("/api/user/updateField", {
      [field]: value,
    });

    updateUser(res.data.user);
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-gray-200 py-12">
      <div className="max-w-4xl mx-auto p-6 space-y-10">
        <div className="flex items-center gap-8">
          <ProfilePictureEditor />

          <div>
            <h1 className="text-3xl font-semibold">{user?.username}</h1>
          </div>
        </div>

        <hr className="border-gray-800" />

        <div>
          <h2 className="text-xl font-semibold mb-4">Basic Info</h2>

          <div className="bg-[#0F172A] p-6 rounded-xl border border-gray-800">
            <EditableField
              label="Name"
              value={user?.username}
              onSave={(name) => updateField("username", name)}
            />
            <EditableField
              label="Birthday"
              value={user?.birthday?.slice(0, 10)}
              onSave={(date) => updateField("birthday", date)}
              type="date"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
