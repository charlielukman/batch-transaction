package service

import (
	"batch-transaction/internal/auth"
	"batch-transaction/internal/config"
	"batch-transaction/internal/domain"
	"context"
	"time"

	"golang.org/x/crypto/bcrypt"
)

type UserService struct {
	passwordComparer auth.PasswordComparer
	jwtService       auth.JWTService
	configInterface  config.ConfigInterface
	otpService       OTPService
	userRepo         domain.UserRepository
}

func NewUserService(passwordComparer auth.PasswordComparer, jwtService auth.JWTService, configInterface config.ConfigInterface, otpService OTPService, userRepo domain.UserRepository) *UserService {
	return &UserService{
		passwordComparer: passwordComparer,
		jwtService:       jwtService,
		configInterface:  configInterface,
		otpService:       otpService,
		userRepo:         userRepo,
	}
}

func (s *UserService) Register(ctx context.Context, userReq domain.UserRegisterRequest) error {
	err := domain.ValidateUserRegisterRequest(&userReq)
	if err != nil {
		return err
	}

	password := userReq.Password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	err = s.otpService.ValidateOTP(userReq.Email, userReq.OtpCode)
	if err != nil {
		return domain.ErrInvalidOTP
	}

	user := domain.User{
		AccountNumber: userReq.AccountNumber,
		AccountName:   userReq.AccountName,
		UserID:        userReq.UserID,
		UserName:      userReq.UserName,
		Password:      string(hashedPassword),
		Role:          userReq.Role,
		PhoneNumber:   userReq.PhoneNumber,
		Email:         userReq.Email,
	}

	isExist, err := s.userRepo.IsExistUser(ctx, user)
	if err != nil || isExist {
		return err
	}

	return s.userRepo.CreateUser(ctx, user)
}

func (s *UserService) Login(ctx context.Context, user domain.UserLogin) (result domain.LoginResponse, err error) {
	err = domain.ValidateLogin(&user)
	if err != nil {
		return result, err
	}

	userData, err := s.userRepo.GetUserByUserID(ctx, user.UserID)
	if err == domain.ErrorUserNotFound {
		return result, domain.ErrorUserNotFound
	}
	if err != nil {
		return result, err
	}

	err = s.passwordComparer.ComparePassword(user.Password, userData.Password)
	if err != nil {
		return result, domain.ErrInvalidPassword
	}

	err = s.userRepo.UpdateUserLastLogin(ctx, user.UserID)
	if err != nil {
		return result, err
	}

	token, err := s.jwtService.SignJWT(domain.User{
		UserID: userData.UserID,
		Role:   userData.Role,
	}, []byte(s.configInterface.GetSecretKey()))
	if err != nil {
		return result, err
	}

	now := time.Now()
	result = domain.LoginResponse{
		Token: token,
		User: domain.UserLoginResponse{
			UserID:      userData.UserID,
			UserName:    userData.UserName,
			Role:        userData.Role,
			LastLoginAt: &now,
		},
		Corporate: domain.CorporateLoginResponse{
			AccountNumber: userData.AccountNumber,
			AccountName:   userData.AccountName,
		},
	}

	return result, nil
}
