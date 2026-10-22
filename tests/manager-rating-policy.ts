import assert from "node:assert/strict";
import { SELF_RATING_ITEMS } from "../lib/form-questions";
import { mapManagerToPrisma } from "../lib/submission-mapper";
import { restrictManagerRatings } from "../lib/manager-rating-policy";

for (const item of SELF_RATING_ITEMS) {
  for (const missing of [null, undefined]) {
    const mapped = mapManagerToPrisma({ [item.mgrKey]: 8 }, { [item.key]: missing });
    assert.equal(mapped[item.mgrKey], null, `${item.key}: unanswered must block cross-rating`);
  }
  for (const score of [0, 5, 10]) {
    const mapped = mapManagerToPrisma({ [item.mgrKey]: 0 }, { [item.key]: score });
    assert.equal(mapped[item.mgrKey], 0, `${item.key}: employee and manager zero are valid`);
  }
}
const mixed = restrictManagerRatings({ mgrRateTeamwork: 9, mgrRateEngineering: 8, mgrFeedback: "Keep feedback" }, { rateTeamwork: 0, rateEngineering: null });
assert.equal(mixed.mgrRateTeamwork, 9);
assert.equal(mixed.mgrRateEngineering, null);
assert.equal(mixed.mgrFeedback, "Keep feedback");
console.log("PASS all 20 rating pairs: blank protection, zero scores, mixed answers, and unrelated feedback");
