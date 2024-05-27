package database

import (
	"context"
	"database/sql"
	"log"

	_ "github.com/lib/pq"
)

type DB struct {
	db  *sql.DB
	dsn string
	log *log.Logger
}

func NewDB(driver, dbDsn string, log *log.Logger) (*DB, error) {
	db, err := sql.Open("postgres", dbDsn)
	if err != nil {
		panic(err)
	}

	return &DB{
		db:  db,
		dsn: dbDsn,
		log: log,
	}, nil
}

func (d *DB) ExecContext(ctx context.Context, query string, args ...any) (sql.Result, error) {
	d.log.Println(query, args)
	return d.db.ExecContext(ctx, query, args...)
}

func (d *DB) QueryRowContext(ctx context.Context, query string, args ...any) *sql.Row {
	d.log.Println(query, args)
	return d.db.QueryRowContext(ctx, query, args...)
}

func (d *DB) QueryContext(ctx context.Context, query string, args ...any) (*sql.Rows, error) {
	d.log.Println(query, args)
	return d.db.QueryContext(ctx, query, args...)
}

func (d *DB) BeginTx(ctx context.Context) (*sql.Tx, error) {
	return d.db.BeginTx(ctx, nil)
}
