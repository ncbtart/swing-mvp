#!/usr/bin/env bash
# Use this script to start a docker container for a local development database and SMTP server

# TO RUN ON WINDOWS:
# 1. Install WSL (Windows Subsystem for Linux) - https://learn.microsoft.com/en-us/windows/wsl/install
# 2. Install Docker Desktop for Windows - https://docs.docker.com/docker-for-windows/install/
# 3. Open WSL - `wsl`
# 4. Run this script - `./start-database.sh`

# On Linux and macOS you can run this script directly - `./start-database.sh`

DB_CONTAINER_NAME="swing-postgres"
SMTP_CONTAINER_NAME="swing-smtp"
CA_CERT="ca-certificates.crt"
SASL_PASSWD="/etc/postfix/sasl_passwd"
SASL_PASSWD_HASH="/etc/postfix/sasl_passwd.db"

if ! [ -x "$(command -v docker)" ]; then
  echo "Docker is not installed. Please install Docker and try again.\nDocker install guide: https://docs.docker.com/engine/install/"
  exit 1
fi

# Start or create the database container
if [ "$(docker ps -q -f name=$DB_CONTAINER_NAME)" ]; then
  docker start $DB_CONTAINER_NAME
  echo "Database container started"
else
  # import env variables from .env
  set -a
  source .env

  DB_PASSWORD=$(echo $DATABASE_URL | awk -F':' '{print $3}' | awk -F'@' '{print $1}')

  if [ "$DB_PASSWORD" = "password" ]; then
    echo "You are using the default database password"
    read -p "Should we generate a random password for you? [y/N]: " -r REPLY
    if ! [[ $REPLY =~ ^[Yy]$ ]]; then
      echo "Please set a password in the .env file and try again"
      exit 1
    fi
    # Generate a random URL-safe password
    DB_PASSWORD=$(openssl rand -base64 12 | tr '+/' '-_')
    sed -i -e "s#:password@#:$DB_PASSWORD@#" .env
  fi

  docker run --name $DB_CONTAINER_NAME -e POSTGRES_PASSWORD=$DB_PASSWORD -e POSTGRES_DB=swing -d -p 5432:5432 docker.io/postgres
  echo "Database container was successfully created"
fi

# Generate CA certificate if not exists
if [ ! -f "$CA_CERT" ]; then
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ca-key.pem -out $CA_CERT -subj "/CN=localhost"
  echo "CA certificate generated"
fi

# Generate SASL password file
cat << 'EOF' > sasl_passwd
[smtp.yourdomain.com]:587    yourusername:yourpassword
EOF

# Create the hashed version of the sasl_passwd file
postmap sasl_passwd

# Start or create the SMTP container
if [ "$(docker ps -q -f name=$SMTP_CONTAINER_NAME)" ]; then
  docker start $SMTP_CONTAINER_NAME
  echo "SMTP container started"
else
  # Create a Dockerfile for Postfix
  cat << 'EOF' > Dockerfile.smtp
FROM ubuntu:latest
RUN apt-get update && \
    apt-get install -y postfix libsasl2-modules

COPY main.cf /etc/postfix/main.cf
COPY ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
COPY sasl_passwd /etc/postfix/sasl_passwd
COPY sasl_passwd.db /etc/postfix/sasl_passwd.db

RUN chown root:root /etc/postfix/sasl_passwd /etc/postfix/sasl_passwd.db && chmod 600 /etc/postfix/sasl_passwd /etc/postfix/sasl_passwd.db

CMD ["postfix", "start-fg"]
EOF

  # Create a main.cf configuration file for Postfix
  cat << 'EOF' > main.cf
myhostname = localhost
mydomain = localdomain
myorigin = \$mydomain

# Réseau interne
inet_interfaces = all

# Protocoles réseaux à utiliser
inet_protocols = all

# Adresse pour relayer le courrier
relayhost =

# Chemin des boîtes aux lettres
home_mailbox = Maildir/

# Authentification SASL
smtp_sasl_auth_enable = yes
smtp_sasl_password_maps = hash:/etc/postfix/sasl_passwd
smtp_sasl_security_options = noanonymous

# Sécurité TLS
smtp_tls_security_level = may
smtp_tls_CAfile = /etc/ssl/certs/ca-certificates.crt

# Taille des boîtes aux lettres
mailbox_size_limit = 0

# Compatibilité
recipient_delimiter = +

# Debugging and Logging
maillog_file = /var/log/mail.log
debug_peer_level = 2
EOF

  # Build and run the SMTP container
  docker build -t swing-smtp -f Dockerfile.smtp .
  docker run --name $SMTP_CONTAINER_NAME -v $(pwd)/logs:/var/log/postfix -d -p 25:25 swing-smtp
  echo "SMTP container was successfully created"
fi

# Show logs in real-time
echo "Following SMTP logs:"
docker logs -f $SMTP_CONTAINER_NAME

# Clean up Dockerfile, main.cf, and CA key
rm Dockerfile.smtp main.cf ca-key.pem sasl_passwd sasl_passwd.dbs
