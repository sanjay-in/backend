import mongoose from "mongoose"

export interface EmailVerificationTokens {
    _id: mongoose.Types.ObjectId;
    email: string;
    token: string,
    createdAt: Date;
    expiresAt: Date;
  };

  export type CreateEmailVerification = Omit<EmailVerificationTokens, "id">