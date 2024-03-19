# tests/integration/post-fragments-json.hurl
# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# Unsupported Content-Type
Content-Type: application/json
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
Content-Length: 13
[Asserts]
header "Content-Type" contains "application/json"
body == "Fragment test"