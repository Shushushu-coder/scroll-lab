# Scroll Lab

独立前端动画实验仓库，用于逆向复现与学习 [PaintPilot](https://paintpilot.org/home) 的滚动叙事与交互动画机制。

## 一、项目目标

通过观察公开网站视觉效果与录屏交互，独立构建一套高度可控、流畅且模块化的前端滚动动画系统。本项目完全使用纯 CSS 纯色卡片作为视觉占位，与任何外部项目及个人主页完全物理隔离。

## 二、技术栈

- **框架**：Next.js (App Router)
- **核心库**：React 19 + TypeScript
- **样式**：CSS Modules / 原生 CSS
- **动画引擎**：GSAP + ScrollTrigger
- **包管理器**：npm

> **注**：本项目保持最小化依赖，不使用 Tailwind CSS、Three.js、Lenis、Framer Motion 或外部 UI 组件库。

## 三、项目结构

```text
scroll-lab/
├── public/
├── src/
│   ├── app/
│   │   ├── globals.css          # 全局深色主题与重置样式
│   │   ├── layout.tsx           # 根布局
│   │   ├── page.module.css      # 首页响应式网格布局
│   │   └── page.tsx             # 首页实验入口（4场景占位卡片）
│   └── components/
│       ├── ColorCard.module.css # 纯色卡片样式
│       └── ColorCard.tsx        # 纯色占位卡片组件
├── AGENTS.md                    # 协作与工程开发长期规则
├── README.md                    # 项目说明
├── package.json
├── package-lock.json
├── tsconfig.json
└── .gitignore
```

## 四、安装与运行

```bash
# 安装依赖
npm install

# 启动本地开发服务 (默认端口 3000)
npm run dev

# 执行 TypeScript 类型检查
npx tsc --noEmit

# 执行 ESLint 校验
npm run lint

# 构建生产版本
npm run build

# 启动生产预览服务
npm run start
```

## 五、项目演进阶段 (Roadmap)

- [x] **Phase 0: Repository Bootstrap** — 仓库初始化、依赖安装、基础页面结构与工程验证。
- [ ] **Phase 1: Stage & Scroll Sync** — 四场景全屏固定舞台与滚动同步基础。
- [ ] **Phase 2: Transitions & Effects** — 场景切换、模糊、缩放、淡入淡出及背景过渡。
- [ ] **Phase 3: Spatial & Parallax** — 卡片空间层次、多层视差与透视变换。
- [ ] **Phase 4: Carousel & Flow** — 横向作品轮播和完整页面衔接。
- [ ] **Phase 5: Polish & Accessibility** — 性能优化、移动端适配、Reduced Motion 支持与接入评估。

## 六、当前状态

- 当前完成：**Phase 0 (Repository Bootstrap)**
- 当前状态：`PHASE_0_READY_FOR_PHASE_1`
- 本阶段仅完成基础工程框架与纯色占位卡片，未实施任何正式滚动动画。
