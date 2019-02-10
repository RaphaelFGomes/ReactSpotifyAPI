import React, { Component } from 'react';
import TextField from '@material-ui/core/TextField';
import RenderField from './RenderField';
import axios from 'axios';
import {urlGetFilter, filterErrorMessage} from '../constants';

class Filter extends Component {
    constructor(props) {
      super(props);
  
      this.state = {
        filtersFields: []
      };
    }
  
    componentDidMount() {
      axios.get(urlGetFilter)
        .then(response => {
            this.setState({
            filtersFields: response.data.filters
            })
        })
        .catch(error => {
            alert(filterErrorMessage);
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