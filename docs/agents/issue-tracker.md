# 任务跟踪：本地 Markdown

任务与规格保存在 `.scratch/`。

## 约定

- 每个功能使用独立目录：`.scratch/<feature-slug>/`。
- 规格文件：`.scratch/<feature-slug>/spec.md`。
- 实现任务：`.scratch/<feature-slug>/issues/<NN>-<slug>.md`，
  从 01 编号，每个任务独立成文件。
- 分流状态写在任务文件顶部附近的 `Status:` 行；
  状态名称见 `triage-labels.md`。
- 评论与讨论追加到文件末尾的 `## Comments` 下。

## 技能操作

技能要求“发布到任务跟踪器”时，在对应功能目录创建文件；
实现任务遵循上述独立文件约定。

技能要求“获取相关任务”时，读取指定路径的文件；
只有编号时，在对应功能的 issues 目录定位。

## Wayfinder 操作

- 地图：`.scratch/<effort>/map.md`，
  记录笔记、已有决策和待澄清问题。
- 子任务：`.scratch/<effort>/issues/NN-<slug>.md`；
  正文记录问题，`Type:` 为 research、prototype、grilling 或 task。
- 工作状态：`Status:` 使用 claimed 或 resolved。
- 依赖：顶部附近用 `Blocked by: NN, NN` 记录；
  所有依赖均为 resolved 后才解除阻塞。
- 选择任务：按编号取首个尚未解决、未被领取且无阻塞的任务。
- 领取：开始工作前写入 `Status: claimed` 并保存。
- 完成：在 `## Answer` 下追加答案，设置 `Status: resolved`，
  并向 map.md 的已有决策部分追加摘要与文件链接。
