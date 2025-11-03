CREATE TABLE `custom_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phone` varchar(20) NOT NULL,
	`password` varchar(255) NOT NULL,
	`inviteCode` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `custom_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `custom_users_phone_unique` UNIQUE(`phone`)
);
