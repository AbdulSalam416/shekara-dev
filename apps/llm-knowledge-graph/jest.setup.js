const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Polyfill window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mocking canvas-related things if necessary for ForceGraph
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = jest.fn();
}

// Mocks for problematic ESM packages
jest.mock('react-cytoscapejs', () => {
  return {
    __esModule: true,
    default: () => null
  };
});

jest.mock('d3-force', () => {
  return {
    __esModule: true,
    forceCollide: () => ({ radius: () => ({ strength: () => ({ iterations: () => { /* mock */ } }) }) }),
    forceSimulation: () => ({ force: () => ({ strength: () => ({ distance: () => { /* mock */ } }) }), on: () => { /* mock */ }, stop: () => { /* mock */ }, tick: () => { /* mock */ } }),
  };
});

jest.mock('three', () => {
  return {
    __esModule: true,
    Scene: class {},
    PerspectiveCamera: class {},
    WebGLRenderer: class { render() { /* mock */ } setSize() { /* mock */ } },
    Group: class { add() { /* mock */ } remove() { /* mock */ } },
    Mesh: class { add() { /* mock */ } },
    SphereGeometry: class {},
    MeshLambertMaterial: class {},
    CanvasTexture: class {},
    SpriteMaterial: class {},
    Sprite: class {},
    RingGeometry: class {},
    MeshBasicMaterial: class {},
    OctahedronGeometry: class {},
    DodecahedronGeometry: class {},
    EdgesGeometry: class {},
    LineBasicMaterial: class {},
    LineSegments: class {},
    DoubleSide: 2,
  };
});

// Also mock pdf-parse here to be safe
jest.mock('pdf-parse', () => {
  const PDFParseMock = jest.fn().mockImplementation(() => {
    return {
      getText: jest.fn().mockResolvedValue({
        text: 'mocked text content',
        numpages: 1,
        info: {},
        metadata: {},
        version: 'mock'
      })
    };
  });
  PDFParseMock.setWorker = jest.fn();
  return { PDFParse: PDFParseMock };
});
