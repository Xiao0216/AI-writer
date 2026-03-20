-- 文枢AI 数据库初始化脚本
-- 创建时间：2026-03-19

-- 创建数据库
CREATE DATABASE IF NOT EXISTS wenshu_ai DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE wenshu_ai;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    phone VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100),
    password VARCHAR(255) NOT NULL,
    nickname VARCHAR(50),
    avatar VARCHAR(255),
    role ENUM('user', 'vip', 'professional', 'studio', 'studio_member', 'admin') DEFAULT 'user',
    membership_expire_at DATETIME,
    creation_years INT DEFAULT 0,
    preferred_category JSON,
    target_platforms JSON,
    daily_word_goal INT DEFAULT 2000,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at DATETIME,
    last_login_ip VARCHAR(45),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_phone (phone),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 作品表
CREATE TABLE IF NOT EXISTS works (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    author_id VARCHAR(36) NOT NULL,
    description TEXT,
    category ENUM('xuanhuan', 'qihuan', 'wuxia', 'xianxia', 'dushi', 'yanqing', 'xuanyi', 'kehuan', 'lishi', 'junshi', 'youxi', 'tiyu', 'lingyi', 'qita') DEFAULT 'qita',
    tags JSON,
    target_platform ENUM('fanqie', 'qidian', 'jinjiang', 'qimao', 'zongheng', 'other') DEFAULT 'other',
    expected_words INT DEFAULT 0,
    actual_words INT DEFAULT 0,
    chapter_count INT DEFAULT 0,
    cover_url VARCHAR(255),
    status ENUM('draft', 'ongoing', 'completed', 'archived') DEFAULT 'draft',
    is_public BOOLEAN DEFAULT FALSE,
    start_date DATE,
    end_date DATE,
    last_chapter_at DATETIME,
    daily_words JSON,
    total_reading_time INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    INDEX idx_author (author_id),
    INDEX idx_status (status),
    INDEX idx_category (category),
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 章节表
CREATE TABLE IF NOT EXISTS chapters (
    id VARCHAR(36) PRIMARY KEY,
    work_id VARCHAR(36) NOT NULL,
    title VARCHAR(100) NOT NULL,
    chapter_number INT NOT NULL,
    volume_number INT DEFAULT 1,
    content LONGTEXT,
    word_count INT DEFAULT 0,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    is_ai_generated BOOLEAN DEFAULT FALSE,
    ai_generation_count INT DEFAULT 0,
    plot_node_id VARCHAR(36),
    author_notes TEXT,
    writing_duration INT DEFAULT 0,
    published_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    INDEX idx_work (work_id),
    INDEX idx_chapter_number (work_id, chapter_number),
    FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 角色表
CREATE TABLE IF NOT EXISTS characters (
    id VARCHAR(36) PRIMARY KEY,
    work_id VARCHAR(36) NOT NULL,
    name VARCHAR(50) NOT NULL,
    alias VARCHAR(50),
    gender VARCHAR(20),
    age VARCHAR(50),
    appearance TEXT,
    personality TEXT,
    background TEXT,
    power_level VARCHAR(100),
    abilities JSON,
    tags JSON,
    is_protagonist BOOLEAN DEFAULT FALSE,
    first_appear_chapter INT,
    last_appear_chapter INT,
    appear_count INT DEFAULT 0,
    relationships JSON,
    growth_line TEXT,
    metadata JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_work (work_id),
    INDEX idx_name (work_id, name),
    FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 世界观设定表
CREATE TABLE IF NOT EXISTS world_settings (
    id VARCHAR(36) PRIMARY KEY,
    work_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    related_characters JSON,
    related_events JSON,
    first_appear_chapter INT,
    metadata JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_work (work_id),
    FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 时间线事件表
CREATE TABLE IF NOT EXISTS timeline_events (
    id VARCHAR(36) PRIMARY KEY,
    work_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    event_time VARCHAR(100),
    chapter_number INT,
    involved_characters JSON,
    consequences JSON,
    related_settings JSON,
    is_key_event BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_work (work_id),
    INDEX idx_chapter (work_id, chapter_number),
    FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 伏笔表
CREATE TABLE IF NOT EXISTS foreshadowings (
    id VARCHAR(36) PRIMARY KEY,
    work_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    plant_chapter INT NOT NULL,
    expected_recall_chapter INT,
    actual_recall_chapter INT,
    status ENUM('planted', 'recalled', 'abandoned') DEFAULT 'planted',
    related_characters JSON,
    recall_content TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_work (work_id),
    INDEX idx_status (work_id, status),
    FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 剧情节点表
CREATE TABLE IF NOT EXISTS plot_nodes (
    id VARCHAR(36) PRIMARY KEY,
    work_id VARCHAR(36) NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    chapter_number INT,
    volume_number INT DEFAULT 1,
    node_order INT NOT NULL,
    type ENUM('required', 'optional') DEFAULT 'optional',
    status ENUM('pending', 'in_progress', 'completed', 'skipped') DEFAULT 'pending',
    key_events JSON,
    characters JSON,
    foreshadowings JSON,
    emotions JSON,
    expected_word_count INT,
    actual_word_count INT DEFAULT 0,
    rhythm_requirement JSON,
    constraints JSON,
    parent_node_id VARCHAR(36),
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_work (work_id),
    INDEX idx_chapter (work_id, chapter_number),
    FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 剧情大纲表
CREATE TABLE IF NOT EXISTS plot_outlines (
    id VARCHAR(36) PRIMARY KEY,
    work_id VARCHAR(36) NOT NULL UNIQUE,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    total_volumes INT DEFAULT 1,
    total_chapters INT DEFAULT 0,
    total_words INT DEFAULT 0,
    structure JSON,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 文风模型表
CREATE TABLE IF NOT EXISTS style_models (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    model_path VARCHAR(255),
    training_data_path VARCHAR(255),
    sample_texts JSON,
    status ENUM('training', 'ready', 'failed') DEFAULT 'training',
    is_default BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 敏感词表
CREATE TABLE IF NOT EXISTS sensitive_words (
    id VARCHAR(36) PRIMARY KEY,
    word VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    risk_level ENUM('high', 'medium', 'low') DEFAULT 'medium',
    platform VARCHAR(50),
    suggestion VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_word (word),
    INDEX idx_platform (platform)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 版权存证表
CREATE TABLE IF NOT EXISTS copyright_certificates (
    id VARCHAR(36) PRIMARY KEY,
    work_id VARCHAR(36) NOT NULL,
    chapter_id VARCHAR(36),
    content_hash VARCHAR(64) NOT NULL,
    certificate_id VARCHAR(100) UNIQUE,
    blockchain_tx_hash VARCHAR(100),
    certificate_url VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_work (work_id),
    FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 会员订单表
CREATE TABLE IF NOT EXISTS membership_orders (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    plan ENUM('free', 'vip_monthly', 'vip_quarterly', 'vip_yearly', 'pro_monthly', 'pro_quarterly', 'pro_yearly', 'studio_custom') NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(20),
    payment_status ENUM('pending', 'success', 'failed', 'refunded') DEFAULT 'pending',
    transaction_id VARCHAR(100),
    paid_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_status (payment_status),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 工作室表
CREATE TABLE IF NOT EXISTS studios (
    id VARCHAR(36) PRIMARY KEY,
    owner_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    max_members INT DEFAULT 10,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 工作室成员表
CREATE TABLE IF NOT EXISTS studio_members (
    id VARCHAR(36) PRIMARY KEY,
    studio_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    role ENUM('owner', 'admin', 'editor', 'creator', 'reviewer') DEFAULT 'creator',
    permissions JSON,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_studio (studio_id),
    INDEX idx_user (user_id),
    FOREIGN KEY (studio_id) REFERENCES studios(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_studio_user (studio_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AI生成记录表
CREATE TABLE IF NOT EXISTS ai_generation_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    work_id VARCHAR(36),
    chapter_id VARCHAR(36),
    generation_type VARCHAR(50) NOT NULL,
    input_data JSON,
    output_data LONGTEXT,
    word_count INT DEFAULT 0,
    model_used VARCHAR(50),
    tokens_used INT DEFAULT 0,
    duration_ms INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_work (work_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
