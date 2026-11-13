export const arrayFromLength = (length: number) => {
  return Array.from({ length }, (_, index) => index + 1);
};
