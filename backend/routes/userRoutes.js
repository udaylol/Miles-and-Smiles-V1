import { Router } from "express";
import { getFavorites, toggleFavorite } from "../controllers/userController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import { 
  uploadProfilePicture, 
  sendFriendRequest, 
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  removeFriend,
  getMe 
} from "../controllers/userController.js";


const router = Router();

router.get("/favorites", verifyToken, getFavorites);
router.post("/favorites", verifyToken, toggleFavorite);
router.post("/profile-picture", verifyToken, upload.single("image"), uploadProfilePicture);
router.post("/friends", verifyToken, sendFriendRequest);
router.post("/friends/accept", verifyToken, acceptFriendRequest);
router.post("/friends/reject", verifyToken, rejectFriendRequest);
router.post("/friends/cancel", verifyToken, cancelFriendRequest);
router.post("/friends/remove", verifyToken, removeFriend);
router.get("/me", verifyToken, getMe);

export default router;
