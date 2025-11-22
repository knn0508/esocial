# TAB Logo Setup Instructions

## Adding the TAB Logo

To add the TAB logo to your website:

1. **Save your logo image** as `tab-logo.png` in the `client/public/` folder
   - Recommended size: 200x200 pixels or larger (will be scaled down)
   - Format: PNG with transparent background (recommended)
   - The logo should show the graduation cap figure with "TAB" text

2. **File location**: 
   ```
   client/public/tab-logo.png
   ```

3. **The code is already set up** to use `/tab-logo.png` in:
   - Navbar (both authenticated and unauthenticated states)
   - Footer
   - All authentication pages (Login, Signup, Forgot Password, Reset Password, Verify Email)

4. **Fallback**: If the image doesn't exist, a blue square with "T" will be shown as a fallback.

## Alternative: Using SVG

If you prefer to use an SVG logo:

1. Save as `tab-logo.svg` in `client/public/`
2. Update all references from `/tab-logo.png` to `/tab-logo.svg` in:
   - `client/src/components/layout/Navbar.js`
   - `client/src/components/layout/Footer.js`
   - `client/src/pages/auth/LoginPage.js`
   - `client/src/pages/auth/SignupPage.js`
   - `client/src/pages/auth/ForgotPasswordPage.js`
   - `client/src/pages/auth/ResetPasswordPage.js`
   - `client/src/pages/auth/VerifyEmailPage.js`

## Testing

After adding the logo:
1. Restart your development server
2. Check all pages to ensure the logo displays correctly
3. Verify the logo appears in both light and dark backgrounds

