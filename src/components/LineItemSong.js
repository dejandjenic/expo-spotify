import React from 'react';
import PropTypes from 'prop-types';
import { Switch,StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { colors, gStyle } from '../constants';
import { FontAwesome } from '@expo/vector-icons';

const LineItemSong = ({ active, downloaded, onPress, songData,onDownload ,isfavorite,onfav}) => (
  <View style={styles.container}>
    <TouchableOpacity
      activeOpacity={gStyle.activeOpacity}
      onPress={() => onPress(songData)}
      style={gStyle.flex5}
    >
      <Text
        style={[
          styles.title,
          { color: active ? colors.brandPrimary : colors.white }
        ]}
      >
        {songData.title}
      </Text>
      <View style={gStyle.flexRow}>
        {downloaded && (
          <View style={styles.circleDownloaded}>
            <Ionicons
              color={colors.blackBg}
              name="ios-arrow-round-down"
              size={14}
            />
          </View>
        )}
        <Text style={styles.artist}>{songData.artist}</Text>
      </View>
    </TouchableOpacity>

    <View style={styles.containerRight}>
    <Switch
                trackColor={colors.greySwitchBorder}
                onValueChange={val => onDownload(songData.uri,!downloaded)}
                value={downloaded}
              />
      {/* <Feather color={colors.greyLight} name="more-horizontal" size={20} /> */}
      </View><View style={styles.containerRight}>
      <TouchableOpacity
          activeOpacity={gStyle.activeOpacity}
          onPress={()=> onfav(songData.uri,!isfavorite)}
          style={styles.containerIcon}
        >
          <FontAwesome color={colors.brandPrimary} name={isfavorite ? 'heart' : 'heart-o'} size={20} />
        </TouchableOpacity>
    </View>
  </View>
);

LineItemSong.defaultProps = {
  active: false,
  downloaded: false
};

LineItemSong.propTypes = {
  // required
  onPress: PropTypes.func.isRequired,
  songData: PropTypes.shape({
    album: PropTypes.string.isRequired,
    artist: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    length: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired
  }).isRequired,

  // optional
  active: PropTypes.bool,
  downloaded: PropTypes.bool
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    width: '100%'
  },
  title: {
    ...gStyle.textSpotify16,
    color: colors.white,
    marginBottom: 4
  },
  circleDownloaded: {
    alignItems: 'center',
    backgroundColor: colors.brandPrimary,
    borderRadius: 7,
    height: 14,
    justifyContent: 'center',
    marginRight: 8,
    width: 14
  },
  artist: {
    ...gStyle.textSpotify12,
    color: colors.greyInactive
  },
  containerRight: {
    alignItems: 'flex-end',
    flex: 1
  }
});

export default LineItemSong;
