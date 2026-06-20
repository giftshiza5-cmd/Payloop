import React from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Share,
  Alert
} from "react-native";
import Svg, { Circle, Line, Path, Text as SvgText } from "react-native-svg";
import QRCode from "react-native-qrcode-svg";
import { useApp } from "../../context/AppContext";
import { styles } from "../../../styles";

export default function ScoreTab() {
  const {
    selectedUser,
    getCreditTier,
    isDark
  } = useApp();

  if (!selectedUser) return null;

  const score = selectedUser.creditScore;
  const maxScore = 1000;
  
  // Normalization for circle progress
  const radius = 45;
  const circumference = 2 * Math.PI * radius; // ~282.74
  const progress = Math.min(1, Math.max(0, score / maxScore));
  const strokeDashoffset = circumference * (1 - progress);

  const tier = getCreditTier(score);

  let ratingStatus = "Bronze";
  let ratingColor = "#CD7F32";
  if (score >= 800) {
    ratingStatus = "Excellent (Platinum)";
    ratingColor = "#0F9D58";
  } else if (score >= 650) {
    ratingStatus = "Good (Gold)";
    ratingColor = "#D4AF37";
  } else if (score >= 400) {
    ratingStatus = "Fair (Silver)";
    ratingColor = "#718096";
  } else {
    ratingStatus = "Needs Improvement (Bronze)";
    ratingColor = "#CD7F32";
  }

  // Dynamic points breakdown
  const contributionPoints = Math.round(score * 0.40);
  const repaymentPoints = Math.round(score * 0.25);
  const participationPoints = Math.round(score * 0.20);
  const growthPoints = Math.max(0, score - contributionPoints - repaymentPoints - participationPoints);

  // Coordinate calculation for SVG line chart (Score History over 6 months: Dec - May)
  const scoreToY = (val) => {
    const minVal = 600;
    const maxVal = 900;
    const height = 90;
    const topPadding = 15;
    const pct = (val - minVal) / (maxVal - minVal);
    return height - (pct * height) + topPadding;
  };

  const points = [
    { month: "Dec", score: 710, x: 30, y: scoreToY(710) },
    { month: "Jan", score: 725, x: 84, y: scoreToY(725) },
    { month: "Feb", score: 740, x: 138, y: scoreToY(740) },
    { month: "Mar", score: 750, x: 192, y: scoreToY(750) },
    { month: "Apr", score: 770, x: 246, y: scoreToY(770) },
    { month: "May", score: score, x: 300, y: scoreToY(score) }
  ];

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(" ");

  // Achievements list
  const achievements = [
    { id: 1, icon: "🚀", title: "First Step", desc: "First chama contribution made.", unlocked: true },
    { id: 2, icon: "⚡", title: "Punctual Saver", desc: "3 consecutive weekly deposits.", unlocked: true },
    { id: 3, icon: "🎯", title: "Reliable Borrower", desc: "Repaid first loan early.", unlocked: true },
    { id: 4, icon: "💎", title: "Elite Saver", desc: "Reached 800+ CreditLoop score.", unlocked: score >= 800 }
  ];

  // Share action
  const handleShareScore = async () => {
    try {
      const shareText = `My CreditLoop Score on PayLoop is ${score}/1000 (${tier.name} Tier)! I qualify for low-interest loans in my chama group. Verify my rep address: ${selectedUser.address}`;
      await Share.share({
        message: shareText,
        title: "Verify my CreditLoop Reputation"
      });
    } catch (err) {
      Alert.alert("Error sharing score", err.message);
    }
  };

  return (
    <ScrollView style={styles.tabContentLight} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.subScreenHeader}>
        <View style={{ width: 20 }} />
        <Text style={styles.subScreenTitle}>CreditLoop Reputation</Text>
        <View style={{ width: 20 }} />
      </View>

      {/* 1. CREDITLOOP SCORE CARD WITH CIRCULAR GAUGE */}
      <View style={styles.scoreOverviewCard}>
        <View style={styles.scoreCardContainerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.scoreCardTitle}>CreditLoop Score</Text>
            <Text style={styles.scoreCardValue}>{score}</Text>
            <Text style={styles.scoreCardMax}>out of 1000</Text>
            <View style={[styles.scoreTierBadge, { backgroundColor: ratingColor + "15" }]}>
              <Text style={[styles.scoreTierBadgeText, { color: ratingColor }]}>
                {ratingStatus}
              </Text>
            </View>
          </View>

          <View style={styles.circularGaugeBox}>
            <Svg width="110" height="110" viewBox="0 0 110 110">
              {/* Background Ring */}
              <Circle
                cx="55"
                cy="55"
                r={radius}
                stroke="#334155"
                strokeWidth="8"
                fill="none"
              />
              {/* Progress Ring */}
              <Circle
                cx="55"
                cy="55"
                r={radius}
                stroke={ratingColor}
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90, 55, 55)"
                strokeLinecap="round"
              />
            </Svg>
            <View style={styles.circularGaugeTextOverlay}>
              <Text style={[styles.circularGaugeScoreVal, { color: ratingColor }]}>{score}</Text>
              <Text style={styles.circularGaugeScoreLabel}>Points</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 2. PROGRESSION CHART (Score History) */}
      <View style={styles.scoreHistoryCard}>
        <Text style={styles.scoreHistoryCardTitle}>Score Progression (6 Months)</Text>
        <View style={styles.chartWrapperBox}>
          <Svg width="100%" height="130" viewBox="0 0 320 130">
            {/* Grid Lines */}
            <Line x1="30" y1="15" x2="300" y2="15" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
            <Line x1="30" y1="60" x2="300" y2="60" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
            <Line x1="30" y1="110" x2="300" y2="110" stroke="#E2E8F0" strokeWidth="1" />
            
            {/* Fill Area Underneath Line */}
            <Path
              d={`M ${points[0].x},110 ` + points.map(p => `L ${p.x},${p.y}`).join(" ") + ` L ${points[points.length - 1].x},110 Z`}
              fill={`${ratingColor}12`}
            />

            {/* Line path */}
            <Path
              d={`M ` + points.map(p => `${p.x},${p.y}`).join(" L ")}
              fill="none"
              stroke={ratingColor}
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Data points */}
            {points.map((p, idx) => (
              <Circle
                key={idx}
                cx={p.x}
                cy={p.y}
                r="5"
                fill={ratingColor}
                stroke="#ffffff"
                strokeWidth="2"
              />
            ))}

            {/* Labels */}
            {points.map((p, idx) => (
              <SvgText
                key={`lbl-${idx}`}
                x={p.x}
                y={p.y - 10}
                fontSize="8"
                fontWeight="bold"
                fill="#64748B"
                textAnchor="middle"
              >
                {p.score}
              </SvgText>
            ))}

            {/* X Axis Labels */}
            {points.map((p, idx) => (
              <SvgText
                key={`x-lbl-${idx}`}
                x={p.x}
                y="125"
                fontSize="9"
                fontWeight="bold"
                fill="#94A3B8"
                textAnchor="middle"
              >
                {p.month}
              </SvgText>
            ))}
          </Svg>
        </View>
      </View>

      {/* 3. SCORE BREAKDOWN SECTION */}
      <View style={styles.scoreBreakdownCard}>
        <Text style={styles.scoreBreakdownHeader}>Score Factors Breakdown</Text>
        
        <View style={styles.breakdownRowItemBox}>
          <View style={styles.breakdownItemHeaderRow}>
            <Text style={styles.breakdownItemLabel}>Weekly Contribution Consistency</Text>
            <Text style={styles.breakdownItemValue}>{contributionPoints} / 400 pts</Text>
          </View>
          <View style={styles.breakdownProgressBarContainer}>
            <View style={[styles.breakdownProgressBarFill, { width: `${(contributionPoints / 400) * 100}%`, backgroundColor: ratingColor }]} />
          </View>
        </View>

        <View style={styles.breakdownRowItemBox}>
          <View style={styles.breakdownItemHeaderRow}>
            <Text style={styles.breakdownItemLabel}>Loan Repayment Integrity</Text>
            <Text style={styles.breakdownItemValue}>{repaymentPoints} / 250 pts</Text>
          </View>
          <View style={styles.breakdownProgressBarContainer}>
            <View style={[styles.breakdownProgressBarFill, { width: `${(repaymentPoints / 250) * 100}%`, backgroundColor: ratingColor }]} />
          </View>
        </View>

        <View style={styles.breakdownRowItemBox}>
          <View style={styles.breakdownItemHeaderRow}>
            <Text style={styles.breakdownItemLabel}>Chama Voting & Governance</Text>
            <Text style={styles.breakdownItemValue}>{participationPoints} / 200 pts</Text>
          </View>
          <View style={styles.breakdownProgressBarContainer}>
            <View style={[styles.breakdownProgressBarFill, { width: `${(participationPoints / 200) * 100}%`, backgroundColor: ratingColor }]} />
          </View>
        </View>

        <View style={styles.breakdownRowItemBox}>
          <View style={styles.breakdownItemHeaderRow}>
            <Text style={styles.breakdownItemLabel}>Savings Pool Growth Rate</Text>
            <Text style={styles.breakdownItemValue}>{growthPoints} / 150 pts</Text>
          </View>
          <View style={styles.breakdownProgressBarContainer}>
            <View style={[styles.breakdownProgressBarFill, { width: `${(growthPoints / 150) * 100}%`, backgroundColor: ratingColor }]} />
          </View>
        </View>
      </View>

      {/* 4. ACHIEVEMENTS & MILESTONES */}
      <View style={styles.achievementsSectionCard}>
        <Text style={styles.achievementsSectionTitle}>Unlocked Badges & Milestones</Text>
        <View style={styles.achievementsGridRowContainer}>
          {achievements.map((ach) => (
            <View key={ach.id} style={[styles.achievementCardBox, !ach.unlocked ? styles.achievementLockedCardBox : null]}>
              <View style={[styles.achievementIconCircleWrapper, !ach.unlocked ? styles.achievementLockedIconCircle : null]}>
                <Text style={styles.achievementEmoji}>{ach.icon}</Text>
              </View>
              <Text style={styles.achievementTitleText}>{ach.title}</Text>
              <Text style={styles.achievementDescText}>{ach.desc}</Text>
              {!ach.unlocked && <View style={styles.lockedBadgeOverlay}><Text style={styles.lockedBadgeIcon}>🔒</Text></View>}
            </View>
          ))}
        </View>
      </View>

      {/* 5. BENEFITS SECTION */}
      <View style={styles.benefitsContainerCard}>
        <Text style={styles.benefitsSectionTitle}>Your CreditLoop Score Benefits</Text>
        
        <View style={[styles.benefitsTierListItem, score >= 800 ? styles.benefitsTierListItemActive : null]}>
          <View style={styles.tierIndicatorCircle}><Text style={{fontSize: 10}}>💎</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tierNameLabel}>Platinum Tier (800+ Score)</Text>
            <Text style={styles.tierBenefitsValue}>Up to 4.0x Chama Savings Loan • 5.0% Interest rate p.a. • Instant Auto-Approvals</Text>
          </View>
          {score >= 800 && <Text style={styles.activeTierIndicatorLabel}>Active</Text>}
        </View>

        <View style={[styles.benefitsTierListItem, (score >= 650 && score < 800) ? styles.benefitsTierListItemActive : null]}>
          <View style={styles.tierIndicatorCircle}><Text style={{fontSize: 10}}>⭐</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tierNameLabel}>Gold Tier (650 - 799 Score)</Text>
            <Text style={styles.tierBenefitsValue}>Up to 3.0x Chama Savings Loan • 7.5% Interest rate p.a. • Priority voting rights</Text>
          </View>
          {(score >= 650 && score < 800) && <Text style={styles.activeTierIndicatorLabel}>Active</Text>}
        </View>

        <View style={[styles.benefitsTierListItem, (score >= 400 && score < 650) ? styles.benefitsTierListItemActive : null]}>
          <View style={styles.tierIndicatorCircle}><Text style={{fontSize: 10}}>🔘</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.tierNameLabel}>Silver Tier (400 - 649 Score)</Text>
            <Text style={styles.tierBenefitsValue}>Up to 2.0x Chama Savings Loan • 10% Interest rate p.a. • Standard voting consensus</Text>
          </View>
          {(score >= 400 && score < 650) && <Text style={styles.activeTierIndicatorLabel}>Active</Text>}
        </View>
      </View>

      {/* 6. IMPROVEMENT RECOMMENDATIONS */}
      <View style={styles.recommendationsCardBox}>
        <Text style={styles.recommendationsBoxTitle}>Personal Recommendations</Text>
        
        <View style={styles.recommendationItemBox}>
          <Text style={styles.recommendationBullet}>💡</Text>
          <Text style={styles.recommendationTextBody}>
            Deposit your weekly KES 13,000 contribution before Friday to increase your Deposit Consistency score by <Text style={{fontWeight: "bold", color: "#0F9D58"}}>+5 pts</Text>.
          </Text>
        </View>

        {selectedUser.activeLoan > 0 && (
          <View style={styles.recommendationItemBox}>
            <Text style={styles.recommendationBullet}>💡</Text>
            <Text style={styles.recommendationTextBody}>
              Pay off your active business expansion loan ahead of schedule to claim the Reliable Borrower booster (<Text style={{fontWeight: "bold", color: "#0F9D58"}}>+25 pts</Text>).
            </Text>
          </View>
        )}

        <View style={styles.recommendationItemBox}>
          <Text style={styles.recommendationBullet}>💡</Text>
          <Text style={styles.recommendationTextBody}>
            Vote on active member loan request proposals. Participating in consensus signatures earns <Text style={{fontWeight: "bold", color: "#0F9D58"}}>+3 pts</Text> per broadcast vote.
          </Text>
        </View>
      </View>

      {/* 7. SHARE SCORE & CREDENTIAL VERIFICATION */}
      <View style={styles.qrCodeScannerValidationCard}>
        <Text style={styles.qrCodeScannerValidationCardTitle}>Reputation Verification</Text>
        <View style={{ padding: 12, backgroundColor: "#ffffff", borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0" }}>
          <QRCode
            value={`payloop:profile:${selectedUser.address}:${selectedUser.creditScore}`}
            size={130}
            color="#0F172A"
            backgroundColor="#ffffff"
          />
        </View>
        <Text style={styles.qrCodeLabelText}>On-chain reputation address: {selectedUser.address.substring(0, 16)}...</Text>
        
        <View style={styles.scoreVerificationBtnRow}>
          <TouchableOpacity onPress={handleShareScore} style={styles.scoreShareOutlineBtn}>
            <Text style={styles.scoreShareOutlineBtnText}>🔗 Share Reputation</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => Alert.alert("Exporting Report", "Generating and downloading your secure credit report... Saved as CreditLoop_Report_John.pdf")} 
            style={styles.scoreDownloadOutlineBtn}
          >
            <Text style={styles.scoreDownloadOutlineBtnText}>📋 Download Audit PDF</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 8. RECENT SCORE ACTIVITIES */}
      <View style={styles.activitiesContainerCard}>
        <Text style={styles.activitiesSectionTitle}>Recent Score Activities</Text>
        
        <View style={styles.activityRowLogItem}>
          <View style={styles.activityLeftPart}>
            <Text style={styles.activityDateLabel}>8 Jun 2026</Text>
            <Text style={styles.activityLogText}>Voted YES on Peter Mwangi's Loan Request</Text>
          </View>
          <Text style={styles.activityPointsEarnedGreen}>+3 pts</Text>
        </View>

        <View style={styles.activityRowLogItem}>
          <View style={styles.activityLeftPart}>
            <Text style={styles.activityDateLabel}>4 Jun 2026</Text>
            <Text style={styles.activityLogText}>Weekly Chama Vault deposit completed</Text>
          </View>
          <Text style={styles.activityPointsEarnedGreen}>+5 pts</Text>
        </View>

        <View style={styles.activityRowLogItem}>
          <View style={styles.activityLeftPart}>
            <Text style={styles.activityDateLabel}>28 May 2026</Text>
            <Text style={styles.activityLogText}>Repaid principal for Education Loan ID #2 early</Text>
          </View>
          <Text style={styles.activityPointsEarnedGreen}>+15 pts</Text>
        </View>
      </View>
    </ScrollView>
  );
}
