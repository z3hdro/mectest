import {useMemo} from "react";
import {StyleSheet} from "react-native";
import {colors} from "@/constants";

export const useStyles = () => {
    return useMemo(
        () =>
            StyleSheet.create({
                button: {
                    width: '100%',
                    paddingHorizontal: 32,
                    paddingVertical: 16,
                    borderRadius: 14,
                    backgroundColor: colors.purple,
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 42,
                },
                buttonText: {
                    fontFamily: 'Manrope_600SemiBold',
                    fontSize: 15,
                    lineHeight: 20,
                    color: colors.white
                }
            }),
        []
    );
};
