CREATE DATABASE bartydb;

CREATE USER 'barty'@'localhost' IDENTIFIED BY 'barty';

GRANT ALL PRIVILEGES ON bartydb.* TO 'barty'@'localhost' WITH GRANT OPTION;

USE bartydb;

CREATE TABLE hours (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  Bdate DATE,
  hour INT,
  passengers INT,
  origin CHAR(2),
  destination CHAR(2)
);

CREATE INDEX dateIndex ON hours(Bdate);
