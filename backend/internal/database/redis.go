package database

import (
	"context"
	"time"

	"github.com/redis/go-redis/v9"
)

type RedisClient struct {
	redisClient *redis.Client
}

func NewRedisClient(opt *redis.Options) *RedisClient {
	return &RedisClient{
		redisClient: redis.NewClient(opt),
	}
}

func (r *RedisClient) Get(ctx context.Context, key string) (string, error) {
	return r.redisClient.Get(ctx, key).Result()
}

func (r *RedisClient) Set(ctx context.Context, key string, value string, expiration time.Duration) error {
	return r.redisClient.Set(ctx, key, value, expiration).Err()
}
