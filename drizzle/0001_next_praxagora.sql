CREATE TABLE `activities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`childId` int NOT NULL,
	`name` text NOT NULL,
	`points` int NOT NULL,
	`category` varchar(50) NOT NULL,
	`date` timestamp NOT NULL,
	`multiplier` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `children` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` text NOT NULL,
	`initialBalance` int NOT NULL DEFAULT 0,
	`startDate` timestamp,
	`totalPoints` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `children_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customActivities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`childId` int NOT NULL,
	`activityId` varchar(100) NOT NULL,
	`name` text NOT NULL,
	`points` int NOT NULL,
	`category` varchar(50) NOT NULL,
	`orderIndex` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customActivities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`childId` int NOT NULL,
	`description` text NOT NULL,
	`amount` int NOT NULL,
	`date` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `expenses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `parentData` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` text NOT NULL,
	`gender` varchar(20),
	`appStartDate` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `parentData_id` PRIMARY KEY(`id`),
	CONSTRAINT `parentData_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `settings_id` PRIMARY KEY(`id`)
);
