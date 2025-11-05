# 🐧 Przewodnik Wdrożenia na Linux

## 📋 Wymagania Systemowe

### Node.js
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm

# CentOS/RHEL/Rocky
sudo dnf install nodejs npm

# Sprawdź wersję (wymagane Node.js 18+)
node --version
npm --version
```

### Baza danych MySQL/MariaDB
```bash
# Ubuntu/Debian
sudo apt install mysql-server

# CentOS/RHEL/Rocky  
sudo dnf install mysql-server

# Uruchom MySQL
sudo systemctl start mysql
sudo systemctl enable mysql
```

### PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

## 🚀 Wdrożenie Aplikacji

### 1. Klonowanie i instalacja

```bash
# Klonowanie repozytorium
git clone <repository-url>
cd mailing-backend

# Instalacja zależności
npm ci --production

# Lub z dev dependencies (dla development)
npm install
```

### 2. Konfiguracja środowiska

```bash
# Skopiuj pliki konfiguracyjne
cp .env.example .env.production

# Edytuj konfigurację produkcyjną
nano .env.production
```

**Przykładowa konfiguracja `.env.production`:**
```env
NODE_ENV=production
APP_NAME=Mailing System
BASE_URL=https://yourdomain.com
PORT=3000
HOST=0.0.0.0

# Baza danych
DB_HOST=localhost
DB_PORT=3306
DB_NAME=mailing_prod
DB_USER=mailing_user
DB_PASS=secure_password

# SMTP
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=smtp_password
SMTP_FROM=noreply@yourdomain.com
SMTP_REJECT_UNAUTHORIZED=true

# Bezpieczeństwo
JWT_SECRET=very_long_random_string_here
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Wydajność
EXPRESS_JSON_LIMIT=10mb
MAILING_TASK_INTERVAL=60000
MAILING_SEND_DELAY=100
```

### 3. Konfiguracja bazy danych

```bash
# Zaloguj się do MySQL
sudo mysql -u root -p

# Utwórz bazę i użytkownika
CREATE DATABASE mailing_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mailing_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON mailing_prod.* TO 'mailing_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Uruchom migracje
npm run migrate  # (jeśli masz skrypt migracji)
```

### 4. Testowanie aplikacji

```bash
# Test konfiguracji
node test-environment.js

# Test uruchomienia (development)
npm run linux:dev

# Test produkcyjny
npm run linux:prod
```

## 🔧 Zarządzanie procesami z PM2

### Uruchomienie aplikacji

```bash
# Uruchomienie w trybie produkcyjnym
pm2 start ecosystem.config.json --env production

# Lub bezpośrednio
pm2 start src/bin/www.js --name "mailing-system" --env NODE_ENV=production

# Sprawdź status
pm2 status
pm2 logs mailing-system
```

### Zarządzanie aplikacją

```bash
# Restart aplikacji
pm2 restart mailing-system

# Stop aplikacji
pm2 stop mailing-system

# Monitorowanie
pm2 monit

# Logi
pm2 logs mailing-system --lines 100
pm2 logs mailing-system -f  # Follow logs

# Automatyczne uruchomienie po restarcie systemu
pm2 startup
pm2 save
```

## 🌐 Konfiguracja Nginx (Reverse Proxy)

### Instalacja Nginx

```bash
# Ubuntu/Debian
sudo apt install nginx

# CentOS/RHEL/Rocky
sudo dnf install nginx

sudo systemctl start nginx
sudo systemctl enable nginx
```

### Konfiguracja witryny

Utwórz plik `/etc/nginx/sites-available/mailing-system`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (dodaj swoje certyfikaty)
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Static files (jeśli są potrzebne)
    location /static/ {
        alias /path/to/your/app/public/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Aktywuj konfigurację:
```bash
sudo ln -s /etc/nginx/sites-available/mailing-system /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 SSL/TLS z Let's Encrypt

