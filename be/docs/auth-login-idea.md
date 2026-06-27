# Login Design Idea In ECEP

## Objective

The system needs to answer three basic questions:

1. Who is calling the API?
2. What is this user allowed to do?
3. Is the current login session still valid or already revoked?

To solve that, the backend uses a combination of:

- `Users` for identity management
- `JWT Access Token` for fast request authentication
- `User Sessions` in the database for real session control

## Main Components

### 1. `users` table

This table stores account information:

- `id`
- `name`
- `email`
- `role`
- `department`
- `password_hash`
- `isActive`

Meaning:

- this is where we define who the user is
- passwords are never stored as plain text, only as hashes

### 2. `user_sessions` table

This table stores login sessions:

- `user_id`
- `refresh_token_hash`
- `ip_address`
- `user_agent`
- `expires_at`
- `revoked_at`

Meaning:

- this is where we define whether a login session is still valid
- the backend can log out, revoke, or expire sessions safely

### 3. `accessToken`

After a successful login, the backend generates a JWT access token.

This token contains the main identity data:

- `userId`
- `email`
- `role`
- `sessionId`

The frontend sends it in the request header:

```http
Authorization: Bearer <access_token>
```

Meaning:

- the backend does not need to query the database on every request just to know who the user is
- authentication becomes much faster

## Why Not Use JWT Alone?

If we use JWT only:

- authentication is fast
- but real logout is hard
- immediate token revocation is also hard

Once a JWT has been issued, it usually remains valid until it expires, unless the backend has another mechanism to verify the session behind it.

That is why this system does not rely on JWT alone. It combines JWT with the `user_sessions` table.

## Login Flow

### Step 1. User submits email and password

Frontend sends:

`POST /api/auth/login`

```json
{
  "email": "admin@company.local",
  "password": "admin"
}
```

### Step 2. Backend validates the account

Backend does the following:

- finds the user by `email`
- checks `isActive`
- compares the incoming `password` with `password_hash`

If invalid:

- return a login failure response

If valid:

- generate `refreshToken`
- hash the `refreshToken`
- save it into `user_sessions`
- generate `accessToken`

### Step 3. Backend returns the authentication result

Backend returns:

- `accessToken`
- `refreshToken`
- user profile information

## API Calls After Login

After login, the frontend uses the `accessToken` to call protected APIs, for example:

- certificate upload
- exam submission
- profile retrieval

Every protected request sends:

```http
Authorization: Bearer <access_token>
```

## What Does The Authentication Middleware Do?

Related file:

- [src/middlewares/auth.middleware.ts](/Users/hienvan/Code/exam-certi-staff/be/src/middlewares/auth.middleware.ts)

When a request reaches a protected API, the middleware:

1. Reads the `Authorization` header
2. Extracts the JWT
3. Decodes it to get `userId`, `role`, and `sessionId`
4. Checks the `user_sessions` table:
   - does the session exist?
   - has it been revoked?
   - has it expired?
5. If valid, the request is allowed to continue

Meaning:

- JWT tells us who the user is
- the session record tells us whether the login is still allowed

## Logout Flow

When a user logs out:

- the frontend sends `refreshToken` to the logout API
- the backend finds the session by `refresh_token_hash`
- the backend sets `revoked_at = NOW()`

From that point on:

- the session is no longer valid
- even if the old access token has not expired yet, middleware can still block it because the related session has already been revoked

## Benefits Of This Model

### 1. Fast

- JWT keeps request authentication lightweight and fast

### 2. Session control

- real logout is possible
- session revocation is possible
- login auditing can be added later

### 3. Good fit for internal enterprise systems

- role-based access control is easy to apply
- auditing is easier
- account lock, forced re-login, and device/session management are easier to extend

## Possible Future Extensions

This design can be extended with:

- refresh token API
- change password
- internal forgot-password flow
- force logout on all devices
- limit concurrent active sessions
- fine-grained RBAC for `super_admin`, `partleader`, `employee`

## Short Summary

- `users`: who the user is
- `role`: what the user is allowed to do
- `JWT access token`: fast identity transport in each request
- `user_sessions`: whether the current login session is still valid

In one sentence:

> JWT is used for fast authentication, and database-backed sessions are used for real session control.
