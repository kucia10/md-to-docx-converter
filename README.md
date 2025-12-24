# MD to DOCX

An Electron-based desktop application for converting Markdown files to DOCX. Uses Python and Pandoc to deliver high-quality document conversion.

## Features

### 🎯 Key Features
- **File Upload**: Drag-and-drop or file picker support
- **Real-time Preview**: Live rendering of Markdown files
- **Various Conversion Options**: Font, margins, page orientation, and detailed settings
- **Progress Display**: Detailed progress indicator during conversion
- **Multi-language Support**: UI support for 10 languages including Korean, English, Japanese, Chinese (Simplified/Traditional), Spanish, French, German, Portuguese, and Russian
- **Theme Support**: Dark/Light mode support

### 🛠️ Conversion Options
- **Document Settings**: Font, font size, line spacing, page orientation
- **Page Margins**: Individual margin settings for top/bottom/left/right (cm unit)
- **Advanced Options**: Table of contents, bibliography style, image handling

### 📱 User Interface
- **Intuitive Layout**: Left panel (file/options) + Right panel (preview)
- **Responsive Design**: Optimized UI for various window sizes
- **Multi-language Toggle**: Instant switching between 10 languages
- **Theme Toggle**: Dark/Light mode switching

## System Requirements

### Minimum Requirements
- **Operating System**: Windows 10+, macOS 10.14+, Ubuntu 18.04+
- **Memory**: 4GB RAM or more
- **Storage**: 500MB or more free space

### Recommended Specifications
- **Operating System**: Windows 11, macOS 12+, Ubuntu 20.04+
- **Memory**: 8GB RAM or more
- **Storage**: 1GB or more free space

## Installation

### Automatic Installation (Recommended)
1. Download the latest version from [Releases](https://github.com/kucia10/md-to-docx-converter/releases)
2. Run the installation file for your operating system:
   - Windows: `.exe` or `.msi` file
   - macOS: `.dmg` file
   - Linux: `.AppImage` file

### Manual Installation
1. Clone the source code:
   ```bash
   git clone https://github.com/kucia10/md-to-docx-converter.git
   cd md-to-docx-converter
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Create a distribution build:
   ```bash
   npm run dist
   ```

## Usage

### 1. File Selection
- **Drag-and-drop**: Drag Markdown files into the application
- **File Picker**: Click the 'Select File' button to browse files
- **Supported Formats**: `.md`, `.markdown` files

### 2. Preview Check
- Selected file content is displayed in real-time in the right panel
- Switch between multiple files using dropdown menu

### 3. Conversion Options Settings
- **Basic Settings**: Font (Arial), Size (12pt), Line Spacing (1.5)
- **Page Settings**: Margins, orientation, and document format
- **Advanced Options**: Table of contents, bibliography, and expert settings

### 4. Start Conversion
- Click the 'Start Conversion' button
- Monitor progress in the progress window
- Receive notification and file location upon completion

## Development

### Development Environment Setup
1. Install development dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Build:
   ```bash
   npm run build
   ```

4. Create packages:
   ```bash
   npm run dist          # All platforms
   npm run dist:mac      # macOS only
   npm run dist:win      # Windows only
   npm run dist:linux    # Linux only
   ```

### Project Structure
```
electron-md-to-docx/
├── src/
│   ├── main/              # Electron main process
│   │   ├── main.ts
│   │   ├── ipc/         # IPC channels and handlers
│   │   │   ├── channels.ts
│   │   │   └── handlers.ts
│   │   └── python/       # Python bridge
│   │       └── converter.ts
│   ├── preload/          # Preload script
│   │   └── index.ts
│   ├── renderer/          # React renderer process
│   │   ├── components/   # React components
│   │   ├── context/      # React Context (Theme, etc.)
│   │   ├── hooks/        # React hooks
│   │   ├── locales/      # Multi-language resources
│   │   ├── styles/       # CSS styles
│   │   └── types/        # TypeScript type definitions
│   ├── python/           # Python conversion script
│   │   └── convert.py
│   └── resources/        # Application resources
├── build/                # Build configuration
│   └── entitlements.mac.plist
├── release/              # Build output
├── dist/                 # Compiled code
└── package.json
```

### Tech Stack
- **Frontend**: React 18.2, TypeScript 5.3, Tailwind CSS 3.3
- **Backend**: Electron 33.2, Node.js
- **Conversion Engine**: Python 3.11+, Pandoc 3.0+
- **Build Tools**: Vite 5.0, electron-builder 24.8
- **Libraries**: 
  - `react-dropzone` - Drag-and-drop file upload
  - `react-markdown` - Markdown rendering
  - `i18next` - Multi-language support
  - `lucide-react` - Icon library

### Development Scripts
- `npm run dev` - Run main process and renderer dev server concurrently
- `npm run dev:main` - Main process development (TypeScript compile + Electron)
- `npm run dev:renderer` - Renderer dev server (Vite HMR)
- `npm run build` - Build both main and renderer
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode

## Troubleshooting

### Common Issues

#### Conversion Failure
- **Cause**: Pandoc path issue or file permissions
- **Solution**: 
  1. Restart the application
  2. Check write permissions for output folder
  3. Verify input file is valid Markdown

#### Preview Not Displaying
- **Cause**: File encoding issue
- **Solution**: Use UTF-8 encoded Markdown files

#### Application Startup Failure
- **Cause**: System compatibility issue
- **Solution**:
  1. Update to latest version
  2. Check system requirements
  3. Review log files

#### macOS File Access Permission Issues
- **Cause**: File access restrictions due to sandbox settings
- **Solution**:
  1. Grant file access permissions in System Preferences
  2. Check document/downloads folder access permissions

### Log Locations
- **Windows**: `%APPDATA%/md-to-docx-converter/logs/`
- **macOS**: `~/Library/Logs/md-to-docx-converter/`
- **Linux**: `~/.local/share/md-to-docx-converter/logs/`

## Contributing

### How to Contribute
1. Report issues: [Issues](https://github.com/kucia10/md-to-docx-converter/issues)
2. Feature requests: [Discussions](https://github.com/kucia10/md-to-docx-converter/discussions)
3. Pull requests: [Pull Requests](https://github.com/kucia10/md-to-docx-converter/pulls)

### Development Guidelines
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing-feature`)
5. Create pull request

### Coding Standards
- **TypeScript**: Use strict mode, explicit types
- **File Paths**: 
  - Main/Preload code uses absolute paths (`src/main/...`)
  - Renderer code uses `@/` alias (`@/components/...`)
- **Python Paths**: Always use `getPythonPath()` and `getPythonScriptPath()`
- **IPC Channels**: Define and import only from `src/main/ipc/channels.ts`
- **Unit Conversion**: UI in cm unit, convert to inches for Python (÷2.54)

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Electron](https://electronjs.org/) - Cross-platform desktop application framework
- [React](https://reactjs.org/) - User interface library
- [Pandoc](https://pandoc.org/) - Document conversion tool
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Lucide](https://lucide.dev/) - Icon library
- [Vite](https://vitejs.dev/) - Fast build tool

## Contact

- **Email**: bluesky.kucia10@gmail.com
- **GitHub**: https://github.com/kucia10/md-to-docx-converter
- **Documentation**: https://kucia10.github.io/md-to-docx-converter

---

**MD to DOCX Converter** - Convert Markdown to Word documents easily 🚀