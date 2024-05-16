import 'jest-canvas-mock';
import '@testing-library/jest-dom';
window.URL.createObjectURL = jest.fn();


jest.mock("react-markdown", () => (props) => {
    return <>{props.children}</>
})

jest.mock("rehype-raw", ()  => {
    return {}
}) 

jest.mock("rehype-sanitize", () => {
    return {}
})

