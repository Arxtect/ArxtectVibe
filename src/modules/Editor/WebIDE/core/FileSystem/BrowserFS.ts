import { IFileSystem, Stats, Watcher } from '../../types'

// 在浏览器环境中创建 Buffer 兼容接口
const createBuffer = (data: string | Uint8Array): Buffer => {
  if (typeof data === 'string') {
    const encoder = new TextEncoder()
    return new Uint8Array(encoder.encode(data)) as unknown as Buffer
  }
  return data as unknown as Buffer
}

// Mock BrowserFS implementation until we install the actual package
// This provides the interface we need for development

class MockWatcher implements Watcher {
  private listeners: Array<(event: string, filename: string) => void> = []
  
  constructor(callback: (event: string, filename: string) => void) {
    this.listeners.push(callback)
  }
  
  dispose(): void {
    this.listeners.length = 0
  }
}

/**
 * BrowserFS 文件系统实现
 * 提供浏览器环境下的文件系统操作接口
 */
export class BrowserFileSystem implements IFileSystem {
  private initialized = false
  private storage = new Map<string, Buffer>()
  private directories = new Set<string>()
  
  constructor() {
    // 添加根目录和基础结构
    this.directories.add('/')
    this.directories.add('/projects')
    this.directories.add('/tmp')
    this.directories.add('/plugins')
    
    // 添加用户目录结构
    this.directories.add('/projects/demo')
    this.directories.add('/projects/alice')
    this.directories.add('/projects/bob')
    this.directories.add('/projects/guest')
  }

  /**
   * 初始化文件系统
   */
  async initialize(): Promise<void> {
    if (this.initialized) return
    
    try {
      // 在实际实现中，这里会配置 BrowserFS
      // const BrowserFS = await import('browserfs')
      // await BrowserFS.configure({
      //   fs: "MountableFileSystem",
      //   options: {
      //     "/": { fs: "IndexedDB", options: {} },
      //     "/tmp": { fs: "InMemory", options: {} },
      //     "/projects": { fs: "IndexedDB", options: {} },
      //     "/plugins": { fs: "HTTPRequest", options: {} }
      //   }
      // })
      
      // Mock 初始化
      console.log('[BrowserFS] Initializing mock file system...')
      this.initialized = true
      
      // 创建一些默认文件用于测试
      await this.setupDefaultFiles()
      
    } catch (error) {
      console.error('[BrowserFS] Failed to initialize:', error)
      throw new Error('Failed to initialize file system')
    }
  }

