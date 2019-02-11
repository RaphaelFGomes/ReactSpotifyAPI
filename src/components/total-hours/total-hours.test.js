import React from 'react';
import TotalHours from './total-hours';
import { shallow } from 'enzyme';

// Mounting - Full DOM rendering including child components
// Shallow - Renders only the single component, not including its children,
// this is useful to isolate the component for pure unit testing.
// Render - Renders to static HTML, including children

it('should render correctly with props', () => {
    const playlistToShow = [{"name":"Rock Classics",
    "imageUrl":"https://pl.scdn.co/images/pl/default/22aa4f9c1057c444088c8b21eb9504fbba7f6ef7",
    "songs":[{"name":"Roadhouse Blues","duration":243.826},
    {"name":"Hotel California - Live at The Los Angeles Forum, 10/20-22/76","duration":409.52},
    {"name":"Jeremy","duration":318.226}]},
    {"name":"All Out 90s",
    "imageUrl":"https://pl.scdn.co/images/pl/default/214a81802e42f77eeb66009a7628b944a4e73cef",
    "songs":[{"name":"Black","duration":342.653},{"name":"Would?","duration":206.773},
    {"name":"Civil War","duration":462.093}]},
    {"name":"Truly Deeply House",
    "imageUrl":"https://pl.scdn.co/images/pl/default/24e60ea40bccfd408c18834f51960ee6c31a5002",
    "songs":[{"name":"Good Ol' Days","duration":401.471},{"name":"I Feel","duration":326},
    {"name":"Under The Moon - Cassius Remix - Edit","duration":233.703}]},
    {"name":"I Love My '00s R&B",
    "imageUrl":"https://pl.scdn.co/images/pl/default/c75e25bcd27451547ade83f4a58427c857f6344f",
    "songs":[{"name":"Let Me Love You","duration":256.733},
    {"name":"We Belong Together","duration":201.4},{"name":"U Remind Me","duration":266.893}]},
    {"name":"Easy Classical",
    "imageUrl":"https://pl.scdn.co/images/pl/default/68a8e45f01abde94cd2b39d578a7e45936c713d5",
    "songs":[{"name":"Jenkins: Palladio, for Strings (Excerpt, Allegretto)","duration":226.88},
    {"name":"Piano Sonata No. 17 In D Minor, Op. 31, No. 2 -\"The Tempest\": 3. Allegretto - Live",
    "duration":457.2},{"name":"Cello Suite No. 1 in G Major, BWV 1007: I. Prélude","duration":151.48}]},
    {"name":"Sleep","imageUrl":"https://pl.scdn.co/images/pl/default/f499b0497289a6432dcccfb6de5f57164739d525",
    "songs":[{"name":"Enter the Unseen","duration":232.385},{"name":"Heavenly","duration":179.014},
    {"name":"Let Her Go","duration":183.022}]},
    {"name":"Night Rain","imageUrl":"https://pl.scdn.co/images/pl/default/971e797aa01c385667cccbfada26ad242ab95d91",
    "songs":[{"name":"Lluvia Eterna","duration":222.727},
    {"name":"In the Forest Rain","duration":205.172},
    {"name":"Light Rain","duration":188.598}]},
    {"name":"Deep Sleep",
    "imageUrl":"https://pl.scdn.co/images/pl/default/ff0412251a8e8d5702baba4867e003a68de77417",
    "songs":[{"name":"Grace of You","duration":161.4},{"name":"Mind-Drift","duration":240},
    {"name":"Owls","duration":146.483}]},
    {"name":"ASMR Sleep Sounds",
    "imageUrl":"https://pl.scdn.co/images/pl/default/567d4bf944b71bff926d0ac1d2eb44950e602d30",
    "songs":[{"name":"ASMR Indian Head Shoulder Massage Roleplay Pt1","duration":166.5},
    {"name":"ASMR Indian Head Shoulder Massage Roleplay Pt2","duration":167.5},
    {"name":"ASMR Indian Head Shoulder Massage Roleplay Pt3","duration":163.5}]},
    {"name":"Lounge - Soft House",
    "imageUrl":"https://pl.scdn.co/images/pl/default/913feb2e2e6fb345ca6f8af12ea7e3a0caf38be3",
    "songs":[{"name":"Best Part of Us","duration":241.04},{"name":"All Good","duration":196.67},
    {"name":"Times of Sorrow","duration":294}]},
    {"name":"The Sleep Machine: Rainforest",
    "imageUrl":"https://pl.scdn.co/images/pl/default/e73c55a15c529d508134e13212c93367b6c6cd36",
    "songs":[{"name":"Rainforest Ambience","duration":175.769},
    {"name":"Rain & The Rainforest","duration":193.922},
    {"name":"Exotic Nature","duration":199.357}]},
    {"name":"Peaceful Meditation",
    "imageUrl":"https://pl.scdn.co/images/pl/default/6130aa8a52cfef62d11073c2b04d38c93bc786bc",
    "songs":[{"name":"Threads","duration":192.793},{"name":"Heavenly","duration":179.014},
    {"name":"Imperfecta","duration":234.057}]},{"name":"White Noise",
    "imageUrl":"https://pl.scdn.co/images/pl/default/5c87b3873ea9add5937fb51271f1953862b29887",
    "songs":[{"name":"Cabin Sound","duration":156.805},{"name":"Cabin Pressure","duration":166},
    {"name":"Space","duration":201.679}]}];

    const component = shallow(<TotalHours playlists={playlistToShow}/>);
    expect(component).toMatchSnapshot();
});

