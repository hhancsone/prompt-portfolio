# PromptFolio 数据库设计文档

## 数据库信息

- **数据库名称**: `prompt_folio`
- **字符集**: `utf8mb4`
- **排序规则**: `utf8mb4_unicode_ci`
- **存储引擎**: `InnoDB`

## 表结构概览

```
prompt_folio
├── categories (分类表)
├── works (作品表)
├── tags (作品标签表)
└── work_tags (作品标签关联表)
```

## 表结构详解

### 1. categories - 分类表

存储作品分类信息。

| 字段名 | 类型 | 长度 | 允许NULL | 默认值 | 说明 |
|--------|------|------|----------|--------|------|
| id | BIGINT UNSIGNED | - | NO | AUTO_INCREMENT | 分类ID（主键） |
| name | VARCHAR | 50 | NO | - | 分类名称（唯一） |
| icon | VARCHAR | 50 | YES | NULL | 分类图标（Font Awesome图标类名） |
| sort_order | INT | - | NO | 0 | 排序顺序 |
| created_at | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | 创建时间 |

**索引**:
- PRIMARY KEY: `id`
- UNIQUE KEY: `name`
- INDEX: `idx_sort_order` (sort_order)

**字段说明**:
- `icon` 使用Font Awesome图标类名，如 `fa-image`, `fa-camera` 等
- `sort_order` 用于控制分类显示顺序，数字越小越靠前

**预置分类**:
1. P图 - `fa-image`
2. 写真 - `fa-camera`
3. 视频 - `fa-video`
4. 萌宠 - `fa-paw`
5. 宝宝 - `fa-baby`
6. 头像 - `fa-user-circle`
7. 海报 - `fa-file-image`
8. 手抄报 - `fa-newspaper`
9. 插画 - `fa-paint-brush`
10. Logo - `fa-copyright`

### 2. works - 作品表

存储所有AI生成的作品信息。

| 字段名 | 类型 | 长度 | 允许NULL | 默认值 | 说明 |
|--------|------|------|----------|--------|------|
| id | BIGINT UNSIGNED | - | NO | AUTO_INCREMENT | 作品ID（主键） |
| title | VARCHAR | 255 | NO | - | 作品标题 |
| category_id | BIGINT UNSIGNED | - | NO | - | 分类ID（外键） |
| image_url | TEXT | - | NO | - | 图片URL |
| prompt | TEXT | - | NO | - | 提示词 |
| is_favorite | TINYINT | 1 | NO | 0 | 是否收藏：0-否，1-是 |
| created_at | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | - | NO | CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

**索引**:
- PRIMARY KEY: `id`
- INDEX: `idx_category_id` (category_id)
- INDEX: `idx_is_favorite` (is_favorite)
- INDEX: `idx_created_at` (created_at)

**外键约束**:
- FOREIGN KEY (`category_id`) REFERENCES `categories(id)` ON DELETE RESTRICT

**关系说明**:
- 一个作品属于一个分类
- 一个分类可以包含多个作品
- 作品和分类是多对一关系

### 3. tags - 作品标签表

存储作品标签信息。

| 字段名 | 类型 | 长度 | 允许NULL | 默认值 | 说明 |
|--------|------|------|----------|--------|------|
| id | BIGINT UNSIGNED | - | NO | AUTO_INCREMENT | 标签ID（主键） |
| name | VARCHAR | 50 | NO | - | 标签名称（唯一） |
| color | VARCHAR | 20 | NO | #6366f1 | 标签颜色（十六进制） |
| created_at | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | 创建时间 |

**索引**:
- PRIMARY KEY: `id`
- UNIQUE KEY: `name`

**字段说明**:
- `color` 使用十六进制颜色代码，如 `#6366f1` (靛蓝色)

### 4. work_tags - 作品标签关联表

存储作品与标签的关联关系（多对多关系）。

| 字段名 | 类型 | 长度 | 允许NULL | 默认值 | 说明 |
|--------|------|------|----------|--------|------|
| id | BIGINT UNSIGNED | - | NO | AUTO_INCREMENT | 关联ID（主键） |
| work_id | BIGINT UNSIGNED | - | NO | - | 作品ID（外键） |
| tag_id | BIGINT UNSIGNED | - | NO | - | 标签ID（外键） |
| created_at | TIMESTAMP | - | NO | CURRENT_TIMESTAMP | 关联时间 |

**索引**:
- PRIMARY KEY: `id`
- UNIQUE KEY: `uk_work_tag` (work_id, tag_id)
- INDEX: `idx_work_id` (work_id)
- INDEX: `idx_tag_id` (tag_id)

**外键约束**:
- FOREIGN KEY (`work_id`) REFERENCES `works(id)` ON DELETE CASCADE
- FOREIGN KEY (`tag_id`) REFERENCES `tags(id)` ON DELETE CASCADE

**关系说明**:
- 一个作品可以有多个标签
- 一个标签可以用于多个作品
- 作品和标签是多对多关系

## ER图

