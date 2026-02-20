# Fitplay Backend

## Project Overview

Fitplay is a corporate wellness platform that allows companies to provide their employees with access to wellness products and services.
This backend repository handles user authentication, product management, wallet and credit systems, order processing, analytics and vendor integration for the Fitplay platform.

## Tech Stack

- APIs: Nextjs (API Routes)
- Database: Prisma ORM + PostgreSQL (NeonDB)
- Authentication: JWT with NextAuth.js
- Email Service: Resend
- Cron Jobs: cronjob.org

## DB Schema

- Users table: Store user details (HR and employees)
- Admin table: Store admin details
- Vendors table: Store vendor details
- Verification Tokens table: Store email verification tokens for users
- Companies table: Store company details
- Products table: Store product details
- Product Variants table: Store product variant details
- Wallets table: Store wallet details for users
- TransactionsLedger table: Store transaction history for wallets
- Orders table: Store order details
- OrderItems table: Store items in each order

## Backend APIs routes

Authentication:
- api/auth/[...nextauth]: NextAuth.js endpoint for authentication
- api/auth/resetPassword: Endpoint to request password reset email
- api/auth/signup/complete-signup: Endpoint to complete signup
- api/auth/signup/create-invite: Endpoint to create signup invite for employees/HRs
- api/auth/verify: Endpoint to verify email using token

Admin Wallet Transactions
- api/admin/wallet-transactions: Get all wallet transactions across the platform (Admin and company transactions for HRs)

Analytics:
- api/analytics/order-filters: Get order analytics based on filters (Admin and slected data for HRs)
- api/analytics/export-pdf: Export inventory report as PDF (Admin and slected data for HRs)
- api/analytics/export-csv: Export order data as CSV (Admin and slected data for HRs)

Companies:
- api/companies: Get all companies details
- api/companies/company: Create a company (Admin only)

Cron Jobs(scheduled tasks):
- api/cron/claimed-accounts: Cron job to delete unclaimed accounts older than 24 hours
- api/cron/expired-credits: Cron job to expire credits older than 1 year

Orders:
- api/orders: Get all orders (Admin only)
- api/orders/order: Create order (all users),update order status (Admin only), Delete order (Admin only), and get order by id (all users)

Products:
- api/products: Bulk upload products (Admin only) and get all products (all users)
- api/products/product: Get a single product by id (all users) and crud operations for a particular product (admin only)
- search: api/products/search?q=:query: Search products by name or description (all users)

Profile:
- api/profile: Get user profile (all users) and update user profile (all users), except for admin

Users:
- api/users: Get all users of a company(Admin and HR only)

Vendors:
- api/vendors: Get all vendors (Admin only) and create a vendor (Admin only)
- api/vendors/vendor: Get, update, delete a single vendor by id (Admin only)

Wallets:
- api/wallets: Get wallets of all employees of a company(HR, Admin), add credits to multiple wallets (Admin only), edit wallet credits (Admin only)
- api/wallets/wallet: Get wallet by id (all users), add/edit credits to wallet (Admin only) 

## Deployment
- Current deployment is on vercel and database on neonDB(postgres).
- All the environment variables are set in vercel for the deployment.
- Future plan is to move the deployment to AWS or GCP for better scalability and control.

## Email Service
- Using resend(API key @ayushcodes1729) for sending emails for alerts and verification.

## Cron Jobs
- Using cronjob.org for scheduling cron jobs for deleting unclaimed accounts and expiring credits.

## Backend Task Log (Chronological)

1. Initial Setup & Infrastructure

-   Set up Prisma ORM and base schema tables (Users, Company, HR)
-   Fixed Prisma client import/config issues
-   Set up authentication foundation with backend APIs

2. Authentication Module

-   Added signup & login for Admin, HR, Employees
-   Added email verification flow using tokens
-   Added reset-password API for all roles
-   Added single-login system supporting all role types
-   Implemented role‑wise access controls
-   Fixed multiple auth bugs across deployments

3. Database Schema Enhancements

-   Added Products, Product Variants, Vendors, Wallets
-   Added Transactions Ledger
-   Added Orders & OrderItems
-   Updated schema for Vendor role
-   Updated schema for HR and Employee structures

4. Companies Module

-   Added APIs to fetch companies
-   Added Admin-only create-company endpoint

5. Vendors Module

-   Added Admin APIs to create, fetch, update, delete vendors
-   Added vendor role logic

6. Products Module

-   Implemented full Admin Product CRUD
-   Added product search API
-   Added bulk product upload
-   Fixed product variant update bugs
-   Fixed multiple issues in add-to-cart and product flow

7. Wallet & Credits Module

-   Implemented wallet creation for all users
-   Added Admin & HR wallet APIs
-   Added credit allocation to single/multiple employees
-   Added wallet transactions ledger
-   Fixed credit update issues and cart-credit inconsistencies

8. Transactions Module

-   Added Admin-wide wallet transaction listing API
-   Added company-wise transaction listing for HRs

9. Orders Module

-   Added user order creation
-   Added Admin CRUD for orders
-   Added remarks update for orders
-   Fixed refund and order field issues
-   Added full order status flow: pending → approved → dispatched →
    delivered → cancelled

10. Analytics & Reports

-   Added analytics filters for orders
-   Export to PDF (Inventory / Orders)
-   Export to CSV

11. Cron Jobs

-   Delete unclaimed accounts older than 24 hours
-   Expire wallet credits older than 1 year
-   Fixed expired-credit logic and notifications

12. Notifications & Email Service

-   Integrated Resend for email alerts
-   Added alerts for verification, reset-password, credit expiry

13. Deployment & DevOps

-   Backend deployed on Vercel
-   Database on NeonDB (PostgreSQL)
-   Environment variables configured on Vercel

## Future Improvements

- Payment Integration for buying credits
- HR Portal and Vendor Portal more features
- Caching with Redis for performance optimization
- Move deployment to AWS/GCP for better scalability

## Challenges and Learnings

Learning Points:
- Handling role-based access control effectively
- Implementing cron jobs for scheduled tasks with Next.js using cronjob.org

Challenges:
- Implementing forgot password and email verification flows securely
- Adding e-mail notifications reliably using resend
- Implementing scheduled tasks (cron jobs) in a serverless environment
- Vendor Integration and management using Unicommerce APIs

