import { format } from 'date-fns';

export const formatDateToYMDString = (date: Date | undefined | null): string => {
  if (!date) return '';
  try {
    return format(date, 'yyyy-MM-dd');
  } catch (error) {
    console.error("Error formatting date:", date, error);
    return '';
  }
};

export const parseYMDStringToDate = (dateString: string | undefined | null): Date | undefined => {
  if (!dateString) return undefined;
  try {
    const date = new Date(`${dateString}T00:00:00`);
    if (isNaN(date.getTime())) {
      return undefined;
    }
    return date;
  } catch (error) {
    console.error("Error parsing date string:", dateString, error);
    return undefined;
  }
};