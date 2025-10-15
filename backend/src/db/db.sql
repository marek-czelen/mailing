-- Skrypt tworzenia bazy danych dla systemu mailingowego
-- MySQL/MariaDB - zgodny z modelami Sequelize

CREATE DATABASE IF NOT EXISTS mailing CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mailing;

-- Tabela klientów/firm
CREATE TABLE customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255),
    active BOOLEAN DEFAULT TRUE
);

-- Tabela użytkowników
CREATE TABLE users (
    email VARCHAR(255) PRIMARY KEY,
    hash VARCHAR(255),
    customer_id INT,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    INDEX idx_customer_id (customer_id)
);

-- Tabela adresów email
CREATE TABLE mail_addresses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    mail_address VARCHAR(255) NOT NULL,
    miasto VARCHAR(255),
    rodzaj VARCHAR(255),
    active INT DEFAULT 1,
    customer_id INT NOT NULL,
    unsubscribes_date DATE,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_mail_address (mail_address),
    INDEX idx_customer_id (customer_id),
    INDEX idx_active (active)
);

-- Tabela definicji atrybutów adresów email
CREATE TABLE mail_address_attributes_definitions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    attribute_name VARCHAR(255) NOT NULL,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_customer_id (customer_id)
);

-- Tabela wartości atrybutów adresów email
CREATE TABLE mail_address_attribute_value (
    mail_address_attributes_definitions_id INT NOT NULL,
    mail_addresses_id INT NOT NULL,
    mail_address_attributes_value VARCHAR(255),
    
    PRIMARY KEY (mail_address_attributes_definitions_id, mail_addresses_id),
    FOREIGN KEY (mail_address_attributes_definitions_id) REFERENCES mail_address_attributes_definitions(id) ON DELETE CASCADE,
    FOREIGN KEY (mail_addresses_id) REFERENCES mail_addresses(id) ON DELETE CASCADE
);

-- Tabela kampanii marketingowych
CREATE TABLE marketing_campanies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    mail_content MEDIUMTEXT,
    date_start DATE,
    date_end DATE,
    progress INT,
    active BOOLEAN DEFAULT TRUE,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_customer_id (customer_id),
    INDEX idx_active (active)
);

-- Tabela wysyłki kampanii marketingowych
CREATE TABLE marketing_campanies_mailing (
    marketing_campanies_id INT NOT NULL,
    mail_addresses_id INT NOT NULL,
    response_address VARCHAR(255),
    is_readed BOOLEAN,
    respons_data DATE,
    is_send BOOLEAN,
    send_data DATE,
    
    PRIMARY KEY (marketing_campanies_id, mail_addresses_id),
    FOREIGN KEY (marketing_campanies_id) REFERENCES marketing_campanies(id) ON DELETE CASCADE,
    FOREIGN KEY (mail_addresses_id) REFERENCES mail_addresses(id) ON DELETE CASCADE,
    INDEX idx_is_send (is_send),
    INDEX idx_is_readed (is_readed)
);

-- Tabela funkcji uprawnień
CREATE TABLE permission_function (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255)
);

-- Tabela obiektów uprawnień
CREATE TABLE permission_objects (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255)
);

-- Tabela uprawnień
CREATE TABLE permission (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT,
    permission_objects_id INT,
    permission_function_id INT,
    access_level INT NOT NULL,
    
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_objects_id) REFERENCES permission_objects(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_function_id) REFERENCES permission_function(id) ON DELETE CASCADE,
    INDEX idx_customer_id (customer_id)
);

-- Wstawienie podstawowych danych

-- Dodanie przykładowego klienta
INSERT INTO customers (id, name, active) VALUES (1, 'Default Customer', TRUE);

-- Dodanie użytkownika administratora
-- Email: admin@admin.pl
-- Hasło: admin (zahashowane bcrypt z saltRounds=10)
-- Hash został wygenerowany za pomocą bcrypt.hash('admin', 10)
INSERT INTO users (email, hash, customer_id) VALUES
('admin@admin.pl', '$2b$10$gfb2kbafPKXysR9BXyyvfumD1BFD7tGWP4B1SvrvR.iehfxSx01uu', 1);

-- Podstawowe funkcje uprawnień
INSERT INTO permission_function (name) VALUES 
('read'), ('write'), ('manage'), ('delete');

-- Podstawowe obiekty uprawnień
INSERT INTO permission_objects (name) VALUES 
('users'), ('mail_addresses'), ('campaigns'), ('reports');