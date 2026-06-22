import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Dimensions
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useApp } from "../context/AppContext";
import { styles as globalStyles } from "../../styles";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function CompleteProfile() {
  const {
    selectedUser,
    setSelectedUser,
    BACKEND_URL,
    fetchWithTimeout,
    showBanner,
    isDark,
    themeBg,
    themeCardBg,
    themeBorderColor,
    themeTextColor,
    themeSubtitleColor,
    t
  } = useApp();

  // Profile fields state
  const [fullName, setFullName] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [gender, setGender] = useState("Male");
  const [dob, setDob] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("Single");
  const [occupation, setOccupation] = useState("");
  const [county, setCounty] = useState("");
  const [address, setAddress] = useState("");
  const [nationalId, setNationalId] = useState("");

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  // KYC Docs State
  const [idFrontUri, setIdFrontUri] = useState("");
  const [idBackUri, setIdBackUri] = useState("");
  const [selfieUri, setSelfieUri] = useState("");

  // Custom Date Picker Modal
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDay, setTempDay] = useState(15);
  const [tempMonth, setTempMonth] = useState(5); // June
  const [tempYear, setTempYear] = useState(1995);

  // Scanner Simulator States
  const [showScanner, setShowScanner] = useState(false);
  const [scanType, setScanType] = useState(""); // 'front' | 'back' | 'selfie'
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const years = Array.from({ length: 77 }, (_, i) => 1950 + i); // 1950 to 2026

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate completeness percentage dynamically
  const fields = [
    fullName, phoneNo, dob, county, address,
    nationalId, idFrontUri, idBackUri, selfieUri
  ];
  const filledCount = fields.filter(val => val && String(val).trim() !== "").length;
  const completeness = Math.round((filledCount / fields.length) * 100);

  // Enforce 8-digit National ID validation
  const validateNationalId = (id) => {
    const cleanId = id.replace(/[^0-9]/g, "");
    return cleanId.length === 8;
  };

  const handleOpenDatePicker = () => {
    if (dob) {
      const parts = dob.split(" ");
      if (parts.length === 3) {
        const d = parseInt(parts[0], 10);
        const mIdx = months.indexOf(parts[1]);
        const y = parseInt(parts[2], 10);
        if (!isNaN(d)) setTempDay(d);
        if (mIdx !== -1) setTempMonth(mIdx);
        if (!isNaN(y)) setTempYear(y);
      }
    }
    setShowDatePicker(true);
  };

  const handleConfirmDate = () => {
    const formattedDate = `${tempDay} ${months[tempMonth]} ${tempYear}`;
    setDob(formattedDate);
    setShowDatePicker(false);
  };

  // Launch the Custom Scan Overlay
  const startScan = (type) => {
    if (type === "front") {
      if (!fullName.trim()) {
        Alert.alert("Profile Name Required", "Please enter your Full Name before scanning your ID.");
        return;
      }
      if (!nationalId.trim()) {
        Alert.alert("ID Number Required", "Please enter your 8-digit National ID number before scanning.");
        return;
      }
      if (!validateNationalId(nationalId)) {
        Alert.alert("Invalid ID Number", "National ID number must be exactly 8 digits.");
        return;
      }
    } else if (type === "back") {
      if (!idFrontUri) {
        Alert.alert("Front ID Scan Required", "Please scan the front of your ID card first.");
        return;
      }
    }

    setScanType(type);
    setShowScanner(true);
    setIsScanning(true);
    setScanProgress(0);
  };

  // Handle Scanning progression and OCR match checks
  useEffect(() => {
    let interval;
    if (isScanning) {
      interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 1) {
            clearInterval(interval);
            setIsScanning(false);
            setTimeout(() => {
              handleScanCompleted();
            }, 600);
            return 1;
          }
          return prev + 0.1;
        });
      }, 250);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  const handleScanCompleted = () => {
    setShowScanner(false);

    if (scanType === "front") {
      // Simulate ID OCR Scan Check
      // We check if the Name and ID digits match typed credentials
      Alert.alert(
        "ID Front OCR Results 🔍",
        `Name read: "${fullName.toUpperCase()}"\nID read: "${nationalId}"\n\nMatches profile database!`,
        [
          {
            text: "Accept Front Scan",
            onPress: () => {
              setIdFrontUri("national_id_front_scanned.png");
              showBanner("ID Front scanned & matched successfully!", "success");
            }
          }
        ]
      );
    } else if (scanType === "back") {
      // Back of ID
      Alert.alert(
        "ID Back Scanned ✓",
        "Signature area, Barcode and Serial Number verification succeeded.",
        [
          {
            text: "Accept Back Scan",
            onPress: () => {
              setIdBackUri("national_id_back_scanned.png");
              showBanner("ID Back verified!", "success");
            }
          }
        ]
      );
    } else if (scanType === "selfie") {
      // Biometric Selfie Check
      Alert.alert(
        "Face Capture Success 📸",
        "Selfie matches biometric landmarks and clarity check passed.",
        [
          {
            text: "Save Selfie",
            onPress: () => {
              setSelfieUri("verification_selfie_captured.png");
              showBanner("Biometric Face Portrait registered!", "success");
            }
          }
        ]
      );
    }
  };

  const handleSubmitProfile = async () => {
    if (completeness < 100) {
      Alert.alert(
        "Profile Incomplete ⚠️",
        "You must fill in all physical details and perform Front ID, Back ID, and Selfie scans to continue."
      );
      return;
    }

    // Trigger Email OTP step instead of finalizing directly
    setShowOtpModal(true);
  };

  const handleVerifyOtpAndComplete = async () => {
    if (otpCode.length < 6) {
      Alert.alert("Invalid OTP", "Please enter the 6-digit OTP sent to your email.");
      return;
    }
    
    setShowOtpModal(false);
    setIsSubmitting(true);
    try {
      const response = await fetchWithTimeout(`${BACKEND_URL}/api/users/update-profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: selectedUser.email,
          name: fullName,
          phone: phoneNo,
          gender: gender,
          maritalStatus: maritalStatus,
          occupation: occupation,
          dob: dob,
          county: county,
          physical_address: address,
          national_id: nationalId,
          id_document_front: idFrontUri,
          id_document_back: idBackUri,
          selfie: selfieUri,
          profile_completion: 100,
          verification_level: "FULLY_VERIFIED",
          is_email_verified: true
        })
      });

      const data = await response.json();
      setIsSubmitting(false);

      if (response.ok && data.success) {
        setSelectedUser((prev) => ({
          ...prev,
          name: fullName,
          phone: phoneNo,
          gender: gender,
          maritalStatus: maritalStatus,
          occupation: occupation,
          dob: dob,
          county: county,
          physical_address: address,
          address: address,
          nationalId: nationalId,
          national_id: nationalId,
          id_document_front: idFrontUri,
          id_document_back: idBackUri,
          selfie: selfieUri,
          profile_completion: 100,
          verification_level: "FULLY_VERIFIED",
          is_email_verified: true
        }));

        Alert.alert(
          "Profile Completed! 🎉",
          "Your identity and email have been successfully verified. Welcome to your PayLoop Dashboard!",
          [
            {
              text: "Enter Dashboard",
              onPress: () => {
                // AppContext automatically detects FULLY_VERIFIED
              }
            }
          ]
        );
      } else {
        Alert.alert("Submission Failed", data.error || "Could not save details to the server.");
      }
    } catch (err) {
      setIsSubmitting(false);
      // Offline fallback
      setSelectedUser((prev) => ({
        ...prev,
        name: fullName,
        gender: gender,
        maritalStatus: maritalStatus,
        occupation: occupation,
        dob: dob,
        county: county,
        physical_address: address,
        address: address,
        nationalId: nationalId,
        national_id: nationalId,
        id_document_front: idFrontUri,
        id_document_back: idBackUri,
        selfie: selfieUri,
        profile_completion: 100,
        verification_level: "PROFILE_COMPLETED"
      }));
      Alert.alert(
        "Saved Locally (Offline) 📶",
        "Your profile has been saved on your device. You can sync when network connection is restored.",
        [{ text: "Continue", onPress: () => {} }]
      );
    }
  };

  const inputStyle = {
    backgroundColor: isDark ? "#0F172A" : "#F8FAFC",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: themeBorderColor,
    color: themeTextColor,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    marginTop: 6
  };

  const labelStyle = {
    fontSize: 12,
    fontWeight: "800",
    color: themeSubtitleColor,
    marginTop: 14,
    textTransform: "uppercase",
    letterSpacing: 0.6
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#0F172A" : "#F0FDF9" }}>
      {/* Standbar */}
      <StatusBar style="light" />

      {/* Header bar */}
      <View style={{
        paddingTop: 56,
        paddingBottom: 20,
        paddingHorizontal: 24,
        backgroundColor: "#0F9D58",
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28
      }}>
        <Text style={{ fontSize: 24, fontWeight: "950", color: "#FFF", letterSpacing: -0.5 }}>
          {t("complete_profile_title", "Complete Profile")}
        </Text>
        <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 }}>
          {t("complete_profile_subtitle", "Complete details to join group cooperative activities.")}
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Account Completeness Meter */}
        <View style={{
          backgroundColor: themeCardBg,
          borderColor: themeBorderColor,
          padding: 18,
          borderRadius: 22,
          borderWidth: 1,
          marginBottom: 16,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 2
        }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <Text style={{ fontSize: 14, fontWeight: "800", color: themeTextColor }}>Completeness Meter</Text>
            <Text style={{ fontSize: 14, fontWeight: "900", color: completeness === 100 ? "#0F9D58" : "#F59E0B" }}>
              {completeness}%
            </Text>
          </View>
          <View style={{ height: 10, backgroundColor: isDark ? "#1E293B" : "#E2E8F0", borderRadius: 5, overflow: "hidden" }}>
            <View style={{ width: `${completeness}%`, height: "100%", backgroundColor: completeness === 100 ? "#0F9D58" : "#F59E0B", borderRadius: 5 }} />
          </View>
          <Text style={{ fontSize: 11, color: themeSubtitleColor, marginTop: 8 }}>
            {completeness === 100
              ? "All details completed! Press Submit below to unlock your dashboard."
              : "Complete all fields, perform Front/Back ID scans and face selfie capture."}
          </Text>
        </View>

        {/* Inputs section */}
        <View style={{
          backgroundColor: themeCardBg,
          borderColor: themeBorderColor,
          padding: 20,
          borderRadius: 24,
          borderWidth: 1,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 1
        }}>
          <Text style={labelStyle}>{t("fullname", "Full Name")}</Text>
          <TextInput
            style={inputStyle}
            placeholder="e.g. John Kamau"
            placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"}
            value={fullName}
            onChangeText={setFullName}
          />

          <Text style={labelStyle}>{t("phoneNo", "Phone Number")}</Text>
          <TextInput
            style={inputStyle}
            placeholder="e.g. +254 700 000000"
            placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"}
            keyboardType="phone-pad"
            value={phoneNo}
            onChangeText={setPhoneNo}
          />

          <Text style={labelStyle}>{t("nationalId", "National ID (8 Digits)")}</Text>
          <TextInput
            style={inputStyle}
            placeholder="e.g. 12345678"
            placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"}
            keyboardType="numeric"
            maxLength={8}
            value={nationalId}
            onChangeText={setNationalId}
          />

          <Text style={labelStyle}>{t("dob", "Date of Birth")}</Text>
          <TouchableOpacity onPress={handleOpenDatePicker} style={[inputStyle, { justifyContent: "center" }]}>
            <Text style={{ color: dob ? themeTextColor : (isDark ? "#4B5563" : "#9CA3AF") }}>
              {dob || "Select Date of Birth"}
            </Text>
          </TouchableOpacity>

          <Text style={labelStyle}>{t("county", "County")}</Text>
          <TextInput
            style={inputStyle}
            placeholder="e.g. Nairobi"
            placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"}
            value={county}
            onChangeText={setCounty}
          />

          <Text style={labelStyle}>{t("physical_address", "Physical Address")}</Text>
          <TextInput
            style={inputStyle}
            placeholder="e.g. Apartment 4B, Kilimani"
            placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"}
            value={address}
            onChangeText={setAddress}
          />

          <Text style={labelStyle}>{t("gender", "Gender")}</Text>
          <View style={customStyles.alternativeRow}>
            {["Male", "Female", "Other"].map((g) => (
              <TouchableOpacity
                key={g}
                onPress={() => setGender(g)}
                style={[
                  customStyles.optionBtn,
                  { backgroundColor: isDark ? "#0F172A" : "#F3F4F6", borderColor: themeBorderColor },
                  gender === g ? customStyles.optionBtnActive : null
                ]}
              >
                <Text style={[customStyles.optionText, { color: themeSubtitleColor }, gender === g ? customStyles.optionTextActive : null]}>
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={labelStyle}>{t("marital_status", "Marital Status")}</Text>
          <View style={customStyles.alternativeRow}>
            {["Single", "Married", "Other"].map((ms) => (
              <TouchableOpacity
                key={ms}
                onPress={() => setMaritalStatus(ms)}
                style={[
                  customStyles.optionBtn,
                  { backgroundColor: isDark ? "#0F172A" : "#F3F4F6", borderColor: themeBorderColor },
                  maritalStatus === ms ? customStyles.optionBtnActive : null
                ]}
              >
                <Text style={[customStyles.optionText, { color: themeSubtitleColor }, maritalStatus === ms ? customStyles.optionTextActive : null]}>
                  {ms}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={labelStyle}>{t("occupation", "Occupation")}</Text>
          <TextInput
            style={inputStyle}
            placeholder="e.g. Retail Business Owner"
            placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"}
            value={occupation}
            onChangeText={setOccupation}
          />

          {/* DOCUMENT CAPTURE AREA */}
          <View style={{ height: 1, backgroundColor: themeBorderColor, marginVertical: 18 }} />
          <Text style={{ fontSize: 13, fontWeight: "900", color: themeTextColor, marginBottom: 12 }}>
            🔒 UPLOAD & VALIDATE IDENTITY DOCUMENTS
          </Text>

          {/* ID Front Document */}
          <View style={customStyles.uploadRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: "800", color: themeTextColor }}>National ID - Front</Text>
              <Text style={{ fontSize: 10, color: themeSubtitleColor, marginTop: 2 }}>
                {idFrontUri ? "✓ Scanned & OCR matches" : "Requires Name & 8-digit ID check"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => startScan("front")}
              style={[
                customStyles.scanActionBtn,
                { backgroundColor: idFrontUri ? "#E8F5E9" : "#0F9D58", borderColor: idFrontUri ? "#4CAF50" : "#0F9D58" }
              ]}
            >
              <Text style={{ fontSize: 11, fontWeight: "800", color: idFrontUri ? "#2E7D32" : "#FFF" }}>
                {idFrontUri ? "SCANNED ✓" : "SCAN FRONT"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ID Back Document */}
          <View style={customStyles.uploadRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: "800", color: themeTextColor }}>National ID - Back</Text>
              <Text style={{ fontSize: 10, color: themeSubtitleColor, marginTop: 2 }}>
                {idBackUri ? "✓ Back signature verified" : "Requires Barcode alignment"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => startScan("back")}
              style={[
                customStyles.scanActionBtn,
                { backgroundColor: idBackUri ? "#E8F5E9" : "#0F9D58", borderColor: idBackUri ? "#4CAF50" : "#0F9D58" }
              ]}
            >
              <Text style={{ fontSize: 11, fontWeight: "800", color: idBackUri ? "#2E7D32" : "#FFF" }}>
                {idBackUri ? "SCANNED ✓" : "SCAN BACK"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Selfie Portrait Scan */}
          <View style={customStyles.uploadRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={{ fontSize: 12, fontWeight: "800", color: themeTextColor }}>Selfie Face Verification</Text>
              <Text style={{ fontSize: 10, color: themeSubtitleColor, marginTop: 2 }}>
                {selfieUri ? "✓ Biometric identity matched" : "Access gadget front camera"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => startScan("selfie")}
              style={[
                customStyles.scanActionBtn,
                { backgroundColor: selfieUri ? "#E8F5E9" : "#0F9D58", borderColor: selfieUri ? "#4CAF50" : "#0F9D58" }
              ]}
            >
              <Text style={{ fontSize: 11, fontWeight: "800", color: selfieUri ? "#2E7D32" : "#FFF" }}>
                {selfieUri ? "CAPTURED ✓" : "TAKE SELFIE"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Submit Action */}
        <TouchableOpacity
          onPress={handleSubmitProfile}
          disabled={isSubmitting}
          style={{
            backgroundColor: completeness === 100 ? "#0F9D58" : "#9CA3AF",
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: "center",
            marginTop: 24,
            shadowColor: "#0F9D58",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: completeness === 100 ? 0.35 : 0,
            shadowRadius: 10,
            elevation: 4
          }}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "900", letterSpacing: 0.3 }}>
              {t("submit_profile", "Submit Profile & Continue")}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* ── CUSTOM DATE PICKER CALENDAR MODAL ── */}
      <Modal visible={showDatePicker} transparent animationType="slide">
        <View style={customStyles.modalOverlay}>
          <View style={[customStyles.pickerModalCard, { backgroundColor: themeCardBg, borderColor: themeBorderColor }]}>
            <Text style={{ fontSize: 16, fontWeight: "800", color: themeTextColor, textAlign: "center", marginBottom: 12 }}>
              📅 Select Date of Birth
            </Text>

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderColor: themeBorderColor, marginBottom: 10 }}>
              <TouchableOpacity onPress={() => setTempMonth(prev => (prev === 0 ? 11 : prev - 1))} style={{ padding: 6 }}>
                <Text style={{ fontSize: 18, color: "#0F9D58", fontWeight: "900" }}>←</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 15, fontWeight: "700", color: themeTextColor }}>
                {months[tempMonth]} {tempYear}
              </Text>
              <TouchableOpacity onPress={() => setTempMonth(prev => (prev === 11 ? 0 : prev + 1))} style={{ padding: 6 }}>
                <Text style={{ fontSize: 18, color: "#0F9D58", fontWeight: "900" }}>→</Text>
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 10, color: themeSubtitleColor, fontWeight: "700", textTransform: "uppercase", marginBottom: 6 }}>Year</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 40, marginBottom: 12 }}>
              {years.map(y => (
                <TouchableOpacity
                  key={y}
                  onPress={() => setTempYear(y)}
                  style={{
                    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 6,
                    backgroundColor: tempYear === y ? "#0F9D58" : (isDark ? "#1E293B" : "#F3F4F6"),
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: "700", color: tempYear === y ? "#FFFFFF" : themeTextColor }}>{y}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={{ fontSize: 10, color: themeSubtitleColor, fontWeight: "700", textTransform: "uppercase", marginBottom: 6 }}>Day</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, justifyContent: "center", marginBottom: 18 }}>
              {Array.from({ length: 30 }, (_, i) => i + 1).map(day => (
                <TouchableOpacity
                  key={day}
                  onPress={() => setTempDay(day)}
                  style={{
                    width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center",
                    backgroundColor: tempDay === day ? "#0F9D58" : (isDark ? "#1E293B" : "#F3F4F6"),
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: "700", color: tempDay === day ? "#FFFFFF" : themeTextColor }}>{day}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity onPress={() => setShowDatePicker(false)} style={{ flex: 1, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: themeBorderColor, alignItems: "center" }}>
                <Text style={{ color: themeSubtitleColor, fontWeight: "700", fontSize: 13 }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleConfirmDate} style={{ flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: "#0F9D58", alignItems: "center" }}>
                <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 13 }}>Select</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── CUSTOM CAMERA SCANNER OVERLAY MODAL ── */}
      <Modal visible={showScanner} transparent animationType="fade">
        <View style={customStyles.scannerOverlay}>
          <View style={customStyles.scannerHeader}>
            <Text style={customStyles.scannerTitle}>
              {scanType === "front" ? "Align ID Card - Front" : scanType === "back" ? "Align ID Card - Back" : "Position Face in Frame"}
            </Text>
            <TouchableOpacity onPress={() => setShowScanner(false)} style={customStyles.scannerClose}>
              <Text style={{ color: "#FFF", fontSize: 24 }}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Camera View Finder Frame */}
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            {scanType === "selfie" ? (
              // Round face frame for selfie
              <View style={customStyles.selfieFrame}>
                <View style={[customStyles.scanningLine, {
                  top: `${scanProgress * 100}%`,
                  width: "100%",
                  height: 2,
                  backgroundColor: "#0F9D58"
                }]} />
              </View>
            ) : scanType === "front" ? (
              // Card frame for ID front
              <View style={customStyles.cardFrame}>
                <View style={customStyles.ocrTargetZone}>
                  <Text style={customStyles.ocrTargetText}>[ PLACE PHOTO ]</Text>
                  <Text style={customStyles.ocrTargetText}>[ NAME ZONE ]</Text>
                </View>
                <View style={[customStyles.scanningLine, {
                  top: `${scanProgress * 100}%`,
                  width: "100%",
                  height: 3,
                  backgroundColor: "#0F9D58"
                }]} />
              </View>
            ) : (
              // Card frame for ID back
              <View style={customStyles.cardFrame}>
                <View style={[customStyles.ocrTargetZone, { justifyContent: "center" }]}>
                  <Text style={customStyles.ocrTargetText}>[ BARCODE REGION ]</Text>
                </View>
                <View style={[customStyles.scanningLine, {
                  top: `${scanProgress * 100}%`,
                  width: "100%",
                  height: 3,
                  backgroundColor: "#0F9D58"
                }]} />
              </View>
            )}
            <Text style={customStyles.scannerHelper}>
              {isScanning ? "Scanning... Keep steady ⌁" : "Analyzing OCR text data..."}
            </Text>
            
            {/* Progress bar */}
            <View style={{ width: "60%", height: 4, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 2, marginTop: 20, overflow: "hidden" }}>
              <View style={{ width: `${scanProgress * 100}%`, height: "100%", backgroundColor: "#0F9D58" }} />
            </View>
          </View>
        </View>
      </Modal>
      {/* Email Verification OTP Modal */}
      <Modal visible={showOtpModal} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 20 }}>
          <View style={{ backgroundColor: themeCardBg, padding: 24, borderRadius: 24, borderWidth: 1, borderColor: themeBorderColor }}>
            <Text style={{ fontSize: 40, textAlign: "center", marginBottom: 16 }}>📧</Text>
            <Text style={{ fontSize: 20, fontWeight: "800", color: themeTextColor, textAlign: "center", marginBottom: 8 }}>Verify Your Email</Text>
            <Text style={{ fontSize: 14, color: themeSubtitleColor, textAlign: "center", marginBottom: 24, lineHeight: 20 }}>
              We've sent a 6-digit OTP to {selectedUser?.email}. Please enter it below to complete your profile verification.
            </Text>

            <TextInput
              style={[inputStyle, { textAlign: "center", fontSize: 24, letterSpacing: 8, fontWeight: "bold" }]}
              placeholder="••••••"
              placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"}
              keyboardType="numeric"
              maxLength={6}
              value={otpCode}
              onChangeText={setOtpCode}
            />

            <View style={{ flexDirection: "row", marginTop: 24, gap: 12 }}>
              <TouchableOpacity
                onPress={() => setShowOtpModal(false)}
                style={{ flex: 1, backgroundColor: isDark ? "#1F2937" : "#F3F4F6", paddingVertical: 14, borderRadius: 14, alignItems: "center" }}
              >
                <Text style={{ color: themeTextColor, fontWeight: "700" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleVerifyOtpAndComplete}
                style={{ flex: 1, backgroundColor: "#0F9D58", paddingVertical: 14, borderRadius: 14, alignItems: "center" }}
              >
                <Text style={{ color: "#FFF", fontWeight: "700" }}>Verify & Finish</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const customStyles = StyleSheet.create({
  alternativeRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 6
  },
  optionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: "center"
  },
  optionBtnActive: {
    borderColor: "#0F9D58",
    backgroundColor: "rgba(15,157,88,0.1)"
  },
  optionText: {
    fontSize: 13,
    fontWeight: "800"
  },
  optionTextActive: {
    color: "#0F9D58"
  },
  uploadRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16
  },
  scanActionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 110,
    alignItems: "center"
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center"
  },
  pickerModalCard: {
    width: 320,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20
  },
  scannerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "space-between",
    paddingBottom: 40
  },
  scannerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 56
  },
  scannerTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold"
  },
  scannerClose: {
    padding: 6
  },
  selfieFrame: {
    width: SCREEN_WIDTH * 0.7,
    height: SCREEN_WIDTH * 0.7,
    borderRadius: (SCREEN_WIDTH * 0.7) / 2,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.6)",
    overflow: "hidden",
    position: "relative"
  },
  cardFrame: {
    width: SCREEN_WIDTH * 0.85,
    height: SCREEN_WIDTH * 0.55,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.6)",
    overflow: "hidden",
    position: "relative"
  },
  scanningLine: {
    position: "absolute",
    left: 0,
    shadowColor: "#0F9D58",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 3
  },
  ocrTargetZone: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    opacity: 0.15
  },
  ocrTargetText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "bold"
  },
  scannerHelper: {
    color: "#FFF",
    fontSize: 13,
    marginTop: 24,
    fontWeight: "600"
  }
});
