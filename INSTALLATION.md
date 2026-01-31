# Installation Guide

## Project Setup

### 1. Clone the Repository

```bash
git clone https://github.com/FIDEScommunity/interop-profiles.git
cd interop-profiles
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Add Profile Data

Place your interop profile JSON files in the `profiles/` directory:

```
profiles/
├── interop-profile.diip-v4.json
├── interop-profile.diip-v5.json
├── interop-profile.haip-v1.json
└── interop-profile.ewc-v3.json
```

**Naming convention**: `interop-profile.<profile-id>.json`

Profile IDs should follow the format: `<afkorting>-<versie>` (e.g., `diip-v4`, `haip-v1`)

### 4. Validate Profiles

```bash
npm run validate
```

This will check all profiles against the JSON Schema.

### 5. Generate Aggregated Data

```bash
npm run crawl
```

This generates `data/aggregated.json` which contains all profiles in a single file.

## WordPress Plugin Installation

### Method 1: Manual Installation

1. Copy the plugin folder:
   ```bash
   cp -r wordpress-plugin/fides-interop-matrix /path/to/wordpress/wp-content/plugins/
   ```

2. Copy the aggregated data file:
   ```bash
   cp data/aggregated.json /path/to/wordpress/wp-content/plugins/fides-interop-matrix/assets/
   ```

3. Activate the plugin in WordPress Admin → Plugins

4. Add the shortcode to a page:
   ```
   [fides_interop_matrix]
   ```

### Method 2: ZIP Installation

1. Create a ZIP file:
   ```bash
   cd wordpress-plugin
   zip -r fides-interop-matrix.zip fides-interop-matrix/
   ```

2. In WordPress Admin:
   - Go to Plugins → Add New → Upload Plugin
   - Upload the ZIP file
   - Activate the plugin

3. Before activating, ensure `aggregated.json` is in the `assets/` folder

## Shortcode Usage

### Basic Usage

Display all profiles:
```
[fides_interop_matrix]
```

### Filter Specific Profiles

Show only DIIP v5 and HAIP v1:
```
[fides_interop_matrix profiles="diip-v5,haip-v1"]
```

### Change Theme

Use dark theme:
```
[fides_interop_matrix theme="dark"]
```

Available themes:
- `fides` (default) - FIDES community colors
- `light` - Light color scheme
- `dark` - Dark color scheme

## GitHub Actions (Automatic Updates)

The repository includes two GitHub Actions workflows:

### 1. Validation Workflow

Automatically validates profiles when you push changes:
- Runs on push to `main` or `develop`
- Checks all profiles against the JSON Schema
- Fails if any profile is invalid

### 2. Crawl Workflow

Automatically generates aggregated.json when profiles change:
- Runs on push to `main`
- Generates `data/aggregated.json`
- Commits and pushes the updated file

## Updating Profile Data

### Adding a New Profile

1. Create a new JSON file in `profiles/`:
   ```bash
   profiles/interop-profile.swiyu-v1.json
   ```

2. Follow the JSON Schema structure (see `schemas/interop-profile.schema.json`)

3. Validate:
   ```bash
   npm run validate
   ```

4. Generate aggregated data:
   ```bash
   npm run crawl
   ```

5. Update the WordPress plugin:
   ```bash
   cp data/aggregated.json /path/to/wordpress/wp-content/plugins/fides-interop-matrix/assets/
   ```

### Updating an Existing Profile

1. Edit the JSON file in `profiles/`

2. Validate and regenerate:
   ```bash
   npm run validate
   npm run crawl
   ```

3. Update the WordPress plugin (see step 5 above)

## Troubleshooting

### Schema Validation Fails

Check the error message from `npm run validate`. Common issues:
- Missing required fields
- Incorrect data types
- Profile ID doesn't match filename

### Matrix Not Displaying

1. Check browser console for JavaScript errors
2. Verify `aggregated.json` is accessible at:
   ```
   https://your-site.com/wp-content/plugins/fides-interop-matrix/assets/aggregated.json
   ```
3. Clear WordPress and browser cache

### Mobile View Not Working

The mobile view activates at screen widths below 768px. Test on an actual mobile device or use browser dev tools (responsive design mode).

## Development

### Watch Mode

For development, you can use a file watcher to automatically regenerate `aggregated.json`:

```bash
npm install -g nodemon
nodemon --watch profiles --ext json --exec "npm run crawl"
```

### Testing Changes

After making changes to the plugin:
1. Update version number in `fides-interop-matrix.php`
2. Clear WordPress cache
3. Hard refresh browser (Ctrl+Shift+R / Cmd+Shift+R)

## Support

For issues or questions:
- GitHub Issues: https://github.com/FIDEScommunity/interop-profiles/issues
- FIDES Community: https://fides.community

## License

Apache-2.0 © 2026 FIDES Labs BV
