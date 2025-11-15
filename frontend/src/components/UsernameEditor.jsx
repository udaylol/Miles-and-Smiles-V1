import { useState } from "react";
import axiosClient from "../axiosClient";
import { useAuth } from "../context/AuthContext";

export default function UsernameEditor() {
  const { user, updateUser } = useAuth();

  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(user?.username || "");
  const [loading, setLoading] = useState(false);

  const save = async () => {
    if (!newName.trim()) return alert("Username required");

    try {
      setLoading(true);
      const res = await axiosClient.put("/api/user/username", {
        username: newName.trim(),
      });

      updateUser({ username: newName.trim() });
      setEditing(false);

    } catch (err) {
      alert(err.response?.data?.message || "Error updating username");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6">
      {!editing ? (
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">{user?.username}</h1>
          <button
            onClick={() => setEditing(true)}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            Edit
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="bg-gray-900 border border-gray-700 px-3 py-1 rounded-md"
          />

          <button
            onClick={save}
            className="bg-green-600 px-3 py-1 rounded-md hover:bg-green-700"
          >
            Save
          </button>

          <button
            onClick={() => setEditing(false)}
            className="bg-gray-700 px-3 py-1 rounded-md hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
