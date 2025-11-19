# n8n Adobe Firefly Node

A comprehensive n8n node for integrating Adobe Firefly API, supporting text-to-image, text-to-video, image expansion, and more.

## Features

- Text to Image Generation
- Text to Video Generation
- Image Expansion
- Image Fill/Inpainting
- Generate Similar Images
- Object Composite Generation

## Installation

```bash
npm install
npm run build
npm link
```

## Setup

### Obtaining Adobe Firefly API Credentials

1. Go to [Adobe Developer Console](https://developer.adobe.com/console)
2. Create a new project
3. Add the Firefly API service
4. Generate OAuth 2.0 credentials
5. Note your Client ID and Client Secret

### Configuring in n8n

1. Install the node in n8n
2. Create a new credential with your Client ID and Client Secret
3. Use the node in your workflows

## Usage

Each operation requires different inputs. Refer to the Adobe Firefly API documentation for detailed parameter information.

## API Reference

- Base URL: `https://firefly-api.adobe.io/v3/`
- Authentication: OAuth 2.0
- Content Type: application/json

## Development

```bash
npm run dev       # Watch mode compilation
npm run lint      # Run ESLint
npm run lint:fix  # Fix linting issues
npm run test      # Run tests
```

## License

MIT

