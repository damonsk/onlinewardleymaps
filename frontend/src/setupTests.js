import '@testing-library/jest-dom/extend-expect';

jest.mock('./version', () => ({ owmBuild: '0.0000' }));
