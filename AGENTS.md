<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Scroll Lab — Agent Collaboration & Engineering Rules

## 1. 项目定位与范围
- **专用实验仓库**：本仓库（`scroll-lab`）专门用于前端滚动叙事与交互动画的逆向探索与原型实验。
- **阶段化推进**：每次工作必须严格限定在当前明确授权的阶段，绝不擅自越界或提前进入下一阶段。
- **隔离原则**：本仓库与个人主页仓库及其他任何外部项目完全隔离。严禁读取、修改、引用或迁移个人主页或外部仓库的代码、配置、素材或数据。

## 2. 逆向工程与技术实现规范
- **黑盒观察优先**：通过公开网站视觉表现与交互录屏独立复现相似的前端效果，不假定参考网站的内部源码、私有接口或非公开结构。
- **三重证据区分**：开发过程中必须清晰区分「实际观察（Observation）」、「技术推测（Hypothesis）」与「已验证实现（Verified Implementation）」，并在文档中明确标注。
- **素材替代规范**：所有图片与媒体资产默认使用 CSS 纯色卡片或矢量占位替代。严禁使用参考网站未授权的专有图片、私有字体、视频或受版权保护素材。
- **技术栈纯度**：
  - 核心栈限定为 Next.js (App Router) + React + TypeScript + CSS Modules / 原生 CSS + GSAP (ScrollTrigger)。
  - 严禁擅自引入 Tailwind CSS、Three.js、Lenis、Framer Motion、UI 组件库或其他未授权的重量级第三方依赖。
- **性能与可访问性**：
  - 严格关注滚动渲染性能（GPU 加速属性 `transform` / `opacity`、减少 layout thrashing）。
  - 全面支持响应式断点（桌面、平板、移动端无溢出）。
  - 必须考虑 `prefers-reduced-motion` 媒体查询，保障可访问性。

## 3. 运维与版本控制纪律
- **Git 操作边界**：未经明确人工授权，绝对不执行 `git commit`、`git push`、创建 Git tag、远程仓库创建或任何形式的自动化部署（Deployment）。所有阶段性成果保留在 working tree 中由人工审查。
- **环境安全**：不修改宿主机或系统的 Node.js、npm 全局配置。所有变更必须限制在当前工作目录内。
