package auth

import (
	"context"
	"net/http"
	"strings"
)

func BearerAuthMiddleware(jwtSigner JWTService, secretKey string) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				http.Error(w, "missing Authorization header", http.StatusForbidden)
				return
			}

			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || parts[0] != "Bearer" {
				http.Error(w, "invalid Authorization header format", http.StatusForbidden)
				return
			}

			token := parts[1]
			claims, err := jwtSigner.VerifyJWT(token, secretKey)

			if err != nil {
				http.Error(w, "invalid token", http.StatusForbidden)
				return
			}

			ctx := context.WithValue(r.Context(), "user_id", claims.UserID)
			ctx = context.WithValue(ctx, "role", claims.Role)

			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
