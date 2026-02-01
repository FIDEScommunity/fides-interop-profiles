# Deployment Guide - FIDES Interop Profile Matrix

This guide covers deployment of the FIDES Interop Profile Matrix plugin to fides.community WordPress site.

## Pre-Deployment Checklist

Before deploying to production, ensure:

- [ ] All profile JSON files are validated (`npm run validate`)
- [ ] Latest aggregated data generated (`npm run crawl`)
- [ ] Minified assets created (`npm run minify`)
- [ ] Browser compatibility tested (Chrome, Firefox, Safari, Edge)
- [ ] Mobile responsiveness verified
- [ ] Security review completed
- [ ] Version numbers updated in plugin files
- [ ] WordPress backup created
- [ ] Staging deployment tested successfully

## Version Update

Update version numbers before deployment:

1. **Plugin main file**: `wordpress-plugin/fides-interop-matrix/fides-interop-matrix.php`
   - Line 6: `Version: 1.0.0` → Update version
   - Line 20: `define('FIDES_INTEROP_MATRIX_VERSION', '1.0.0');` → Update version

2. **Plugin readme**: `wordpress-plugin/fides-interop-matrix/readme.txt`
   - Line 6: `Stable tag: 1.0.0` → Update version
   - Update changelog section

## Deployment Process

### Step 1: Create Backup

```bash
# Backup WordPress site via cPanel or hosting panel
# Or use WordPress backup plugin (UpdraftPlus, BackupBuddy, etc.)
# Download backup locally before proceeding
```

Document backup location and timestamp:
- **Backup Date**: _______________
- **Backup Location**: _______________
- **Backup Method**: _______________

### Step 2: Prepare Deployment Package

```bash
cd /path/to/interop-profiles

# Generate latest data and minified assets
npm run build

# Copy aggregated.json to plugin assets
cp data/aggregated.json wordpress-plugin/fides-interop-matrix/assets/

# Verify all required files are present
ls -la wordpress-plugin/fides-interop-matrix/assets/
# Should contain:
# - aggregated.json
# - interop-matrix.js
# - interop-matrix.min.js
# - style.css
# - style.min.css
```

### Step 3: Create Deployment ZIP

```bash
cd wordpress-plugin

# Create clean ZIP file (excludes development files)
zip -r fides-interop-matrix.zip fides-interop-matrix/ \
  -x "*.git*" \
  -x "*node_modules*" \
  -x "*.DS_Store" \
  -x "*__MACOSX*"

# Verify ZIP contents
unzip -l fides-interop-matrix.zip | head -20
```

### Step 4: Deploy to Staging (REQUIRED)

Test on staging environment before production:

1. **Upload to staging site**:
   - Via FTP/SFTP to `wp-content/plugins/`
   - Or via WordPress Admin → Plugins → Add New → Upload

2. **Activate plugin on staging**

3. **Create test page** with shortcode:
   ```
   [fides_interop_matrix]
   ```

4. **Verification tests**:
   - [ ] Matrix renders correctly
   - [ ] All 3 profiles visible (DIIP v4, DIIP v5, HAIP v1)
   - [ ] Toggle buttons work (show all / hide unsupported)
   - [ ] Links to specifications work
   - [ ] Mobile view works (test on device or browser dev tools)
   - [ ] No JavaScript console errors
   - [ ] Page loads in < 3 seconds

5. **Test shortcode variants**:
   ```
   [fides_interop_matrix profiles="diip-v5,haip-v1"]
   [fides_interop_matrix theme="dark"]
   ```

### Step 5: Deploy to Production

**ONLY proceed if staging tests pass!**

#### Option A: Manual Upload via FTP/SFTP

```bash
# Connect to fides.community via SFTP
# Upload to: /wp-content/plugins/fides-interop-matrix/

# Set correct permissions
chmod 755 fides-interop-matrix/
chmod 644 fides-interop-matrix/*.php
chmod 644 fides-interop-matrix/*.txt
chmod 755 fides-interop-matrix/assets/
chmod 644 fides-interop-matrix/assets/*
```

#### Option B: WordPress Admin Upload

1. Deactivate old version (if exists)
2. Delete old plugin folder (if exists)
3. Upload new ZIP via Plugins → Add New → Upload
4. Activate plugin
5. Verify settings in Settings → FIDES Interop Matrix

### Step 6: Post-Deployment Verification

Immediately after deployment:

1. **Visit production page**: https://fides.community/interop-matrix/

2. **Visual checks**:
   - [ ] Matrix renders correctly
   - [ ] All profiles visible and aligned
   - [ ] Toggle works
   - [ ] No layout issues
   - [ ] Tooltips work on hover

3. **Browser console check**:
   - Open DevTools (F12)
   - Check for JavaScript errors
   - Verify data loaded successfully

4. **Network check**:
   - Check Network tab in DevTools
   - Verify aggregated.json loads (either from GitHub or local fallback)
   - Verify CSS and JS assets load with 200 status

5. **Mobile check**:
   - Test on actual mobile device or responsive mode
   - Verify tab switching works
   - Check readability and touch targets

6. **Performance check**:
   - Run Lighthouse audit (DevTools → Lighthouse)
   - Target: Performance score > 90
   - Check loading time < 3 seconds

## Rollback Procedure

If issues occur after deployment:

### Quick Rollback (Deactivate)

```bash
# Via WordPress Admin
Plugins → FIDES Interop Matrix → Deactivate

# Via FTP (if admin not accessible)
# Rename plugin folder:
fides-interop-matrix → fides-interop-matrix.disabled
```

