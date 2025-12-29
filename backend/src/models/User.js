import mongoose from "mongoose";

const { Schema, model } = mongoose;

// Schema for individual game statistics
const gameStatsSchema = new Schema({
  gameName: { type: String, required: true },
  gamesPlayed: { type: Number, default: 0 },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  draws: { type: Number, default: 0 },
  highestScore: { type: Number, default: 0 },
  totalScore: { type: Number, default: 0 },
  lastPlayed: { type: Date, default: null },
}, { _id: false });

// Schema for match history entry
const matchHistorySchema = new Schema({
  gameName: { type: String, required: true },
  opponent: { type: String, default: "Unknown" },
  opponentId: { type: Schema.Types.ObjectId, ref: "User" },
  result: { type: String, enum: ["win", "loss", "draw"], required: true },
  myScore: { type: Number, default: 0 },
  opponentScore: { type: Number, default: 0 },
  playedAt: { type: Date, default: Date.now },
}, { _id: true });

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

    // Game statistics per game
    gameStats: {
      type: [gameStatsSchema],
      default: [],
    },

    // Match history (last 50 games)
    matchHistory: {
      type: [matchHistorySchema],
      default: [],
    },

    // Overall stats
    totalGamesPlayed: { type: Number, default: 0 },
    totalWins: { type: Number, default: 0 },
    totalLosses: { type: Number, default: 0 },
    totalDraws: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastGamePlayed: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false }
);

const User = model("User", userSchema);

export default User;

