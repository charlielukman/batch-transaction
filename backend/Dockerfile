FROM golang:1.21-alpine as Build 

COPY . .

RUN GOPATH= go build -o /main main.go

####################################################################
FROM alpine:latest

COPY --from=Build /main .

EXPOSE 1323

# Set the entrypoint command
ENTRYPOINT ["./main"]
