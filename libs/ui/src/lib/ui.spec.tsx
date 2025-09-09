import { render } from '@testing-library/react';

import ShekaraDevUi from './ui';

describe('ShekaraDevUi', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ShekaraDevUi />);
    expect(baseElement).toBeTruthy();
  });
});
