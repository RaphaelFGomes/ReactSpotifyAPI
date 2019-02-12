import React, { Component } from 'react';
import './App.css';
import PlaylistCounter from './components/playlist-counter/playlist-counter';
import TotalHours from './components/total-hours/total-hours';
import Filter from './components/filter/filter';
import Playlist from './components/playlist/playlist';
import axios from 'axios';
import { URL_ME, URL_FEATURED_PLAYLIST, USER_ERROR_MESSAGE, URL_HEROKU,
  TOKEN_LOCAL_STORAGE, URL_AUTHORIZE, INTERVAL } from './constants';
import logo from './images/SpotifoodIcon.jpg';

class App extends Component {
  localeTemp = '';
  countryTemp = '';
  datetimeTemp = '';
  limitTemp = '';
  offsetTemp = '';

  constructor() {
    super();
    this.state = {
      filterString: '',
      intervalId: null,
      filters: {
        locale: '',
        country: '',
        datetime: '',
        limit: '',
        offset: ''
      }
    }
  }

  // Unmount cycle life
  componentWillUnmount() {
    clearInterval(this.state.intervalId);
  }

  // Method to call Spotify API with filter applied
  callSpotifyPlaylistService = (filtersTemp) => {
    if (!filtersTemp) { // This check is for refresh page
      filtersTemp = this.state.filters;
    }

    const urlFilterFinal = this.buildFilterUrl(filtersTemp);

    let accessToken = localStorage.getItem(TOKEN_LOCAL_STORAGE); // Get the token from local storage
    if (accessToken) {
      console.log("here1", urlFilterFinal);
      axios.get(urlFilterFinal, { // Call the Spotify API with filter applied
        headers: { 'Authorization': 'Bearer ' + accessToken }
      }).then(response => {
        console.log("here2", response);
          if (response.data.playlists) {
            console.log("here3", response.data.playlists);
            let playlists = response.data.playlists.items;
            let trackDataPromises = playlists.map(playlist => {
              let responsePromise = axios.get(playlist.tracks.href, {
                headers: { 'Authorization': 'Bearer ' + accessToken }
              })
              let trackDataPromise = responsePromise.then(response => response.json());
              return trackDataPromise;
            })
            let allTracksDatasPromises =
                Promise.all(trackDataPromises) // The method to run many promises in parallel, wait still all of them are ready and they shoulb be in the same order that came in the playlist array.
            let playlistsPromise = allTracksDatasPromises.then(trackDatas => {
              trackDatas.forEach((trackData, i) => {
                playlists[i].trackDatas = trackData.items
                  .map(item => item.track)
                  .map(trackData => ({
                    name: trackData ? trackData.name : '',
                    duration: trackData ? trackData.duration_ms / 1000 : ''
                  }))
              })
              return playlists;
            })
            return playlistsPromise;
          } else {
            return [];
          }
        }).then(playlists => {
          if (playlists) {
            this.setState({
              playlists: playlists.map(item => {
                return {
                  name: item.name,
                  imageUrl: item.images[0].url,
                  songs: item.trackDatas.slice(0, 3)
                }
              })
            })
          } else {
            return [];
          }
        })
      //   .catch(error => {
      //     this.setState({
      //       playlists: []
      //     });
      // });
     }
  }

   // Method to build the filter url for spotify api
  buildFilterUrl(filtersTemp) {
    let urlFilter = URL_FEATURED_PLAYLIST;
    let hasAtLeastOne = false;

    if (filtersTemp.country) {
      let ctry = "";
      if (filtersTemp.country === "en_US") { // This is a bug in mocky API
        ctry = "US";
      } else {
        ctry = filtersTemp.country;
      }
      urlFilter = urlFilter + "?country=" + ctry;
      hasAtLeastOne = true;
    }

    if (filtersTemp.locale) {
      if (hasAtLeastOne) {
        urlFilter = urlFilter + "&locale=" + filtersTemp.locale;
      } else {
        urlFilter = urlFilter + "?locale=" + filtersTemp.locale;
      }
      hasAtLeastOne = true;
    }

    if (filtersTemp.datetime) {
      let pattern = ":";
      const properlyTimestamp = filtersTemp.datetime.replace(pattern, "%3A");
      if (hasAtLeastOne) {
        urlFilter = urlFilter + "&timestamp=" + properlyTimestamp + "%3A00";
      } else {
        urlFilter = urlFilter + "?timestamp=" + properlyTimestamp + "%3A00";
      }
      hasAtLeastOne = true;
    }

    if (filtersTemp.limit && parseInt(filtersTemp.limit, 10) >= 1 && parseInt(filtersTemp.limit, 10) <= 50) {
      if (hasAtLeastOne) {
        urlFilter = urlFilter + "&limit=" + filtersTemp.limit;
      } else {
        urlFilter = urlFilter + "?limit=" + filtersTemp.limit;
      }
      hasAtLeastOne = true;
    }

    if (filtersTemp.offset && parseInt(filtersTemp.offset, 10) >= 1) {
      if (hasAtLeastOne) {
        urlFilter = urlFilter + "&offset=" + filtersTemp.offset;
      } else {
        urlFilter = urlFilter + "?offset=" + filtersTemp.offset;
      }
    }
    return urlFilter;
  }

  // Method to refresh page after 30 seconds
  refreshPage = () => {
    const intervalId = setInterval(this.callSpotifyPlaylistService, INTERVAL);
    this.setState({
      intervalId,
    });
  }

