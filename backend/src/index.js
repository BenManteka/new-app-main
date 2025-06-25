import express from 'express';
import authRoutes from './routes/auth.route.js';
import { connectDB } from './lib/db.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import messageRoutes from './routes/message.route.js';
import postRoutes from './routes/post.route.js'; // ✅ נוספה תמיכה בפוסטים
import groupRoutes from './routes/group.route.js';
import cors from 'cors';
import { app, server } from './lib/socket.js';

dotenv.config();
const PORT = process.env.PORT;

// ✅ סדר התקני
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ✅ רישום הנתיבים
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/posts", postRoutes); // ✅ הנתיב החדש לפוסטים
app.use("/api/groups", groupRoutes);// ✅ הנתיב החדש לקבוצות

// ✅ הרצת השרת
server.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
  connectDB();
});