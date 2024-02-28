import React, { Component } from 'react';
import { connect } from 'react-redux';
import Select, { components } from 'react-select';
import { t } from 'ttag';
import dragula from 'react-dragula';
import 'react-dragula/dist/dragula.min.css';

import store, { compareLayersSlice } from '../../store';
import { NotificationPanel } from '../../junk/NotificationPanel/NotificationPanel';
import ComparedLayer from './ComparedLayer';
import { customSelectStyle } from '../../components/CustomSelectInput/CustomSelectStyle';
import { CustomDropdownIndicator } from '../../components/CustomSelectInput/CustomDropdownIndicator';
import SocialShare from '../../components/SocialShare/SocialShare';

import './ComparePanel.scss';
import { saveSharedPinsToServer } from '../Pins/Pin.utils';

import { ReactComponent as ChevronUp } from '../../icons/chevron-up.svg';
import { ReactComponent as ChevronDown } from '../../icons/chevron-down.svg';
import { COMPARE_OPTIONS } from '../../const';

const DropdownIndicator = (props) => {
  return (
    components.DropdownIndicator && (
      <components.DropdownIndicator {...props}>
        <CustomDropdownIndicator {...props} chevronUp={ChevronUp} chevronDown={ChevronDown} />
      </components.DropdownIndicator>
    )
  );
};

const NO_COMPARE_LAYERS_MESSAGE = () => t`No layers to compare.`;

const SHARE_COMPARE_ENABLED = false;

class ComparePanel extends Component {
  state = {
    displaySocialShareOptions: false,
    compareSharedPinsId: null,
  };

  onChangeCompareMode = (e) => {
    const compareMode =
      Object.values(COMPARE_OPTIONS).find((cm) => cm.value === e.value) ?? COMPARE_OPTIONS.COMPARE_SPLIT;
    store.dispatch(compareLayersSlice.actions.setCompareMode(compareMode));
    store.dispatch(compareLayersSlice.actions.resetOpacityAndClipping());
  };

  removeAll = () => {
    store.dispatch(compareLayersSlice.actions.setComparedLayers([]));
  };

  dragulaDecorator = (componentBackingInstance) => {
    if (componentBackingInstance) {
      const drake = dragula([componentBackingInstance], {
        moves: (el, container, handle) => {
          if (
            handle.classList.contains('compare-drag-handler') ||
            handle.classList.contains('compare-drag-handler-icon')
          ) {
            return true;
          }
        },
      });

      drake.on('drop', (el, target, source, sibling) => {
        const droppedLocation = Array.from(el.parentNode.children).indexOf(el);
        drake.cancel(true);
        this.onDrop(el.id, droppedLocation);
      });
    }
  };

  onDrop = (oldIndex, newIndex) => {
    store.dispatch(compareLayersSlice.actions.updateOrder({ oldIndex: oldIndex, newIndex: newIndex }));
  };

  addAllPins = () => {
    const { pins } = this.props;
    store.dispatch(compareLayersSlice.actions.addComparedLayers(pins.map((p) => p.item)));
  };

  getCompareOptions = () => Object.values(COMPARE_OPTIONS).map((v) => ({ value: v.value, label: v.label() }));

  shareCompare = () => {
    if (!SHARE_COMPARE_ENABLED) {
      return;
    }

    const { comparedLayers } = this.props;

    (async () => {
      try {
        const sharedPinsId = await saveSharedPinsToServer(comparedLayers);

        this.setState(() => ({
          compareSharedPinsId: sharedPinsId,
          displaySocialShareOptions: true,
        }));
      } catch (e) {}
    })();
  };

  toggleSocialSharePanel = () => {
    this.setState((prevState) => ({
      displaySocialShareOptions: !prevState.displaySocialShareOptions,
    }));
  };

  onShareClickHandler = () => {
    const { displaySocialShareOptions } = this.state;

    if (displaySocialShareOptions) {
      this.toggleSocialSharePanel();
    } else {
      this.shareCompare();
    }
  };

  render() {
    const { displaySocialShareOptions, compareSharedPinsId } = this.state;
    const { compareMode, comparedLayers, comparedOpacity, comparedClipping, pins } = this.props;

    return (
      <div className="compare-panel">
        <div className="compare-panel-header">
          <div className="compare-panel-title-wrapper">
            <div className="compare-panel-title">{t`Compare`}:</div>
            <div className="compare-panel-toggle">
              <label className="compare-panel-toggle-label">{t`Effect:`}</label>
              <Select
                value={{ value: compareMode.value, label: compareMode.label() }}
                options={this.getCompareOptions()}
                onChange={this.onChangeCompareMode}
                styles={customSelectStyle}
                menuPosition="fixed"
                menuShouldBlockScroll={true}
                className="compare-mode-select-dropdown"
                classNamePrefix="compare-mode-select"
                components={{ DropdownIndicator }}
                isSearchable={false}
                menuPlacement="auto"
              />
            </div>
          </div>
          <div className="compare-panel-button-wrapper">
            <div
              className={`compare-panel-button ${comparedLayers.length === 0 && 'disabled'}`}
              onClick={this.removeAll}
            >
              {t`Remove all`}
            </div>
            {SHARE_COMPARE_ENABLED && (
              <div
                className={`compare-panel-button ${comparedLayers.length === 0 && 'disabled'} `}
                onClick={this.onShareClickHandler}
              >{t`Share`}</div>
            )}
            <div
              className={`compare-panel-button ${pins.length === 0 && 'disabled'}`}
              onClick={this.addAllPins}
            >
              {t`Add all pins`}
            </div>
          </div>
        </div>

        <SocialShare
          extraParams={{
            compareShare: true,
            compareMode: compareMode?.value,
            compareSharedPinsId: compareSharedPinsId,
            comparedOpacity: JSON.stringify(comparedOpacity),
            comparedClipping: JSON.stringify(comparedClipping),
          }}
          displaySocialShareOptions={displaySocialShareOptions}
          toggleSocialSharePanel={this.toggleSocialSharePanel}
          datasetId={null}
          outsideClickIgnoreClass="compare-panel-button-wrapper"
        />

        <div className="compare-layers-list" ref={this.dragulaDecorator}>
          {comparedLayers.map((layer, i) => (
            <ComparedLayer
              id={i}
              key={`${i}-${layer.id}`}
              index={i}
              layer={layer}
              compareMode={compareMode.value}
              onDrop={this.onDrop}
              handleTouchMove={this.handleTouchMove}
              opacity={comparedOpacity[i]}
              clipping={comparedClipping[i]}
            />
          ))}
        </div>

        {!comparedLayers.length && <NotificationPanel type="info" msg={NO_COMPARE_LAYERS_MESSAGE()} />}
      </div>
    );
  }
}

const mapStoreToProps = (store) => ({
  compareMode: store.compare.compareMode,
  comparedLayers: store.compare.comparedLayers,
  comparedOpacity: store.compare.comparedOpacity,
  comparedClipping: store.compare.comparedClipping,
  pins: store.pins.items,
  selectedLanguage: store.language.selectedLanguage,
});

export default connect(mapStoreToProps, null)(ComparePanel);