  // Method called when the user change some information on filter
  filterList = (event) => {
    const field = {
      [event.target.name]: event.target.value,
    };

    if (field.locale) {
      this.localeTemp = field.locale;
    } else if (field.country) {
      this.countryTemp = field.country;
    } else if (field.datetime || field.datetime === "") {
      this.datetimeTemp = field.datetime;
    } else if (field.limit) {
      if (parseInt(field.limit, 10) < 1 || parseInt(field.limit, 10) > 50) {
        this.limitTemp = "";
      } else {
        this.limitTemp = field.limit;
      }
    } else {
      if (parseInt(field.offset, 10) < 1) {
        this.offsetTemp = "";
      } else {
        this.offsetTemp = field.offset;
      }
    }

    this.setState({
      filters: {
        locale: this.localeTemp ? this.localeTemp : '',
        country: this.countryTemp ? this.countryTemp : '',
        datetime: this.datetimeTemp ? this.datetimeTemp : '',
        limit: this.limitTemp ? this.limitTemp : '',
        offset: this.offsetTemp ? this.offsetTemp : ''
      }
    });

    const filtersTemp = {
      locale: this.localeTemp ? this.localeTemp : '',
      country: this.countryTemp ? this.countryTemp : '',
      datetime: this.datetimeTemp ? this.datetimeTemp : '',
      limit: this.limitTemp ? this.limitTemp : '',
      offset: this.offsetTemp ? this.offsetTemp : ''
    };

    this.callSpotifyPlaylistService(filtersTemp);
  }

  // Method to call Spotify Login in case the user is not logged already
  openSpotifyLogin() {
      let url = URL_AUTHORIZE;
          url += '?client_id=' + encodeURIComponent(process.env.REACT_APP_SPOTIFY_CLIENT_ID);
          url += '&response_type=token';
          url += '&redirect_uri=' + encodeURIComponent(URL_HEROKU);
      window.location = url;
    }

  // Method called before Render the page
  componentDidMount() {
    const url = window.location.hash;
    if (url) { // Check if the access token is on url
      const access_token = url.match(/\#(?:access_token)\=([\S\s]*?)\&/)[1]; // Get only the access token from url
      localStorage.setItem(TOKEN_LOCAL_STORAGE, access_token); // Save the token on local storage
      window.location.href = '/'; // Clean the URL to not be exposed to user (access token)
    }

    let accessToken = localStorage.getItem(TOKEN_LOCAL_STORAGE); // Check if already have a token into local storage
    if (!accessToken) {
      return;
    }

    // Call this API to get user name information
    axios.get(URL_ME, {
      headers: { 'Authorization': 'Bearer ' + accessToken }
    })
    .then(response =>
        this.setState({
        user: {
          name: response.data.display_name
          }
        })
    )
    .catch(error => {
        // alert(USER_ERROR_MESSAGE);
    });

    // Get all Feature Playlists without filter
    axios.get(URL_FEATURED_PLAYLIST, {
      headers: { 'Authorization': 'Bearer ' + accessToken }
    }).then(response => {
      console.log("here4", response);
        let playlists = response.data.playlists.items;
        let trackDataPromises = playlists.map(playlist => {
          console.log("here5", playlist);
          let responsePromise = axios.get(playlist.tracks.href, {
            headers: { 'Authorization': 'Bearer ' + accessToken }
          })
          let trackDataPromise = responsePromise.then(response => response.json());
          return trackDataPromise;
        })
        let allTracksDatasPromises =
          Promise.all(trackDataPromises) // The method to run many promises in parallel and wait till all of them are ready.
        let playlistsPromise = allTracksDatasPromises.then(trackDatas => {
          trackDatas.forEach((trackData, i) => {
            playlists[i].trackDatas = trackData.items
              .map(item => item.track)
              .map(trackData => ({
                name: trackData ? trackData.name : '',
                duration: trackData ? trackData.duration_ms / 1000 : ''
              }))
          })
          return playlists;
        })
        return playlistsPromise;
      })
      .then(playlists => this.setState({
        playlists: playlists.map(item => {
          return {
            name: item.name,
            imageUrl: item.images[0].url,
            songs: item.trackDatas.slice(0, 3)
          }
        })
      }))
      // .catch(error => {
      //   this.setState({
      //     playlists: []
      //   });
      // });
      this.refreshPage();
  }

  // Method to render the page
  render() {
    // If there is no user and playlist, return empty array
    let playlistToShow = this.state.user && this.state.playlists ?
      this.state.playlists.filter(playlist => {
        // Here I apply the filter for Playlist name
        let matchesPlaylist = playlist.name.toLowerCase().
        includes(this.state.filterString.toLocaleLowerCase());
        return matchesPlaylist;
      }) : []

    return (
      <div className="App">
        {
          this.state.user ?
            <div>
              <img src={logo} alt="Spotifood"></img>
              <h2>User logged in: <span style={{color: 'green', fontWeight: 'bold'}}>{this.state.user.name}</span></h2>
              <PlaylistCounter playlists={playlistToShow} />
              <TotalHours playlists={playlistToShow} />
              <Filter onTextChange={text => this.setState({ filterString: text })}
                onChangeFilters={this.filterList}
                filterValues={this.state.filters} />
              {
                playlistToShow.length > 0 ?
                  playlistToShow.map((playlist, i) => <Playlist key={i} playlist={playlist} index={i} />)
                  : <div style={{ color: 'red', fontWeight: 'bold', marginTop: '50px' }}>No Playlist</div>
              }
            </div> : <button onClick={() => {
                this.openSpotifyLogin();
            }
            }
              style={{ padding: '', fontSize: '50px', marginTop: '20px' }}>Sign in with Spotify</button>
        }
      </div>
    );
  }

}

export default App;