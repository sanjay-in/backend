import mongoose, { Schema, Document } from "mongoose";
import { EmailVerificationTokens, CreateEmailVerification } from "../types/email/email.types";

// Define the schema
const EmailTokenSchema: Schema = new Schema<EmailVerificationTokens>({
  email: {
    type: String,
    required: true,
    unique: true, // ensures no duplicate emails
    lowercase: true,
    trim: true,
  },
  token: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, // automatically sets current date
  },
  expiresAt: {
    type: Date,
    default: Date.now() + 24 * 60 * 60 * 1000 // 24hrs from creation date
  },
});

// Create the model
const EmailVerify = mongoose.model<CreateEmailVerification>("email_verification_tokens", EmailTokenSchema);

export default EmailVerify;