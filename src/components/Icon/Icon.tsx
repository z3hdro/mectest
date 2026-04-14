import React, {FC, useMemo} from 'react';

import * as ICONS from './Icon.constants';
import {IconProps} from './Icon.types';

const Icon: FC<IconProps> = ({name, ...rest}) => {
  const IconSvg = useMemo(() => ICONS[name], [name]);

  return <IconSvg hitSlop={5} {...rest} />;
};

Icon.displayName = 'Icon';
export default Icon;
