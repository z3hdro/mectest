import {useMemo} from "react";
import {StyleSheet} from "react-native";
import {colors} from "@/constants";

export const useStyles = () => {
    return useMemo(
        () =>
            StyleSheet.create({
                container: {
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 6,
                    paddingRight: 12,
                    backgroundColor: colors.chipBackground,
                    borderRadius: 9999,
                    gap: 4
                },
                containerSelected: {
                    backgroundColor: colors.pink,
                },
                iconContainer: {
                    padding: 4,
                },
                countContainer: {
                    overflow: 'hidden',
                    height: 20,
                },
                countText: {
                    fontSize: 13,
                    lineHeight: 18,
                    color: colors.disabledGray,
                    fontFamily: 'Manrope_700Bold',
                },
                countTextSelected: {
                    color: colors.selected
                }
            }),
        []
    );
};
