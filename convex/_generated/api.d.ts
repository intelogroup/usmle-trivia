/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as clearDatabase from "../clearDatabase.js";
import type * as contentManagement from "../contentManagement.js";
import type * as http from "../http.js";
import type * as migration from "../migration.js";
import type * as quiz from "../quiz.js";
import type * as quizSessionManagement from "../quizSessionManagement.js";
import type * as social from "../social.js";
import type * as systemManagement from "../systemManagement.js";
import type * as userProfiles from "../userProfiles.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  auth: typeof auth;
  clearDatabase: typeof clearDatabase;
  contentManagement: typeof contentManagement;
  http: typeof http;
  migration: typeof migration;
  quiz: typeof quiz;
  quizSessionManagement: typeof quizSessionManagement;
  social: typeof social;
  systemManagement: typeof systemManagement;
  userProfiles: typeof userProfiles;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
