import React, { Component } from 'react';

// Inline Styles
let defaultStyle = {
    color: '#000',
    fontFamily: 'Papyrus'
  };

let totalHoursStyle = {
    ...defaultStyle,
    width: "40%",
    display: 'inline-block',
    marginBottom: '20px',
    fontSize: '20px',
    lineHeight: '30px'
  };

// Component that counts how many hours of songs has in all playlists being displayed
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
        ...totalHoursStyle,
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

  export default TotalHours;