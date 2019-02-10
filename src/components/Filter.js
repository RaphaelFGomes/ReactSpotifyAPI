import React, { Component } from 'react';
import TextField from '@material-ui/core/TextField';
import RenderField from './RenderField';
import axios from 'axios';

class Filter extends Component {
    constructor(props) {
      super(props);
  
      this.state = {
        filtersFields: []
      };
    }
  
    componentDidMount() {
      axios.get('http://www.mocky.io/v2/5a25fade2e0000213aa90776')
        .then(response => {
            this.setState({
            filtersFields: response.data.filters
            })
        })
        .catch(error => {
            alert("Could not fetch filter values!");
        });
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

  export default Filter;