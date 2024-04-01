# tests/integration/lab-9-s3.hurl
# 1. Authenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1
`Hello S3!`

# 2. Confirm server returns 201
HTTP/1.1 201
[Captures]
url: header "Location"

# 3. GET created fragment
GET {{url}}
[BasicAuth]
user1@email.com:password1

# 4. Assert fragment
HTTP/1.1 200
Content-Type: text/plain
[Asserts]
body == "Hello S3!"

# 5. Delete Fragment
DELETE {{url}}
[BasicAuth]
user1@email.com:password1

# 6. Server returns 200
HTTP/1.1 200

# 7. GET deleted fragment 
GET {{url}}
[BasicAuth]
user1@email.com:password1

# 8. Server returns 404 for deleted fragment
HTTP/1.1 404