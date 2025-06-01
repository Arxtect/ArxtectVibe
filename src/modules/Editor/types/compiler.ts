export interface CompileResult {
  success: boolean
  pdf?: Uint8Array
  log: string
  errors: CompileError[]
  warnings: CompileWarning[]
  duration?: number
  timestamp?: number
}

export interface CompileError {
  type: 'error'
  message: string
  file?: string
  line?: number
  column?: number
  context?: string
  severity: 'error' | 'warning' | 'info'
}

export interface CompileWarning {
  type: 'warning'
  message: string
  file?: string
  line?: number
  column?: number
  context?: string
}

export interface CompilerConfig {
  engine: 'pdflatex' | 'xelatex' | 'lualatex'
  bibtex: boolean
  shell: boolean
  timeout: number
  outputFormat: 'pdf' | 'dvi' | 'ps'
}

export interface CompilerState {
  isCompiling: boolean
  lastResult?: CompileResult
  history: CompileResult[]
  config: CompilerConfig
}

export interface FileMap {
  [fileId: string]: {
    name: string
    content: string
    path: string
  }
} 