CREATE TABLE `admin_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`phone` varchar(20) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `admin_users_phone_unique` UNIQUE(`phone`)
);
--> statement-breakpoint
ALTER TABLE `custom_users` ADD `lastVerified` timestamp;