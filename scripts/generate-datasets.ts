// Generates the ids an AI assistant (or a script) may use in Browser links for the default theme:
// public/datasets.txt (everything in one file), public/datasets/ (an index plus one small file per
// group, because fetch tools truncate or summarise large files) and the common-datasets block of
// public/llms.txt. Offline and deterministic, so CI can regenerate them and fail on `git diff`.
//
//   npm run generate-datasets
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { DEFAULT_THEMES } from '../src/assets/default_themes.js';
import { PREDEFINED_LAYERS_METADATA } from '../src/assets/layers_metadata.js';
import { CLMS_OPTIONS } from '../src/Tools/VisualizationPanel/CollectionSelection/CLMSCollectionSelection.utils.js';
import * as knownCollections from '../src/Tools/SearchPanel/dataSourceHandlers/knownCollections';
import {
  addVectorSections,
  buildCollectionIndex,
  buildSections,
  renderDatasets,
  renderGroupFile,
  renderIndex,
  KnownCollections,
  LayerConfiguration,
  PredefinedLayerMetadata,
  ThemeEntry,
} from './utils/datasets-catalogue';
import {
  assignGroups,
  buildClmsGroupIndex,
  ClmsOption,
  collapseConsolidationPeriods,
  COMMON_DATASETS,
  GROUPS,
  MAX_FILE_BYTES,
  renderCommonDatasets,
  replaceCommonBlock,
} from './utils/datasets-groups';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const configurationPath = path.join(root, 'src/assets/cache/configuration.json');
const outputPath = path.join(root, 'public/datasets.txt');
const groupsDir = path.join(root, 'public/datasets');
const llmsPath = path.join(root, 'public/llms.txt');

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
const allSections = addVectorSections(
  instanceSections,
  PREDEFINED_LAYERS_METADATA as PredefinedLayerMetadata[],
);
// The other consolidation stages (RT1, RT2, ...) of a CLMS product are left out; the kept dataset names them.
const clmsOptions = CLMS_OPTIONS as ClmsOption[];
const sections = collapseConsolidationPeriods(allSections, clmsOptions);
// Urban Atlas is now listed from the predefined metadata, so it is no longer "not listed".
const skipped = instanceSkipped.filter((s) => !s.startsWith('CLMS Urban Atlas'));

const byGroup = assignGroups(sections, buildClmsGroupIndex(clmsOptions));
const groups = GROUPS.map((g) => ({ ...g, sections: byGroup.get(g.id) ?? [] })).filter(
  (g) => g.sections.length > 0,
);

const files = new Map<string, string>([
  [outputPath, `${renderDatasets(sections, skipped)}\n`],
  [path.join(groupsDir, 'index.txt'), `${renderIndex(groups, sections.length)}\n`],
  ...groups.map((g): [string, string] => [path.join(groupsDir, `${g.id}.txt`), `${renderGroupFile(g)}\n`]),
]);

// Everything that can throw (an id missing from the datasets, markers missing from llms.txt) is computed
// before any file is written, so a failed run never leaves a half-updated catalogue behind.
const llmsText = replaceCommonBlock(
  fs.readFileSync(llmsPath, 'utf8'),
  renderCommonDatasets(COMMON_DATASETS, sections),
);

// A file over the limit would be truncated or summarised by the tools this exists for. The full
// datasets.txt is the one deliberate exception: it stays for tools that can read a large file.
for (const [file, text] of files) {
  const bytes = Buffer.byteLength(text);
  if (file !== outputPath && bytes > MAX_FILE_BYTES) {
    throw new Error(
      `${path.relative(root, file)} is ${bytes} bytes, over the ${MAX_FILE_BYTES} byte limit. Split its group in datasets-groups.ts.`,
    );
  }
}

// Recreate the directory so a group that no longer exists does not leave a stale file behind.
fs.rmSync(groupsDir, { recursive: true, force: true });
fs.mkdirSync(groupsDir, { recursive: true });
for (const [file, text] of files) {
  fs.writeFileSync(file, text);
}

fs.writeFileSync(llmsPath, llmsText);

console.log(
  `${path.relative(root, outputPath)}: ${sections.length} datasets (${allSections.length - sections.length} consolidation stages folded into their product), ${skipped.length} not listed, ${excluded} layers deliberately left out`,
);
console.log(
  `${path.relative(root, groupsDir)}/: index + ${groups.length} group files, each at most ${MAX_FILE_BYTES} bytes`,
);