### Full Rollback (Restore Backup)

1. Deactivate the plugin
2. Delete plugin folder via FTP
3. Restore from backup created in Step 1
4. Verify site functionality

## Troubleshooting

### Issue: Matrix Not Rendering

**Symptoms**: Empty div, no content

**Checks**:
1. Browser console errors?
2. aggregated.json accessible at `/wp-content/plugins/fides-interop-matrix/assets/aggregated.json`?
3. JavaScript file loaded correctly?

**Solutions**:
- Clear WordPress cache (if using cache plugin)
- Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)
- Check file permissions (644 for JSON, JS, CSS)
- Verify GitHub CDN is accessible

### Issue: Layout Broken

**Symptoms**: Misaligned columns, overlapping text

**Checks**:
1. Theme conflicts? Test with default WordPress theme
2. CSS file loaded correctly?
3. Browser compatibility issue?

**Solutions**:
- Clear browser cache
- Test in different browser
- Check for CSS conflicts with theme
- Verify minified CSS is valid

### Issue: Toggle Not Working

**Symptoms**: Buttons don't respond, rows don't hide

**Checks**:
1. JavaScript console errors?
2. LocalStorage accessible?

**Solutions**:
- Clear browser localStorage
- Check JavaScript file loaded
- Verify browser allows localStorage

### Issue: Mobile View Not Working

**Symptoms**: Desktop view on mobile, tabs don't work

**Checks**:
1. Viewport meta tag in WordPress theme?
2. Touch events working?

**Solutions**:
- Add viewport meta tag to theme
- Test on actual device (not simulator)
- Check responsive breakpoints in CSS

## Monitoring

### Post-Deployment Monitoring (First 24 Hours)

1. **Check for errors**:
   - WordPress error logs: `wp-content/debug.log` (if WP_DEBUG enabled)
   - Server error logs: Check via hosting panel
   - Browser console: Check production site

2. **Performance monitoring**:
   - Page load time (target: < 3 seconds)
   - Server response time
   - CDN availability (GitHub raw.githubusercontent.com)

3. **User feedback**:
   - Monitor for user reports
   - Check analytics for page bounces
   - Watch for support requests

### Ongoing Maintenance

#### Weekly
- Check GitHub Actions status (validate & crawl workflows)
- Monitor plugin performance
- Review error logs

#### Monthly
- Test compatibility with WordPress updates
- Verify data freshness
- Check for browser compatibility changes

#### When Adding New Profiles
1. Add JSON file to `profiles/` folder
2. Run `npm run validate`
3. Run `npm run build` (includes crawl + minify)
4. Commit and push to GitHub
5. GitHub Actions will auto-update `aggregated.json`
6. Plugin will auto-fetch latest data within 24 hours

## Emergency Contacts

**Technical Issues**:
- FIDES Labs Technical Team
- GitHub Issues: https://github.com/FIDEScommunity/interop-profiles/issues

**WordPress Site Access**:
- Admin URL: https://fides.community/wp-admin/
- Hosting Panel: [Add hosting panel URL]

## Deployment Log Template

Use this template to document each deployment:

```
DEPLOYMENT LOG
==============
Date: _______________
Version: _______________
Deployed By: _______________

Pre-Deployment:
[ ] Backup created
[ ] Staging tested
[ ] All checks passed

Deployment:
[ ] Files uploaded
[ ] Plugin activated
[ ] Settings verified

Post-Deployment:
[ ] Visual check passed
[ ] Console check passed
[ ] Mobile check passed
[ ] Performance check passed

Issues Encountered: _______________
Resolution: _______________

Sign-off: _______________
```

## File Checklist

Ensure these files are included in deployment:

### Required Files
- `fides-interop-matrix.php` (main plugin file)
- `readme.txt` (plugin info)
- `assets/aggregated.json` (profile data)
- `assets/style.min.css` (minified styles)
- `assets/interop-matrix.min.js` (minified JavaScript)

### Optional (Development)
- `assets/style.css` (source CSS, for debugging)
- `assets/interop-matrix.js` (source JS, for debugging)

### Not Required
- `.git/` (if present)
- `node_modules/` (if present)
- `.DS_Store` (macOS)
- `__MACOSX/` (macOS ZIP artifacts)

## Security Considerations

### File Permissions (Unix/Linux)
```bash
# Directories: 755 (rwxr-xr-x)
chmod 755 fides-interop-matrix/
chmod 755 fides-interop-matrix/assets/

# Files: 644 (rw-r--r--)
chmod 644 fides-interop-matrix/*.php
chmod 644 fides-interop-matrix/*.txt
chmod 644 fides-interop-matrix/assets/*
```

### WordPress Security
- Plugin validates all shortcode parameters
- XSS protection via escapeHtml() in JavaScript
- Theme parameter uses whitelist validation
- No database writes or user input storage
- No admin AJAX endpoints

## Performance Expectations

### Load Times
- **First Load**: < 3 seconds (including GitHub CDN fetch)
- **Cached Load**: < 1 second
- **aggregated.json Size**: ~50-100KB

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Mobile Support
- iOS Safari 14+
- Android Chrome 90+
- Responsive breakpoint: 768px

## Success Criteria

Deployment is successful when:
- ✅ Matrix renders correctly on all browsers
- ✅ No JavaScript console errors
- ✅ Toggle functionality works
- ✅ Mobile view works on devices
- ✅ Page loads in < 3 seconds
- ✅ All links work correctly
- ✅ No security warnings
- ✅ Backup verified and accessible

---

**Last Updated**: 2026-01-30
**Version**: 1.0.0
