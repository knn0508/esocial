# Esocial - Student & Teacher Mentorship Platform

A comprehensive social platform connecting students and teachers for mentorship, sharing, and networking in the education and career ecosystem.

## 🚀 Features

### Core Features
- **User Authentication**: Secure .edu email verification with JWT tokens
- **Role-based Access**: Separate interfaces for students and teachers
- **Social Feed**: Post sharing with likes, comments, and reposts
- **Mentorship Network**: Connect mentors and mentees
- **Direct Messaging**: Real-time chat system
- **Study Groups**: Create and join topic-specific groups
- **User Profiles**: Comprehensive profile management

### User Roles
- **Students**: Can post, comment, like, request mentorship, join groups
- **Teachers**: Can post, comment, like, offer mentorship, join groups
- **Admins**: Can moderate content, manage users, delete spam

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **TailwindCSS** - Utility-first CSS framework
- **Redux Toolkit** - State management
- **React Router** - Client-side routing
- **Framer Motion** - Smooth animations
- **Socket.io-client** - Real-time communication

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **JWT** - Authentication tokens
- **Socket.io** - Real-time messaging
- **Nodemailer** - Email service
- **Cloudinary** - File storage

## 📁 Project Structure

```
esocial/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Redux store
│   │   └── App.js
│   └── package.json
├── server/                # Express backend
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── utils/           # Utility functions
│   └── index.js
└── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd esocial
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   
   Create `server/.env` file:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/esocial
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=7d
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both frontend (port 3000) and backend (port 5000) servers.

## 📱 Pages & Features

### Public Pages
- **Landing Page** (`/`) - Hero section, features, testimonials
- **Sign Up** (`/signup`) - Role-based registration forms
- **Login** (`/login`) - User authentication
- **Email Verification** (`/verify-email`) - .edu email verification
- **Password Reset** (`/forgot-password`, `/reset-password`) - Password recovery

### Protected Pages
- **Home Feed** (`/home`) - Main social feed with posts
- **Mentorship** (`/mentorship`) - Mentorship offers and requests
- **Messages** (`/messages`) - Real-time messaging system
- **Groups** (`/groups`) - Study group management
- **Profile** (`/profile`) - User profile management
- **User Profiles** (`/profile/:id`) - View other users' profiles

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `GET /api/users/:id/posts` - Get user posts
- `GET /api/users/search` - Search users

### Posts
- `GET /api/posts` - Get all posts (with filters)
- `POST /api/posts` - Create new post
- `GET /api/posts/:id` - Get single post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Like/unlike post
- `POST /api/posts/:id/repost` - Repost content

### Comments
- `GET /api/posts/:id/comments` - Get post comments
- `POST /api/posts/:id/comments` - Add comment
- `DELETE /api/comments/:id` - Delete comment
- `POST /api/comments/:id/like` - Like/unlike comment

### Messages
- `GET /api/messages` - Get user conversations
- `GET /api/messages/:userId` - Get conversation with user
- `POST /api/messages` - Send message
- `PUT /api/messages/:id/read` - Mark message as read
- `DELETE /api/messages/:id` - Delete message

### Groups
- `GET /api/groups` - Get all groups
- `POST /api/groups` - Create group
- `GET /api/groups/:id` - Get group details
- `PUT /api/groups/:id` - Update group
- `POST /api/groups/:id/join` - Join group
- `POST /api/groups/:id/leave` - Leave group
- `GET /api/groups/:id/posts` - Get group posts

### Mentorship
- `GET /api/mentorship` - Get mentorship listings
- `POST /api/mentorship` - Create mentorship offer/request
- `GET /api/mentorship/:id` - Get mentorship details
- `PUT /api/mentorship/:id/status` - Update mentorship status
- `POST /api/mentorship/:id/notes` - Add mentorship note
- `POST /api/mentorship/:id/rating` - Rate mentorship

### File Upload
- `POST /api/upload/image` - Upload image
- `POST /api/upload/file` - Upload file
- `DELETE /api/upload/:publicId` - Delete file

## 🗄️ Database Schema

### Users Collection
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique, .edu domain),
  password: String (hashed),
  role: String (student, teacher, admin),
  university: String,
  faculty: String,
  major: String,
  group: String,
  profilePicture: String (URL),
  bio: String,
  socialLinks: Array,
  verified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Posts Collection
```javascript
{
  userId: ObjectId (ref: users),
  content: String,
  images: Array,
  attachments: Array,
  links: Array,
  type: String (text, image, link, file),
  likes: Array (userIds),
  likesCount: Number,
  repostsCount: Number,
  commentsCount: Number,
  isMentorshipPost: Boolean,
  groupId: ObjectId (ref: groups),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with salt rounds
- **Email Verification** - .edu domain validation
- **Rate Limiting** - API request throttling
- **Input Validation** - Request data sanitization
- **CORS Protection** - Cross-origin request security

## 🎨 Design System

### Colors
- Primary: Blue (#3B82F6)
- Secondary: White (#FFFFFF)
- Accent: Blue shades
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Error: Red (#EF4444)

### Typography
- Font: Inter (Google Fonts)
- Style: Clean and minimalist
- Hierarchy: Clear heading structure

### Components
- **Buttons**: Primary, secondary, outline variants
- **Forms**: Consistent input styling
- **Cards**: Post cards, profile cards
- **Modals**: Overlay dialogs
- **Navigation**: Responsive navbar

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build the React app: `npm run build`
2. Deploy the `build` folder to your hosting service
3. Set environment variables for API URL

### Backend (Heroku/Railway)
1. Set up MongoDB Atlas for production database
2. Configure environment variables
3. Deploy to your hosting service
4. Set up Cloudinary for file storage

### Environment Variables
```env
# Production
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_production_secret
EMAIL_HOST=your_smtp_host
CLOUDINARY_CLOUD_NAME=your_cloud_name
FRONTEND_URL=https://your-domain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@esocial.edu or create an issue in the repository.

## 🔮 Future Features

- **Mobile App**: React Native or Flutter
- **AI Integration**: Smart matching for mentorship
- **Video Calls**: Integrated video chat
- **Gamification**: Learning challenges and leaderboards
- **Analytics**: User engagement metrics
- **Advanced Search**: AI-powered content discovery

---

Built with ❤️ for the education community
