import {
  primaryColor,
  mainLight,
  whiteColor,
  textColor,
  fontWeightNormal,
  fontWeightBold,
  dropdownHoverBackground,
} from '../../variables.module.scss';

export const customSelectStyle = {
  control: (css) => ({
    ...css,
    fontWeight: `${fontWeightNormal}`,
    border: 'none',
    borderBottom: `1px solid ${textColor}`,
    borderRadius: 'none',
    boxShadow: 'none',
    borderColor: 'none',
    backgroundColor: `${mainLight}`,
    outline: 'none',
    minHeight: 'auto',
    ':hover': {
      cursor: 'pointer',
      borderBottom: `1px solid ${textColor}`,
    },
  }),

  option: (css, state) => {
    const { isSelected, isFocused } = state;

    return {
      ...css,
      fontSize: 14,
      fontWeight: fontWeightNormal,
      backgroundColor: isSelected
        ? `${primaryColor}`
        : isFocused
        ? `${dropdownHoverBackground}`
        : `${whiteColor}`,
      color: isSelected ? `${whiteColor}` : `${textColor}`,
      height: '25px',
      lineHeight: '25px',
      padding: '0 12px',
      margin: '2px',
      width: 'auto',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      ':hover': {
        backgroundColor: !isSelected ? `${dropdownHoverBackground}` : ``,
        cursor: 'pointer',
      },
    };
  },

  indicatorSeparator: (css) => ({
    ...css,
    display: 'none',
  }),

  valueContainer: (css) => ({
    ...css,
    color: `${whiteColor}`,
    padding: '2px',
  }),

  singleValue: (css, state) => {
    const { menuIsOpen } = state.selectProps;

    return {
      ...css,
      color: `${textColor}`,
      fontSize: 14,
      fontWeight: `${fontWeightBold}`,
      opacity: menuIsOpen ? 0.5 : 1,
    };
  },

  input: (css) => ({
    ...css,
    fontSize: 14,
    fontWeight: `${fontWeightBold}`,
  }),

  group: (css, state) => {
    const { divider } = state.data;

    return {
      ...css,
      margin: 0,
      padding: 0,
      ':before': {
        content: divider ? '""' : 'none',
        borderTop: '1px solid black',
        display: 'flex',
        margin: '6px',
      },
    };
  },

  groupHeading: (css, state) => {
    const { label } = state.data;

    return {
      ...css,
      display: !!label ? 'block' : 'none',
      color: `${textColor}`,
      fontSize: '14px',
      fontWeight: `${fontWeightBold}`,
      height: '25px',
      lineHeight: '25px',
      padding: '0 12px',
      margin: '2px',
      width: 'auto',
      textTransform: 'none',
    };
  },

  dropdownIndicator: (css) => ({
    ...css,
    margin: 0,
    padding: 0,
  }),

  menu: (css) => ({
    ...css,
    borderRadius: 0,
    border: 'none',
    marginTop: '0',
    backgroundColor: `${whiteColor}`,
    boxShadow: '0 2px 2px rgba(0, 0, 0, 0.2)',
    width: '100%',
    minWidth: '200px',
  }),

  menuList: (css) => ({
    ...css,
    padding: 0,
    margin: '2px',
  }),

  menuPortal: (css) => ({
    ...css,
    zIndex: 2,
  }),

  placeholder: (css, state) => {
    const { menuIsOpen } = state.selectProps;

    return {
      ...css,
      color: `${textColor}`,
      fontSize: 13,
      fontWeight: `${fontWeightNormal}`,
      opacity: menuIsOpen ? 0.5 : 1,
    };
  },
};
