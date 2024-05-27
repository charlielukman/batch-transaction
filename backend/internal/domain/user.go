package domain

import (
	"context"
	"time"

	"github.com/go-playground/validator/v10"
)

type Role string

const (
	Maker    Role = "Maker"
	Approver Role = "Approver"
)

type User struct {
	ID               int
	AccountNumber    string
	AccountName      string
	UserID           string
	UserName         string
	Role             Role
	PhoneNumber      string
	Email            string
	Password         string
	SuccessfulLogins int
	LastLoginAt      *time.Time
	CreatedAt        time.Time
}

type UserLogin struct {
	AccountNumber string `json:"account_number" validate:"required"`
	UserID        string `json:"user_id" validate:"required"`
	Password      string `json:"password" validate:"required"`
}

type UserLoginResponse struct {
	UserID      string     `json:"user_id"`
	UserName    string     `json:"user_name"`
	Role        Role       `json:"role"`
	LastLoginAt *time.Time `json:"last_login_at"`
}

type CorporateLoginResponse struct {
	AccountNumber string `json:"account_number"`
	AccountName   string `json:"account_name"`
}

type LoginResponse struct {
	Token     string                 `json:"token"`
	User      UserLoginResponse      `json:"user"`
	Corporate CorporateLoginResponse `json:"corporate"`
}

type UserRegisterResponse struct {
	Message string `json:"message"`
}

type UserRegisterRequest struct {
	AccountNumber string `json:"account_number" validate:"required"`
	AccountName   string `json:"account_name" validate:"required"`
	UserID        string `json:"user_id" validate:"required"`
	UserName      string `json:"user_name" validate:"required"`
	Password      string `json:"password" validate:"required"`
	Role          Role   `json:"role" validate:"required,eq=Maker|eq=Approver"`
	PhoneNumber   string `json:"phone_number" validate:"required,e164"`
	Email         string `json:"email" validate:"required,email"`
	OtpCode       string `json:"otp_code" validate:"required"`
}

func ValidateUserRegisterRequest(req *UserRegisterRequest) error {
	validate := validator.New()
	err := validate.Struct(req)
	if err != nil {
		return err
	}
	return nil
}

func ValidateLogin(req *UserLogin) error {
	validate := validator.New()
	err := validate.Struct(req)
	if err != nil {
		return err
	}
	return nil
}

type UserRepository interface {
	IsExistUser(ctx context.Context, user User) (bool, error)
	CreateUser(context.Context, User) error
	GetUserByUserID(ctx context.Context, userID string) (*User, error)
	UpdateUserLastLogin(ctx context.Context, userID string) error
}
