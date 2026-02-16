# Prompt Portfolio

一个基于 Vue 3 和 Node.js 的作品展示平台，支持瀑布流布局、分类管理、收藏功能和图片上传。

## 功能特性

- 瀑布流布局展示作品
- 作品分类管理（10个分类）
- 收藏功能
- 上传新作品
- 按分类存储图片
- 搜索和筛选功能
- 响应式设计

## 技术栈

### 前端
- Vue 3
- Vite
- Pinia (状态管理)
- Vue Router (路由)
- Tailwind CSS (样式)

### 后端
- Node.js
- Express
- MySQL
- Multer (文件上传)

## 安装步骤

1. 克隆项目
```bash
git clone <repository-url>
cd prompt-portfolio
```

2. 安装依赖
```bash
npm install
```

3. 配置数据库

创建数据库并导入 `database/schema.sql`

修改 `db.js` 中的数据库连接配置：
```javascript
const pool = mysql.createPool({
  host: 'localhost',
  user: 'your_username',
  password: 'your_password',
  database: 'prompt_portfolio',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})
```

4. 启动项目
```bash
npm run dev:all
```

访问 http://localhost:5173 查看前端
访问 http://localhost:3001 查看后端 API

## 项目结构

```
prompt-portfolio/
├── public/
│   └── images/           # 图片存储目录
│       ├── P图/
│       ├── 写真/
│       ├── 视频/
│       ├── 萌宠/
│       ├── 宝宝/
│       ├── 头像/
│       ├── 海报/
│       ├── 手抄报/
│       ├── 插画/
│       └── Logo/
├── src/
│   ├── components/        # Vue 组件
│   ├── stores/          # Pinia 状态管理
│   ├── views/           # 页面视图
│   ├── App.vue
│   └── main.js
├── database/            # 数据库相关
│   ├── schema.sql
│   └── README.md
├── server.js           # Express 服务器
├── db.js              # 数据库连接
└── package.json
```

## API 接口

### 获取作品列表
```
GET /api/works
```

### 获取分类列表
```
GET /api/categories
```

### 上传图片
```
POST /api/upload?category_id={id}
Content-Type: multipart/form-data

Body:
- image: File
- title: String
```

### 创建作品
```
POST /api/works
Content-Type: application/json

Body:
{
  "title": "作品标题",
  "category": "分类名称",
  "image": "图片URL",
  "prompt": "提示词"
}
```

### 切换收藏状态
```
POST /api/works/:id/favorite
```

### 删除作品
```
DELETE /api/works/:id
```

## 分类说明

| ID | 分类名称 | 说明 |
|----|---------|------|
| 1  | P图     | 图片处理 |
| 2  | 写真    | 摄影作品 |
| 3  | 视频    | 视频内容 |
| 4  | 萌宠    | 宠物相关 |
| 5  | 宝宝    | 儿童相关 |
| 6  | 头像    | 头像设计 |
| 7  | 海报    | 海报设计 |
| 8  | 手抄报  | 手抄报作品 |
| 9  | 插画    | 插画作品 |
| 10 | Logo    | 标志设计 |

## 开发命令

```bash
# 启动前端开发服务器
npm run dev

# 启动后端服务器
npm run server

# 同时启动前后端
npm run dev:all

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

## 注意事项

- 图片上传限制：最大 20MB
- 支持的图片格式：JPEG, JPG, PNG, GIF, WEBP
- 图片按分类自动存储到对应文件夹
- 瀑布流布局支持响应式断点

## 许可证

MIT
