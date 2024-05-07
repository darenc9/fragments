# fragments
Fragments is a highly scalable containerized microservice that manages small fragments of texts and images. 

A fragment is any piece of text (e.g., MIME type of <mark>text/plain</mark>, text/markdown, text/html, text/csv, etc,), JSON data (application/json), or any of the following images: image/png, image/jpeg, image/webp, image/avif, image/gif.


## Scripts:

```
npm run lint
```
Runs lint on every file and folder inside .src/

```
npm start
```
Starts the server using "node src/server.js"

```
npm run dev
```
Runs the server using nodemon which automatically reloads server.

```
npm run debug
```
Runs the server using nodemon and a debugger as well.
