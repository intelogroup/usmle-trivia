import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

/**
 * Official Convex Auth Configuration
 * Medical Education Platform (MedQuiz Pro)
 * Enhanced for USMLE preparation with secure authentication
 */
export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    // Password-based authentication with minimal profile
    Password,
  ],
});