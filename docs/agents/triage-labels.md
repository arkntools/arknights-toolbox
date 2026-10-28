# 分流状态

| 技能角色        | 本地状态        | 含义                     |
| --------------- | --------------- | ------------------------ |
| needs-triage    | needs-triage    | 等待维护者评估           |
| needs-info      | needs-info      | 等待补充信息             |
| ready-for-agent | ready-for-agent | 规格充分，可交给代理实现 |
| ready-for-human | ready-for-human | 需要人工实现             |
| wontfix         | wontfix         | 不予处理                 |

技能要求应用某个分流角色时，将任务文件的 `Status:` 行设为对应状态。
以后调整名称时，修改“本地状态”列。
