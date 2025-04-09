export default function (val) {
  return val
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}
