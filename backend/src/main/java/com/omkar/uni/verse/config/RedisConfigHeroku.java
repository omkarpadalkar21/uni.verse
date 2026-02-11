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
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
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
                    .redis(redisUri.getHost(), redisUri.getPort())
                    .withSsl(redisUri.getScheme().equals("rediss"));
            
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
        // Json serializer for values
        GenericJackson2JsonRedisSerializer jsonRedisSerializer = new GenericJackson2JsonRedisSerializer();

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
