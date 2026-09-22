USE qrcodeapp;

ALTER TABLE cards
    ADD COLUMN IF NOT EXISTS activation_code_hash VARCHAR(255) NULL AFTER pin_hash;