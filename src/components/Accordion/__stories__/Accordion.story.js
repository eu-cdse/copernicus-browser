import React from 'react';
import { storiesOf } from '@storybook/react';
import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/css/v4-shims.css';

import Accordion from '../Accordion';

const stories = storiesOf('Accordion', module);

const AccordionDemo = (props) => {
  const [open, setOpen] = React.useState();

  return (
    <div style={{ width: 600 }}>
      <Accordion title="Composite" open={open === 1} toggleOpen={() => setOpen(1)}>
        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
        industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
        scrambled it to make a type specimen book.
      </Accordion>
      <Accordion title="Index" open={open === 2} toggleOpen={() => setOpen(2)}>
        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
        industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
        scrambled it to make a type specimen book.
      </Accordion>
      <Accordion title="Custom Script" open={open === 3} toggleOpen={() => setOpen(3)}>
        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the
        industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
        scrambled it to make a type specimen book.
      </Accordion>
    </div>
  );
};

stories.add('Default', ({ state, setState }) => {
  return <AccordionDemo />;
});
