import React from 'react';
import 'react-toggle/style.css';
import ExternalLink from '../../../ExternalLink/ExternalLink';
import { t } from 'ttag';

const FAQ_LINK =
  'https://www.sentinel-hub.com/faq/#how_can_i_use_earthimages_to_order_data_from_geocento_and_transfer_it_to_sentinelhub';

export const Link = ({ input, params }) => (
  <div key={`${params.dataProvider}-${input.id}`} className="row">
    <label title={input.label()}>{input.label()}</label>
    <ExternalLink href={FAQ_LINK}>{t`Step By Step Guide`}</ExternalLink>
  </div>
);
