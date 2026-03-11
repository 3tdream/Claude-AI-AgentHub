// ============================================================
// Beauty CRM — useBooking Hook
// Manages the entire 4-step booking flow state + data fetching
// ============================================================

"use client";

import { useReducer, useCallback, useEffect } from "react";
import type {
  BookingState,
  BookingAction,
  BookingStep,
  BookingFormData,
  Service,
  Master,
  TimeSlot,
  BookingConfirmation,
  LoadingKey,
} from "../../types/booking";
import {
  fetchShop,
  fetchServices,
  fetchMasters,
  fetchAvailability,
  createBooking,
  BookingApiError,
} from "../api";

// ── Initial State ────────────────────────────────────────────

const initialFormData: BookingFormData = {
  name: "",
  phone: "",
  comment: "",
};

const initialState: BookingState = {
  step: 1,
  shop: null,
  services: [],
  masters: [],
  availability: [],

  selectedService: null,
  selectedMaster: null,
  selectedDate: null,
  selectedTime: null,
  formData: initialFormData,

  isLoadingShop: false,
  isLoadingServices: false,
  isLoadingMasters: false,
  isLoadingAvailability: false,
  isSubmitting: false,

  error: null,
};

// ── Reducer ──────────────────────────────────────────────────

function bookingReducer(
  state: BookingState,
  action: BookingAction,
): BookingState {
  switch (action.type) {
    case "SET_SHOP":
      return { ...state, shop: action.payload };

    case "SET_SERVICES":
      return { ...state, services: action.payload };

    case "SET_MASTERS":
      return { ...state, masters: action.payload };

    case "SET_AVAILABILITY":
      return { ...state, availability: action.payload };

    case "SELECT_SERVICE":
      return {
        ...state,
        selectedService: action.payload,
        // Reset downstream selections when service changes
        selectedMaster: null,
        selectedDate: null,
        selectedTime: null,
        masters: [],
        availability: [],
      };

    case "SELECT_MASTER":
      return {
        ...state,
        selectedMaster: action.payload,
        // Reset time selection when master changes
        selectedDate: null,
        selectedTime: null,
        availability: [],
      };

    case "SELECT_DATE":
      return {
        ...state,
        selectedDate: action.payload,
        selectedTime: null,
      };

    case "SELECT_TIME":
      return { ...state, selectedTime: action.payload };

    case "SET_FORM_DATA":
      return {
        ...state,
        formData: { ...state.formData, ...action.payload },
      };

    case "SET_STEP":
      return { ...state, step: action.payload, error: null };

    case "NEXT_STEP":
      return {
        ...state,
        step: Math.min(state.step + 1, 4) as BookingStep,
        error: null,
      };

    case "PREV_STEP":
      return {
        ...state,
        step: Math.max(state.step - 1, 1) as BookingStep,
        error: null,
      };

    case "SET_LOADING":
      return { ...state, [action.payload.key]: action.payload.value };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

// ── Hook ─────────────────────────────────────────────────────

interface UseBookingReturn {
  state: BookingState;

  // Navigation
  goToStep: (step: BookingStep) => void;
  nextStep: () => void;
  prevStep: () => void;

  // Step 1 — Services
  loadShopAndServices: (slug: string) => Promise<void>;
  selectService: (service: Service) => void;

  // Step 2 — Masters
  loadMasters: () => Promise<void>;
  selectMaster: (master: Master) => void;

  // Step 3 — Date/Time
  loadAvailability: (date: string) => Promise<void>;
  selectDate: (date: string) => void;
  selectTime: (slot: TimeSlot) => void;

  // Step 4 — Contact + submit
  updateFormData: (data: Partial<BookingFormData>) => void;
  submitBooking: () => Promise<BookingConfirmation | null>;

  // Validation helpers
  canProceed: boolean;
}

export function useBooking(): UseBookingReturn {
  const [state, dispatch] = useReducer(bookingReducer, initialState);

  // ── Helpers ──────────────────────────────────────

  const setLoading = useCallback(
    (key: LoadingKey, value: boolean) =>
      dispatch({ type: "SET_LOADING", payload: { key, value } }),
    [],
  );

  const setError = useCallback(
    (msg: string | null) => dispatch({ type: "SET_ERROR", payload: msg }),
    [],
  );

  // ── Navigation ───────────────────────────────────

  const goToStep = useCallback(
    (step: BookingStep) => dispatch({ type: "SET_STEP", payload: step }),
    [],
  );

  const nextStep = useCallback(
    () => dispatch({ type: "NEXT_STEP" }),
    [],
  );

  const prevStep = useCallback(
    () => dispatch({ type: "PREV_STEP" }),
    [],
  );

  // ── Step 1: Load shop + services ─────────────────

  const loadShopAndServices = useCallback(async (slug: string) => {
    try {
      setLoading("isLoadingShop", true);
      setLoading("isLoadingServices", true);
      setError(null);

      const shop = await fetchShop(slug);
      dispatch({ type: "SET_SHOP", payload: shop });

      const services = await fetchServices(shop.id);
      dispatch({ type: "SET_SERVICES", payload: services });
    } catch (err) {
      const message =
        err instanceof BookingApiError
          ? err.message
          : "Failed to load salon information";
      setError(message);
    } finally {
      setLoading("isLoadingShop", false);
      setLoading("isLoadingServices", false);
    }
  }, [setLoading, setError]);

  const selectService = useCallback((service: Service) => {
    dispatch({ type: "SELECT_SERVICE", payload: service });
  }, []);

  // ── Step 2: Load masters ─────────────────────────

  const loadMasters = useCallback(async () => {
    if (!state.shop || !state.selectedService) return;

    try {
      setLoading("isLoadingMasters", true);
      setError(null);

      const masters = await fetchMasters(
        state.shop.id,
        state.selectedService.id,
      );
      dispatch({ type: "SET_MASTERS", payload: masters });
    } catch (err) {
      const message =
        err instanceof BookingApiError
          ? err.message
          : "Failed to load specialists";
      setError(message);
    } finally {
      setLoading("isLoadingMasters", false);
    }
  }, [state.shop, state.selectedService, setLoading, setError]);

  // Auto-load masters when entering step 2
  useEffect(() => {
    if (state.step === 2 && state.selectedService && state.masters.length === 0) {
      void loadMasters();
    }
  }, [state.step, state.selectedService, state.masters.length, loadMasters]);

  // ── Step 3: Load availability ────────────────────

  const loadAvailability = useCallback(
    async (date: string) => {
      if (!state.selectedMaster || !state.selectedService) return;

      try {
        setLoading("isLoadingAvailability", true);
        setError(null);

        const availability = await fetchAvailability(
          state.selectedMaster.id,
          state.selectedService.id,
          date,
        );
        dispatch({ type: "SET_AVAILABILITY", payload: availability });
      } catch (err) {
        const message =
          err instanceof BookingApiError
            ? err.message
            : "Failed to load available times";
        setError(message);
      } finally {
        setLoading("isLoadingAvailability", false);
      }
    },
    [state.selectedMaster, state.selectedService, setLoading, setError],
  );

  const selectDate = useCallback(
    (date: string) => {
      dispatch({ type: "SELECT_DATE", payload: date });
      void loadAvailability(date);
    },
    [loadAvailability],
  );

  const selectTime = useCallback((slot: TimeSlot) => {
    dispatch({ type: "SELECT_TIME", payload: slot });
  }, []);

  // ── Step 4: Contact form + submit ────────────────

  const updateFormData = useCallback(
    (data: Partial<BookingFormData>) =>
      dispatch({ type: "SET_FORM_DATA", payload: data }),
    [],
  );

  const submitBooking =
    useCallback(async (): Promise<BookingConfirmation | null> => {
      if (
        !state.shop ||
        !state.selectedService ||
        !state.selectedMaster ||
        !state.selectedTime
      ) {
        setError("Missing required booking information");
        return null;
      }

      try {
        setLoading("isSubmitting", true);
        setError(null);

        const confirmation = await createBooking({
          shopId: state.shop.id,
          serviceId: state.selectedService.id,
          masterId: state.selectedMaster.id,
          datetime: state.selectedTime.datetime,
          customerName: state.formData.name,
          customerPhone: state.formData.phone,
          comment: state.formData.comment || undefined,
        });

        return confirmation;
      } catch (err) {
        if (err instanceof BookingApiError && err.statusCode === 409) {
          setError(
            "This time slot is no longer available. Please select another time.",
          );
        } else {
          const message =
            err instanceof BookingApiError
              ? err.message
              : "Failed to create booking. Please try again.";
          setError(message);
        }
        return null;
      } finally {
        setLoading("isSubmitting", false);
      }
    }, [
      state.shop,
      state.selectedService,
      state.selectedMaster,
      state.selectedTime,
      state.formData,
      setLoading,
      setError,
    ]);

  // ── Validation ───────────────────────────────────

  const canProceed = (() => {
    switch (state.step) {
      case 1:
        return state.selectedService !== null;
      case 2:
        return state.selectedMaster !== null;
      case 3:
        return state.selectedDate !== null && state.selectedTime !== null;
      case 4:
        return (
          state.formData.name.trim().length >= 2 &&
          state.formData.phone.trim().length >= 7
        );
      default:
        return false;
    }
  })();

  return {
    state,
    goToStep,
    nextStep,
    prevStep,
    loadShopAndServices,
    selectService,
    loadMasters,
    selectMaster,
    loadAvailability,
    selectDate,
    selectTime,
    updateFormData,
    submitBooking,
    canProceed,
  };
}
