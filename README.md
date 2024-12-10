# Listify - Task Management Made Simple 📝

A modern task management app built with Expo and React Native, featuring a clean interface and SQLite local storage.

## Features

- ✨ Create and manage tasks with ease
- 📱 Beautiful, native UI for iOS and Android
- 🌓 Dark and light theme support
- 💾 Local data persistence with SQLite
- 🎯 Category-based task organization
- 📅 Optional deadline setting

## Getting Started

### Prerequisites

- Node.js (v16 or newer)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/listify.git
   cd listify
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

### Running on Device/Simulator

- iOS: Press `i` in the terminal or run `npm run ios`
- Android: Press `a` in the terminal or run `npm run android`
- Web: Press `w` in the terminal or run `npm run web`

## Project Structure

```
listify/
├── app/                    # Main application screens
│   ├── (tabs)/            # Tab-based navigation
│   ├── add-task.tsx       # Add task screen
│   └── create-task.tsx    # Task creation form
├── components/            # Reusable UI components
├── services/             # Business logic and database
├── constants/            # App constants and themes
└── types/                # TypeScript type definitions
```

## Database Schema

The app uses SQLite for local storage with the following schema:

```sql
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  deadline TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Expo](https://expo.dev)
- UI components from [React Native Paper](https://callstack.github.io/react-native-paper/)
- Database powered by [Expo SQLite](https://docs.expo.dev/versions/latest/sdk/sqlite/)
