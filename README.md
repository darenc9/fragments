# Fragments Microservice

## Introduction
---
Fragments is a highly scalable containerized microservice that manages small fragments of texts and images. 

A fragment is any piece of text (e.g., MIME type of  `text/plain`, `text/markdown`, `text/html`, `text/csv`, etc.), JSON data (`application/json`), or any of the following images: `image/png`, `image/jpeg`, `image/webp`, `image/avif`, `image/gif`.

- The Fragments microservice provides an HTTP REST API for existing apps.
- Is able to create, retrieve, update, and delete any fragment.
- All fragment data are stored along with information on the fragment, including: size, type, creation/modification dates.
- Can be deployed to AWS.
- Image fragments can be converted to any other image fragment types
- Text fragments can be converted into other text fragment types

Fragments have two parts: 1) metadata (i.e., details _about_ the fragment); and 2) data (i.e., the actual binary contents of the fragment).

The fragment's `metadata` is an object that describes the fragment in the following format:

```json
{
  "id": "30a84843-0cd4-4975-95ba-b96112aea189",
  "ownerId": "11d4c22e42c8f61feaba154683dea407b101cfd90987dda9e342843263ca420a",
  "created": "2021-11-02T15:09:50.403Z",
  "updated": "2021-11-02T15:09:50.403Z",
  "type": "text/plain",
  "size": 256,
  "tag" : "file name"
}
```
 The fragment's `data` is the actual binary contents of the fragment. The data is stored into S3 or Localstack and can be fetched with the `ownerId` and `fragmentId` of the fragment.

## Project Features, Specifications, and Learning Outcomes
---
Fragments was developed in GitHub, and CI/CD pipelines were built to automatically build, test, and deploy the microservice to AWS and Dockerhub.

#### `CI/CD Pipelines`
The Fragments project is built with continuous integration and continuous deployment pipelines. 
 **Continuous Integration** Steps:
1. Linting is performed on all files and folders
2. Dockerfile linting is performed using hadolint
3. Runs unit tests coded with jest
4. Runs integration tests using Hurl
5. Builds Docker image and pushes to Docker Hub after successful completion of all jobs

**Continuous Development**: Deploys new versions to AWS. Steps:
1. Login, build, and push image to Amazon ECR
2. Update Amazon ECS's task definition to use new image
3. Deploy Amazon ECS task definition

The CI workflow will run whenever commits are pushed to the 'main' branch, or whenever there is a pull request to the 'main' branch. The CD workflow will run whenever a new version tag is pushed to the 'main' branch. This effective allows me to push to Github and have Github Actions automate the task of running tests, building and pushing updates to Docker Hub, and deploying new images to AWS automatically.

#### `Amazon Web Services Integration`
| AWS Service | Description |
| ----------- | ----------- |
| Amazon Cognito | Provides authentication, authorization, and user management for my Fragments microservice. Allows users to register accounts using Amazon Cognito, and authenticate all API routes. |
| Amazon ECR | Elastic Container Registry (ECR) is a fully managed Docker container registry. Fragments stores Docker images built during the CI/CD process to this registry. Amazon ECS will use the registry contained here to deploy the image. |
| Amazon ECS | Elastic Container Service (ECS) is a fully managed container service that allows Fragments to run, stop, and manage Docker containers on a cluster. Fragments utilizes ECS to deploy and manage Fragments containers.  |
| Amazon DynamoDB | Provides a fully managed NoSQL database service to Fragments. Fragments store the fragments meta data on DynamoDB, such as: file type, creation date, last modified date, owner id, and file name. |
| Amazon S3 | Simple Storage Service (S3) is utilized by Fragments to store the actual binary data like images or raw text data of each Fragment. Utilizing both DynamoDB to store the metadata and S3 to store the raw file contents, ensures a scalable and efficient solution for managing fragments.   |

#### `Software Testing`
Fragments was thoroughly tested using `jest` for unit testing each file, and `hurl` for integration tests. Jest is setup with a Basic authorization system to test Fragments while bypassing Google Authentication.
Hurl was used for integration testing. Hurl is an open-source command-line tool used to automate curl testing.

`Mocking Amazon Services`
Since a lot of the development time was done before deploying the image to AWS, it's important to thoroughly test the code, and this was done by mocking Amazon S3 and DynamoDB services.
Using `docker-compose`, the microservice runs: LocalStack (to emulate S3), and DynamoDB local to create an offline testing environment to simulate the cloud infrastructure.

