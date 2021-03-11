﻿import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import RadioCard from "./RadioCard.jsx"
import PropTypes from "prop-types";

const Radios = (props) => {
    const playlists = props.playlists;
    const radioItems = playlists.map((radio) =>
        <div className="col-12 col-xl-6 mb-2" title={radio.Title} aria-label={radio.Title} id={radio.AnchorId} key={radio.Title}>
            <RadioCard radio={radio}  />
        </div>
    );
    

    return (
        <div className="row">
            {radioItems}
        </div>
    );
};
Radios.propTypes = {
    playlists: PropTypes.array
};

/*TODO get this to work as a promise too*/
const App = (props) => {
    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [playlists, setplaylists] = useState([]);

    useEffect(() => {
        /*global radioURL*/
        /*eslint no-undef: "error"*/
        fetch(radioURL)
            .then(res => res.json())
            .then(
                (result) => {
                    setIsLoaded(true);
                    setplaylists(result);
                    console.log(playlists);
                },
                (error) => {
                    setIsLoaded(true);
                    setError(error);
                }
            )
    }, [])

    if (error) {
        return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
        return <div>Loading...</div>;
    } else {
        return <Radios playlists={playlists} />;
    }
}

/*global spotifyData*/
/*eslint no-undef: "error"*/
ReactDOM.render(<App />, document.getElementById("radio-content"));
