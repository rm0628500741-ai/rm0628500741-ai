# Security Specification for Immigro AI

## 1. Data Invariants
- A user can only access their own profile.
- A user can only see their own CRS analyses, CVs, and consultations.
- Consultations can only be marked as 'completed' or 'accepted' by an Admin.
- Users cannot upgrade themselves to Admin.
- Emails must be verified to perform critical writes (Optional but recommended).

## 2. The "Dirty Dozen" Payloads (Attack Vectors)
1. **Identity Spoofing**: Attempt to create a profile with a different `uid`.
2. **PII Leak**: Authenticated user attempts to read another user's profile.
3. **Privilege Escalation**: User attempts to set `isAdmin: true` in their profile.
4. **State Shortcutting**: User attempts to update a consultation status to 'completed'.
5. **Orphaned Writes**: User attempts to create a CV without a valid `userId` matching their own.
6. **Data Poisoning**: User attempts to inject a 1MB string into a `fullName` field.
7. **Resource Exhaustion**: User attempts to create 10,000 consultations in a loop (Rate limiting via rules is limited, but we can check sizes).
8. **Shadow Field Injection**: User attempts to add `verified: true` to their account via `update`.
9. **Query Scraping**: User attempts to list all user profiles.
10. **Admin Bypass**: User attempts to delete a consultation.
11. **Immutability Breach**: User attempts to change the `createdAt` timestamp of a consultation.
12. **Cross-User Tampering**: User attempts to update another user's job application status.

## 3. Conflict Report
| Collection | Identity Spoofing | State Shortcutting | Resource Poisoning |
|------------|-------------------|--------------------|-------------------|
| user_profiles| Blocked by `userId` match | N/A | Blocked by `.size()` checks |
| crs_analyses | Blocked by `uid` field check | N/A | Blocked by strict schema |
| cvs          | Blocked by `userId` field check | N/A | Blocked by strict schema |
| consultations| Blocked by `uid` field check | Blocked by `affectedKeys` | Blocked by strict schema |
| applications | Blocked by `uid` field check | Blocked by `affectedKeys` | Blocked by strict schema |
