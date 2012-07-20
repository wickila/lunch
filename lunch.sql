CREATE TABLE `lunch`.`user` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
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
  `username` TEXT  NOT NULL,
  `name` TEXT  NOT NULL,
  `minprice` INT  NOT NULL,
  `lat` FLOAT  NOT NULL,
  `lng` FLOAT  NOT NULL,
  `hash_location` TEXT  NOT NULL,
  `description` TEXT  NOT NULL,
  `adress` TEXT  NOT NULL,
  `telephone` TEXT  NOT NULL,
  `thanks` INT  NOT NULL,
  `maxdistance` INT,
  `starttime` TEXT,
  `endtime` TEXT,
  `created_time` TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
)
ENGINE = MyISAM
CHARACTER SET utf8

CREATE TABLE `lunch`.`menu` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `rid` INT  NOT NULL,
  `uid` INT  NOT NULL,
  `mtype` INT  NOT NULL,
  `name` TEXT  NOT NULL,
  `description` TEXT  NOT NULL,
  `thumbnail` TEXT  NOT NULL,
  `price` FLOAT  NOT NULL,
  `discount` FLOAT  NOT NULL DEFAULT 10,
  `soldout` INT  NOT NULL DEFAULT 1;
  `taste` INT  NOT NULL;
  `favorites` INT  NOT NULL,
  `comments` INT  NOT NULL,
  PRIMARY KEY (`id`)
)
ENGINE = MyISAM
CHARACTER SET utf8

CREATE TABLE `lunch`.`lunchorder` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `uesrname` TEXT  NOT NULL,
  `concact` TEXT  NOT NULL,
  `bossusername` TEXT  NOT NULL,
  `restname` TEXT  NOT NULL,
  `message` TEXT  NOT NULL,
  `cancelreason` TEXT  NOT NULL,
  `createdtime` TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedtime` TEXT  NOT NULL,
  `state` INT NOT NULL COMMENT '-1:canceled, 0:wait for ensure, 1:ensured, 2:delivery, 3:settled, 4:commented',
  `menus` TEXT  NOT NULL,
  `price` FLOAT  NOT NULL,
  `isnew` BOOL  NOT NULL,
  PRIMARY KEY (`id`)
)
ENGINE = MyISAM
CHARACTER SET utf8 COLLATE utf8_general_ci;

CREATE TABLE `lunch`.`concact` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` TEXT  NOT NULL,
  `concactname` TEXT  NOT NULL,
  `adress` TEXT  NOT NULL,
  `phone` TEXT  NOT NULL,
  PRIMARY KEY (`id`)
)
ENGINE = MyISAM
CHARACTER SET utf8 COLLATE utf8_general_ci;

CREATE TABLE `lunch`.`menutype` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` TEXT  NOT NULL,
  `username` TEXT  NOT NULL,
  `rid` INT  NOT NULL,
  PRIMARY KEY (`id`)
)
ENGINE = MyISAM
CHARACTER SET utf8 COLLATE utf8_general_ci;

CREATE TABLE `lunch`.`comment` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` TEXT  NOT NULL,
  `orderid` INT UNSIGNED NOT NULL,
  `rid` INT UNSIGNED NOT NULL,
  `content` TEXT  NOT NULL,
  `thanks` INT  NOT NULL,
  `createdtime` TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
)
ENGINE = MyISAM
CHARACTER SET utf8 COLLATE utf8_general_ci;

CREATE TABLE `lunch`.`message` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `sender` TEXT  NOT NULL,
  `receiver` TEXT  NOT NULL,
  `messagetype` INT UNSIGNED NOT NULL COMMENT '0-99:system message, 100:normal user message',
  `content` TEXT  NOT NULL,
  `state` INT NOT NULL COMMENT '0:unread, 1:read',
  `createdtime` TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
)
ENGINE = MyISAM
CHARACTER SET utf8 COLLATE utf8_general_ci;

CREATE TABLE `lunch`.`restapply` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` TEXT  NOT NULL,
  `restname` TEXT  NOT NULL,
  `adress` TEXT  NOT NULL,
  `phone` TEXT  NOT NULL,
  `message` TEXT  NOT NULL,
  `activation` TEXT NOT NULL,
  `state` INT NOT NULL COMMENT '-1:reject, 0:unread, 1:accept',
  `reason` TEXT NOT NULL,
  `createdtime` TIMESTAMP  NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
)
ENGINE = MyISAM
CHARACTER SET utf8 COLLATE utf8_general_ci;