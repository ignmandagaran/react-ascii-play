# react-ascii-play

A powerful React library for creating ASCII art animations and interactive ASCII-based applications. Built with TypeScript and modern React practices. 
This is a React port of [play.core](https://github.com/ertdfgcvb/play.core) by [Andreas Gysin](https://github.com/ertdfgcvb).

## Features

- 🎨 High-performance ASCII rendering with both text and canvas-based renderers
- 📐 Precise character metrics calculation for perfect ASCII art alignment
- 🎥 Built-in animation support with FPS monitoring
- 🖼️ Image processing and conversion to ASCII art
- 🎮 Interactive cursor and input handling
- 🎯 Vector operations (2D and 3D)
- 🎨 Color support for terminal and canvas rendering
- 📦 Modular architecture with separate modules for different functionalities

## Installation

```bash
npm install react-ascii-play
# or
yarn add react-ascii-play
# or
pnpm add react-ascii-play
```

## Quick Start

```tsx
import { PlayCoreAscii } from 'react-ascii-play';

function MyAsciiApp() {
  const program = {
    // Your ASCII art program logic here
    pre: (context, cursor, buffer, userData) => {
      // Pre logic
    },
    main: (context, cursor, buffer, userData) => {
      // Main logic
    },
    post: (context, cursor, buffer, userData) => {
      // Post logic
    },
    pointerMove: (context, cursor, buffer, userData, eventData) => {
      // Pointer move logic
    },
    pointerDown: (context, cursor, buffer, userData, eventData) => {
      // Pointer down logic
    },
    pointerUp: (context, cursor, buffer, userData, eventData) => {
      // Pointer up logic
    },
    keyDown: (context, cursor, buffer, userData, eventData) => {
      // Key down logic
    },
  };

  const settings = {
    width: 80,
    height: 24,
    renderer: 'text', // or 'canvas'
    fps: 60
  };

  return (
    <PlayCoreAscii 
      program={program}
      settings={settings}
    />
  );
}
```

## API Reference

### Core Components

#### `PlayCoreAscii`

The main component for rendering ASCII art.

```tsx
interface PlayCoreAsciiProps {
  program: PlayCoreAsciiProgram;
  settings: PlayCoreAsciiSettings;
  className?: string;
  loop?: (callback: (time: number) => void) => void;
}
```

### Modules

The library exports several modules for different functionalities:

- `buffer`: Buffer manipulation utilities
- `camera`: Camera and viewport management
- `canvas`: Canvas rendering utilities
- `color`: Color manipulation and conversion
- `drawInfo`: Drawing information utilities
- `exportframe`: Frame export functionality
- `filedownload`: File download utilities
- `image`: Image processing and conversion
- `load`: Asset loading utilities
- `num`: Numerical utilities
- `sort`: Sorting utilities
- `vec2`: 2D vector operations
- `vec3`: 3D vector operations
- `sdf`: Signed Distance Field utilities

## Examples

Check out the examples directory for more detailed usage examples.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

Apache License 2.0 © [@ignmandagaran](https://github.com/ignmandagaran)

This project is a port of [play.core](https://github.com/ertdfgcvb/play.core) which is also licensed under Apache License 2.0.
