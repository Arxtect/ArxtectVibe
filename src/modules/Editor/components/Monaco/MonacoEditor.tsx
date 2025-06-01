import React, { useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { EditorSettings } from '../../types'

interface MonacoEditorProps {
  value: string
  language: string
  theme: string
  settings: EditorSettings
  onChange: (content: string) => void
}

const MonacoEditor: React.FC<MonacoEditorProps> = ({
  value,
  language,
  theme,
  settings,
  onChange
}) => {
  // Monaco Editor 挂载前的配置
  const handleBeforeMount = (monaco: any) => {
    // 注册 LaTeX 语言支持
    if (!monaco.languages.getLanguages().some((lang: any) => lang.id === 'latex')) {
      monaco.languages.register({ id: 'latex' })
      
      // 设置 LaTeX 语法高亮
      monaco.languages.setMonarchTokensProvider('latex', {
        tokenizer: {
          root: [
            // LaTeX 命令
            [/\\[a-zA-Z@]+/, 'keyword'],
            [/\\[^a-zA-Z@]/, 'keyword'],
            
            // 数学模式
            [/\$\$/, 'string', '@mathBlockMode'],
            [/\$/, 'string', '@mathInlineMode'],
            [/\\\[/, 'string', '@mathDisplayMode'],
            [/\\\(/, 'string', '@mathInlineMode2'],
            
            // 环境
            [/\\begin\{[^}]+\}/, 'tag'],
            [/\\end\{[^}]+\}/, 'tag'],
            
            // 大括号参数
            [/\{/, 'delimiter.bracket', '@bracketMode'],
            [/\[/, 'delimiter.square', '@squareBracketMode'],
            
            // 注释
            [/%.*$/, 'comment'],
            
            // 数字
            [/\d+/, 'number'],
          ],
          
          mathBlockMode: [
            [/\$\$/, 'string', '@pop'],
            [/./, 'string.math']
          ],
          
          mathInlineMode: [
            [/\$/, 'string', '@pop'],
            [/./, 'string.math']
          ],
          
          mathDisplayMode: [
            [/\\\]/, 'string', '@pop'],
            [/./, 'string.math']
          ],
          
          mathInlineMode2: [
            [/\\\)/, 'string', '@pop'],
            [/./, 'string.math']
          ],
          
          bracketMode: [
            [/\{/, 'delimiter.bracket', '@bracketMode'],
            [/\}/, 'delimiter.bracket', '@pop'],
            [/./, 'text']
          ],
          
          squareBracketMode: [
            [/\[/, 'delimiter.square', '@squareBracketMode'],
            [/\]/, 'delimiter.square', '@pop'],
            [/./, 'text']
          ]
        }
      })
      
      // 设置语言配置
      monaco.languages.setLanguageConfiguration('latex', {
        comments: {
          lineComment: '%'
        },
        brackets: [
          ['{', '}'],
          ['[', ']'],
          ['(', ')']
        ],
        autoClosingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '$', close: '$' },
          { open: '$$', close: '$$' }
        ],
        surroundingPairs: [
          { open: '{', close: '}' },
          { open: '[', close: ']' },
          { open: '(', close: ')' },
          { open: '$', close: '$' }
        ],
        folding: {
          markers: {
            start: /\\begin\{[^}]+\}/,
            end: /\\end\{[^}]+\}/
          }
        }
      })
      
      // 注册自动补全提供者
      monaco.languages.registerCompletionItemProvider('latex', {
        provideCompletionItems: (model: any, position: any) => {
          const suggestions = [
            {
              label: 'documentclass',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'documentclass{${1:article}}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Document class declaration'
            },
            {
              label: 'usepackage',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'usepackage{${1:package}}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Load a package'
            },
            {
              label: 'begin',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'begin{${1:environment}}\n\t$0\n\\end{${1:environment}}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Begin environment'
            },
            {
              label: 'section',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'section{${1:title}}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Section heading'
            },
            {
              label: 'subsection',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'subsection{${1:title}}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Subsection heading'
            },
            {
              label: 'textbf',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'textbf{${1:text}}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Bold text'
            },
            {
              label: 'textit',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'textit{${1:text}}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Italic text'
            },
            {
              label: 'equation',
              kind: monaco.languages.CompletionItemKind.Snippet,
              insertText: 'begin{equation}\n\t${1:formula}\n\\end{equation}',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Numbered equation'
            }
          ]
          
          return { suggestions }
        }
      })
    }
    
    // 定义自定义主题
    monaco.editor.defineTheme('latex-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '569cd6' },
        { token: 'string.math', foreground: 'ce9178' },
        { token: 'tag', foreground: '4ec9b0' },
        { token: 'comment', foreground: '6a9955' },
        { token: 'delimiter.bracket', foreground: 'ffd700' },
        { token: 'delimiter.square', foreground: 'da70d6' }
      ],
      colors: {
        'editor.background': '#1e1e1e'
      }
    })
    
    monaco.editor.defineTheme('latex-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'keyword', foreground: '0000ff' },
        { token: 'string.math', foreground: 'a31515' },
        { token: 'tag', foreground: '008000' },
        { token: 'comment', foreground: '008000' },
        { token: 'delimiter.bracket', foreground: 'ff8c00' },
        { token: 'delimiter.square', foreground: '9932cc' }
      ],
      colors: {
        'editor.background': '#ffffff'
      }
    })
  }

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(value)
    }
  }

  // 根据主题选择合适的 Monaco 主题
  const getMonacoTheme = () => {
    if (theme.includes('dark')) return 'latex-dark'
    if (theme.includes('light')) return 'latex-light'
    return 'vs-dark'
  }

  return (
    <div className="h-full">
      <Editor
        height="100%"
        language={language}
        theme={getMonacoTheme()}
        value={value}
        onChange={handleEditorChange}
        beforeMount={handleBeforeMount}
        options={{
          fontSize: settings.fontSize,
          tabSize: settings.tabSize,
          wordWrap: settings.wordWrap ? 'on' : 'off',
          minimap: { enabled: settings.minimap },
          lineNumbers: settings.lineNumbers ? 'on' : 'off',
          automaticLayout: true,
          scrollBeyondLastLine: false,
          renderWhitespace: 'selection',
          selectOnLineNumbers: true,
          roundedSelection: false,
          readOnly: false,
          cursorStyle: 'line',
          mouseWheelZoom: true,
          contextmenu: true,
          quickSuggestions: {
            other: true,
            comments: false,
            strings: true
          },
          parameterHints: {
            enabled: true
          },
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnEnter: 'on',
          tabCompletion: 'on',
          wordBasedSuggestions: 'currentDocument',
          // LaTeX 特定配置
          autoIndent: 'full',
          formatOnPaste: true,
          formatOnType: true,
          folding: true,
          foldingStrategy: 'auto',
          showFoldingControls: 'always',
          matchBrackets: 'always',
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          autoSurround: 'languageDefined'
        }}
        loading={
          <div className="h-full flex items-center justify-center bg-gray-900 text-gray-100">
            <div className="text-center">
              <div className="text-lg">Loading Monaco Editor...</div>
              <div className="text-sm text-gray-400 mt-2">LaTeX syntax highlighting ready</div>
            </div>
          </div>
        }
      />
    </div>
  )
}

export default MonacoEditor 