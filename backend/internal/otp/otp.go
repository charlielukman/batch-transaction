package otp

import (
	"fmt"
	"time"

	"github.com/pquerna/otp/totp"
)

type OTPGenerator interface {
	GenerateOTP(accountName string) (string, error)
}

type OTPGeneratorImpl struct{}

func NewOTPGenerator() *OTPGeneratorImpl {
	return &OTPGeneratorImpl{}
}

func (o *OTPGeneratorImpl) GenerateOTP(accountName string) (string, error) {
	if accountName == "" {
		return "", fmt.Errorf("otp account name is required")
	}

	key, err := totp.Generate(totp.GenerateOpts{
		Issuer:      "BatchTransactionApp",
		AccountName: accountName,
		Period:      300,
	})
	if err != nil {
		panic(err)
	}

	passcode, err := totp.GenerateCode(key.Secret(), time.Now())
	if err != nil {
		panic(err)
	}

	return passcode, nil
}
