import { icons } from "@/constants/icons";
import dayjs from "dayjs";
import cn from "clsx";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

type CreateSubscriptionModalProps = {
  visible: boolean;
  onClose: () => void;
  onCreate: (subscription: Subscription) => void;
};

type FormErrors = {
  name?: string;
  price?: string;
};

const FREQUENCY_OPTIONS = ["Monthly", "Yearly"] as const;
const CATEGORY_OPTIONS = [
  "Entertainment",
  "AI Tools",
  "Developer Tools",
  "Design",
  "Productivity",
  "Cloud",
  "Music",
  "Other",
] as const;

const CATEGORY_COLORS: Record<(typeof CATEGORY_OPTIONS)[number], string> = {
  Entertainment: "#f6d26b",
  "AI Tools": "#b8d4e3",
  "Developer Tools": "#e8def8",
  Design: "#b8e8d0",
  Productivity: "#ffd7ba",
  Cloud: "#bfd7ff",
  Music: "#ffc8dd",
  Other: "#d8dbe2",
};

const INITIAL_CATEGORY = CATEGORY_OPTIONS[0];
const INITIAL_FREQUENCY = FREQUENCY_OPTIONS[0];

const CreateSubscriptionModal = ({
  visible,
  onClose,
  onCreate,
}: CreateSubscriptionModalProps) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] =
    useState<(typeof FREQUENCY_OPTIONS)[number]>(INITIAL_FREQUENCY);
  const [category, setCategory] =
    useState<(typeof CATEGORY_OPTIONS)[number]>(INITIAL_CATEGORY);
  const [errors, setErrors] = useState<FormErrors>({});

  const numericPrice = Number.parseFloat(price);
  const isFormValid = name.trim().length > 0 && Number.isFinite(numericPrice) && numericPrice > 0;

  const resetForm = () => {
    setName("");
    setPrice("");
    setFrequency(INITIAL_FREQUENCY);
    setCategory(INITIAL_CATEGORY);
    setErrors({});
  };

  useEffect(() => {
    if (!visible) {
      resetForm();
    }
  }, [visible]);

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!name.trim()) {
      nextErrors.name = "Subscription name is required.";
    }

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      nextErrors.price = "Enter a price greater than 0.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (!validate()) {
      return;
    }

    const startDate = dayjs().toISOString();
    const renewalDate =
      frequency === "Yearly"
        ? dayjs(startDate).add(1, "year").toISOString()
        : dayjs(startDate).add(1, "month").toISOString();
    const trimmedName = name.trim();

    onCreate({
      id: `${trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
      name: trimmedName,
      price: numericPrice,
      frequency,
      category,
      status: "active",
      startDate,
      renewalDate,
      icon: icons.wallet,
      billing: frequency,
      currency: "USD",
      paymentMethod: "Manual entry",
      color: CATEGORY_COLORS[category],
    });

    handleClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable className="modal-overlay" onPress={handleClose}>
          <Pressable className="modal-container" onPress={(event) => event.stopPropagation()}>
            <View className="modal-header">
              <Text className="modal-title">New Subscription</Text>
              <Pressable className="modal-close" onPress={handleClose}>
                <Text className="modal-close-text">X</Text>
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View className="modal-body">
                <View className="auth-field">
                  <Text className="auth-label">Name</Text>
                  <TextInput
                    value={name}
                    onChangeText={(value) => {
                      setName(value);
                      if (errors.name) {
                        setErrors((current) => ({ ...current, name: undefined }));
                      }
                    }}
                    placeholder="Netflix, Cursor, Figma..."
                    placeholderTextColor="rgba(8, 17, 38, 0.45)"
                    className={cn("auth-input", errors.name && "auth-input-error")}
                    returnKeyType="next"
                  />
                  {errors.name ? <Text className="auth-error">{errors.name}</Text> : null}
                </View>

                <View className="auth-field">
                  <Text className="auth-label">Price</Text>
                  <TextInput
                    value={price}
                    onChangeText={(value) => {
                      setPrice(value);
                      if (errors.price) {
                        setErrors((current) => ({ ...current, price: undefined }));
                      }
                    }}
                    placeholder="0.00"
                    placeholderTextColor="rgba(8, 17, 38, 0.45)"
                    className={cn("auth-input", errors.price && "auth-input-error")}
                    keyboardType="decimal-pad"
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                  />
                  {errors.price ? <Text className="auth-error">{errors.price}</Text> : null}
                </View>

                <View className="auth-field">
                  <Text className="auth-label">Frequency</Text>
                  <View className="picker-row">
                    {FREQUENCY_OPTIONS.map((option) => (
                      <Pressable
                        key={option}
                        className={cn(
                          "picker-option",
                          frequency === option && "picker-option-active",
                        )}
                        onPress={() => setFrequency(option)}
                      >
                        <Text
                          className={cn(
                            "picker-option-text",
                            frequency === option && "picker-option-text-active",
                          )}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View className="auth-field">
                  <Text className="auth-label">Category</Text>
                  <View className="category-scroll">
                    {CATEGORY_OPTIONS.map((option) => (
                      <Pressable
                        key={option}
                        className={cn(
                          "category-chip",
                          category === option && "category-chip-active",
                        )}
                        onPress={() => setCategory(option)}
                      >
                        <Text
                          className={cn(
                            "category-chip-text",
                            category === option && "category-chip-text-active",
                          )}
                        >
                          {option}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <Pressable
                  className={cn("auth-button", !isFormValid && "auth-button-disabled")}
                  onPress={handleSubmit}
                >
                  <Text className="auth-button-text">Create subscription</Text>
                </Pressable>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CreateSubscriptionModal;
