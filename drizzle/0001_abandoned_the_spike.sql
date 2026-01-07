CREATE TABLE `cryptocurrencies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`symbol` varchar(20) NOT NULL,
	`name` varchar(100) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cryptocurrencies_id` PRIMARY KEY(`id`),
	CONSTRAINT `cryptocurrencies_symbol_unique` UNIQUE(`symbol`)
);
--> statement-breakpoint
CREATE TABLE `exchange_rates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fecha` varchar(10) NOT NULL,
	`tasa_oficial` decimal(10,4),
	`tasa_paralelo` decimal(10,4),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `exchange_rates_id` PRIMARY KEY(`id`),
	CONSTRAINT `exchange_rates_fecha_unique` UNIQUE(`fecha`)
);
--> statement-breakpoint
CREATE TABLE `purchases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`crypto_id` int NOT NULL,
	`cantidad` decimal(20,8) NOT NULL,
	`precio_unitario` decimal(20,8) NOT NULL,
	`fecha_compra` varchar(10) NOT NULL,
	`tasa_oficial_fecha` decimal(10,4),
	`tasa_paralelo_fecha` decimal(10,4),
	`notas` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `purchases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `fecha_idx` ON `exchange_rates` (`fecha`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `purchases` (`user_id`);--> statement-breakpoint
CREATE INDEX `crypto_id_idx` ON `purchases` (`crypto_id`);--> statement-breakpoint
CREATE INDEX `fecha_compra_idx` ON `purchases` (`fecha_compra`);