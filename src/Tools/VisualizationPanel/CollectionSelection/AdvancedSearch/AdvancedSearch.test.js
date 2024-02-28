import { constructFileName } from './AdvancedSearch';

const SPECIAL_CHARS = ['NC', 'ZIP'];

describe('Test if constructFileName re-constructs input value if special char exists', () => {
  test.each([
    ['firstString.secondString.NC', 'FIRSTSTRING.SECONDSTRING.nc'],
    ['firstString.secondString.NC.NC.NC', 'FIRSTSTRING.SECONDSTRING.NC.NC.nc'],
    ['firstString.NC', 'FIRSTSTRING.nc'],
    ['.NC', '.nc'],
    ['NC', 'nc'],
    ['firstString.ZIP', 'FIRSTSTRING.zip'],
    ['firstString.secondString.SAFE', 'FIRSTSTRING.SECONDSTRING.SAFE'],
    ['TESTNC', 'TESTNC'],
  ])('Test if special char resolves to lowercase', (inputValue, expectedValue) => {
    const result = constructFileName(inputValue.toUpperCase(), SPECIAL_CHARS);
    expect(result).toBe(expectedValue);
  });
});
