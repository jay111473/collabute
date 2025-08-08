# Collabute - Collaborative Development Platform

A modern platform connecting developers, startups, and project managers for collaborative software development projects.

## 🚀 Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn/ui
- **Package Manager:** Bun

### Backend
- **Database & Backend:** Convex (Real-time, reactive backend)
- **Authentication:** Convex Auth with Password & GitHub OAuth providers
- **File Storage:** Convex File Storage
- **Real-time Updates:** Convex Subscriptions

### Key Features
- 🔐 **Authentication System:** Email/Password and GitHub OAuth
- 👥 **User Management:** Admin panel with role-based access control
- 💼 **Project Management:** Create and manage development projects
- 🎯 **Issue Tracking:** GitHub-style issue management system
- 💬 **Real-time Chat:** Built-in messaging system
- 📊 **Dashboard:** Comprehensive analytics and project insights
- 🧙 **AI-Powered Wizard:** Smart project setup and configuration
- 📝 **Blog System:** Built-in CMS for content management

## 📋 Prerequisites

- Node.js 18+ 
- Bun package manager
- Convex account (free tier available)
- GitHub OAuth App (for GitHub authentication)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/collabute.git
   cd collabute
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up Convex**
   ```bash
   bunx convex dev
   ```
   This will:
   - Create a new Convex project (or connect to existing)
   - Generate TypeScript types
   - Start the Convex development server

4. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Convex
   NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
   CONVEX_DEPLOY_KEY=your-deploy-key

   # GitHub OAuth (optional)
   AUTH_GITHUB_ID=your-github-oauth-id
   AUTH_GITHUB_SECRET=your-github-oauth-secret

   # Application
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

5. **Seed the database (optional)**
   ```bash
   bunx convex run seed:seedAdminRole
   bunx convex run seed:seedDefaultRoles
   ```

6. **Run the development server**
   ```bash
   bun run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
collabute/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication pages
│   ├── admin/               # Admin dashboard
│   ├── dashboard/           # User dashboard
│   ├── api/                 # API routes
│   └── blog/                # Blog pages
├── components/              # React components
│   ├── ui/                  # Shadcn UI components
│   ├── admin/               # Admin-specific components
│   ├── dashboard/           # Dashboard components
│   ├── wizard/              # Project wizard components
│   └── chat/                # Chat components
├── convex/                  # Convex backend
│   ├── _generated/          # Auto-generated types
│   ├── auth.ts              # Authentication configuration
│   ├── schema.ts            # Database schema
│   ├── users.ts             # User mutations/queries
│   ├── projects.ts          # Project mutations/queries
│   ├── issues.ts            # Issue tracking
│   └── chat.ts              # Chat functionality
├── hooks/                   # Custom React hooks
├── lib/                     # Utility functions
├── public/                  # Static assets
├── styles/                  # Global styles
└── types/                   # TypeScript type definitions
```

## 🔑 Key Features Implementation

### Authentication
- Password-based authentication with Convex Auth
- GitHub OAuth integration
- Role-based access control (Admin/User)
- Secure password hashing with Scrypt

### User Roles
- **Admin:** Full system access, user management, content moderation
- **User:** Standard access, project participation
- **Developer:** Development-focused features
- **Startup:** Project creation and management
- **Project Manager:** Team and project oversight

### Real-time Features
- Live chat messaging
- Real-time notifications
- Instant project updates
- Collaborative editing

## 🧑‍💻 Development

### Running Tests
```bash
bun test
```

### Building for Production
```bash
bun run build
```

### Deploying to Production
```bash
bunx convex deploy --prod
bun run build
```

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_CONVEX_URL` | Convex deployment URL | Yes |
| `CONVEX_DEPLOY_KEY` | Convex deployment key | Yes |
| `AUTH_GITHUB_ID` | GitHub OAuth App ID | No |
| `AUTH_GITHUB_SECRET` | GitHub OAuth App Secret | No |
| `NEXT_PUBLIC_APP_URL` | Application URL | Yes |

## 🚀 Deployment

### Vercel Deployment
1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Docker Deployment
```dockerfile
# Dockerfile included in the repository
docker build -t collabute .
docker run -p 3000:3000 collabute
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- Documentation: [docs.collabute.com](https://docs.collabute.com)
- Issues: [GitHub Issues](https://github.com/your-org/collabute/issues)
- Discord: [Join our community](https://discord.gg/collabute)

## 🙏 Acknowledgments

- [Convex](https://convex.dev) for the amazing real-time backend
- [Vercel](https://vercel.com) for Next.js and hosting
- [Shadcn](https://ui.shadcn.com) for the beautiful UI components
- All our contributors and supporters

---

Built with ❤️ by the Collabute Team