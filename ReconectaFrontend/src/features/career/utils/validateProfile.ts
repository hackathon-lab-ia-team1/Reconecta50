import type { CareerProfile } from '../types/career';
import {
  getBirthDateError,
  getFullNameError,
  getPhoneError,
} from '../../../utils/personalDataValidation';

export type ProfileErrors = Partial<Record<keyof CareerProfile, string>>;

export function validateProfile(profile: CareerProfile): ProfileErrors {
  return {
    fullName: getFullNameError(profile.fullName),
    phone: getPhoneError(profile.phone),
    birthDate: getBirthDateError(profile.birthDate),
    address: profile.address.trim() ? undefined : 'Informe seu endereço.',
  };
}
