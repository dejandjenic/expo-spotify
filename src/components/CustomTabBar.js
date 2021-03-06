import React from 'react';
import PropTypes from 'prop-types';
import { BottomTabBar } from 'react-navigation';

// components
import BarMusicPlayer from './BarMusicPlayer';

const CustomTabBar = props => {
  const {
    screenProps: { currentSongData, toggleTabBarState, onTogglePlay }
  } = props;

  return toggleTabBarState ? null : (
    <React.Fragment>
      <BarMusicPlayer song={currentSongData} screenProps={props.screenProps} />
      <BottomTabBar {...props} />
    </React.Fragment>
  );
};


CustomTabBar.propTypes = {
  // required
  navigation: PropTypes.object.isRequired,
  screenProps: PropTypes.object.isRequired
};

export default CustomTabBar;
