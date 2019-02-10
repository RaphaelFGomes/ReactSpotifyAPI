import React, { Component } from 'react';

let playCountDefaultStyle = {
    color: '#000',
    fontFamily: 'Papyrus'
  };

let playlistCountStyle = {
    ...playCountDefaultStyle,
    width: "40%",
    display: 'inline-block',
    marginBottom: '20px',
    fontSize: '20px',
    lineHeight: '30px'
  };

class PlaylistCounter extends Component {
    render() {
      let playlistCounterStyle = playlistCountStyle;
  
      return (
        <div style={playlistCounterStyle}>
          <h2>Number of playlists: {this.props.playlists.length}</h2>
        </div>
      );
    }
  }

  export default PlaylistCounter;