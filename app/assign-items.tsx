// app/assign-items.tsx
// Items assignment screen - assign items to people (NOT a tab)

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  AssignItemsHeader,
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
} from "../src/features/assign-items/hooks";
import { Button } from "../src/shared/components/Button";
import { useTheme } from "../src/shared/contexts/ThemeContext";
import { useInvoiceStore } from "../src/shared/stores/invoiceStore";

export default function AssignItemsScreen() {
  const { colors } = useTheme();
  const { currentInvoice, people, editingSavedInvoice, setInvoiceDate } = useInvoiceStore();
  const {
    isEditingTitle,
    tempTitle,
    getDisplayTitle,
    handleStartEditingTitle,
    handleSaveTitle,
    handleChangeTitleText,
  } = useReceiptTitle();
  const { isSaving, handleSaveInvoice, handleBack, handleDeleteReceipt } =
    useReceiptActions(getDisplayTitle, isEditingTitle, tempTitle);
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
  } = useItemManagement();

  if (!currentInvoice) {
    return null;
  }

  const totalAmount = currentInvoice.items.reduce(
    (sum, item) => sum + item.price,
    0
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background.primary }}
    >
      <ScrollView className="flex-1">
        <View className="p-6">
          {/* Header */}
          <AssignItemsHeader
            onBack={handleBack}
            onDelete={handleDeleteReceipt}
            showDelete={editingSavedInvoice && !!currentInvoice?.id}
          />
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
            value={currentInvoice.date || new Date().toISOString().split('T')[0]}
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
              <Ionicons name="add-circle-outline" size={20} color="#D97757" />
            }
          />
          {/* Split Summary */}
          {currentInvoice.items.length > 0 &&
            currentInvoice.totals?.length > 0 && (
              <SplitSummary
                totalAmount={totalAmount}
                totals={currentInvoice.totals}
              />
            )}
          {/* Save Button - Always visible */}
          <View style={{ marginTop: 32, marginBottom: 20 }}>
            <Button
              title={editingSavedInvoice ? "Update Receipt" : "Save Receipt"}
              onPress={handleSaveInvoice}
              variant="primary"
              size="large"
              fullWidth
              loading={isSaving}
              icon={
                <Ionicons
                  name="download-outline"
                  size={20}
                  color={colors.text.inverse}
                />
              }
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
