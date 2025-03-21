
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

function PokemonDetail() {
    const { id } = useParams();
    const [pokemon, setPokemon] = useState(null);
    const [species, setSpecies] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPokemonDetails = async () => {
            setIsLoading(true);
            try {
                // Fetch basic Pokemon data
                const pokemonResponse = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
                if (!pokemonResponse.ok) {
                    throw new Error('Pokemon not found');
                }
                const pokemonData = await pokemonResponse.json();
                setPokemon(pokemonData);

                // Fetch species data for description
                const speciesResponse = await fetch(pokemonData.species.url);
                const speciesData = await speciesResponse.json();
                setSpecies(speciesData);

                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching Pokemon details:', error);
                setError(error.message);
                setIsLoading(false);
            }
        };

        fetchPokemonDetails();
    }, [id]);

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

    if (isLoading) return <div className="loading">Loading Pokémon details...</div>;
    if (error) return <div className="error">Error: {error}</div>;
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