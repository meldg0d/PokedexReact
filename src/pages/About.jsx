import App from "../App.jsx";

function About() {
    return (
        <div className="page about-page">
            <h1>About Us</h1>
            <p>
                This is a simple Pokédex application built with React. It uses the{' '}
                <a
                    href="https://pokeapi.co/"
                    target="_blank"
                    rel="noreferrer"
                >
                    PokéAPI
                </a>{' '}
                to fetch Pokémon data.
            </p>
        </div>
    );
}

 export default About;