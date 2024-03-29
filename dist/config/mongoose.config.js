import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
const db = await mongoose.connect(process.env.DB_URI);
export default db;
