import React from 'react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';

import ProductInfo from './ProductInfo';
import store, { authSlice } from '../../../store';
import { WORKFLOWS_COMPATIBLE_WITH_PRODUCTS_URL } from '../../../api/OData/workspace';

jest.mock('../../../icons/workspace-plus.svg?react', () => ({ __esModule: true, default: () => <svg /> }));
jest.mock('../../../icons/chevron-down.svg?react', () => ({ __esModule: true, default: () => <svg /> }));
jest.mock('../../../icons/chevron-up.svg?react', () => ({ __esModule: true, default: () => <svg /> }));
jest.mock('../../../icons/magnifier.svg?react', () => ({ __esModule: true, default: () => <svg /> }));

const mockNetwork = new MockAdapter(axios);

const product = {
  id: 'test-product-id',
  name: 'test-product',
};

describe('ProductInfo workflows fetch and login gating', () => {
  beforeEach(() => {
    mockNetwork.reset();
    store.dispatch(authSlice.actions.resetUser());
  });

  test('anonymous user does not trigger workflows request and sees login-required message', async () => {
    render(
      <Provider store={store}>
        <ProductInfo
          product={product}
          onDownload={jest.fn()}
          downloadInProgress={false}
          onClose={jest.fn()}
        />
      </Provider>,
    );

    expect(await screen.findByText('You need to log in to use this function.')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockNetwork.history.post.length).toBe(0);
    });
  });

  test('logged-in user triggers workflows request and sees no-available-processors message on empty response', async () => {
    mockNetwork.onPost(WORKFLOWS_COMPATIBLE_WITH_PRODUCTS_URL).replyOnce(200, { value: [] });

    store.dispatch(
      authSlice.actions.setUser({
        access_token: 'test-token',
        userdata: undefined,
        token_expiration: undefined,
      }),
    );

    render(
      <Provider store={store}>
        <ProductInfo
          product={product}
          onDownload={jest.fn()}
          downloadInProgress={false}
          onClose={jest.fn()}
        />
      </Provider>,
    );

    expect(await screen.findByText('No available processors for this product.')).toBeInTheDocument();

    expect(mockNetwork.history.post.length).toBe(1);
    expect(mockNetwork.history.post[0].url).toBe(WORKFLOWS_COMPATIBLE_WITH_PRODUCTS_URL);
  });
});
