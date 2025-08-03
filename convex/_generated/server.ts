/* eslint-disable */
/**
 * Generated `server` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import {
  actionGeneric,
  httpActionGeneric,
  mutationGeneric,
  queryGeneric,
  internalActionGeneric,
  internalMutationGeneric,
  internalQueryGeneric,
} from "convex/server";
import type { DataModel } from "./dataModel.js";

/**
 * Define a query in this Convex app's public API.
 *
 * This function will be allowed to read your Convex database and will be accessible to the client.
 *
 * @param func - The query function. It receives a `QueryCtx` as the first argument.
 * @returns The wrapped query. Include this as an `export` to add it to your app's API.
 */
export const query = queryGeneric<DataModel>;

/**
 * Define a mutation in this Convex app's public API.
 *
 * This function will be allowed to modify your Convex database and will be accessible to the client.
 *
 * @param func - The mutation function. It receives a `MutationCtx` as the first argument.
 * @returns The wrapped mutation. Include this as an `export` to add it to your app's API.
 */
export const mutation = mutationGeneric<DataModel>;

/**
 * Define an action in this Convex app's public API.
 *
 * An action can run any JavaScript code, including non-deterministic code and code with side-effects.
 * Actions can call third-party services and can call Convex queries and mutations via the provided `ctx.runQuery` and `ctx.runMutation`.
 * Actions cannot directly read from or write to the database.
 *
 * @param func - The action function. It receives an `ActionCtx` as the first argument.
 * @returns The wrapped action. Include this as an `export` to add it to your app's API.
 */
export const action = actionGeneric<DataModel>;

/**
 * Define an HTTP action in this Convex app's public API.
 *
 * HTTP actions are useful for exposing a Convex backend to webhooks or other services that can make HTTP requests.
 * HTTP actions can run any JavaScript code, including non-deterministic code and code with side-effects.
 * HTTP actions can call third-party services and can call Convex queries and mutations via the provided `ctx.runQuery` and `ctx.runMutation`.
 * HTTP actions cannot directly read from or write to the database.
 *
 * @param func - The HTTP action function. It receives an `ActionCtx` as the first argument and an HTTP `Request` as the second.
 * @returns The wrapped HTTP action. Include this as an `export` to add it to your app's API.
 */
export const httpAction = httpActionGeneric<DataModel>;

/**
 * Define an internal query function.
 *
 * Internal functions are not part of your Convex app's public API. They're
 * useful for code called by actions, HTTP actions, other internal functions, or
 * as helpers for public functions.
 *
 * Internal queries are not accessible to the client, can only be called from other
 * Convex functions (queries, mutations, actions, and other internal functions).
 *
 * @param func - The query function. It receives a `QueryCtx` as the first argument.
 * @returns The wrapped internal query.
 */
export const internalQuery = internalQueryGeneric<DataModel>;

/**
 * Define an internal mutation function.
 *
 * Internal functions are not part of your Convex app's public API. They're
 * useful for code called by actions, HTTP actions, other internal functions, or
 * as helpers for public functions.
 *
 * Internal mutations are not accessible to the client, can only be called from other
 * Convex functions (queries, mutations, actions, and other internal functions).
 *
 * @param func - The mutation function. It receives a `MutationCtx` as the first argument.
 * @returns The wrapped internal mutation.
 */
export const internalMutation = internalMutationGeneric<DataModel>;

/**
 * Define an internal action function.
 *
 * Internal functions are not part of your Convex app's public API. They're
 * useful for code called by actions, HTTP actions, other internal functions, or
 * as helpers for public functions.
 *
 * Internal actions are not accessible to the client, can only be called from other
 * Convex functions (queries, mutations, actions, and other internal functions).
 *
 * @param func - The action function. It receives an `ActionCtx` as the first argument.
 * @returns The wrapped internal action.
 */
export const internalAction = internalActionGeneric<DataModel>;