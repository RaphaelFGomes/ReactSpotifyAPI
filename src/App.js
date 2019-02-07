import React, { Component } from 'react';
import './App.css';
import queryString from 'query-string';

let defaultStyle = {
  color: '#000',
  fontFamily: 'Papyrus'
};

let counterStyle = {...defaultStyle,
  width: "40%",
  display: 'inline-block',
  marginBottom: '20px',
  fontSize: '20px',
  lineHeight: '30px'
};

class PlaylistCounter extends Component {
  render () {
    let playlistCounterStyle = counterStyle;

    return (
      <div style={playlistCounterStyle}>
        <h2>Number of playlists: {this.props.playlists.length}</h2>
      </div>
    );
  }
}

class TotalHours extends Component {
  render () {
    let allSongs = this.props.playlists.reduce((songs, eachPlaylist) => {
        return songs.concat(eachPlaylist.songs)
    }, []);

    let totalDuration = allSongs.reduce((sum, eachSong) => {
        return sum + eachSong.duration;
    }, 0);

    let totalDurationHours = Math.round(totalDuration/60);
    let isTooLow = totalDurationHours < 40;
    let hoursCounterStyle = {...counterStyle,
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
  render () {
    return (
      <div style={{defaultStyle}}>
        <input type="text" onKeyUp={event =>
        this.props.onTextChange(event.target.value)}
        style={{...defaultStyle, color: 'black', fontSize: '20px', padding: '10px'}}/>
      </div>
    );
  }
}

class Playlist extends Component {
  render () {
    let playlist = this.props.playlist;
    return (
      <div style={{...defaultStyle,
        display: 'inline-block',
        width: "25%",
        padding: '10px',
        backgroundColor: this.props.index % 2 ? '#C0C0C0' : '#808080'}}>
        <img src={playlist.imageUrl} alt={"Image URL index: " + this.props.index} style={{width: '60px'}}/>
        <h3>{playlist.name}</h3>
        <ul style={{marginTop: '10px', fontWeight: 'bold'}}>
          {
            playlist.songs.map(song =>
               <li key={song.name} style={{paddingTop: '2px'}}>{song.name}</li>
          )}
        </ul>
      </div>
    );
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      spotifyServerDate: {},
      filterString: ''
    }
  }

  componentDidMount() {
   const stringParsed = queryString.parse(window.location.search);
   let accessToken = stringParsed.access_token;
    if (!accessToken) {
      return;
    }

   fetch('https://api.spotify.com/v1/me', {
     headers: {'Authorization': 'Bearer ' + accessToken}
   }).then(response => response.json())
   .then(data => this.setState({
     user: {
       name: data.display_name
      }
    }))

      fetch('https://api.spotify.com/v1/browse/featured-playlists', {
      headers: {'Authorization': 'Bearer ' + accessToken}
    }).then(response => response.json())
      .then(playlistData => {
        let playlists = playlistData.playlists.items;
        let trackDataPromises = playlists.map(playlist => {
          let responsePromise = fetch(playlist.tracks.href, {
            headers: {'Authorization': 'Bearer ' + accessToken}
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
            name: trackData.name,
            duration : trackData.duration_ms / 1000
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
        let matchesSong = playlist.songs.find(song => song.name.toLowerCase()
        .includes(this.state.filterString.toLowerCase()))
        return matchesPlaylist || matchesSong
      }) : []

    return (
      <div className="App">
        {
          this.state.user ?
          <div>
            <h1 style={{...defaultStyle,
               fontSize: '54px',
               marginTop: '5px'
              }}>Spotifood</h1>
            <h2>{this.state.user.name}'s playlist</h2>
            <PlaylistCounter playlists={playlistToShow}/>
            <TotalHours playlists={playlistToShow}/>
            <Filter onTextChange={text => this.setState({filterString: text})}/>
            {
              playlistToShow.map((playlist, i) =>
                <Playlist key={i} playlist={playlist} index={i}/>
            )}
          </div> : <button onClick={() => {
            window.location = window.location.href.includes('localhost') ? 'http://localhost:8888/login'
            : 'https://spotifood-backend.herokuapp.com/login' }
          }
          style={{padding: '', fontSize: '50px', marginTop: '20px'}}>Sign in with Spotify</button>
        }
      </div>
    );
  }
}

export default App;
