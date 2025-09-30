import { Type } from '@sinclair/typebox';

export const StringSchema = Type.String({
  minLength: 1,
  maxLength: 255,
});

export const EmailSchema = Type.String({
  format: 'email',
  minLength: 1,
  maxLength: 255,
});

export const DateTimeSchema = Type.String({ format: 'date-time' });

export const StrongPasswordSchema = Type.String({
  minLength: 8,
  // At least one lowercase letter ((?=.*[a-z]))
  // At least one uppercase letter ((?=.*[A-Z]))
  // At least one digit ((?=.*\d))
  // At least one special character from @$!%*?& ((?=.*[@$!%*?&]))
  // Only allows lowercase, uppercase, digits, and those specific special characters ([A-Za-z\d@$!%*?&])
  // Does not validate minimum length
  pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]',
});

export const IdSchema = Type.String({
  minLength: 1,
  maxLength: 255,
});
