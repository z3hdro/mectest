import { StyleSheet } from 'react-native'
import { useMemo } from 'react'
import { colors } from 'constants/colors'

export const useStyles = () => {
  return useMemo(
    () =>
      StyleSheet.create({
        loader: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        loaderContainer: {
          height: 60,
          width: 60,
          borderRadius: 8,
          backgroundColor: colors.color2,
          justifyContent: 'center',
          alignItems: 'center',
        },
      }),
    []
  )
}
