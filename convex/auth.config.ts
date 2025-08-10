import { defineConfig } from "@convex-dev/auth";
import { Password } from "@convex-dev/auth/providers/Password";

export default defineConfig({
  providers: [
    Password({
      profile(params) {
        return {
          email: params.email as string,
          name: params.name as string,
          // Medical fields will be handled in userProfiles table
        };
      },
    }),
  ],
  // No callbacks needed - Convex Auth handles user creation automatically
  // Medical profiles will be created separately via userProfiles.ts
});