export const useCheckers = () => {
  const allMustChecker = (data: any, condition: any) => {
    let falseCount = 0;
    let value = false;

    data.forEach((el: any) => {
      if (condition == "notEmpty") {
        if (el != "") {
          falseCount++;
        }
        if (falseCount == data.length) {
          value = true;
        } else {
          value = false;
        }
      } else {
        if (el == condition.toString()) {
          falseCount++;
        }
        if (falseCount == data.length) {
          value = true;
        } else {
          value = false;
        }
      }
    });

    return value;
  };
  return { allMustChecker };
};
