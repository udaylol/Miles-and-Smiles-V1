import { useState } from "react";
import axiosClient from "../axiosClient";
import { useAuth } from "../context/AuthContext.jsx";

function ProfilePictureUploader() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const { token, updateUser } = useAuth();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file first!");

    const formData = new FormData();
    formData.append("image", file);

  try {
    setLoading(true);
    const res = await axiosClient.post("/api/user/profile-picture", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const newUrl = res.data.pfp_url;

    if (newUrl) {
      setUploadedUrl(newUrl);

  updateUser({ pfp_url: newUrl });

      alert("✅ Profile picture uploaded successfully!");
    } else {
      alert("⚠️ Upload succeeded but no image URL returned from server.");
    }

  } catch (err) {
    console.error(err);
    alert("❌ Upload failed");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 text-gray-100">
      <div className="w-full max-w-sm rounded-2xl bg-gray-900 p-8 shadow-xl border border-gray-800 text-center">
        <h2 className="text-2xl font-semibold mb-6">Upload Profile Picture</h2>

        <label
          htmlFor="fileInput"
          className="cursor-pointer inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
        >
          Choose Image
        </label>
        <input
          id="fileInput"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Preview */}
        {preview && (
          <div className="mt-6 flex flex-col items-center">
            <img
              src={preview}
              alt="Preview"
              className="w-28 h-28 rounded-full border-4 border-blue-600 shadow-md object-cover"
            />
            <p className="text-sm text-gray-400 mt-2">Preview</p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={loading}
          className={`mt-6 w-full py-2.5 rounded-lg font-semibold transition 
          ${
            loading
              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>

        {uploadedUrl && (
          <div className="mt-8">
            <p className="text-sm text-gray-400 mb-3">Uploaded Image</p>
            <div className="flex flex-col items-center">
              <img
                src={uploadedUrl}
                alt="Uploaded"
                className="w-28 h-28 rounded-full border-4 border-green-600 object-cover shadow-lg"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePictureUploader;
