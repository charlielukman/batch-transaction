package handler

import (
	"batch-transaction/internal/domain"
	"batch-transaction/internal/service"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/go-playground/validator/v10"
)

type UserHandler struct {
	UserService *service.UserService
}

func NewUserHandler(userService *service.UserService) *UserHandler {
	return &UserHandler{
		UserService: userService,
	}
}

func (h *UserHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req domain.UserRegisterRequest

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(domain.CommonErrorResponse{
			Message: err.Error(),
		})
		return
	}

	ctx := r.Context()
	err = h.UserService.Register(ctx, req)
	if _, ok := err.(validator.ValidationErrors); ok {
		var fieldErrors []domain.FieldError
		for _, err := range err.(validator.ValidationErrors) {
			var message string
			if err.Tag() == "required" {
				message = fmt.Sprintf("%s is required", err.Field())
			} else {
				message = fmt.Sprintf("%s format invalid", err.Field())
			}
			fieldErrors = append(fieldErrors, domain.FieldError{
				Field:   err.Field(),
				Message: message,
			})
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(domain.FieldErrorResponse{
			Message: "Validation failed",
			Errors:  fieldErrors,
		})
		return
	}
	if err == domain.ErrInvalidOTP {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(domain.FieldErrorResponse{
			Message: "Validation failed",
			Errors: []domain.FieldError{
				{
					Field:   "otp",
					Message: err.Error(),
				},
			},
		})
		return
	}
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
	json.NewEncoder(w).Encode(domain.UserRegisterResponse{
		Message: "User registered successfully",
	})
}

func (h *UserHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req domain.UserLogin

	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(domain.CommonErrorResponse{
			Message: err.Error(),
		})
		return
	}

	ctx := r.Context()
	response, err := h.UserService.Login(ctx, req)
	if _, ok := err.(validator.ValidationErrors); ok {
		var fieldErrors []domain.FieldError
		for _, err := range err.(validator.ValidationErrors) {
			fieldErrors = append(fieldErrors, domain.FieldError{
				Field:   err.Field(),
				Message: fmt.Sprintf("%s is %s", err.Field(), err.Tag()),
			})
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(domain.FieldErrorResponse{
			Message: "Validation failed",
			Errors:  fieldErrors,
		})
		return
	}

	if err == domain.ErrorUserNotFound {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(domain.CommonErrorResponse{
			Message: err.Error(),
		})
		return
	}
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(domain.CommonErrorResponse{
			Message: err.Error(),
		})
		return
	}

	w.Header().Add("content-type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}
