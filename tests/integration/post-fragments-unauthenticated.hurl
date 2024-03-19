# tests/integration/post-fragments-unauthenticated.hurl
# Unauthenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# Unsupported Content-Type
Content-Type: text/plain; charset=utf-8
[BasicAuth]
user1@email.com:password2
`Fragment test`

# Expect HTTP 201
HTTP/1.1 401