  private async setupDefaultFiles(): Promise<void> {
    // 为每个用户创建示例项目
    const users = ['demo', 'alice', 'bob', 'guest']
    
    for (const user of users) {
      // 创建用户的项目目录
      await this.mkdir(`/projects/${user}/demo-project`)
      await this.mkdir(`/projects/${user}/demo-project/sections`)
      await this.mkdir(`/projects/${user}/demo-project/figures`)
      
      // 创建示例 LaTeX 文件
      await this.writeFile(`/projects/${user}/demo-project/main.tex`, 
        createBuffer(`\\documentclass[12pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[english]{babel}
\\usepackage{amsmath,amsfonts,amssymb}
\\usepackage{graphicx}
\\usepackage{hyperref}
\\usepackage{geometry}
\\usepackage{fancyhdr}
\\usepackage{listings}
\\usepackage{xcolor}

% 页面设置
\\geometry{margin=1in}
\\pagestyle{fancy}
\\fancyhf{}
\\rhead{\\thepage}
\\lhead{${user.charAt(0).toUpperCase() + user.slice(1)}'s LaTeX Document}

% 代码高亮设置
\\lstdefinestyle{latexcode}{
    backgroundcolor=\\color{gray!10},
    commentstyle=\\color{green!60!black},
    keywordstyle=\\color{blue},
    numberstyle=\\tiny\\color{gray},
    stringstyle=\\color{orange},
    basicstyle=\\ttfamily\\footnotesize,
    breaklines=true,
    captionpos=b,
    keepspaces=true,
    numbers=left,
    numbersep=5pt,
    showspaces=false,
    showstringspaces=false,
    showtabs=false,
    tabsize=2,
    frame=single
}

\\title{WebIDE Demonstration Document\\\\
       {\\large Advanced LaTeX Editing Environment}}
\\author{${user.charAt(0).toUpperCase() + user.slice(1)}\\\\
        \\texttt{${user}@webide.dev}}
\\date{\\today}

\\begin{document}

\\maketitle
\\tableofcontents
\\newpage

\\section{Introduction}

Welcome to the WebIDE LaTeX editing environment! This document demonstrates the capabilities of our VS Code-style web-based IDE with advanced features including:

\\begin{itemize}
    \\item \\textbf{Monaco Editor Integration}: Professional code editing with syntax highlighting
    \\item \\textbf{AI Assistant}: Intelligent LaTeX suggestions and completions
    \\item \\textbf{Plugin Architecture}: Extensible system with custom plugins
    \\item \\textbf{Real-time Collaboration}: Multi-user editing with conflict resolution
    \\item \\textbf{PDF Preview}: Instant document compilation and preview
\\end{itemize}

\\subsection{User Workspace}

This is ${user}'s personal workspace within the WebIDE environment. Each user has isolated project spaces ensuring privacy and preventing conflicts between different users' work.

\\section{LaTeX Features}

\\subsection{Mathematical Expressions}

The WebIDE supports full LaTeX mathematical typesetting:

\\begin{equation}
    E = mc^2
\\end{equation}

\\begin{align}
    \\nabla \\cdot \\mathbf{E} &= \\frac{\\rho}{\\epsilon_0} \\\\
    \\nabla \\cdot \\mathbf{B} &= 0 \\\\
    \\nabla \\times \\mathbf{E} &= -\\frac{\\partial \\mathbf{B}}{\\partial t} \\\\
    \\nabla \\times \\mathbf{B} &= \\mu_0\\mathbf{J} + \\mu_0\\epsilon_0\\frac{\\partial \\mathbf{E}}{\\partial t}
\\end{align}

\\subsection{Code Listings}

Here's an example of how to include code in your LaTeX documents:

\\begin{lstlisting}[style=latexcode, caption=Example LaTeX Code]
\\documentclass{article}
\\begin{document}
    Hello, WebIDE!
    
    \\[ \\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2} \\]
\\end{document}
\\end{lstlisting}

\\section{Plugin System}

The WebIDE features a powerful plugin system that enables:

\\begin{description}
    \\item[PDF Viewer] View compiled documents directly in the IDE
    \\item[AI Assistant] Get intelligent suggestions for LaTeX commands and structures
    \\item[Monaco Editor] Advanced text editing with syntax highlighting and auto-completion
    \\item[Plugin Manager] Easily manage, enable, and disable plugins
\\end{description}

\\section{Collaboration Features}

\\subsection{Real-time Editing}

Multiple users can edit the same document simultaneously with real-time synchronization using Yjs CRDT technology.

\\subsection{User Isolation}

Each user (\\texttt{${user}}) has their own isolated workspace:
\\begin{verbatim}
/projects/${user}/demo-project/
├── main.tex          # Main document
├── sections/          # Document sections
├── figures/           # Images and diagrams
└── references.bib     # Bibliography
\\end{verbatim}

\\section{Getting Started}

\\begin{enumerate}
    \\item Open files using the file explorer on the left
    \\item Edit documents with full LaTeX syntax highlighting
    \\item Use Ctrl+Space for auto-completion suggestions
    \\item Access the AI assistant for writing help
    \\item Manage plugins through the Plugin Manager
    \\item Preview your compiled PDF in real-time
\\end{enumerate}

\\section{Conclusion}

The WebIDE provides a comprehensive LaTeX editing environment that combines the power of professional tools with the convenience of web-based access. Whether you're writing academic papers, technical documentation, or books, WebIDE offers all the features you need.

\\textit{Happy editing with WebIDE!}

\\end{document}`))

      // 创建一个更真实的 PDF 文件（简化的 PDF 结构）
      const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/Resources <<
  /Font <<
    /F1 4 0 R
  >>
>>
/MediaBox [0 0 612 792]
/Contents 5 0 R
>>
endobj

4 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Times-Roman
>>
endobj

5 0 obj
<<
/Length 200
>>
stream
BT
/F1 24 Tf
100 700 Td
(WebIDE PDF Viewer Demo) Tj
0 -50 Td
/F1 12 Tf
(This is a sample PDF file for ${user}) Tj
0 -30 Td
(Generated for WebIDE demonstration) Tj
0 -30 Td
(Date: ${new Date().toISOString().split('T')[0]}) Tj
0 -50 Td
(Features:) Tj
0 -20 Td
(• PDF viewing in browser) Tj
0 -20 Td
(• Plugin-based architecture) Tj
0 -20 Td
(• Real-time collaboration) Tj
ET
endstream
endobj

xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000079 00000 n 
0000000173 00000 n 
0000000301 00000 n 
0000000380 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
732
%%EOF`

      await this.writeFile(`/projects/${user}/demo-project/sample.pdf`, 
        createBuffer(pdfContent))
        
      // 创建章节文件
      await this.writeFile(`/projects/${user}/demo-project/sections/introduction.tex`, 
        createBuffer(`% Introduction section for ${user}'s document
\\section{Introduction}

This introduction section demonstrates modular LaTeX document organization.

\\subsection{Document Structure}
This document is organized using separate files for each major section, making it easier to manage large documents.

\\subsection{WebIDE Features}
The WebIDE environment provides:
\\begin{itemize}
    \\item File-based project organization
    \\item Multi-file LaTeX support
    \\item Plugin extensibility
    \\item User workspace isolation
\\end{itemize}`))

      // 创建参考文献文件
      await this.writeFile(`/projects/${user}/demo-project/references.bib`, 
        createBuffer(`@article{webide2024,
    title={WebIDE: A Modern Web-Based LaTeX Editing Environment},
    author={${user.charAt(0).toUpperCase() + user.slice(1)}, A. and WebIDE Team},
    journal={Journal of Web-Based Development Tools},
    volume={1},
    number={1},
    pages={1--10},
    year={2024},
    publisher={WebIDE Press}
}

@inproceedings{latex2023,
    title={Modern LaTeX Editing in the Browser},
    author={Doe, John and Smith, Jane},
    booktitle={Proceedings of the International Conference on Document Processing},
    pages={123--130},
    year={2023},
    organization={ACM}
}

@book{knuth1984,
    title={The TeXbook},
    author={Knuth, Donald E.},
    year={1984},
    publisher={Addison-Wesley}
}`))
        
      // 创建项目说明文件
      await this.writeFile(`/projects/${user}/demo-project/README.md`, 
        createBuffer(`# ${user}'s WebIDE Demo Project

Welcome to your personal demonstration project in the WebIDE environment!

## 📁 Project Structure

\`\`\`
demo-project/
├── main.tex              # Main LaTeX document
├── sections/
│   └── introduction.tex  # Modular section files
├── figures/              # Directory for images
├── sample.pdf            # Example PDF file
├── references.bib        # Bibliography database
└── README.md            # This file
\`\`\`

## 🚀 Getting Started

1. **Edit LaTeX Files**: Click on \`main.tex\` to start editing your document
2. **Monaco Editor**: Enjoy professional code editing with syntax highlighting
3. **Auto-completion**: Press \`Ctrl+Space\` for LaTeX command suggestions
4. **AI Assistant**: Right-click for AI-powered writing assistance
5. **Plugin Manager**: Access via \`Ctrl+Shift+P\` to manage plugins

## 🔧 Features Demonstrated

### Monaco Editor
- ✅ LaTeX syntax highlighting
- ✅ Line numbers and code folding
- ✅ Auto-completion with snippets
- ✅ Error detection and highlighting
- ✅ Minimap for navigation

### Plugin System
- ✅ PDF Viewer for document preview
- ✅ AI Assistant for writing help
- ✅ Plugin Manager for extension management
- ✅ Extensible architecture

### User Isolation
- ✅ Personal workspace: \`/projects/${user}/\`
- ✅ Isolated from other users
- ✅ Secure project management

## 📚 LaTeX Features

This project demonstrates:
- Document structuring with sections
- Mathematical typesetting
- Code listings with syntax highlighting
- Bibliography management
- Cross-references and citations

## 🤝 Collaboration

The WebIDE supports real-time collaboration:
- Multiple users can edit simultaneously
- Conflict-free replicated data types (CRDT)
- User-aware editing with cursor tracking
- Version history and undo/redo

## 🎯 Next Steps

1. Explore the Monaco Editor features
2. Try the AI Assistant suggestions
3. Manage plugins through the Plugin Manager
4. Create your own LaTeX documents
5. Collaborate with other users

Happy coding with WebIDE! 🎉

---
*User: ${user} | Project: Demo | WebIDE v1.0.0*`))
    }
  }

  // ========== 文件操作 ==========

  async readFile(path: string): Promise<Buffer> {
    console.log(`[BrowserFS] Reading file: ${path}`)
    
    if (!this.storage.has(path)) {
      throw new Error(`File not found: ${path}`)
    }
    
    return this.storage.get(path)!
  }

  async writeFile(path: string, data: Buffer): Promise<void> {
    console.log(`[BrowserFS] Writing file: ${path}`)
    
    // 确保父目录存在
    const dir = this.dirname(path)
    if (!this.directories.has(dir)) {
      await this.mkdir(dir)
    }
    
    this.storage.set(path, data)
  }

  async deleteFile(path: string): Promise<void> {
    console.log(`[BrowserFS] Deleting file: ${path}`)
    
    if (!this.storage.has(path)) {
      throw new Error(`File not found: ${path}`)
    }
    
    this.storage.delete(path)
  }

  // ========== 目录操作 ==========

  async readdir(path: string): Promise<string[]> {
    console.log(`[BrowserFS] Reading directory: ${path}`)
    
    if (!this.directories.has(path)) {
      throw new Error(`Directory not found: ${path}`)
    }
    
    const results: string[] = []
    
    // 查找子目录
    for (const dir of this.directories) {
      if (dir !== path && dir.startsWith(path + '/')) {
        const relativePath = dir.slice(path.length + 1)
        if (!relativePath.includes('/')) {
          results.push(relativePath)
        }
      }
    }
    
    // 查找文件
    for (const filePath of this.storage.keys()) {
      if (filePath.startsWith(path + '/')) {
        const relativePath = filePath.slice(path.length + 1)
        if (!relativePath.includes('/')) {
          results.push(relativePath)
        }
      }
    }
    
    return results.sort()
  }

  async mkdir(path: string): Promise<void> {
    console.log(`[BrowserFS] Creating directory: ${path}`)
    
    // 确保父目录存在
    const parentDir = this.dirname(path)
    if (parentDir !== path && !this.directories.has(parentDir)) {
      await this.mkdir(parentDir)
    }
    
    this.directories.add(path)
  }

  async rmdir(path: string): Promise<void> {
    console.log(`[BrowserFS] Removing directory: ${path}`)
    
    // 检查目录是否为空
    const contents = await this.readdir(path)
    if (contents.length > 0) {
      throw new Error(`Directory not empty: ${path}`)
    }
    
    this.directories.delete(path)
  }

  // ========== 文件信息 ==========

  async stat(path: string): Promise<Stats> {
    console.log(`[BrowserFS] Getting stats for: ${path}`)
    
    const isFile = this.storage.has(path)
    const isDirectory = this.directories.has(path)
    
    if (!isFile && !isDirectory) {
      throw new Error(`Path not found: ${path}`)
    }
    
    const size = isFile ? this.storage.get(path)!.length : 0
    const now = new Date()
    
    return {
      isFile: () => isFile,
      isDirectory: () => isDirectory,
      size,
      mtime: now,
      ctime: now
    }
  }

  async exists(path: string): Promise<boolean> {
    return this.storage.has(path) || this.directories.has(path)
  }

  // ========== 文件监听 ==========

  watch(path: string, callback: (event: string, filename: string) => void): Watcher {
    console.log(`[BrowserFS] Watching: ${path}`)
    
    // 在实际实现中，这里会设置文件系统监听器
    // 目前返回一个 mock watcher
    return new MockWatcher(callback)
  }

  // ========== 路径处理 ==========

  join(...paths: string[]): string {
    return paths
      .filter(path => path && path.length > 0)
      .join('/')
      .replace(/\/+/g, '/')
  }

  dirname(path: string): string {
    const lastSlash = path.lastIndexOf('/')
    if (lastSlash === -1) return '.'
    if (lastSlash === 0) return '/'
    return path.slice(0, lastSlash)
  }

  basename(path: string): string {
    const lastSlash = path.lastIndexOf('/')
    return lastSlash === -1 ? path : path.slice(lastSlash + 1)
  }

  extname(path: string): string {
    const basename = this.basename(path)
    const lastDot = basename.lastIndexOf('.')
    return lastDot === -1 ? '' : basename.slice(lastDot)
  }

  // ========== 实用方法 ==========

  /**
   * 检查是否已初始化
   */
  isInitialized(): boolean {
    return this.initialized
  }

  /**
   * 获取所有文件路径（调试用）
   */
  getAllFiles(): string[] {
    return Array.from(this.storage.keys())
  }

  /**
   * 获取所有目录路径（调试用）
   */
  getAllDirectories(): string[] {
    return Array.from(this.directories)
  }

  /**
   * 清空文件系统（测试用）
   */
  clear(): void {
    this.storage.clear()
    this.directories.clear()
    this.directories.add('/')
  }
}

// 单例实例
export const browserFS = new BrowserFileSystem() 