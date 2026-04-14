import React, {FC, useMemo} from 'react';

import {ICONS} from './Icon.constants';
import {IconProps} from './Icon.types';

export const Icon: FC<IconProps> = ({name, ...rest}) => {
  const IconSvg = useMemo(() => ICONS[name], [name]);

  return <IconSvg hitSlop={5} {...rest} />;
};

Icon.displayName = 'Icon';
