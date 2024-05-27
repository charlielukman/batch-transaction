package service

import (
	"batch-transaction/internal/database"
	"batch-transaction/internal/otp"
	"context"
	"time"
)

type OTPService struct {
	otpGenerator otp.OTPGenerator
	redisClient  database.RedisClient
}

func NewOTPService(redisClient database.RedisClient) *OTPService {
	return &OTPService{
		otpGenerator: otp.NewOTPGenerator(),
		redisClient:  redisClient,
	}
}

func (s *OTPService) SendOTP(email string) (otpCode string, err error) {
	otp, err := s.otpGenerator.GenerateOTP(email)
	if err != nil {
		return "", err
	}

	// send otp to email

	// store otp to redis
	err = s.redisClient.Set(context.Background(), "otp:"+email, otp, 300*time.Second)
	if err != nil {
		return "", err
	}

	return otp, nil
}

func (s *OTPService) ValidateOTP(email string, otp string) error {
	otpFromRedis, err := s.redisClient.Get(context.Background(), "otp:"+email)
	if err != nil {
		return err
	}

	if otpFromRedis != otp {
		return err
	}

	return nil
}
