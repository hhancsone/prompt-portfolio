# 数据库创建说明

由于命令行编码问题，请使用以下方法之一创建数据库：

## 方法1：使用MySQL Workbench（推荐）

1. 打开MySQL Workbench
2. 连接到本地MySQL服务器（用户名：root，密码：123456）
3. 点击 File > Open SQL Script
4. 选择 `database/schema.sql` 文件
5. 点击执行按钮（闪电图标）

## 方法2：使用phpMyAdmin

1. 打开phpMyAdmin
2. 点击"导入"标签
3. 选择 `database/schema.sql` 文件
4. 点击"执行"

## 方法3：使用MySQL命令行（需要设置正确的编码）

```bash
# Windows PowerShell
chcp 65001
mysql -u root -p123456 < database\schema.sql

# 或者分步执行
mysql -u root -p123456 -e "CREATE DATABASE IF NOT EXISTS prompt_folio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p123456 prompt_folio < database\schema.sql
```

## 数据库信息

- **数据库名称**: prompt_folio
- **字符集**: utf8mb4
- **排序规则**: utf8mb4_unicode_ci
- **用户名**: root
- **密码**: 123456

## 验证数据库创建成功

执行以下SQL查询验证：

```sql
USE prompt_folio;

-- 查看所有表
SHOW TABLES;

-- 查看表结构
DESC categories;
DESC works;
DESC tags;
DESC work_tags;
```

预期结果：
- 表数量：4个（categories, works, tags, work_tags）
- 所有表为空（无模拟数据）