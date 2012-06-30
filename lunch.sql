CREATE TABLE `lunch`.`user` (
  `id` INT  NOT NULL,
  `username` TEXT  NOT NULL,
  `password` TEXT  NOT NULL,
  `email` TEXT  NOT NULL,
  `permission` INT  NOT NULL,
  `registertime` TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `avatarurl` TEXT  NOT NULL,
  `name` TEXT  NOT NULL,
  `gender` INTEGER  NOT NULL,
  `mark` TEXT  NOT NULL,
  `mobile` TEXT  NOT NULL,
  `telephone` TEXT  NOT NULL,
  `adress1` TEXT  NOT NULL,
  `adress2` TEXT  NOT NULL,
  `modifytime` DATETIME  NOT NULL,
  PRIMARY KEY (`id`)
)
ENGINE = MyISAM
CHARACTER SET utf8

CREATE TABLE `lunch`.`restuarant` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `rtype` INT UNSIGNED NOT NULL,
  `avatarurl` TEXT  NOT NULL,
  `uid` INT UNSIGNED NOT NULL,
  `name` TEXT  NOT NULL,
  `minprice` INT  NOT NULL,
  `lat` FLOAT  NOT NULL,
  `lng` FLOAT  NOT NULL,
  `hash_location` TEXT  NOT NULL,
  `description` TEXT  NOT NULL,
  `adress` TEXT  NOT NULL,
  `telephone` TEXT  NOT NULL,
  `thanks` INT  NOT NULL,
  `created_time` TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
)
ENGINE = MyISAM
CHARACTER SET utf8

CREATE TABLE `lunch`.`menu` (
  `id` INT  NOT NULL AUTO_INCREMENT,
  `rid` INT  NOT NULL,
  `uid` INT  NOT NULL,
  `mtype` INT  NOT NULL,
  `name` TEXT  NOT NULL,
  `description` TEXT  NOT NULL,
  `thumbnail` TEXT  NOT NULL,
  `price` FLOAT  NOT NULL,
  `discount` FLOAT  NOT NULL DEFAULT 10,
  `favorites` INT  NOT NULL,
  `comments` INT  NOT NULL,
  PRIMARY KEY (`id`)
)
ENGINE = MyISAM
CHARACTER SET utf8 COLLATE utf8_general_ci;