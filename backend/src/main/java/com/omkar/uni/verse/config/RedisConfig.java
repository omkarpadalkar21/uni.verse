package com.omkar.uni.verse.config;

import java.time.Duration;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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

@Configuration
@EnableCaching
public class RedisConfig {
    @Value("${spring.data.redis.port}")
    private int redisPort;
    @Value("${spring.data.redis.host}")
    private String redisHost;
    @Value("${spring.data.redis.password}")
    private String redisPassword;

    // Creates connection to Redis server
    @Bean
    public RedisClient redisClient() {
        RedisURI.Builder builder = RedisURI.Builder
                .redis(redisHost, redisPort);

        if (redisPassword != null && !redisPassword.isEmpty()) {
            builder.withPassword(redisPassword.toCharArray());
        }
        return RedisClient.create(builder.build());
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
