import React from 'react';
import PropTypes from 'prop-types';

import TextField from '@material-ui/core/TextField';
import SelectRenderer from './SelectRenderer';

const LOCALE = 'locale';
const COUNTRY = 'country';
const TIMESTAMP = 'timestamp';
const LIMIT = 'limit';
const OFFSET = 'offset';

const RenderField = ({
  id,
  name,
  values,
  validation,
  fieldValues,
  onChange,
}) => {
  switch (id) {
    case LOCALE:
      return ((
        <SelectRenderer
          options={values}
          label={name}
          inputProps={{
            name: 'locale',
            id: 'locale',
          }}
          value={fieldValues ? fieldValues.locale : ''}
          onChange={onChange}
          style={{marginBottom: '.8em'}}/>
      ));
    case COUNTRY:
      return ((
        <SelectRenderer
          options={values}
          label={name}
          inputProps={{
            name: 'country',
            id: 'country',
          }}
          value={fieldValues ? fieldValues.country : ''}
          onChange={onChange}
          style={{marginBottom: '.8em'}}/>
      ));
    case TIMESTAMP:
      return ((
        <TextField
          id={id}
          name="datetime"
          label={name}
          type="datetime-local"
          InputLabelProps={{
            shrink: true,
          }}
          value={fieldValues ? fieldValues.datetime: ''}
          onChange={onChange}
          style={{marginBottom: '.8em'}}/>
      ));
    case LIMIT:
      return ((
        <TextField
          label={name}
          name="limit"
          type="number"
          InputLabelProps={{
            shrink: true,
          }}
          min={validation.min}
          max={validation.max}
          margin="normal"
          value={fieldValues ? fieldValues.limit : ''}
          onChange={onChange}
          style={{marginBottom: '.8em'}}/>
      ));
    case OFFSET:
      return ((
        <TextField
          label={name}
          name="offset"
          type="number"
          InputLabelProps={{
            shrink: true,
          }}
          min={1}
          margin="normal"
          value={fieldValues ? fieldValues.offset : ''}
          onChange={onChange}
          style={{marginBottom: '.8em'}}/>
      ));
    default:
      return null;
  }
};

RenderField.propTypes = {
  id: PropTypes.string,
  values: PropTypes.array,
  validation: PropTypes.object,
  fieldValues: PropTypes.object,
  onChange: PropTypes.func,
};

export default RenderField;