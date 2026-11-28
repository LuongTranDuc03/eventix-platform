package com.eventix.config.database;

import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FlywayConfig {

    @Bean
    public FlywayMigrationStrategy cleanMigrateStrategy() {
        return flyway -> {
            // Tự động dọn dẹp các bản ghi migration bị fail (như V2 lần trước)
            flyway.repair();
            // Tiếp tục chạy migrate bình thường
            flyway.migrate();
        };
    }
}

