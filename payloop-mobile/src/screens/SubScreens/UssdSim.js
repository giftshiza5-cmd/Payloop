import React from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { useApp } from "../../context/AppContext";
import { styles } from "../../../styles";

export default function UssdSim() {
  const {
    ussdInputText,
    setUssdInputText,
    ussdDisplayScreen,
    setUssdDisplayScreen,
    ussdAmountEntered,
    handleUssdSubmitInput,
    selectedUser,
    currency,
    formatValue,
    getCreditTier,
    setActiveSubScreen
  } = useApp();

  return (
    <View style={styles.tabContentLight}>
      <View style={styles.subScreenHeader}>
        <TouchableOpacity onPress={() => setActiveSubScreen(null)} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.subScreenTitle}>USSD Simulator</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.ussdPhoneOutlineFrame}>
        {/* Screen bezel */}
        <View style={styles.ussdScreenDisplayBox}>
          <Text style={styles.ussdHeaderSignalText}>📶 Safaricom | USSD *384*25#</Text>
          
          {ussdDisplayScreen === "main" && (
            <View style={styles.ussdMenuBodyBox}>
              <Text style={styles.ussdMenuText}>Welcome to PayLoop Offline</Text>
              <Text style={styles.ussdMenuText}>1. Check Balance</Text>
              <Text style={styles.ussdMenuText}>2. Save to Chama</Text>
              <Text style={styles.ussdMenuText}>3. Request Loan</Text>
              <Text style={styles.ussdMenuText}>4. Credit Score Info</Text>
              <Text style={styles.ussdMenuText}>5. Announcements</Text>
            </View>
          )}

          {ussdDisplayScreen === "balance" && (
            <View style={styles.ussdMenuBodyBox}>
              <Text style={styles.ussdMenuText}>Your Savings: {formatValue(selectedUser?.savings || 0)}</Text>
              <Text style={styles.ussdMenuText}>Wallet Bal: {formatValue(selectedUser?.balance || 0)}</Text>
              <Text style={styles.ussdMenuText}>0. Back to Main</Text>
            </View>
          )}

          {ussdDisplayScreen === "save" && (
            <View style={styles.ussdMenuBodyBox}>
              <Text style={styles.ussdMenuText}>Enter savings amount in {currency}:</Text>
              <Text style={styles.ussdMenuText}>0. Back</Text>
            </View>
          )}

          {ussdDisplayScreen === "save_success" && (
            <View style={styles.ussdMenuBodyBox}>
              <Text style={styles.ussdMenuText}>M-Pesa STK Push initiated for {currency} {ussdAmountEntered}.</Text>
              <Text style={styles.ussdMenuText}>Please authorize on your phone.</Text>
              <Text style={styles.ussdMenuText}>0. Back</Text>
            </View>
          )}

          {ussdDisplayScreen === "loan" && (
            <View style={styles.ussdMenuBodyBox}>
              <Text style={styles.ussdMenuText}>Enter loan amount in {currency}:</Text>
              <Text style={styles.ussdMenuText}>0. Back</Text>
            </View>
          )}

          {ussdDisplayScreen === "loan_success" && (
            <View style={styles.ussdMenuBodyBox}>
              <Text style={styles.ussdMenuText}>Loan request of {currency} {ussdAmountEntered} submitted to Chama!</Text>
              <Text style={styles.ussdMenuText}>Members will vote on consensus.</Text>
              <Text style={styles.ussdMenuText}>0. Back</Text>
            </View>
          )}

          {ussdDisplayScreen === "score" && (
            <View style={styles.ussdMenuBodyBox}>
              <Text style={styles.ussdMenuText}>CreditScore: {selectedUser?.creditScore || 500}</Text>
              <Text style={styles.ussdMenuText}>Tier: {getCreditTier(selectedUser?.creditScore || 500).badge}</Text>
              <Text style={styles.ussdMenuText}>0. Back</Text>
            </View>
          )}

          {ussdDisplayScreen === "announcements" && (
            <View style={styles.ussdMenuBodyBox}>
              <Text style={styles.ussdMenuText}>Ann: General Meeting on 15 May at 7:00 PM.</Text>
              <Text style={styles.ussdMenuText}>0. Back</Text>
            </View>
          )}

          <View style={styles.ussdPromptInputWrapper}>
            <TextInput
              style={styles.ussdPromptTextInputField}
              placeholder="Enter option..."
              placeholderTextColor="#4b5563"
              value={ussdInputText}
              onChangeText={setUssdInputText}
              keyboardType="numeric"
              onSubmitEditing={handleUssdSubmitInput}
            />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.ussdKeysContainerRow}>
          <TouchableOpacity onPress={() => { setUssdDisplayScreen("main"); setUssdInputText(""); }} style={styles.ussdCancelButton}>
            <Text style={styles.ussdCancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleUssdSubmitInput} style={styles.ussdSendButton}>
            <Text style={styles.ussdSendBtnText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
