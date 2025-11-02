import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
console.log("JWT_SECRET inside controller:", process.env.JWT_SECRET);
    
export async function signup(req, res) {
	try {
		const { username, password } = req.body || {};
		if (!username || !password) {
			return res.status(400).json({ message: "Username and password required." });
		}

		const existing = await User.findOne({ username }).exec();
		if (existing) {
			return res.status(409).json({ message: "Username already exists." });
		}

		const hashed = await bcrypt.hash(password, 10);
		const user = new User({ username, password: hashed });
		await user.save();

		const safeUser = { id: user._id, username: user.username, createdAt: user.createdAt };
		return res.status(201).json({ message: "User created", user: safeUser });
	} catch (err) {
		console.error("signup error:", err);
		return res.status(500).json({ message: "Internal server error" });
	}
}

export async function login(req, res) {
	try {
		const { username, password } = req.body || {};
		if (!username || !password) {
			return res.status(400).json({ message: "Username and password required." });
		}

		const user = await User.findOne({ username }).exec();
		if (!user) {
			return res.status(401).json({ message: "Invalid credentials." });
		}

		const valid = await bcrypt.compare(password, user.password);
		if (!valid) {
			return res.status(401).json({ message: "Invalid credentials." });
		}

		const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, {
			expiresIn: "7d",
		});

		const safeUser = { id: user._id, username: user.username };
		return res.status(200).json({ message: "Login successful", token, user: safeUser });
	} catch (err) {
		console.error("login error:", err);
		return res.status(500).json({ message: "Internal server error" });
	}
}

