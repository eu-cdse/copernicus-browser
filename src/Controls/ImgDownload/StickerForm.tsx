import React from 'react';
import Toggle from 'react-toggle';
import { t } from 'ttag';

type OverlayVariant = 'dark' | 'light';

type StickerFormProps = {
  overlayVariant: OverlayVariant;
  showText: boolean;
  updateFormData: (field: string, value: string | boolean) => void;
};

export default function StickerForm({ overlayVariant, showText, updateFormData }: StickerFormProps) {
  return (
    <div>
      <div className="form-field">
        <label title={t`Switch between a light or dark logo overlay on the exported image.`}>
          <div>{t`Dark overlay`}</div>
        </label>
        <div className="form-input">
          <Toggle
            checked={overlayVariant === 'dark'}
            icons={false}
            onChange={() => updateFormData('overlayVariant', overlayVariant === 'dark' ? 'light' : 'dark')}
          />
        </div>
      </div>
      <div className="form-field">
        <label title={t`Toggle the visibility of the text on the exported image.`}>
          <div>{t`Show text`}</div>
        </label>
        <div className="form-input">
          <Toggle checked={showText} icons={false} onChange={() => updateFormData('showText', !showText)} />
        </div>
      </div>
    </div>
  );
}
