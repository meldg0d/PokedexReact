import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Home() {
    const [pokemonList, setPokemonList] = useState([]);
    const [detailedPokemon, setDetailedPokemon] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const pokemonPerPage = 12;

    // State for storing all Pokemon
    const [allPokemonList, setAllPokemonList] = useState([]);
    const [isAllPokemonLoaded, setIsAllPokemonLoaded] = useState(false);

    // Fetch initial pokemon list with pagination
    useEffect(() => {
        const fetchPokemonList = async () => {
            if (searchTerm) return; // Skip if search is active

            setIsLoading(true);
            try {
                const offset = (currentPage - 1) * pokemonPerPage;
                const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${pokemonPerPage}&offset=${offset}`);
                const data = await response.json();

                setPokemonList(data.results);
                setTotalPages(Math.ceil(data.count / pokemonPerPage));

                // Fetch detailed info for each Pokemon
                const detailedData = await Promise.all(
                    data.results.map(async (pokemon) => {
                        const pokemonResponse = await fetch(pokemon.url);
                        return pokemonResponse.json();
                    })
                );

                setDetailedPokemon(detailedData);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching Pokemon:', error);
                setIsLoading(false);
            }
        };

        fetchPokemonList();
    }, [currentPage, searchTerm]);

    // Fetch and store the complete Pokemon list
    useEffect(() => {
        const loadAllPokemon = async () => {
            // Check if we already have the data in localStorage
            const cachedPokemonList = localStorage.getItem('allPokemonList');
            const cachedTimestamp = localStorage.getItem('pokemonListTimestamp');

            // Use cached data if it exists and is less than 24 hours old
            if (cachedPokemonList && cachedTimestamp) {
                const cacheAge = Date.now() - parseInt(cachedTimestamp);
                const oneDayInMs = 24 * 60 * 60 * 1000;

                if (cacheAge < oneDayInMs) {
                    console.log('Loading Pokemon list from cache');
                    setAllPokemonList(JSON.parse(cachedPokemonList));
                    setIsAllPokemonLoaded(true);
                    return;
                }
            }

            // Otherwise fetch the full list
            try {
                console.log('Fetching complete Pokemon list in background');
                const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=2000');
                const data = await response.json();

                setAllPokemonList(data.results);
                setIsAllPokemonLoaded(true);

                // Store in localStorage with timestamp
                localStorage.setItem('allPokemonList', JSON.stringify(data.results));
                localStorage.setItem('pokemonListTimestamp', Date.now().toString());

                console.log('Complete Pokemon list cached');
            } catch (error) {
                console.error('Error fetching complete Pokemon list:', error);
            }
        };

        // Don't load if already loaded
        if (!isAllPokemonLoaded && !searchTerm) {
            loadAllPokemon();
        }
    }, [isAllPokemonLoaded, searchTerm]);

    // Handle search with partial matching using cached data
    const handleSearch = async (e) => {
        e.preventDefault();

        if (!searchTerm.trim()) {
            clearSearch();
            return;
        }

        setIsLoading(true);
        try {
            // First try direct search by name or ID (for exact matches or ID search)
            if (/^\d+$/.test(searchTerm) || searchTerm.length > 3) {
                try {
                    const directResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${searchTerm.toLowerCase()}`);
                    if (directResponse.ok) {
                        const data = await directResponse.json();
                        setDetailedPokemon([data]);
                        setPokemonList([{ name: data.name, url: `https://pokeapi.co/api/v2/pokemon/${data.id}/` }]);
                        setTotalPages(1);
                        setIsLoading(false);
                        return;
                    }
                    // eslint-disable-next-line no-unused-vars
                } catch (directError) {
                    // Direct search failed, continue to partial search
                }
            }

            // If we have the cached list, use it for searching
            if (isAllPokemonLoaded && allPokemonList.length > 0) {
                console.log('Searching in cached Pokemon list');

                // Filter for partial matches
                const searchTermLower = searchTerm.toLowerCase();
                const filteredResults = allPokemonList.filter(pokemon =>
                    pokemon.name.includes(searchTermLower)
                );

                if (filteredResults.length > 0) {
                    // Limit results to first 20 matches
                    const limitedResults = filteredResults.slice(0, 20);
                    setPokemonList(limitedResults);

                    // Fetch detailed data for each filtered Pokemon
                    const detailedData = await Promise.all(
                        limitedResults.map(async (pokemon) => {
                            const pokemonResponse = await fetch(pokemon.url);
                            return pokemonResponse.json();
                        })
                    );

                    setDetailedPokemon(detailedData);
                    setTotalPages(Math.ceil(filteredResults.length / pokemonPerPage));
                } else {
                    alert('No Pokémon found matching your search!');
                }
            } else {
                // Fall back to fetching if cache is not available
                console.log('Cache not available, fetching from API');
                const listResponse = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=1000`);
                const listData = await listResponse.json();

                // Filter for partial matches
                const searchTermLower = searchTerm.toLowerCase();
                const filteredResults = listData.results.filter(pokemon =>
                    pokemon.name.includes(searchTermLower)
                );

                if (filteredResults.length > 0) {
                    // Limit results to first 20 matches
                    const limitedResults = filteredResults.slice(0, 20);
                    setPokemonList(limitedResults);

                    // Fetch detailed data for each filtered Pokemon
                    const detailedData = await Promise.all(
                        limitedResults.map(async (pokemon) => {
                            const pokemonResponse = await fetch(pokemon.url);
                            return pokemonResponse.json();
                        })
                    );

                    setDetailedPokemon(detailedData);
                    setTotalPages(Math.ceil(filteredResults.length / pokemonPerPage));
                } else {
                    alert('No Pokémon found matching your search!');
                }
            }
        } catch (error) {
            console.error('Error searching Pokemon:', error);
        }
        setIsLoading(false);
    };

    // Clear search
    const clearSearch = () => {
        setSearchTerm('');
        setCurrentPage(1);

        // Fetch the initial page of Pokemon again
        const fetchInitialPokemon = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${pokemonPerPage}&offset=0`);
                const data = await response.json();

                setPokemonList(data.results);
                setTotalPages(Math.ceil(data.count / pokemonPerPage));

                // Fetch detailed info for each Pokemon
                const detailedData = await Promise.all(
                    data.results.map(async (pokemon) => {
                        const pokemonResponse = await fetch(pokemon.url);
                        return pokemonResponse.json();
                    })
                );

                setDetailedPokemon(detailedData);
            } catch (error) {
                console.error('Error fetching Pokemon:', error);
            }
            setIsLoading(false);
        };

        fetchInitialPokemon();
    };

    // Navigation
    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const goToPrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const goToPage = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    // Generate pagination numbers
    const generatePaginationNumbers = () => {
        const pageNumbers = [];
        const maxPageButtons = 5;

        let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
        let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

        if (endPage - startPage + 1 < maxPageButtons) {
            startPage = Math.max(1, endPage - maxPageButtons + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i);
        }

        return pageNumbers;
    };

    return (
        <div className="pokemon-home">
            <h1>Pokémon Explorer</h1>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="search-form">
                <input
                    type="text"
                    placeholder="Search Pokémon by name or ID"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <button type="submit" className="search-button">Search</button>
                {searchTerm && (
                    <button type="button" onClick={clearSearch} className="clear-button">
                        Clear Search
                    </button>
                )}
            </form>

            {/* Loading indicator */}
            {isLoading ? (
                <div className="loading">Loading Pokémon...</div>
            ) : (
                <>
                    {/* Pokemon Grid */}
                    <div className="pokemon-grid">
                        {detailedPokemon.map((pokemon) => (
                            <Link
                                to={`/pokemon/${pokemon.id}`}
                                className="pokemon-card"
                                key={pokemon.id}
                            >
                                <img
                                    src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}
                                    alt={pokemon.name}
                                    className="pokemon-image"
                                />
                                <div className="pokemon-info">
                                    <h3>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>
                                    <p>#{pokemon.id.toString().padStart(3, '0')}</p>
                                    <div className="pokemon-types">
                                        {pokemon.types.map(type => (
                                            <span
                                                key={type.type.name}
                                                className={`type-badge ${type.type.name}`}
                                            >
                        {type.type.name}
                      </span>
                                        ))}
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Pagination */}
                    {!searchTerm && totalPages > 1 && (
                        <div className="pagination">
                            <button
                                onClick={goToPrevPage}
                                disabled={currentPage === 1}
                                className="page-button"
                            >
                                Prev
                            </button>

                            {generatePaginationNumbers().map(number => (
                                <button
                                    key={number}
                                    onClick={() => goToPage(number)}
                                    className={`page-number ${currentPage === number ? 'active' : ''}`}
                                >
                                    {number}
                                </button>
                            ))}

                            <button
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                                className="page-button"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default Home;