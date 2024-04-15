# tests/integration/getById-img-convert.hurl

# Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# Unsupported Content-Type
Content-Type: image/png
[BasicAuth]
user1@email.com:password1
file,image.png;

# Expect HTTP 201
HTTP/1.1 201

[Captures]
url: header "Location"

# 2. Try to GET.ext to convert to image/jpg
GET {{url}}.jpg
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: image/jpg