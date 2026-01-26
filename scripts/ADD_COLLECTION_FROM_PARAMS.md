# Adding Collections from Parameter Files

This script automates adding new CLMS collections using the standardized parameter files from the cdse-clms-onboarding repository.

## Before You Start: Configuration Preparation

**Important:** Before running the script, you need to prepare the configuration:

1. **Copy Configuration to Production Account:**

   - Log in to Sentinel Hub Dashboard with `cdse_byoc_collections_admin@sentinel-hub.com` account
   - Find the collection configuration for your dataset
   - Copy the configuration to the `cdas_browser+instances@sentinel-hub.com` account
   - Note the new `configurationId` from the copied configuration

2. **Update Parameter File:**

   - Open the parameter JSON file
   - Replace `configuration_id` in the `registration` object with the new copied configurationId
   - **Optional:** Update `name` in `collection_information` to have a better label display in the UI

3. **Proceed with the script:**
   - Now you're ready to run the automation script with the updated parameter file

## Getting Parameter Files

Parameter files are stored in the `cdse-clms-onboarding` repository on GitLab. Each collection has a JSON file with all required configuration:

**Collection Parameters Directory:** [https://gitext.sinergise.com/sentinel-projects/cdse/cdse-clms-onboarding/-/tree/main/data/clms/collection-parameters](https://gitext.sinergise.com/sentinel-projects/cdse/cdse-clms-onboarding/-/tree/main/data/clms/collection-parameters)

1. Navigate to the collection parameters directory
2. Browse the available collection JSON files (e.g., `lai_global_300m_10daily_v2_RT0.json`)
3. Click on the file and copy the raw JSON content
4. Save it locally in your workspace

## Example

```bash
# Download parameter file from cdse-clms-onboarding repo
# Replace with actual collection name from the directory
wget https://gitext.sinergise.com/sentinel-projects/cdse/cdse-clms-onboarding/-/raw/main/data/clms/collection-parameters/lai_global_300m_10daily_v2_RT0.json

# Or copy the JSON content and save to a file
cat > lai_global_300m_10daily_v2_RT0.json << 'EOF'
{
  "collection_information": { ... },
  ...
}
EOF

# Run the script (includes automated metadata cache update and preview generation)
node scripts/add-clms-collection-from-params.js --params lai_global_300m_10daily_v2_RT0.json

# Review changes
git diff

# Complete manual steps (3 manual steps - see console output):
# 1. CLMSCollectionSelection.utils.js (CLMS_OPTIONS)
# 2. collectionFormConfig.js (recursiveCollectionCLMS)
# 3. ODataHelpers.js (Visualize → Search tab integration)

# Test in browser
```

## Quick Start

```bash
node scripts/add-clms-collection-from-params.js --params path/to/collection-parameters.json
```

## What It Does

The script reads a parameter file with this structure:

```json
{
  "collection_information": {
    "name": "FAPAR 2014-present (raster 300 m), global, 10-daily – version 2",
    "description": "Quantifies the fraction of the solar radiation...",
    "hierarchy": ["Bio-geophysical Parameters", "Vegetation", "Vegetation Properties"],
    "date_range": "2014-present"
  },
  "content_information": {
    "bands": [
      { "name": "FAPAR", "docs": {...} },
      { "name": "RMSE", "docs": {...} }
    ],
    "layers": [
      { "name": "FAPAR", "description": "...", "title": "..." },
      { "name": "LENGTH_AFTER", "description": "..." }
    ]
  },
  "registration": {
    "collection_name": "fapar_global_300m_10daily_v2_RT0",
    "collection_id": "5d0857-YOUR-INSTANCEID-HERE",
    "configuration_id": "32bbb6-YOUR-INSTANCEID-HERE"
  },
  "bucket_information": {
    "base_path": "CLMS/bio-geophysical/vegetation_properties/fapar_global_300m_10daily_v2_RT0"
  }
}
```

And automatically updates these files:

### Automated Updates

1. **dataSourceConstants.js** - Adds constant from `collection_name`
2. **default_themes.js** - Adds theme entry with `configuration_id` to DEFAULT_THEME content array
3. **CLMSBands.js** - Adds bands from `content_information.bands`
4. **CLMSTooltip.js** - Adds markdown function with `description` (only) before the big export
5. **layers_metadata.js** - Adds layer entries from `content_information.layers`
6. **credits.js** - Adds credits entry for the collection
7. **sentinelhubLeafletLayer.jsx** - Adds case to `createCustomLayer` switch
8. **dataSourceHandlers.jsx** - Updates `datasourceForDatasetId` function and `datasetLabels` constant
9. **CLMSDataSourceHandler.jsx** - Updates all required sections
   - Imports
   - `getDatasetSearchLabels()` using `collection_information.name`
   - `urls` object
   - `leafletZoomConfig` object
   - `MIN_MAX_ZOOM` object
   - `KNOWN_COLLECTIONS` with `collection_id`
   - `KNOWN_COLLECTIONS_LOCATIONS`
   - `MIN_MAX_DATES` parsed from `date_range`
   - `TEMPORAL_RESOLUTION`
   - `getBands()` switch
   - `getDescriptionForDataset()` switch
10. **Metadata Cache** - Automatically runs `update-metadata-cache-bundle.js` with the configuration ID
11. **Previews** - Automatically generates preview images with `update-previews.js`
12. **Code Formatting** - Runs `npm run prettier` to format all modified files

### Manual Steps Required

After running the script, you need to manually:

1. **CLMSCollectionSelection.utils.js** - Add to `CLMS_OPTIONS` array

   - Navigate using the `hierarchy` array
   - Add entry: `{ label: 'technicalName', id: CONSTANT }`
   - Note: `technicalName` is extracted from the last part of `bucket_information.base_path`

2. **collectionFormConfig.js** - Add to `recursiveCollectionCLMS` array

   - Follow the same `hierarchy` structure
   - Add productType configuration

3. **ODataHelpers.js** - Add connection between Visualize and Search tabs
   - Add mapping for the new collection to enable tab integration

## How It Works

### 0. Safety Check

Before making any changes, the script verifies the collection doesn't already exist:

- Checks if `collection_id` exists in `CLMSDataSourceHandler.jsx`
- Checks if `configuration_id` exists in DEFAULT_THEME content array in `default_themes.js`
- Aborts if either is found to prevent duplicate entries

### 1. Constant Generation

Converts `collection_name` to constant format:

- `fapar_global_300m_10daily_v2_RT0` → `COPERNICUS_CLMS_FAPAR_GLOBAL_300M_10DAILY_V2_RT0`

### 2. Date Parsing

Parses `date_range` field:

- `"2014-present"` → minDate: `2014-01-01`, maxDate: `now` (moment.utc())
- `"2020-2023"` → minDate: `2020-01-01`, maxDate: `2023-12-31`

### 3. Band Extraction

Takes band names from `content_information.bands`:

- Creates constant: `COPERNICUS_CLMS_FAPAR_GLOBAL_300M_10DAILY_V2_RT0_BANDS`
- Sets `getDescription` to return empty string (as requested)

### 4. Layer Creation

For each layer in `content_information.layers`:

- Uses `name` as `layerId`
- Uses generated constant as `datasourceId`
- Uses `description` from layer object

### 5. Markdown Function

Generates function name from constant:

- `COPERNICUS_CLMS_FAPAR_GLOBAL_300M_10DAILY_V2_RT0` → `getCopernicusClmsFaparGlobal300M10DailyV2Rt0Markdown`
- Function returns `collection_information.description`

### 6. Hierarchy Navigation

Uses `hierarchy` array to determine placement:

- Example: `["Bio-geophysical Parameters", "Vegetation", "Vegetation Properties"]`
- Script shows where to add in nested structures

### 7. Technical Name Extraction

Extracts `technicalName` from `bucket_information.base_path`:

- Takes the last segment of the path
- Example: `"CLMS/bio-geophysical/vegetation_properties/lai_global_300m_10daily_v2"` → `"lai_global_300m_10daily_v2"`
- Falls back to `registration.collection_name` if base_path is not available

## Advantages Over Old Script

✅ Single command - just provide parameter file
✅ No manual data entry needed
✅ Standardized format from onboarding repo
✅ Automatic hierarchy extraction
✅ Layer descriptions included
✅ Consistent naming conventions

## Troubleshooting

**"Cannot find parameter file"**

- Check file path is correct
- File must be valid JSON

**"Missing collection_information"**

- Parameter file must follow standard structure
- Verify all required fields exist

**Manual steps unclear\*\***

- Check console output for specific locations
- Use hierarchy array to navigate nested structures
- Follow existing patterns in those files

## Next Steps After Running

1. **Review Changes**

   ```bash
   git diff
   ```

2. **Complete Manual Steps**

   - CLMSCollectionSelection.utils.js (CLMS_OPTIONS)
   - collectionFormConfig.js (recursiveCollectionCLMS)
   - ODataHelpers.js (Visualize → Search tab integration)

3. **Add Translations** (if needed)

   - Labels use `t` template tag
   - Run translation extraction

4. **Test Thoroughly**
   - Start dev server
   - Navigate to new collection
   - Verify all layers load
   - Check date filtering
   - Test band selection

## Multiple Collections

To add multiple related collections (e.g., RT variants), run the script multiple times with different parameter files:

```bash
# Download multiple parameter files from the collection-parameters directory
# Then process them all
for file in fapar_*.json; do
  node scripts/add-clms-collection-from-params.js --params "$file"
  echo "Completed: $file"
done
```

Each collection will be added independently with all necessary configurations.

## Tips

- **Parameter file location:** Always get the latest parameter files from the [cdse-clms-onboarding GitLab repository](https://gitext.sinergise.com/projects/CDSE/repos/cdse-clms-onboarding/browse)
- **Version control:** Commit changes after each collection addition to track what was modified
- **Testing:** Test each collection in the browser before adding the next one
- **Manual steps:** Don't forget to complete the two manual steps (CLMS_OPTIONS and recursiveCollectionCLMS) - they're required for the collection to appear in the UI
  - Run translation extraction

5. **Test Thoroughly**
   - Start dev server
   - Navigate to new collection
   - Verify all layers load
   - Check date filtering
   - Test band selection

## Multiple Collections

To add multiple related collections (e.g., RT variants), run the script multiple times with different parameter files:

```bash
# Download multiple parameter files from the collection-parameters directory
# Then process them all
for file in fapar_*.json; do
  node scripts/add-clms-collection-from-params.js --params "$file"
  echo "Completed: $file"
done
```

Each collection will be added independently with all necessary configurations.

## Tips

- **Parameter file location:** Always get the latest parameter files from the [collection-parameters directory](https://gitext.sinergise.com/sentinel-projects/cdse/cdse-clms-onboarding/-/tree/main/data/clms/collection-parameters)
- **Version control:** Commit changes after each collection addition to track what was modified
- **Testing:** Test each collection in the browser before adding the next one
- **Manual steps:** Don't forget to complete the three manual steps (CLMS_OPTIONS, recursiveCollectionCLMS, and ODataHelpers.js) - they're required for the collection to work properly in the UI
- **Duplicate check:** The script automatically checks if a collection already exists and will abort to prevent duplicates

```

```
