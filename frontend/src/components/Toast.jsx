export default function Toast({ type = "success", message }) {
  return (
    <div
      className={`fixed top-6 right-6 px-4 py-2 rounded-lg shadow-lg text-sm animate-fadeIn 
      ${
        type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
      }`}
    >
      {message}
    </div>
  );
}