```
┌─────────────┐         ┌─────────────────┐         ┌─────────────┐
│ categories  │         │     works      │         │   work_tags │
├─────────────┤         ├─────────────────┤         ├─────────────┤
│ id (PK)     │◄────────│ category_id(FK) │─────────►│ work_id(FK) │
│ name        │         │ id (PK)         │         │ tag_id (FK) │
│ icon        │         │ title           │         │ created_at  │
│ sort_order  │         │ image_url       │         └─────────────┘
│ created_at  │         │ prompt          │                │
└─────────────┘         │ is_favorite     │                │
                        │ created_at      │                ▼
                        │ updated_at      │         ┌─────────────┐
                        └─────────────────┘         │    tags     │
                                                      ├─────────────┤
                                                      │ id (PK)     │
                                                      │ name        │
                                                      │ color       │
                                                      │ created_at  │
                                                      └─────────────┘
```

## 常用SQL查询示例

### 1. 查询所有分类
```sql
SELECT * FROM categories ORDER BY sort_order ASC;
```

### 2. 查询所有作品（带分类名称）
```sql
SELECT w.*, c.name as category_name, c.icon as category_icon
FROM works w
JOIN categories c ON w.category_id = c.id
ORDER BY w.created_at DESC;
```

### 3. 查询收藏的作品
```sql
SELECT w.*, c.name as category_name
FROM works w
JOIN categories c ON w.category_id = c.id
WHERE w.is_favorite = 1
ORDER BY w.created_at DESC;
```

### 4. 按分类查询作品
```sql
SELECT w.*, c.name as category_name
FROM works w
JOIN categories c ON w.category_id = c.id
WHERE c.name = '插画'
ORDER BY w.created_at DESC;
```

### 5. 查询作品及其标签
```sql
SELECT w.*, c.name as category_name, t.name as tag_name, t.color as tag_color
FROM works w
JOIN categories c ON w.category_id = c.id
JOIN work_tags wt ON w.id = wt.work_id
JOIN tags t ON wt.tag_id = t.id
WHERE w.id = 1;
```

### 6. 统计各分类作品数量
```sql
SELECT c.name, COUNT(w.id) as count
FROM categories c
LEFT JOIN works w ON c.id = w.category_id
GROUP BY c.id, c.name
ORDER BY count DESC;
```

### 7. 搜索作品
```sql
SELECT w.*, c.name as category_name
FROM works w
JOIN categories c ON w.category_id = c.id
WHERE w.title LIKE '%关键词%' OR w.prompt LIKE '%关键词%'
ORDER BY w.created_at DESC;
```

### 8. 查询某个标签下的所有作品
```sql
SELECT w.*, c.name as category_name
FROM works w
JOIN categories c ON w.category_id = c.id
JOIN work_tags wt ON w.id = wt.work_id
JOIN tags t ON wt.tag_id = t.id
WHERE t.name = '抽象'
ORDER BY w.created_at DESC;
```

### 9. 查询某个分类下的所有标签
```sql
SELECT DISTINCT t.name, t.color
FROM tags t
JOIN work_tags wt ON t.id = wt.tag_id
JOIN works w ON wt.work_id = w.id
JOIN categories c ON w.category_id = c.id
WHERE c.name = '插画'
ORDER BY t.name;
```

## 数据库初始化

### 使用MySQL命令行

```bash
mysql -u root -p < database/schema.sql
```

输入密码: `123456`

### 使用MySQL Workbench

1. 打开MySQL Workbench
2. 连接到本地MySQL服务器
3. 点击 File > Open SQL Script
4. 选择 `database/schema.sql`
5. 点击执行按钮（闪电图标）

### 使用phpMyAdmin

1. 打开phpMyAdmin
2. 点击"导入"标签
3. 选择 `database/schema.sql` 文件
4. 点击"执行"

## 注意事项

1. **字符集**: 使用 `utf8mb4` 以支持完整的Unicode字符集，包括emoji
2. **外键约束**: 
   - 分类使用 `RESTRICT` 约束，防止误删有作品的分类
   - 标签使用 `CASCADE` 约束，删除作品时自动删除关联标签
3. **索引优化**: 为常用查询字段添加索引以提高性能
4. **时间戳**: 使用TIMESTAMP类型自动管理创建和更新时间
5. **图标系统**: 使用Font Awesome图标，确保前端已引入相关CSS

## 扩展建议

### 未来可能添加的表

1. **comments** - 作品评论表
2. **likes** - 作品点赞表
3. **collections** - 作品集/专辑表
4. **settings** - 应用设置表

### 性能优化建议

1. 为大表的TEXT字段考虑单独存储
2. 考虑使用Redis缓存热门作品和分类
3. 定期清理过期的临时数据
4. 为图片URL考虑使用CDN
5. 对分类列表进行缓存，减少数据库查询

## 版本历史

- **v1.0** (2026-02-15): 初始版本，包含基础表结构
- **v1.1** (2026-02-15): 移除style和aspect_ratio字段，简化表结构
- **v1.2** (2026-02-15): 移除用户表和用户收藏表，简化为无用户系统
- **v1.3** (2026-02-15): 添加分类表，支持10种预置分类