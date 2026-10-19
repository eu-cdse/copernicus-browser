// Generates public/datasets.txt: the ids an AI assistant (or a script) may use in Browser links for
// the default theme. Offline and deterministic, so CI can regenerate it and fail on `git diff`.
//
//   npm run generate-datasets
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { DEFAULT_THEMES } from '../src/assets/default_themes.js';
import { PREDEFINED_LAYERS_METADATA } from '../src/assets/layers_metadata.js';
import * as knownCollections from '../src/Tools/SearchPanel/dataSourceHandlers/knownCollections';
import {
  addVectorSections,
  buildCollectionIndex,
  buildSections,
  renderDatasets,
  KnownCollections,
  LayerConfiguration,
  PredefinedLayerMetadata,
  ThemeEntry,
} from './utils/datasets-catalogue';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const configurationPath = path.join(root, 'src/assets/cache/configuration.json');
const outputPath = path.join(root, 'public/datasets.txt');

type Theme = { id: string; content: ThemeEntry[] };

const theme = (DEFAULT_THEMES as Theme[]).find((t) => t.id === 'DEFAULT-THEME');
if (!theme) {
  throw new Error('DEFAULT-THEME not found in src/assets/default_themes.js');
}

const configuration = JSON.parse(fs.readFileSync(configurationPath, 'utf8')) as LayerConfiguration;
const collectionIndex = buildCollectionIndex(knownCollections as unknown as KnownCollections);
const {
  sections: instanceSections,
  skipped: instanceSkipped,
  excluded,
} = buildSections(theme.content, configuration, collectionIndex);
const sections = addVectorSections(instanceSections, PREDEFINED_LAYERS_METADATA as PredefinedLayerMetadata[]);
// Urban Atlas is now listed from the predefined metadata, so it is no longer "not listed".
const skipped = instanceSkipped.filter((s) => !s.startsWith('CLMS Urban Atlas'));

fs.writeFileSync(outputPath, `${renderDatasets(sections, skipped)}\n`);
console.log(
  `${path.relative(root, outputPath)}: ${sections.length} datasets, ${skipped.length} not listed, ${excluded} layers deliberately left out`,
);
