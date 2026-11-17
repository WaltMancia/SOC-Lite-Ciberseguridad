CREATE TABLE `activities` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`incident_id` bigint unsigned NOT NULL,
	`type` enum('detection','status','note','containment') NOT NULL,
	`message` text NOT NULL,
	`actor` varchar(100) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `incidents` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`reference` varchar(32) NOT NULL,
	`title` varchar(180) NOT NULL,
	`description` text NOT NULL,
	`severity` enum('critical','high','medium','low') NOT NULL,
	`status` enum('open','investigating','contained','resolved') NOT NULL DEFAULT 'open',
	`source` varchar(100) NOT NULL,
	`asset` varchar(100) NOT NULL,
	`technique` varchar(16) NOT NULL,
	`technique_name` varchar(120) NOT NULL,
	`assignee` varchar(100) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`resolved_at` timestamp,
	CONSTRAINT `incidents_id` PRIMARY KEY(`id`),
	CONSTRAINT `incidents_reference_unique` UNIQUE(`reference`)
);
--> statement-breakpoint
CREATE TABLE `security_events` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`incident_id` bigint unsigned,
	`event_type` varchar(80) NOT NULL,
	`severity` enum('critical','high','medium','low') NOT NULL,
	`source` varchar(100) NOT NULL,
	`asset` varchar(100) NOT NULL,
	`message` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `security_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `activities` ADD CONSTRAINT `activities_incident_id_incidents_id_fk` FOREIGN KEY (`incident_id`) REFERENCES `incidents`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `security_events` ADD CONSTRAINT `security_events_incident_id_incidents_id_fk` FOREIGN KEY (`incident_id`) REFERENCES `incidents`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `activities_incident_idx` ON `activities` (`incident_id`);--> statement-breakpoint
CREATE INDEX `incidents_status_idx` ON `incidents` (`status`);--> statement-breakpoint
CREATE INDEX `incidents_severity_idx` ON `incidents` (`severity`);--> statement-breakpoint
CREATE INDEX `security_events_created_at_idx` ON `security_events` (`created_at`);