CREATE DATABASE IF NOT EXISTS finan_security
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE finan_security;

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS contas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    saldo DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_contas_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS movimentacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conta_id INT NOT NULL,
    categoria_id INT NULL,
    descricao VARCHAR(255) NOT NULL,
    tipo ENUM('entrada','despesa') NOT NULL,
    valor DECIMAL(12,2) NOT NULL,
    data_movimentacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    forma_pagamento VARCHAR(80),
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_mov_conta FOREIGN KEY (conta_id)
        REFERENCES contas(id) ON DELETE CASCADE,
    CONSTRAINT fk_mov_categoria FOREIGN KEY (categoria_id)
        REFERENCES categorias(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS revisoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    movimentacao_id INT NOT NULL,
    usuario_id INT NOT NULL,
    motivo TEXT NOT NULL,
    status ENUM('pendente','em_analise','aprovada','recusada') NOT NULL DEFAULT 'pendente',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_revisao_mov FOREIGN KEY (movimentacao_id)
        REFERENCES movimentacoes(id) ON DELETE CASCADE,
    CONSTRAINT fk_revisao_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id) ON DELETE CASCADE,
    UNIQUE KEY uq_revisao_mov_usuario (movimentacao_id, usuario_id)
);

CREATE TABLE IF NOT EXISTS notificacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    mensagem VARCHAR(500) NOT NULL,
    status ENUM('nao_lida','lida') NOT NULL DEFAULT 'nao_lida',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notificacao_usuario FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id) ON DELETE CASCADE
);

INSERT IGNORE INTO categorias (nome) VALUES
('Alimentação'), ('Transporte'), ('Saúde'), ('Transferência'),
('Moradia'), ('Lazer'), ('Salário'), ('Outros');
