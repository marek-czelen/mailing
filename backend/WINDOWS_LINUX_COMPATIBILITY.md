# 🌍 Kompatybilność Windows/Linux - Przewodnik

## 📋 Przegląd Zmian dla Linux

System został dostosowany do pełnej kompatybilności z serwerami Linux. Oto co zostało zmienione:

## 🔧 Kluczowe Poprawki

### 1. **Skrypty NPM**
```json
// Windows & Linux kompatybilne (cross-env)
"start:dev": "cross-env NODE_ENV=development node ./src/bin/www.js"
"start:prod": "cross-env NODE_ENV=production node ./src/bin/www.js"

// Dedykowane dla Linux
"linux:dev": "NODE_ENV=development nodemon ./src/bin/www.js"
"linux:prod": "NODE_ENV=production node ./src/bin/www.js"
```

### 2. **Ścieżki plików**
- ✅ Używamy `path.resolve()` zamiast hardcoded ścieżek
- ✅ Forward slashes dla kompatybilności
- ✅ Relatywne ścieżki od `__dirname`

### 3. **Zmienne środowiskowe**
- ✅ `cross-env` dla Windows/Linux
- ✅ `dotenv` dla ładowania plików .env
- ✅ Automatyczne wykrywanie środowiska

### 4. **Process Management**
- ✅ PM2 config (`ecosystem.config.json`)
- ✅ Systemd compatibility
- ✅ Graceful shutdown

## 🚀 Uruchomianie na różnych systemach

### Windows Development
```bash
npm run dev              # Development z cross-env
npm run dev:debug        # Development z debugger
npm run start:prod       # Production z cross-env
```

### Linux Development
```bash
npm run linux:dev        # Native Linux syntax
npm run linux:debug      # Debug na Linux
npm run linux:prod       # Production na Linux
```

### Linux Production (PM2)
```bash
pm2 start ecosystem.config.json --env production
pm2 status
pm2 logs mailing-system
```

## 📁 Struktura Plików Środowiskowych

```
├── .env.example          # Szablon (commitowany)
├── .env.development      # Development (ignorowany)
├── .env.production       # Production (ignorowany)
├── .env.local           # Lokalne nadpisania (ignorowany)
└── .env                 # Główny plik (opcjonalny, ignorowany)
```

## 🔍 Różnice między systemami

| Aspekt | Windows | Linux |
|--------|---------|-------|
| Zmienne env | `set NODE_ENV=prod` | `export NODE_ENV=prod` |
| Ścieżki | `\` backslash | `/` forward slash |
| Process Manager | `nodemon` / Task Manager | `PM2` / `systemd` |
| Permissions | Automatyczne | `chmod 755` |
| Service | Windows Service | `systemd` |
| Logi | Event Viewer | `/var/log/` |

## ⚙️ Konfiguracja Środowiskowa

### Development (.env.development)
```env
NODE_ENV=development
APP_NAME=Mailing System Dev
BASE_URL=http://localhost:3000
HOST=localhost
PORT=3000

# Development - łagodne ustawienia SSL
SMTP_IGNORE_TLS=true
SMTP_REJECT_UNAUTHORIZED=false

# Development - szczegółowe logi
DB_LOGGING=true
EXPRESS_JSON_LIMIT=50mb
```

### Production (.env.production)
```env
NODE_ENV=production
APP_NAME=Mailing System
BASE_URL=https://yourdomain.com
HOST=0.0.0.0
PORT=3000

# Production - bezpieczne SSL
SMTP_REJECT_UNAUTHORIZED=true
SMTP_IGNORE_TLS=false

# Production - ograniczone logi
DB_LOGGING=false
EXPRESS_JSON_LIMIT=10mb

# Security
JWT_SECRET=very_long_random_string_here
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## 🐧 Specyficzne dla Linux

### Systemd Service
Utwórz `/etc/systemd/system/mailing-system.service`:

```ini
[Unit]
Description=Mailing System Node.js App
Documentation=https://github.com/your-repo
After=network.target

[Service]
Type=simple
User=mailing
Group=mailing
WorkingDirectory=/opt/mailing-system
ExecStart=/usr/bin/node src/bin/www.js
Environment=NODE_ENV=production
Environment=PATH=/usr/bin:/usr/local/bin
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=mailing-system

[Install]
WantedBy=multi-user.target
```

Aktywacja:
```bash
sudo systemctl daemon-reload
sudo systemctl enable mailing-system
sudo systemctl start mailing-system
sudo systemctl status mailing-system
```

