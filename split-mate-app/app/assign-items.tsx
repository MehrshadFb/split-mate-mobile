import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
    AssignItemsHeader,
    CustomSplitModal,
    EmptyItemsList,
    ItemCard,
    ManagePeopleSection,
    ReceiptDatePicker,
    ReceiptTitleEditor,
    SplitSummary,
} from "../src/features/assign-items/components";
import {
    useItemManagement,
    usePeopleManagement,
    useReceiptActions,
    useReceiptTitle,
    useShareReceipt,
} from "../src/features/assign-items/hooks";
import { Button } from "../src/shared/components/Button";
import { ICON_SIZE, SPACING } from "../src/shared/constants/design";
import { useTheme } from "../src/shared/contexts/ThemeContext";
import { useInvoiceStore } from "../src/shared/stores/invoiceStore";
import { getLocalDateString } from "../src/shared/utils/dateUtils";

export default function AssignItemsScreen() {
  const { colors } = useTheme();
  const {
    currentInvoice,
    people,
    editingSavedInvoice,
    setInvoiceDate,
    togglePersonPaid,
  } = useInvoiceStore();
  const {
    isEditingTitle,
    tempTitle,
    getDisplayTitle,
    handleStartEditingTitle,
    handleSaveTitle,
    handleChangeTitleText,
  } = useReceiptTitle();
  const { handleDone, handleBack, handleDeleteReceipt } = useReceiptActions(
    getDisplayTitle,
    isEditingTitle,
    tempTitle
  );
  const { isGenerating, shareReceipt } = useShareReceipt();
  const {
    showManagePeople,
    setShowManagePeople,
    newPersonName,
    setNewPersonName,
    handleAddPerson,
    handleRemovePerson,
  } = usePeopleManagement();
  const {
    editingItem,
    handleAddItem,
    handleStartEdit,
    handleSaveEdit,
    handleCancelEdit,
    handleChangeName,
    handleChangePrice,
    handleDeleteItem,
    handleTogglePerson,
    handleUpdateShares,
  } = useItemManagement();
  const [adjustingSplitIndex, setAdjustingSplitIndex] = useState<number | null>(
    null
  );

  if (!currentInvoice) {
    return null;
  }

  const totalAmount = currentInvoice.items.reduce(
    (sum, item) => sum + item.price,
    0
  );
  const adjustingItem =
    adjustingSplitIndex !== null
      ? currentInvoice.items[adjustingSplitIndex] ?? null
      : null;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background.primary }}
    >
      {/* Sticky Header */}
      <View
        style={{
          paddingHorizontal: SPACING["2xl"],
          paddingTop: SPACING.md,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.background.primary,
        }}
      >
        <AssignItemsHeader
          onBack={handleBack}
          onDone={handleDone}
          showDone={currentInvoice.items.length > 0}
          onShare={() => shareReceipt(currentInvoice)}
          showShare={editingSavedInvoice && !!currentInvoice?.id}
          isSharing={isGenerating}
        />
      </View>
      <ScrollView className="flex-1">
        <View className="px-6 pb-6 pt-4">
          {/* Receipt Title Editor */}
          <ReceiptTitleEditor
            value={isEditingTitle ? tempTitle : getDisplayTitle()}
            isEditing={isEditingTitle}
            onFocus={handleStartEditingTitle}
            onChange={handleChangeTitleText}
            onBlur={handleSaveTitle}
          />
          {/* Receipt Date Picker */}
          <ReceiptDatePicker
            value={currentInvoice.date || getLocalDateString()}
            onChange={setInvoiceDate}
          />
          {/* Manage People Section */}
          <ManagePeopleSection
            people={people}
            isExpanded={showManagePeople}
            newPersonName={newPersonName}
            onToggleExpanded={() => setShowManagePeople(!showManagePeople)}
            onNewPersonNameChange={setNewPersonName}
            onAddPerson={handleAddPerson}
            onRemovePerson={handleRemovePerson}
          />
          {/* Items List */}
          <View className="mb-6">
            {currentInvoice.items.length === 0 ? (
              <EmptyItemsList />
            ) : (
              currentInvoice.items.map((item, index) => (
                <ItemCard
                  key={index}
                  item={item}
                  index={index}
                  people={people}
                  isEditing={editingItem?.index === index}
                  editName={editingItem?.name || ""}
                  editPrice={editingItem?.price || ""}
                  onStartEdit={() => handleStartEdit(index, item)}
                  onSaveEdit={handleSaveEdit}
                  onCancelEdit={handleCancelEdit}
                  onChangeName={handleChangeName}
                  onChangePrice={handleChangePrice}
                  onDelete={() => handleDeleteItem(index)}
                  onTogglePerson={(person) => handleTogglePerson(index, person)}
                  onAdjustSplit={() => setAdjustingSplitIndex(index)}
                />
              ))
            )}
          </View>
          {/* Add Item Button */}
          <Button
            title="Add New Item"
            onPress={handleAddItem}
            variant="outline"
            size="medium"
            fullWidth
            icon={
              <Ionicons name="add-circle-outline" size={ICON_SIZE.md} color={colors.accent.primary} />
            }
          />
          {/* Split Summary */}
          {currentInvoice.items.length > 0 &&
            currentInvoice.totals?.length > 0 && (
              <SplitSummary
                totalAmount={totalAmount}
                totals={currentInvoice.totals}
                paidBy={currentInvoice.paidBy ?? []}
                onTogglePersonPaid={togglePersonPaid}
              />
            )}
          {/* Delete (only when editing an existing receipt) */}
          {editingSavedInvoice && !!currentInvoice?.id && (
            <View style={{ marginTop: SPACING["3xl"], marginBottom: SPACING.xl }}>
              <Button
                title="Delete Receipt"
                onPress={handleDeleteReceipt}
                variant="danger"
                size="large"
                fullWidth
                icon={
                  <Ionicons
                    name="trash-outline"
                    size={ICON_SIZE.md}
                    color={colors.error}
                  />
                }
              />
            </View>
          )}
        </View>
      </ScrollView>
      <CustomSplitModal
        visible={adjustingItem !== null}
        itemName={adjustingItem?.name ?? ""}
        price={adjustingItem?.price ?? 0}
        splitBetween={adjustingItem?.splitBetween ?? []}
        shares={adjustingItem?.shares}
        onClose={() => setAdjustingSplitIndex(null)}
        onSave={(shares) => {
          if (adjustingSplitIndex !== null) {
            handleUpdateShares(adjustingSplitIndex, shares);
          }
          setAdjustingSplitIndex(null);
        }}
      />
    </SafeAreaView>
  );
}
