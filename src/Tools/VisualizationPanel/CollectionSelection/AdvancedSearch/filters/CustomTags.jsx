import React from 'react';

export function AcrossTrackIncidenceAngleTag({ Tag, collectionId, filterItemId, value, onChange }) {
  const values = [-value, value];
  return (
    <Tag
      key={`${collectionId}-${filterItemId}`}
      value={`[${Math.min(...values)}, ${Math.max(...values)}]`}
      onRemove={() => onChange('')}
    />
  );
}
