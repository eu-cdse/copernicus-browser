import React, { useEffect, useState } from 'react';
import { t } from 'ttag';
import { connect } from 'react-redux';
import Select from 'react-select';
import store, { compareLayersSlice } from '../../store';

import ComparedLayer from './ComparedLayer';
import SocialShare from '../../components/SocialShare/SocialShare';
import { NotificationPanel } from '../../junk/NotificationPanel/NotificationPanel';

import { saveSharedPinsToServer } from '../Pins/Pin.utils';

import { CustomDropdownIndicator } from '../../components/CustomSelectInput/CustomDropdownIndicator';
import { customSelectStyle } from '../../components/CustomSelectInput/CustomSelectStyle';

import { COMPARE_OPTIONS } from '../../const';

import './ComparePanel.scss';

const NO_COMPARE_LAYERS_MESSAGE = () => t`No layers to compare.`;

const ComparePanel = (props) => {
  const [displaySocialShareOptions, setDisplaySocialShareOptions] = useState(false);

  const { compareMode, comparedLayers, comparedOpacity, comparedClipping, pins, compareShare } = props;

  // Enable compare share to add params
  useEffect(() => {
    if (!compareShare) {
      store.dispatch(compareLayersSlice.actions.setCompareShare(true));
    }
    return () => {
      store.dispatch(compareLayersSlice.actions.setCompareShare(false));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onChangeCompareMode = (e) => {
    const compareMode =
      Object.values(COMPARE_OPTIONS).find((cm) => cm.value === e.value) ?? COMPARE_OPTIONS.COMPARE_SPLIT;
    store.dispatch(compareLayersSlice.actions.setCompareMode(compareMode));
    store.dispatch(compareLayersSlice.actions.resetOpacityAndClipping());
  };

  const removeAll = () => {
    store.dispatch(compareLayersSlice.actions.resetComparedLayers());
  };

  const onDrop = (oldIndex, newIndex) => {
    setTimeout(
      () =>
        store.dispatch(compareLayersSlice.actions.updateOrder({ oldIndex: oldIndex, newIndex: newIndex })),
      0,
    );
  };

  const addAllPins = () => {
    store.dispatch(compareLayersSlice.actions.addComparedLayers(pins.map((p) => p.item)));
  };

  const getCompareOptions = () =>
    Object.values(COMPARE_OPTIONS).map((v) => ({ value: v.value, label: v.label() }));

  useEffect(() => {
    const getAndSetCompareSharedPinsId = async () => {
      try {
        const sharedPinsId = await saveSharedPinsToServer(comparedLayers);
        store.dispatch(compareLayersSlice.actions.setCompareSharedPinsId(sharedPinsId));
      } catch (e) {
        console.warn(e);
      }
    };

    if (comparedLayers.length > 0) {
      getAndSetCompareSharedPinsId();
    } else {
      store.dispatch(compareLayersSlice.actions.setCompareSharedPinsId(null));
    }
  }, [comparedLayers]);

  const toggleSocialSharePanel = () => {
    setDisplaySocialShareOptions((prevState) => !prevState);
  };

  return (
    <div className="compare-panel">
      <div className="compare-panel-header">
        <div className="compare-panel-title-wrapper">
          <div className="compare-panel-title">{t`Compare`}:</div>
          <div className="compare-panel-toggle">
            <label className="compare-panel-toggle-label">{t`Effect:`}</label>
            <Select
              value={{ value: compareMode.value, label: compareMode.label() }}
              options={getCompareOptions()}
              onChange={onChangeCompareMode}
              styles={customSelectStyle}
              menuPosition="fixed"
              menuShouldBlockScroll={true}
              className="compare-mode-select-dropdown"
              classNamePrefix="compare-mode-select"
              components={{ DropdownIndicator: CustomDropdownIndicator }}
              isSearchable={false}
              menuPlacement="auto"
            />
          </div>
        </div>
        <div className="compare-panel-button-wrapper">
          <div
            className={`compare-panel-button ${comparedLayers.length === 0 && 'disabled'}`}
            onClick={removeAll}
          >
            {t`Remove all`}
          </div>
          <div
            className={`compare-panel-button ${comparedLayers.length === 0 && 'disabled'} `}
            onClick={(e) => {
              e.stopPropagation();
              toggleSocialSharePanel();
            }}
          >{t`Share`}</div>
          <div className={`compare-panel-button ${pins.length === 0 && 'disabled'}`} onClick={addAllPins}>
            {t`Add all pins`}
          </div>
        </div>
      </div>

      <SocialShare
        displaySocialShareOptions={displaySocialShareOptions}
        onHandleOutsideClick={() => setDisplaySocialShareOptions(false)}
      />

      <div className="compare-layers-list">
        {comparedLayers.map((layer, i) => (
          <ComparedLayer
            id={i}
            key={`${i}-${layer.id}`}
            index={i}
            layer={layer}
            compareMode={compareMode.value}
            onDrop={onDrop}
            opacity={comparedOpacity[i]}
            clipping={comparedClipping[i]}
          />
        ))}
      </div>

      {!comparedLayers.length && <NotificationPanel type="info" msg={NO_COMPARE_LAYERS_MESSAGE()} />}
    </div>
  );
};

const mapStoreToProps = (store) => ({
  compareShare: store.compare.compareShare,
  compareMode: store.compare.compareMode,
  comparedLayers: store.compare.comparedLayers,
  comparedOpacity: store.compare.comparedOpacity,
  comparedClipping: store.compare.comparedClipping,
  pins: store.pins.items,
  selectedLanguage: store.language.selectedLanguage,
});

export default connect(mapStoreToProps, null)(ComparePanel);
