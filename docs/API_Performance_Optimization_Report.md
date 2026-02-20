# API Performance Optimization Report

## Objective

Improve API response times and provide a significantly more responsive user experience by identifying and resolving code-level architectural inefficiencies.

---

## 1. Tech Stack

- **Framework:** Next.js (App Router)
- **Deployment:** Vercel (Serverless Functions)
- **Database:** PostgreSQL (Neon DB – Free Tier)
- **ORM:** Prisma
- **Auth:** NextAuth

---

## 2. Current State (Before Optimization)

### Architecture

Client Component  
→ SWR  
→ API Route (App Router)  
→ Prisma  
→ Neon PostgreSQL

### Measured Response Times (Approx)

| Route         | Response Time (Before) |
| ------------- | ---------------------- |
| `/products`   | 2.16s                  |
| `/categories` | 931ms                  |

### Observations

- Cold start delay of ~1 second due to:
  - Vercel serverless function initialization
  - Neon DB free-tier auto-suspension (after 15 minutes of inactivity)
- Even warm responses contained avoidable overhead due to architectural inefficiencies.

---

## 3. Key Issues Identified (Code-Level)

### 1. Unnecessary Database Access in JWT Callback

- Database interaction was occurring during JWT validation.
- Increased latency for every authenticated request.

### 2. Excessive Console Logging

- Unnecessary `console.log` statements introduced I/O overhead.
- Increased execution time in serverless environments.

### 3. Root `layout.tsx` Marked as Client Component

- Converted entire application tree into client-rendered.
- Increased bundle size.
- Reduced benefits of Server Components.
- Negatively impacted performance.

### 4. Redundant Data Fetching Patterns

- Inconsistent data-fetch strategies.
- Multiple unnecessary API calls in certain flows.

### 5. No Route-Level Caching

- Every request directly hit the database.
- Amplified impact of Neon cold starts.
- No response reuse at the edge level.

---

## 4. Cold Start – Root Cause Analysis

Cold start latency was primarily caused by:

1. **Vercel Serverless Spin-Up**
   - Function container initialization on first request after inactivity.

2. **Neon Free Tier Auto-Suspend**
   - Database instance sleeps after 15 minutes of inactivity.
   - First query wakes database, adding additional delay.

Given the early-stage nature of the company, this trade-off was acceptable for now.

---

## 5. Improvements Implemented

### ✅ 1. Optimized JWT Validation

- Instead of JWT Callback for every request, JWT Validation is done in server.
- Reduced per-request latency.

### ✅ 2. Removed Excessive Logging

- Cleaned up console statements.
- Reduced execution overhead in serverless environment.

### ✅ 3. Corrected Root Layout Architecture

- Converted `layout.tsx` back to a Server Component.
- Restored proper client/server boundary.
- Reduced client bundle size and improved rendering performance.

### ✅ 4. Activated Prisma Accelerate Edge Caching

- Added `cacheStrategy: { ttl: 120, swr: 60 }` to globally cache product endpoints at the edge layer.
- Bypassed Next.js dynamic routing uncacheability, preventing repetitive queries from hitting the Neon DB.

### ✅ 5. Implemented Database Pagination

- Added `skip` and `take` to all Prisma queries, linked to `page` and `limit` URL parameters.
- Prevented the server from unnecessarily loading the entire database into memory for a single request.

### ✅ 6. Payload Reduction via Strict Selection

- Swapped expensive `include` JOINs for targeted `select` statements in Prisma queries.
- Drastically shrank Vercel serverless JSON payload sizes sent back to the client.

### ✅ 7. Upgraded Frontend to Infinite Scrolling

- Upgraded the frontend hook from `useSWR` to `useSWRInfinite`.
- Allowed for graceful, sequential paginated cursor loading without breaking existing React UI maps.

### ✅ 8. Implemented B-Tree Indexing

- Added explicit `@@index()` schema decorators to `createdAt`, `categoryId`, and `mrp`.
- Prevented exhaustive sequential database table scans during sort operations.

---

## 6. Updated State (After Optimization)

| Route         | Before | After |
| ------------- | ------ | ----- |
| `/products`   | 2.16s  | 467ms |
| `/categories` | 931ms  | 337ms |

### Performance Impact

- ~75% improvement on `/products`
- ~47% improvement on `/categories`

### Outcome

- Noticeably faster initial page loads
- Reduced backend overhead per request
- More consistent response times
- Improved perceived application responsiveness

The system now delivers a significantly smoother and more reliable user experience compared to the previous implementation.

---

## 8. Future Improvements

- Moving to AWS to avoid Serverless functions and reduce the Cold Start issue.
- Upgrading to Launch Neon DB package to keep the server up all the time.
- Migrating to the `@neondatabase/serverless` HTTP driver and `@prisma/adapter-neon` adapter to eliminate Postgres connection latency entirely and bypass the 100-connection limit on the free tier.
