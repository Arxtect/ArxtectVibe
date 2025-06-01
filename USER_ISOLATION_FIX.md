# 用户隔离和文件编码修复

## 问题描述

用户报告了两个关键问题：

1. **用户项目空间未隔离**：所有用户共享同一个项目空间
2. **文件内容显示编码错误**：文件内容显示为数字编码 (如: 92,100,111,99,117,109,101,110,116...) 而不是正常文本

## 根本原因分析

### 1. 用户空间隔离问题
- 原始实现中，项目路径为 `/projects/${projectId}`
- 所有用户的项目都存储在同一个目录下，没有用户隔离
- 这可能导致用户之间的项目冲突和隐私问题

### 2. 文件编码显示问题
- 在浏览器环境中使用 `Uint8Array` 作为 `Buffer` 的替代
- 但在显示文件内容时，直接使用了 `buffer.toString()`
- 这导致显示的是字节数组的数字表示，而不是正确解码的文本

## 修复方案

### 1. 用户项目空间隔离 ✅

**文件**: `src/App.tsx`

```typescript
// WebIDE 路由组件
const EditorRoute: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>()
  const currentUser = useDataStore((state) => state.currentUser)
  
  // 创建用户隔离的项目路径
  const userProjectPath = currentUser 
    ? `/projects/${currentUser.username}/${projectId}`
    : `/projects/guest/${projectId}`

  return (
    <WebIDE
      projectPath={userProjectPath}
      // ... 其他配置
    />
  )
}
```

**目录结构**:
```
/projects/
├── demo/
│   └── project1/
├── alice/
│   └── project1/
├── bob/
│   └── project1/
└── guest/
    └── project1/
```

### 2. 文件编码正确解码 ✅

**文件**: `src/modules/Editor/WebIDE/WebIDE.tsx`

```typescript
// 将 Buffer/Uint8Array 正确解码为文本
const getTextContent = (buffer: Buffer): string => {
  try {
    // 如果是 Uint8Array，使用 TextDecoder 解码
    if (buffer instanceof Uint8Array) {
      const decoder = new TextDecoder('utf-8')
      return decoder.decode(buffer)
    }
    // 如果是普通 Buffer 或其他类型，尝试转换为字符串
    const decoder = new TextDecoder('utf-8')
    return decoder.decode(new Uint8Array(buffer as any))
  } catch (error) {
    console.error('[WebIDE] Failed to decode file content:', error)
    // 备用方案：直接转换为字符串
    return Array.from(new Uint8Array(buffer as any), byte => String.fromCharCode(byte)).join('')
  }
}
```

### 3. 用户目录预创建 ✅

**文件**: `src/modules/Editor/WebIDE/core/FileSystem/BrowserFS.ts`

为每个用户预创建示例项目：
- `demo`, `alice`, `bob`, `guest` 用户
- 每个用户都有独立的 `demo-project` 项目
- 包含个性化的 LaTeX 文档和项目说明

## 修复效果

### 1. 用户隔离
- ✅ 每个用户现在有独立的项目空间
- ✅ 项目路径格式：`/projects/{username}/{projectId}`
- ✅ 支持 guest 用户访问

### 2. 文件内容正确显示
- ✅ LaTeX 文件内容正确显示为文本，不再是数字编码
- ✅ 支持 UTF-8 编码
- ✅ 文件编辑功能正常工作

### 3. 示例项目
每个用户都有包含以下文件的示例项目：
- `main.tex`: 个性化的 LaTeX 文档
- `sample.pdf`: 示例 PDF 文件
- `README.md`: 项目说明文档
- `sections/`: 章节目录

## 测试建议

1. **用户隔离测试**：
   ```
   # 不同用户访问相同项目ID
   /editor/demo-project  # demo 用户的项目
   /editor/demo-project  # 切换用户后，alice 用户的独立项目
   ```

2. **文件内容测试**：
   - 打开 `main.tex` 文件
   - 确认显示正常的 LaTeX 代码而不是数字编码
   - 测试文件编辑和保存功能

3. **多用户场景**：
   - 使用不同账号登录
   - 创建和编辑项目
   - 确认项目之间不会相互影响

## 技术细节

- **编码处理**: 使用 `TextDecoder` API 进行 UTF-8 解码
- **路径隔离**: 用户名作为项目路径的一级目录
- **备用方案**: 多层错误处理确保在各种情况下都能正常显示内容
- **向后兼容**: 支持 guest 用户访问，无需登录即可使用

## 已知限制

- 目前使用内存存储，刷新页面会丢失数据
- 需要后续集成 IndexedDB 进行持久化存储
- guest 用户的项目可能被多人共享

## 后续改进

1. **持久化存储**: 集成 IndexedDB 或其他浏览器存储方案
2. **权限控制**: 添加项目访问权限和共享功能
3. **实时同步**: 支持多用户实时协作编辑
4. **项目管理**: 添加项目创建、删除、重命名等管理功能 