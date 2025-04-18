# Unlock PDF

A client-side PDF password removal tool that works fully in your browser, with no server uploads required.

Demo: https://tlan16.github.io/unlock-pdf-web/

## Features

- **100% Client-side Processing**: Your PDFs never leave your device
- **No Installation Required**: Works directly in your web browser
- **Multiple File Support**: Process multiple PDFs at once
- **Batch Downloads**: Download all unlocked PDFs as a single ZIP file
- **Fast Processing**: Uses WebAssembly for high-performance PDF operations

## How It Works

This tool uses [QPDF](https://github.com/qpdf/qpdf) (compiled to WebAssembly) to decrypt PDF files directly in your browser. The decryption process removes password protection while preserving the document's content.

## Usage

1. Visit the [Unlock PDF Web App](https://tlan16.github.io/unlock-pdf-web/)
2. Click "Select PDF Files" and choose one or more password-protected PDFs
3. Wait for processing to complete
4. Download individual files or use "Download All" for multiple files

## Privacy

- No PDF data is sent to any server
- All processing happens locally in your browser
- No tracking or analytics are used

## Development

### Prerequisites

- [bun](https://bun.sh/)

### Setup

```bash
# Clone the repository
git clone https://github.com/tlan16/unlock-pdf-web.git
cd unlock-pdf-web

# Install dependencies
bun install
```

### Development

```bash
# Start the development server
bun dev
```

### Build

```bash
# Build the project for production
bun build
```
