import React from "react";

export default function GameCard({ image, title }) {
  return (
    <div className="w-64 bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer">
      <img
        src={image}
        alt={title}
        className="h-40 w-full object-cover"
      />
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      </div>
    </div>
  );
};
