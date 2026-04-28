import mongoose from "mongoose";

export interface User {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    bio?: string,
    password: string,
    createdAt: Date,
    isVerified: boolean,
    isActive: boolean
}

export type CreateUser = Omit<User, "id">