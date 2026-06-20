import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useApp } from "../../context/AppContext";
import { styles } from "../../../styles";

export default function Transactions() {
  const {
    transactions,
    txFilter,
    setTxFilter,
    setActiveSubScreen,
    formatValue
  } = useApp();

  const filteredTxs = transactions.filter((tx) => {
    if (txFilter === "All") return true;
    if (txFilter === "Contributions") return tx.type === "Contribution";
    return tx.type.includes("Loan");
  });

  return (
    <ScrollView style={styles.tabContentLight}>
      <View style={styles.subScreenHeader}>
        <TouchableOpacity onPress={() => setActiveSubScreen(null)} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.subScreenTitle}>Transactions</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.txFilterTabsRow}>
        {["All", "Contributions", "Loans"].map((filter) => (
          <TouchableOpacity
            key={filter}
            onPress={() => setTxFilter(filter)}
            style={[
              styles.txFilterTabButton,
              txFilter === filter ? styles.txFilterTabButtonActive : null
            ]}
          >
            <Text style={[styles.txFilterTabText, txFilter === filter ? styles.txFilterTabTextActive : null]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.txListContainer}>
        {filteredTxs.map((tx) => (
          <View key={tx.id} style={styles.txItemCard}>
            <View style={styles.txIconGroup}>
              <View style={[styles.txIconBadge, tx.isIncome ? styles.txBadgeIncome : styles.txBadgeExpense]}>
                <Text style={styles.txBadgeEmoji}>{tx.isIncome ? "📥" : "📤"}</Text>
              </View>
              <View style={styles.txInfoGroup}>
                <Text style={styles.txInfoType}>{tx.type}</Text>
                <Text style={styles.txInfoDate}>{tx.date}</Text>
              </View>
            </View>
            <View style={styles.txValueGroup}>
              <Text style={[styles.txAmountText, tx.isIncome ? styles.txAmountIncome : styles.txAmountExpense]}>
                {formatValue(Math.abs(tx.amount))}
              </Text>
              <Text style={[styles.txStatusText, tx.status === "Completed" ? styles.txStatusSuccess : styles.txStatusPending]}>
                {tx.status}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
