# tests/integration/post-fragments-unsupported-type.hurl
# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# Unsupported Content-Type
Content-Type: application/msword
[BasicAuth]
user1@email.com:password1
`Fragment test`

HTTP/1.1 415