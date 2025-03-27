# PokéExplorer

A React-based web application for exploring the world of Pokémon using the PokéAPI.

![PokéExplorer Demo](https://i.imgur.com/aeHIqyn.png)

## 🔴 Live Demo

Check out the live demo: [PokéExplorer App](https://github.meldgod.dk/PokedexReact/)

## ✨ Features

- **Browse Pokémon**: View Pokémon in a responsive grid layout with pagination
- **Search Functionality**: Search for Pokémon by name or ID with partial matching support
- **Detailed Information**: View comprehensive details about each Pokémon
- **Performance Optimized**: Implements caching for fast experience

## 🚀 Technical Features

- React.js for building the user interface
- React Router for navigation between views
- Fetch API for retrieving data from PokéAPI
- React Query for caching Pokémon data

## 🛠️ Installation and Setup

### Prerequisites
- Node.js (v14.0.0 or higher)
- npm or yarn

### Steps to Run Locally

1. Clone the repository
```bash
git clone https://github.com/meldg0d/PokedexReact.git
cd PokedexReact
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm start
# or
yarn start
```

4. Open your browser and navigate to `http://localhost:3000`

## 📁 Project Structure

```
src/
├── components/           # Reusable components
│   ├── Header.jsx        # App header with navigation
│   ├── Footer.jsx        # App footer
│   └── Navigation.jsx    # Navigation menu
├── pages/                # Page components
│   ├── Home.jsx          # Home page with Pokemon list and search
│   ├── PokemonDetail.jsx # Detailed view for a single Pokemon
│   ├── About.jsx         # About page
│   └── NotFound.jsx      # 404 page
├── App.jsx               # Main app component with routing
├── index.js              # Entry point
└── styles.css            # Global styles
```

## 📱 App Pages

### Home Page
- Displays a grid of Pokémon cards
- Includes a search bar for finding Pokémon
- Pagination controls for browsing through all Pokémon

### Pokémon Detail Page
- Shows comprehensive information about a selected Pokémon
- Displays stats, abilities, and physical characteristics
- Provides navigation to previous/next Pokémon

### About Page
- Information about the application and its features

## 🔍 Search Features

- Direct search by exact name or ID
- Partial name matching (e.g., searching "pika" finds "Pikachu")
- Intelligent caching for faster repeat searches

## 🔄 Caching System

- Stores the complete Pokémon list in localStorage
- Caches visited pages for instant navigation
- Prefetches adjacent pages for smoother browsing


## 🔮 Future Enhancements

- Filter Pokémon by type
- Compare Pokémon feature
- Dark/Light theme toggle

## 📊 API Usage

This project uses the [PokéAPI](https://pokeapi.co/) - a RESTful API for Pokémon data. The API is free to use with reasonable usage limits.

