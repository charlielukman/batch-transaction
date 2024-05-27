package domain

import (
	"context"
	"mime/multipart"
	"time"

	"github.com/google/uuid"
	null "gopkg.in/guregu/null.v4"
)

type TransactionStatus string

const (
	WaitingApproval TransactionStatus = "waiting_approval"
	Approved        TransactionStatus = "approved"
	Rejected        TransactionStatus = "rejected"
)

type Transaction struct {
	ID                uuid.UUID `json:"id"`
	TotalAmount       float64   `json:"total_amount"`
	TotalRecord       int       `json:"total_record"`
	FromAccount       string    `json:"from_account"`
	Maker             string    `json:"maker"`
	TransferDate      time.Time `json:"transfer_date"`
	TransactionStatus string    `json:"transaction_status"`
	CreatedAt         time.Time `json:"created_at"`
}

type TransactionDetail struct {
	ID              uuid.UUID   `json:"id"`
	TransactionID   uuid.UUID   `json:"transaction_id"`
	BankDest        string      `json:"bank_dest"`
	AccountIDDest   string      `json:"account_id_dest"`
	AccountNameDest string      `json:"account_name_dest"`
	Amount          float64     `json:"amount"`
	Description     null.String `json:"description"`
	TransferDate    time.Time   `json:"transfer_date"`
}

type TransactionSummaryResult struct {
	TotalWaitingApproval int `json:"total_waiting_approval"`
	TotalApproved        int `json:"total_approved"`
	TotalRejected        int `json:"total_rejected"`
}

type UpdateTransactionRequest struct {
	Status string `json:"status"`
}

type UpdateTransactionResponse struct {
	Message string `json:"message"`
}

type Pagination struct {
	CurrentPage int  `json:"current_page"`
	TotalPages  int  `json:"total_pages"`
	PerPage     int  `json:"per_page"`
	TotalItems  int  `json:"total_items"`
	HasNextPage bool `json:"has_next_page"`
	HasPrevPage bool `json:"has_prev_page"`
}

type TransactionListResponse struct {
	Data       []Transaction `json:"data"`
	Pagination Pagination    `json:"pagination"`
}

type TransactionListParam struct {
	Page         int
	PerPage      int
	StatusFilter []TransactionStatus
}

type TransactionDetailResponse struct {
	Data []TransactionDetail `json:"data"`
}

type TransactionUploadRequest struct {
	File        *multipart.File
	TotalAmount float64
	TotalRecord int
	FromAccount string
	UserID      string
}

type TransactionUploadResponse struct {
	TotalRecord int     `json:"total_record"`
	TotalAmount float64 `json:"total_amount"`
	Message     string  `json:"message"`
}

type TransactionRepository interface {
	GetTransactionSummary(ctx context.Context) (TransactionSummaryResult, error)
	UpdateTransaction(ctx context.Context, trx Transaction) error
	GetTransactionList(ctx context.Context, param TransactionListParam) ([]Transaction, Pagination, error)
	GetTransactionDetailByTransactionID(ctx context.Context, transactionID uuid.UUID) ([]TransactionDetail, error)
	CreateTransaction(ctx context.Context, trx Transaction, trxDetails []TransactionDetail) error
}
