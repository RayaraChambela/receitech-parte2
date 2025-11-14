-- CRIAÇÃO DO BANCO
DROP DATABASE IF EXISTS web_receitas;
CREATE DATABASE web_receitas CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE web_receitas;

-- TABELA: users
CREATE TABLE users (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  email        VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL, -- bcrypt
  avatar_url   VARCHAR(255) NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- TABELA: categories
CREATE TABLE categories (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(60) NOT NULL UNIQUE,
  slug       VARCHAR(80) NOT NULL UNIQUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- TABELA: recipes
CREATE TABLE recipes (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED NOT NULL,
  title        VARCHAR(150) NOT NULL,
  slug         VARCHAR(180) NOT NULL UNIQUE,
  description  TEXT NULL,
  prep_time_min SMALLINT UNSIGNED NULL, -- tempo de preparo em minutos
  servings     TINYINT UNSIGNED NULL,   -- porções
  cover_image  VARCHAR(255) NULL,       -- imagem principal
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_recipes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- N:N: recipe_categories
CREATE TABLE recipe_categories (
  recipe_id   INT UNSIGNED NOT NULL,
  category_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (recipe_id, category_id),
  CONSTRAINT fk_rc_recipe FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_rc_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- TABELA: ingredients
CREATE TABLE ingredients (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  recipe_id  INT UNSIGNED NOT NULL,
  name       VARCHAR(120) NOT NULL,
  quantity   VARCHAR(60) NULL,   -- ex: "200 g", "1 xícara", "2 unid"
  position_n SMALLINT UNSIGNED NOT NULL DEFAULT 1, -- ordem opcional
  CONSTRAINT fk_ing_recipe FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- TABELA: steps
CREATE TABLE steps (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  recipe_id  INT UNSIGNED NOT NULL,
  position_n SMALLINT UNSIGNED NOT NULL,
  content    TEXT NOT NULL,
  CONSTRAINT fk_steps_recipe FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- TABELA: recipe_images
CREATE TABLE recipe_images (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  recipe_id  INT UNSIGNED NOT NULL,
  url        VARCHAR(255) NOT NULL,
  alt        VARCHAR(150) NULL,
  position_n SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  CONSTRAINT fk_rimg_recipe FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- OPCIONAIS

-- favorites: usuário marca receita como favorita
CREATE TABLE favorites (
  user_id   INT UNSIGNED NOT NULL,
  recipe_id INT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, recipe_id),
  CONSTRAINT fk_fav_user   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_fav_recipe FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- comments: comentários nas receitas
CREATE TABLE comments (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  recipe_id  INT UNSIGNED NOT NULL,
  user_id    INT UNSIGNED NOT NULL,
  content    TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cmt_recipe FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_cmt_user   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB;

-- ÍNDICES ÚTEIS
CREATE INDEX idx_recipes_user      ON recipes(user_id);
CREATE INDEX idx_steps_recipe_pos  ON steps(recipe_id, position_n);
CREATE INDEX idx_ing_recipe_pos    ON ingredients(recipe_id, position_n);
CREATE INDEX idx_rimg_recipe_pos   ON recipe_images(recipe_id, position_n);

-- =========================
-- SEEDS INICIAIS
-- =========================

-- Usuário fake (senha será inserida depois pela app; aqui só exemplo)
INSERT INTO users (name, email, password_hash, avatar_url)
VALUES ('Admin', 'admin@receita.tech', '$2a$10$abcdefghijklmnopqrstuvxyz0123456789ABCDEabc', NULL);

-- Categorias comuns
INSERT INTO categories (name, slug) VALUES
  ('Sobremesas', 'sobremesas'),
  ('Almoço',     'almoco'),
  ('Fitness',    'fitness'),
  ('Lanches',    'lanches');

-- Receitas de exemplo (usando assets do /public/assets)
INSERT INTO recipes (user_id, title, slug, description, prep_time_min, servings, cover_image) VALUES
  (1, 'Spaghetti alla Burrata', 'spaghetti-alla-burrata', 'Um clássico cremoso com burrata.', 39, 2, '/assets/spaguetti.png'),
  (1, 'Stake Tartare',          'stake-tartare',           'Tártaro de carne bovina com temperos.', 39, 1, '/assets/stake.png'),
  (1, 'Filet Mignon',           'filet-mignon',            'Filet com ponto perfeito.', 58, 2, '/assets/carne.png'),
  (1, 'Bolo de Laranja',        'bolo-de-laranja',         'Bolo cítrico e fofinho.', 39, 8, '/assets/BOLO DE LARANJA.jpg');

-- Relaciona receitas às categorias (N:N)
-- Spaghetti, Stake, Filet -> Almoço ; Bolo -> Sobremesas
INSERT INTO recipe_categories (recipe_id, category_id) VALUES
  (1, 2),
  (2, 2),
  (3, 2),
  (4, 1);

-- Ingredientes (exemplo simples)
INSERT INTO ingredients (recipe_id, name, quantity, position_n) VALUES
  (1, 'Spaghetti', '200 g', 1),
  (1, 'Burrata', '1 unid', 2),
  (1, 'Tomate cereja', '100 g', 3);

-- Passos (exemplo)
INSERT INTO steps (recipe_id, position_n, content) VALUES
  (1, 1, 'Cozinhe o spaghetti até ficar al dente.'),
  (1, 2, 'Salteie tomates e finalize com burrata.'),
  (1, 3, 'Ajuste sal e pimenta e sirva.');

-- Imagens adicionais (opcional)
INSERT INTO recipe_images (recipe_id, url, alt, position_n) VALUES
  (1, '/assets/spaguetti.png', 'Spaghetti alla Burrata', 1),
  (4, '/assets/BOLO DE LARANJA.jpg', 'Bolo de Laranja', 1);
