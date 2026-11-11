-- =====================================================================
-- CuidaMente - Script de criação do banco de dados (MySQL 8+)
-- Fiel ao DER da 1ª entrega: usuarios, triagens, respostas,
-- lembretes e recursos.
-- Compatível com as classes TypeScript em src/backend/src/models
-- =====================================================================

CREATE DATABASE IF NOT EXISTS cuidamente
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE cuidamente;

-- ---------------------------------------------------------------------
-- usuarios: superclasse abstrata Usuario (Paciente / Administrador).
-- A coluna tipo_usuario discrimina o subtipo (herança single-table).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
  usuario_id    INTEGER      NOT NULL AUTO_INCREMENT,
  nome          VARCHAR(100) NOT NULL,
  email         VARCHAR(100) NOT NULL,
  senha         VARCHAR(255) NOT NULL,           -- hash bcrypt
  tipo_usuario  VARCHAR(20)  NOT NULL DEFAULT 'PACIENTE',
  criado_em     DATE         NOT NULL,
  PRIMARY KEY (usuario_id),
  CONSTRAINT uq_usuarios_email UNIQUE (email),
  CONSTRAINT ck_usuarios_tipo CHECK (tipo_usuario IN ('PACIENTE', 'ADMIN'))
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- triagens: TriagemDepressao (PHQ-9) / TriagemAnsiedade (GAD-7).
-- Relacionamento "Realiza": usuarios 1 : N triagens.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS triagens (
  triagem_id       INTEGER     NOT NULL AUTO_INCREMENT,
  tipo             VARCHAR(50) NOT NULL,
  nivel_resultado  VARCHAR(20) NOT NULL,
  data_triagem     DATE        NOT NULL,
  usuario_id       INTEGER     NOT NULL,
  PRIMARY KEY (triagem_id),
  CONSTRAINT fk_triagens_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (usuario_id) ON DELETE CASCADE,
  CONSTRAINT ck_triagens_tipo  CHECK (tipo IN ('DEPRESSAO', 'ANSIEDADE')),
  CONSTRAINT ck_triagens_nivel CHECK (nivel_resultado IN ('BEM', 'ATENCAO', 'CRISE')),
  INDEX idx_triagens_usuario_data (usuario_id, data_triagem)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- respostas: composição 1:N -> cada Triagem é composta por Respostas.
-- ON DELETE CASCADE garante que a parte não existe sem o todo.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS respostas (
  respostas_id    INTEGER NOT NULL AUTO_INCREMENT,
  pergunta_id     INTEGER NOT NULL,
  valor_resposta  INTEGER NOT NULL,
  triagem_id      INTEGER NOT NULL,
  PRIMARY KEY (respostas_id),
  CONSTRAINT fk_respostas_triagem FOREIGN KEY (triagem_id)
    REFERENCES triagens (triagem_id) ON DELETE CASCADE,
  CONSTRAINT uq_respostas_pergunta UNIQUE (triagem_id, pergunta_id),
  CONSTRAINT ck_respostas_valor CHECK (valor_resposta BETWEEN 0 AND 3)
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- lembretes: relacionamento "Configura" usuarios 1 : N lembretes.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lembretes (
  lembretes_id  INTEGER      NOT NULL AUTO_INCREMENT,
  descricao     VARCHAR(255) NOT NULL,
  horario       TIME         NOT NULL,
  ativo         BOOLEAN      NOT NULL DEFAULT TRUE,
  usuario_id    INTEGER      NOT NULL,
  PRIMARY KEY (lembretes_id),
  CONSTRAINT fk_lembretes_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (usuario_id) ON DELETE CASCADE
) ENGINE = InnoDB;

-- ---------------------------------------------------------------------
-- recursos: catálogo de canais de apoio gerenciado pelo Administrador.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recursos (
  recursos_id  INTEGER      NOT NULL AUTO_INCREMENT,
  nome         VARCHAR(150) NOT NULL,
  tipo         VARCHAR(50)  NOT NULL,
  contato      VARCHAR(100) NOT NULL,
  cidade       VARCHAR(100) NOT NULL,
  gratuito     BOOLEAN      NOT NULL DEFAULT TRUE,
  PRIMARY KEY (recursos_id),
  INDEX idx_recursos_tipo_cidade (tipo, cidade)
) ENGINE = InnoDB;
