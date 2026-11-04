import React from 'react';
import { APP_NAME } from '../config/app';

const Wordmark = () => (
  <span className="text-xl font-bold text-fg" aria-label={APP_NAME}>
    {APP_NAME}
  </span>
);

export default Wordmark;
