import React, { Component } from 'react';
import './App.css';
import queryString from 'query-string';
import PlaylistCounter from './components/PlaylistCounter';
import TotalHours from './components/TotalHours';
import Filter from './components/Filter';
import Playlist from './components/Playlist';

let appDefaultStyle = {
  color: '#000',
  fontFamily: 'Papyrus'
};

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

    let urlFilter = "https://api.spotify.com/v1/browse/featured-playlists";
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

    const stringParsed = queryString.parse(window.location.search);
    let accessToken = stringParsed.access_token;
    if (accessToken) {
      fetch(urlFilter, {
        headers: { 'Authorization': 'Bearer ' + accessToken }
      }).then(response => response.json())
        .then(playlistData => {
          if (playlistData.playlists) {
            let playlists = playlistData.playlists.items;
            let trackDataPromises = playlists.map(playlist => {
              let responsePromise = fetch(playlist.tracks.href, {
                headers: { 'Authorization': 'Bearer ' + accessToken }
              })
              let trackDataPromise = responsePromise
                .then(response => response.json())
              return trackDataPromise
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
              return playlists
            })
            return playlistsPromise
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
            return []
          }
        })
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
    const stringParsed = queryString.parse(window.location.search);
    let accessToken = stringParsed.access_token;
    if (!accessToken) {
      return;
    }

    fetch('https://api.spotify.com/v1/me', {
      headers: { 'Authorization': 'Bearer ' + accessToken }
    }).then(response => response.json())
      .then(data => this.setState({
        user: {
          name: data.display_name
        }
      }))

    fetch('https://api.spotify.com/v1/browse/featured-playlists', {
      headers: { 'Authorization': 'Bearer ' + accessToken }
    }).then(response => response.json())
      .then(playlistData => {
        let playlists = playlistData.playlists.items;
        let trackDataPromises = playlists.map(playlist => {
          let responsePromise = fetch(playlist.tracks.href, {
            headers: { 'Authorization': 'Bearer ' + accessToken }
          })
          let trackDataPromise = responsePromise
            .then(response => response.json())
          return trackDataPromise
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
          return playlists
        })
        return playlistsPromise
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
              <h1 style={{
                ...appDefaultStyle,
                fontSize: '54px',
                marginTop: '5px'
              }}>Spotifood</h1>
              <h2>User logged in: {this.state.user.name}</h2>
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
              window.location = window.location.href.includes('localhost') ? 'http://localhost:8888/login'
                : 'https://spotifood-backend.herokuapp.com/login'
            }
            }
              style={{ padding: '', fontSize: '50px', marginTop: '20px' }}>Sign in with Spotify</button>
        }
      </div>
    );
  }
}

export default App;