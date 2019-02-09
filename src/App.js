import React, { Component } from 'react';
import './App.css';
import queryString from 'query-string';
import TextField from '@material-ui/core/TextField';
import RenderField from './RenderField';

let defaultStyle = {
  color: '#000',
  fontFamily: 'Papyrus'
};

let counterStyle = {
  ...defaultStyle,
  width: "40%",
  display: 'inline-block',
  marginBottom: '20px',
  fontSize: '20px',
  lineHeight: '30px'
};

class PlaylistCounter extends Component {
  render() {
    let playlistCounterStyle = counterStyle;

    return (
      <div style={playlistCounterStyle}>
        <h2>Number of playlists: {this.props.playlists.length}</h2>
      </div>
    );
  }
}

class TotalHours extends Component {
  render() {
    let allSongs = this.props.playlists.reduce((songs, eachPlaylist) => {
      return songs.concat(eachPlaylist.songs)
    }, []);

    let totalDuration = allSongs.reduce((sum, eachSong) => {
      return sum + eachSong.duration;
    }, 0);

    let totalDurationHours = Math.round(totalDuration / 60);
    let isTooLow = totalDurationHours < 40;
    let hoursCounterStyle = {
      ...counterStyle,
      color: isTooLow ? 'red' : 'black',
      fontWeight: isTooLow ? 'bold' : 'normal'
    }

    return (
      <div style={hoursCounterStyle}>
        <h2>Total of hours: {totalDurationHours}</h2>
      </div>
    );
  }
}

class Filter extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filtersFields: []
    };
  }

  componentDidMount() {
    fetch('http://www.mocky.io/v2/5a25fade2e0000213aa90776')
      .then(response => response.json())
      .then(data => {
        this.setState({
          filtersFields: data.filters
        })
      })
  }

  render() {
    const { filtersFields } = this.state;
    const {
      filterValues,
      onChangeFilters,
    } = this.props;

    return (
      <div>
        {
          filtersFields ?
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <TextField
                id="search"
                label="Filter playlists by name"
                onKeyUp={event => this.props.onTextChange(event.target.value)}
                style={{ marginBottom: '.8em' }} />
              {
                filtersFields.map(field => ((
                  <RenderField
                    {...field}
                    key={field.id}
                    onChange={onChangeFilters}
                    fieldValues={filterValues}
                  />
                )))
              }
            </div> : 'Error'
        }
      </div>
    );
  }
}

class Playlist extends Component {
  render() {
    let playlist = this.props.playlist;
    return (
      <div style={{
        ...defaultStyle,
        display: 'inline-block',
        width: "25%",
        padding: '10px',
        backgroundColor: this.props.index % 2 ? '#C0C0C0' : '#808080'
      }}>
        <img src={playlist.imageUrl} alt={"Image URL index: " + this.props.index} style={{ width: '60px' }} />
        <h3 style={{ fontWeight: 'bold' }}>{playlist.name}</h3>
        <ul style={{ marginTop: '10px' }}>
          {
            playlist.songs.map(song =>
              <li key={song.name} style={{ paddingTop: '2px' }}>{song.name}</li>
            )}
        </ul>
      </div>
    );
  }
}

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

  updateRefreshInterval = () => {
    const intervalId = setInterval(this._callPlaylistService, 3000);
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
                ...defaultStyle,
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