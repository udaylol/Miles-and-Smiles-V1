import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

const gameSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    image: { type: String, required: true },
  },
  { versionKey: false }
);

const Game = mongoose.model("Game", gameSchema, "games");

const games = [
  { title: "Tic Tac Toe", image: "/TicTacToe.jpg" },
  { title: "Memory", image: "/Memory.jpg" },
  { title: "Snakes and Ladders", image: "/SnakesLadders.jpg" },
  { title: "Dots and Boxes", image: "/DotsBoxes.jpg" },
];

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("✅ Connected to miles_and_smiles database");

    await Game.deleteMany({});
    await Game.insertMany(games);

    console.log("🎮 Games inserted successfully into 'games' collection!");
    mongoose.connection.close();
  })
  .catch((err) => {
    console.error("❌ Error inserting data:", err);
  });
