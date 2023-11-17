1. Register
(POST) POST http://localhost:3000/api/v1/authenticate/register
Application/json
name : string
email : string@gmail.com (email tidak bisa sama)
password : string
password_confirmation: string (samain kaya password)

2. LOGIN
(POST) POST http://localhost:3000/api/v1/authenticate/login
Application/json
email : string@gmail.com
password : string

3. INPUT ART(GAMBAR)
(PUT) http://localhost:3000/api/v1/artwork/upload
Auth bearer (Token di dapat dari Login)
multipart form
title: string
description : string
imageArt : gambar/jpg/jpeg/image

4. LIST GAMBAR
(GET) http://localhost:3000/api/v1/artwork/list
Auth bearer (Token di dapat dari Login)
Application/json

5. DETAIL GAMBAR FILEID
(GET) http://localhost:3000/api/v1/artwork/view/{fileId}
Auth bearer (Token di dapat dari Login)
Application/json

6. HAPUS GAMBAR FILEID
(DELETE) http://localhost:3000/api/v1/artwork/delete/{fileId}
Auth bearer (Token di dapat dari Login)
Application/json

7. UBAH ISI 
(PUT) http://localhost:3000/api/v1/artwork/edit/{fileId}
Auth bearer (Token di dapat dari Login)
Application/json
title:string
description:string

Aku menjalankannya di insomnia, jika tidak ada bisa menggunakan postman ya teman teman

