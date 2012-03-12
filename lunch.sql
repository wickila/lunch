CREATE TABLE `lunch`.`user` (
  `id` INT  NOT NULL,
  `username` TEXT  NOT NULL,
  `password` TEXT  NOT NULL,
  `email` TEXT  NOT NULL,
  `permission` INT  NOT NULL,
  `registertime` DATETIME  NOT NULL,
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
COMMENT = 'user\'s base infomation';