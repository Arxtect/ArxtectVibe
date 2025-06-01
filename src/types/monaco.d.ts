declare module 'monaco-editor' {
  export * from 'monaco-editor/esm/vs/editor/editor.api'
}

declare module '@monaco-editor/react' {
  import * as React from 'react'
  
  export interface EditorProps {
    value?: string
    language?: string
    theme?: string
    height?: string
    width?: string
    onChange?: (value: string | undefined) => void
    beforeMount?: (monaco: any) => void
    options?: any
    loading?: React.ReactNode
    // ... 其他属性
  }
  
  export const Editor: React.FC<EditorProps>
  export default Editor
} 