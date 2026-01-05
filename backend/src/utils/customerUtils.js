import Customer from "@/src/models/Customer";

export const generateCustomerId = (name) => {
  const cleanName = name.replace(/\s+/g, "").toLowerCase();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${cleanName}${randomNum}`;
};

export const generatePassword = async (name, mobileNo) => {
  // Take first 3 characters from name (remove spaces, lowercase)
  const cleanName = name.replace(/\s+/g, "").toLowerCase();
  const namePart = cleanName.substring(0, 3).split("");

  // Get full 10 digit mobile number
  const mobilePart = mobileNo.replace(/\D/g, ""); // Remove non-digits

  // Mix name characters into mobile number at positions 3, 6, 9
  let password = "";
  let mobileIndex = 0;
  let nameIndex = 0;

  for (let i = 0; i < mobilePart.length + namePart.length; i++) {
    // Insert name character at positions 3, 6, 9
    if ((i === 3 || i === 7 || i === 11) && nameIndex < namePart.length) {
      password += namePart[nameIndex];
      nameIndex++;
    } else if (mobileIndex < mobilePart.length) {
      password += mobilePart[mobileIndex];
      mobileIndex++;
    }
  }

  return password;
};
