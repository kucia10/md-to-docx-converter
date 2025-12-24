import { spawn, ChildProcess } from 'child_process'
import path from 'path'

export interface ConversionOptions {
  fontSize?: number
  fontFamily?: string
  lineHeight?: number
  marginTop?: number
  marginBottom?: number
  marginLeft?: number
  marginRight?: number
  orientation?: 'portrait' | 'landscape'
  generateToc?: boolean
}

export class PythonConverter {
  private pythonProcess: ChildProcess | null = null
  private isDev: boolean

  constructor() {
    this.isDev = process.env.NODE_ENV === 'development'
  }

  async convertMarkdownToDocx(
    inputPath: string,
    outputPath: string,
    options: ConversionOptions = {}
  ): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve, reject) => {
      const scriptPath = this.getPythonScriptPath()
      const pythonPath = this.getPythonPath()

      const args = [
        scriptPath,
        '--input', inputPath,
        '--output', outputPath,
      ]

      // Add options as command line arguments
      if (options.fontSize) args.push('--font-size', options.fontSize.toString())
      if (options.fontFamily) args.push('--font-family', options.fontFamily)
      if (options.lineHeight) args.push('--line-height', options.lineHeight.toString())
      if (options.marginTop) args.push('--margin-top', options.marginTop.toString())
      if (options.marginBottom) args.push('--margin-bottom', options.marginBottom.toString())
      if (options.marginLeft) args.push('--margin-left', options.marginLeft.toString())
      if (options.marginRight) args.push('--margin-right', options.marginRight.toString())
      if (options.orientation) args.push('--orientation', options.orientation)
      if (options.generateToc) args.push('--generate-toc')

      this.pythonProcess = spawn(pythonPath, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          PYTHONIOENCODING: 'utf-8',
        },
      })

      let stdout = ''
      let stderr = ''

      this.pythonProcess.stdout?.on('data', (data) => {
        stdout += data.toString()
      })

      this.pythonProcess.stderr?.on('data', (data) => {
        stderr += data.toString()
      })

      this.pythonProcess.on('close', (code) => {
        this.pythonProcess = null
        
        console.log('[Converter] Python process closed with code:', code)
        console.log('[Converter] stdout:', stdout)
        console.log('[Converter] stderr:', stderr)
        
        if (code === 0) {
          resolve({ success: true, message: 'Conversion completed successfully' })
        } else {
          reject(new Error(`Conversion failed with code ${code}: ${stderr || stdout}`))
        }
      })

      this.pythonProcess.on('error', (error) => {
        this.pythonProcess = null
        reject(new Error(`Python process error: ${error.message}`))
      })
    })
  }

  private getPythonPath(): string {
    if (this.isDev) {
      // In development, use system Python
      return 'python3'
    } else {
      // In production, use bundled Python
      const pythonPath = path.join((process as any).resourcesPath, 'resources', 'python', 'python')
      if (process.platform === 'win32') {
        return pythonPath + '.exe'
      }
      return pythonPath
    }
  }

  private getPythonScriptPath(): string {
    if (this.isDev) {
      // In development, use src/python/convert.py from project root
      return path.join(process.cwd(), 'src/python/convert.py')
    } else {
      return path.join((process as any).resourcesPath, 'resources', 'python', 'convert.py')
    }
  }

  cancelConversion(): void {
    if (this.pythonProcess) {
      this.pythonProcess.kill()
      this.pythonProcess = null
    }
  }

  cleanup(): void {
    this.cancelConversion()
  }
}