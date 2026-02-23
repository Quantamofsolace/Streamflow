-- infrastructure/rds/schema.sql
-- Run this once against your RDS MySQL instance to create all tables.
-- Command: mysql -h YOUR_RDS_ENDPOINT -u streamflow_admin -p < schema.sql

CREATE DATABASE IF NOT EXISTS streamflow
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE streamflow;

-- ── VIDEOS ────────────────────────────────────────────────────────────────
-- Stores anime metadata. s3_key is the path inside the S3 bucket.
CREATE TABLE IF NOT EXISTS videos (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(255)  NOT NULL,
  description TEXT,
  genre       VARCHAR(100),
  year        YEAR,
  episodes    INT           DEFAULT 1,
  emoji       VARCHAR(20),
  color       VARCHAR(20),
  s3_key      VARCHAR(500)  NOT NULL,   -- e.g. videos/attack-on-titan-ep1.mp4
  active      TINYINT(1)    DEFAULT 1,  -- 0 = soft deleted
  created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_active (active),
  INDEX idx_created (created_at)
);

-- ── USERS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  email      VARCHAR(255) UNIQUE NOT NULL,
  password   VARCHAR(255)        NOT NULL,  -- bcrypt hash
  username   VARCHAR(100),
  active     TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP  DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);

-- ── DOWNLOADS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS downloads (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT,
  video_id      INT NOT NULL,
  ip_address    VARCHAR(45),
  downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (video_id) REFERENCES videos(id),
  INDEX idx_video (video_id),
  INDEX idx_user  (user_id)
);

-- ── SEED DATA ─────────────────────────────────────────────────────────────
-- Insert the 12 anime titles. Replace s3_key values with real S3 paths.
INSERT IGNORE INTO videos (id, title, genre, year, episodes, emoji, color, s3_key) VALUES
  (1,  'Attack on Titan',       'Action/Drama',   2013, 87,   '⚔️',  '#5a0a0a', 'videos/attack-on-titan-ep1.mp4'),
  (2,  'Demon Slayer',          'Action/Fantasy', 2019, 44,   '🔥',  '#5a1a00', 'videos/demon-slayer-ep1.mp4'),
  (3,  'My Hero Academia',      'Superhero',      2016, 138,  '💪',  '#001a4a', 'videos/mha-ep1.mp4'),
  (4,  'One Piece',             'Adventure',      1999, 1000, '☠️',  '#3a2a00', 'videos/one-piece-ep1.mp4'),
  (5,  'Naruto Shippuden',      'Action/Ninja',   2007, 500,  '🍃',  '#1a2a00', 'videos/naruto-ep1.mp4'),
  (6,  'Death Note',            'Thriller',       2006, 37,   '📓',  '#0a0a0a', 'videos/death-note-ep1.mp4'),
  (7,  'Fullmetal Alchemist',   'Fantasy/Drama',  2009, 64,   '⚗️',  '#2a1500', 'videos/fma-ep1.mp4'),
  (8,  'Hunter x Hunter',       'Adventure',      2011, 148,  '🎯',  '#001020', 'videos/hxh-ep1.mp4'),
  (9,  'Sword Art Online',      'Isekai/Action',  2012, 96,   '🗡️',  '#00001a', 'videos/sao-ep1.mp4'),
  (10, 'Dragon Ball Super',     'Action',         2015, 131,  '🐉',  '#2a1000', 'videos/dbs-ep1.mp4'),
  (11, 'Jujutsu Kaisen',        'Dark Fantasy',   2020, 48,   '💀',  '#15003a', 'videos/jjk-ep1.mp4'),
  (12, 'Spy x Family',          'Comedy/Action',  2022, 37,   '🕵️', '#002a15', 'videos/spyfam-ep1.mp4');
