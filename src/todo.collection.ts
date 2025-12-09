import { createCollection, parseLoadSubsetOptions } from "@tanstack/db";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { QueryClient } from "@tanstack/query-core";

// This counter is used to track how many times the queryFn actually runs.
// Each time we load a TODO, we increment this counter and include it in the name.
let todoLoadCallCount = 0;

/**
 * Simulated async loader for a single TODO.
 * The "version" in the name is derived from todoLoadCallCount so that
 * we can see if a new call was made or a previous result was reused.
 */
const loadTodoById = (todoId: number) =>
  Promise.resolve([
    {
      id: todoId,
      // The "version" is incremented on every call to prove whether we refetch or reuse.
      name: `TODO ${todoId} – load #${todoLoadCallCount++}`,
    },
  ]);

// Shared QueryClient instance for TanStack Query
export const queryClient = new QueryClient();

/**
 * Collection used to reproduce the issue:
 *
 * - syncMode: "on-demand"       → queries are only fetched when explicitly requested
 * - staleTime: 0                → results should be considered stale immediately
 *
 * Because staleTime is 0, we expect:
 *   * Every time we run a query, queryFn should be called again
 *   * The todoLoadCallCount should increment on each access
 *
 * However, in practice, when we go back to a previous result,
 * the existing query result is reused and todoLoadCallCount is NOT incremented.
 */
export const todosCollection = createCollection(
  queryCollectionOptions({
    queryClient,
    queryKey: ["todos"],

    // Important for this repro: we only load data when explicitly requested.
    syncMode: "on-demand",

    // Critical line for the bug:
    // With staleTime = 0, we expect queries to always be refetched and never reused.
    staleTime: 0,

    queryFn: (ctx) => {
      const options = parseLoadSubsetOptions(ctx.meta?.loadSubsetOptions);

      // We look for a simple "id = <value>" filter
      const idFilter = options.filters.find(
        (filter) =>
          filter.field.length === 1 &&
          filter.field[0] === "id" &&
          filter.operator === "eq",
      );

      const todoId = idFilter?.value ?? 1;

      // This call SHOULD happen every time we access this query
      // (because staleTime = 0), but in practice it is reused.
      return loadTodoById(todoId);
    },

    getKey: (item) => item.id,
  }),
);
