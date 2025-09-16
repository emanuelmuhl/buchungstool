# 🐳 Docker Deployment für Rustico Buchungstool

Diese Anleitung zeigt, wie Sie das Rustico Buchungstool mit Docker auf Ihrem Raspberry Pi deployen können.

## 📋 Voraussetzungen

- **Raspberry Pi** (3 oder 4 empfohlen) mit **Raspberry Pi OS** (64-bit)
- **Docker** und **Docker Compose** installiert
- **Mindestens 4GB RAM** (8GB empfohlen)
- **SD-Karte mit mindestens 32GB** Speicherplatz

## 🚀 Installation

### 1. Docker installieren

```bash
# System aktualisieren
sudo apt update && sudo apt upgrade -y

# Docker installieren
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Benutzer zur docker Gruppe hinzufügen
sudo usermod -aG docker $USER

# Docker Compose installieren
sudo apt install docker-compose-plugin -y

# System neu starten
sudo reboot
```

### 2. Projekt klonen

```bash
# Projekt klonen
git clone <your-repository-url>
cd rustico-buchungstool

# Berechtigungen setzen
chmod +x *.sh
```

### 3. Umgebungsvariablen konfigurieren

```bash
# .env Datei erstellen
cat > .env << EOF
# Datenbank
DB_USERNAME=rustico_user
DB_PASSWORD=your_secure_password_here
DB_DATABASE=rustico_buchungstool

# JWT Secret (wichtig für Sicherheit!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Domain (optional für SSL)
DOMAIN=your-domain.com
EOF
```

## 🏗️ Deployment

### Entwicklung/Test

```bash
# Container bauen und starten
docker-compose up -d

# Logs anzeigen
docker-compose logs -f

# Status prüfen
docker-compose ps
```

### Produktion

```bash
# Produktions-Container starten
docker-compose -f docker-compose.prod.yml up -d

# Logs anzeigen
docker-compose -f docker-compose.prod.yml logs -f
```

## 🌐 Zugriff

Nach dem Start können Sie auf die Anwendung zugreifen:

- **Frontend**: http://your-raspberry-pi-ip
- **Backend API**: http://your-raspberry-pi-ip:3101
- **Datenbank**: localhost:5432 (nur lokal)

### Standard-Anmeldedaten
- **Benutzername**: `admin`
- **Passwort**: `admin123`

## 🔧 Verwaltung

### Container verwalten

```bash
# Container stoppen
docker-compose down

# Container mit Volumes löschen
docker-compose down -v

# Container neu starten
docker-compose restart

# Spezifischen Service neu starten
docker-compose restart backend
```

### Logs anzeigen

```bash
# Alle Logs
docker-compose logs

# Spezifischer Service
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres

# Logs folgen
docker-compose logs -f
```

### Datenbank-Backup

```bash
# Backup erstellen
docker-compose exec postgres pg_dump -U rustico_user rustico_buchungstool > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup wiederherstellen
docker-compose exec -T postgres psql -U rustico_user rustico_buchungstool < backup_file.sql
```

### Updates

```bash
# Code aktualisieren
git pull

# Container neu bauen und starten
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 🔒 Sicherheit

### Firewall konfigurieren

```bash
# UFW installieren
sudo apt install ufw

# Standard-Regeln
sudo ufw default deny incoming
sudo ufw default allow outgoing

# SSH erlauben
sudo ufw allow ssh

# HTTP/HTTPS erlauben
sudo ufw allow 80
sudo ufw allow 443

# Firewall aktivieren
sudo ufw enable
```

### SSL/HTTPS (Optional)

Für HTTPS benötigen Sie ein SSL-Zertifikat:

```bash
# Certbot installieren
sudo apt install certbot

# Zertifikat erstellen (ersetzen Sie your-domain.com)
sudo certbot certonly --standalone -d your-domain.com

# Zertifikate in ssl/ Verzeichnis kopieren
sudo mkdir -p ssl
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ssl/
sudo chown -R $USER:$USER ssl/
```

## 📊 Monitoring

### System-Ressourcen überwachen

```bash
# Container-Status
docker stats

# Disk-Usage
df -h

# Memory-Usage
free -h

# CPU-Temperature (Raspberry Pi)
vcgencmd measure_temp
```

### Log-Rotation

```bash
# Logrotate konfigurieren
sudo nano /etc/logrotate.d/docker

# Inhalt:
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size=1M
    missingok
    delaycompress
    copytruncate
}
```

## 🐛 Troubleshooting

### Häufige Probleme

**1. Container startet nicht**
```bash
# Logs prüfen
docker-compose logs

# Port-Konflikte prüfen
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :3101
```

**2. Datenbank-Verbindung fehlschlägt**
```bash
# PostgreSQL-Status prüfen
docker-compose exec postgres pg_isready -U rustico_user

# Datenbank-Verbindung testen
docker-compose exec postgres psql -U rustico_user -d rustico_buchungstool -c "SELECT 1;"
```

**3. Frontend lädt nicht**
```bash
# Nginx-Status prüfen
docker-compose exec frontend nginx -t

# Backend-Health-Check
curl http://localhost:3101/health
```

### Performance-Optimierung

**1. Memory-Limits setzen**
```yaml
# In docker-compose.yml hinzufügen:
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M
```

**2. Swap-Datei vergrößern**
```bash
# Swap-Datei auf 2GB setzen
sudo dphys-swapfile swapoff
sudo nano /etc/dphys-swapfile
# CONF_SWAPSIZE=2048
sudo dphys-swapfile setup
sudo dphys-swapfile swapon
```

## 🔄 Automatische Updates

### Cron-Job für Updates

```bash
# Crontab bearbeiten
crontab -e

# Tägliches Update um 2:00 Uhr
0 2 * * * cd /path/to/rustico-buchungstool && git pull && docker-compose down && docker-compose build --no-cache && docker-compose up -d >> /var/log/rustico-update.log 2>&1
```

## 📞 Support

Bei Problemen:

1. **Logs prüfen**: `docker-compose logs`
2. **Container-Status**: `docker-compose ps`
3. **System-Ressourcen**: `docker stats`
4. **Datenbank-Verbindung**: `docker-compose exec postgres pg_isready`

## 📝 Notizen

- **Backup**: Regelmäßige Backups der Datenbank und Uploads
- **Updates**: System und Docker regelmäßig aktualisieren
- **Monitoring**: Ressourcen-Verbrauch überwachen
- **Sicherheit**: Passwörter und JWT-Secret regelmäßig ändern

---

**🏔️ Rustico Buchungstool - Docker Deployment Guide**
*Version 1.0.0 - Dezember 2024* 