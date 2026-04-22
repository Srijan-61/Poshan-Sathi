# Poshan Sathi (पोषण साथी) 🥗

Poshan Sathi is a comprehensive nutrition tracking and management application designed to help users monitor their dietary intake, manage health goals, and navigate localized nutritional data (especially focused on Nepali cuisine). It features a robust admin dashboard for managing food libraries and user data.

## 🚀 Features

- **Personalized Dashboard**: Track daily calorie intake, macronutrients (Protein, Carbs, Fats), and micronutrients.
- **Meal Logging**: Log breakfast, lunch, dinner, and snacks with a localized food database.
- **Food Library**: Search for foods and view detailed nutritional information.
- **Budget Tracking**: (Planned/Implemented) Track spending on nutritional goals.
- **Admin Panel**: Manage the food database, ingredients, and user accounts.
- **Localized Data**: Built-in support for Nepali food items and nutritional values.
- **Responsive Design**: Modern, premium UI built with Tailwind CSS and Framer Motion.

## 🛠️ Tech Stack

**Frontend:**
- [React](https://reactjs.org/) (Vite)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/) (Animations)
- [Lucide React](https://lucide.dev/) (Icons)
- [Recharts](https://recharts.org/) (Data Visualization)
- [Axios](https://axios-http.com/) (API requests)

**Backend:**
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/) (Mongoose ODM)
- [JWT](https://jwt.io/) (Authentication)
- [Cloudinary](https://cloudinary.com/) (Image Storage)
- [Nodemailer](https://nodemailer.com/) (Email Services)
- [Edamam API](https://developer.edamam.com/) (External food data)

---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Srijan-61/Poshan-Sathi.git
cd Poshan-Sathi
```

### 2. Backend Configuration
1. Navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `Backend` directory and add the following configurations:
   ```env
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=7d

   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   EDAMAM_APP_ID=your_edamam_id
   EDAMAM_APP_KEY=your_edamam_key

   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   
   FRONTEND_URL=http://localhost:5173
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

### 3. Frontend Configuration
1. Navigate to the `Frontend` directory:
   ```bash
   cd ../Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## 🧪 Running Tests
The project includes automated tests for both the frontend and backend.

**Backend Tests:**
```bash
cd Backend
npm test
```

---

## 📁 Project Structure

```text
Poshan-Sathi/
├── Backend/            # Express Server
│   ├── controllers/    # Request handlers
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API endpoints
│   ├── middleware/     # Auth & validation
│   └── utils/          # Helper functions
└── Frontend/           # React App (Vite)
    ├── src/
    │   ├── components/ # Reusable UI components
    │   ├── pages/      # Main screen views
    │   ├── hooks/      # Custom React hooks
    │   └── utils/      # Client-side helpers
    └── public/         # Static assets
```

## 🤝 Contributing
Contributions are welcome! Please fork the repository and create a pull request with your changes.

## 📄 License
This project is licensed under the ISC License.
