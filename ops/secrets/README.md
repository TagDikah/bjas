Place production-only secret material in this directory or mount it from your secret manager during deployment.

Expected files for `docker-compose.production.yml`:

- `db_password.txt`
- `db_ca.pem`
- `fabric_tls_cert.pem`
- `fabric_client_cert.pem`
- `fabric_client_key.pem`
- `hf_api_token.txt`

Do not commit real secrets into source control.