### Nginx Reverse Proxy
```nginx
upstream mailing_backend {
    server localhost:3000;
    keepalive 64;
}

server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://mailing_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔒 Bezpieczeństwo na Linux

### Uprawnienia plików
```bash
# Podstawowe uprawnienia
sudo chown -R mailing:mailing /opt/mailing-system
find /opt/mailing-system -type f -exec chmod 644 {} \;
find /opt/mailing-system -type d -exec chmod 755 {} \;
chmod +x /opt/mailing-system/src/bin/www.js

# Bezpieczne pliki konfiguracyjne  
chmod 600 /opt/mailing-system/.env.production
```

### Firewall (UFW)
```bash
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw --force enable
```

### Fail2ban (opcjonalnie)
```bash
sudo apt install fail2ban

# Konfiguracja w /etc/fail2ban/jail.local
[nginx-limit-req]
enabled = true
filter = nginx-limit-req
action = iptables-multiport[name=ReqLimit, port="http,https", protocol=tcp]
logpath = /var/log/nginx/error.log
findtime = 600
bantime = 7200
maxretry = 10
```

## 📊 Monitorowanie

### PM2 Monitoring
```bash
# Basic monitoring
pm2 monit

# Web dashboard (opcjonalnie)
pm2 install pm2-server-monit
```

### System monitoring
```bash
# Zainstaluj htop, iotop, netstat
sudo apt install htop iotop net-tools

# Monitoring w czasie rzeczywistym
htop
iotop
netstat -tulnp | grep :3000
```

### Log monitoring
```bash
# Tail wszystkich logów
tail -f logs/*.log

# Grep dla błędów
grep -i error logs/*.log | tail -20

# Monitoring z PM2
pm2 logs --lines 100
pm2 logs mailing-system -f
```

## 🚨 Troubleshooting

### Problem: Port już używany
```bash
# Znajdź proces używający portu
sudo netstat -tulnp | grep :3000
sudo lsof -i :3000

# Zabij proces
sudo kill -9 <PID>
```

### Problem: Uprawnienia do plików
```bash
# Sprawdź uprawnienia
ls -la .env.production
ls -la logs/

# Popraw uprawnienia
chmod 600 .env.production
chmod 755 logs/
chmod 644 logs/*.log
```

### Problem: MySQL connection
```bash
# Test połączenia
mysql -h localhost -u mailing_user -p mailing_prod

# Sprawdź status MySQL
sudo systemctl status mysql
sudo journalctl -u mysql -f
```

### Problem: SSL Certificate
```bash
# Sprawdź certyfikat
openssl x509 -in /path/to/cert.pem -text -noout

# Test SSL
curl -I https://yourdomain.com
```

## 📋 Checklist wdrożenia

### Pre-deployment
- [ ] Serwer Linux z Node.js 18+
- [ ] MySQL/MariaDB zainstalowany
- [ ] Nginx zainstalowany (opcjonalnie)
- [ ] PM2 zainstalowany globalnie
- [ ] SSL certyfikaty przygotowane
- [ ] DNS wskazuje na serwer

### Deployment
- [ ] Kod sklonowany na serwer
- [ ] `npm ci --production` wykonany
- [ ] `.env.production` skonfigurowany
- [ ] Baza danych utworzona
- [ ] `node test-environment.js` przeszedł
- [ ] PM2 uruchomiony (`pm2 start ecosystem.config.json --env production`)
- [ ] Nginx skonfigurowany (jeśli używany)
- [ ] Firewall skonfigurowany
- [ ] SSL włączony

### Post-deployment
- [ ] Aplikacja odpowiada na HTTPS
- [ ] Logi są zapisywane poprawnie
- [ ] PM2 auto-startup skonfigurowany (`pm2 startup && pm2 save`)
- [ ] Monitoring działa
- [ ] Backup bazy danych skonfigurowany
- [ ] Procedura aktualizacji udokumentowana

## 🎯 Testowanie kompatybilności

### Na Windows
```cmd
# Test zmiennych środowiskowych
npm run dev
# Sprawdź logi czy ładują się pliki .env

# Test cross-env
npm run start:dev
npm run start:prod
```

### Na Linux
```bash
# Test natywnych skryptów
npm run linux:dev
npm run linux:prod

# Test PM2
pm2 start ecosystem.config.json --env production
pm2 status
pm2 logs mailing-system
```

---

**✅ System jest w pełni kompatybilny z Linux! Wszystkie zmiany zostały przetestowane pod kątem działania na serwerach produkcyjnych.**