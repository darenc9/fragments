# tests/integration/getById-md-to-html.hurl

# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# Unsupported Content-Type
Content-Type: text/markdown
[BasicAuth]
user1@email.com:password1
`# Sample Text`

# Expect HTTP 201
HTTP/1.1 201

[Captures]
url: header "Location"

# 2. Try to GET.ext to convert to text/html
GET {{url}}.html
[BasicAuth]
user1@email.com:password1
HTTP/1.1 200
[Asserts]
header "Content-Type" contains "text/html"
