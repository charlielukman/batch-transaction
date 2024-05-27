package main

import (
	"batch-transaction/internal"
	"batch-transaction/internal/auth"
	"batch-transaction/internal/config"
	"batch-transaction/internal/database"
	"batch-transaction/internal/handler"
	"batch-transaction/internal/repository"
	"batch-transaction/internal/service"
	"log"
	"net/http"

	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	config := config.NewConfig()
	db, err := database.NewDB("postgres", config.GetDatabaseURL(), log.Default())
	if err != nil {
		log.Fatal(err)
	}

	redisOptions := redis.Options{
		Addr:     "localhost:6379",
		Password: "",
		DB:       0,
	}
	redisClient := database.NewRedisClient(&redisOptions)

	passwordCompare := auth.PasswordComparerImpl{}
	jwtService := auth.NewJWTServiceImpl()

	otpService := service.NewOTPService(*redisClient)

	userRepo := repository.NewUserRepository(db)
	userService := service.NewUserService(passwordCompare, jwtService, config, *otpService, userRepo)

	transactionRepo := repository.NewTransactionRepository(db)
	transactionService := service.NewTransactionService(transactionRepo)

	healthHandler := handler.NewHealthHandler()
	userHandler := handler.NewUserHandler(userService)
	otpHandler := handler.NewOTPHandler(otpService)
	transactionHandler := handler.NewTransactionHandler(transactionService)

	r := internal.NewRouter(healthHandler, otpHandler, userHandler, transactionHandler, jwtService, config)
	port := "1323"
	log.Println("Server running on port", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
