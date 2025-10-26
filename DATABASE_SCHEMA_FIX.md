# Database Schema Fix - "first_name column does not exist" Error

## Problem
When adding a child, you're getting this error:
```
400: {"error":"Invalid child data","details":"column \"first_name\" of relation \"children\" does not exist"}
```

## Root Cause
The database schema is out of sync with the code. Recent changes updated the children table from using a single `name` field to using separate `firstName` and `lastName` fields, but the database wasn't migrated to reflect these changes.

## Solution

You need to push the updated schema to your database. Since you're running on Replit, follow these steps:

### Option 1: Run Database Push Command (Recommended)
1. Open the **Shell** tab in your Replit workspace
2. Run the following command:
   ```bash
   npm run db:push
   ```
3. This will synchronize your database schema with the code

### Option 2: Restart Your Application
1. Click the **Stop** button in Replit
2. Click the **Run** button to restart
3. The `start` script automatically runs `drizzle-kit push` which will update the schema

## What Changed
The children table schema was updated from:
- `name` (single field)
- `age` (integer)
- `birthday` (text)

To:
- `firstName` (text)
- `lastName` (text)
- `birthdate` (timestamp)

## Verification
After running the fix, try adding a child again. The error should be resolved and you should be able to successfully create child records with first name, last name, and birthdate.

## Related Commits
- Commit `2f3ff51`: Updated child model to store first name, last name, and birthdate
- Commit `28a924f`: Fixed createChild method to properly handle field mapping
