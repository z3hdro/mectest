import {useMemo} from "react";
import {StyleSheet} from "react-native";
import {colors} from "@/constants";

export const useStyles = () => {
    return useMemo(
        () =>
            StyleSheet.create({
                container: {
                    flex: 1,
                    backgroundColor: colors.backgroundGray,
                    alignItems: "center",
                    justifyContent: "center",
                    paddingHorizontal: 16,
                    gap: 16,
                },
                label: {
                    fontFamily: 'Manrope_700Bold',
                    fontSize: 18,
                    lineHeight: 26,
                    color: colors.dark
                }
            }),
        []
    );
};
