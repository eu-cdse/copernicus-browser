import React from 'react';
import { storiesOf } from '@storybook/react';
import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/css/v4-shims.css';

import { NotificationPanel } from '../NotificationPanel';

const stories = storiesOf('Notification Panel', module);

stories.add('EOB', () => {
  return (
    <>
      <NotificationPanel type="info" msg={'Please log in to access your pins.'} />
      <NotificationPanel type="info" msg={'Search for data first.'} />
      <NotificationPanel type="loading" msg={'Loading more results ...'} />
      <NotificationPanel type="error" msg={'Error occurred.'} />
    </>
  );
});
