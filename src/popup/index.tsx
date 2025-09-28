import React from 'react';
import { createRoot } from 'react-dom/client';
import Popup from "./popup";

const root = createRoot(document.getElementById('app')!);
root.render(<Popup />);