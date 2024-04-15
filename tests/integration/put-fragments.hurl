# tests/integration/put-fragments.hurl

# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
`This is a fragment!`

HTTP/1.1 201
[Asserts]
jsonpath "$.fragment.size" == 19
[Captures]
url: header "Location"

# PUT fragment to update it
PUT {{url}}
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
`Updated Fragment`
HTTP/1.1 200
[Asserts]
jsonpath "$.fragment.size" == 16

# GET updated fragment to verify fragment data
GET {{url}}
[BasicAuth]
user1@email.com:password1
HTTP/1.1 200
[Asserts]
body == "Updated Fragment"