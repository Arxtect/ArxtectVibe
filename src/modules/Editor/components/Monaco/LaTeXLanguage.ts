// LaTeX 语言定义文件，用于 Monaco Editor
import * as monaco from 'monaco-editor'

export const latexLanguageDefinition = {
  keywords: [
    '\\documentclass', '\\begin', '\\end', '\\usepackage', '\\input', '\\include',
    '\\section', '\\subsection', '\\subsubsection', '\\paragraph', '\\subparagraph',
    '\\chapter', '\\part', '\\appendix', '\\tableofcontents', '\\listoffigures',
    '\\listoftables', '\\bibliography', '\\bibliographystyle', '\\cite', '\\label',
    '\\ref', '\\pageref', '\\index', '\\footnote', '\\marginpar'
  ],
  commands: [
    '\\textbf', '\\textit', '\\texttt', '\\emph', '\\underline', '\\overline',
    '\\textsc', '\\textsf', '\\textrm', '\\textsl', '\\textup', '\\textmd',
    '\\tiny', '\\scriptsize', '\\footnotesize', '\\small', '\\normalsize',
    '\\large', '\\Large', '\\LARGE', '\\huge', '\\Huge'
  ],
  environments: [
    'document', 'abstract', 'figure', 'table', 'equation', 'align', 'enumerate',
    'itemize', 'description', 'quote', 'quotation', 'verse', 'verbatim',
    'center', 'flushleft', 'flushright', 'minipage', 'tabular', 'array'
  ]
}

// 注册 LaTeX 语言支持
export function registerLatexLanguage() {
  // 检查是否已经注册
  if (monaco.languages.getLanguages().some(lang => lang.id === 'latex')) {
    return
  }

  // 注册语言
  monaco.languages.register({ id: 'latex' })

  // 设置语法高亮
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
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position)
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
      }

      const suggestions: monaco.languages.CompletionItem[] = [
        {
          label: 'documentclass',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'documentclass{${1:article}}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Document class declaration',
          range: range
        },
        {
          label: 'usepackage',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'usepackage{${1:package}}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Load a package',
          range: range
        },
        {
          label: 'begin',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'begin{${1:environment}}\n\t$0\n\\end{${1:environment}}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Begin environment',
          range: range
        },
        {
          label: 'section',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'section{${1:title}}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Section heading',
          range: range
        },
        {
          label: 'subsection',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'subsection{${1:title}}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Subsection heading',
          range: range
        },
        {
          label: 'textbf',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'textbf{${1:text}}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Bold text',
          range: range
        },
        {
          label: 'textit',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'textit{${1:text}}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Italic text',
          range: range
        },
        {
          label: 'equation',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'begin{equation}\n\t${1:formula}\n\\end{equation}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Numbered equation',
          range: range
        },
        {
          label: 'figure',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'begin{figure}[${1:htbp}]\n\t\\centering\n\t\\includegraphics{${2:image}}\n\t\\caption{${3:caption}}\n\t\\label{fig:${4:label}}\n\\end{figure}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Figure environment',
          range: range
        },
        {
          label: 'table',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: 'begin{table}[${1:htbp}]\n\t\\centering\n\t\\begin{tabular}{${2:|c|c|}}\n\t\t\\hline\n\t\t${3:Header 1} & ${4:Header 2} \\\\\n\t\t\\hline\n\t\t${5:Data 1} & ${6:Data 2} \\\\\n\t\t\\hline\n\t\\end{tabular}\n\t\\caption{${7:caption}}\n\t\\label{tab:${8:label}}\n\\end{table}',
          insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          documentation: 'Table environment',
          range: range
        }
      ]
      
      return { suggestions }
    }
  })

  console.log('LaTeX language support registered for Monaco Editor')
}

// 自动注册语言支持
registerLatexLanguage() 