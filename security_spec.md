# Security Specification: Spotter Multi-User System

## 1. Data Invariants
- Each user has their own private subcollection of saved places: `/users/{userId}/places/{placeId}`.
- No user may read, list, create, modify, or delete another user's places.
- Document creation must ensure `userId == request.auth.uid`.
- Document update must forbid changing the owner (`userId` must remain unchanged).
- Document IDs and field strings have size boundaries to prevent Denial of Wallet and payload injection.

## 2. Dirty Dozen Attack Payloads
1. Unauthenticated read: Attempt to read `/users/userA/places/place1` without token -> PERMISSION_DENIED.
2. Cross-user read: User B attempts to read `/users/userA/places/place1` -> PERMISSION_DENIED.
3. Cross-user list query: User B attempts to query `/users/userA/places` -> PERMISSION_DENIED.
4. Cross-user creation: User B attempts to write a document in `/users/userA/places` -> PERMISSION_DENIED.
5. Identity Spoofing on Create: User A creates a document in `/users/userA/places/p1` with `userId = 'userB'` -> PERMISSION_DENIED.
6. Owner Mutation: User A updates `userId` from `'userA'` to `'userB'` -> PERMISSION_DENIED.
7. Shadow Field Injection: Attempt to write unknown high-privilege keys -> PERMISSION_DENIED.
8. Huge String Denial-of-Wallet: Place name with 10,000 characters -> PERMISSION_DENIED.
9. Cross-user deletion: User B attempts to delete `/users/userA/places/place1` -> PERMISSION_DENIED.
10. Unauthenticated deletion: Anonymous/unauth user attempts to delete -> PERMISSION_DENIED.
11. Malformed Coordinate Injection: Setting non-number or invalid lat/lng -> PERMISSION_DENIED.
12. Cross-user User Profile Tampering: Writing to `/users/{userId}` where `userId != request.auth.uid` -> PERMISSION_DENIED.
