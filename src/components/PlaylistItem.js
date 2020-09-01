import React from 'react';
import PropTypes from 'prop-types';
import { View,StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors, gStyle } from '../constants';
import { FontAwesome } from '@expo/vector-icons';

const PlaylistItem = ({ bgColor, onPress, title,isfavorite,onfav,xid ,area}) => (
  <View 
  style={[styles.playlistItem, { backgroundColor: bgColor }]}
  >
  <TouchableOpacity
    activeOpacity={gStyle.activeOpacity}
    onPress={onPress}
    
  >
    <Text style={styles.playlistTitle}>{title}</Text>
    <Text style={styles.playlistAreaTitle}>{area}</Text>
  </TouchableOpacity>
  <TouchableOpacity
          activeOpacity={gStyle.activeOpacity}
          onPress={()=> onfav(xid,!isfavorite,'Artist',{title:title})}
          style={styles.containerIcon}
        >
          <FontAwesome color={colors.brandPrimary} name={isfavorite ? 'heart' : 'heart-o'} size={20} />
        </TouchableOpacity>
  </View>
);

PlaylistItem.propTypes = {
  // required
  bgColor: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired
};

const styles = StyleSheet.create({
  playlistItem: {
    borderRadius: 6,
    height: 98,
    flex: 1,
    marginBottom: 24,
    marginRight: 24,
    paddingLeft: 12,
    paddingTop: 12
  },
  playlistTitle: {
    ...gStyle.textSpotifyBold22,
    color: colors.white
  },
  playlistAreaTitle: {
    ...gStyle.textSpotify12,
    color: colors.greyLight
  }
});

export default PlaylistItem;
