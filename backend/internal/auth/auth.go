package auth

import (
	"batch-transaction/internal/domain"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type JWTService interface {
	SignJWT(user domain.User, secretKey []byte) (string, error)
	VerifyJWT(tokenString string, secretKey string) (JWTClaim, error)
}

type JWTClaim struct {
	UserID string
	Role   string
	jwt.Claims
}

type JWTServiceImpl struct{}

func NewJWTServiceImpl() *JWTServiceImpl {
	return &JWTServiceImpl{}
}

func (j *JWTServiceImpl) SignJWT(user domain.User, secretKey []byte) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256,
		jwt.MapClaims{
			"userid": user.UserID,
			"role":   user.Role,
			"exp":    time.Now().Add(time.Hour * 24).Unix(),
		})

	return token.SignedString(secretKey)
}

func (j *JWTServiceImpl) VerifyJWT(tokenString string, secretKey string) (JWTClaim, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(secretKey), nil
	})

	if err != nil {
		return JWTClaim{}, err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		userID := claims["userid"].(string)
		role := claims["role"].(string)
		return JWTClaim{UserID: userID, Role: role, Claims: claims}, nil
	} else {
		return JWTClaim{}, err
	}
}

type PasswordComparer interface {
	ComparePassword(hashedPassword, password string) error
}
type PasswordComparerImpl struct{}

func (p PasswordComparerImpl) ComparePassword(password string, hashedPassword string) error {
	return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}
