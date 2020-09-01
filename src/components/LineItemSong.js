import React from 'react';
import PropTypes from 'prop-types';
import { Switch, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors, gStyle } from '../constants';
import { FontAwesome } from '@expo/vector-icons';


import {
  MenuContext,
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';

import Dialog, { SlideAnimation, DialogContent, DialogFooter, DialogButton, DialogTitle } from 'react-native-popup-dialog';

class LineItemSong extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      dialogvisible: false
    };

    // this.toggleDownloaded = this.toggleDownloaded.bind(this);
  }

  render() {
    const { active, downloaded, onPress, songData, onDownload, isfavorite, onfav,onfavlist } = this.props;
    return (
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

        {/* <View style={styles.containerRight}>
    <Switch
                trackColor={colors.greySwitchBorder}
                onValueChange={val => onDownload(songData.uri,!downloaded)}
                value={downloaded}
              />
      
      </View>*/}<View style={styles.containerRight}>
          {/* <TouchableOpacity
          activeOpacity={gStyle.activeOpacity}
          onPress={()=> onfav(songData.uri,!isfavorite,'song',songData)}
          style={styles.containerIcon}
        >
          <FontAwesome color={colors.brandPrimary} name={isfavorite ? 'heart' : 'heart-o'} size={20} />
        </TouchableOpacity> */}
          <View style={styles.container}>
            <Dialog
              visible={this.state.dialogvisible}
              dialogAnimation={new SlideAnimation({
                slideFrom: 'bottom',
              })}
              width={0.9}
              height={500}
              dialogTitle={<DialogTitle
                title="Select playlist"
                style={{
                  backgroundColor: '#F7F7F8',
                }}
                hasTitleBar={false}
                align="left"
              />}
            >
              <DialogContent
                style={{
                  height: 370,
                  padding: 50
                }}
              >

                {
                  this.props.favorites.map((f,index) =><TouchableOpacity key={index.toString()}
                      onPress={() => {
                        onfavlist(f.id,true,songData)
                        this.setState({ dialogvisible: false });
                      }}
                    ><View><Text
                      style={{
                        fontSize: 18
                      }}
                    >{f.data.title}</Text></View></TouchableOpacity>
                  )

                }


              </DialogContent>
              <DialogFooter>
                <DialogButton
                  text="CANCEL"
                  onPress={() => this.setState({ dialogvisible: false })}
                />
                <DialogButton
                  text="OK"
                  onPress={() => this.setState({ dialogvisible: false })}
                />
              </DialogFooter>
            </Dialog>
          </View>


          <Menu>
            <MenuTrigger>
              <Feather color={colors.greyInactive} name="more-vertical" size={24} />
            </MenuTrigger>
            <MenuOptions>
              <MenuOption>
                <Switch
                  trackColor={colors.greySwitchBorder}
                  onValueChange={val => onDownload(songData.uri, !downloaded)}
                  value={downloaded}
                />
              </MenuOption>
              <MenuOption>
                <TouchableOpacity
                  activeOpacity={gStyle.activeOpacity}
                  onPress={() => onfav(songData.uri, !isfavorite, 'song', songData)}
                  style={styles.containerIcon}
                >
                  <FontAwesome color={colors.brandPrimary} name={isfavorite ? 'heart' : 'heart-o'} size={20} />
                </TouchableOpacity>
              </MenuOption>
              <MenuOption>
                <TouchableOpacity
                  activeOpacity={gStyle.activeOpacity}
                  onPress={() => this.setState({ dialogvisible: true })}
                  style={styles.containerIcon}
                >
                  <MaterialIcons color={colors.brandPrimary} name='playlist-add' size={20} />
                </TouchableOpacity>
              </MenuOption>
            </MenuOptions>
          </Menu>
        </View>
      </View>
    );
  }
}

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
  },
  dialog: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    position: 'absolute',
    top: 0,
    width: '100%'
  }
});

export default LineItemSong;
