# Frontend Development Documentation

### Main Routes (`app/(main)/`)

- `benefits/`: Benefits page
- `cart/`: Shopping cart functionality
- `partner/`: Partner programs page
- `product/[id]/`: Dynamic product pages
- `profile/`: User profile management
- `store/`: Product store/catalog
- `support/`: Customer support page
- `login/`: Employee login page
- `admin/login/`: Admin login page
- `admin/`: Admin Overview
- `admin/products`: Admin Products Management
- `admin/settings`: Admin Settings

1. Employee Login Form

![Screenshot_11-9-2025_154519_localhost](https://github.com/user-attachments/assets/e27180f8-0b61-4ec6-8df3-ae5cbb81f6f7)

2. Admin Login Form

![Screenshot_16-9-2025_154432_localhost](https://github.com/user-attachments/assets/8051155d-1bc9-4067-bd9f-b0a7a7382738)

3. Admin Panel

![Screenshot_16-9-2025_154514_localhost](https://github.com/user-attachments/assets/f83b10df-94d7-4886-a22b-2d92565fdbb1)

4. Admin Product Management

![Screenshot_16-9-2025_154623_localhost](https://github.com/user-attachments/assets/42fe418c-dddd-45f6-8dbb-3c16af85d60b)

5. Add New Product

![Screenshot_16-9-2025_154658_localhost](https://github.com/user-attachments/assets/6ebd6584-5261-40c9-becf-49d41bb1e9ca)

6. Edit Product

![Screenshot_16-9-2025_154746_localhost](https://github.com/user-attachments/assets/7af1db46-4210-471f-9248-b46ec144b850)

7. New Products Page. New Product card and grid

![Screenshot_16-9-2025_154842_localhost](https://github.com/user-attachments/assets/7f110227-94ea-49d1-93d3-ed3a86634779)

8. Product filters, category banners

![Screenshot_16-9-2025_154931_localhost](https://github.com/user-attachments/assets/315f5c2a-a80e-4611-a300-b5cad3a96cd5)

10. Product Page

![Screenshot_16-9-2025_155016_localhost](https://github.com/user-attachments/assets/3ba9fb65-44d2-4228-b534-7b2c95002fb7)

11. Add to wishlist

![Screenshot_16-9-2025_155126_localhost](https://github.com/user-attachments/assets/d4425cf2-5020-4286-8225-645b9725c4e7)

12. User Product wishlist

![Screenshot_16-9-2025_155154_localhost](https://github.com/user-attachments/assets/e62b17d0-ca64-4fd5-b27d-d8edcda69d00)

13. UI Changes

![Screenshot_11-9-2025_155459_localhost](https://github.com/user-attachments/assets/558f9ba2-4377-4fb4-92ea-7a03e1557bee)

- Credits info shown on benefits page only if logged in
- Add to cart without login won't work

14. ![Screenshot_11-9-2025_155727_localhost](https://github.com/user-attachments/assets/65800bdb-2384-47d4-bfbc-8e2db2deaef8)

- Navbar changes based on user auth state
- Landing page redirects

15. Vendor Add Form
    ![Screenshot_16-9-2025_155517_localhost](https://github.com/user-attachments/assets/ce3267a2-37af-4baa-ac9b-5d99a16ba61e)

16. Vendors Management

![Screenshot_16-9-2025_155613_localhost](https://github.com/user-attachments/assets/072fa7da-4496-4620-89a2-0758c8ea28aa)

## Tasks

- [x] Create Admin and HR panel UI. Setup sidebar and navigation
- [ ] Verified vs unverified users
- [x] Products API -> fetch products from server
- [x] Cart functionality is done
- [ ] Placing orders will be after backend is done
- [x] Products filtering done
- [x] Implement role-based UI rendering (Employee, HR, Admin)
- [x] Create analytics dashboard showing most redeemed products, active companies, monthly redemption volume, credits vs. INR redemptions, and global tracking.
- [ ] Create HR dashboard page with login-protected access, showing company employees, redemption status, budget allocation/usage, and campaign management.
- [ ] Implement employee monitoring section (list employees with redemption details).
