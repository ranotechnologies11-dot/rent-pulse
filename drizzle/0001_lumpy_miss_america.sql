CREATE TABLE `invoices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`invoiceNumber` varchar(80) NOT NULL,
	`periodLabel` varchar(80) NOT NULL,
	`amountDue` decimal(10,2) NOT NULL,
	`amountPaid` decimal(10,2) NOT NULL DEFAULT '0.00',
	`dueDate` timestamp NOT NULL,
	`graceUntilDate` timestamp NOT NULL,
	`status` enum('unpaid','partially_paid','paid','overdue') NOT NULL DEFAULT 'unpaid',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invoices_id` PRIMARY KEY(`id`),
	CONSTRAINT `invoices_invoiceNumber_unique` UNIQUE(`invoiceNumber`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`invoiceId` int,
	`amount` decimal(10,2) NOT NULL,
	`paymentMethod` varchar(50) NOT NULL DEFAULT 'bank_transfer',
	`referenceNumber` varchar(100),
	`balanceAfterPayment` decimal(10,2) NOT NULL,
	`nextDueDateAfterPayment` timestamp,
	`receiptMessage` text NOT NULL,
	`paidAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `properties` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(191) NOT NULL,
	`address` text NOT NULL,
	`city` varchar(100) NOT NULL DEFAULT 'Metropolis',
	`managerName` varchar(120) NOT NULL DEFAULT 'Property Desk',
	`managerPhone` varchar(50) NOT NULL DEFAULT '+1 (555) 019-2834',
	`managerEmail` varchar(191) NOT NULL DEFAULT 'billing@rentpulse.local',
	`currency` varchar(10) NOT NULL DEFAULT 'USD',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `properties_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reminderLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`invoiceId` int,
	`triggerType` enum('approaching','due_today','overdue','payment_receipt','manual','scheduled_heartbeat') NOT NULL,
	`channel` enum('sms','email') NOT NULL,
	`recipient` varchar(255) NOT NULL,
	`messageTitle` varchar(255) NOT NULL,
	`messageBody` text NOT NULL,
	`balanceMentioned` decimal(10,2) NOT NULL,
	`dueDateMentioned` timestamp,
	`status` enum('queued','sent','delivered','failed') NOT NULL DEFAULT 'sent',
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `reminderLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reminderSettings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scheduleCronTaskUid` varchar(65),
	`daysBeforeDueNotice` int NOT NULL DEFAULT 3,
	`sendOnDueDate` boolean NOT NULL DEFAULT true,
	`overdueFrequencyDays` int NOT NULL DEFAULT 2,
	`quietHoursStart` varchar(5) NOT NULL DEFAULT '21:00',
	`quietHoursEnd` varchar(5) NOT NULL DEFAULT '08:00',
	`autoDispatchEnabled` boolean NOT NULL DEFAULT true,
	`smsTemplateApproaching` text NOT NULL,
	`smsTemplateOverdue` text NOT NULL,
	`smsTemplateReceipt` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reminderSettings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tenants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyId` int NOT NULL,
	`unitNumber` varchar(50) NOT NULL,
	`fullName` varchar(150) NOT NULL,
	`email` varchar(255) NOT NULL,
	`phone` varchar(50) NOT NULL,
	`rentAmount` decimal(10,2) NOT NULL DEFAULT '0.00',
	`dueDayOfMonth` int NOT NULL DEFAULT 1,
	`gracePeriodDays` int NOT NULL DEFAULT 5,
	`currentBalance` decimal(10,2) NOT NULL DEFAULT '0.00',
	`status` enum('active','grace','overdue','paid') NOT NULL DEFAULT 'active',
	`autoRemindersEnabled` boolean NOT NULL DEFAULT true,
	`reminderChannel` enum('sms','email','both') NOT NULL DEFAULT 'both',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tenants_id` PRIMARY KEY(`id`)
);
