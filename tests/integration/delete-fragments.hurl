# tests/integration/delete-fragments.hurl

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

# Delete fragment
DELETE {{url}}
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

# Attempt to GET deleted fragment
GET {{url}}
[BasicAuth]
user1@email.com:password1
HTTP/1.1 404