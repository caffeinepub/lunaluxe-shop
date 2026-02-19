export interface PhoneNumber {
  countryCode: string;
  nationalNumber: string;
}

export function formatPhoneNumber(phone: PhoneNumber): string {
  return `+${phone.countryCode}${phone.nationalNumber}`;
}

export function parsePhoneNumber(phoneString: string): PhoneNumber | null {
  const cleaned = phoneString.replace(/\s+/g, '');
  const match = cleaned.match(/^\+?(\d{1,3})(\d+)$/);
  
  if (!match) return null;
  
  return {
    countryCode: match[1],
    nationalNumber: match[2],
  };
}

export function validatePhoneNumber(phone: PhoneNumber): boolean {
  return (
    phone.countryCode.length >= 1 &&
    phone.countryCode.length <= 3 &&
    phone.nationalNumber.length >= 4 &&
    /^\d+$/.test(phone.countryCode) &&
    /^\d+$/.test(phone.nationalNumber)
  );
}
