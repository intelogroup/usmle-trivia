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
import type * as authEnhanced from "../authEnhanced.js";
import type * as authSecure from "../authSecure.js";
import type * as contentManagement from "../contentManagement.js";
import type * as quiz from "../quiz.js";
import type * as quizSessionManagement from "../quizSessionManagement.js";
import type * as schemaEnhanced from "../schemaEnhanced.js";
import type * as schemaOriginal from "../schemaOriginal.js";
import type * as social from "../social.js";
import type * as systemManagement from "../systemManagement.js";

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
  authEnhanced: typeof authEnhanced;
  authSecure: typeof authSecure;
  contentManagement: typeof contentManagement;
  quiz: typeof quiz;
  quizSessionManagement: typeof quizSessionManagement;
  schemaEnhanced: typeof schemaEnhanced;
  schemaOriginal: typeof schemaOriginal;
  social: typeof social;
  systemManagement: typeof systemManagement;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
