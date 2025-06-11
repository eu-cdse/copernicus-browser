const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const { RRD_DATASOURCE_KEYWORD_RULES } = require('./rrd/datasource_rules.js');
const { getAuthToken } = require('./utils/auth');
const { fetchCollections } = require('./utils/byoc-api.js');

const outputConstantsFilePath = path.join(
  __dirname,
  '../src/Tools/SearchPanel/dataSourceHandlers/RRDDataSources/dataSourceRRDConstants.js',
);
const handlersFilePath = path.join(
  __dirname,
  '../src/Tools/SearchPanel/dataSourceHandlers/dataSourceRRDHandlers.js',
);

const rollingArchiveMapFilePath = path.join(__dirname, '../src/Tools/RapidResponseDesk/rollingArchiveMap.js');

const tokenEndpointUrl = process.env.APP_ADMIN_AUTH_BASEURL;
const apiEndpoint = process.env.RRD_COLLECTION_BASE_URL;
const clientId = process.env.RRD_COLLECTION_CLIENT_ID;
const clientSecret = process.env.RRD_COLLECTION_CLIENT_SECRET;

const cleanName = (name) =>
  name
    .replace(/[/\-\s]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();

const detectConstellation = (productTypeKey) => {
  const rule = RRD_DATASOURCE_KEYWORD_RULES.find((rule) => productTypeKey.includes(rule.keyword));
  return rule ? rule.value : null;
};

const RRD_COLLECTION_PREFIXES = {
  PRISM_GENERAL: 'PRISM_GENERAL_',
  GENERAL: 'GENERAL_',
  RRD: 'RRD_',
  PRISM_FRTX: 'PRISM_FRTX_',
  PRISM_CSESA: 'PRISM_CSESA_',
  FRTX: 'FRTX_',
  CSESA: 'CSESA_',
};

const isRRDCollectionName = (name) => {
  return Object.values(RRD_COLLECTION_PREFIXES).some(
    (prefix) => name.startsWith(prefix) && name.length > prefix.length,
  );
};

const buildConstants = (items) =>
  items.map(({ cleaned, id }) => `export const ${cleaned}_COLLECTION = '${id}';`);

const buildCollectionExport = (items) =>
  `export const RRD_COLLECTIONS = [\n  ${items
    .map(({ cleaned }) => `${cleaned}_COLLECTION`)
    .join(',\n  ')},\n];`;

const updateRRDConstants = async () => {
  try {
    const token = await getAuthToken(tokenEndpointUrl, clientId, clientSecret);
    console.log('Auth token fetched successfully.');

    const data = await fetchCollections(apiEndpoint, token);
    const validItems = [];
    const failingItems = [];

    for (const item of data) {
      if (!isRRDCollectionName(item.name)) {
        continue;
      }

      const cleaned = cleanName(item.name);
      const constellation = detectConstellation(cleaned);

      if (constellation) {
        validItems.push({ ...item, cleaned, constellation });
      } else {
        failingItems.push({ name: item.name, id: item.id });
      }
    }

    const constants = buildConstants(validItems);
    const collections = buildCollectionExport(validItems);
    const constantsFileContent = `${constants.join('\n')}\n\n${collections}`;

    fs.writeFileSync(outputConstantsFilePath, constantsFileContent + '\n');
    console.log('- dataSourceRRDConstants.js updated');

    const groupedMap = validItems.reduce((acc, { cleaned, constellation }) => {
      if (!acc[constellation]) {
        acc[constellation] = {};
      }
      acc[constellation][cleaned] = `${cleaned}_COLLECTION`;
      return acc;
    }, {});

    updateRollingArchiveMap(groupedMap, constants);
    updateRRDHandlers(handlersFilePath, groupedMap, constants);
    console.log(`Added collections: ${validItems.length}`);
    console.log(`Failing collections without constellations: ${failingItems.length}`);
    if (failingItems.length > 0) {
      console.log('Failing items:', failingItems);
    }
  } catch (error) {
    console.error('Failed to fetch data from API. Exiting.');
    process.exit(1);
  }
};

function formatConstellationObject(obj) {
  let output = '';

  for (const [outerKey, innerObj] of Object.entries(obj)) {
    output += `  [RRD_CONSTELLATIONS.${outerKey}]: {\n`;

    for (const [key, value] of Object.entries(innerObj)) {
      output += `    ${key}: ${value},\n`;
    }

    output += '  },\n';
  }

  return output;
}

const updateRollingArchiveMap = (groupedMap, constants) => {
  const constantsForImport = constants
    .map((line) => {
      const match = line.match(/export const (\S+) =/);
      return match ? `  ${match[1]},` : '';
    })
    .join('\n');

  const finalHandlersContent = `
  import { RRD_CONSTELLATIONS } from './rapidResponseProperties';
import {
${constantsForImport}
} from '../SearchPanel/dataSourceHandlers/RRDDataSources/dataSourceRRDConstants';

export const ROLLING_ARCHIVE_CONSTELLATIONS_PRODUCT_TYPES_MAP = {
${formatConstellationObject(groupedMap)}};
    `.trim();
  fs.writeFileSync(rollingArchiveMapFilePath, finalHandlersContent + '\n');
  console.log('- rollingArchiveMap.js updated');
};

const updateRRDHandlers = (handlersFilePath, groupedMap, constants) => {
  const constantsForImport = constants
    .map((line) => {
      const match = line.match(/export const (\S+) =/);
      return match ? `  ${match[1]},` : '';
    })
    .join('\n');

  let switchCases = '';
  for (const dataSource in groupedMap) {
    const datasetConstants = Object.values(groupedMap[dataSource]);
    if (datasetConstants.length === 0) {
      continue;
    }
    let caseStatements = '';
    datasetConstants.forEach((dc) => {
      caseStatements += `    case ${dc}:\n`;
    });
    switchCases += caseStatements;
    switchCases += `      return DATASOURCES.RRD_${dataSource};\n`;
  }

  const finalHandlersContent = `
import { DATASOURCES } from '../../../const';
import {
${constantsForImport}
} from './RRDDataSources/dataSourceRRDConstants';

export function datasourceForRRDDatasetId(datasetId) {
  switch (datasetId) {
${switchCases}    default:
      return null;
  }
}`.trim();

  fs.writeFileSync(handlersFilePath, finalHandlersContent + '\n');
  console.log('- dataSourceRRDHandlers.js updated');
};

updateRRDConstants();
