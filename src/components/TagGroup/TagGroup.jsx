import React, { useEffect, useRef, useState } from 'react';
import './TagGroup.scss';
import Tag from '../Tag/Tag';

const TagGroup = ({ wrapMode = true, style, width = 'auto', items }) => {
  const [showEllipsis, setShowEllipsis] = useState(false);

  const refOuterContainer = useRef(null);
  const refInnerContainer = useRef(null);
  const refChildren = useRef([]);

  useEffect(() => {
    const adjustTags = () => {
      let totalWidth = 0;
      let containerWidth = refOuterContainer.current.clientWidth;

      refChildren.current?.forEach((tag, index) => {
        totalWidth += tag?.offsetWidth + 5;

        if (totalWidth > containerWidth && !wrapMode) {
          tag.style.display = 'none';
          setShowEllipsis(true);
        } else {
          tag.style.display = 'inline-block';
        }
      });

      refInnerContainer.current.style.flexWrap = wrapMode ? 'wrap' : 'nowrap';
    };

    setShowEllipsis(false);
    // remove all unused tags
    refChildren.current = refChildren.current.filter((element) => element !== null);
    adjustTags();
  }, [wrapMode, items]);

  return (
    <div className="tags-outer-container" style={{ width: `${width}px` }} ref={refOuterContainer}>
      <div className="tags-inner-container" ref={refInnerContainer}>
        {items.map((item, index) => {
          return (
            <Tag
              key={index}
              reference={refChildren}
              id={index}
              style={item.style}
              type={item.type}
              label={item.label}
            />
          );
        })}
        {showEllipsis && <div>...</div>}
      </div>
    </div>
  );
};

export default TagGroup;
