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

- 当前完成：**Phase 3 P0 Remediation V2 (Shared Visual Shell + Content Morphing — T1 Prototype)**
- 当前状态：`PHASE_3_P0_V2_T1_READY_FOR_OWNER_REVIEW / P0_OWNER_ACCEPTANCE_PENDING`
- 演化迭代三代机制对比：
  | 版本 | 核心方案 | 视觉表现与遗留问题 | 评审结论 |
  |---|---|---|---|
  | **Phase 3 Candidate B** | 异步非对称 Crossfade (两套卡片 20.6% 叠合) | 91.3% 卡片重合区产生双重外框半透明叠影，两套标题同时清晰可见 | 已否决 (P0 重影) |
  | **P0 Remediation V1** | Single-Focus 视口遮罩 (clip-path 上下揭示) | 消除半透明重影，但上下遮罩把两套界面拼在同一张卡片中（上嵌新卡控制条，下留旧卡内容），产生科学怪人拼接感 | Owner 明确否决 (界面拼接) |
  | **P0 Remediation V2 (本轮)** | **Shared Visual Shell + Content Morphing** | DOM 仅保留单张持久主视觉 Shell，外框/控制点/几何锚点恒定稳定；滚动驱动卡片背景色连续演变（#7c3aed  пурпур → #4467bb 海蓝 → #0d9488 鸭绿）；内部图形错峰演变，文字错峰交接，零遮罩硬裁切，零界面拼接 | **当前原型已就绪，等待 Owner 审看** |

- 本轮 Phase 3 P0 V2 核心成果：
  1. **真正的共享主视觉容器（Shared Visual Shell）**：
     - DOM 中仅存在单一的主视觉卡片实例（`[data-testid="shared-visual-shell"]`），在 Purple → Teal 的整个过渡区间（20%–30%）内**绝不卸载、不瞬间形变、不产生双重外框、不被上下裁切**。
     - **持久界面骨架（Persistent Frame）**：窗口控制三圆点（Control Dots）、面包屑导航与编号槽位、卡片外边框阴影以及底部定位元数据（`FOCAL LAYER: MAIN / PERSPECTIVE: 1000PX`）作为绝对稳定的几何与视觉锚点恒定存在，转场时不重建、不闪烁。
  2. **绝对滚动进度驱动的连续颜色演变（Continuous Color Morphing）**：
     - GSAP 直接以线性/平滑缓动驱动主卡片背景色从 Purple (`#7c3aed`) 经过深邃海蓝 (`#4467bb`) 连续演变为 Teal (`#0d9488`)。
     - 摒弃两张半透明卡片混合导致的暗化发灰，反向滚动沿严格数学轨迹 100% 互逆回滚。
  3. **卡片内部内容错峰演变（Content Morphing）**：
     - 旧场景图形（Scene 01 视口锁定与波形图）在 [21.0%, 24.5%] 平滑淡出（`opacity: 1 → 0`, `y: 0 → -8px`, `scale: 1 → 0.98`）。
     - 新场景图形（Scene 02 左右分栏检视器）在 [25.5%, 29.0%] 自下而上就位（`opacity: 0 → 1`, `y: 8px → 0`, `scale: 0.98 → 1`）。
     - 在中点 [24.5%, 25.5%] 形成自然呼吸间隙，两套完整界面绝不同时清晰可见，持久卡片外壳与渐变色彩全程充当视觉焦点，彻底消除拼接割裂与视觉空洞。
  4. **叙事文字与三层空间视差无缝协同**：
     - 右侧叙事文字采用解耦错峰时间线（旧标题 [21.5%, 24.2%] 移出淡隐，新标题 [25.8%, 28.5%] 渐入），转场中点文本辨识度重合为 0%，移动端单列布局绝不重叠冲突。
     - 三层空间视差（BackLayer、MainLayer、ForegroundLayer）平稳穿越 T1 区间，MainLayer 视差变换施加于图层容器，内容演变施加于卡片内部子容器，两类 Transform 完全隔离、互不争夺。
  5. **T2 (Teal → Orange) 与 T3 (Orange → Red) 基线严格保留**：
     - 本轮改造严格受控在 Scene 01 → Scene 02 (T1) 原型验证范围。
     - T2 与 T3 维持原 Single-Focus 遮罩揭示基线不变，为后续转场演进保留对照参照，未擅自复制或推广。
  6. **无障碍与全响应式保真**：
     - `prefers-reduced-motion` 保持静态文档语义流降级，展示全部 4 个场景完备信息，不执行任何 Morphing 或动态固定。
     - 桌面端（1440×900）与移动端（375×667）全链路测试通过，提供完整正反向滚动录屏留档（`test-results/videos/`）。
