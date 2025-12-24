"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PythonConverter = void 0;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
class PythonConverter {
    pythonProcess = null;
    isDev;
    constructor() {
        this.isDev = process.env.NODE_ENV === 'development';
    }
    async convertMarkdownToDocx(inputPath, outputPath, options = {}) {
        return new Promise((resolve, reject) => {
            const scriptPath = this.getPythonScriptPath();
            const pythonPath = this.getPythonPath();
            const args = [
                scriptPath,
                '--input', inputPath,
                '--output', outputPath,
            ];
            // Add options as command line arguments
            if (options.fontSize)
                args.push('--font-size', options.fontSize.toString());
            if (options.fontFamily)
                args.push('--font-family', options.fontFamily);
            if (options.lineHeight)
                args.push('--line-height', options.lineHeight.toString());
            if (options.marginTop)
                args.push('--margin-top', options.marginTop.toString());
            if (options.marginBottom)
                args.push('--margin-bottom', options.marginBottom.toString());
            if (options.marginLeft)
                args.push('--margin-left', options.marginLeft.toString());
            if (options.marginRight)
                args.push('--margin-right', options.marginRight.toString());
            if (options.orientation)
                args.push('--orientation', options.orientation);
            if (options.generateToc)
                args.push('--generate-toc');
            this.pythonProcess = (0, child_process_1.spawn)(pythonPath, args, {
                stdio: ['pipe', 'pipe', 'pipe'],
                env: {
                    ...process.env,
                    PYTHONIOENCODING: 'utf-8',
                },
            });
            let stdout = '';
            let stderr = '';
            this.pythonProcess.stdout?.on('data', (data) => {
                stdout += data.toString();
            });
            this.pythonProcess.stderr?.on('data', (data) => {
                stderr += data.toString();
            });
            this.pythonProcess.on('close', (code) => {
                this.pythonProcess = null;
                console.log('[Converter] Python process closed with code:', code);
                console.log('[Converter] stdout:', stdout);
                console.log('[Converter] stderr:', stderr);
                if (code === 0) {
                    resolve({ success: true, message: 'Conversion completed successfully' });
                }
                else {
                    reject(new Error(`Conversion failed with code ${code}: ${stderr || stdout}`));
                }
            });
            this.pythonProcess.on('error', (error) => {
                this.pythonProcess = null;
                reject(new Error(`Python process error: ${error.message}`));
            });
        });
    }
    getPythonPath() {
        if (this.isDev) {
            // In development, use system Python
            return 'python3';
        }
        else {
            // In production, use bundled Python
            const pythonPath = path_1.default.join(process.resourcesPath, 'resources', 'python', 'python');
            if (process.platform === 'win32') {
                return pythonPath + '.exe';
            }
            return pythonPath;
        }
    }
    getPythonScriptPath() {
        if (this.isDev) {
            // In development, use src/python/convert.py from project root
            return path_1.default.join(process.cwd(), 'src/python/convert.py');
        }
        else {
            return path_1.default.join(process.resourcesPath, 'resources', 'python', 'convert.py');
        }
    }
    cancelConversion() {
        if (this.pythonProcess) {
            this.pythonProcess.kill();
            this.pythonProcess = null;
        }
    }
    cleanup() {
        this.cancelConversion();
    }
}
exports.PythonConverter = PythonConverter;
