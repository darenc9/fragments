# tests/integration/post-fragments-charset.hurl
# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# Unsupported Content-Type
Content-Type: text/plain; charset=utf-8
[BasicAuth]
user1@email.com:password1
`Fragment test`

# Expect HTTP 201
HTTP/1.1 201

[Captures]
url: header "Location"

# 2. Try to GET the fragment we just posted by its URL
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
[Asserts]
# Expect the Content-Type header to contain "text/plain" and "charset=utf-8"
header "Content-Type" contains "text/plain"
header "Content-Type" contains "charset=utf-8"