-- PromptFolio 数据库表结构
-- 创建数据库
CREATE DATABASE IF NOT EXISTS prompt_folio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE prompt_folio;

-- 分类表
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '分类ID',
    name VARCHAR(50) NOT NULL UNIQUE COMMENT '分类名称',
    icon VARCHAR(50) COMMENT '分类图标',
    sort_order INT DEFAULT 0 COMMENT '排序顺序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分类表';

-- 作品表
CREATE TABLE IF NOT EXISTS works (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '作品ID',
    title VARCHAR(255) NOT NULL COMMENT '作品标题',
    category_id BIGINT UNSIGNED NOT NULL COMMENT '分类ID',
    image_url TEXT NOT NULL COMMENT '图片URL',
    prompt TEXT NOT NULL COMMENT '提示词',
    is_favorite TINYINT(1) DEFAULT 0 COMMENT '是否收藏：0-否，1-是',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_category_id (category_id) COMMENT '分类ID索引',
    INDEX idx_is_favorite (is_favorite) COMMENT '收藏状态索引',
    INDEX idx_created_at (created_at) COMMENT '创建时间索引',
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT COMMENT '分类外键'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='作品表';

-- 作品标签表
CREATE TABLE IF NOT EXISTS tags (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '标签ID',
    name VARCHAR(50) NOT NULL UNIQUE COMMENT '标签名称',
    color VARCHAR(20) DEFAULT '#6366f1' COMMENT '标签颜色',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='作品标签表';

-- 作品标签关联表（多对多关系）
CREATE TABLE IF NOT EXISTS work_tags (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '关联ID',
    work_id BIGINT UNSIGNED NOT NULL COMMENT '作品ID',
    tag_id BIGINT UNSIGNED NOT NULL COMMENT '标签ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '关联时间',
    UNIQUE KEY uk_work_tag (work_id, tag_id) COMMENT '作品-标签唯一索引',
    FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE COMMENT '作品外键',
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE COMMENT '标签外键',
    INDEX idx_work_id (work_id),
    INDEX idx_tag_id (tag_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='作品标签关联表';
