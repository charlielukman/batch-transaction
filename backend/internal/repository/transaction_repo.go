package repository

import (
	"batch-transaction/internal/database"
	"batch-transaction/internal/domain"
	"context"
	"database/sql"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

type TransactionRepository struct {
	DB *database.DB
}

func NewTransactionRepository(db *database.DB) *TransactionRepository {
	return &TransactionRepository{
		DB: db,
	}
}

func (r *TransactionRepository) GetTransactionSummary(ctx context.Context) (domain.TransactionSummaryResult, error) {
	var result domain.TransactionSummaryResult
	query := `SELECT 
				COALESCE(SUM(CASE WHEN transaction_status = 'waiting_approval' THEN 1 ELSE 0 END),0) as total_waiting_approval,
				COALESCE(SUM(CASE WHEN transaction_status = 'approved' THEN 1 ELSE 0 END),0) as total_approved,
				COALESCE(SUM(CASE WHEN transaction_status = 'rejected' THEN 1 ELSE 0 END),0) as total_rejected
			FROM transactions
	`
	row := r.DB.QueryRowContext(ctx, query)
	if row.Err() != nil {
		return result, row.Err()
	}

	err := row.Scan(&result.TotalWaitingApproval, &result.TotalApproved, &result.TotalRejected)
	if err != nil {
		return result, err
	}

	return result, nil
}

func (r *TransactionRepository) UpdateTransaction(ctx context.Context, trx domain.Transaction) error {
	_, err := r.DB.ExecContext(ctx, `UPDATE transactions SET transaction_status = $1 WHERE id = $2`, trx.TransactionStatus, trx.ID)
	if err != nil {
		return err
	}

	return nil
}

func (r *TransactionRepository) GetTransactionList(ctx context.Context, param domain.TransactionListParam) ([]domain.Transaction, domain.Pagination, error) {
	var result []domain.Transaction
	var pagination domain.Pagination

	baseQuery := `SELECT id, total_amount, total_record, from_account, maker, transfer_date, transaction_status, created_at
    FROM transactions`

	var query string
	if len(param.StatusFilter) > 0 {
		query = baseQuery + ` WHERE transaction_status = ANY($1) 
		ORDER BY created_at DESC 
		LIMIT $2 
		OFFSET $3`
	} else {
		query = baseQuery + ` ORDER BY created_at DESC
		LIMIT $1
		OFFSET $2`
	}

	var rows *sql.Rows
	var err error
	if len(param.StatusFilter) > 0 {
		rows, err = r.DB.QueryContext(ctx, query, pq.Array(param.StatusFilter), param.PerPage, (param.Page-1)*param.PerPage)
	} else {
		rows, err = r.DB.QueryContext(ctx, query, param.PerPage, (param.Page-1)*param.PerPage)
	}
	if err != nil {
		return result, pagination, err
	}
	defer rows.Close()

	for rows.Next() {
		var transaction domain.Transaction
		err = rows.Scan(&transaction.ID,
			&transaction.TotalAmount,
			&transaction.TotalRecord,
			&transaction.FromAccount,
			&transaction.Maker,
			&transaction.TransferDate,
			&transaction.TransactionStatus,
			&transaction.CreatedAt)
		if err != nil {
			return result, pagination, err
		}
		result = append(result, transaction)
	}

	var countQuery string
	if len(param.StatusFilter) > 0 {
		countQuery = `SELECT COUNT(*) FROM transactions WHERE transaction_status = ANY($1)`
	} else {
		countQuery = `SELECT COUNT(*) FROM transactions`
	}

	var row *sql.Row
	if len(param.StatusFilter) > 0 {
		row = r.DB.QueryRowContext(ctx, countQuery, pq.Array(param.StatusFilter))
	} else {
		row = r.DB.QueryRowContext(ctx, countQuery)
	}
	if row.Err() != nil {
		return result, pagination, row.Err()
	}

	err = row.Scan(&pagination.TotalItems)
	if err != nil {
		return result, pagination, err
	}

	pagination.CurrentPage = param.Page
	pagination.PerPage = param.PerPage
	pagination.TotalPages = pagination.TotalItems / param.PerPage
	if pagination.TotalItems%param.PerPage > 0 {
		pagination.TotalPages++
	}

	if pagination.CurrentPage < pagination.TotalPages {
		pagination.HasNextPage = true
	}
	if pagination.CurrentPage > 1 {
		pagination.HasPrevPage = true
	}

	return result, pagination, nil
}

func (r *TransactionRepository) GetTransactionDetailByTransactionID(ctx context.Context, transactionID uuid.UUID) ([]domain.TransactionDetail, error) {
	var result []domain.TransactionDetail

	query := `SELECT id, transaction_id, bank_dest, account_id_dest, account_name_dest, amount, description, transfer_date
	FROM transaction_details WHERE transaction_id = $1`

	rows, err := r.DB.QueryContext(ctx, query, transactionID)
	if err != nil {
		return result, err
	}
	defer rows.Close()

	for rows.Next() {
		var detail domain.TransactionDetail
		err = rows.Scan(&detail.ID,
			&detail.TransactionID,
			&detail.BankDest,
			&detail.AccountIDDest,
			&detail.AccountNameDest,
			&detail.Amount,
			&detail.Description,
			&detail.TransferDate)
		if err != nil {
			return result, err
		}
		result = append(result, detail)
	}

	return result, nil
}

func (r *TransactionRepository) CreateTransaction(ctx context.Context, trx domain.Transaction, trxDetails []domain.TransactionDetail) error {
	tx, err := r.DB.BeginTx(ctx)
	if err != nil {
		return err
	}

	_, err = tx.ExecContext(ctx, `
		INSERT INTO transactions (id, total_amount, total_record, from_account, maker, transfer_date, transaction_status) 
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`,
		trx.ID, trx.TotalAmount, trx.TotalRecord, trx.FromAccount, trx.Maker, trx.TransferDate, trx.TransactionStatus)
	if err != nil {
		tx.Rollback()
		return err
	}

	for _, detail := range trxDetails {
		_, err = tx.ExecContext(ctx, `
			INSERT INTO transaction_details (transaction_id, bank_dest, account_id_dest, account_name_dest, amount, description, transfer_date) 
			VALUES ($1, $2, $3, $4, $5, $6, $7)
		`,
			detail.TransactionID, detail.BankDest, detail.AccountIDDest, detail.AccountNameDest, detail.Amount, detail.Description, detail.TransferDate)
		if err != nil {
			tx.Rollback()
			return err
		}
	}

	err = tx.Commit()
	if err != nil {
		return err
	}

	return nil
}
