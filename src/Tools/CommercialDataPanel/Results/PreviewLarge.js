import React from 'react';
import Rodal from 'rodal';
import { EOBButton } from '../../../junk/EOBCommon/EOBButton/EOBButton';
import { t } from 'ttag';

import './PreviewLarge.scss';

const PreviewLarge = ({ imgUrl, onClose, title }) => {
  return (
    <Rodal
      animation="slideUp"
      visible={!!imgUrl}
      customStyles={{
        height: window.innerHeight * 0.75,
        width: window.innerWidth * 0.75,
      }}
      onClose={onClose}
      closeOnEsc={true}
    >
      <div className="preview-large">
        <h3>{title}</h3>
        <div className="image-wrapper">
          <img src={imgUrl} alt={title} />
        </div>
        <EOBButton className="button" fluid onClick={onClose} text={t`Close`} />
      </div>
    </Rodal>
  );
};

export default PreviewLarge;
