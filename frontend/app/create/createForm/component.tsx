import HeaderBar from "@/components/HeaderBar";
import HorizontalImagePicker from "@/components/HorizontalImagePicker";
import InputBox from "@/components/InputBox";
import RadioSelect from "@/components/RadioSelect";
import ScreenWrapper from "@/components/ScreenWrapper";
import { Colors } from "@/constants/Colors";
import { useFieldState } from "@/hooks/useFieldState";
import { styles } from "@/utility/create/styles";
import { styles as settingStyles } from "@/utility/profile/settings/styles";
import { styles as profileStyles } from "@/utility/profile/styles";
import { Stack } from "expo-router";
import React from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { CreateFormState } from "./controller";
import EntryListFormContainer from "./entryListForm/container";
import { EntryItem } from "./entryListForm/controller";
import InstructionsFormContainer from "./instructionForm/container";

export type EntryController = {
  updateEntry: (
    type: keyof CreateFormState,
    index: number,
    field: keyof EntryItem,
    value: string
  ) => void;
  modifyEntry: (
    type: keyof CreateFormState,
    action: "add" | "remove",
    index?: number
  ) => void;
  selectSuggestion: (
    type: keyof CreateFormState,
    index: number,
    suggestion: string
  ) => void;
};

type Props = {
  create: ReturnType<typeof useFieldState<CreateFormState>>;
  controller: EntryController & {
    handleSubmit: () => void;
    updateInstruction: (index: number, text: string) => void;
    updateInstructionImage: (index: number) => void;
    modifyInstruction: (action: "add" | "remove", index?: number) => void;
    isFormValid: string | boolean;
  };
};

export default function CreateFormComponent({ create, controller }: Props) {
  const { setFieldState, title, content, images, postType, keyboardVisible } =
    create;

  const isRecipe = postType === "recipe";
  const isCommunity = postType === "community";
  const isTipsOrDiscussion = postType === "tips" || postType === "discussion";

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScreenWrapper>
        <KeyboardAvoidingView
          behavior="height"
          style={!keyboardVisible && { flexGrow: 1 }}
        >
          <TouchableWithoutFeedback
            onPress={() => {
              Keyboard.dismiss();
              setFieldState("focusedIndex", {
                ingredient: null,
                category: null,
                area: null,
              });
            }}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={profileStyles.headerContainer}
              contentContainerStyle={{
                flexGrow: 1,
                backgroundColor: Colors.brand.onPrimary,
                paddingBottom: 80,
              }}
            >
              <HeaderBar
                title={
                  isRecipe
                    ? "Create New Recipe"
                    : isCommunity
                    ? "Create New Community"
                    : "Create New Post"
                }
              />

              <View className="px-4 py-2">
                <Text style={styles.inputTitle}>Image</Text>
                <HorizontalImagePicker
                  images={images}
                  setImages={(newImages) => setFieldState("images", newImages)}
                  singleImageMode={isCommunity}
                />

                {isRecipe && (
                  <View className="mb-4">
                    <EntryListFormContainer
                      type="ingredient"
                      create={create}
                      controller={controller}
                      placeholder="Ingredient"
                      label="Ingredients"
                    />
                    <EntryListFormContainer
                      type="category"
                      create={create}
                      controller={controller}
                      placeholder="Category"
                    />
                    <EntryListFormContainer
                      type="mealtime"
                      create={create}
                      controller={controller}
                      placeholder="Select mealtime"
                    />
                    <EntryListFormContainer
                      type="area"
                      create={create}
                      controller={controller}
                      placeholder="e.g. Italian, Japanese"
                    />
                  </View>
                )}

                {isTipsOrDiscussion && (
                  <>
                    <Text style={styles.inputTitle}>Post Type</Text>
                    <RadioSelect
                      options={[
                        ["tips", "Tips & Advice"],
                        ["discussion", "Discussion"],
                      ]}
                      value={postType}
                      onSelect={(val) => setFieldState("postType", val)}
                    />
                  </>
                )}

                <Text style={styles.inputTitle}>
                  {isCommunity ? "Community Name" : "Title"}
                </Text>
                <InputBox
                  placeholder={
                    isCommunity ? "Enter community name" : "Enter post title"
                  }
                  value={title}
                  onChangeText={(text) => setFieldState("title", text)}
                  inputStyle={settingStyles.input}
                  limit={50}
                  isMultiline
                />

                <Text style={styles.inputTitle}>
                  {isCommunity || isRecipe ? (
                    <>
                      Description{" "}
                      <Text
                        style={{ color: Colors.feedback.unknown, fontSize: 12 }}
                      >
                        (optional)
                      </Text>
                    </>
                  ) : (
                    "Content"
                  )}
                </Text>
                <InputBox
                  placeholder={
                    isCommunity
                      ? "Briefly introduce your community"
                      : isRecipe
                      ? "Add a short description of your recipe"
                      : "Share your thoughts or ask a question"
                  }
                  value={content}
                  onChangeText={(text) => setFieldState("content", text)}
                  inputStyle={settingStyles.input}
                  limit={isCommunity || isRecipe ? 160 : 2000}
                  isMultiline
                />

                {isRecipe && (
                  <InstructionsFormContainer
                    instructions={create.instructions}
                    modifyInstruction={controller.modifyInstruction}
                    updateInstruction={controller.updateInstruction}
                    updateInstructionImage={controller.updateInstructionImage}
                  />
                )}

                <TouchableOpacity
                  testID="submit-button"
                  style={[
                    settingStyles.saveButton,
                    { opacity: controller.isFormValid ? 1 : 0.5 },
                  ]}
                  onPress={controller.handleSubmit}
                  disabled={!controller.isFormValid}
                >
                  <Text style={settingStyles.saveButtonText}>Submit</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </ScreenWrapper>
    </>
  );
}
