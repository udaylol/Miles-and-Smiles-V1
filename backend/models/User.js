import mongoose from "mongoose";

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    pfp_url: { type: String, default: "/guestpfp.png" },

    gender: {
      type: String,
      enum: ["male", "female", "other", null],
      default: null,
    },
    birthday: { type: Date, default: null },

    friends: [{ type: Schema.Types.ObjectId, ref: "User" }],

    incomingRequests: [{ type: Schema.Types.ObjectId, ref: "User" }],
    outgoingRequests: [{ type: Schema.Types.ObjectId, ref: "User" }],

    favouriteGames: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true, versionKey: false }
);

const User = model("User", userSchema);

export default User;
