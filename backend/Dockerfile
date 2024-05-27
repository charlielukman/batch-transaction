FROM golang:1.21-alpine as Build 

WORKDIR /app

COPY . .

RUN GOPATH= go build -o /main main.go
####################################################################
FROM alpine:latest

COPY --from=Build /main .
COPY --from=Build /app/.env .env

EXPOSE 1323

# Set the entrypoint command
ENTRYPOINT ["./main"]
