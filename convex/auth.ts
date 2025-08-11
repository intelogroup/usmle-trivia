import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

/**
 * Official Convex Auth Configuration
 * Medical Education Platform (MedQuiz Pro)
 * Fixed authentication with proper provider configuration
 */
export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Password,
  ],
});