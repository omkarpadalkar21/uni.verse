package com.omkar.uni.verse.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {
    @Bean
    public OpenAPI customConfig(){
        return new OpenAPI().info(
                new Info().title("UniVerse")
                        .description("Modern university event management platform with real-time seat booking, club registrations, and payment integration.")
        );
    }
}
