CREATE TABLE user(
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(50) NOT NULL
);


insert into  user(id,username,email,password) values (101,"sneha","sjdnjd","sssnksx");
DELETE FROM user where id=101;