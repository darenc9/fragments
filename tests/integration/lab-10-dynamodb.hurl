# tests/integration/lab-10-dynamodb.hurl

# 1. POST new JSON fragment 
POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
user1@email.com:password1
{
  "service": "DynamoDB"
}


# 2. We expect 201 response and capture variables
HTTP/1.1 201
[Captures]
fragment1_url: header "location"
fragment1_id: jsonpath "$.fragment.id"

# 3. GET fragment info, verify metadata
GET {{fragment1_url}}/info
[BasicAuth]
user1@email.com:password1
HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
header "Content-Type" contains "application/json"
jsonpath "$.fragment.id" == "{{fragment1_id}}"
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "application/json"

# 4. POST markdown fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/markdown
[BasicAuth]
user1@email.com:password1
`DynamoDB is **great**.`

# 5. Check for 201 response, and capture variables
HTTP/1.1 201
[Captures]
fragment2_url: header "Location"
fragment2_id: jsonpath "$.fragment.id"

# 6. GET markdown fragment, verify metadata
GET {{fragment2_url}}/info
[BasicAuth]
user1@email.com:password1
HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
header "Content-Type" contains "application/json"
jsonpath "$.fragment.id" == "{{fragment2_id}}"
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "text/markdown"

# 7. GET all fragments and check ids
GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1
HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragments" includes "{{fragment1_id}}"
jsonpath "$.fragments" includes "{{fragment2_id}}"

# 8. DELETE first fragment created
DELETE {{fragment1_url}}
[BasicAuth]
user1@email.com:password1

# 9. Confirm server returns 200
HTTP/1.1 200

# 10. Attempt to GET first fragment
GET {{fragment1_url}}
[BasicAuth]
user1@email.com:password1

# 11. Expect 404 response
HTTP/1.1 404

# 12. Get all Fragments, confirm first id not included
GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1
HTTP/1.1 200
[Asserts]
jsonpath "$.fragments" not includes "{{fragment1_id}}"
jsonpath "$.fragments" includes "{{fragment2_id}}"