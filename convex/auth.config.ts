// Convex Auth configuration for Clerk integration
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN || "https://logical-spider-40.clerk.accounts.dev",
      applicationID: "convex",
    }
  ]
};