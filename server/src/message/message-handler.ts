import { errorMessages } from "./error-codes";
import { successMessages } from "./success-codes";

export function getSuccessMessage(successCode: string, locale: string = "ko"): string {
  if (successMessages[successCode] === undefined) {
    return "Unknown error.";
  }

  return successMessages[successCode][locale];
}

export function getErrorMessage(errorCode: string, locale: string = "ko"): string {
  if (errorMessages[errorCode] === undefined) {
    return "Unknown error.";
  }

  return errorMessages[errorCode][locale];
}
