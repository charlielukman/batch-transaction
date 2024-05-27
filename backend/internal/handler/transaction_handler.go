package handler

import (
	"batch-transaction/internal/domain"
	"batch-transaction/internal/service"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type TransactionHandler struct {
	TransactionService *service.TransactionService
}

func NewTransactionHandler(transactionService *service.TransactionService) *TransactionHandler {
	return &TransactionHandler{
		TransactionService: transactionService,
	}
}

func (h *TransactionHandler) GetTransactionSummary(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	result, err := h.TransactionService.GetTransactionSummary(ctx)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(domain.CommonErrorResponse{
			Message: err.Error(),
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(result)
}

func (h *TransactionHandler) UpdateTransaction(w http.ResponseWriter, r *http.Request) {
	var req domain.UpdateTransactionRequest

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(domain.CommonErrorResponse{
			Message: err.Error(),
		})
		return
	}

	transactionID := chi.URLParam(r, "id")
	transactionUUID, err := uuid.Parse(transactionID)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(domain.CommonErrorResponse{
			Message: "Invalid transaction ID",
		})
		return
	}

	transaction := domain.Transaction{
		ID:                transactionUUID,
		TransactionStatus: req.Status,
	}

	ctx := r.Context()
	err = h.TransactionService.UpdateTransaction(ctx, transaction)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(domain.CommonErrorResponse{
			Message: err.Error(),
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(domain.UpdateTransactionResponse{
		Message: "Transaction updated successfully",
	})
}

func (h *TransactionHandler) GetTransactionList(w http.ResponseWriter, r *http.Request) {
	page := r.URL.Query().Get("page")
	pageInt, _ := strconv.Atoi(page)
	if pageInt == 0 {
		pageInt = 1
	}
	perPage := r.URL.Query().Get("per_page")
	perPageInt, _ := strconv.Atoi(perPage)
	if perPageInt == 0 {
		perPageInt = 10
	}
	statusFilter := r.URL.Query()["status"]
	var statusFilterList []domain.TransactionStatus
	for _, status := range statusFilter {
		statusFilterList = append(statusFilterList, domain.TransactionStatus(status))
	}

	param := domain.TransactionListParam{
		Page:         pageInt,
		PerPage:      perPageInt,
		StatusFilter: statusFilterList,
	}

	ctx := r.Context()
	result, paging, err := h.TransactionService.GetTransactionList(ctx, param)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(domain.CommonErrorResponse{
			Message: err.Error(),
		})
		return
	}

	resultData := []domain.Transaction{}
	if len(result) > 0 {
		resultData = result
	}
	response := domain.TransactionListResponse{
		Data:       resultData,
		Pagination: paging,
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func (h *TransactionHandler) GetTransactionDetail(w http.ResponseWriter, r *http.Request) {
	transactionID := chi.URLParam(r, "id")
	transactionUUID, err := uuid.Parse(transactionID)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(domain.CommonErrorResponse{
			Message: domain.ErrInvalidTransactionID.Error(),
		})
		return
	}

	ctx := r.Context()
	result, err := h.TransactionService.GetTransactionDetail(ctx, transactionUUID)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(domain.CommonErrorResponse{
			Message: err.Error(),
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(domain.TransactionDetailResponse{
		Data: result,
	})
}

func (h *TransactionHandler) CreateTransaction(w http.ResponseWriter, r *http.Request) {

	r.ParseMultipartForm(10 << 20)

	file, _, err := r.FormFile("file")
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(domain.CommonErrorResponse{
			Message: err.Error(),
		})
		return
	}
	defer file.Close()

	totalAmount, err := strconv.ParseFloat(r.FormValue("total_amount"), 64)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(domain.CommonErrorResponse{
			Message: err.Error(),
		})
		return
	}

	totalRecord, err := strconv.Atoi(r.FormValue("total_record"))
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(domain.CommonErrorResponse{
			Message: err.Error(),
		})
		return
	}

	fromAccount := r.FormValue("from_account")
	userID := r.Context().Value("user_id").(string)

	req := domain.TransactionUploadRequest{
		File:        &file,
		TotalAmount: totalAmount,
		TotalRecord: totalRecord,
		FromAccount: fromAccount,
		UserID:      userID,
	}

	ctx := r.Context()
	err = h.TransactionService.CreateTransaction(ctx, req)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(domain.CommonErrorResponse{
			Message: err.Error(),
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(domain.TransactionUploadResponse{
		TotalRecord: totalRecord,
		TotalAmount: totalAmount,
		Message:     "Transaction created successfully",
	})
}
