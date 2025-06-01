import { CompileResult } from './compiler'

export interface EditorProps {
  projectId: string
  fileId?: string
  userId: string
  aiEnabled?: boolean
  collaborationEnabled?: boolean
  compilerEnabled?: boolean
  theme?: 'light' | 'dark' | 'auto'
  settings?: EditorSettings
  onSave?: (content: string) => void
  onCompile?: (result: CompileResult) => void
}

export interface EditorSettings {
  fontSize: number
  tabSize: number
  wordWrap: boolean
  minimap: boolean
  lineNumbers: boolean
  autoSave: boolean
  autoSaveDelay: number
  theme: string
  keybindings: Record<string, string>
}

export interface FileTab {
  fileId: string
  name: string
  path: string
  isDirty: boolean
  isActive: boolean
  content?: string
}

export interface EditorState {
  activeFileId: string | null
  openTabs: FileTab[]
  settings: EditorSettings
  isLoading: boolean
  error: string | null
}

export interface MonacoEditorInstance {
  getValue(): string
  setValue(value: string): void
  getPosition(): { lineNumber: number; column: number }
  setPosition(position: { lineNumber: number; column: number }): void
  focus(): void
  dispose(): void
} 