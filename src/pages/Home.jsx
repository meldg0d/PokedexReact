import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    useQuery,
    useQueryClient
} from '@tanstack/react-query';

function Home() {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const pokemonPerPage = 12;
    const queryClient = useQueryClient();

    // Function to fetch a page of Pokemon
    const fetchPokemonPage = async ({ pageParam = 0 }) => {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${pokemonPerPage}&offset=${pageParam}`);
        const data = await response.json();

        // Pre-fetch the next page
        if (data.next) {
            const nextOffset = (pageParam / pokemonPerPage + 1) * pokemonPerPage;
            queryClient.prefetchQuery({
                queryKey: ['pokemonList', nextOffset],
                queryFn: () => fetchPokemonPage({ pageParam: nextOffset })
            });
        }

        return data;
    };

    // Function to fetch detailed Pokemon info
    const fetchPokemonDetails = async (urls) => {
        return Promise.all(
            urls.map(async (url) => {
                const response = await fetch(url);
                return response.json();
            })
        );
    };

    // Query for paginated Pokemon list
    const {
        data: paginatedData,
        isLoading: isPaginatedLoading,
        isFetching: isPaginatedFetching
    } = useQuery({
        queryKey: ['pokemonList', (currentPage - 1) * pokemonPerPage],
        queryFn: () => fetchPokemonPage({ pageParam: (currentPage - 1) * pokemonPerPage }),
        enabled: !searchTerm,
        keepPreviousData: true,
        staleTime: 1000 * 60 * 60, // 1 hour
    });

    // Query for complete Pokemon list (used for search)
    const {
        data: completeListData,
    } = useQuery({
        queryKey: ['allPokemon'],
        queryFn: async () => {
            const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=2000');
            const data = await response.json();
            return data.results;
        },
        // Keep this data fresh for a whole day
        staleTime: 1000 * 60 * 60 * 24, // 24 hours
    });

    // Query for pokemon details based on paginated results
    const {
        data: detailedPokemon = [],
        isLoading: isDetailedLoading
    } = useQuery({
        queryKey: ['detailedPokemon', paginatedData?.results?.map(p => p.url)],
        queryFn: () => fetchPokemonDetails(paginatedData.results.map(p => p.url)),
        enabled: !!paginatedData && !searchTerm,
        staleTime: 1000 * 60 * 60, // 1 hour
    });

    // Query for search results
    const {
        data: searchResults = [],
        isLoading: isSearchLoading,
        refetch: refetchSearch,
    } = useQuery({
        queryKey: ['pokemonSearch', searchTerm],
        queryFn: async () => {
            // Direct search by exact name or ID
            if (/^\d+$/.test(searchTerm) || searchTerm.length > 3) {
                try {
                    const directResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${searchTerm.toLowerCase()}`);
                    if (directResponse.ok) {
                        const data = await directResponse.json();
                        return [data];
                    }
                    // eslint-disable-next-line no-unused-vars
                } catch (directError) {
                    // Continue to partial search
                }
            }

            // If we have the complete list, search it
            if (completeListData?.length > 0) {
                const searchTermLower = searchTerm.toLowerCase();
                const filteredResults = completeListData.filter(pokemon =>
                    pokemon.name.includes(searchTermLower)
                );

                if (filteredResults.length > 0) {
                    // Limit results to first 20 matches
                    const limitedResults = filteredResults.slice(0, 20);
                    const detailedData = await fetchPokemonDetails(limitedResults.map(p => p.url));
                    return detailedData;
                }
            }
            return [];
        },
        enabled: !!searchTerm && searchTerm.length > 0 && !!completeListData,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Handle search submission
    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) {
            clearSearch();
            return;
        }
        await refetchSearch();
    };

    // Clear search
    const clearSearch = () => {
        setSearchTerm('');
        setCurrentPage(1);
    };

    // Navigation
    const goToNextPage = () => {
        if (currentPage < (paginatedData?.count / pokemonPerPage)) {
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
        if (!paginatedData) return [];

        const totalPages = Math.ceil(paginatedData.count / pokemonPerPage);
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

    // Determine if we're loading
    const isLoading = isPaginatedLoading || isDetailedLoading || isSearchLoading || isPaginatedFetching;

    // Determine what Pokemon data to display
    const displayPokemon = searchTerm ? searchResults : detailedPokemon;

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
                        {displayPokemon.map((pokemon) => (
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
                    {!searchTerm && paginatedData && (
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
                                disabled={currentPage === Math.ceil(paginatedData.count / pokemonPerPage)}
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