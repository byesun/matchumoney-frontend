export function roundToTwoDecimalPlaces(value) {
  if (isNaN(value)) return value;
  let roundValue = Math.round(parseFloat(value) * 100) / 100;
  return parseFloat(roundValue).toFixed(2);
}
