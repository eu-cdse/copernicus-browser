import React from 'react';

const CloseCross = ({ size = 20, linewidth = 2, color = '#fff' }) => {
  const styles = {
    cross: {
      float: 'right',
      width: size,
      height: size,
    },
    left: {
      height: size,
      width: linewidth,
      borderRadius: 1,
      backgroundColor: color,
      transform: 'rotate(45deg)',
      marginLeft: size / 4,
    },
    right: {
      height: size,
      width: linewidth,
      borderRadius: 1,
      backgroundColor: color,
      transform: 'rotate(90deg)',
    },
  };
  return (
    <div className="cross" style={styles.cross}>
      <div className="left" style={styles.left}>
        <div className="right" style={styles.right}></div>
      </div>
    </div>
  );
};

export default CloseCross;
