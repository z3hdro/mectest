import {memo} from "react";
import {View, Text} from "react-native";
import {BlurView} from "expo-blur";

import {Icon, PrimaryButton} from "@/components";
import { ICON_SIZE } from "./DonateCurtain.constants";
import { useStyles } from "./DonateCurtain.styles";

export const DonateCurtain = memo(() => {
    const styles = useStyles()

    return (
        <BlurView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconWrapper}>
                    <Icon name={"donate"} height={ICON_SIZE} width={ICON_SIZE} />
                </View>
                <Text style={styles.label}>
                    Контент скрыт пользователем.
                    Доступ откроется после доната
                </Text>

                <PrimaryButton onPress={() => {}} label={'Отправить донат'} />
            </View>
        </BlurView>
    )
})

DonateCurtain.displayName = "DonateCurtain"