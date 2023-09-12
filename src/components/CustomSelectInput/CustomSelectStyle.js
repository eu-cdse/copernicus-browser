import {
  primaryColor,
  mainMedium,
  mainLight,
  whiteColor,
  textColor,
  fontWeightNormal,
  fontWeightBold,
} from '../../variables.module.scss';

export const customSelectStyle = {
  control: (css, state) => {
    const { menuIsOpen, isFocused } = state;

    return {
      ...css,
      fontWeight: `${fontWeightNormal}`,
      border: 'none',
      borderBottom: `1px solid ${textColor}`,
      borderRadius: isFocused && !menuIsOpen ? '2px' : 0,
      boxShadow: 'none',
      borderColor: 'none',
      backgroundColor: `${mainLight}`,
      outline: isFocused && !menuIsOpen ? `1px solid ${primaryColor}` : 'none',
      minHeight: 'auto',
      ':hover': {
        cursor: 'pointer',
        borderBottom: `1px solid ${textColor}`,
      },
    };
  },

  option: (css, state) => {
    const { isSelected, isFocused } = state;

    return {
      ...css,
      fontSize: 14,
      fontWeight: `${fontWeightNormal}`,
      cursor: 'pointer',
      backgroundColor: isSelected ? `${primaryColor}` : isFocused ? `${mainMedium}` : `${whiteColor}`,
      color: isSelected ? `${whiteColor}` : `${textColor}`,
      margin: '2px 2px',
      width: 'auto',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      ':hover': {
        backgroundColor: isSelected ? `${primaryColor}` : `${mainMedium}`,
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

  group: (css) => ({
    ...css,
    margin: 0,
    padding: 0,
  }),

  groupHeading: (css) => ({
    ...css,
    margin: 0,
    padding: '8px 8px',
    fontSize: '14px',
    fontWeight: `${fontWeightBold}`,
  }),

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
