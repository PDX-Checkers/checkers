DELETE FROM mysql.user WHERE User='root' AND Host NOT IN ('localhost', '127.0.0.1', '::1');
DROP DATABASE IF EXISTS test;
DELETE FROM mysql.db WHERE Db='test' OR Db='test\\_%';
CREATE DATABASE checkers;
FLUSH PRIVILEGES;
UPDATE mysql.user SET plugin = 'mysql_native_password', 
      Password = PASSWORD('blarg') WHERE User = 'root';
