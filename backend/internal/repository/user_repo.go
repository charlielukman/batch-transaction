package repository

import (
	"batch-transaction/internal/database"
	"batch-transaction/internal/domain"
	"context"
	"database/sql"
)

type UserRepository struct {
	DB *database.DB
}

func NewUserRepository(db *database.DB) *UserRepository {
	return &UserRepository{
		DB: db,
	}
}

func (r *UserRepository) IsExistUser(ctx context.Context, user domain.User) (bool, error) {
	var id int
	err := r.DB.QueryRowContext(ctx,
		`SELECT id FROM users WHERE user_id = $1 or account_number = $2`, user.UserID, user.AccountNumber).
		Scan(&id)
	if err != nil {
		if err == sql.ErrNoRows {
			return false, nil
		}
		return false, domain.ErrorUserAlreadyExist
	}
	return true, nil
}

func (r *UserRepository) CreateUser(ctx context.Context, user domain.User) error {
	_, err := r.DB.ExecContext(ctx, `INSERT INTO users (account_number, account_name, user_id, user_name, password, role, phone_number, email) 
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
		user.AccountNumber, user.AccountName, user.UserID, user.UserName, user.Password, user.Role, user.PhoneNumber, user.Email)
	if err != nil {
		return err
	}

	return nil
}

func (r *UserRepository) GetUserByUserID(ctx context.Context, userID string) (*domain.User, error) {
	var user domain.User

	query := "SELECT id, account_number, account_name, user_id, user_name, password, role, phone_number, email FROM users WHERE user_id = $1"
	row := r.DB.QueryRowContext(ctx, query, userID)
	if row.Err() != nil {
		return nil, row.Err()
	}

	err := row.Scan(&user.ID, &user.AccountNumber, &user.AccountName, &user.UserID, &user.UserName, &user.Password, &user.Role, &user.PhoneNumber, &user.Email)
	if err == sql.ErrNoRows {
		return nil, domain.ErrorUserNotFound
	}
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *UserRepository) UpdateUserLastLogin(ctx context.Context, userID string) error {
	_, err := r.DB.ExecContext(ctx, `UPDATE users SET last_login_at = now() WHERE user_id = $1`, userID)
	if err != nil {
		return err
	}

	return nil
}
