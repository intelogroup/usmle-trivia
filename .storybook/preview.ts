import type { Preview } from '@storybook/react-vite'
import React from 'react';
import '../src/index.css'; // Import global styles including Tailwind

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    // Configure accessibility addon
    a11y: {
      element: '#storybook-root',
      config: {},
      options: {},
      manual: true,
    },
    // Background options for testing light/dark themes
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark', 
          value: '#0f172a',
        },
      ],
    },
    // Viewport addon options for responsive testing
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px', 
            height: '1024px',
          },
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1280px',
            height: '720px',
          },
        },
      },
    },
  },
  // Global decorators
  decorators: [
    (Story) => {
      return React.createElement(
        'div',
        { className: 'font-sans antialiased' },
        React.createElement(Story)
      );
    },
  ],
};

export default preview;