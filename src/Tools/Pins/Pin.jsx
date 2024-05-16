import React, { useState } from 'react';
import { t } from 'ttag';

import store, { mainMapSlice, compareLayersSlice } from '../../store';
import EditableString from './EditableString';
import Description from './Description';
import { parsePosition } from '../../utils';
import PinPreviewImage from './PinPreviewImage';
import { constructTimespanString, isPinValid } from './Pin.utils';
import { constructEffectsFromPinOrHighlight } from '../../utils/effectsUtils';
import InvalidPin from './InvalidPin';

import DoubleChevronDown from '../../icons/double-chevron-down.svg?react';
import DoubleChevronUp from '../../icons/double-chevron-up.svg?react';
import CompareIcon from './icons/compare-icon.svg?react';
import { useDragPin } from './useDragPin';

const Pin = ({
  arePinsSelectable,
  index,
  item,
  pinType,
  selectedForSharing,
  canAddToCompare,
  onRemovePin,
  savePinProperty,
  onPinSelect,
  allowRemove,
  onPinIndexChange,
}) => {
  const [showDescription, setShowDescription] = useState(false);
  const { ref, isDragging } = useDragPin({
    id: item._id,
    index: index,
    itemType: 'PIN',
    moveItem: onPinIndexChange,
  });

  function zoomToPin(event) {
    event.stopPropagation();
    const { zoom, lat, lng } = item;
    const { lat: parsedLat, lng: parsedLng, zoom: parsedZoom } = parsePosition(lat, lng, zoom);
    store.dispatch(
      mainMapSlice.actions.setPosition({
        lat: parsedLat,
        lng: parsedLng,
        zoom: parsedZoom,
      }),
    );
  }

  function toggleDescription(event) {
    event.stopPropagation();
    setShowDescription((prevState) => !prevState);
  }

  function addPinToCompare(e) {
    e.stopPropagation();
    const effects = constructEffectsFromPinOrHighlight(item);
    const pin = { ...item, ...effects };
    store.dispatch(compareLayersSlice.actions.addToCompare(pin));
  }

  const { description, title, lat, lng, zoom } = item;
  const { isValid, error } = isPinValid(item);

  if (!isValid) {
    return <InvalidPin index={index} error={error} item={item} onRemovePin={onRemovePin} />;
  }

  const effects = constructEffectsFromPinOrHighlight(item);
  const pinItem = { ...item, ...effects };

  return (
    <div
      ref={ref}
      className={`pin-item normal-mode ${pinType} ${isDragging ? 'dragging' : ''}`}
      id={`${index}`}
    >
      <div className="pin-top-container" onClick={onPinSelect}>
        <div className="preview-image">
          {arePinsSelectable && item && (
            <span id={index} className={`pin-selector ${selectedForSharing ? 'selected' : ''}`} />
          )}
          <PinPreviewImage pin={pinItem} />
        </div>
        <div className="pin-left-controls-container">
          <div className="pin-drag-handler">
            <i className="fa fa-ellipsis-v" />
            <i className="fa fa-ellipsis-v" />
          </div>
          {allowRemove && (
            <div
              className="remove-pin"
              onClick={(e) => {
                e.stopPropagation();
                onRemovePin(index);
              }}
              title={t`Remove pin`}
            >
              <i className="fas fa-trash" />
            </div>
          )}
        </div>
        <div className="pin-info">
          <div className="pin-info-row pin-info-title">
            {!allowRemove ? (
              <span>{title.length < 70 ? title : title.substring(0, 70) + '...'}</span>
            ) : (
              <EditableString text={title} onEditSave={(title) => savePinProperty(index, 'title', title)} />
            )}
          </div>
          <div className="pin-info-row pin-date">
            <label>{t`Date`}:</label> <span className="pin-date">{constructTimespanString(item)}</span>
            {canAddToCompare && (
              <div className="add-to-compare" title={t`Add to Compare`} onClick={addPinToCompare}>
                <CompareIcon />
              </div>
            )}
          </div>
          <div className="pin-info-row pin-location" title={t`Zoom to pinned location`}>
            <label>{t`Lat/Lon`}:&nbsp;</label>
            <span className="pin-lat-lng-link" onClick={zoomToPin}>
              {parseFloat(lat).toFixed(2)}, {parseFloat(lng).toFixed(2)}
              &nbsp;&nbsp;{t`Zoom`}:&nbsp;{zoom}
            </span>
            <div
              className={`pin-description-toggle ${showDescription ? 'active' : ''}`}
              title={showDescription ? t`Hide description` : t`Show description`}
              onClick={toggleDescription}
            >
              {showDescription ? (
                <DoubleChevronUp className="double-chevron-up" />
              ) : (
                <DoubleChevronDown className="double-chevron-down" />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="pin-bottom-container">
        <Description
          canEdit={true}
          content={description}
          showContent={showDescription}
          onDescriptionConfirm={(description) => savePinProperty(index, 'description', description)}
        />
      </div>
    </div>
  );
};
export default Pin;
