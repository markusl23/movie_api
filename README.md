# 🎬 **Movie-API – Documentation**

A simple RESTful backend for movie information and user favorites.

## 📌 **1. Overview**

The **Movie-API** is a server-side application that provides information about movies, their directors, and their genres.  
Users can create personal accounts and maintain a list of their favorite movies.

The API follows REST principles and can be consumed by:

- a single-page application (SPA)
- a mobile app
- any other HTTP-capable client

## 🎞️ **2. Main Resources**

### **Movies**

For each movie, the API stores:

- Title  
- Description  
- Genre  
- Director  
- Image URL (poster)  
- Whether the movie is featured  

### **Genres**

Genres describe the type of movie (e.g., *Thriller*, *Drama*, *Comedy*) and include at least:

- Name  
- Description  

### **Directors**

Each director includes:

- Name  
- Bio  
- Year of birth  
- Year of death (optional)  

### **Users**

Users can register and maintain their favorite movies list.  
A user record contains:

- Username  
- Password (securely hashed)  
- Email  
- Birthday  
- List of favorite movie IDs  

## 🔗 **3. Current API Endpoints**

| Request Description | URL | Method | Request Body | Response Format | Example |
|---------------------|------|--------|--------------|-----------------|---------|
| **Get all movies** | `/movies` | GET | none | Array of movie objects | `/movies` |
| **Get single movie by title** | `/movies/:name` | GET | none | Movie JSON object | `/movies/The%20Shawshank%20Redemption` |
| **Get genre data** | `/genres/:name` | GET | none | Genre JSON | `/genres/Science%20Fiction` |
| **Get director data** | `/directors/:name` | GET | none | Director JSON | `/directors/Peter%20Jackson` |
| **Register new user** | `/users` | POST | JSON object containing user data | New user JSON (without password) or error | see below |
| **Get single user by username** | `/users/:username` | GET | none | User JSON | `/users/Michael` |
| **Delete user by username** | `/users/:username` | DELETE | none | Success message or error | `/users/Michael` |
| **Update user data** | `/users/:username` | PUT | JSON user object | Updated user JSON | see below |
| **Add movie to favorites** | `/users/:username/FavoriteMovies/:movieid` | PUT | none | Updated user JSON | `/users/Michael/FavoriteMovies/692ec7b2e0104b0a96120e6` |
| **Remove movie from favorites** | `/users/:username/FavoriteMovies/:movieid` | DELETE | none | Updated user JSON | `/users/Michael/FavoriteMovies/692ec7b2e0104b0a96120e6` |

### 📥 Example: Registering a new user (POST `/users`)

**Request body:**

```json
{
  "Username": "Steve",
  "Password": "1234567890",
  "Email": "steve@email.net",
  "Birthday": "",
  "FavoriteMovies": []
}
```

**Response:**

```json
{
  "_id": "6932cf4a897f849daa15080b",
  "Username": "Steve",
  "Email": "steve@email.net",
  "Birthday": null,
  "FavoriteMovies": []
}
```

Password is omitted from the response.

## 🔐 **4. Authentication & Security**

Parts of the API are protected using **JWT (JSON Web Tokens)**.  
Only authenticated users can:

- retrieve user profiles  
- update user data  
- manage favorite movies  

All incoming data is validated using `express-validator` to ensure security and data integrity.

## 🚀 **5. Usage**

Frontend applications can interact with the Movie-API by sending HTTP requests to its endpoints.  
The API responds with JSON objects that include:

- movie data  
- user profile data  
- status/confirmation messages  

This documentation provides an overview of available resources and expected request/response formats.

## 📝 **Footer**

Movie-API project documentation.
