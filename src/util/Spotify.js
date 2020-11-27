let accessToken;
//API information - sensitive info removed
const clientID = '';
const redirectURI = 'http://localhost:3000/';

const Spotify = {
    getAccessToken() {
        if (accessToken) {
            return accessToken;
        } else if (window.location.href.match(/access_token=([^&]*)/) != null) {
            const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
            const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/);

            if (accessTokenMatch && expiresInMatch) {
                accessToken = accessTokenMatch[1];
                const expiresIn = Number(expiresInMatch[1]);
                //reset token on expiration
                window.setTimeout(() => accessToken = '', expiresIn * 1000);
                window.history.pushState('Access Token', null, '/');
                return accessToken;
            }
        } else {
            //prompt user for authorization
            window.location = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}`;
        }
    },

    search(term) {
        const accessToken = this.getAccessToken();
        try {
            //search spotify API with term
            return fetch(`https://api.spotify.com/v1/search?type=track,artist,album&q=${term}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }).then(response => {
                return response.json();
            }).then(jsonResponse => {
                if (!jsonResponse.tracks) {
                    return [];
                }
                return jsonResponse.tracks.items.map(track => ({
                    id: track.id,
                    name: track.name,
                    artist: track.artists[0].name,
                    album: track.album.name,
                    uri: track.uri
                }));
            }
            )
        } catch (error) {
            console.log(error);
        }
    },

    savePlaylist(name, trackURIs) {

        if (!name || !trackURIs.length) {
            return;
        }

        const accessToken = this.getAccessToken();
        const headers = { Authorization: `Bearer ${accessToken}, "Content-Type": 'application/json'` };
        let userID;
        let playlistID;

        //get user ID
        return fetch(`https://api.spotify.com/v1/me`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        })
            .then(response => response.json())
            .then(jsonResponse => {
                userID = jsonResponse.id;
                //post playlist name
                return fetch(`https://api.spotify.com/v1/users/${userID}/playlists`, {
                    headers: headers,
                    method: 'POST',
                    body: JSON.stringify({ name: name })
                })
            })
            .then(response => response.json())
            .then(playlist => {
                //get playlist ID & post track URIs
                playlistID = playlist.id;
                return fetch(`https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}/tracks`, {
                    headers: headers,
                    method: 'POST',
                    body: JSON.stringify({ uris: trackURIs })
                })
            });
    }
}

export default Spotify;
