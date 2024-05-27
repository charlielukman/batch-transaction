package domain

import "errors"

var (
	ErrorUserAlreadyExist       = errors.New("user already exist")
	ErrorUserNotFound           = errors.New("user not found")
	ErrInvalidPassword          = errors.New("invalid password")
	ErrInvalidToken             = errors.New("invalid token")
	ErrInvalidOTP               = errors.New("invalid otp")
	ErrInvalidTransactionStatus = errors.New("invalid transaction status")
	ErrInvalidTransactionID     = errors.New("invalid transaction id")
)

type FieldError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

type FieldErrorResponse struct {
	Message string       `json:"message"`
	Errors  []FieldError `json:"errors"`
}

type CommonErrorResponse struct {
	Message string `json:"message"`
}
