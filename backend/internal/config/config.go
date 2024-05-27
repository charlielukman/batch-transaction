package config

import "os"

type ConfigInterface interface {
	GetSecretKey() string
	GetDatabaseURL() string
}

type Config struct{}

func NewConfig() *Config {
	return &Config{}
}

func (c *Config) GetSecretKey() string {
	return os.Getenv("SECRET_KEY")
}

func (c *Config) GetDatabaseURL() string {
	return os.Getenv("DATABASE_URL")
}
