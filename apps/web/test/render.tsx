import type { MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing/react';
import { type RenderOptions, render } from '@testing-library/react';
import type { ReactElement } from 'react';

export function renderWithApollo(
  ui: ReactElement,
  mocks: MockedResponse[],
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(<MockedProvider mocks={mocks}>{ui}</MockedProvider>, options);
}
