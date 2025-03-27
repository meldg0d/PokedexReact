import { useParams, Link } from 'react-router-dom';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {useEffect} from "react";

function PokemonDetail() {
    const { id } = useParams();

    // Query for fetching basic Pokemon data
    const {
        data: pokemon,
        isLoading: isPokemonLoading,
        error: pokemonError
    } = useQuery({
        queryKey: ['pokemon', id],
        queryFn: async () => {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
            if (!response.ok) {
                throw new Error('Pokemon not found');
            }
            return response.json();
        },
        staleTime: 1000 * 60 * 60, // 1 hour
    });

    // Query for fetching species data (dependent on the first query)
    const {
        data: species,
        isLoading: isSpeciesLoading
    } = useQuery({
        queryKey: ['pokemonSpecies', pokemon?.species?.url],
        queryFn: async () => {
            const response = await fetch(pokemon.species.url);
            return response.json();
        },
        // Only run this query if we have the species URL from the first query
        enabled: !!pokemon?.species?.url,
        staleTime: 1000 * 60 * 60, // 1 hour
    });

    // Get English flavor text
    const getEnglishFlavorText = () => {
        if (!species) return 'No description available.';

        const englishEntry = species.flavor_text_entries.find(
            entry => entry.language.name === 'en'
        );

        return englishEntry ? englishEntry.flavor_text.replace(/\f/g, ' ') : 'No description available.';
    };

    // Get Previous and Next Pokemon IDs
    const prevPokemonId = pokemon && pokemon.id > 1 ? pokemon.id - 1 : null;
    const nextPokemonId = pokemon ? pokemon.id + 1 : null;

    // Pre-fetch adjacent Pokemon data for smoother navigation
    const queryClient = useQueryClient();

    // Use effect to prefetch adjacent Pokemon
    useEffect(() => {
        if (pokemon) {
            // Prefetch previous Pokemon if it exists
            if (prevPokemonId) {
                queryClient.prefetchQuery({
                    queryKey: ['pokemon', prevPokemonId.toString()],
                    queryFn: async () => {
                        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${prevPokemonId}`);
                        return response.json();
                    },
                });
            }

            // Prefetch next Pokemon
            if (nextPokemonId) {
                queryClient.prefetchQuery({
                    queryKey: ['pokemon', nextPokemonId.toString()],
                    queryFn: async () => {
                        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${nextPokemonId}`);
                        return response.json();
                    },
                });
            }
        }
    }, [pokemon, prevPokemonId, nextPokemonId, queryClient]);

    // Combined loading state
    const isLoading = isPokemonLoading || isSpeciesLoading;

    if (isLoading) return <div className="loading">Loading Pokémon details...</div>;
    if (pokemonError) return <div className="error">Error: {pokemonError.message}</div>;
    if (!pokemon) return <div className="error">Pokémon not found</div>;

    return (
        <div className="pokemon-detail-page">
            <div className="navigation-buttons">
                {prevPokemonId && (
                    <Link to={`/pokemon/${prevPokemonId}`} className="nav-button">
                        &lt; #{prevPokemonId.toString().padStart(3, '0')}
                    </Link>
                )}
                <Link to="/" className="nav-button">Back to List</Link>
                {nextPokemonId && (
                    <Link to={`/pokemon/${nextPokemonId}`} className="nav-button">
                        #{nextPokemonId.toString().padStart(3, '0')} &gt;
                    </Link>
                )}
            </div>

            <div className="pokemon-detail-card">
                <div className="pokemon-header">
                    <h1>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h1>
                    <p className="pokemon-number">#{pokemon.id.toString().padStart(3, '0')}</p>
                </div>

                <div className="pokemon-detail-content">
                    <div className="pokemon-image-container">
                        <img
                            src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default}
                            alt={pokemon.name}
                            className="pokemon-detail-image"
                        />
                        <div className="pokemon-types detail-types">
                            {pokemon.types.map(type => (
                                <span
                                    key={type.type.name}
                                    className={`type-badge-large ${type.type.name}`}
                                >
                                    {type.type.name}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="pokemon-info-container">
                        <div className="pokemon-description">
                            <h2>Description</h2>
                            <p>{getEnglishFlavorText()}</p>
                        </div>

                        <div className="pokemon-stats">
                            <h2>Base Stats</h2>
                            {pokemon.stats.map(stat => (
                                <div key={stat.stat.name} className="stat-bar">
                                    <div className="stat-name">
                                        {stat.stat.name.replace('-', ' ')}:
                                    </div>
                                    <div className="stat-value">{stat.base_stat}</div>
                                    <div className="stat-bar-container">
                                        <div
                                            className="stat-bar-fill"
                                            style={{ width: `${Math.min(100, (stat.base_stat / 255) * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pokemon-details">
                            <div className="detail-column">
                                <h2>Details</h2>
                                <p><strong>Height:</strong> {pokemon.height / 10} m</p>
                                <p><strong>Weight:</strong> {pokemon.weight / 10} kg</p>
                                <p><strong>Base Experience:</strong> {pokemon.base_experience}</p>
                            </div>

                            <div className="detail-column">
                                <h2>Abilities</h2>
                                <ul className="abilities-list">
                                    {pokemon.abilities.map(ability => (
                                        <li key={ability.ability.name}>
                                            {ability.ability.name.replace('-', ' ')}
                                            {ability.is_hidden && <span className="hidden-ability"> (Hidden)</span>}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PokemonDetail;