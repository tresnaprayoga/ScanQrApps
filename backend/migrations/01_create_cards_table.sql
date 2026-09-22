CREATE DATABASE IF NOT EXISTS qrcodeapp;
USE qrcodeapp;

CREATE TABLE IF NOT EXISTS cards (
    id VARCHAR(20) PRIMARY KEY,
    business_name VARCHAR(255) NULL,
    business_address VARCHAR(255) NULL,
    review_link TEXT NULL,
    place_id VARCHAR(255) NULL,
    pin_hash VARCHAR(255) NULL,
    activation_code_hash VARCHAR(255) NULL,
    status ENUM('belum_aktif', 'aktif') DEFAULT 'belum_aktif',
    activated_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
