# Demo User Feature Documentation

## Overview
Demo users are special accounts created by administrators to allow platform testing and exploration without full purchase capabilities. They can access all content, add items to cart, and use certifications, but **cannot create orders or make purchases**.

---

## Features

### ✅ Demo Users CAN:
- Browse products and all platform content
- View courses and certifications
- Add items to shopping cart
- View wallet balance and credits (demo balance)
- Access user profile and account settings
- Redeem vouchers (display only)
- View all pages and features
- Be assigned to companies

### ❌ Demo Users CANNOT:
- Create orders (blocked at API level)
- Make payments via Razorpay or cash
- Purchase credits
- Checkout from cart (UI disabled)
- Access admin panel
- Create or modify content

---

## Creating a Demo User

### Via Admin Panel:
1. Navigate to **Admin Dashboard** → **User Management**
2. Click **"Add User"** button
3. Fill in user details:
   - Name
   - Email
   - Phone
   - Password
   - Company (required)
   - Role: *Automatically set to EMPLOYEE for demo users*
4. **Check the box**: "Create as Demo User"
5. Click **"Create User"**

### Programmatically (API):
```bash
POST /api/admin/users
Content-Type: application/json

{
  "name": "Demo User",
  "email": "demo@example.com",
  "phone": "+91XXXXXXXXXX",
  "password": "DemoPassword123",
  "companyId": "company-uuid",
  "isDemo": true
}
```

---

## Database Changes

### Prisma Schema Update:
```prisma
model User {
  // ... existing fields
  isDemo       Boolean             @default(false)
  // ... rest of model
}
```

### Migration:
- Migration applied: `20260213054136_add_is_demo`
- Adds `isDemo` boolean column (default: false) to users table

---

## Authentication & Session

Demo flag is included in JWT token and session:

```typescript
// JWT Token includes:
{
  id: "user-uuid",
  email: "demo@example.com",
  name: "Demo User",
  role: "EMPLOYEE",
  isDemo: true   // ← Demo flag
}

// Session accessible in:
const session = await getServerSession();
const isDemo = (session?.user as any)?.isDemo || false;
```

---

## API Restrictions

### Order Creation Endpoints (Blocked):

#### 1. `POST /api/orders/order`
**Error Response:**
```json
{
  "error": "Demo users cannot create orders",
  "status": 403
}
```

#### 2. `POST /api/payments/verify-order`
**Error Response:**
```json
{
  "error": "Demo users cannot create orders/payments",
  "status": 403
}
```

### Implementation:
```typescript
// Block demo users at route entry
if ((session.user as any).isDemo) {
  return NextResponse.json(
    { error: "Demo users cannot create orders" },
    { status: 403 }
  );
}
```

---

## UI/UX Indicators

### Cart Page Alerts:
When a demo user adds items and attempts checkout:
- **Amber alert banner** displays explaining demo account limitations
- **"Proceed to Checkout" button** is disabled with tooltip
- **Error toast** shown if user tries to complete purchase

```tsx
{isDemo && (
  <Alert className="border-amber-300 bg-amber-50">
    <AlertCircle className="h-4 w-4 text-amber-600" />
    <AlertDescription className="text-amber-800 text-sm">
      <strong>Demo Account:</strong> You can browse and add items to cart, 
      but cannot complete purchases. Contact HR for a full account.
    </AlertDescription>
  </Alert>
)}
```

### Purchase Prevention:
```typescript
const handleCheckout = async () => {
  if (isDemo && currentStep === "payment") {
    toast.error("Demo users cannot make purchases", {
      description: "Demo accounts cannot complete orders...",
      duration: 5000,
    });
    return;
  }
  // ... rest of checkout flow
};
```

---

## Admin User Management

### User List Filters:
Demo users can be identified by:
- Role badge: Always "EMPLOYEE"
- Can be filtered via role dropdown
- Created through admin panel only

### User Actions Available:
- Edit user details (name, email)
- Delete demo user
- Manage wallet credits (add/remove)
- View transaction history

---

## Testing the Feature

### Step 1: Create Demo User
```bash
# Via admin UI or API
POST /api/admin/users
{
  "name": "Test Demo",
  "email": "testdemo@test.com",
  "phone": "+91XXXXXXXXXX",
  "password": "Test123!",
  "companyId": "<valid-company-id>",
  "isDemo": true
}
```

### Step 2: Login with Demo Account
1. Go to `/login`
2. Enter demo user email and password
3. Verify session includes `isDemo: true`

### Step 3: Test Restrictions
1. Browse store and products ✅
2. Add items to cart ✅
3. Attempt checkout → See warning and disabled button ❌
4. Check console → 403 error on order API ❌

### Step 4: Verify API Rejection
```bash
curl -X POST http://localhost:3000/api/orders/order \
  -H "Authorization: Bearer <demo-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [...],
    "address": "..."
  }'

# Response: 403 Forbidden - "Demo users cannot create orders"
```

---

## Files Modified

1. **`prisma/schema.prisma`**
   - Added `isDemo` field to User model

2. **`lib/auth.ts`**
   - Updated JWT callback to include `isDemo` flag
   - Updated session callback to include `isDemo` in user object

3. **`app/api/admin/users/route.ts`**
   - Added `isDemo` parameter to user creation
   - Enforces EMPLOYEE role for demo users

4. **`app/admin/(main)/users/page.tsx`**
   - Added "Create as Demo User" checkbox to form
   - Includes `isDemo` in user creation payload

5. **`app/api/orders/order/route.ts`**
   - Added demo user check at POST handler entry
   - Returns 403 if user is demo

6. **`app/api/payments/verify-order/route.ts`**
   - Added demo user check at POST handler entry
   - Blocks payment verification for demo users

7. **`app/[main]/cart/page.tsx`**
   - Added session check and `isDemo` state
   - Disabled checkout button for demo users
   - Added amber warning alert
   - Added error checks in purchase functions

---

## Migration & Deployment

### Local Development:
```bash
cd fitplay.life
npx prisma migrate dev --name add-isDemo
```

### Production:
```bash
npx prisma migrate deploy
```

### Rollback (if needed):
```bash
npx prisma migrate resolve --rolled-back <migration-name>
```

---

## Future Enhancements

1. **Demo Account Analytics**: Track demo user activity
2. **Expiring Demo Accounts**: Auto-expire after X days
3. **Upgrade Flow**: Direct demo users to HR for full account
4. **Feature Gates**: More granular demo restrictions per feature
5. **Audit Logging**: Log demo account creation and actions

---

## Support & Troubleshooting

### Issue: Demo user can create orders
**Solution**: Verify API endpoint has demo check; Clear browser cache and re-login

### Issue: Session not showing isDemo flag
**Solution**: Ensure auth callbacks are updated; Restart dev server; Check JWT token in cookie

### Issue: Cannot create demo user
**Solution**: Ensure only ADMIN role can create users; Check company exists; Verify all required fields

---

## References

- **NextAuth.js Docs**: https://next-auth.js.org/
- **Prisma Docs**: https://www.prisma.io/docs/
- **File Locations**:
  - Schema: `prisma/schema.prisma`
  - Auth: `lib/auth.ts`
  - Admin Users: `app/admin/(main)/users/page.tsx`
  - API Routes: `app/api/admin/users/route.ts`, `app/api/orders/order/route.ts`
