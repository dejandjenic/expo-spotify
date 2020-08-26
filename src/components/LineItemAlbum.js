import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { colors, gStyle } from '../constants';
import { FontAwesome } from '@expo/vector-icons';

import { withNavigation } from 'react-navigation';

const LineItemAlbum = ({ active, downloaded, onPress, albumData,onPress2,navigation }) => (

  
  <View style={styles.container}>
    <TouchableOpacity
      activeOpacity={gStyle.activeOpacity}
       //onPress={() => onPress(albumData)}
       onPress={() => navigation.navigate('Album', { title: 'item.title',id:albumData.id,album:albumData })}
      style={gStyle.flex5}
    >
      <Text
        style={[
          styles.title,
          { color: active ? colors.brandPrimary : colors.white }
        ]}
      >
        {albumData.title}
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
        <Text style={styles.artist}>{albumData.artist}</Text>
      </View>
    </TouchableOpacity>

    <View style={styles.containerRight}>
    <TouchableOpacity
          activeOpacity={gStyle.activeOpacity}
          onPress={onPress2}
          style={styles.containerIcon}
        >
          <FontAwesome color={colors.brandPrimary} name='heart' size={20} />
        </TouchableOpacity>
    </View>
  </View>
);

LineItemAlbum.defaultProps = {
  active: false,
  downloaded: false
};

LineItemAlbum.propTypes = {
  // required
  // onPress: PropTypes.func.isRequired,
  // songData: PropTypes.shape({
  //   album: PropTypes.string.isRequired,
  //   artist: PropTypes.string.isRequired,
  //   image: PropTypes.string.isRequired,
  //   length: PropTypes.number.isRequired,
  //   title: PropTypes.string.isRequired
  // }).isRequired,

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

export default withNavigation(LineItemAlbum);
