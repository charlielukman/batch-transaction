package internal

import (
	"batch-transaction/internal/auth"
	"batch-transaction/internal/config"
	"batch-transaction/internal/handler"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
)

func NewRouter(healthHandler *handler.HealthHandler, otpHandler *handler.OTPHandler, userHandler *handler.UserHandler, transactionHandler *handler.TransactionHandler, jwtService auth.JWTService, config config.ConfigInterface) *chi.Mux {
	r := chi.NewRouter()

	cors := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"}, // Allow all origins
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300, // Maximum age to cache preflight request
	})

	r.Use(cors.Handler)

	r.Route("/health", func(r chi.Router) {
		r.Get("/", healthHandler.Health)
	})

	r.Route("/api/otp", func(r chi.Router) {
		r.Post("/send", otpHandler.SendOTP)
	})

	r.Route("/api/auth", func(r chi.Router) {
		r.Post("/register", userHandler.Register)
		r.Post("/login", userHandler.Login)
	})

	r.Route("/api/transactions", func(r chi.Router) {
		r.Use(auth.BearerAuthMiddleware(jwtService, config.GetSecretKey()))
		r.Post("/create", transactionHandler.CreateTransaction)
		r.Get("/summary", transactionHandler.GetTransactionSummary)
		r.Patch("/{id}", transactionHandler.UpdateTransaction)
		r.Get("/", transactionHandler.GetTransactionList)
		r.Get("/{id}", transactionHandler.GetTransactionDetail)
	})

	return r
}
