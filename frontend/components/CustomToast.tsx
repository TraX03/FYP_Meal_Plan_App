import { Text, View } from "react-native";
import { styles } from "./styles";

type CustomToastProps = {
  text1?: string;
  text2?: string;
};

const CustomToast = ({ text1, text2 }: CustomToastProps) => (
  <View style={styles.toastContainer}>
    <Text style={styles.toastText}>{text1}</Text>
    {text2 ? <Text style={styles.toastSubText}>{text2}</Text> : null}
  </View>
);

export default CustomToast;
