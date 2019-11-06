# Start martiadb-server for setup commands.
service mysql start

# Run installation SQL script.
mysql < secure_installation.sql
