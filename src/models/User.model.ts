import mongoose, { Schema, Document } from "mongoose";
import { CreateUser } from "../types/user/user.types";

// Define the schema
const UserSchema: Schema = new Schema<CreateUser>({
  email: {
    type: String,
    required: true,
    unique: true, // ensures no duplicate emails
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  bio: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now, // automatically sets current date
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

// Create the model
const User = mongoose.model<CreateUser>("user", UserSchema);

export default User;