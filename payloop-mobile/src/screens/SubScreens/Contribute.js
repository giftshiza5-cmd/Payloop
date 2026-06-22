import React from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { useApp } from "../../context/AppContext";
import { styles } from "../../../styles";

export default function Contribute() {
  const {
    currency,
    depositAmount,
    setDepositAmount,
    paymentMethod,
    setPaymentMethod,
    selectedUser,
    formatValue,
    handleContributeSubmit,
    setActiveSubScreen
  } = useApp();

  const amounts = currency === "KES" ? ["5,000", "10,000", "20,000", "50,000"] : ["50", "100", "200", "500"];

  return (
    <ScrollView style={[styles.tabContentLight, { paddingTop: 16 }]} showsVerticalScrollIndicator={false}>

      <View style={styles.contributionFormCard}>
        <Text style={styles.inputLabelLabel}>Amount in {currency}</Text>
        <View style={styles.largeAmountInputBox}>
          <TextInput
            style={styles.largeAmountTextInput}
            keyboardType="numeric"
            value={depositAmount}
            onChangeText={setDepositAmount}
          />
          <Text style={styles.largeAmountCurrency}>{currency}</Text>
        </View>

        <View style={styles.quickSelectAmountsRow}>
          {amounts.map((amt) => (
            <TouchableOpacity
              key={amt}
              onPress={() => setDepositAmount(amt.replace(/,/g, ""))}
              style={[
                styles.quickAmtBtn,
                depositAmount === amt.replace(/,/g, "") ? styles.quickAmtBtnActive : null
              ]}
            >
              <Text style={[styles.quickAmtBtnText, depositAmount === amt.replace(/,/g, "") ? styles.quickAmtBtnTextActive : null]}>
                {amt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.inputLabelLabel, { marginTop: 20 }]}>Payment Method</Text>
        
        <TouchableOpacity onPress={() => setPaymentMethod("mpesa")} style={[styles.paymentMethodOptionCard, paymentMethod === "mpesa" ? styles.paymentMethodActiveCard : null]}>
          <View style={styles.paymentMethodLeft}>
            <View style={styles.paymentMethodIconBadgeMpesa}>
              <Text style={styles.paymentMethodIconText}>🟢</Text>
            </View>
            <View style={styles.paymentMethodLabelCol}>
              <Text style={styles.paymentMethodName}>M-Pesa</Text>
              <Text style={styles.paymentMethodDetails}>SIM Toolkit Push Authorization</Text>
            </View>
          </View>
          <View style={[styles.paymentMethodCheckOutline, paymentMethod === "mpesa" ? styles.paymentMethodChecked : null]} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setPaymentMethod("metamask")} style={[styles.paymentMethodOptionCard, paymentMethod === "metamask" ? styles.paymentMethodActiveCard : null]}>
          <View style={styles.paymentMethodLeft}>
            <View style={styles.paymentMethodIconBadgeCrypto}>
              <Text style={styles.paymentMethodIconText}>🦊</Text>
            </View>
            <View style={styles.paymentMethodLabelCol}>
              <Text style={styles.paymentMethodName}>MetaMask (Polygon)</Text>
              <Text style={styles.paymentMethodDetails}>Gas fee: 0.0015 MATIC</Text>
            </View>
          </View>
          <View style={[styles.paymentMethodCheckOutline, paymentMethod === "metamask" ? styles.paymentMethodChecked : null]} />
        </TouchableOpacity>

        <View style={styles.walletBalanceSummaryBox}>
          <Text style={styles.walletBalanceTextSecondary}>Wallet Balance</Text>
          <Text style={styles.walletBalanceTextPrimary}>{formatValue(selectedUser?.balance || 0)}</Text>
        </View>

        <TouchableOpacity onPress={handleContributeSubmit} style={styles.buttonForestGreenSubmitContribution}>
          <Text style={styles.buttonTextPrimary}>Continue</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
