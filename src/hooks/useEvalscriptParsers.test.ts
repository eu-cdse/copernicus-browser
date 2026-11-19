/* eslint-disable @typescript-eslint/no-require-imports */
import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';

describe('useEvalscriptParsers', () => {
  beforeEach(() => {
    jest.resetModules();
    // keep a single React instance inside the fresh registry so hooks work with the outer renderer
    jest.doMock('react', () => React);
  });

  afterEach(() => {
    jest.dontMock('react');
    jest.dontMock('esprima');
  });

  it('returns ready=false initially and ready=true after the parsers load', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let hook: any;
    jest.isolateModules(() => {
      hook = require('./useEvalscriptParsers');
    });
    const { result } = renderHook(() => hook.useEvalscriptParsers());
    expect(result.current.ready).toBe(false);
    expect(result.current.error).toBeNull();
    await waitFor(() => {
      expect(result.current.ready).toBe(true);
    });
    expect(result.current.error).toBeNull();
  });

  it('returns ready=true on first render when parsers are already loaded', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let hook: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let parsers: any;
    jest.isolateModules(() => {
      parsers = require('../utils/evalscriptParsers');
      hook = require('./useEvalscriptParsers');
    });
    await parsers.loadEvalscriptParsers();
    const { result } = renderHook(() => hook.useEvalscriptParsers());
    expect(result.current.ready).toBe(true);
  });

  it('exposes the load error and recovers when retry() succeeds', async () => {
    const actualEsprima = jest.requireActual('esprima');
    let failNext = true;
    jest.doMock('esprima', () => {
      if (failNext) {
        failNext = false;
        throw new Error('chunk load failed');
      }
      return actualEsprima;
    });
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let hook: any;
    jest.isolateModules(() => {
      hook = require('./useEvalscriptParsers');
    });
    const { result } = renderHook(() => hook.useEvalscriptParsers());

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });
    expect(result.current.ready).toBe(false);
    expect(result.current.error.message).toBe('chunk load failed');

    act(() => {
      result.current.retry();
    });
    expect(result.current.error).toBeNull();

    await waitFor(() => {
      expect(result.current.ready).toBe(true);
    });
    expect(result.current.error).toBeNull();
    consoleError.mockRestore();
  });
});
