# Image Troubleshooting Guide

## Common Image Issues & Solutions

### 1. **External Image URLs Not Loading**

**Problem:** Images from external sources (imgbb, unsplash) don't appear.

**Causes:**
- External URL is expired/invalid
- CORS (Cross-Origin Resource Sharing) blocking
- Network/firewall blocking external requests
- Mixed content (HTTP vs HTTPS)

**Solutions:**

#### Option A: Use Local Images
1. Download images to `foodconnect67/frontend/public/images/`
2. Update HTML to use local paths:
   ```html
   <img src="/images/logo.png" alt="Logo">
   ```

#### Option B: Use Data URIs (for small images)
Replace external URLs with inline SVG placeholders (already implemented for logos).

#### Option C: Fix External URLs
- Verify the URL is still valid
- Use HTTPS URLs only
- Check browser console for CORS errors

### 2. **Food Images Not Showing**

**Problem:** Food items from database don't have images.

**Causes:**
- No images uploaded yet (uploads directory is empty)
- Image path in database is incorrect
- Backend not serving uploads correctly

**Solutions:**

1. **Upload Food Images:**
   - Login as admin
   - Go to food management (or use Postman)
   - POST to `/api/foods` with `image` file in form-data
   - Images will be saved to `backend/uploads/`

2. **Verify Uploads Directory:**
   ```bash
   # Check if directory exists
   ls foodconnect67/backend/uploads
   
   # If empty, create a test image or upload via API
   ```

3. **Check Image Paths in Database:**
   ```sql
   SELECT id, name, image_url FROM foods;
   ```
   - Should be like: `/uploads/1234567890-123456789.png`
   - Or just: `1234567890-123456789.png` (frontend adds `/uploads/`)

### 3. **Backend Not Serving Images**

**Problem:** `/uploads/` path returns 404.

**Check:**
1. Verify `app.js` has:
   ```javascript
   app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
   ```

2. Verify uploads directory exists:
   ```bash
   cd foodconnect67/backend
   mkdir -p uploads  # Create if missing
   ```

3. Test image serving:
   - Place a test image: `backend/uploads/test.png`
   - Visit: `http://localhost:3000/uploads/test.png`
   - Should display the image

### 4. **Browser Console Errors**

**Check Browser Console (F12):**
- Look for 404 errors (image not found)
- Look for CORS errors (external images blocked)
- Look for network errors (server not running)

**Common Errors:**
```
Failed to load resource: net::ERR_FILE_NOT_FOUND
→ Image path is wrong or file doesn't exist

Access to image blocked by CORS policy
→ External URL is blocked, use local images

Failed to fetch
→ Backend server is not running
```

## Quick Fixes

### Fix 1: Add Placeholder Images
✅ **Already implemented!** The code now shows placeholder images when:
- Image URL is missing
- Image fails to load
- Image path is invalid

### Fix 2: Test Image Serving
```bash
# 1. Create a test image
cd foodconnect67/backend/uploads
# Add any image file (test.png, test.jpg)

# 2. Start backend
cd ..
npm run dev

# 3. Test in browser
# Visit: http://localhost:3000/uploads/test.png
```

### Fix 3: Upload Sample Food with Image
```bash
# Using Postman or curl:
POST http://localhost:3000/api/foods
Headers:
  Authorization: Bearer <admin_token>
Body (form-data):
  name: "Test Pizza"
  description: "Delicious test pizza"
  price: 180
  category: "Fast Food"
  image: <select image file>
```

## Current Status

✅ **Fixed:**
- Image path resolution improved
- Placeholder images for missing/broken images
- Better error handling

⚠️ **Still Need:**
- Upload actual food images via API
- Replace external logo URLs with local files (optional)
- Test with real image uploads

## Testing Checklist

- [ ] Backend server running on port 3000
- [ ] `/uploads/` directory exists and is accessible
- [ ] Can access `http://localhost:3000/uploads/test.png` (if test image exists)
- [ ] Food items have `image_url` in database
- [ ] Browser console shows no 404 errors for images
- [ ] Placeholder images appear for missing images

## Next Steps

1. **Upload food images:**
   - Login as admin
   - Add foods with images via API
   - Or use admin panel (if available)

2. **Replace external logos (optional):**
   - Download logo to `frontend/public/images/logo.png`
   - Update HTML files to use `/images/logo.png`

3. **Test end-to-end:**
   - Add food with image
   - View on homepage
   - Verify image displays correctly

