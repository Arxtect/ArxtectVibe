# Editor 模块

## 当前状态

Editor 模块已重构为插件化的 **WebIDE** 架构。

## 📍 主要编辑器实现

请参考 **WebIDE** 了解完整的编辑器功能：

- 📂 **位置**: `src/modules/Editor/WebIDE/`
- 📖 **文档**: [WebIDE README](./WebIDE/README.md)
- 🔧 **架构**: VS Code 风格的插件化设计

## 🔄 模块导出

```typescript
// 当前模块导出 WebIDE 作为主要编辑器
export { WebIDE } from './WebIDE'
export * from './WebIDE/types'
```

## 📋 技术债务

相关已知问题和技术债务请参考项目根目录的 [README.md](../../README.md#已知问题与技术债务) 中的"已知问题与技术债务"章节。

## 🏗️ 历史

- **v1**: 原始 Editor 组件 (已删除)
- **v2**: EditorV2 组件 (已删除) 
- **v3**: WebIDE 插件化架构 (当前)

详细的集成历史和技术细节请参考 WebIDE 相关文档。 