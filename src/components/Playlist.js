import React, { Component } from 'react';

let playlistDefaultStyle = {
    color: '#000',
    fontFamily: 'Papyrus'
  };

class Playlist extends Component {
    render() {
      let playlist = this.props.playlist;
      return (
        <div style={{
          ...playlistDefaultStyle,
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

  export default Playlist;