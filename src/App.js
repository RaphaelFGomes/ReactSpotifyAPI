import React, { Component } from 'react';
import './App.css';
import PlaylistCounter from './components/PlaylistCounter';
import TotalHours from './components/TotalHours';
import Filter from './components/Filter';
import Playlist from './components/Playlist';
import axios from 'axios';
import {urlMe, urlFeaturedPlaylists, userErrorMessage,
  urlLocalhost, tokenLocalStorage, urlAuthorize} from './constants';
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

  componentWillUnmount() {
    clearInterval(this.state.intervalId);
  }

  callSpotifyPlaylistService = (filtersTemp) => {
    if (!filtersTemp) {
      filtersTemp = this.state.filters;
    }

    let urlFilter = urlFeaturedPlaylists;
    let hasAtLeastOne = false;

    if (filtersTemp.country) {
      let ctry = "";
      if (filtersTemp.country === "en_US") {
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

    let accessToken = localStorage.getItem(tokenLocalStorage);
    if (accessToken) {
      axios.get(urlFilter, {
        headers: { 'Authorization': 'Bearer ' + accessToken }
      }).then(response => {
          if (response.data.playlists) {
            let playlists = response.data.playlists.items;
            let trackDataPromises = playlists.map(playlist => {
              let responsePromise = fetch(playlist.tracks.href, {
                headers: { 'Authorization': 'Bearer ' + accessToken }
              })
              let trackDataPromise = responsePromise.then(response => response.json());
              return trackDataPromise;
            })
            let allTracksDatasPromises =
              Promise.all(trackDataPromises)
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
        .catch(error => {
          this.setState({
            playlists: []
          });
      });
     }
  }

  refreshPage = () => {
    const intervalId = setInterval(this.callSpotifyPlaylistService, 30000);
    this.setState({
      intervalId,
    });
  }

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

  componentDidMount() {
    const url = window.location.hash;
    if (url) {
      const access_token = url.match(/\#(?:access_token)\=([\S\s]*?)\&/)[1];
      localStorage.setItem(tokenLocalStorage, access_token);
      window.location.href = '/';
    }

    let accessToken = localStorage.getItem(tokenLocalStorage);
    if (!accessToken) {
      return;
    }

    axios.get(urlMe, {
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
        alert(userErrorMessage);
    });

    axios.get(urlFeaturedPlaylists, {
      headers: { 'Authorization': 'Bearer ' + accessToken }
    }).then(response => {
        let playlists = response.data.playlists.items;
        let trackDataPromises = playlists.map(playlist => {
          let responsePromise = fetch(playlist.tracks.href, {
            headers: { 'Authorization': 'Bearer ' + accessToken }
          })
          let trackDataPromise = responsePromise.then(response => response.json());
          return trackDataPromise;
        })
        let allTracksDatasPromises =
          Promise.all(trackDataPromises)
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
      .catch(error => {
        this.setState({
          playlists: []
        });
      });
      this.refreshPage();
  }

  render() {
    let playlistToShow = this.state.user && this.state.playlists ?
      this.state.playlists.filter(playlist => {
        let matchesPlaylist = playlist.name.toLowerCase().includes(
          this.state.filterString.toLocaleLowerCase())
        return matchesPlaylist
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

  openSpotifyLogin() {
    let url = urlAuthorize;
        url += '?client_id=' + encodeURIComponent(process.env.REACT_APP_SPOTIFY_CLIENT_ID);
        url += '&response_type=token';
        url += '&redirect_uri=' + encodeURIComponent(urlLocalhost);
    window.location = url;
  }

}

export default App;