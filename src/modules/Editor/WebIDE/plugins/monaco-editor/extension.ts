import React from 'react'
import { IPlugin, IPluginContext, ICustomEditorProvider } from '../../types'

// LaTeX 正则表达式常量
const TEX_COMMANDS_REGEX = /\\[a-zA-Z]+/
const MATH_COMMANDS_REGEX = /\$[^$]*\$/

// LaTeX 语言定义
const LATEX_LANGUAGE_CONFIG = {
  id: 'latex',
  extensions: ['.tex'],
  aliases: ['LaTeX', 'latex'],
  mimetypes: ['text/x-latex']
}

const LATEX_LANGUAGE_DEFINITION = {
  keywords: [
    'documentclass', 'usepackage', 'begin', 'end', 'section', 'subsection',
    'subsubsection', 'paragraph', 'subparagraph', 'title', 'author', 'date',
    'maketitle', 'tableofcontents', 'item', 'label', 'ref', 'cite', 'bibliography',
    'includegraphics', 'caption', 'centering', 'textbf', 'textit', 'emph',
    'footnote', 'newpage', 'clearpage', 'pagebreak', 'newline', 'linebreak'
  ],
  
  environments: [
    'document', 'abstract', 'figure', 'table', 'equation', 'align', 'itemize',
    'enumerate', 'description', 'verbatim', 'quote', 'quotation', 'center',
    'flushleft', 'flushright', 'minipage', 'tabular', 'array'
  ],
  
  symbols: /[=><!~?:&|+\-*/^%]+/,
  
  tokenizer: {
    root: [
      // 注释
      [/%.*$/, 'comment'],
      
      // 命令
      [TEX_COMMANDS_REGEX, {
        cases: {
          '@keywords': 'keyword',
          '@default': 'tag'
        }
      }],
      
      // 环境
      [/\\begin\{([^}]+)\}/, 'keyword', '@environment.$1'],
      [/\\end\{([^}]+)\}/, 'keyword'],
      
      // 数学模式
      [MATH_COMMANDS_REGEX, 'string', '@math_display'],
      [/\$/, 'string', '@math_inline'],
      [/\\\[/, 'string', '@math_display'],
      [/\\\(/, 'string', '@math_inline'],
      
      // 花括号参数
      [/\{/, 'delimiter.curly', '@braces'],
      [/\[/, 'delimiter.square', '@brackets'],
      
      // 特殊字符
      [/[{}[\]()]/, '@brackets'],
      [/[&|~^%$#]/, 'keyword.operator'],
    ],
    
    environment: [
      [/\\end\{$S2\}/, 'keyword', '@pop'],
      [/[^\\]+/, 'string'],
      [TEX_COMMANDS_REGEX, 'tag'],
      [/./, 'string']
    ],
    
    math_display: [
      [MATH_COMMANDS_REGEX, 'string', '@pop'],
      [/\\\]/, 'string', '@pop'],
      [TEX_COMMANDS_REGEX, 'keyword'],
      [/[^\\$]+/, 'number'],
      [/./, 'number']
    ],
    
    math_inline: [
      [/\$/, 'string', '@pop'],
      [/\\\)/, 'string', '@pop'],
      [TEX_COMMANDS_REGEX, 'keyword'],
      [/[^\\$]+/, 'number'],
      [/./, 'number']
    ],
    
    braces: [
      [/[^{}]+/, 'string'],
      [/\{/, 'delimiter.curly', '@push'],
      [/\}/, 'delimiter.curly', '@pop']
    ],
    
    brackets: [
      [/[^[\]]+/, 'string'],
      [/\[/, 'delimiter.square', '@push'],
      [/\]/, 'delimiter.square', '@pop']
    ]
  }
}

// LaTeX 自动补全项
const LATEX_COMPLETIONS = [
  // 文档结构
  { label: 'documentclass', insertText: 'documentclass{${1:article}}', detail: 'Document class' },
  { label: 'usepackage', insertText: 'usepackage{${1:package}}', detail: 'Use package' },
  { label: 'begin', insertText: 'begin{${1:environment}}\n\t$0\n\\end{${1:environment}}', detail: 'Begin environment' },
  { label: 'section', insertText: 'section{${1:title}}', detail: 'Section' },
  { label: 'subsection', insertText: 'subsection{${1:title}}', detail: 'Subsection' },
  { label: 'subsubsection', insertText: 'subsubsection{${1:title}}', detail: 'Subsubsection' },
  
  // 格式化
  { label: 'textbf', insertText: 'textbf{${1:text}}', detail: 'Bold text' },
  { label: 'textit', insertText: 'textit{${1:text}}', detail: 'Italic text' },
  { label: 'emph', insertText: 'emph{${1:text}}', detail: 'Emphasized text' },
  { label: 'texttt', insertText: 'texttt{${1:text}}', detail: 'Typewriter text' },
  
  // 数学
  { label: 'equation', insertText: 'begin{equation}\n\t${1:formula}\n\\end{equation}', detail: 'Equation environment' },
  { label: 'align', insertText: 'begin{align}\n\t${1:formula}\n\\end{align}', detail: 'Align environment' },
  { label: 'frac', insertText: 'frac{${1:numerator}}{${2:denominator}}', detail: 'Fraction' },
  { label: 'sum', insertText: 'sum_{${1:i=1}}^{${2:n}}', detail: 'Summation' },
  { label: 'int', insertText: 'int_{${1:a}}^{${2:b}}', detail: 'Integral' },
  
  // 列表
  { label: 'itemize', insertText: 'begin{itemize}\n\t\\item ${1:item}\n\\end{itemize}', detail: 'Itemize list' },
  { label: 'enumerate', insertText: 'begin{enumerate}\n\t\\item ${1:item}\n\\end{enumerate}', detail: 'Enumerate list' },
  { label: 'item', insertText: 'item ${1:text}', detail: 'List item' },
  
  // 图表
  { label: 'figure', insertText: 'begin{figure}[h]\n\t\\centering\n\t\\includegraphics{${1:filename}}\n\t\\caption{${2:caption}}\n\\end{figure}', detail: 'Figure environment' },
  { label: 'table', insertText: 'begin{table}[h]\n\t\\centering\n\t\\begin{tabular}{${1:cols}}\n\t\t${2:content}\n\t\\end{tabular}\n\t\\caption{${3:caption}}\n\\end{table}', detail: 'Table environment' },
  
  // 常用包
  { label: 'amsmath', insertText: 'usepackage{amsmath}', detail: 'AMS Math package' },
  { label: 'graphicx', insertText: 'usepackage{graphicx}', detail: 'Graphics package' },
  { label: 'hyperref', insertText: 'usepackage{hyperref}', detail: 'Hyperref package' },
  { label: 'geometry', insertText: 'usepackage{geometry}', detail: 'Page geometry package' }
]

class MonacoEditorProvider implements ICustomEditorProvider {
  readonly viewType = 'monacoEditor.textEditor'
  public editors = new Map<string, any>()
  
  canHandle(uri: string): boolean {
    return uri.endsWith('.tex') || uri.endsWith('.md') || uri.endsWith('.js') || uri.endsWith('.ts')
  }
  
  canEdit(_uri: string): boolean {
    return true
  }
  
  render(uri: string, content: Buffer): React.ReactElement {
    return React.createElement(MonacoEditorComponent, {
      uri,
      content,
      provider: this
    })
  }
}

const MonacoEditorComponent: React.FC<{
  uri: string
  content: Buffer
  provider: MonacoEditorProvider
}> = ({ uri, content, provider }) => {
  const editorRef = React.useRef<HTMLDivElement>(null)
  const [editor, setEditor] = React.useState<any>(null)

  React.useEffect(() => {
    if (!editorRef.current) return

    // 动态导入 Monaco Editor
    import('monaco-editor').then((monacoInstance) => {
      
      // 注册 LaTeX 语言
      try {
        monacoInstance.languages.register(LATEX_LANGUAGE_CONFIG)
        monacoInstance.languages.setMonarchTokensProvider('latex', LATEX_LANGUAGE_DEFINITION as any)
      } catch (error) {
        console.warn('[MonacoEditor] Failed to register LaTeX language:', error)
      }
      
      // 设置 LaTeX 自动补全
      monacoInstance.languages.registerCompletionItemProvider('latex', {
        provideCompletionItems: (model, position) => {
          const word = model.getWordUntilPosition(position)
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn
          }
          
          return {
            suggestions: LATEX_COMPLETIONS.map(completion => ({
              label: completion.label,
              kind: monacoInstance.languages.CompletionItemKind.Snippet,
              insertText: completion.insertText,
              insertTextRules: monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              detail: completion.detail,
              range: range
            }))
          }
        }
      })
      
      // 获取文本内容
      const getTextContent = (buffer: Buffer): string => {
        try {
          if (buffer instanceof Uint8Array) {
            const decoder = new TextDecoder('utf-8')
            return decoder.decode(buffer)
          }
          const decoder = new TextDecoder('utf-8')
          return decoder.decode(new Uint8Array(buffer as any))
        } catch (error) {
          console.error('[MonacoEditor] Failed to decode content:', error)
          return ''
        }
      }
      
      const textContent = getTextContent(content)
      const language = uri.endsWith('.tex') ? 'latex' : 
                      uri.endsWith('.md') ? 'markdown' :
                      uri.endsWith('.ts') ? 'typescript' : 'javascript'
      
      // 创建编辑器
      const editorInstance = monacoInstance.editor.create(editorRef.current!, {
        value: textContent,
        language: language,
        theme: 'vs-dark',
        fontSize: 14,
        lineNumbers: 'on',
        renderLineHighlight: 'all',
        minimap: {
          enabled: true
        },
        wordWrap: 'on',
        automaticLayout: true,
        scrollBeyondLastLine: false,
        formatOnPaste: true,
        formatOnType: true,
        suggestOnTriggerCharacters: true,
        quickSuggestions: {
          other: true,
          comments: false,
          strings: false
        },
        parameterHints: {
          enabled: true
        },
        hover: {
          enabled: true
        },
        folding: true,
        foldingStrategy: 'indentation',
        showFoldingControls: 'always',
        bracketPairColorization: {
          enabled: true
        },
        guides: {
          bracketPairs: true,
          indentation: true
        }
      })
      
      setEditor(editorInstance)
      provider.editors.set(uri, editorInstance)
      
      // 监听内容变化
      editorInstance.onDidChangeModelContent(() => {
        // 这里可以实现自动保存或实时同步
        console.log('[MonacoEditor] Content changed for:', uri)
      })
      
      // 监听光标位置变化
      editorInstance.onDidChangeCursorPosition((e) => {
        console.log('[MonacoEditor] Cursor position:', e.position)
      })
    })
    
    return () => {
      if (editor) {
        editor.dispose()
        provider.editors.delete(uri)
      }
    }
  }, [uri])

  return React.createElement('div', {
    ref: editorRef,
    style: { height: '100%', width: '100%' }
  })
}

export class MonacoEditorPlugin implements IPlugin {
  readonly id = 'monaco-editor'
  readonly name = 'Monaco Editor'
  readonly version = '1.0.0'
  readonly description = 'Advanced code editor with syntax highlighting and auto-completion'

  private provider: MonacoEditorProvider

  constructor() {
    this.provider = new MonacoEditorProvider()
  }

  async activate(context: IPluginContext): Promise<void> {
    console.log('[MonacoEditor] Activating Monaco Editor plugin')

    // 注册自定义编辑器
    const registration = context.customEditors.registerCustomEditor(
      'monacoEditor.textEditor',
      this.provider
    )

    // 注册命令
    const formatCommand = context.commands.registerCommand(
      'monacoEditor.format',
      this.formatDocument.bind(this)
    )

    const toggleMinimapCommand = context.commands.registerCommand(
      'monacoEditor.toggleMinimap',
      this.toggleMinimap.bind(this)
    )

    const toggleWordWrapCommand = context.commands.registerCommand(
      'monacoEditor.toggleWordWrap',
      this.toggleWordWrap.bind(this)
    )

    context.subscriptions.push(registration, formatCommand, toggleMinimapCommand, toggleWordWrapCommand)
    
    console.log('[MonacoEditor] Monaco Editor plugin activated successfully')
  }

  async deactivate(): Promise<void> {
    console.log('[MonacoEditor] Deactivating Monaco Editor plugin')
    
    // 清理编辑器实例
    for (const editor of this.provider.editors.values()) {
      editor.dispose()
    }
    this.provider.editors.clear()
  }

  private formatDocument(): void {
    console.log('[MonacoEditor] Formatting document')
    // 获取当前活动编辑器并格式化
    // 实现格式化逻辑
  }

  private toggleMinimap(): void {
    console.log('[MonacoEditor] Toggling minimap')
    // 实现切换小地图显示
  }

  private toggleWordWrap(): void {
    console.log('[MonacoEditor] Toggling word wrap')
    // 实现切换自动换行
  }
}

export default MonacoEditorPlugin 