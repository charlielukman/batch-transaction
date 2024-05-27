package handler

import (
	"batch-transaction/internal/domain"
	"batch-transaction/internal/service"
	"encoding/json"
	"net/http"

	"github.com/go-playground/validator/v10"
)

type OTPPayload struct {
	Email string `json:"email" validate:"required,email"`
}

type SendOTPResponse struct {
	OTP     string `json:"otp"`
	Message string `json:"message"`
}

func ValidateOTPPayload(req *OTPPayload) error {
	validate := validator.New()
	err := validate.Struct(req)
	if err != nil {
		return err
	}
	return nil
}

type OTPHandler struct {
	OtpService *service.OTPService
}

func NewOTPHandler(otpService *service.OTPService) *OTPHandler {
	return &OTPHandler{
		OtpService: otpService,
	}
}

func (h *OTPHandler) SendOTP(w http.ResponseWriter, r *http.Request) {
	var payload OTPPayload
	var response SendOTPResponse

	err := json.NewDecoder(r.Body).Decode(&payload)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(domain.CommonErrorResponse{
			Message: err.Error(),
		})
		return
	}

	err = ValidateOTPPayload(&payload)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(domain.CommonErrorResponse{
			Message: err.Error(),
		})
		return
	}

	otpCode, err := h.OtpService.SendOTP(payload.Email)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(domain.CommonErrorResponse{
			Message: err.Error(),
		})
		return
	}

	response = SendOTPResponse{
		Message: "Success send OTP",
		OTP:     otpCode,
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}
