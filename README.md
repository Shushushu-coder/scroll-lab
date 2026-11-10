# Scroll Lab

独立前端动画实验仓库，用于逆向复现与学习 [PaintPilot](https://paintpilot.org/home) 的滚动叙事与交互动画机制。

## 一、项目目标

通过观察公开网站视觉效果与录屏交互，独立构建一套高度可控、流畅且模块化的前端滚动动画系统。本项目完全使用纯 CSS 纯色卡片与矢量几何作为视觉占位，与任何外部项目及个人主页完全物理隔离。

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
├── scripts/
│   ├── diagnose-p0.js               # P0 重影问题根因量化采样诊断脚本（基线留档）
│   ├── diagnose-single-focus.js     # Single-Focus Handoff 遮罩与错峰文字诊断采样脚本
│   ├── compare-p0-configs.js        # Candidate A 与 B 转场方案参数与截图对比脚本
│   ├── generate-p0-comparison-and-frames.js # 连续转场帧与量化对比报告生成脚本
│   ├── test-parallax-and-features.js # Phase 3 端到端功能、视差层独立性与无障碍自动化测试脚本
│   ├── record-scroll-video.js       # 桌面端完整前向/反向滚动录屏生成脚本
│   └── record-mobile-video.js       # 移动端完整滚动录屏生成脚本
├── src/
│   ├── app/
│   │   ├── globals.css              # 全局深色主题与重置样式
│   │   ├── layout.tsx               # 根布局
│   │   ├── page.module.css          # 首页响应式布局样式（紧凑 Intro/Outro）
│   │   └── page.tsx                 # 首页实验入口（紧凑开场 + ScrollStory + 闭幕收尾）
│   └── components/
│       ├── AmbientBackground.module.css # 解耦多层渐变光晕背景样式
│       ├── AmbientBackground.tsx        # 独立多层背景图层组件
│       ├── SceneVisual.module.css       # 三层空间视觉（Back/Main/Foreground）样式
│       ├── SceneVisual.tsx              # 三层空间视觉组件（差速视差与场景差异化结构）
│       ├── ColorCard.module.css         # 基础纯色卡片样式
│       ├── ColorCard.tsx                # 纯色占位卡片组件
│       ├── ScrollStory.module.css       # 固定舞台、统一 HUD 与空间视差样式
│       └── ScrollStory.tsx              # 四场景连续滚动叙事核心组件（Single-Focus Handoff 时间线）
├── test-results/                        # 验证成果（已被 .gitignore 忽略，不入库）
│   ├── p0_pre_fix/                      # 修复前诊断截图与交叠数据报告
│   ├── p0_comparison/                   # Candidate A 与 B 对比截图与交叠数据报告
│   ├── phase3_final/                    # Phase 3 最终关键帧、移动端与无障碍模式截图
│   └── videos/                          # 桌面端与移动端全程前向/反向滚动录屏（.webm）
├── AGENTS.md                            # 协作与工程开发长期规则
├── README.md                            # 项目说明
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
- [x] **Phase 1: Stage & Scroll Sync** — 四场景全屏固定舞台、滚动进度映射与基础 Y 轴 Scrubbing。
- [x] **Phase 2: Continuous Scene Transitions** — 连续场景 Crossfade、滚动驱动模糊与轻量缩放、解耦环境背景光晕渐变、前景背景节奏分层以及全程可逆 Scrubbing。
- [x] **Phase 3: Spatial & Parallax** — P0 消除场景转场重影（Single-Focus Handoff）、Back/Main/Foreground 三层空间视差、差异化场景构图、紧凑舞台叙事（精简 Intro/Outro、统一顶部 HUD 导航）。
- [ ] **Phase 4: Carousel & Flow** — 横向作品轮播和完整页面衔接。
- [ ] **Phase 5: Polish & Accessibility** — 性能优化、移动端适配、Reduced Motion 支持与接入评估。

## 六、当前状态

- 当前完成：**Phase 3 P0 Remediation (Single-Focus Scene Handoff)**
- 当前状态：`PHASE_3_P0_READY_FOR_OWNER_REVIEW / P0_OWNER_ACCEPTANCE_PENDING`
- 本阶段核心成果：
  1. **P0 彻底根除场景交接重影（Single-Focus Scene Handoff）**：针对 Phase 3 Candidate B 中半透明叠影与双卡片轮廓残留问题进行架构级根治。将场景内容解耦为「共享视觉舞台（Shared Visual Viewport）」与「错峰叙事文字（Decoupled Staggered Text）」独立时间线：
     - **主视觉受控遮罩（Controlled Reveal Mask）**：新旧卡片在相同空间视口坐标对齐，入场卡片通过 GPU 加速的 `clip-path` 互补渐进展开（转场中点精确呈现 50% 遮罩接管），两套卡片始终保持 100% 不透明度与饱满色彩，从几何与合成根源上消除双重矩形轮廓、叠影以及 Orange→Red 中的异常暗化。
     - **错峰叙事文字（Staggered Narrative Handoff）**：出场标题正文先行淡出并在交接中点保持完全隐去（可读重叠为 0%），新标题正文随后自下而上进场，彻底杜绝文字叠影与两套标题同时辨认的问题，移动端单列垂直布局完全无冲突。
     - **连续平滑背景与视差稳定**：`AmbientBackground` 维持全视口平滑连续渐变；交接窗口内各空间层视差平缓过渡，确保视觉焦点稳定可逆，停止滚动即停，反向回滚严格保真。
  2. **三层空间视差架构（Tri-Layer Spatial Architecture）**：在单个场景内构建三层独立运动层级：
     - **BackLayer**（空间底板）：低对比度网格与几何深度参照（位移 ±14px Y、±6px X、缩放 0.99–1.01）。
     - **MainLayer**（核心焦点）：主界面与交互画布主体（位移 ±20px Y、±8px X、缩放 0.99–1.02）。
     - **ForegroundLayer**（前景悬浮）：独立状态芯片与悬浮徽章（位移 ±32px Y、±14px X、缩放 0.98–1.03）。
  3. **四场景差异化空间构图**：
     - **Scene 01 (Purple)**：主视口锁定容器 + 双分离悬浮面板 + 几何景深网格。
     - **Scene 02 (Teal)**：左右工作区对比面板 + 动态检视器 + 解耦光晕。
     - **Scene 03 (Orange)**：三层纵深堆叠画板 + 景深指示芯片。
     - **Scene 04 (Red)**：展示卡组前奏堆叠，预留 Phase 4 横向轮播视觉动线。
  4. **舞台叙事紧凑化与统一导航 HUD**：
     - Intro 区域由 85vh 精简为 42vh（缩短约 50% 无效前置滚动），用户更快进入舞台。
     - Outro 区域由 85vh 精简为 44vh，实现舞台释放后平滑收束。
     - 底部离散指示器升级为全景顶部 Stage HUD（集成阶段标识、4 场景直达 Pill、全宽 2px 滚动进度条）。
  5. **绝对属性所有权隔离**：场景进入/退出由 `sceneContent` 管理，三层独立视差分别由 `backLayer`、`mainLayer`、`fgLayer` 节点独占，无任何 GSAP Transform 竞争冲突，反向滚动严格保真。
  6. **性能与可访问性**：桌面端（1440×900）与移动端（375×667）无水平溢出；`prefers-reduced-motion` 降级为纯静态文档流，无固定舞台与视差开销。
