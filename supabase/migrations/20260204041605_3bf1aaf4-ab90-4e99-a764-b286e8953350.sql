-- Limpar códigos de verificação antigos (mais de 5 minutos) para resetar rate limit
DELETE FROM whatsapp_verification_codes 
WHERE expires_at < NOW();