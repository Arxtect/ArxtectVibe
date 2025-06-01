import { useRef, useEffect, useState, useCallback } from 'react'
import { MonacoEditorInstance, EditorSettings } from '../types'

export interface UseMonacoEditorOptions {
  value?: string
  language?: string
  theme?: string
  settings?: Partial<EditorSettings>
  onChange?: (value: string) => void
  onCursorPositionChanged?: (position: { lineNumber: number; column: number }) => void
}

export function useMonacoEditor(options: UseMonacoEditorOptions = {}) {
  const editorRef = useRef<MonacoEditorInstance | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [value, setValue] = useState(options.value || '')

  // 初始化编辑器
  const initializeEditor = useCallback(async () => {
    if (!containerRef.current) return

    try {
      // 动态导入 Monaco Editor
      const monaco = await import('monaco-editor')
      
      // 配置 LaTeX 语言支持
      if (!monaco.languages.getLanguages().some((lang: any) => lang.id === 'latex')) {
        await import('../components/Monaco/LaTeXLanguage')
      }

      // 创建编辑器实例
      const editor = monaco.editor.create(containerRef.current, {
        value: options.value || '',
        language: options.language || 'latex',
        theme: options.theme || 'vs-dark',
        fontSize: options.settings?.fontSize || 14,
        tabSize: options.settings?.tabSize || 2,
        wordWrap: options.settings?.wordWrap ? 'on' : 'off',
        minimap: { enabled: options.settings?.minimap ?? true },
        lineNumbers: options.settings?.lineNumbers ? 'on' : 'off',
        automaticLayout: true,
        scrollBeyondLastLine: false,
        renderWhitespace: 'selection',
        selectOnLineNumbers: true,
        roundedSelection: false,
        readOnly: false,
        cursorStyle: 'line',
        mouseWheelZoom: true,
      })

      // 监听内容变化
      editor.onDidChangeModelContent(() => {
        const newValue = editor.getValue()
        setValue(newValue)
        options.onChange?.(newValue)
      })

      // 监听光标位置变化
      editor.onDidChangeCursorPosition((e: any) => {
        options.onCursorPositionChanged?.(e.position)
      })

      // 创建 MonacoEditorInstance 包装器
      const editorInstance: MonacoEditorInstance = {
        getValue: () => editor.getValue(),
        setValue: (newValue: string) => {
          editor.setValue(newValue)
          setValue(newValue)
        },
        getPosition: () => {
          const position = editor.getPosition()
          return { lineNumber: position?.lineNumber || 1, column: position?.column || 1 }
        },
        setPosition: (position: { lineNumber: number; column: number }) => {
          editor.setPosition(position)
        },
        focus: () => {
          editor.focus()
        },
        dispose: () => {
          editor.dispose()
        }
      }

      editorRef.current = editorInstance
      setIsReady(true)
    } catch (error) {
      console.error('Failed to initialize Monaco Editor:', error)
    }
  }, [options])

  // 更新编辑器值
  const updateValue = useCallback((newValue: string) => {
    if (editorRef.current && newValue !== value) {
      editorRef.current.setValue(newValue)
      setValue(newValue)
    }
  }, [value])

  // 获取编辑器值
  const getValue = useCallback(() => {
    return editorRef.current?.getValue() || value
  }, [value])

  // 设置光标位置
  const setPosition = useCallback((position: { lineNumber: number; column: number }) => {
    editorRef.current?.setPosition(position)
  }, [])

  // 聚焦编辑器
  const focus = useCallback(() => {
    editorRef.current?.focus()
  }, [])

  // 清理
  useEffect(() => {
    return () => {
      if (editorRef.current) {
        editorRef.current.dispose()
      }
    }
  }, [])

  return {
    containerRef,
    editor: editorRef.current,
    isReady,
    value,
    updateValue,
    getValue,
    setPosition,
    focus,
    initializeEditor,
  }
} 