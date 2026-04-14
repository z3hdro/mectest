import {SvgProps} from 'react-native-svg';

import {IconNames} from '@/types';

export type IconProps = SvgProps & {
  name: IconNames;
  onPress?: () => void;
  fill1?: string;
  fill2?: string;
  fill3?: string;
  stroke1?: string;
};
