# tests/integration/put-fragments.hurl

# 1.0 PUT to /v1/fragments with invalid fragment ID
PUT http://localhost:8080/v1/fragments/1234
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
`This is a fragment!`

# We expect to get back an HTTP 201
HTTP/1.1 404