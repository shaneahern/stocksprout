# Sprout Request Contributor Dashboard Fix

## Issue
After signing up through a sprout request link and completing the initial gift, the contributor's homepage doesn't display the "Children You've Helped" section. It looks exactly the same as if they had independently signed up (not through a Sprout Request).

## Root Cause
The sprout request signup flow was using the wrong API endpoint (`/api/auth/signup`) which creates **parent/custodian** accounts in the `users` table, rather than **contributor** accounts in the `contributors` table.

This caused several issues:
1. Contributors were being created as users (parents) instead of contributors
2. When they made gifts, the gifts couldn't be properly linked to a contributor ID
3. The `/api/profile` endpoint only checked the `users` table, so contributor authentication failed
4. The contributor dashboard couldn't fetch their gifts because it looks for gifts by contributor ID

## Changes Made

### 1. Fixed Sprout Request Signup Endpoint
**File:** `client/src/pages/sprout-request.tsx`

Changed the signup mutation from:
```typescript
const response = await fetch('/api/auth/signup', {
```

To:
```typescript
const response = await fetch('/api/contributors/signup', {
```

This ensures that users who sign up through a sprout request are created as contributors in the `contributors` table, not as parent users.

### 2. Updated Token Storage and Redirect
**File:** `client/src/pages/sprout-request.tsx`

Changed from:
```typescript
localStorage.setItem('contributor_token', data.token);
setTimeout(() => {
  setLocation(`/gift/${requestData?.child?.giftLinkCode}`);
}, 1500);
```

To:
```typescript
localStorage.setItem('token', data.token);
window.location.href = `/gift/${requestData?.child?.giftLinkCode}`;
```

This ensures:
- The token is stored with the correct key that `AuthContext` expects
- A full page reload triggers `AuthContext` to fetch the contributor's profile

### 3. Updated Profile Endpoint to Support Contributors
**File:** `server/routes.ts`

Enhanced the `/api/profile` endpoint to check both the `users` and `contributors` tables:

```typescript
// Try to find user first (parent/custodian)
let user = await storage.getUser(decoded.userId);

// If not found in users, try contributors table
if (!user) {
  const contributor = await storage.getContributor(decoded.userId);
  if (!contributor) {
    return res.status(404).json({ error: "User not found" });
  }
  const { password, ...contributorWithoutPassword } = contributor;
  return res.json(contributorWithoutPassword);
}
```

This allows the `AuthContext` to fetch profile data for both types of accounts (parents and contributors).

## Flow After Fix

1. **Contributor receives sprout request link** → Clicks link
2. **Signs up through sprout request page** → Creates contributor account via `/api/contributors/signup`
3. **Token stored and page reloads** → `AuthContext` picks up token and fetches profile via `/api/profile`
4. **Contributor makes gift** → Gift is created with `contributorId` field set to their contributor ID
5. **Contributor dashboard loads** → Fetches gifts via `/api/contributors/${id}/gifts`
6. **"Children You've Helped" section displays** → Shows all children the contributor has gifted to

## Testing Recommendations

To verify the fix works correctly:

1. Create a sprout request from a parent account
2. Open the sprout request link in an incognito/private window
3. Sign up as a new contributor through the form
4. Complete the gift flow (select investment, amount, payment)
5. After gift is sent, click "Go to Dashboard" or navigate to contributor dashboard
6. Verify the "Children You've Helped" section shows the child you just gifted to
7. Verify the gift appears in the timeline tab

## API Endpoints Used

- `POST /api/contributors/signup` - Creates contributor account
- `GET /api/profile` - Fetches user or contributor profile (now supports both)
- `POST /api/gifts` - Creates gift with contributorId
- `GET /api/contributors/:id/gifts` - Fetches all gifts by contributor
- `PATCH /api/sprout-requests/:id/status` - Updates sprout request status to "accepted"

## Database Tables Involved

- `contributors` - Stores contributor accounts
- `gifts` - Stores gifts with contributorId field linking to contributors
- `sprout_requests` - Tracks invitation requests from parents to contributors

## Related Files

- `client/src/pages/sprout-request.tsx` - Sprout request signup page
- `client/src/pages/contributor-dashboard.tsx` - Contributor dashboard showing gifts
- `client/src/pages/gift-giver.tsx` - Gift creation page (already correctly passes contributorId)
- `client/src/contexts/AuthContext.tsx` - Authentication context (no changes needed)
- `server/routes.ts` - Backend API routes
- `server/storage.ts` - Database storage layer (no changes needed)

## Notes

- The fix is backward compatible - existing parent accounts continue to work
- Guest contributors (without accounts) still work as before
- The `/api/contributors/signup` endpoint already handles linking previous guest gifts to the new contributor account via the `linkGiftsToContributor` function
