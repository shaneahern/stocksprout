/**
 * Shim for @tanstack/react-query to use legacy CommonJS build
 * The modern ESM build has broken imports (missing .js files)
 * This re-exports everything from the legacy build which works in React Native
 */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const reactQuery = require('../../../../node_modules/@tanstack/react-query/build/legacy/index.cjs');

export const {
  QueryClient,
  QueryClientProvider,
  useQuery,
  useMutation,
  useQueryClient,
  useQueries,
  useInfiniteQuery,
  useSuspenseQuery,
  useSuspenseInfiniteQuery,
  useSuspenseQueries,
  useIsFetching,
  useIsMutating,
  useMutationState,
  useIsRestoring,
  QueryErrorResetBoundary,
  useQueryErrorResetBoundary,
  HydrationBoundary,
  IsRestoringProvider,
  hashKey,
  defaultShouldDehydrateQuery,
  defaultShouldDehydrateMutation,
} = reactQuery;

export default reactQuery;
