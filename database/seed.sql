-- =====================================================================
-- CuidaMente - Dados iniciais
-- Execute depois de schema.sql
-- =====================================================================
USE cuidamente;

-- Administrador padrão  ->  e-mail: admin@cuidamente.com | senha: admin123
-- (troque a senha após o primeiro acesso)
INSERT INTO usuarios (nome, email, senha, tipo_usuario, criado_em)
SELECT 'Administrador CuidaMente', 'admin@cuidamente.com',
       '$2b$10$VbZPhP.UU.HeGkIkp3Q8RuTB67z..x1P1LDMPMfEaHffKtGf573EK',
       'ADMIN', CURDATE()
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'admin@cuidamente.com');

-- Canais de apoio (RF04). Os de abrangência nacional usam cidade 'Nacional'.
-- O administrador pode cadastrar/editar os serviços de cada cidade pela plataforma.
INSERT INTO recursos (nome, tipo, contato, cidade, gratuito)
SELECT * FROM (
  SELECT 'CVV - Centro de Valorização da Vida' AS nome, 'CVV' AS tipo,
         'Ligue 188 (24h) ou chat em cvv.org.br' AS contato, 'Nacional' AS cidade, TRUE AS gratuito
  UNION ALL SELECT 'SAMU - Atendimento de urgência', 'EMERGENCIA', 'Ligue 192', 'Nacional', TRUE
  UNION ALL SELECT 'Disque Saúde (SUS)', 'TELEATENDIMENTO', 'Ligue 136', 'Nacional', TRUE
  UNION ALL SELECT 'Mapa da Saúde Mental (busca de serviços gratuitos)', 'TELEATENDIMENTO',
                   'mapasaudemental.com.br', 'Nacional', TRUE
  UNION ALL SELECT 'CAPS Maringá', 'CAPS', 'Secretaria Municipal de Saúde de Maringá', 'Maringá', TRUE
  UNION ALL SELECT 'UBS de referência - Maringá', 'UBS', 'Procure a UBS do seu bairro', 'Maringá', TRUE
  UNION ALL SELECT 'Clínicas-escola de Psicologia das universidades', 'CLINICA_ESCOLA',
                   'Atendimento a baixo custo - consulte as faculdades da cidade', 'Maringá', FALSE
  UNION ALL SELECT 'CAPS Londrina', 'CAPS', 'Secretaria Municipal de Saúde de Londrina', 'Londrina', TRUE
  UNION ALL SELECT 'CAPS Curitiba', 'CAPS', 'Secretaria Municipal de Saúde de Curitiba', 'Curitiba', TRUE
) AS dados
WHERE NOT EXISTS (SELECT 1 FROM recursos);
