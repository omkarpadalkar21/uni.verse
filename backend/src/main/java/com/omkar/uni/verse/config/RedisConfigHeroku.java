package com.omkar.uni.verse.config;

import java.net.URI;
import java.time.Duration;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceClientConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import io.github.bucket4j.distributed.ExpirationAfterWriteStrategy;
import io.github.bucket4j.distributed.proxy.ClientSideConfig;
import io.github.bucket4j.distributed.proxy.ProxyManager;
import io.github.bucket4j.redis.lettuce.cas.LettuceBasedProxyManager;
import io.lettuce.core.RedisClient;
import io.lettuce.core.RedisURI;
import io.lettuce.core.api.StatefulRedisConnection;
import io.lettuce.core.codec.ByteArrayCodec;
import io.lettuce.core.codec.RedisCodec;
import io.lettuce.core.codec.StringCodec;
import org.springframework.cache.annotation.EnableCaching;

/**
 * Redis configuration for Heroku environment.
 * Parses REDIS_URL in format: rediss://h:password@host:port
 */
@Configuration
@EnableCaching
@Profile("heroku")
public class RedisConfigHeroku {
    
    @Value("${REDIS_URL}")
    private String redisUrl;

    // Creates connection to Redis server using REDIS_URL
    @Bean
    public RedisClient redisClient() {
        try {
            // Parse REDIS_URL: rediss://h:password@host:port
            URI redisUri = URI.create(redisUrl);
            
            RedisURI.Builder builder = RedisURI.Builder
                    .redis(redisUri.getHost(), redisUri.getPort());
            
            // Enable SSL but disable verification for Heroku
            // Heroku Redis uses SSL certs that may not be in the default truststore
            if (redisUri.getScheme().equals("rediss")) {
                builder.withSsl(true);
                builder.withVerifyPeer(false);  // Disable SSL certificate verification
            }
            
            // Extract password from userInfo (format: "h:password" or "default:password")
            String userInfo = redisUri.getUserInfo();
            if (userInfo != null && userInfo.contains(":")) {
                String password = userInfo.split (":", 2)[1];
                builder.withPassword(password.toCharArray());
            }
            
            return RedisClient.create(builder.build());
        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse REDIS_URL: " + redisUrl, e);
        }
    }

    // Maintains persistent connection with custom codec for storing buckets as bytes
    @Bean
    public StatefulRedisConnection<String, byte[]> redisConnection(RedisClient redisClient) {
        RedisCodec<String, byte[]> codec = RedisCodec.of(StringCodec.UTF8, ByteArrayCodec.INSTANCE);
        return redisClient.connect(codec);
    }

    // Spring Data Redis connection factory
    @Bean
    public RedisConnectionFactory redisConnectionFactory() {
        try {
            URI redisUri = URI.create(redisUrl);
            
            RedisStandaloneConfiguration redisConfig = new RedisStandaloneConfiguration();
            redisConfig.setHostName(redisUri.getHost());
            redisConfig.setPort(redisUri.getPort());
            
            // Extract password from userInfo
            String userInfo = redisUri.getUserInfo();
            if (userInfo != null && userInfo.contains(":")) {
                String password = userInfo.split(":", 2)[1];
                redisConfig.setPassword(password);
            }

            // Configure SSL with disabled peer verification
            io.lettuce.core.SslOptions sslOptions = io.lettuce.core.SslOptions.builder()
                    .jdkSslProvider()
                    .build();

            io.lettuce.core.ClientOptions clientOptions = io.lettuce.core.ClientOptions.builder()
                    .sslOptions(sslOptions)
                    .build();

            org.springframework.data.redis.connection.lettuce.LettuceClientConfiguration clientConfig = 
                    org.springframework.data.redis.connection.lettuce.LettuceClientConfiguration.builder()
                    .clientOptions(clientOptions)
                    .useSsl()
                    .disablePeerVerification()
                    .build();

            return new org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory(redisConfig, clientConfig);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to create RedisConnectionFactory: " + redisUrl, e);
        }
    }

    // Manages bucket instances across server instances and handles bucket expiration to free memory
    @Bean
    public ProxyManager<String> proxyManager(StatefulRedisConnection<String, byte[]> connection) {
        ClientSideConfig clientSideConfig = ClientSideConfig.getDefault()
                .withExpirationAfterWriteStrategy(
                        ExpirationAfterWriteStrategy.basedOnTimeForRefillingBucketUpToMax(
                                Duration.ofHours(1) // Buckets expire after 1 hour of inactivity
                        )
                );

        return LettuceBasedProxyManager.builderFor(connection)
                .withClientSideConfig(clientSideConfig)
                .build();
    }

    @Bean
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        // Configure ObjectMapper to handle Spring Data types (like Page)
        com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();
        objectMapper.activateDefaultTyping(
                objectMapper.getPolymorphicTypeValidator(),
                com.fasterxml.jackson.databind.ObjectMapper.DefaultTyping.NON_FINAL,
                com.fasterxml.jackson.annotation.JsonTypeInfo.As.PROPERTY
        );
        objectMapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
        objectMapper.disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        
        // Use Jackson2JsonRedisSerializer with custom ObjectMapper
        org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer<Object> jsonRedisSerializer = 
                new org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer<>(objectMapper, Object.class);

        // String serializer for keys
        StringRedisSerializer stringSerializer = new StringRedisSerializer();

        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(stringSerializer))
                .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(jsonRedisSerializer))
                .entryTtl(Duration.ofMinutes(5))
                .disableCachingNullValues()
                .prefixCacheNameWith("universe/cache/");

        Map<String, RedisCacheConfiguration> cacheConfigurations = Map.of(
                "users", defaultConfig
                        .entryTtl(Duration.ofMinutes(2))
                        .prefixCacheNameWith("universe/users/"),
                "club", defaultConfig
                        .entryTtl(Duration.ofMinutes(20))
                        .prefixCacheNameWith("universe/club/"),
                "clubs", defaultConfig
                        .entryTtl(Duration.ofMinutes(20))
                        .prefixCacheNameWith("universe/clubs/"),
                "events", defaultConfig
                        .entryTtl(Duration.ofMinutes(10))
                        .prefixCacheNameWith("universe/events/"),
                "event", defaultConfig
                        .entryTtl(Duration.ofMinutes(30))
                        .prefixCacheNameWith("universe/event/")
        );

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(cacheConfigurations)
                .transactionAware()
                .build();
    }
}