```bash
# Instalacja Certbot
sudo apt install certbot python3-certbot-nginx  # Ubuntu/Debian
# lub
sudo dnf install certbot python3-certbot-nginx  # CentOS/RHEL/Rocky

# Uzyskanie certyfikatu
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Automatyczne odnowienie
sudo crontab -e
# Dodaj linię:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 🔐 Firewall

```bash
# Ubuntu/Debian (ufw)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw --force enable

# CentOS/RHEL/Rocky (firewalld)
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

## 📊 Monitorowanie

### Logi systemowe

```bash
# Logi aplikacji
tail -f logs/combined.log
tail -f logs/error.log

# Logi PM2
pm2 logs --lines 200

# Logi Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Logi systemu
sudo journalctl -u nginx -f
sudo journalctl -f
```

### Monitoring zasobów

```bash
# Status procesów
pm2 monit

# Użycie systemu
htop
df -h
free -m

# Status MySQL
sudo systemctl status mysql
```

## 🔄 Procedura aktualizacji

```bash
# 1. Backup bazy danych
mysqldump -u mailing_user -p mailing_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Zatrzymaj aplikację
pm2 stop mailing-system

# 3. Aktualizuj kod
git pull origin main

# 4. Zainstaluj nowe zależności
npm ci --production

# 5. Uruchom migracje (jeśli są)
npm run migrate

# 6. Uruchom aplikację
pm2 start mailing-system

# 7. Sprawdź status
pm2 status
curl -I https://yourdomain.com
```

## 🚨 Rozwiązywanie problemów

### Problemy ze zmiennymi środowiskowymi

```bash
# Sprawdź które zmienne są załadowane
node -e "console.log(process.env)" | grep -i NODE_ENV

# Test konfiguracji
NODE_ENV=production node test-environment.js
```

### Problemy z uprawnieniami

```bash
# Uprawnienia do folderów
sudo chown -R $USER:$USER /path/to/app
chmod -R 755 /path/to/app
chmod 600 .env.production

# Upload folder
chmod -R 777 upload/
```

### Problemy z PM2

```bash
# Restart PM2
pm2 kill
pm2 start ecosystem.config.json --env production

# Reset logów
pm2 flush

# Debugowanie
pm2 describe mailing-system
```

### Problemy z bazą danych

```bash
# Test połączenia z bazą
mysql -h localhost -u mailing_user -p mailing_prod

# Sprawdź logi MySQL
sudo tail -f /var/log/mysql/error.log
```

## 📋 Checklist wdrożenia

- [ ] Node.js 18+ zainstalowany
- [ ] MySQL/MariaDB skonfigurowany
- [ ] PM2 zainstalowany globalnie
- [ ] Plik `.env.production` skonfigurowany
- [ ] Baza danych utworzona i migracje uruchomione
- [ ] Test aplikacji przeszedł pomyślnie
- [ ] Nginx zainstalowany i skonfigurowany
- [ ] SSL certyfikaty skonfigurowane
- [ ] Firewall skonfigurowany
- [ ] PM2 uruchomiony i aplikacja działa
- [ ] Automatyczne uruchomienie PM2 skonfigurowane
- [ ] Logi są dostępne i czytelne
- [ ] Backup bazy danych skonfigurowany
- [ ] Monitorowanie działające

## 🛡️ Bezpieczeństwo

### Aktualizacje bezpieczeństwa

```bash
# System
sudo apt update && sudo apt upgrade  # Ubuntu/Debian
sudo dnf update                      # CentOS/RHEL/Rocky

# Node.js packages
npm audit
npm audit fix
```

### Konfiguracja logrotate

Utwórz `/etc/logrotate.d/mailing-system`:
```
/path/to/app/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 0644 $USER $USER
    postrotate
        pm2 reloadLogs
    endscript
}
```

---

**🎯 Po wykonaniu wszystkich kroków aplikacja będzie działać profesjonalnie na serwerze Linux z pełnym monitoringiem i automatycznym zarządzaniem procesami!**