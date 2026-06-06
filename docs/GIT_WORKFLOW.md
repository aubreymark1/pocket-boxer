# Pocket Boxer 四人 Git 操作指南

## 1. 团队角色与分支

四个人默认分工如下：

- A：页面流程与基础 UI，分支 `feat/app-flow`
- B：传感器、校准、出拳评分，分支 `feat/motion-score`
- C：战斗系统与反馈，分支 `feat/battle-feedback`
- D：集成、联调、测试、演示收口，分支 `chore/integration-demo`

规则：

- `main` 只保留可演示版本
- 不要直接把不稳定代码推到 `main`
- 所有人都从 `main` 拉出自己的分支开发
- 最后由 D 负责集成和合并

## 2. 第一次拉项目

每个人第一次拿项目时执行：

```bash
git clone https://github.com/aubreymark1/pocket-boxer.git
cd pocket-boxer
git checkout main
git pull origin main
```

然后切到自己的分支。

如果远程还没有你的分支，可以本地创建并推上去：

```bash
git checkout -b feat/app-flow
git push -u origin feat/app-flow
```

其他三个人把分支名替换成自己的即可。

## 3. 每天开始前怎么同步

每次开始开发前，先同步主分支：

```bash
git checkout main
git pull origin main
```

然后切回自己的分支并合并 `main`：

```bash
git checkout feat/app-flow
git merge main
```

如果是其他人，就把分支名换成自己的。

规则：

- 开发前一定先同步一次 `main`
- 不要在很旧的分支上闷头写很久
- 至少每 60 到 90 分钟同步一次

## 4. 日常开发怎么提交

每做完一个小功能就提交一次，不要攒很大一坨再提交。

推荐流程：

```bash
git status
git add index.html src/app.js
git commit -m "feat: add countdown flow"
git push
```

提交信息建议使用：

- `feat:` 新功能
- `fix:` 修 Bug
- `style:` 样式或 UI 调整
- `chore:` 文档、配置、集成类修改

示例：

```bash
git commit -m "feat: add motion permission request"
git commit -m "feat: add battle round calculation"
git commit -m "fix: fallback to charge mode on denied motion"
```

## 5. 四个人分别应该改什么

A 负责：

- `index.html`
- `src/app.js`
- `src/ui.js`
- 大部分页面结构和按钮流程

B 负责：

- `src/motion.js`
- 传感器权限
- baseline 校准
- 加速度采样
- 出拳分数
- 备用蓄力模式

C 负责：

- `src/battle.js`
- `src/feedback.js`
- HP、回合、伤害、结算
- 震动、音效、伤害数字、血条反馈

D 负责：

- `README.md`
- `docs/*`
- 主分支集成
- 联调
- 演示版本收口

规则：

- 不要 4 个人同时改同一个文件
- 如果要改别人负责的文件，先在群里说一声
- 公共接口名变更必须先同步

## 6. 做完后怎么交给集成人

开发者完成自己部分后：

```bash
git status
git add .
git commit -m "feat: add punch score result flow"
git push
```

然后把分支名和改动内容发给 D，由 D 审查和合并。

如果你们用 Pull Request，流程是：

1. push 自己分支
2. 发起 PR 到 `main`
3. D 检查是否影响主流程
4. 确认通过后合并

如果你们时间太紧，不走 PR，也至少要做到：

1. 开发者先自己测试
2. 把变更说明发给 D
3. D 拉分支检查后再合并

## 7. 冲突怎么处理

如果合并 `main` 时出现冲突：

```bash
git checkout feat/app-flow
git merge main
```

处理完冲突后：

```bash
git add .
git commit -m "fix: resolve merge conflict with main"
git push
```

规则：

- 先问清楚冲突文件是谁负责
- 不要为了消冲突把别人的逻辑删掉
- 不确定时让 D 来处理

## 8. 哪些操作不要做

禁止：

- 直接往 `main` 推未测试代码
- 最后两小时还大改结构
- 未同步 `main` 就继续堆功能
- 一次提交很多无关文件
- 随便删除别人文件
- 用危险命令清空别人的改动

尤其不要随便用：

```bash
git reset --hard
git checkout -- .
```

除非全队明确同意。

## 9. 演示前两小时规则

演示前至少两小时进入冻结阶段。

冻结后只允许修改：

- 页面打不开
- 按钮失效
- 出拳测试无法运行
- 人机对战无法运行
- 真机无法演示
- 明显文案错误

冻结后禁止修改：

- 新增玩法
- 新增复杂动画
- 重构结构
- 大改传感器逻辑
- 升级依赖
- 修改大量样式细节

目标只有一个：

能演示，不崩。

## 10. 每个人今天实际怎么做

A：

```bash
git checkout feat/app-flow
git pull origin feat/app-flow
```

B：

```bash
git checkout feat/motion-score
git pull origin feat/motion-score
```

C：

```bash
git checkout feat/battle-feedback
git pull origin feat/battle-feedback
```

D：

```bash
git checkout chore/integration-demo
git pull origin chore/integration-demo
```

如果远程分支还不存在，先本地创建再推送。

## 11. 推荐工作节奏

每 2 小时同步一次信息，四个人都回答：

1. 我现在在做什么？
2. 我已经完成了什么？
3. 我卡在哪里？
4. 有没有影响别人？

D 每轮检查：

- `main` 能不能打开
- 出拳测试能不能跑
- 人机对战能不能跑
- 当前最大的演示风险是什么

## 12. 最终一句话规则

先保证主流程，再追求效果；先保证能合并，再追求代码漂亮。
