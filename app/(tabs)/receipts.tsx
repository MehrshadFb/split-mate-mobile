// app/(tabs)/receipts.tsx
// Saved receipts overview

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../src/components/Button";
import { useTheme } from "../../src/contexts/ThemeContext";
import { useInvoiceStore } from "../../src/stores/invoiceStore";
import { Invoice } from "../../src/types/invoice";

export default function ReceiptsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const {
    savedInvoices,
    loadSavedInvoices,
    setInvoice,
    setPeople,
    calculateTotals,
    setEditingSavedInvoice,
  } = useInvoiceStore();

  useEffect(() => {
    loadSavedInvoices();
  }, [loadSavedInvoices]);

  const handleOpenSavedInvoice = (invoice: Invoice) => {
    const cloned: Invoice = {
      ...invoice,
      people: [...invoice.people],
      items: invoice.items.map((item) => ({
        ...item,
        splitBetween: [...item.splitBetween],
      })),
      totals: invoice.totals.map((person) => ({ ...person })),
    };

    setPeople(cloned.people);
    setInvoice(cloned);
    calculateTotals();
    setEditingSavedInvoice(true);
    router.push("/assign-items");
  };

  const formatSavedDate = (timestamp?: string) => {
    if (!timestamp) {
      return "";
    }
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) {
      return "";
    }
    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background.primary }}
      edges={["top", "left", "right"]}
    >
      <ScrollView className="flex-1">
        <View className="p-6">
          <View className="mb-8">
            <Text
              style={{
                fontSize: 36,
                fontWeight: "bold",
                color: colors.text.primary,
                marginBottom: 8,
              }}
            >
              Saved Receipts
            </Text>
            <Text style={{ fontSize: 18, color: colors.text.secondary }}>
              Pick up a past split or keep everything organised.
            </Text>
          </View>

          {savedInvoices.length === 0 ? (
            <View
              style={{
                backgroundColor: colors.background.secondary,
                borderRadius: 20,
                padding: 32,
                alignItems: "center",
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Ionicons
                name="archive-outline"
                size={48}
                color={colors.text.tertiary}
              />
              <Text
                style={{
                  color: colors.text.primary,
                  fontWeight: "600",
                  fontSize: 20,
                  marginTop: 16,
                  textAlign: "center",
                }}
              >
                Nothing saved yet
              </Text>
              <Text
                style={{
                  color: colors.text.secondary,
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                When you save a split, it appears here for quick access.
              </Text>
              <View style={{ width: "100%", marginTop: 24 }}>
                <Button
                  title="Start a new receipt"
                  onPress={() => router.push("/(tabs)/mates")}
                  variant="primary"
                  size="large"
                  fullWidth
                  icon={<Ionicons name="sparkles" size={20} color="white" />}
                />
              </View>
            </View>
          ) : (
            <View>
              {savedInvoices.map((invoice) => (
                <TouchableOpacity
                  key={invoice.id}
                  onPress={() => handleOpenSavedInvoice(invoice)}
                  activeOpacity={0.8}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: colors.background.secondary,
                    borderRadius: 18,
                    padding: 18,
                    marginBottom: 14,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <View
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 16,
                      backgroundColor: colors.accent.light,
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 14,
                    }}
                  >
                    <Text
                      style={{
                        color: colors.accent.primary,
                        fontWeight: "700",
                        fontSize: 20,
                      }}
                    >
                      {invoice.items.length}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: colors.text.primary,
                        fontWeight: "700",
                        fontSize: 17,
                      }}
                    >
                      {formatSavedDate(invoice.savedAt || invoice.updatedAt)}
                    </Text>
                    <Text
                      style={{
                        color: colors.text.secondary,
                        marginTop: 4,
                      }}
                    >
                      {invoice.items.length} item
                      {invoice.items.length === 1 ? "" : "s"} ·{" "}
                      {invoice.people.length} mate
                      {invoice.people.length === 1 ? "" : "s"}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text
                      style={{
                        color: colors.accent.primary,
                        fontWeight: "700",
                        fontSize: 20,
                      }}
                    >
                      ${invoice.totalAmount.toFixed(2)}
                    </Text>
                    <Text
                      style={{
                        color: colors.text.tertiary,
                        marginTop: 4,
                        fontSize: 12,
                      }}
                    >
                      {invoice.people
                        .map((person) => person[0]?.toUpperCase())
                        .join(" · ")}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={22}
                    color={colors.text.tertiary}
                    style={{ marginLeft: 12 }}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
