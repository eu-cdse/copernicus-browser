import React from 'react';
import { storiesOf } from '@storybook/react';
import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/css/v4-shims.css';

import { EOBUploadGeoFile } from '../EOBUploadGeoFile';

const stories = storiesOf('EOB - Panel - UploadGeoFile', module);

stories.add('Default', ({ state, setState }) => {
  return (
    <EOBUploadGeoFile
      onUpload={(area) => {
        console.log('Uploaded - area: ', area);
      }}
      onClose={() => {
        console.log('Close the window');
      }}
    />
  );
});
