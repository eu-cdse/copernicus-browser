#!/usr/bin/env node

/**
 * Script to automate adding new collections to the Copernicus Browser codebase from parameter files
 *
 * Usage:
 *   node scripts/add-collection-new.js --params collection-params.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Parse collection parameters from the standard format
function parseCollectionParams(params) {
  const collectionInfo = params.collection_information;
  const contentInfo = params.content_information;
  const registration = params.registration;

  // Convert collection_name to constant format
  const constant = 'COPERNICUS_CLMS_' + registration.collection_name.toUpperCase();

  // Parse date_range "2014-present" -> minDate: 2014-01-01, maxDate: now
  const dateRange = collectionInfo.date_range || '';
  const [startYear, endYear] = dateRange.split('-');
  const minDate = `${startYear}-01-01`;
  const maxDate = endYear.trim() === 'present' ? 'now' : `${endYear}-12-31`;

  // Extract bands (name only, description empty for getDescription)
  const bands = contentInfo.bands
    ? contentInfo.bands.map((b) => ({
        name: b.name,
        description: '',
      }))
    : [];

  // Extract layers
  const layers = contentInfo.layers || [];

  // Build hierarchy for CLMS options
  const hierarchy = collectionInfo.hierarchy || [];

  // Extract technical name from collectionInfo
  const technicalName = collectionInfo.technicalName || registration.collection_name;
  const normalizedTechnicalName = technicalName.replace(/_RT\d+$/i, '');

  // Parse temporal resolution from technicalName
  let temporalResolution = 1;
  let temporalUnit = 'day';

  if (technicalName.includes('10daily')) {
    temporalResolution = 10;
    temporalUnit = 'day';
  } else if (technicalName.includes('daily')) {
    temporalResolution = 0;
    temporalUnit = 'day';
  } else if (technicalName.includes('monthly')) {
    temporalResolution = 1;
    temporalUnit = 'month';
  } else if (technicalName.includes('yearly')) {
    temporalResolution = 1;
    temporalUnit = 'day';
  }

  return {
    constant,
    label: collectionInfo.name,
    configId: registration.configuration_id,
    collectionId: registration.collection_id,
    minDate,
    maxDate,
    temporalResolution,
    temporalUnit,
    minZoom: 2,
    maxZoom: 25,
    location: 'cdse',
    bands,
    layers,
    hierarchy,
    description: collectionInfo.description || '',
    technicalName,
    normalizedTechnicalName,
    officialDocs: collectionInfo.official_docs || '',
  };
}

function printHelp() {
  console.log(`
Add new CLMS collection from parameter file

Usage:
  node scripts/add-clms-collection-from-params.js --params collection-params.json

Where collection-params.json is from cdse-clms-onboarding repo.
`);
}

function checkCollectionExists(config) {
  // Check if collectionId exists in CLMSDataSourceHandler.jsx
  const clmsHandlerPath = path.join(
    PROJECT_ROOT,
    'src/Tools/SearchPanel/dataSourceHandlers/CLMSDataSourceHandler.jsx',
  );
  const clmsHandlerContent = fs.readFileSync(clmsHandlerPath, 'utf8');

  if (clmsHandlerContent.includes(`'${config.collectionId}'`)) {
    console.error(
      `\n❌ Error: Collection ID ${config.collectionId} already exists in CLMSDataSourceHandler.jsx!`,
    );
    console.error('   Aborting to prevent duplicate entries.\n');
    return true;
  }

  // Check if configId exists in DEFAULT_THEME content array in default_themes.js
  const themesPath = path.join(PROJECT_ROOT, 'src/assets/default_themes.js');
  const themesContent = fs.readFileSync(themesPath, 'utf8');

  // Find DEFAULT_THEME object and check its content array
  const defaultThemeMatch = themesContent.match(
    /export const DEFAULT_THEMES\s*=\s*\[[\s\S]+?id:\s*['"]DEFAULT-THEME['"][\s\S]+?content:\s*\[[\s\S]+?\]/,
  );
  if (defaultThemeMatch && defaultThemeMatch[0].includes(`/${config.configId}`)) {
    console.error(`\n❌ Error: Configuration ID ${config.configId} already exists in DEFAULT_THEME content!`);
    console.error('   Aborting to prevent duplicate entries.\n');
    return true;
  }

  return false;
}

function generateChangesSummary(config) {
  console.log('\n=== Changes Summary ===\n');
  console.log(`Collection: ${config.constant}`);
  console.log(`Label: ${config.label}`);
  console.log(`Config ID: ${config.configId}`);
  console.log(`Collection ID: ${config.collectionId}`);
  console.log(`Date Range: ${config.minDate} to ${config.maxDate}`);
  console.log(`Bands: ${config.bands.length} bands`);
  console.log(`Layers: ${config.layers.length} layers`);
  console.log(`Hierarchy: ${config.hierarchy.join(' > ')}`);
  console.log('\nFiles to be modified:');
  console.log('  - src/Tools/SearchPanel/dataSourceHandlers/dataSourceConstants.js');
  console.log('  - src/Tools/SearchPanel/dataSourceHandlers/CLMSDataSourceHandler.jsx');
  console.log('  - src/Tools/SearchPanel/dataSourceHandlers/datasourceAssets/CLMSBands.js');
  console.log(
    '  - src/Tools/SearchPanel/dataSourceHandlers/DatasourceRenderingComponents/dataSourceTooltips/CLMSTooltip.js',
  );
  console.log(
    '  - src/Tools/SearchPanel/dataSourceHandlers/DatasourceRenderingComponents/dataSourceTooltips/credits.js',
  );
  console.log('  - src/assets/default_themes.js');
  console.log('  - src/assets/layers_metadata.js');
  console.log('  - src/Tools/VisualizationPanel/CollectionSelection/CLMSCollectionSelection.utils.js');
  console.log('  - src/Tools/VisualizationPanel/CollectionSelection/AdvancedSearch/collectionFormConfig.js');
  console.log('  - src/Map/plugins/sentinelhubLeafletLayer.jsx');
  console.log('  - src/Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers.jsx');
  console.log('');
}

// 1. Update dataSourceConstants.js
function updateDataSourceConstants(config) {
  const filePath = path.join(PROJECT_ROOT, 'src/Tools/SearchPanel/dataSourceHandlers/dataSourceConstants.js');
  let content = fs.readFileSync(filePath, 'utf8');

  // Find last COPERNICUS_CLMS constant and add after it
  const regex = /(COPERNICUS_CLMS_[A-Z0-9_]+\s*=\s*'[^']+')(;)/;
  const matches = [...content.matchAll(new RegExp(regex, 'g'))];
  const lastMatch = matches[matches.length - 1];

  if (lastMatch) {
    const insertPos = lastMatch.index + lastMatch[0].length - 1; // Before the semicolon
    const newConst = `,\n  ${config.constant} = '${config.constant}'`;
    content = content.substring(0, insertPos) + newConst + content.substring(insertPos);
  }

  fs.writeFileSync(filePath, content);
  console.log('✓ Updated dataSourceConstants.js');
}

// 2. Update default_themes.js
function updateDefaultThemes(config) {
  const filePath = path.join(PROJECT_ROOT, 'src/assets/default_themes.js');
  let content = fs.readFileSync(filePath, 'utf8');

  // Find DEFAULT_THEME object specifically and add to its content array
  const defaultThemeMatch = content.match(
    /export const DEFAULT_THEMES\s*=\s*\[[\s\S]+?id:\s*['"]DEFAULT-THEME['"][\s\S]+?content:\s*\[/,
  );
  if (defaultThemeMatch) {
    let bracketDepth = 0;
    let searchStart = defaultThemeMatch.index + defaultThemeMatch[0].length;

    for (let i = searchStart; i < content.length; i++) {
      if (content[i] === '[') {
        bracketDepth++;
      }

      if (content[i] === ']') {
        if (bracketDepth === 0) {
          // Find last '},' before this closing bracket
          const beforeClosing = content.substring(searchStart, i);
          const lastEntry = beforeClosing.lastIndexOf('},');
          if (lastEntry !== -1) {
            const insertPos = searchStart + lastEntry + 2;
            const themeName = config.technicalName.toLowerCase();
            const newEntry = `\n      {\n        name: '${themeName}',\n        url: \`\${\n          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL\n        }/ogc/wms/${config.configId}\`,\n      },`;
            content = content.substring(0, insertPos) + newEntry + content.substring(insertPos);
            break;
          }
        }
        bracketDepth--;
      }
    }
  }

  fs.writeFileSync(filePath, content);
  console.log('✓ Updated default_themes.js');
}

// 3. Update CLMSBands.js
function updateCLMSBands(config) {
  const filePath = path.join(
    PROJECT_ROOT,
    'src/Tools/SearchPanel/dataSourceHandlers/datasourceAssets/CLMSBands.js',
  );
  let content = fs.readFileSync(filePath, 'utf8');

  const bandsConstant = config.constant + '_BANDS';
  const bandsExport = `\nexport const ${bandsConstant} = [\n${config.bands
    .map((band) => `  {\n    name: '${band.name}',\n    getDescription: () => \`${band.description}\`,\n  }`)
    .join(',\n')},\n];\n`;

  content = content.trimEnd() + bandsExport;
  fs.writeFileSync(filePath, content);
  console.log('✓ Updated CLMSBands.js');

  return bandsConstant;
}

// 4. Update CLMSTooltip.js
function updateCLMSTooltip(config) {
  const filePath = path.join(
    PROJECT_ROOT,
    'src/Tools/SearchPanel/dataSourceHandlers/DatasourceRenderingComponents/dataSourceTooltips/CLMSTooltip.js',
  );
  let content = fs.readFileSync(filePath, 'utf8');

  // Generate function name from constant
  const funcName =
    'get' +
    config.constant
      .split('_')
      .map((part, i) => {
        if (i === 0 || i === 1) {
          return part.charAt(0) + part.slice(1).toLowerCase(); // Copernicus Clms
        }
        return part.charAt(0) + part.slice(1).toLowerCase();
      })
      .join('')
      .replace(/V\d+/, (m) => m.toUpperCase())
      .replace(/Rt\d+/, (m) => m.toUpperCase()) +
    'Markdown';

  // Insert before the big export statement at the end
  const exportMatch = content.match(/export\s+\{[^}]*\};?\s*$/s);
  if (exportMatch) {
    const insertPos = exportMatch.index;
    const newFunction = `const ${funcName} = () => t\`\n  ${config.description} More information [here](${
      config.officialDocs
    }).\`;\n\nconst ${funcName
      .replace('get', '')
      .replace('Markdown', 'Tooltip')} = () =>\n  DataSourceTooltip({\n    source: ${funcName}(),\n  });\n\n`;

    // Also add to export list
    const exportContent = exportMatch[0];
    const closingBrace = exportContent.lastIndexOf('}');
    const modifiedExport =
      exportContent.substring(0, closingBrace) +
      `  ${funcName},\n  ${funcName.replace('get', '').replace('Markdown', 'Tooltip')},\n` +
      exportContent.substring(closingBrace);

    content =
      content.substring(0, insertPos) +
      newFunction +
      content
        .substring(insertPos, exportMatch.index + exportMatch[0].length)
        .replace(exportMatch[0], modifiedExport) +
      content.substring(exportMatch.index + exportMatch[0].length);
  }

  fs.writeFileSync(filePath, content);
  console.log('✓ Updated CLMSTooltip.js');

  return funcName;
}

// 5. Update layers_metadata.js
function updateLayersMetadata(config) {
  const filePath = path.join(PROJECT_ROOT, 'src/assets/layers_metadata.js');
  let content = fs.readFileSync(filePath, 'utf8');

  // Add constant to imports - simple approach: find the line with the path and add before it
  if (!content.includes(config.constant)) {
    const importPathLine = "'../Tools/SearchPanel/dataSourceHandlers/dataSourceConstants";
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(importPathLine)) {
        // Insert the constant on the line before this
        lines.splice(i, 0, `  ${config.constant},`);
        content = lines.join('\n');
        break;
      }
    }
  }

  // Add layer entries at the end of PREDEFINED_LAYERS_METADATA array
  const layersArrayMatch = content.match(/export const PREDEFINED_LAYERS_METADATA\s*=\s*\[/);
  if (layersArrayMatch) {
    // Find the closing bracket
    let bracketDepth = 0;
    let searchStart = layersArrayMatch.index + layersArrayMatch[0].length;

    for (let i = searchStart; i < content.length; i++) {
      if (content[i] === '[') {
        bracketDepth++;
      }

      if (content[i] === ']') {
        if (bracketDepth === 0) {
          const insertPos = i;
          const layerEntries = config.layers
            .filter((layer) => layer.evalscript && layer.colorRamp)
            .map((layer) => {
              return `  {\n    match: [{ datasourceId: ${config.constant}, layerId: '${layer.name}' }],\n    description: () => t\`${layer.longDescription}\`,\n  }`;
            })
            .join(',\n');

          if (layerEntries) {
            content = content.substring(0, insertPos) + layerEntries + ',\n' + content.substring(insertPos);
          }
          break;
        }
        bracketDepth--;
      }
    }
  }

  fs.writeFileSync(filePath, content);
  console.log('✓ Updated layers_metadata.js');
}

// 6. Update CLMSCollectionSelection.utils.js
function updateCLMSCollectionSelection(config) {
  console.log('⚠️  Manual step required: Add to CLMS_OPTIONS in CLMSCollectionSelection.utils.js');
  console.log(`   Hierarchy: ${config.hierarchy.join(' > ')}`);
  console.log(`   Entry: { label: '${config.technicalName}', id: ${config.constant} }`);
}

// 7. Update collectionFormConfig.js
function updateCollectionFormConfig(config) {
  console.log('⚠️  Manual step required: Add to recursiveCollectionCLMS in collectionFormConfig.js');
  console.log(`   Hierarchy: ${config.hierarchy.join(' > ')}`);
  console.log(`   productType: '${config.technicalName}'`);
}

// 7b. Update credits.js
function updateCredits(config) {
  const filePath = path.join(
    PROJECT_ROOT,
    'src/Tools/SearchPanel/dataSourceHandlers/DatasourceRenderingComponents/dataSourceTooltips/credits.js',
  );
  let content = fs.readFileSync(filePath, 'utf8');

  // Add constant to imports from dataSourceConstants
  const importMatch = content.match(/import\s+\{[^}]+\}\s+from\s+['"]\.\.\/\.\.\/dataSourceConstants['"]/s);
  if (importMatch) {
    const importContent = importMatch[0];
    if (!importContent.includes(config.constant)) {
      const lastComma = importContent.lastIndexOf(',');
      if (lastComma !== -1) {
        const newImport =
          importContent.substring(0, lastComma + 1) +
          `\n  ${config.constant},` +
          importContent.substring(lastComma + 1);
        content = content.replace(importMatch[0], newImport);
      }
    }
  }

  // Add entry to credits config at the end
  const configMatch = content.match(/\};\s*$/);
  if (configMatch) {
    const insertPos = configMatch.index;
    const newEntry = `  [${config.constant}]: [\n    {\n      ...copernicus,\n      link: 'https://land.copernicus.eu/en',\n    },\n  ],\n`;
    content = content.substring(0, insertPos) + newEntry + content.substring(insertPos);
  }

  fs.writeFileSync(filePath, content);
  console.log('✓ Updated credits.js');
}

// 7c. Update sentinelhubLeafletLayer.jsx
function updateSentinelhubLeafletLayer(config) {
  const filePath = path.join(PROJECT_ROOT, 'src/Map/plugins/sentinelhubLeafletLayer.jsx');
  let content = fs.readFileSync(filePath, 'utf8');

  // Add constant to imports
  const importMatch = content.match(
    /import\s+\{[^}]+\}\s+from\s+['"]\.\.\/\.\.\/Tools\/SearchPanel\/dataSourceHandlers\/dataSourceConstants['"]\s*;?/s,
  );
  if (importMatch) {
    const importContent = importMatch[0];
    if (!importContent.includes(config.constant)) {
      const lastComma = importContent.lastIndexOf(',');
      if (lastComma !== -1) {
        const newImport =
          importContent.substring(0, lastComma + 1) +
          `\n  ${config.constant},` +
          importContent.substring(lastComma + 1);
        content = content.replace(importMatch[0], newImport);
      }
    }
  }

  // Add case to createCustomLayer switch - just add case statement before existing one
  const lastClmsCaseMatch = content.match(/case COPERNICUS_CLMS_FAPAR_300M_10DAILY_V2_RT6:/);
  if (lastClmsCaseMatch) {
    const insertPos = lastClmsCaseMatch.index;
    const newCase = `case ${config.constant}:\n      `;
    content = content.substring(0, insertPos) + newCase + content.substring(insertPos);
  }

  fs.writeFileSync(filePath, content);
  console.log('✓ Updated sentinelhubLeafletLayer.jsx');
}

// 7d. Update dataSourceHandlers.jsx
function updateDataSourceHandlers(config) {
  const filePath = path.join(PROJECT_ROOT, 'src/Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers.jsx');
  let content = fs.readFileSync(filePath, 'utf8');

  // Add constant to imports - sorted alphabetically
  const importMatch = content.match(/import\s+\{([^}]+)\}\s+from\s+['"]\.\/dataSourceConstants['"]\s*;?/s);
  if (importMatch) {
    const importContent = importMatch[0];
    const importsListStr = importMatch[1];

    if (!importsListStr.includes(config.constant)) {
      // Extract all imports, sort them, and add the new one
      const imports = importsListStr
        .split(',')
        .map((imp) => imp.trim())
        .filter((imp) => imp.length > 0);

      imports.push(config.constant);
      imports.sort();

      // Reconstruct the import statement
      const newImportsList = imports.map((imp) => `  ${imp}`).join(',\n');
      const newImport = importContent.replace(/import\s+\{[^}]+\}/s, `import {\n${newImportsList},\n}`);

      content = content.replace(importMatch[0], newImport);
    }
  }

  // Add case to datasourceForDatasetId function - find last CLMS case before "return DATASOURCES.CLMS"
  const datasourceClmsMatch = content.match(
    /(case COPERNICUS_CLMS_[^:]+:\s*\n(?:\s*case COPERNICUS_CLMS_[^:]+:\s*\n)*)\s*return DATASOURCES\.CLMS;/,
  );
  if (datasourceClmsMatch) {
    const newCase = `    case ${config.constant}:\n`;
    content = content.replace(
      datasourceClmsMatch[0],
      datasourceClmsMatch[1] + newCase + '      return DATASOURCES.CLMS;',
    );
  }

  // Add to datasetLabels object - find last CLMS label
  const lastClmsLabelMatch = content.match(/\[COPERNICUS_CLMS_LWQ_NRT_GLOBAL_100M_10DAILY_V2\]:\s*t`[^`]+`,/);
  if (lastClmsLabelMatch) {
    const insertPos = lastClmsLabelMatch.index + lastClmsLabelMatch[0].length;
    const newLabel = `\n  [${config.constant}]: t\`${config.label}\`,`;
    content = content.substring(0, insertPos) + newLabel + content.substring(insertPos);
  }

  fs.writeFileSync(filePath, content);
  console.log('✓ Updated dataSourceHandlers.jsx');
}

// 8. Update CLMSDataSourceHandler.jsx - comprehensive update
function updateCLMSDataSourceHandler(config, bandsConstant, markdownFunc) {
  const filePath = path.join(
    PROJECT_ROOT,
    'src/Tools/SearchPanel/dataSourceHandlers/CLMSDataSourceHandler.jsx',
  );
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Add to imports from dataSourceConstants
  let importMatch = content.match(/import\s+\{[^}]+\}\s+from\s+['"]\.\/dataSourceConstants['"]/s);
  if (importMatch) {
    const importContent = importMatch[0];
    const lastComma = importContent.lastIndexOf(',');
    if (lastComma !== -1) {
      const newImport =
        importContent.substring(0, lastComma + 1) +
        `\n  ${config.constant},` +
        importContent.substring(lastComma + 1);
      content = content.replace(importMatch[0], newImport);
    }
  }

  // 2. Add to imports from CLMSTooltip
  importMatch = content.match(
    /import\s+\{[^}]+\}\s+from\s+['"]\.\/DatasourceRenderingComponents\/dataSourceTooltips\/CLMSTooltip['"]/s,
  );
  if (importMatch) {
    const importContent = importMatch[0];
    const lastComma = importContent.lastIndexOf(',');
    if (lastComma !== -1) {
      const newImport =
        importContent.substring(0, lastComma + 1) +
        `\n  ${markdownFunc},` +
        importContent.substring(lastComma + 1);
      content = content.replace(importMatch[0], newImport);
    }
  }

  // 3. Add to imports from CLMSBands
  importMatch = content.match(/import\s+\{[^}]+\}\s+from\s+['"]\.\/datasourceAssets\/CLMSBands['"]/s);
  if (importMatch) {
    const importContent = importMatch[0];
    const lastComma = importContent.lastIndexOf(',');
    if (lastComma !== -1) {
      const newImport =
        importContent.substring(0, lastComma + 1) +
        `\n  ${bandsConstant},` +
        importContent.substring(lastComma + 1);
      content = content.replace(importMatch[0], newImport);
    }
  }

  // 4. Add to getDatasetSearchLabels
  const searchLabelsMatch = content.match(/getDatasetSearchLabels\s*=\s*\(\)\s*=>\s*\(\{[\s\S]+?\}\);/);
  if (searchLabelsMatch) {
    const labelsContent = searchLabelsMatch[0];
    const lastEntry = labelsContent.lastIndexOf('`');
    const insertPos = searchLabelsMatch.index + lastEntry + 1;
    const newLabel = `,\n    [${config.constant}]: t\`${config.label}\``;
    content = content.substring(0, insertPos) + newLabel + content.substring(insertPos);
  }

  // 5. Add to urls object
  const urlsMatch = content.match(/urls\s*=\s*\{[\s\S]+?\n {2}\};/);
  if (urlsMatch) {
    const urlsContent = urlsMatch[0];
    const lastEntry = urlsContent.lastIndexOf('],');
    const insertPos = urlsMatch.index + lastEntry + 2;
    const newUrl = `\n    [${config.constant}]: [],`;
    content = content.substring(0, insertPos) + newUrl + content.substring(insertPos);
  }

  // 6. Add to leafletZoomConfig
  const leafletZoomMatch = content.match(/leafletZoomConfig\s*=\s*\{[\s\S]+?\n {2}\};/);
  if (leafletZoomMatch) {
    const insertPos = leafletZoomMatch.index + leafletZoomMatch[0].length - '\n  };'.length;
    const newZoom = `    [${config.constant}]: {\n      min: ${config.minZoom},\n      max: ${config.maxZoom},\n    },\n`;
    content = content.substring(0, insertPos) + newZoom + content.substring(insertPos);
  }

  // 6b. Add to MIN_MAX_ZOOM
  const zoomMatch = content.match(/MIN_MAX_ZOOM\s*=\s*\{[\s\S]+?\n {2}\};\s*\n\s*KNOWN_COLLECTIONS/);
  if (zoomMatch) {
    const insertPos = zoomMatch.index + zoomMatch[0].length - '\n  };\n\n  KNOWN_COLLECTIONS'.length;
    const newZoom = `    [${config.constant}]: { min: ${config.minZoom}, max: ${config.maxZoom} },\n`;
    content = content.substring(0, insertPos) + newZoom + content.substring(insertPos);
  }

  // 7. Add to KNOWN_COLLECTIONS
  const collectionsMatch = content.match(/KNOWN_COLLECTIONS\s*=\s*\{[\s\S]+?\n {2}\};/);
  if (collectionsMatch) {
    const collectionsContent = collectionsMatch[0];
    const lastEntry = collectionsContent.lastIndexOf('],');
    const insertPos = collectionsMatch.index + lastEntry + 2;
    const newCollection = `\n    [${config.constant}]: ['${config.collectionId}'],`;
    content = content.substring(0, insertPos) + newCollection + content.substring(insertPos);
  }

  // 8. Add to KNOWN_COLLECTIONS_LOCATIONS
  const locationsMatch = content.match(/KNOWN_COLLECTIONS_LOCATIONS\s*=\s*\{[\s\S]+?\n {2}\};/);
  if (locationsMatch) {
    const locationsContent = locationsMatch[0];
    const lastEntry = locationsContent.lastIndexOf(',');
    const insertPos = locationsMatch.index + lastEntry + 1;
    const newLocation = `\n    [${config.constant}]: LocationIdSHv3.${config.location},`;
    content = content.substring(0, insertPos) + newLocation + content.substring(insertPos);
  }

  // 9. Add to MIN_MAX_DATES
  const datesMatch = content.match(/MIN_MAX_DATES\s*=\s*\{[\s\S]+?\n {2}\};/);
  if (datesMatch) {
    const datesContent = datesMatch[0];
    const lastEntry = datesContent.lastIndexOf('},');
    const insertPos = datesMatch.index + lastEntry + 2;
    const maxDateValue = config.maxDate === 'now' ? 'moment.utc()' : `moment.utc('${config.maxDate}')`;
    const newDate = `\n    [${config.constant}]: {\n      minDate: moment.utc('${config.minDate}'),\n      maxDate: ${maxDateValue},\n    },`;
    content = content.substring(0, insertPos) + newDate + content.substring(insertPos);
  }

  // 10. Add to TEMPORAL_RESOLUTION
  const temporalMatch = content.match(/TEMPORAL_RESOLUTION\s*=\s*\{[\s\S]+?\n {2}\};/);
  if (temporalMatch) {
    const temporalContent = temporalMatch[0];
    const lastEntry = temporalContent.lastIndexOf('},');
    const insertPos = temporalMatch.index + lastEntry + 2;
    const newTemporal = `\n    [${config.constant}]: {\n      amount: ${config.temporalResolution},\n      unit: '${config.temporalUnit}',\n    },`;
    content = content.substring(0, insertPos) + newTemporal + content.substring(insertPos);
  }

  // 11. Add to getBands() switch
  const getBandsMatch = content.match(
    /getBands[\s\S]+?switch\s*\(datasetId\)[\s\S]+?default:\s*return null;\s*\n\s*\}/,
  );
  if (getBandsMatch) {
    const switchContent = getBandsMatch[0];
    const defaultIndex = switchContent.lastIndexOf('default:');
    const insertPos = getBandsMatch.index + defaultIndex;
    const newCase = `case ${config.constant}:\n        return ${bandsConstant};\n      `;
    content = content.substring(0, insertPos) + newCase + content.substring(insertPos);
  }

  // 12. Add to getDescriptionForDataset() switch
  const getDescMatch = content.match(
    /getDescriptionForDataset\s*=\s*\(datasetId\)\s*=>\s*\{[\s\S]+?switch\s*\(datasetId\)[\s\S]+?default:\s*return null;\s*\n\s*\}/,
  );
  if (getDescMatch) {
    const switchContent = getDescMatch[0];
    const defaultIndex = switchContent.lastIndexOf('default:');
    const insertPos = getDescMatch.index + defaultIndex;
    const newCase = `case ${config.constant}:\n        return ${markdownFunc}();\n      `;
    content = content.substring(0, insertPos) + newCase + content.substring(insertPos);
  }

  fs.writeFileSync(filePath, content);
  console.log('✓ Updated CLMSDataSourceHandler.jsx');
}

// 9. Generate previews for the new collection
function generatePreviews(config) {
  console.log('\n🖼️  Generating previews...');

  // Create temporary CSV file with the configuration ID
  const tempCsvPath = path.join(PROJECT_ROOT, 'scripts', `.temp_preview_${Date.now()}.csv`);

  try {
    // CSV format: header INSTANCE followed by configuration ID
    fs.writeFileSync(tempCsvPath, `INSTANCE\n${config.configId}\n`, 'utf8');
    console.log(`   Created temporary CSV: ${path.basename(tempCsvPath)}`);

    // Run the update-previews.js script
    console.log('   Running update-previews.js...');
    const scriptPath = path.join(PROJECT_ROOT, 'scripts', 'update-previews.js');
    execSync(`node "${scriptPath}" "${tempCsvPath}"`, {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
    });

    console.log('✓ Previews generated successfully');
  } catch (error) {
    console.error('⚠️  Warning: Preview generation failed:', error.message);
    console.log('   You can manually generate previews later with:');
    console.log(`   node scripts/update-previews.js`);
  } finally {
    // Cleanup: delete temporary CSV file
    if (fs.existsSync(tempCsvPath)) {
      fs.unlinkSync(tempCsvPath);
      console.log('   Cleaned up temporary files');
    }
  }
}

// 10. Update metadata cache for the new collection
function updateMetadataCache(config) {
  console.log('\n📦 Updating metadata cache...');

  // Create temporary CSV file with the configuration ID
  const tempCsvPath = path.join(PROJECT_ROOT, 'scripts', `.temp_metadata_${Date.now()}.csv`);

  try {
    // CSV format: header INSTANCE followed by configuration ID
    fs.writeFileSync(tempCsvPath, `INSTANCE\n${config.configId}\n`, 'utf8');
    console.log(`   Created temporary CSV: ${path.basename(tempCsvPath)}`);

    // Run the update-metadata-cache-bundle.js script
    console.log('   Running update-metadata-cache-bundle.js...');
    const scriptPath = path.join(PROJECT_ROOT, 'scripts', 'update-metadata-cache-bundle.js');
    execSync(`node "${scriptPath}" "${tempCsvPath}"`, {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
    });

    console.log('✓ Metadata cache updated successfully');
  } catch (error) {
    console.error('⚠️  Warning: Metadata cache update failed:', error.message);
    console.log('   You can manually update metadata cache later with:');
    console.log(`   node scripts/update-metadata-cache-bundle.js`);
  } finally {
    // Cleanup: delete temporary CSV file
    if (fs.existsSync(tempCsvPath)) {
      fs.unlinkSync(tempCsvPath);
      console.log('   Cleaned up temporary files');
    }
  }
}

// Main execution
async function main() {
  try {
    const args = process.argv.slice(2);

    if (args.includes('--help') || args.length === 0) {
      printHelp();
      process.exit(0);
    }

    const paramsIndex = args.indexOf('--params');
    if (paramsIndex === -1) {
      console.error('Error: --params argument is required');
      process.exit(1);
    }

    const paramsFile = args[paramsIndex + 1];
    const paramsData = JSON.parse(fs.readFileSync(paramsFile, 'utf8'));
    const config = parseCollectionParams(paramsData);

    // Check if collection already exists
    if (checkCollectionExists(config)) {
      process.exit(1);
    }

    generateChangesSummary(config);

    // Ask for confirmation
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const answer = await new Promise((resolve) => {
      rl.question('Proceed with these changes? (yes/no): ', resolve);
    });
    rl.close();

    if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
      console.log('Aborted.');
      process.exit(0);
    }

    console.log('\nApplying changes...\n');

    updateDataSourceConstants(config);
    updateDefaultThemes(config);
    updateMetadataCache(config);
    const bandsConstant = updateCLMSBands(config);
    const markdownFunc = updateCLMSTooltip(config);
    updateLayersMetadata(config);
    updateCLMSCollectionSelection(config);
    updateCollectionFormConfig(config);
    updateCredits(config);
    updateSentinelhubLeafletLayer(config);
    updateDataSourceHandlers(config);
    updateCLMSDataSourceHandler(config, bandsConstant, markdownFunc);
    generatePreviews(config);

    // Run prettier to format all changed files
    console.log('\n🎨 Running prettier...');
    try {
      execSync('npm run prettier', {
        cwd: PROJECT_ROOT,
        stdio: 'ignore',
      });
      console.log('✓ Code formatted successfully');
    } catch (error) {
      console.error('⚠️  Warning: Prettier formatting failed:', error.message);
    }

    console.log('\n✅ All automated changes applied successfully!');
    console.log('\n⚠️  Manual steps still required:');
    console.log('  1. Add entry to CLMS_OPTIONS in CLMSCollectionSelection.utils.js');
    console.log(`     - Navigate hierarchy: ${config.hierarchy.join(' > ')}`);
    console.log(`     - Add: { label: '${config.technicalName}', id: ${config.constant} }`);
    console.log('  2. Add entry to recursiveCollectionCLMS in collectionFormConfig.js');
    console.log(`     - Follow hierarchy: ${config.hierarchy.join(' > ')}`);
    console.log(`     - productType: '${config.normalizedTechnicalName}'`);
    console.log('  3. Add connection in ODataHelpers.js (Visualize → Search tab integration)');
    console.log('  4. Review all changes: git diff');
    console.log('  5. Test the new collection in the browser');
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
