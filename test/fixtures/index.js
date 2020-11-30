import React, { useState } from 'react';
import { render } from 'react-dom';

function Test() {
  const state = useState(0);
  return 'Test';
}

render(Test, document.getElementById('root'));