## API Routes
---
#### `Health Check`
An unauthenticated `/` route is available to check the health of the service. If service is running, an HTTP `200` status is returned, along with the following:
```json
{
  "status": "ok",
  "author": "Devon Chan",
  "githubUrl": "https://github.com/darenc9/fragments",
  "version": "1.0"
}
```

#### `POST /fragments`
Creates a new fragment for the current user. Posts a file (raw binary data) in the `body` of the request. Returns HTTP 201 if successful, along with the following body:
```json
{
  "status": "ok",
  "fragment": {
    "id": "30a84843-0cd4-4975-95ba-b96112aea189",
    "ownerId": "11d4c22e42c8f61feaba154683dea407b101cfd90987dda9e342843263ca420a",
    "created": "2024-04-02T15:09:50.403Z",
    "updated": "2024-04-02T15:09:50.403Z",
    "type": "text/plain",
    "size": 256,
    "tag" : "file name"
  }
}
```

#### `GET /fragments`
Gets all fragment ids belonging to the current user. 
The response includes an array of ids:

```json
{
  "status": "ok",
  "fragments": ["b9e7a264-630f-436d-a785-27f30233faea", "dad25b07-8cd6-498b-9aaf-46d358ea97fe"]
}
```

#### `GET /fragments/?expand=1`
Gets all fragments for the current user along with each fragment's metadata. 
The route accepts the following search queries as well to filter the fragments obtained: tag, created, updated, type, and size. Such as: `/fragments?expand=1?tag=file`
An example response includes:
```json
{
  "status": "ok",
  "fragments": [
    {
      "id": "b9e7a264-630f-436d-a785-27f30233faea",
      "ownerId": "11d4c22e42c8f61feaba154683dea407b101cfd90987dda9e342843263ca420a",
      "created": "2021-11-02T15:09:50.403Z",
      "updated": "2021-11-02T15:09:50.403Z",
      "type": "text/plain",
      "size": 256,
      "tag" : "file name"
    },
    {
      "id": "dad25b07-8cd6-498b-9aaf-46d358ea97fe",
      "ownerId": "11d4c22e42c8f61feaba154683dea407b101cfd90987dda9e342843263ca420a",
      "created": "2021-11-02T15:09:50.403Z",
      "updated": "2021-11-02T15:09:50.403Z",
      "type": "text/plain",
      "size": 256,
      "tag" : "a file"
    }
  ]
}
```

#### `GET /fragments/:id`
Gets the fragment's data `(raw binary data)` with the given `id`.
If the `id` includes an optional extension (e.g., `.txt` or `.png`), the server will attempt to convert the fragment to the type associated with the extension.
Current supported conversions are:
| Type               | Valid Conversion Extensions              |
| ------------------ | ---------------------------------------- |
| `text/plain`       | `.txt`                                   |
| `text/markdown`    | `.md`, `.html`, `.txt`                   |
| `text/html`        | `.html`, `.txt`                          |
| `text/csv`         | `.csv`, `.txt`, `.json`                  |
| `application/json` | `.json`, `.txt`                          |
| `image/png`        | `.png`, `.jpg`, `.webp`, `.gif`, `.avif` |
| `image/jpeg`       | `.png`, `.jpg`, `.webp`, `.gif`, `.avif` |
| `image/webp`       | `.png`, `.jpg`, `.webp`, `.gif`, `.avif` |
| `image/avif`       | `.png`, `.jpg`, `.webp`, `.gif`, `.avif` |
| `image/gif`        | `.png`, `.jpg`, `.webp`, `.gif`, `.avif` |


#### `PUT /fragments/:id`
Allows user to update the `fragment data` (raw binary data) for an existing fragment.
Successful response includes an HTTP 200 as well as the updated fragment metadata:
```json
{
  "status": "ok",
  "fragment": {
    "id": "fdf71254-d217-4675-892c-a185a4f1c9b4",
    "ownerId": "11d4c22e42c8f61feaba154683dea407b101cfd90987dda9e342843263ca420a",
    "created": "2021-11-02T15:09:50.403Z",
    "updated": "2021-11-02T15:09:50.403Z",
    "type": "text/plain",
    "size": 1024,
    "tag" : "name of file"
  }
}
```

#### `DELETE /fragments/:id`
Allows user to delete one of their existing fragments with the given `id`.
Once the fragment is deleted, an HTTP 200 response is returned, along with `ok` status.



