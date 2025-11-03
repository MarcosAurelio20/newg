CREATE TABLE `admin_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminPhone` varchar(20) NOT NULL,
	`action` varchar(100) NOT NULL,
	`details` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `admin_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `daily_ranking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` varchar(10) NOT NULL,
	`totalScore` int NOT NULL DEFAULT 0,
	`matchesPlayed` int NOT NULL DEFAULT 0,
	`highestDifficulty` varchar(20) NOT NULL DEFAULT 'easy',
	`position` int,
	`prizeAmount` int NOT NULL DEFAULT 0,
	`prizePaid` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `daily_ranking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `game_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` text NOT NULL,
	`description` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `game_config_id` PRIMARY KEY(`id`),
	CONSTRAINT `game_config_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `game_matches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`phase` int NOT NULL,
	`difficulty` varchar(20) NOT NULL,
	`score` int NOT NULL DEFAULT 0,
	`objective` varchar(50) NOT NULL,
	`objectiveValue` int NOT NULL,
	`completed` int NOT NULL DEFAULT 0,
	`timeSpent` int NOT NULL,
	`consecutiveErrors` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `game_matches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `player_lives` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`lives` int NOT NULL DEFAULT 3,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `player_lives_id` PRIMARY KEY(`id`),
	CONSTRAINT `player_lives_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `player_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`currentPhase` int NOT NULL DEFAULT 1,
	`cyclesCompleted` int NOT NULL DEFAULT 0,
	`totalScore` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `player_progress_id` PRIMARY KEY(`id`),
	CONSTRAINT `player_progress_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `prize_pool` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` varchar(10) NOT NULL,
	`baseAmount` int NOT NULL DEFAULT 54,
	`depositedAmount` int NOT NULL DEFAULT 0,
	`prizePercentage` int NOT NULL DEFAULT 10,
	`totalPrize` int NOT NULL DEFAULT 54,
	`distributed` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `prize_pool_id` PRIMARY KEY(`id`),
	CONSTRAINT `prize_pool_date_unique` UNIQUE(`date`)
);
--> statement-breakpoint
CREATE TABLE `surprise_box_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`cycleNumber` int NOT NULL,
	`won` int NOT NULL,
	`prizeType` varchar(20),
	`prizeAmount` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `surprise_box_history_id` PRIMARY KEY(`id`)
);
