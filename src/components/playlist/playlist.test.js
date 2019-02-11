import React from 'react';
import Playlist from './playlist';
import { shallow } from 'enzyme';

// Mounting - Full DOM rendering including child components
// Shallow - Renders only the single component, not including its children,
// this is useful to isolate the component for pure unit testing.
// Render - Renders to static HTML, including children

it('should render correctly with props', () => {
    const playlist = {
        "name":"Sweet Soul Chillout",
        "imageUrl":"https://pl.scdn.co/images/pl/default/dd52dbcce4e10a2feb519e9c282b4d3b0dcc7442",
        "songs":[
            {"name":"Valentine Love (Slow Version)","duration":238.158},
            {"name":"Valerie - Live At BBC Radio 1 Live Lounge, London / 2007","duration":233.733},
            {"name":"Just The Way You Are","duration":289.106}]};
    const component = shallow(<Playlist playlist={playlist}/>);
    expect(component).toMatchSnapshot();
});

