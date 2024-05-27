package service

import (
	"batch-transaction/internal/domain"
	"context"
	"encoding/csv"
	"io"
	"mime/multipart"
	"strconv"
	"time"

	"github.com/google/uuid"
)

type TransactionService struct {
	transactionRepo domain.TransactionRepository
}

func NewTransactionService(transactionRepo domain.TransactionRepository) *TransactionService {
	return &TransactionService{
		transactionRepo: transactionRepo,
	}
}

func (s *TransactionService) GetTransactionSummary(ctx context.Context) (domain.TransactionSummaryResult, error) {
	return s.transactionRepo.GetTransactionSummary(ctx)
}

func (s *TransactionService) UpdateTransaction(ctx context.Context, trx domain.Transaction) error {
	if trx.TransactionStatus != string(domain.Approved) && trx.TransactionStatus != string(domain.Rejected) {
		return domain.ErrInvalidTransactionStatus
	}
	return s.transactionRepo.UpdateTransaction(ctx, trx)
}

func (s *TransactionService) GetTransactionList(ctx context.Context, param domain.TransactionListParam) ([]domain.Transaction, domain.Pagination, error) {
	return s.transactionRepo.GetTransactionList(ctx, param)
}

func (s *TransactionService) GetTransactionDetail(ctx context.Context, transactionID uuid.UUID) ([]domain.TransactionDetail, error) {
	return s.transactionRepo.GetTransactionDetailByTransactionID(ctx, transactionID)
}

func (s *TransactionService) CreateTransaction(ctx context.Context, req domain.TransactionUploadRequest) error {
	// set transaction
	transactionGUID := uuid.New()
	transaction := domain.Transaction{
		ID:                transactionGUID,
		TotalAmount:       req.TotalAmount,
		TotalRecord:       req.TotalRecord,
		FromAccount:       req.FromAccount,
		Maker:             req.UserID,
		TransferDate:      time.Now(),
		CreatedAt:         time.Now(),
		TransactionStatus: string(domain.WaitingApproval),
	}

	transactionDetails, err := parseCSVTransaction(*req.File)
	if err != nil {
		return err
	}

	for i := range transactionDetails {
		transactionDetails[i].TransactionID = transactionGUID
	}

	return s.transactionRepo.CreateTransaction(ctx, transaction, transactionDetails)

}

func parseCSVTransaction(file multipart.File) ([]domain.TransactionDetail, error) {
	reader := csv.NewReader(file)

	_, err := reader.Read()
	if err != nil {
		return nil, err
	}

	var transactionDetails []domain.TransactionDetail
	for {
		line, err := reader.Read()
		if err == io.EOF {
			break
		} else if err != nil {
			return nil, err
		}

		amount, err := strconv.ParseFloat(line[3], 64)
		if err != nil {
			return nil, err
		}
		transactionDetail := domain.TransactionDetail{
			BankDest:        line[0],
			AccountIDDest:   line[1],
			AccountNameDest: line[2],
			Amount:          amount,
		}

		transactionDetails = append(transactionDetails, transactionDetail)
	}

	return transactionDetails, nil
}
