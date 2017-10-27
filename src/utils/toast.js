import Toast from '@remobile/react-native-toast';

export default function toast(content, position = 'center') {
  if (position === 'center') {
    Toast.showShortCenter(content);
  } else {
    Toast.showShortBottom(content);
  }
}
